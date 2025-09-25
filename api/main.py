import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

# .envファイルを読み込む
load_dotenv()

# Supabaseクライアントを初期化
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise ValueError("Supabase URL and Key must be set in environment variables.")
supabase: Client = create_client(url, key)

app = FastAPI()

# --- Pydanticモデル (リクエストボディの検証用) ---
class CreateCuePayload(BaseModel):
    name: str
    type: str
    value: str

class UpdateCuePayload(BaseModel):
    name: str
    type: str
    value: str

# --- APIエンドポイント ---
@app.get("/api")
def read_root():
    return {"status": "ok", "message": "Welcome to the Nuxt LiveSync API"}

@app.get("/api/cues")
def get_cues():
    try:
        response = supabase.table('cues').select("*").order('created_at').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cues", status_code=201)
def create_cue(payload: CreateCuePayload):
    try:
        response = supabase.table('cues').insert(payload.dict()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/cues/{cue_id}")
def update_cue(cue_id: str, payload: UpdateCuePayload):
    try:
        response = supabase.table('cues').update(payload.dict()).eq('id', cue_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Cue not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/cues/{cue_id}", status_code=204)
def delete_cue(cue_id: str):
    try:
        response = supabase.table('cues').delete().eq('id', cue_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Cue not found")
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cues/trigger/{cue_id}")
def trigger_cue(cue_id: str):
    """Supabaseのlive_stateテーブルを更新してリアルタイム通知を発火させる"""
    try:
        # 常にid=1の行を更新する
        response = supabase.table('live_state').update({
            'active_cue_id': cue_id,
            'updated_at': 'now()'
        }).eq('id', 1).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Live state row not found")
        return {"message": f"Cue {cue_id} triggered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))