"use client";

import React from "react";
import {
  CHANNELS,
  DAYS,
  Draft,
  NotifForm,
  NotifKey,
  SaveBar,
  SelectField,
  SettingRow,
  Switch,
  NOTIF_ROWS,
  inputCls,
  labelCls,
} from "./settings-shared";

export function NotificationsTab({ form, onSaved }: { form: Draft<NotifForm>; onSaved: () => void }) {
  const { draft, update } = form;

  const setPref = (key: NotifKey, ch: "inApp" | "email" | "push", value: boolean) =>
    update({
      prefs: { ...draft.prefs, [key]: { ...draft.prefs[key], [ch]: value } },
    });

  return (
    <div className="space-y-6">
      <SettingRow title="Pause all notifications" description="Mute everything until you turn this back off">
        <Switch checked={draft.paused} onChange={(v) => update({ paused: v })} label="Pause all notifications" />
      </SettingRow>

      <div className={`transition-opacity ${draft.paused ? "pointer-events-none opacity-50" : ""}`}>
        <div className="grid grid-cols-[1fr_repeat(3,4.25rem)] items-center border-b border-neutral-100 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          <span>Notify me about</span>
          {CHANNELS.map((c) => (
            <span key={c.id} className="text-center">
              {c.label}
            </span>
          ))}
        </div>

        {NOTIF_ROWS.map((row) => (
          <div key={row.key} className="grid grid-cols-[1fr_repeat(3,4.25rem)] items-center border-b border-neutral-100 py-3.5 last:border-0 dark:border-neutral-800">
            <div className="min-w-0 pr-3">
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{row.label}</div>
              <div className="mt-0.5 text-xs leading-snug text-neutral-500 dark:text-neutral-400">{row.description}</div>
            </div>
            {CHANNELS.map((c) => (
              <div key={c.id} className="flex justify-center">
                <Switch
                  small
                  checked={draft.prefs[row.key][c.id]}
                  onChange={(v) => setPref(row.key, c.id, v)}
                  label={`${row.label} via ${c.label}`}
                />
              </div>
            ))}
          </div>
        ))}

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Weekly digest day</label>
            <SelectField value={draft.digestDay} onChange={(v) => update({ digestDay: v })} options={DAYS} />
          </div>

          <div>
            <SettingRow title="Quiet hours" description="No push notifications during this window">
              <Switch checked={draft.quietHours} onChange={(v) => update({ quietHours: v })} label="Quiet hours" />
            </SettingRow>
            {draft.quietHours && (
              <div className="mt-2 flex items-center gap-3">
                <input type="time" value={draft.quietFrom} onChange={(e) => update({ quietFrom: e.target.value })} className={inputCls} />
                <span className="text-sm text-neutral-400 dark:text-neutral-500">to</span>
                <input type="time" value={draft.quietTo} onChange={(e) => update({ quietTo: e.target.value })} className={inputCls} />
              </div>
            )}
          </div>
        </div>
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
