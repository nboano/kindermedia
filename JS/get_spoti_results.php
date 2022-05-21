<?php
    $client_id = '9386e50f61074cc788d55fc174e938b3'; 
    $client_secret = 'e11ce0e42e0c45d7b72a9b57147dc625'; 

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,            'https://accounts.spotify.com/api/token' );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
    curl_setopt($ch, CURLOPT_POST,           1 );
    curl_setopt($ch, CURLOPT_POSTFIELDS,     'grant_type=client_credentials' ); 
    curl_setopt($ch, CURLOPT_HTTPHEADER,     array('Authorization: Basic '.base64_encode($client_id.':'.$client_secret))); 
    $result=curl_exec($ch); 
    $result = json_decode($result, true);
    curl_close($ch); 
    $token = $result["access_token"];
    /*
    $options = array('http' => array(
        'method'  => 'GET',
        'header' => 'Authorization: Bearer '. $token
    ));
    $res = file_get_contents("https://api.spotify.com/v1/search?q=" . str_replace(" ", "%20", $_GET["query"]) . "&type=track", false, $options);
    echo $res; */
    $curl = curl_init();
        curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.spotify.com/v1/search?q=" . str_replace(" ", "%20", $_GET["query"]) . "&type=track",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
        "Content-Type: application/json",
        "Authorization: Bearer ".$token,
        ),
    ));
    $track_info = curl_exec($curl);
    echo $track_info;
    curl_close($curl);
?>