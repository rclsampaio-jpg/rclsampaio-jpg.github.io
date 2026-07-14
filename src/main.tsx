import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SystemProvider } from './engines/SystemEngine.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemProvider>
      <App />
    </SystemProvider>
  </StrictMode>,
);
