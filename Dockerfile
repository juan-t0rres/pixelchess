FROM node:18.19-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8049

CMD ["node", "/app/server.js"]
