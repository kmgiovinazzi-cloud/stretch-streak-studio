import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Stretchline" },
      { name: "description", content: "How Stretchline collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — Stretchline" },
      { property: "og:url", content: "https://stretch-streak-studio.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://stretch-streak-studio.lovable.app/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
      <h1 className="font-display text-3xl font-semibold mt-4">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground mt-1">Last updated: June 29, 2026</p>

      <div className="prose prose-invert mt-6 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-base">1. What we collect</h2>
          <p>When you create a Stretchline account we store your email address, display name, username, optional bio, country, discipline, styles, and profile photo. As you use the app we store the stretch logs you enter (duration, optional notes), the photos and videos you upload, your goal folders, routines, follows, and likes.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">2. How we use your data</h2>
          <p>We use your data to operate the app: show your streak, calculate the leaderboard, render the feed, deliver search results, and serve your photos and videos to people you allow. We do not sell your personal data.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">3. Who can see your content</h2>
          <p>Profiles, posts, folders, and routines are visible to other signed-in users by default. If you mark your profile private, only accepted followers can view your posts and media. Stretch log notes are private and only visible to you.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">4. AI form feedback</h2>
          <p>When you request AI form feedback on a photo, the image URL is sent to our AI provider (Google Gemini via the Lovable AI Gateway) for the sole purpose of generating coaching feedback. We do not send your name, email, or other identifying profile data.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">5. Storage and security</h2>
          <p>Data is stored on Lovable Cloud (Supabase). Access is protected by Row-Level Security policies so users can only read or modify their own private data. Passwords are hashed; we never see them.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">6. Your rights</h2>
          <p>You can edit your profile at any time. You can permanently delete your account and all associated data (logs, posts, folders, routines, photos, videos, follows, likes) from Profile → Settings → Delete account. Deletion is immediate and irreversible.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">7. Children</h2>
          <p>Stretchline is not directed to children under 13. If you believe a child has provided personal data, contact us and we will delete it.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">8. Contact</h2>
          <p>Questions about this policy: <a className="text-primary" href="mailto:support@stretchline.app">support@stretchline.app</a>.</p>
        </section>
      </div>
    </div>
  );
}
