document.addEventListener("DOMContentLoaded", () => {
    const osInfo = document.getElementById("osInfo");
    const downloadBtn = document.getElementById("downloadBtn");
    const verifyBtn = document.getElementById("verifyBtn");
    const verifyStatus = document.getElementById("verifyStatus");

    const userAgent = navigator.userAgent.toLowerCase();
    let os = "dispositivo";

    let certFile = "./certs/rootCA.crt";
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        os = "iOS";
        certFile = "./certs/rootCA.mobileconfig";
    } else if (/android/.test(userAgent)) {
        os = "Android";
    } else if (/win/.test(userAgent)) {
        os = "Windows";
    } else if (/mac/.test(userAgent)) {
        os = "macOS";
    } else if (/linux/.test(userAgent)) {
        os = "Linux";
    }

    
    

    // Download del certificato
    downloadBtn.addEventListener("click", () => {
        window.location.href = certFile;
        verifyBtn.disabled = false;
    });

    // Verifica installazione certificato
verifyBtn.addEventListener("click", async () => {
    verifyStatus.textContent = "Verifica in corso...";
    verifyStatus.style.color = "blue";

    try {
        const res = await fetch("https://10.0.0.1/verify-cert");
        const data = await res.json();

        if (data.success) {
            verifyStatus.textContent = "Accesso sbloccato!";
            verifyStatus.style.color = "green";

	    window.location.href = "https://google.com";

        } else {
            verifyStatus.textContent = "Errore riprovare";
            verifyStatus.style.color = "red";
        }
    } catch (err) {
        verifyStatus.textContent = "certificato NON installato!";
        verifyStatus.style.color = "red";
    }
});

});
