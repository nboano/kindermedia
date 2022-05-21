const cors_api_url = 'https://www.mb-srv.tk/cors-anywhere/';
async function file_get_contents(url, m = "GET", p = {}) {
    let r = await fetch(url, {
        method: m,
        headers: p,
    });
    return r.text();
}
async function cors_file_get_contents(url, method = "GET", data = {}) {
    url = url.replace("http://", "");
    url = url.replace("https://", "");
    let t = await file_get_contents(cors_api_url + url, method, data);
    return t;
}

const op = (url) => {
    return window.open(url, "_blank", 'width=' + (parseInt(window.innerWidth) * 0.5) + ',height=' + (parseInt(window.innerHeight) * 0.5) + ',toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0,left=' + (parseInt(window.innerWidth) * 0.1) + ',top=' + (parseInt(window.innerHeight) * 0.1));
}