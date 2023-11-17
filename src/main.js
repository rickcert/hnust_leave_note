// import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import {Button, Cell, PullRefresh, NavBar, Tab, Tabs, List, Form, Field, CellGroup, Toast, Tag, Watermark} from 'vant';
import {RadioGroup, Radio, Picker, Popup, NoticeBar, Swipe, SwipeItem} from 'vant';
import {NumberKeyboard, DatePicker, Col, Row, BackTop,Barrage} from 'vant';

// 2. 引入组件样式
import 'vant/lib/index.css';

createApp(App)
    .use(Button)
    .use(Cell)
    .use(PullRefresh)
    .use(NavBar)
    .use(Tab)
    .use(Tabs)
    .use(List)
    .use(Form)
    .use(Field)
    .use(CellGroup)
    .use(Toast)
    .use(Watermark)
    .use(Tag)
    .use(RadioGroup)
    .use(Radio)
    .use(Picker)
    .use(Popup)
    .use(NoticeBar)
    .use(Swipe)
    .use(SwipeItem)
    .use(NumberKeyboard)
    .use(DatePicker)
    .use(Col)
    .use(Row)
    .use(BackTop)
    .use(Barrage)
    .mount('#app')
