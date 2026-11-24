const SearchBar = (() => {
  const element = document.querySelector(".search-bar");
  const textInput = element.querySelector("input");
  const clearBtn = element.querySelector(".clear-btn");

  function search(terms = "") {
    searchItems(terms);
    clearBtn.innerHTML = terms ? `<i class="bi bi-x-lg"></i>` : `<i class="bi bi-search"></i>`;
  }

  function clear() {
    textInput.value = "";
    search();
  }

  function toggle() {
    element.classList.toggle("hidden");
  }

  return { search, toggle, clear };
})();
