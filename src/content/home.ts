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
    eyebrow: "01 — Ethos",
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
    eyebrow: "02 — Services",
    heading: "Design and development, end-to-end",
    intro:
      "We help small and medium sized businesses create polished digital experiences — from brand and design to content management systems, integrations, analytics, performance, and custom web applications.",
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
    eyebrow: "03 — About",
    heading: "Your team of two",
    intro:
      "You work directly with the two people making your site — a designer and an engineer, with a combined 18 years of experience. No handoffs, no account managers, no drift.",
    people: [
      {
        role: "Design",
        name: "Sarah Dempsey",
        href: "https://www.linkedin.com/in/sasdempsey/",
        placeholder: "Designer portrait",
        portrait: {
          src: "https://cdn.sanity.io/images/8l26et78/production/0de5c9458da0b2950778d729166f3792ff2c3c16-1122x1402.png",
          alt: "Sarah Dempsey smiling in a denim shirt.",
          sizes:
            "(min-width: 1200px) 528px, (min-width: 640px) calc(50vw - 3.5rem), calc(100vw - 3rem)",
          quality: 75,
          placeholder: "blur",
          blurDataURL:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAIAAAC+dZmEAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFYklEQVR4nE3QaVATZwDG8f3a6YQcm2Rz35CQg3AGSShKEDmEoBSpKAMKKIpIFdAiWiBodcCD08iIqeMBLQVx0CrjWA+0UBXFiyJHIYRcuzkghITPnSTi+J939ttvnndfAEEQK2L1Z7PZ7L4cvhYXF51LS84lp3PJm3NpadnpXF5edi0vu1yuFZcLQGDEinzWNqv1M7Y7rFar0WiY183qZv8zGQ0Oh935lVzD3uW16bVxw4L+xd9Dt7quatvPtZ09dfPXjtcvhhEY9sMV/1lZ8eM1abXZbXaT0fDkwb2m2kp1cXZ5TnLm+rCsTfKGmiOjI88ddruf+QO8s1+u7evD2Kj2bG1z2fa+uuKb1bvLVPLNUUG7VMprmqa5mWk/dvsOgMDwl5s77Hazyfjobt+Vn0sHGw/P/NEy1dfeU3+wNGPDjk3yukP7Rp7+tbS46Ha73SveDwD7+owdjtmZqVvatqvVe4daj0/1tE3f7nysOVW7a8v2BFlxdtqtG1rYbPK43d5xL7ZYYIsFgWGr76kn3o91N5/srMi7f+bQPx31Q5r6wfPHzhRuzVSIs+Jlmga1bmbKt+zDFl8wDNusVgRBPrwavt1a319XMtRc9UZ7ZviS+ml7jebHnMwYwcbwQHX5vvG3o37pxWaz2YstFhuCWMzmV08fDjTVPmosH7tcP9F1YfK3lqleTU9dyfZYoZxPLs3dMvz4gWvZ+RU2e0MQxLCgf3C7p7N6f391wfPGytH22vfa05M9bb11+3d+J5JxCTnJsXd7rjvsNo9n1eN2AyajybyG52Znrne0HstTaUuzn52peHOx/p32l1edJ5tLtqkieTIOIT1Wek1zwWIyeFZXvctGg9FkMplNJgSGJyc+NqqPb42LVOdufna+arKr6d/u8wOny4qSZPIgcjQPSokWXmyoW9DNejwe77JhYcLrjUbYYnn3+uVPB/eGcOnp0WJtRf7IpZqh1qPnijYniGmhTHBdIDk5it94onzm07gXe9zAgl5vWDAYjUadTjd4pz8/K41OQAuoYHmGvO9E3u9VO8pSw6NYoJSOk3FJG0LYR4tzR0eGXC6XF+v183q9/uP4p97+gcpDB2OkAgiL4pDBIqW4szS9oTAtTSYQUDBCCkbKJMiCqLkZiQO93XabzbO6Cujn58cnPnXe6MnKLZRKhEwICxEIkkB24cbQ4zuTf0hLFQaLyXgMA/w2kIqXCIJSktPa2y/Nzek8Hg8wNzc3+PBJ7r7D3OAQGoQj4VAEAlEiCFLFyZLi44VR8RBLhEUHEAK+oVGo3DClTHWgtObiw2ejjsVFYGpqWnPlmkKZQqOQafgAAhYVgCNQOQJhRCxTIsfzwvEUNoRDMyGQyRMzY7ZJMk+klLQ2XPnz47QOeDP29ljNKXFIGBWPpoAoEARRJBYYFEUNTwSDFTimiEqh8ih4AZvBFsWw1ueLs9TygpYCdXfX/ZfAnXuDOfl7uFwuBQwg4nFYMieAJcUKFFjRBgwvikDl0CGQTQJZTA5ZqGDE5Yu+r4ne3ayquFrZchdobGpTxCfTaTQyEY8hsdCcKBxfgQmMQfHWYVghEOT9FypEJDKCcXwFOTpbqDqyLq8xsaQju+omkL/nAF8cQSFTSRR6ADscI04khmwEBQosXwGyJBSIyCYTGJxgPF+B4ccRIrZwNh0QZ9VE72pS7u8E5MpUCktApLKJLCFaEIcLS4fCUvHiBFCkxLNDKRCRQ2cwJOvBkBR0cDwuTIWPLaAmlUtyzsYUXQbYokg0hYdhBGMDZWhRIj4igxShIkhTcJIkkBsJEUk0OoccmoKRpqMECahQFSo6F1KWinPOyfdq/wepKCKow8oZhQAAAABJRU5ErkJggg==",
          objectPosition: "50% 32%",
        },
        bio: "Leads brand, layout, type, and the feel of every interaction — turning your goals into a site that's clear, credible, and specific to you.",
      },
      {
        role: "Engineering",
        name: "Danny Welstad",
        href: "https://www.linkedin.com/in/danny-welstad",
        placeholder: "Engineer portrait",
        portrait: {
          src: "https://cdn.sanity.io/images/8l26et78/production/b0aadf4658b7659ac399d1ff09d88417e9ffd4c8-3692x5538.jpg",
          alt: "Danny Welstad smiling in a green jacket.",
          sizes:
            "(min-width: 1200px) 528px, (min-width: 640px) calc(50vw - 3.5rem), calc(100vw - 3rem)",
          quality: 75,
          placeholder: "blur",
          blurDataURL:
            "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAeABQDASIAAhEBAxEB/8QAHAAAAQMFAAAAAAAAAAAAAAAAAAUGBwECAwQI/8QAKBAAAgEDAgYABwAAAAAAAAAAAQIDAAQFBhEHEhMhMVEIFTJBcYGh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwL/xAAbEQACAgMBAAAAAAAAAAAAAAAAAQIREiExUf/aAAwDAQACEQMRAD8AmjtHGzkdlBJ2q3T2Q+aW5mEDRLuQAx3JFM7ibryDR1kiLF1rydTyL9lHs1q4rVhweIwc4C3EOQj6spA25NzRuVNeFpRxd9JWVBtRVIZVliSRO6sAw/dFKGco/EPNKdZhX7RrGoXenJCBNwm07dkkGPqREj1vS3x90amWtIsvFMIpIUKupH1beKWdJaYjveFmm8a0gHM3WdvYJ8UDW2VRI+Bk6mEsHHgwof5RWa1hS0toreIbJGoUfgUU5J//2Q==",
          objectPosition: "50% 28%",
        },
        bio: "Leads build, performance, and integrations — making the design hold up in the real world: fast, responsive, and easy to maintain.",
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
