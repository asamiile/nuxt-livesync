import os
import uuid
import json
import secrets
from datetime import timedelta
from typing import List, Annotated
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from redis import Redis
from redis.exceptions import RedisError
from pathlib import Path

# --- .envファイルの読み込み ---
# .envファイルを確実に見つけるために、このファイルの場所を基準にパスを構築
dotenv_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

# --- FastAPIインスタンスの作成 ---
app = FastAPI()

# --- CORS設定 ---
# 環境変数からVercelのURLを取得
VERCEL_URL = os.getenv("VERCEL_URL")
# VercelのプレビューURLと本番URL（想定）を許可リストに追加
allowed_origins = [
    "http://localhost:3000",
]

if VERCEL_URL:
    # VercelのプレビューデプロイメントURL
    allowed_origins.append(f"https://{VERCEL_URL}")
    # 本番環境のURL (プロジェクト名から生成)
    project_name_parts = VERCEL_URL.split('.')
    if len(project_name_parts) > 2:
        # 通常のプレビューURL (e.g., 'project-git-branch-org.vercel.app') から 'project' を抽出
        project_name = project_name_parts[0].split('-')[0]
        allowed_origins.append(f"https://{project_name}.vercel.app")


# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Vercel KVへの接続 ---
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    raise ValueError("REDIS_URL environment variable not set. Please create .env file or set it in Vercel.")
kv = Redis.from_url(REDIS_URL, decode_responses=True)

# データを保存・取得するためのキー
CUES_KEY = "cues_list"


# --- WebSocket接続管理 ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


# --- データモデルの定義 (Pydantic) ---
class LoginPayload(BaseModel):
    password: str

class Cue(BaseModel):
    id: str
    name: str
    type: str
    value: str

class CreateCuePayload(BaseModel):
    name: str
    type: str
    value: str

class UpdateCuePayload(BaseModel):
    name: str
    type: str
    value: str


# --- APIエンドポイントの定義 ---

# === Auth Endpoints ===

@app.post("/api/login")
def login(payload: LoginPayload, response: Response):
    master_password = os.getenv("ADMIN_PASSWORD")
    if not master_password:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD is not set on the server")

    if payload.password != master_password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    session_token = secrets.token_hex(32)
    try:
        kv.set(f"session:{session_token}", "active", ex=timedelta(hours=8))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    return {"token": session_token}

@app.get("/api/verify")
def verify(authorization: Annotated[str | None, Header()] = None):
    if authorization is None:
        return {"authenticated": False}

    token = authorization.split(" ")[-1] if " " in authorization else authorization
    try:
        session_data = kv.get(f"session:{token}")
        return {"authenticated": bool(session_data)}
    except RedisError:
        return {"authenticated": False}

@app.post("/api/logout", status_code=204)
def logout(authorization: Annotated[str | None, Header()] = None):
    if authorization is None:
        return

    token = authorization.split(" ")[-1] if " " in authorization else authorization
    try:
        kv.delete(f"session:{token}")
    except RedisError as e:
        print(f"Could not delete session from Vercel KV: {e}")
        pass
    return

# === Cues Endpoints ===

@app.get("/api/cues", response_model=List[Cue])
def get_cues():
    try:
        cues_json = kv.get(CUES_KEY)
        return json.loads(cues_json) if cues_json else []
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

@app.post("/api/cues", response_model=Cue, status_code=201)
def create_cue(payload: CreateCuePayload):
    try:
        cues_list = get_cues()
        new_cue = Cue(id=str(uuid.uuid4()), **payload.model_dump())
        cues_list.append(new_cue)
        cues_to_save = [cue.model_dump() for cue in cues_list]
        kv.set(CUES_KEY, json.dumps(cues_to_save))
        return new_cue
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

@app.put("/api/cues/{cue_id}", response_model=Cue)
def update_cue(cue_id: str, payload: UpdateCuePayload):
    try:
        cues_list = get_cues()
        target_cue = next((cue for cue in cues_list if cue.id == cue_id), None)

        if not target_cue:
            raise HTTPException(status_code=404, detail="Cue not found")

        target_cue.name = payload.name
        target_cue.type = payload.type
        target_cue.value = payload.value

        cues_to_save = [cue.model_dump() for cue in cues_list]
        kv.set(CUES_KEY, json.dumps(cues_to_save))
        return target_cue
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

@app.delete("/api/cues/{cue_id}", status_code=204)
def delete_cue(cue_id: str):
    try:
        cues_list = get_cues()
        cues_after_delete = [cue for cue in cues_list if cue.id != cue_id]

        if len(cues_list) == len(cues_after_delete):
            raise HTTPException(status_code=404, detail="Cue not found")

        cues_to_save = [cue.model_dump() for cue in cues_after_delete]
        kv.set(CUES_KEY, json.dumps(cues_to_save))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")
    return

# === WebSocket and Connection Endpoints ===

@app.get("/api/connections")
def get_connections():
    return {"connections": len(manager.active_connections)}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/cues/trigger/{cue_id}")
async def trigger_cue(cue_id: str):
    await manager.broadcast(cue_id)
    return {"message": f"Cue {cue_id} triggered"}

# === Root Endpoint for Health Check ===

@app.get("/api")
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Nuxt LiveSync API"}