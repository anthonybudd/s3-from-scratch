FROM node:20

RUN apt-get update && apt-get install -y curl nano
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN npm install -g nodemon mocha sequelize sequelize-cli mysql2 eslint

WORKDIR /app
COPY . /app
RUN npm install

ENTRYPOINT [ "node", "/app/src/index.js" ]
