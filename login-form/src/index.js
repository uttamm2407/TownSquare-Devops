import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "leaflet/dist/leaflet.css";
import { Line, Bar } from "react-chartjs-2";
import { Provider } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import appstore from './store/appStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
      <Provider store={appstore}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </Provider>
);

reportWebVitals();