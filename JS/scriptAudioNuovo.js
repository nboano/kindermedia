const audioCacheName = "audio_cache";
const serverURL = "https://154.82.111.42.sslip.io";

var divInfo, divPrinc, q, currentQueueIndex, lyrics = null, audio;
var contaErr = 0;
var queue = [];
var winToolCoda;
var isOspite = true;
if(!localStorage.getItem("queue"))
    localStorage.setItem("queue", JSON.stringify([]));
/*
 * {
    title: "nome",
    artist: "artista",
    img: "https://img.url",
    id: 9239302012
}
 */
window.onload = function () {
   //loadMusica();
}
function formattaDurata(s) { return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s }
let temp_timeupdate = function () {
    document.getElementById("totalDuration").innerHTML = "-" + formattaDurata(Math.floor(audio.duration - audio.currentTime));
    document.getElementById("duration").value = audio.currentTime;
    document.getElementById("passedSeconds").innerHTML = formattaDurata(Math.floor(audio.currentTime));
    /*if (audio.currentTime >= audio.duration) {
        queue = getQueue();
        queue[positionInQueue].playing = false;
        audio.pause();
        writeQueue(queue);
        skipTo(nextPos);
    }*/
};
document.onvisibilitychange = function () {
    console.log(document.hidden ? "sospendo timeupdate" : "riprendo timeupdate");
    if (document.hidden)
        audio.removeEventListener("timeupdate", temp_timeupdate);
    else
        audio.addEventListener("timeupdate", temp_timeupdate);
};
function loadMusica() {
    if (document.getElementById("boxInfo") && document.getElementById("divVideo")) {
        divInfo = document.getElementById("boxInfo");
        divPrinc = document.getElementById("divVideo");
    }
    if (username !== "utente ospite") isOspite = false;
    if (!isOspite)
        scaricaCoda();
    if (location.hash.indexOf("ricerca(\"") !== -1) {
        eval(decodeURIComponent(location.hash.replace("#", "")));
    }
    queue = getQueue();
    controlloCacheCanzoni(queue);
    if (queue[0]) {
        //cacheTheId(queue[0].id, 0);
    }
    document.body.innerHTML += "<datalist id='lstRicercaMusica'></datalist>";
    document.querySelector("#txtRicerca").setAttribute("list", "lstRicercaMusica");
    document.querySelector("#txtRicerca").onkeydown = function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("lstRicercaMusica").innerHTML += "";
                try {
                    var suggerimenti = JSON.parse(this.responseText)[1];
                    suggerimenti.forEach(e => {
                        document.getElementById("lstRicercaMusica").innerHTML += "<option value='" + e + "'>";
                    });
                } catch {}

            }
        };
        xhttp.open("POST", "getpage.php", true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send("url=" + encodeURIComponent("http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=" + this.value.replaceAll(" ", "+")));
    }
}
function preloadAudio(url) {
    var audio = new Audio();
    audio.src = url;
    audio.load();
    console.log("preload " + url);
}
function cacheTheId(id, i) {
    var url = "getYtSongUrl.php";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            preloadAudio(serverURL + JSON.parse(this.responseText).data.mp3);
            cacheSong(serverURL + JSON.parse(this.responseText).data.mp3, i);
        }
    }
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send("u=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id) + "&c=IT");
}
function controlloCacheCanzoni(q) {
    if (!('caches' in window)) return;
    for (var i = 0; i < q.length; i++) {
        if (q[i].cachedAudioURL) {
            var URL_2_CACHE = q[i].cachedAudioURL;
            caches.open(audioCacheName).then(function (cache) {
                cache.match(URL_2_CACHE).then(function (resp) {
                    if (resp == undefined) {
                        q[i].cachedAudioURL = null;
                        writeQueue(q);
                    } else {
                        //fetch(URL_2_CACHE)
                        //    .then(function (r) {
                        //        if (r.status != 200) {
                        //            caches.open(audioCacheName).then(function (cache) {
                        //                cache.delete(audioURL).then(function (response) {
                        //                    q[positionInQueue].cachedAudioURL = null;
                        //                    writeQueue(q);
                        //                    console.log("corr cache");
                        //                });
                        //            })
                        //        }

                        //    });
                    }
                });
            });
        }
    }
    return q;
}
function cacheSong(audioURL, i) {
    console.log(audioURL);
    var URL_2_CACHE = audioURL;
    queue = getQueue();
    if (!('caches' in window)) return;
    if (queue[i].cachedAudioURL) return;
    caches.open(audioCacheName).then(function (cache) {
        cache.match(URL_2_CACHE).then(function (resp) {
            if (resp == undefined) {
                fetch(new Request(URL_2_CACHE)).then(function (response) {
                    return caches.open(audioCacheName).then(function (cache) {
                        try {
                            queue = getQueue();
                            cache.put(URL_2_CACHE, response);
                            queue[i].cachedAudioURL = URL_2_CACHE;
                            writeQueue(queue);
                        } catch {}
                    });
                });
            }
        });
    });
}
function getQueue() {
    return JSON.parse(localStorage.getItem("queue"));
}
function writeQueue(q) {
    localStorage.setItem("queue", JSON.stringify(q));
}
function ricerca(query) {
    location.hash = encodeURIComponent("ricerca(\"" + query + "\");");
    //window.stop();
    if (document.getElementById("boxInfo") && document.getElementById("divVideo")) {
        divInfo = document.getElementById("boxInfo");
        divPrinc = document.getElementById("divVideo");
    }
    q = query;
    var xhttp = new XMLHttpRequest();
    divInfo.innerHTML = "Sto cercando <b>" + query + "</b>...";

    divPrinc.innerHTML = "";
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var ricerca;
            try {
                ricerca = JSON.parse(this.responseText).tracks.items;
            } catch (e) {
                //ricerca(query);
                divInfo.innerHTML = "Errore... riprova a cercare";
            }
            if (ricerca.length !== 0) {
                divInfo.innerHTML = "Trovati " + ricerca.length + " risultati per <b>" + query + "</b>";
                for (var i = 0; i < ricerca.length; i++) {
                    var title = ricerca[i].name;
                    var artist = ricerca[i].album.artists[0].name;
                    var imgUrl1 = ricerca[i].album.images[0].url;
                    var imgUrl2 = ricerca[i].album.images[1].url;
                    appendInfo(title, artist, imgUrl1, imgUrl2);
                    //divPrinc.innerHTML += "<a href='javascript:listenTo(\"" + url + "\")'>" + title + " - " + artist + "</a><br>";
                }
            } else {
                divInfo.innerHTML = "Nessun risultato! Riprova";
            }
            
            console.log(ricerca);
        }
    }
    xhttp.open("GET", "JS/get_spoti_results.php?query=" + encodeURIComponent(query), true);
    xhttp.send();
}
function queueDel(i) {
    queue = getQueue();
    queue.splice(i, 1);
    writeQueue(queue);
    viewQueue();
    alert("Rimosso!");
    if (!isOspite)
        salvaCoda();
}
function scambioCodaU(i, j) {
    queue = getQueue();
    var aus = queue[i];
    queue[i] = queue[j];
    queue[j] = aus;
    writeQueue(queue);
    caricaCodaWin();
    viewQueue();
    if (!isOspite)
        salvaCoda();
}
function rmCodaWin(i) {
    queue = getQueue();
    queue.splice(i, 1);
    writeQueue(queue);
    caricaCodaWin();
    viewQueue();
    if (!isOspite)
        salvaCoda();
}
function caricaCodaWin() {
    queue = getQueue();
    var tabCoda = winToolCoda.document.getElementById("tabCoda");
    tabCoda.innerHTML = "";
    for (var i = 0; i < queue.length; i++) {
        var d1 = "", d2 = "";
        if (i == 0) d1 = "disabled";
        else if (i == queue.length - 1) d2 = "disabled";
        tabCoda.innerHTML += `<tr>
            <td><button onclick="window.opener.scambioCodaU(${i}, ${i - 1});" ${d1}>&uarr;</button>&nbsp;<button onclick='window.opener.scambioCodaU(${i}, ${i + 1});' ${d2}>&darr;</button></td>
            <td><img src='${queue[i].img}' style='display: block; width: 10vw;'/></td>
            <td><b>${queue[i].title}</b><br>${queue[i].artist}</td>
            <td><button onclick='window.opener.skipTo(${i});window.close();'>&#9658;</button>&nbsp;<button onclick='window.opener.rmCodaWin(${i});'>X</button></td>
        </tr>`;
    }
}
function editCoda() {
    queue = getQueue();
    winToolCoda = window.open("", "_blank", 'width=' + (parseInt(window.innerWidth) * 0.5) + ',height=' + (parseInt(window.innerHeight) * 0.5) + ',toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0,left=' + (parseInt(window.innerWidth) * 0.1) + ',top=' + (parseInt(window.innerHeight) * 0.1));
    winToolCoda.document.write(`<head><title>Utility di modifica della coda - KINDERMEDIA</title><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1"></head><body></body>`);
    var utilityEditCodaCodice = `
        <a style='float: right;' align='right' href='javascript:window.close();'>[x]</a>
        <center>
            <h2>Utility modifica della coda</h2>
            <hr style='width: 50vw;'/>
            <br/>
            <table border='1' id='tabCoda'></table>
        </center>

    `;
    winToolCoda.document.body.innerHTML += utilityEditCodaCodice;
    caricaCodaWin();
}
function vq(btn) {
    queue = getQueue();
    var queueCode = "<div style='text-align: center;'><button onclick='editCoda();'>Utility di modifica coda</button><br><button onclick='skipTo(0);'>Riproduci</button> <button onclick='queue=[];localStorage.setItem(\"queue\", \"[]\");alert(\"Fatto!\");viewQueue();'>Cancella coda</button><br><button onclick='salvaCoda();'>Salva coda</button> <button onclick='scaricaCoda();'>Scarica coda</button><br><br><h3>Coda</h3><br><i>Ci sono " + queue.length + " canzoni in coda.</i><br><br>"
    queueCode += "<table style='margin: 0 auto; border: none; cell-spacing: 2vw;'>"
    for (var i = 0; i < queue.length; i++) {
        queueCode += "<tr><td><img src='" + queue[i].img + "' style='display: block; height: 5vh; border-radius: 0.5vh;'/></td><td>"
        if (queue[i].playing == true)
            queueCode += "<b>P</b>";
        queueCode += "</td><td>"
        queueCode += "<div onclick='javascript:skipTo(" + i + ");' style='text-align:left; margin-left: 10px;'><b>" + queue[i].title + "</b><br>" + queue[i].artist + "</div></td><td><button onclick='queueDel(" + i + ");'>Elimina</button></td></tr>";
    }
    queueCode += "</table></div>";
    //if (isQueueShown && btn) {
    //    divPrinc.innerHTML = codeBeforeQueue;
    //    btn.innerHTML = "Visualizza coda";
    //    isQueueShown = false;
    //}
    //else if (btn) {
    //    isQueueShown = true;
    //    codeBeforeQueue = divPrinc.innerHTML;
    //    divPrinc.innerHTML = queueCode;
    //    btn.innerHTML = "Nascondi coda";
    //}
    //else {
        divPrinc.innerHTML = queueCode;
/*    }*/
}
var isQueueShown = false, codeBeforeQueue;
function viewQueue(btn) {
    if (document.getElementById("boxInfo") && document.getElementById("divVideo")) {
        divInfo = document.getElementById("boxInfo");
        divPrinc = document.getElementById("divVideo");
    }
    codeBeforeQueue = divPrinc.innerHTML;
    vq(btn);
    if (!isOspite) {
        scaricaCoda(btn);
    }
}
function hideQueue() {
    divPrinc.innerHTML = codeBeforeQueue;
}
var codeBLyrics;
function viewLyrics() {
    if (lyrics !== null) {
        if (document.getElementById("topFrame").querySelector("img")) {
            codeBLyrics = document.getElementById("topFrame").innerHTML;
            document.getElementById("topFrame").innerHTML = "<p></p>";
            document.getElementById("topFrame").querySelector("p").innerText = lyrics;
        } else {
            document.getElementById("topFrame").innerHTML = codeBLyrics;
        }
    } else {
        alert("Testo non disponibile...");
    }

}
function hideFooter() {
    if (document.querySelector("footer").style.display !== "none")
        document.querySelector("footer").style.display = "none";
    else
        document.querySelector("footer").style.display = "block";
}
function salvaCoda() {
    var codaMod = getQueue();
    codaMod.forEach(o => {
        delete o["cachedAudioURL"];
    });
    if (isOspite) {
        alert("Devi essere loggato per poter associare la coda al tuo account!");
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // fatto
        }
    };
    xhttp.open("POST", "UTENTI/scriviCoda.php?user=" + encodeURIComponent(username), true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send("coda=" + encodeURIComponent(JSON.stringify(codaMod)));
}
function scaricaCoda(devoVis = false) {
    if (isOspite) {
        alert("Devi essere loggato per poter scaricare la coda dal server!");
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var code = JSON.parse(this.responseText);
            if (code[username]) {
                queue = getQueue();
                code[username].forEach(o => {
                    var f = queue.find(obj => {
                        return obj.id === o.id;
                    });
                    if (f && f.cachedAudioURL)
                        o.cachedAudioURL = f.cachedAudioURL;
                });
                writeQueue(code[username]);
                if (devoVis) {
                    isQueueShown = false;
                    vq(devoVis);
                }
                    
            }   
        }
    };
    xhttp.open("GET", "UTENTI/code.json", true);
    xhttp.send();
}
function playObjSong(objSong, idVid, title, artist, sIndex, img, positionInQueue) {
    var divInfoP = document.getElementById("infoRadio");
    var audioURL = objSong.dlFile || objSong.live || objSong.force;
    queue = getQueue();
    if (queue[positionInQueue].cachedAudioURL)
        audioURL = queue[positionInQueue].cachedAudioURL;
    if (objSong.lyrics)
        lyrics = objSong.lyrics;
    else
        lyrics = null;
    divInfoP.innerHTML = "Buffering in corso...";
    var testoPl = "<b>" + title + "</b> <a href='" + audioURL + "' download target='blank'>SCARICA</a><br><i>" + artist + "</i>";
    /*document.querySelector("#playerCont").style.display = "block";*/
    try {
        document.querySelector("#title").innerHTML = "Scarico " + objSong.filesize.toUpperCase() + "...";
        document.querySelector("#artist").innerHTML = "Attendi mentre recupero '" + title + "'";
    } catch (e) { }
    //fetch(audioURL)
        //.then(response => response.blob())
        //.then(blob => {
    //const audioBlob = window.URL.createObjectURL(blob);
            if (typeof audio == "object") {
                audio.pause();
                //audio.src = "";
            }
            audio = {};
            audio = new Audio();
            audio.autoplay = true;
            audio.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
            audio.src = audioURL;
            queue = getQueue();
            var nextPos = positionInQueue + 1;
            if (nextPos == queue.length)
                nextPos = 0;
            var prevPos = positionInQueue - 1;
            if (prevPos == -1)
                prevPos = queue.length - 1;
            console.log(prevPos, nextPos);
            audio.addEventListener("loadedmetadata", function () {
                /*document.querySelector("#playerCont").style.display = "block";*/
                document.getElementById("iconaPlayPausa").src = "IMG/icona_play.png";
                document.getElementById("iconaPlayPausaCita").src = "IMG/icona_play.png";
                document.getElementById("title").innerHTML = title;
                document.getElementById("artist").innerHTML = artist;
                document.getElementById("topFrame").innerHTML = "<img src='" + img + "' alt='Album cover'/>";
                document.getElementById("duration").max = audio.duration;
                document.getElementById("totalDuration").innerHTML = "-" + formattaDurata(Math.floor(audio.duration));
                document.getElementById("iconaIndietro").onclick = function () {
                    audio.pause();
                    skipTo(prevPos);
                }
                document.getElementById("iconaIndietroCita").onclick = function () {
                    audio.pause();
                    skipTo(prevPos);
                }
                document.getElementById("iconaAvanti").onclick = function () {
                    audio.pause();
                    skipTo(nextPos);
                }
                document.getElementById("iconaAvantiCita").onclick = function () {
                    audio.pause();
                    skipTo(nextPos);
                }
            });
    audio.onplay = function () {
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: title,
                        artist: artist,
                        album: "KinderMedia",
                        artwork: [{
                            src: img
                        }]
                    });
                }

                document.getElementById("iconaPlayPausa").src = "IMG/icona_pausa.png";
                document.getElementById("iconaPlayPausaCita").src = "IMG/icona_pausa.png";
                document.getElementById("title").innerHTML = title;
                document.getElementById("artist").innerHTML = artist;
                document.getElementById("topFrame").innerHTML = "<img src='" + img + "' alt='Album cover'/>";
                document.getElementById("duration").max = audio.duration;
    }
        if (!document.hidden)
            audio.addEventListener("timeupdate", temp_timeupdate);
            document.getElementById("duration").onchange = function () {
                audio.currentTime = this.value;
            }
            audio.onpause = function () {
                localStorage.setItem("ct", 0);
                document.getElementById("iconaPlayPausa").src = "IMG/icona_play.png";
                document.getElementById("iconaPlayPausaCita").src = "IMG/icona_play.png";
            }
            navigator.mediaSession.setActionHandler('play', () => {
                audio.play();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                audio.pause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                queue = getQueue();
                queue[positionInQueue].playing = false;
                writeQueue(queue);
                audio.pause();
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "Carico...",
                });
                skipTo(prevPos);
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                queue = getQueue();
                queue[positionInQueue].playing = false;
                writeQueue(queue);
                audio.pause();
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: "Caricamento in corso...",
                });
                skipTo(nextPos);
            });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                audio.currentTime = details.seekTime;
            });
            audio.addEventListener("error", function () {
                document.querySelector("#title").innerHTML = "Errore elaborazione flusso :-(";
                document.querySelector("#artist").innerHTML = "Provo a passare alla traccia successiva...";
                divInfoP.innerHTML = ":-(";
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: "Errore elaborazione flusso audio",
                        artist: "Provo a passare alla traccia successiva"
                    });
                }
                //caches.open(audioCacheName).then(function (cache) {
                //    cache.delete(audioURL).then(function (response) {
                //        queue = getQueue();
                //        queue[positionInQueue].cachedAudioURL = null;
                //        writeQueue(queue);
                //                              //listenTo(idVid, title, artist, sIndex, img, positionInQueue);
                //    });
                //})
                //listenTo(idVid, title, artist, sIndex, img, positionInQueue);
            });
            audio.addEventListener("play", function () {
                currentQueueIndex = positionInQueue;
                try {
                    queue = getQueue();
                    queue[positionInQueue].playing = true;
                    writeQueue(queue);
                } catch { }
                divInfoP.innerHTML = testoPl;
                var playerBg = document.getElementById("bgImgPlayer")
                playerBg.style.backgroundImage = "url('" + img + "')";
            });
            audio.addEventListener("pause", function () {
                queue = getQueue();
                queue[positionInQueue].playing = false;
                divInfoP.innerHTML = testoPl;
                writeQueue(queue);
            });
            audio.addEventListener("ended", function () {
               queue = getQueue();
               queue[positionInQueue].playing = false;
               audio.pause();
               writeQueue(queue);
               skipTo(nextPos);
            });
        /*})
        .catch(function () {
            if (contaErr < 3) {
                listenTo(idVid, title, artist, sIndex, img, positionInQueue);
                contaErr++;
            }
            else {
                document.querySelector("#title").innerHTML = "Errore fetch audio :-(";
                document.querySelector("#artist").innerHTML = "Provo a passare alla traccia successiva...";
                divInfoP.innerHTML = ":-(";
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: "Errore caricamento audio",
                        artist: "Provo a passare alla traccia successiva"
                    });
                }
                
                skipTo(positionInQueue + 1);
            }

        });*/
    if (img) {
        document.getElementById("tdImgAlbum").innerHTML = "<img src='" + img + "' id='playerAlbum'/>";
    }
}
function listenTo(idVid, title, artist, sIndex = 0, img, positionInQueue = 0) {
    document.getElementById("topFrame").innerHTML = "";
    document.getElementById("bgImgPlayer").style.backgroundImage = "none";
    if (audio) {
        audio.pause();
    }
    var divInfoP = document.getElementById("infoRadio");
    if (sIndex !== 0) {
        divInfoP = "Errore nel caricamento audio... Riprovo...";
    }
    location.hash = encodeURIComponent(`listenTo(${idVid}, "${title}", "${artist}", 0, "${img}", ${positionInQueue});`);
    if (!queue[positionInQueue].cachedAudioURL) {
        divInfoP.innerHTML = "Recupero sorgenti per <b>" + title.toUpperCase() + "</b>...";

        var url = "getYtSongUrl.php";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var audioURL = serverURL + JSON.parse(this.responseText).data.mp3;
                playObjSong({
                    lyrics: "N/A...",
                    filezize: "/",
                    force: audioURL,
                }, idVid, title, artist, sIndex, img, positionInQueue);
            }
        }
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send("u=" + encodeURIComponent("https://www.youtube.com/watch?v=" + idVid) + "&c=IT");
    }
    else {
        playObjSong({
            lyrics: "N/A for cached songs...",
            filezize: "/",
            force: queue[positionInQueue].cachedAudioURL
        }, idVid, title, artist, sIndex, img, positionInQueue);
    }
    //if (queue[positionInQueue + 1]) {
    //    cacheTheId(queue[positionInQueue + 1].id, positionInQueue + 1);
    //}
}
function skipTo(position) {
    console.log("skippo a " + position);
    queue = getQueue();
    if (queue[position] !== undefined) {
        var track = queue[position];
        console.log("Skippo a " + track.title);
        listenTo(track.id, track.title, track.artist, 0, track.img, position);
    } else {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: "La traccia non esiste",
                artist: "Potrebbe essere finita la coda o la playlist."
            });
            document.querySelector("#title").innerHTML = "Traccia inesistente";
            document.querySelector("#artist").innerHTML = "La coda o la playlist potrebbero essere finite.";
        }
    }
}
function listenOptions(ytId, title, artist, s_index, img) {
    location.hash = encodeURIComponent(`listenOptions("${ytId}", "${title}", "${artist}", ${s_index}, "${img}");`);
    divInfo.innerHTML = "<a href='javascript:ricerca(\"" + q + "\");'>TORNA ALLA RICERCA</a>";
    if (title.indexOf("("))
        title = title.split("(")[0];
    else if (title.indexOf("-"))
        title = title.split("-")[0];
    title = title.trim();
    var queryRicerca = title.toLowerCase();
    if (artist)
        queryRicerca += " " + artist.toLowerCase();
    queryRicerca = queryRicerca.replace(/[^a-zA-Z0-9 ]/g, '');
    divPrinc.innerHTML = "Caricamento in corso...";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var risultati = JSON.parse(this.responseText).result;
            if (!risultati.length)
                listenOptions(ytId, title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ''), null, s_index, img);
            var ctab = "<table border='0'>";
            for (var i = 0; i < risultati.length; i++) {
                ctab += `<tr><td style="width: 10%;"><img src="${img}" style="width: 100%; margin-bottom:2vh; border-radius: 3px;"/></td><td>${risultati[i].title}</td><td><a href="javascript:listenTo('${risultati[i].id}', '${title}', '${artist}', 0, '${img}');">Riproduci</a><br><a href="javascript:accoda('${risultati[i].id}', '${title}', '${artist}', 0, '${img}');">Accoda</a></td></tr>`;
            }
            ctab += "</table>";
            divPrinc.innerHTML = ctab;
        }
    };
    xhttp.open("POST", "getYtResults.php", true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send("key_word=" + encodeURIComponent(queryRicerca));
}
function accoda(ytId, title, artist, s_index, img) {
    queue = getQueue();
    queue.push({
        id: ytId,
        title: title,
        artist: artist,
        img: img
    });
    writeQueue(queue);
    //cacheTheId(ytId, queue.length - 1);
    alert("Aggiunto in coda - " + title);
    if (!isOspite)
        salvaCoda();
}
function accodaYT(url, title, artist) {
    var regexp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    var id = url.match(regexp)[1];
    document.getElementById("dialogAccodaYT").close();
    accoda(id, title, artist, null, "");

}
function appendInfo(title, artist, imgSrc, imgVis) {
    var titleR = title.replaceAll("\"", "").replaceAll("'", "");
    var artistR = artist.replaceAll("\"", "").replaceAll("'", "");
    strCont = "<a href='javascript:listenOptions(null, \"" + titleR + "\", \"" + artistR + "\", 0, \"" + imgSrc + "\")' class='elencoCanzoni'><img src='" + imgVis + "' alt='COPERTINA ALBUM'/>";
    strCont += "<div><b>" + title + "</b><br><i>" + artist + "</i></div></a>";
    strCont += "</a>";
    divPrinc.innerHTML += strCont;
}