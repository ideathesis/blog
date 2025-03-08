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
    /* Gabungkan penulis dan tanggal dalam 1 baris */
    .post-card .meta-info {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .post-card .meta-info span {
      display: inline-block;
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
    /* Button Read More */
    .post-card .read-more-button {
      text-decoration: none;
      color: #fff;
      background: linear-gradient(45deg, #00C853, #00BFA5);
      border: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-size: 1em;
      font-weight: 600;
      text-align: center;
      display: inline-block;
      cursor: pointer;
      transition: background 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .post-card .read-more-button:hover {
      background: linear-gradient(45deg, #00BFA5, #00C853);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    /* Styling untuk kontainer paginasi */
    .pagination-controls {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    /* Ukuran tombol nomor halaman lebih kecil */
    .pagination-controls button {
      padding: 8px 15px;
      font-size: 0.85em;
      background: linear-gradient(45deg, #00C853, #00BFA5);
      color: #fff;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: background 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 40px;
    }
    .pagination-controls button:hover:not(:disabled) {
      background: linear-gradient(45deg, #00BFA5, #00C853);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    .pagination-controls button:disabled {
      background: #757575;
      cursor: default;
      opacity: 0.8;
    }
    /* Styling khusus untuk ikon navigasi grup */
    .pagination-controls .nav-button {
      font-size: 1.2em;
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

      // Gabungkan informasi penulis dan tanggal ke dalam 1 baris
      const metaInfo = document.createElement("div");
      metaInfo.className = "meta-info";
      const authorSpan = document.createElement("span");
      authorSpan.innerHTML = `<strong>Penulis:</strong> ${article.author}`;
      const dateSpan = document.createElement("span");
      dateSpan.innerHTML = `<strong>Tanggal:</strong> ${article.date}`;
      metaInfo.appendChild(authorSpan);
      metaInfo.appendChild(dateSpan);

      const footer = document.createElement("div");
      footer.className = "card-footer";
      const readMore = document.createElement("a");
      readMore.href = `/post/${article.file}`;
      readMore.className = "read-more-button";
      readMore.textContent = "Baca Selengkapnya";

      footer.appendChild(readMore);
      body.appendChild(title);
      body.appendChild(metaInfo);
      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(footer);
      col.appendChild(card);
      postList.appendChild(col);
    });
  };

  // Fungsi untuk membuat kontrol paginasi dengan maksimal 5 nomor halaman per grup
  const createPaginationControls = () => {
    paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";
    postList.parentNode.appendChild(paginationControls);
    renderPaginationControls();
  };

  // Fungsi untuk merender ulang kontrol paginasi sesuai grup halaman saat ini
  const renderPaginationControls = () => {
    // Hapus seluruh isi kontrol paginasi
    paginationControls.innerHTML = "";

    const pagesPerGroup = 5;
    // Tentukan grup halaman berdasarkan currentPage
    const currentGroup = Math.floor(currentPage / pagesPerGroup);
    const startPage = currentGroup * pagesPerGroup;
    const endPage = Math.min(startPage + pagesPerGroup, totalPages);

    // Jika ada grup sebelumnya, tampilkan tombol "Sebelumnya" untuk navigasi grup
    if (startPage > 0) {
      const prevGroupButton = document.createElement("button");
      prevGroupButton.className = "nav-button";
      prevGroupButton.innerHTML = "&laquo;";
      prevGroupButton.addEventListener("click", () => {
        currentPage = startPage - 1;
        renderArticles(currentPage);
        renderPaginationControls();
      });
      paginationControls.appendChild(prevGroupButton);
    }

    // Tampilkan nomor halaman untuk grup saat ini
    for (let i = startPage; i < endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = (i + 1).toString();
      if (i === currentPage) {
        pageButton.disabled = true;
      }
      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderArticles(currentPage);
        renderPaginationControls();
      });
      paginationControls.appendChild(pageButton);
    }

    // Jika masih ada grup berikutnya, tampilkan tombol "Selanjutnya" untuk navigasi grup
    if (endPage < totalPages) {
      const nextGroupButton = document.createElement("button");
      nextGroupButton.className = "nav-button";
      nextGroupButton.innerHTML = "&raquo;";
      nextGroupButton.addEventListener("click", () => {
        currentPage = endPage;
        renderArticles(currentPage);
        renderPaginationControls();
      });
      paginationControls.appendChild(nextGroupButton);
    }
  };
});
