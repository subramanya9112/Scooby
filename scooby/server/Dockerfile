FROM node:17-alpine

RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY server/package.json ./
RUN npm install
COPY server/build/. ./
CMD [ "node", "index.js" ]
