document.addEventListener("DOMContentLoaded", () => {
  const resultList = document.getElementById("result-list");
  const paginationContainer = document.getElementById("pagination-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const loadingIndicator = document.querySelector(".loading-indicator");
  
  // Ganti dengan URL manifest.json
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  
  let articles = [];
  let filteredArticles = [];
  let currentPage = 1;
  const articlesPerPage = 10;

  // Ambil data dari manifest.json
  fetch(manifestUrl)
    .then(response => response.json())
    .then(articlesData => {
      articles = articlesData.sort((a, b) => {
        // Konversi format tanggal DD-MM-YYYY ke Date object
        const [dA, mA, yA] = a.date.split("-");
        const [dB, mB, yB] = b.date.split("-");
        return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
      }).reverse();
    })
    .catch(error => console.error("Error loading posts:", error));

  // Fungsi-fungsi berikut TETAP SAMA
  function performSearch() { /* ... */ }
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (event) => { /* ... */ });
  function renderArticles(articlesToRender) { /* ... */ }
  function updatePaginationButtons(articlesToRender) { /* ... */ }
});