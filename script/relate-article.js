document.addEventListener("DOMContentLoaded", () => {
  // Ambil metadata artikel saat ini dari elemen script
  const metadataScript = document.getElementById("metadata");
  if (!metadataScript) {
    console.error("Element metadata tidak ditemukan.");
    return;
  }
  
  let currentMetadata;
  try {
    currentMetadata = JSON.parse(metadataScript.textContent);
  } catch (error) {
    console.error("Gagal parse metadata:", error);
    return;
  }
  
  // Tampilkan data artikel saat ini (jika diperlukan)
  const titleEl = document.getElementById("article-title");
  const metaEl = document.getElementById("article-meta");
  const featuredImageEl = document.getElementById("featured-image");
  
  if (titleEl) titleEl.textContent = currentMetadata.title;
  if (metaEl) {
    metaEl.textContent = `Oleh: ${currentMetadata.author} | ${currentMetadata.date}`;
  }
  if (featuredImageEl) {
    featuredImageEl.src = currentMetadata.image;
    featuredImageEl.alt = currentMetadata.title;
  }
  
  // URL manifest.json (pastikan URL ini sesuai)
  const manifestUrl =
    "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  
  // Fungsi untuk mengkonversi tanggal dari format DD-MM-YYYY ke Date object
  function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  }
  
  // Ambil data dari manifest dan filter artikel terkait
  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(articles => {
      // Tambahkan properti dateObject ke setiap artikel
      articles = articles.map(article => ({
        ...article,
        dateObject: parseDate(article.date)
      }));
      
      // Pisahkan kata-kata dari judul artikel saat ini untuk referensi
      const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/);
      
      // Filter artikel terkait: pilih artikel yang memiliki setidaknya satu kata yang sama,
      // dan jangan tampilkan artikel yang judulnya sama persis (artikel yang sedang dibuka)
      const relatedArticles = articles.filter(article => {
        if (article.title === currentMetadata.title) return false;
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        return currentTitleWords.some(word => articleTitleWords.includes(word));
      });
      
      // Hitung skor relevansi berdasarkan jumlah kata yang sama antara judul
      relatedArticles.forEach(article => {
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        article.relevanceScore = currentTitleWords.filter(word =>
          articleTitleWords.includes(word)
        ).length;
      });
      
      // Urutkan artikel berdasarkan relevansi (skor tertinggi di atas)
      relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Batasi hasil ke maksimal 5 artikel terkait
      const limitedArticles = relatedArticles.slice(0, 5);
      
      // Render artikel terkait ke dalam container
      const container = document.getElementById("post-list");
      if (!container) {
        console.error("Container artikel terkait (post-list) tidak ditemukan.");
        return;
      }
      container.innerHTML = "";
      
      if (limitedArticles.length === 0) {
        container.innerHTML = "<p>Tidak ada artikel terkait yang ditemukan.</p>";
      } else {
        limitedArticles.forEach(article => {
          const postLink = document.createElement("a");
          // Karena properti file sudah berupa query string (misal: "?file=example.md")
          // Tautan diarahkan ke /post/index.html dengan query string tersebut
          postLink.href = `/post/index.html${article.file}`;
          postLink.className = "col-md-12 col-lg-6 related-post";
          postLink.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="img-fluid">
            <div class="related-post-content">
              <h3 class="related-post-title">${article.title}</h3>
              <p class="related-post-meta">Oleh: ${article.author} | ${article.date}</p>
            </div>
          `;
          container.appendChild(postLink);
        });
      }
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
      const container = document.getElementById("post-list");
      if (container) {
        container.innerHTML = `
          <div class="alert alert-warning">
            Gagal memuat artikel terkait. Silakan refresh halaman.
          </div>
        `;
      }
    });
});
