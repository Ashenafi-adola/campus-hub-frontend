"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import {
  type Draft,
  type PrivacyForm,
  SaveBar,
  SectionHeading,
  Segmented,
  SettingRow,
  Switch,
  VISIBILITY_OPTIONS,
  labelCls,
} from "./settings-shared";

export function PrivacyTab({ form, onSaved, notify }: { form: Draft<PrivacyForm>; onSaved: () => void; notify: (msg: string) => void }) {
  const { draft, update } = form;
  const [blocked, setBlocked] = useState([
    { id: "1", name: "Chris Hollow", school: "UCLA" },
    { id: "2", name: "Tara Neal", school: "NYU" },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <SectionHeading title="Profile visibility" />
        <div className="mt-2 space-y-2">
          {VISIBILITY_OPTIONS.map((v) => {
            const active = draft.visibility === v.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => update({ visibility: v.id })}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                    : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-indigo-600 bg-indigo-600" : "border-neutral-300 dark:border-neutral-600"}`}>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{v.label}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{v.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading title="What others can see" />
        <div className="mt-1">
          <SettingRow title="Show my university" description="Display it next to your name on posts">
            <Switch checked={draft.showUniversity} onChange={(v) => update({ showUniversity: v })} label="Show my university" />
          </SettingRow>
          <SettingRow title="Show my activity" description="Let others see your questions and answers">
            <Switch checked={draft.showActivity} onChange={(v) => update({ showActivity: v })} label="Show my activity" />
          </SettingRow>
          <SettingRow title="Show reputation and badges" description="Display your score and achievements">
            <Switch checked={draft.showReputation} onChange={(v) => update({ showReputation: v })} label="Show reputation and badges" />
          </SettingRow>
          <SettingRow title="Show online status" description="Let others see when you're active">
            <Switch checked={draft.showOnline} onChange={(v) => update({ showOnline: v })} label="Show online status" />
          </SettingRow>
        </div>
      </div>

      <div>
        <label className={labelCls}>Who can message me</label>
        <Segmented
          value={draft.messages}
          onChange={(v) => update({ messages: v })}
          options={[
            { id: "everyone", label: "Everyone" },
            { id: "communities", label: "My communities" },
            { id: "nobody", label: "Nobody" },
          ]}
        />
      </div>

      <SaveBar
        dirty={form.dirty}
        onSave={() => {
          form.save();
          onSaved();
        }}
        onDiscard={form.discard}
      />

      <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <SectionHeading title="Blocked users" description="Blocked people can't message you or see your posts." />
        {blocked.length === 0 ? (
          <p className="py-3 text-sm text-neutral-400 dark:text-neutral-500">You haven&apos;t blocked anyone.</p>
        ) : (
          <div className="mt-1">
            {blocked.map((b) => (
              <SettingRow key={b.id} title={b.name} description={b.school}>
                <button
                  onClick={() => {
                    setBlocked((prev) => prev.filter((x) => x.id !== b.id));
                    notify(`${b.name} unblocked`);
                  }}
                  className="shrink-0 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Unblock
                </button>
              </SettingRow>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <SettingRow title="Download my data" description="Get a copy of your posts, answers and account details">
          <button onClick={() => notify("We'll email you a download link")} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
            <Download className="h-3.5 w-3.5" />
            Request
          </button>
        </SettingRow>
      </div>
    </div>
  );
}
