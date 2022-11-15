FROM node:16-alpine AS builder

ENV NODE_VERSION 19.1.0
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM nginx:1.16.0-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
