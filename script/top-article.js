document.addEventListener("DOMContentLoaded", () => {
  // Target element for popular articles
  const popularArticlesList = document.getElementById("popular-articles-list");
  if (!popularArticlesList) {
    return;
  }

  // Articles manifest URL
  // Use relative path for consistency with other scripts
  const manifestUrl = "post/manifest.json";

  // Date parser
  const parseCustomDate = (dateString) => {
    if (!dateString) return new Date(0);
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };

  // Render articles function
  const renderArticles = (articles) => {
    popularArticlesList.innerHTML = "";

    if (articles.length === 0) {
      popularArticlesList.innerHTML = `<div class="col-12 text-center py-5 text-muted">Belum ada artikel populer saat ini.</div>`;
      return;
    }

    articles.forEach((article, index) => {
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6 mb-4 d-flex align-items-stretch";

      // Fix formatting for image path
      let imgPath = article.thumbnail || article.image || "";
      imgPath = imgPath.replace(/^(\/)?post\//, "");

      let imageUrl = imgPath ? `post/${imgPath}` : 'images/logo_baru.png';

      // Sanitasi path link artikel
      let postFile = article.file ? article.file.trim() : "";
      postFile = postFile.replace(/^(\/)?post\//, "");

      const postLink = `post/${postFile}`;

      col.innerHTML = `
        <a href="${postLink}" class="popular-card w-100 text-decoration-none border-0">
          <div class="popular-card-rank">
            <i class="fas fa-star text-warning"></i> #${index + 1}
          </div>
          <div class="popular-card-img-wrapper" style="height: 200px; overflow: hidden; border-radius: 12px 12px 0 0;">
            <img src="${imageUrl}" alt="${article.title}" class="popular-card-img w-100 h-100 object-fit-cover" loading="lazy" onerror="this.src='images/logo_baru.png'">
          </div>
          <div class="popular-card-body p-4 bg-white border border-top-0 rounded-bottom shadow-sm h-100 d-flex flex-column">
            <div class="popular-card-meta mb-2 text-muted small">
              <span class="me-3"><i class="far fa-user me-1"></i> ${article.author || "Admin"}</span>
              <span><i class="far fa-calendar-alt me-1"></i> ${article.date || "-"}</span>
            </div>
            <h5 class="popular-card-title fw-bold text-dark mb-3" style="font-size: 1.1rem; line-height: 1.4;">${article.title}</h5>
            <div class="popular-card-footer mt-auto pt-2 border-top">
              <span class="text-success fw-bold small text-uppercase" style="letter-spacing: 0.5px; font-size: 0.75rem;">
                Baca Artikel <i class="fas fa-arrow-right ms-1"></i>
              </span>
            </div>
          </div>
        </a>
      `;

      popularArticlesList.appendChild(col);

      // Animate entry
      col.style.opacity = "0";
      col.style.transform = "translateY(20px)";
      col.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      setTimeout(() => {
        col.style.opacity = "1";
        col.style.transform = "translateY(0)";
      }, index * 100);
    });
  };

  // Main fetch logic
  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat data artikel");
      return response.json();
    })
    .then(data => {
      // Process dates
      const processedArticles = data.map(article => ({
        ...article,
        dateObject: parseCustomDate(article.date)
      }));

      // Sort Priority (Smart Static Sorting):
      // 1. 'views' count (High to Low) - Manual simulation of "Most Visited"
      // 2. 'popular' flag (true) - Editor's Choice
      // 3. Date (Newest) - Fallback
      const sortedArticles = processedArticles.sort((a, b) => {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;

        // Priority 1: Views
        if (viewsA !== viewsB) {
          return viewsB - viewsA;
        }

        // Priority 2: Popular flag
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;

        // Priority 3: Date
        return b.dateObject - a.dateObject;
      });

      // Take top 3
      const topArticles = sortedArticles.slice(0, 3);

      renderArticles(topArticles);
    })
    .catch(error => {
      console.error("Error loading popular articles:", error);
      popularArticlesList.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          <i class="fas fa-exclamation-circle mb-2"></i><br>
          Gagal memuat artikel populer.
        </div>
      `;
    });
});
