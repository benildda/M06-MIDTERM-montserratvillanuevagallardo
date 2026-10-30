
import './style.css'

// 1. Crear el formulario del perfil
document.querySelector('#app').innerHTML = `

<h1>PokeMemory</h1>
<form id="profile-form">
  <label for="username">Nombre de usuario</label>
  <input type="text" id="username" name="username" minlength="3" maxlength="15" required>

  <p id="username-error"></p>
  <label for="pokemon-search">Pokémon favorito</label>
  <input type="text" id="pokemon-search" name="pokemon-search">
  <div id="pokemon-suggestions"></div>
  <img id="pokemon-image" alt="Pokémon favorito" hidden>
  <p id="pokemon-error"></p>
  <button type="submit">Crear perfil</button>
</form>

<!-- Pantalla del juego -->
<section id="game-screen" hidden>
  <h2>Partida PokeMemory</h2>
  <p id="player-name"></p>
  <img id="player-pokemon-image" alt="Pokémon favorito">
  <label for="card-count">Número de cartas</label>
<input
  type="number"
  id="card-count"
  min="2"
  step="2"
  value="4"
>
<button id="start-game" type="button">Empezar partida</button>
<p id="card-error"></p>
<p id="game-timer">Tiempo: 0m 0s</p>
<div id='game-board'></div>
<!-- 36. Mostrar el ranking de partidas -->
<!-- 55. Crear la tabla del ranking -->
<h3>Ranking de jugadores</h3>
<table>
  <thead>
    <tr>
      <th>Posición</th>
      <th>Jugador</th>
      <th>Pokémon</th>
      <th>Tiempo</th>
      <th>Cartas</th>
    </tr>
  </thead>
  <tbody id="ranking-list"></tbody>
</table>
  <button id="logout-button" type="button">Cerrar sesión</button>
</section>

`

// 2. Validar el nombre de usuario y el Pokémon seleccionado
const formulario = document.querySelector('#profile-form');

formulario.addEventListener('submit', function (event) {
  event.preventDefault();

  const mensajeError = document.querySelector('#username-error');
  const inputUsername = document.querySelector('#username');
  const nombre = inputUsername.value.trim();

  if (nombre.length < 3 || nombre.length > 15) {
    mensajeError.textContent = 'El nombre debe tener entre 3 y 15 caracteres';
    return;
  }

  mensajeError.textContent = '';
  const mensajePokemonError = document.querySelector('#pokemon-error');

  if (pokemonSeleccionado === null) {
    mensajePokemonError.textContent = 'Debes seleccionar un Pokémon de la lista';
    return;
  }

  mensajePokemonError.textContent = '';

  // 12. Guardar el perfil del jugador en sessionStorage
  const perfilJugador = {
    nombre: nombre,
    pokemon: pokemonSeleccionado
  };

  sessionStorage.setItem('perfilJugador', JSON.stringify(perfilJugador));
  mostrarPantallaJuego(perfilJugador);
});

// 3. Preparar las variables
let listaPokemon = [];
let pokemonSeleccionado = null;

// 37. Recuperar el ranking guardado en localStorage
let ranking = JSON.parse(localStorage.getItem('rankingPokeMemory')) || [];

// 4. Obtener la lista de Pokémon desde PokeAPI
fetch(`https://pokeapi.co/api/v2/pokemon?limit=2000`)
  .then(function (respuesta) {
    return respuesta.json();
  })
  .then(function (datos) {
    listaPokemon = datos.results;
    console.log(listaPokemon);
  });

// 5. Preparar el buscador y las sugerencias
const buscadorPokemon = document.querySelector('#pokemon-search');
const contenedorSugerencias = document.querySelector('#pokemon-suggestions');

// 6. Filtrar los Pokémon según el texto introducido
buscadorPokemon.addEventListener('input', function (event) {

  pokemonSeleccionado = null;

  const imagenPokemon = document.querySelector('#pokemon-image');
  imagenPokemon.hidden = true;

  const busqueda = event.target.value.toLowerCase().trim();
  contenedorSugerencias.textContent = '';

  if (busqueda.length === 0) {
    return;
  }

  // 7. Mostrar un máximo de cinco sugerencias
  const coincidencias = listaPokemon.filter(function (pokemon) {
    return pokemon.name.startsWith(busqueda);
  }).slice(0, 5);

  console.log(coincidencias);

  coincidencias.forEach(function (pokemon) {

    const parrafo = document.createElement('p');
    parrafo.textContent = pokemon.name;

    // 8. Seleccionar el Pokémon favorito
    parrafo.addEventListener('click', function () {
      buscadorPokemon.value = pokemon.name;
      contenedorSugerencias.textContent = '';

      // 9. Consultar sus datos en PokeAPI
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
        .then(function (respuesta) {
          return respuesta.json();
        })
        .then(function (datos) {

          // 10. Mostrar su imagen
          const imagenPokemon = document.querySelector('#pokemon-image');

          imagenPokemon.src = datos.sprites.front_default;
          imagenPokemon.hidden = false;

          // 11. Guardar los datos del Pokémon seleccionado en una variable
          pokemonSeleccionado = {
            id: datos.id,
            nombre: datos.name,
            imagen: datos.sprites.front_default
          };

          console.log(pokemonSeleccionado);
        });

      console.log('Has seleccionado:', pokemon.name);
    });

    contenedorSugerencias.appendChild(parrafo);
  });

});

// 13. Recuperar el perfil guardado en sessionStorage
const perfilGuardado = sessionStorage.getItem('perfilJugador');

if (perfilGuardado !== null) {
  const perfil = JSON.parse(perfilGuardado);

  console.log('Perfil recuperado:', perfil);

  // 14. Restaurar los datos del perfil en el formulario
  document.querySelector('#username').value = perfil.nombre;

  buscadorPokemon.value = perfil.pokemon.nombre;

  const imagenPokemon = document.querySelector('#pokemon-image');
  imagenPokemon.src = perfil.pokemon.imagen;
  imagenPokemon.hidden = false;

  pokemonSeleccionado = perfil.pokemon;
  mostrarPantallaJuego(perfil);
}

// 40. Mostrar los resultados guardados en el ranking
function mostrarRanking() {
  const listaRanking = document.querySelector('#ranking-list');

  listaRanking.innerHTML = '';
  // 62. Mostrar un mensaje si todavía no hay resultados
  if (ranking.length === 0) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');

    celda.textContent = 'Todavía no hay partidas registradas';
    celda.colSpan = 5;

    fila.appendChild(celda);
    listaRanking.appendChild(fila);

    return;
  }
  // 43. Ordenar el ranking por número de cartas y tiempo
  ranking.sort(function (a, b) {
    if (a.cartas !== b.cartas) {
      return b.cartas - a.cartas;
    }

    return a.tiempo - b.tiempo;
  });


  // 56. Crear una fila por cada resultado del ranking
  ranking.forEach(function (resultado, indice) {

    const fila = document.createElement('tr');

    // 57. Crear la celda de posición
    const celdaPosicion = document.createElement('td');
    celdaPosicion.textContent = indice + 1;
    fila.appendChild(celdaPosicion);

    // 58. Crear la celda del jugador
    const celdaJugador = document.createElement('td');
    celdaJugador.textContent = resultado.nombre;
    fila.appendChild(celdaJugador);

    // 59. Crear la celda del Pokémon favorito
    const celdaPokemon = document.createElement('td');
    celdaPokemon.textContent = resultado.pokemon || 'Sin dato';
    fila.appendChild(celdaPokemon);

    // 60. Crear la celda del tiempo
    const celdaTiempo = document.createElement('td');
    celdaTiempo.textContent = resultado.tiempo + ' segundos';
    fila.appendChild(celdaTiempo);

    // 61. Crear la celda del número de cartas
    const celdaCartas = document.createElement('td');
    celdaCartas.textContent = resultado.cartas;
    fila.appendChild(celdaCartas);


    listaRanking.appendChild(fila);
  });
}

// 41. Mostrar el ranking al cargar la página
mostrarRanking();

// 15. Mostrar la pantalla del juego
function mostrarPantallaJuego(perfil) {
  document.querySelector('#profile-form').hidden = true;
  document.querySelector('#game-screen').hidden = false;

  document.querySelector('#player-name').textContent = perfil.nombre;
  document.querySelector('#player-pokemon-image').src = perfil.pokemon.imagen;
}

// 16. Cerrar la sesión del jugador
const botonCerrarSesion = document.querySelector('#logout-button');

botonCerrarSesion.addEventListener('click', function () {
  sessionStorage.removeItem('perfilJugador');
  location.reload();
});


// 17. Validar el número de cartas
const botonEmpezar = document.querySelector('#start-game');

// 33. Preparar la variable para controlar el temporizador
let temporizador = null;


botonEmpezar.addEventListener('click', function () {
  const inputCartas = document.querySelector('#card-count');
  const numeroCartas = Number(inputCartas.value);

  console.log('Número de cartas:', numeroCartas);
  const mensajeError = document.querySelector('#card-error');

  if (
    !Number.isInteger(numeroCartas) ||
    numeroCartas < 2 ||
    numeroCartas % 2 !== 0
  ) {
    mensajeError.textContent = 'Introduce un número entero, positivo y par de cartas';
    return;
  }

  mensajeError.textContent = '';
  console.log('Número válido:', numeroCartas);

  // 34. Detener el temporizador anterior antes de empezar otra partida
  clearInterval(temporizador);

  // 22. Iniciar el temporizador de la partida
  let segundos = 0;

  // 35. Reiniciar el tiempo que aparece en pantalla
  document.querySelector('#game-timer').textContent = 'Tiempo: 0m 0s';


  temporizador = setInterval(function () {
    segundos++;

    // 50. Calcular los minutos y segundos transcurridos
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    // 51. Mostrar el tiempo con el formato solicitado
    document.querySelector('#game-timer').textContent =
      'Tiempo: ' + minutos + 'm ' + segundosRestantes + 's';
  }, 1000);

  // 18. Calcular el número de parejas
  const numeroParejas = numeroCartas / 2;

  console.log('Parejas necesarias:', numeroParejas);

  // 19. Elegir Pokémon aleatorios sin repetir
  const pokemonElegidos = [];

  while (pokemonElegidos.length < numeroParejas) {
    const indiceAleatorio = Math.floor(Math.random() * listaPokemon.length);
    const pokemonAleatorio = listaPokemon[indiceAleatorio];

    if (!pokemonElegidos.includes(pokemonAleatorio)) {
      pokemonElegidos.push(pokemonAleatorio);
    }
  }

  console.log('Pokémon elegidos:', pokemonElegidos);

  // 20. Crear las parejas de Pokémon
  const cartas = [...pokemonElegidos, ...pokemonElegidos];

  console.log('Cartas de la partida:', cartas);


  // 21. Mezclar las cartas
  const cartasMezcladas = [];

  while (cartas.length > 0) {
    const indiceAleatorio = Math.floor(Math.random() * cartas.length);
    const cartaExtraida = cartas.splice(indiceAleatorio, 1);
    cartasMezcladas.push(cartaExtraida[0]);
  }

  console.log('Cartas mezcladas:', cartasMezcladas);

  // 24. Preparar y limpiar el tablero para una nueva partida
  const tablero = document.querySelector('#game-board');
  tablero.innerHTML = '';

  // 25. Guardar las cartas descubiertas y contar las parejas encontradas
  const cartasGiradas = [];
  let parejasEncontradas = 0;

  // 26. Crear un botón por cada carta del tablero
  cartasMezcladas.forEach(function (pokemon) {

    const carta = document.createElement('button');

    // 47. Crear el símbolo de la carta oculta
    const reverso = document.createElement('span');
    reverso.textContent = '?';
    carta.appendChild(reverso);

    // 46. Crear la imagen del Pokémon y mantenerla oculta
    const imagenCarta = document.createElement('img');

    // 44. Obtener la imagen del Pokémon mediante PokeAPI
    fetch(pokemon.url)
      .then(function (respuesta) {
        return respuesta.json();
      })
      .then(function (datos) {
        imagenCarta.src = datos.sprites.front_default;
      });
    imagenCarta.alt = pokemon.name;
    imagenCarta.hidden = true;

    carta.appendChild(imagenCarta);

    tablero.appendChild(carta);

    // 27. Descubrir una carta al pulsarla
    carta.addEventListener('click', function () {

      // 28. Evitar descubrir más de dos cartas o repetir una carta descubierta
      if (cartasGiradas.length === 2 || reverso.hidden) {
        return;
      }

      // 48. Ocultar el reverso y mostrar la imagen del Pokémon
      reverso.hidden = true;
      imagenCarta.hidden = false;

      cartasGiradas.push({ carta: carta, pokemon: pokemon });

      // 29. Comparar los Pokémon cuando hay dos cartas descubiertas
      if (cartasGiradas.length === 2) {

        if (cartasGiradas[0].pokemon.name === cartasGiradas[1].pokemon.name) {

          // 30. Mantener descubiertas las parejas correctas y aumentar el contador
          console.log('¡Pareja encontrada!');
          parejasEncontradas++;
          console.log('Parejas encontradas:', parejasEncontradas);

          // 31. Comprobar si se han encontrado todas las parejas y detener el tiempo
          if (parejasEncontradas === numeroParejas) {
            clearInterval(temporizador);

            // 52. Recuperar el Pokémon favorito del jugador
            const perfil = JSON.parse(sessionStorage.getItem('perfilJugador'));

            // 38. Preparar el resultado de la partida
            const resultado = {
              id: Date.now(),
              nombre: document.querySelector('#player-name').textContent,
              pokemon: perfil.pokemon.nombre,
              cartas: numeroCartas,
              tiempo: segundos
            };
            // 39. Guardar el resultado en localStorage
            ranking.push(resultado);
            localStorage.setItem('rankingPokeMemory', JSON.stringify(ranking));
            // 42. Actualizar el ranking después de ganar
            mostrarRanking();
            alert('¡Enhorabuena! Has ganado la partida');
          }

          cartasGiradas[0].carta.disabled = true;
          cartasGiradas[1].carta.disabled = true;

          cartasGiradas.splice(0, 2);

        } else {

          // 32. Ocultar las cartas diferentes después de un segundo
          console.log('Las cartas son diferentes');
          setTimeout(function () {

            // 49. Volver a ocultar las imágenes de las cartas diferentes
            cartasGiradas[0].carta.querySelector('img').hidden = true;
            cartasGiradas[1].carta.querySelector('img').hidden = true;

            cartasGiradas[0].carta.querySelector('span').hidden = false;
            cartasGiradas[1].carta.querySelector('span').hidden = false;

            cartasGiradas.splice(0, 2);
          }, 1000);
        }
      }

      console.log('Cartas giradas:', cartasGiradas);
      console.log(pokemon.name);
    });

  });

});
