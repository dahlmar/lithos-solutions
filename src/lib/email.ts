import "server-only";

/**
 * Transactional email via Resend's REST API. Fail-soft by design: when
 * RESEND_API_KEY isn't configured the send is skipped (and logged) so the
 * calling mutation still succeeds — email is a side effect, never a gate.
 */

const SITE_URL = "https://www.lithossolutions.com";
const FROM = process.env.EMAIL_FROM ?? "Lithos Solutions <info@lithossolutions.com>";

type SendResult = { sent: boolean; reason?: string };

export async function sendEmail(
  to: string,
  subject: string,
  bodyHtml: string,
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`email skipped (no RESEND_API_KEY): "${subject}" → ${to}`);
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html: wrap(bodyHtml) }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`email failed (${res.status}): ${detail}`);
      return { sent: false, reason: `Resend responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("email failed:", err);
    return { sent: false, reason: "Network error while sending" };
  }
}

/** Shared shell so every notification looks like it came from the same firm. */
function wrap(inner: string): string {
  return `
  <div style="background:#111111;padding:40px 16px;font-family:Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto">
      <div style="text-align:center;letter-spacing:0.4em;color:#F5F5F3;font-size:18px;font-weight:600;padding-left:0.4em">LITHOS</div>
      <div style="text-align:center;letter-spacing:0.3em;color:#8A8A8A;font-size:10px;margin-top:6px;padding-left:0.3em">SOLUTIONS</div>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:28px;margin-top:28px;color:#d9d9d6;font-size:14px;line-height:1.6">
        ${inner}
      </div>
      <div style="text-align:center;color:#5c5c5c;font-size:11px;margin-top:20px">
        <a href="${SITE_URL}/login" style="color:#1FB07C;text-decoration:none">Open your portal</a>
      </div>
    </div>
  </div>`;
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function deliverableStatusEmail(opts: {
  to: string;
  deliverableName: string;
  projectName: string;
  status: "in_review" | "delivered";
}): Promise<SendResult> {
  const { to, deliverableName, projectName, status } = opts;
  const headline =
    status === "in_review" ? "Ready for your review" : "Deliverable delivered";
  const line =
    status === "in_review"
      ? "is ready for your review — open the portal to approve it or request changes."
      : "has been delivered. You can find it in your portal.";
  return sendEmail(
    to,
    `${headline}: ${deliverableName}`,
    `<h2 style="margin:0 0 12px;color:#F5F5F3;font-size:18px">${headline}</h2>
     <p><strong>${esc(deliverableName)}</strong> on ${esc(projectName)} ${line}</p>`,
  );
}

export function invoiceIssuedEmail(opts: {
  to: string;
  number: string;
  amount: string;
  projectName: string;
  dueOn: string | null;
}): Promise<SendResult> {
  const { to, number, amount, projectName, dueOn } = opts;
  return sendEmail(
    to,
    `Invoice ${number} from Lithos Solutions`,
    `<h2 style="margin:0 0 12px;color:#F5F5F3;font-size:18px">Invoice ${esc(number)}</h2>
     <p>A new invoice for <strong>${esc(projectName)}</strong> is available in your portal.</p>
     <p style="font-size:20px;color:#F5F5F3;margin:16px 0 4px">${esc(amount)}</p>
     ${dueOn ? `<p style="color:#8A8A8A;margin:0">Due ${esc(dueOn)}</p>` : ""}`,
  );
}

export function invoiceReminderEmail(opts: {
  to: string;
  number: string;
  amount: string;
  projectName: string;
  dueOn: string | null;
  overdue: boolean;
}): Promise<SendResult> {
  const { to, number, amount, projectName, dueOn, overdue } = opts;
  const headline = overdue ? "Payment overdue" : "Payment reminder";
  return sendEmail(
    to,
    `${headline}: invoice ${number}`,
    `<h2 style="margin:0 0 12px;color:#F5F5F3;font-size:18px">${headline}</h2>
     <p>A friendly reminder that invoice <strong>${esc(number)}</strong> for ${esc(projectName)} is awaiting payment.</p>
     <p style="font-size:20px;color:#F5F5F3;margin:16px 0 4px">${esc(amount)}</p>
     ${dueOn ? `<p style="color:#8A8A8A;margin:0">${overdue ? "Was due" : "Due"} ${esc(dueOn)}</p>` : ""}`,
  );
}

export function inviteEmail(opts: { to: string; name: string }): Promise<SendResult> {
  const { to, name } = opts;
  return sendEmail(
    to,
    "Your Lithos Solutions portal access",
    `<h2 style="margin:0 0 12px;color:#F5F5F3;font-size:18px">Welcome${name ? `, ${esc(name)}` : ""}</h2>
     <p>You now have access to the Lithos Solutions portal. There is no password —
     sign in with this email address and we'll send you a one-time code.</p>
     <p style="margin-top:16px"><a href="${SITE_URL}/login" style="color:#1FB07C">Sign in to the portal →</a></p>`,
  );
}
