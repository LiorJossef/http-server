const net = require('net');
const { parseRequest } = require('./request');
const { createResponse } = require('./response');
const { createRouter } = require('./router');
const { serveStatic } = require('./static');

function createApp() {
  const router = createRouter();
  let staticHandler = null;
  let staticPrefix = '/';

  const app = {
    get: (path, handler) => { router.get(path, handler); return app; },
    post: (path, handler) => { router.post(path, handler); return app; },
    put: (path, handler) => { router.put(path, handler); return app; },
    delete: (path, handler) => { router.delete(path, handler); return app; },

    group(prefix, callback) {
      router.group(prefix, callback);
      return app;
    },

    static(prefix, dir) {
      if (!dir) {
        dir = prefix;
        prefix = '/';
      }
      staticPrefix = prefix;
      staticHandler = serveStatic(dir);
      return app;
    },

    listen(port, callback) {
      const server = net.createServer((socket) => {
        let rawData = '';

        socket.on('data', (chunk) => {
          rawData += chunk.toString();

          if (!rawData.includes('\r\n\r\n')) return;

          const req = parseRequest(rawData);
          const res = createResponse(socket);

          const matched = router.match(req.method, req.path);

          if (matched) {
            req.params = matched.params;
            Promise.resolve(matched.handler(req, res))
              .then((returnValue) => {
                if (returnValue !== undefined && !res.sent) {
                  res.json(returnValue);
                }
              })
              .catch((err) => {
                if (!res.sent) {
                  res.status(500).json({ error: err.message || 'Internal Server Error' });
                }
              });
            return;
          }

          if (staticHandler && req.method === 'GET' && req.path.startsWith(staticPrefix)) {
            const originalPath = req.path;
            req.path = req.path.slice(staticPrefix.length) || '/';
            if (!req.path.startsWith('/')) req.path = '/' + req.path;
            staticHandler(req, res, socket);
            req.path = originalPath;
            return;
          }

          res.status(404).json({ error: 'Not Found' });
        });

        socket.on('error', (err) => {
          console.error('Socket error:', err.message);
        });
      });

      server.listen(port, callback);
      return server;
    },
  };

  return app;
}

module.exports = { createApp };
