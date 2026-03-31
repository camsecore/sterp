import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Sterp",
  description: "Terms of Service for Sterp.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1 mb-8">
            Last updated: March 31, 2026
          </p>

          <p className="text-[15px] text-neutral-600 leading-relaxed mb-6">
            Sterp is operated by Cameron Secore (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). By using Sterp, you agree to these terms.
          </p>

          <Section title="What Sterp Is">
            <p>
              Sterp is a personal product page. You create an account, add products you use, write honest one-liners about them, and share your page with people who trust your recommendations. That&apos;s it.
            </p>
          </Section>

          <Section title="Your Account">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You need an account to create a Sterp page.</li>
              <li>You must provide accurate information when signing up.</li>
              <li>You&apos;re responsible for keeping your login credentials secure.</li>
              <li>One account per person. Don&apos;t create accounts for other people or organizations.</li>
              <li>
                Your username becomes your permanent public URL (<code className="text-[13px] bg-neutral-100 px-1 py-0.5 rounded">sterp.com/username</code>). Choose carefully — usernames cannot be changed through the app. Contact us if you need help.
              </li>
            </ul>
          </Section>

          <Section title="Your Content">
            <p>
              You own the content you post on Sterp — your photos, product names, one-liners, and archive notes. By posting content on Sterp, you grant us a non-exclusive, worldwide, royalty-free license to display, distribute, and reproduce that content as part of operating the Sterp platform. This means we can show your public page to visitors, include your content in social preview cards, and display it as intended across devices.
            </p>
            <p className="mt-3">
              You can delete your content at any time through your dashboard. Deleting content removes it from your public page and our active database. Cached versions may persist briefly in CDN or browser caches.
            </p>
          </Section>

          <Section title="What You Agree To">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-neutral-900">Post real content.</strong> Sterp is built on authenticity. Your photos should be your own — real products in your real life. Stock photos, manufacturer images, and AI-generated photos are not allowed.
              </li>
              <li>
                <strong className="text-neutral-900">Write honest takes.</strong> Your one-liners should reflect your actual opinion. You don&apos;t have to love everything on your page, but you shouldn&apos;t post reviews you were paid to write or misrepresent your experience with a product.
              </li>
              <li>
                <strong className="text-neutral-900">Don&apos;t abuse the platform.</strong> Don&apos;t use Sterp to spam, harass, impersonate others, post illegal content, or manipulate affiliate links.
              </li>
              <li>
                <strong className="text-neutral-900">Respect intellectual property.</strong> Don&apos;t post content that infringes someone else&apos;s copyright or trademarks.
              </li>
            </ul>
          </Section>

          <Section title="Affiliate Links">
            <p>
              Product links on Sterp pages may include affiliate tags managed by us. When visitors click these links and make purchases, Sterp may earn a commission. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>We may add, modify, or replace affiliate tags on product links displayed on your page.</li>
              <li>Sterp currently retains all affiliate revenue. A future revenue-sharing program may be introduced — we&apos;ll update these terms and notify users if and when that happens.</li>
              <li>You do not manage affiliate links directly. Links are handled through our backend.</li>
            </ul>
          </Section>

          <Section title="Prohibited Content">
            <p>Don&apos;t post content that:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Is illegal or promotes illegal activity</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Harasses, threatens, or bullies others</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or phishing links</li>
              <li>Impersonates another person or brand</li>
              <li>Is spam or primarily exists to manipulate affiliate commissions</li>
              <li>Consists of stock photos, manufacturer product shots, or AI-generated images presented as your own</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove content or suspend accounts that violate these terms.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You can stop using Sterp at any time. To delete your account and all associated data, email <a href="mailto:cam@sterp.com" className="text-neutral-900 underline">cam@sterp.com</a>.
            </p>
            <p className="mt-3">
              We may suspend or terminate your account if you violate these terms. We&apos;ll try to give you notice first, but reserve the right to act immediately for serious violations.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              Sterp&apos;s name, logo, design, and code are our property. Your content is your property. We don&apos;t claim ownership over what you post.
            </p>
          </Section>

          <Section title="Disclaimer">
            <p>
              Sterp is provided &ldquo;as is.&rdquo; We make no warranties about uptime, reliability, or fitness for any particular purpose. Product recommendations on Sterp pages are the opinions of individual users — not endorsements by Sterp.
            </p>
            <p className="mt-3">
              We are not responsible for the accuracy of product information, the quality of recommended products, or any purchases you make through links on Sterp pages.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Sterp and its operator are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim related to Sterp is limited to the amount you paid us (which, for free accounts, is $0).
            </p>
          </Section>

          <Section title="Disputes">
            <p>
              These terms are governed by the laws of the United States. Any disputes will be resolved through binding arbitration rather than court, except for claims that qualify for small claims court. You agree to resolve disputes on an individual basis — no class actions.
            </p>
          </Section>

          <Section title="Changes to These Terms">
            <p>
              We may update these terms. If we make significant changes, we&apos;ll note it here with an updated date. Continued use after changes means you accept the new terms.
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
