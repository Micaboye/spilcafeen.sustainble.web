"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle spil - tilgængelig for alle funktioner
let allGames = [];
const optimizedImages = {
  Backgammon: "img/backgammon.webp",
  Catan: "img/catan.webp",
  Cluedo: "img/cluedo.webp",
  Ludo: "img/ludo.webp",
  Matador: "img/matador.webp",
  Monopoly: "img/monopoly.webp",
  Partners: "img/partners.webp",
  Risk: "img/risk.webp",
  Sequence: "img/sequence.webp",
  Skak: "img/skak.webp",
  Stratego: "img/stratego.webp",
  Uno: "img/uno.webp",
  Yatzy: "img/yatzy.webp",
};

function getGameImage(game) {
  return optimizedImages[game.title] || game.image;
}
// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames();

  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames);

  document
    .querySelector("#genre-select1")
    .addEventListener("change", filterGames);

  document
    .querySelector("#genre-select2")
    .addEventListener("change", filterGames);

  document
    .querySelector("#players-select")
    .addEventListener("change", filterGames);

  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);
}

async function getGames() {
  // Hent data fra URL - await venter på svar før vi går videre
  let response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json",
  );

  allGames = await response.json();
  console.log(allGames.map((game) => game.title));
  populateGenreDropdown();
  displayGames(allGames);
}

// #4: Render et enkelt spilkort
function displayGame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = `
    <article class="game-card">
      <button class="game-card-button" type="button">
       <img
 src="${getGameImage(game)}"
  alt=""
  class="game-poster"
  loading="lazy"
  decoding="async"
/>

        <div class="game-info">
          <h2>${game.title}</h2>

          <p class="game-rating">
            <span aria-hidden="true">★</span>
            <span class="sr-only">Bedømmelse:</span>
            ${game.rating} ud af 5
          </p>

          <p class="game-playtime">Ca. ${game.playtime} min.</p>

          <p class="game-players">
            ${game.players.min} - ${game.players.max} spillere
          </p>

          <p class="game-genre">${game.genre}</p>
        </div>
      </button>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;
  const cardButton = newCard.querySelector(".game-card-button");

  cardButton.addEventListener("click", function () {
    showGameModal(game);
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====

// #5: Udfyld dropdowns
function populateGenreDropdown() {
  // Players dropdown
  const playersSelect = document.querySelector("#players-select");
  const playerCounts = new Set();

  for (const game of allGames) {
    if (
      game.players &&
      typeof game.players.min === "number" &&
      typeof game.players.max === "number"
    ) {
      for (let i = game.players.min; i <= game.players.max; i++) {
        playerCounts.add(i);
      }
    }
  }

  const sortedPlayers = Array.from(playerCounts).sort((a, b) => a - b);

  playersSelect.innerHTML = '<option value="all">Antal spillere</option>';

  sortedPlayers.forEach((num) => {
    playersSelect.innerHTML += `<option value="${num}">${num} spillere</option>`;
  });

  // Genre dropdown
  const genreSelect = document.querySelector("#genre-select1");
  const genres = new Set();

  for (const game of allGames) {
    if (game.genre) genres.add(game.genre);
  }

  genreSelect.innerHTML = '<option value="all">Kategori</option>';

  genres.forEach((genre) => {
    genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
  });

  // Playtime dropdown
  const playtimeSelect = document.querySelector("#genre-select2");
  const playtimes = new Set();

  for (const game of allGames) {
    if (game.playtime) playtimes.add(game.playtime);
  }

  const sortedPlaytimes = Array.from(playtimes).sort((a, b) => a - b);

  playtimeSelect.innerHTML = '<option value="all">Varighed</option>';

  sortedPlaytimes.forEach((time) => {
    playtimeSelect.innerHTML += `<option value="${time}">${time} min.</option>`;
  });
}

// #6: Vis spil i dialog
function showGameModal(game) {
  document.querySelector("#dialog-content").innerHTML = `
    <img
      src="${getGameImage(game)}"
      alt=""
      class="game-poster"
    >

    <div class="dialog-details">
      <h2 id="dialog-title">${game.title}</h2>

      <p class="game-genre">
        ${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || ""}
      </p>

      <p>
        <strong>Antal spillere:</strong>
        ${game.players.min}–${game.players.max}
      </p>

      <p>
        <strong>Spilletid:</strong>
        Ca. ${game.playtime} min.
      </p>

      <p class="game-rating">
        <span aria-hidden="true">★</span>
        <span class="sr-only">Bedømmelse:</span>
        ${game.rating} ud af 5
      </p>

      <div class="game-about">
        <h3>Om spillet</h3>
        <p class="game-description">${game.description}</p>
      </div>
    </div>
  `;

  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====

// #7: Ryd alle filtre
function clearAllFilters() {
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#genre-select2").value = "all";
  document.querySelector("#genre-select1").value = "all";

  filterGames();
}

// #8: Filtrering
function filterGames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();

  const genre1Value = document.querySelector("#genre-select1").value;

  const genre2Value = document.querySelector("#genre-select2").value;

  const playersValue = document.querySelector("#players-select")?.value;

  let filteredGames = allGames;

  // Søg efter titel
  if (searchValue) {
    filteredGames = filteredGames.filter((game) =>
      game.title.toLowerCase().includes(searchValue),
    );
  }

  // Filtrer efter kategori
  if (genre1Value !== "all") {
    filteredGames = filteredGames.filter((game) => game.genre === genre1Value);
  }

  // Filtrer efter varighed
  if (genre2Value !== "all") {
    filteredGames = filteredGames.filter(
      (game) => String(game.playtime) === genre2Value,
    );
  }

  // Filtrer efter antal spillere
  if (playersValue && playersValue !== "all") {
    const num = Number(playersValue);

    filteredGames = filteredGames.filter(
      (game) =>
        game.players && num >= game.players.min && num <= game.players.max,
    );
  }

  displayGames(filteredGames);
}

// ===== VIS SPILLISTE =====
function displayGames(games) {
  const gameList = document.querySelector("#game-list");
  const resultsStatus = document.querySelector("#results-status");

  gameList.innerHTML = "";

  if (!games || games.length === 0) {
    resultsStatus.textContent = "Ingen spil fundet";
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre</p>';
    return;
  }

  if (games.length === 1) {
    resultsStatus.textContent = "1 spil fundet";
  } else {
    resultsStatus.textContent = `${games.length} spil fundet`;
  }

  for (const game of games) {
    displayGame(game);
  }
}
