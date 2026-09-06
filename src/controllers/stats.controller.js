import Project from "../models/Project.js";
import Service from "../models/Service.js";
import Blog from "../models/Blog.js";
import Inquiry from "../models/Inquiry.js";
import Team from "../models/Team.js";
import Testimonial from "../models/Testimonial.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/v1/stats/overview — everything the admin landing page renders,
 * in one round trip.
 *
 * Shape is deliberately flat and stable; the dashboard cards read it directly
 * with no client-side reshaping.
 */
export const getOverview = asyncHandler(async (_req, res) => {
  const [inquiryFacet, projectsByService, blogCounts, counts] = await Promise.all([
    // One pass over inquiries yields the status breakdown AND the recent list.
    // $facet re-scans the input for each sub-pipeline and cannot use an index
    // for the inner $sort — fine at agency lead volume (< ~50k docs). If the
    // collection ever passes that, split `recent` into its own indexed find().
    Inquiry.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 6 },
            {
              $project: {
                senderName: 1, senderEmail: 1, serviceInterested: 1,
                budgetRange: 1, status: 1, createdAt: 1,
              },
            },
          ],
          total: [{ $count: "value" }],
        },
      },
    ]),

    Project.aggregate([
      { $unwind: "$serviceTypes" },
      { $group: { _id: "$serviceTypes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Blog.aggregate([{ $group: { _id: "$isPublished", count: { $sum: 1 } } }]),

    // estimatedDocumentCount() reads collection metadata (O(1)); countDocuments()
    // with a filter scans an index. Estimate for unfiltered totals, exact count
    // where a filter exists — on a dashboard that refreshes on every page load
    // this is the difference between 1ms and 40ms.
    Promise.all([
      Project.estimatedDocumentCount(),
      Project.countDocuments({ featured: true }),
      Service.countDocuments({ isActive: true }),
      Team.countDocuments({ isActive: true }),
      Testimonial.estimatedDocumentCount(),
    ]),
  ]);

  const facet = inquiryFacet[0] ?? {};
  const statusMap = Object.fromEntries((facet.byStatus ?? []).map((r) => [r._id, r.count]));
  const publishMap = Object.fromEntries((blogCounts ?? []).map((r) => [String(r._id), r.count]));
  const [projectsTotal, projectsFeatured, servicesActive, teamActive, testimonialsTotal] = counts;

  res.json({
    success: true,
    data: {
      projects: {
        total: projectsTotal,
        featured: projectsFeatured,
        byService: projectsByService.map((r) => ({ serviceType: r._id, count: r.count })),
      },
      blogs: {
        published: publishMap.true ?? 0,
        drafts: publishMap.false ?? 0,
      },
      inquiries: {
        total: facet.total?.[0]?.value ?? 0,
        new: statusMap.new ?? 0,
        contacted: statusMap.contacted ?? 0,
        closed: statusMap.closed ?? 0,
      },
      services: { active: servicesActive },
      team: { active: teamActive },
      testimonials: { total: testimonialsTotal },
      recentInquiries: facet.recent ?? [],
      generatedAt: new Date().toISOString(),
    },
  });
});
