import os
import json
import time
from flask import Flask, jsonify, send_file

app = Flask(__name__)

DOWNLOAD_DIR = '/tmp/downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/api/download/<download_id>', methods=['GET'])
def download(download_id):
    download_path = None
    meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
    
    for ext in ['zip', '7z', 'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'mp4', 'webm', 'avi', 'mov', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'ico', 'txt', 'pdf', 'csv', 'json', 'html', 'stl', 'obj']:
        if os.path.exists(os.path.join(DOWNLOAD_DIR, f'{download_id}.{ext}')):
            download_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.{ext}')
            break
    
    if not download_path or not os.path.exists(download_path) or not os.path.exists(meta_path):
        return 'Link invalid', 404
    
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    
    if meta.get('downloaded', False):
        return 'Link already used', 403
    
    if time.time() - meta.get('created', 0) > 3600:
        try:
            os.remove(download_path)
            os.remove(meta_path)
        except:
            pass
        return 'Link expired', 410
    
    meta['downloaded'] = True
    with open(meta_path, 'w') as f:
        json.dump(meta, f)
    
    try:
        return send_file(
            download_path,
            as_attachment=True,
            download_name=meta['filename']
        )
    finally:
        try:
            os.remove(download_path)
            os.remove(meta_path)
        except:
            pass

@app.route('/api/status/<download_id>', methods=['GET'])
def status(download_id):
    meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
    
    if not os.path.exists(meta_path):
        return jsonify({'status': 'not_found'}), 404
    
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    
    if meta.get('downloaded', False):
        return jsonify({'status': 'used'})
    
    if time.time() - meta.get('created', 0) > 3600:
        return jsonify({'status': 'expired'})
    
    return jsonify({'status': 'ready', 'filename': meta['filename']})

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))