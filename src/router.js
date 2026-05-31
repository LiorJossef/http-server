function createRouter() {
  const routes = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
  };

  function addRoute(method, path, handler) {
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    routes[method].push({
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
    });
  }

  function match(method, path) {
    const methodRoutes = routes[method] || [];

    for (const route of methodRoutes) {
      const result = path.match(route.regex);
      if (result) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = result[index + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }

  function group(prefix, callback) {
    const groupRouter = {
      get: (path, handler) => addRoute('GET', prefix + path, handler),
      post: (path, handler) => addRoute('POST', prefix + path, handler),
      put: (path, handler) => addRoute('PUT', prefix + path, handler),
      delete: (path, handler) => addRoute('DELETE', prefix + path, handler),
      group: (nestedPrefix, cb) => group(prefix + nestedPrefix, cb),
    };
    callback(groupRouter);
  }

  return {
    get: (path, handler) => addRoute('GET', path, handler),
    post: (path, handler) => addRoute('POST', path, handler),
    put: (path, handler) => addRoute('PUT', path, handler),
    delete: (path, handler) => addRoute('DELETE', path, handler),
    group,
    match,
  };
}

module.exports = { createRouter };
