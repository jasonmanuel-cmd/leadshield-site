import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");

const NOTIFY_EMAILS = [
  "jasonm@coaibakersfield.com",
  "frankh@coaibakersfield.com",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, trade, phone, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 1. Store signup in Supabase
    const { error: dbError } = await supabase.from("beta_signups").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      trade: trade || "Not specified",
      phone: phone || null,
      message: message || null,
      signed_up_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError.message);
      // Continue — still send email even if DB write fails
    }

    const tradeDisplay = trade || "Not specified";
    const phoneDisplay = phone || "Not provided";
    const messageDisplay = message || "No message left";
    const signedUpAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "full",
      timeStyle: "short",
    });

    // 2. Notify team
    await resend.emails.send({
      from: "LeadShield Beta <onboarding@resend.dev>",
      to: NOTIFY_EMAILS,
      subject: `New Beta Signup: ${name.trim()} (${tradeDisplay})`,
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{margin:0;padding:0;background:#080C1E;font-family:Arial,sans-serif;color:#fff}
  .wrap{max-width:580px;margin:0 auto;padding:28px}
  .hdr{background:linear-gradient(135deg,#6A1FB8,#1A6DB5);padding:24px 28px;border-radius:10px 10px 0 0;text-align:center}
  .hdr h1{margin:0;font-size:26px;color:#fff}
  .hdr p{margin:6px 0 0;color:#D4A014;font-size:13px}
  .bdy{background:#0D1230;padding:28px;border-radius:0 0 10px 10px;border:1px solid #1A2550;border-top:none}
  .lbl{color:#8899AA;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;margin-top:18px}
  .val{color:#fff;font-size:15px;font-weight:bold;padding:10px 14px;background:#111840;border-radius:6px;border-left:3px solid #D4A014}
  .badge{display:inline-block;background:#D4A014;color:#080C1E;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:bold;margin-top:22px}
  .foot{text-align:center;margin-top:22px;color:#8899AA;font-size:11px}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>New Beta Signup</h1><p>LeadShield Beta Program</p></div>
  <div class="bdy">
    <div class="lbl">Name</div><div class="val">${name.trim()}</div>
    <div class="lbl">Email</div><div class="val">${email.trim()}</div>
    <div class="lbl">Trade</div><div class="val">${tradeDisplay}</div>
    <div class="lbl">Phone</div><div class="val">${phoneDisplay}</div>
    <div class="lbl">Message</div><div class="val" style="white-space:pre-wrap">${messageDisplay}</div>
    <div class="lbl">Signed Up</div><div class="val">${signedUpAt} PT</div>
    <div style="text-align:center"><span class="badge">BETA APPLICANT</span></div>
  </div>
  <div class="foot">LeadShield Beta &nbsp;·&nbsp; leadshield-crm.vercel.app/beta</div>
</div>
</body></html>`,
    });

    // 3. Confirmation to user
    await resend.emails.send({
      from: "LeadShield <onboarding@resend.dev>",
      to: [email.trim()],
      subject: "You're on the list — LeadShield Beta",
      html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{margin:0;padding:0;background:#080C1E;font-family:Arial,sans-serif;color:#fff}
  .wrap{max-width:580px;margin:0 auto;padding:28px}
  .hdr{background:linear-gradient(135deg,#8B2FDC,#D4A014);padding:32px 28px;border-radius:10px 10px 0 0;text-align:center}
  .hdr h1{margin:0;font-size:34px;color:#fff}
  .hdr p{margin:10px 0 0;color:#fff;font-size:15px;opacity:.9}
  .bdy{background:#0D1230;padding:32px;border-radius:0 0 10px 10px;border:1px solid #1A2550;border-top:none}
  .gold{color:#D4A014;font-weight:bold}
  .feat{padding:11px 15px;background:#111840;border-radius:7px;margin:9px 0;border-left:3px solid #8B2FDC;color:#C0CCE0;font-size:14px}
  .btn{display:inline-block;background:linear-gradient(135deg,#8B2FDC,#D4A014);color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:24px}
  .foot{text-align:center;margin-top:26px;color:#8899AA;font-size:11px}
  p{color:#C0CCE0;line-height:1.75;margin:12px 0}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>You're In.</h1><p>Welcome to the LeadShield Beta Program</p></div>
  <div class="bdy">
    <p>Hey <span class="gold">${name.trim()}</span>,</p>
    <p>You're officially on the list. We're putting the finishing touches on LeadShield and the beta launches in <strong>two weeks</strong>. You'll get an email the moment it goes live with your personal download link and setup guide.</p>
    <p class="gold" style="margin-top:22px;font-size:15px">What you get as a beta tester:</p>
    <div class="feat">HOT / WARM / COLD AI lead scoring — know who to call back first</div>
    <div class="feat">Gemini AI holds your SMS conversations while you're on the job</div>
    <div class="feat">Money Captured tracker — see every dollar the app protects</div>
    <div class="feat">Lead pipeline so no job ever falls through the cracks</div>
    <div class="feat">Google Review automation — fires 24 hrs after job done tap</div>
    <div class="feat">60 days FREE on the Pro tier — no credit card required</div>
    <p style="margin-top:22px">Questions? Reply to this email or reach us at <span class="gold">support@coaibakersfield.com</span></p>
    <div style="text-align:center"><a class="btn" href="https://coaibakersfield.com">Visit Our Website</a></div>
  </div>
  <div class="foot">
    LeadShield &nbsp;·&nbsp; Chaotically Organized AI &nbsp;·&nbsp; Bakersfield, CA<br/>
    <a href="https://coaibakersfield.com" style="color:#8B2FDC">coaibakersfield.com</a>
  </div>
</div>
</body></html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Beta signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
