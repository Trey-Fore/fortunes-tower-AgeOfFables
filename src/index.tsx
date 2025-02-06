import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found. Make sure the HTML file has an element with id 'root'.");
}


reportWebVitals();
