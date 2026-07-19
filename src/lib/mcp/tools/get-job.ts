import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { activeJob, recentJobs } from "@/lib/mock-data";

export default defineTool({
  name: "get_job",
  title: "Get job details",
  description:
    "Get full details for a negotiation job by id, including origin/destination, spec, and quote summaries.",
  inputSchema: {
    jobId: z.string().min(1).describe("Job id, e.g. 'job_9f3a2b'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ jobId }) => {
    if (jobId === activeJob.id) {
      const payload = {
        id: activeJob.id,
        type: activeJob.type,
        origin: activeJob.origin,
        destination: activeJob.destination,
        distanceMi: activeJob.distanceMi,
        bedrooms: activeJob.bedrooms,
        stairs: activeJob.stairs,
        elevator: activeJob.elevator,
        largeItems: activeJob.largeItems,
        quotes: activeJob.quotes.map((q) => ({
          id: q.id,
          company: q.company,
          status: q.status,
          originalPrice: q.originalPrice,
          finalPrice: q.finalPrice,
          savings: q.savings,
          trustScore: q.trustScore,
          risk: q.risk,
        })),
      };
      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    }
    const recent = recentJobs.find((j) => j.id === jobId);
    if (recent) {
      return {
        content: [{ type: "text", text: JSON.stringify(recent, null, 2) }],
        structuredContent: recent,
      };
    }
    return {
      content: [{ type: "text", text: `No job found with id "${jobId}".` }],
      isError: true,
    };
  },
});
