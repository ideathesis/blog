  document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Cek apakah navbar sedang dalam keadaan terbuka (class "show")
        if (navbarCollapse.classList.contains('show')) {
          // Menggunakan Bootstrap Collapse instance untuk menyembunyikan navbar
          new bootstrap.Collapse(navbarCollapse, {
            toggle: true
          });
        }
      });
    });
  });