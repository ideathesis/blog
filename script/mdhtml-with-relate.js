// Ambil parameter file dari URL
const params = new URLSearchParams(window.location.search);
const mdFile = params.get('file');

// Jika tidak ada parameter file, arahkan ke halaman 404
if (!mdFile) {
  window.location.href = "/404.html";
}

/*
 * Fungsi untuk parsing YAML front matter
 */
function parseYAML(yamlText) {
  let result = {};
  yamlText.split('\n').forEach(line => {
    if (!line.trim()) return;
    let match = line.match(/^(\w+):\s*"(.*)"\s*$/);
    if (match) {
      result[match[1]] = match[2];
    } else {
      match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        result[match[1]] = match[2].trim();
      }
    }
  });
  return result;
}

/*
 * Fungsi untuk merender artikel terkait
 */
/*
 * Fungsi untuk merender artikel terkait
 */
function renderRelatedArticles(metadata) {
  if (!metadata || !metadata.title) {
    console.error("Metadata tidak valid untuk mencari artikel terkait");
    return;
  }

  // Use relative path
  const manifestUrl = "post/manifest.json";

  fetch(manifestUrl)
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat manifest");
      return response.json();
    })
    .then(allArticles => {
      // 1. Prepare current article data
      const currentTitle = metadata.title.toLowerCase();
      // Parse tags: support both array and comma-separated string
      let currentTags = [];
      if (Array.isArray(metadata.tags)) {
        currentTags = metadata.tags.map(t => t.toLowerCase());
      } else if (typeof metadata.tags === 'string') {
        currentTags = metadata.tags.split(',').map(t => t.trim().toLowerCase());
      } else if (metadata.category) {
        // Fallback to category if no tags
        currentTags = [metadata.category.toLowerCase()];
      }

      // Stop words to ignore in title matching (Indonesian)
      const stopWords = ["dan", "yang", "di", "ke", "dari", "ini", "itu", "untuk", "pada", "adalah", "dengan", "dalam", "atau", "juga", "karena", "bagi", "saya", "kita", "anda"];

      const currentTitleKeywords = currentTitle.split(/\s+/)
        .map(w => w.replace(/[^a-z0-9]/g, '')) // cleanup punctuation
        .filter(w => w.length > 3 && !stopWords.includes(w));

      // 2. Score articles
      const scoredArticles = allArticles
        .filter(article => {
          // Exclude current article (check by title or file if available)
          if (article.title === metadata.title) return false;
          if (window.location.pathname.includes(article.file)) return false;
          return true;
        })
        .map(article => {
          let score = 0;

          // A. Tag Matching (High Weight)
          let articleTags = [];
          if (Array.isArray(article.tags)) {
            articleTags = article.tags.map(t => t.toLowerCase());
          } else if (typeof article.tags === 'string') {
            articleTags = article.tags.split(',').map(t => t.trim().toLowerCase());
          } else if (article.category) {
            articleTags = [article.category.toString().toLowerCase()];
          }

          const sharedTags = currentTags.filter(tag => articleTags.includes(tag));
          score += sharedTags.length * 3; // 3 points per shared tag

          // B. Title Keyword Matching (Medium Weight)
          const articleTitle = article.title.toLowerCase();
          const articleKeywords = articleTitle.split(/\s+/)
            .map(w => w.replace(/[^a-z0-9]/g, ''))
            .filter(w => w.length > 3 && !stopWords.includes(w));

          const sharedKeywords = currentTitleKeywords.filter(kw => articleKeywords.includes(kw));
          score += sharedKeywords.length * 1; // 1 point per shared keyword

          // C. Recency/Popularity tie-breaker (small boost)
          // We can't easily check recency without parsing date, but we can preserve original order slightly

          return { ...article, score };
        });

      // 3. Sort by score
      scoredArticles.sort((a, b) => b.score - a.score);

      // 4. Fallback: If top score is 0, just take the latest ones (assuming manifest is sorted or we sort by date)
      // (The manifest usually has latest first or random. Ideally we parse date, but for now just taking first few is better than nothing if no matches)

      const relatedArticles = scoredArticles.slice(0, 3);

      // 5. Render
      const relatedContainer = document.getElementById("related-articles-list") || document.getElementById("post-list"); // Fallback to post-list if specific container doesn't exist yet, though user path implies we might be on a single post page using content.js structure? 
      // Wait, this file 'mdhtml-with-relate.js' suggests it renders into 'post-list'. Let's check the HTML.
      // Based on previous code, it rendered into 'post-list'.

      if (relatedContainer) {
        relatedContainer.innerHTML = "";

        if (relatedArticles.length === 0) {
          relatedContainer.innerHTML = "<p class='text-center text-muted col-12'>Tidak ada artikel terkait ditemukan.</p>";
          return;
        }

        relatedArticles.forEach(article => {
          // Construct HTML matching the main blog card style for consistency
          const col = document.createElement("div");
          col.className = "col-lg-4 col-md-6 mb-4 d-flex align-items-stretch";

          // Image Path Fix
          let imgPath = article.thumbnail || article.image || "";
          imgPath = imgPath.replace(/^(\/)?post\//, "");
          const imageUrl = imgPath ? `post/${imgPath}` : 'images/logo_baru.png';

          // Link Fix
          let postFile = article.file || "";
          postFile = postFile.replace(/^(\/)?post\//, "");
          const postLinkUrl = `post/${postFile}`;

          col.innerHTML = `
            <article class="blog-card h-100 border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
               <a href="${postLinkUrl}" class="blog-card-img-link" aria-label="${article.title}">
                 <div class="blog-card-img-wrapper">
                   <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='images/logo_baru.png'">
                 </div>
               </a>
               <div class="blog-card-body d-flex flex-column h-100 bg-white">
                 <div class="blog-card-meta mb-2">
                    <span class="meta-item text-muted small"><i class="far fa-calendar-alt text-success me-1"></i> ${article.date || '-'}</span>
                 </div>
                 <h3 class="blog-card-title fw-bold text-dark mb-3" style="font-size: 1.1rem; line-height: 1.4;">
                   <a href="${postLinkUrl}" class="text-decoration-none text-dark stretched-link">${article.title}</a>
                 </h3>
               </div>
            </article>
          `;
          relatedContainer.appendChild(col);
        });
      }
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
    });
}

// Ambil file Markdown berdasarkan parameter URL
fetch(`/post/md/${mdFile}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('File tidak ditemukan');
    }
    return response.text();
  })
  .then(text => {
    let metadata = {};
    let markdownContent = text;

    // Parsing YAML front matter jika ada
    if (text.startsWith('---')) {
      const match = text.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
      if (match) {
        const yamlContent = match[1];
        markdownContent = match[2];
        metadata = parseYAML(yamlContent);
      }
    }

    // Simpan metadata ke variabel global
    window.currentMetadata = metadata;

    // Update konten artikel
    if (metadata.title) {
      document.getElementById('article-title').textContent = metadata.title;
      document.title = `IDEA THESIS - ${metadata.title}`;
    }

    let metaText = "";
    if (metadata.author) {
      metaText += `Penulis: ${metadata.author}`;
    }
    if (metadata.date) {
      metaText += metaText ? ` | ${metadata.date}` : metadata.date;
    }
    document.getElementById('article-meta').textContent = metaText;

    if (metadata.image) {
      document
        .getElementById('featured-image')
        .setAttribute('src', metadata.image);
    }

    // Konversi Markdown ke HTML menggunakan showdown
    const converter = new showdown.Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      simpleLineBreaks: true
    });
    const html = converter.makeHtml(markdownContent);
    document.getElementById('article-content').innerHTML = html;

    // Panggil fungsi untuk merender artikel terkait setelah metadata tersedia
    renderRelatedArticles(metadata);
  })
  .catch(error => {
    console.error('Gagal memuat file Markdown:', error);
    window.location.href = "/404.html";
  });
