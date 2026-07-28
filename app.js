// central state management
window.AppState = {
    user: {
        name: "Carlos Gómez",
        cuit: "20-34981726-9",
        category: "B",
        role: "worker", // worker or client
        obraSocial: "OSECAC (Comercio)",
        sindicato: "UOCRA (Construcción)",
        prepaga: "OSDE (Plan 210)",
        billedTotal: 2186200,
        billingLimit: 6430000
    },
    
    // Mock database of workers for the Uber-like map
    // Centered around Buenos Aires (approx -34.588, -58.409)
    workers: [
        {
            id: 1,
            name: "Juan Pérez",
            specialty: "Plomero Matriculado",
            category: "plumber",
            rating: 4.8,
            jobsCount: 142,
            distance: "1.2 km",
            price: 8500,
            taxStatus: "Categoría C",
            bio: "Especialista en reparaciones de fugas, colocación de griferías, instalaciones sanitarias y termofusión. Trabajo rápido y garantizado.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=juan",
            lat: -34.585,
            lng: -58.402,
            phone: "+54 9 11 5829-3941"
        },
        {
            id: 2,
            name: "Sofía Medina",
            specialty: "Electricista Domiciliaria",
            category: "electrician",
            rating: 4.9,
            jobsCount: 98,
            distance: "0.8 km",
            price: 9200,
            taxStatus: "Categoría B",
            bio: "Instalaciones eléctricas completas, cortocircuitos, cableados, colocación de luminarias y disyuntores. Matrícula habilitante al día.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
            lat: -34.592,
            lng: -58.412,
            phone: "+54 9 11 6291-8402"
        },
        {
            id: 3,
            name: "Marcos Diéguez",
            specialty: "Limpieza y Desinfección",
            category: "cleaning",
            rating: 4.7,
            jobsCount: 210,
            distance: "2.5 km",
            price: 6000,
            taxStatus: "Monotributista Social",
            bio: "Limpieza profunda residencial y comercial. Sanitizaciones express de oficinas. Elementos de protección y productos de calidad.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcos",
            lat: -34.580,
            lng: -58.420,
            phone: "+54 9 11 3918-4019"
        },
        {
            id: 4,
            name: "Valeria Ortiz",
            specialty: "Paseadora & Adiestradora",
            category: "pets",
            rating: 5.0,
            jobsCount: 76,
            distance: "1.5 km",
            price: 4500,
            taxStatus: "Categoría A",
            bio: "Paseos grupales e individuales. Cuidado a domicilio para perros y gatos. Adiestramiento básico mediante refuerzo positivo.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=valeria",
            lat: -34.595,
            lng: -58.400,
            phone: "+54 9 11 7401-2948"
        },
        {
            id: 5,
            name: "Lucas Benítez",
            specialty: "Jardinero y Paisajista",
            category: "gardening",
            rating: 4.6,
            jobsCount: 115,
            distance: "3.1 km",
            price: 7800,
            taxStatus: "Categoría B",
            bio: "Corte de césped, poda de árboles y arbustos, nivelación de tierra y mantenimiento de plantas de interior/exterior. Diseños personalizados.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucas",
            lat: -34.582,
            lng: -58.395,
            phone: "+54 9 11 4019-3827"
        }
    ],
    
    // Historical list of jobs done or contracted
    changas: [
        {
            id: "CH-8924",
            service: "Reparación de Grifería Cocina",
            category: "Plomería",
            date: "2026-06-10",
            party: "Ana María Rodríguez",
            amount: 8500,
            status: "completed",
            afipStatus: "Emitida (Factura C)",
            invoiceId: "FC-0001-00000342"
        },
        {
            id: "CH-8851",
            service: "Cortocircuito en Llave Térmica",
            category: "Electricidad",
            date: "2026-06-05",
            party: "Estudio Contable S.A.",
            amount: 15200,
            status: "completed",
            afipStatus: "Emitida (Factura C)",
            invoiceId: "FC-0001-00000341"
        },
        {
            id: "CH-8794",
            service: "Corte de Césped & Desmalezado",
            category: "Jardinería",
            date: "2026-05-28",
            party: "Consorcio Av. Santa Fe 2300",
            amount: 12000,
            status: "completed",
            afipStatus: "Emitida (Factura C)",
            invoiceId: "FC-0001-00000340"
        },
        {
            id: "CH-8710",
            service: "Limpieza post-obra",
            category: "Limpieza",
            date: "2026-05-15",
            party: "Juan Carlos Domínguez",
            amount: 28000,
            status: "completed",
            afipStatus: "Emitida (Factura C)",
            invoiceId: "FC-0001-00000339"
        },
        {
            id: "CH-8999",
            service: "Paseo Semanal Canino",
            category: "Mascotas",
            date: "2026-06-11",
            party: "María Julia Lopez",
            amount: 4500,
            status: "pending",
            afipStatus: "Pendiente de Emisión",
            invoiceId: null
        }
    ],
    
    // Invoices list (monotributo Factura C)
    receipts: [
        {
            id: "FC-0001-00000342",
            date: "2026-06-10",
            clientName: "Ana María Rodríguez",
            clientCuit: "27-19284756-3",
            description: "Reparación de filtración en cocina, cambio de caños de agua caliente y fría.",
            amount: 8500,
            paymentMethod: "Transferencia"
        },
        {
            id: "FC-0001-00000341",
            date: "2026-06-05",
            clientName: "Estudio Contable S.A.",
            clientCuit: "30-58472918-4",
            description: "Diagnóstico y cambio de llave térmica disyuntora quemada en tablero principal.",
            amount: 15200,
            paymentMethod: "Transferencia"
        },
        {
            id: "FC-0001-00000340",
            date: "2026-05-28",
            clientName: "Consorcio Av. Santa Fe 2300",
            clientCuit: "30-71938482-9",
            description: "Mantenimiento general de jardinería del edificio principal.",
            amount: 12000,
            paymentMethod: "Efectivo"
        }
    ],
    
    // Contributions list
    contributions: [
        {
            id: "AP-981742",
            date: "2026-06-01",
            type: "Obra Social",
            entity: "OSECAC (Comercio)",
            period: "2026-06",
            amount: 8200,
            paymentMethod: "Mercado Pago",
            status: "approved"
        },
        {
            id: "AP-971049",
            date: "2026-06-01",
            type: "Sindicato",
            entity: "UOCRA (Construcción)",
            period: "2026-06",
            amount: 4500,
            paymentMethod: "Mercado Pago",
            status: "approved"
        },
        {
            id: "AP-949182",
            date: "2026-05-27",
            type: "Prepaga",
            entity: "OSDE (Plan 210)",
            period: "2026-06",
            amount: 32400,
            paymentMethod: "Tarjeta de Crédito",
            status: "approved"
        },
        {
            id: "AP-918274",
            date: "2026-05-01",
            type: "Obra Social",
            entity: "OSECAC (Comercio)",
            period: "2026-05",
            amount: 8200,
            paymentMethod: "Mercado Pago",
            status: "approved"
        }
    ],
    
    notifications: [
        {
            id: 1,
            title: "Aporte Vencido de Prepaga",
            desc: "El plan de OSDE vence en 5 días. Realizá el pago para mantener la cobertura activa.",
            type: "warning",
            time: "Hace 2 horas",
            unread: true
        },
        {
            id: 2,
            title: "Factura C generada con éxito",
            desc: "Se emitió el comprobante FC-0001-00000342 a nombre de Ana María Rodríguez.",
            type: "success",
            time: "Ayer",
            unread: true
        }
    ]
};

// Recupera la última sesión guardada. Si no existe, conserva los datos de demostración.
if (window.ChangaStorage) {
    window.AppState = window.ChangaStorage.load(window.AppState);
}

window.persistAppState = function persistAppState() {
    if (window.ChangaStorage) window.ChangaStorage.save(window.AppState);
};

// UI Navigation and Shell Management
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    window.safeCreateIcons();
    
    // View switching
    const navItems = document.querySelectorAll(".nav-item");
    const views = document.querySelectorAll(".app-view");
    const viewTitle = document.querySelector(".current-view-title");
    
    function switchView(targetViewId) {
        views.forEach(view => {
            if (view.id === targetViewId) {
                view.classList.add("active");
            } else {
                view.classList.remove("active");
            }
        });
        
        navItems.forEach(item => {
            if (item.getAttribute("data-view") === targetViewId) {
                item.classList.add("active");
                // Update title
                viewTitle.textContent = item.querySelector("span").textContent;
            } else {
                item.classList.remove("active");
            }
        });
        
        // Leaflet maps need invalidateSize if switched on active
        if (targetViewId === "map-section" && window.ChangaMap) {
            setTimeout(() => {
                window.ChangaMap.invalidateSize();
            }, 100);
        }
    }
    
    // Add Click listeners to sidebar items
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const viewId = item.getAttribute("data-view");
            switchView(viewId);
            window.location.hash = viewId;
            
            // Close mobile menu if open
            const sidebar = document.querySelector(".sidebar");
            if (sidebar.classList.contains("open")) {
                sidebar.classList.remove("open");
            }
        });
    });
    
    // Router logic via Hash Change
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const validViews = Array.from(views).map(v => v.id);
            if (validViews.includes(hash)) {
                switchView(hash);
            }
        }
    });
    
    // Handle initial routing based on hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const validViews = Array.from(views).map(v => v.id);
        if (validViews.includes(hash)) {
            switchView(hash);
        }
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    
    mobileMenuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
    
    // Client / Worker Mode Switcher
    const modeSwitch = document.getElementById("mode-switch");
    const modeToggleContainer = document.querySelector(".mode-toggle-container");
    
    modeSwitch.addEventListener("click", () => {
        modeToggleContainer.classList.toggle("worker-active");
        if (modeToggleContainer.classList.contains("worker-active")) {
            window.AppState.user.role = "worker";
            window.persistAppState();
            addNotification("Modo Trabajador", "Ahora estás en modo Changador. Podés recibir pedidos y facturar tus servicios.", "info");
        } else {
            window.AppState.user.role = "client";
            window.persistAppState();
            addNotification("Modo Cliente", "Ahora estás en modo Cliente. Podés buscar servicios en el mapa de changas.", "info");
        }
    });
    
    // Notification Dropdown Toggle
    const notifBtn = document.getElementById("notif-btn");
    const notifDropdown = document.getElementById("notif-dropdown");
    const clearNotif = document.getElementById("clear-notif");
    
    notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle("hidden");
    });
    
    document.addEventListener("click", () => {
        notifDropdown.classList.add("hidden");
    });
    
    notifDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });
    
    clearNotif.addEventListener("click", () => {
        window.AppState.notifications = [];
        window.persistAppState();
        updateNotificationsUI();
    });
    
    const resetDemoBtn = document.getElementById("reset-demo-btn");
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener("click", () => {
            const confirmed = window.confirm("¿Querés borrar los datos guardados y restaurar la demostración inicial?");
            if (!confirmed) return;
            window.ChangaStorage?.reset();
            window.location.reload();
        });
    }

    // Initialize Dashboard UI components
    updateNotificationsUI();
    loadChangasTable();
    updateMonotributoStats();
    
    // Restaura el último modo utilizado
    if (window.AppState.user.role === "worker") {
        modeToggleContainer.classList.add("worker-active");
    } else {
        modeToggleContainer.classList.remove("worker-active");
        window.AppState.user.role = "client";
    }
});

// Notifications functions
function addNotification(title, desc, type = "info") {
    const newNotif = {
        id: Date.now(),
        title,
        desc,
        type,
        time: "Hace instantes",
        unread: true
    };
    window.AppState.notifications.unshift(newNotif);
    window.persistAppState();
    updateNotificationsUI();
    
    // Flash notification bell
    const notifBtn = document.getElementById("notif-btn");
    notifBtn.classList.add("pulse");
    setTimeout(() => notifBtn.classList.remove("pulse"), 1000);
}

function updateNotificationsUI() {
    const notifList = document.getElementById("notif-list");
    const notifCount = document.getElementById("notif-count");
    
    notifList.innerHTML = "";
    const unreadCount = window.AppState.notifications.filter(n => n.unread).length;
    
    if (unreadCount > 0) {
        notifCount.textContent = unreadCount;
        notifCount.style.display = "flex";
    } else {
        notifCount.style.display = "none";
    }
    
    if (window.AppState.notifications.length === 0) {
        notifList.innerHTML = `
            <div class="empty-state-card" style="padding: 1.5rem;">
                <p>No tenés notificaciones nuevas</p>
            </div>
        `;
        return;
    }
    
    window.AppState.notifications.forEach(n => {
        const item = document.createElement("div");
        item.className = `notif-item ${n.unread ? 'unread' : ''}`;
        
        let iconName = "bell";
        if (n.type === "success") iconName = "check-circle";
        if (n.type === "warning") iconName = "alert-triangle";
        if (n.type === "info") iconName = "info";
        
        item.innerHTML = `
            <div class="notif-item-icon ${n.type}">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="notif-item-content">
                <span class="notif-item-title">${n.title}</span>
                <span class="notif-item-desc">${n.desc}</span>
                <span class="notif-item-time">${n.time}</span>
            </div>
        `;
        
        item.addEventListener("click", () => {
            n.unread = false;
            updateNotificationsUI();
        });
        
        notifList.appendChild(item);
    });
    
    window.safeCreateIcons({
        attrs: {
            class: "lucide-icon"
        },
        nodeList: notifList.querySelectorAll("[data-lucide]")
    });
}

// Historial Changas UI Loader
function loadChangasTable() {
    const tbody = document.getElementById("changas-history-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    window.AppState.changas.forEach(c => {
        const row = document.createElement("tr");
        
        let statusBadgeClass = "pending";
        let statusText = "Pendiente";
        if (c.status === "completed") {
            statusBadgeClass = "completed";
            statusText = "Finalizado";
        } else if (c.status === "cancelled") {
            statusBadgeClass = "cancelled";
            statusText = "Cancelado";
        }
        
        row.innerHTML = `
            <td><strong>${c.id}</strong></td>
            <td>
                <div style="font-weight:600;">${c.service}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${c.category}</div>
            </td>
            <td>${c.date}</td>
            <td>${c.party}</td>
            <td style="font-weight:700;">$${c.amount.toLocaleString('es-AR')}</td>
            <td><span class="badge-status ${statusBadgeClass}">${statusText}</span></td>
            <td>
                <span style="font-size:0.85rem; display:flex; align-items:center; gap:0.3rem;">
                    <span class="pulse-dot" style="background-color: ${c.invoiceId ? 'var(--success)' : 'var(--warning)'};"></span>
                    ${c.afipStatus}
                </span>
            </td>
            <td>
                ${c.invoiceId 
                  ? `<button class="btn btn-secondary btn-icon" title="Ver Factura C" onclick="window.ReceiptsCtrl.viewInvoice('${c.invoiceId}')">
                        <i data-lucide="eye"></i>
                     </button>` 
                  : `<button class="btn btn-primary btn-icon" title="Emitir Factura C" onclick="window.ReceiptsCtrl.prepareInvoiceForChanga('${c.id}')">
                        <i data-lucide="file-plus"></i>
                     </button>`
                }
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    window.safeCreateIcons({
        nodeList: tbody.querySelectorAll("[data-lucide]")
    });
}

// Monotributo progress bar calculator
function updateMonotributoStats() {
    const fill = document.getElementById("billing-progress-fill");
    const percentLabel = document.getElementById("billing-percent");
    const billedLabel = document.getElementById("billed-amount");
    
    if (!fill || !percentLabel || !billedLabel) return;
    
    const total = window.AppState.user.billedTotal;
    const limit = window.AppState.user.billingLimit;
    const percent = Math.min(Math.round((total / limit) * 100), 100);
    
    fill.style.width = `${percent}%`;
    percentLabel.textContent = `${percent}%`;
    billedLabel.textContent = `$${total.toLocaleString('es-AR')}`;
}

// Export History
const exportHistoryBtn = document.getElementById("btn-export-history");
if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", () => {
        let csvContent = "data:text/csv;charset=utf-8,ID,Servicio,Categoria,Fecha,Cliente,Monto,Estado,Factura\n";
        window.AppState.changas.forEach(c => {
            csvContent += `"${c.id}","${c.service}","${c.category}","${c.date}","${c.party}",${c.amount},"${c.status}","${c.invoiceId || 'N/A'}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `changas_historial_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Exportación Exitosa", "Se descargó el historial de changas en formato CSV.", "success");
    });
}
