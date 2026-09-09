import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
import subprocess
from flask import Flask, request, jsonify, send_file
from io import BytesIO

app = Flask(__name__)

TOKEN = os.environ.get('TELEGRAM_TOKEN')
BASE_URL = f'https://api.telegram.org/bot{TOKEN}'
VERCEL_URL = 'converter-ashy-kappa.vercel.app'

files_in_memory = {}

@app.route('/api/download', methods=['POST'])
def download_webhook():
    return webhook()

@app.route('/api/webhook', methods=['POST'])
def webhook():
    update = request.json
    
    if 'message' in update and 'text' in update['message']:
        chat_id = update['message']['chat']['id']
        text = update['message']['text']
        
        if text.startswith('/start'):
            send_message(chat_id, "Send me a file")
        else:
            send_message(chat_id, "Send me a file to convert")
    
    elif 'message' in update and 'document' in update['message']:
        message = update['message']
        chat_id = message['chat']['id']
        document = message['document']
        file_name = document.get('file_name', 'file')
        file_id = document.get('file_id')
        
        if not file_id:
            send_message(chat_id, "No file ID")
            return 'OK', 200
        
        send_message(chat_id, f"Receiving {file_name}...")
        
        file_path = get_file_path(file_id)
        
        if not file_path:
            send_message(chat_id, "Failed to get file")
            return 'OK', 200
        
        file_content = download_file(file_path)
        
        send_message(chat_id, "Converting...")
        
        result = convert_file(file_content, file_name, None)
        
        if result:
            download_id = str(uuid.uuid4())
            
            files_in_memory[download_id] = {
                'content': result['content'],
                'filename': result['filename'],
                'extension': result['extension'],
                'created': time.time(),
                'downloaded': False
            }
            
            download_url = f'https://{VERCEL_URL}/api/download/{download_id}'
            
            send_message(chat_id, f"Done! Download: {download_url}")
        else:
            send_message(chat_id, "Failed to convert")
    
    return 'OK', 200

@app.route('/api/download/<download_id>', methods=['GET'])
def download(download_id):
    if download_id not in files_in_memory:
        return 'Link invalid', 404
    
    file_info = files_in_memory[download_id]
    
    if file_info['downloaded']:
        return 'Link already used', 403
    
    if time.time() - file_info['created'] > 3600:
        del files_in_memory[download_id]
        return 'Link expired', 410
    
    file_info['downloaded'] = True
    
    return send_file(
        BytesIO(file_info['content']),
        as_attachment=True,
        download_name=file_info['filename'],
        mimetype='application/octet-stream'
    )

def convert_file(file_content, file_name, target_format=None):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if extension == '.rar' and target_format in ['zip', None]:
            return convert_rar_to_zip(file_content, file_name)
        
        if extension == '.7z' and target_format in ['zip', None]:
            return convert_7z_to_zip(file_content, file_name)
        
        if target_format in ['zip', None]:
            return convert_to_zip(file_content, file_name)
        
        return None
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_rar_to_zip(file_content, file_name):
    try:
        import rarfile
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.rar')
        tmp_path.write(file_content)
        tmp_path.close()
        
        extract_dir = tempfile.mkdtemp()
        
        with rarfile.RarFile(tmp_path.name) as rf:
            rf.extractall(extract_dir)
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, extract_dir)
                    zipf.write(file_path, arcname)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        import shutil
        shutil.rmtree(extract_dir)
        
        return {
            'content': content,
            'filename': file_name.replace('.rar', '.zip'),
            'extension': 'zip'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_7z_to_zip(file_content, file_name):
    try:
        import py7zr
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.7z')
        tmp_path.write(file_content)
        tmp_path.close()
        
        extract_dir = tempfile.mkdtemp()
        
        with py7zr.SevenZipFile(tmp_path.name, 'r') as z:
            z.extractall(extract_dir)
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    file_path = os.path.join(root, f)
                    arcname = os.path.relpath(file_path, extract_dir)
                    zipf.write(file_path, arcname)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        import shutil
        shutil.rmtree(extract_dir)
        
        return {
            'content': content,
            'filename': file_name.replace('.7z', '.zip'),
            'extension': 'zip'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_zip(file_content, file_name):
    try:
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr(file_name, file_content)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(zip_buffer.name)
        
        return {
            'content': content,
            'filename': file_name + '.zip',
            'extension': 'zip'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_file_path(file_id):
    try:
        response = requests.get(f'{BASE_URL}/getFile', params={'file_id': file_id})
        data = response.json()
        
        if 'result' not in data:
            print(f"Telegram API error: {data}")
            return None
        
        return data['result']['file_path']
    except Exception as e:
        print(f"Error: {e}")
        return None

def download_file(file_path):
    response = requests.get(f'https://api.telegram.org/file/bot{TOKEN}/{file_path}')
    return response.content

def send_message(chat_id, text):
    try:
        response = requests.post(f'{BASE_URL}/sendMessage', json={'chat_id': chat_id, 'text': text})
        print(f"Send message: {response.json()}")
    except Exception as e:
        print(f"Send message error: {e}")

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))