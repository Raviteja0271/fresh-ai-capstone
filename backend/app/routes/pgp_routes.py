from flask import Blueprint, request, jsonify
from ..security.pgp_handler import PGPHandler
from ..security.integrity import IntegrityManager

pgp_bp = Blueprint('pgp', __name__)

@pgp_bp.route('/status', methods=['GET'])
def get_pgp_status():
    status = PGPHandler.check_gnupg_status()
    return jsonify(status), 200

@pgp_bp.route('/generate-keys', methods=['POST'])
def generate_keys():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    passphrase = data.get('passphrase', '')
    engine = data.get('engine', 'auto')  # 'auto', 'gnupg', or 'cryptography'

    if not name or not email:
        return jsonify({'error': 'Name and Email are required for key generation.'}), 400

    try:
        gpg_status = PGPHandler.check_gnupg_status()
        if engine == 'gnupg' or (engine == 'auto' and gpg_status['available']):
            result = PGPHandler.gnupg_generate_key(name, email, passphrase)
        else:
            result = PGPHandler.crypto_generate_keypair(name, email, passphrase)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pgp_bp.route('/encrypt', methods=['POST'])
def encrypt_message():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    public_key = data.get('public_key', '').strip()
    recipient_email = data.get('recipient_email', '').strip()
    engine = data.get('engine', 'auto')

    if not message:
        return jsonify({'error': 'Message cannot be empty.'}), 400

    try:
        gpg_status = PGPHandler.check_gnupg_status()
        if (engine == 'gnupg' or (engine == 'auto' and recipient_email and not public_key)) and gpg_status['available']:
            result = PGPHandler.gnupg_encrypt(message, recipient_email)
        else:
            if not public_key:
                return jsonify({'error': 'A valid recipient public key is required for encryption.'}), 400
            result = PGPHandler.crypto_encrypt(message, public_key)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pgp_bp.route('/decrypt', methods=['POST'])
def decrypt_message():
    data = request.get_json() or {}
    encrypted_message = data.get('encrypted_message', '').strip()
    private_key = data.get('private_key', '').strip()
    passphrase = data.get('passphrase', '')

    if not encrypted_message:
        return jsonify({'error': 'Encrypted message payload cannot be empty.'}), 400
    if not private_key:
        return jsonify({'error': 'Private key is required to decrypt this message.'}), 400

    try:
        result = PGPHandler.crypto_decrypt(encrypted_message, private_key, passphrase)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pgp_bp.route('/sign', methods=['POST'])
def sign_message():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    private_key = data.get('private_key', '').strip()
    passphrase = data.get('passphrase', '')

    if not message:
        return jsonify({'error': 'Message to sign cannot be empty.'}), 400
    if not private_key:
        return jsonify({'error': 'Private key is required for digital signing.'}), 400

    try:
        result = PGPHandler.crypto_sign(message, private_key, passphrase)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pgp_bp.route('/verify', methods=['POST'])
def verify_message():
    data = request.get_json() or {}
    signed_message = data.get('signed_message', '').strip()
    public_key = data.get('public_key', '').strip()

    if not signed_message:
        return jsonify({'error': 'Signed message cannot be empty.'}), 400
    if not public_key:
        return jsonify({'error': 'Signer public key is required for verification.'}), 400

    try:
        result = PGPHandler.crypto_verify(signed_message, public_key)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@pgp_bp.route('/integrity-check', methods=['POST'])
def integrity_check():
    data = request.get_json() or {}
    content = data.get('content', '')
    expected_hash = data.get('expected_hash', '').strip()

    if not content:
        return jsonify({'error': 'Content to hash cannot be empty.'}), 400

    calculated_hash = IntegrityManager.calculate_sha256(content)

    if expected_hash:
        verification = IntegrityManager.verify_integrity(content, expected_hash)
        return jsonify(verification), 200

    return jsonify({
        'sha256': calculated_hash,
        'algorithm': 'SHA-256',
        'length': len(content)
    }), 200
