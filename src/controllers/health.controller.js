/**
 * GET /api/health
 * Lightweight liveness probe for load balancers / uptime monitors.
 */
export function getHealth(req, res) {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "str-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
