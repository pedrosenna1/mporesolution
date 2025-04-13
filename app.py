from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
import json
import tempfile
import cv2
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'chave_secreta_para_flash_messages'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max

# Garantir que a pasta de uploads exista
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configuração do banco de dados
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS pontos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        largura INTEGER NOT NULL,
        altura INTEGER NOT NULL
    )
    ''')
    conn.commit()
    conn.close()

# Inicializar o banco de dados
init_db()

# Rota principal
@app.route('/')
def index():
    return render_template('index.html')

# Rotas para gerenciamento de pontos
@app.route('/cadastro-pontos')
def cadastro_pontos():
    conn = get_db_connection()
    pontos = conn.execute('SELECT * FROM pontos').fetchall()
    conn.close()
    return render_template('cadastro_pontos.html', pontos=pontos)

@app.route('/pontos/adicionar', methods=['POST'])
def adicionar_ponto():
    nome = request.form['nome']
    largura = request.form['largura']
    altura = request.form['altura']
    
    if not nome or not largura or not altura:
        flash('Todos os campos são obrigatórios', 'error')
        return redirect(url_for('cadastro_pontos'))
    
    try:
        largura = int(largura)
        altura = int(altura)
        if largura <= 0 or altura <= 0:
            raise ValueError("Valores devem ser positivos")
    except ValueError:
        flash('Largura e altura devem ser números positivos', 'error')
        return redirect(url_for('cadastro_pontos'))
    
    conn = get_db_connection()
    conn.execute('INSERT INTO pontos (nome, largura, altura) VALUES (?, ?, ?)',
                (nome, largura, altura))
    conn.commit()
    conn.close()
    
    flash('Ponto cadastrado com sucesso!', 'success')
    return redirect(url_for('cadastro_pontos'))

@app.route('/pontos/editar/<int:id>', methods=['POST'])
def editar_ponto(id):
    nome = request.form['nome']
    largura = request.form['largura']
    altura = request.form['altura']
    
    if not nome or not largura or not altura:
        flash('Todos os campos são obrigatórios', 'error')
        return redirect(url_for('cadastro_pontos'))
    
    try:
        largura = int(largura)
        altura = int(altura)
        if largura <= 0 or altura <= 0:
            raise ValueError("Valores devem ser positivos")
    except ValueError:
        flash('Largura e altura devem ser números positivos', 'error')
        return redirect(url_for('cadastro_pontos'))
    
    conn = get_db_connection()
    conn.execute('UPDATE pontos SET nome = ?, largura = ?, altura = ? WHERE id = ?',
                (nome, largura, altura, id))
    conn.commit()
    conn.close()
    
    flash('Ponto atualizado com sucesso!', 'success')
    return redirect(url_for('cadastro_pontos'))

@app.route('/pontos/excluir/<int:id>', methods=['POST'])
def excluir_ponto(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM pontos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    
    flash('Ponto excluído com sucesso!', 'success')
    return redirect(url_for('cadastro_pontos'))

@app.route('/pontos/obter/<int:id>')
def obter_ponto(id):
    conn = get_db_connection()
    ponto = conn.execute('SELECT * FROM pontos WHERE id = ?', (id,)).fetchone()
    conn.close()
    
    if ponto is None:
        return jsonify({'error': 'Ponto não encontrado'}), 404
    
    return jsonify({
        'id': ponto['id'],
        'nome': ponto['nome'],
        'largura': ponto['largura'],
        'altura': ponto['altura']
    })

# Rotas para verificação de vídeos
@app.route('/verificacao-videos')
def verificacao_videos():
    conn = get_db_connection()
    pontos = conn.execute('SELECT * FROM pontos').fetchall()
    conn.close()
    return render_template('verificacao_videos.html', pontos=pontos)

@app.route('/videos/analisar', methods=['POST'])
def analisar_video():
    if 'video' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    # Verificar se é um arquivo de vídeo
    if not video_file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
        return jsonify({'error': 'Formato de arquivo não suportado. Use MP4, AVI, MOV ou MKV.'}), 400
    
    # Salvar o arquivo temporariamente
    filename = secure_filename(video_file.filename)
    temp_path = os.path.join(tempfile.gettempdir(), filename)
    video_file.save(temp_path)
    
    try:
        # Usar OpenCV para extrair informações do vídeo
        video = cv2.VideoCapture(temp_path)
        
        # Verificar se o vídeo foi aberto corretamente
        if not video.isOpened():
            raise Exception("Não foi possível abrir o arquivo de vídeo")
        
        # Extrair largura e altura
        largura = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        altura = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Liberar o vídeo
        video.release()
        
        # Obter informações de tamanho do arquivo
        tamanho_bytes = os.path.getsize(temp_path)
        
        # Converter para formato legível
        if tamanho_bytes < 1024:
            tamanho = f"{tamanho_bytes} bytes"
        elif tamanho_bytes < 1024 * 1024:
            tamanho = f"{tamanho_bytes / 1024:.2f} KB"
        elif tamanho_bytes < 1024 * 1024 * 1024:
            tamanho = f"{tamanho_bytes / (1024 * 1024):.2f} MB"
        else:
            tamanho = f"{tamanho_bytes / (1024 * 1024 * 1024):.2f} GB"
        
        return jsonify({
            'nome': filename,
            'largura': largura,
            'altura': altura,
            'tamanho': tamanho
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Limpar o arquivo temporário
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True)
