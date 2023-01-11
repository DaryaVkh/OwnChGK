FROM node:16.13.1-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@9.2.0
RUN npm install
COPY . .
RUN npm run build

ENTRYPOINT ["npm", "start"]