document.addEventListener("DOMContentLoaded", () => {
  // Sisipkan style khusus untuk card artikel terpopuler dengan ukuran teks yang disesuaikan
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

  // URL manifest, pastikan URL ini benar dan data JSON sesuai
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let articles = [];

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Ambil data dari manifest.json dan render 3 artikel terpopuler
  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest: " + response.status);
      return response.json();
    })
    .then(data => {
      console.log("Data manifest:", data);
      articles = data
        .map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
          // Jumlah komentar akan diambil dari Disqus
        }))
        // Misalnya, gunakan urutan data dari manifest sebagai artikel terpopuler
        .slice(0, 3);
      console.log("Artikel terpopuler:", articles);
      renderArticles(articles);
      // Setelah rendering, refresh hitungan komentar dari Disqus
      if (window.DISQUSWIDGETS) {
        window.DISQUSWIDGETS.getCount({ reset: true });
      }
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

  // Fungsi untuk merender artikel tanpa gambar
  const renderArticles = (articlesToShow) => {
    popularArticlesList.innerHTML = "";
    if (articlesToShow.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5">Tidak ada artikel untuk ditampilkan.</div>`;
      return;
    }
    articlesToShow.forEach(article => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      // Buat URL postingan secara otomatis dari data artikel
      const postLink = `/post/${article.file || ""}`;

      // Gunakan elemen <a> agar seluruh card clickable
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

      // Meta data: penulis, tanggal, dan jumlah komentar (menggunakan Disqus)
      const meta = document.createElement("div");
      meta.className = "popular-post-card-meta";
      meta.innerHTML = `<strong>Penulis:</strong> ${article.author || "Tidak Diketahui"} | <strong>Tanggal:</strong> ${article.date || "-"} | <strong>Komentar:</strong> <span class="disqus-comment-count" data-disqus-identifier="${postLink}"></span>`;

      contentDiv.appendChild(title);
      contentDiv.appendChild(meta);
      link.appendChild(contentDiv);
      col.appendChild(link);
      popularArticlesList.appendChild(col);
    });
  };

  /* --- Konfigurasi dan load Disqus (opsional) --- */
  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://ideathesis.disqus.com";
  document.head.appendChild(preconnect);

  var disqus_config = function () {
    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get("file") || window.location.pathname;
    this.page.url = window.location.href;
    this.page.identifier = fileParam;
  };

  function loadDisqus() {
    if (window.DISQUS || document.querySelector('script[src*="disqus.com/embed.js"]'))
      return;
    const d = document, s = d.createElement("script");
    s.src = "https://ideathesis.disqus.com/embed.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-timestamp", +new Date());
    (d.head || d.body).appendChild(s);
  }

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

  window.addEventListener("load", () => {
    if (!document.querySelector("#disqus_thread iframe")) {
      loadDisqus();
    }
  });
});