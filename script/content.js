document.addEventListener("DOMContentLoaded", () => {
    // Sisipkan CSS modern langsung ke dalam head
    const style = document.createElement("style");
    style.type = "text/css";
    style.textContent = `
        /* Reset dasar */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        html {
            font-size: 16px;
        }
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #fafafa;
            color: #333;
            line-height: 1.6;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding: 1rem;
        }
        
        /* Container posting dengan grid modern */
        #post-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            width: 100%;
            margin: 0 auto;
        }
        
        /* Kartu artikel modern */
        .post-card {
            background: #fff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .post-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .post-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .post-card:hover img {
            transform: scale(1.05);
        }
        
        .card-body {
            padding: 1rem;
        }
        
        .card-title {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: #222;
        }
        
        .card-text {
            font-size: 0.9rem;
            margin-bottom: 0.75rem;
            color: #666;
        }
        
        .card-footer {
            padding: 0.8rem 1rem;
            background: #f0f0f0;
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }
        
        .read-more-button {
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #81C784, #64B5F6);
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.3s ease;
        }
        
        .read-more-button:hover {
            background: linear-gradient(135deg, #64B5F6, #4CAF50);
            transform: translateY(-2px);
        }
        
        /* Kontrol paginasi modern */
        .pagination-controls {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .pagination-controls button {
            padding: 0.75rem 1.25rem;
            background-color: #81C784;
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.3s ease;
        }
        
        .pagination-controls button:hover {
            background-color: #4CAF50;
            transform: translateY(-2px);
        }
        
        .pagination-controls button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
            transform: none;
            opacity: 0.7;
        }
        
        /* Responsif untuk layar kecil */
        @media (max-width: 768px) {
            .card-title {
                font-size: 1.1rem;
            }
            .card-text {
                font-size: 0.85rem;
            }
            .read-more-button {
                padding: 0.5rem 0.75rem;
                font-size: 0.9rem;
            }
            .pagination-controls button {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
            }
        }
    `;
    document.head.appendChild(style);

    // Ambil container posting dan URL manifest
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
            postList.appendChild(card);
        });
    };

    // Fungsi untuk mengupdate tombol paginasi
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
        
        nextButton = document.createElement("button");
        nextButton.textContent = "Selanjutnya";

        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(nextButton);
        postList.parentNode.insertBefore(paginationControls, postList.nextSibling);

        // Event listener untuk tombol paginasi
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
        .then(response => response.json())
        .then(articles => {
            // Urutkan artikel berdasarkan tanggal terbaru
            allArticles = articles.sort((a, b) => {
                const [dA, mA, yA] = a.date.split("-");
                const [dB, mB, yB] = b.date.split("-");
                return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
            }).reverse();

            totalPages = Math.ceil(allArticles.length / 6);
            if (allArticles.length > 6) {
                initPagination();
            }
            renderArticles(currentPage);
            updatePaginationButtons();
        })
        .catch(error => {
            console.error("Gagal memuat artikel:", error);
            postList.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <p style="color: red;">Gagal memuat daftar artikel. Silakan coba beberapa saat lagi.</p>
                </div>
            `;
        });
});
