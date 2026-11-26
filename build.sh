#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo " Building FRESH AI Full-Stack Application "
echo "=========================================="

# 1. Install and build React Frontend
echo "[1/3] Installing Node dependencies and building React frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Upgrade pip and install Python backend dependencies
echo "[2/3] Installing Python backend dependencies..."
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt

# 3. Verify frontend build
echo "[3/3] Verifying build outputs..."
if [ -f "frontend/dist/index.html" ]; then
    echo "Frontend dist bundle verified successfully."
else
    echo "WARNING: frontend/dist/index.html missing."
fi

echo "=========================================="
echo " Build finished successfully! Ready to run."
echo "=========================================="
