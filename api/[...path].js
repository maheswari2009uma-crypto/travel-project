// Route all /api/* requests through the Express application on Vercel.
const app = require('../server');

module.exports = (req, res) => {
  // Vercel may provide the request path with or without the /api prefix.
  if (!req.url || !req.url.startsWith('/api/')) {
    req.url = `/api${req.url && req.url.startsWith('/') ? req.url : `/${req.url || ''}`}`;
  }
  return app(req, res);
};
