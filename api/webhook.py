import os
import json
import time
import uuid
import zipfile
import tempfile
import requests
import subprocess
from flask import Flask, request

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
        
        if 'caption' in message and message['caption']:
            target_format = message['caption'].lower().strip()
        
        send_message(chat_id, f"🔍 Получаю файл {file_name}...")
        
        file_id = document['file_id']
        file_path = get_file_path(file_id)
        file_content = download_file(file_path)
        
        send_message(chat_id, f"⏳ Конвертирую в {target_format if target_format else 'ZIP'}...")
        
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
                'downloaded': False
            }
            
            with open(meta_path, 'w') as f:
                json.dump(meta, f)
            
            download_url = f'https://{VERCEL_URL}/api/download/{download_id}'
            
            send_message(chat_id, f"✅ Готово!\n\n📥 Скачать: {download_url}\n\n⚠️ Ссылка одноразовая и действительна 1 час.")
        else:
            send_message(chat_id, "❌ Не удалось конвертировать файл")
    
    return 'OK', 200

def convert_file(file_content, file_name, target_format=None):
    try:
        extension = os.path.splitext(file_name)[1].lower()
        
        if target_format and target_format.startswith('.'):
            target_format = target_format[1:]
        
        if target_format in ['zip', None] and extension in ['.rar', '.7z']:
            return convert_archive_to_zip(file_content, file_name)
        
        if target_format == 'zip':
            return convert_to_zip(file_content, file_name)
        
        if target_format in ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv']:
            return convert_video_to_audio(file_content, file_name, target_format)
        
        if target_format in ['jpg', 'png'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv']:
            return convert_video_to_image(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm', 'avi', 'mov'] and extension in ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a']:
            return convert_audio_to_video(file_content, file_name, target_format)
        
        if target_format in ['mp4', 'webm', 'avi', 'mov', 'gif'] and extension in ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.gif']:
            return convert_video(file_content, file_name, target_format)
        
        if target_format in ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'] and extension in ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a']:
            return convert_audio(file_content, file_name, target_format)
        
        if target_format in ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'] and extension in ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp', '.ico', '.gif']:
            return convert_image(file_content, file_name, target_format)
        
        if target_format == 'txt' and extension == '.pdf':
            return convert_pdf_to_txt(file_content, file_name)
        
        if target_format in ['jpg', 'png'] and extension == '.pdf':
            return convert_pdf_to_image(file_content, file_name, target_format)
        
        if target_format == 'txt' and extension in ['.docx', '.html', '.htm']:
            return convert_doc_to_txt(file_content, file_name)
        
        if target_format == 'pdf' and extension in ['.docx', '.html', '.htm', '.txt']:
            return convert_to_pdf(file_content, file_name)
        
        if target_format == 'csv' and extension in ['.xlsx', '.xls']:
            return convert_xlsx_to_csv(file_content, file_name)
        
        if target_format == 'json' and extension in ['.xlsx', '.xls']:
            return convert_xlsx_to_json(file_content, file_name)
        
        if target_format in ['stl', 'obj'] and extension in ['.glb', '.gltf', '.obj']:
            return convert_3d(file_content, file_name, target_format)
        
        return None
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_archive_to_zip(file_content, file_name):
    try:
        import rarfile
        import py7zr
        
        tmp_path = None
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        with tempfile.TemporaryDirectory() as extract_dir:
            if file_name.endswith('.rar'):
                with rarfile.RarFile(tmp_path) as rf:
                    rf.extractall(extract_dir)
            elif file_name.endswith('.7z'):
                with py7zr.SevenZipFile(tmp_path, 'r') as z:
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
            
            return {
                'content': content,
                'filename': file_name.replace('.rar', '.zip').replace('.7z', '.zip'),
                'extension': 'zip'
            }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except:
                pass
        try:
            os.remove(zip_buffer.name)
        except:
            pass

def convert_to_zip(file_content, file_name):
    try:
        zip_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr(file_name, file_content)
        
        with open(zip_buffer.name, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name + '.zip',
            'extension': 'zip'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(zip_buffer.name)
        except:
            pass

def convert_video_to_audio(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-vn', '-acodec', 'libmp3lame' if target_format == 'mp3' else 'copy', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(tmp_path)
            os.remove(output_path)
        except:
            pass

def convert_video_to_image(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-vframes', '1', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(tmp_path)
            os.remove(output_path)
        except:
            pass

def convert_audio_to_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-f', 'lavfi', '-i', 'color=c=black:s=640x360', '-shortest', '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(tmp_path)
            os.remove(output_path)
        except:
            pass

def convert_video(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, '-c:v', 'libx264', '-c:a', 'aac', output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(tmp_path)
            os.remove(output_path)
        except:
            pass

def convert_audio(file_content, file_name, target_format):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        output_path = tmp_path + f'.{target_format}'
        
        subprocess.run(['ffmpeg', '-i', tmp_path, output_path], check=True, capture_output=True)
        
        with open(output_path, 'rb') as f:
            content = f.read()
        
        return {
            'content': content,
            'filename': file_name.replace(os.path.splitext(file_name)[1], f'.{target_format}'),
            'extension': target_format
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        try:
            os.remove(tmp_path)
            os.remove(output_path)
        except:
            pass

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
        elif target_format == 'svg':
            img.save(output_buffer, format='SVG')
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

def convert_pdf_to_image(file_content, file_name, target_format):
    try:
        from pdf2image import convert_from_bytes
        
        images = convert_from_bytes(file_content)
        
        if images:
            import io
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

def convert_doc_to_txt(file_content, file_name):
    try:
        import mammoth
        import io
        
        result = mammoth.extract_raw_text(io.BytesIO(file_content))
        
        return {
            'content': result.value.encode('utf-8'),
            'filename': file_name.replace(os.path.splitext(file_name)[1], '.txt'),
            'extension': 'txt'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_to_pdf(file_content, file_name):
    try:
        from reportlab.pdfgen import canvas
        import io
        
        output_buffer = io.BytesIO()
        c = canvas.Canvas(output_buffer)
        c.drawString(100, 750, file_content.decode('utf-8', errors='ignore')[:100])
        c.save()
        
        return {
            'content': output_buffer.getvalue(),
            'filename': file_name.replace(os.path.splitext(file_name)[1], '.pdf'),
            'extension': 'pdf'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_xlsx_to_csv(file_content, file_name):
    try:
        import pandas as pd
        import io
        
        df = pd.read_excel(io.BytesIO(file_content))
        csv_content = df.to_csv(index=False)
        
        return {
            'content': csv_content.encode('utf-8'),
            'filename': file_name.replace(os.path.splitext(file_name)[1], '.csv'),
            'extension': 'csv'
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_xlsx_to_json(file_content, file_name):
    try:
        import pandas as pd
        import io
        
        df = pd.read_excel(io.BytesIO(file_content))
        json_content = df.to_json(orient='records')
        
        return {
            'content': json_content.encode('utf-8'),
            'filename': file_name.replace(os.path.splitext(file_name)[1], '.json'),
            'extension': 'json'
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
    response = requests.get(f'{BASE_URL}/getFile', params={'file_id': file_id})
    return response.json()['result']['file_path']

def download_file(file_path):
    response = requests.get(f'https://api.telegram.org/file/bot{TOKEN}/{file_path}')
    return response.content

def send_message(chat_id, text):
    requests.post(f'{BASE_URL}/sendMessage', json={'chat_id': chat_id, 'text': text})

def handler(request, response):
    return app(request.environ, lambda status, headers: response(status, headers))