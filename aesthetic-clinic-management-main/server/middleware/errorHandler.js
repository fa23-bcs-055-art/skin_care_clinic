// Centralized error handler middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const payload = { success: false, message: err.message || 'Server Error' };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
