import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { registerServiceWorker } from "./app/pwa/register";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Production builds only (the function is a no-op under `vite dev`).
registerServiceWorker();
