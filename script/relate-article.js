document.addEventListener("DOMContentLoaded", () => {
  // Ambil metadata artikel saat ini
  const currentMetadataScript = document.getElementById("metadata");
  const currentMetadata = JSON.parse(currentMetadataScript.textContent);

  // Isi elemen HTML dengan data dari metadata
  document.getElementById("article-title").textContent = currentMetadata.title;
  document.getElementById("article-meta").textContent = `Oleh : ${currentMetadata.author} | ${currentMetadata.date}`;
  document.getElementById("featured-image").src = currentMetadata.image;
  document.getElementById("featured-image").alt = currentMetadata.title;

  // Ambil data dari manifest.json
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  
  fetch(manifestUrl)
    .then(response => response.json())
    .then(allArticles => {
      // Filter artikel terkait berdasarkan kata-kata di judul
      const relatedArticles = allArticles.filter(article => {
        const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/);
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        const hasMatchingWords = currentTitleWords.some(word => articleTitleWords.includes(word));
        return hasMatchingWords && article.title !== currentMetadata.title;
      });

      // Hitung skor relevansi berdasarkan jumlah kata yang cocok
      relatedArticles.forEach(article => {
        const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/);
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        article.relevanceScore = currentTitleWords.filter(word => articleTitleWords.includes(word)).length;
      });

      // Urutkan artikel terkait berdasarkan skor relevansi dan batasi jumlah tampil
      const sortedArticles = relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const limitedArticles = sortedArticles.slice(0, 5);

      // Render artikel terkait
      const postList = document.getElementById("post-list");
      postList.innerHTML = "";

      limitedArticles.forEach(article => {
        const postLink = document.createElement("a");
        // Karena properti file sudah berupa query string (misal: "?file=example.md")
        // dan kita menggunakan index.html, tautan diarahkan ke: /post/?file=example.md
        postLink.href = `/post/${article.file}`;
        postLink.className = "col-md-12 col-lg-6 related-post";
        postLink.innerHTML = `
          <img src="${article.image}" alt="${article.title}" class="img-fluid">
          <div class="related-post-content">
            <h3 class="related-post-title">${article.title}</h3>
            <p class="related-post-meta">Penulis : ${article.author} | ${article.date}</p>
          </div>
        `;
        postList.appendChild(postLink);
      });
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
      document.getElementById("post-list").innerHTML = `
        <div class="alert alert-warning">
          Gagal memuat artikel terkait. Silakan refresh halaman.
        </div>
      `;
    });
});
