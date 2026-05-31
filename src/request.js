function parseRequest(rawData) {
  const request = rawData.toString();

  const [headerSection, ...bodyParts] = request.split('\r\n\r\n');
  const body = bodyParts.join('\r\n\r\n');
  const lines = headerSection.split('\r\n');

  const [method, fullPath, version] = lines[0].split(' ');

  const [pathOnly, queryString] = fullPath.split('?');
  const query = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }

  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(':');
    if (colonIndex > 0) {
      const key = lines[i].slice(0, colonIndex).toLowerCase().trim();
      const value = lines[i].slice(colonIndex + 1).trim();
      headers[key] = value;
    }
  }

  let parsedBody = body;
  const contentType = headers['content-type'] || '';
  if (contentType.includes('application/json') && body) {
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
  }

  return {
    method,
    path: pathOnly,
    query,
    params: {},
    headers,
    body: parsedBody,
    version,
  };
}

module.exports = { parseRequest };
