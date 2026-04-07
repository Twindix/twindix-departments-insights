import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./app";
import "./index.css";

// Register service worker
registerSW({
    onNeedRefresh() {
        if (confirm("يتوفر تحديث جديد. هل تريد تحديث الصفحة؟")) {
            window.location.reload();
        }
    },
    onOfflineReady() {
        console.log("التطبيق جاهز للعمل بدون إنترنت");
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
