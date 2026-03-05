# --- Stage 1: Build the Web Frontend ---
FROM node:20 AS web-builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm --filter web build

# --- Stage 2: Build the Core Backend ---
FROM node:20 AS core-builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm --filter core build

# --- Stage 3: Final Production Image — Core Backend ---
FROM node:20-slim AS core-backend-final
WORKDIR /app
COPY --from=core-builder /app/packages/core/dist ./packages/core/dist
COPY --from=core-builder /app/node_modules ./node_modules
CMD ["node", "./packages/core/dist/index.js"]

# --- Stage 4: Final Production Image — Web Frontend ---
FROM nginx:stable-alpine AS web-frontend-final
COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html

# --- Stage 5: Python NLP Service ---
FROM python:3.11-slim AS python-nlp-final
WORKDIR /app
COPY apps/python-nlp-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/python-nlp-service/src ./src
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Stage 6: Chat Bots Service ---
FROM python:3.11-slim AS chat-bots-final
WORKDIR /app
COPY apps/telegram/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/telegram/src ./src
COPY packages/python-shared/src ./shared
CMD ["python", "-m", "src.main"]
