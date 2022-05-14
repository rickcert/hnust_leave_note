<?php
header("Access-Control-Allow-Origin:*");//解决跨域请求问题
header('Access-Control-Allow-Methods:POST');
header('Access-Control-Allow-Headers:x-requested-with, content-type');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");

$fp=fopen("class.html","r");
$text=fread($fp,filesize("class.html"));
$user1name=$_GET['u1n']?$_GET['u1n']:"李心艾";
$user1time=$_GET['u1t']?$_GET['u1t']:"2022-05-13 09:49:01";
$user1data=$_GET['u1d']?$_GET['u1d']:"2022-05-13 09:50~2022-05-13 20:47";
$user1type=$_GET['u1ty']?$_GET['u1ty']:"病假";
$user1shichang=$_GET['u1s']?$_GET['u1s']:"0.5天";
$user2name=$_GET['u2n']?$_GET['u2n']:"何润东";
$user2time=$_GET['u2t']?$_GET['u2t']:"2022-05-12 03:36:29";
$user2data=$_GET['u2d']?$_GET['u2d']:"2022-05-12 08:00~2022-05-12 12:00";
$user2type=$_GET['u2ty']?$_GET['u2ty']:"事假";
$user2shichang=$_GET['u2s']?$_GET['u2s']:"0.5天";
$user3name=$_GET['u3n']?$_GET['u3n']:"黄如旭";
$user3time=$_GET['u3t']?$_GET['u3t']:"2022-05-06 22:25:32";
$user3data=$_GET['u3d']?$_GET['u3d']:"2022-05-07 12:00~2022-05-07 17:30";
$user3type=$_GET['u3ty']?$_GET['u3ty']:"病假";
$user3shichang=$_GET['u1s']?$_GET['u1s']:"0.5天";
$text = str_replace ("{replace_user1_name}",$user1name,$text);
$text = str_replace ("{replace_user1_time}",$user1time,$text);
$text = str_replace ("{replace_user1_data}",$user1data,$text);
$text = str_replace ("{replace_user1_type}",$user1type,$text);
$text = str_replace ("{replace_user1_shichang}",$user1shichang,$text);
$text = str_replace ("{replace_user2_name}",$user2name,$text);
$text = str_replace ("{replace_user2_time}",$user2time,$text);
$text = str_replace ("{replace_user2_data}",$user2data,$text);
$text = str_replace ("{replace_user2_type}",$user2type,$text);
$text = str_replace ("{replace_user2_shichang}",$user2shichang,$text);
$text = str_replace ("{replace_user3_name}",$user3name,$text);
$text = str_replace ("{replace_user3_time}",$user3time,$text);
$text = str_replace ("{replace_user3_data}",$user3data,$text);
$text = str_replace ("{replace_user3_type}",$user3type,$text);
$text = str_replace ("{replace_user3_shichang}",$user3shichang,$text);


fclose($fp);
$root1="./html/";
$path = $root1.$user1name."class.html";

//新建空白文件，将$str写入
$handle=fopen($path,"w");
fwrite($handle,$text);
fclose($handle);
header("Location:$path", TRUE, 302);
exit();
?>