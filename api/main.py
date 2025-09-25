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

# .envファイルを確実に見つけるために、このファイルの場所を基準にパスを構築
dotenv_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

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
from dependencies.database import kv, CUES_KEY


# --- WebSocket接続管理 ---
from websocket.manager import manager


# --- データモデルの定義 (Pydantic) ---
from models.cue_models import Cue, CreateCuePayload, UpdateCuePayload
from models.auth_models import LoginPayload


# --- APIエンドポイントの定義 ---
from routers import auth, cues, websocket

app.include_router(auth.router)
app.include_router(cues.router)
app.include_router(websocket.router)

# Add a root endpoint for health checks
@app.get("/api")
def read_root():
    return {"status": "ok", "message": "Welcome to the Nuxt LiveSync API"}