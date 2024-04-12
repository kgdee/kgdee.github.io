const storagePrefix = "github-home_"

const cardsEl = document.querySelector(".cards")

const username = 'kgdee';


async function updateCardsEl() {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repositories = await response.json();
    
    repositories.forEach(async (repo) => {
      if (repo.has_pages) {
        const name = repo.name.replace(/-/g, ' ')
        const iconUrl = `https://${username}.github.io/${repo.name}/favicon.png`
        const icon = await checkImageUrl(iconUrl) ? iconUrl : "images/internet.png"
        const pageUrl = `https://${username}.github.io/${repo.name}/`
        cardsEl.innerHTML += `
          <a href="${pageUrl}" target="_blank" class="card">
            <img src=${icon} class="icon">
            <p class="title">${name}</p>
          </a>
        `
      } else {
        // console.log(`GitHub Pages is not enabled for ${repo.full_name}`);
      }
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
}

function checkImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = function() {
      // Image loaded successfully
      resolve(true);
    };

    img.onerror = function() {
      // Error loading image
      resolve(false);
    };

    img.src = url;
  });
}


document.addEventListener("DOMContentLoaded", function() {
  updateCardsEl()
})