from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.manager import manager

router = APIRouter()

@router.get("/api/connections")
def get_connections():
    """現在のWebSocket接続数を取得する"""
    return {"connections": len(manager.active_connections)}


# --- WebSocketエンドポイント ---
@router.websocket("/ws/live")
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

@router.post("/api/cues/trigger/{cue_id}")
async def trigger_cue(cue_id: str):
    """指定されたIDの演出をトリガーし、全クライアントに通知する"""
    # 本来はここでcue_idの存在チェックなどを行う
    await manager.broadcast(cue_id)
    return {"message": f"Cue {cue_id} triggered"}