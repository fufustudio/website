import { render } from "@react-email/render";
import type { ContactInquiry } from "@/contracts/contact";

export function renderContactEmail(inquiry: ContactInquiry) {
  return render(<ContactEmail inquiry={inquiry} />);
}

function ContactEmail({ inquiry }: { inquiry: ContactInquiry }) {
  return (
    <html lang="en">
      {}
      <head>
        <title>New website contact</title>
      </head>
      <body>
        <main>
          <h1>New website contact.</h1>
          <dl>
            <dt>Name</dt>
            <dd>{inquiry.name}</dd>
            <dt>Email</dt>
            <dd>{inquiry.email}</dd>
            <dt>Interest</dt>
            <dd>{inquiry.interest || "-"}</dd>
          </dl>
          <h2>Message</h2>
          {inquiry.message.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </main>
      </body>
    </html>
  );
}
