// Map controller for chang@
window.ChangaMap = null;

document.addEventListener("DOMContentLoaded", () => {
    // Check if map container exists
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    // Ubicación alternativa: Recoleta, CABA. En HTTPS puede reemplazarse por la ubicación real.
    const fallbackCenter = [-34.588, -58.409];
    let defaultCenter = [...fallbackCenter];
    const workerBasePositions = new Map(
        (window.AppState?.workers || []).map(worker => [worker.id, { lat: worker.lat, lng: worker.lng }])
    );
    let map = null;
    let isOfflineMode = false;
    
    try {
        if (typeof L === 'undefined') {
            throw new Error("Leaflet library not loaded");
        }
        
        // Initialize Leaflet Map
        map = L.map("map", {
            center: defaultCenter,
            zoom: 14,
            zoomControl: false // Hide default zoom buttons
        });
        
        window.ChangaMap = map;
        
        // Add custom zoom control at bottom right
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
    
        // Add CartoDB Dark Matter tile layer for an extremely premium dark theme look
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        let tileErrors = 0;
        tileLayer.on('tileerror', () => {
            tileErrors += 1;
            if (tileErrors === 3) {
                mapContainer.classList.add('degraded-map');
                const warning = document.createElement('div');
                warning.className = 'offline-map-overlay map-service-warning';
                warning.innerHTML = '<i data-lucide="wifi-off"></i><span>El mapa online no respondió. Los trabajadores siguen disponibles.</span>';
                mapContainer.appendChild(warning);
                window.safeCreateIcons({ nodeList: warning.querySelectorAll('[data-lucide]') });
            }
        });
    } catch (error) {
        console.warn("Leaflet failed to load, switching to premium offline illustrative map mode.", error);
        isOfflineMode = true;
        mapContainer.classList.add("offline-map");
        
        // Add offline warning overlay
        const overlay = document.createElement("div");
        overlay.className = "offline-map-overlay";
        overlay.innerHTML = `<i data-lucide="wifi-off"></i><span>Modo Local: Cargando mapa ilustrativo interactivo</span>`;
        mapContainer.appendChild(overlay);
        setTimeout(() => window.safeCreateIcons({ nodeList: [overlay.querySelector("[data-lucide]")] }), 100);
    }

    // Custom Icons using SVG templates
    function createCustomIcon(avatarUrl, color = '#7c4dff') {
        return L.divIcon({
            html: `
                <div class="custom-map-marker" style="border-color: ${color};">
                    <img src="${avatarUrl}" alt="worker">
                    <div class="marker-pulse" style="background-color: ${color};"></div>
                </div>
            `,
            className: 'custom-marker-wrapper',
            iconSize: [46, 46],
            iconAnchor: [23, 46]
        });
    }

    // Add client marker (Carlos) for Leaflet mode
    let clientMarker = null;
    if (!isOfflineMode && map) {
        const clientIcon = L.divIcon({
            html: `
                <div class="custom-map-marker client-marker" style="border-color: #00f2fe; background-color: #0a0b10;">
                    <i data-lucide="user" style="color: #00f2fe; width: 20px; height: 20px;"></i>
                </div>
            `,
            className: 'custom-marker-wrapper',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
        
        clientMarker = L.marker(defaultCenter, { icon: clientIcon }).addTo(map)
            .bindPopup("<b>Tu ubicación</b><br><span id=\"client-location-popup\">Recoleta, CABA</span>")
            .openPopup();
            
        // Re-create icons inside leaflet markers after render
        setTimeout(() => window.safeCreateIcons({ nodeList: document.querySelectorAll(".client-marker [data-lucide]") }), 100);
    }

    // Geolocalización real con alternativa segura.
    const locationControl = document.getElementById("location-control");
    const locationButton = document.getElementById("btn-use-location");
    const locationTitle = document.getElementById("location-title");
    const locationStatus = document.getElementById("location-status");

    function distanceInKm(lat1, lng1, lat2, lng2) {
        const toRad = value => value * Math.PI / 180;
        const earthRadius = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function moveWorkersNear(center) {
        const latOffset = center[0] - fallbackCenter[0];
        const lngOffset = center[1] - fallbackCenter[1];
        window.AppState.workers.forEach(worker => {
            const base = workerBasePositions.get(worker.id);
            if (!base) return;
            worker.lat = base.lat + latOffset;
            worker.lng = base.lng + lngOffset;
            const km = distanceInKm(center[0], center[1], worker.lat, worker.lng);
            worker.distance = `${km < 1 ? km.toFixed(1) : km.toFixed(1)} km`;
        });
    }

    function applyUserLocation(center, label, source = "real") {
        defaultCenter = [...center];
        moveWorkersNear(defaultCenter);

        if (!isOfflineMode && map) {
            map.setView(defaultCenter, 14);
            if (clientMarker) {
                clientMarker.setLatLng(defaultCenter);
                clientMarker.setPopupContent(`<b>Tu ubicación</b><br>${label}`);
            }
        }

        renderWorkerMarkers(document.querySelector("#category-chips .chip.active")?.dataset.cat || "all");
        if (locationControl) {
            locationControl.classList.remove("is-loading", "is-success", "is-fallback");
            locationControl.classList.add(source === "real" ? "is-success" : "is-fallback");
        }
        if (locationTitle) locationTitle.textContent = source === "real" ? "Ubicación real activa" : "Ubicación alternativa activa";
        if (locationStatus) locationStatus.textContent = label;
        if (locationButton) locationButton.innerHTML = source === "real"
            ? '<i data-lucide="check-circle-2"></i> Ubicación actualizada'
            : '<i data-lucide="locate-fixed"></i> Usar mi ubicación';
        if (window.lucide) window.safeCreateIcons();

        if (window.StorageService) {
            StorageService.save("changa_location", { lat: center[0], lng: center[1], label, source });
        }
    }

    function useFallbackLocation(message = "Recoleta, CABA (ubicación alternativa)") {
        applyUserLocation(fallbackCenter, message, "fallback");
    }

    function requestRealLocation() {
        if (!navigator.geolocation) {
            useFallbackLocation("Tu navegador no permite geolocalización. Usamos Recoleta, CABA.");
            return;
        }
        if (locationControl) locationControl.classList.add("is-loading");
        if (locationTitle) locationTitle.textContent = "Buscando tu ubicación…";
        if (locationStatus) locationStatus.textContent = "El navegador puede pedirte permiso.";
        if (locationButton) locationButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            position => {
                locationButton.disabled = false;
                const center = [position.coords.latitude, position.coords.longitude];
                const accuracy = Math.round(position.coords.accuracy || 0);
                applyUserLocation(center, `Coordenadas detectadas · precisión aproximada: ${accuracy} m`, "real");
            },
            error => {
                locationButton.disabled = false;
                const messages = {
                    1: "Permiso no concedido. Usamos Recoleta, CABA.",
                    2: "No pudimos determinar tu ubicación. Usamos Recoleta, CABA.",
                    3: "La ubicación tardó demasiado. Usamos Recoleta, CABA."
                };
                useFallbackLocation(messages[error.code] || "Usamos Recoleta, CABA como alternativa.");
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
    }

    locationButton?.addEventListener("click", requestRealLocation);

    // Store active markers/elements
    let activeMarkers = [];
    let offlineMarkerElements = [];
    let selectedWorker = null;
    let activeRoutePolyline = null;
    let tripInterval = null;

    // Calculate percentage coords for offline mode
    function getOfflineCoords(lat, lng) {
        const centerLat = defaultCenter[0];
        const centerLng = defaultCenter[1];
        const dLat = lat - centerLat;
        const dLng = lng - centerLng;
        // Map GPS differences around Recoleta to nice screen percentages
        const x = 50 + (dLng * 2200);
        const y = 50 - (dLat * 3000);
        return {
            x: Math.max(15, Math.min(85, x)),
            y: Math.max(15, Math.min(85, y))
        };
    }

    // Load workers onto the map
    function renderWorkerMarkers(categoryFilter = "all") {
        const filtered = categoryFilter === "all" 
            ? window.AppState.workers 
            : window.AppState.workers.filter(w => w.category === categoryFilter);

        if (!isOfflineMode) {
            // Leaflet Mode
            activeMarkers.forEach(m => map.removeLayer(m));
            activeMarkers = [];

            filtered.forEach(w => {
                const markerColor = w.category === 'plumber' ? '#00e676' :
                                    w.category === 'electrician' ? '#ffd600' :
                                    w.category === 'cleaning' ? '#00f2fe' :
                                    w.category === 'gardening' ? '#ff1744' : '#7c4dff';
                
                const icon = createCustomIcon(w.avatar, markerColor);
                const marker = L.marker([w.lat, w.lng], { icon: icon }).addTo(map);
                
                // Attach worker data to marker object
                marker.workerData = w;
                
                // Click Handler
                marker.on("click", () => {
                    selectWorker(w);
                });
                
                activeMarkers.push(marker);
            });
        } else {
            // Offline Mode
            // Clear existing offline DOM elements (except overlay)
            offlineMarkerElements.forEach(el => el.remove());
            offlineMarkerElements = [];

            // Add offline client marker (Carlos) in the center (50%, 50%)
            const clientDiv = document.createElement("div");
            clientDiv.className = "offline-client-marker custom-map-marker client-marker";
            clientDiv.style.borderColor = "#00f2fe";
            clientDiv.style.backgroundColor = "#0a0b10";
            clientDiv.style.left = "50%";
            clientDiv.style.top = "50%";
            clientDiv.style.position = "absolute";
            clientDiv.innerHTML = `<i data-lucide="user" style="color: #00f2fe; width: 20px; height: 20px;"></i>`;
            mapContainer.appendChild(clientDiv);
            offlineMarkerElements.push(clientDiv);
            setTimeout(() => window.safeCreateIcons({ nodeList: [clientDiv.querySelector("[data-lucide]")] }), 100);

            // Add workers
            filtered.forEach(w => {
                const markerColor = w.category === 'plumber' ? '#00e676' :
                                    w.category === 'electrician' ? '#ffd600' :
                                    w.category === 'cleaning' ? '#00f2fe' :
                                    w.category === 'gardening' ? '#ff1744' : '#7c4dff';
                
                const coords = getOfflineCoords(w.lat, w.lng);
                
                const workerDiv = document.createElement("div");
                workerDiv.className = "offline-marker custom-map-marker";
                workerDiv.style.borderColor = markerColor;
                workerDiv.style.left = `${coords.x}%`;
                workerDiv.style.top = `${coords.y}%`;
                workerDiv.style.position = "absolute";
                workerDiv.innerHTML = `
                    <img src="${w.avatar}" alt="${w.name}">
                    <div class="marker-pulse" style="background-color: ${markerColor};"></div>
                `;
                
                // Store worker data and original coordinates for animation
                workerDiv.dataset.originalX = coords.x;
                workerDiv.dataset.originalY = coords.y;
                workerDiv.dataset.workerId = w.id;
                
                // Click Handler
                workerDiv.addEventListener("click", () => {
                    selectWorker(w);
                });
                
                mapContainer.appendChild(workerDiv);
                offlineMarkerElements.push(workerDiv);
            });
        }
    }

    // Select Worker and Display Details
    function selectWorker(worker) {
        selectedWorker = worker;
        
        // Update Details DOM
        document.getElementById("detail-avatar").src = worker.avatar;
        document.getElementById("detail-name").textContent = worker.name;
        document.getElementById("detail-rating").textContent = worker.rating;
        document.getElementById("detail-jobs-count").textContent = worker.jobsCount;
        document.getElementById("detail-specialty").textContent = worker.specialty;
        document.getElementById("detail-distance").textContent = worker.distance;
        document.getElementById("detail-price").textContent = `$${worker.price.toLocaleString('es-AR')}`;
        document.getElementById("detail-tax").textContent = worker.taxStatus;
        document.getElementById("detail-bio").textContent = worker.bio;
        
        // Show detail card, hide empty state & progress card
        document.getElementById("match-prompt").classList.add("hidden");
        document.getElementById("worker-detail-card").classList.remove("hidden");
        document.getElementById("trip-progress-card").classList.add("hidden");
        
        // Center map slightly offset for card overlay UI (only in Leaflet mode)
        if (!isOfflineMode && map) {
            map.panTo([worker.lat - 0.003, worker.lng]);
        }
    }

    // Category Filter Chips
    const categoryChips = document.getElementById("category-chips");
    categoryChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        
        // Toggle Active
        categoryChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        
        const cat = chip.getAttribute("data-cat");
        renderWorkerMarkers(cat);
        
        // Hide details when filtering
        document.getElementById("match-prompt").classList.remove("hidden");
        document.getElementById("worker-detail-card").classList.add("hidden");
        selectedWorker = null;
    });

    // Search bar filter
    const searchInput = document.getElementById("job-search");
    searchInput.addEventListener("input", (e) => {
        const text = e.target.value.toLowerCase();
        
        if (!isOfflineMode) {
            activeMarkers.forEach(m => {
                const w = m.workerData;
                const matches = w.name.toLowerCase().includes(text) || 
                                w.specialty.toLowerCase().includes(text) || 
                                w.bio.toLowerCase().includes(text);
                
                if (matches) {
                    m.addTo(map);
                } else {
                    map.removeLayer(m);
                }
            });
        } else {
            offlineMarkerElements.forEach(el => {
                if (el.classList.contains("offline-client-marker")) return;
                const workerId = el.dataset.workerId;
                const w = window.AppState.workers.find(wk => wk.id == workerId);
                if (!w) return;
                
                const matches = w.name.toLowerCase().includes(text) || 
                                w.specialty.toLowerCase().includes(text) || 
                                w.bio.toLowerCase().includes(text);
                
                if (matches) {
                    el.style.display = "block";
                } else {
                    el.style.display = "none";
                }
            });
        }
    });

    // Initial Marker Load. Restauramos la última ubicación elegida si existe.
    const savedLocation = window.StorageService?.load("changa_location", null);
    if (savedLocation && Number.isFinite(savedLocation.lat) && Number.isFinite(savedLocation.lng)) {
        applyUserLocation([savedLocation.lat, savedLocation.lng], savedLocation.label || "Ubicación guardada", savedLocation.source || "fallback");
    } else {
        useFallbackLocation();
    }

    // --- UBER TRIP SIMULATION ---
    const btnRequestJob = document.getElementById("btn-request-job");
    const btnCancelTrip = document.getElementById("btn-cancel-trip");
    const btnCompleteTrip = document.getElementById("btn-complete-trip");
    
    const tripProgressCard = document.getElementById("trip-progress-card");
    const workerDetailCard = document.getElementById("worker-detail-card");
    const mapIndicator = document.getElementById("map-indicator");
    
    btnRequestJob.addEventListener("click", () => {
        if (!selectedWorker) return;
        
        // Hide detail, show progress
        workerDetailCard.classList.add("hidden");
        tripProgressCard.classList.remove("hidden");
        
        // Set trip worker details
        document.getElementById("trip-avatar").src = selectedWorker.avatar;
        document.getElementById("trip-worker-name").textContent = selectedWorker.name;
        
        simulateTrip(selectedWorker);
    });

    function simulateTrip(worker) {
        const progressBar = document.getElementById("trip-progress-bar");
        const statusText = document.getElementById("trip-status-text");
        
        const stepReq = document.getElementById("step-req");
        const stepRoute = document.getElementById("step-route");
        const stepWork = document.getElementById("step-work");
        const stepDone = document.getElementById("step-done");
        
        // Reset states
        progressBar.style.width = "0%";
        statusText.textContent = "Aceptando solicitud...";
        stepReq.className = "timeline-step active";
        stepRoute.className = "timeline-step";
        stepWork.className = "timeline-step";
        stepDone.className = "timeline-step";
        btnCancelTrip.classList.remove("hidden");
        btnCompleteTrip.classList.add("hidden");
        
        let workerMarker = null;
        let workerEl = null;
        let startX, startY;
        let offlineRouteSvg = null;

        if (!isOfflineMode) {
            // Find Leaflet marker
            workerMarker = activeMarkers.find(m => m.workerData.id === worker.id);
            
            // Draw route polyline (Worker -> Client)
            const workerPos = [worker.lat, worker.lng];
            const clientPos = defaultCenter;
            
            if (activeRoutePolyline) map.removeLayer(activeRoutePolyline);
            
            activeRoutePolyline = L.polyline([workerPos, clientPos], {
                color: '#7c4dff',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);
            
            // Fit bounds to show both
            map.fitBounds(activeRoutePolyline.getBounds(), { padding: [50, 50] });
        } else {
            // Find offline marker element
            workerEl = offlineMarkerElements.find(el => el.dataset.workerId == worker.id);
            if (workerEl) {
                startX = parseFloat(workerEl.dataset.originalX);
                startY = parseFloat(workerEl.dataset.originalY);
            }
            
            // Clear any existing SVG route
            const existingSvg = mapContainer.querySelector(".offline-route-svg");
            if (existingSvg) existingSvg.remove();

            // Create SVG line route
            offlineRouteSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            offlineRouteSvg.setAttribute("class", "offline-route-svg");
            offlineRouteSvg.innerHTML = `
                <line x1="${startX}%" y1="${startY}%" x2="50%" y2="50%" class="offline-route-path" />
            `;
            mapContainer.appendChild(offlineRouteSvg);
        }

        // Phase 1: Confirming (2s)
        let progress = 10;
        progressBar.style.width = `${progress}%`;
        
        tripInterval = setTimeout(() => {
            // Phase 2: En Camino
            statusText.textContent = "Changador en camino...";
            stepReq.className = "timeline-step done";
            stepRoute.className = "timeline-step active";
            mapIndicator.classList.remove("hidden");
            if (isOfflineMode) {
                mapIndicator.querySelector("#map-indicator-text").textContent = "Simulando trayecto...";
            }
            
            // Animation coordinates interpolation
            const frames = 60; // 6 seconds of movement
            let frame = 0;
            
            const animateMarker = setInterval(() => {
                frame++;
                const ratio = frame / frames;
                
                if (!isOfflineMode) {
                    const currentLat = worker.lat + (defaultCenter[0] - worker.lat) * ratio;
                    const currentLng = worker.lng + (defaultCenter[1] - worker.lng) * ratio;
                    
                    if (workerMarker) {
                        workerMarker.setLatLng([currentLat, currentLng]);
                    }
                    
                    // Update polyline to show remaining path
                    activeRoutePolyline.setLatLngs([[currentLat, currentLng], defaultCenter]);
                } else {
                    // Offline animation
                    const currentX = startX + (50 - startX) * ratio;
                    const currentY = startY + (50 - startY) * ratio;
                    
                    if (workerEl) {
                        workerEl.style.left = `${currentX}%`;
                        workerEl.style.top = `${currentY}%`;
                    }
                    
                    // Update SVG line
                    const line = offlineRouteSvg?.querySelector("line");
                    if (line) {
                        line.setAttribute("x1", `${currentX}%`);
                        line.setAttribute("y1", `${currentY}%`);
                    }
                }
                
                // Update progress bar
                progress = 10 + (ratio * 40); // 10% to 50%
                progressBar.style.width = `${progress}%`;
                
                if (frame >= frames) {
                    clearInterval(animateMarker);
                    
                    // Phase 3: Arrived & Work in Progress (4s)
                    statusText.textContent = "Trabajo en curso...";
                    stepRoute.className = "timeline-step done";
                    stepWork.className = "timeline-step active";
                    mapIndicator.querySelector("#map-indicator-text").textContent = "Trabajo en curso en tu domicilio...";
                    
                    if (!isOfflineMode) {
                        if (workerMarker) {
                            workerMarker.setLatLng(defaultCenter);
                        }
                        if (activeRoutePolyline) map.removeLayer(activeRoutePolyline);
                    } else {
                        if (workerEl) {
                            workerEl.style.left = "50%";
                            workerEl.style.top = "50%";
                        }
                        if (offlineRouteSvg) offlineRouteSvg.remove();
                    }
                    
                    let workFrame = 0;
                    const workInterval = setInterval(() => {
                        workFrame++;
                        progress = 50 + (workFrame / 40 * 40); // 50% to 90%
                        progressBar.style.width = `${progress}%`;
                        
                        if (workFrame >= 40) {
                            clearInterval(workInterval);
                            
                            // Phase 4: Done
                            statusText.textContent = "¡Trabajo completado!";
                            stepWork.className = "timeline-step done";
                            stepDone.className = "timeline-step active";
                            progressBar.style.width = "100%";
                            mapIndicator.classList.add("hidden");
                            
                            window.addNotification("Changa Finalizada", `${worker.name} finalizó el trabajo de ${worker.specialty}. Confirmá y facturá el servicio.`, "success");
                            
                            // Swap cancel for complete button
                            btnCancelTrip.classList.add("hidden");
                            btnCompleteTrip.classList.remove("hidden");
                        }
                    }, 100);
                }
            }, 100);
            
        }, 2000);
    }

    // Cancel Trip
    btnCancelTrip.addEventListener("click", () => {
        clearTimeout(tripInterval);
        if (!isOfflineMode) {
            if (activeRoutePolyline) map.removeLayer(activeRoutePolyline);
        } else {
            const existingSvg = mapContainer.querySelector(".offline-route-svg");
            if (existingSvg) existingSvg.remove();
        }
        mapIndicator.classList.add("hidden");
        
        // Reset worker to original position
        renderWorkerMarkers();
        
        tripProgressCard.classList.add("hidden");
        document.getElementById("match-prompt").classList.remove("hidden");
        
        window.addNotification("Changa Cancelada", "Cancelaste la solicitud de servicio.", "warning");
    });

    // Complete Trip
    btnCompleteTrip.addEventListener("click", () => {
        if (!selectedWorker) return;
        
        // Add new item to changas array in AppState
        const randomId = "CH-" + Math.floor(1000 + Math.random() * 9000);
        const today = new Date().toISOString().slice(0,10);
        
        const newChanga = {
            id: randomId,
            service: selectedWorker.specialty,
            category: selectedWorker.category === 'plumber' ? 'Plomería' :
                      selectedWorker.category === 'electrician' ? 'Electricidad' :
                      selectedWorker.category === 'cleaning' ? 'Limpieza' :
                      selectedWorker.category === 'gardening' ? 'Jardinería' : 'Mascotas',
            date: today,
            party: selectedWorker.name,
            amount: selectedWorker.price,
            status: "completed",
            afipStatus: "Pendiente de Emisión",
            invoiceId: null
        };
        
        window.AppState.changas.unshift(newChanga);
        window.AppState.user.billedTotal += selectedWorker.price;
        window.persistAppState();
        
        // Update lists
        window.loadChangasTable();
        window.updateMonotributoStats();
        
        // Notify
        window.addNotification("Pago Aprobado", `Se abonaron $${selectedWorker.price} a ${selectedWorker.name}. El comprobante AFIP está listo para emitir.`, "success");
        
        // Clean up UI
        tripProgressCard.classList.add("hidden");
        document.getElementById("match-prompt").classList.remove("hidden");
        renderWorkerMarkers();
        
        // Redirect user to billing tab to issue receipt (AFIP Factura C)
        const billingNavItem = document.querySelector('[data-view="receipts-section"]');
        if (billingNavItem) {
            billingNavItem.click();
            // Pre-fill invoice generator form with the completed job data
            window.ReceiptsCtrl.prepareInvoiceForChanga(randomId);
        }
    });
});
