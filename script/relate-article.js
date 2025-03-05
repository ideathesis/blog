document.addEventListener("DOMContentLoaded", () => {
  // Pastikan metadata tersedia
  if (!window.currentMetadata) {
    console.error("Metadata tidak ditemukan!");
    document.getElementById("post-list").innerHTML = `
      <div class="alert alert-warning">
        Artikel terkait tidak dapat dimuat karena metadata tidak tersedia.
      </div>
    `;
    return;
  }

  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(allArticles => {
      // Filter artikel terkait
      const relatedArticles = allArticles.filter(article => {
        // Skip artikel yang sama
        if (article.title === window.currentMetadata.title) return false;

        // Prioritaskan artikel dengan tag yang sama
        if (window.currentMetadata.tags && article.tags) {
          const hasCommonTags = window.currentMetadata.tags.some(tag => 
            article.tags.includes(tag)
          );
          if (hasCommonTags) return true;
        }

        // Jika tidak ada tag, cari kesamaan judul
        const currentTitle = window.currentMetadata.title.toLowerCase();
        const articleTitle = article.title.toLowerCase();
        return currentTitle.split(/\s+/).some(word => 
          articleTitle.includes(word)
        );
      });

      // Tampilkan artikel terkait
      const postList = document.getElementById("post-list");
      if (relatedArticles.length === 0) {
        postList.innerHTML = `
          <div class="alert alert-info">
            Tidak ada artikel terkait yang ditemukan.
          </div>
        `;
        return;
      }

      // Render daftar artikel
      postList.innerHTML = relatedArticles
        .map(article => `
          <a href="/post/${article.file}" class="col-md-12 col-lg-6 related-post">
            <img src="${article.image}" alt="${article.title}" class="img-fluid">
            <div class="related-post-content">
              <h3 class="related-post-title">${article.title}</h3>
              <p class="related-post-meta">Oleh: ${article.author} | ${article.date}</p>
            </div>
          </a>
        `)
        .join('');
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
      document.getElementById("post-list").innerHTML = `
        <div class="alert alert-danger">
          Terjadi kesalahan saat memuat artikel terkait. Coba refresh halaman.
        </div>
      `;
    });
});