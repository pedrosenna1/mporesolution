FROM python:3.10-slim

# Evita interações durante instalação
ENV DEBIAN_FRONTEND=noninteractive

# Instala libs básicas do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Cria diretório da aplicação
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala dependências
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expõe a porta padrão do Render
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]
