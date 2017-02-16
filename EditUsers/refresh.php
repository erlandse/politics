<?php
header("Content-type: text/plain;charset=UTF-8");
$data = $_POST['elasticdata'];
$url ='http://129.240.118.141:5432/polkom/_refresh';

echo(loadURL($url,"{}"));

function loadURL($urlToFetch,$data_json){
   $ch = curl_init();
   curl_setopt($ch, CURLOPT_URL, $urlToFetch);
   curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Content-Length: ' . strlen($data_json)));
   curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
   curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $output  = curl_exec($ch);
   curl_close($ch);
   return $output;
}

?>