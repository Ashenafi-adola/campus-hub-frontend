"use client";

import { useState } from "react";
import { Apple } from "lucide-react";

import { SectionHeading, SettingRow } from "../settings-shared";

export function AccountConnectedAccounts({
  notify,
}: {
  notify: (msg: string) => void;
}) {
  const [google, setGoogle] = useState<string | null>("alex.j@gmail.com");
  const [appleConnected, setAppleConnected] = useState<string | null>(null);

  return (
    <div className="border-t border-neutral-100 pt-6 dark:border-neutral-800">
      <SectionHeading title="Connected accounts" description="Sign in faster with a linked account." />
      <div className="mt-2">
        <SettingRow title="Google" description={google ? `Connected as ${google}` : "Not connected"}>
          <button
            onClick={() => {
              setGoogle(google ? null : "alex.j@gmail.com");
              notify(google ? "Google disconnected" : "Google connected");
            }}
            className="shrink-0 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {google ? "Disconnect" : "Connect"}
          </button>
        </SettingRow>
        <SettingRow title="Apple" description={appleConnected ? `Connected as ${appleConnected}` : "Not connected"}>
          <button
            onClick={() => {
              setAppleConnected(appleConnected ? null : "alex@icloud.com");
              notify(appleConnected ? "Apple disconnected" : "Apple connected");
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Apple className="h-3.5 w-3.5" />
            {appleConnected ? "Disconnect" : "Connect"}
          </button>
        </SettingRow>
      </div>
    </div>
  );
}
