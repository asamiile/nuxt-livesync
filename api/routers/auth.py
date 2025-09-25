import os
import json
import secrets
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException, Response, Header
from redis import Redis
from redis.exceptions import RedisError

from dependencies.database import kv
from models.auth_models import LoginPayload

router = APIRouter()

@router.post("/api/login")
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

@router.get("/api/verify")
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

@router.post("/api/logout", status_code=204)
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