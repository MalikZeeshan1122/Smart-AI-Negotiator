import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { recentJobs, activeJob } from "@/lib/mock-data";

export default defineTool({
  name: "list_jobs",
  title: "List negotiation jobs",
  description:
    "List all negotiation jobs known to the Negotiator AI demo workspace — the currently active job plus recent completed jobs.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const jobs = [
      {
        id: activeJob.id,
        type: activeJob.type,
        route: `${activeJob.origin} → ${activeJob.destination}`,
        status: "active",
        createdAt: activeJob.createdAt,
        distanceMi: activeJob.distanceMi,
        bedrooms: activeJob.bedrooms,
        quoteCount: activeJob.quotes.length,
      },
      ...recentJobs.map((j) => ({
        id: j.id,
        type: j.type,
        route: j.route,
        status: j.status,
        date: j.date,
        savings: j.savings,
      })),
    ];
    return {
      content: [{ type: "text", text: JSON.stringify(jobs, null, 2) }],
      structuredContent: { jobs },
    };
  },
});
