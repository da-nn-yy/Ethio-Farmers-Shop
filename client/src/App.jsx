import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { LanguageProvider } from "./hooks/useLanguage.jsx";
import { I18nProvider } from "./lib/i18n-context.jsx";
import { CartProvider } from "./hooks/useCart.jsx";

function App() {
  return (
    <LanguageProvider>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <Routes />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </LanguageProvider>
  );
}

export default App;
