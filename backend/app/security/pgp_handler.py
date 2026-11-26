import subprocess
import shutil
import base64
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

class PGPHandler:
    """
    Manages OpenPGP & Public-Key Cryptographic Operations.
    Integrates with system GnuPG (`gpg`) via subprocess.
    Includes a robust Python Cryptography RSA-2048 engine so users can demonstrate
    end-to-end asymmetric encryption, decryption, signing and verification
    even if GnuPG binary is not yet installed on their Windows machine.
    """

    KNOWN_GPG_PATHS = [
        r"C:\Program Files (x86)\GnuPG\bin\gpg.exe",
        r"C:\Program Files\GnuPG\bin\gpg.exe",
        r"C:\Program Files (x86)\GnuPG\gpg.exe",
        r"C:\Program Files\GnuPG\gpg.exe"
    ]

    @classmethod
    def get_gpg_executable(cls) -> Optional[str]:
        """Finds gpg executable in PATH or standard Windows installation locations."""
        which_gpg = shutil.which("gpg") or shutil.which("gpg.exe")
        if which_gpg:
            return which_gpg

        for p in cls.KNOWN_GPG_PATHS:
            if Path(p).exists():
                return p
        return None

    @classmethod
    def check_gnupg_status(cls) -> Dict[str, Any]:
        """Verifies if GnuPG is installed and reachable on the system."""
        gpg_exe = cls.get_gpg_executable()
        if not gpg_exe:
            return {
                'available': False,
                'version': None,
                'path': None,
                'engine': 'Native GnuPG not detected',
                'fallback_available': True,
                'instructions': (
                    "GnuPG binary ('gpg') is not found in your system PATH. "
                    "To install GnuPG on Windows: 1) Download Gpg4win from https://gpg4win.org/download.html. "
                    "2) Run the installer and check 'GnuPG'. 3) Ensure 'C:\\Program Files (x86)\\GnuPG\\bin' "
                    "is in your Windows PATH environment variable and restart the application. "
                    "In the meantime, FRESH AI's Python Cryptography RSA-2048 engine is fully operational for testing."
                )
            }

        try:
            res = subprocess.run([gpg_exe, "--version"], capture_output=True, text=True, check=True)
            first_line = res.stdout.splitlines()[0] if res.stdout else "GnuPG active"
            return {
                'available': True,
                'version': first_line,
                'path': gpg_exe,
                'engine': 'Native GnuPG (Active)',
                'fallback_available': True,
                'instructions': 'Native GnuPG is installed and operational.'
            }
        except Exception as e:
            return {
                'available': False,
                'version': None,
                'path': gpg_exe,
                'engine': 'GnuPG Execution Error',
                'fallback_available': True,
                'instructions': f"Error invoking GnuPG at {gpg_exe}: {str(e)}"
            }

    # =========================================================================
    # NATIVE GNUPG SUBPROCESS INTEGRATION
    # =========================================================================

    @classmethod
    def gnupg_generate_key(cls, name: str, email: str, passphrase: str = "") -> Dict[str, Any]:
        """Generates OpenPGP key pair using GnuPG batch mode."""
        gpg_exe = cls.get_gpg_executable()
        if not gpg_exe:
            raise RuntimeError(
                "GnuPG installation not found. Please install Gpg4win from https://gpg4win.org "
                "or switch to Python Cryptography engine."
            )

        key_spec = f"""Key-Type: RSA
Key-Length: 2048
Subkey-Type: RSA
Subkey-Length: 2048
Name-Real: {name}
Name-Email: {email}
Expire-Date: 0
"""
        if passphrase:
            key_spec += f"Passphrase: {passphrase}\n"
        else:
            key_spec += "%no-protection\n"
        key_spec += "%commit\n"

        proc = subprocess.run(
            [gpg_exe, "--batch", "--gen-key"],
            input=key_spec,
            capture_output=True,
            text=True
        )
        if proc.returncode != 0:
            raise RuntimeError(f"GnuPG Key generation failed: {proc.stderr}")

        # Export public key
        export_proc = subprocess.run(
            [gpg_exe, "--armor", "--export", email],
            capture_output=True,
            text=True
        )

        return {
            'engine': 'Native GnuPG',
            'public_key': export_proc.stdout,
            'user': f"{name} <{email}>",
            'message': 'GnuPG key pair successfully generated in local keyring.'
        }

    @classmethod
    def gnupg_encrypt(cls, message: str, recipient_email: str) -> Dict[str, Any]:
        """Encrypts a plaintext message for recipient using GnuPG."""
        gpg_exe = cls.get_gpg_executable()
        if not gpg_exe:
            raise RuntimeError("GnuPG binary not found.")

        proc = subprocess.run(
            [gpg_exe, "--batch", "--yes", "--armor", "--encrypt", "--recipient", recipient_email],
            input=message,
            capture_output=True,
            text=True
        )
        if proc.returncode != 0:
            raise RuntimeError(f"GnuPG encryption failed: {proc.stderr}")

        return {
            'engine': 'Native GnuPG',
            'encrypted_message': proc.stdout,
            'recipient': recipient_email
        }

    # =========================================================================
    # PYTHON CRYPTOGRAPHY SECURE ASYMMETRIC ENGINE (RFC-COMPATIBLE FALLBACK)
    # =========================================================================

    @classmethod
    def crypto_generate_keypair(cls, name: str, email: str, passphrase: str = "") -> Dict[str, Any]:
        """
        Generates standard RSA 2048-bit key pair.
        Returns armored PEM public and private keys.
        Does not store passphrase or private key in database.
        """
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()

        # Encryption algorithm for private key
        if passphrase and len(passphrase.strip()) > 0:
            encryption_algo = serialization.BestAvailableEncryption(passphrase.strip().encode('utf-8'))
        else:
            encryption_algo = serialization.NoEncryption()

        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption_algo
        ).decode('utf-8')

        pem_public = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

        # Format user header
        header = f"# FRESH AI Cryptographic Keypair\n# Owner: {name} <{email}>\n"
        armored_public = f"{header}{pem_public}"

        return {
            'engine': 'FRESH AI Cryptography Engine (RSA-2048 / SHA-256)',
            'public_key': armored_public,
            'private_key': pem_private,
            'name': name,
            'email': email,
            'has_passphrase': bool(passphrase and len(passphrase.strip()) > 0),
            'note': 'Private key must be saved locally. Never share your private key or passphrase.'
        }

    @classmethod
    def crypto_encrypt(cls, message: str, public_key_pem: str) -> Dict[str, Any]:
        """Encrypts plaintext message with recipient's public key."""
        if not message:
            raise ValueError("Message to encrypt cannot be empty.")
        if not public_key_pem or "PUBLIC KEY" not in public_key_pem:
            raise ValueError("A valid PEM public key is required.")

        # Clean any custom header lines
        clean_pem = []
        in_key = False
        for line in public_key_pem.splitlines():
            if "BEGIN PUBLIC KEY" in line:
                in_key = True
            if in_key:
                clean_pem.append(line)
            if "END PUBLIC KEY" in line:
                break
        
        pem_str = "\n".join(clean_pem)
        try:
            pubkey = serialization.load_pem_public_key(pem_str.encode('utf-8'))
        except Exception as e:
            raise ValueError(f"Invalid public key format: {str(e)}")

        # RSA-OAEP with SHA-256
        # If message is longer than RSA max block (190 bytes for 2048-bit with SHA-256), chunk it
        data_bytes = message.encode('utf-8')
        chunk_size = 190
        encrypted_chunks = []

        for i in range(0, len(data_bytes), chunk_size):
            chunk = data_bytes[i:i + chunk_size]
            encrypted_chunk = pubkey.encrypt(
                chunk,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            encrypted_chunks.append(base64.b64encode(encrypted_chunk).decode('ascii'))

        armored_ciphertext = (
            "-----BEGIN FRESH AI ENCRYPTED MESSAGE-----\n"
            f"Version: FRESH AI PGP/RSA Security v1.0\n"
            f"Chunks: {len(encrypted_chunks)}\n\n"
            + "\n".join(encrypted_chunks)
            + "\n-----END FRESH AI ENCRYPTED MESSAGE-----"
        )

        return {
            'engine': 'FRESH AI Cryptography Engine (RSA-OAEP / SHA-256)',
            'encrypted_message': armored_ciphertext,
            'original_length': len(message)
        }

    @classmethod
    def crypto_decrypt(cls, encrypted_armor: str, private_key_pem: str, passphrase: str = "") -> Dict[str, Any]:
        """Decrypts armored message using private key and optional passphrase."""
        if not encrypted_armor:
            raise ValueError("Encrypted message cannot be empty.")
        if not private_key_pem or "PRIVATE KEY" not in private_key_pem:
            raise ValueError("A valid PEM private key is required.")

        pass_bytes = passphrase.strip().encode('utf-8') if passphrase and passphrase.strip() else None

        try:
            privkey = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=pass_bytes
            )
        except TypeError as te:
            raise ValueError("Private key requires a passphrase. Please provide the correct passphrase.")
        except Exception as e:
            raise ValueError("Failed to load private key. Ensure the key and passphrase are correct.")

        # Extract chunks from armored text
        lines = encrypted_armor.strip().splitlines()
        chunks = []
        for line in lines:
            line_s = line.strip()
            if not line_s or line_s.startswith("-----") or line_s.startswith("Version:") or line_s.startswith("Chunks:"):
                continue
            chunks.append(line_s)

        if not chunks:
            raise ValueError("No encrypted ciphertext payload found in the input.")

        decrypted_parts = []
        for idx, chunk in enumerate(chunks):
            try:
                raw_chunk = base64.b64decode(chunk)
                plain_chunk = privkey.decrypt(
                    raw_chunk,
                    padding.OAEP(
                        mgf=padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                decrypted_parts.append(plain_chunk.decode('utf-8'))
            except Exception as e:
                raise ValueError(f"Decryption failed on block {idx+1}. Incorrect private key or corrupted ciphertext.")

        decrypted_message = "".join(decrypted_parts)
        return {
            'engine': 'FRESH AI Cryptography Engine (RSA-OAEP / SHA-256)',
            'decrypted_message': decrypted_message
        }

    @classmethod
    def crypto_sign(cls, message: str, private_key_pem: str, passphrase: str = "") -> Dict[str, Any]:
        """Cryptographically signs a message using private key."""
        if not message:
            raise ValueError("Message to sign cannot be empty.")
        if not private_key_pem or "PRIVATE KEY" not in private_key_pem:
            raise ValueError("Valid private key required for digital signing.")

        pass_bytes = passphrase.strip().encode('utf-8') if passphrase and passphrase.strip() else None

        try:
            privkey = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=pass_bytes
            )
        except Exception:
            raise ValueError("Failed to load private key. Please check passphrase and private key format.")

        signature = privkey.sign(
            message.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        sig_b64 = base64.b64encode(signature).decode('ascii')

        signed_armor = (
            "-----BEGIN FRESH AI SIGNED MESSAGE-----\n"
            f"Hash: SHA256\n\n"
            f"{message}\n"
            "-----BEGIN FRESH AI SIGNATURE-----\n"
            f"{sig_b64}\n"
            "-----END FRESH AI SIGNATURE-----"
        )

        return {
            'engine': 'FRESH AI Cryptography Engine (RSA-PSS / SHA-256)',
            'signed_message': signed_armor,
            'signature': sig_b64
        }

    @classmethod
    def crypto_verify(cls, signed_armor: str, public_key_pem: str) -> Dict[str, Any]:
        """Verifies cryptographic signature against public key."""
        if not signed_armor:
            raise ValueError("Signed message cannot be empty.")
        if not public_key_pem or "PUBLIC KEY" not in public_key_pem:
            raise ValueError("Valid public key required for signature verification.")

        # Extract message and signature
        if "-----BEGIN FRESH AI SIGNATURE-----" not in signed_armor:
            raise ValueError("Signed message format invalid: missing signature block.")

        try:
            parts = signed_armor.split("-----BEGIN FRESH AI SIGNATURE-----")
            msg_part = parts[0]
            sig_part = parts[1].replace("-----END FRESH AI SIGNATURE-----", "").strip()

            # Clean message part
            msg_lines = msg_part.splitlines()
            body_lines = []
            capture = False
            for line in msg_lines:
                if capture:
                    body_lines.append(line)
                elif line.strip() == "":
                    capture = True

            message = "\n".join(body_lines).rstrip("\n")
            sig_bytes = base64.b64decode(sig_part)

            # Clean public key
            clean_pem = []
            in_key = False
            for line in public_key_pem.splitlines():
                if "BEGIN PUBLIC KEY" in line:
                    in_key = True
                if in_key:
                    clean_pem.append(line)
                if "END PUBLIC KEY" in line:
                    break
            pubkey = serialization.load_pem_public_key("\n".join(clean_pem).encode('utf-8'))

            pubkey.verify(
                sig_bytes,
                message.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )

            return {
                'is_valid': True,
                'status': 'SIGNATURE_VERIFIED_VALID',
                'message': message,
                'details': 'Cryptographic RSA-PSS signature verified successfully. The message has not been altered.'
            }
        except InvalidSignature:
            return {
                'is_valid': False,
                'status': 'SIGNATURE_INVALID_OR_TAMPERED',
                'message': None,
                'details': 'Signature verification failed! The message may have been modified or signed with a different key.'
            }
        except Exception as e:
            raise ValueError(f"Verification error: {str(e)}")
