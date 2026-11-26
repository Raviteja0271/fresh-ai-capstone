import re
from typing import Dict, Any, List, Optional
import email
from email.utils import parseaddr

class SenderAuthenticator:
    """
    Analyzes email sender identity, headers, and authentication records.
    Provides clear distinction between parsed header results and live DNS verification.
    """

    SUSPICIOUS_DOMAIN_TLDS = {'.xyz', '.top', '.cc', '.info', '.biz', '.site', '.club', '.online', '.work', '.download'}
    
    # Common brand impersonation typosquat patterns
    TYPOSQUAT_PATTERNS = [
        (r'paypa[l1i]', 'PayPal'),
        (r'micros[o0]ft', 'Microsoft'),
        (r'goog[l1]e', 'Google'),
        (r'app[l1]e', 'Apple'),
        (r'amaz[o0]n', 'Amazon'),
        (r'netf[l1]ix', 'Netflix'),
        (r'ch[a4]se', 'Chase'),
        (r'w[e3]lls\s*farg[o0]', 'Wells Fargo'),
        (r'b[a4]nk\s*of\s*am[e3]rica', 'Bank of America')
    ]

    @classmethod
    def parse_email_headers(cls, raw_headers: str) -> Dict[str, str]:
        """Parses RFC 5322 header block into key-value pairs."""
        headers = {}
        if not raw_headers:
            return headers

        try:
            msg = email.message_from_string(raw_headers)
            for k, v in msg.items():
                headers[k.lower()] = v
        except Exception:
            # Fallback naive line parser
            current_key = None
            for line in raw_headers.splitlines():
                if line.startswith((' ', '\t')) and current_key:
                    headers[current_key] += ' ' + line.strip()
                elif ':' in line:
                    parts = line.split(':', 1)
                    current_key = parts[0].strip().lower()
                    headers[current_key] = parts[1].strip()
        return headers

    @classmethod
    def extract_auth_results(cls, auth_header: str) -> Dict[str, str]:
        """
        Parses SPF, DKIM, and DMARC status tokens from an Authentication-Results header string.
        Example: spf=pass (google.com: domain of...) dkim=pass header.i=@... dmarc=pass
        """
        results = {
            'spf': 'NOT AVAILABLE',
            'dkim': 'NOT AVAILABLE',
            'dmarc': 'NOT AVAILABLE',
            'raw_matches': {}
        }
        if not auth_header:
            return results

        lower_header = auth_header.lower()

        # Parse SPF
        spf_match = re.search(r'\bspf=([a-z]+)', lower_header)
        if spf_match:
            status = spf_match.group(1).upper()
            results['spf'] = status
            results['raw_matches']['spf'] = spf_match.group(0)

        # Parse DKIM
        dkim_match = re.search(r'\bdkim=([a-z]+)', lower_header)
        if dkim_match:
            status = dkim_match.group(1).upper()
            results['dkim'] = status
            results['raw_matches']['dkim'] = dkim_match.group(0)

        # Parse DMARC
        dmarc_match = re.search(r'\bdmarc=([a-z]+)', lower_header)
        if dmarc_match:
            status = dmarc_match.group(1).upper()
            results['dmarc'] = status
            results['raw_matches']['dmarc'] = dmarc_match.group(0)

        return results

    @classmethod
    def analyze_sender(
        cls,
        sender_email: str,
        display_name: str = "",
        reply_to: str = "",
        return_path: str = "",
        raw_headers: str = "",
        auth_results_header: str = ""
    ) -> Dict[str, Any]:
        """
        Performs thorough sender authenticity checks.
        """
        warnings = []
        risk_score = 0  # 0 to 100

        # Parse sender email & display name if combined
        parsed_name, parsed_addr = parseaddr(sender_email)
        actual_sender_email = parsed_addr or sender_email.strip()
        actual_display_name = display_name.strip() or parsed_name.strip()

        # Extract domain
        sender_domain = actual_sender_email.split('@')[-1].lower() if '@' in actual_sender_email else ""
        
        # Check parsed headers if provided
        parsed_headers = cls.parse_email_headers(raw_headers)
        if not reply_to and 'reply-to' in parsed_headers:
            reply_to = parsed_headers['reply-to']
        if not return_path and 'return-path' in parsed_headers:
            return_path = parsed_headers['return-path']
        if not auth_results_header and 'authentication-results' in parsed_headers:
            auth_results_header = parsed_headers['authentication-results']

        parsed_reply_to_name, parsed_reply_to_addr = parseaddr(reply_to)
        actual_reply_to = parsed_reply_to_addr or reply_to.strip()
        reply_to_domain = actual_reply_to.split('@')[-1].lower() if '@' in actual_reply_to else ""

        parsed_return_path_name, parsed_return_path_addr = parseaddr(return_path)
        actual_return_path = parsed_return_path_addr or return_path.strip()
        return_path_domain = actual_return_path.split('@')[-1].lower() if '@' in actual_return_path else ""

        # 1. Reply-To Mismatch Check
        reply_to_mismatch = False
        if actual_reply_to and actual_sender_email:
            if sender_domain and reply_to_domain and sender_domain != reply_to_domain:
                reply_to_mismatch = True
                risk_score += 35
                warnings.append(
                    f"Sender domain ({sender_domain}) does not match Reply-To domain ({reply_to_domain}). "
                    "Replies will be routed to a different destination."
                )

        # 2. Return-Path Mismatch Check
        return_path_mismatch = False
        if actual_return_path and actual_sender_email:
            if sender_domain and return_path_domain and sender_domain != return_path_domain:
                return_path_mismatch = True
                risk_score += 20
                warnings.append(
                    f"Sender domain ({sender_domain}) does not match Return-Path domain ({return_path_domain})."
                )

        # 3. Display Name Deception (CEO fraud / Brand impersonation in Display Name)
        display_name_anomaly = False
        if actual_display_name and sender_domain:
            for pattern, brand in cls.TYPOSQUAT_PATTERNS:
                if re.search(pattern, actual_display_name, re.IGNORECASE):
                    if brand.lower().replace(' ', '') not in sender_domain:
                        display_name_anomaly = True
                        risk_score += 30
                        warnings.append(
                            f"Display name references '{actual_display_name}', but sending domain is '{sender_domain}'. "
                            "Common executive/brand impersonation tactic."
                        )
                        break

        # 4. Suspicious TLD on sender domain
        for tld in cls.SUSPICIOUS_DOMAIN_TLDS:
            if sender_domain.endswith(tld):
                risk_score += 25
                warnings.append(f"Sender domain uses uncommon/high-risk TLD ({tld}) frequently used in disposable phishing operations.")
                break

        # 5. Typosquatting in domain itself (e.g. paypa1-alert.com)
        for pattern, brand in cls.TYPOSQUAT_PATTERNS:
            if re.search(pattern, sender_domain, re.IGNORECASE):
                # If it resembles the brand but isn't the legitimate domain
                legit_domains = [f"{brand.lower().replace(' ', '')}.com", f"{brand.lower().replace(' ', '')}.org", f"{brand.lower().replace(' ', '')}.net"]
                if sender_domain not in legit_domains and not any(sender_domain.endswith('.' + d) for d in legit_domains):
                    risk_score += 40
                    warnings.append(f"Domain '{sender_domain}' appears to be a lookalike / typosquatting domain imitating {brand}.")

        # 6. Parse SPF / DKIM / DMARC from Authentication-Results
        auth_results = cls.extract_auth_results(auth_results_header)

        if auth_results['spf'] in ['FAIL', 'SOFTFAIL']:
            risk_score += 30
            warnings.append(f"SPF Check Header indicated: {auth_results['spf']}. Sending MTA was not authorized by SPF record.")
        elif auth_results['spf'] == 'NOT AVAILABLE':
            risk_score += 5
            warnings.append("No SPF verification record found in supplied headers.")

        if auth_results['dkim'] in ['FAIL', 'PERMFAIL', 'NEUTRAL']:
            risk_score += 30
            warnings.append(f"DKIM Check Header indicated: {auth_results['dkim']}. Cryptographic email signature verification failed.")
        elif auth_results['dkim'] == 'NOT AVAILABLE':
            risk_score += 5
            warnings.append("No DKIM verification record found in supplied headers.")

        if auth_results['dmarc'] in ['FAIL', 'REJECT']:
            risk_score += 35
            warnings.append(f"DMARC Check Header indicated: {auth_results['dmarc']}. Domain policy alignment failed.")
        elif auth_results['dmarc'] == 'NOT AVAILABLE':
            warnings.append("No DMARC policy evaluation found in supplied headers.")

        # Cap risk score
        risk_score = min(100, max(0, risk_score))

        # Overall risk level
        if risk_score >= 60:
            sender_risk_level = "HIGH"
        elif risk_score >= 30:
            sender_risk_level = "MEDIUM"
        else:
            sender_risk_level = "LOW"

        return {
            'sender_email': actual_sender_email,
            'display_name': actual_display_name,
            'sender_domain': sender_domain,
            'reply_to': actual_reply_to,
            'return_path': actual_return_path,
            'reply_to_mismatch': reply_to_mismatch,
            'return_path_mismatch': return_path_mismatch,
            'display_name_anomaly': display_name_anomaly,
            'spf_status': auth_results['spf'],
            'dkim_status': auth_results['dkim'],
            'dmarc_status': auth_results['dmarc'],
            'raw_auth_matches': auth_results['raw_matches'],
            'warnings': warnings,
            'risk_score': risk_score,
            'sender_risk_level': sender_risk_level,
            'verification_mode': 'Supplied Header Inspection',
            'verification_disclaimer': (
                "IMPORTANT: These authentication results are extracted directly from the supplied email headers "
                "(Authentication-Results / Received headers). In a live enterprise mail exchange server, these are "
                "independently validated against DNS TXT records. Because headers can be fabricated by malicious actors "
                "in unauthenticated transport, supplied header checks must be interpreted with caution."
            )
        }
