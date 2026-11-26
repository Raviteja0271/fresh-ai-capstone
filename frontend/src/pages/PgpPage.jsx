import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Hash,
  Terminal
} from 'lucide-react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PgpPage() {
  const [activeTab, setActiveTab] = useState('keygen'); // 'keygen', 'encrypt', 'decrypt', 'sign-verify', 'integrity'
  const [gpgStatus, setGpgStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Keygen states
  const [name, setName] = useState('Alice Security');
  const [email, setEmail] = useState('alice@freshai.org');
  const [passphrase, setPassphrase] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState(null);
  const [keygenLoading, setKeygenLoading] = useState(false);
  const [keygenError, setKeygenError] = useState('');

  // Encrypt states
  const [plainMessage, setPlainMessage] = useState('Confidential Capstone Project Intel: Project defense scheduled for 10:00 AM.');
  const [recipientPubKey, setRecipientPubKey] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptError, setEncryptError] = useState('');

  // Decrypt states
  const [cipherInput, setCipherInput] = useState('');
  const [privKeyInput, setPrivKeyInput] = useState('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptError, setDecryptError] = useState('');

  // Sign & Verify states
  const [signMessageText, setSignMessageText] = useState('This is an authentic official email security bulletin issued by FRESH AI.');
  const [signedOutput, setSignedOutput] = useState('');
  const [verifyPubKey, setVerifyPubKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [signLoading, setSignLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [signError, setSignError] = useState('');

  // Integrity Check states
  const [integrityContent, setIntegrityContent] = useState('Secure communication packet payload.');
  const [expectedHash, setExpectedHash] = useState('');
  const [integrityResult, setIntegrityResult] = useState(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await ApiService.getPgpStatus();
        setGpgStatus(res);
      } catch (err) {
        console.error('Failed to get GnuPG status:', err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKeys = async (e) => {
    e.preventDefault();
    setKeygenLoading(true);
    setKeygenError('');
    setGeneratedKeys(null);

    try {
      const res = await ApiService.generatePgpKeys(name, email, passphrase);
      setGeneratedKeys(res);
      // Automatically populate inputs for smooth demo workflow
      setRecipientPubKey(res.public_key);
      setPrivKeyInput(res.private_key);
      setVerifyPubKey(res.public_key);
      setDecryptPassphrase(passphrase);
    } catch (err) {
      setKeygenError(err.message || 'Key generation failed.');
    } finally {
      setKeygenLoading(false);
    }
  };

  const handleEncrypt = async (e) => {
    e.preventDefault();
    setEncryptLoading(true);
    setEncryptError('');
    setEncryptedOutput('');

    try {
      const res = await ApiService.encryptMessage(plainMessage, recipientPubKey);
      setEncryptedOutput(res.encrypted_message);
      setCipherInput(res.encrypted_message);
    } catch (err) {
      setEncryptError(err.message || 'Encryption failed.');
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleDecrypt = async (e) => {
    e.preventDefault();
    setDecryptLoading(true);
    setDecryptError('');
    setDecryptedOutput('');

    try {
      const res = await ApiService.decryptMessage(cipherInput, privKeyInput, decryptPassphrase);
      setDecryptedOutput(res.decrypted_message);
    } catch (err) {
      setDecryptError(err.message || 'Decryption failed.');
    } finally {
      setDecryptLoading(false);
    }
  };

  const handleSign = async () => {
    if (!privKeyInput) {
      setSignError('Private key is required to sign this message. Generate or import one in the Keygen tab.');
      return;
    }

    setSignLoading(true);
    setSignError('');
    try {
      const res = await ApiService.signMessage(signMessageText, privKeyInput, decryptPassphrase);
      setSignedOutput(res.signed_message);
    } catch (err) {
      setSignError(err.message || 'Signing failed.');
    } finally {
      setSignLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signedOutput || !verifyPubKey) {
      setSignError('Both signed message and signer public key are required for verification.');
      return;
    }

    setVerifyLoading(true);
    setSignError('');
    setVerifyResult(null);

    try {
      const res = await ApiService.verifyMessage(signedOutput, verifyPubKey);
      setVerifyResult(res);
    } catch (err) {
      setSignError(err.message || 'Signature verification failed.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCheckIntegrity = async (e) => {
    e.preventDefault();
    setIntegrityLoading(true);
    try {
      const res = await ApiService.checkIntegrity(integrityContent, expectedHash);
      setIntegrityResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIntegrityLoading(false);
    }
  };

  return (
    <div>
      {/* System GnuPG Environment Status Banner */}
      <div className="card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: gpgStatus?.available ? '#E8F7EE' : '#F4F8F5',
              color: gpgStatus?.available ? '#059669' : '#10B981'
            }}>
              <Terminal size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1411' }}>
                  Cryptographic Subsystem Status:
                </span>
                <span className={`badge ${gpgStatus?.available ? 'badge-low' : 'badge-neutral'}`}>
                  {gpgStatus?.available ? 'Native GnuPG Active' : 'Python Cryptography Active'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6B7C72', marginTop: '4px', maxWidth: '850px', lineHeight: 1.5 }}>
                {gpgStatus?.instructions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'keygen' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('keygen')}
          style={{ fontSize: '0.84rem' }}
        >
          <KeyRound size={16} />
          <span>1. Key Generation & Management</span>
        </button>

        <button
          className={`btn ${activeTab === 'encrypt' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('encrypt')}
          style={{ fontSize: '0.84rem' }}
        >
          <Lock size={16} />
          <span>2. Asymmetric Encryption</span>
        </button>

        <button
          className={`btn ${activeTab === 'decrypt' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('decrypt')}
          style={{ fontSize: '0.84rem' }}
        >
          <Unlock size={16} />
          <span>3. Message Decryption</span>
        </button>

        <button
          className={`btn ${activeTab === 'sign-verify' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sign-verify')}
          style={{ fontSize: '0.84rem' }}
        >
          <FileCheck size={16} />
          <span>4. Digital Signature & Verification</span>
        </button>

        <button
          className={`btn ${activeTab === 'integrity' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('integrity')}
          style={{ fontSize: '0.84rem' }}
        >
          <Hash size={16} />
          <span>5. SHA-256 Integrity Checker</span>
        </button>
      </div>

      {/* TAB 1: KEY GENERATION */}
      {activeTab === 'keygen' && (
        <div className="grid-2">
          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <KeyRound size={18} color="#10B981" />
                  Generate OpenPGP / RSA-2048 Keypair
                </div>
                <div className="card-subtitle">Generate asymmetric public/private keys with optional passphrase protection</div>
              </div>
            </div>

            {keygenError && (
              <div className="alert-box danger">
                <AlertTriangle size={18} />
                <span>{keygenError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateKeys}>
              <div className="form-group">
                <label className="form-label">Full Name / Key Identifier *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Security Officer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alice@freshai.org"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passphrase (Optional)</label>
                <input
                  type="password"
                  className="form-input"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter a secure passphrase to protect the private key"
                />
              </div>

              <div className="alert-box info" style={{ fontSize: '0.78rem' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  Security Notice: Private keys and passphrases are never stored in the database or server logs.
                  Make sure to copy and save your private key locally.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={keygenLoading}
                style={{ width: '100%', padding: '12px' }}
              >
                {keygenLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <KeyRound size={16} />}
                <span>{keygenLoading ? 'Computing 2048-bit Prime Numbers...' : 'Generate Keypair'}</span>
              </button>
            </form>
          </div>

          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <ShieldCheck size={18} color="#10B981" />
                  Generated Cryptographic Keys
                </div>
                <div className="card-subtitle">Public key for distribution; private key for local retention</div>
              </div>
            </div>

            {generatedKeys ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Public Key (Share Freely):</label>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCopy(generatedKeys.public_key, 'pub')}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {copiedKey === 'pub' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'pub' ? 'Copied!' : 'Copy Public Key'}</span>
                    </button>
                  </div>
                  <textarea
                    className="form-textarea mono"
                    rows={6}
                    readOnly
                    value={generatedKeys.public_key}
                    style={{ fontSize: '0.75rem', background: '#F4F8F5' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0, color: '#DC2626' }}>
                      Private Key (Confidential - Do Not Share!):
                    </label>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCopy(generatedKeys.private_key, 'priv')}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {copiedKey === 'priv' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'priv' ? 'Copied!' : 'Copy Private Key'}</span>
                    </button>
                  </div>
                  <textarea
                    className="form-textarea mono"
                    rows={6}
                    readOnly
                    value={generatedKeys.private_key}
                    style={{ fontSize: '0.75rem', background: '#FFF1F2' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7D8E84' }}>
                <KeyRound size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontWeight: 500 }}>No keys generated yet</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Click "Generate Keypair" to initialize your cryptographic identity.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENCRYPTION */}
      {activeTab === 'encrypt' && (
        <div className="grid-2">
          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <Lock size={18} color="#10B981" />
                  Encrypt Outbound Message
                </div>
                <div className="card-subtitle">Protect content using recipient's public key (RSA-OAEP / SHA-256)</div>
              </div>
            </div>

            {encryptError && (
              <div className="alert-box danger">
                <AlertTriangle size={18} />
                <span>{encryptError}</span>
              </div>
            )}

            <form onSubmit={handleEncrypt}>
              <div className="form-group">
                <label className="form-label">Plaintext Secret Message *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={plainMessage}
                  onChange={(e) => setPlainMessage(e.target.value)}
                  placeholder="Enter message to encrypt..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient's Armored Public Key *</label>
                <textarea
                  className="form-textarea mono"
                  rows={6}
                  value={recipientPubKey}
                  onChange={(e) => setRecipientPubKey(e.target.value)}
                  placeholder="Paste recipient's -----BEGIN PUBLIC KEY----- block here..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={encryptLoading}
                style={{ width: '100%', padding: '12px' }}
              >
                {encryptLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Lock size={16} />}
                <span>{encryptLoading ? 'Encrypting Payload...' : 'Encrypt Message with Public Key'}</span>
              </button>
            </form>
          </div>

          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <ShieldAlert size={18} color="#10B981" />
                  Armored Ciphertext Output
                </div>
                <div className="card-subtitle">Encrypted ciphertext safe for unauthenticated email transit</div>
              </div>
              {encryptedOutput && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCopy(encryptedOutput, 'cipher')}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  {copiedKey === 'cipher' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copiedKey === 'cipher' ? 'Copied!' : 'Copy Ciphertext'}</span>
                </button>
              )}
            </div>

            {encryptedOutput ? (
              <div>
                <textarea
                  className="form-textarea mono"
                  rows={14}
                  readOnly
                  value={encryptedOutput}
                  style={{ fontSize: '0.78rem', background: '#F4F8F5' }}
                />
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#065F46', background: '#E8F7EE', padding: '10px 14px', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} />
                  <span>Only the holder of the corresponding private key can decrypt this message.</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7D8E84' }}>
                <Lock size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontWeight: 500 }}>No encrypted message yet</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Provide a message and recipient public key, then click "Encrypt Message".
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DECRYPTION */}
      {activeTab === 'decrypt' && (
        <div className="grid-2">
          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <Unlock size={18} color="#10B981" />
                  Decrypt Inbound Message
                </div>
                <div className="card-subtitle">Decrypt payload using your private key and passphrase</div>
              </div>
            </div>

            {decryptError && (
              <div className="alert-box danger">
                <AlertTriangle size={18} />
                <span>{decryptError}</span>
              </div>
            )}

            <form onSubmit={handleDecrypt}>
              <div className="form-group">
                <label className="form-label">Armored Encrypted Message *</label>
                <textarea
                  className="form-textarea mono"
                  rows={5}
                  value={cipherInput}
                  onChange={(e) => setCipherInput(e.target.value)}
                  placeholder="Paste -----BEGIN FRESH AI ENCRYPTED MESSAGE----- block here..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Private Key *</label>
                <textarea
                  className="form-textarea mono"
                  rows={6}
                  value={privKeyInput}
                  onChange={(e) => setPrivKeyInput(e.target.value)}
                  placeholder="Paste your -----BEGIN ENCRYPTED PRIVATE KEY----- here..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Private Key Passphrase (If set)</label>
                <input
                  type="password"
                  className="form-input"
                  value={decryptPassphrase}
                  onChange={(e) => setDecryptPassphrase(e.target.value)}
                  placeholder="Enter passphrase to unlock private key"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={decryptLoading}
                style={{ width: '100%', padding: '12px' }}
              >
                {decryptLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Unlock size={16} />}
                <span>{decryptLoading ? 'Decrypting...' : 'Decrypt Message'}</span>
              </button>
            </form>
          </div>

          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <ShieldCheck size={18} color="#10B981" />
                  Decrypted Original Message
                </div>
                <div className="card-subtitle">Restored confidential plaintext</div>
              </div>
            </div>

            {decryptedOutput ? (
              <div>
                <div style={{
                  padding: '16px',
                  background: '#E8F7EE',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
                  marginBottom: '16px',
                  fontSize: '0.95rem',
                  color: '#065F46',
                  fontWeight: 500,
                  lineHeight: 1.6
                }}>
                  {decryptedOutput}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7C72' }}>
                  Decryption completed successfully using cryptographic RSA-OAEP engine.
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7D8E84' }}>
                <Unlock size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontWeight: 500 }}>No decrypted content yet</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Paste the ciphertext and your private key on the left to reveal original message.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SIGN & VERIFY */}
      {activeTab === 'sign-verify' && (
        <div className="grid-2">
          {/* Sign Section */}
          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <FileCheck size={18} color="#10B981" />
                  Digital Message Signing
                </div>
                <div className="card-subtitle">Sign plaintext using private key (RSA-PSS / SHA-256)</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message to Sign</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={signMessageText}
                onChange={(e) => setSignMessageText(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSign}
              disabled={signLoading}
              style={{ width: '100%', padding: '10px' }}
            >
              {signLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <FileCheck size={16} />}
              <span>Digitally Sign Message</span>
            </button>

            {signedOutput && (
              <div style={{ marginTop: '16px' }}>
                <label className="form-label">Armored Signed Message:</label>
                <textarea
                  className="form-textarea mono"
                  rows={6}
                  readOnly
                  value={signedOutput}
                  style={{ fontSize: '0.75rem', background: '#F4F8F5' }}
                />
              </div>
            )}
          </div>

          {/* Verify Section */}
          <div className="card-panel">
            <div className="card-panel-header">
              <div>
                <div className="card-title">
                  <ShieldCheck size={18} color="#10B981" />
                  Verify Digital Signature
                </div>
                <div className="card-subtitle">Prove sender authenticity and guarantee zero tampering</div>
              </div>
            </div>

            {signError && (
              <div className="alert-box danger">
                <AlertTriangle size={18} />
                <span>{signError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Signer's Public Key</label>
              <textarea
                className="form-textarea mono"
                rows={4}
                value={verifyPubKey}
                onChange={(e) => setVerifyPubKey(e.target.value)}
                placeholder="Paste signer public key..."
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleVerify}
              disabled={verifyLoading}
              style={{ width: '100%', padding: '10px' }}
            >
              {verifyLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <ShieldCheck size={16} />}
              <span>Verify Signature Integrity</span>
            </button>

            {verifyResult && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: verifyResult.is_valid ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${verifyResult.is_valid ? '#BBF7D0' : '#FECACA'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: verifyResult.is_valid ? '#166534' : '#991B1B' }}>
                  {verifyResult.is_valid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span>{verifyResult.status}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                  {verifyResult.details}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: INTEGRITY CHECKER */}
      {activeTab === 'integrity' && (
        <div className="card-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <Hash size={18} color="#10B981" />
                Cryptographic SHA-256 Integrity Verification
              </div>
              <div className="card-subtitle">Generate SHA-256 digest or compare with expected checksum to detect unauthorized tampering</div>
            </div>
          </div>

          <form onSubmit={handleCheckIntegrity}>
            <div className="form-group">
              <label className="form-label">Content / Message to Hash *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={integrityContent}
                onChange={(e) => setIntegrityContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected SHA-256 Hash Digest (Optional - for comparison)</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={integrityLoading}
              style={{ width: '100%', padding: '12px' }}
            >
              <Hash size={16} />
              <span>Compute SHA-256 Hash Digest</span>
            </button>
          </form>

          {integrityResult && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                COMPUTED SHA-256 DIGEST:
              </div>
              <div className="mono" style={{ fontSize: '0.85rem', color: '#0F1411', wordBreak: 'break-all', fontWeight: 600 }}>
                {integrityResult.sha256 || integrityResult.computed_hash}
              </div>

              {integrityResult.status && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: integrityResult.is_valid ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${integrityResult.is_valid ? '#BBF7D0' : '#FECACA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: integrityResult.is_valid ? '#166534' : '#991B1B'
                }}>
                  {integrityResult.is_valid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>
                    {integrityResult.is_valid ? 'Integrity Verified: Expected and computed hashes match perfectly!' : 'Integrity Failure: Hashes do not match! Content was modified or expected hash differs.'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
