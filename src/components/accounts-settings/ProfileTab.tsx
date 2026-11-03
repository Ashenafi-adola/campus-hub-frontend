"use client";

import React, { useState } from "react";
import { Avatar } from "@/components/shared/ui";
import {
  MAX_BIO,
  UNIVERSITIES,
  type Draft,
  SaveBar,
  SelectField,
  inputCls,
  labelCls,
} from "./settings-shared";
import { Profile } from "@/libs/types";
import { saveProfile } from "@/libs/api";

export function ProfileTab({ form, onSaved }: { form: Draft<Profile>; onSaved: () => void }) {
  const { draft, update } = form;
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const nameValid = (draft.first_name + " " + draft.last_name).trim().length >= 2;

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setAvatarError("Use a JPG or PNG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("That file is over 2MB.");
      return;
    }
    setAvatarError(null);
    update({ avatar: file });
  };

  const save = async () => {
    await saveProfile(draft);
  }


  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Avatar Image</label>
        <div className="flex items-center gap-4">
          <Avatar profile={draft} size="h-16 w-16" textSize="text-xl" />
          <div>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Upload New
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </label>
              <button
                type="button"
                disabled={!draft.avatar}
                onClick={() => {
                  setAvatarError(null);
                  update({ avatar: undefined });
                }}
                className="text-sm font-semibold text-red-500 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline dark:disabled:text-neutral-600"
              >
                Remove
              </button>
            </div>
            <p
              className={`mt-1.5 text-xs ${
                avatarError ? "text-red-500" : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {avatarError ?? "JPG or PNG. Max size 2MB"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Display Name</label>
        <input
          type="text"
          value={draft?.first_name +" "+draft?.last_name}
          maxLength={40}
          onChange={(e) => update({ first_name: e.target.value.split(" ")[0], last_name: e.target.value.split(" ")[1] || "" })}
          className={`${inputCls} ${
            nameValid ? "" : "border-red-300 focus:border-red-400 focus:ring-red-500/20"
          }`}
        />
        {!nameValid && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            Display name must be at least 2 characters.
          </p>
        )}
      </div>

      <div>
        <label className={labelCls}>University</label>
        <SelectField
          value={draft.university}
          options={UNIVERSITIES}
          onChange={(e) => {update({ university: e})}}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Bio</label>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {draft.bio?.length}/{MAX_BIO}
          </span>
        </div>
        <textarea
          value={draft.bio}
          maxLength={MAX_BIO}
          rows={4}
          onChange={(e) => update({ bio: e.target.value })}
          className={`${inputCls} resize-y`}
        />
      </div>

      <SaveBar
        dirty={form.dirty}
        valid={nameValid}
        onSave={() => {
          form.save();
          onSaved();
          save()
        }}
        onDiscard={form.discard}
      />
    </div>
  );
}
