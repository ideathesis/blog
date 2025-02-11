        // JavaScript untuk mengubah title secara dinamis
        document.addEventListener("DOMContentLoaded", function () {
            // Mengambil elemen script yang berisi metadata
            const metadataElement = document.getElementById("metadata");
            
            // Parsing data JSON dari elemen script
            const metadata = JSON.parse(metadataElement.textContent);

            // Memperbarui tag <title> dengan format "IDEA THESIS - Judul Artikel"
            document.title = `IDEA THESIS - ${metadata.title}`;
        });