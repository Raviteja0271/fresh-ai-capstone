# FRESH AI: Deployment Guide for Render.com

This document provides the complete, step-by-step instructions to deploy **FRESH AI** as a live cloud application on **Render** (https://render.com) using Render's 100% free tier.

---

## 1. What Has Been Prepared

The project has been configured for **Unified Full-Stack Deployment**:
1. **Single Web Service**: The Flask backend now serves both the compiled React frontend (`frontend/dist`) and all REST API routes (`/api/*`) on the same domain and port.
   - Eliminates all CORS issues.
   - Fits entirely into Render's 750 free hours/month tier (no credit card needed).
2. **`render.yaml`**: Render Blueprint file that pre-configures build commands, start commands, and environment variables automatically.
3. **`Dockerfile`**: Production multi-stage Docker build with Node 20, Python 3.11, and Linux GnuPG pre-installed.
4. **`build.sh`**: Build script for native Python runtime.
5. **Gunicorn WSGI**: Added `gunicorn` to `backend/requirements.txt` for production stability.
6. **Automatic Seeding**: The app automatically seeds the SQLite database, default admin user (`admin` / `Admin@FreshAI2026`), synthetic dataset, and trains the initial baseline model upon its first cloud launch.

---

## 2. Step 1: Upload Your Code to GitHub (2 Minutes)

Render connects directly to your GitHub repository to pull and build your code.

### Option A: Using Git Command Line (Recommended)
If you have Git installed:
```bash
# 1. Initialize git in the project root
git init

# 2. Add all project files
git add .

# 3. Commit the code
git commit -m "Fresh AI complete capstone project ready for Render deployment"

# 4. Link to your GitHub repository (replace with your repo URL from github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/fresh-ai-capstone.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop
1. Download & open [GitHub Desktop](https://desktop.github.com/).
2. Click **File** > **Add Local Repository** and select:
   `D:\College\SLOT C - 5111\Capstone\Project`
3. Click **Publish repository** to push it to your GitHub account.

### Option C: Using GitHub Web Interface
1. Go to [github.com/new](https://github.com/new) and create a repository named `fresh-ai-capstone`.
2. Click **uploading an existing file** and drag the project files into the browser.

---

## 3. Step 2: Deploy on Render (1 Minute)

1. Open [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub (free).
2. Click the blue **New +** button in the top right corner and choose **Web Service**.
3. Under **Connect a repository**, select your `fresh-ai-capstone` repo and click **Connect**.
4. Configure the settings:
   - **Name**: `fresh-ai-email-security` (or any custom name)
   - **Region**: Choose the closest region (e.g. `Singapore` or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repository)
   - **Runtime**: Select **Docker** (Recommended) or **Python**
     - *If Docker*: Render will automatically use the included `Dockerfile`. No build or start commands needed!
     - *If Python*:
       - **Build Command**: `./build.sh`
       - **Start Command**: `gunicorn --chdir backend run:app`
   - **Instance Type**: **Free** ($0/month)
5. Under **Environment Variables**, add:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = (click generate or type any secret key)
6. Click **Deploy Web Service**!

---

## 4. Step 3: Access Your Live Application

Render will display a live deployment log:
1. It builds the React frontend.
2. It installs the Python backend packages.
3. It launches Gunicorn.

Once complete, your live web link will appear at the top:
👉 **`https://fresh-ai-email-security.onrender.com`** *(or your chosen name)*

### Default Demonstration Login on Cloud:
- **Username**: `admin`
- **Password**: `Admin@FreshAI2026`
