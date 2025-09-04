import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./hooks/useAuth.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
