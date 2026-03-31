import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Sterp",
  description: "Privacy Policy for Sterp.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      <div className="mx-auto max-w-2xl px-4 pt-10 pb-16">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image
              src="/logo-black.png"
              alt="Sterp"
              width={150}
              height={50}
              className="h-[50px] w-auto"
              priority
            />
          </Link>
        </div>

        {/* Content card */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="text-[28px] font-semibold text-neutral-900 tracking-tight [font-family:var(--font-space-grotesk)]">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1 mb-8">
            Last updated: March 31, 2026
          </p>

          <p className="text-[15px] text-neutral-600 leading-relaxed mb-6">
            Sterp (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) is operated by Cameron Scott. This policy explains what data we collect, why, and what we do with it.
          </p>

          <Section title="What We Collect">
            <p>
              <strong className="text-neutral-900">Account information.</strong> When you sign up, we collect your email address and, if you use Google sign-in, your name and profile photo. You also choose a username and may add a display name, bio, avatar, and social media links.
            </p>
            <p className="mt-3">
              <strong className="text-neutral-900">Product content.</strong> The products you add to your page — names, one-liners, photos, and any archive notes you write — are stored in our database. Photos are stored in Supabase Storage.
            </p>
            <p className="mt-3">
              <strong className="text-neutral-900">Click data.</strong> When a visitor clicks a &ldquo;View Product&rdquo; link on any Sterp page, we log that click, including the product, the page owner, the referring URL (if available), and a timestamp. We track this to measure how the platform is used and to support future revenue sharing with page owners.
            </p>
            <p className="mt-3">
              <strong className="text-neutral-900">Authentication data.</strong> We use Supabase Auth, which handles email/password credentials, magic link tokens, and Google OAuth tokens. We do not store your password directly — Supabase manages this securely.
            </p>
            <p className="mt-3">
              <strong className="text-neutral-900">Basic usage data.</strong> Supabase provides basic infrastructure-level analytics (database queries, storage usage). We do not run Google Analytics or any third-party tracking scripts on Sterp.
            </p>
          </Section>

          <Section title="How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To operate your Sterp page and display it publicly at <code className="text-[13px] bg-neutral-100 px-1 py-0.5 rounded">sterp.com/username</code></li>
              <li>To track clicks on product links (for platform analytics and future revenue sharing)</li>
              <li>To rewrite product links with affiliate tags (see Affiliate Links below)</li>
              <li>To send transactional emails (magic link sign-in, account-related notices)</li>
              <li>To fix bugs and improve the product</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data. We do not run ads.
            </p>
          </Section>

          <Section title="Affiliate Links">
            <p>
              Product links on Sterp pages may include affiliate tags (such as Amazon Associates tags). When a visitor clicks a product link and makes a purchase, Sterp may earn a commission from the retailer. This happens automatically — page owners do not manage affiliate links directly.
            </p>
            <p className="mt-3">
              We track clicks to measure affiliate performance and to support a future revenue-sharing program with page owners. Click data is associated with the page owner&apos;s account and the specific product.
            </p>
          </Section>

          <Section title="What's Public">
            <p>
              Your Sterp page is public by design. Once your page is live (2+ products with photos), anyone with your link can see your username, name, avatar, bio, social links, product photos, product names, one-liners, and archive notes. This is the core product — there&apos;s no private mode.
            </p>
            <p className="mt-3">
              Draft products (without photos) and products you delete are not visible to anyone.
            </p>
          </Section>

          <Section title="Data Storage and Security">
            <p>
              Your data is stored in Supabase (hosted on AWS infrastructure). Photos are stored in Supabase Storage. We use row-level security policies in our database and HTTPS everywhere. We don&apos;t store passwords — authentication is handled by Supabase Auth.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-neutral-900">Supabase</strong> — database, authentication, file storage</li>
              <li><strong className="text-neutral-900">Vercel</strong> — hosting and deployment</li>
              <li><strong className="text-neutral-900">Amazon Associates</strong> — affiliate link program (clicks that go to Amazon are subject to Amazon&apos;s privacy policy)</li>
              <li><strong className="text-neutral-900">Google OAuth</strong> — if you sign in with Google</li>
            </ul>
          </Section>

          <Section title="Your Choices">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-neutral-900">Edit or delete your content.</strong> You can edit or delete any product, collection, or profile information from your dashboard at any time.</li>
              <li><strong className="text-neutral-900">Delete your account.</strong> Email <a href="mailto:cam@sterp.com" className="text-neutral-900 underline">cam@sterp.com</a> to request full account deletion. We&apos;ll remove your account, all products, photos, and associated data. Click history may be retained in anonymized form for aggregate analytics.</li>
              <li><strong className="text-neutral-900">Export your data.</strong> Email <a href="mailto:cam@sterp.com" className="text-neutral-900 underline">cam@sterp.com</a> and we&apos;ll provide a copy of your data.</li>
            </ul>
          </Section>

          <Section title="Children">
            <p>
              Sterp is not intended for anyone under 13. We do not knowingly collect data from children under 13. If you believe a child has created an account, contact us and we&apos;ll remove it.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this policy. If we make significant changes, we&apos;ll note it here with an updated date. Continued use after changes means you accept the new policy.
            </p>
          </Section>

          <Section title="Contact" last>
            <p>
              Questions? Email <a href="mailto:cam@sterp.com" className="text-neutral-900 underline">cam@sterp.com</a>.
            </p>
          </Section>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-8"}>
      <h2 className="text-[17px] font-semibold text-neutral-900 mb-2">{title}</h2>
      <div className="text-[15px] text-neutral-600 leading-relaxed">{children}</div>
    </div>
  );
}
