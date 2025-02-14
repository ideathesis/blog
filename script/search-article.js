document.addEventListener("DOMContentLoaded", () => {
  const resultList = document.getElementById("result-list");
  const paginationContainer = document.getElementById("pagination-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const loadingIndicator = document.querySelector(".loading-indicator");
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  
  let articles = [];
  let filteredArticles = [];
  let currentPage = 1;
  const articlesPerPage = 5;

  // Fungsi konversi tanggal DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  };

  // Ambil data dari manifest.json
  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) throw new Error('Gagal memuat manifest');
      return response.json();
    })
    .then(articlesData => {
      articles = articlesData
        .map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
        }))
        .sort((a, b) => b.dateObject - a.dateObject);
      
      // [DIHAPUS] Tidak ada pesan inisial
    })
    .catch(error => {
      console.error("Error:", error);
      resultList.innerHTML = `
        <li class='no-results error'>
          Gagal memuat data artikel. Silakan coba kembali nanti.
          <button onclick="location.reload()">Muat Ulang</button>
        </li>
      `;
    });

  // Fungsi pencarian - TETAP SAMA
  const performSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
      alert("Masukkan kata kunci pencarian!");
      searchInput.focus();
      return;
    }

    loadingIndicator.style.display = "flex";
    
    setTimeout(() => {
      filteredArticles = articles.filter(article => {
        const searchFields = [
          article.title.toLowerCase(),
          article.author.toLowerCase(),
          article.date.toLowerCase()
        ];
        return searchFields.some(field => field.includes(query));
      });

      currentPage = 1;
      renderResults(filteredArticles);
      updatePagination(filteredArticles);
      
      loadingIndicator.style.display = "none";
    }, 500);
  };

  // Render hasil pencarian - TETAP SAMA
  const renderResults = (articlesToRender) => {
    resultList.innerHTML = "";
    
    if (articlesToRender.length === 0) {
      resultList.innerHTML = "<li class='no-results'>Tidak ada artikel yang cocok.</li>";
      return;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedArticles = articlesToRender.slice(
      startIndex, 
      startIndex + articlesPerPage
    );

    paginatedArticles.forEach(article => {
      const listItem = document.createElement("li");
      listItem.className = "result-item";
      
      listItem.innerHTML = `
        <a href="/post/${article.file}" class="result-link">
          <div class="result-thumbnail">
            <img src="${article.thumbnail || article.image}" 
                 alt="${article.title}" 
                 loading="lazy">
          </div>
          <div class="result-content">
            <h2 class="result-title">${article.title}</h2>
            <div class="result-meta">
              <span class="author">${article.author}</span>
              <time datetime="${article.dateObject.toISOString()}">
                ${article.date}
              </time>
            </div>
          </div>
        </a>
      `;
      
      resultList.appendChild(listItem);
    });
  };

  // Update tampilan pagination - TETAP SAMA
  const updatePagination = (articlesToRender) => {
    const totalPages = Math.ceil(articlesToRender.length / articlesPerPage);
    
    paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    prevPageButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderResults(articlesToRender);
        updatePagination(articlesToRender);
      }
    };

    nextPageButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderResults(articlesToRender);
        updatePagination(articlesToRender);
      }
    };
  };

  // Event listeners - TETAP SAMA
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
});