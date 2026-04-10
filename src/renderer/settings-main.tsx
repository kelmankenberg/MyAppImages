import React from 'react';
import ReactDOM from 'react-dom/client';
import { SettingsModal } from './components/SettingsModal';
import './styles/variables.css';

const SettingsApp: React.FC = () => {
  return (
    <SettingsModal
      isOpen={true}
      onClose={() => {
        // Close the window when close is requested
        window.electronAPI?.invoke('req:close-settings-window');
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsApp />
  </React.StrictMode>
);
