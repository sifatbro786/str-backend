/**
 * 404 handler — reached when no route matched. Forwards a structured error
 * to the centralized error handler.
 */
export default function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}
