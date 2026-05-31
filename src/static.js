const fs = require('fs');
const path = require('path');
const { getMimeType } = require('./mime');

function serveStatic(staticDir) {
  const resolvedDir = path.resolve(staticDir);

  return function (req, res, socket) {
    const requestPath = req.path === '/' ? '/index.html' : req.path;
    const filePath = path.join(resolvedDir, requestPath);
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(resolvedDir)) {
      res.status(403).send('Access denied');
      return;
    }

    fs.stat(resolvedPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.status(404).send('File not found');
        return;
      }

      const mimeType = getMimeType(resolvedPath);

      let responseHead = `HTTP/1.1 200 OK\r\n`;
      responseHead += `Content-Type: ${mimeType}\r\n`;
      responseHead += `Content-Length: ${stats.size}\r\n`;
      responseHead += `Connection: close\r\n`;
      responseHead += '\r\n';

      socket.write(responseHead);
      fs.createReadStream(resolvedPath).pipe(socket);
    });
  };
}

module.exports = { serveStatic };
