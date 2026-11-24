const navbar = document.querySelector(".navbar");
const itemsGrid = document.querySelector(".items-grid");

let currentItems = [];

document.addEventListener("DOMContentLoaded", async () => {
  await Firebase.init();
  await loadItems();
});

async function loadItems() {
  let items = await Firebase.getDocuments("projects/shortcuts/items");
  items = items.map((item) => ({ iconUrl: `${item.url}/favicon.png`, ...item }));

  const itemsFromGitHub = await getItemsFromGitHub();
  currentItems = [...items, ...itemsFromGitHub];
  displayItems();
}

async function getItemsFromGitHub() {
  const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
  const repositories = await response.json();

  let items = repositories.filter((item) => item.has_pages && item.name !== PROJECT_NAME);

  items = items.map((item) => ({
    title: formatRepoName(item.name),
    iconUrl: `https://${USERNAME}.github.io/${item.name}/favicon.png`,
    url: `https://${USERNAME}.github.io/${item.name}/`,
  }));

  return items;
}

function displayItems(items) {
  items = items || currentItems;
  itemsGrid.innerHTML =
    items
      .map(
        (item) => `
          <a href="${item.url}" class="item">
            <img src=${item.iconUrl}>
            <p>${item.title}</p>
          </a>
      `,
      )
      .join("") || `<div class="msg">No items found</div>`;
}

function formatRepoName(str) {
  return str
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

function searchItems(terms) {
  terms = terms.trim().toLowerCase();
  const filteredItems = terms ? currentItems.filter((item) => item.title.toLowerCase().includes(terms)) : null;
  displayItems(filteredItems);
}
