import { defineMcp } from "@lovable.dev/mcp-js";
import listJobs from "./tools/list-jobs";
import getJob from "./tools/get-job";
import listQuotes from "./tools/list-quotes";
import getRecommendation from "./tools/get-recommendation";
import getTranscript from "./tools/get-transcript";
import dashboardStats from "./tools/dashboard-stats";

export default defineMcp({
  name: "negotiator-ai-mcp",
  title: "Negotiator AI",
  version: "0.1.0",
  instructions:
    "Read-only access to the Negotiator AI demo workspace. Use list_jobs to discover jobs, list_quotes / get_job for vendor detail, get_transcript for recorded call transcripts and negotiation events, get_recommendation for the agent's picked vendor, and dashboard_stats for top-line KPIs. Data is simulated demo data — no live calls are placed.",
  tools: [listJobs, getJob, listQuotes, getRecommendation, getTranscript, dashboardStats],
});
