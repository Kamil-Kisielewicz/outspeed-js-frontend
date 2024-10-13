import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@outspeed/react/styles.css";
import App from "./realtime-app/app.tsx";

import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
);
