document.addEventListener("DOMContentLoaded", () => {
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
            col.className = "col-md-4";
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
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Gagal memuat daftar artikel. Silakan coba beberapa saat lagi.</p>
                </div>
            `;
        });
});