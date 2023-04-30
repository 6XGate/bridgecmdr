#
# You will need qemu-user-static or like package installed
# to provide`qemu-arm-static` for ARM code execution.
#

FROM debian:latest

ADD https://nodejs.org/download/release/v16.20.0/node-v16.20.0-linux-armv7l.tar.xz /downloads/node.tar.xz
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get install -y ruby-dev build-essential git python3
RUN gem install fpm
RUN tar -xaf /downloads/node.tar.xz --directory /downloads
RUN cp -R /downloads/node-v16.20.0-linux-armv7l/* /usr/local
RUN npm i -g npm

VOLUME /app
ENV HOME=/app/docker
ENV USE_SYSTEM_FPM=true
