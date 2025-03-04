				var disqus_config = function () {
					// Ambil URL halaman secara otomatis
					this.page.url = window.location.href; // URL lengkap halaman
					// Ambil path URL sebagai identifier (contoh: "/blog/post-1")
					this.page.identifier = window.location.pathname; 
				};
				(function() {
					var d = document, s = d.createElement('script');
					s.src = 'https://ideathesis.disqus.com/embed.js';
					s.setAttribute('data-timestamp', +new Date());
					(d.head || d.body).appendChild(s);
				})();