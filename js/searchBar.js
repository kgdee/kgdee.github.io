const SearchBar = (() => {
  const element = document.querySelector(".search-bar");
  const searchBoxes = document.querySelectorAll(".search-box");
  const clearBtns = document.querySelectorAll(".search .clear");

  function search(terms) {
    const items = currentItems;
    const query = terms.trim().toLowerCase();
    const filteredItems = query ? items.filter((item) => item.name.toLowerCase().includes(query)) : null;
    displayItems(filteredItems);

    searchBoxes.forEach((el) => (el.querySelector("input").value = terms));
    clearBtns.forEach((el) => (el.innerHTML = query ? `<i class="bi bi-x-lg"></i>` : `<i class="bi bi-search"></i>`));
  }

  function clear() {
    search("");
  }

  function toggle() {
    if (navbar.classList.contains("search")) clear();
    navbar.classList.toggle("search");
  }

  return { search, toggle, clear };
})();
