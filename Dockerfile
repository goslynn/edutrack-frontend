FROM node:22-alpine

WORKDIR /app

COPY package.json ./

# Install with npm only - ignore pnpm lockfile during installation
RUN npm install || npm install --legacy-peer-deps || true

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/app/entrypoint.sh"]
