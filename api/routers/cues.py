import uuid
import json
from fastapi import APIRouter, HTTPException

from dependencies.database import kv, CUES_KEY
from models.cue_models import Cue, CreateCuePayload, UpdateCuePayload

router = APIRouter()

@router.get("/api/cues", response_model=list[Cue])
def get_cues():
    """全ての演出キューをVercel KVから取得する"""
    try:
        cues_json = kv.get(CUES_KEY)
        if cues_json is None:
            return [] # データがなければ空のリストを返す
        # JSON文字列をPythonのリストに変換して返す
        return json.loads(cues_json)
    except Exception as e:
        # Redis (KV) への接続エラーなどをキャッチ
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

@router.post("/api/cues", response_model=Cue, status_code=201)
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
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")
    return new_cue

@router.put("/api/cues/{cue_id}", response_model=Cue)
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
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    return target_cue

@router.delete("/api/cues/{cue_id}", status_code=204)
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
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Vercel KV is unavailable: {e}")

    # ステータスコード204が返されるので、リターンボディは不要
    return