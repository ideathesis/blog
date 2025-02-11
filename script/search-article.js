document.addEventListener("DOMContentLoaded", () => {
  const resultList = document.getElementById("result-list");
  const paginationContainer = document.getElementById("pagination-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const loadingIndicator = document.querySelector(".loading-indicator");
  const repoUrl = "https://api.github.com/repos/ideathesis/blog/contents/post";
  let articles = [];
  let filteredArticles = [];
  let currentPage = 1;
  const articlesPerPage = 10;

  fetch(repoUrl)
    .then(response => response.json())
    .then(files => {
      const promises = files
        .filter(file => file.name.endsWith(".html"))
        .map(file =>
          fetch(file.download_url)
            .then(response => response.text())
            .then(htmlContent => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, "text/html");
              const metadataScript = doc.querySelector("script[type='application/json']");
              if (metadataScript) {
                const metadata = JSON.parse(metadataScript.textContent);
                metadata.file = file.name;
                return metadata;
              }
              return null;
            })
            .catch(error => {
              console.error(`Error loading file ${file.name}:`, error);
              return null;
            })
        );
      Promise.all(promises).then(results => {
        articles = results.filter(article => article !== null);
        articles.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        // Hapus bagian ini
        // resultList.innerHTML = "<li class='no-results'>Masukkan kata kunci untuk melihat hasil.</li>";
      });
    })
    .catch(error => console.error("Error loading posts:", error));

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      alert("Masukkan kata kunci untuk mencari!");
      return;
    }
    // Tampilkan indikator loading
    loadingIndicator.style.display = "flex";
    // Simulasikan proses pencarian dengan delay
    setTimeout(() => {
      filteredArticles = articles.filter(article => {
        return (
          article.title.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.date.toLowerCase().includes(query)
        );
      });
      currentPage = 1;
      renderArticles(filteredArticles);
      if (filteredArticles.length === 0) {
        resultList.innerHTML = "<li class='no-results'>Tidak ada artikel yang ditemukan.</li>";
        paginationContainer.style.display = "none";
      } else {
        updatePaginationButtons(filteredArticles);
      }
      // Sembunyikan indikator loading
      loadingIndicator.style.display = "none";
    }, 500); // Delay 500ms untuk simulasi loading
  }

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  function renderArticles(articlesToRender) {
    const start = (currentPage - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const paginatedArticles = articlesToRender.slice(start, end);
    resultList.innerHTML = "";
    paginatedArticles.forEach(article => {
      const li = document.createElement("li");
      li.className = "result-item";
      const a = document.createElement("a");
      a.href = `/post/${article.file}`;
      a.className = "result-link";
      const title = document.createElement("h2");
      title.className = "result-title";
      title.textContent = article.title;
      const meta = document.createElement("p");
      meta.className = "result-meta";
      meta.innerHTML = `
        <strong>Penulis:</strong> ${article.author} &nbsp;&nbsp;
        <strong>Tanggal:</strong> ${article.date}
      `;
      a.appendChild(title);
      a.appendChild(meta);
      li.appendChild(a);
      resultList.appendChild(li);
    });
  }

  function updatePaginationButtons(articlesToRender) {
    const totalPages = Math.ceil(articlesToRender.length / articlesPerPage);
    if (totalPages > 1) {
      paginationContainer.style.display = "flex";
    } else {
      paginationContainer.style.display = "none";
    }
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    prevPageButton.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderArticles(articlesToRender);
        updatePaginationButtons(articlesToRender);
      }
    };
    nextPageButton.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderArticles(articlesToRender);
        updatePaginationButtons(articlesToRender);
      }
    };
  }
});