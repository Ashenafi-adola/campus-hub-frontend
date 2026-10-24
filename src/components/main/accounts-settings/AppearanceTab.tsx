"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  ACCENTS,
  type AppearanceForm,
  type Density,
  type Draft,
  LANGUAGES,
  SaveBar,
  Segmented,
  SelectField,
  THEMES,
  type TextSize,
  labelCls,
} from "./settings-shared";

export function AppearanceTab({ form, onSaved }: { form: Draft<AppearanceForm>; onSaved: () => void }) {
  const { draft, update } = form;
  const accentHex = ACCENTS.find((a) => a.id === draft.accent)!.hex;
  const dark = draft.theme === "dark";
  const fontSize = draft.textSize === "small" ? 13 : draft.textSize === "large" ? 17 : 15;

  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const active = draft.theme === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ theme: t.id })}
                aria-pressed={active}
                className={`rounded-xl border p-2.5 text-left transition-colors ${
                  active ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="space-y-1.5 rounded-lg border border-neutral-200 p-2.5 dark:border-neutral-700" style={t.preview}>
                  <div className="h-1.5 w-2/3 rounded" style={{ background: t.bar }} />
                  <div className="h-1.5 w-full rounded" style={{ background: t.bar }} />
                  <div className="h-1.5 w-1/2 rounded" style={{ background: accentHex }} />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                  {t.label}
                  {active && <Check className="ml-auto h-4 w-4 text-indigo-600" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>Accent color</label>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => {
            const active = draft.accent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => update({ accent: a.id })}
                aria-label={a.label}
                aria-pressed={active}
                className={`flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition-shadow ${
                  active ? "ring-2 ring-neutral-900 dark:ring-neutral-100" : "hover:ring-2 hover:ring-neutral-200 dark:hover:ring-neutral-700"
                }`}
                style={{ background: a.hex }}
              >
                {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Density</label>
          <Segmented<Density>
            value={draft.density}
            onChange={(v) => update({ density: v })}
            options={[
              { id: "comfortable", label: "Comfortable" },
              { id: "compact", label: "Compact" },
            ]}
          />
        </div>
        <div>
          <label className={labelCls}>Text size</label>
          <Segmented<TextSize>
            value={draft.textSize}
            onChange={(v) => update({ textSize: v })}
            options={[
              { id: "small", label: "Small" },
              { id: "default", label: "Default" },
              { id: "large", label: "Large" },
            ]}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Language</label>
        <SelectField value={draft.language} onChange={(v) => update({ language: v })} options={LANGUAGES} />
      </div>

      <div>
        <label className={labelCls}>Preview</label>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700" style={{ background: dark ? "#0f172a" : "#ffffff", color: dark ? "#f1f5f9" : "#171717", padding: draft.density === "compact" ? 12 : 20, fontSize }}>
          <div className="font-bold">How do I prepare for finals week?</div>
          <div className="mt-1 opacity-70" style={{ fontSize: fontSize - 2 }}>
            Looking for a realistic study plan that doesn&apos;t burn me out.
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: draft.density === "compact" ? 8 : 14 }}>
            <span className="rounded-md px-2.5 py-1 text-xs font-semibold" style={{ background: `${accentHex}22`, color: accentHex }}>
              StudyTips
            </span>
            <button type="button" className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white" style={{ background: accentHex }}>
              Answer
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          The preview shows your choices. Apply them app-wide from your theme provider after saving.
        </p>
      </div>

      <SaveBar
        dirty={form.dirty}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}
