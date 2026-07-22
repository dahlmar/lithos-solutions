/** Public-page content, ported verbatim from the prototype (index.html). */

export type Service = { no: string; name: string; desc: string };
export type ProcessStep = { n: string; name: string; note: string };

export type MarketingContent = {
  eyebrow: string;
  heroTitle: string;
  heroSub: string;
  services: Service[];
  process: ProcessStep[];
  philosophy: string;
};

export const creative: MarketingContent = {
  eyebrow: "CREATIVE",
  heroTitle: "Creative projects executed with structure.",
  heroSub:
    "Brand, product and digital work delivered with the rigor of an operations team — from first workshop to ongoing support.",
  services: [
    { no: "01", name: "Brand Strategy", desc: "Positioning, narrative and market direction." },
    { no: "02", name: "Identity Design", desc: "Logos, systems and visual language." },
    { no: "03", name: "UI / UX", desc: "Interfaces grounded in real user behavior." },
    { no: "04", name: "Website Development", desc: "Fast, accessible, production-ready builds." },
    { no: "05", name: "Product Design", desc: "End-to-end digital product experiences." },
    { no: "06", name: "Creative Direction", desc: "Consistent craft across every touchpoint." },
    { no: "07", name: "Marketing Assets", desc: "Campaign, social and sales collateral." },
  ],
  process: [
    { n: "1", name: "Discovery", note: "Goals, audience, constraints." },
    { n: "2", name: "Planning", note: "Scope, roadmap, milestones." },
    { n: "3", name: "Design", note: "Systems and detailed craft." },
    { n: "4", name: "Development", note: "Build, test, refine." },
    { n: "5", name: "Delivery", note: "Handoff and launch." },
    { n: "6", name: "Ongoing Support", note: "Iteration and maintenance." },
  ],
  philosophy:
    "We don’t simply hand over assets. Lithos integrates creative work directly into how your business operates — so brand, product and communication stay coherent long after launch.",
};

export const infrastructure: MarketingContent = {
  eyebrow: "INFRASTRUCTURE",
  heroTitle: "Infrastructure designed for growth.",
  heroSub:
    "Sites, facilities and operational systems planned, built, documented and maintained — so your physical foundation scales as fast as your business.",
  services: [
    { no: "01", name: "Site Assessment", desc: "Surveys, feasibility and readiness." },
    { no: "02", name: "Facilities Planning", desc: "Space, layout and capacity design." },
    { no: "03", name: "Construction Management", desc: "Coordination of trades and delivery." },
    { no: "04", name: "Building Systems", desc: "Mechanical, electrical and plumbing." },
    { no: "05", name: "Power & Energy", desc: "Distribution, backup and efficiency." },
    { no: "06", name: "Connectivity", desc: "Structured cabling and networking." },
    { no: "07", name: "Security & Access", desc: "Physical access and monitoring." },
    { no: "08", name: "Process Optimization", desc: "Streamlined operational workflows." },
    { no: "09", name: "Managed Support", desc: "Ongoing maintenance and response." },
  ],
  process: [
    { n: "1", name: "Assessment", note: "Survey current state and needs." },
    { n: "2", name: "Planning", note: "Design, budget and schedule." },
    { n: "3", name: "Implementation", note: "Build and commission." },
    { n: "4", name: "Documentation", note: "As-built records and handover." },
    { n: "5", name: "Maintenance", note: "Ongoing operations and support." },
  ],
  philosophy:
    "Infrastructure is more than a one-time build. Lithos plans, delivers and maintains your operational foundation as a continuous system — documented, resilient and ready to grow with you.",
};
