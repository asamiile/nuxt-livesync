import os
from dotenv import load_dotenv

# Load .env file before any other application imports
# This is crucial to ensure environment variables are available when other modules are imported.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Routers
from routers import auth, cues, websocket

app = FastAPI(
    title="Nuxt LiveSync API",
    description="API for real-time synchronization of stage effects.",
    version="1.0.0"
)

# --- CORS Configuration ---
VERCEL_URL = os.getenv("VERCEL_URL")
allowed_origins = [
    "http://localhost:3000",
]

if VERCEL_URL:
    # Vercel preview deployment URL
    # e.g., "nuxt-livesync-abc-123.vercel.app"
    allowed_origins.append(f"https://{VERCEL_URL}")
    # Also add the potential production URL
    # e.g., "nuxt-livesync.vercel.app"
    try:
        # Assumes format like "project-name-random-hash-scope.vercel.app"
        # or "project-name-git-branch-scope.vercel.app"
        parts = VERCEL_URL.split('-')
        if len(parts) > 1:
            project_name = parts[0]
            prod_domain = f"https://{project_name}.vercel.app"
            if prod_domain not in allowed_origins:
                allowed_origins.append(prod_domain)
    except Exception as e:
        print(f"Could not parse VERCEL_URL to determine production domain: {e}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth.router)
app.include_router(cues.router)
app.include_router(websocket.router)

# --- Root Endpoint ---
@app.get("/api")
def read_root():
    """A simple endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Nuxt LiveSync API"}