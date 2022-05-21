var listaRadio;
window.onload = function () {
    loadRadio();
}
function loadRadio() {
    if (document.querySelector("#containerRadio")) {
        var box = document.querySelector("#containerRadio");
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                listaRadio = JSON.parse(xhttp.responseText);
                console.log(listaRadio);
                for (var i = 0; i < listaRadio.length; i++) {
                    box.innerHTML += "<a href='javascript:playRadio(" + i + ");' class='linkRadio' title='" + listaRadio[i].name + "'><img src='" + listaRadio[i].img + "' alt='" + listaRadio[i].name + "' class='imgRadio' id='img_radio_" + i + "'/></a>";
                }
                if (location.hash) {
                    eval(decodeURIComponent(location.hash.replace("#", "")));
                }
            }
        };
        xhttp.open("GET", "radio/radio.json", true);
        xhttp.send();
    }

}
function playRadio(i) {
    location.hash = encodeURIComponent("playRadio(" + i + ");")
    document.getElementById("audioContainer").innerHTML = "<audio preload=\"true\" controls autoplay id='audioPlayer'></audio>";
    var audioEl = document.querySelector("audio");
    var infoRadio = document.querySelector("#infoRadio");
    document.title = listaRadio[i].name + " - KinderMedia";
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: listaRadio[i].name,
            artist: 'KinderMedia',
            album: 'Radio',
            artwork: [{
                src: listaRadio[i].img
            }]
        });
    }
    var src = listaRadio[i].stream;
    audioEl.src = src;
    infoRadio.innerHTML = "Carico <b>" + listaRadio[i].name + "</b>...";
    audioEl.addEventListener("canplay", function() {
        audioEl.play();
    })
    audioEl.addEventListener("play", function () {
        infoRadio.innerHTML = "Stai ascoltando: <b>" + listaRadio[i].name + "</b>";
    })
    audioEl.addEventListener('error', function(e) {
        location.href = src;
    }, true);
}	