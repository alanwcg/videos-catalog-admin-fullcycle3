FROM node:20.18.3-slim

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]