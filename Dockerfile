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

# Claude Code installieren
RUN curl -fsSL https://claude.ai/install.sh | bash && \
    # Binary nach /usr/local/bin kopieren (nicht symlinken!)
    # Damit alle User (auch claude) es nutzen können
    cp /root/.local/share/claude/versions/*/[0-9]* /usr/local/bin/claude 2>/dev/null || \
    cp /root/.local/share/claude/versions/* /usr/local/bin/claude && \
    chmod +x /usr/local/bin/claude

# Playwright installieren mit allen Browsern
RUN npm install -g playwright && \
    npx playwright install --with-deps chromium firefox webkit && \
    npx playwright install chrome

# User für Claude Code erstellen (VOR dem Arbeitsverzeichnis!)
RUN useradd -m -s /bin/bash claude && \
    echo "claude ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Arbeitsverzeichnis erstellen
RUN mkdir -p /workspace && chown claude:claude /workspace
RUN mkdir -p /home/claude/.config && chown -R claude:claude /home/claude

# Wrapper-Script für claude mit Cache-Cleanup
RUN echo '#!/bin/bash' > /usr/local/bin/claude-clean && \
    echo 'rm -rf ~/.cache/ms-playwright/mcp-chrome-* 2>/dev/null' >> /usr/local/bin/claude-clean && \
    echo 'exec /usr/local/bin/claude "$@"' >> /usr/local/bin/claude-clean && \
    chmod +x /usr/local/bin/claude-clean && \
    echo 'alias claude="claude-clean"' >> /home/claude/.bashrc

WORKDIR /workspace

# Port für ttyd Web-Terminal
EXPOSE 7681

# Startup Script (muss als root ausgeführt werden)
USER root
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
