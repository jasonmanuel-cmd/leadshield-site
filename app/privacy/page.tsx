export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">LeadShield Privacy Policy</h1>
        <p className="text-gray-400 mb-8">
          Effective Date: June 10, 2026 · Last Updated: June 10, 2026
          <br />
          Service: LeadShield CRM & Missed Call System · Provider: Chaotically Organized AI
          <br />
          Contact:{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>
        </p>

        <div className="rounded-xl p-5 mb-10 border-2 border-purple-700/40"
          style={{ background: 'rgba(168,85,247,0.06)' }}>
          <p className="font-bold text-white text-lg mb-2">Our Commitment to Your Privacy</p>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-300">
            <li><strong className="text-purple-300">We do not sell your personal data.</strong> Period.</li>
            <li><strong className="text-purple-300">We do not share your data for advertising or marketing purposes.</strong></li>
            <li>Client phone numbers and lead data are stored in encrypted databases with row-level security — each client can only see their own data.</li>
            <li>We collect only the minimum data required to deliver the missed-call detection, auto-reply SMS, and CRM dashboard features.</li>
          </ul>
        </div>

        <Section title="1. Data We Collect and Why">
          <SubSection title="1.1 Call Metadata">
            <strong>What we collect:</strong> Incoming caller phone number, called number (your tracking number), timestamp of the call, and call disposition (missed, answered).
            <br /><br />
            <strong>Why:</strong> This is required to detect missed calls, log leads in the CRM, and trigger the auto-reply SMS to the caller.
            <br /><br />
            <strong>Storage:</strong> Stored in encrypted Supabase Postgres database with row-level security. Retained as part of your lead history.
          </SubSection>

          <SubSection title="1.2 SMS Content">
            <strong>What we collect:</strong> The auto-reply SMS message content (configured by you) and confirmation that the message was sent.
            <br /><br />
            <strong>Why:</strong> To send the automated reply to your missed callers and log the communication in your CRM history.
            <br /><br />
            <strong>Storage:</strong> Message templates are stored in your account settings. Delivery logs are stored as part of the lead record.
          </SubSection>

          <SubSection title="1.3 Account Information">
            <strong>What we collect:</strong> Business name, email address, account password (hashed), and telephony configuration (tracking phone number, forwarding number).
            <br /><br />
            <strong>Why:</strong> Required to create and manage your account, authenticate you to the CRM dashboard, and route calls correctly.
          </SubSection>

          <SubSection title="1.4 CRM Lead Data">
            <strong>What we collect:</strong> Lead contact name, notes, status changes, callback timestamps, and any custom fields you fill in.
            <br /><br />
            <strong>Why:</strong> To provide the CRM pipeline management features you explicitly use.
          </SubSection>

          <SubSection title="1.5 Website Usage Data">
            <strong>What we collect:</strong> Standard web server logs (IP address, browser type, pages accessed) and anonymized analytics via Vercel Analytics.
            <br /><br />
            <strong>Why:</strong> For site operation, performance monitoring, and improving the user experience. This data is anonymized and not linked to your personal identity.
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Data">
          <SubSection title="2.1 Missed Call Detection & Auto-Reply">
            When a call to your tracking number goes unanswered, our system detects the missed call, looks up your SMS template, and sends an automated reply to the caller. This is the core function of the service.
          </SubSection>

          <SubSection title="2.2 CRM Dashboard">
            All missed calls are logged as leads in your CRM dashboard. You can update lead statuses, add notes, and manage your pipeline from the web interface at leadshield.live.
          </SubSection>

          <SubSection title="2.3 Account Management">
            Your email and business information are used to authenticate you, communicate service updates, and process account-related requests.
          </SubSection>
        </Section>

        <Section title="3. Data We Do NOT Collect">
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>We do not record call audio or listen to conversations</li>
            <li>We do not access your device microphone, camera, or file system</li>
            <li>We do not track your activity across other websites or apps</li>
            <li>We do not use advertising SDKs or ad identifiers</li>
            <li>We do not collect any data from children</li>
            <li>We do not sell or share your personal data with third parties for any commercial purpose</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing">
          <p className="mb-3 font-medium text-white">We do not sell your data.</p>
          <p className="mb-3">LeadShield does not rent, sell, or share your personal information with third parties for their own marketing or advertising purposes.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Telnyx (telephony provider):</strong> Call metadata (caller number, called number) is transmitted to Telnyx to route calls and deliver SMS messages. This is required for the core service to function.</li>
            <li><strong>Supabase (database provider):</strong> All persistent data is stored in Supabase Postgres, hosted on AWS. Row-level security ensures data isolation between clients.</li>
            <li><strong>Vercel (hosting provider):</strong> The CRM dashboard and website are hosted on Vercel. Standard web server logs are collected per Vercel&apos;s policies.</li>
            <li><strong>Resend (email provider):</strong> If email notifications are enabled, your email address and notification content are processed by Resend for delivery.</li>
            <li><strong>Legal compliance:</strong> We may disclose information if required by law, court order, or governmental regulation.</li>
          </ul>
        </Section>

        <Section title="5. Data Storage & Security">
          <SubSection title="5.1 Database Storage">
            All data is stored in an encrypted Supabase Postgres database. Row-level security (RLS) restricts access so that each client can only see their own data. Connections are encrypted via TLS 1.3.
          </SubSection>

          <SubSection title="5.2 Passwords">
            Account passwords are hashed using bcrypt and stored in Supabase Auth. We never store or transmit plain-text passwords.
          </SubSection>

          <SubSection title="5.3 Data Isolation">
            Each client account is fully isolated. No client can access another client&apos;s leads, settings, or configuration. Admin access is restricted via a separate authentication token.
          </SubSection>
        </Section>

        <Section title="6. Data Retention & Deletion">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 pr-4 text-gray-400">Data Type</th>
                <th className="text-left py-2 pr-4 text-gray-400">Storage Location</th>
                <th className="text-left py-2 text-gray-400">Retention Period</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Lead records (call logs + CRM data)</td>
                <td className="py-2 pr-4">Supabase</td>
                <td className="py-2">Until account is terminated; auto-purged 90 days after account deletion</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Account settings & templates</td>
                <td className="py-2 pr-4">Supabase</td>
                <td className="py-2">Until account is terminated or user modifies them</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">SMS delivery logs</td>
                <td className="py-2 pr-4">Supabase</td>
                <td className="py-2">Retained as part of lead record</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Web server logs</td>
                <td className="py-2 pr-4">Vercel</td>
                <td className="py-2">Per Vercel&apos;s data retention policy</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Telnyx call records</td>
                <td className="py-2 pr-4">Telnyx</td>
                <td className="py-2">Per Telnyx&apos;s data retention policy</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
            <p className="text-sm font-semibold text-cyan-300 mb-1">Data deletion on account termination</p>
            <p className="text-sm leading-relaxed text-gray-300">
              When an account is terminated, all associated data is automatically purged within 90 days. Contact us at any time to request expedited data deletion.
            </p>
          </div>
        </Section>

        <Section title="7. Third-Party Services">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Telnyx</strong> — Voice and SMS routing. Call metadata and message content are processed by Telnyx to deliver the core service. Governed by Telnyx&apos;s privacy policy.</li>
            <li><strong>Supabase</strong> — Database and authentication provider. All persistent data is stored in Supabase Postgres with row-level security. Governed by Supabase&apos;s privacy policy.</li>
            <li><strong>Vercel</strong> — Web hosting provider for the CRM dashboard and website. Standard web server logs collected per Vercel&apos;s policies.</li>
            <li><strong>Resend</strong> — Email delivery provider for account notifications and password resets. Email content processed per Resend&apos;s privacy policy.</li>
          </ul>
        </Section>

        <Section title="8. Children&apos;s Privacy">
          LeadShield is a business productivity tool designed for professional contractors, tradespeople, and business owners aged 18 and older. We do not knowingly collect any personal information from children under 13. If you believe a child has provided personal data, contact{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>{" "}
          and we will delete the data immediately.
        </Section>

        <Section title="9. Your Rights & Choices">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Access your data</strong> — All data collected is visible within the CRM dashboard at leadshield.live/crm.</li>
            <li><strong>Export your data</strong> — Contact us to request a copy of your data in a portable format.</li>
            <li><strong>Delete your data</strong> — Contact us at any time to request full data deletion.</li>
            <li><strong>Request full data deletion</strong> — Email{" "}
              <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
                privacy@coaibakersfield.com
              </a>{" "}
              with &quot;Data Deletion Request&quot; in the subject line. We will process all requests within 30 days.
            </li>
          </ul>
        </Section>

        <Section title="10. California Residents (CCPA)">
          If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
          <ul className="list-disc list-inside space-y-1 text-gray-300 mt-2">
            <li><strong>Right to Know:</strong> You may request disclosure of the personal information we collect, use, and share.</li>
            <li><strong>Right to Delete:</strong> You may request deletion of your personal information that we hold.</li>
            <li><strong>Right to Opt-Out:</strong> We do not sell personal information — but you have the right to opt out of any future sale should our practices change.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any CCPA right.</li>
          </ul>
          <p className="mt-2 text-sm text-gray-300">
            To make a CCPA request, email{" "}
            <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
              privacy@coaibakersfield.com
            </a>{" "}
            with &quot;CCPA Request&quot; in the subject line.
          </p>
        </Section>

        <Section title="11. Policy Updates">
          <p className="mb-2">We may update this Privacy Policy from time to time to reflect changes in the service, legal requirements, or our data practices.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>When we make material changes, the &quot;Last Updated&quot; date at the top of this page will be revised.</li>
            <li>For significant changes, we will notify account holders via email.</li>
            <li>We encourage you to review this policy periodically for any updates.</li>
          </ul>
        </Section>

        <Section title="12. Contact">
          <strong className="text-white">Chaotically Organized AI</strong>
          <br />
          <a href="https://coaibakersfield.com" className="text-purple-400 underline">
            https://coaibakersfield.com
          </a>
          <br />
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>
          <br />
          <a href="mailto:support@coaibakersfield.com" className="text-purple-400 underline">
            support@coaibakersfield.com
          </a>
          <br /><br />
          <p className="text-gray-300">
            We respond to all privacy inquiries within 5 business days. If you have questions about this policy,
            your data, or your privacy rights, please reach out.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-3 border-b border-gray-800 pb-2">
        {title}
      </h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pl-4 border-l-2 border-purple-800">
      <h3 className="text-base font-medium text-purple-300 mb-1">{title}</h3>
      <div className="text-gray-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
