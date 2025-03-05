document.addEventListener("DOMContentLoaded", () => {
  // Ambil metadata dari variabel global
  const currentMetadata = window.currentMetadata;
  if (!currentMetadata) {
    console.error("Metadata artikel tidak ditemukan!");
    return;
  }

  // Konfigurasi URL manifest
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

  // Ambil data artikel dari manifest
  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat daftar artikel");
      return response.json();
    })
    .then(allArticles => {
      // Filter artikel terkait berdasarkan tag atau kata kunci
      const relatedArticles = allArticles
        .filter(article => {
          // Skip artikel yang sama
          if (article.title === currentMetadata.title) return false;

          // Cari kesamaan tag (jika ada)
          if (currentMetadata.tags && article.tags) {
            const commonTags = currentMetadata.tags.filter(tag => 
              article.tags.includes(tag)
            );
            if (commonTags.length > 0) return true;
          }

          // Jika tidak ada tag, gunakan kesamaan judul
          const currentTitle = currentMetadata.title.toLowerCase();
          const articleTitle = article.title.toLowerCase();
          return currentTitle.split(/\s+/).some(word => 
            articleTitle.includes(word)
          );
        })
        .slice(0, 5); // Batasi 5 artikel

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
        <div class="alert alert-warning">
          Gagal memuat artikel terkait. Coba refresh halaman.
        </div>
      `;
    });
});