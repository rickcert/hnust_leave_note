<template>
  <!-- 弹出层 -->
  <van-popup v-model:show="data.isPicker" position="bottom" round @close="confirmOn">
    <van-picker ref="picker" title="请选择时间" :columns="data.columns" @change="onChange" @cancel="cancelOn"
                @confirm="onConfirm" v-model="data.selectedValues"/>
  </van-popup>
</template>
<script setup>

import {reactive, watch, getCurrentInstance} from "vue";

const customFieldName = {
  text: "value",
  value: "values",
  children: ""
};
const data = reactive({
  isPicker: false, //是否显示弹出层
  columns: [], //所有时间列
  selectedValues: [] //控件选择的时间值
});

const props = defineProps({
  // 传入的显影状态
  showPicker: {
    type: Boolean
  },
  // 传入的值
  values: {
    type: String
  }
});

//定义要向父组件传递的事件
const emit = defineEmits(["changeValue", "confirm"]);


watch(
    () => props.showPicker,
    val => {
      data.isPicker = val;
      data.columns = [];
      getcolumns();
    },
    {
      immediate: true//立即监听--进入就会执行一次 监听显影状态
    }
);


function onChange() {
  // 无用的方法
}


function getcolumns() {
  let strtime = props.values; //传入的时间
  //console.log(strtime); 2023-09-05 19:28:00
  let date = new Date(strtime.replace(/-/g, "/"));
  // console.log(date); Wed Aug 09 2023 14:53:15 GMT+0800 (中国标准时间)
  let timeVaules = date.getTime();

  let dateVaules;
  if (props.values != "") {
    dateVaules = new Date(timeVaules);
  } else {
    dateVaules = new Date(); //没有传入时间则默认当前时刻
  }

  let Y = dateVaules.getFullYear();
  let M = dateVaules.getMonth();
  let D = dateVaules.getDate();
  let h = dateVaules.getHours();
  let m = dateVaules.getMinutes();
  let s = dateVaules.getSeconds();

  let year = []; //获取前后十年数组
  year.values = [];
  let Currentday = new Date().getFullYear();
  for (let i = Currentday - 10; i < Currentday + 10; i++) {
    year.push({text: i.toString(), value: i});
  }
  year.defaultIndex = year.values.indexOf(Y); //设置默认选项当前年

  // 个位数补0
  const _M = M+1 < 10 ? `0${M + 1}` : (M+1).toString(); //月份比实际获取的少1，所以要加1
  console.log(_M)
  const _D = D < 10 ? `0${D}` : D.toString();
  const _h = h < 10 ? `0${h}` : h.toString();
  const _m = m < 10 ? `0${m}` : m.toString();
  const _s = s < 10 ? `0${s}` : s.toString();

  // 生成年月日时分秒时间值
  data.selectedValues.push(Y);
  data.selectedValues.push(_M);
  data.selectedValues.push(_D);
  data.selectedValues.push(_h);
  data.selectedValues.push(_m);
  data.selectedValues.push(_s);

  data.columns.push(year); //生成年列

  let month = []; //获取12月数组
  month = Object.keys(Array.apply(null, {length: 13})).map(function (item) {
    if (+item + 1 <= 10) {
      return {text: "0" + item, value: "0" + item};
    } else if (+item + 1 == 11) {
      return {text: (+item).toString(), value: (+item).toString()};
    } else {
      return {
        text: (+item + 0).toString(),
        value: (+item + 0).toString()
      };
    }
  });
  month.splice(0, 1);
  data.columns.push(month); //生成月列

  //获取当月的天数
  let days = getCountDays(Y, M + 1);
  let day = []; //创建当月天数数组
  day = Object.keys(Array.apply(null, {length: days + 1})).map(function (
      item
  ) {
    if (+item + 1 <= 10) {
      return {text: "0" + item, value: "0" + item};
    } else if (+item + 1 == 11) {
      return {text: +item, value: +item};
    } else {
      return {
        text: (+item + 0).toString(),
        value: (+item + 0).toString()
      };
    }
  });
  day.splice(0, 1);
  data.columns.push(day); //生成日列

  let hour = []; //创建小时数组
  hour = Object.keys(Array.apply(null, {length: 24})).map(function (item) {
    if (+item + 1 <= 10) {
      return {text: "0" + item, value: "0" + item};
    } else if (+item + 1 == 11) {
      return {text: +item, value: +item};
    } else {
      return {
        text: (+item + 0).toString(),
        value: (+item + 0).toString()
      };
    }
  });
  data.columns.push(hour); //生成小时列

  let mi = []; //创建分钟数组
  mi = Object.keys(Array.apply(null, {length: 60})).map(function (item) {
    if (+item + 1 <= 10) {
      return {text: "0" + item, value: "0" + item};
    } else if (+item + 1 == 11) {
      return {text: +item, value: +item};
    } else {
      return {
        text: (+item + 0).toString(),
        value: (+item + 0).toString()
      };
    }
  });
  data.columns.push(mi);//生成分钟列

  let ss = []; //创建秒数数组
  ss = Object.keys(Array.apply(null, {length: 60})).map(function (item) {
    if (+item + 1 <= 10) {
      return {text: "0" + item, value: "0" + item};
    } else if (+item + 1 == 11) {
      return {text: +item, value: +item};
    } else {
      return {
        text: (+item + 0).toString(),
        value: (+item + 0).toString()
      };
    }
  });
  data.columns.push(ss);//生成秒钟列
}


function getCountDays(year, month) {
  //获取某年某月多少天
  let day = new Date(year, month, 0);
  return day.getDate();
}

// 关闭弹框
function confirmOn() {
  emit("changeValue");
}


//时间选择器关闭 值不改变并关闭弹框
function cancelOn({selectedValues}) {
  confirmOn()
}

// 时间选择器确定 值改变
function onConfirm({selectedValues}) {
  let endval =
      selectedValues[0] +
      "-" +
      selectedValues[1] +
      "-" +
      selectedValues[2] +
      " " +
      selectedValues[3] +
      ":" +
      selectedValues[4] +
      ":" +
      selectedValues[5];

  confirmOn()
  emit("confirm", endval);
}
</script>


