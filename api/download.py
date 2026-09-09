import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
import subprocess
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

TOKEN = os.environ.get('TELEGRAM_TOKEN')
BASE_URL = f'https://api.telegram.org/bot{TOKEN}'
VERCEL_URL = 'converter-ashy-kappa.vercel.app'
DOWNLOAD_DIR = '/tmp/downloads'

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

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
            send_message(chat_id, "Send me a file with caption = target format (e.g. mp3, jpg, zip)")
        else:
            send_message(chat_id, "Send me a file to convert")
    
    elif 'message' in update and 'document' in update['message']:
        message = update['message']
        chat_id = message['chat']['id']
        document = message['document']
        file_name = document.get('file_name', 'file')
        file_id = document.get('file_id')
        target_format = None
        
        if 'caption' in message and message['caption']:
            target_format = message['caption'].lower().strip().split('|')[0]
        
        if not file_id:
            send_message(chat_id, "No file ID")
            return 'OK', 200
        
        send_message(chat_id, f"Receiving {file_name}...")
        
        file_path = get_file_path(file_id)
        
        if not file_path:
            send_message(chat_id, "Failed to get file")
            return 'OK', 200
        
        file_content = download_file(file_path)
        
        send_message(chat_id, f"Converting to {target_format if target_format else 'ZIP'}...")
        
        result = convert_file(file_content, file_name, target_format)
        
        if result:
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
        else:
            send_message(chat_id, "Failed to convert")
    
    return 'OK', 200

@app.route('/api/download/<download_id>', methods=['GET'])
def download(download_id):
    download_path = None
    meta_path = os.path.join(DOWNLOAD_DIR, f'{download_id}.json')
    
    for ext in ['zip', '7z', 'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'mp4', 'webm', 'avi', 'mov', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'ico', 'svg', 'txt', 'pdf', 'csv', 'json', 'html', 'stl', 'obj']:
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
        
        if target_format == '7z':
            return convert_to_7z(file_content, file_name)
        
        if target_format in ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'gif', 'svg'] and extension in ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.ico', '.gif', '.svg']:
            return convert_image(file_content, file_name, target_format)
        
        if target_format == 'txt' and extension == '.pdf':
            return convert_pdf_to_txt(file_content, file_name)
        
        if target_format in ['jpg', 'png'] and extension == '.pdf':
            return convert_pdf_to_image(file_content, file_name, target_format)
        
        if target_format in ['csv', 'json'] and extension in ['.xlsx', '.xls']:
            return convert_xlsx(file_content, file_name, target_format)
        
        if target_format in ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video_to_audio(file_content, file_name, target_format)
        
        if target_format in ['jpg', 'png'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video_to_image(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm', 'avi', 'mov', 'gif'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video(file_content, file_name, target_format)
        
        if target_format in ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'] and extension in ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.opus', '.wma']:
            return convert_audio(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm'] and extension in ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.opus', '.wma']:
            return convert_audio_to_video(file_content, file_name, target_format)
        
        if target_format in ['stl', 'obj'] and extension in ['.glb', '.gltf', '.obj']:
            return convert_3d(file_content, file_name, target_format)
        
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
        elif target_format == 'svg':
            img.save(output_buffer, format='SVG')
        
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

def convert_pdf_to_image(file_content, file_name, target_format):
    try:
        from pdf2image import convert_from_bytes
        import io
        
        images = convert_from_bytes(file_content)
        
        if images:
            output_buffer = io.BytesIO()
            images[0].save(output_buffer, format='JPEG' if target_format == 'jpg' else 'PNG')
            
            return {
                'content': output_buffer.getvalue(),
                'filename': file_name.replace('.pdf', f'.{target_format}'),
                'extension': target_format
            }
        
        return None
    
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

def convert_video_to_audio(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-vn', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_video_to_image(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-vframes', '1', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_audio(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_audio_to_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-f', 'lavfi', '-i', 'color=c=black:s=640x360', '-shortest', '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        os.remove(tmp_path)
        os.remove(output_path)
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_3d(file_content, file_name, target_format):
    try:
        import trimesh
        import io
        
        mesh = trimesh.load(io.BytesIO(file_content), file_type=os.path.splitext(file_name)[1][1:])
        
        if target_format == 'stl':
            content = mesh.export(file_type='stl')
        elif target_format == 'obj':
            content = mesh.export(file_type='obj')
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
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