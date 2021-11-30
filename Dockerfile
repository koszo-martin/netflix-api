FROM node:alpine
WORKDIR /app
ADD . .
RUN npm i -g swagger
RUN npm i
CMD swagger project start