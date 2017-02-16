<?php
header("Content-type: text/plain;charset=UTF-8");
$id="";
$action="";
$searchString = $_SERVER["QUERY_STRING"];
//$query = "http://musit-prod02.uio.no:8080/khm/etno/select/?". $searchString;
//$query = "http://www.musit.uio.no/wss/khm/etno/select/?". $searchString;

$query = "http://ft-prod01.uio.no:8080/solr/facebook/select/?". $searchString;

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