// title-post-dinamics.js

document.addEventListener("metadataLoaded", function (event) {
    // Ambil data metadata dari event
    const metadata = event.detail;
    
    // Perbarui tag <title> dengan format "IDEA THESIS - Judul Artikel"
    document.title = `IDEA THESIS - ${metadata.title}`;
});
