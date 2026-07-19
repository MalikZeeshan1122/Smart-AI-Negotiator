import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { activeJob } from "@/lib/mock-data";

export default defineTool({
  name: "get_recommendation",
  title: "Get recommended vendor",
  description:
    "Return Negotiator AI's recommended vendor for a job, with reasoning, savings, trust score, and warnings.",
  inputSchema: {
    jobId: z.string().min(1).describe("Job id to get the recommendation for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ jobId }) => {
    if (jobId !== activeJob.id) {
      return {
        content: [{ type: "text", text: `No recommendation available for "${jobId}".` }],
        isError: true,
      };
    }
    const best = [...activeJob.quotes].sort((a, b) => a.finalPrice - b.finalPrice)[0];
    const payload = {
      jobId: activeJob.id,
      recommended: {
        company: best.company,
        finalPrice: best.finalPrice,
        originalPrice: best.originalPrice,
        savings: best.savings,
        trustScore: best.trustScore,
        risk: best.risk,
        reasons: best.reasons,
        warnings: best.warnings,
        callDurationSec: best.callDurationSec,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
