import os
import uuid
import json 
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from redis import Redis

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


# --- APIエンドポイントの定義 ---
@app.get("/api")
def read_root():
    return {"Hello": "World"}

@app.get("/api/cues", response_model=list[Cue])
def get_cues():
    """全ての演出キューをVercel KVから取得する"""
    cues_json = kv.get(CUES_KEY)
    if cues_json is None:
        return [] # データがなければ空のリストを返す
    # JSON文字列をPythonのリストに変換して返す
    return json.loads(cues_json)    

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
    # KVに保存
    kv.set(CUES_KEY, json.dumps(cues_to_save))
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
    # KVに保存
    kv.set(CUES_KEY, json.dumps(cues_to_save))

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
    # KVに保存
    kv.set(CUES_KEY, json.dumps(cues_to_save))

    # ステータスコード204が返されるので、リターンボディは不要
    return


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