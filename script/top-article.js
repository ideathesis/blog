document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk card artikel terpopuler
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    /* Card dengan tinggi minimum 150px */
    .popular-post-card {
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
      position: relative;
      margin-bottom: 15px;
      min-height: 150px;
      overflow: hidden;
    }
    .popular-post-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #00C853, #00BFA5);
      border-color: transparent;
    }
    /* Container isi card */
    .popular-post-card .card-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    /* Judul artikel dengan ukuran font yang disesuaikan */
    .popular-post-card .popular-post-card-title {
      font-size: clamp(18px, 2vw, 20px);
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 5px;
      color: #333;
      word-wrap: break-word;
    }
    /* Meta data dengan ukuran font lebih kecil agar muat 1 baris */
    .popular-post-card .popular-post-card-meta {
      font-size: clamp(12px, 1.2vw, 14px);
      color: #777;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Saat hover, ubah warna teks agar lebih kontras */
    .popular-post-card:hover .popular-post-card-title,
    .popular-post-card:hover .popular-post-card-meta {
      color: #FFFFFF;
      transition: color 0.3s ease;
    }
  `;
  document.head.appendChild(styleEl);

  // Pastikan elemen target ada
  const popularArticlesList = document.getElementById("popular-articles-list");
  if (!popularArticlesList) {
    console.error("Elemen dengan ID 'popular-articles-list' tidak ditemukan.");
    return;
  }

  // URL manifest; pastikan URL ini benar dan data JSON sesuai
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let articles = [];

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Render artikel berdasarkan array artikel yang diberikan (hanya 3 artikel)
  const renderArticles = (articlesToRender) => {
    popularArticlesList.innerHTML = "";
    if (articlesToRender.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5">Tidak ada artikel untuk ditampilkan.</div>`;
      return;
    }
    articlesToRender.forEach(article => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      // Buat URL postingan; pastikan identifier sama seperti di halaman postingan
      const postLink = `/post/${article.file || ""}`;

      // Elemen <a> agar seluruh card clickable
      const link = document.createElement("a");
      link.href = postLink;
      link.className = "popular-post-card";

      // Container isi card
      const contentDiv = document.createElement("div");
      contentDiv.className = "card-content";

      // Judul artikel
      const title = document.createElement("div");
      title.className = "popular-post-card-title";
      title.textContent = article.title || "Judul Tidak Tersedia";

      // Meta data: penulis, tanggal, dan jumlah komentar
      // Jika article.commentCount sudah ada, tampilkan nilainya; jika belum, gunakan elemen count Disqus
      const commentDisplay = typeof article.commentCount === "number" ? article.commentCount : `<span class="disqus-comment-count" data-disqus-identifier="${postLink}"></span>`;
      const meta = document.createElement("div");
      meta.className = "popular-post-card-meta";
      meta.innerHTML = `<strong>Penulis:</strong> ${article.author || "Tidak Diketahui"} | <strong>Tanggal:</strong> ${article.date || "-"} | <strong>Komentar:</strong> ${commentDisplay}`;

      contentDiv.appendChild(title);
      contentDiv.appendChild(meta);
      link.appendChild(contentDiv);
      col.appendChild(link);
      popularArticlesList.appendChild(col);
    });
  };

  // Fungsi untuk memuat skrip count Disqus
  function loadDisqusCountScript() {
    if (!document.getElementById("dsq-count-scr")) {
      const dsqCountScript = document.createElement("script");
      dsqCountScript.id = "dsq-count-scr";
      dsqCountScript.src = "https://ideathesis.disqus.com/count.js";
      dsqCountScript.async = true;
      dsqCountScript.defer = true;
      document.body.appendChild(dsqCountScript);
      console.log("Skrip count Disqus dimuat.");
    } else if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount({ reset: true });
      console.log("Reset count Disqus dipanggil.");
    }
  }

  // Fungsi untuk memuat data artikel dan render awal
  function loadArticles() {
    fetch(manifestUrl, { mode: "cors" })
      .then(response => {
        if (!response.ok) throw new Error("Gagal memuat manifest: " + response.status);
        return response.json();
      })
      .then(data => {
        console.log("Data manifest:", data);
        // Mapping data dan menambahkan properti tanggal (dateObject)
        articles = data.map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
        }));
        // Render awal (sementara) dengan 3 artikel sesuai urutan di manifest
        renderArticles(articles.slice(0, 3));
        // Muat skrip count Disqus untuk memperbarui nilai
        loadDisqusCountScript();
        // Setelah beberapa detik, ambil jumlah komentar, sortir artikel, dan render 3 teratas
        setTimeout(sortArticlesByCommentCount, 4000);
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

  // Fungsi untuk mengambil nilai komentar dari DOM, memperbarui array articles, dan mengurutkan ulang
  function sortArticlesByCommentCount() {
    // Untuk setiap artikel, cari elemen dengan data-disqus-identifier yang sesuai
    articles.forEach(article => {
      const postLink = `/post/${article.file || ""}`;
      const span = document.querySelector(`.disqus-comment-count[data-disqus-identifier="${postLink}"]`);
      if (span) {
        // Ambil nilai dari teks; jika tidak bisa parse, gunakan 0
        const count = parseInt(span.textContent.trim()) || 0;
        article.commentCount = count;
      } else {
        article.commentCount = 0;
      }
    });
    console.log("Artikel dengan comment count:", articles);
    // Sort artikel berdasarkan commentCount secara menurun
    articles.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    // Render ulang hanya 3 artikel teratas
    renderArticles(articles.slice(0, 3));
  }

  /* --- Konfigurasi dan load Disqus untuk halaman postingan (jika ada) --- */
  // Preconnect ke Disqus
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://ideathesis.disqus.com";
  document.head.appendChild(preconnect);

  // Konfigurasi Disqus untuk halaman postingan
  var disqus_config = function () {
    const params = new URLSearchParams(window.location.search);
    // Pastikan identifier yang digunakan konsisten
    const fileParam = params.get("file") || window.location.pathname;
    this.page.url = window.location.href;
    this.page.identifier = fileParam;
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

  // Lazy load Disqus jika elemen #disqus_thread ada di halaman
  if (document.getElementById("disqus_thread")) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadDisqus();
            observer.disconnect();
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.01,
        }
      );
      observer.observe(document.getElementById("disqus_thread"));
    } else {
      setTimeout(loadDisqus, 2000);
      window.addEventListener(
        "scroll",
        () => {
          if (
            window.scrollY + window.innerHeight >
            document.getElementById("disqus_thread").offsetTop
          ) {
            loadDisqus();
          }
        },
        { once: true }
      );
    }
  }

  // Pastikan Disqus juga ter-load saat window load
  window.addEventListener("load", () => {
    if (!document.querySelector("#disqus_thread iframe")) {
      loadDisqus();
    }
  });

  // Mulai proses load artikel
  loadArticles();
});
