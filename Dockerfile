FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY API/package*.json API/
RUN npm  install


COPY API/ API/

CMD ["npm", "run", "deploy"]

EXPOSE 8000