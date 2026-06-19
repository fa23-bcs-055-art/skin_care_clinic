// Centralized error handler middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const payload = { success: false, message: err.message || 'Server Error' };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
