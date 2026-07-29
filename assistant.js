// Asistente inteligente simple y explicable para Chang@
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("ai-job-description");
    const analyzeBtn = document.getElementById("btn-analyze-job");
    const exampleBtn = document.getElementById("btn-ai-example");
    const result = document.getElementById("ai-result");
    if (!input || !analyzeBtn || !result) return;

    const rules = [
        {
            category: "plumber",
            label: "Plomería",
            icon: "wrench",
            words: ["agua","pérdida","pierde","canilla","caño","cañería","pileta","inodoro","grifería","filtración","humedad","fuga"],
            duration: "1 a 4 horas",
            price: [6000, 25000]
        },
        {
            category: "electrician",
            label: "Electricidad",
            icon: "zap",
            words: ["luz","eléctrico","electricidad","cortocircuito","térmica","disyuntor","enchufe","cable","corriente","tablero","chispa","humo","sin luz"],
            duration: "0.5 a 3 horas",
            price: [8000, 30000]
        },
        {
            category: "cleaning",
            label: "Limpieza",
            icon: "sparkles",
            words: ["limpiar","limpieza","suciedad","desinfección","post obra","oficina","vidrios","sanitizar","sanitización","fregado"],
            duration: "2 a 6 horas",
            price: [5000, 22000]
        },
        {
            category: "gardening",
            label: "Jardinería",
            icon: "flower",
            words: ["pasto","césped","jardín","jardinería","poda","árbol","plantas","desmalezar","césped"],
            duration: "2 a 5 horas",
            price: [7000, 25000]
        },
        {
            category: "pets",
            label: "Mascotas",
            icon: "dog",
            words: ["perro","gato","mascota","paseo","pasear","cuidar","adiestrar","adiestramiento"],
            duration: "1 a 3 horas",
            price: [4000, 15000]
        }
    ];

    const normalize = (value) => (value || "").toLowerCase().normalize("NFD").replace(/[00-6f]/g, "");
    const money = (value) => typeof value === "number" ? `$${value.toLocaleString("es-AR")}` : value;

    function analyze(text) {
        const normalized = normalize(text);
        let best = null;
        let bestScore = 0;
        let matchedWords = [];
        rules.forEach(rule => {
            const matches = rule.words.filter(word => normalized.includes(normalize(word)));
            const score = matches.length;
            if (score > bestScore) { best = rule; bestScore = score; matchedWords = matches; }
        });
        if (!best) best = rules[0];

        const urgentWords = ["urgente","ya","hoy","emergencia","chispa","humo","inund","sin luz","no para"];
        const mediumWords = ["mañana","pronto","esta semana","gotea","pierde"];
        const urgency = urgentWords.some(w => normalized.includes(normalize(w))) ? "Alta" :
                        mediumWords.some(w => normalized.includes(normalize(w))) ? "Media" : "Normal";
        const confidence = Math.min(96, 58 + bestScore * 12 + (text.length > 35 ? 6 : 0));
        const workers = (window.AppState?.workers || []).filter(w => w.category === best.category).sort((a,b) => b.rating - a.rating);
        const reason = matchedWords.length
            ? `Detecté ${matchedWords.map(w => `“${w}”`).join(", ")} y las asocié con ${best.label}.`
            : `No encontré señales específicas; usé ${best.label} como categoría de respaldo para continuar el flujo.`;
        return { ...best, urgency, confidence, workers, text, matchedWords, reason, createdAt: new Date().toISOString() };
    }

    function applyCategory(category) {
        const chip = document.querySelector(`#category-chips .chip[data-cat="${category}"]`);
        if (chip) chip.click();
        const search = document.getElementById("job-search");
        if (search) search.value = "";
    }

    function render(data) {
        const recommended = (data.workers && data.workers.length) ? data.workers[0] : null;
        const priceRange = data.price || [5000, 20000];

        result.innerHTML = `
            <div class="ai-result-title"><i data-lucide="${data.icon || 'sparkles'}"></i>
                <div><small>Rubro sugerido</small><strong>${data.label}</strong></div>
            </div>
            <div class="ai-explanation">
                <strong><i data-lucide="search-check"></i> ¿Por qué recomendé esto?</strong>
                <p>${data.reason}</p>
                <div class="signal-tags">${data.matchedWords.length ? data.matchedWords.map(word => `<span>${word}</span>`).join("") : "<span>clasificación de respaldo</span>"}</div>
            </div>
            <div class="ai-grid">
                <div><small>Prioridad</small><strong>${data.urgency}</strong></div>
                <div><small>Duración estimada</small><strong>${data.duration || 'A confirmar'}</strong></div>
                <div><small>Rango orientativo</small><strong>${money(priceRange[0])} – ${money(priceRange[1])}</strong></div>
                <div><small>Confianza</small><strong>${data.confidence}%</strong></div>
            </div>
            ${recommended ? `<div class="ai-recommendation"><span>Mejor coincidencia</span>
                <strong>${recommended.name}</strong>
                <small>${recommended.specialty} · ⭐ ${recommended.rating} · ${money(recommended.price)}</small>
            </div>` : ''}
            <div style="margin-top:.75rem;">
                <button class="btn btn-primary btn-block" id="btn-show-ai-workers" type="button">Ver profesionales recomendados</button>
            </div>
        `;
        result.classList.remove("hidden");
        result.querySelector("#btn-show-ai-workers")?.addEventListener("click", () => applyCategory(data.category));
        if (window.safeCreateIcons) window.safeCreateIcons({ nodeList: result.querySelectorAll("[data-lucide]") });
    }

    analyzeBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (text.length < 8) {
            result.innerHTML = '<p class="ai-error">Escribí un poco más sobre el trabajo para poder analizarlo.</p>';
            result.classList.remove("hidden");
            return;
        }
        const data = analyze(text);
        render(data);
        try {
            const history = window.StorageService?.load("changa_ai_history", []) || [];
            history.unshift(data);
            window.StorageService?.save("changa_ai_history", history.slice(0, 20));
            document.dispatchEvent(new CustomEvent("changa:ai-analysis", { detail: data }));
        } catch (e) { console.warn("No se pudo guardar el análisis", e); }
    });

    exampleBtn?.addEventListener("click", () => {
        input.value = "Pierde agua debajo de la pileta de la cocina y necesito arreglarlo mañana";
        input.focus();
    });
});
