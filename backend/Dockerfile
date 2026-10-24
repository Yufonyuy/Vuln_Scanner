FROM python:3.11-slim-bookworm

WORKDIR /app

# Use a stable Debian mirror and retry failed downloads
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list

# Update and install system dependencies with retries
RUN apt-get update -y --fix-missing && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        curl \
        wget \
        gnupg \
        libnss3 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libgbm1 \
        libasound2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm-dev \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libpangoft2-1.0-0 \
        libharfbuzz0b \
        libgdk-pixbuf-2.0-0 \
        libcairo2 \
        libffi-dev \
        shared-mime-info \
        fonts-liberation \
        fonts-dejavu-core \
        libxshmfence1 \
        libx11-xcb1 \
        libxcb1 \
        libxcb-shm0 \
        libxcb-xfixes0 \
        libxcb-shape0 \
        libxcb-randr0 \
        libxcb-icccm4 \
        libxcb-image0 \
        libxcb-keysyms1 \
        libxcb-util1 \
        libxcb-xkb1 \
        libxkbcommon-x11-0 \
        libxcb-xinerama0 \
        libxcb-xinput0 \
        libxcb-cursor0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements first and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright (browsers)
RUN playwright install chromium

# Copy the rest of the application
COPY . .