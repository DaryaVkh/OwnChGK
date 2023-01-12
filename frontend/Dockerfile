FROM node:16.13.1-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@9.2.0
RUN npm install
COPY . .
RUN npm run build-standard

FROM nginx:mainline-alpine

COPY --from=builder /app/build /var/www
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]