import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <UserProvider>
      <App />
    </UserProvider>
  </I18nextProvider>
);