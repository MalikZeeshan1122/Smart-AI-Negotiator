// Mock data for Negotiator AI MVP. Swap for real backend/agents later.
export type CallStatus = "queued" | "dialing" | "live" | "negotiating" | "completed" | "failed";
export type Risk = "low" | "medium" | "high";

export type Quote = {
  id: string;
  company: string;
  phone: string;
  rating: number;
  reviews: number;
  status: CallStatus;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  trustScore: number;
  risk: Risk;
  hiddenFees: string[];
  breakdown: { label: string; amount: number }[];
  insurance: boolean;
  availability: string;
  cancellation: string;
  callDurationSec: number;
  recordingUrl: string;
  transcript: { role: "agent" | "business"; text: string; ts: string }[];
  negotiations: { before: number; after: number; note: string; ts: string }[];
  reasons: string[];
  warnings: string[];
};

export type Job = {
  id: string;
  createdAt: string;
  type: string;
  origin: string;
  destination: string;
  distanceMi: number;
  bedrooms: number;
  stairs: boolean;
  elevator: boolean;
  largeItems: string[];
  date: string;
  budget: number;
  notes: string;
  quotes: Quote[];
};

export const activeJob: Job = {
  id: "job_9f3a2b",
  createdAt: "2026-07-18T14:22:00Z",
  type: "Local Move",
  origin: "Charlotte, NC 28202",
  destination: "Atlanta, GA 30303",
  distanceMi: 245,
  bedrooms: 2,
  stairs: true,
  elevator: false,
  largeItems: ["Sectional sofa", "Queen bed", "Dining table (6 seat)", "Piano (upright)", "Peloton"],
  date: "2026-08-01",
  budget: 2200,
  notes: "Third-floor walkup at origin. Piano needs specialty handling.",
  quotes: [
    {
      id: "q_1",
      company: "Blue Ridge Movers",
      phone: "+1 (704) 555-0142",
      rating: 4.8,
      reviews: 1284,
      status: "completed",
      originalPrice: 2450,
      finalPrice: 1980,
      savings: 470,
      trustScore: 94,
      risk: "low",
      hiddenFees: [],
      insurance: true,
      availability: "Aug 1 — 8:00 AM crew of 4",
      cancellation: "Free up to 72h before",
      callDurationSec: 412,
      recordingUrl: "#",
      breakdown: [
        { label: "Base labor (4 movers × 6h)", amount: 1440 },
        { label: "Transportation", amount: 320 },
        { label: "Piano handling", amount: 180 },
        { label: "Full-value insurance", amount: 40 },
      ],
      transcript: [
        { role: "agent", ts: "00:00", text: "Hi, this is an AI assistant calling on behalf of a customer. Do you have a moment to give a ballpark quote?" },
        { role: "business", ts: "00:04", text: "Sure, go ahead." },
        { role: "agent", ts: "00:07", text: "Two-bedroom move, Charlotte to Atlanta, August 1st. Third-floor walkup at origin, includes an upright piano." },
        { role: "business", ts: "00:22", text: "For that route with a piano, we're looking at $2,450 all-in with insurance." },
        { role: "agent", ts: "00:31", text: "I have a verified quote from another provider at $1,850. Is there room to match or improve?" },
        { role: "business", ts: "00:38", text: "We can do $1,980 if we book by end of week. That includes full-value protection." },
        { role: "agent", ts: "00:45", text: "Any weekend surcharge or fuel fee I should know about?" },
        { role: "business", ts: "00:49", text: "No — that price is out-the-door." },
      ],
      negotiations: [
        { before: 2450, after: 2100, note: "Applied competitor benchmark ($1,850)", ts: "00:33" },
        { before: 2100, after: 1980, note: "Locked in early-booking rate", ts: "00:40" },
      ],
      reasons: [
        "Lowest verified out-the-door price",
        "No hidden fees confirmed on transcript",
        "Full-value insurance included",
        "Piano handling built into base quote",
        "94% trust score — 1,284 reviews averaging 4.8★",
      ],
      warnings: [],
    },
    {
      id: "q_2",
      company: "Peachtree Van Lines",
      phone: "+1 (404) 555-0198",
      rating: 4.5,
      reviews: 872,
      status: "completed",
      originalPrice: 2780,
      finalPrice: 2540,
      savings: 240,
      trustScore: 81,
      risk: "medium",
      hiddenFees: ["Fuel surcharge not waived", "Stair fee applies above 2nd floor"],
      insurance: true,
      availability: "Aug 1 — afternoon window",
      cancellation: "50% deposit non-refundable",
      callDurationSec: 356,
      recordingUrl: "#",
      breakdown: [
        { label: "Base labor", amount: 1680 },
        { label: "Transportation", amount: 420 },
        { label: "Fuel surcharge", amount: 190 },
        { label: "Stair fee (3rd floor)", amount: 150 },
        { label: "Insurance", amount: 100 },
      ],
      transcript: [
        { role: "agent", ts: "00:00", text: "Hi, AI assistant calling on behalf of a customer for a moving quote." },
        { role: "business", ts: "00:05", text: "Go ahead." },
        { role: "agent", ts: "00:08", text: "Two-bed, Charlotte to Atlanta, Aug 1, piano, 3rd-floor walkup." },
        { role: "business", ts: "00:20", text: "That's $2,780 with fuel and stair fees." },
        { role: "agent", ts: "00:26", text: "Can the fuel surcharge be waived given the distance is already in the base?" },
        { role: "business", ts: "00:32", text: "I can knock off $240 as a one-time courtesy." },
      ],
      negotiations: [
        { before: 2780, after: 2540, note: "Courtesy discount applied", ts: "00:33" },
      ],
      reasons: [
        "Solid reputation (4.5★, 872 reviews)",
        "Insurance included",
        "Confirmed availability on target date",
      ],
      warnings: [
        "Fuel surcharge could not be fully removed",
        "50% deposit is non-refundable — cancellation risk",
      ],
    },
    {
      id: "q_3",
      company: "QuickHaul Express",
      phone: "+1 (704) 555-0177",
      rating: 3.9,
      reviews: 214,
      status: "completed",
      originalPrice: 1450,
      finalPrice: 1450,
      savings: 0,
      trustScore: 48,
      risk: "high",
      hiddenFees: ["No written estimate offered", "Deposit required over phone"],
      insurance: false,
      availability: "Aug 1 — flexible",
      cancellation: "Deposit non-refundable",
      callDurationSec: 198,
      recordingUrl: "#",
      breakdown: [
        { label: "Flat rate (verbal)", amount: 1450 },
      ],
      transcript: [
        { role: "agent", ts: "00:00", text: "Hi, AI assistant looking for a moving quote — two-bed Charlotte to Atlanta." },
        { role: "business", ts: "00:04", text: "Flat $1,450. Just need a $500 deposit today over the phone." },
        { role: "agent", ts: "00:11", text: "Can you send a written estimate with insurance and cancellation terms?" },
        { role: "business", ts: "00:16", text: "We don't do written estimates — you have my word." },
      ],
      negotiations: [],
      reasons: [],
      warnings: [
        "41% below market average — red flag for bait pricing",
        "Refuses to provide written estimate",
        "No insurance offered",
        "Deposit required over phone before inventory inspection",
      ],
    },
  ],
};

export const dashboardStats = {
  activeNegotiations: 3,
  moneySaved: 710,
  callsCompleted: 3,
  averageDiscountPct: 18,
  trustScore: 92,
};

export const recentJobs = [
  { id: "job_9f3a2b", type: "Local Move", route: "Charlotte → Atlanta", savings: 710, status: "Negotiating" as const, date: "Today" },
  { id: "job_7b1c04", type: "Auto Repair", route: "Timing belt • Honda Civic", savings: 340, status: "Recommended" as const, date: "2d ago" },
  { id: "job_5a09ee", type: "Medical Bill", route: "MRI billing dispute", savings: 1240, status: "Completed" as const, date: "5d ago" },
];
