const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname === "[::1]" || // IPv6 loopback
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/), // 127.0.0.1/8 IPv4 loopback
);

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  handleError(error);
});

function handleError(error) {
  console.error(error);
  alert(error);
  if (!isLocalhost) location.reload();
}

function stopPropagation(event) {
  event.stopPropagation();
}

function generateId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function save(key, value) {
  localStorage.setItem(`${PROJECT_NAME}_${key}`, JSON.stringify(value));
}

function load(key, defaultValue) {
  const savedValue = localStorage.getItem(`${PROJECT_NAME}_${key}`);
  if (savedValue == null) return defaultValue;
  return JSON.parse(savedValue);
}

function reset(key) {
  localStorage.removeItem(`${PROJECT_NAME}_${key}`);
}

function sleep(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFileName(file) {
  const fileName = file.name;
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) return fileName;

  return fileName.slice(0, lastDotIndex);
}

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function download(url, name) {
  const link = document.createElement("a");

  link.href = url;
  link.download = name;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function toggleHide(element) {
  element.classList.toggle("hidden");
}

function toggleFullscreen(force) {
  if (document.fullscreenElement && force !== true) {
    document.exitFullscreen();
  } else if (force !== false) {
    document.documentElement.requestFullscreen();
  }
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getUniqueItems(arr, count) {
  if (!Array.isArray(arr) || count <= 0) return [];
  const k = Math.min(count, arr.length);
  const result = [...arr];
  for (let i = 0; i < k; i++) {
    const randIndex = Math.floor(Math.random() * (result.length - i)) + i;
    [result[i], result[randIndex]] = [result[randIndex], result[i]];
  }
  return result.slice(0, k);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (match) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return escapeMap[match];
  });
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function getFreshUrl(url) {
  if (!url) return "";
  return `${url}?t=${new Date().getTime()}`;
}

function formatQuantity(count, singular, plural = singular + "s") {
  return `${count} ${count === 1 ? singular : plural}`;
}

function createElement(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const element = doc.body.firstChild; // Extracts the parsed element
  return element;
}

const ObjectUtils = (() => {
  function replaceKey(obj, index, newKey) {
    const keys = Object.keys(obj);

    // Validate index
    if (index < 0 || index >= keys.length) {
      throw new Error("Index out of bounds");
    }

    const result = {};

    keys.forEach((key, i) => {
      // If this is the target index, use the new key; otherwise, keep the old key
      const currentKey = i === index ? newKey : key;
      result[currentKey] = obj[key];
    });

    return result;
  }

  function replaceValue(obj, index, newValue) {
    const entries = Object.entries(obj);

    // Validate index
    if (index < 0 || index >= entries.length) {
      throw new Error("Index out of bounds");
    }

    const result = {};

    entries.forEach(([key, value], i) => {
      // If this is the target index, use the new value; otherwise, keep the original value
      result[key] = i === index ? newValue : value;
    });

    return result;
  }

  return { replaceKey, replaceValue };
})();

function getTableData(element) {
  const data = {};
  const rows = element.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const inputs = row.querySelectorAll('input[type="text"]');
    if (inputs.length >= 2) {
      const key = inputs[0].value;
      const rawValue = inputs[1].value;

      let value;
      try {
        // Attempt to parse back JSON-stringified values (objects, arrays, numbers, booleans)
        value = JSON.parse(rawValue);
      } catch (e) {
        // Fallback to the raw string if it is not valid JSON
        value = rawValue;
      }

      data[key] = value;
    }
  });

  return data;
}

function getItemName(names, prefix = "item") {
  const existingSet = new Set(names);

  if (!existingSet.has(prefix)) {
    return prefix;
  }

  let count = 2;
  while (existingSet.has(`${prefix}_${count}`)) {
    count++;
  }

  return `${prefix}_${count}`;
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
