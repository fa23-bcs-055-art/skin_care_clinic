function successResponse(res, message = 'Success', data = null, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function errorResponse(res, message = 'Error', status = 400, errors = null) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(status).json(payload);
}

module.exports = { successResponse, errorResponse };
exports.successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message, statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};