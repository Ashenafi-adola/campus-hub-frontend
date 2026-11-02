"use client";

import { useContext, useEffect, useState } from "react";
import { BookOpen, HelpCircle, Mail } from "lucide-react";

import { AccountTab } from "../../../../components/accounts-settings/AccountTab";
import { AppearanceTab } from "../../../../components/accounts-settings/AppearanceTab";
import { NotificationsTab } from "../../../../components/accounts-settings/NotificationsTab";
import { PrivacyTab } from "../../../../components/accounts-settings/PrivacyTab";
import { ProfileTab } from "../../../../components/accounts-settings/ProfileTab";
import {
  TABS,
  Toast,
  type AppearanceForm,
  type NotifForm,
  type PrivacyForm,
  useDraft,
  useScrollEdges,
} from "../../../../components/accounts-settings/settings-shared";
import { AuthContext } from "@/context/auth-context";
import { Profile } from "@/libs/types";
import { AuthUser } from "@/libs/auth/types";

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [toast, setToast] = useState<string | null>(null);
  const { ref: navRef, edges } = useScrollEdges();
  
  const { user } = useContext(AuthContext)
  const account = useDraft<AuthUser>(user);
  const profile = useDraft<Profile>(user.profile)

  
  const notifications = useDraft<NotifForm>({
    paused: false,
    prefs: {
      answers: { inApp: true, email: true, push: true },
      replies: { inApp: true, email: false, push: true },
      upvotes: { inApp: true, email: false, push: false },
      announcements: { inApp: true, email: true, push: false },
      digest: { inApp: false, email: true, push: false },
    },
    digestDay: "Monday",
    quietHours: false,
    quietFrom: "22:00",
    quietTo: "07:00",
  });

  const privacy = useDraft<PrivacyForm>({
    visibility: "public",
    showUniversity: true,
    showActivity: true,
    showOnline: false,
    showReputation: true,
    messages: "communities",
  });

  const appearance = useDraft<AppearanceForm>({
    theme: "light",
    accent: "indigo",
    density: "comfortable",
    textSize: "default",
    language: "English",
  });
  

  const dirtyByTab: Record<(typeof TABS)[number]["id"], boolean> = {
    profile: profile.dirty,
    account: account.dirty,
    notifications: notifications.dirty,
    privacy: privacy.dirty,
    appearance: appearance.dirty,
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  
  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] dark:bg-neutral-950">
      <div className="mx-auto flex w-full gap-2 px-2 py-6">
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
            <div className="mt-4 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <div className="flex flex-col gap-5 md:flex-row md:gap-8">
                <div className="relative -mx-4 sm:-mx-6 md:sticky md:top-24 md:mx-0 md:w-44 md:shrink-0 md:self-start">
                  <nav
                    ref={navRef}
                    aria-label="Settings sections"
                    className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 scrollbar-none sm:px-6 md:flex-col md:overflow-visible md:border-0 md:px-0 dark:border-neutral-800"
                  >
                    {TABS.map((t) => {
                      const active = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={(e) => {
                            setTab(t.id);
                            e.currentTarget.scrollIntoView({
                              behavior: "smooth",
                              inline: "center",
                              block: "nearest",
                            });
                          }}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm transition-colors md:w-full md:justify-between md:rounded-lg md:py-2 ${
                            active
                              ? "font-semibold text-indigo-700 md:bg-indigo-50 dark:text-indigo-300 md:dark:bg-indigo-950/50"
                              : "font-medium text-neutral-500 hover:text-neutral-900 md:text-neutral-600 md:hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 md:dark:text-neutral-400 md:dark:hover:bg-neutral-800"
                          }`}
                        >
                          {t.label}
                          {dirtyByTab[t.id] && (
                            <span
                              aria-label="Unsaved changes"
                              className="h-1.5 w-1.5 rounded-full bg-amber-500"
                            />
                          )}
                          {active && (
                            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600 md:hidden" />
                          )}
                        </button>
                      );
                    })}
                  </nav>

                  {edges.left && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-white to-transparent md:hidden dark:from-neutral-900"
                    />
                  )}
                  {edges.right && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white to-transparent md:hidden dark:from-neutral-900"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {tab === "profile" && (
                    <ProfileTab form={profile} onSaved={() => setToast("Profile updated")} />
                  )}
                  {tab === "account" && (
                    <AccountTab form={account} notify={setToast} />
                  )}
                  {tab === "notifications" && (
                    <NotificationsTab form={notifications} onSaved={() => setToast("Notification settings saved")} />
                  )}
                  {tab === "privacy" && (
                    <PrivacyTab form={privacy} onSaved={() => setToast("Privacy settings saved")} notify={setToast} />
                  )}
                  {tab === "appearance" && (
                    <AppearanceTab form={appearance} onSaved={() => setToast("Appearance saved")} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Need Help?</h3>
            <div className="mt-3 space-y-2.5">
              {[
                { label: "Community Guidelines", icon: BookOpen },
                { label: "Frequently Asked Questions", icon: HelpCircle },
                { label: "Contact Support Team", icon: Mail },
              ].map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-2.5 text-sm font-semibold text-indigo-600 hover:underline"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Toast message={toast} />
    </div>
  );
}
