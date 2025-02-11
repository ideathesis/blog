    // Ambil data metadata dari script tag
    const metadataScript = document.getElementById('metadata');
    const metadata = JSON.parse(metadataScript.textContent);
    // Isi elemen HTML dengan data dari metadata
    document.getElementById('article-title').textContent = metadata.title;
    document.getElementById('article-meta').textContent = `Oleh : ${metadata.author} | ${metadata.date}`;
    document.getElementById('featured-image').src = metadata.image;
    document.getElementById('featured-image').alt = metadata.title;

    // JavaScript untuk menampilkan artikel terkait
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
                        const postLink = document.createElement("a");
                        postLink.href = `/post/${article.file}`;
                        postLink.className = "related-post";
                        postLink.innerHTML = `
                            <img src="${article.image}" alt="${article.title}">
                            <div class="related-post-content">
                                <h3 class="related-post-title">${article.title}</h3>
                                <p class="related-post-meta">Oleh ${article.author} | ${article.date}</p>
                            </div>
                        `;
                        postList.appendChild(postLink);
                    });
                });
            })
            .catch(error => console.error("Error loading posts:", error));
    });