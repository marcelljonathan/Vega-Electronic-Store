"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

type AuthState = {
  user: AuthUser | null;
  ready: boolean; // false until Supabase has told us whether someone is signed in
};

const AuthContext = createContext<AuthState>({ user: null, ready: false });

function toAuthUser(user: User): AuthUser {
  const email = user.email ?? "";
  return {
    id: user.id,
    email,
    fullName: user.user_metadata?.full_name || email.split("@")[0],
  };
}

// Tracks who is signed in, for the navbar and the cart. Supabase reports the
// current session on load and every sign-in / sign-out after that, in any tab.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session ? toAuthUser(session.user) : null;
      // Token refreshes report the same user — keep the old state then.
      setState((prev) =>
        prev.ready &&
        prev.user?.id === user?.id &&
        prev.user?.fullName === user?.fullName
          ? prev
          : { user, ready: true },
      );
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
