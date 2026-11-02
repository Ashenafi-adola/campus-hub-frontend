"use client";
import { AuthUser } from "@/libs/auth/types";
import React, { createContext } from "react";

export const AuthContext = createContext<{
  user: AuthUser;
}>({ user:
    {id: 0,
    username: "string",
    email: "string",
    is_verified: "string",
    profile: {
      first_name: "string",
      last_name: "string",
      avatar: "string",
      bio: "string",
      university: "string"
    }
  }
});

export const AuthProvider = ({ children, value }: { children: React.ReactNode, value: { user: AuthUser } }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}