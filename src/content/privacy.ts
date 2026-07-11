import type { SiteSettings } from "@/data/site-settings";
import { publicEnv } from "@/config/env";

type PrivacySection = {
  title: string;
  body: string[];
  links?: Array<{
    label: string;
    href: string;
  }>;
};

export type PrivacyContent = {
  effectiveDate: string;
  businessName: string;
  contactEmail: string;
  hasGoogleAnalytics: boolean;
  providers: string[];
  sections: PrivacySection[];
};

export function getPrivacyContent(siteSettings: SiteSettings): PrivacyContent {
  const businessName = siteSettings.name;
  const contactEmail = siteSettings.email || "hello@fufu.studio";
  const hasGoogleAnalytics = Boolean(publicEnv.googleAnalyticsMeasurementId);
  const providers = [
    "Vercel",
    "Vercel Analytics",
    "Vercel Speed Insights",
    ...(hasGoogleAnalytics ? ["Google Analytics"] : []),
    "Resend, when contact form delivery is configured",
    "Upstash, for contact-form abuse prevention",
    "Google Workspace or your email provider",
    "Sanity, when CMS content is configured",
  ];

  return {
    effectiveDate: "July 10, 2026",
    businessName,
    contactEmail,
    hasGoogleAnalytics,
    providers,
    sections: [
      {
        title: "Who We Are",
        body: [
          `This website is operated by ${businessName}.`,
          `Contact us at ${contactEmail}.`,
        ],
      },
      {
        title: "Information We Collect",
        body: [
          "We may collect information visitors submit through the contact form, including name, email address, optional interest, message content, and basic technical information needed to deliver and protect the site.",
          "We may also collect aggregate usage and performance information through configured analytics and hosting tools.",
        ],
      },
      {
        title: "How We Use Information",
        body: [
          "We use submitted information to respond to inquiries, provide requested information, maintain the website, measure site performance, understand aggregate usage, and prevent abuse.",
        ],
      },
      {
        title: "Analytics And Cookies",
        body: [
          "This website may use Vercel Analytics and Vercel Speed Insights to understand site usage and performance.",
          ...(hasGoogleAnalytics
            ? [
                "This website is configured to use Google Analytics. Google may receive information about visitor interactions with this site and may process that information according to its own policies and settings.",
              ]
            : []),
        ],
        links: hasGoogleAnalytics
          ? [
              {
                label: "How Google uses information from sites or apps",
                href: "https://policies.google.com/technologies/partner-sites",
              },
              {
                label: "Google Analytics opt-out browser add-on",
                href: "https://tools.google.com/dlpage/gaoptout",
              },
            ]
          : undefined,
      },
      {
        title: "Contact Form And Email",
        body: [
          "When a visitor submits the contact form, we use the submitted details to respond to the inquiry. If Resend is configured, the site sends the inquiry through the server-side contact route to the configured recipient inbox.",
          "The contact route uses Upstash to enforce a shared request limit. It sends a one-way hash of the visitor's network address as the limiter key rather than storing the address in plain text.",
          "Treat submitted messages as untrusted visitor-provided text in inboxes, CRMs, automations, and dashboards.",
        ],
      },
      {
        title: "Service Providers",
        body: [
          "We use the providers below to host, operate, measure, protect, and respond through this website when their corresponding features are configured.",
        ],
      },
      {
        title: "Data Sharing",
        body: [
          "We share visitor information with service providers only as needed for the site features, hosting, analytics, communication, and abuse prevention described in this policy.",
        ],
      },
      {
        title: "Retention",
        body: [
          "We keep information for as long as needed to respond to inquiries, maintain business records, operate the site, and meet legal or operational needs.",
        ],
      },
      {
        title: "Security",
        body: [
          "We use reasonable technical and organizational measures for this small public website, but no website or internet transmission can be guaranteed to be completely secure.",
        ],
      },
      {
        title: "Your Choices",
        body: [
          `Visitors may contact ${contactEmail} to ask about their submitted information.`,
          "Visitors can also use browser settings or privacy tools to limit cookies or tracking, though some site features may not work as intended.",
        ],
      },
      {
        title: "Children",
        body: [
          "This website is intended for a general audience and is not directed to children. We do not knowingly collect information from children through the site.",
        ],
      },
      {
        title: "Updates",
        body: [
          "This policy may be updated when site features, providers, or data practices change. The effective date above will be updated when the policy materially changes.",
        ],
      },
    ],
  };
}
