const handleCambioHash = () => {
    switch (location.hash) {
        case "":
        case "#":
            location.hash = "#home";
            break;
        default:
            for (let e of document.querySelectorAll("main section"))
                e.style.display = "none";
            let d;
            let dCarica = document.querySelector("dialog#iconaCaricam");
            switch (location.hash) {
                case "#home":
                case "#musica":
                case "#utente":
                case "#impostazioni":
                case "#radio":
                    document.querySelector("main section" + location.hash).style.display = "block";
                    break;
                case "#vid-cerca-.homepage":
                    document.querySelector("main section#vid-cerca-").style.display = "block";
                    break;
                case String(location.hash.match(/#vid-cerca-.+/g)):
                    d = document.querySelector("main section#vid-cerca-");
                    d.style.display = "block";
                    dCarica.showModal();
                    if (d.querySelector("div.allineamento")) d.removeChild(d.querySelector("div.allineamento"));
                    let query = location.hash.split("-")[2];
                    ricercaVid(query).then(r => {
                        dCarica.close();
                        d.innerHTML += r;
                    });
                    break;
                case String(location.hash.match(/#vid-inf-.+/g)):
                    dCarica.showModal();
                    d = document.querySelector("main section#vid-inf-");
                    d.style.display = "block";
                    let nome = location.hash.replace("#vid-inf-", "");
                    if (nome.split("-")[0] == "anime") {
                        nome = nome.replace("anime-", "");
                        infoTitoloAnime(nome.split("-")[0], nome.replace(nome.split("-")[0] + "-", ""))
                            .then(t => {
                                dCarica.close();
                                d.innerHTML = t;
                            });
                    } else {
                        infoTitolo(nome.split("-")[0], nome.replace(nome.split("-")[0] + "-", ""))
                            .then(t => {
                                dCarica.close();
                                d.innerHTML = t;
                            });
                    }
                    break;
                case String(location.hash.match(/#giornali-data-.+/g)):
                    //dCarica.showModal();
                    d = document.querySelector("main section#giornali-data-");
                    d.style.display = "block";
                    let data = location.hash.split("-").at(-1);
                    if (d.querySelector("giornali")) d.removeChild(d.querySelector("giornali"));
                    d.querySelector("input[type=date]").value = data.substr(0, 4) + "-" + data.substr(4, 2) + "-" + data.substr(6, 2);
                    richiediGiornali(data).then(t => {
                        d.innerHTML += t;
                        dCarica.close();
                    });
                    break;
                default:
                    location.hash = "#home";
            }
            break;
    }
}

const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                'sw.js',
                {
                    scope: '/',
                }
            );
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();

window.addEventListener("load", function () {
    handleCambioHash();

    ricercaVid(".homepage").then(r => document.querySelector("main section#vid-cerca-").innerHTML += r);
});
window.addEventListener("hashchange", handleCambioHash);

