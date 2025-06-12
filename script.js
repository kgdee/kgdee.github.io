const projectName = "kgdee.github.io";
const username = "kgdee";
const cardContainer = document.querySelector(".card-container");

const header = document.getElementById("header")
const searchBar = document.querySelector(".search-bar")
const searchInputs = document.querySelectorAll(".search-box input");
const clearSearchBtns = document.querySelectorAll(".clear-search-btn")

let currentItems = [];
let currentSearchTerms = ""

let darkTheme = JSON.parse(localStorage.getItem(`${projectName}_darkTheme`)) || false;

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

document.addEventListener("DOMContentLoaded", function () {
  fetchItems();
  toggleTheme(darkTheme);
});

async function fetchItems() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repositories = await response.json();
    currentItems = repositories.filter((repo) => repo.has_pages);

    displayItems();
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

function displayItems(items = []) {
  if (items.length <= 0) {
    if (currentSearchTerms) {
      cardContainer.innerHTML = `<div class="message">No items found</div>`;
      return;
    }
    items = currentItems;
  }

  cardContainer.innerHTML = "";
  cardContainer.innerHTML = items
    .map((item) => {
      const name = item.name.replace(/-/g, " ");
      const icon = `https://${username}.github.io/${item.name}/favicon.png`;
      const pageUrl = `https://${username}.github.io/${item.name}/`;
      return `
        <a href="${pageUrl}" class="item" data-repo-id="${item.id}">
          <img src=${icon} class="icon" onerror="this.onerror=null;this.src='card-icon.png';">
          <p class="title truncated">${name}</p>
        </a>
      `;
    })
    .join("");
}

function search(terms) {
  if (!terms && currentSearchTerms === terms) return

  const query = terms.trim().toLowerCase();
  currentSearchTerms = query
  searchInputs.forEach(input => input.value = terms)
  const filteredItems = query ? currentItems.filter((item) => item.name.toLowerCase().includes(query)) : [];
  displayItems(filteredItems);

  clearSearchBtns.forEach(btn => btn.innerHTML = query ? `<i class="bi bi-x-lg"></i>` : `<i class="bi bi-search"></i>`)
}

function clearSearch() {
  search("")
}

function toggleSearchBar() {
  header.classList.toggle("search")
}

function toggleTheme(force = undefined) {
  const toggle = document.querySelector(".theme-toggle");
  force === undefined ? (darkTheme = !darkTheme) : (darkTheme = force);
  localStorage.setItem(`${projectName}_darkTheme`, darkTheme);
  document.body.classList.toggle("dark-theme", darkTheme);
  toggle.innerHTML = darkTheme ? `<i class="bi bi-sun"></i>` : `<i class="bi bi-moon"></i>`;
}
