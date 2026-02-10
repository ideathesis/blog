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
function renderRelatedArticles(metadata) {
  if (!metadata) {
    console.error("Metadata tidak tersedia");
    return;
  }

  const manifestUrl =
    "https://raw.githubusercontent.com/ideathesis/blog/main/post/manifest.json";

  fetch(manifestUrl)
    .then(response => response.json())
    .then(allArticles => {
      const relatedArticles = allArticles.filter(article => {
        const currentTitleWords = metadata.title.toLowerCase().split(/\s+/);
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        return currentTitleWords.some(word => articleTitleWords.includes(word)) &&
          article.title !== metadata.title;
      });

      relatedArticles.forEach(article => {
        const currentTitleWords = metadata.title.toLowerCase().split(/\s+/);
        const articleTitleWords = article.title.toLowerCase().split(/\s+/);
        article.relevanceScore = currentTitleWords.filter(word =>
          articleTitleWords.includes(word)
        ).length;
      });

      const sortedArticles = relatedArticles.sort(
        (a, b) => b.relevanceScore - a.relevanceScore
      );
      // Batasi artikel terkait maksimal 3
      const limitedArticles = sortedArticles.slice(0, 3);

      const postList = document.getElementById("post-list");
      postList.innerHTML = "";

      limitedArticles.forEach(article => {
        const postLink = document.createElement("a");
        postLink.href = `/post/${article.file}`;
        postLink.className = "related-post";
        postLink.innerHTML = `
          <img src="${article.image}" alt="${article.title}" class="img-fluid">
          <div class="related-post-content">
            <h3 class="related-post-title">${article.title}</h3>
            <div class="related-post-meta">
              <span><i class="far fa-user"></i> ${article.author}</span>
              <span><i class="far fa-calendar"></i> ${article.date}</span>
            </div>
          </div>
        `;
        postList.appendChild(postLink);
      });
    })
    .catch(error => {
      console.error("Gagal memuat artikel terkait:", error);
      document.getElementById("post-list").innerHTML = `
        <div class="alert alert-warning">
          Gagal memuat artikel terkait. Silakan refresh halaman.
        </div>
      `;
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
    const converter = new showdown.Converter();
    const html = converter.makeHtml(markdownContent);
    document.getElementById('article-content').innerHTML = html;

    // Panggil fungsi untuk merender artikel terkait setelah metadata tersedia
    renderRelatedArticles(metadata);
  })
  .catch(error => {
    console.error('Gagal memuat file Markdown:', error);
    window.location.href = "/404.html";
  });
