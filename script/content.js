document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk tampilan kartu artikel dan paginasi
  const styleEl = document.createElement("style");
  styleEl.textContent = `
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
    /* Styling untuk kontainer paginasi */
    .pagination-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    .pagination-controls button {
      padding: 10px 15px;
      font-size: 1rem;
      background-color: #81C784;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }
    .pagination-controls button:hover:not(:disabled) {
      background-color: #64B5F6;
      transform: scale(1.05);
    }
    .pagination-controls button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleEl);

  const postList = document.getElementById("post-list");
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let articles = [];
  let currentPage = 0;
  const articlesPerPage = 6;
  let totalPages = 0;
  let paginationControls;

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Ambil data dari manifest.json dan render artikel
  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(data => {
      articles = data
        .map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
        }))
        .sort((a, b) => b.dateObject - a.dateObject);

      totalPages = Math.ceil(articles.length / articlesPerPage);
      renderArticles(currentPage);
      if (totalPages > 1) {
        createPaginationControls();
      }
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

  // Fungsi untuk merender artikel sesuai halaman
  const renderArticles = (page) => {
    const start = page * articlesPerPage;
    const end = start + articlesPerPage;
    const articlesToShow = articles.slice(start, end);

    postList.innerHTML = "";
    articlesToShow.forEach(article => {
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
      // Tautan diarahkan ke index.html dengan query string dari properti file
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

  // Fungsi untuk membuat kontrol paginasi
  const createPaginationControls = () => {
    paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";
    
    const prevButton = document.createElement("button");
    prevButton.textContent = "Sebelumnya";
    prevButton.disabled = currentPage === 0;
    prevButton.onclick = () => {
      if (currentPage > 0) {
        currentPage--;
        renderArticles(currentPage);
        updatePaginationButtons();
      }
    };

    const nextButton = document.createElement("button");
    nextButton.textContent = "Selanjutnya";
    nextButton.disabled = currentPage >= totalPages - 1;
    nextButton.onclick = () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        renderArticles(currentPage);
        updatePaginationButtons();
      }
    };

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
    // Sisipkan kontrol paginasi setelah container artikel
    postList.parentNode.appendChild(paginationControls);
  };

  // Fungsi untuk memperbarui status tombol paginasi
  const updatePaginationButtons = () => {
    if (paginationControls) {
      const [prevButton, nextButton] = paginationControls.children;
      prevButton.disabled = currentPage === 0;
      nextButton.disabled = currentPage >= totalPages - 1;
    }
  };
});
