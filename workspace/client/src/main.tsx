
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import{BrowserRouter} from "react-router-dom";

// Importing styles if any (optional, depending on your project)
import "./index.css"; // Make sure you have this or ignore if not needed

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);
