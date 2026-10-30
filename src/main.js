
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
<div id='game-board'></div>
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

  const tablero = document.querySelector('#game-board');
  tablero.innerHTML = '';
  const cartasGiradas = [];
  cartasMezcladas.forEach(function (pokemon) {

    const carta = document.createElement('button');
    carta.textContent = '?';
    tablero.appendChild(carta);

    carta.addEventListener('click', function () {
      carta.textContent = pokemon.name;
      cartasGiradas.push({ carta: carta, pokemon: pokemon });
      console.log('Cartas giradas:', cartasGiradas);
      console.log(pokemon.name);
    });

  });

});