import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./app";
import "./index.css";

// Register service worker
registerSW({
    onNeedRefresh() {
        if (confirm("يتوفر تحديث جديد. هل تريد تحديث الصفحة؟")) { // eslint-disable-line
            window.location.reload();
        }
    },
    onOfflineReady() {
        console.log("التطبيق جاهز للعمل بدون إنترنت"); // eslint-disable-line
    },
});

createRoot(document.getElementById("root")!).render( // eslint-disable-line
    <StrictMode>
        <App />
    </StrictMode>,
);
