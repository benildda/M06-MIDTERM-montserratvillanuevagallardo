
import './style.css'


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
  <div id="game-board"></div>

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


  const perfilJugador = {
    nombre: nombre,
    pokemon: pokemonSeleccionado
  };

  sessionStorage.setItem('perfilJugador', JSON.stringify(perfilJugador));
  mostrarPantallaJuego(perfilJugador);
});


let listaPokemon = [];
let pokemonSeleccionado = null;


let ranking = JSON.parse(localStorage.getItem('rankingPokeMemory')) || [];
let ultimaPartidaId = null;
let tiempoOcultacion = null;

fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
  .then(function (respuesta) {
    return respuesta.json();
  })
  .then(function (datos) {
    listaPokemon = datos.results;
    console.log(listaPokemon);
  });


const buscadorPokemon = document.querySelector('#pokemon-search');
const contenedorSugerencias = document.querySelector('#pokemon-suggestions');


buscadorPokemon.addEventListener('input', function (event) {

  pokemonSeleccionado = null;

  const imagenPokemon = document.querySelector('#pokemon-image');
  imagenPokemon.hidden = true;

  const busqueda = event.target.value.toLowerCase().trim();
  contenedorSugerencias.textContent = '';

  if (busqueda.length === 0) {
    return;
  }


  const coincidencias = listaPokemon.filter(function (pokemon) {
    return pokemon.name.startsWith(busqueda);
  }).slice(0, 5);

  console.log(coincidencias);

  coincidencias.forEach(function (pokemon) {

    const parrafo = document.createElement('p');
    parrafo.textContent = pokemon.name;


    parrafo.addEventListener('click', function () {
      buscadorPokemon.value = pokemon.name;
      contenedorSugerencias.textContent = '';


      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
        .then(function (respuesta) {
          return respuesta.json();
        })
        .then(function (datos) {

          const imagenPokemon = document.querySelector('#pokemon-image');

          imagenPokemon.src = datos.sprites.front_default;
          imagenPokemon.hidden = false;


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


const perfilGuardado = sessionStorage.getItem('perfilJugador');

if (perfilGuardado !== null) {
  const perfil = JSON.parse(perfilGuardado);

  console.log('Perfil recuperado:', perfil);


  document.querySelector('#username').value = perfil.nombre;

  buscadorPokemon.value = perfil.pokemon.nombre;

  const imagenPokemon = document.querySelector('#pokemon-image');
  imagenPokemon.src = perfil.pokemon.imagen;
  imagenPokemon.hidden = false;

  pokemonSeleccionado = perfil.pokemon;
  mostrarPantallaJuego(perfil);
}


function mostrarRanking() {
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


mostrarRanking();


function mostrarPantallaJuego(perfil) {
  document.querySelector('#profile-form').hidden = true;
  document.querySelector('#game-screen').hidden = false;

  document.querySelector('#player-name').textContent = perfil.nombre;
  document.querySelector('#player-pokemon-image').src = perfil.pokemon.imagen;
}


const botonCerrarSesion = document.querySelector('#logout-button');

botonCerrarSesion.addEventListener('click', function () {
  sessionStorage.removeItem('perfilJugador');
  location.reload();
});



const botonEmpezar = document.querySelector('#start-game');


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

  if (listaPokemon.length === 0) {
    mensajeError.textContent = 'Espera a que se carguen los Pokémon';
    return;
  }

  if (numeroCartas / 2 > listaPokemon.length) {
    mensajeError.textContent = 'Has solicitado demasiadas cartas';
    return;
  }

  clearInterval(temporizador);

  clearTimeout(tiempoOcultacion);
  tiempoOcultacion = null;

  let segundos = 0;


  document.querySelector('#game-timer').textContent = 'Tiempo: 0m 0s';


  temporizador = setInterval(function () {
    segundos++;


    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;


    document.querySelector('#game-timer').textContent =
      'Tiempo: ' + minutos + 'm ' + segundosRestantes + 's';
  }, 1000);


  const numeroParejas = numeroCartas / 2;

  console.log('Parejas necesarias:', numeroParejas);


  const pokemonElegidos = [];

  while (pokemonElegidos.length < numeroParejas) {
    const indiceAleatorio = Math.floor(Math.random() * listaPokemon.length);
    const pokemonAleatorio = listaPokemon[indiceAleatorio];

    if (!pokemonElegidos.includes(pokemonAleatorio)) {
      pokemonElegidos.push(pokemonAleatorio);
    }
  }

  console.log('Pokémon elegidos:', pokemonElegidos);


  const cartas = [...pokemonElegidos, ...pokemonElegidos];

  console.log('Cartas de la partida:', cartas);



  const cartasMezcladas = [];

  while (cartas.length > 0) {
    const indiceAleatorio = Math.floor(Math.random() * cartas.length);
    const cartaExtraida = cartas.splice(indiceAleatorio, 1);
    cartasMezcladas.push(cartaExtraida[0]);
  }

  console.log('Cartas mezcladas:', cartasMezcladas);


  const tablero = document.querySelector('#game-board');
  tablero.innerHTML = '';


  const cartasGiradas = [];
  let parejasEncontradas = 0;


  cartasMezcladas.forEach(function (pokemon) {

    const carta = document.createElement('button');


    const reverso = document.createElement('span');
    reverso.textContent = '?';
    carta.appendChild(reverso);


    const imagenCarta = document.createElement('img');


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


    carta.addEventListener('click', function () {

      if (cartasGiradas.length === 2 || reverso.hidden) {
        return;
      }


      reverso.hidden = true;
      imagenCarta.hidden = false;

      cartasGiradas.push({ carta: carta, pokemon: pokemon });


      if (cartasGiradas.length === 2) {

        if (cartasGiradas[0].pokemon.name === cartasGiradas[1].pokemon.name) {

          console.log('¡Pareja encontrada!');
          parejasEncontradas++;
          console.log('Parejas encontradas:', parejasEncontradas);


          if (parejasEncontradas === numeroParejas) {
            clearInterval(temporizador);


            const perfil = JSON.parse(sessionStorage.getItem('perfilJugador'));


            const resultado = {
              id: Date.now(),
              nombre: document.querySelector('#player-name').textContent,
              pokemon: perfil.pokemon.nombre,
              cartas: numeroCartas,
              tiempo: segundos
            };

            ranking.push(resultado);
            localStorage.setItem('rankingPokeMemory', JSON.stringify(ranking));

            ultimaPartidaId = resultado.id;

            mostrarRanking();
            alert('¡Enhorabuena! Has ganado la partida');
          }

          cartasGiradas[0].carta.disabled = true;
          cartasGiradas[1].carta.disabled = true;

          cartasGiradas.splice(0, 2);

        } else {

          console.log('Las cartas son diferentes');


          tiempoOcultacion = setTimeout(function () {
            cartasGiradas[0].carta.querySelector('img').hidden = true;
            cartasGiradas[1].carta.querySelector('img').hidden = true;

            cartasGiradas[0].carta.querySelector('span').hidden = false;
            cartasGiradas[1].carta.querySelector('span').hidden = false;

            cartasGiradas.splice(0, 2);
            tiempoOcultacion = null;
          }, 1000);
        }
      }

      console.log('Cartas giradas:', cartasGiradas);
      console.log(pokemon.name);
    });

  });

});
