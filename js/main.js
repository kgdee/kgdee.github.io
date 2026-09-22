const navbar = document.querySelector(".navbar");
const itemsGrid = document.querySelector(".items-grid");

let currentItems = [];
let darkTheme = load("darkTheme", true);

document.addEventListener("DOMContentLoaded", () => {
  fetchItems();
  toggleTheme(darkTheme);
});

async function fetchItems() {
  const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
  const repositories = await response.json();
  currentItems = repositories.filter((repo) => repo.has_pages);

  displayItems();
}

function displayItems(items) {
  itemsGrid.innerHTML =
    (items || currentItems)
      .map((item) => {
        if (item.name === PROJECT_NAME) return "";
        const name = formatItemName(item.name);
        const icon = `https://${USERNAME}.github.io/${item.name}/favicon.png`;
        const url = `https://${USERNAME}.github.io/${item.name}/`;
        return `
        <a href="${url}" class="item">
          <img src=${icon}>
          <p>${name}</p>
        </a>
      `;
      })
      .join("") || `<div class="message">No items found</div>`;
}

function formatItemName(str) {
  return str
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

function toggleTheme(force) {
  const toggle = document.querySelector(".theme-toggle");
  darkTheme = force === undefined ? !darkTheme : force;
  save("darkTheme", darkTheme);
  document.body.classList.toggle("dark-theme", darkTheme);
  toggle.innerHTML = darkTheme ? `<i class="bi bi-sun"></i>` : `<i class="bi bi-moon"></i>`;
}
