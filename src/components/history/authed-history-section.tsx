"use client";

import { useEffect, useState } from "react";

import { createSupabaseClient } from "@/lib/client/supabase-client";
import type { User } from "@supabase/supabase-js";

import { ProgressChart } from "@/components/history/progress-chart";
import { SessionHistory } from "@/components/history/session-history";

export function AuthedHistorySection() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
      setIsLoading(false);
    }

    void getUser();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
      <ProgressChart />
      <SessionHistory />
    </section>
  );
}
