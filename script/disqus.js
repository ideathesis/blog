// Preconnect via JavaScript
const preconnect = document.createElement('link');
preconnect.rel = 'preconnect';
preconnect.href = 'https://ideathesis.disqus.com';
document.head.appendChild(preconnect);

// Konfigurasi Disqus
var disqus_config = function () {
    this.page.url = window.location.href;
    this.page.identifier = window.location.pathname;
};

// Fungsi utama load Disqus
function loadDisqus() {
    if(window.DISQUS || document.querySelector('script[src*="disqus.com/embed.js"]')) return;
    
    const d = document, s = d.createElement('script');
    s.src = 'https://ideathesis.disqus.com/embed.js';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
}

// Lazy Load dengan Intersection Observer
if(document.getElementById('disqus_thread')) {
    if('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                loadDisqus();
                observer.disconnect();
            }
        }, {
            rootMargin: '200px',
            threshold: 0.01
        });
        
        observer.observe(document.getElementById('disqus_thread'));
    } else {
        // Fallback 1: Load setelah 2 detik delay
        setTimeout(loadDisqus, 2000);
        
        // Fallback 2: Load saat user scroll
        window.addEventListener('scroll', () => {
            if(window.scrollY + window.innerHeight > document.getElementById('disqus_thread').offsetTop) {
                loadDisqus();
            }
        }, { once: true });
    }
}

// Final fallback jika semua metode gagal
window.addEventListener('load', () => {
    if(!document.querySelector('#disqus_thread iframe')) {
        loadDisqus();
    }
});