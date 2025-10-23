function getRouteHandler(router, method, path) {
  const layer = router.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }
  return layer.route.stack[0].handle;
}

async function invokeRoute(router, method, path, { body = {}, query = {} } = {}) {
  const handler = getRouteHandler(router, method, path);

  const req = { body, query, headers: {} };
  let statusCode = 200;
  let jsonPayload;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonPayload = payload;
      return this;
    }
  };

  let error;
  const next = (err) => {
    error = err;
  };

  await handler(req, res, next);
  if (error) {
    throw error;
  }

  return { statusCode, json: jsonPayload };
}

module.exports = {
  getRouteHandler,
  invokeRoute
};
