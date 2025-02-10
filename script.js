async function fetchMarkdownFiles() {
    try {
        const response = await fetch('/post-list.json');
        if (!response.ok) {
            console.error('Failed to fetch post list:', response.statusText);
            return;
        }

        const links = await response.json(); // Baca daftar file dari JSON

        console.log('Links:', links);

        const contentDiv = document.getElementById('content');

        for (const link of links) {
            const fileResponse = await fetch(link);
            if (!fileResponse.ok) {
                console.error('Failed to fetch markdown file:', link, fileResponse.statusText);
                continue;
            }
            const markdownText = await fileResponse.text();
            const frontMatterEnd = markdownText.indexOf('---', markdownText.indexOf('---') + 3);
            const frontMatter = markdownText.substring(3, frontMatterEnd).trim();
            const content = markdownText.substring(frontMatterEnd + 3).trim();

            const meta = {};
            frontMatter.split('\n').forEach(line => {
                const [key, value] = line.split(': ').map(s => s.trim());
                meta[key] = value;
            });

            console.log('Meta:', meta);
            console.log('Content:', content);

            const article = document.createElement('article');
            article.classList.add('mb-5');
            article.innerHTML = `
                <h2><a href="/post/${link.replace('.md', '.html')}" class="text-decoration-none">${meta.title}</a></h2>
                <small class="text-muted">Ditulis oleh ${meta.author} pada ${meta.date}</small>
                <div>${marked.parseInline(content.split('\n').slice(0, 5).join('\n'))}</div>
                <a href="/post/${link.replace('.md', '.html')}" class="btn btn-primary mt-2">Baca Selengkapnya</a>
            `;
            contentDiv.appendChild(article);
        }
    } catch (error) {
        console.error('Error fetching markdown files:', error);
    }
}