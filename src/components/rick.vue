<template>
  <van-watermark :gap-x="55"
                 :gap-y="40" z-index="-100" content="rick"/>

  <van-nav-bar
      title="rick请假条"
      left-text="主页"
      right-text="github"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
  />

  <van-notice-bar left-icon="volume-o" :scrollable="false">
    <van-swipe
        vertical
        class="notice-swipe"
        :autoplay="3000"
        :touchable="false"
        :show-indicators="false"
    >
      <van-swipe-item>同步更新学校新版请假条，vue+vant重写了整个界面</van-swipe-item>
      <van-swipe-item>请假日期时间选择器可能有bug</van-swipe-item>
      <van-swipe-item>那个我半吊子前端写的，官网没这组件</van-swipe-item>
      <van-swipe-item>今人不见古时月，今月曾经照古人。</van-swipe-item>
    </van-swipe>
  </van-notice-bar>

  <van-pull-refresh v-model="loading" :head-height="80" @refresh="onRefresh" style="min-height: 100vh;">

    <!-- 下拉提示，通过 scale 实现一个缩放效果 -->
    <template #pulling="props">
      <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
          :style="{ transform: `scale(${props.distance / 80})` }"
      />
    </template>

    <!-- 释放提示 -->
    <template #loosing>
      <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
      />
    </template>

    <!-- 加载提示 -->
    <template #loading>
      <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge-fire.jpeg"
      />
    </template>
    <van-form @submit="onSubmit" id="rick" ref="ruleForm">
      <h2 class="van-doc-demo-block__title">去向信息</h2>

      <van-cell-group inset>
        <van-barrage ref="listRef" v-model="mesList" :auto-play="false">
          <van-field
              v-model="studentNumber"
              name="studentNumber"
              label="学号"
              placeholder="学号"
              required
              type="digit"
              :rules="[{ required: true, message: '请填写学号' }]"
          />
          <van-field name="isLeavingSchool" label="是否离校">
            <template #input>
              <van-radio-group v-model="isLeavingSchool" direction="horizontal">
                <van-radio name="是" icon-size="24px">是</van-radio>
                <van-radio name="否" icon-size="24px">否</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field name="isLeavingLocation" label="是否离开湘潭">
            <template #input>
              <van-radio-group v-model="isLeavingLocation" direction="horizontal">
                <van-radio name="是" icon-size="24px">是</van-radio>
                <van-radio name="否" icon-size="24px">否</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-barrage>
      </van-cell-group>
      <h2 class="van-doc-demo-block__title">请假信息</h2>
      <van-cell-group inset>
        <van-field
            v-model="academicYear"
            name="academicYear"
            is-link
            readonly
            label="学年"
            placeholder="选择学年"
            @click="showPicker1 = true"
        />
        <van-popup v-model:show="showPicker1" round position="bottom">
          <van-picker
              :columns="columns"
              @cancel="showPicker1 = false"
              @confirm="onConfirm"
          />
        </van-popup>
        <van-field
            v-model="term"
            name="term"
            is-link
            readonly
            label="学期"
            placeholder="学期"
            @click="showPicker2 = true"
        />
        <van-popup v-model:show="showPicker2" round position="bottom">
          <van-picker
              :columns="columns2"
              @cancel="showPicker2 = false"
              @confirm="onConfirm2"
          />
        </van-popup>
        <van-field
            v-model="leaveType"
            name="leaveType"
            is-link
            readonly
            label="请假类型"
            placeholder="请假类型"
            @click="showPicker3 = true"
            :rules="[{ required: true, message: '请填写请假类型' }]"
        />
        <van-popup v-model:show="showPicker3" round position="bottom">
          <van-picker
              :columns="columns3"
              @cancel="showPicker3 = false"
              @confirm="onConfirm3"
          />
        </van-popup>
        <van-field
            v-model="leaveNature"
            name="leaveNature"
            is-link
            readonly
            label="请假性质"
            placeholder="请假性质"
            @click="showPicker4 = true"
            :rules="[{ required: true, message: '请填写请假性质' }]"
        />
        <van-popup v-model:show="showPicker4" round position="bottom">
          <van-picker
              :columns="columns4"
              @cancel="showPicker4 = false"
              @confirm="onConfirm4"
          />
        </van-popup>
        <van-field
            v-model="startDate"
            name="startDate"
            is-link
            readonly
            label="请假开始时间"
            placeholder="请假开始时间"
            @click="showPicker5 = true"
            :rules="[{ required: true, message: '请填写请假开始时间' }]"
        />
        <DataTime
            :values="startDate"
            @changeValue="showPicker5 = false"
            :showPicker="showPicker5"
            @confirm="onConfirm5"
        />
        <van-field
            v-model="endDate"
            name="endDate"
            is-link
            readonly
            label="请假结束时间"
            placeholder="请假结束时间"
            @click="showPicker6 = true"
            :rules="[{ required: true, message: '请填写请假结束时间' }]"
        />
        <DataTime
            :values="endDate"
            @changeValue="showPicker6 = false"
            :showPicker="showPicker6"
            @confirm="onConfirm6"
        />
        <van-field v-model="leaveDays" name="leaveDays" label="请假天数" placeholder="请输入请假天数"/>

        <van-field
            v-model="leaveReason"
            rows="2"
            autosize
            name="leaveReason"
            label="请假事由"
            type="textarea"
            maxlength="50"
            placeholder="请输入请假事由"
            :rules="[{ required: true, message: '请填写请假事由' }]"
            show-word-limit
        />
      </van-cell-group>
      <h2 class="van-doc-demo-block__title">其他信息</h2>
      <van-cell-group inset>
        <van-field
            v-model="proofMaterial"
            name="proofMaterial"
            label="证明材料"
            placeholder="证明材料图片url"
            :rules="[{ validator: asyncUrlValidator, message: '请输入正确的证明材料图片url' }]"
        >
          <template #button>
            <van-button size="small" type="primary" url="https://pic.rick.icu">前去上传图片</van-button>
          </template>
        </van-field>
        <van-field
            v-model="phoneNumber"
            name="phoneNumber"
            label="手机号"
            placeholder="请输入手机号"
            type="digit"
            :rules="[{ validator: asyncPhoneValidator, message: '请输入正确手机号' }]"
        />

        <van-field
            v-model="submitTime"
            name="submitTime"
            is-link
            readonly
            label="提交时间"
            placeholder="提交时间"
            @click="showPicker7 = true"
        />
        <van-popup v-model:show="showPicker7" round position="bottom">
          <van-date-picker
              v-model="submitTime1"
              title="提交时间"
              :min-date="minDate"
              :max-date="maxDate"
              @cancel="showPicker7 = false"
              @confirm="onConfirm7"
          />
        </van-popup>
        <van-field
            v-model="approvalTime"
            name="approvalTime"
            is-link
            readonly
            label="导员审核时间"
            placeholder="审核通过时间"
            @click="showPicker8 = true"
            :rules="[{ required: true, message: '请填写审核通过时间' }]"
        />
        <DataTime
            :values="approvalTime"
            @changeValue="showPicker8 = false"
            :showPicker="showPicker8"
            @confirm="onConfirm8"
        />
        <van-field
            v-model="approverName"
            name="approverName"
            label="导员姓名"
            placeholder="导员姓名"
            :rules="[{ validator:nameValidator, message: '请填写正确姓名' }]"
        />


      </van-cell-group>

      <div style="margin: 16px;">
        <van-row justify="space-around">
          <van-col span="6">
            <van-button block type="primary" native-type="submit">
              提交
            </van-button>
          </van-col>
          <van-col span="6">
            <van-button block type="primary" @click="resetData">
              重置
            </van-button>
          </van-col>
          <van-col span="6">
            <van-button block type="primary" @click="makeFakeData">
              数据生成
            </van-button>
          </van-col>
        </van-row>


      </div>
      <div style="margin: 60px;">
        <van-back-top/>
      </div>
    </van-form>

  </van-pull-refresh>


</template>
<script setup>
import '@vant/touch-emulator';
import DataTime from "@/components/datatime/index.vue";
import {postData} from '@/api/rick'
import {ref, computed, getCurrentInstance} from 'vue';
import {showToast} from 'vant';
import {showSuccessToast, showFailToast, showLoadingToast, closeToast} from 'vant';

//顶栏
const onClickLeft = () => {
  window.location.href = 'https://rick.icu';
}
const onClickRight = () => {
  window.location.href = 'https://github.com/rickhqh'
};
//下拉刷新
const count = ref(0);
const loading = ref(false);
const defaultList = [];
const mesList = ref([...defaultList]);
const {proxy} = getCurrentInstance();
const onRefresh = () => {
  setTimeout(() => {
    showSuccessToast('彩蛋加一');
    mesList.value.push({id: Math.random(), text: 'vue'});
    //ref的使用
    //1.挂载在子组件上 ref="listref"
    //2.通过proxy.$refs.listref.play()调用子组件方法
    proxy.$refs.listRef.play();
    makeFakeData();
    mesList.value.push({id: Math.random(), text: '前方高能'});
    mesList.value.push({id: Math.random(), text: '好用'});
    mesList.value.push({id: Math.random(), text: '恭喜发现了彩蛋'});

    loading.value = false;
    count.value++;
  }, 1000);
};

//时间
const currentDate = new Date();
const Year = currentDate.getFullYear();
const Month = currentDate.getMonth() + 1;
const Day = currentDate.getDate();
console.log(Year, Month, Day);

// | studentNumber     |
// | isLeavingSchool   |
// | isLeavingLocation |
// | academicYear      |
// | term              |
// | leaveType         |
// | leaveNature       |
// | startDate         |
// | endDate           |
// | leaveDays         |
// | sourceType        |
// | leaveReason       |
// | proofMaterial     |
// | phoneNumber       |
// | submitTime        |
// | approvalTime      |
// | approverName      |
const studentNumber = ref('');
const isLeavingSchool = ref('是');
const isLeavingLocation = ref('否');
const academicYear = ref('2023-2024学年');
const term = ref('第一学期');
const leaveType = ref('');
const leaveNature = ref('');
const startDate = ref('');
const endDate = ref('');
const leaveDays = ref('');
const leaveReason = ref('');
const proofMaterial = ref('');
const phoneNumber = ref('');
const submitTime = ref('');
const approvalTime = ref('');
const approverName = ref('');
//picker
const columns = [
  {text: '2023-2024学年', value: '2023-2024学年'},
  {text: '2024-2025学年', value: '2024-2025学年'},
  {text: '2025-2026学年', value: '2025-2026学年'},
  {text: '2026-2027学年', value: '2026-2027学年'},
];
const columns2 = [
  {text: '第一学期', value: '第一学期'},
  {text: '第二学期', value: '第二学期'},
];
const columns3 = [
  {text: '病假', value: '病假'},
  {text: '事假', value: '事假'},
];
const columns4 = [
  {text: '因私请假', value: '因私请假'},
  {text: '因公请假', value: '因公请假'},
];
const submitTime1 = ref([Year, Month, Day]);
const minDate = ref(new Date(2020, 0, 1));
const maxDate = ref(new Date(2025, 5, 1));
const showPicker1 = ref(false);
const showPicker2 = ref(false);
const showPicker3 = ref(false);
const showPicker4 = ref(false);
const showPicker5 = ref(false);
const showPicker6 = ref(false);
const showPicker7 = ref(false);
const showPicker8 = ref(false);


const onConfirm = ({selectedOptions}) => {
  showPicker1.value = false;
  academicYear.value = selectedOptions[0].text;
};
const onConfirm2 = ({selectedOptions}) => {
  showPicker2.value = false;
  term.value = selectedOptions[0].text;
};
const onConfirm3 = ({selectedOptions}) => {
  showPicker3.value = false;
  leaveType.value = selectedOptions[0].text;
};
const onConfirm4 = ({selectedOptions}) => {
  showPicker4.value = false;
  leaveNature.value = selectedOptions[0].text;
};
//监听请假时间
const isEndDateEmpty = computed(() => {
  console.log("computed:" + endDate.value);
  return endDate.value === '';
});
const isStartDateEmpty = computed(() => {
  console.log("computed:" + startDate.value);
  return startDate.value === '';
});

function computerLeaveDays() {
  var timeDiff = new Date((endDate.value + ":59").replace(/-/g, "/")).getTime() - new Date((startDate.value + ":00").replace(/-/g, "/")).getTime();
  var halfDayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24 * 0.5)) * 0.5;
  leaveDays.value = halfDayDiff;
}

const onConfirm5 = selectedValues => {
  if (!isEndDateEmpty.value && selectedValues > endDate.value) {
    showFailToast('开始时间不能大于结束时间');
    return;
  }
  startDate.value = selectedValues;
  startDate.value = startDate.value.substring(0, 16);
  showPicker5.value = false;
  if (!isEndDateEmpty.value) {
    computerLeaveDays();
  }
};
const onConfirm6 = selectedValues => {
  if (selectedValues < startDate.value) {
    showFailToast('结束时间不能小于开始时间');
    return;
  }
  endDate.value = selectedValues;
  //修改为YYYY-MM-DD HH:mm
  endDate.value = endDate.value.substring(0, 16);
  showPicker6.value = false;
  if (!isStartDateEmpty.value) {
    computerLeaveDays();
  }
};
const onConfirm7 = ({selectedOptions}) => {
  showPicker7.value = false;
  const x = [];
  for (let i = 0; i < selectedOptions.length; i++) {
    x.push(selectedOptions[i].text)
  }
  //拼接成YYYY-MM-DD
  submitTime.value = x.join('-');
  console.log(submitTime.value);
};
const onConfirm8 = selectedValues => {
  showPicker8.value = false;
  approvalTime.value = selectedValues;
};

//校验
const asyncUrlValidator = (val) =>
    new Promise((resolve) => {
      showLoadingToast('验证中...');

      setTimeout(() => {
        closeToast();
        resolve(/^((http|https):\/\/)?(www\.)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?$/.test(val));
      }, 1000);
    });

const asyncPhoneValidator = (val) =>
    new Promise((resolve) => {
      showLoadingToast('验证中...');

      setTimeout(() => {
        closeToast();
        resolve(/^1[3-9]\d{9}$/.test(val));
      }, 1000);
    });
const nameValidator = (val) => {
  const regex = /^[\u4e00-\u9fa5]{2,4}$/;
  return regex.test(val);
};
const ruleForm = ref(null)
const makeFakeData = () => {
  console.log('ruleForm.value', ruleForm.value); // 此时ruleForm是可以打印出来的
  // 事假原因数组
  var shijiaReasons = [
    "要去参加重要的学术比赛",
    "要去参加学院讲座",
    "突发社会实践和志愿者工作",
    "参加辩论赛，请假参赛。",
    "要去参加社团团活"
  ];

// 病假原因数组
  var bingjiaReasons = [
    "过敏性鼻炎",
    "失眠，身体不舒服",
    "前天运动后伤肌肉拉伤了",
    "最近口腔溃疡",
    "感冒了，去医院开了药",
    "头疼，生理不适",
    "受伤导致脚部骨折，需休养恢复请假。"
  ];

// 随机选择请假类型
  var randomType = Math.random() < 0.5 ? "shijia" : "bingjia";

// 输出相应的请假原因
  if (randomType === "shijia") {
    var randomIndex = Math.floor(Math.random() * shijiaReasons.length);
    leaveType.value = '事假';
    leaveNature.value = "因公请假"
    leaveReason.value = shijiaReasons[randomIndex];
  } else {
    var randomIndex = Math.floor(Math.random() * bingjiaReasons.length);
    leaveType.value = '病假';
    leaveNature.value = "因私请假"
    leaveReason.value = bingjiaReasons[randomIndex];
  }
  studentNumber.value = '2005';
  isLeavingSchool.value = '是';
  isLeavingLocation.value = '否';
  academicYear.value = '2023-2024学年';
  term.value = '第一学期';
  startDate.value = '';
  endDate.value = '';
  leaveDays.value = '';
  proofMaterial.value = '';
  phoneNumber.value = '13087443221';
  submitTime.value = Year + '-' + Month + '-' + Day;
  approvalTime.value = '';
  approverName.value = '陈嘉靓';
  // studentNumber.value = '2005';
  // isLeavingSchool.value = '是';
  // isLeavingLocation.value = '否';
  // academicYear.value = '2023-2024学年';
  // term.value = '第一学期';
  // startDate.value = '2023-11-16 20:12';
  // endDate.value = '2023-11-16 20:13';
  // leaveDays.value = '0.5';
  // leaveReason.value = '1';
  // proofMaterial.value = '2323232343.com';
  // phoneNumber.value = '15321411232';
  // submitTime.value = '2023-11-16';
  // approvalTime.value = '2023-11-16 20:13:23';
  // approverName.value = '陈嘉靓';

}
const resetData = () => {
  ruleForm.value.resetValidation();
  studentNumber.value = '';
  isLeavingSchool.value = '是';
  isLeavingLocation.value = '否';
  academicYear.value = '2023-2024学年';
  term.value = '第一学期';

  leaveNature.value = '';
  startDate.value = '';
  endDate.value = '';
  leaveDays.value = '';
  leaveReason.value = '';
  proofMaterial.value = '';
  phoneNumber.value = '';
  submitTime.value = '';
  approvalTime.value = '';
  approverName.value = '';
};
const onSubmit = (values) => {
  //跳转到返回的302
  postData(values).then(res => {
    console.log(res);
    if (res.status === 200) {
      window.location.href = res.data;
    } else {
      showFailToast('提交失败');
    }
  }).catch(err => {
    console.log(err);
    showFailToast('提交失败');
  });
  console.log('submit', values);
};
</script>

<style>
.doge {
  width: 140px;
  height: 72px;
  margin-top: 8px;
  border-radius: 4px;
}

.van-doc-demo-block__title {
  margin: 0;
  padding: 20px 17px 16px;
  color: #969799;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
}


.notice-swipe {
  height: 40px;
  line-height: 40px;
}

</style>
