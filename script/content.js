document.addEventListener("DOMContentLoaded", () => {
    const postList = document.getElementById("post-list");
    const baseUrl = "https://raw.githubusercontent.com/ideathesis/blog/main/post/";
    const manifestUrl = baseUrl + "manifest.json";

    // Ambil manifest
    fetch(manifestUrl)
    .then(response => response.json())
    .then(posts => {
        // Urutkan berdasarkan tanggal (format DD-MM-YYYY)
        posts.sort((a, b) => {
            const [dA, mA, yA] = a.date.split("-");
            const [dB, mB, yB] = b.date.split("-");
            return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
        }).reverse(); // Terbaru pertama

        // Render artikel
        postList.innerHTML = posts.map(post => `
            <div class="col-md-4">
                <div class="post-card">
                    <img src="${post.thumbnail}" 
                         alt="${post.title}"
                         class="post-thumbnail"
                         loading="lazy">
                    <div class="card-body">
                        <h2 class="card-title">${post.title}</h2>
                        <div class="post-meta">
                            <p class="author">${post.author}</p>
                            <time>${post.date}</time>
                        </div>
                        <a href="/post/${post.file}" 
                           class="read-more-button"
                           data-image="${baseUrl}${post.image}">
                            Baca Selengkapnya
                        </a>
                    </div>
                </div>
            </div>
        `).join("");
    })
    .catch(error => {
        console.error("Gagal memuat artikel:", error);
        postList.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Gagal memuat konten. Silakan refresh halaman.</p>
            </div>
        `;
    });
});