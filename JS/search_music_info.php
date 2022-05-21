<?php
	header('Content-type: text/json');
	$query = str_replace(" ", "%20", $_GET["query"]);
    $apikey = "b33ca8dee7bb1d05a76ad164731c4d9f";
    $url = 'https://ws.audioscrobbler.com/2.0/?method=track.search&api_key='. $apikey .'&track='. $query .'&format=json';
	echo file_get_contents($url);
?>