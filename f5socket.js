(function() {
  const WEBSOCKET_PORT = 8765;
  const wsUrl = `ws://127.0.0.1:${WEBSOCKET_PORT}`;

  function connect() {
    console.log("Próba połączenia z lokalną aplikacją nasłuchującą...");
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Połączono z aplikacją .exe. Oczekuję na sygnał.");
    };

    socket.onmessage = (event) => {
      if (event.data === "HIT") {
        console.log("Otrzymano sygnał 'HIT' z aplikacji .exe! Odbieram połączenie.");
        
        // --- TUTAJ WSTAW KOD DO ODBIERANIA POŁĄCZENIA FIVE9 ---
        // Np. if (typeof five9 !== 'undefined') five9.interactionApi.accept();
      }
    };

    socket.onclose = () => {
      console.log("Rozłączono. Próba ponownego połączenia za 5 sekund.");
      setTimeout(connect, 5000); // Spróbuj połączyć się ponownie
    };
    
    socket.onerror = (err) => {
      // Błąd najczęściej oznacza, że aplikacja .exe nie jest uruchomiona
      // console.error("Błąd WebSocket. Upewnij się, że aplikacja .exe jest uruchomiona.");
      socket.close();
    };
  }

  // Rozpocznij proces po załadowaniu strony
  window.addEventListener('load', connect);
})();