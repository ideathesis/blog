document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style langsung ke dalam head
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    /* Container Utama untuk Pencarian (terpusat) */
    .search-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        padding: 20px;
        max-width: 800px;
        width: 100%;
    }

    /* Kolom Pencarian */
    .search-input-container {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        gap: 8px;
    }

    #search-input {
        flex: 1;
        padding: 14px 16px;
        font-size: 1rem;
        font-family: 'Poppins', sans-serif;
        border: 2px solid #ddd;
        border-radius: 5px;
        outline: none;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        background-color: white;
    }
    #search-input:focus {
        border-color: black;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    #search-button {
        padding: 14px 20px;
        font-size: 1rem;
        font-family: 'Poppins', sans-serif;
        background-color: #81C784;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.3s ease;
    }
    #search-button:hover {
        background-color: #64B5F6;
        transform: scale(1.05);
    }

    /* Loading Indicator */
    .loading-indicator {
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: #666;
        margin-top: 20px;
    }
    .loading-indicator.show {
        display: flex;
    }
    .loading-indicator::before {
        content: '';
        width: 16px;
        height: 16px;
        margin-right: 10px;
        border: 3px solid #81C784;
        border-top: 3px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Daftar Hasil dan Item */
    #result-list {
        list-style: none;
        padding: 0;
        margin: 20px 0 0;
        width: 100%;
    }
    .result-item {
        background-color: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
    }
    .result-item:hover {
        transform: translateY(-10px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
    }
    .result-link {
        text-decoration: none;
        color: #81C784;
        font-weight: bold;
        transition: color 0.3s ease;
    }
    .result-link:hover {
        color: #64B5F6;
    }
    .result-title {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: #333;
        font-weight: bold;
    }
    .result-meta {
        font-size: 0.9rem;
        color: #666;
    }

    /* Pagination */
    #pagination-container {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
        width: 100%;
    }
    #pagination-container button {
        padding: 10px 15px;
        font-size: 1rem;
        font-family: 'Poppins', sans-serif;
        background-color: #81C784;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.3s ease;
    }
    #pagination-container button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    #pagination-container button:hover:not(:disabled) {
        background-color: #64B5F6;
        transform: scale(1.05);
    }

    /* Media Queries untuk Responsivitas */
    @media (max-width: 768px) {
        .search-input-container {
            flex-direction: column;
        }
        #search-input, #search-button {
            width: 100%;
            box-sizing: border-box;
        }
        #search-button {
            margin-top: 10px;
        }
    }
  `;
  document.head.appendChild(styleEl);

  // Pastikan container pencarian sudah terpusat
  const searchContainer = document.querySelector(".search-container");

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

  // Fungsi pencarian
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

  // Render hasil pencarian (tanpa gambar)
  const renderResults = (articlesToRender) => {
    resultList.innerHTML = "";
    
    if (articlesToRender.length === 0) {
      resultList.innerHTML = "<li class='no-results'>Tidak ada artikel yang cocok.</li>";
      return;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedArticles = articlesToRender.slice(startIndex, startIndex + articlesPerPage);

    paginatedArticles.forEach(article => {
      const listItem = document.createElement("li");
      listItem.className = "result-item";
      
      listItem.innerHTML = `
        <a href="/post/${article.file}" class="result-link">
          <div class="result-content">
            <h2 class="result-title">${article.title}</h2>
            <div class="result-meta">
              <span class="author">Oleh: ${article.author}</span>
              <time datetime="${article.dateObject.toISOString()}">| ${article.date}</time>
            </div>
          </div>
        </a>
      `;
      
      resultList.appendChild(listItem);
    });
  };

  // Update tampilan pagination
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

  // Event listeners
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
});
