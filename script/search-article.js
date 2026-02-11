document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style untuk loading indicator dan hasil pencarian
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    /* Container Reset */
    .results-container {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin-top: 10px !important;
    }
    .results-header {
        border-bottom: 1px solid #dadce0 !important;
        padding-bottom: 1rem !important;
        margin-bottom: 1.5rem !important;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .results-title {
        font-size: 1.5rem !important;
        font-weight: 500 !important;
        color: #202124 !important;
        font-family: 'Poppins', sans-serif !important;
    }
    .back-to-main {
        background: transparent !important;
        border: none !important;
        color: #198754 !important;
        font-weight: 500 !important;
        font-size: 0.9rem !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
    }
    .back-to-main:hover {
        background: #f1f3f4 !important;
    }

    /* Result List - Google SERP Style with Left Image */
    #result-list {
        list-style: none;
        padding: 0;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
        max-width: 700px; /* Slightly wider for image + text */
    }

    /* Item Container */
    .result-item {
        background: #fff;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid transparent;
        display: flex; /* Flex row */
        flex-direction: row;
        gap: 20px;
        align-items: flex-start; /* Align top */
        animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
        transform: translateY(20px);
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .result-item:hover {
        border-color: rgba(25, 135, 84, 0.2);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    /* Left Image Container */
    .result-image-left {
        flex-shrink: 0;
        width: 120px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
        background: #f8f9fa;
    }
    .result-thumbnail-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    .result-item:hover .result-thumbnail-img {
        transform: scale(1.05);
    }

    /* Right Content Container */
    .result-content-right {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    @keyframes fadeIn {
        to { opacity: 1; transform: translateY(0); }
    }



    /* Title Link */
    .result-title-link {
        text-decoration: none;
        display: block;
        margin-bottom: 6px;
    }
    .result-item-title {
        font-family: 'Poppins', sans-serif;
        color: #198754;
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 0;
    }
    .result-title-link:hover .result-item-title {
        text-decoration: underline;
    }

    /* Snippet Block */
    .result-snippet-block {
        font-size: 0.875rem;
        line-height: 1.6;
        color: #4d5156;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .result-date-prefix {
        color: #70757a;
        font-size: 0.8rem;
        margin-right: 6px;
    }

    /* Pagination */
    #pagination-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-top: 40px;
        padding-top: 20px;
        width: 100%;
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
        border-top: 1px solid #eaeaea;
    }
    .pagination-btn {
        padding: 8px 20px;
        height: auto;
        border-radius: 50px;
        border: 2px solid #198754;
        background: transparent;
        color: #198754;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Poppins', sans-serif;
    }
    .pagination-btn:hover:not(:disabled) {
        background: #198754;
        color: white;
        box-shadow: 0 4px 10px rgba(25, 135, 84, 0.2);
        transform: translateY(-2px);
    }
    .pagination-btn:disabled {
        border-color: #d1e7dd;
        color: #a3cfbb;
        cursor: not-allowed;
        background: transparent;
    }
    .page-info {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        color: #6c757d;
        margin: 0 15px;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .result-item {
            gap: 16px;
            padding: 14px;
        }
        .result-image-left {
            width: 100px;
            height: 100px;
        }
        .result-item-title {
            font-size: 1.1rem;
        }
    }
    
    @media (max-width: 480px) {
        .result-item {
            flex-direction: column; /* Stack on mobile */
            gap: 12px;
        }
        .result-image-left {
            width: 100%;
            height: 180px; /* Bigger image on mobile */
        }

        .result-snippet-block {
            -webkit-line-clamp: 4;
        }
        
        /* Mobile Pagination Fix */
        #pagination-container {
            flex-direction: row;
            flex-wrap: nowrap;
            gap: 5px;
            justify-content: space-between;
            width: 100%;
        }
        .pagination-btn {
            padding: 8px 12px;
            font-size: 0.8rem;
            flex: 0 0 auto;
        }
        .page-info {
            font-size: 0.8rem;
            margin: 0 5px;
            white-space: nowrap;
        }
    }
  `;
  document.head.appendChild(styleEl);

  const resultList = document.getElementById("result-list");
  const paginationContainer = document.getElementById("pagination-container");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("search-input");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const currentPageSpan = document.getElementById("current-page");
  const loadingIndicator = document.querySelector(".loading-indicator");
  const searchResultsSection = document.getElementById("search-results-section");
  const mainContentSection = document.getElementById("main-content-section");
  // Use relative path for manifest
  const manifestUrl = "post/manifest.json";

  // Fungsi untuk kembali ke konten utama
  window.showMainContent = function () {
    searchResultsSection.style.display = "none";
    mainContentSection.style.display = "block";
    searchInput.value = "";
  };

  // Sembunyikan results section secara default
  searchResultsSection.style.display = "none";

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
      showAlert("Silakan masukkan kata kunci pencarian terlebih dahulu.");
      searchInput.focus();
      return;
    }

    // Tampilkan section hasil pencarian dan sembunyikan konten utama
    searchResultsSection.style.display = "block";
    mainContentSection.style.display = "none";
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
    }, 800);
  };

  // Render hasil pencarian (tanpa gambar)
  const renderResults = (articlesToRender) => {
    resultList.innerHTML = "";

    if (articlesToRender.length === 0) {
      resultList.innerHTML = `
        <li class='no-results' style="
          text-align: center; 
          padding: 3rem; 
          color: #666; 
          font-size: 1.1rem;
          grid-column: 1 / -1;
        ">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ddd;"></i>
          <br>Tidak ada artikel yang cocok dengan pencarian Anda.
        </li>
      `;
      return;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedArticles = articlesToRender.slice(startIndex, startIndex + articlesPerPage);

    paginatedArticles.forEach((article, index) => {
      const listItem = document.createElement("li");
      listItem.className = "result-item";

      // Tambahkan delay animasi
      listItem.style.animationDelay = `${index * 0.05}s`;

      const excerpt = article.title.length > 100 ? article.title.substring(0, 100) + "..." : article.title;

      // Thumbnail image dari manifest
      // Fix paths: if absolute path from root (/post/...), convert to relative if needed or keep as is.
      // Assuming simpler structure, we strip leading slash to make it relative to current page (blog/)
      let thumbnailImage = article.thumbnail || article.image;
      if (thumbnailImage && thumbnailImage.startsWith('/post/')) {
        thumbnailImage = thumbnailImage.substring(1); // 'post/images/...'
      }

      // HTML Structure mimicking Google SERP with Image

      listItem.innerHTML = `
          ${thumbnailImage ? `
          <!-- Left Image -->
          <div class="result-image-left">
             <img src="${thumbnailImage}" alt="${article.title}" class="result-thumbnail-img" onerror="this.src='/images/logo_baru.png'">
          </div>
          ` : ''}

          <!-- Right Content -->
          <div class="result-content-right">
              <!-- Title -->
              <a href="/post/${article.file}" class="result-title-link">
                <h3 class="result-item-title">${article.title}</h3>
              </a>

              <!-- Snippet -->
              <div class="result-snippet-block">
                 ${excerpt}
                 <div style="margin-top: 4px; color: #5f6368; font-size: 0.8rem;">Oleh ${article.author} &bull; ${article.date}</div>
              </div>
          </div>
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
    currentPageSpan.textContent = currentPage;

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
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    performSearch();
  });

  // Handle empty search input
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
      // Jika input dikosongkan, tampilkan kembali konten utama
      searchResultsSection.style.display = "none";
      mainContentSection.style.display = "block";
    }
  });

  // Handle tag clicks
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.textContent;
      performSearch();
    });
  });

  // Alert Helper Functions (consistent with labs perpustakaan)
  function showAlert(message) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const alertModal = new bootstrap.Modal(document.getElementById('alertModal') || createAlertModal());
      document.getElementById('alertMessage').textContent = message;
      alertModal.show();
    } else {
      alert(message);
    }
  }

  function createAlertModal() {
    const modalHTML = `
      <div class="modal fade" id="alertModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="fas fa-exclamation-triangle me-2"></i>Peringatan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p id="alertMessage" class="mb-0"></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                <i class="fas fa-check me-1"></i>Mengerti
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return document.getElementById('alertModal');
  }
});
