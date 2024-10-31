import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Leva } from "leva";
import Experience from "@/Experience.tsx";

import "@/index.css";

const isProd = process.env.NODE_ENV === "production";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Experience />
    <Leva hidden={isProd} collapsed={true} />
  </StrictMode>,
);
