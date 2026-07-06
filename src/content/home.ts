import type { HomePageContent } from "@/lib/cms";

export const homePageContent = {
  title: "fufu studio",
  description:
    "Building bespoke sites & software for businesses who care how they show up online",
  heroCta: {
    label: "Start a project",
    href: "#contact",
  },
  ethos: {
    eyebrow: "01 - Ethos",
    heading: "Look as good online as you feel in real life",
    items: [
      {
        tag: "Quality",
        body: "Every decision has a rationale. We sweat the details and never take shortcuts that compromise the final result.",
      },
      {
        tag: "Custom",
        body: "No templates, no page builders. Everything is designed and built from scratch to achieve your goals.",
      },
      {
        tag: "Outcomes-driven",
        body: "Our work makes your business more profitable, and elevates your brand to the next chapter of its growth.",
      },
    ],
  },
  services: {
    eyebrow: "02 - Services",
    heading: "Design and development, end-to-end",
    intro:
      "We help small and medium sized businesses create polished digital experiences - from brand and design to content management systems, integrations, analytics, performance, and custom web applications.",
    items: [
      {
        num: "01",
        title: "Brand & Website Launches",
        summary:
          "For new businesses, rebrands, or companies that need a polished first impression.",
        capabilities: [
          "Digital Strategy",
          "UI/UX Design",
          "Copywriting",
          "Full-Stack Development",
          "WordPress CMS",
        ],
      },
      {
        num: "02",
        title: "Website Redesigns",
        summary:
          "For businesses with outdated, slow, confusing, or hard-to-manage websites.",
        capabilities: [
          "UI/UX Design",
          "Full-Stack Development",
          "Search Engine Optimization",
          "Performance",
          "Accessibility",
        ],
      },
      {
        num: "03",
        title: "Landing Pages & Campaign Sites",
        summary:
          "For product launches, marketing campaigns, and pages built to convert a single audience.",
        capabilities: [
          "Digital Strategy",
          "Copywriting",
          "UI/UX Design",
          "Analytics & Conversion Tracking",
          "Search Engine Optimization",
        ],
      },
      {
        num: "04",
        title: "E-Commerce & Booking Experiences",
        summary:
          "For companies that need commerce, booking, forms, CRM, email, or marketing workflows.",
        capabilities: [
          "Full-Stack Development",
          "API & Third-Party Integrations",
          "Hubspot Integration",
          "Email Automation",
          "Analytics & Conversion Tracking",
        ],
      },
      {
        num: "05",
        title: "Custom Web Applications",
        summary:
          "For businesses that need something beyond a standard website.",
        capabilities: [
          "Custom API Development",
          "Full-Stack Development",
          "API & Third-Party Integrations",
          "UI/UX Design",
          "Security & Maintenance",
        ],
      },
      {
        num: "06",
        title: "Ongoing Website Care",
        summary:
          "For ongoing SEO, analytics, performance, content, and technical support.",
        capabilities: [
          "Search Engine Optimization",
          "Performance",
          "Analytics & Conversion Tracking",
          "Security & Maintenance",
          "Content Management Systems",
        ],
      },
    ],
  },
  about: {
    eyebrow: "03 - About",
    heading: "Your team of two",
    intro:
      "You work directly with the two people making your site - a designer and an engineer, with a combined 18 years of experience. No handoffs, no account managers, no drift.",
    people: [
      {
        role: "Design",
        name: "Sarah Dempsey",
        href: "https://www.linkedin.com/in/sasdempsey/",
        placeholder: "Designer portrait",
        bio: "Leads brand, layout, type, and the feel of every interaction - turning your goals into a site that's clear, credible, and specific to you.",
      },
      {
        role: "Engineering",
        name: "Danny Welstad",
        href: "https://www.linkedin.com/in/danny-welstad",
        placeholder: "Engineer portrait",
        bio: "Leads build, performance, and integrations - making the design hold up in the real world: fast, responsive, and easy to maintain.",
      },
    ],
  },
  contact: {
    heading: "Let's make something",
    intro:
      "Tell us about your project. We reply to notes within two business days.",
    email: "hello@fufu.studio",
  },
} satisfies HomePageContent;
