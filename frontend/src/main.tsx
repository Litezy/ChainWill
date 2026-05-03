// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Web3Provider } from "./providers/Web3Provider.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "10px",
          fontSize: "14px",
        },
      }}
    />
    <App />
  </Web3Provider>,
);
