document.addEventListener("DOMContentLoaded", () => {
    const postList = document.getElementById("post-list");
    const repoUrl = "/data/articles.json"; // File JSON statis

    fetch(repoUrl)
        .then(response => response.json())
        .then(articles => {
            // Urutkan artikel berdasarkan tanggal (terbaru terlebih dahulu)
            articles.sort((a, b) => {
                const dateA = new Date(a.date.split('-').reverse().join('-')); // Format tanggal ke YYYY-MM-DD
                const dateB = new Date(b.date.split('-').reverse().join('-'));
                return dateB - dateA;
            });

            // Tampilkan artikel yang sudah diurutkan
            articles.forEach(article => {
                const col = document.createElement("div");
                col.className = "col-md-4";
                const card = document.createElement("div");
                card.className = "post-card";

                // Gambar utama (gunakan thumbnail, fallback ke image jika thumbnail tidak ada)
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
        .catch(error => console.error("Error loading articles:", error));
});