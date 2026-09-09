import os
import json
import time
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

TOKEN = os.environ.get('TELEGRAM_TOKEN')
CHAT_ID = os.environ.get('CHAT_ID')
BASE_URL = f'https://api.telegram.org/bot{TOKEN}'
VERCEL_URL = os.environ.get('VERCEL_URL', 'converter-ashy-kappa.vercel.app')
DOWNLOAD_DIR = '/tmp/downloads'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/api/send-to-bot', methods=['POST'])
def send_to_bot():
    try:
        file = request.files['file']
        format = request.form.get('format', 'zip')
        unique_id = request.form.get('uniqueId', '')
        
        if not file or not unique_id:
            return jsonify({'ok': False, 'error': 'Missing file or uniqueId'}), 400
        
        files = {
            'document': (file.filename, file.read())
        }
        data = {
            'chat_id': CHAT_ID,
            'caption': f'{format}|{unique_id}'
        }
        
        response = requests.post(f'{BASE_URL}/sendDocument', data=data, files=files)
        result = response.json()
        
        if result.get('ok'):
            return jsonify({'ok': True, 'uniqueId': unique_id})
        else:
            return jsonify({'ok': False, 'error': result}), 500
    
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/status/<unique_id>', methods=['GET'])
def status(unique_id):
    meta_path = os.path.join(DOWNLOAD_DIR, f'{unique_id}.json')
    
    if not os.path.exists(meta_path):
        return jsonify({'status': 'processing'})
    
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    
    if meta.get('downloaded', False):
        return jsonify({'status': 'used'})
    
    if time.time() - meta.get('created', 0) > 3600:
        return jsonify({'status': 'expired'})
    
    return jsonify({
        'status': 'ready',
        'filename': meta['filename'],
        'download_url': meta['download_url']
    })

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))