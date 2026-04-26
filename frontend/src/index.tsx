import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './services/store/store';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);
