import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { activeJob } from "@/lib/mock-data";

export default defineTool({
  name: "get_transcript",
  title: "Get call transcript",
  description:
    "Return the recorded transcript and negotiation events for a specific vendor quote.",
  inputSchema: {
    quoteId: z.string().min(1).describe("Quote id (e.g. 'q_...') from list_quotes."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ quoteId }) => {
    const quote = activeJob.quotes.find((q) => q.id === quoteId);
    if (!quote) {
      return {
        content: [{ type: "text", text: `No transcript found for quote "${quoteId}".` }],
        isError: true,
      };
    }
    const payload = {
      quoteId: quote.id,
      company: quote.company,
      callDurationSec: quote.callDurationSec,
      recordingUrl: quote.recordingUrl,
      transcript: quote.transcript,
      negotiations: quote.negotiations,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
