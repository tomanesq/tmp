// Całość zamknięta w funkcji, aby nie kolidować z innymi skryptami na stronie Five9
(function() {
    'use strict';

    // --- Konfiguracja ---
    const WEBSOCKET_PORT = 8212;
    const WEBSOCKET_URL = `ws://127.0.0.1:${WEBSOCKET_PORT}`;
    const LOG_PREFIX = '[micHit]';

    /**
     * Główna funkcja, która nawiązuje i obsługuje połączenie WebSocket.
     */
    function connect() {
        console.log(`${LOG_PREFIX} Próba połączenia z aplikacją .exe pod adresem: ${WEBSOCKET_URL}`);
        
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
            console.log(`${LOG_PREFIX} Połączono! Oczekuję na sygnał 'micHit'.`);
        };

        // Wywoływane, gdy nadejdzie wiadomość z serwera .exe
        socket.onmessage = (event) => {
            if (event.data === "micHit") {
                console.log(`${LOG_PREFIX} Odebrano sygnał 'micHit'. Rozpoczynam sekwencję odbierania połączenia.`);

                // --- ZAKTUALIZOWANA LOGIKA SEKWENCYJNA ---

                // KROK 1: Sprawdź, czy funkcja do pobierania metadanych istnieje
                if (typeof window.getMetatadata !== 'function') {
                    console.error(`${LOG_PREFIX} BŁĄD: Funkcja 'getMetatadata' nie została znaleziona!`);
                    return; // Przerwij działanie, jeśli nie można wykonać kroku 1
                }
                
                console.log(`${LOG_PREFIX} Krok 1: Wywołuję getMetatadata()...`);
                
                // Wywołaj funkcję i poczekaj na jej zakończenie za pomocą .then()
                window.getMetatadata().then(() => {
                    // Ten blok kodu wykona się DOPIERO PO pomyślnym pobraniu metadanych
                    
                    console.log(`${LOG_PREFIX} Krok 2: Metadane pobrane. Wywołuję answerCall()...`);

                    if (typeof window.answerCall === 'function') {
                        window.answerCall(); // Wywołaj funkcję odbierania połączenia
                    } else {
                        console.error(`${LOG_PREFIX} BŁĄD: Funkcja 'answerCall' nie została znaleziona!`);
                    }

                }).catch(error => {
                    // Obsługa błędów, jeśli pobieranie metadanych się nie powiedzie
                    console.error(`${LOG_PREFIX} BŁĄD podczas pobierania metadanych:`, error);
                });
            }
        };

        socket.onclose = () => {
            console.log(`${LOG_PREFIX} Rozłączono. Próba ponownego połączenia za 5 sekund.`);
            setTimeout(connect, 5000);
        };

        socket.onerror = (err) => {
            socket.close();
        };
    }

    // Uruchomienie skryptu po załadowaniu strony
    window.addEventListener('load', connect);

})();
