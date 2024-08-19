#
# If you are not running on an ARM system, macOS, Linux, or Windows;
# You will need qemu-user-static or like package installed
# to provide`qemu-arm-static` for ARM code execution.
#
# Docker Desktop provides support for this feature.
#

FROM --platform=linux/arm/v7 debian:buster

# Install the basics.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && \
    apt-get install -y apt-utils && \
    apt-get upgrade -y && \
    apt-get install -y build-essential git python3 curl wget bash libatomic1 bash-completion libnss3 && \
    rm -rf /var/lib/apt/lists && \
    rm -rf /var/cache/apt

# Install the Electron dependencies.
RUN apt-get update -y && \
    apt-get install -y xorg gconf2 gconf-service libnotify4 libappindicator1 libxtst6 \
                       libxss1 libasound2 libgl1-mesa-glx libgl1-mesa-dri && \
    rm -rf /var/lib/apt/lists && \
    rm -rf /var/cache/apt

# Install the project dependencies.
ENV USE_SYSTEM_FPM=true
RUN apt-get update -y && \
    apt-get install -y unzip ruby-dev && \
    gem install fpm && \
    rm -rf /var/lib/apt/lists && \
    rm -rf /var/cache/apt

# Default environment.
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# Setup user.
RUN useradd -m builder
USER builder

# Install node.
SHELL ["/bin/bash", "-lc"]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN nvm install 20 && \
    nvm use 20

# Setup entrypoint.
COPY docker /
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["bash", "-l"]

# Project
WORKDIR /project
