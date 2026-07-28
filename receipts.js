// Receipts and AFIP Monotributo Factura C controller
window.ReceiptsCtrl = {
    // Fill form based on a completed changa
    prepareInvoiceForChanga: function(changaId) {
        const changa = window.AppState.changas.find(c => c.id === changaId);
        if (!changa) return;
        
        // Fill form fields
        document.getElementById("inv-client-name").value = changa.party;
        // Generate mock CUIT for client
        document.getElementById("inv-client-cuit").value = "27-" + Math.floor(10000000 + Math.random() * 90000000) + "-" + Math.floor(Math.random() * 9);
        document.getElementById("inv-description").value = `Servicio de ${changa.category} - ${changa.service}. ID Contrato: ${changa.id}`;
        document.getElementById("inv-amount").value = changa.amount;
        
        // Store linked changa ID on the form
        document.getElementById("invoice-form").dataset.linkedChangaId = changaId;
        
        // Notify
        window.addNotification("Datos Cargados", "Se cargaron los datos de la changa en el generador de Facturas.", "info");
    },
    
    // View detailed invoice overlay modal
    viewInvoice: function(invoiceId) {
        const receipt = window.AppState.receipts.find(r => r.id === invoiceId);
        if (!receipt) return;
        
        showInvoiceModal(receipt);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const receiptsList = document.getElementById("generated-receipts-list");
    const invoiceForm = document.getElementById("invoice-form");
    
    // Render Receipts List in Monotributo Section
    function renderReceiptsList() {
        if (!receiptsList) return;
        receiptsList.innerHTML = "";
        
        if (window.AppState.receipts.length === 0) {
            receiptsList.innerHTML = `
                <div class="empty-state-card" style="padding: 1.5rem;">
                    <p>No tenés facturas emitidas este mes.</p>
                </div>
            `;
            return;
        }
        
        window.AppState.receipts.forEach(r => {
            const card = document.createElement("div");
            card.className = "receipt-item-card";
            card.innerHTML = `
                <div class="receipt-meta">
                    <span class="receipt-num">${r.id}</span>
                    <span class="receipt-client">Receptor: ${r.clientName}</span>
                    <span class="receipt-date"><i data-lucide="calendar" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> ${r.date}</span>
                </div>
                <div class="receipt-amount-action">
                    <span class="receipt-amount">$${r.amount.toLocaleString('es-AR')}</span>
                    <button class="btn btn-secondary btn-icon" title="Ver Comprobante" onclick="window.ReceiptsCtrl.viewInvoice('${r.id}')">
                        <i data-lucide="eye"></i>
                    </button>
                </div>
            `;
            receiptsList.appendChild(card);
        });
        
        window.safeCreateIcons({
            nodeList: receiptsList.querySelectorAll("[data-lucide]")
        });
    }

    // Handle Form Submit (Emit Invoice)
    if (invoiceForm) {
        invoiceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const clientName = document.getElementById("inv-client-name").value;
            const clientCuit = document.getElementById("inv-client-cuit").value;
            const clientIva = document.getElementById("inv-client-iva").value;
            const description = document.getElementById("inv-description").value;
            const amount = parseFloat(document.getElementById("inv-amount").value);
            const paymentMethod = document.getElementById("inv-payment-method").value;
            
            // Validate CUIT format (rough check)
            if (!clientCuit.includes("-")) {
                alert("Por favor ingresá un CUIT con guiones (ej. 27-28394817-2)");
                return;
            }
            
            // Generate next invoice number
            const nextNum = window.AppState.receipts.length + 343; // Mocking starting index 343
            const invoiceId = `FC-0001-00000${nextNum}`;
            const today = new Date().toISOString().slice(0, 10);
            
            const newReceipt = {
                id: invoiceId,
                date: today,
                clientName,
                clientCuit,
                clientIva,
                description,
                amount,
                paymentMethod
            };
            
            // Add to AppState
            window.AppState.receipts.unshift(newReceipt);
            
            // Link to Changa if requested
            const linkedChangaId = invoiceForm.dataset.linkedChangaId;
            if (linkedChangaId) {
                const changa = window.AppState.changas.find(c => c.id === linkedChangaId);
                if (changa) {
                    changa.invoiceId = invoiceId;
                    changa.afipStatus = "Emitida (Factura C)";
                }
                // Clear state
                delete invoiceForm.dataset.linkedChangaId;
            } else {
                // If emitted manually without a linked job, add mock completed changa to history
                const randomId = "CH-" + Math.floor(1000 + Math.random() * 9000);
                const newChanga = {
                    id: randomId,
                    service: description.length > 30 ? description.substring(0, 30) + "..." : description,
                    category: "Manual",
                    date: today,
                    party: clientName,
                    amount: amount,
                    status: "completed",
                    afipStatus: "Emitida (Factura C)",
                    invoiceId: invoiceId
                };
                window.AppState.changas.unshift(newChanga);
                window.AppState.user.billedTotal += amount;
            }
            
            window.persistAppState();

            // Reset Form
            invoiceForm.reset();
            
            // Update UI Lists
            renderReceiptsList();
            window.loadChangasTable();
            window.updateMonotributoStats();
            
            // Show modal popup for Factura C PDF
            showInvoiceModal(newReceipt);
            
            window.addNotification("Factura C Emitida", `Se generó el comprobante ${invoiceId} por $${amount}.`, "success");
        });
    }
    
    // Open Modal Overlay
    function showInvoiceModal(receipt) {
        // Remove existing modal if any
        const existing = document.getElementById("invoice-modal-overlay");
        if (existing) document.body.removeChild(existing);
        
        const modal = document.createElement("div");
        modal.id = "invoice-modal-overlay";
        modal.className = "modal-overlay";
        
        // Generate printable layout inside the modal
        const caeCode = Math.floor(10000000000000 + Math.random() * 90000000000000);
        const caeDue = new Date();
        caeDue.setDate(caeDue.getDate() + 10);
        const caeDueFormatted = caeDue.toISOString().slice(0, 10);
        
        modal.innerHTML = `
            <div class="modal-card">
                <div class="modal-actions-header">
                    <h3>Vista Previa del Comprobante</h3>
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn btn-secondary btn-sm" id="btn-print-invoice-modal"><i data-lucide="printer"></i> Imprimir</button>
                        <button class="btn btn-primary btn-sm" id="btn-download-pdf-modal"><i data-lucide="download"></i> Descargar PDF</button>
                        <button class="btn-icon" id="btn-close-invoice-modal"><i data-lucide="x"></i></button>
                    </div>
                </div>
                
                <div class="modal-scroll-body">
                    <!-- AFIP Factura C Structure -->
                    <div class="afip-invoice-box" id="printable-afip-invoice">
                        <table class="afip-header-table">
                            <tr>
                                <td class="afip-header-cell">
                                    <div class="afip-logo-title">chang<span style="color:#7c4dff">@</span></div>
                                    <div style="margin-top: 10px;">
                                        <strong>Carlos Gómez</strong><br>
                                        Oficios y Servicios Generales<br>
                                        CUIT: 20-34981726-9<br>
                                        Ingresos Brutos: Exento<br>
                                        Inicio de Actividad: 15/01/2021
                                    </div>
                                </td>
                                <td class="afip-header-middle">
                                    <div class="afip-type-box">
                                        <span class="afip-type-letter">C</span>
                                        <span class="afip-type-code">COD. 011</span>
                                    </div>
                                </td>
                                <td class="afip-header-cell" style="text-align: right;">
                                    <div class="afip-doc-title">FACTURA</div>
                                    <div style="margin-top: 10px;">
                                        <strong>Punto de Venta: 0001</strong><br>
                                        <strong>Comp. Nro: ${receipt.id.split("-")[2]}</strong><br>
                                        Fecha de Emisión: ${receipt.date}<br>
                                        Categoría Monotributo: Cat. B
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <table class="afip-details-table">
                            <tr class="afip-details-header">
                                <td colspan="2">Período de Facturación</td>
                            </tr>
                            <tr>
                                <td>Desde: ${receipt.date}</td>
                                <td>Hasta: ${receipt.date}</td>
                            </tr>
                        </table>
                        
                        <table class="afip-details-table">
                            <tr class="afip-details-header">
                                <td colspan="2">Datos del Receptor (Cliente)</td>
                            </tr>
                            <tr>
                                <td><strong>Razón Social:</strong> ${receipt.clientName}</td>
                                <td><strong>CUIT / DNI:</strong> ${receipt.clientCuit}</td>
                            </tr>
                            <tr>
                                <td><strong>Condición IVA:</strong> ${receipt.clientIva || "Consumidor Final"}</td>
                                <td><strong>Condición de Venta:</strong> ${receipt.paymentMethod || "Transferencia"}</td>
                            </tr>
                        </table>
                        
                        <table class="afip-items-table">
                            <thead>
                                <tr>
                                    <th style="width: 10%;">Código</th>
                                    <th style="width: 50%;">Descripción / Concepto</th>
                                    <th style="width: 10%; text-align: center;">Cant</th>
                                    <th style="width: 15%; text-align: right;">Precio Unit.</th>
                                    <th style="width: 15%; text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>S-02</td>
                                    <td>${receipt.description}</td>
                                    <td style="text-align: center;">1.00</td>
                                    <td style="text-align: right;">$${receipt.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                                    <td style="text-align: right;">$${receipt.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                                </tr>
                                <tr class="afip-total-row">
                                    <td colspan="3" style="border: none;"></td>
                                    <td style="text-align: right;">TOTAL:</td>
                                    <td style="text-align: right;">$${receipt.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="afip-footer">
                            <div class="afip-qr-placeholder" style="display:flex; align-items:center; gap:10px;">
                                <div style="background-color:#eee; border:1px solid #aaa; width:80px; height:80px; padding:5px; display:flex; justify-content:center; align-items:center;">
                                    <!-- Simple simulated QR Code using SVG lines -->
                                    <svg width="70" height="70" viewBox="0 0 100 100">
                                        <rect width="100" height="100" fill="white"/>
                                        <rect x="5" y="5" width="25" height="25" fill="black"/>
                                        <rect x="10" y="10" width="15" height="15" fill="white"/>
                                        <rect x="70" y="5" width="25" height="25" fill="black"/>
                                        <rect x="75" y="10" width="15" height="15" fill="white"/>
                                        <rect x="5" y="70" width="25" height="25" fill="black"/>
                                        <rect x="10" y="75" width="15" height="15" fill="white"/>
                                        <rect x="35" y="35" width="30" height="30" fill="black"/>
                                        <rect x="40" y="40" width="20" height="20" fill="white"/>
                                        <rect x="70" y="70" width="10" height="10" fill="black"/>
                                        <rect x="85" y="85" width="10" height="10" fill="black"/>
                                        <rect x="50" y="75" width="10" height="20" fill="black"/>
                                    </svg>
                                </div>
                                <div style="font-size:10px;">
                                    <strong>Comprobante Autorizado</strong><br>
                                    AFIP Argentina • chang@ digital<br>
                                    Comprobante oficial emitido por monotributista.
                                </div>
                            </div>
                            
                            <div class="afip-cae-box">
                                <strong>CAE Nro: ${caeCode}</strong><br>
                                Fecha Vto CAE: ${caeDueFormatted}<br>
                                <div style="margin-top:5px; font-family: monospace; font-size:9px;">
                                    20349817269110001${caeCode}202606300
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        window.safeCreateIcons({ nodeList: modal.querySelectorAll("[data-lucide]") });
        
        // Add CSS styles for Modal specifically inside styles.css but define here just in case
        applyModalStyles();
        
        // Event Listeners
        document.getElementById("btn-close-invoice-modal").addEventListener("click", () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.getElementById("btn-print-invoice-modal").addEventListener("click", () => {
            // Trigger actual print dialog
            // Set print view container
            const printContainer = document.getElementById("afip-invoice-print-container");
            printContainer.innerHTML = document.getElementById("printable-afip-invoice").outerHTML;
            window.print();
        });
        
        document.getElementById("btn-download-pdf-modal").addEventListener("click", () => {
            // Emulate PDF Generation with a beautiful popup message and saving simulated file
            const btn = document.getElementById("btn-download-pdf-modal");
            btn.innerHTML = `<span class="pulse-dot"></span> Generando PDF...`;
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="check"></i> ¡Descargado!`;
                window.safeCreateIcons({ nodeList: btn.querySelectorAll("[data-lucide]") });
                
                // Emulate trigger download
                const link = document.createElement("a");
                link.href = "#";
                link.setAttribute("download", `Factura_C_${receipt.id}.pdf`);
                // Prompt download simulated
                window.addNotification("Descarga Completa", `Se descargó el archivo Factura_C_${receipt.id}.pdf en tu equipo.`, "success");
                
                setTimeout(() => {
                    btn.innerHTML = `<i data-lucide="download"></i> Descargar PDF`;
                    btn.disabled = false;
                    window.safeCreateIcons({ nodeList: btn.querySelectorAll("[data-lucide]") });
                }, 2000);
            }, 1500);
        });
    }
    
    // Injects modal overlay CSS styles into the document dynamically
    function applyModalStyles() {
        if (document.getElementById("modal-styles")) return;
        
        const style = document.createElement("style");
        style.id = "modal-styles";
        style.innerHTML = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.25s ease-out;
            }
            .modal-card {
                background-color: #161a29;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                width: 90%;
                max-width: 850px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .modal-actions-header {
                padding: 1.2rem 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-actions-header h3 {
                font-family: 'Outfit', sans-serif;
                font-size: 1.15rem;
                font-weight: 700;
            }
            .modal-scroll-body {
                padding: 2rem;
                overflow-y: auto;
                background-color: #0d101b;
                border-bottom-left-radius: 16px;
                border-bottom-right-radius: 16px;
            }
            .btn-sm {
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
                border-radius: 8px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initial Render
    renderReceiptsList();
});
