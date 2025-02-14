document.addEventListener("DOMContentLoaded", () => {
    const postList = document.getElementById("post-list");
    const repoUrl = "https://api.github.com/repos/ideathesis/blog/contents/post";
    // Array untuk menyimpan semua artikel
    const articles = [];
    // Ambil daftar file dari GitHub API
    fetch(repoUrl)
        .then(response => response.json())
        .then(files => {
            // Loop untuk mengambil metadata dari setiap file HTML
            const promises = files
                .filter(file => file.name.endsWith(".html")) // Hanya proses file HTML
                .map(file => fetch(file.download_url) // Fetch isi file HTML
                    .then(response => response.text())
                    .then(htmlContent => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(htmlContent, "text/html");
                        const metadataScript = doc.querySelector("script[type='application/json']");
                        if (metadataScript) {
                            const metadata = JSON.parse(metadataScript.textContent);
                            metadata.file = file.name; // Simpan nama file
                            return metadata; // Kembalikan metadata
                        }
                        return null; // Jika metadata tidak ada, kembalikan null
                    })
                    .catch(error => {
                        console.error(`Error loading file ${file.name}:`, error);
                        return null;
                    })
                );
            // Tunggu semua promise selesai
            Promise.all(promises).then(results => {
                // Filter artikel yang memiliki metadata valid
                const validArticles = results.filter(article => article !== null);
                // Urutkan artikel berdasarkan tanggal (terbaru terlebih dahulu)
                validArticles.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA; // Terbaru terlebih dahulu
                });
                // Bersihkan konten sebelum menampilkan artikel
                postList.innerHTML = "";
                // Tampilkan artikel yang sudah diurutkan
                validArticles.forEach(article => {
                    const col = document.createElement("div");
                    col.className = "col-md-4";
                    const card = document.createElement("div");
                    card.className = "post-card";

                    // Gambar utama (gunakan thumbnail, fallback ke image jika thumbnail tidak ada)
                    const img = document.createElement("img");
                    img.src = article.thumbnail || article.image; // Prioritaskan thumbnail
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

                    card.appendChild(img); // Thumbnail sebagai gambar utama
                    card.appendChild(body);
                    card.appendChild(footer);

                    col.appendChild(card);
                    postList.appendChild(col);
                });
            });
        })
        .catch(error => console.error("Error loading posts:", error));
});