document.addEventListener("DOMContentLoaded", () => {
    // Beri delay 500ms untuk memastikan metadata terload
    setTimeout(() => {
        // Ambil metadata dari elemen script
        const metadataElement = document.getElementById('metadata');
        if (!metadataElement) {
            console.error('Metadata tidak ditemukan');
            document.getElementById("post-list").innerHTML = `
                <div class="alert alert-warning">
                    Gagal memuat metadata artikel.
                </div>`;
            return;
        }

        const currentMetadata = JSON.parse(metadataElement.textContent);
        
        // Ambil data dari manifest.json
        const manifestUrl = "/post/manifest.json";
        
        fetch(manifestUrl)
            .then(response => {
                if (!response.ok) throw new Error('Gagal memuat manifest');
                return response.json();
            })
            .then(allArticles => {
                // Filter artikel terkait
                const relatedArticles = allArticles.filter(article => {
                    // Exclude artikel saat ini
                    if (article.file === currentMetadata.file) return false;
                    
                    // Cari kata kunci yang sama
                    const currentWords = currentMetadata.title.toLowerCase().split(/[\s\W]+/);
                    const articleWords = article.title.toLowerCase().split(/[\s\W]+/);
                    return currentWords.some(word => 
                        word.length > 3 && // Ignore kata pendek
                        articleWords.includes(word)
                    );
                });

                // Hitung skor relevansi
                relatedArticles.forEach(article => {
                    const currentWords = currentMetadata.title.toLowerCase().split(/[\s\W]+/);
                    const articleWords = article.title.toLowerCase().split(/[\s\W]+/);
                    article.relevanceScore = currentWords.filter(word => 
                        word.length > 3 && 
                        articleWords.includes(word)
                    ).length;
                });

                // Urutkan dan batasi jumlah
                const sortedArticles = relatedArticles.sort((a, b) => 
                    b.relevanceScore - a.relevanceScore || 
                    new Date(b.date) - new Date(a.date)
                ).slice(0, 5);

                // Render artikel
                const postList = document.getElementById("post-list");
                postList.innerHTML = "";
                
                if (sortedArticles.length === 0) {
                    postList.innerHTML = `
                        <div class="alert alert-info">
                            Tidak ada artikel terkait ditemukan.
                        </div>`;
                    return;
                }

                sortedArticles.forEach(article => {
                    const postLink = document.createElement("a");
                    postLink.href = `/post/?file=${article.file}`;
                    postLink.className = "related-post";
                    postLink.innerHTML = `
                        <img src="${article.image}" alt="${article.title}" class="img-fluid">
                        <div class="related-post-content">
                            <h3 class="related-post-title">${article.title}</h3>
                            <p class="related-post-meta">Oleh : ${article.author} | ${new Date(article.date).toLocaleDateString('id-ID')}</p>
                        </div>
                    `;
                    postList.appendChild(postLink);
                });
            })
            .catch(error => {
                console.error("Gagal memuat artikel terkait:", error);
                document.getElementById("post-list").innerHTML = `
                    <div class="alert alert-warning">
                        Gagal memuat artikel terkait. Silakan coba lagi nanti.
                    </div>`;
            });
    }, 500);
});