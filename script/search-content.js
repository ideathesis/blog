<script>
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsModal = new bootstrap.Modal(document.getElementById('search-results-modal'));
    const searchResultsContainer = document.getElementById('search-results');

    // Function to fetch and display search results
    async function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            alert('Masukkan kata kunci untuk mencari.');
            return;
        }

        try {
            // Fetch posts from GitHub API
            const response = await fetch('https://api.github.com/repos/ideathesis/blog/contents/post');
            const posts = await response.json();

            // Filter posts based on the query
            const filteredPosts = posts.filter(post => 
                post.name.toLowerCase().includes(query)
            );

            // Clear previous results
            searchResultsContainer.innerHTML = '';

            if (filteredPosts.length === 0) {
                searchResultsContainer.innerHTML = '<p>Tidak ada hasil yang ditemukan.</p>';
                return;
            }

            // Display filtered posts in the modal
            filteredPosts.forEach(post => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.innerHTML = `
                    <div class="search-result-title">${post.name}</div>
                    <div class="search-result-description">Klik untuk membuka artikel ini.</div>
                `;
                resultItem.addEventListener('click', () => {
                    window.open(`https://blog.ideathesis.biz.id/post/${post.name}`, '_blank');
                });
                searchResultsContainer.appendChild(resultItem);
            });

            // Show the modal
            searchResultsModal.show();
        } catch (error) {
            console.error('Error fetching posts:', error);
            searchResultsContainer.innerHTML = '<p>Terjadi kesalahan saat memuat hasil pencarian.</p>';
        }
    }

    // Event listener for search button
    searchButton.addEventListener('click', performSearch);

    // Optional: Allow pressing Enter key to trigger search
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});
</script>