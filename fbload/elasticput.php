<?php
header("Content-type: text/plain;charset=UTF-8");
include "../url_link.php";
$data = $_POST['elasticdata'];
$id = $_POST['id'];
$url =$put_url.$id;

echo(loadURL($url,$data));

function loadURL($urlToFetch,$data_json){
   $ch = curl_init();
   curl_setopt($ch, CURLOPT_URL, $urlToFetch);
   curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
   curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
   curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $output  = curl_exec($ch);
   curl_close($ch);
   return $output;
}

?>