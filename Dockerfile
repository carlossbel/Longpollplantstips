FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=10000
ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "start"]