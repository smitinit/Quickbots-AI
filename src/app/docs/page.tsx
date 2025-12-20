import Link from "next/link";

const setupSteps = [
  {
    title: "1. Create a workspace bot",
    body: `Head to /bots and click “Create bot”. Name it something meaningful for your workspace or client, then hit Generate to let QuickBots supply the initial persona/config for you.`,
  },
  {
    title: "2. Configure your bot with AI assist",
    body: `Use the Config tab to customize your bot's persona, thesis, greetings, and settings. Click the AI generate buttons next to each field to automatically create content based on your bot's context, or manually edit any field to match your brand voice.`,
  },
  {
    title: "3. Review runtime & quotas",
    body: `Visit the Runtime tab to adjust rate limits, token quotas, and failover models. This keeps API costs predictable while protecting your apps from abuse.`,
  },
  {
    title: "4. Embed the widget or API",
    body: `Head to the “Embed / Talka API” tab (soon renamed to QuickBots API) to grab the script snippet or REST details. Drop the widget into your Next.js site or call the API from your existing stack.`,
  },
  {
    title: "5. Monitor & iterate",
    body: `The analytics sidebar shows usage, latency, and guardrail hits. Iterate on copy, prompts, or overrides right inside the dashboard, and hit “Preview” to check everything before publishing.`,
  },
];

const templateIdeas = [
  {
    name: "SaaS Onboarding Copilot",
    description:
      "Guides new users through product setup, handles billing FAQs, and escalates to human success managers when needed.",
  },
  {
    name: "E-commerce Concierge",
    description:
      "Helps shoppers compare products, check inventory, and follow up on shipping — works on both web storefront and embedded support portal.",
  },
  {
    name: "Internal IT Triage Bot",
    description:
      "Automates first-line IT support: password resets, VPN setup, policy FAQs, and collects context before handing off tickets.",
  },
];

export default function DocsPage() {
  return (
    <section className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            QuickBots Docs
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Build chatbots end-to-end in minutes
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            This guide walks through creating, configuring, and embedding a bot
            with QuickBots. Use it as a playbook for your product, support, or
            ops teams.
          </p>
        </div>

        <div className="grid gap-6">
          {setupSteps.map((step) => (
            <article
              key={step.title}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wide text-primary mb-2">
              Need inspiration?
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              Template suggestions while you build
            </h3>
            <p className="text-sm text-muted-foreground">
              When creating a bot, pick a target use case or customize one of
              these starting points:
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {templateIdeas.map((template) => (
              <div
                key={template.name}
                className="rounded-2xl border border-border/40 bg-background/80 p-4 shadow-inner"
              >
                <h4 className="font-semibold text-foreground">
                  {template.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/70 p-6">
          <div>
            <h5 className="text-lg font-semibold text-foreground">
              Ready to build?
            </h5>
            <p className="text-sm text-muted-foreground">
              Hop into your dashboard to create a workspace bot, or explore the
              API reference for custom flows.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bots"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
