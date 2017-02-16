<?php
header("Content-type: text/plain;charset=UTF-8");
$data = $_POST['elasticdata'];
$resturl = $_POST['resturl'];
$url ='http://129.240.118.141:5432/pol2/users/'.$resturl;

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