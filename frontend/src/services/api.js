const API_BASE_URL = '/api';

class ApiService {
  static getToken() {
    return localStorage.getItem('fresh_ai_token');
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('fresh_ai_token', token);
    } else {
      localStorage.removeItem('fresh_ai_token');
    }
  }

  static clearToken() {
    localStorage.removeItem('fresh_ai_token');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  static async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  static async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  static async getAuthStatus() {
    return this.request('/auth/status');
  }

  // Dataset Endpoints
  static async uploadDataset(file, textCol = null, labelCol = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (textCol) formData.append('text_col', textCol);
    if (labelCol) formData.append('label_col', labelCol);

    return this.request('/dataset/upload', {
      method: 'POST',
      body: formData
    });
  }

  static async mapAndProcess(tempFilename, textCol, labelCol) {
    return this.request('/dataset/map-and-process', {
      method: 'POST',
      body: JSON.stringify({
        temp_filename: tempFilename,
        text_col: textCol,
        label_col: labelCol
      })
    });
  }

  static async loadSampleDataset() {
    return this.request('/dataset/load-sample', { method: 'POST' });
  }

  static async getDatasetStatistics() {
    return this.request('/dataset/statistics');
  }

  static async getDatasetPreview() {
    return this.request('/dataset/preview');
  }

  // Machine Learning Endpoints
  static async trainModel() {
    return this.request('/model/train', { method: 'POST' });
  }

  static async getModelMetrics() {
    return this.request('/model/metrics');
  }

  static async analyseEmail(payload) {
    return this.request('/email/analyse', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Sender Authentication Endpoints
  static async analyseSender(payload) {
    return this.request('/sender/analyse', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // PGP / Cryptography Endpoints
  static async getPgpStatus() {
    return this.request('/pgp/status');
  }

  static async generatePgpKeys(name, email, passphrase = '', engine = 'auto') {
    return this.request('/pgp/generate-keys', {
      method: 'POST',
      body: JSON.stringify({ name, email, passphrase, engine })
    });
  }

  static async encryptMessage(message, publicKey, recipientEmail = '', engine = 'auto') {
    return this.request('/pgp/encrypt', {
      method: 'POST',
      body: JSON.stringify({
        message,
        public_key: publicKey,
        recipient_email: recipientEmail,
        engine
      })
    });
  }

  static async decryptMessage(encryptedMessage, privateKey, passphrase = '') {
    return this.request('/pgp/decrypt', {
      method: 'POST',
      body: JSON.stringify({
        encrypted_message: encryptedMessage,
        private_key: privateKey,
        passphrase
      })
    });
  }

  static async signMessage(message, privateKey, passphrase = '') {
    return this.request('/pgp/sign', {
      method: 'POST',
      body: JSON.stringify({
        message,
        private_key: privateKey,
        passphrase
      })
    });
  }

  static async verifyMessage(signedMessage, publicKey) {
    return this.request('/pgp/verify', {
      method: 'POST',
      body: JSON.stringify({
        signed_message: signedMessage,
        public_key: publicKey
      })
    });
  }

  static async checkIntegrity(content, expectedHash = '') {
    return this.request('/pgp/integrity-check', {
      method: 'POST',
      body: JSON.stringify({
        content,
        expected_hash: expectedHash
      })
    });
  }

  // Dashboard Endpoints
  static async getDashboardStatistics() {
    return this.request('/dashboard/statistics');
  }

  static async getDashboardTrends() {
    return this.request('/dashboard/trends');
  }

  // History Endpoints
  static async getHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/history${query ? `?${query}` : ''}`);
  }

  static async getHistoryDetail(id) {
    return this.request(`/history/${id}`);
  }

  static async deleteHistoryRecord(id) {
    return this.request(`/history/${id}`, { method: 'DELETE' });
  }

  // Alert Endpoints
  static async getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/alerts${query ? `?${query}` : ''}`);
  }

  static async reviewAlert(id) {
    return this.request(`/alerts/${id}/review`, { method: 'PUT' });
  }

  static async deleteAlert(id) {
    return this.request(`/alerts/${id}`, { method: 'DELETE' });
  }
}

export default ApiService;
