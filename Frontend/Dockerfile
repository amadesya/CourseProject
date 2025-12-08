FROM node:20 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- NGINX ----
FROM nginx:1.25
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
