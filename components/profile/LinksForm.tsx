"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { firstProfaneField } from "@/lib/profanity";
import type { Profile, ProfileLink } from "@/lib/types";

export function LinksForm({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const [links, setLinks] = useState<ProfileLink[]>(
    profile?.links?.length ? profile.links : [{ label: "", url: "" }]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function updateLink(i: number, patch: Partial<ProfileLink>) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError("");
    const cleanLinks = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.label && l.url);

    const profanityCheck: Record<string, string> = {};
    cleanLinks.forEach((l, i) => {
      profanityCheck[`link ${i + 1} label`] = l.label;
    });
    const badField = firstProfaneField(profanityCheck);
    if (badField) {
      setStatus("error");
      setError(`Let's keep it clean — please revise the ${badField}.`);
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ links: cleanLinks })
      .eq("id", profile?.id);

    if (updateError) {
      setStatus("error");
      setError(
        updateError.message.includes("not allowed")
          ? "That contains language that isn't allowed. Please revise."
          : updateError.message
      );
      return;
    }

    setStatus("done");
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Links</h2>
        <p className="mb-5 text-xs text-zinc-500">
          These show up as buttons on your public page, in order.
        </p>

        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                placeholder="Label"
                className="w-28 shrink-0"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="shrink-0 rounded-lg border border-white/10 px-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-red-300"
                aria-label="Remove link"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLink}
          className="mt-2 text-xs text-violet-400 hover:text-violet-300"
        >
          + Add link
        </button>

        {status === "error" && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {status === "done" && <p className="mt-4 text-sm text-emerald-400">Saved.</p>}

        <div className="mt-5">
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
