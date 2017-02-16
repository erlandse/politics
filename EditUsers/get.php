<?php
header("Content-type: text/plain;charset=UTF-8");
$resturl = $_POST['resturl'];
$url ='http://129.240.118.141:5432/pol2/users/'.$resturl;

echo(loadURL($url));

function loadURL($urlToFetch){

	        $ch = curl_init($urlToFetch);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;

}

?>