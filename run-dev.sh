#!/bin/bash

# Kill any process using port 3333
PORT=3333
PID=$(lsof -ti:$PORT)

if [ -n "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)"
    kill -9 $PID
    sleep 1
fi

# Run dev server
npm run dev
