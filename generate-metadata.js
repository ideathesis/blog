const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom'); // Impor JSDOM dari jsdom

// Direktori tempat file HTML artikel disimpan
const postDir = path.join(__dirname, 'post');

// Baca semua file HTML di direktori /post/
const files = fs.readdirSync(postDir);

// Ekstrak metadata dari setiap file HTML
const articles = files
  .filter(file => file.endsWith('.html')) // Hanya proses file HTML
  .map(file => {
    const filePath = path.join(postDir, file);
    const content = fs.readFileSync(filePath, 'utf-8'); // Baca isi file

    // Parse HTML menggunakan JSDOM
    const dom = new JSDOM(content);
    const metadataScript = dom.window.document.querySelector("script[type='application/json']");

    if (metadataScript) {
      const metadata = JSON.parse(metadataScript.textContent);
      metadata.file = file; // Simpan nama file
      return metadata;
    }
    return null; // Jika tidak ada metadata, kembalikan null
  })
  .filter(article => article !== null); // Filter artikel yang valid

// Simpan metadata ke file JSON
fs.writeFileSync('public/data/articles.json', JSON.stringify(articles, null, 2));
console.log('Metadata berhasil dihasilkan!');