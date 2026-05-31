const fs = require('fs');
const { getMimeType } = require('./mime');

const STATUS_TEXTS = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

function createResponse(socket) {
  let statusCode = 200;
  const headers = { 'Connection': 'close' };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },

    set(key, value) {
      headers[key] = value;
      return this;
    },

    send(text) {
      const body = String(text);
      headers['Content-Type'] = headers['Content-Type'] || 'text/plain';
      headers['Content-Length'] = Buffer.byteLength(body);

      const statusText = STATUS_TEXTS[statusCode] || 'Unknown';
      let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
      for (const [k, v] of Object.entries(headers)) {
        response += `${k}: ${v}\r\n`;
      }
      response += '\r\n' + body;
      socket.end(response);
    },

    json(data) {
      const body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      this.send(body);
    },

    sendFile(filePath) {
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.status(404).send('File not found');
          return;
        }

        const mimeType = getMimeType(filePath);
        const statusText = STATUS_TEXTS[statusCode] || 'Unknown';

        let responseHead = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
        responseHead += `Content-Type: ${mimeType}\r\n`;
        responseHead += `Content-Length: ${stats.size}\r\n`;
        responseHead += `Connection: close\r\n`;
        responseHead += '\r\n';

        socket.write(responseHead);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(socket);
      });
    },
  };

  return res;
}

module.exports = { createResponse };
