FROM apache/nutch

RUN apt-get update && apt-get install nodejs npm -y

WORKDIR /root
COPY server/server.js .
COPY server/package.json .
COPY configuration/conf/ ./nutch/conf/

RUN ls -l /opt && npm install

CMD ["node", "server.js"]

