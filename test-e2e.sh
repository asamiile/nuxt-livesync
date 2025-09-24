#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Start Redis server in the background
echo "Starting Redis server..."
redis-server > redis.log 2>&1 &
REDIS_PID=$!

# Start the API server in the background
echo "Starting API server..."
uvicorn api.main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &
API_PID=$!

# Function to kill the servers
cleanup() {
    echo "Stopping API server..."
    kill $API_PID
    echo "Stopping Redis server..."
    kill $REDIS_PID
}

# Ensure cleanup is called on script exit
trap cleanup EXIT

# Wait for the API server to be ready
echo "Waiting for API server..."
# Use the installed wait-on from node_modules, and specify GET method
./node_modules/.bin/wait-on http://localhost:8000/api/health -t 30000 --method GET

# Run the Playwright tests
echo "Running Playwright tests..."
pnpm exec nuxt prepare && playwright test

echo "Tests finished."
