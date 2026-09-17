import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Playground } from "./playground/Playground.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
);
