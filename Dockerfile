FROM node:16.13.1-alpine as app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@9.2.0
RUN npm install
COPY . .
RUN npm run build

FROM nginx:mainline-alpine

COPY --from=app /app/build/frontend /var/www
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
ENTRYPOINT ["npm", "start"]
ENTRYPOINT ["nginx", "-g", "daemon off;"]