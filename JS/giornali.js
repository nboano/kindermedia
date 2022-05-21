const GIORN_URL = 'https://mb-srv.loca.lt/arch-giornali/';

async function richiediGiornali(data) {
    let strRet = "<giornali>";
    let r;
    try {
        r = await file_get_contents(GIORN_URL + data + "?" + Date.now());
    } catch (e) { }
    if (r.indexOf("404") == -1) {
        let aUrl = r.split("\n");
        let nrgiorno = data.substr(6, 2);
        strRet += "<ul>"
        for (let url of aUrl)
            strRet += `<li><a href='${url}' target='blank'>${decodeURIComponent(url.split("/").at(-1)).split(nrgiorno)[0]}</a></li>`;
    } else {
        strRet += "Non ho trovato giornali per la data corrispondente.";
    }
    strRet += "</giornali>";
    return strRet;
}
