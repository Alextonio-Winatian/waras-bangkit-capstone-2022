FROM node:16
RUN apt-get update -y \
    && apt-get clean
WORKDIR /usr/src/app
COPY package.json package*.json ./
RUN npm install 
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
