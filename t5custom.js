'use strict';

(function() {

    // Definicje zmiennych globalnych, które będą używane przez różne funkcje
    let agentId, tenantId, interactionApi, apiBaseUrl, activeCallData;

    // --- GŁÓWNA FUNKCJA URUCHAMIAJĄCA ---
    // Czekamy, aż cały interfejs Five9 się załaduje
    window.addEventListener('DOMContentLoaded', () => {
        console.log('[CustomScript] Strona Five9 załadowana. Uruchamiam skrypt.');
        initializeApis();
        createControlPanel(); // Stwórz nasze przyciski
        connectToLocalMicListener(); // Uruchom nasłuch na mikrofon
    });

    // --- INICJALIZACJA API FIVE9 ---
    function initializeApis() {
        if (window.Five9 && window.Five9.CrmSdk) {
            interactionApi = window.Five9.CrmSdk.interactionApi();
            interactionApi.subscribe({
                callStarted: (params) => {
                    activeCallData = params.callData;
                    console.log("[CustomScript] Nowe połączenie:", params);
                }
            });
            console.log('[CustomScript] API Five9 zainicjalizowane.');
        } else {
            console.error('[CustomScript] Błąd: SDK Five9 nie jest dostępne.');
        }
    }

    // --- DYNAMICZNE TWORZENIE INTERFEJSU ---
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.bottom = '10px';
        panel.style.right = '10px';
        panel.style.padding = '15px';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        panel.style.color = 'white';
        panel.style.borderRadius = '8px';
        panel.style.zIndex = '9999';
        panel.style.border = '1px solid #555';

        panel.innerHTML = '<h6>Panel Kontrolny</h6>';

        // Funkcja pomocnicza do tworzenia przycisków
        const createButton = (text, onClick) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.style.margin = '5px';
            // Proste style, można je przenieść do pliku CSS
            btn.style.padding = '5px 10px';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', onClick);
            return btn;
        };
        
        // Dodajemy przyciski do panelu
        panel.appendChild(createButton('Get Metadata', getMetatadata));
        panel.appendChild(createButton('Answer Call', answerCall));
        panel.appendChild(createButton('End Call', disconnectActiveCall));
        
        // Dodajemy gotowy panel do strony
        document.body.appendChild(panel);
        console.log('[CustomScript] Panel kontrolny został dodany do strony.');
    }

    // --- FUNKCJE KONTROLUJĄCE FIVE9 ---
    function getMetatadata() {
        console.log("[CustomScript] Pobieram metadane...");
        return interactionApi.getMetadata().then((metadata) => {
            console.log("[CustomScript] Metadane pobrane:", metadata);
            agentId = metadata.agentId;
            tenantId = metadata.tenantId;
            apiBaseUrl = metadata.apiBaseURL;
        });
    }

    function answerCall() {
        if (!agentId || !activeCallData) {
            console.error("[CustomScript] Nie można odebrać: brak agentId lub danych o połączeniu.");
            return;
        }
        console.log("[CustomScript] Próba odebrania połączenia...");
        interactionApi.executeRestApi({ path: `/appsvcs/rs/svc/agents/${agentId}/interactions/calls/${activeCallData.interactionId}/answer`, method: 'PUT', payload: null });
    }
    
    function disconnectActiveCall() {
        if (!agentId || !activeCallData) {
            console.error("[CustomScript] Nie można zakończyć: brak agentId lub danych o połączeniu.");
            return;
        }
        interactionApi.executeRestApi({ path: `/appsvcs/rs/svc/agents/${agentId}/interactions/calls/${activeCallData.interactionId}/disconnect`, method: 'PUT', payload: null });
    }

    // --- LOGIKA WEBSOCKET DO NASŁUCHU MIKROFONU ---
    function connectToLocalMicListener() {
        const WEBSOCKET_URL = `ws://127.0.0.1:8212`;
        const LOG_PREFIX = '[micHit]';

        console.log(`${LOG_PREFIX} Łączenie z lokalna aplikacją...`);
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => console.log(`${LOG_PREFIX} Połączono! Oczekuję na sygnał 'micHit'.`);
        socket.onclose = () => setTimeout(connectToLocalMicListener, 5000);
        socket.onerror = () => socket.close();

        socket.onmessage = (event) => {
            if (event.data === "micHit") {
                console.log(`${LOG_PREFIX} Odebrano sygnał 'micHit'. Rozpoczynam sekwencję odbierania.`);
                getMetatadata().then(() => {
                    console.log(`${LOG_PREFIX} Metadane pobrane. Wywołuję answerCall()...`);
                    answerCall();
                }).catch(error => {
                    console.error(`${LOG_PREFIX} Błąd podczas pobierania metadanych:`, error);
                });
            }
        };
    }

})(); // Natychmiastowe wywołanie funkcji, aby uruchomić kod