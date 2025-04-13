const storagePrefix = "github-home_";

const cardsContainer = document.querySelector(".cards-container");

const username = "kgdee";

document.addEventListener("DOMContentLoaded", function() {
  updateCardsContainer()
})

async function updateCardsContainer() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repositories = await response.json();

    for (const repo of repositories) {
      if (!repo.has_pages) continue;

      const name = repo.name.replace(/-/g, " ");
      const iconUrl = `https://${username}.github.io/${repo.name}/favicon.png`;
      const icon = "card-icon.png";
      const pageUrl = `https://${username}.github.io/${repo.name}/`;
      cardsContainer.innerHTML += `
        <a href="${pageUrl}" class="card" data-repo-id="${repo.id}">
          <div class="icon-wrapper">
            <img src=${icon} class="icon">
          </div>
          <p class="title">${name}</p>
        </a>
      `;
      updateCardIcon(repo.id, iconUrl);
    }
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

function checkImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = function () {
      // Image loaded successfully
      resolve(true);
    };

    img.onerror = function () {
      // Error loading image
      resolve(false);
    };

    img.src = url;
  });
}

async function updateCardIcon(repoId, iconUrl) {
  const iconUrlIsValid = await checkImageUrl(iconUrl);

  if (iconUrlIsValid) {
    const iconEl = document.querySelector(`.card[data-repo-id="${repoId}"] img`);
    iconEl.src = iconUrl;
  }
}

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});
