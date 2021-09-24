FROM node:12-alpine

WORKDIR /home/nest-api

COPY package*.json yarn.* ./

COPY . . 

RUN npm install

CMD npm run start:dev