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

# .envファイルを読み込む (ローカル開発用)
load_dotenv()

# FastAPIインスタンスの作成
app = FastAPI()

# --- CORS設定 ---
# 環境変数からVercelのURLを取得
VERCEL_URL = os.getenv("VERCEL_URL")
# VercelのプレビューURLと本番URL（想定）を許可リストに追加
# 例: nuxt-livesync-lx3kfcfmg-asamiiles-projects.vercel.app
# 例: nuxt-livesync.vercel.app
allowed_origins = [
    "http://localhost:3000",
]

if VERCEL_URL:
    # VercelのプレビューデプロイメントURL
    allowed_origins.append(f"https://{VERCEL_URL}")
    # 本番環境のURL (プロジェクト名から生成)
    project_name = VERCEL_URL.split('-')[0]
    if project_name:
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
# --- DEBUG ---
# Let's check if the environment variable is being loaded correctly.
# This line will be removed after debugging.
print(f"DEBUG: REDIS_URL loaded as: '{os.getenv('REDIS_URL')}'")
# --- END DEBUG ---
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    # ローカル開発などで.envがない場合に備え、エラーを発生させる
    raise ValueError("REDIS_URL environment variable not set. Please create .env file.")
kv = Redis.from_url(REDIS_URL)

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
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


# --- データモデルの定義 (Pydantic) ---
# Nuxtの types/cue.ts と対応させます
class Cue(BaseModel):
    id: str
    name: str
    type: str  # 'color' or 'animation'
    value: str

class CreateCuePayload(BaseModel):
    name: str
    type: str
    value: str

class UpdateCuePayload(BaseModel):
    name: str
    type: str
    value: str

class LoginPayload(BaseModel):
    password: str


# --- APIエンドポイントの定義 ---

# --- Auth ---
@app.post("/api/login")
def login(payload: LoginPayload, response: Response):
    """管理者としてログインし、セッショントークンを発行する"""
    master_password = os.getenv("ADMIN_PASSWORD")
    if master_password is None:
        raise HTTPException(status_code=500, detail="ADMIN_PASSWORD is not set on the server")

    if payload.password != master_password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    # 安全なセッショントークンを生成
    session_token = secrets.token_hex(32)

    try:
        # Vercel KVにセッション情報を保存（有効期限8時間）
        kv.set(f"session:{session_token}", json.dumps({ "session": "active" }), ex=timedelta(hours=8))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    # トークンをJSONで返す
    return {"token": session_token}

@app.get("/api/verify")
def verify(authorization: Annotated[str | None, Header()] = None):
    """提供されたトークンが有効か検証する"""
    if authorization is None:
        return {"authenticated": False}

    # "Bearer "プレフィックスを削除
    token = authorization.split(" ")[-1]

    try:
        # Vercel KVにトークンが存在するか確認
        session_data = kv.get(f"session:{token}")
        if session_data:
            return {"authenticated": True}
        else:
            return {"authenticated": False}
    except RedisError:
        # KVが利用できない場合も非認証として扱う
        return {"authenticated": False}

@app.post("/api/logout", status_code=204)
def logout(authorization: Annotated[str | None, Header()] = None):
    """セッションを終了（トークンを無効化）する"""
    if authorization is None:
        # トークンがなくてもエラーにはせず、正常終了とする
        return

    token = authorization.split(" ")[-1]
    try:
        # Vercel KVからセッショントークンを削除
        kv.delete(f"session:{token}")
    except RedisError as e:
        # KVエラーが発生しても、クライアント側はログアウト成功とみなせるようにする
        # ここでエラーを投げると、クライアントがCookieを削除できなくなる可能性がある
        print(f"Could not delete session from Vercel KV: {e}")
        pass # エラーを無視

    # 成功時は 204 No Content を返す
    return


# --- Cues ---
@app.get("/api")
def read_root():
    return {"Hello": "World"}

@app.get("/api/cues", response_model=list[Cue])
def get_cues():
    """全ての演出キューをVercel KVから取得する"""
    try:
        cues_json = kv.get(CUES_KEY)
        if cues_json is None:
            return [] # データがなければ空のリストを返す
        # JSON文字列をPythonのリストに変換して返す
        return json.loads(cues_json)
    except RedisError as e:
        # Redis (KV) への接続エラーなどをキャッチ
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

@app.post("/api/cues", response_model=Cue, status_code=201)
def create_cue(payload: CreateCuePayload):
    """新しい演出キューを作成し、Vercel KVに保存する"""
    new_cue = Cue(
        id=str(uuid.uuid4()), # ランダムなIDを生成
        name=payload.name,
        type=payload.type,
        value=payload.value
    )
    # 現在のリストをKVから取得し、Pydanticモデルのリストに変換
    current_cues_dicts = get_cues()
    current_cues = [Cue(**c) for c in current_cues_dicts]

    # 新しいキューを追加
    current_cues.append(new_cue)

    # Pydanticモデルのリストを辞書のリストに変換してからJSON文字列にする
    cues_to_save = [cue.model_dump() for cue in current_cues]
    try:
        # KVに保存
        kv.set(CUES_KEY, json.dumps(cues_to_save))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")
    return new_cue

@app.put("/api/cues/{cue_id}", response_model=Cue)
def update_cue(cue_id: str, payload: UpdateCuePayload):
    """指定されたIDの演出を更新する"""
    cues_dicts = get_cues()
    cues = [Cue(**c) for c in cues_dicts]

    target_cue = None
    for cue in cues:
        if cue.id == cue_id:
            target_cue = cue
            break

    if not target_cue:
        raise HTTPException(status_code=404, detail="Cue not found")

    # データを更新
    target_cue.name = payload.name
    target_cue.type = payload.type
    target_cue.value = payload.value

    # Pydanticモデルのリストを辞書のリストに変換してからJSON文字列にする
    cues_to_save = [cue.model_dump() for cue in cues]
    try:
        # KVに保存
        kv.set(CUES_KEY, json.dumps(cues_to_save))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    return target_cue

@app.delete("/api/cues/{cue_id}", status_code=204)
def delete_cue(cue_id: str):
    """指定されたIDの演出を削除する"""
    cues_dicts = get_cues()
    cues = [Cue(**c) for c in cues_dicts]

    # 指定されたID以外のキューで新しいリストを作成
    cues_after_delete = [cue for cue in cues if cue.id != cue_id]

    # 削除対象が見つからなかった場合（リストの長さが変わらない）
    if len(cues) == len(cues_after_delete):
        raise HTTPException(status_code=404, detail="Cue not found")

    # Pydanticモデルのリストを辞書のリストに変換してからJSON文字列にする
    cues_to_save = [cue.model_dump() for cue in cues_after_delete]
    try:
        # KVに保存
        kv.set(CUES_KEY, json.dumps(cues_to_save))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    # ステータスコード204が返されるので、リターンボディは不要
    return


@app.get("/api/connections")
def get_connections():
    """現在のWebSocket接続数を取得する"""
    return {"connections": len(manager.active_connections)}


# --- WebSocketエンドポイント ---
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # クライアントからのメッセージを待つ場合はここで受信処理
            # data = await websocket.receive_text()
            # このアプリケーションではサーバーからの送信がメインなので、受信ループはシンプルに
            await websocket.receive_text() # keep connection open
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/cues/trigger/{cue_id}")
async def trigger_cue(cue_id: str):
    """指定されたIDの演出をトリガーし、全クライアントに通知する"""
    # 本来はここでcue_idの存在チェックなどを行う
    await manager.broadcast(cue_id)
    return {"message": f"Cue {cue_id} triggered"}