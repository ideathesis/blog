document.addEventListener("DOMContentLoaded", () => {
  // Menyisipkan style modern dan mobile friendly melalui JavaScript
  const style = document.createElement("style");
  style.textContent = `
    body {
      background: #f9f9f9;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    #post-list {
      display: grid;
      gap: 20px;
      padding: 20px;
    }
    .post-card {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .post-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .post-card img {
      width: 100%;
      display: block;
      object-fit: cover;
    }
    .card-body {
      padding: 15px;
    }
    .card-title {
      font-size: 1.25rem;
      margin-bottom: 10px;
      color: #333;
    }
    .card-text {
      font-size: 0.9rem;
      color: #666;
      margin: 5px 0;
    }
    .card-footer {
      padding: 15px;
      background: #f1f1f1;
      text-align: right;
    }
    .read-more-button {
      text-decoration: none;
      color: #007bff;
      font-weight: 500;
    }
    .read-more-button:hover {
      color: #0056b3;
    }
    .pagination-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px;
    }
    @media (min-width: 576px) {
      #post-list {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  `;
  document.head.appendChild(style);

  const postList = document.getElementById("post-list");
  const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";
  let allArticles = [];
  let currentPage = 0;
  let totalPages = 0;
  let prevButton, nextButton;

  // Fungsi untuk merender artikel
  const renderArticles = (page) => {
    const start = page * 6;
    const end = start + 6;
    const articlesToShow = allArticles.slice(start, end);

    postList.innerHTML = "";
    articlesToShow.forEach(article => {
      const col = document.createElement("div");
      const card = document.createElement("div");
      card.className = "post-card";

      const img = document.createElement("img");
      img.src = article.thumbnail || article.image;
      img.alt = article.title;

      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h2");
      title.className = "card-title";
      title.textContent = article.title;
      
      const author = document.createElement("p");
      author.className = "card-text";
      author.innerHTML = `<strong>Penulis:</strong> ${article.author}`;
      
      const date = document.createElement("p");
      date.className = "card-text";
      date.innerHTML = `<strong>Tanggal:</strong> ${article.date}`;
      
      const footer = document.createElement("div");
      footer.className = "card-footer";
      const readMore = document.createElement("a");
      readMore.href = `/post/${article.file}`;
      readMore.className = "read-more-button";
      readMore.textContent = "Baca Selengkapnya";
      
      footer.appendChild(readMore);
      body.appendChild(title);
      body.appendChild(author);
      body.appendChild(date);
      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(footer);
      col.appendChild(card);
      postList.appendChild(col);
    });
  };

  // Fungsi untuk update tombol paginasi
  const updatePaginationButtons = () => {
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= totalPages - 1;
  };

  // Fungsi untuk inisialisasi paginasi
  const initPagination = () => {
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls";

    prevButton = document.createElement("button");
    prevButton.textContent = "Sebelumnya";
    prevButton.style.padding = "10px 20px";
    prevButton.style.border = "none";
    prevButton.style.backgroundColor = "#007bff";
    prevButton.style.color = "#fff";
    prevButton.style.borderRadius = "5px";
    prevButton.style.cursor = "pointer";
    
    nextButton = document.createElement("button");
    nextButton.textContent = "Selanjutnya";
    nextButton.style.padding = "10px 20px";
    nextButton.style.border = "none";
    nextButton.style.backgroundColor = "#007bff";
    nextButton.style.color = "#fff";
    nextButton.style.borderRadius = "5px";
    nextButton.style.cursor = "pointer";

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
    postList.parentNode.insertBefore(paginationControls, postList.nextSibling);

    // Event listeners untuk tombol
    prevButton.addEventListener("click", () => {
      if (currentPage > 0) {
        currentPage--;
        renderArticles(currentPage);
        updatePaginationButtons();
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        renderArticles(currentPage);
        updatePaginationButtons();
      }
    });
  };

  fetch(manifestUrl)
    .then(response => response.json())
    .then(articles => {
      // Urutkan artikel berdasarkan tanggal terbaru
      allArticles = articles.sort((a, b) => {
        const [dA, mA, yA] = a.date.split("-");
        const [dB, mB, yB] = b.date.split("-");
        return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
      }).reverse();

      totalPages = Math.ceil(allArticles.length / 6);
      
      // Sembunyikan paginasi jika tidak perlu
      if (allArticles.length > 6) {
        initPagination();
      }
      
      renderArticles(currentPage);
      updatePaginationButtons();
    })
    .catch(error => {
      console.error("Gagal memuat artikel:", error);
      postList.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <p style="color: red;">Gagal memuat daftar artikel. Silakan coba beberapa saat lagi.</p>
        </div>
      `;
    });
});
