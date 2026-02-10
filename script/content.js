document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk tampilan kartu artikel dan paginasi
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .post-card {
      background: #fff;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      margin-bottom: 30px;
    }
    .post-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #198754, #146c43);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .post-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }
    .post-card:hover::before {
      opacity: 1;
    }
    .post-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .post-card:hover img {
      transform: scale(1.05);
    }
    .post-card .card-body {
      padding: 25px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .post-card .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 15px;
      line-height: 1.4;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .post-card .meta-info {
      font-size: 0.85rem;
      color: #777;
      margin-bottom: 15px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }
    .post-card .meta-info span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .post-card .meta-info i {
      color: #198754;
    }
    .post-card .card-footer {
      background: none;
      border: none;
      padding: 0;
      margin-top: auto;
    }
    .post-card .read-more-button {
      display: inline-block;
      padding: 12px 25px;
      background: linear-gradient(135deg, #198754, #146c43);
      color: #fff;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(25, 135, 84, 0.2);
      text-align: center;
    }
    .post-card .read-more-button:hover {
      background: linear-gradient(45deg, #146c43, #198754);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(25, 135, 84, 0.3);
      color: #fff;
    }
    /* Styling untuk kontainer paginasi */
    .pagination-controls {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 40px;
      flex-wrap: wrap;
    }
    .pagination-controls button {
      padding: 10px 18px;
      font-size: 0.9rem;
      background: #fff;
      color: #198754;
      border: 2px solid #198754;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      min-width: 45px;
    }
    .pagination-controls button:hover:not(:disabled) {
      background: linear-gradient(135deg, #198754, #146c43);
      color: #fff;
      border-color: transparent;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(25, 135, 84, 0.2);
    }
    .pagination-controls button:disabled {
      background: #e0e0e0;
      color: #999;
      border-color: #e0e0e0;
      cursor: not-allowed;
    }
    .pagination-controls button.active {
      background: linear-gradient(135deg, #198754, #146c43);
      color: #fff;
      border-color: transparent;
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

      // Gabungkan informasi penulis dan tanggal ke dalam 1 baris dengan ikon
      const metaInfo = document.createElement("div");
      metaInfo.className = "meta-info";
      const authorSpan = document.createElement("span");
      authorSpan.innerHTML = `<i class="fas fa-user"></i> ${article.author}`;
      const dateSpan = document.createElement("span");
      dateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${article.date}`;
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
        pageButton.classList.add("active");
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
