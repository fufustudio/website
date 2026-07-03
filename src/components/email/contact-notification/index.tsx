export function ContactNotificationEmail({
  email,
  message,
  source,
}: {
  email: string;
  message: string;
  source: string;
}) {
  return (
    <div>
      <h1>New website contact</h1>
      <p>A visitor sent a message from the {source} page.</p>
      <dl>
        <dt>Email</dt>
        <dd>{email}</dd>
        <dt>Message</dt>
        <dd>{message}</dd>
        <dt>Source</dt>
        <dd>{source}</dd>
      </dl>
    </div>
  );
}
