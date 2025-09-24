from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.manager import manager

router = APIRouter()

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """
    The main WebSocket endpoint for live connections.
    """
    await manager.connect(websocket)
    try:
        while True:
            # This app primarily sends data to the client,
            # so we just wait for a message to keep the connection open.
            # A more robust implementation might handle heartbeats.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/api/connections", tags=["WebSocket"])
def get_connections():
    """
    Get the current number of active WebSocket connections.
    """
    return {"connections": len(manager.active_connections)}
