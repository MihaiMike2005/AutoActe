"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SAMPLE = [
  "Ce traduceri îmi trebuie pentru o mașină din Germania?",
  "Cât e impozitul anual pentru un 2.0 diesel?",
  "Pot să fac programarea la RAR sâmbătă?",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Salut! Sunt AutoActe Assistant. Pot răspunde la întrebări despre dosarul tău, costuri, instituții și deadline-uri.",
    },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Demo mode: în producție, această întrebare ar fi trimisă către Claude Sonnet cu contextul complet al dosarului tău (vehicul, documente OCR, deadline-uri). Răspunsul ar conține pașii concreți + linkuri către documentele oficiale.",
        },
      ]);
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full p-0 shadow-2xl shadow-[--color-primary]/40 md:bottom-6 md:right-6"
          aria-label="Întreabă AutoActe"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[--color-accent]" /> Întreabă AutoActe
          </DialogTitle>
          <DialogDescription>
            Asistentul AI cunoaște dosarul tău, instituțiile și termenii legali.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-[--color-border] bg-[--color-secondary] p-3 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "assistant"
                  ? "rounded-lg bg-white p-2.5"
                  : "rounded-lg bg-[--color-primary] text-white p-2.5 ml-8"
              }
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-[--color-border] bg-white px-2.5 py-1 text-xs hover:bg-[--color-secondary]"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Scrie aici…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Trimite">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
