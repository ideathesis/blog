document.addEventListener("DOMContentLoaded", () => {
    // Sisipkan CSS yang diperlukan langsung ke dalam head
    const style = document.createElement("style");
    style.type = "text/css";
    style.textContent = `
        /* Styling untuk Artikel */
        .post-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
            cursor: pointer;
            margin-bottom: 20px;
        }
        
        .post-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .post-card img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: cover;
            aspect-ratio: 16 / 9;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        
        .post-card .card-body {
            padding: 15px;
        }
        
        .post-card .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
            color: #333;
        }
        
        .post-card .card-text {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 15px;
        }
        
        .post-card .card-footer {
            background: none;
            border-top: 1px solid #ddd;
            padding: 10px;
            font-size: 0.8rem;
            color: #999;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .post-card .read-more-button {
            text-decoration: none;
            color: white;
            background-color: #81C784;
            padding: 8px 16px;
            border-radius: 5px;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        
        .post-card .read-more-button:hover {
            background-color: #64B5F6;
            transform: scale(1.05);
        }
        
        /* Styling untuk Tombol Paginasi */
        .pagination-controls button {
            text-decoration: none;
            color: white;
            background-color: #81C784;
            padding: 8px 16px;
            border-radius: 5px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        
        .pagination-controls button:hover {
            background-color: #64B5F6;
            transform: scale(1.05);
        }
        
        .pagination-controls button:disabled {
            background-color: #C0C0C0;
            cursor: not-allowed;
            transform: none;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);

    const postList = document.getElementById("post-list");
    // Gunakan URL relatif untuk memastikan file manifest.json di-load dari server yang sama
    const manifestUrl = "/post/manifest.json";
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
            col.className = "col-md-4";
            const card = document.createElement("div");
            card.className = "post-card";

            const img = document.createElement("img");
            // Menggunakan properti thumbnail atau fallback ke image
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
            // Properti file sudah berformat query string, misalnya "?file=nama_file.md"
            readMore.href = article.file;
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
        paginationControls.className = "pagination-controls d-flex justify-content-center gap-3 my-4";

        prevButton = document.createElement("button");
        prevButton.className = "btn btn-primary";
        prevButton.textContent = "Sebelumnya";
        
        nextButton = document.createElement("button");
        nextButton.className = "btn btn-primary";
        nextButton.textContent = "Selanjutnya";

        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(nextButton);
        postList.parentNode.insertBefore(paginationControls, postList.nextSibling);

        // Event listeners untuk tombol paginasi
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

    // Ambil data artikel dari manifest
    fetch(manifestUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(articles => {
            // Urutkan artikel berdasarkan tanggal terbaru (format DD-MM-YYYY)
            allArticles = articles.sort((a, b) => {
                const [dA, mA, yA] = a.date.split("-");
                const [dB, mB, yB] = b.date.split("-");
                return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
            }).reverse();

            totalPages = Math.ceil(allArticles.length / 6);
            
            // Inisialisasi paginasi jika artikel lebih dari 6
            if (allArticles.length > 6) {
                initPagination();
            }
            
            renderArticles(currentPage);
            updatePaginationButtons();
        })
        .catch(error => {
            console.error("Gagal memuat artikel:", error);
            postList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Gagal memuat daftar artikel. Silakan coba beberapa saat lagi.</p>
                </div>
            `;
        });
});
