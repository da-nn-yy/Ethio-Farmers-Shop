import React from "react";
import GlobalHeader from "./GlobalHeader";

const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default AppShell;


