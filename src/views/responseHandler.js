const ResponseHandler = {
  success(res, { data, message = 'Success' } = {}) {
    return res.status(200).json({ success: true, message, data });
  },

  created(res, { data, message = 'Created' } = {}) {
    return res.status(201).json({ success: true, message, data });
  },

  paginated(res, { data, total, page, limit }) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  },

  notFound(res, message = 'Not found') {
    return res.status(404).json({ success: false, message });
  },

  error(res, { statusCode = 400, message = 'Bad request' } = {}) {
    return res.status(statusCode).json({ success: false, message });
  },

  unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({ success: false, message });
  },

  forbidden(res, message = 'Forbidden') {
    return res.status(403).json({ success: false, message });
  },
};

export default ResponseHandler;
