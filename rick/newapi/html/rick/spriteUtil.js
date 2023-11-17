define(function(require) {
    var spriteUtils = {

        /**
         * 初始化应用
         */
        initApp: function(callBack) {
            addCallback(callBack);
            requireAndInit();
        },
        /**
         * 初始化应用--游客模式
         */
        initApp_visitor: function(callBack) {
            addCallback(callBack);
            // 游客模式依赖 VISITOR_CONFIG 对象
            if (!window.VISITOR_CONFIG || !(window.VISITOR_CONFIG.PAGES instanceof Array)) {
                console.error("the VISITOR_CONFIG is not defined , whitch is required in the visitor mode !");
                return;
            }
            //将页面注册到全局对象中
            window.REQUIRE_MODULES_ARR.pageModules = window.VISITOR_CONFIG.PAGES;
            //游客模式无需选择角色
            window.IS_NEED_SELECTROLE = "0";
            requireAndInit();
        },

        /**
         * 加载组件
         */
        loadComponent: function(path) {
            return function() {
                var dfd = $.Deferred();
                require([path], function(componentInit) {
                    var component = componentInit();
                    component.template = compileTpl(component.template);
                    dfd.resolve(component);
                });
                return dfd.promise();
            };
        },

        /**
         * 判断是否进入角色选择页
         * 如果用户有且只有一个角色，直接渲染该角色有权限的页面，否则进入角色选择页面
         */
        getSelRoleConfig: function() {
            var self = this;
        	var dfd = $.Deferred();
            MOB_UTIL.doPost({
                url: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/getSelRoleConfig.do',
                params: {
                    APPID: WIS_CONFIG.APPID,
                    APPNAME: WIS_CONFIG.APPNAME
                }
            }).done(function(result) {
                window.IS_NEED_SELECTROLE = result.data.IS_NEED_SELECTROLE;
                //无需选择角色
                if (IS_NEED_SELECTROLE === "0") {
                    roleId = result.data.DEFAULT_ROLEID;
                    dfd.resolve();
                }else if(roleIdByUrl && IS_NEED_SELECTROLE === "1" && result.data.ROLELIST && result.data.ROLELIST.length > 0){
                	var isExists = false;
                	$.each(result.data.ROLELIST, function(i, obj){
                		if(roleIdByUrl == obj.id){
                			window.IS_NEED_SELECTROLE = '0';
                			roleId = roleIdByUrl;
                			isExists = true;
                			return false;
                		}
                	});
                	if(isExists){
                		self.setAppRole(roleId).done(function() {
            				dfd.resolve();
            			});
                	}else{
                		dfd.resolve();
                	}
                }else{
                	dfd.resolve();
                }
                
            });
            return dfd.promise();
        },
        
        /**
         * 设置登录角色
         */
        setAppRole: function(roleId) {
        	var params = {
                url: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/setAppRole.do',
                params: {
                    APPID: WIS_CONFIG.APPID,
                    APPNAME: WIS_CONFIG.APPNAME,
                    ROLEID: roleId
                }
            };
            return MOB_UTIL.doPost(params);
        },
        
        /**
         * 获取用户授权的页面、按钮
         */
        getAuthConfig: function(fromSelectRole) {
            var dfd = $.Deferred();
            // IS_NEED_SELECTROLE为1，即需要先选择角色
            // 如果url中含有recallUrl参数，表示访问的是问卷调查，不需要进行角色选择
            if (!fromSelectRole && window.IS_NEED_SELECTROLE == "1" &&
                (window.location.hash.indexOf('recallUrl') == '-1' && window.location.search.indexOf('recallUrl') == '-1')) {
                window.REQUIRE_MODULES_ARR.pageModules = [{
                    vueJsPath: 'selectRoleIndex'
                }];
                dfd.resolve();
            } else {
                //这里在后台去调用查询问卷调查的接口
                MOB_UTIL.doPost({
                    url: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/getMenuInfo.do',
                    params: {
                        APPID: WIS_CONFIG.APPID,
                        APPNAME: WIS_CONFIG.APPNAME
                    }
                }).done(function(result) {
                    //如果发现有问卷需要答，则跳转问卷的地址
                    if (result.data.NEED_QUESTIONNAIRE) {
                        //这个参数用于标记即将跳转问卷调查地址，无需再做后续的路由解析工作
                        window.IS_QUESTIONNAIRE = true;
                        //这边替换新的地址
                        window.location.replace(window.WIS_CONFIG.HOST_PATH + result.data.REDIRECT_URL);
                        dfd.resolve();
                    }
                    //授权按钮列表
                    window.MOBILE_BUTTONAUTH_LIST = result.data.BUTTON;
                    //授权页面列表
                    window.REQUIRE_MODULES_ARR.pageModules = result.data.PAGES;
                    dfd.resolve();
                });
            }
            return dfd.promise();
        }
    };

    var firstInit = true; //应用首次初始化(需要选角色时存在第二次初始化)
    var callbacks = [defaultCallback]; //回调集合

    /**
     * 应用初始化完成的默认回调函数
     */
    function defaultCallback() {
        if (firstInit) {
            console.log('|---sprite---|  App init finished,have fun!  |---sprite---|');
            firstInit = false;
        }
    }

    /**
     * 新增回调
     */
    function addCallback(callback) {
        if (callback) {
            if (callback instanceof Function) {
                callbacks.push(callback);
            }
            if (callback instanceof Array) {
                var allIsFunc = callback.every(function(c) {
                    return c instanceof Function;
                });
                if (allIsFunc) {
                    callbacks = callbacks.concat(callback);
                }
            }
        }
    }

    /**
     * 执行回调
     */
    function finishedCallback() {
        callbacks.forEach(function(callback) {
            callback();
        });
    }

    /** 
     * 加载组件与页面进行初始化
     */
    function requireAndInit() {
        //这个参数用于标记即将跳转问卷调查地址，无需再做后续的路由解析工作
        if (window.IS_QUESTIONNAIRE) {
            //更改状态，避免重复操作
            window.IS_QUESTIONNAIRE = false;
            return;
        }
        var require_page_path = []; //页面模块js路径
        var require_component_path = []; //公共组件js路径
        setJsPath(require_page_path, require_component_path);

        //需要选择角色
        var needSelectRole = window.IS_NEED_SELECTROLE == "1" && require_page_path[0] == "selectRoleIndex";
        //如果hash中有recallUrl参数，表示访问的是问卷调查，则不做角色选择
        if (window.location.hash.indexOf('recallUrl') != '-1' || window.location.search.indexOf('recallUrl') != '-1') {
            needSelectRole = false;
        }
        //不需要选择角色时，删除selectRole的dom
        if (!needSelectRole) {
            $('#selectrole').remove();
        }

        //加载公共组件
        require(require_component_path, function() {
            //注册公共组件
            window.REQUIRE_MODULES_ARR.defaultComponents.forEach(function(defaultComponent) {
                Vue.component(defaultComponent.name, spriteUtils.loadComponent(defaultComponent.jsPath));
            });
            var needSDK = true;
            //异步按需加载
            if (window.appLoadAsync) {
                init(needSDK, needSelectRole);
            }
            //全部加载
            else {
                require(require_page_path, function() {
                    init(needSDK, needSelectRole);
                });
            }
        });
    }

    /**
     * 设置页面与组件的js文件路径
     */
    function setJsPath(require_page_path, require_component_path) {
        if (window.REQUIRE_MODULES_ARR.pageModules instanceof Array) {
            //页面模块js路径
            window.REQUIRE_MODULES_ARR.pageModules.forEach(function(pageModule) {
                require_page_path.push(pageModule.vueJsPath);
            });
        }
        if (window.REQUIRE_MODULES_ARR.defaultComponents instanceof Array) {
            //公共组件js路径
            window.REQUIRE_MODULES_ARR.defaultComponents.forEach(function(defaultComponent) {
                require_component_path.push(defaultComponent.jsPath);
            });
        }
    }

    /**
     * 应用初始化
     */
    function init(needSDK, needSelectRole) {
        var routes = [];

        var rootDiv = '#app';
        //初始化角色选择页面
        if (needSelectRole) {
            rootDiv = '#selectrole';
            routes = [{
                path: '/',
                name: 'selectrole',
                component: spriteUtils.loadComponent('selectRoleIndex')
            }];
        }
        //初始化当前用户有权限访问的页面
        else {
            routes = getVueRoute();
            initI18n();
            getYypzcs();
        }

        //生成VueRouter对象
        var router = new VueRouter({
            routes: routes
        });

        var hasAuth = checkAuth(routes);
        //无权限hash置空
        if (!hasAuth) {
        	if (needSelectRole) {
        		location.hash = '#/';
        	}else{
        		location.hash = '#/'+window.curRouter;
        	}
        }

        //路由切换完成后执行的操作
        router.afterEach(function(to, from, next) {
            //页面离开时，关闭messagebox
            mintUI.MessageBox.close();

            /**
             * 当前端组件页面弹出遮罩层，为了控制遮罩层下的文本不滚动，
             * 在<body></body>与<div id="app"></div>上设置了样式：overflow:hidden;height:100%,锁死了页面。
             * 这边手动去除这个样式
             */
            if (document.body.style.overflow == 'hidden' && document.body.style.height == '100%') {
                document.body.style.overflow = null;
                document.body.style.height = null;
                document.body.firstElementChild.style.overflow = null;
                document.body.firstElementChild.style.height = null;
            }

            /**
             * 在切换路由后自动执行一个轻微滑动
             * 这样写的原因：ios在页面的高度比较高时，从其他页面返回该页面将会出现页面空白的现象
             * 需要轻触屏幕进行滑动才能恢复原页面
             */
            if (!to.meta.keepAlive && !from.meta.keepAlive) {
                var top = document.body.scrollTop;
                document.body.scrollTop = top + 1;
                setTimeout(function() {
                    document.body.scrollTop = top - 1;
                }, 0);
            }
            var tbCount = 0; //图标计数器
            /**
             * 应用评价配置为使用
             */
            if(WIS_CONFIG.YYPJ_ENABLE == "1"){
            	tbCount += 1;
            	//避免有些应用将mobilepub.jsp在head里引用，延迟100毫秒待body加载出来再执行
            	setTimeout(function() {
            		initYypjDiv(to);
                }, 100);
            }
            
            /**
             * 操作指南配置为使用
             */
            if(WIS_CONFIG.CZZN_ENABLE == "1" && WIS_CONFIG.APPNAME != "swmczznapp"){
            	tbCount += 1;
            	//避免有些应用将mobpub.jsp在head里引用，延迟100毫秒待body加载出来再执行
            	setTimeout(function() {
            		initCzznDiv(to);
                }, 100);
            }
            
            /**
             * 操作指南或应用评价只要配置其中一项就展示
             */
            if(tbCount > 0){
            	//避免有些应用将mobpub.jsp在head里引用，延迟100毫秒待body加载出来再执行
            	setTimeout(function() {
            		initFloatDiv(to);
            		//动态调整图标显示区域高度，1个图标的高度是60
            		if(tbCount == 1){
            			$("#inner_icon").css("height","60");
            		}else if(tbCount == 2){
            			$("#inner_icon").css("height","120");
            		}
                }, 100);
            }
        });

        if (needSDK) {
            initSDKandApp(rootDiv, router);
        } else {
            //兼容应用js内部SDK.setTitleText()方法；
        	window.SDK = {};
            SDK.setTitleText = function(title){
            };
        	//挂载主vue对象
            app = new Vue({
                el: rootDiv,
                router: router
            });
            finishedCallback();
        }
    }

    /**
     * 校验当前hash是否属于用户权限范围内
     */
    function checkAuth(routes) {
        return routes.some(function(route) {
            if (!route.children || route.children.length < 1) {
                return location.hash.indexOf(route.name) > 0;
            } else {
                return checkAuth(route.children);
            }
        });
    }

    /**
     * 初始化应用评价图标div
     * 只在首页展示，切换页面判断
     */
    function initYypjDiv(to){
    	if((to.path == "/" || checkIsIndex(to.path)) && to.name != "selectrole"){
        	if($('#xsfw_yypjDiv').length > 0){
        		$('#xsfw_yypjDiv').show();
        	}
        }else{
        	if($('#xsfw_yypjDiv').length > 0){
        		$('#xsfw_yypjDiv').hide();
        	}
        }
    }
    
    /**
     * 初始化操作指南图标div
     * 只在首页展示，切换页面判断
     */
    function initCzznDiv(to){
    	if((to.path == "/" || checkIsIndex(to.path)) && to.name != "selectrole"){
    		$('#xsfw_czznDiv').show();
        	if($('#xsfw_czznDiv').length > 0){
        		$('#xsfw_czznDiv').show();
        	}
        }else{
        	if($('#xsfw_czznDiv').length > 0){
        		$('#xsfw_czznDiv').hide();
        	}
        }
    }
    
    /**
     * 初始化悬浮图标div
     * 只在首页展示，切换页面判断
     */
    function initFloatDiv(to){
    	if((to.path == "/" || checkIsIndex(to.path)) && to.name != "selectrole"){
        	if($('#xsfw_floatDiv').length > 0){
        		$('#xsfw_floatDiv').show();
        	}
        }else{
        	if($('#xsfw_floatDiv').length > 0){
        		$('#xsfw_floatDiv').hide();
        	}
        }
    	if(WIS_CONFIG.CZZN_HIDE_URLS){
			var urlArr = WIS_CONFIG.CZZN_HIDE_URLS.split(",");
			for(var index in urlArr){
				if(window.location.href.indexOf(urlArr[index]) >= 0){
					if($('#xsfw_floatDiv').length > 0){
		        		$('#xsfw_floatDiv').hide();
		        	}
					break;
				}
			}
		}
    }
    
    /**
     * 校验路由调整后是否首页
     */
    function checkIsIndex(path) {
    	var flag = false;
        window.REQUIRE_MODULES_ARR.pageModules.some(function(route) {
        	if ((path+"/").indexOf("/"+route.vueRouteName+"/") >= 0 && route.isIndex == "true") {
            	flag = true;
            }
        });
        return flag;
    }
    
    /**
     * 根据加载的页面列表获取Vue路由数组
     */
    function getVueRoute() {
        var routes = [];
        //获取页面vue对象以及子节点列表
        var childrenIdList = [];
        window.REQUIRE_MODULES_ARR.pageModules.forEach(function(page, pageIndex) {
            page.index = pageIndex;
            page.component = loadPage(page.vueJsPath, page.components);
            if (page.childrenIds && page.childrenIds instanceof Array) {
                childrenIdList = childrenIdList.concat(page.childrenIds);
            }
        });

        //构建子节点映射，通id可以获取到这个子节点，并且在原数组中标记子节点的isChild为true
        var childrenObjs = {};
        childrenIdList.forEach(function(childId, index) {
            window.REQUIRE_MODULES_ARR.pageModules.forEach(function(page, index) {
                if (page.id === childId) {
                    page.isChild = true;
                    childrenObjs[page.id] = page;
                }
            });
        });

        var indexPages = []; //首页集合
        //把REQUIRE_MODULES_ARR.pageModules解析为vue的路由数组
        window.REQUIRE_MODULES_ARR.pageModules.forEach(function(page, index) {
            if (!page.isChild) {
                var pageComponent = page.component; //vue组件对象
                var pageName = page.vueRouteName; //路由跳转名称
                var pagePath = page.vueRoute; //路由路径
                var isIndex = page.isIndex === "true"; //是否首页
                var needCache = page.keepAlive === "true"; //是否缓存

                var routeObj = {};
                routeObj.path = pagePath;
                routeObj.component = pageComponent;
                routeObj.name = pageName;
                routeObj.meta = {
                    keepAlive: needCache
                };
                addChildrenRoute(page, routeObj, childrenObjs);

                if (isIndex) {
                    //配置为多首页时使用
                    routeObj.meta.index = page.vueRouteName; //首页标识
                    routeObj.meta.indexIcon = page.indexIcon; //首页图表
                    routeObj.meta.indexName = page.indexName; //首页中文名
                    indexPages.push(routeObj);
                } else {
                    routes.push(routeObj);
                }
            }
        });

        return homePageProcess(routes, indexPages);
    }

    /**
     * 加载页面
     */
    function loadPage(path, components) {
        return function() {
            var dfd = $.Deferred();
            spriteUtils.loadComponent(path)().then(function(page) {
                //注册应用自定义组件
                if (!page.components) {
                    page.components = {};
                }
                if (components && components instanceof Array) {
                    components.forEach(function(component) {
                        page.components[component.name] = spriteUtils.loadComponent(component.jsPath);
                    });
                }
                dfd.resolve(page);
            });

            return dfd.promise();
        };
    }

    /**
     * 递归添加子路由
     */
    function addChildrenRoute(page, routeObj, childrenObjsMap) {
        //如果当前页面存在子页面，则将子页面加入当前页面的子路由
        if (page.childrenIds && page.childrenIds instanceof Array) {
            routeObj.children = [];
            page.childrenIds.map(function(childId, index) {
                var child = childrenObjsMap[childId];
                var needCache = child.keepAlive === "true";
                var childrouteObj = {};
                childrouteObj.component = child.component;
                childrouteObj.name = child.vueRouteName;
                childrouteObj.path = child.vueRoute.substr(child.vueRoute.indexOf('/') + 1);
                childrouteObj.meta = {};
                childrouteObj.meta.keepAlive = needCache;
                //递归添加子页面的子页面
                addChildrenRoute(child, childrouteObj, childrenObjsMap);
                routeObj.children.push(childrouteObj);
            });
        }
    }

    /**
     * 处理首页
     */
    function homePageProcess(routes, indexPages) {
        window.REQUIRE_MODULES_ARR.indexPages = indexPages;
        //至少需要一个首页
        if (indexPages.length == 0) {
            throw new Error("need at least one home page!");
        }
        //单首页
        if (indexPages.length == 1) {
            routes.push(indexPages[0]);
            routes.push({
                path: '/',
                component: indexPages[0].component,
                children: indexPages[0].children || [],
                meta: {
                    keepAlive: indexPages[0].meta.keepAlive
                }
            });
        }
        //多首页
        if (indexPages.length > 1) {
            var home = {
                path: '/',
                component: spriteUtils.loadComponent('home'),
                children: indexPages,
                redirect: indexPages[0].path
            };
            routes.push(home);
        }
        //增加应用评价页面
        routes.push({
            path: '/yypj',
            component: spriteUtils.loadComponent('yypj'),
            name: '/yypj',
            meta: {
                keepAlive: false
            }
        });
        return routes;
    }

    /**
     * 初始化SDK与应用
     */
    function initSDKandApp(rootDiv, router) {
    	if(/dingtalk/.test(navigator.userAgent.toLowerCase())){
    		getDDSign().then(function(signData) {
                var config = {                    
                    //钉钉jdk初始化参数
                    dd: {
                    	corp:signData.corpId,
                    	uploadImgsToEmapUrl: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/saveFileFromDingding.do'
                    }
                };
                //如果获取到了微信签名，则用该签名对象初始化微信jssdk
                if ('{}' !== JSON.stringify(signData)) {
                    config.dd.signData = signData;
                }

                /**
                 * 判断父窗口中是否加载了SDK，如果加载了则直接使用父窗口的SDK
                 * 这样写的原因：微信SDK在同一页面初始化两次会造成第二次初始化失败
                 *               即使是iframe嵌套的页面也不行
                 */
                if (window.parent && window.parent.SDK) {
                    window.SDK = window.parent.SDK;
                    //挂载主vue对象
                    app = new Vue({
                        el: rootDiv,
                        router: router
                    });
                    finishedCallback();
                    return;
                }

                //使用BH_MOBILE提供的方法进行SDK的注册
                require(['BH_MOBILE'], function(BH_MOBILE) {
                    window.BH_MOBILE = BH_MOBILE;
                    //初始化sdk
                    BH_MOBILE.default(function(res) {
                        window.SDK = res.sdk;
                        //挂载主vue对象
                        app = new Vue({
                            el: rootDiv,
                            router: router
                        });
                        finishedCallback();
                    }, config);
                });

            });
    	}else{
    		getWechatSign().then(function(signData) {
                var config = {
                    //微信jdk初始化参数
                    wx: {
                        uploadImgsToEmapUrl: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/saveFileFromWechat.do?wxType='+WIS_CONFIG.wxType
                    },
                    //钉钉jdk初始化参数
                    dd: {}
                };
                //如果获取到了微信签名，则用该签名对象初始化微信jssdk
                if ('{}' !== JSON.stringify(signData)) {
                    config.wx.signData = signData;
                }

                /**
                 * 判断父窗口中是否加载了SDK，如果加载了则直接使用父窗口的SDK
                 * 这样写的原因：微信SDK在同一页面初始化两次会造成第二次初始化失败
                 *               即使是iframe嵌套的页面也不行
                 */
                if (window.parent && window.parent.SDK) {
                    window.SDK = window.parent.SDK;
                    //挂载主vue对象
                    app = new Vue({
                        el: rootDiv,
                        router: router
                    });
                    finishedCallback();
                    return;
                }
                
                if(window.SDK){
                    //挂载主vue对象
                    app = new Vue({
                        el: rootDiv,
                        router: router
                    });
                    finishedCallback();
                    return;
                }

                //使用BH_MOBILE提供的方法进行SDK的注册
                require(['BH_MOBILE'], function(BH_MOBILE) {
                    window.BH_MOBILE = BH_MOBILE;
                    //初始化sdk
                    BH_MOBILE.default(function(res) {
                        window.SDK = res.sdk;
                        //挂载主vue对象
                        app = new Vue({
                            el: rootDiv,
                            router: router
                        });
                        finishedCallback();
                    }, config);
                });

            });
    	}
        
    }

    /**
     * 获取微信签名信息
     */
    function getWechatSign() {
        var dfd = $.Deferred();
        var url = WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/getWechatSign.do';
        if (window.VISITOR_CONFIG && VISITOR_CONFIG.WECHAT_API && VISITOR_CONFIG.WECHAT_API.getWechatSign) {
            url = WIS_CONFIG.ROOT_PATH + VISITOR_CONFIG.WECHAT_API.getWechatSign;
        }
        //如果在微信环境，则请求微信签名用于加载微信jssdk
        if (/micromessenger/.test(navigator.userAgent.toLowerCase())) {
            /**
             * 请求微信js全局对象
             * 由于戚雨提供的BH_MOBILE需要依赖微信的js文件
             * 因此在加载BH_MOBILE前，先保证微信的js文件已加载
             */
            require(['BH_MOBILE'], function(BH_MOBILE) {
                window.BH_MOBILE = BH_MOBILE;
                //请求当前页面的微信签名
                MOB_UTIL.doPost({
                    url: url,
                    params: {
                        url: window.location.href.replace(/#(\S+)?/, ''),
                        wxType:WIS_CONFIG.wxType
                    }
                }).done(function(result) {
                    dfd.resolve(result.data);
                });
            });
        }
        //不在微信环境直接返回 
        else {
            dfd.resolve();
        }
        return dfd.promise();
    }
    /**
     * 获取钉钉签名信息
     */
    function getDDSign() {
        var dfd = $.Deferred();
        var url = WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/getDDSign.do';
        if (window.VISITOR_CONFIG && VISITOR_CONFIG.DD_API && VISITOR_CONFIG.DD_API.getDDSign) {
            url = WIS_CONFIG.ROOT_PATH + VISITOR_CONFIG.DD_API.getDDSign;
        }
        //如果在钉钉环境，则请求钉钉签名用于加载钉钉jssdk
        if (/dingtalk/.test(navigator.userAgent.toLowerCase())) {
            /**
             * 请求微信js全局对象
             * 由于戚雨提供的BH_MOBILE需要依赖微信的js文件
             * 因此在加载BH_MOBILE前，先保证微信的js文件已加载
             */
            require(['BH_MOBILE'], function(BH_MOBILE) {
                window.BH_MOBILE = BH_MOBILE;
                //请求当前页面的微信签名
                MOB_UTIL.doPost({
                    url: url,
                    params: {
                        url: window.location.href.replace(/#(\S+)?/, '')
                    }
                }).done(function(result) {
                    dfd.resolve(result.data);
                });
            });
        }
        //不在微信环境直接返回 
        else {
            dfd.resolve();
        }
        return dfd.promise();
    }
    /**
     * 正则扫描模板文件，实现按钮权限
     */
    function compileTpl(tpl) {
        if (!window.MOBILE_BUTTONAUTH_LIST) {
            window.MOBILE_BUTTONAUTH_LIST = [];
        }
        //获取tpl中所有权限id
        var tplIds = [];
        var result;
        var pattern = new RegExp('auth-id=[\'|\"]{1}[^\'^\"]+[\'|\"]{1}', 'gm');
        while ((result = pattern.exec(tpl)) != null) {
            tplIds.push(result[0].substring(9, result[0].length - 1));
        };
        if (tplIds.length == 0) {
            return tpl;
        }

        //删除所有无权限的dom
        tplIds.forEach(function(id, index) {
            if (window.MOBILE_BUTTONAUTH_LIST.indexOf(id) < 0) {
                var regExp = new RegExp('<[^/].*(auth.*?auth-id=[\'|\"]{1}'+id+'[\'|\"]{1}).*?>[\\s\\S]*?</.*?auth>', 'gm');
                tpl = tpl.replace(regExp, "");
            }
        });

        return tpl;
    }
    
    function initI18n(){
    	if(!userId){
    		window.i18nMap = {};
    		return;
    	}
    	// 加载国际化资源
    	$.get(contextPath + '/i18n.do?appName=' + window.WIS_CONFIG.APPNAME + '&EMAP_LANG=' + i18nUtil.lang()).done(function(resp) {
    		if (resp.code == '0') {
    			window.i18nMap = resp.datas || {};
    		}
    	});
    	$.extend({
    	    i18n: function(key) {
    	        if (!key) {
    	            return key;
    	        }
    	        var tmps = key.split('|');
    	        var key = tmps[0];
    	        if (window.i18nMap[key]) {
    	            return window.i18nMap[key];
    	        }
    	        if (tmps.length > 1) {
    	            return tmps[1];
    	        }
    	        return tmps[0];
    	    }	    
    	});
    }
    
    function getYypzcs(){
    	if(!userId){
    		window.hasEkLocation = false;
    		return;
    	}
    	 MOB_UTIL.doPost({
             url: WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/MobileCommon/getYypzConfig.do',
             params: {}
         }).done(function(result) {
        	 if(result.data && result.data.hasEkLocation){
        		 window.hasEkLocation = true;
        	 }
         });
    }

    return spriteUtils;
});