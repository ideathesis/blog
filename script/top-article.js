document.addEventListener("DOMContentLoaded", () => {
  // Elemen target untuk menampilkan artikel populer
  const popularArticlesList = document.getElementById("popular-articles-list");
  if (!popularArticlesList) {
    console.error("Elemen dengan ID 'popular-articles-list' tidak ditemukan.");
    return;
  }

  // URL manifest data artikel
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let articles = [];

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke Date object
  const parseCustomDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Fungsi menghasilkan identifier unik dari artikel
  const getIdentifier = (article) => {
    return article.file ? article.file.trim() : "";
  };

  // Render artikel populer
  const renderArticles = (articlesToRender) => {
    popularArticlesList.innerHTML = "";
    if (articlesToRender.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5">Tidak ada artikel untuk ditampilkan.</div>`;
      return;
    }

    articlesToRender.forEach((article, index) => {
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6 mb-4 d-flex align-items-stretch";

      const identifier = getIdentifier(article);
      const postLink = `/post/${article.file}`;

      // Fallback image handling
      const imageUrl = article.thumbnail || article.image || '/images/logo_baru.png';

      col.innerHTML = `
        <a href="${postLink}" class="popular-card">
          <div class="popular-card-rank">
            <i class="fas fa-star"></i> #${index + 1}
          </div>
          <div class="popular-card-img-wrapper">
            <img src="${imageUrl}" alt="${article.title}" class="popular-card-img" loading="lazy">
          </div>
          <div class="popular-card-body">
            <div class="popular-card-meta">
              <span><i class="far fa-user"></i> ${article.author || "Admin"}</span>
              <span><i class="far fa-calendar-alt"></i> ${article.date || "-"}</span>
              <span class="disqus-comment-count" data-disqus-identifier="${identifier}" style="display:none;"></span>
            </div>
            <h3 class="popular-card-title">${article.title}</h3>
            <div class="popular-card-footer">
              Baca Artikel <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </a>
      `;

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
    } else if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount({ reset: true });
    }
  }

  // Fungsi polling untuk memastikan span count telah ter-update
  function waitForDisqusCounts(callback) {
    let attempts = 0;
    const maxAttempts = 10; // 5 seconds max

    const checkCounts = () => {
      const allUpdated = articles.every(article => {
        const identifier = getIdentifier(article);
        const span = document.querySelector(`.disqus-comment-count[data-disqus-identifier="${identifier}"]`);
        return span && span.textContent.trim() !== "";
      });

      if (allUpdated || attempts >= maxAttempts) {
        callback();
      } else {
        attempts++;
        setTimeout(checkCounts, 500);
      }
    };
    checkCounts();
  }

  // Fungsi untuk memuat artikel dan render awal
  function loadArticles() {
    fetch(manifestUrl, { mode: "cors" })
      .then(response => {
        if (!response.ok) throw new Error("Gagal memuat manifest");
        return response.json();
      })
      .then(data => {
        articles = data.map(article => ({
          ...article,
          dateObject: parseCustomDate(article.date)
        }));

        // Render awal (default sort by date or simply first 3)
        // Sort by date mostly likely implies popularity/recency hybrid for initial view
        // But let's just show the first 3 from manifest or sorted by date initially
        const sortedByDate = [...articles].sort((a, b) => b.dateObject - a.dateObject);
        renderArticles(sortedByDate.slice(0, 3));

        loadDisqusCountScript();
        waitForDisqusCounts(sortArticlesByCommentCount);
      })
      .catch(error => {
        console.error("Error:", error);
        popularArticlesList.innerHTML = `
          <div class="col-12 text-center py-5">
            <p>Gagal memuat artikel populer.</p>
          </div>
        `;
      });
  }

  // Sort articles based on comment count and re-render
  function sortArticlesByCommentCount() {
    articles.forEach(article => {
      const identifier = getIdentifier(article);
      const span = document.querySelector(`.disqus-comment-count[data-disqus-identifier="${identifier}"]`);
      if (span) {
        const count = parseInt(span.textContent.trim()) || 0;
        article.commentCount = count;
      } else {
        article.commentCount = 0;
      }
    });

    // Sort descending by comment count
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
