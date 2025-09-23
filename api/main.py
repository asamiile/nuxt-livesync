import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid # ユニークなIDを生成するためにインポート
from typing import List

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


# --- データベースの代わり (メモリ上の変数) ---
cues_db = []

# --- APIエンドポイントの定義 ---
@app.get("/api")
def read_root():
    return {"Hello": "World"}

@app.get("/api/cues", response_model=list[Cue])
def get_cues():
    """全ての演出キューを取得する"""
    return cues_db

@app.post("/api/cues", response_model=Cue, status_code=201)
def create_cue(payload: CreateCuePayload):
    """新しい演出キューを作成する"""
    new_cue = Cue(
        id=str(uuid.uuid4()), # ランダムなIDを生成
        name=payload.name,
        type=payload.type,
        value=payload.value
    )
    cues_db.append(new_cue)
    return new_cue

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