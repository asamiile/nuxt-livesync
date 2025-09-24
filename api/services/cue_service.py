import json
import uuid
from typing import List
from redis import Redis
from redis.exceptions import RedisError
from fastapi import HTTPException

from ..models.cue_models import Cue, CreateCuePayload, UpdateCuePayload

CUES_KEY = "cues_list"

def get_all_cues(kv: Redis) -> List[Cue]:
    """
    Retrieves all cues from Redis and returns them as a list of Cue models.
    """
    try:
        cues_json = kv.get(CUES_KEY)
        if cues_json is None:
            return []
        cues_data = json.loads(cues_json)
        return [Cue(**c) for c in cues_data]
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

def _save_all_cues(kv: Redis, cues: List[Cue]):
    """
    (Internal) Saves a list of Cue models to Redis.
    """
    try:
        cues_to_save = [cue.model_dump() for cue in cues]
        kv.set(CUES_KEY, json.dumps(cues_to_save))
    except RedisError as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

def create_new_cue(kv: Redis, payload: CreateCuePayload) -> Cue:
    """
    Creates a new cue, adds it to the list in Redis, and returns the new cue.
    """
    cues = get_all_cues(kv)
    new_cue = Cue(
        id=str(uuid.uuid4()),
        name=payload.name,
        type=payload.type,
        value=payload.value
    )
    cues.append(new_cue)
    _save_all_cues(kv, cues)
    return new_cue

def update_cue_by_id(kv: Redis, cue_id: str, payload: UpdateCuePayload) -> Cue:
    """
    Updates an existing cue in Redis by its ID.
    """
    cues = get_all_cues(kv)
    target_cue = None
    for i, cue in enumerate(cues):
        if cue.id == cue_id:
            # Update the cue data in the list
            cue.name = payload.name
            cue.type = payload.type
            cue.value = payload.value
            target_cue = cue
            break

    if not target_cue:
        raise HTTPException(status_code=404, detail="Cue not found")

    _save_all_cues(kv, cues)
    return target_cue

def delete_cue_by_id(kv: Redis, cue_id: str):
    """
    Deletes a cue from Redis by its ID.
    """
    cues = get_all_cues(kv)
    original_length = len(cues)
    cues_after_delete = [cue for cue in cues if cue.id != cue_id]

    if len(cues_after_delete) == original_length:
        raise HTTPException(status_code=404, detail="Cue not found")

    _save_all_cues(kv, cues_after_delete)
    return
