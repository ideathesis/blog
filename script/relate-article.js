document.addEventListener("DOMContentLoaded", () => {
  // Ambil metadata artikel dari elemen dengan id "metadata"
  const metadataScript = document.getElementById("metadata");
  if (!metadataScript) {
    console.error("Metadata tidak ditemukan.");
    return;
  }
  
  let currentMetadata;
  try {
    currentMetadata = JSON.parse(metadataScript.textContent);
  } catch (error) {
    console.error("Gagal mengurai metadata:", error);
    return;
  }
  
  // Perbarui elemen halaman (jika ada) dengan data metadata
  const titleEl = document.getElementById("article-title");
  const metaEl = document.getElementById("article-meta");
  const featuredImageEl = document.getElementById("featured-image");
  if (titleEl) titleEl.textContent = currentMetadata.title;
  if (metaEl) metaEl.textContent = `Oleh: ${currentMetadata.author} | ${currentMetadata.date}`;
  if (featuredImageEl) {
    featuredImageEl.src = currentMetadata.image;
    featuredImageEl.alt = currentMetadata.title;
  }
  
  // URL manifest.json
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  
  // Fungsi konversi tanggal (format DD-MM-YYYY ke Date object)
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  };
  
  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(articles => {
      // Tambahkan properti dateObject ke tiap artikel
      articles = articles.map(article => ({
        ...article,
        dateObject: parseDate(article.date)
      }));
      
      // Pecah judul artikel saat ini menjadi kata-kata (huruf kecil)
      const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/);
      
      // Filter artikel terkait:
      // - Artikel yang memiliki setidaknya satu kata yang sama pada judul
      // - Tidak menampilkan artikel yang judulnya sama persis dengan artikel saat ini
      const relatedArticles = articles.filter(article => {
        if (article.title === currentMetadata.title) return false;
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        return currentTitleWords.some(word => articleTitleWords.includes(word));
      });
      
      // Hitung skor relevansi berdasarkan jumlah kata yang cocok
      relatedArticles.forEach(article => {
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        article.relevanceScore = currentTitleWords.filter(word => articleTitleWords.includes(word)).length;
      });
      
      // Urutkan artikel berdasarkan skor relevansi (tertinggi di atas)
      const sortedArticles = relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const limitedArticles = sortedArticles.slice(0, 5);
      
      // Render artikel terkait ke container (misalnya, id "post-list")
      const container = document.getElementById("post-list");
      if (!container) {
        console.error("Container artikel terkait tidak ditemukan.");
        return;
      }
      container.innerHTML = "";
      
      if (limitedArticles.length === 0) {
        container.innerHTML = "<p>Tidak ada artikel terkait.</p>";
      } else {
        limitedArticles.forEach(article => {
          const link = document.createElement("a");
          // Karena properti file sudah berupa query string (misal: "?file=example.md")
          // tautan diarahkan ke /post/index.html dengan query string tersebut
          link.href = `/post/index.html${article.file}`;
          link.className = "col-md-12 col-lg-6 related-post";
          link.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="img-fluid">
            <div class="related-post-content">
              <h3 class="related-post-title">${article.title}</h3>
              <p class="related-post-meta">Oleh: ${article.author} | ${article.date}</p>
            </div>
          `;
          container.appendChild(link);
        });
      }
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
      const container = document.getElementById("post-list");
      if (container) {
        container.innerHTML = `<div class="alert alert-warning">
          Gagal memuat artikel terkait. Silakan refresh halaman.
        </div>`;
      }
    });
});
