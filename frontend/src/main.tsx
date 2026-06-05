import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";

const redirect = sessionStorage.redirect;

if (redirect) {
  delete sessionStorage.redirect;
  history.replaceState(null, "", redirect);
}

createRoot(document.getElementById("root")!).render(<App />);
