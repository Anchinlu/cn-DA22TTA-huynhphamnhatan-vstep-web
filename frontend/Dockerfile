FROM node:18
WORKDIR /app

COPY ./vstep-client/package*.json ./

RUN npm install

COPY ./vstep-client ./

EXPOSE 3000
CMD ["npm", "start"]
