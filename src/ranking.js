export function mostrarRanking(ranking, ultimaPartidaId) {
    const listaRanking = document.querySelector('#ranking-list');

    listaRanking.innerHTML = '';

    if (ranking.length === 0) {
        const fila = document.createElement('tr');
        const celda = document.createElement('td');

        celda.textContent = 'Todavía no hay partidas registradas';
        celda.colSpan = 5;

        fila.appendChild(celda);
        listaRanking.appendChild(fila);

        return;
    }

    ranking.sort(function (a, b) {
        if (a.cartas !== b.cartas) {
            return b.cartas - a.cartas;
        }

        return a.tiempo - b.tiempo;
    });



    ranking.forEach(function (resultado, indice) {

        const fila = document.createElement('tr');

        if (resultado.id === ultimaPartidaId) {
            fila.classList.add('ultima-partida');
        }

        const celdaPosicion = document.createElement('td');
        celdaPosicion.textContent = indice + 1;
        fila.appendChild(celdaPosicion);


        const celdaJugador = document.createElement('td');
        celdaJugador.textContent = resultado.nombre;
        fila.appendChild(celdaJugador);


        const celdaPokemon = document.createElement('td');
        celdaPokemon.textContent = resultado.pokemon || 'Sin dato';
        fila.appendChild(celdaPokemon);


        const celdaTiempo = document.createElement('td');
        celdaTiempo.textContent = resultado.tiempo + ' segundos';
        fila.appendChild(celdaTiempo);


        const celdaCartas = document.createElement('td');
        celdaCartas.textContent = resultado.cartas;
        fila.appendChild(celdaCartas);


        listaRanking.appendChild(fila);
    });
}