import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..services.dataset_service import DatasetService

dataset_bp = Blueprint('dataset', __name__)

@dataset_bp.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request.'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    filename = secure_filename(file.filename)
    if not (filename.endswith('.csv') or filename.endswith('.txt')):
        return jsonify({'error': 'Invalid file format. Only CSV files are allowed.'}), 400

    upload_folder = current_app.config['UPLOAD_FOLDER']
    upload_folder.mkdir(parents=True, exist_ok=True)
    temp_path = upload_folder / f"temp_{filename}"
    file.save(temp_path)

    try:
        inspection = DatasetService.inspect_file(temp_path)
        
        # Check if text_col and label_col are supplied in form-data
        text_col = request.form.get('text_col')
        label_col = request.form.get('label_col')

        # If both columns are explicitly specified or default columns exist, process immediately
        cols_lower = [c.lower() for c in inspection['columns']]
        if (text_col and label_col) or ('email_text' in cols_lower and 'label' in cols_lower):
            target_text_col = text_col or ('email_text' if 'email_text' in inspection['columns'] else [c for c in inspection['columns'] if c.lower() == 'email_text'][0])
            target_label_col = label_col or ('label' if 'label' in inspection['columns'] else [c for c in inspection['columns'] if c.lower() == 'label'][0])
            
            result = DatasetService.process_and_register_dataset(
                filepath=temp_path,
                filename=filename,
                text_col=target_text_col,
                label_col=target_label_col
            )
            # Remove temporary raw file
            if temp_path.exists():
                temp_path.unlink()

            return jsonify({
                'mapped': True,
                'result': result
            }), 200

        # Otherwise, return columns to allow user mapping in UI
        return jsonify({
            'mapped': False,
            'temp_filename': f"temp_{filename}",
            'filename': filename,
            'inspection': inspection,
            'message': 'Columns identified. Please confirm or map the text and label columns.'
        }), 200

    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        return jsonify({'error': f"Failed to process dataset: {str(e)}"}), 500

@dataset_bp.route('/map-and-process', methods=['POST'])
def map_and_process():
    data = request.get_json() or {}
    temp_filename = data.get('temp_filename')
    text_col = data.get('text_col')
    label_col = data.get('label_col')

    if not temp_filename or not text_col or not label_col:
        return jsonify({'error': 'temp_filename, text_col, and label_col are required.'}), 400

    temp_path = current_app.config['UPLOAD_FOLDER'] / secure_filename(temp_filename)
    if not temp_path.exists():
        return jsonify({'error': 'Uploaded file has expired or was not found. Please upload again.'}), 404

    try:
        clean_original_name = temp_filename.replace('temp_', '')
        result = DatasetService.process_and_register_dataset(
            filepath=temp_path,
            filename=clean_original_name,
            text_col=text_col,
            label_col=label_col
        )
        if temp_path.exists():
            temp_path.unlink()

        return jsonify({
            'mapped': True,
            'result': result
        }), 200
    except Exception as e:
        return jsonify({'error': f"Mapping error: {str(e)}"}), 500

@dataset_bp.route('/load-sample', methods=['POST'])
def load_sample():
    try:
        result = DatasetService.load_synthetic_sample()
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Synthetic demonstration dataset successfully loaded.'
        }), 200
    except Exception as e:
        return jsonify({'error': f"Error loading sample dataset: {str(e)}"}), 500

@dataset_bp.route('/statistics', methods=['GET'])
def get_statistics():
    stats = DatasetService.get_current_statistics()
    return jsonify(stats), 200

@dataset_bp.route('/preview', methods=['GET'])
def get_preview():
    stats = DatasetService.get_current_statistics()
    return jsonify({
        'preview': stats.get('preview', []),
        'dataset_info': stats.get('dataset_info', None)
    }), 200
