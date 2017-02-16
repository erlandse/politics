<?php
header("Content-type: text/plain;charset=UTF-8");
include "../url_link.php";
$id="";
$action="";

$query = $get_url. $_GET['id'];

$content = loadURL($query);
echo ($content);

function loadURL($urlToFetch){

	        $ch = curl_init($urlToFetch);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;

	}

?>