"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Code,
  FileText,
  Rocket,
  Settings,
  Zap,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const CDN_URL =
  "https://quickbot-ai.smit090305.workers.dev/v1/quickbot.iife.js";

const navSections = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "installation", label: "Installation", icon: Zap },
  { id: "frameworks", label: "Framework Guides", icon: Code },
  { id: "api-reference", label: "API Reference", icon: FileText },
  { id: "configuration", label: "Configuration", icon: Settings },
];

interface CodeBlockProps {
  code: string;
  id: string;
  copiedCode: string | null;
  onCopy: (text: string, id: string) => void;
}

const CodeBlock = ({ code, id, copiedCode, onCopy }: CodeBlockProps) => (
  <div className="relative group">
    <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
      <code className="whitespace-pre">{code}</code>
    </pre>
    <button
      onClick={() => onCopy(code, id)}
      className="absolute top-2 right-2 p-2 bg-background border border-border rounded hover:bg-muted transition"
      title="Copy code"
    >
      {copiedCode === id ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  </div>
);

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Auto-update active section based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all sections
    navSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        sectionRefs.current[section.id] = element;
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar Navigation - Hidden on mobile */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card/50 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs text-center text-muted-foreground mt-1">
                <Badge variant="outline">v1.0.0</Badge>
              </p>
            </div>
            <nav className="space-y-1">
              {navSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document
                        .getElementById(section.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-12">
          {/* Getting Started */}
          <section
            id="getting-started"
            className="space-y-4 sm:space-y-6 mb-12 sm:mb-16"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                QuickBots Documentation
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Embed intelligent chatbots into any website or application in
                minutes. QuickBots provides a powerful, customizable chatbot
                widget that works seamlessly across all frameworks.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What is QuickBots?</CardTitle>
                <CardDescription>
                  QuickBots is a modern chatbot widget that can be embedded into
                  any website or web application. It supports dark mode, file
                  uploads, streaming responses, and much more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>
                      Zero dependencies - works with any framework or vanilla
                      HTML
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Automatic dark mode detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>File upload support (images, PDFs, and more)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Streaming AI responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Fully customizable appearance and behavior</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Installation */}
          <section
            id="installation"
            className="space-y-4 sm:space-y-6 mb-12 sm:mb-16"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Installation
              </h2>
              <p className="text-muted-foreground">
                Get started with QuickBots in seconds. Choose the method that
                works best for your project.
              </p>
            </div>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl">
                  CDN Link
                  <Badge variant="default" className="text-xs">
                    Recommended
                  </Badge>
                </CardTitle>
                <CardDescription>
                  The fastest way to get started. Just add a script tag to your
                  HTML.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Production CDN:</p>
                  <CodeBlock
                    code={CDN_URL}
                    id="cdn-url"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Basic Script Tag:</p>
                  <CodeBlock
                    code={`<script
  src="${CDN_URL}"
  data-bot-id="YOUR_BOT_ID"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
  defer
></script>`}
                    id="basic-script"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Note</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Replace{" "}
                    <code className="bg-background px-1 py-0.5 rounded">
                      YOUR_BOT_ID
                    </code>{" "}
                    with your actual bot ID from the QuickBots dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Your Bot ID</CardTitle>
                <CardDescription>
                  You need a bot ID to use the widget. Here&apos;s how to get
                  one:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        Create a bot
                      </p>
                      <p className="text-muted-foreground">
                        Go to your{" "}
                        <Link
                          href="/bots"
                          className="text-primary hover:underline"
                        >
                          dashboard
                        </Link>{" "}
                        and click &quot;Create bot&quot;
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        Configure your bot
                      </p>
                      <p className="text-muted-foreground">
                        Customize the bot&apos;s name, greeting message, and
                        appearance in the Config tab
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        Copy your Bot ID
                      </p>
                      <p className="text-muted-foreground">
                        Find your Bot ID in the bot settings or the API/connect
                        tab. It looks like:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          a1b2c3d4-e5f6-7890-abcd-ef1234567890
                        </code>
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* Framework Guides */}
          <section
            id="frameworks"
            className="space-y-4 sm:space-y-6 mb-12 sm:mb-16"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Framework Guides
              </h2>
              <p className="text-muted-foreground">
                Step-by-step instructions for integrating QuickBots into your
                favorite framework.
              </p>
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 overflow-x-auto">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                <TabsTrigger value="vue">Vue</TabsTrigger>
                <TabsTrigger value="angular">Angular</TabsTrigger>
              </TabsList>

              {/* HTML */}
              <TabsContent value="html" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vanilla HTML</CardTitle>
                    <CardDescription>
                      The simplest integration - just add a script tag!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Complete HTML Example:
                      </p>
                      <CodeBlock
                        code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <!-- QuickBots Widget -->
  <script
    src="${CDN_URL}"
    data-bot-id="YOUR_BOT_ID"
    defer
></script>
</body>
</html>`}
                        id="html-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Tip</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The{" "}
                        <code className="bg-background px-1 py-0.5 rounded">
                          defer
                        </code>{" "}
                        attribute ensures the script loads after the page
                        content, improving performance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* React */}
              <TabsContent value="react" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>React</CardTitle>
                    <CardDescription>
                      Integrate QuickBots into your React application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using useEffect Hook:
                      </p>
                      <CodeBlock
                        code={`import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load QuickBots script
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h1>My React App</h1>
    </div>
  );
}

export default App;`}
                        id="react-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using Custom Element (Alternative):
                      </p>
                      <CodeBlock
                        code={`import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load QuickBots script
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.defer = true;
    document.body.appendChild(script);

    // Create widget after script loads
    script.onload = () => {
      if (window.QuickBot) {
        window.QuickBot.init({
          botId: 'YOUR_BOT_ID',
        });
      }
    };

    return () => {
      if (window.QuickBot) {
        window.QuickBot.destroy('YOUR_BOT_ID');
      }
      document.body.removeChild(script);
    };
  }, []);

  return <div>My React App</div>;
}`}
                        id="react-custom-element"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Next.js */}
              <TabsContent value="nextjs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Next.js</CardTitle>
                    <CardDescription>
                      Add QuickBots to your Next.js application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium">
                          Using next/script:
                        </p>
                        <Badge variant="default">Recommended</Badge>
                      </div>
                      <CodeBlock
                        code={`import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Script
        src="${CDN_URL}"
        data-bot-id="YOUR_BOT_ID"
        strategy="afterInteractive"
      />
    </>
  );
}`}
                        id="nextjs-script"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using Custom Component:
                      </p>
                      <CodeBlock
                        code={`'use client';

import { useEffect } from 'react';

export function QuickBotWidget({ botId }: { botId: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.setAttribute('data-bot-id', botId);
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector(\`script[data-bot-id="\${botId}"]\`);
      if (existing) {
        document.body.removeChild(existing);
      }
    };
  }, [botId]);

  return null;
}

// Usage in your layout or page:
// <QuickBotWidget botId="YOUR_BOT_ID" />`}
                        id="nextjs-component"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Note</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For Next.js App Router, use{" "}
                        <code className="bg-background px-1 py-0.5 rounded">
                          &apos;use client&apos;
                        </code>{" "}
                        directive. For Pages Router, you can use the script tag
                        directly in _app.tsx or _document.tsx.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vue */}
              <TabsContent value="vue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vue.js</CardTitle>
                    <CardDescription>
                      Integrate QuickBots into your Vue application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using Composition API:
                      </p>
                      <CodeBlock
                        code={`<template>
  <div>
    <h1>My Vue App</h1>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = '${CDN_URL}';
  script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
  script.defer = true;
  document.body.appendChild(script);
});

onUnmounted(() => {
  const script = document.querySelector(\`script[data-bot-id="YOUR_BOT_ID"]\`);
  if (script) {
    document.body.removeChild(script);
  }
});
</script>`}
                        id="vue-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using Options API:
                      </p>
                      <CodeBlock
                        code={`<template>
  <div>
    <h1>My Vue App</h1>
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.defer = true;
    document.body.appendChild(script);
  },
  beforeUnmount() {
    const script = document.querySelector(\`script[data-bot-id="YOUR_BOT_ID"]\`);
    if (script) {
      document.body.removeChild(script);
    }
  }
};
</script>`}
                        id="vue-options"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Angular */}
              <TabsContent value="angular" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Angular</CardTitle>
                    <CardDescription>
                      Add QuickBots to your Angular application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using Component:
                      </p>
                      <CodeBlock
                        code={`import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div>
      <h1>My Angular App</h1>
    </div>
  \`
})
export class AppComponent implements OnInit, OnDestroy {
  ngOnInit() {
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.setAttribute('data-bot-id', 'YOUR_BOT_ID');
    script.defer = true;
    document.body.appendChild(script);
  }

  ngOnDestroy() {
    const script = document.querySelector(\`script[data-bot-id="YOUR_BOT_ID"]\`);
    if (script) {
      document.body.removeChild(script);
    }
  }
}`}
                        id="angular-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Using index.html (Alternative):
                      </p>
                      <CodeBlock
                        code={`<!-- In your index.html -->
<!doctype html>
<html>
<head>
  <title>My Angular App</title>
</head>
<body>
  <app-root></app-root>
  
  <script
    src="${CDN_URL}"
    data-bot-id="YOUR_BOT_ID"
    defer
  ></script>
</body>
</html>`}
                        id="angular-html"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* API Reference */}
          <section
            id="api-reference"
            className="space-y-4 sm:space-y-6 mb-12 sm:mb-16"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                API Reference
              </h2>
              <p className="text-muted-foreground">
                Programmatic control of the QuickBots widget using the
                JavaScript API.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>QuickBot.init()</CardTitle>
                <CardDescription>
                  Initialize a QuickBot widget programmatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">Syntax:</p>
                  </div>
                  <CodeBlock
                    code={`window.QuickBot.init({
  botId: string,           // Required: Your bot ID
  container?: HTMLElement   // Optional: Container element
});`}
                    id="init-syntax"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                    <span className="text-xs text-muted-foreground">botId</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      Optional
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      container
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <CodeBlock
                    code={`// Initialize widget
window.QuickBot.init({
  botId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  container: document.getElementById('chatbot-container')
});`}
                    id="init-example"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QuickBot.destroy()</CardTitle>
                <CardDescription>
                  Remove a QuickBot widget from the page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Syntax:</p>
                  <CodeBlock
                    code={`window.QuickBot.destroy(botId: string);`}
                    id="destroy-syntax"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <CodeBlock
                    code={`// Remove widget
window.QuickBot.destroy('a1b2c3d4-e5f6-7890-abcd-ef1234567890');`}
                    id="destroy-example"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Element</CardTitle>
                <CardDescription>
                  Use the custom HTML element directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Usage:</p>
                  <CodeBlock
                    code={`<!-- After loading the script, you can use the custom element -->
<quick-bot bot-id="YOUR_BOT_ID"></quick-bot>`}
                    id="custom-element"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Tip</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The custom element approach gives you more control over
                    placement and lifecycle. Make sure the script is loaded
                    before using the element.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Configuration */}
          <section
            id="configuration"
            className="space-y-4 sm:space-y-6 mb-12 sm:mb-16"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Configuration
              </h2>
              <p className="text-muted-foreground">
                Customize your bot&apos;s appearance and behavior from the
                QuickBots dashboard.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Settings</CardTitle>
                <CardDescription>
                  Configure these settings in your bot&apos;s Config tab in the
                  dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Appearance
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Chatbot name and branding</li>
                      <li>
                        • Theme selection (modern, classic, minimal, bubble,
                        retro)
                      </li>
                      <li>• Welcome message customization</li>
                      <li>• Quick questions/buttons</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Behavior
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Auto-open delay</li>
                      <li>• Auto-greet on open</li>
                      <li>• Email collection before chat</li>
                      <li>• Chat persistence (sessionStorage)</li>
                      <li>• Timestamp display</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Integration
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>
                        • Social media links (WhatsApp, Telegram, X, Instagram,
                        Email)
                      </li>
                      <li>• Support information</li>
                      <li>• Custom API endpoints</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dark Mode</CardTitle>
                <CardDescription>
                  QuickBots automatically detects and adapts to your
                  website&apos;s dark mode.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The widget automatically detects if your website uses dark
                  mode by checking for the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">dark</code>{" "}
                  class on the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">html</code>{" "}
                  element.
                </p>
                <CodeBlock
                  code={`<!-- Enable dark mode on your site -->
<html class="dark">
  <!-- Your content -->
</html>
`}
                  id="dark-mode"
                  copiedCode={copiedCode}
                  onCopy={copyToClipboard}
                />
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6 p-4 sm:p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Ready to Get Started?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Create your first bot in the dashboard and start embedding it
                  in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/bots">
                      <Rocket className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/bots/add">
                      <Zap className="w-4 h-4 mr-2" />
                      Create Bot
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
