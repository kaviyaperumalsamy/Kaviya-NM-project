import { initialData } from './mockData.js';
import { simulateAgentforceResponse } from './agentforce.js';

class SwiftShipApp {
    constructor() {
        this.data = JSON.parse(localStorage.getItem('swift_ship_data')) || initialData;
        this.currentParcelId = "TRK-849201";
        this.currentTheme = localStorage.getItem('swift_ship_theme') || 'default';
        this.map = null;
        this.mapMarkers = [];
        this.mapPolyline = null;
        this.vehicleMarker = null;
        this.currentTab = "tracker";
        this.isSimulating = false;

        this.initAudio();
        this.initElements();
        this.applyTheme(this.currentTheme);
        this.initEvents();
        this.initMap();
        this.renderAll();
    }

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        } catch (e) {
            this.audioCtx = null;
        }
    }

    playChime(type = 'success') {
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            const now = this.audioCtx.currentTime;
            if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'transit') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch (e) {}
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('swift_ship_theme', theme);
        if (theme === 'default') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', theme);
        }
        const selector = document.getElementById('themeSelector');
        if (selector) selector.value = theme;
    }

    saveState() {
        localStorage.setItem('swift_ship_data', JSON.stringify(this.data));
        this.updateKPIs();
    }

    initElements() {
        this.elements = {
            trackingInput: document.getElementById('trackingInput'),
            trackBtn: document.getElementById('trackBtn'),
            currentParcelTitle: document.getElementById('currentParcelTitle'),
            currentParcelBadge: document.getElementById('currentParcelBadge'),
            stepperContainer: document.getElementById('stepperContainer'),
            stepperProgress: document.getElementById('stepperProgress'),
            timelineContainer: document.getElementById('timelineContainer'),
            detailsGrid: document.getElementById('detailsGrid'),
            advanceStatusBtn: document.getElementById('advanceStatusBtn'),
            simulateJourneyBtn: document.getElementById('simulateJourneyBtn'),
            printWaybillBtn: document.getElementById('printWaybillBtn'),
            aiChatMessages: document.getElementById('aiChatMessages'),
            aiChatInput: document.getElementById('aiChatInput'),
            aiChatSendBtn: document.getElementById('aiChatSendBtn'),
            tabButtons: document.querySelectorAll('.nav-btn'),
            views: {
                tracker: document.getElementById('view-tracker'),
                parcels: document.getElementById('view-parcels'),
                senders: document.getElementById('view-senders'),
                receivers: document.getElementById('view-receivers'),
                deliveries: document.getElementById('view-deliveries'),
                agentforce: document.getElementById('view-agentforce')
            },
            modalBackdrop: document.getElementById('modalBackdrop'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            kpiTotalParcels: document.getElementById('kpiTotalParcels'),
            kpiInTransit: document.getElementById('kpiInTransit')
        };
    }

    initEvents() {
        // Track Search
        this.elements.trackBtn?.addEventListener('click', () => this.handleSearch());
        this.elements.trackingInput?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Quick Search Pills
        document.querySelectorAll('.pill-btn').forEach(pill => {
            pill.addEventListener('click', (e) => {
                const trkId = e.target.getAttribute('data-id');
                if (trkId) {
                    this.elements.trackingInput.value = trkId;
                    this.loadParcel(trkId);
                }
            });
        });

        // Tab Navigation
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Advance Status Simulator
        this.elements.advanceStatusBtn?.addEventListener('click', () => this.advanceCurrentParcelStatus());
        this.elements.simulateJourneyBtn?.addEventListener('click', () => this.simulateFullJourney());
        this.elements.printWaybillBtn?.addEventListener('click', () => this.openWaybillModal());

        // AI Chat
        this.elements.aiChatSendBtn?.addEventListener('click', () => this.sendChatMessage());
        this.elements.aiChatInput?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Prompt Chips
        document.querySelectorAll('.chip-btn').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const prompt = e.target.getAttribute('data-prompt');
                if (prompt) {
                    this.elements.aiChatInput.value = prompt;
                    this.sendChatMessage();
                }
            });
        });

        // Theme Selector
        document.getElementById('themeSelector')?.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
            this.showToast(`Switched color theme to ${e.target.options[e.target.selectedIndex].text}`);
        });

        // Global New Parcel Button
        document.getElementById('newParcelBtn')?.addEventListener('click', () => this.openNewParcelModal());
        document.getElementById('modalCloseBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('resetDataBtn')?.addEventListener('click', () => this.resetData());
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
    }

    showToast(message) {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3500);
    }

    updateKPIs() {
        if (this.elements.kpiTotalParcels) {
            this.elements.kpiTotalParcels.textContent = `${this.data.parcels.length} Active`;
        }
        if (this.elements.kpiInTransit) {
            const activeCount = this.data.parcels.filter(p => p.Status__c === 'In Transit' || p.Status__c === 'Out for Delivery').length;
            this.elements.kpiInTransit.textContent = `${activeCount} Units`;
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.elements.tabButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
        });

        Object.entries(this.elements.views).forEach(([key, el]) => {
            if (el) el.style.display = (key === tabName) ? 'block' : 'none';
        });

        if (tabName === 'tracker') {
            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 200);
        } else if (tabName === 'parcels') {
            this.renderParcelsTable();
        } else if (tabName === 'senders') {
            this.renderSendersTable();
        } else if (tabName === 'receivers') {
            this.renderReceiversTable();
        } else if (tabName === 'deliveries') {
            this.renderDeliveriesTable();
        }
    }

    initMap() {
        if (!document.getElementById('map') || typeof L === 'undefined') return;

        this.map = L.map('map', {
            zoomControl: true,
            attributionControl: false
        }).setView([39.8283, -98.5795], 4);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            subdomains: 'abcd'
        }).addTo(this.map);
    }

    getCurrentParcel() {
        return this.data.parcels.find(p => p.id === this.currentParcelId) || this.data.parcels[0];
    }

    loadParcel(parcelId) {
        const p = this.data.parcels.find(x => x.id === parcelId || x.Parcel_ID__c === parcelId);
        if (p) {
            this.currentParcelId = p.id;
            this.renderTracker();
            this.playChime('success');
            this.showToast(`Loaded parcel: ${p.Parcel_ID__c}`);
        } else {
            this.showToast(`Parcel "${parcelId}" not found in database.`);
        }
    }

    handleSearch() {
        const val = this.elements.trackingInput.value.trim();
        if (val) {
            this.loadParcel(val);
        }
    }

    advanceCurrentParcelStatus() {
        const parcel = this.getCurrentParcel();
        const stages = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
        const currentIndex = stages.indexOf(parcel.Status__c);

        if (currentIndex < stages.length - 1) {
            parcel.Status__c = stages[currentIndex + 1];
            
            // Advance route status
            const currentRouteIdx = parcel.route.findIndex(r => r.status === 'current');
            if (currentRouteIdx !== -1 && currentRouteIdx < parcel.route.length - 1) {
                parcel.route[currentRouteIdx].status = 'completed';
                parcel.route[currentRouteIdx + 1].status = 'current';
            } else if (parcel.Status__c === 'Delivered') {
                parcel.route.forEach(r => r.status = 'completed');
            }

            // Sync delivery status
            const delivery = this.data.deliveries.find(d => d.Parcel__c === parcel.id);
            if (delivery) {
                const currentRouteItem = parcel.route.find(r => r.status === 'current') || parcel.route[parcel.route.length - 1];
                delivery.Current_Location__c = `${currentRouteItem.location} (${parcel.Status__c})`;
            }

            this.saveState();
            this.renderTracker();
            this.playChime('transit');
            this.showToast(`Updated ${parcel.Parcel_ID__c} status to: ${parcel.Status__c}`);
        } else {
            this.showToast(`Parcel ${parcel.Parcel_ID__c} is already Delivered!`);
        }
    }

    async simulateFullJourney() {
        if (this.isSimulating) return;
        this.isSimulating = true;
        const parcel = this.getCurrentParcel();
        this.showToast(`Starting journey simulation for ${parcel.Parcel_ID__c}...`);

        const stages = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
        for (let i = 0; i < stages.length; i++) {
            this.setParcelStatus(stages[i]);
            this.playChime('transit');
            await new Promise(r => setTimeout(r, 1200));
        }

        this.playChime('success');
        this.showToast(`Shipment ${parcel.Parcel_ID__c} delivered successfully!`);
        this.isSimulating = false;
    }

    renderTracker() {
        const parcel = this.getCurrentParcel();
        if (!parcel) return;

        const sender = this.data.senders.find(s => s.id === parcel.Sender__c) || {};
        const receiver = this.data.receivers.find(r => r.parcelId === parcel.id) || {};
        const delivery = this.data.deliveries.find(d => d.Parcel__c === parcel.id) || {};

        // Header details
        this.elements.currentParcelTitle.innerHTML = `
            ${parcel.Parcel_ID__c} — <span style="font-weight: 400; color: var(--text-secondary); font-size: 1rem;">${parcel.name}</span>
        `;

        const statusClass = `status-${parcel.Status__c.replace(/\s+/g, '-')}`;
        this.elements.currentParcelBadge.className = `status-tag ${statusClass}`;
        this.elements.currentParcelBadge.innerHTML = `● ${parcel.Status__c}`;

        // Stepper
        const stages = ["Booked", "In Transit", "Out for Delivery", "Delivered"];
        const currentStageIdx = stages.indexOf(parcel.Status__c);
        const progressPercentage = (currentStageIdx / (stages.length - 1)) * 100;
        this.elements.stepperProgress.style.width = `${progressPercentage}%`;

        this.elements.stepperContainer.innerHTML = stages.map((stage, idx) => {
            let stateClass = "";
            if (idx < currentStageIdx) stateClass = "completed";
            else if (idx === currentStageIdx) stateClass = "active";
            
            const icons = {
                "Booked": "📦",
                "In Transit": "✈️",
                "Out for Delivery": "🚚",
                "Delivered": "✅"
            };

            return `
                <div class="step-node ${stateClass}" onclick="window.swiftApp.setParcelStatus('${stage}')">
                    <div class="step-circle">${icons[stage]}</div>
                    <div class="step-label">${stage}</div>
                </div>
            `;
        }).join('');

        // Details Grid
        this.elements.detailsGrid.innerHTML = `
            <div class="detail-tile">
                <div class="detail-label">Sender (Origin)</div>
                <div class="detail-val">${sender.name || 'N/A'}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${sender.Sender_Address__c || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: var(--accent-secondary); margin-top: 0.2rem;">📞 ${sender.Sender_Contact__c || 'N/A'}</div>
            </div>
            <div class="detail-tile">
                <div class="detail-label">Receiver (Destination)</div>
                <div class="detail-val">${receiver.name || 'N/A'}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${receiver.Receiver_Address__c || 'N/A'}</div>
                <div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 0.2rem;">📞 ${receiver.Receiver_Contact__c || 'N/A'}</div>
            </div>
            <div class="detail-tile">
                <div class="detail-label">Package Weight</div>
                <div class="detail-val">${parcel.Weight__c} kg</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Tier: ${parcel.serviceType || 'Standard Express'}</div>
            </div>
            <div class="detail-tile">
                <div class="detail-label">Estimated Delivery</div>
                <div class="detail-val" style="color: var(--accent-secondary);">${parcel.Estimated_Delivery_Date__c}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Fleet: ${delivery.driver || 'Assigned Driver'}</div>
            </div>
        `;

        // Timeline
        this.elements.timelineContainer.innerHTML = parcel.route.map(step => {
            return `
                <div class="timeline-item ${step.status}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-title">${step.title}</div>
                    <div class="timeline-meta">
                        <span>📍 ${step.location}</span>
                        <span>🕒 ${step.time}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Update Leaflet Map
        this.renderMap(parcel);
        this.updateKPIs();
    }

    setParcelStatus(newStatus) {
        const parcel = this.getCurrentParcel();
        parcel.Status__c = newStatus;
        this.saveState();
        this.renderTracker();
        this.showToast(`Status updated to ${newStatus}`);
    }

    renderMap(parcel) {
        if (!this.map || typeof L === 'undefined') return;

        // Clear existing markers & polyline
        this.mapMarkers.forEach(m => this.map.removeLayer(m));
        this.mapMarkers = [];
        if (this.mapPolyline) {
            this.map.removeLayer(this.mapPolyline);
        }

        const latLngs = [];

        parcel.route.forEach(step => {
            if (step.lat && step.lng) {
                const latLng = [step.lat, step.lng];
                latLngs.push(latLng);

                const isCurrent = step.status === 'current';
                const isCompleted = step.status === 'completed';

                const iconHtml = isCurrent 
                    ? `<div style="background: #0176d3; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 15px #00a1e0;"></div>`
                    : isCompleted 
                    ? `<div style="background: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff;"></div>`
                    : `<div style="background: #64748b; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff;"></div>`;

                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-icon',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const marker = L.marker(latLng, { icon: customIcon })
                    .bindPopup(`<strong>${step.title}</strong><br/>${step.location}<br/><span style="color:#64748b">${step.time}</span>`)
                    .addTo(this.map);

                this.mapMarkers.push(marker);

                if (isCurrent) {
                    marker.openPopup();
                }
            }
        });

        if (latLngs.length > 1) {
            this.mapPolyline = L.polyline(latLngs, {
                color: '#0176d3',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.85
            }).addTo(this.map);

            this.map.fitBounds(L.latLngBounds(latLngs), { padding: [45, 45] });
        }
    }

    sendChatMessage() {
        const input = this.elements.aiChatInput;
        const msg = input.value.trim();
        if (!msg) return;

        // User message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-bubble user';
        userDiv.textContent = msg;
        this.elements.aiChatMessages.appendChild(userDiv);
        input.value = '';

        this.elements.aiChatMessages.scrollTop = this.elements.aiChatMessages.scrollHeight;

        // Bot typing simulation
        setTimeout(() => {
            const result = simulateAgentforceResponse(msg, this.data);
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-bubble bot';
            
            const formatted = result.reply
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
                .replace(/\n/g, '<br/>');

            botDiv.innerHTML = formatted;
            this.elements.aiChatMessages.appendChild(botDiv);
            this.elements.aiChatMessages.scrollTop = this.elements.aiChatMessages.scrollHeight;
            this.playChime('success');

            if (result.parcel) {
                this.loadParcel(result.parcel.id);
            }
        }, 400);
    }

    renderParcelsTable() {
        const tbody = document.getElementById('parcelsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.data.parcels.map(p => {
            const sender = this.data.senders.find(s => s.id === p.Sender__c) || {};
            const receiver = this.data.receivers.find(r => r.parcelId === p.id) || {};
            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--accent-secondary); cursor: pointer;" onclick="window.swiftApp.loadAndSwitchToTracker('${p.id}')">${p.Parcel_ID__c}</td>
                    <td>${p.name}</td>
                    <td>${sender.name || 'N/A'}</td>
                    <td>${receiver.name || 'N/A'}</td>
                    <td>${p.Weight__c} kg</td>
                    <td><span class="status-tag status-${p.Status__c.replace(/\s+/g, '-')}">${p.Status__c}</span></td>
                    <td>${p.Estimated_Delivery_Date__c}</td>
                    <td>
                        <button class="pill-btn" onclick="window.swiftApp.loadAndSwitchToTracker('${p.id}')">Track</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadAndSwitchToTracker(parcelId) {
        this.loadParcel(parcelId);
        this.switchTab('tracker');
    }

    renderSendersTable() {
        const tbody = document.getElementById('sendersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.data.senders.map(s => {
            const parcelCount = this.data.parcels.filter(p => p.Sender__c === s.id).length;
            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--accent-purple);">${s.id}</td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.Sender_Address__c}</td>
                    <td>${s.Sender_Contact__c}</td>
                    <td>${s.Sender_Email__c}</td>
                    <td><span class="status-tag status-Booked">${parcelCount} parcels</span></td>
                </tr>
            `;
        }).join('');
    }

    renderReceiversTable() {
        const tbody = document.getElementById('receiversTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.data.receivers.map(r => {
            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--accent-green);">${r.id}</td>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.Receiver_Address__c}</td>
                    <td>${r.Receiver_Contact__c}</td>
                    <td>${r.Receiver_Email__c}</td>
                    <td><a href="#" style="color: var(--accent-secondary); font-family: monospace;" onclick="window.swiftApp.loadAndSwitchToTracker('${r.parcelId}')">${r.parcelId}</a></td>
                </tr>
            `;
        }).join('');
    }

    renderDeliveriesTable() {
        const tbody = document.getElementById('deliveriesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.data.deliveries.map(d => {
            return `
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">${d.id}</td>
                    <td><strong>${d.name}</strong></td>
                    <td style="color: var(--accent-secondary); font-family: monospace; cursor: pointer;" onclick="window.swiftApp.loadAndSwitchToTracker('${d.Parcel__c}')">${d.Parcel__c}</td>
                    <td>${d.Current_Location__c}</td>
                    <td>${d.driver} (${d.vehicle})</td>
                    <td>${d.Estimated_Delivery_Date__c}</td>
                </tr>
            `;
        }).join('');
    }

    openWaybillModal() {
        const parcel = this.getCurrentParcel();
        const sender = this.data.senders.find(s => s.id === parcel.Sender__c) || {};
        const receiver = this.data.receivers.find(r => r.parcelId === parcel.id) || {};
        const delivery = this.data.deliveries.find(d => d.Parcel__c === parcel.id) || {};

        this.elements.modalTitle.textContent = `Official Waybill & Shipping Label — ${parcel.Parcel_ID__c}`;

        this.elements.modalBody.innerHTML = `
            <div class="waybill-sheet" id="printableWaybill">
                <div class="waybill-header">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 900; letter-spacing: -0.03em;">SWIFT SHIP EXPRESS</div>
                        <div style="font-size: 0.75rem; color: #4b5563;">Salesforce Certified Logistics Network</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.85rem; font-weight: 800; color: #0176d3;">PRIORITY AIR</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">BILLABLE: ${parcel.Weight__c} KG</div>
                    </div>
                </div>

                <!-- Barcode Visualization -->
                <div style="text-align: center; margin: 0.5rem 0;">
                    <svg class="barcode-svg" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <rect x="5" width="3" height="40" fill="#000"/>
                        <rect x="12" width="2" height="40" fill="#000"/>
                        <rect x="18" width="5" height="40" fill="#000"/>
                        <rect x="28" width="2" height="40" fill="#000"/>
                        <rect x="34" width="4" height="40" fill="#000"/>
                        <rect x="42" width="2" height="40" fill="#000"/>
                        <rect x="48" width="6" height="40" fill="#000"/>
                        <rect x="58" width="3" height="40" fill="#000"/>
                        <rect x="66" width="2" height="40" fill="#000"/>
                        <rect x="74" width="4" height="40" fill="#000"/>
                        <rect x="84" width="3" height="40" fill="#000"/>
                        <rect x="92" width="5" height="40" fill="#000"/>
                        <rect x="102" width="2" height="40" fill="#000"/>
                        <rect x="108" width="4" height="40" fill="#000"/>
                        <rect x="116" width="3" height="40" fill="#000"/>
                        <rect x="124" width="6" height="40" fill="#000"/>
                        <rect x="134" width="2" height="40" fill="#000"/>
                        <rect x="140" width="5" height="40" fill="#000"/>
                        <rect x="150" width="3" height="40" fill="#000"/>
                        <rect x="158" width="2" height="40" fill="#000"/>
                        <rect x="166" width="4" height="40" fill="#000"/>
                        <rect x="176" width="5" height="40" fill="#000"/>
                        <rect x="186" width="3" height="40" fill="#000"/>
                        <rect x="194" width="2" height="40" fill="#000"/>
                    </svg>
                    <div style="font-family: monospace; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.1em;">${parcel.Parcel_ID__c}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px dashed #9ca3af; border-bottom: 1px dashed #9ca3af; padding: 0.75rem 0; margin: 0.75rem 0; font-size: 0.85rem;">
                    <div>
                        <div style="font-size: 0.7rem; font-weight: bold; color: #6b7280;">SHIP FROM (SENDER):</div>
                        <div style="font-weight: 700;">${sender.name || 'Origin Dispatch'}</div>
                        <div style="color: #374151; font-size: 0.8rem;">${sender.Sender_Address__c || 'N/A'}</div>
                        <div style="color: #4b5563; font-size: 0.75rem;">Ph: ${sender.Sender_Contact__c || 'N/A'}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; font-weight: bold; color: #6b7280;">SHIP TO (RECEIVER):</div>
                        <div style="font-weight: 700;">${receiver.name || 'Recipient'}</div>
                        <div style="color: #374151; font-size: 0.8rem;">${receiver.Receiver_Address__c || 'N/A'}</div>
                        <div style="color: #4b5563; font-size: 0.75rem;">Ph: ${receiver.Receiver_Contact__c || 'N/A'}</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #4b5563;">
                    <div><strong>Fleet:</strong> ${delivery.name || 'Run #9001'}</div>
                    <div><strong>ETA:</strong> ${parcel.Estimated_Delivery_Date__c}</div>
                    <div><strong>Status:</strong> ${parcel.Status__c}</div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn-outline" onclick="window.swiftApp.closeModal()">Close</button>
                <button type="button" class="btn-primary" onclick="window.print()">🖨️ Print Waybill</button>
            </div>
        `;

        this.elements.modalBackdrop.classList.add('open');
    }

    openNewParcelModal() {
        this.elements.modalTitle.textContent = "Create New Salesforce Record: Parcel__c";
        const senderOptions = this.data.senders.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
        
        this.elements.modalBody.innerHTML = `
            <form id="modalForm">
                <div class="form-group">
                    <label class="form-label">Parcel Name / Description</label>
                    <input type="text" id="newParcelName" class="form-input" placeholder="e.g. Industrial Robotic Sensors" required />
                </div>
                <div class="form-group">
                    <label class="form-label">Sender (Lookup: Sender__c)</label>
                    <select id="newParcelSender" class="form-select">${senderOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Receiver Name</label>
                    <input type="text" id="newReceiverName" class="form-input" placeholder="e.g. Sarah Connor" required />
                </div>
                <div class="form-group">
                    <label class="form-label">Receiver Destination Address</label>
                    <input type="text" id="newReceiverAddress" class="form-input" placeholder="e.g. 742 Evergreen Terr, Springfield, IL" required />
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Weight (kg)</label>
                        <input type="number" id="newParcelWeight" class="form-input" value="4.5" step="0.1" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estimated Delivery Date</label>
                        <input type="date" id="newParcelEta" class="form-input" value="2026-10-10" required />
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                    <button type="button" class="btn-outline" onclick="window.swiftApp.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">⚡ Save to Salesforce Mock</button>
                </div>
            </form>
        `;

        const form = document.getElementById('modalForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleCreateParcelSubmit();
        };

        this.elements.modalBackdrop.classList.add('open');
    }

    closeModal() {
        this.elements.modalBackdrop.classList.remove('open');
    }

    handleCreateParcelSubmit() {
        const name = document.getElementById('newParcelName').value;
        const senderId = document.getElementById('newParcelSender').value;
        const receiverName = document.getElementById('newReceiverName').value;
        const receiverAddress = document.getElementById('newReceiverAddress').value;
        const weight = parseFloat(document.getElementById('newParcelWeight').value);
        const eta = document.getElementById('newParcelEta').value;

        const newIdNum = Math.floor(100000 + Math.random() * 900000);
        const parcelId = `TRK-${newIdNum}`;

        const sender = this.data.senders.find(s => s.id === senderId);

        const newParcel = {
            id: parcelId,
            name: name,
            Parcel_ID__c: parcelId,
            Sender__c: senderId,
            Weight__c: weight,
            Status__c: "Booked",
            Estimated_Delivery_Date__c: eta,
            bookingDate: new Date().toISOString().split('T')[0],
            serviceType: "Swift Express Air",
            route: [
                { title: "Booking Created in Salesforce", location: sender ? sender.Sender_Address__c : "Origin Depot", time: "Just now", status: "current", lat: sender ? sender.lat : 39.8, lng: sender ? sender.lng : -98.5 },
                { title: "Awaiting Carrier Pickup", location: "Local Logistics Depot", time: "Pending", status: "upcoming", lat: (sender ? sender.lat : 39.8) + 0.5, lng: (sender ? sender.lng : -98.5) + 0.5 },
                { title: "Destination Delivery", location: receiverAddress, time: `Expected ${eta}`, status: "upcoming", lat: 40.7128, lng: -74.0060 }
            ]
        };

        const newReceiver = {
            id: `REC-00${this.data.receivers.length + 1}`,
            name: receiverName,
            Receiver_Contact__c: "+1 (555) 000-1122",
            Receiver_Email__c: `${receiverName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            Receiver_Address__c: receiverAddress,
            parcelId: parcelId,
            senderId: senderId,
            city: "Destination City"
        };

        const newDelivery = {
            id: `DEL-${9000 + this.data.deliveries.length + 1}`,
            name: `Delivery Run #${9000 + this.data.deliveries.length + 1}`,
            Parcel__c: parcelId,
            Sender__c: senderId,
            Current_Location__c: `${sender ? sender.city : 'Origin'} (Booked)`,
            Estimated_Delivery_Date__c: eta,
            driver: "Pending Dispatch",
            driverPhone: "N/A",
            vehicle: "Swift Cargo Logistics"
        };

        this.data.parcels.unshift(newParcel);
        this.data.receivers.unshift(newReceiver);
        this.data.deliveries.unshift(newDelivery);

        this.saveState();
        this.closeModal();
        this.loadParcel(parcelId);
        this.switchTab('tracker');
        this.playChime('success');
        this.showToast(`Created parcel ${parcelId} successfully!`);
    }

    resetData() {
        this.data = initialData;
        this.saveState();
        this.currentParcelId = "TRK-849201";
        this.renderAll();
        this.playChime('success');
        this.showToast("Reset all mock data to initial default state.");
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `Swift_Ship_Tracker_Export_${new Date().toISOString().slice(0,10)}.json`);
        dlAnchorElem.click();
        this.showToast("Exported database to JSON!");
    }

    renderAll() {
        this.renderTracker();
        this.renderParcelsTable();
        this.renderSendersTable();
        this.renderReceiversTable();
        this.renderDeliveriesTable();
        this.updateKPIs();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.swiftApp = new SwiftShipApp();
});
