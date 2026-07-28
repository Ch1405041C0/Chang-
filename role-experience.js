// Mantiene coherencia visual entre los modos Cliente y Changador sin duplicar la aplicación.
(function () {
    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function applyRoleExperience(role) {
        const worker = role === "worker";
        document.body.dataset.role = worker ? "worker" : "client";
        document.querySelector(".profile-role").textContent = worker ? `Changador • Cat. ${window.AppState.user.category}` : "Cliente verificado";

        setText("nav-changas-label", worker ? "Mis Trabajos" : "Mis Solicitudes");
        setText("nav-receipts-label", "Monotributo & Facturas");
        setText("nav-contributions-label", "Aportes Sociales");
        setText("changas-title", worker ? "Historial de Trabajos" : "Historial de Solicitudes");
        setText("changas-subtitle", worker ? "Gestioná trabajos realizados, cobros y facturación" : "Consultá servicios solicitados, estados y comprobantes");
        setText("map-role-heading", worker ? "Tu zona de trabajo" : "¿Qué servicio necesitás?");
        setText("map-role-subtitle", worker ? "Visualizá la demanda y tu cobertura cercana" : "Conectando profesionales independientes al instante");

        const search = document.getElementById("job-search");
        if (search) search.placeholder = worker ? "Filtrar zona por oficio o demanda..." : "Plomero, gasista, electricista, paseador...";
        const request = document.getElementById("btn-request-job");
        if (request) request.innerHTML = worker ? '<i data-lucide="briefcase-business"></i> Ver oportunidad simulada' : '<i data-lucide="navigation"></i> Solicitar Changa Ya';

        // Facturación y aportes son funciones exclusivas del changador.
        document.querySelector('.nav-item[data-view="receipts-section"]')?.classList.toggle("role-hidden", !worker);
        document.querySelector('.nav-item[data-view="contributions-section"]')?.classList.toggle("role-hidden", !worker);

        const current = document.querySelector(".app-view.active")?.id;
        if (!worker && ["receipts-section", "contributions-section"].includes(current)) {
            document.querySelector('.nav-item[data-view="agent-section"]')?.click();
        }
        window.safeCreateIcons?.();
    }

    document.addEventListener("DOMContentLoaded", () => {
        applyRoleExperience(window.AppState.user.role);
        document.getElementById("mode-switch")?.addEventListener("click", () => {
            setTimeout(() => applyRoleExperience(window.AppState.user.role), 0);
        });
    });
    window.applyRoleExperience = applyRoleExperience;
})();
