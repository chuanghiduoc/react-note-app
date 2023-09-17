import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from "react-dom/client"
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = document.getElementById('root');
const reactRoot = createRoot(root); // Use createRoot to create a root for your React app

reactRoot.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
