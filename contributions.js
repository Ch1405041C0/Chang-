// Contributions (Social Security, Unions, Prepagas) Controller

document.addEventListener("DOMContentLoaded", () => {
    const portalTabs = document.querySelectorAll(".portal-tab");
    const entitySelect = document.getElementById("contribution-entity");
    const entityLabel = document.getElementById("entity-label");
    const amountInput = document.getElementById("contribution-amount");
    const amountHelper = document.getElementById("amount-helper");
    const contributionTypeInput = document.getElementById("contribution-type");
    const contributionForm = document.getElementById("contribution-payment-form");
    
    // Lists of options for each category
    const optionsData = {
        "Obra Social": [
            { name: "OSECAC (Comercio)", amount: 8200, helper: "Aporte básico obligatorio según Monotributo Cat B" },
            { name: "UOCRA (Construcción)", amount: 7900, helper: "Aporte por convenio de construcción civil" },
            { name: "OSDEPYM (Pymes y Profesionales)", amount: 9500, helper: "Aporte regulado de monotributistas profesionales" },
            { name: "OSPAC (Aeronavegantes)", amount: 8200, helper: "Aporte básico obligatorio" },
            { name: "OSDE (Derivación de aportes)", amount: 8200, helper: "Aporte base obligatorio derivado a Prepaga" }
        ],
        "Sindicato": [
            { name: "UOCRA (Construcción)", amount: 4500, helper: "Cuota sindical mensual (1.5% del salario base)" },
            { name: "SEC (Comercio)", amount: 3800, helper: "Aporte sindical de empleados de comercio y servicios" },
            { name: "Camioneros (Choferes)", amount: 5200, helper: "Cuota de afiliación gremial y servicios sociales" },
            { name: "SUTERH (Porteros de Edificios)", amount: 4800, helper: "Aporte sindical obligatorio por estatuto" },
            { name: "UTHGRA (Hoteleros y Gastronómicos)", amount: 3900, helper: "Cuota de mantenimiento gremial" }
        ],
        "Prepaga": [
            { name: "OSDE (Plan 210)", amount: 32400, helper: "Costo mensual con descuento por derivación de aportes monotributo" },
            { name: "Swiss Medical (Plan SMG20)", amount: 34500, helper: "Costo mensual neto para monotributistas adheridos" },
            { name: "Galeno (Plan Azul)", amount: 29800, helper: "Costo mensual del plan corporativo independiente" },
            { name: "Medicus (Plan Celeste)", amount: 31200, helper: "Costo del plan de salud privado individual" },
            { name: "Sancor Salud (Plan 1500)", amount: 27500, helper: "Plan de salud familiar con aportes unificados" }
        ]
    };
    
    // Render dropdown options based on category
    function loadEntityOptions(category) {
        if (!entitySelect) return;
        entitySelect.innerHTML = "";
        
        const options = optionsData[category];
        options.forEach(opt => {
            const el = document.createElement("option");
            el.value = opt.name;
            el.textContent = `${opt.name} - $${opt.amount.toLocaleString('es-AR')}`;
            entitySelect.appendChild(el);
        });
        
        // Load default values for first option
        if (options.length > 0) {
            amountInput.value = options[0].amount;
            amountHelper.textContent = options[0].helper;
        }
    }
    
    // Portal Tabs Click Handling
    portalTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            portalTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const portalType = tab.getAttribute("data-portal");
            let category = "Obra Social";
            
            if (portalType === "social-security") {
                category = "Obra Social";
                entityLabel.textContent = "Seleccionar Obra Social";
            } else if (portalType === "union") {
                category = "Sindicato";
                entityLabel.textContent = "Seleccionar Sindicato";
            } else if (portalType === "prepaid") {
                category = "Prepaga";
                entityLabel.textContent = "Seleccionar Medicina Prepaga";
            }
            
            contributionTypeInput.value = category;
            loadEntityOptions(category);
        });
    });
    
    // Listen to Select changes to update default prices & helpers
    if (entitySelect) {
        entitySelect.addEventListener("change", () => {
            const category = contributionTypeInput.value;
            const selectedName = entitySelect.value;
            const match = optionsData[category].find(opt => opt.name === selectedName);
            if (match) {
                amountInput.value = match.amount;
                amountHelper.textContent = match.helper;
            }
        });
    }
    
    // Submit Contribution Payment
    if (contributionForm) {
        contributionForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const category = contributionTypeInput.value;
            const entity = entitySelect.value;
            const period = document.getElementById("contribution-period").value;
            const amount = parseFloat(amountInput.value);
            
            const payMethods = document.getElementsByName("pay-method");
            let method = "Mercado Pago";
            for (let pm of payMethods) {
                if (pm.checked) {
                    if (pm.value === 'mercado-pago') method = "Mercado Pago";
                    if (pm.value === 'transfer') method = "Transferencia";
                    if (pm.value === 'card') method = "Tarjeta de Crédito";
                }
            }
            
            // Disable button for loading simulation
            const btnSubmit = document.getElementById("btn-pay-contribution");
            const originalText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<span class="pulse-dot" style="background-color: #fff;"></span> Procesando Pago...`;
            
            setTimeout(() => {
                const randomId = "AP-" + Math.floor(100000 + Math.random() * 900000);
                const today = new Date().toISOString().slice(0, 10);
                
                const newPayment = {
                    id: randomId,
                    date: today,
                    type: category,
                    entity: entity,
                    period: period,
                    amount: amount,
                    paymentMethod: method,
                    status: "approved"
                };
                
                // Save to State
                window.AppState.contributions.unshift(newPayment);
                
                // Update User Coverage Health status
                if (category === "Obra Social") {
                    window.AppState.user.obraSocial = entity;
                    document.getElementById("cov-social-name").textContent = entity;
                    const card = document.querySelector(".coverage-status-card:nth-child(1)");
                    card.className = "coverage-status-card active";
                    card.querySelector(".status-indicator-badge").className = "status-indicator-badge success";
                    card.querySelector(".status-indicator-badge").textContent = `Al día (${getPeriodLabel(period)})`;
                } else if (category === "Sindicato") {
                    window.AppState.user.sindicato = entity;
                    document.getElementById("cov-union-name").textContent = entity;
                    const card = document.querySelector(".coverage-status-card:nth-child(2)");
                    card.className = "coverage-status-card active";
                    card.querySelector(".status-indicator-badge").className = "status-indicator-badge success";
                    card.querySelector(".status-indicator-badge").textContent = `Al día (${getPeriodLabel(period)})`;
                } else if (category === "Prepaga") {
                    window.AppState.user.prepaga = entity;
                    document.getElementById("cov-prepaga-name").textContent = entity;
                    const card = document.querySelector(".coverage-status-card:nth-child(3)");
                    card.className = "coverage-status-card active";
                    card.querySelector(".status-indicator-badge").className = "status-indicator-badge success";
                    card.querySelector(".status-indicator-badge").textContent = `Al día (Vto: ${getPeriodLabel(period)})`;
                }
                
                window.persistAppState();

                // Re-render components
                renderContributionsHistory();
                
                // Reset form state
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
                
                window.addNotification("Aporte Acreditado", `Aporte de $${amount} a ${entity} aprobado con éxito.`, "success");
            }, 1500);
        });
    }
    
    function getPeriodLabel(periodCode) {
        const year = periodCode.split("-")[0];
        const monthCode = periodCode.split("-")[1];
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return `${months[parseInt(monthCode) - 1]} ${year}`;
    }
    
    // Render history of contributions list
    function renderContributionsHistory() {
        const listContainer = document.getElementById("contributions-history-list");
        if (!listContainer) return;
        
        listContainer.innerHTML = "";
        
        window.AppState.contributions.forEach(c => {
            const item = document.createElement("div");
            item.className = "contribution-history-item";
            item.innerHTML = `
                <div class="contribution-hist-meta">
                    <span class="contribution-hist-title">${c.entity}</span>
                    <span class="contribution-hist-sub">${c.type} • Período: ${c.period}</span>
                </div>
                <div class="contribution-hist-amount-row">
                    <span class="contribution-hist-amount">$${c.amount.toLocaleString('es-AR')}</span>
                    <button class="btn btn-secondary btn-icon btn-sm" title="Descargar Comprobante" onclick="downloadContributionTicket('${c.id}')">
                        <i data-lucide="download"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(item);
        });
        
        window.safeCreateIcons({
            nodeList: listContainer.querySelectorAll("[data-lucide]")
        });
    }
    
    // Mock print/download ticket
    window.downloadContributionTicket = function(paymentId) {
        const p = window.AppState.contributions.find(c => c.id === paymentId);
        if (!p) return;
        
        window.addNotification("Ticket de Aporte", `Se inició la descarga del ticket ${p.id} correspondiente al aporte de ${p.entity}.`, "success");
    };

    // Load initial options & history
    loadEntityOptions("Obra Social");
    renderContributionsHistory();
});
