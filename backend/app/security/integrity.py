import hashlib
from typing import Dict, Any

class IntegrityManager:
    """Provides cryptographic hashing and verification using SHA-256."""

    @staticmethod
    def calculate_sha256(content: str) -> str:
        """Calculates SHA-256 digest of input text."""
        if content is None:
            content = ""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    @staticmethod
    def verify_integrity(content: str, expected_hash: str) -> Dict[str, Any]:
        """Verifies if content matches the expected SHA-256 digest."""
        computed_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        is_valid = computed_hash.lower().strip() == expected_hash.lower().strip()
        return {
            'is_valid': is_valid,
            'computed_hash': computed_hash,
            'expected_hash': expected_hash.strip(),
            'algorithm': 'SHA-256',
            'status': 'VERIFIED_MATCH' if is_valid else 'TAMPERED_OR_MISMATCH'
        }
