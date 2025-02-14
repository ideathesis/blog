document.addEventListener("DOMContentLoaded", () => {
    const postList = document.getElementById("post-list");
    const manifestUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

    fetch(manifestUrl)
        .then(response => response.json())
        .then(articles => {
            // Urutkan artikel berdasarkan tanggal
            const validArticles = articles.sort((a, b) => {
                const [dA, mA, yA] = a.date.split("-");
                const [dB, mB, yB] = b.date.split("-");
                return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
            }).reverse();

            // Bersihkan konten sebelum menampilkan artikel
            postList.innerHTML = "";

            // Tampilkan artikel yang sudah diurutkan (kode render tetap sama)
            validArticles.forEach(article => {
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