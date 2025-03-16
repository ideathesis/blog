document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk card artikel populer dan top artikel
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .popular-post-card, .top-popular-post-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-decoration: none;
      color: #333;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease;
      padding: 10px;
      border-radius: 8px;
      background-color: #FFFFFF;
      border: 1px solid #E0E0E0;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 15px;
      min-height: 150px;
      overflow: hidden;
    }
    .popular-post-card:hover, .top-popular-post-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #00C853, #00BFA5);
      border-color: transparent;
    }
    /* Style khusus untuk top artikel agar terlihat berbeda */
    .top-popular-post-card {
      border: 2px solid #00C853;
    }
    .card-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .popular-post-card-title, .top-popular-post-card-title {
      font-size: clamp(18px, 2vw, 20px);
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 5px;
      color: #333;
      word-wrap: break-word;
    }
    .popular-post-card-meta, .top-popular-post-card-meta {
      font-size: clamp(12px, 1.2vw, 14px);
      color: #777;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popular-post-card:hover .popular-post-card-title,
    .popular-post-card:hover .popular-post-card-meta,
    .top-popular-post-card:hover .top-popular-post-card-title,
    .top-popular-post-card:hover .top-popular-post-card-meta {
      color: #FFFFFF;
      transition: color 0.3s ease;
    }
  `;
  document.head.appendChild(styleEl);

  // Pastikan elemen target tersedia, jika tidak, buat container baru dan sisipkan ke body
  let popularArticlesList = document.getElementById("popular-articles-list");
  if (!popularArticlesList) {
    popularArticlesList = document.createElement("div");
    popularArticlesList.id = "popular-articles-list";
    popularArticlesList.className = "row";
    document.body.appendChild(popularArticlesList);
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

  // Fungsi untuk merender artikel dengan memisahkan top artikel dari artikel lain
  const renderArticles = (articlesToRender) => {
    popularArticlesList.innerHTML = "";
    if (articlesToRender.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5">Tidak ada artikel untuk ditampilkan.</div>`;
      return;
    }

    // Artikel pertama dianggap top artikel
    const topArticle = articlesToRender[0];
    const restArticles = articlesToRender.slice(1);

    // Render top artikel
    const topCol = document.createElement("div");
    topCol.className = "col-12 mb-3"; // Full-width untuk top artikel
    const topIdentifier = getIdentifier(topArticle);
    const topLink = document.createElement("a");
    topLink.href = `/post/${topIdentifier}`;
    topLink.className = "top-popular-post-card";

    const topContent = document.createElement("div");
    topContent.className = "card-content";

    const topTitle = document.createElement("div");
    topTitle.className = "top-popular-post-card-title";
    topTitle.textContent = topArticle.title || "Judul Tidak Tersedia";

    const topMeta = document.createElement("div");
    topMeta.className = "top-popular-post-card-meta";
    topMeta.innerHTML = `<strong>Penulis:</strong> ${topArticle.author || "Tidak Diketahui"} | <strong>Tanggal:</strong> ${topArticle.date || "-"}` +
                        `<span class="disqus-comment-count" data-disqus-identifier="${topIdentifier}" style="display:none;"></span>`;

    topContent.appendChild(topTitle);
    topContent.appendChild(topMeta);
    topLink.appendChild(topContent);
    topCol.appendChild(topLink);
    popularArticlesList.appendChild(topCol);

    // Render artikel lainnya (maksimal 2 artikel agar total 3)
    restArticles.slice(0, 2).forEach(article => {
      const col = document.createElement("div");
      col.className = "col-md-6"; // Dua kolom di bawah top artikel
      const identifier = getIdentifier(article);
      const postLink = `/post/${identifier}`;
      const link = document.createElement("a");
      link.href = postLink;
      link.className = "popular-post-card";

      const contentDiv = document.createElement("div");
      contentDiv.className = "card-content";

      const title = document.createElement("div");
      title.className = "popular-post-card-title";
      title.textContent = article.title || "Judul Tidak Tersedia";

      const meta = document.createElement("div");
      meta.className = "popular-post-card-meta";
      meta.innerHTML = `<strong>Penulis:</strong> ${article.author || "Tidak Diketahui"} | <strong>Tanggal:</strong> ${article.date || "-"}` +
                       `<span class="disqus-comment-count" data-disqus-identifier="${identifier}" style="display:none;"></span>`;

      contentDiv.appendChild(title);
      contentDiv.appendChild(meta);
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
        // Render awal 3 artikel dari urutan manifest
        renderArticles(articles.slice(0, 3));
        loadDisqusCountScript();
        // Delay selama 7 detik agar Disqus sempat memperbarui count untuk sorting
        setTimeout(sortArticlesByCommentCount, 7000);
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
        // Jika nilai komentar kosong, gunakan 0
        const count = parseInt(span.textContent.trim()) || 0;
        article.commentCount = count;
      } else {
        article.commentCount = 0;
      }
    });
    console.log("Artikel dengan comment count:", articles);
    // Urutkan artikel berdasarkan commentCount (descending)
    articles.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    // Render ulang dengan top artikel di atas
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
