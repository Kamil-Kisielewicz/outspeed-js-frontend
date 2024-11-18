import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@outspeed/react/styles.css";
import App from "@/realtime-app/app.tsx";
// import React from 'react';

import { router } from "@/router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
