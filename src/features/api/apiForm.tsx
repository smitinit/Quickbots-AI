"use client";

import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

import { useBotData } from "@/components/bot-context";

export default function ApiConfig() {
  // const { api: apiKeys, setApi } = useBotApi();
  // const { deleteApiKey } = useApiKeyActions();
  // const [isPending, startTransition] = useTransition();
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

  // function handleDeleteClick(api_id: string) {
  //   startTransition(async () => {
  //     const result = await deleteApiKey(api_id);

  //     if (!result.ok) {
  //       const message = result.message || "Failed to delete API key";
  //       const isAuthError =
  //         message.toLowerCase().includes("authentication") ||
  //         message.toLowerCase().includes("user authentication");
  //       toast.error(message, {
  //         duration: isAuthError ? 8000 : 5000,
  //       });
  //       return;
  //     }

  //     setApi((prev) => prev.filter((key) => key.api_id !== api_id));

  //     // Trigger refetch of bot data

  //     toast.success("API key deleted");
  //   });
  // }

  // const isConnected = false;
  return (
    <div className="w-full mx-auto max-w-4xl px-6 py-8">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-semibold text-primary">API Integration</h1>
        <p className="text-sm text-muted-foreground">
          Configure your AI bot&apos;s API keys and manage integrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {apiKeys.length} / 3 keys
            </span>
          </div>
          <CreateApiKeyDialog />
        </div> */}

        {/* Integration Code Example */}
        <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Integration Code
              </h2>
              <p className="text-sm text-muted-foreground">
                Copy and paste this code into your React application to embed
                the chatbot.
              </p>
            </div>

            <div className="space-y-4">
              {/* React Component Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    React Component
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `import { QuickBot } from "@/components/quickbot";

export default function App() {
  return (
    <div>
      <QuickBot botId="${bot.bot_id}" />
    </div>
  );
}`,
                        "react"
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {copiedSection === "react" ? (
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
                <pre className="bg-muted/50 border border-border/50 rounded-lg p-4 overflow-x-auto">
                  <code className="text-xs font-mono text-foreground">
                    {`import { QuickBot } from "@/components/quickbot";

export default function App() {
  return (
    <div>
      <QuickBot botId="${bot.bot_id}" />
    </div>
  );
}`}
                  </code>
                </pre>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Environment Variables (.env)
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `# Required for Chatbot Widget
NEXT_PUBLIC_QUICKBOT_PUBLIC_KEY=BFqqKGx536wOOw3iW-sZKNggkoRRspNM1KWL4L2heEMfXXeNHHj8KwGGH1V0aZ0JmMe7Q7DQ3QVph98G1RigG0A`,
                        "env"
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {copiedSection === "env" ? (
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
                <pre className="bg-muted/50 border border-border/50 rounded-lg p-4 overflow-x-auto">
                  <code className="text-xs font-mono text-foreground">
                    {`# Required for Chatbot Widget
NEXT_PUBLIC_QUICKBOT_PUBLIC_KEY=BFqqKGx536wOOw3iW-sZKNggkoRRspNM1KWL4L2heEMfXXeNHHj8KwGGH1V0aZ0JmMe7Q7DQ3QVph98G1RigG0A`}
                  </code>
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  This public key is used to verify the chatbot configuration
                  signature. Copy this key to your .env file.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              Security Notice:
            </span>{" "}
            Keep your API keys secret and use them only in secure environments.
            Usage is billed according to{" "}
            <a
              href="#"
              className="text-primary font-medium hover:underline transition-all duration-200"
            >
              pay-as-you-go pricing
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
// <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
//   <div className="overflow-x-auto">
//     <Table>
//       <TableHeader>
//         <TableRow className="border-b border-border/50 hover:bg-transparent">
//           <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Project #
//           </TableHead>
//           <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Key name
//           </TableHead>
//           <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Environment
//           </TableHead>
//           <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Created at
//           </TableHead>
//           <TableHead className="h-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Integrated
//           </TableHead>
//           <TableHead className="h-12 w-20 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
//             Actions
//           </TableHead>
//         </TableRow>
//       </TableHeader>

//       <TableBody>
//         {apiKeys.length === 0 ? (
//           <TableRow className="hover:bg-transparent border-0">
//             <TableCell colSpan={6} className="py-16 text-center">
//               <div className="flex flex-col items-center gap-3 text-muted-foreground">
//                 <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
//                   <Key className="h-6 w-6 text-muted-foreground/50" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-foreground">
//                     No API keys yet
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Create your first key to get started
//                   </p>
//                 </div>
//               </div>
//             </TableCell>
//           </TableRow>
//         ) : (
//           apiKeys.map((k) => (
//             <TableRow
//               key={k.id}
//               className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
//             >
//               <TableCell className="font-mono text-xs text-muted-foreground py-4 ">
//                 ...{k.bot_id.slice(-6)}
//               </TableCell>
//               <TableCell className="text-sm font-medium text-foreground py-4">
//                 {k.name[0].toUpperCase() + k.name.slice(1)}
//               </TableCell>
//               <TableCell className="py-4">
//                 <code className="bg-muted/50 px-2.5 py-1.5 rounded-md font-mono text-xs text-muted-foreground border border-border/50">
//                   {k.permissions?.length
//                     ? k.permissions.join(", ")
//                     : "No permissions"}
//                 </code>
//               </TableCell>

//               <TableCell className="text-sm text-muted-foreground py-4">
//                 {formatDate(k.created_at)}
//               </TableCell>
//               <TableCell className="py-4">
//                 <Badge
//                   variant="secondary"
//                   className="text-xs font-medium flex justify-center items-center gap-2 "
//                 >
//                   {isConnected ? <Check /> : <Spinner />}
//                   {isConnected ? "Connected" : "Pending"}
//                 </Badge>
//               </TableCell>
//               <TableCell className="py-4">
//                 {/* <Button
//                         variant="ghost"
//                         size="icon"
//                         disabled={isPending}
//                         className={`${buttonVariants({
//                           variant: "destructive",
//                           size: "icon",
//                         })} h-8 w-8 transition-all duration-200 hover:scale-110`}
//                         onClick={() => handleDeleteClick(k.api_id)}
//                       >
//                         <Trash2 className="h-3.5 w-3.5" />
//                       </Button> */}
//                 <ConfirmActionDialog
//                   icon={<Trash2 className="h-3.5 w-3.5" />}
//                   title="Are you sure you want to delete this API key?"
//                   description="This action cannot be undone."
//                   actionLabel="Yes, delete it"
//                   triggerLabel=""
//                   onConfirm={() => handleDeleteClick(k.api_id)}
//                   variant="destructive"
//                   disabled={isPending}
//                 />
//               </TableCell>
//             </TableRow>
//           ))
//         )}
//       </TableBody>
//     </Table>
//   </div>
// </div>;
