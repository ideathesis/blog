// Konfigurasi Disqus dengan penanganan URL yang lebih baik
var disqus_config = function () {
    // Gunakan URL lengkap termasuk query string dan hash
    this.page.url = window.location.href;
    
    // Gunakan kombinasi path + query string sebagai identifier
    // untuk menghindari duplikasi komentar pada URL berbeda
    this.page.identifier = window.location.pathname + window.location.search;
    
    // Jika ada canonical URL yang ditentukan, gunakan itu
    var canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
        this.page.url = canonical.href;
        this.page.identifier = canonical.href;
    }
};

// Pastikan skrip hanya dimuat sekali
if (!window.DISQUS) {
    (function() {
        var d = document, s = d.createElement('script');
        s.src = 'https://ideathesis.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        s.setAttribute('id', 'disqus-script');
        s.async = true; // Non-blokir rendering halaman
        s.onerror = function() {
            console.error('Gagal memuat skrip Disqus');
        };
        
        // Cek ketersediaan elemen target
        var target = d.getElementsByTagName('head')[0] || d.body;
        if (target) {
            target.appendChild(s);
        } else {
            console.warn('Tidak dapat menemukan elemen untuk menyisipkan Disqus');
        }
    })();
} else {
    // Jika Disqus sudah dimuat, refresh instance
    DISQUS.reset({
        reload: true,
        config: disqus_config
    });
}