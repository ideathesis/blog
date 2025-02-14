document.addEventListener("DOMContentLoaded", () => {
  // Element references
  const resultList = document.getElementById("result-list");
  const paginationContainer = document.getElementById("pagination-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const loadingIndicator = document.querySelector(".loading-indicator");
  
  // Konfigurasi
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  const articlesPerPage = 5;
  let currentPage = 1;
  let articles = [];
  let filteredArticles = [];

  // Fungsi konversi tanggal
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  };

  // Load data dari manifest
  const loadArticles = async () => {
    try {
      loadingIndicator.style.display = "flex";
      
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const rawData = await response.json();
      articles = rawData
        .map(article => ({
          ...article,
          dateObj: parseDate(article.date)
        }))
        .sort((a, b) => b.dateObj - a.dateObj);

    } catch (error) {
      console.error("Gagal memuat artikel:", error);
      resultList.innerHTML = `
        <li class="error-message">
          <p>⚠️ Gagal memuat daftar artikel. Silakan coba beberapa saat lagi.</p>
          <button onclick="window.location.reload()">Coba Lagi</button>
        </li>
      `;
    } finally {
      loadingIndicator.style.display = "none";
    }
  };

  // Fungsi pencarian
  const searchArticles = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    filteredArticles = articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      article.date.toLowerCase().includes(query)
    );

    currentPage = 1;
    renderResults();
    updatePagination();
  };

  // Render hasil
  const renderResults = () => {
    resultList.innerHTML = "";
    
    if (filteredArticles.length === 0) {
      resultList.innerHTML = `
        <li class="no-results">
          <p>Tidak ditemukan artikel yang sesuai dengan pencarian</p>
        </li>
      `;
      return;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginated = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

    paginated.forEach(article => {
      const li = document.createElement("li");
      li.className = "result-item";
      li.innerHTML = `
        <a href="/post/${article.file}" class="result-card">
          <div class="card-image">
            <img src="${article.thumbnail}" 
                 alt="${article.title}" 
                 loading="lazy">
          </div>
          <div class="card-body">
            <h3 class="card-title">${article.title}</h3>
            <div class="card-meta">
              <span class="author">${article.author}</span>
              <time>${article.date}</time>
            </div>
          </div>
        </a>
      `;
      resultList.appendChild(li);
    });
  };

  // Update pagination
  const updatePagination = () => {
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    
    paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    prevPageButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderResults();
        updatePagination();
      }
    };

    nextPageButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderResults();
        updatePagination();
      }
    };
  };

  // Event handlers
  searchButton.addEventListener("click", searchArticles);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchArticles();
  });

  // Inisialisasi
  loadArticles();
});