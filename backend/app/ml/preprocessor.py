import re
import html
from typing import List, Tuple

class TextPreprocessor:
    """Preprocesses raw email text for machine learning and pattern analysis."""
    
    # Common URL regex pattern
    URL_PATTERN = re.compile(
        r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)',
        re.IGNORECASE
    )
    
    # HTML tag pattern
    HTML_PATTERN = re.compile(r'<[^>]+>')
    
    # Suspicious domain indicators
    SUSPICIOUS_TLDS = {'.xyz', '.top', '.cc', '.info', '.biz', '.site', '.club', '.online', '.work', '.download'}
    
    # High-risk urgency / credential harvesting keywords
    SUSPICIOUS_KEYWORD_LIST = [
        'urgent', 'immediate', 'immediately', 'suspended', 'suspension',
        'locked', 'verify', 'verification', 'unauthorized', 'fraud',
        'password', 'credentials', 'bank', 'lottery', 'prize', 'winner',
        'ssn', 'social security', 'debit card', 'credit card', 'refund',
        'wire transfer', 'bitcoin', 'crypto', 'wallet', 'expiration',
        'expires', 'warrant', 'arrest', 'customs', 'unclaimed', 'overpayment'
    ]

    @classmethod
    def extract_urls(cls, text: str) -> List[str]:
        """Extract all URLs found in the text."""
        if not text:
            return []
        return cls.URL_PATTERN.findall(text)

    @classmethod
    def clean_text(cls, text: str) -> str:
        """
        Cleans email text:
        - Unescapes HTML entities
        - Strips HTML tags
        - Replaces URLs with a canonical token 'httpurl' for ML
        - Normalizes multiple spaces and line breaks
        - Converts to lowercase
        """
        if not text or not isinstance(text, str):
            return ""

        # Unescape HTML entities (&amp;, &lt;, etc.)
        cleaned = html.unescape(text)

        # Remove HTML tags
        cleaned = cls.HTML_PATTERN.sub(' ', cleaned)

        # Replace URLs with placeholder
        cleaned = cls.URL_PATTERN.sub(' httpurl ', cleaned)

        # Remove non-alphanumeric characters except basic whitespace
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', cleaned)

        # Lowercase
        cleaned = cleaned.lower()

        # Collapse whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        return cleaned

    @classmethod
    def find_suspicious_patterns(cls, text: str) -> Tuple[List[str], List[dict]]:
        """
        Identifies suspicious keywords and URL anomalies in the raw email.
        Returns:
            keywords_found: list of matched suspicious terms
            url_anomalies: list of detailed URL risk indicators
        """
        if not text:
            return [], []

        lower_text = text.lower()
        keywords_found = []
        for kw in cls.SUSPICIOUS_KEYWORD_LIST:
            if re.search(r'\b' + re.escape(kw) + r'\b', lower_text):
                keywords_found.append(kw)

        extracted_urls = cls.extract_urls(text)
        url_anomalies = []
        for url in extracted_urls:
            anomaly = {'url': url, 'reasons': []}
            
            # Check for IP address in URL
            if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
                anomaly['reasons'].append('Direct IP address used instead of reputable domain')

            # Check for suspicious top-level domains
            for tld in cls.SUSPICIOUS_TLDS:
                if tld in url.lower():
                    anomaly['reasons'].append(f'Uncommon or high-risk TLD detected ({tld})')
                    break

            # Check for deceptive brand names in subdomain (e.g. paypal-verify.xyz)
            brands = ['paypal', 'microsoft', 'apple', 'google', 'netflix', 'amazon', 'chase', 'fedex', 'dhl']
            for brand in brands:
                if brand in url.lower() and not (url.lower().endswith(f'{brand}.com') or f'{brand}.com/' in url.lower()):
                    anomaly['reasons'].append(f'Brand impersonation indicator for "{brand}"')

            if anomaly['reasons']:
                url_anomalies.append(anomaly)

        return keywords_found, url_anomalies
