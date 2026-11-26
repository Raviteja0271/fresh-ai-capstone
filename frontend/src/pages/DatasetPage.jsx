import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DatasetPage({ onNavigateToModelTraining }) {
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Column Mapping modal states
  const [mappingModal, setMappingModal] = useState(null); // { temp_filename, columns, suggested_text_col, suggested_label_col }
  const [selectedTextCol, setSelectedTextCol] = useState('');
  const [selectedLabelCol, setSelectedLabelCol] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getDatasetStatistics();
      setStats(data.dataset_info);
      setPreview(data.preview || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch dataset info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await ApiService.uploadDataset(file);
      if (res.mapped) {
        setSuccessMsg(`Dataset "${file.name}" uploaded and registered successfully.`);
        await loadData();
      } else {
        // Needs column mapping
        setMappingModal({
          temp_filename: res.temp_filename,
          columns: res.inspection.columns,
          suggested_text_col: res.inspection.suggested_text_col,
          suggested_label_col: res.inspection.suggested_label_col
        });
        setSelectedTextCol(res.inspection.suggested_text_col || res.inspection.columns[0]);
        setSelectedLabelCol(res.inspection.suggested_label_col || res.inspection.columns[1]);
      }
    } catch (err) {
      setError(err.message || 'Upload error.');
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleConfirmMapping = async () => {
    if (!mappingModal || !selectedTextCol || !selectedLabelCol) return;

    setUploading(true);
    setError('');
    try {
      await ApiService.mapAndProcess(
        mappingModal.temp_filename,
        selectedTextCol,
        selectedLabelCol
      );
      setSuccessMsg('Columns mapped and dataset registered successfully.');
      setMappingModal(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to map columns.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await ApiService.loadSampleDataset();
      setSuccessMsg('Synthetic demonstration dataset successfully loaded.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to load synthetic dataset.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Loading dataset information and records..." />;
  }

  return (
    <div>
      {error && (
        <div className="alert-box danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dataset Statistics Grid */}
      <div className="metrics-grid">
        <div className="metric-card navy">
          <div className="metric-info">
            <h3>Total Emails in Dataset</h3>
            <div className="metric-value">{stats?.total_records || 0}</div>
            <div className="metric-caption">File: {stats?.filename || 'None'}</div>
          </div>
          <div className="metric-icon-box navy">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="metric-card red">
          <div className="metric-info">
            <h3>Phishing Examples</h3>
            <div className="metric-value">{stats?.phishing_records || 0}</div>
            <div className="metric-caption">
              {stats?.total_records ? `${Math.round(((stats.phishing_records || 0) / stats.total_records) * 100)}% of dataset` : '0%'}
            </div>
          </div>
          <div className="metric-icon-box red">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="metric-card green">
          <div className="metric-info">
            <h3>Legitimate Examples</h3>
            <div className="metric-value">{stats?.legitimate_records || 0}</div>
            <div className="metric-caption">
              {stats?.total_records ? `${Math.round(((stats.legitimate_records || 0) / stats.total_records) * 100)}% of dataset` : '0%'}
            </div>
          </div>
          <div className="metric-icon-box green">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="metric-card purple">
          <div className="metric-info">
            <h3>Extracted Features</h3>
            <div className="metric-value">{stats?.feature_count || '3,000'}</div>
            <div className="metric-caption">TF-IDF n-grams (1, 2)</div>
          </div>
          <div className="metric-icon-box purple">
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Action / Upload Card */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <UploadCloud size={18} color="#10B981" />
              Upload & Ingest Custom Email Dataset
            </div>
            <div className="card-subtitle">
              Upload custom CSV files containing emails and labels. Automatic or interactive column mapping supported.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleLoadSample}
              disabled={loading || uploading}
              style={{ fontSize: '0.82rem' }}
            >
              <Sparkles size={14} color="#10B981" />
              <span>Reset to Synthetic Demo Dataset</span>
            </button>

            {onNavigateToModelTraining && (
              <button
                className="btn btn-primary"
                onClick={onNavigateToModelTraining}
                style={{ fontSize: '0.82rem' }}
              >
                <Cpu size={14} />
                <span>Train Model From Dataset</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{
          border: '2px dashed #CBD5E1',
          borderRadius: '12px',
          padding: '36px 20px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <UploadCloud size={44} color="#64748B" style={{ marginBottom: '10px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1411' }}>
            Choose a CSV file to upload
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', maxWidth: '500px', margin: '4px auto 16px' }}>
            Supports standard CSVs with columns such as <strong className="mono">email_text</strong> and <strong className="mono">label</strong>, or any custom column headers.
          </p>
          <label className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
            <UploadCloud size={16} />
            <span>Select CSV File</span>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
          {uploading && <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#10B981' }}>Processing file...</div>}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <Database size={18} color="#10B981" />
              Active Dataset Records Preview
            </div>
            <div className="card-subtitle">
              First {preview.length} rows loaded into the preprocessor pipeline
            </div>
          </div>
        </div>

        {preview.length > 0 ? (
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Email Text / Content</th>
                  <th style={{ width: '130px' }}>Label</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    <td className="mono" style={{ color: '#94A3B8' }}>{idx + 1}</td>
                    <td style={{ maxWidth: '650px', lineHeight: 1.5 }}>
                      {row.email_text || row.text || row.body || JSON.stringify(row)}
                    </td>
                    <td>
                      <span className={`badge ${String(row.label).toLowerCase().includes('phish') ? 'badge-phishing' : 'badge-legitimate'}`}>
                        {String(row.label).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            No records found. Click "Reset to Synthetic Demo Dataset" to populate demo records.
          </div>
        )}
      </div>

      {/* Column Mapping Modal */}
      {mappingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F1411' }}>
                Map Dataset Columns
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '18px' }}>
                The uploaded CSV contains custom headers. Please select which columns represent the email text and class label:
              </p>

              <div className="form-group">
                <label className="form-label">Email Text Column *</label>
                <select
                  className="form-select"
                  value={selectedTextCol}
                  onChange={(e) => setSelectedTextCol(e.target.value)}
                >
                  {mappingModal.columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Email Label / Target Column *</label>
                <select
                  className="form-select"
                  value={selectedLabelCol}
                  onChange={(e) => setSelectedLabelCol(e.target.value)}
                >
                  {mappingModal.columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setMappingModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmMapping}
                disabled={uploading}
              >
                Confirm Column Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
