export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">LeadShield Privacy Policy</h1>
        <p className="text-gray-400 mb-8">
          Effective Date: April 30, 2026 · Last Updated: April 30, 2026
          <br />
          App Name: LeadShield · Developer: Chaotically Organized AI
          <br />
          Contact:{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>
        </p>

        <Section title="1. Overview">
          LeadShield is an Android application that automatically sends a customizable SMS reply when
          you miss a phone call. This Privacy Policy explains exactly what data the App accesses, how
          it is used, where it is stored, and your rights over it.
          <br /><br />
          We collect the minimum data required to make the App work. We do not sell your data. We do
          not share your data with advertisers. We do not use your data for any purpose beyond
          providing the features described in this policy.
        </Section>

        <Section title="2. Data We Access and Why">
          <SubSection title="2.1 Phone State (READ_PHONE_STATE)">
            <strong>Why we need it:</strong> This is the core function of the App. Without monitoring
            call state, the App cannot detect missed calls. This data is never transmitted off your
            device.
          </SubSection>

          <SubSection title="2.2 Call Log (READ_CALL_LOG)">
            <strong>Why we need it:</strong> To confirm that an incoming call was genuinely missed
            (versus answered) before sending an auto-reply. We do not copy, store, or upload your
            full call log.
          </SubSection>

          <SubSection title="2.3 Send SMS (SEND_SMS)">
            <strong>Why we need it:</strong> This is the App&apos;s primary function — sending your
            customized auto-reply message to callers you missed. We send exactly one SMS per missed
            call, to the number that called you, containing only the message you configured.
          </SubSection>

          <SubSection title="2.4 Contacts (READ_CONTACTS)">
            <strong>Why we need it:</strong> To display caller names in your reply history and to
            support the optional &quot;Reply to Contacts Only&quot; Spam Shield feature. Contacts
            access is optional and off by default.
          </SubSection>

          <SubSection title="2.5 Notifications (POST_NOTIFICATIONS)">
            Android requires foreground services to show a notification. This lets you see that
            LeadShield is actively monitoring.
          </SubSection>

          <SubSection title="2.6 Reply History Log (Local Storage Only)">
            Stores: caller phone number, caller name, message sent, timestamp. Maximum 20 entries.
            Stored only on your device. Never transmitted off your device on Free or Pro tiers.
          </SubSection>

          <SubSection title="2.7 Cloud Sync (Operator Tier Only)">
            Operator tier subscribers have anonymized lead and conversation data synced to a secure
            Supabase (Postgres) database hosted on AWS. This is required for the CRM dashboard
            feature. Phone numbers are hashed before transmission. You can disable sync in Settings
            at any time.
          </SubSection>
        </Section>

        <Section title="3. Data We Do NOT Collect">
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>We do not record call audio or content</li>
            <li>We do not access your microphone</li>
            <li>We do not read incoming SMS messages</li>
            <li>We do not access your camera, location, photos, or files</li>
            <li>We do not track your activity across other apps</li>
            <li>We do not use advertising SDKs</li>
            <li>We do not sell or share your data with third parties for advertising</li>
          </ul>
        </Section>

        <Section title="4. Data Storage and Security">
          <strong>On-device:</strong> All personal data is stored in Android DataStore and a local
          SQLite database protected by Android&apos;s application sandbox.
          <br /><br />
          <strong>Cloud (Operator tier only):</strong> Data is transmitted over HTTPS (TLS 1.2
          minimum) and stored in an encrypted Supabase database with Row-Level Security enabled.
          Access is restricted to the authenticated user and the developer.
        </Section>

        <Section title="5. Data Retention">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 pr-4 text-gray-400">Data</th>
                <th className="text-left py-2 pr-4 text-gray-400">Where</th>
                <th className="text-left py-2 text-gray-400">Retention</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Reply history</td>
                <td className="py-2 pr-4">Local device</td>
                <td className="py-2">Max 20 entries, auto-rotated</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">App settings</td>
                <td className="py-2 pr-4">Local device</td>
                <td className="py-2">Until app uninstall</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Cloud sync data</td>
                <td className="py-2 pr-4">Supabase (Operator only)</td>
                <td className="py-2">90 days, then auto-purged</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="6. Third-Party Services">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              <strong>Google Play Billing</strong> — All subscription payments processed by Google.
              We receive only a purchase confirmation token.
            </li>
            <li>
              <strong>Google Gemini AI (Operator tier)</strong> — AI conversation feature sends
              incoming message text to Gemini API. No personal identifiers included. Opt-in feature.
            </li>
            <li>
              <strong>Supabase (Operator tier)</strong> — Secure Postgres database for CRM sync.
              Hosted on AWS. RLS-protected.
            </li>
          </ul>
        </Section>

        <Section title="7. Children's Privacy">
          LeadShield is a business productivity tool for users 18 and older. We do not knowingly
          collect data from minors. Contact{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>{" "}
          if you believe a minor has used the App.
        </Section>

        <Section title="8. Your Rights">
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>See your data — all data is visible within the App</li>
            <li>Delete your data — clear history from within the App at any time</li>
            <li>Opt out of cloud sync — disable in Settings (Operator tier)</li>
            <li>
              Request full data deletion — email{" "}
              <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
                privacy@coaibakersfield.com
              </a>{" "}
              with &quot;Data Deletion Request&quot; — processed within 30 days
            </li>
            <li>
              Prefer a form? Use the <a href="/delete-account" className="text-purple-400 underline">account deletion request form</a>.
            </li>
          </ul>
        </Section>

        <Section title="9. California Residents (CCPA)">
          California residents have the right to know what personal information is collected,
          request deletion, and not be discriminated against for exercising privacy rights. We do
          not sell personal information. To make any CCPA request, contact{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>
          .
        </Section>

        <Section title="10. Changes to This Policy">
          We will update this policy when the App changes or law requires it. The &quot;Last
          Updated&quot; date at the top will reflect any changes.
        </Section>

        <Section title="11. Contact">
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
          <br />
          We respond to all privacy inquiries within 5 business days.
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
