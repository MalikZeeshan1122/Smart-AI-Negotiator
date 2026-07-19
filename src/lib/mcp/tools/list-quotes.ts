import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { activeJob } from "@/lib/mock-data";

export default defineTool({
  name: "list_quotes",
  title: "List quotes for a job",
  description:
    "List every vendor quote for a negotiation job, including original price, negotiated final price, savings, trust score, and risk.",
  inputSchema: {
    jobId: z
      .string()
      .min(1)
      .describe("Job id whose quotes to list. Use list_jobs to discover ids."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ jobId }) => {
    if (jobId !== activeJob.id) {
      return {
        content: [
          { type: "text", text: `No quotes available for job "${jobId}" in the demo workspace.` },
        ],
        isError: true,
      };
    }
    const quotes = activeJob.quotes.map((q) => ({
      id: q.id,
      company: q.company,
      phone: q.phone,
      rating: q.rating,
      reviews: q.reviews,
      status: q.status,
      originalPrice: q.originalPrice,
      finalPrice: q.finalPrice,
      savings: q.savings,
      trustScore: q.trustScore,
      risk: q.risk,
      insurance: q.insurance,
      availability: q.availability,
      cancellation: q.cancellation,
      hiddenFees: q.hiddenFees,
      warnings: q.warnings,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(quotes, null, 2) }],
      structuredContent: { quotes },
    };
  },
});
