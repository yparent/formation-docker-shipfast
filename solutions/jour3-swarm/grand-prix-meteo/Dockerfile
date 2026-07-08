# Grand Prix — meteo-du-port : image de production (multi-stage, non-root, healthcheck)
FROM python:3.13-slim AS deps
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.13-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY --from=deps /install /usr/local
COPY app.py ./
EXPOSE 8090
RUN useradd -r -u 1001 appuser
USER appuser
HEALTHCHECK --interval=15s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8090/health')"
CMD ["python", "app.py"]
