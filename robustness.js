// Protecciones mínimas para dependencias externas.
// La aplicación debe seguir funcionando aunque Lucide o Leaflet no carguen.
(function () {
    "use strict";

    if (!window.lucide || typeof window.lucide.createIcons !== "function") {
        console.warn("Lucide no está disponible. Chang@ continuará sin iconos SVG.");
        window.lucide = {
            createIcons: function () {
                // No-op intencional: evita que fallen los módulos que actualizan la interfaz.
                return false;
            }
        };
        document.documentElement.classList.add("lucide-unavailable");
    }

    window.safeCreateIcons = function safeCreateIcons(options) {
        try {
            return window.lucide.createIcons(options);
        } catch (error) {
            console.warn("No se pudieron actualizar los iconos.", error);
            return false;
        }
    };

    window.addEventListener("error", function (event) {
        const target = event.target;
        if (!target || target === window) return;

        if (target.tagName === "IMG") {
            target.classList.add("asset-load-failed");
            target.alt = target.alt || "Imagen no disponible";
        }
    }, true);
})();
