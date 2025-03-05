document.addEventListener("DOMContentLoaded", () => {
  // Ambil metadata dari elemen dengan id "metadata"
  const metadataScript = document.getElementById("metadata");
  if (!metadataScript) {
    console.error("Metadata tidak ditemukan. Pastikan elemen <script id='metadata'> sudah disisipkan.");
    return;
  }

  let currentMetadata;
  try {
    currentMetadata = JSON.parse(metadataScript.textContent);
  } catch (e) {
    console.error("Gagal mengurai metadata:", e);
    return;
  }

  // (Opsional) Update elemen tampilan jika diperlukan
  const titleEl = document.getElementById("article-title");
  const metaEl = document.getElementById("article-meta");
  const featuredImageEl = document.getElementById("featured-image");
  if (titleEl) titleEl.textContent = currentMetadata.title;
  if (metaEl) metaEl.textContent = `Oleh: ${currentMetadata.author} | ${currentMetadata.date}`;
  if (featuredImageEl) {
    featuredImageEl.src = currentMetadata.image;
    featuredImageEl.alt = currentMetadata.title;
  }

  // URL manifest.json – sesuaikan jika perlu
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

  // Fungsi konversi tanggal dari format DD-MM-YYYY ke objek Date
  const parseDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  fetch(manifestUrl, { mode: "cors" })
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(manifest => {
      if (!Array.isArray(manifest)) throw new Error("Manifest JSON tidak berbentuk array");

      // Tambahkan properti dateObject ke tiap artikel (jika diperlukan)
      manifest = manifest.map(article => ({
        ...article,
        dateObject: parseDate(article.date),
      }));

      // Pecah judul artikel saat ini menjadi array kata (huruf kecil)
      const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/).filter(Boolean);

      // Filter artikel terkait:
      // - Lewati artikel dengan judul yang sama persis (artikel saat ini)
      // - Pilih artikel yang memiliki setidaknya satu kata yang sama pada judul
      let relatedArticles = manifest.filter(article => {
        if (article.title.trim().toLowerCase() === currentMetadata.title.trim().toLowerCase())
          return false;
        const articleTitleWords = article.title.toLowerCase().split(/\s+/).filter(Boolean);
        return currentTitleWords.some(word => articleTitleWords.includes(word));
      });

      // Hitung skor relevansi berdasarkan jumlah kata yang sama
      relatedArticles = relatedArticles.map(article => {
        const articleTitleWords = article.title.toLowerCase().split(/\s+/).filter(Boolean);
        const relevanceScore = currentTitleWords.filter(word => articleTitleWords.includes(word)).length;
        return { ...article, relevanceScore };
      });

      // Urutkan artikel terkait berdasarkan skor relevansi tertinggi
      relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Hapus artikel dengan skor 0 (tidak ada kata yang sama)
      relatedArticles = relatedArticles.filter(article => article.relevanceScore > 0);

      // Batasi hasil maksimal 5 artikel
      const limitedArticles = relatedArticles.slice(0, 5);

      // Render artikel terkait ke dalam container sidebar (id "post-list")
      const container = document.getElementById("post-list");
      if (!container) {
        console.error("Container #post-list tidak ditemukan.");
        return;
      }
      container.innerHTML = "";

      if (limitedArticles.length === 0) {
        container.innerHTML = "<p>Tidak ada artikel terkait yang ditemukan.</p>";
      } else {
        limitedArticles.forEach(article => {
          const link = document.createElement("a");
          // Properti file pada manifest sudah berupa query string (misal: "?file=example.md")
          // Karena file MD ditampilkan melalui URL /post/?file=..., tautan dibentuk sebagai:
          let href = "/post/";
          if (article.file.startsWith("?")) {
            href += article.file;
          } else {
            href += "?file=" + article.file;
          }
          link.href = href;
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
