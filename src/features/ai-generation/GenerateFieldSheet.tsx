"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContextForm } from "./ContextForm";
import { PreviewPanel } from "./PreviewPanel";
import { getFieldConfig } from "./field-configs";
import type { FieldType, BotData } from "@/types/ai.types";

interface GenerateFieldSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FieldType;
  botId: string;
  currentValue?: string;
  onApply: (value: string | string[]) => void;
}

interface ContextState {
  userHint?: string;
}

export function GenerateFieldSheet({
  open,
  onOpenChange,
  field,
  botId,
  currentValue,
  onApply,
}: GenerateFieldSheetProps) {
  const [context, setContext] = useState<ContextState>({});
  const [generatedValue, setGeneratedValue] = useState<
    string | string[] | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [botContext, setBotContext] = useState<BotData | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [lastUsedContext, setLastUsedContext] = useState<ContextState>({});

  const fieldConfig = getFieldConfig(field);

  // Fetch bot context when sheet opens
  useState(() => {
    if (open && botId) {
      fetch(`/api/bots/${botId}/data`)
        .then((res) => res.json())
        .then((data) => setBotContext(data))
        .catch(() => setBotContext(null));
    }
  });

  const handleGenerate = async (contextToUse?: ContextState) => {
    const contextForGeneration = contextToUse || context;
    setIsGenerating(true);
    // Store the context used for this generation
    setLastUsedContext(contextForGeneration);
    try {
      const response = await fetch("/api/generate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          field,
          context: contextForGeneration,
          currentValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show the error message directly from the API
        throw new Error(
          errorData.error || errorData.message || "Generation failed"
        );
      }

      const data = await response.json();
      setGeneratedValue(data.value);
      toast.success("Generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedValue) {
      onApply(generatedValue);
      handleReset();
      onOpenChange(false);
      toast.success("Applied successfully!");
    }
  };

  const handleCancel = () => {
    // If generating, prevent cancel
    if (isGenerating) {
      toast.warning("Please wait for generation to complete");
      return;
    }

    // If there's generated content, show confirmation
    if (generatedValue) {
      setShowCloseConfirm(true);
      return;
    }

    // Otherwise, allow cancel
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setGeneratedValue(null);
    setContext({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close
    if (!newOpen) {
      // Prevent closing if currently generating
      if (isGenerating) {
        toast.warning("Please wait for generation to complete");
        return;
      }

      // Show confirmation if there's generated content that hasn't been applied
      if (generatedValue) {
        setShowCloseConfirm(true);
        return;
      }

      // Otherwise, allow closing
      handleReset();
      onOpenChange(false);
    } else {
      // Opening - reset any pending close state
      onOpenChange(true);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    handleReset();
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className="sm:max-w-[600px] overflow-y-auto p-4"
          onInteractOutside={(e) => {
            // Prevent closing on outside click if generating
            if (isGenerating) {
              e.preventDefault();
              toast.warning("Please wait for generation to complete");
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing on ESC if generating
            if (isGenerating) {
              e.preventDefault();
              toast.warning("Please wait for generation to complete");
            }
          }}
        >
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl">
                  Generate with QuickBots AI
                </SheetTitle>
                <SheetDescription className="text-sm">
                  {fieldConfig.label}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {!generatedValue ? (
              <ContextForm
                field={field}
                context={context}
                onContextChange={setContext}
                botContext={botContext}
              />
            ) : (
              <PreviewPanel
                field={field}
                value={generatedValue}
                currentValue={currentValue}
              />
            )}
          </div>

          <SheetFooter className="gap-2 pt-6 border-t">
            {!generatedValue ? (
              <Button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !context.userHint?.trim()}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    // Immediately start regenerating with the last used context
                    handleGenerate(lastUsedContext);
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  className="min-w-[100px]"
                >
                  Apply Changes
                </Button>
              </>
            )}
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard generated content?</AlertDialogTitle>
            <AlertDialogDescription>
              You have generated content that hasn&apos;t been applied. If you
              close now, these changes will be lost. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Keep Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
