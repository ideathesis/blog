async function fetchMarkdownFiles() {
    const response = await fetch('/post/');
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'))
        .map(a => a.getAttribute('href'))
        .filter(href => href.endsWith('.md'));

    const contentDiv = document.getElementById('content');

    for (const link of links) {
        const fileResponse = await fetch(link);
        const markdownText = await fileResponse.text();
        const frontMatterEnd = markdownText.indexOf('---', markdownText.indexOf('---') + 3);
        const frontMatter = markdownText.substring(3, frontMatterEnd).trim();
        const content = markdownText.substring(frontMatterEnd + 3).trim();

        const meta = {};
        frontMatter.split('\n').forEach(line => {
            const [key, value] = line.split(': ').map(s => s.trim());
            meta[key] = value;
        });

        const article = document.createElement('article');
        article.classList.add('mb-5');
        article.innerHTML = `
            <h2><a href="/${link.replace('.md', '.html')}" class="text-decoration-none">${meta.title}</a></h2>
            <small class="text-muted">Ditulis oleh ${meta.author} pada ${meta.date}</small>
            <div>${marked(content.split('\n').slice(0, 5).join('\n'))}</div>
            <a href="/${link.replace('.md', '.html')}" class="btn btn-primary mt-2">Baca Selengkapnya</a>
        `;
        contentDiv.appendChild(article);
    }
}

async function loadPost() {
    const path = window.location.pathname;
    const mdPath = path.replace('.html', '.md');

    const response = await fetch(mdPath);
    if (!response.ok) {
        document.getElementById('post-content').innerHTML = '<h1>Postingan Tidak Ditemukan</h1>';
        return;
    }

    const markdownText = await response.text();
    const frontMatterEnd = markdownText.indexOf('---', markdownText.indexOf('---') + 3);
    const frontMatter = markdownText.substring(3, frontMatterEnd).trim();
    const content = markdownText.substring(frontMatterEnd + 3).trim();

    const meta = {};
    frontMatter.split('\n').forEach(line => {
        const [key, value] = line.split(': ').map(s => s.trim());
        meta[key] = value;
    });

    document.getElementById('post-content').innerHTML = `
        <h1>${meta.title}</h1>
        <small class="text-muted">Ditulis oleh ${meta.author} pada ${meta.date}</small>
        <hr>
        <div>${marked(content)}</div>
    `;
}

if (window.location.pathname.includes('.html')) {
    loadPost();
} else {
    fetchMarkdownFiles();
}