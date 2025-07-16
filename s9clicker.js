(function() {
    'use strict';

    const WEBSOCKET_PORT = 8212;
    const WEBSOCKET_URL = `ws://127.0.0.1:${WEBSOCKET_PORT}`;
    const LOG_PREFIX = '[MicAccept]';

    function clickAcceptWhenReady() {
        const observer = new MutationObserver((mutationsList, obs) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const acceptButton = document.getElementById('incoming_call_accept');
                    
                    if (acceptButton) {
                        console.log(`${LOG_PREFIX} Przycisk "Accept" znaleziony! Klikam...`);
                        acceptButton.click();
                        obs.disconnect(); 
                        return;
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log(`${LOG_PREFIX} Oczekuję na pojawienie się przycisku "Accept"...`);
    }

    function connect() {
        console.log(`${LOG_PREFIX} Próba połączenia z aplikacją .exe pod adresem: ${WEBSOCKET_URL}`);
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
            console.log(`${LOG_PREFIX} Połączono! Oczekuję na sygnał 'micHit'.`);
        };

        socket.onmessage = (event) => {
            if (event.data === "micHit") {
                console.log(`${LOG_PREFIX} Odebrano sygnał 'micHit'. Uruchamiam procedurę odbierania połączenia.`);
                clickAcceptWhenReady();
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

    window.addEventListener('load', connect);
})();