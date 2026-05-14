export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">LeadShield Privacy Policy</h1>
        <p className="text-gray-400 mb-8">
          Effective Date: May 14, 2026 · Last Updated: May 14, 2026
          <br />
          App Name: LeadShield · Developer: Chaotically Organized AI
          <br />
          Contact:{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>
        </p>

        {/* CRITICAL — Google requires this up front */}
        <div className="rounded-xl p-5 mb-10 border-2 border-purple-700/40"
          style={{ background: 'rgba(168,85,247,0.06)' }}>
          <p className="font-bold text-white text-lg mb-2">Our Commitment to Your Privacy</p>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-300">
            <li><strong className="text-purple-300">We do not sell your personal data.</strong> Period.</li>
            <li><strong className="text-purple-300">We do not share your data for purposes facilitating sale or advertising.</strong></li>
            <li>On <strong>Free</strong> and <strong>Pro</strong> tiers, all call, SMS, and contact data stays on your device — nothing is uploaded to any server.</li>
            <li>On the <strong>Operator</strong> tier, cloud sync is opt-in, encrypted, and limited to lead/conversation data for the CRM dashboard.</li>
            <li>We collect only the minimum data required to deliver the auto-reply and AI conversation features you explicitly enable.</li>
          </ul>
        </div>

        <Section title="1. Data We Collect and Why">
          <p className="mb-3">LeadShield accesses the following data on your Android device. Each permission is used solely for its stated purpose. No data is collected or transmitted without clear justification.</p>

          <SubSection title="1.1 Phone State (READ_PHONE_STATE)">
            <strong>What we access:</strong> Incoming phone call state (ringing, answered, missed, ended).
            <br /><br />
            <strong>Why:</strong> This is the core function of the app. Without monitoring call state, LeadShield cannot detect missed calls. We read the phone number of the incoming caller and the call state transition (missed vs. answered).
            <br /><br />
            <strong>Storage:</strong> Processed entirely on device. Never transmitted off your device on Free and Pro tiers.
          </SubSection>

          <SubSection title="1.2 Call Log (READ_CALL_LOG — Android API 32 and below)">
            <strong>What we access:</strong> Call log entry for incoming calls (caller number, call duration, call type: missed/answered).
            <br /><br />
            <strong>Why:</strong> To confirm that an incoming call was genuinely missed before sending an auto-reply. We verify the call was not answered or rejected by you.
            <br /><br />
            <strong>Limitation:</strong> On Android 13+ (API 33+), the app uses Phone State listener only — the call log permission is not requested on those devices.
            <br /><br />
            <strong>Storage:</strong> We do not copy, store, or upload your full call log. Only the missed-call indicator is used momentarily in memory.
          </SubSection>

          <SubSection title="1.3 Send SMS (SEND_SMS)">
            <strong>What we access:</strong> Ability to send one SMS message per missed call.
            <br /><br />
            <strong>Why:</strong> This is the app&apos;s primary function — sending your customized auto-reply message to callers you missed. We send exactly one SMS per missed call, to the number that called you, containing only the message you configured.
            <br /><br />
            <strong>Storage:</strong> A record of the sent reply (phone number, timestamp, and message text) is stored locally in your reply history log.
          </SubSection>

          <SubSection title="1.4 Receive SMS (RECEIVE_SMS — Operator Tier Only)">
            <strong>What we access:</strong> SMS messages received from callers after the initial auto-reply has been sent.
            <br /><br />
            <strong>Why (Operator tier only):</strong> The AI conversation feature reads incoming SMS replies to continue the conversation automatically. Google Gemini processes the message content to extract job details, urgency, and the caller&apos;s needs so you receive a complete lead summary.
            <br /><br />
            <strong>Opt-in:</strong> This is only active on the Operator tier and requires explicit user consent within the app.
          </SubSection>

          <SubSection title="1.5 Contacts (READ_CONTACTS — Optional)">
            <strong>What we access:</strong> Contact names and phone numbers from your device contact list.
            <br /><br />
            <strong>Why:</strong> To display caller names in your reply history and to support the optional &quot;Reply to Contacts Only&quot; Spam Shield mode.
            <br /><br />
            <strong>User control:</strong> Contacts access is optional, off by default, and can be revoked at any time in Android Settings. The app works fully without this permission.
          </SubSection>

          <SubSection title="1.6 Device Information">
            <strong>What we collect:</strong> Android OS version, device model, app version, and anonymized crash/error logs.
            <br /><br />
            <strong>Why:</strong> For analytics, troubleshooting, and ensuring compatibility. This is standard device information collected automatically by Google Play Console and crash reporting frameworks.
            <br /><br />
            <strong>Storage:</strong> Anonymized. Not linked to your identity, SMS content, or call history.
          </SubSection>

          <SubSection title="1.7 Notifications (POST_NOTIFICATIONS)">
            <strong>What we use:</strong> Android notification channel for foreground service.
            <br /><br />
            <strong>Why:</strong> Android requires foreground services (needed for reliable call monitoring) to display a persistent notification. This lets you see that LeadShield is actively monitoring for missed calls.
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Data">
          <SubSection title="2.1 Auto-Reply to Missed Calls">
            When you miss a call during active hours, LeadShield sends a pre-defined SMS to the caller&apos;s phone number. The message content is configured entirely by you.
          </SubSection>

          <SubSection title="2.2 AI Conversation Continuation (Operator Tier)">
            On the Operator tier, after the initial auto-reply is sent, Google Gemini AI reads incoming SMS replies and can continue the conversation — collecting job details, confirming urgency, answering basic questions, and summarizing the lead. This is an opt-in feature that only activates for replies to your auto-reply messages.
          </SubSection>

          <SubSection title="2.3 Caller Identification &amp; Spam Filter">
            If you grant contacts access, the app can display the caller&apos;s name from your contacts and optionally restrict auto-replies to known contacts only (Spam Shield mode).
          </SubSection>

          <SubSection title="2.4 Foreground Service for Call Monitoring">
            LeadShield runs a persistent foreground service to reliably detect incoming calls and missed-call events. This is standard Android practice for apps that need continuous background monitoring.
          </SubSection>

          <SubSection title="2.5 Lead Management &amp; CRM Dashboard (Operator Tier)">
            Operator subscribers can opt into cloud sync to view leads, AI conversation threads, and analytics on the web CRM dashboard at leadshield.live. Data synced includes anonymized lead information and conversation summaries.
          </SubSection>
        </Section>

        <Section title="3. Data We Do NOT Collect">
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>We do not record call audio or listen to conversations</li>
            <li>We do not access your microphone, camera, or photo gallery</li>
            <li>We do not access your location data</li>
            <li>We do not access your file system or media</li>
            <li>We do not track your activity across other apps or websites</li>
            <li>We do not use advertising SDKs or ad identifiers (IDFA/GAID)</li>
            <li>We do not collect any data from children</li>
            <li>We do not sell or share your personal data with third parties for any commercial purpose</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing">
          <p className="mb-3 font-medium text-white">We do not sell your data.</p>
          <p className="mb-3">LeadShield does not rent, sell, or share your personal information with third parties for their own marketing or advertising purposes. We do not share personal data for purposes facilitating the sale of goods or services.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Free and Pro tiers:</strong> Zero data sharing. All data remains on your device.</li>
            <li><strong>Operator tier (if cloud sync is enabled):</strong> Lead and conversation data is transmitted to Supabase (hosted on AWS) solely to power the CRM dashboard. Phone numbers are hashed before transmission.</li>
            <li><strong>Google Gemini AI (Operator tier):</strong> If you enable AI conversations, incoming reply text is sent to the Gemini API for processing. No personal identifiers are included.</li>
            <li><strong>Legal compliance:</strong> We may disclose information if required by law, court order, or governmental regulation.</li>
          </ul>
        </Section>

        <Section title="5. Data Storage &amp; Security">
          <SubSection title="5.1 On-Device Storage (All Tiers)">
            All personal data — reply history, app preferences, message templates, contact cache — is stored locally in Android DataStore and a local SQLite database, both protected by Android&apos;s application sandbox. No cloud upload occurs on Free and Pro tiers.
          </SubSection>

          <SubSection title="5.2 Cloud Storage (Operator Tier Only — Opt-In)">
            If you enable cloud sync, data is transmitted over HTTPS (TLS 1.3) and stored in an encrypted Supabase Postgres database on AWS infrastructure (us-west-1). Row-Level Security (RLS) restricts access to your account only. You can disable sync at any time in app Settings.
          </SubSection>

          <SubSection title="5.3 No Server-Side Collection">
            LeadShield operates as a local-first app. The app does not have a server that collects, stores, or processes your call data, SMS content, or contacts. The only exception is the Operator-tier CRM sync, which is fully opt-in.
          </SubSection>
        </Section>

        <Section title="6. Data Retention &amp; Deletion">
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
                <td className="py-2 pr-4">Reply history (recent SMS sent)</td>
                <td className="py-2 pr-4">Local device</td>
                <td className="py-2">Max 20 entries, oldest auto-rotated</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">App preferences &amp; settings</td>
                <td className="py-2 pr-4">Local device</td>
                <td className="py-2">Until app is uninstalled</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Message templates</td>
                <td className="py-2 pr-4">Local device</td>
                <td className="py-2">Until edited or deleted by user</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4">Device info / crash logs</td>
                <td className="py-2 pr-4">Google Play Console</td>
                <td className="py-2">Per Google Play&apos;s data retention policy</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Cloud-synced CRM data</td>
                <td className="py-2 pr-4">Supabase (Operator only)</td>
                <td className="py-2">Until operator tier expires or user requests deletion; auto-purged 90 days after account termination</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)' }}>
            <p className="text-sm font-semibold text-cyan-300 mb-1">No server-side data storage</p>
            <p className="text-sm leading-relaxed text-gray-300">
              LeadShield does not operate servers that collect or store your data. On Free and Pro tiers, absolutely no data leaves your device. On the Operator tier, only the data you explicitly sync is transmitted to the cloud.
            </p>
          </div>
          <div className="mt-3 p-4 rounded-xl" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.18)' }}>
            <p className="text-sm font-semibold text-yellow-300 mb-1">Uninstalling removes all local data</p>
            <p className="text-sm leading-relaxed text-gray-300">
              When you uninstall LeadShield from your device, all locally stored data (reply history, preferences, templates) is removed immediately. No residual data remains on your device.
            </p>
          </div>
        </Section>

        <Section title="7. Third-Party Services">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              <strong>Google Play Billing</strong> — All subscription payments are processed by Google Play&apos;s billing system. We receive only a purchase confirmation token and timestamp. Google&apos;s privacy policy applies to all payment transactions.
            </li>
            <li>
              <strong>Google Gemini AI (Operator tier)</strong> — The AI conversation feature sends incoming SMS reply text to the Google Gemini API for natural language processing. No personal identifiers (name, phone number) are included in API calls. This is an opt-in feature.
            </li>
            <li>
              <strong>Supabase (Operator tier)</strong> — Encrypted Postgres database hosted on AWS (us-west-1) for CRM dashboard sync. Row-Level Security is enforced. Access is limited to your authenticated account and the developer for maintenance purposes.
            </li>
            <li>
              <strong>Google Play Console</strong> — Standard anonymized crash reporting (Android vitals) and device analytics. Governed by Google&apos;s privacy policy.
            </li>
            <li>
              <strong>Vercel</strong> — The web dashboard (leadshield.live) is hosted on Vercel. Standard web server logs (IP address, browser type, page accessed) are collected per Vercel&apos;s standard logging practices.
            </li>
          </ul>
        </Section>

        <Section title="8. Children&apos;s Privacy">
          LeadShield is a business productivity tool designed for professional contractors, tradespeople, and business owners aged 18 and older. We do not knowingly collect any personal information from children under 13. If you believe a child has provided personal data through the app, contact{" "}
          <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
            privacy@coaibakersfield.com
          </a>{" "}
          and we will delete the data immediately.
        </Section>

        <Section title="9. Your Rights &amp; Choices">
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Access your data</strong> — All data collected by the app is visible within the App itself. Navigate to the reply history log to see sent messages and timestamps.</li>
            <li><strong>Delete local data</strong> — Clear your reply history directly from within the App at any time. Uninstall the app to remove all locally stored data.</li>
            <li><strong>Control permissions</strong> — You can revoke any Android permission (Contacts, Phone, SMS) at any time through your device Settings. The app will continue to function with reduced features.</li>
            <li><strong>Opt out of cloud sync</strong> — Operator tier users can disable cloud sync in App Settings at any time. Synced data will be retained per the retention policy unless you request deletion.</li>
            <li><strong>Request full data deletion</strong> — Email{" "}
              <a href="mailto:privacy@coaibakersfield.com" className="text-purple-400 underline">
                privacy@coaibakersfield.com
              </a>{" "}
              with &quot;Data Deletion Request&quot; in the subject line. We will process all requests within 30 days.
            </li>
            <li><strong>Use the deletion form</strong> — Prefer a form? Use the <a href="/delete-account" className="text-purple-400 underline">account deletion request form</a>.</li>
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
          <p className="mb-2">We may update this Privacy Policy from time to time to reflect changes in the app, legal requirements, or our data practices.</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>When we make material changes, the &quot;Last Updated&quot; date at the top of this page will be revised.</li>
            <li>For significant changes, we will notify users via an in-app notification or update prompt on the next app update.</li>
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
