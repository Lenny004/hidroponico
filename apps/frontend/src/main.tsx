import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

const raiz = document.getElementById("raiz");
if (!raiz) {
  throw new Error("No se encontró el elemento #raiz");
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
