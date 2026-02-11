document.addEventListener("DOMContentLoaded", () => {
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
  fetch(manifestUrl, {
    mode: "cors"
  })
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
          <div class="alert alert-warning border-0 shadow-sm" style="border-radius: 15px;">
             <h4 class="alert-heading fw-bold mb-3"><i class="fas fa-exclamation-triangle me-2"></i>Gagal Memuat Artikel</h4>
             <p class="mb-0">Mohon maaf, terjadi kesalahan saat mengambil data artikel. Silakan coba muat ulang halaman.</p>
             <button onclick="location.reload()" class="btn btn-success mt-3 rounded-pill px-4">Muat Ulang</button>
          </div>
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
      col.className = "col-lg-4 col-md-6 mb-4 d-flex align-items-stretch";

      const imgPath = (article.thumbnail || article.image || "").replace(/^(\/)?post\//, "");
      const imageUrl = imgPath ? `post/${imgPath}` : '/images/logo_baru.png';

      col.innerHTML = `
        <article class="blog-card h-100 border-0 shadow-sm" style="border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
           <a href="post/${article.file}" class="blog-card-img-link" aria-label="${article.title}">
             <div class="blog-card-img-wrapper">
               <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='/images/logo_baru.png'">
             </div>
           </a>
           <div class="blog-card-body d-flex flex-column h-100 bg-white">
             <div class="blog-card-meta mb-2">
                <span class="meta-item text-muted small"><i class="far fa-calendar-alt text-success me-1"></i> ${article.date}</span>
                <span class="meta-item text-muted small"><i class="far fa-user text-success me-1"></i> ${article.author}</span>
             </div>
             <h3 class="blog-card-title fw-bold text-dark mb-3" style="font-size: 1.1rem; line-height: 1.5; letter-spacing: -0.02em;">
               <a href="post/${article.file}" class="text-decoration-none text-dark stretched-link">${article.title}</a>
             </h3>
             <div class="mt-auto pt-2 border-top">
                <span class="text-success fw-bold small text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">
                   Baca Artikel <i class="fas fa-arrow-right ms-1"></i>
                </span>
             </div>
           </div>
        </article>
      `;
      postList.appendChild(col);
    });
  };

  // Fungsi untuk membuat kontrol paginasi dengan maksimal 5 nomor halaman per grup
  const createPaginationControls = () => {
    paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls w-100 d-flex justify-content-center align-items-center";
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
      prevGroupButton.innerHTML = "<i class='fas fa-angle-double-left'></i>";
      prevGroupButton.addEventListener("click", () => {
        currentPage = startPage - 1;
        renderArticles(currentPage);
        renderPaginationControls();
        document.getElementById('main-content-section').scrollIntoView({
          behavior: 'smooth'
        });
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
        document.getElementById('main-content-section').scrollIntoView({
          behavior: 'smooth'
        });
      });
      paginationControls.appendChild(pageButton);
    }

    // Jika masih ada grup berikutnya, tampilkan tombol "Selanjutnya" untuk navigasi grup
    if (endPage < totalPages) {
      const nextGroupButton = document.createElement("button");
      nextGroupButton.className = "nav-button";
      nextGroupButton.innerHTML = "<i class='fas fa-angle-double-right'></i>";
      nextGroupButton.addEventListener("click", () => {
        currentPage = endPage;
        renderArticles(currentPage);
        renderPaginationControls();
        document.getElementById('main-content-section').scrollIntoView({
          behavior: 'smooth'
        });
      });
      paginationControls.appendChild(nextGroupButton);
    }
  };
});
