<?php
header("Access-Control-Allow-Origin:*");//解决跨域请求问题
header('Access-Control-Allow-Methods:POST');
header('Access-Control-Allow-Headers:x-requested-with, content-type');
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Pragma: no-cache");
$postData = file_get_contents("php://input");

// 将JSON数据解码为PHP数组或对象
$data = json_decode($postData, true);

function generateUUID() {
    return sprintf('%04x%04x%04x%04x%04x%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
$studentNumber=$data['studentNumber']?$data['studentNumber']:"2005010607";
$isLeavingSchool=$data['isLeavingSchool']?$data['isLeavingSchool']:"是";
$isLeavingLocation=$data['isLeavingLocation']?$data['isLeavingLocation']:"否";
$academicYear=$data['academicYear']?$data['academicYear']:"2023-2024学年";
$term=$data['term']?$data['term']:"第一学期";
$leaveType=$data['leaveType']?$data['leaveType']:"病假";
$leaveNature=$data['leaveNature']?$data['leaveNature']:"因私请假";
$startDate=$data['startDate']?$data['startDate']:"2023-11-15 10:13";
$endDate=$data['endDate']?$data['endDate']:"2023-11-15 19:13";
$leaveDays=$data['leaveDays']?$data['leaveDays']:"1";
$leaveReason=$data['leaveReason']?$data['leaveReason']:"感冒发烧输液";
$proofMaterial=$data['proofMaterial']?$data['proofMaterial']:"7703ed9243999a8174edc82746c5b2a7.jpg";
$proofMaterial2=generateUUID();
$phoneNumber=$data['phoneNumber']?$data['phoneNumber']:"18396367766";
$submitTime=$data['submitTime']?$data['submitTime']:"2023-11-15";
$approvalTime=$data['approvalTime']?$data['approvalTime']:"2023-11-15 15:50:41";
$approverName=$data['approverName']?$data['approverName']:"陈嘉靓";

$fp=fopen("./new.html","r");
$text=fread($fp,filesize("new.html"));


// $text = str_replace("{applicationNumber}", $applicationNumber, $text);
$text = str_replace("{studentNumber}", $studentNumber, $text);
$text = str_replace("{isLeavingSchool}", $isLeavingSchool, $text);
$text = str_replace("{isLeavingLocation}", $isLeavingLocation, $text);
$text = str_replace("{academicYear}", $academicYear, $text);
$text = str_replace("{term}", $term, $text);
$text = str_replace("{leaveType}", $leaveType, $text);
$text = str_replace("{leaveNature}", $leaveNature, $text);
$text = str_replace("{startDate}", $startDate, $text);
$text = str_replace("{endDate}", $endDate, $text);
$text = str_replace("{leaveDays}", $leaveDays, $text);
// $text = str_replace("{sourceType}", $sourceType, $text);
$text = str_replace("{leaveReason}", $leaveReason, $text);
$text = str_replace("{proofMaterial}", $proofMaterial, $text);
$text = str_replace("{proofMaterial2}", $proofMaterial2, $text);
$text = str_replace("{phoneNumber}", $phoneNumber, $text);
$text = str_replace("{submitTime}", $submitTime, $text);
$text = str_replace("{approvalTime}", $approvalTime, $text);
$text = str_replace("{approverName}", $approverName, $text);



fclose($fp);
$root1="html/";
$monthDay = date('md');
$path = $root1.$studentNumber.$monthDay."me.html";
//新建空白文件，将$str写入
$handle=fopen($path,"w");

fwrite($handle,$text);
fclose($handle);
echo "https://hnust.rick.icu/new/newapi/".$path;
exit();
?>
