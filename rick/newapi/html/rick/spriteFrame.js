requirejs.onError = function (err) {
    console.log(err.requireType);
    console.log('modules: ' + err.requireModules);
};

(function(require) {
    //require路径配置
    var requireConfig = {
        paths: {
            jquery: SERVER_PATH + '/bower_components/jquery/dist/jquery.min',
            vue: SERVER_PATH + '/bower_components/vue2/vue.min',
            vueRouter: SERVER_PATH + '/bower_components/vue2/vue-router.min',
            text: SERVER_PATH + '/bower_components/text/text',
            util: 'public/util/util',
            MINT: SERVER_PATH + '/fe_components/mobile/MINT/index',
            axios: SERVER_PATH + '/bower_components/vue2/axios.min',
            'emap-mobile': SERVER_PATH + '/fe_components/mobile/emap-mobile.min',
            base64: '../../swpubapp/publicjs/encrypt/jquery.base64',
            BH_MOBILE: SERVER_PATH + '/fe_components/mobile/BH_MIXIN_SDK',
            //            WEIXIN: 'https://res.wx.qq.com/open/js/jweixin-1.2.0',
            selectRoleIndex: '../../swpubapp/public/mob/component/selectrole/selectrole',
            home: '../../swpubapp/public/mob/component/home/home',
            yypj: '../../swpubapp/public/mob/component/yypj/yypj',
            spriteUtils: '../../swpubapp/public/mob/js/spriteUtil',
            publicVueComponent: '../../swpubapp/public/mob/component',
            xgPublicVueComponent: '../../xgpubapp/public/mob/component',
            'draggable': SERVER_PATH + "/bower_components/vuedraggable/vuedraggable",
            'sortable': SERVER_PATH + "/bower_components/sortable/1.5.1/Sortable.min",
            //            qrcode: SERVER_PATH + '/bower_components/qrcode.js/qrcode.js',
            //            bhFillStyle: SERVER_PATH + '/fe_components/mobile/bh_utils_mobile',
            emapMin: '../../swpubapp/public/mob/js/emapMin',
            pagelog: SERVER_PATH + '/fe_components/sentry/sentry.min',
            cropper: SERVER_PATH + '/bower_components/cropper/cropper.min',
            vueLazyload: '../../swpubapp/publicjs/vue-lazyload'

//            ,baidumap:'https://api.map.baidu.com/api?v=2.0&ak=${baidumapKey}'
        },
        shim: {
            //            'qrcode': {
            //                exports: 'QRCode'
            //            },
            //            'bhFillStyle': {
            //                exports: 'bhFillStyle'
            //            },
            'emap-mobile': {
                deps: ['jquery']
            },
            'emapMin': {
                deps: ['jquery']
            },
            'pagelog': {
                deps: ['jquery']
            },
            'base64': {
                deps: ['jquery']
            }
        },
        urlArgs: 'v='+randomValue,
        waitSeconds: 0

    };

    /**
     * appLoadAsync用于控制app页面的加载方式
     * true: app的所有页面为异步加载，只在使用到时加载
     * false: app的所有页面在应用初始化时一次性加载
     */
    window.appLoadAsync = true;

    //默认的组件库和公共方法以及公共页面
    var requir_default_arr = ['jquery', 'vue', 'vueRouter', 'MINT', 'emap-mobile', 'axios', 'spriteUtils', 'draggable', 'emapMin','vueLazyload', 'pagelog', 'cropper','base64'];

    //封装的公共vue组件
    var default_component_arr = [{
        name: 'auditProcess',
        jsPath: 'publicVueComponent/auditprocess/auditProcess'
    }, {
        name: 'noneDatas',
        jsPath: 'publicVueComponent/nonedatas/nonedatas'
    }, {
        name: 'yypjTb',
        jsPath: 'publicVueComponent/yypj/yypjtb'
    }, {
        name: 'showProcess',
        jsPath: 'publicVueComponent/lcbjggzj/showprocess'
    }, {
        name: 'czznTb',
        jsPath: 'publicVueComponent/czzn/czzntb'
    }, {
        name: 'floatIcon',
        jsPath: 'publicVueComponent/floaticon/floaticon'
    }];

    /**
     * 用于保存所有模块的全局对象：
     * defaultModules：默认的组件库和公共方法以及公共页面
     * pageModules：当前应用的所有页面模块
     * defaultComponents：封装的公共vue组件
     */
    window.REQUIRE_MODULES_ARR = {
        defaultModules: requir_default_arr,
        pageModules: [],
        defaultComponents: default_component_arr
    };

    //配置require
    require.config(requireConfig);

    //加载框架所需的库和公共页面
    require(requir_default_arr, function($, Vue, VueRouter, mintUI, EMAP_MOBILE, axios, sprite, draggable, emapMin,vueLazyload) {
        /**
         * 用于解决ios 微信虚拟键盘弹出使得页面乱窜的问题
         */
        $(document).on("blur", "input,select,textarea", function() {
            setTimeout(function() {
                const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            }, 100);
        });
        //设置拖拽组件
        Vue.component('draggable', draggable);

        //将各个组件库输出到全局作用域
        window.axios = axios;
        window.Vue = Vue;
        window.VueRouter = VueRouter;
        window.mintUI = mintUI;
        window.EMAP_MOBILE = EMAP_MOBILE;
        window.WIS_EMAP_SERV = emapMin;
        window.curRouter = "";
        window.vueLazyload = vueLazyload;
        var tmpHref = location.href;
        if(tmpHref.indexOf("#/")!=-1){
        	window.curRouter = tmpHref.substring(tmpHref.indexOf("#/")+2);
        }
        //vue路由组件
        Vue.use(VueRouter);
        //饿了么移动端组件mint-ui
        Vue.use(mintUI);
        //EMAP相关vue组件
        Vue.use(EMAP_MOBILE);
        
        Vue.use( vueLazyload);

        //ids认证
        /**
         * 1.移动学工工作平台走游客模式
         * 2.已登录状态下，如果访问链接包含isVisitorPage=1参数，则走游客模式【用户已登录，当扫码访问游客页面时，页面白屏，原框架代码不支持】；
         */
        if (userId != '' && userId != null && userId != undefined && window.WIS_CONFIG.APPNAME != 'swmczznapp' && window.WIS_CONFIG.APPNAME != 'swmxggzptapp' && tmpHref.indexOf('isVisitorPage=1')<0) {
            //获取角色配置相关参数 --> 获取用户授权功能 --> 初始化应用
            sprite.getSelRoleConfig().then(sprite.getAuthConfig).then(sprite.initApp);
        }
        //游客
        else {
            // 初始化应用--游客模式
            sprite.initApp_visitor();
        }

    });

}(require));