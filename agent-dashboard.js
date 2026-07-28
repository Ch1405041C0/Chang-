// Dashboard académico del motor agéntico: traduce el estado del prototipo a conceptos de la materia.
(function () {
    const categories = {
        plumber: "Plomería",
        electrician: "Electricidad",
        cleaning: "Limpieza",
        gardening: "Jardinería",
        pets: "Mascotas"
    };

    const money = value => `$${Number(value || 0).toLocaleString("es-AR")}`;

    function getHistory() {
        return window.StorageService?.load("changa_ai_history", []) || [];
    }

    function renderLastDecision(history) {
        const target = document.getElementById("agent-last-decision");
        if (!target) return;
        const last = history[0];
        if (!last) {
            target.className = "agent-empty";
            target.textContent = "Todavía no hay análisis. Probá el asistente con una necesidad real.";
            return;
        }
        const signals = (last.matchedWords || []).slice(0, 5);
        target.className = "agent-decision";
        target.innerHTML = `
            <span class="decision-label">${last.label || categories[last.category] || "Servicio"}</span>
            <h4>${last.urgency || "Normal"} · ${last.confidence || 0}% de confianza</h4>
            <p>${last.text || "Solicitud analizada"}</p>
            <div class="decision-reason"><strong>Por qué:</strong> ${last.reason || "Coincidencia entre la necesidad y las reglas del rubro."}</div>
            <div class="signal-tags">${signals.length ? signals.map(s => `<span>${s}</span>`).join("") : "<span>contexto general</span>"}</div>
            <small>Estimación: ${last.duration || "A confirmar"} · ${last.price ? `${money(last.price[0])}–${money(last.price[1])}` : "A confirmar"}</small>
        `;
    }

    function renderLearning(history) {
        const target = document.getElementById("agent-learning-bars");
        if (!target) return;
        const counts = Object.keys(categories).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        history.forEach(item => { if (item.category in counts) counts[item.category] += 1; });
        const max = Math.max(1, ...Object.values(counts));
        target.innerHTML = Object.entries(categories).map(([key, label]) => {
            const count = counts[key];
            const width = count ? Math.max(12, Math.round(count / max * 100)) : 0;
            return `<div class="learning-row"><div><strong>${label}</strong><span>${count} análisis</span></div><div class="learning-track"><span style="width:${width}%"></span></div></div>`;
        }).join("");
    }

    function renderAgentDashboard() {
        const history = getHistory();
        const changas = window.AppState?.changas || [];
        const completed = changas.filter(c => c.status === "completed").length;
        const avgConfidence = history.length ? Math.round(history.reduce((sum, i) => sum + Number(i.confidence || 0), 0) / history.length) : null;

        const values = {
            "agent-analysis-count": history.length,
            "agent-memory-count": history.length + changas.length,
            "agent-confidence": avgConfidence === null ? "—" : `${avgConfidence}%`,
            "agent-resolution": changas.length ? `${Math.round(completed / changas.length * 100)}%` : "0%"
        };
        Object.entries(values).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
        renderLastDecision(history);
        renderLearning(history);
        window.safeCreateIcons?.();
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("agent-go-assistant")?.addEventListener("click", () => {
            document.querySelector('.nav-item[data-view="map-section"]')?.click();
            setTimeout(() => document.getElementById("ai-job-description")?.focus(), 150);
        });
        renderAgentDashboard();
    });
    document.addEventListener("changa:ai-analysis", renderAgentDashboard);
    window.renderAgentDashboard = renderAgentDashboard;
})();
