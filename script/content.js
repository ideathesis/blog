document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style gabungan untuk tampilan daftar artikel dan pencarian
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    /* --- Styling Daftar Artikel (Card View) --- */
    .post-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .post-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }
    .post-card img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      aspect-ratio: 16 / 9;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    .post-card .card-body {
      padding: 15px;
    }
    .post-card .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 10px;
      line-height: 1.4;
      color: #333;
    }
    .post-card .card-text {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 15px;
    }
    .post-card .card-footer {
      background: none;
      border-top: 1px solid #ddd;
      padding: 10px;
      font-size: 0.8rem;
      color: #999;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .post-card .read-more-button {
      text-decoration: none;
      color: white;
      background-color: #81C784;
      padding: 8px 16px;
      border-radius: 5px;
      font-weight: 600;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }
    .post-card .read-more-button:hover {
      background-color: #64B5F6;
      transform: scale(1.05);
    }

    /* --- Styling Pencarian --- */
    .search-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px auto;
      padding: 20px;
      max-width: 800px;
      width: 100%;
    }
    .search-input-container {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
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
    /* Styling hasil pencarian */
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

  // Elemen untuk daftar artikel (card view)
  const postList = document.getElementById("post-list");
  // Elemen untuk hasil pencarian
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

  // Fungsi untuk konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  };

  // Ambil data dari manifest.json
  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error('Gagal memuat manifest');
      return response.json();
    })
    .then(data => {
      articles = data.map(article => ({
        ...article,
        dateObject: parseCustomDate(article.date)
      })).sort((a, b) => b.dateObject - a.dateObject);

      // Tampilkan daftar artikel secara default (card view)
      renderListing(articles);
    })
    .catch(error => {
      console.error("Error:", error);
      postList.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-danger">Gagal memuat data artikel. Silakan coba kembali nanti.</p>
          <button onclick="location.reload()">Muat Ulang</button>
        </div>
      `;
    });

  // Fungsi untuk merender daftar artikel (card view)
  const renderListing = (articlesArray) => {
    postList.innerHTML = "";
    articlesArray.forEach(article => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      const card = document.createElement("div");
      card.className = "post-card";

      const img = document.createElement("img");
      img.src = article.thumbnail || article.image;
      img.alt = article.title;

      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h2");
      title.className = "card-title";
      title.textContent = article.title;

      const author = document.createElement("p");
      author.className = "card-text";
      author.innerHTML = `<strong>Penulis:</strong> ${article.author}`;

      const date = document.createElement("p");
      date.className = "card-text";
      date.innerHTML = `<strong>Tanggal:</strong> ${article.date}`;

      const footer = document.createElement("div");
      footer.className = "card-footer";
      const readMore = document.createElement("a");
      // Karena properti file sudah berupa query string (misal: "?file=example.md")
      // dan Anda menggunakan index.html, tautan diarahkan ke: /post/index.html?file=example.md
      readMore.href = `/post/index.html${article.file}`;
      readMore.className = "read-more-button";
      readMore.textContent = "Baca Selengkapnya";

      footer.appendChild(readMore);
      body.appendChild(title);
      body.appendChild(author);
      body.appendChild(date);
      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(footer);
      col.appendChild(card);
      postList.appendChild(col);
    });
  };

  // Fungsi pencarian (menampilkan hasil pada container result-list)
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
        const fields = [
          article.title.toLowerCase(),
          article.author.toLowerCase(),
          article.date.toLowerCase()
        ];
        return fields.some(field => field.includes(query));
      });

      currentPage = 1;
      renderSearchResults(filteredArticles);
      updatePagination(filteredArticles);
      loadingIndicator.style.display = "none";
    }, 500);
  };

  // Render hasil pencarian (list item sederhana)
  const renderSearchResults = (articlesArray) => {
    resultList.innerHTML = "";
    if (articlesArray.length === 0) {
      resultList.innerHTML = "<li class='no-results'>Tidak ada artikel yang cocok.</li>";
      return;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedArticles = articlesArray.slice(startIndex, startIndex + articlesPerPage);

    paginatedArticles.forEach(article => {
      const listItem = document.createElement("li");
      listItem.className = "result-item";
      listItem.innerHTML = `
        <a href="/post/index.html${article.file}" class="result-link">
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

  // Update tampilan pagination untuk pencarian
  const updatePagination = (articlesArray) => {
    const totalPages = Math.ceil(articlesArray.length / articlesPerPage);
    paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    prevPageButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderSearchResults(articlesArray);
        updatePagination(articlesArray);
      }
    };

    nextPageButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderSearchResults(articlesArray);
        updatePagination(articlesArray);
      }
    };
  };

  // Event listeners untuk pencarian
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch();
  });
});
