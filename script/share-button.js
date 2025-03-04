    const currentUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    
    document.getElementById('facebook-share').href = "https://www.facebook.com/sharer/sharer.php?u=" + currentUrl;
    document.getElementById('twitter-share').href = "https://twitter.com/intent/tweet?url=" + currentUrl + "&text=" + pageTitle;
    document.getElementById('linkedin-share').href = "https://www.linkedin.com/sharing/share-offsite/?url=" + currentUrl;
    document.getElementById('whatsapp-share').href = "https://wa.me/?text=" + currentUrl;
    document.getElementById('telegram-share').href = "https://t.me/share/url?url=" + currentUrl + "&text=" + pageTitle;