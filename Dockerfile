FROM --platform=linux/arm/v7 debian:buster

# Install the basics.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && \
    apt-get install -y apt-utils && \
    apt-get upgrade -y && \
    apt-get install -y curl wget bash libatomic1 build-essential bash-completion git python3 libnss3 && \
    rm -rf /var/lib/apt/lists && \
    rm -rf /var/cache/apt

# Install the Electron dependencies.
RUN apt-get update -y && \
    apt-get install -y xorg gconf2 gconf-service libnotify4 libappindicator1 libxtst6 \
                       libxss1 libasound2 libgl1-mesa-glx libgl1-mesa-dri && \
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
RUN nvm install 12 && \
    nvm use 12

# Setup entrypoint.
COPY docker /
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["bash", "-l"]

# Project
WORKDIR /project
