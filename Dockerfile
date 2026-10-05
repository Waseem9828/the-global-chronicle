FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY . .

ENV PORT=5050
EXPOSE 5050

CMD ["node", "server.js"]
