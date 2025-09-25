import os
from redis import Redis
from redis.exceptions import RedisError

# --- Vercel KVへの接続 ---
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    # ローカル開発などで.envがない場合に備え、エラーを発生させる
    raise ValueError("REDIS_URL environment variable not set. Please create .env file.")
kv = Redis.from_url(REDIS_URL)

# データを保存・取得するためのキー
CUES_KEY = "cues_list"