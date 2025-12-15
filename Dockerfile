FROM node:20-bullseye

# System dependencies installieren
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    sudo \
    vim \
    nano \
    build-essential \
    python3 \
    python3-pip \
    # Für ttyd (Web Terminal)
    libwebsockets-dev \
    libjson-c-dev \
    libssl-dev \
    cmake \
    # Playwright Dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# ttyd installieren (Web Terminal)
RUN cd /tmp && \
    git clone https://github.com/tsl0922/ttyd.git && \
    cd ttyd && mkdir build && cd build && \
    cmake .. && \
    make && make install && \
    cd / && rm -rf /tmp/ttyd

# Claude Code installieren (native binary)
RUN curl -fsSL https://claude.ai/install.sh | bash

# Playwright installieren (optional für Testing)
RUN npm install -g playwright && \
    npx playwright install --with-deps chromium

# User für Claude Code erstellen (VOR dem Arbeitsverzeichnis!)
RUN useradd -m -s /bin/bash claude && \
    echo "claude ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Arbeitsverzeichnis erstellen
RUN mkdir -p /workspace && chown claude:claude /workspace
RUN mkdir -p /home/claude/.config && chown -R claude:claude /home/claude

WORKDIR /workspace

# Port für ttyd Web-Terminal
EXPOSE 7681

# Startup Script (muss als root ausgeführt werden)
USER root
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
