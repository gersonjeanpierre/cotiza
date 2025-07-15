FROM node:22-alpine as builder

WORKDIR /app

RUN apk add --no-cache curl bash

RUN curl -fsSL https://bun.sh/install | bash

# Agrega Bun al PATH
ENV PATH="/root/.bun/bin:${PATH}"

COPY package*.json ./
RUN bun install

COPY . .
RUN bun run build -- --output-path=./dist --configuration=production

FROM nginx:alpine as runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]