import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / 'backend'))

from app import create_app
from app.services.ml_service import MLService

def main():
    print("=" * 60)
    print("  FRESH AI - Standalone Model Training & Evaluation")
    print("=" * 60)

    app = create_app()
    with app.app_context():
        print("[+] Training TF-IDF + Logistic Regression Classifier...")
        result = MLService.train_model()
        metrics = result['metrics']

        print("\n--- Model Evaluation Results (Unseen Test Set) ---")
        print(f"Accuracy : {metrics['accuracy'] * 100:.2f}%")
        print(f"Precision: {metrics['precision'] * 100:.2f}%")
        print(f"Recall   : {metrics['recall'] * 100:.2f}%")
        print(f"F1-Score : {metrics['f1_score'] * 100:.2f}%")
        print(f"Train Set: {metrics['train_size']} records")
        print(f"Test Set : {metrics['test_size']} records")
        print(f"Confusion Matrix:")
        cm = metrics.get('confusion_matrix')
        if cm:
            print(f"    [[TN: {cm[0][0]}, FP: {cm[0][1]}],")
            print(f"     [FN: {cm[1][0]}, TP: {cm[1][1]}]]")

        print("\n[SUCCESS] Model and vectorizer successfully trained and saved to disk.")
        print("=" * 60)

if __name__ == '__main__':
    main()
