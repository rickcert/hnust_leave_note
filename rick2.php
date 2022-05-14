<?php
header("Access-Control-Allow-Origin:*");//解决跨域请求问题
header('Access-Control-Allow-Methods:POST');
header('Access-Control-Allow-Headers:x-requested-with, content-type');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
$user1name=$_GET['u1n'];
$fp=fopen("me.html","r");
$text=fread($fp,filesize("me.html"));
$user1time=$_GET['u1t']?$_GET['u1t']:"2022-05-13 09:49:01";
$user1data=$_GET['u1d']?$_GET['u1d']:"2022-05-13 09:50~2022-05-13 20:47";
$user1type=$_GET['u1ty']?$_GET['u1ty']:"病假";
$user1shichang=$_GET['u1s']?$_GET['u1s']:"0.5天";
$user2time=$_GET['u2t']?$_GET['u2t']:"2022-05-12 03:36:29";
$user2data=$_GET['u2d']?$_GET['u2d']:"2022-05-12 08:00~2022-05-12 12:00";
$user2type=$_GET['u2ty']?$_GET['u2ty']:"事假";
$user2shichang=$_GET['u2s']?$_GET['u2s']:"0.5天";
$text = str_replace ("{replace_user1_time}",$user1time,$text);
$text = str_replace ("{replace_user1_data}",$user1data,$text);
$text = str_replace ("{replace_user1_type}",$user1type,$text);
$text = str_replace ("{replace_user1_shichang}",$user1shichang,$text);
$text = str_replace ("{replace_user2_time}",$user2time,$text);
$text = str_replace ("{replace_user2_data}",$user2data,$text);
$text = str_replace ("{replace_user2_type}",$user2type,$text);
$text = str_replace ("{replace_user2_shichang}",$user2shichang,$text);



fclose($fp);
$root1="./html/";
$path = $root1.$user1name."me.html";
//新建空白文件，将$str写入
$handle=fopen($path,"w");
fwrite($handle,$text);
fclose($handle);
header("Location:$path", TRUE, 302);
exit();
?>