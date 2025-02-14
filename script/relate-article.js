document.addEventListener("DOMContentLoaded", () => {
    // Ambil metadata artikel saat ini
    const currentMetadataScript = document.getElementById('metadata');
    const currentMetadata = JSON.parse(currentMetadataScript.textContent);

    // Isi elemen HTML dengan data dari metadata
    document.getElementById('article-title').textContent = currentMetadata.title;
    document.getElementById('article-meta').textContent = `Oleh : ${currentMetadata.author} | ${currentMetadata.date}`;
    document.getElementById('featured-image').src = currentMetadata.image;
    document.getElementById('featured-image').alt = currentMetadata.title;

    // Array untuk menyimpan semua artikel
    const articles = [];
    const repoUrl = "https://api.github.com/repos/ideathesis/blog/contents/post";

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

                // Hitung relevansi artikel berdasarkan kesamaan judul
                const relatedArticles = validArticles.filter(article => {
                    const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/); // Kata-kata judul artikel saat ini
                    const articleTitleWords = article.title.toLowerCase().split(/\s+/); // Kata-kata judul artikel lain

                    // Cek apakah ada kata yang cocok antara judul artikel saat ini dan artikel lain
                    const hasMatchingWords = currentTitleWords.some(word => articleTitleWords.includes(word));
                    return hasMatchingWords && article.title !== currentMetadata.title; // Pastikan artikel bukan artikel saat ini
                });

                // Urutkan artikel terkait berdasarkan jumlah kata yang cocok (relevansi)
                relatedArticles.forEach(article => {
                    const currentTitleWords = currentMetadata.title.toLowerCase().split(/\s+/); // Kata-kata judul artikel saat ini
                    const articleTitleWords = article.title.toLowerCase().split(/\s+/); // Kata-kata judul artikel lain

                    // Hitung jumlah kata yang cocok
                    const matchingWords = currentTitleWords.filter(word => articleTitleWords.includes(word)).length;
                    article.relevanceScore = matchingWords; // Simpan skor relevansi
                });

                // Urutkan artikel berdasarkan skor relevansi (tertinggi terlebih dahulu)
                relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

                // Batasi jumlah artikel terkait yang ditampilkan (misalnya, hanya 5 artikel)
                const maxRelatedArticles = 10;
                const limitedRelatedArticles = relatedArticles.slice(0, maxRelatedArticles);

                // Bersihkan konten sebelum menampilkan artikel
                const postList = document.getElementById("post-list");
                postList.innerHTML = "";

                // Tampilkan artikel terkait yang sudah diurutkan
                limitedRelatedArticles.forEach(article => {
                    const postLink = document.createElement("a");
                    postLink.href = `/post/${article.file}`;
                    postLink.className = "col-md-4 related-post";
                    postLink.innerHTML = `
                        <img src="${article.image}" alt="${article.title}" class="img-fluid">
                        <div class="related-post-content">
                            <h3 class="related-post-title">${article.title}</h3>
                            <p class="related-post-meta">Oleh : ${article.author} | ${article.date}</p>
                        </div>
                    `;
                    postList.appendChild(postLink);
                });
            });
        })
        .catch(error => console.error("Error loading posts:", error));
});