from typing import List
from fastapi import APIRouter, Depends, status
from redis import Redis

from services import cue_service
from models.cue_models import Cue, CreateCuePayload, UpdateCuePayload
from dependencies.database import get_kv
from dependencies.auth import get_current_session
from websocket.manager import manager

router = APIRouter(
    prefix="/api/cues",
    tags=["Cues"]
)

# This dependency will be applied to all write/trigger operations
ProtectedEndpoint = Depends(get_current_session)

@router.get("/", response_model=List[Cue])
def get_cues_endpoint(kv: Redis = Depends(get_kv)):
    """
    Get all production cues from Vercel KV.
    """
    return cue_service.get_all_cues(kv)

@router.post(
    "/",
    response_model=Cue,
    status_code=status.HTTP_201_CREATED,
    dependencies=[ProtectedEndpoint]
)
def create_cue_endpoint(
    payload: CreateCuePayload,
    kv: Redis = Depends(get_kv)
):
    """
    Create a new production cue and save it to Vercel KV.
    (Requires authentication)
    """
    return cue_service.create_new_cue(kv, payload)

@router.put(
    "/{cue_id}",
    response_model=Cue,
    dependencies=[ProtectedEndpoint]
)
def update_cue_endpoint(
    cue_id: str,
    payload: UpdateCuePayload,
    kv: Redis = Depends(get_kv)
):
    """
    Update the production cue with the specified ID.
    (Requires authentication)
    """
    return cue_service.update_cue_by_id(kv, cue_id, payload)

@router.delete(
    "/{cue_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[ProtectedEndpoint]
)
def delete_cue_endpoint(
    cue_id: str,
    kv: Redis = Depends(get_kv)
):
    """
    Delete the production cue with the specified ID.
    (Requires authentication)
    """
    cue_service.delete_cue_by_id(kv, cue_id)
    return

@router.post("/trigger/{cue_id}", dependencies=[ProtectedEndpoint])
async def trigger_cue_endpoint(cue_id: str):
    """
    Trigger the production cue with the specified ID and notify all clients.
    (Requires authentication)
    """
    # Note: We could add a check here to ensure the cue_id exists before broadcasting.
    # For now, we keep the original behavior.
    await manager.broadcast(cue_id)
    return {"message": f"Cue {cue_id} triggered"}