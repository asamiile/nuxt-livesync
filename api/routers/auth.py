import os
import json
import secrets
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, Header
from redis import Redis
from redis.exceptions import RedisError

from models.auth_models import LoginPayload
from dependencies.database import get_kv

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

@router.post("/login")
def login(
    payload: LoginPayload,
    response: Response,
    kv: Redis = Depends(get_kv)
):
    """
    Log in as an administrator and issue a session token.
    """
    master_password = os.getenv("ADMIN_PASSWORD")
    if master_password is None:
        raise HTTPException(
            status_code=500,
            detail="ADMIN_PASSWORD is not set on the server"
        )

    if payload.password != master_password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    session_token = secrets.token_hex(32)

    try:
        # Store session information in Vercel KV (expires in 8 hours)
        kv.set(
            f"session:{session_token}",
            json.dumps({"session": "active"}),
            ex=timedelta(hours=8)
        )
    except RedisError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Vercel KV is unavailable: {e}"
        )

    return {"token": session_token}

@router.get("/verify")
def verify(
    authorization: Annotated[str | None, Header()] = None,
    kv: Redis = Depends(get_kv)
):
    """
    Verify if the provided token is valid.
    """
    if authorization is None:
        return {"authenticated": False}

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer" or not token:
            return {"authenticated": False}
    except ValueError:
        return {"authenticated": False}

    try:
        session_data = kv.get(f"session:{token}")
        return {"authenticated": bool(session_data)}
    except RedisError:
        # Treat KV unavailability as not authenticated
        return {"authenticated": False}

@router.post("/logout", status_code=204)
def logout(
    authorization: Annotated[str | None, Header()] = None,
    kv: Redis = Depends(get_kv)
):
    """
    End the session (invalidate the token).
    """
    if authorization is None:
        return

    try:
        scheme, token = authorization.split()
        if scheme.lower() == "bearer" and token:
            kv.delete(f"session:{token}")
    except ValueError:
        # Ignore malformed headers
        pass
    except RedisError as e:
        # If a KV error occurs, we should still let the client proceed
        # as if logout was successful.
        print(f"Could not delete session from Vercel KV: {e}")
        pass

    # Always return 204 No Content
    return