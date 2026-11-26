import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / 'backend'))

from app import create_app
from app.models import db, User, DatasetInfo
from app.services.auth_service import AuthService
from app.services.dataset_service import DatasetService

def main():
    print("=" * 60)
    print("  FRESH AI - Database Initialization Script")
    print("=" * 60)

    app = create_app()
    with app.app_context():
        print("[+] Creating SQLite database tables...")
        db.create_all()

        print("[+] Ensuring administrator account exists...")
        admin = AuthService.ensure_default_admin()
        print(f"    Admin username: {admin.username}")
        print("    Default password: Admin@FreshAI2026")

        print("[+] Checking dataset...")
        if not DatasetInfo.query.first():
            print("    Loading synthetic demonstration dataset...")
            res = DatasetService.load_synthetic_sample()
            print(f"    Loaded {res['total_records']} demonstration emails.")
        else:
            print("    Active dataset already registered.")

        print("\n[SUCCESS] Database initialization completed successfully.")
        print(f"Database located at: {app.config['DB_PATH']}")
        print("=" * 60)

if __name__ == '__main__':
    main()
