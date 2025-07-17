(function() {
    'use strict';

    const WEBSOCKET_PORT = 8212;
    const WEBSOCKET_URL = `ws://127.0.0.1:${WEBSOCKET_PORT}`;
    const LOG_PREFIX = '[hitMic]';

    function connect() {
        console.log(`${LOG_PREFIX} Próba połączenia z aplikacją .exe pod adresem: ${WEBSOCKET_URL}`);
        
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
            console.log(`${LOG_PREFIX} Połączono! Oczekuję na sygnał...`);
        };

        socket.onmessage = (event) => {
            if (event.data === "micHit") {
                console.log(`${LOG_PREFIX} Odebrano sygnał. Wywołuję istniejącą funkcję answerCall().`);
                if (typeof window.answerCall === 'function') {
                    window.answerCall();
                } else {
                    console.error(`${LOG_PREFIX} BŁĄD: Funkcja 'answerCall' nie została znaleziona.`);
                }
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
