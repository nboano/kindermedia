const BASEURL = "streamingcommunity.top";
const hostInfo = "scws.xyz";

async function ricercaVid(query) {
	var start = new Date();
	var params = 'http://' + BASEURL + "/search?q\=" + query;
	var strToAdd = "<div class=\"allineamento\"><div style='clear: both; text-align: center;'><h3>Film / Serie</h3></div>";
	if (query == ".homepage") {
		params = "http://" + BASEURL;
	}
	function s(o) {
		var a = "<h2 align='center' style='clear:both;'>Stai guardando</h2>";
		if (!o.length)
			a += "<b>Nulla! Inizia a guardare ora!</b>";
		for (const [key, value] of Object.entries(o)) {
			if (o[key + "i"]) {
				var d = o[key + "i"];
				var titoloVis = "<b>" + d.title + "</b><br>";
				if (d.stagione && d.episodio)
					titoloVis += "<br/><i>" + d.nomeProg + "</i><br/><small>" + d.stagione + "x" + d.episodio + "</small>";
				titoloVis += "<a href='javascript:rimuoviGuardato(" + key + ");' title='Rimuovi dalla lista dei guardati.'>RIMUOVI</a>";
				a += "<div class='contImmagine' onclick='viewVideo(" + d.id + ", \"" + d.ep + "\");'><a class='linkTitoli' href='javascript:viewVideo(" + d.id + ", \"" + d.ep + "\");'><img class='imgTitoli' src='" + d.img + "'/></a><div class='divTitoloTitolo'>" + titoloVis + "</div></div>";
			}
		}
		return a;
	}
	let txtRisposta = await cors_file_get_contents(params);
	var nomiSez = [];
	var doc = new DOMParser().parseFromString(txtRisposta, "text/html");
	var search = [];
	if (query !== ".homepage")
		search = JSON.parse(doc.getElementsByTagName("the-search-page")[0].getAttribute("records-json"));
	else {
		var elemCerca = doc.getElementsByTagName("slider-title");
		var indiceSearch = 0;
		for (var i = 0; i < elemCerca.length; i++) {
			var arrHomeSingolo = JSON.parse(elemCerca[i].getAttribute("titles-json"));
			nomiSez[indiceSearch] = elemCerca[i].getAttribute("slider-name");
			for (var j = 0; j < arrHomeSingolo.length; j++) {
				search[indiceSearch] = arrHomeSingolo[j];
				indiceSearch++;
			}
		}
		console.log(nomiSez);
	}
	console.log(search);
	eval(doc.getElementsByTagName("script")[doc.getElementsByTagName("script").length - 1].innerText);
	if (search.length) {
		//document.getElementById("boxInfo").innerHTML = "<b>" + query.toUpperCase() + "</b>: " + search.length + " risultati.";
		for (var i = 0; i < search.length; i++) {
			if (nomiSez[i])
				strToAdd += "<div style='clear: both; text-align: center;'><h2>" + nomiSez[i] + "</h2></div>";
			var aImg = search[i].images.filter((function (e) {
				return e.type === "poster";
			}))[0];
			var srvId = aImg.server_id, proxyId = aImg.proxy_id, filename = aImg.url;
			var proxyIp = window.servers.filter((function (e) {
				return e.id === proxyId;
			}
			))[0].ip;
			var srvNumber = window.servers.filter((function (e) {
				return e.id === srvId;
			}
			))[0].number;
			var imgSrc = "https://" + proxyIp + "/images/" + srvNumber + "/" + filename;
			strToAdd += "<a class='contImmagine' href=\"#vid-inf-" + search[i]["id"] + "-" + search[i]["slug"] + "\"><img src='" + imgSrc + "' alt='" + search[i]["slug"] + "'/><div class='divTitoloTitolo'>" + search[i]["slug"].replace(/-/g, " ").toUpperCase() + "</div></a>";
			//img[search[i]["id"]] = imgSrc;
			queryRicerca = query;
		}
	}
	else {
		//document.getElementById("boxInfo").innerHTML = "La ricerca di <b>" + query + "</b> non ha restituito risultati! Prova con un'altra ricerca.";
	}
	var end = new Date();
	var diff = end - start;
	diff /= 1000;
	strToAdd += await ricercaAnime(query);
	strToAdd += "</div>";
	return strToAdd;
	//document.getElementById("boxInfo").innerHTML += "<br>(" + diff + " s)";
}
async function infoTitoloAnime(id, slug) {
	let str = `<h2>${slug.replaceAll("-", " ").toUpperCase()}</h2><br><a href='javascript:void(0)' onclick='navigator.share({title: "Guarda ${slug.replaceAll("-", " ").toUpperCase()}", text: "Guarda questo e altri titoli su kindermedia.tk", url: location.href});'>Condividi questo titolo!</a><br><ul>`;
	var url = "https://www.animeunity.tv/anime/" + id + slug;
	var doc = new DOMParser().parseFromString(await cors_file_get_contents(url), "text/html");
	var datiVideo = JSON.parse(doc.querySelector("video-player").getAttribute("episodes"));
	for (let e of datiVideo)
		str += `<li><a href='javascript:op("videoplayer.html?anime-id=${id}&anime-ep=${e.id}");'>Episodio ${e.number}</a></li>`;
	console.log(datiVideo);
	str += "</ul>";
	return str;
}
async function ricercaAnime(query) {
	let url = "https://www.animeunity.tv";
	if (query != ".homepage")
		url += "/archivio?title=" + encodeURIComponent(query);
	let strRitorno = "<div style='clear: both; text-align: center;'><h3>Anime</h3></div>";
	let d = new DOMParser().parseFromString(await cors_file_get_contents(url), "text/html");
	let search = JSON.parse((query == ".homepage") ? d.querySelector("the-carousel").getAttribute("animes"): d.querySelector("archivio").getAttribute("records"));
	for (let i = 0; i < search.length; i++) {
		strRitorno += "<a class='contImmagine' href=\"#vid-inf-anime-" + search[i]["id"] + "-" + search[i]["slug"] + "\"><img src='" + search[i]["imageurl"] + "' alt='" + search[i]["slug"] + "'/><div class='divTitoloTitolo'>" + search[i]["slug"].replace(/-/g, " ").toUpperCase() + "</div></a>";
	}
	console.log(search);
	return strRitorno;
}
async function infoTitolo(id, slug) {
	var params = 'http://' + BASEURL + "/titles/" + id + "-" + slug;
	var t = await cors_file_get_contents(params);
	var doc = new DOMParser().parseFromString(t, "text/html");
	var title = {};
	title.title = doc.querySelector(".title,.d-inline-block").innerText;
	title.desc = doc.querySelector(".plot").innerText;
	if (doc.getElementsByTagName("season-select")[0]) {
		// � una SERIE TV
		title.seasons = JSON.parse(doc.getElementsByTagName("season-select")[0].getAttribute("seasons"));
	}
	var html = `<a href='javascript:void(0)' onclick='navigator.share({title: "Guarda ${slug.replaceAll("-", " ").toUpperCase()}", text: "Guarda questo e altri titoli su kindermedia.tk", url: location.href});'>Condividi ${slug.replaceAll("-", " ").toUpperCase()}!</a><br>` + "<div class='dettaglio b'><h1>" + title.title + "</h1><p>" + title.desc + "</p><br><br>";
	console.log(title);
	if (title.seasons) {
		for (var i = 0; i < title.seasons.length; i++) {
			var stagione = title.seasons[i];
			html += "<h2 align='center'>Stagione " + stagione.number + "</h2><br><br><div class='divc'>";
			for (var j = 0; j < stagione.episodes.length; j++) {
				var url_ep = "videoplayer.html?id=" + stagione["title_id"] + "&ep=" + stagione.episodes[j].id;
				html += "<div class='elencoStagioni' style='max-width: 85vw;' onclick='op(\"" + url_ep + "\")'><a href='javascript:void(0);' style='display: block; float: left; margin-right: 50px;'><img style='display:block; width: 300px;' src='" + stagione.episodes[j].images[0].original_url + "'/></a><div class='infoEpisodio'><b style='font-size: 200%;'>" + stagione.episodes[j].name + "</b><br><i>" + title.title + " - " + stagione.number + "." + stagione.episodes[j].number + "</i>" + "</div><div style='text-align: justify;'>" + stagione.episodes[j].plot + "</div></div><div style='clear: both;'></div><br><br>";
			}
			html += "</div><br><br>";
		}
	} else {
		var url_ep = "videoplayer.html?id=" + id;
		html += "<a href='javascript:op(\"" + url_ep + "\");'>Guarda Ora!</a><br><br>"
	}
	html += "</div>";
	console.log(title);
	return html;
}