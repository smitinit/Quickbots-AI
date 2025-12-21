"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Code,
  Globe,
  Zap,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useBotData } from "@/components/bot-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CDN_URL =
  "https://quickbot-ai.smit090305.workers.dev/v1/quickbot.iife.js";

export default function ApiConfig() {
  const { bot } = useBotData();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy");
    }
  };

  const CodeBlock = ({
    code,
    id,
    title,
  }: {
    code: string;
    id: string;
    title?: string;
  }) => (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </label>
          <button
            onClick={() => copyToClipboard(code, id)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {copiedSection === id ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="bg-muted/50 border border-border/50 rounded-lg p-4 overflow-x-auto">
        <code className="text-xs font-mono text-foreground whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );

  const scriptTagCode = `<script
  src="${CDN_URL}"
  data-bot-id="${bot.bot_id}"
  defer
></script>`;

  const htmlExample = `<!DOCTYPE html>
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
    data-bot-id="${bot.bot_id}"
    defer
  ></script>
</body>
</html>`;

  const reactExample = `import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${CDN_URL}';
    script.setAttribute('data-bot-id', '${bot.bot_id}');
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector(\`script[data-bot-id="${bot.bot_id}"]\`);
      if (existing) {
        document.body.removeChild(existing);
      }
    };
  }, []);

  return (
    <div>
      <h1>My React App</h1>
    </div>
  );
}

export default App;`;

  const nextjsScriptExample = `import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Script
        src="${CDN_URL}"
        data-bot-id="${bot.bot_id}"
        strategy="afterInteractive"
      />
    </>
  );
}`;

  const nextjsComponentExample = `'use client';

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
// <QuickBotWidget botId="${bot.bot_id}" />`;

  const vueExample = `<template>
  <div>
    <h1>My Vue App</h1>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = '${CDN_URL}';
  script.setAttribute('data-bot-id', '${bot.bot_id}');
  script.defer = true;
  document.body.appendChild(script);
});

onUnmounted(() => {
  const script = document.querySelector(\`script[data-bot-id="${bot.bot_id}"]\`);
  if (script) {
    document.body.removeChild(script);
  }
});
</script>`;

  const angularExample = `import { Component, OnInit, OnDestroy } from '@angular/core';

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
    script.setAttribute('data-bot-id', '${bot.bot_id}');
    script.defer = true;
    document.body.appendChild(script);
  }

  ngOnDestroy() {
    const script = document.querySelector(\`script[data-bot-id="${bot.bot_id}"]\`);
    if (script) {
      document.body.removeChild(script);
    }
  }
}`;

  return (
    <div className="w-full mx-auto max-w-5xl px-6 py-8">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-semibold text-primary">Embed QuickBot</h1>
        <p className="text-sm text-muted-foreground">
          Integrate your chatbot into any website or application. Copy the code
          snippets below and paste them into your project.
        </p>
      </div>

      {/* Bot ID Card */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Your Bot ID
          </CardTitle>
          <CardDescription>
            Use this Bot ID to integrate your chatbot widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground">
              {bot.bot_id}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (bot.bot_id) {
                  copyToClipboard(bot.bot_id, "bot-id");
                }
              }}
            >
              {copiedSection === "bot-id" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Quick Start (Script Tag)
          </CardTitle>
          <CardDescription>
            The fastest way to get started. Just add this script tag to your
            HTML.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock code={scriptTagCode} id="script-tag" title="Script Tag" />
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-1">
              📝 Note:
            </p>
            <p className="text-xs text-muted-foreground">
              The widget will automatically appear in the bottom-right corner of
              your page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Framework Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Framework Integration
          </CardTitle>
          <CardDescription>
            Step-by-step integration guides for your favorite framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              <TabsTrigger value="vue">Vue</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              <CodeBlock
                code={htmlExample}
                id="html-example"
                title="HTML Example"
              />
            </TabsContent>

            <TabsContent value="react" className="mt-4">
              <CodeBlock
                code={reactExample}
                id="react-example"
                title="React Example"
              />
            </TabsContent>

            <TabsContent value="nextjs" className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Using next/script (Recommended):
                </p>
                <CodeBlock
                  code={nextjsScriptExample}
                  id="nextjs-script"
                  title="Next.js Script"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  Using Custom Component:
                </p>
                <CodeBlock
                  code={nextjsComponentExample}
                  id="nextjs-component"
                  title="Next.js Component"
                />
              </div>
            </TabsContent>

            <TabsContent value="vue" className="mt-4">
              <CodeBlock
                code={vueExample}
                id="vue-example"
                title="Vue Example"
              />
            </TabsContent>

            <TabsContent value="angular" className="mt-4">
              <CodeBlock
                code={angularExample}
                id="angular-example"
                title="Angular Example"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Need More Help?
            </h3>
            <p className="text-sm text-muted-foreground">
              Check out our comprehensive documentation for detailed guides,
              examples, and best practices.
            </p>
            <Button asChild>
              <Link href="/docs">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
