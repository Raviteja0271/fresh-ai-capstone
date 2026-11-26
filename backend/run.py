import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f"\n=======================================================")
    print(f"  FRESH AI - Email Security & Phishing Detection Framework")
    print(f"  Server running at: http://{host}:{port}")
    print(f"  Press CTRL+C to stop the server.")
    print(f"=======================================================\n")
    app.run(host=host, port=port, debug=False)
