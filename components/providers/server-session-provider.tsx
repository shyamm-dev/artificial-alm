"use client";

import { Session, User } from "better-auth";
import { createContext, useContext } from "react";

type ServerSessionResult = { session: Session; user: User } | null;
type ServerSessionContextType = Promise<ServerSessionResult>;

const ServerSessionContext = createContext<ServerSessionContextType | undefined>(undefined);

export function ServerSessionProvider({
  children,
  sessionPromise,
}: {
  children: React.ReactNode;
  sessionPromise: ServerSessionContextType;
}) {
  return (
    <ServerSessionContext.Provider value={sessionPromise}>
      {children}
    </ServerSessionContext.Provider>
  );
}

export function useServerSession() {
  const context = useContext(ServerSessionContext);
  if (context === undefined) {
    throw new Error("useServerSession must be used within a ServerSessionProvider");
  }
  return context;
}
