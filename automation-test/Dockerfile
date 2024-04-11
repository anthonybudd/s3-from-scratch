FROM ubuntu:noble

RUN apt-get update && apt-get install -y curl

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"

RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

COPY bucket.yml /root/bucket.yml