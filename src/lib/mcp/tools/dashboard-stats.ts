import { defineTool } from "@lovable.dev/mcp-js";
import { dashboardStats } from "@/lib/mock-data";

export default defineTool({
  name: "dashboard_stats",
  title: "Get workspace dashboard stats",
  description:
    "Return top-line Negotiator AI workspace stats: money saved, calls completed, active negotiations, average discount, and trust score.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(dashboardStats, null, 2) }],
    structuredContent: dashboardStats,
  }),
});
