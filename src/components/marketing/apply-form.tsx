"use client";

import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/ui/text-field";

/**
 * Pilot application. No backend in v1: on submit it opens the visitor's email app
 * with the answers filled in, addressed to site.contactEmail.
 */
export function ApplyForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lines = [
      `Name: ${f.get("name")}`,
      `Organisation: ${f.get("org")}`,
      `Role: ${f.get("role")}`,
      `Organisation type: ${f.get("type")}`,
      `Where your water points are: ${f.get("where")}`,
      `Number of water points: ${f.get("count")}`,
      "",
      `${f.get("message") ?? ""}`,
    ];
    const subject = `Flowkeep pilot enquiry: ${f.get("org")}`;
    window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <TextField name="name" label="Your name" required autoComplete="name" />
      <TextField name="org" label="Organisation" required autoComplete="organization" />
      <TextField name="role" label="Your role" placeholder="e.g. WASH programme officer" required />
      <SelectField name="type" label="Organisation type" required defaultValue="">
        <option value="" disabled>
          Choose one
        </option>
        <option>NGO or INGO</option>
        <option>RUWASSA or state agency</option>
        <option>LGA WASH department</option>
        <option>Community-based organisation</option>
        <option>Other</option>
      </SelectField>
      <TextField name="where" label="Where are your water points?" placeholder="State and LGA" required />
      <TextField name="count" label="How many water points do you manage?" inputMode="numeric" required />
      <div className="sm:col-span-2">
        <TextArea
          name="message"
          label="Anything we should know"
          optional
          helper="For example, how faults are reported today, or who approves repair funding."
        />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" leadingIcon={<Mail aria-hidden className="size-5" />}>
          Send pilot enquiry
        </Button>
        <p className="text-body-sm text-on-surface-variant" aria-live="polite">
          {sent
            ? `Your email app should have opened. If it didn't, write to ${site.contactEmail}.`
            : "This opens your email app with your answers filled in. Nothing is stored on this site."}
        </p>
      </div>
    </form>
  );
}
