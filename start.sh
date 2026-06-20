#!/bin/bash
# AI Financial Statement Analyzer - Startup Script

echo "=================================================="
echo "   AI Financial Statement Analyzer"
echo "   Starting all services..."
echo "=================================================="

# Check for Python
if ! command -v python3 &>/dev/null; then
    echo "ERROR: Python 3 is required."
    exit 1
fi

# Check for Node/npm
if ! command -v npm &>/dev/null; then
    echo "ERROR: Node.js and npm are required."
    exit 1
fi

# Install backend dependencies
echo ""
echo "[1/4] Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
cd ..

# Install frontend dependencies (if node_modules missing)
echo "[2/4] Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps --silent
fi

# Build frontend if no build directory
if [ ! -d "build" ]; then
    echo "[3/4] Building React frontend..."
    REACT_APP_API_URL=http://localhost:8000 npm run build --silent
else
    echo "[3/4] Frontend build found, skipping build..."
fi
cd ..

# Start backend
echo "[4/4] Starting FastAPI backend on port 8000..."
GROQ_API_KEY="${GROQ_API_KEY:-}" cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend
sleep 2

# Start frontend (serve build)
echo ""
echo "[DONE] Services started:"
echo "  Backend API:  http://localhost:8000"
echo "  Frontend:     Open frontend/build/index.html in browser"
echo "                OR serve with: cd frontend && npx serve -s build -p 3000"
echo ""
echo "  Set GROQ_API_KEY env var for AI analysis:"
echo "  export GROQ_API_KEY=gsk_your_key_here"
echo ""
echo "Press Ctrl+C to stop."
wait $BACKEND_PID















