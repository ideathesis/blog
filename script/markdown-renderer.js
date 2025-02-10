document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const postFile = urlParams.get('post');
  
  if(postFile) {
    fetch(`/post/${postFile}`)
      .then(response => response.text())
      .then(text => {
        const { attributes, body } = frontMatter(text);
        renderPost(attributes, body);
      })
      .catch(err => showError());
  } else {
    showError();
  }
});

function renderPost(meta, content) {
  document.title = `${meta.title} | IDEA THESIS`;
  
  const htmlContent = `
    ${meta.featured_image ? `<img src="${meta.featured_image}" alt="${meta.title}" class="featured-image">` : ''}
    <h1 class="text-center mb-4">${meta.title}</h1>
    ${marked.parse(content)}
  `;
  
  document.getElementById('blog-content').innerHTML = htmlContent;
}

function showError() {
  document.getElementById('blog-content').innerHTML = `
    <div class="alert alert-danger">
      Post tidak ditemukan. <a href="/">Kembali ke beranda</a>
    </div>
  `;
}