"use client";
import { AuthUser } from "@/libs/auth/types";
import React, { createContext } from "react";

export const AuthContext = createContext<{
  user: AuthUser | null;
}>({
  user: null,
});

export const AuthProvider = ({ children, value }: { children: React.ReactNode, value: { user: AuthUser | null } }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}