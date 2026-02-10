document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk card artikel populer
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .popular-post-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-decoration: none;
      color: #333;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      padding: 25px;
      border-radius: 15px;
      background-color: #FFFFFF;
      border: 2px solid #e8f5e9;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 20px;
      min-height: 180px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
    .popular-post-card::before {
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
    .popular-post-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      background: linear-gradient(135deg, #198754, #146c43);
      border-color: transparent;
    }
    .popular-post-card:hover::before {
      opacity: 1;
    }
    .card-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    .popular-post-card-title {
      font-size: clamp(18px, 2vw, 20px);
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 10px;
      color: #333;
      word-wrap: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .popular-post-card-meta {
      font-size: clamp(12px, 1.2vw, 14px);
      color: #777;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }
    .popular-post-card-meta span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .popular-post-card-meta i {
      color: #198754;
    }
    .popular-post-card:hover .popular-post-card-title,
    .popular-post-card:hover .popular-post-card-meta,
    .popular-post-card:hover .popular-post-card-meta i {
      color: #FFFFFF;
      transition: color 0.3s ease;
    }
    /* Badge untuk artikel populer */
    .popular-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #ffc107, #ff9800);
      color: #fff;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
      z-index: 2;
    }

    /* Responsive untuk popular-post-card */
    @media (max-width: 992px) {
      .popular-post-card {
        padding: 20px;
        min-height: 160px;
      }
      .popular-post-card-title {
        font-size: 1rem;
      }
      .popular-post-card-meta {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 768px) {
      .popular-post-card {
        padding: 18px;
        min-height: 150px;
        margin-bottom: 15px;
      }
      .popular-post-card-title {
        font-size: 0.95rem;
        -webkit-line-clamp: 3;
      }
      .popular-post-card-meta {
        font-size: 0.8rem;
        gap: 10px;
      }
      .popular-badge {
        top: 10px;
        right: 10px;
        padding: 4px 10px;
        font-size: 0.7rem;
      }
    }

    @media (max-width: 576px) {
      .popular-post-card {
        padding: 15px;
        min-height: 140px;
      }
      .popular-post-card-title {
        font-size: 0.9rem;
      }
      .popular-post-card-meta {
        font-size: 0.75rem;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .popular-post-card {
        padding: 12px;
        min-height: 130px;
      }
      .popular-post-card-title {
        font-size: 0.85rem;
      }
      .popular-post-card-meta {
        font-size: 0.7rem;
        gap: 6px;
      }
      .popular-badge {
        padding: 3px 8px;
        font-size: 0.65rem;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Elemen target untuk menampilkan artikel populer
  const popularArticlesList = document.getElementById("popular-articles-list");
  if (!popularArticlesList) {
    console.error("Elemen dengan ID 'popular-articles-list' tidak ditemukan.");
    return;
  }

  // URL manifest data artikel (pastikan URL dan format JSON sesuai)
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let articles = [];

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Fungsi menghasilkan identifier unik dari artikel, menggunakan properti file
  const getIdentifier = (article) => {
    return article.file ? article.file.trim() : "";
  };

  // Render artikel (maksimal 3 artikel)
  const renderArticles = (articlesToRender) => {
    popularArticlesList.innerHTML = "";
    if (articlesToRender.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5">Tidak ada artikel untuk ditampilkan.</div>`;
      return;
    }
    articlesToRender.forEach((article, index) => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      const identifier = getIdentifier(article);
      // Link ke postingan menggunakan parameter file agar sesuai struktur URL
      const postLink = `/post/${identifier}`;
      const link = document.createElement("a");
      link.href = postLink;
      link.className = "popular-post-card";

      // Badge populer
      const badge = document.createElement("div");
      badge.className = "popular-badge";
      badge.textContent = `#${index + 1} Populer`;

      const contentDiv = document.createElement("div");
      contentDiv.className = "card-content";

      const title = document.createElement("div");
      title.className = "popular-post-card-title";
      title.textContent = article.title || "Judul Tidak Tersedia";

      // Meta info dengan ikon
      const meta = document.createElement("div");
      meta.className = "popular-post-card-meta";
      meta.innerHTML = `<span><i class="fas fa-user"></i> ${article.author || "Tidak Diketahui"}</span>` +
                       `<span><i class="fas fa-calendar"></i> ${article.date || "-"}</span>` +
                       `<span class="disqus-comment-count" data-disqus-identifier="${identifier}" style="display:none;"></span>`;

      contentDiv.appendChild(title);
      contentDiv.appendChild(meta);
      link.appendChild(badge);
      link.appendChild(contentDiv);
      col.appendChild(link);
      popularArticlesList.appendChild(col);
    });
  };

  // Fungsi untuk memuat skrip count Disqus (untuk mengambil data interaksi)
  function loadDisqusCountScript() {
    if (!document.getElementById("dsq-count-scr")) {
      const dsqCountScript = document.createElement("script");
      dsqCountScript.id = "dsq-count-scr";
      dsqCountScript.src = "https://ideathesis.disqus.com/count.js";
      dsqCountScript.async = true;
      dsqCountScript.defer = true;
      dsqCountScript.onload = () => {
        console.log("Skrip count Disqus selesai dimuat.");
      };
      document.body.appendChild(dsqCountScript);
      console.log("Skrip count Disqus dimuat.");
    } else if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount({ reset: true });
      console.log("Reset count Disqus dipanggil.");
    }
  }

  // Fungsi polling untuk memastikan span count telah ter-update oleh Disqus
  function waitForDisqusCounts(callback) {
    const checkCounts = () => {
      // Jika semua artikel sudah memiliki nilai count (meskipun 0), lanjutkan
      const allUpdated = articles.every(article => {
        const identifier = getIdentifier(article);
        const span = document.querySelector(`.disqus-comment-count[data-disqus-identifier="${identifier}"]`);
        // Jika span tidak ditemukan atau isinya kosong, belum siap
        return span && span.textContent.trim() !== "";
      });
      if (allUpdated) {
        callback();
      } else {
        setTimeout(checkCounts, 500);
      }
    };
    checkCounts();
  }

  // Fungsi untuk memuat artikel dari manifest dan render awal
  function loadArticles() {
    fetch(manifestUrl, { mode: "cors" })
      .then(response => {
        if (!response.ok) throw new Error("Gagal memuat manifest: " + response.status);
        return response.json();
      })
      .then(data => {
        console.log("Data manifest:", data);
        articles = data.map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
        }));
        // Render awal menggunakan urutan manifest (sebagai fallback)
        renderArticles(articles.slice(0, 3));
        loadDisqusCountScript();

        // Tunggu sampai semua span count ter-update, lalu urutkan artikel berdasarkan commentCount
        waitForDisqusCounts(sortArticlesByCommentCount);
      })
      .catch(error => {
        console.error("Error:", error);
        popularArticlesList.innerHTML = `
          <div class="col-12 text-center py-5">
            <p class="text-danger">Gagal memuat data artikel. Silakan coba kembali nanti.</p>
            <button onclick="location.reload()">Muat Ulang</button>
          </div>
        `;
      });
  }

  // Fungsi mengambil nilai komentar dari elemen tersembunyi, kemudian mengurutkan artikel
  function sortArticlesByCommentCount() {
    articles.forEach(article => {
      const identifier = getIdentifier(article);
      const span = document.querySelector(`.disqus-comment-count[data-disqus-identifier="${identifier}"]`);
      if (span) {
        // Pastikan mengubah isi span ke angka; jika tidak valid, gunakan 0
        const count = parseInt(span.textContent.trim()) || 0;
        article.commentCount = count;
      } else {
        article.commentCount = 0;
      }
    });
    console.log("Artikel dengan comment count:", articles);
    // Urutkan artikel dari yang paling banyak komentar
    articles.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    renderArticles(articles.slice(0, 3));
  }

  // Konfigurasi Disqus untuk halaman postingan
  var disqus_config = function () {
    const params = new URLSearchParams(window.location.search);
    const identifier = params.get("file") || window.location.pathname.split("/").pop();
    this.page.url = window.location.href;
    this.page.identifier = identifier.trim();
  };

  function loadDisqus() {
    if (window.DISQUS || document.querySelector('script[src*="disqus.com/embed.js"]')) return;
    const d = document, s = d.createElement("script");
    s.src = "https://ideathesis.disqus.com/embed.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-timestamp", +new Date());
    (d.head || d.body).appendChild(s);
  }

  // Lazy load Disqus jika elemen #disqus_thread ada (untuk halaman postingan)
  if (document.getElementById("disqus_thread")) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadDisqus();
            observer.disconnect();
          }
        },
        { rootMargin: "200px", threshold: 0.01 }
      );
      observer.observe(document.getElementById("disqus_thread"));
    } else {
      setTimeout(loadDisqus, 2000);
      window.addEventListener("scroll", () => {
        if (window.scrollY + window.innerHeight > document.getElementById("disqus_thread").offsetTop) {
          loadDisqus();
        }
      }, { once: true });
    }
  }

  window.addEventListener("load", () => {
    if (document.getElementById("disqus_thread") && !document.querySelector("#disqus_thread iframe")) {
      loadDisqus();
    }
  });

  loadArticles();
});
