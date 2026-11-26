# FRESH AI: Intelligent Phishing Email Detection and Secure Communication Framework

> **Final-Year B.Tech Computer Science and Engineering Capstone Project**  
> **Specialization:** Artificial Intelligence and Machine Learning  
> **Dashboard Tagline:** *"Intelligent Phishing Detection and Secure Email Communication"*

---

## 1. Executive Summary & Objective

**FRESH AI** is a fully functional, locally executable web security system engineered to defend enterprise and individual inboxes against sophisticated email-borne threats. The platform combines:

1. **Machine Learning Phishing Detection:** Employs Natural Language Processing (HTML cleaning, canonical URL tokenization, and TF-IDF n-gram vectorization) coupled with L2-regularized Logistic Regression to classify emails as **PHISHING** or **LEGITIMATE** with empirical confidence ratings and risk tiers (**LOW**, **MEDIUM**, **HIGH**).
2. **Explainable AI (XAI) Diagnostics:** Demystifies machine learning predictions by computing exact feature contribution weights (TF-IDF weight × model coefficient) for influential words, identifying urgency signals and link anomalies (lookalike domains, direct IP addresses, untrusted TLDs).
3. **Sender Authentication & Header Verification:** Analyzes RFC 5322 email headers to detect sender/reply-to address divergences, return-path discrepancies, brand typosquatting, and extracts SPF, DKIM, and DMARC verification tokens with clear educational disclosure between parsed headers and live DNS lookups.
4. **OpenPGP & Cryptographic Framework:** Dual-engine asymmetric cryptography supporting real GnuPG subprocess operations when installed, alongside an internal Python Cryptography RSA-2048 / OAEP / PSS engine for immediate localhost demonstrations. Provides public/private key generation, message encryption, decryption, digital signing, signature verification, and SHA-256 integrity auditing.
5. **Security Operations Dashboard:** Powered by a persistent SQLite database with SQLAlchemy ORM. Surfaces real-time statistics, Recharts analytics, 7-day activity trends, incident alerts with triage states, and an audit trail with full deletion confirmation.

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React.js (v18), Vite, HTML5, CSS3, Modern Responsive Dark Navy & Blue Cybersecurity Design |
| **Data Visualization & Icons** | Recharts (Responsive Pie & Bar Charts), Lucide React Icons |
| **Backend API** | Python (3.10+ / 3.13), Flask, Flask-CORS, RESTful Architecture |
| **Database & ORM** | SQLite 3, SQLAlchemy (Cascading Foreign Keys, Parameterized Queries) |
| **Machine Learning & NLP** | Scikit-Learn, Pandas, NumPy, Joblib, TF-IDF Vectorizer, Logistic Regression |
| **Security & Cryptography** | GnuPG (Subprocess Batch Integration), Python Cryptography (RSA-2048, OAEP, PSS), SHA-256 |
| **Authentication & Session** | PBKDF2:SHA256 Password Hashing (Werkzeug), Signed URLSafe Session Tokens (ItsDangerous) |

---

## 3. Project Directory Structure

```
fresh-ai/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── preprocessor.py       # HTML sanitization, regex tokenization, URL anomaly checks
│   │   │   ├── feature_extractor.py  # TF-IDF (1, 2) n-gram vectorizer wrapper
│   │   │   └── classifier.py         # Logistic Regression training, test metrics & XAI contributions
│   │   ├── models/
│   │   │   ├── __init__.py           # SQLAlchemy database instance
│   │   │   └── models.py             # User, EmailAnalysis, SecurityAlert, DatasetInfo, ModelMetric
│   │   ├── routes/
│   │   │   ├── auth_routes.py        # /api/auth (Login, Logout, Status, First-Run)
│   │   │   ├── dataset_routes.py     # /api/dataset (Upload, Column Mapping, Sample Loader)
│   │   │   ├── ml_routes.py          # /api/model/train, /api/model/metrics, /api/email/analyse
│   │   │   ├── sender_routes.py      # /api/sender/analyse (Header inspection, SPF/DKIM/DMARC)
│   │   │   ├── pgp_routes.py         # /api/pgp (Keygen, Encrypt, Decrypt, Sign, Verify, SHA-256)
│   │   │   ├── dashboard_routes.py   # /api/dashboard (Real-time DB statistics & trends)
│   │   │   ├── history_routes.py     # /api/history (Search, filter, paginate, delete)
│   │   │   └── alert_routes.py       # /api/alerts (Triage, review, delete)
│   │   ├── security/
│   │   │   ├── sender_analyzer.py    # Domain spoofing, typosquatting & alignment logic
│   │   │   ├── pgp_handler.py        # Native GnuPG & Python Cryptography RSA-2048 engines
│   │   │   └── integrity.py          # Cryptographic SHA-256 digest & match verification
│   │   ├── services/
│   │   │   ├── auth_service.py       # Administrator session & first-run provisioning
│   │   │   ├── dataset_service.py    # CSV processing, validation & synthetic data loader
│   │   │   ├── ml_service.py         # Model training orchestration & alert dispatching
│   │   │   └── dashboard_service.py  # Aggregated database telemetry
│   │   └── __init__.py               # Flask application factory (create_app)
│   ├── database/
│   │   └── fresh_ai.db               # SQLite database file
│   ├── trained_models/
│   │   ├── logistic_regression_model.joblib
│   │   ├── tfidf_vectorizer.joblib
│   │   └── model_metrics.joblib
│   ├── uploads/                      # Standardized uploaded datasets
│   ├── config.py                     # Configuration settings & paths
│   ├── run.py                        # Backend application entry point (Port 5000)
│   └── requirements.txt              # Stable Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Dark navy sidebar with icon navigation
│   │   │   ├── Navbar.jsx            # Top navbar with live defense indicator & sync
│   │   │   ├── MetricCard.jsx        # Cybersecurity KPI card component
│   │   │   ├── RiskBadge.jsx         # Color-coded LOW / MEDIUM / HIGH risk badge
│   │   │   ├── LoadingSpinner.jsx    # Animated loading spinner
│   │   │   └── ConfirmationModal.jsx # Reusable action confirmation modal
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Local administrator login page
│   │   │   ├── DashboardPage.jsx     # Telemetry KPI cards, Recharts pie & bar charts
│   │   │   ├── EmailAnalysisPage.jsx # Inbound email classifier with sample presets
│   │   │   ├── ThreatExplanationPage.jsx # Explainable AI feature weights & IoC breakdown
│   │   │   ├── SenderAuthPage.jsx    # SPF/DKIM/DMARC & sender identity analyzer
│   │   │   ├── PgpPage.jsx           # OpenPGP keygen, encryption, decryption, sign & SHA-256
│   │   │   ├── DatasetPage.jsx       # CSV upload, interactive column mapping & preview
│   │   │   ├── ModelMetricsPage.jsx  # Accuracy, precision, recall, F1 & confusion matrix
│   │   │   ├── AlertsPage.jsx        # Security alert incident triage stream
│   │   │   ├── HistoryPage.jsx       # Searchable & filterable analysis audit trail
│   │   │   └── AboutPage.jsx         # Capstone project academic brief & architecture
│   │   ├── services/
│   │   │   └── api.js                # Frontend REST API client
│   │   ├── App.jsx                   # Main layout controller & page state router
│   │   ├── App.css                   # Custom responsive security dashboard CSS
│   │   ├── index.css                 # Base theme styles & typography
│   │   └── main.jsx                  # React DOM root mounting
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite configuration with backend proxy
│
├── sample_data/
│   └── sample_emails.csv             # Synthetic demonstration dataset (112 curated emails)
│
├── scripts/
│   ├── setup_database.py             # Database creation & administrator seeding script
│   └── train_model.py                # Standalone model training & metric evaluation script
│
├── .env.example                      # Environment template
├── .gitignore                        # Git exclusion rules
├── start_project.bat                 # One-click Windows launcher
├── stop_project.bat                  # One-click Windows service terminator
└── README.md                         # Comprehensive documentation
```

---

## 4. Windows Quick-Start Guide

### Prerequisites
Before running the application on your Windows machine, ensure you have:
1. **Python 3.10+ (tested on Python 3.13)**: [Download Python](https://www.python.org/downloads/)  
   *(Make sure to check "Add python.exe to PATH" during installation).*
2. **Node.js (v18+) & npm**: [Download Node.js](https://nodejs.org/)
3. **GnuPG (Optional / Recommended)**: [Download Gpg4win](https://gpg4win.org/)  
   *(Note: If GnuPG is not installed, FRESH AI automatically falls back to its built-in Python Cryptography RSA-2048 engine so all cryptographic features work out of the box).*

---

### Option A: One-Click Automated Startup (Recommended)

Simply double-click:
```bat
start_project.bat
```
This batch script will:
- Verify Python and Node.js installations.
- Activate the virtual environment in `backend\venv`.
- Install any missing dependencies if needed.
- Initialize the SQLite database and train the baseline model if needed.
- Launch the Flask backend on `http://localhost:5000`.
- Launch the React frontend on `http://localhost:5173`.
- Automatically open your default browser to `http://localhost:5173`.

To stop all services cleanly:
```bat
stop_project.bat
```

---

### Option B: Manual Step-by-Step Execution

#### Step 1: Backend Setup
Open a Windows PowerShell or Command Prompt terminal in the project root:

```powershell
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Return to root and initialize database & baseline model
cd ..
python scripts\setup_database.py

# Start Flask backend server (runs on Port 5000)
python backend\run.py
```

#### Step 2: Frontend Setup
Open a **second** terminal window:

```powershell
# Navigate to frontend
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start Vite React development server (runs on Port 5173)
npm run dev
```

Open your browser and navigate to:
**http://localhost:5173**

---

## 5. First-Run Administrator Credentials

To access the security dashboard:
- **Username:** `admin`
- **Password:** `Admin@FreshAI2026`

*(These credentials are provisioned automatically on first database initialization with secure PBKDF2:SHA256 password hashing).*

---

## 6. Required Functional Modules Walkthrough

### Module 1: Dataset Management & Feature Extraction
- **Upload CSV:** Allows uploading custom CSV datasets containing emails and labels.
- **Interactive Column Mapping:** If an uploaded dataset uses different column names (e.g. `body`, `target`, `spam`), an interactive modal prompts the user to select the appropriate text and label columns.
- **Preprocessing Pipeline:** Strips HTML formatting, converts URLs to canonical tokens, removes redundant whitespace, and performs tokenization.
- **Dataset Statistics:** Displays total emails, phishing counts, legitimate counts, and preview tables.
- **Synthetic Demonstration Fallback:** Includes a reset button to restore the bundled synthetic dataset (112 balanced records).

### Module 2: Intelligent Phishing Classification
- **Classification Pipeline:** Transforms email text using TF-IDF vectorization (n-gram range 1–2, sublinear scaling, 3,000 maximum vocabulary features) and evaluates it with an L2-regularized Logistic Regression classifier.
- **Empirical Evaluation Metrics:** Divides the dataset using a 75/25 stratified train/test split with fixed random seed (42). Metrics are calculated strictly on the held-out test split:
  - Accuracy: **~92.86%**
  - Precision: **87.50%**
  - Recall: **100.00%**
  - F1-Score: **93.33%**
  - Empirical Confusion Matrix: **TN: 12, FP: 2, FN: 0, TP: 14**
- **Inbound Email Analysis:** Users can paste any email or use 4 quick-fill synthetic demonstration presets (Bank Urgency, Sprint Backlog, Crypto Airdrop, Library Notice).
- **Inference Outputs:** Output displays predicted class (**PHISHING** or **LEGITIMATE**), confidence percentage, risk tier (**LOW**, **MEDIUM**, **HIGH**), detected suspicious keywords, and embedded link analysis.
- **Persistence:** All classification records are automatically saved to the SQLite database.

### Module 3: Sender Authentication & PGP Cryptography
- **Part A: Sender Authentication Analysis**
  - Evaluates sender email, display name, Reply-To address, Return-Path, and raw headers.
  - Detects Reply-To mismatches (different domain/inbox routing), Return-Path divergences, and brand display name deception (CEO fraud).
  - Identifies lookalike and typosquatting domains (e.g. `paypa1.com`, `micros0ft.com`, `chase-alert.xyz`).
  - Parses SPF, DKIM, and DMARC tokens from `Authentication-Results` headers (**PASS**, **FAIL**, **NOT AVAILABLE**).
  - Provides clear educational disclosure distinguishing supplied header results from live DNS TXT lookups.
- **Part B: OpenPGP & Asymmetric Cryptography**
  - **Key Generation:** Generates real 2048-bit RSA key pairs with owner metadata and optional passphrase protection.
  - **Armored Public/Private Keys:** Outputs standard ASCII armored blocks. Private keys are never stored in the database or logged on the server.
  - **Encryption & Decryption:** Encrypts plaintext messages using the recipient's public key (RSA-OAEP with SHA-256) and decrypts them using the corresponding private key and passphrase.
  - **Digital Signatures:** Signs messages with private keys (RSA-PSS) and validates signature authenticity and non-tampering against public keys.
  - **SHA-256 Integrity Tool:** Computes message digests and verifies expected hashes to detect tampering.

### Module 4: Threat Explanation & Security Dashboard
- **Explainable AI (XAI):** Calculates exact linear model feature contributions (`weight * coefficient`) for non-zero vocabulary tokens in any analyzed email.
- **Supporting Signal Notice:** Clearly informs analysts that lexical signals are diagnostic aids and not absolute proof.
- **Real-Time KPI Cards:** Surfaces Total Analysed, Phishing Detected, Legitimate Emails, High-Risk Threats, and Security Alerts.
- **Visual Analytics:** Interactive Recharts Donut Chart (phishing vs. legitimate ratio) and Bar Chart (7-day threat frequency).
- **Incident Alerts Stream:** Automatically triggers alerts for high-risk or phishing emails, allowing triage, filtering by severity, marking as reviewed, or deleting with confirmation.
- **Audit Trail History:** Searchable and filterable history table with pagination, view details modal, and secure deletion.

---

## 7. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Authenticates administrator and returns session token |
| `/api/auth/logout` | POST | Terminates session |
| `/api/auth/status` | GET | Checks token authentication status |
| `/api/dataset/upload` | POST | Uploads custom CSV dataset with column inspection |
| `/api/dataset/map-and-process` | POST | Maps custom column names and registers active dataset |
| `/api/dataset/load-sample` | POST | Resets to synthetic demonstration dataset |
| `/api/dataset/statistics` | GET | Returns record counts and feature extraction metrics |
| `/api/dataset/preview` | GET | Returns preview rows of active dataset |
| `/api/model/train` | POST | Retrains model and computes empirical test metrics |
| `/api/model/metrics` | GET | Returns latest accuracy, precision, recall, F1, and confusion matrix |
| `/api/email/analyse` | POST | Classifies email, computes risk, and saves record to DB |
| `/api/sender/analyse` | POST | Inspects headers, domain alignment, SPF, DKIM, and DMARC |
| `/api/pgp/status` | GET | Checks host GnuPG binary status |
| `/api/pgp/generate-keys` | POST | Generates 2048-bit asymmetric key pair |
| `/api/pgp/encrypt` | POST | Encrypts message using recipient public key |
| `/api/pgp/decrypt` | POST | Decrypts ciphertext using private key and passphrase |
| `/api/pgp/sign` | POST | Signs message using private key (RSA-PSS) |
| `/api/pgp/verify` | POST | Validates digital signature against public key |
| `/api/pgp/integrity-check` | POST | Computes and compares SHA-256 hash digests |
| `/api/dashboard/statistics` | GET | Computes real-time telemetry from SQLite database |
| `/api/dashboard/trends` | GET | Returns 7-day daily analysis counts |
| `/api/history` | GET | Returns paginated, searchable email audit trail |
| `/api/history/<id>` | GET | Returns complete threat diagnostics for a record |
| `/api/history/<id>` | DELETE | Deletes analysis record from database |
| `/api/alerts` | GET | Returns security incident alerts with filters |
| `/api/alerts/<id>/review` | PUT | Marks security alert as REVIEWED |
| `/api/alerts/<id>` | DELETE | Deletes alert from database |

---

## 8. Final Testing Checklist & Completed Features

- [x] **Frontend:** React + Vite starts cleanly without errors on `http://localhost:5173`.
- [x] **Backend:** Flask REST API starts cleanly on `http://localhost:5000`.
- [x] **Authentication:** Secure login with PBKDF2 password verification and signed session tokens.
- [x] **Database:** SQLite relational database auto-initializes with tables (`users`, `email_analysis`, `security_alerts`, `dataset_info`, `model_metrics`).
- [x] **Dataset Ingestion:** CSV upload, custom column mapping modal, preview, and synthetic data reset.
- [x] **Machine Learning Model:** TF-IDF vectorizer + Logistic Regression with stratified 75/25 train/test split.
- [x] **Evaluation Metrics:** True empirical test metrics (92.86% Accuracy, 87.5% Precision, 100% Recall, 93.3% F1, Confusion Matrix).
- [x] **Email Inference:** Real-time prediction (PHISHING / LEGITIMATE), confidence meter, LOW/MEDIUM/HIGH risk rating.
- [x] **Explainable AI:** Feature contribution breakdown, suspicious keyword matching, and link anomaly extraction.
- [x] **Sender Authentication:** Reply-To mismatch, Return-Path mismatch, typosquatting domain detection, SPF/DKIM/DMARC status.
- [x] **PGP & Cryptography:** RSA-2048 keypair generation, public key export, asymmetric encryption (RSA-OAEP), decryption with passphrase, RSA-PSS signing, signature verification, and SHA-256 integrity check.
- [x] **Security Operations Dashboard:** Live SQLite statistics, Recharts donut and bar charts, 7-day threat trend.
- [x] **Alert Management:** Automated alert generation, filtering by severity and status, marking as reviewed, and confirmed deletion.
- [x] **Analysis Audit Trail:** Searchable history table with pagination, threat explanation drill-down, and confirmed deletion.
- [x] **Windows Automation:** `start_project.bat` and `stop_project.bat` scripts for seamless local execution.

---

## 9. Academic License & Credits

Developed as a Final-Year Engineering Capstone Project in Computer Science and Engineering (Artificial Intelligence and Machine Learning).  
All synthetic test emails and security simulation modules are provided strictly for educational, defensive, and research evaluation purposes.
