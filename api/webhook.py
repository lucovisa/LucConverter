import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

TOKEN = os.environ.get('TELEGRAM_TOKEN')
BASE_URL = f'https://api.telegram.org/bot{TOKEN}'
VERCEL_URL = os.environ.get('VERCEL_URL', 'converter-ashy-kappa.vercel.app')
DOWNLOAD_DIR = '/tmp/downloads'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/api/webhook', methods=['POST'])
def webhook():
    update = request.json
    
    if 'message' in update and 'document' in update['message']:
        message = update['message']
        chat_id = message['chat']['id']
        document = message['document']
        file_name = document.get('file_name', 'file')
        target_format = None
        unique_id = None
        
        if 'caption' in message and message['caption']:
            caption_parts = message['caption'].split('|')
            target_format = caption_parts[0].lower().strip()
            if len(caption_parts) > 1:
                unique_id = caption_parts[1].strip()
        
        file_id = document['file_id']
        file_path = get_file_path(file_id)
        file_content = download_file(file_path)
        
        result = convert_file(file_content, file_name, target_format)
        
        if result and unique_id:
            download_id = unique_id
            download_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.{result["extension"]}')
            meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
            
            with open(download_path, 'wb') as f:
                f.write(result['content'])
            
            meta = {
                'filename': result['filename'],
                'created': time.time(),
                'downloaded': False,
                'download_url': f'https://{VERCEL_URL}/api/download/{download_id}'
            }
            
            with open(meta_path, 'w') as f:
                json.dump(meta, f)
            
            send_message(chat_id, f"File converted: {file_name}")
        elif result:
            download_id = str(uuid.uuid4())
            download_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.{result["extension"]}')
            meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
            
            with open(download_path, 'wb') as f:
                f.write(result['content'])
            
            meta = {
                'filename': result['filename'],
                'created': time.time(),
                'downloaded': False,
                'download_url': f'https://{VERCEL_URL}/api/download/{download_id}'
            }
            
            with open(meta_path, 'w') as f:
                json.dump(meta, f)
            
            send_message(chat_id, f"Done! Download: {meta['download_url']}")
    
    return 'OK', 200

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

def convert_file(file_content, file_name, target_format=None):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if target_format and target_format.startswith('.'):
            target_format = target_format[1:]
        
        if extension == '.rar' and target_format in ['zip', None]:
            return convert_rar_to_zip(file_content, file_name)
        
        if extension == '.7z' and target_format in ['zip', None]:
            return convert_7z_to_zip(file_content, file_name)
        
        if target_format in ['zip', None]:
            return convert_to_zip(file_content, file_name)
        
        if target_format in ['7z']:
            return convert_to_7z(file_content, file_name)
        
        if target_format in ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'gif'] and extension in ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.ico', '.gif']:
            return convert_image(file_content, file_name, target_format)
        
        if target_format == 'txt' and extension == '.pdf':
            return convert_pdf_to_txt(file_content, file_name)
        
        if target_format in ['csv', 'json'] and extension in ['.xlsx', '.xls']:
            return convert_xlsx(file_content, file_name, target_format)
        
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

def convert_to_7z(file_content, file_name):
    try:
        import py7zr
        
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix='.tmp')
        tmp_path.write(file_content)
        tmp_path.close()
        
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.7z')
        zip_buffer.close()
        
        with py7zr.SevenZipFile(zip_buffer.name, 'w') as z:
            z.write(tmp_path.name, file_name)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path.name)
        os.remove(zip_buffer.name)
        
        return {
            'content': content,
            'filename': file_name + '.7z',
            'extension': '7z'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_image(file_content, file_name, target_format):
    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(file_content))
        
        output_buffer = io.BytesIO()
        
        if target_format in ['jpg', 'jpeg']:
            img.convert('RGB').save(output_buffer, format='JPEG')
        elif target_format == 'png':
            img.save(output_buffer, format='PNG')
        elif target_format == 'webp':
            img.save(output_buffer, format='WEBP')
        elif target_format == 'bmp':
            img.save(output_buffer, format='BMP')
        elif target_format == 'ico':
            img.save(output_buffer, format='ICO')
        elif target_format == 'gif':
            img.save(output_buffer, format='GIF')
        
        return {
            'content': output_buffer.getvalue(),
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_pdf_to_txt(file_content, file_name):
    try:
        from PyPDF2 import PdfReader
        import io
        
        pdf = PdfReader(io.BytesIO(file_content))
        text = ''
        for page in pdf.pages:
            text += page.extract_text() + '\n\n'
        
        return {
            'content': text.encode('utf-8'),
            'filename': file_name.replace('.pdf', '.txt'),
            'extension': 'txt'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_xlsx(file_content, file_name, target_format):
    try:
        import pandas as pd
        import io
        
        df = pd.read_excel(io.BytesIO(file_content))
        
        if target_format == 'csv':
            content = df.to_csv(index=False).encode('utf-8')
        elif target_format == 'json':
            content = df.to_json(orient='records').encode('utf-8')
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_file_path(file_id):
    response = requests.get(f'{BASE_URL}/getFile', params={'file_id': file_id})
    return response.json()['result']['file_path']

def download_file(file_path):
    response = requests.get(f'https://api.telegram.org/file/bot{TOKEN}/{file_path}')
    return response.content

def send_message(chat_id, text):
    requests.post(f'{BASE_URL}/sendMessage', json={'chat_id': chat_id, 'text': text})

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))