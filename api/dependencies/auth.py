from typing import Annotated
from fastapi import Header, HTTPException, Depends
from redis import Redis
from redis.exceptions import RedisError

from .database import get_kv


def get_current_session(
    authorization: Annotated[str | None, Header()] = None,
    kv: Redis = Depends(get_kv)
):
    """
    Dependency to verify the session token from the Authorization header.
    Raises HTTPException(status_code=401) if the token is invalid, expired, or missing.
    """
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated: Authorization header is missing."
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication scheme. Must be 'Bearer'."
            )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token format. Must be 'Bearer <token>'."
        )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated: Token is empty."
        )

    try:
        session_data = kv.get(f"session:{token}")
        if not session_data:
            raise HTTPException(
                status_code=401,
                detail="Invalid token or session expired."
            )
    except RedisError:
        raise HTTPException(
            status_code=503,
            detail="A server error occurred with Vercel KV."
        )

    # トークンが有効な場合はトークンを返す
    return {"token": token}
