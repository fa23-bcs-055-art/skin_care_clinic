const AuditLog = require('../models/auth/ActivityLog');

exports.auditLog = (action, targetModel = null) => {
  return async (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    res.send = function(body) {
      const duration = Date.now() - start;
      
      // Parse the response body
      let responseBody;
      try {
        responseBody = JSON.parse(body);
      } catch {
        responseBody = body;
      }

      // Create audit log
      const auditLog = new AuditLog({
        user: req.user?.id,
        action,
        target: req.params.id || req.body._id,
        targetModel,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        },
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: res.statusCode < 400 ? 'success' : 'failure'
      });

      // Save asynchronously (don't await to not block response)
      auditLog.save().catch(err => console.error('Audit log error:', err));

      originalSend.call(this, body);
    };
    
    next();
  };
};