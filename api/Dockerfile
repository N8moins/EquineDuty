FROM node:20.11.0-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache bash

COPY package*.json ./

RUN npm install

COPY . .

COPY wait-for-it.sh /scripts/wait-for-it.sh
COPY docker-entrypoint.sh /scripts/docker-entrypoint.sh

RUN chmod +x /scripts/wait-for-it.sh
RUN chmod +x /scripts/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/scripts/docker-entrypoint.sh"]
