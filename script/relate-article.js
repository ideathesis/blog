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

  if (!currentMetadata.title) {
    console.error("Judul metadata kosong.");
    return;
  }

  // Fungsi untuk menormalkan judul: mengubah ke huruf kecil, hapus tanda baca, dan pecah ke array kata
  const normalizeTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Hapus tanda baca
      .split(/\s+/)
      .filter(Boolean);
  };

  const currentTitleWords = normalizeTitle(currentMetadata.title);

  // URL manifest.json – pastikan URL ini dapat diakses
  const manifestUrl =
    "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

  // Fungsi konversi tanggal (DD-MM-YYYY ke Date)
  const parseDate = (dateStr) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  fetch(manifestUrl, { mode: "cors" })
    .then((response) => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then((manifest) => {
      if (!Array.isArray(manifest))
        throw new Error("Manifest JSON tidak berbentuk array");

      // Tambahkan properti dateObject dan normalizedTitle ke tiap artikel
      manifest = manifest.map((article) => ({
        ...article,
        dateObject: parseDate(article.date),
        normalizedTitle: normalizeTitle(article.title),
      }));

      // Filter artikel terkait:
      // - Lewati artikel dengan judul yang sama persis dengan artikel saat ini.
      // - Pilih artikel yang memiliki setidaknya satu kata sama dengan judul artikel saat ini.
      let relatedArticles = manifest.filter((article) => {
        if (
          article.title.trim().toLowerCase() ===
          currentMetadata.title.trim().toLowerCase()
        )
          return false;
        return currentTitleWords.some((word) =>
          article.normalizedTitle.includes(word)
        );
      });

      // Hitung skor relevansi berdasarkan jumlah kata yang sama
      relatedArticles = relatedArticles.map((article) => {
        const relevanceScore = currentTitleWords.filter((word) =>
          article.normalizedTitle.includes(word)
        ).length;
        return { ...article, relevanceScore };
      });

      // Urutkan artikel terkait berdasarkan relevansi tertinggi
      relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Hapus artikel dengan skor 0 (tidak ada kecocokan)
      relatedArticles = relatedArticles.filter(
        (article) => article.relevanceScore > 0
      );

      // Batasi hasil maksimal 5 artikel
      const limitedArticles = relatedArticles.slice(0, 5);

      // Render artikel terkait ke container (misalnya, elemen dengan id "post-list")
      const container = document.getElementById("post-list");
      if (!container) {
        console.error("Container #post-list tidak ditemukan.");
        return;
      }
      container.innerHTML = "";

      if (limitedArticles.length === 0) {
        container.innerHTML =
          "<p>Tidak ada artikel terkait yang ditemukan.</p>";
      } else {
        limitedArticles.forEach((article) => {
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
    .catch((error) => {
      console.error("Gagal memuat artikel terkait:", error);
      const container = document.getElementById("post-list");
      if (container) {
        container.innerHTML = `<div class="alert alert-warning">
          Gagal memuat artikel terkait. Silakan refresh halaman.
        </div>`;
      }
    });
});
