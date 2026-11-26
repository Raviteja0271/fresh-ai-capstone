# ==========================================
# STAGE 1: Build React Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Backend & Gunicorn Server
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (including gnupg for OpenPGP module)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gnupg \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir -r backend/requirements.txt

# Copy application backend and sample data
COPY backend/ ./backend/
COPY sample_data/ ./sample_data/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render default port
ENV PORT=10000
ENV FLASK_ENV=production
EXPOSE 10000

# Start server using Gunicorn
CMD ["gunicorn", "--chdir", "backend", "run:app", "--bind", "0.0.0.0:10000", "--workers", "2", "--timeout", "120"]
