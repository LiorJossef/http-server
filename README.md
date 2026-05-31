# HTTP/1.1 Server from Scratch

A minimal HTTP server built on top of Node.js's raw `net` module — no Express, no `http`, no third-party packages.

## What this is

This was a university assignment to understand how HTTP actually works under the hood. Instead of using the built-in `http` module, everything is done over raw TCP sockets — request parsing, response building, routing, static file serving — all manual.

I also added two features that I thought were interesting:

**Route groups** — lets you group routes under a shared prefix without repeating it:

```js
app.group('/api/assignments', (router) => {
  router.get('/', handler)       // GET /api/assignments/
  router.get('/:id', handler)    // GET /api/assignments/:id
  router.post('/', handler)      // POST /api/assignments/
})
```

**Return-value responses** — handlers can just return a value instead of calling `res.json()`:

```js
router.get('/:id', (req) => {
  const assignment = assignments.find(a => a.id === req.params.id)
  return assignment  // framework sends this as JSON automatically
})
```

## Project structure

```
src/
  app.js       - main createApp() function, wires everything together
  router.js    - route registration and matching (supports :params)
  request.js   - parses raw HTTP request from TCP data
  response.js  - builds and sends HTTP responses
  static.js    - serves static files from a directory
  mime.js      - maps file extensions to Content-Type headers
example/
  server.js    - assignment tracker app that uses the framework
public/
  index.html   - frontend UI
  style.css    - styles
  app.js       - frontend JS (fetch-based)
```

## Running the example

```bash
node example/server.js
```

Then open [http://localhost:3000](http://localhost:3000).

The example is an assignment tracker — you can add assignments with a title, course, and due date, mark them done, filter by status, and delete them. All data is in-memory so it resets on restart.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assignments/` | Get all assignments |
| GET | `/api/assignments/:id` | Get one assignment |
| POST | `/api/assignments/` | Create assignment |
| PUT | `/api/assignments/:id` | Toggle done/undone |
| DELETE | `/api/assignments/:id` | Delete assignment |

## How request parsing works

The server accumulates raw TCP data until it sees `\r\n\r\n` (the blank line separating headers from body), then parses everything manually — status line, headers, query string, and body (auto-parsed as JSON if Content-Type matches).

Responses are built as raw strings following the HTTP/1.1 format:

```
HTTP/1.1 200 OK\r\n
Content-Type: application/json\r\n
Content-Length: 42\r\n
\r\n
{"message":"hello"}
```

## Notes

- No support for chunked transfer encoding or keep-alive connections
- Data is in-memory only — no database
- Static files are protected against directory traversal attacks
