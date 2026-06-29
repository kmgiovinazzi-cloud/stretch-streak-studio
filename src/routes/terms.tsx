import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Stretchline" },
      { name: "description", content: "The rules for using Stretchline." },
      { property: "og:title", content: "Terms of Service — Stretchline" },
      { property: "og:url", content: "https://stretch-streak-studio.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://stretch-streak-studio.lovable.app/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      <h1 className="font-display text-3xl font-semibold mt-4">Terms of Service</h1>
      <p className="text-xs text-muted-foreground mt-1">Last updated: June 29, 2026</p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-base">1. The service</h2>
          <p>Stretchline is a stretch-tracking and progress-sharing app. You must be at least 13 years old to create an account.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">2. Your content</h2>
          <p>You keep ownership of the photos, videos, and text you upload. By posting you grant Stretchline a limited license to host and display that content to the audiences you choose. Do not upload content you don't have the rights to share.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">3. Acceptable use</h2>
          <p>Do not post nudity, sexual content, hateful or harassing content, content involving minors in unsafe poses, spam, or anything illegal. Do not impersonate others. Do not attempt to scrape, reverse engineer, or attack the service. We may remove content and terminate accounts that violate these rules.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">4. Health disclaimer</h2>
          <p>Stretchline is not medical advice. Stretching carries risk of injury. Consult a qualified coach or medical professional before starting any flexibility program. AI form feedback is informational only.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">5. Account termination</h2>
          <p>You may delete your account at any time from Profile → Settings → Delete account. We may suspend accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">6. No warranty</h2>
          <p>The service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Stretchline is not liable for indirect, incidental, or consequential damages.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">7. Changes</h2>
          <p>We may update these terms. Continued use after changes means you accept the updated terms.</p>
        </section>
      </div>
    </div>
  );
}
