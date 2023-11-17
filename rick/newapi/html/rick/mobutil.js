;
var MOB_UTIL = {};
(function(MOB_UTIL) {
    /**
     * get方式请求，尽量少用
     * @param params  {url:"http://www.baidu.com",params:{}}
     * @returns
     */
    MOB_UTIL.doGet = function getData(params) {
        var dfd = $.Deferred();
        mintUI.Indicator.open();
        axios({
            method: 'get',
            params: {
                "data": encodeURI(JSON.stringify(params.params ? params.params : {}))
            },
            url: params.url
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result);
            } else {
                result.msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', result.msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };
    /**
     * 异步数据请求，主要使用方式
     * @param params
     * @returns
     */
    MOB_UTIL.doPost = function getData(params) {
        var dfd = $.Deferred();
        if(!params.noLoading){
        	mintUI.Indicator.open();
        }
        axios({
            method: 'post',
            data: params.params ? params.params : {},
            url: params.url,
            transformRequest: [function(data) {
                return "data=" + encodeURIComponent(JSON.stringify(data));
            }]
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result);
            } else {
                //result.msg = result.msg || '系统内部错误，请联系管理员';
            	var msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };

    /**
     * get方式请求，根据actionName查询
     * @param params  
     * @returns
     */
    MOB_UTIL.doActionQuery = function getData(params) {
        var dfd = $.Deferred();
        var actionName = params.name;
        mintUI.Indicator.open();
        axios({
//            method: 'get',
            method: 'post',
            params: params.params ? params.params : {},
            url: params.url
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result.datas[actionName].rows);
            } else {
                result.msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', result.msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };

    /**
     * @param params  
     * @returns
     */
    MOB_UTIL.doActionExecute = function getData(params) {
        var dfd = $.Deferred();
        var actionName = params.name;
        mintUI.Indicator.open();
        axios({
            method: 'post',
            params: params.params ? params.params : {},
            url: params.url
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result.datas[actionName].rows);
            } else {
                result.msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', result.msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };
    
    /**
     * 用于提交大文本内容
     * 保存到数据模型中
     * params.params 数据格式如下
     * var paramObj = {}；
     * paramObj.DATA = JSON.stringify(self.formValue);
     * paramObj.DATA_MODEL = "T_XG_XS_TDQK";
     * paramObj.ACTION_TYPE = "ADD";新增/编辑 ADD/SAVE
     * @param params  
     * @returns
     */
    MOB_UTIL.doActionPostExecute = function getData(params) {
        var dfd = $.Deferred();
        mintUI.Indicator.open();
        axios({
            method: 'post',
            data: params.params ? params.params : {},
            url: contextPath+"/sys/swpubapp/publicApplySetting/dataModelExecute.do",
            transformRequest: [function(data) {
                return "data=" + encodeURIComponent(JSON.stringify(data));
            }]
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result);
            } else {
                result.msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', result.msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };
    

	/**
	 * 刷新字典
	 * 用于实时刷新字典内容
	 * @param appname 调用动作的app名称
	 * @param dicid	刷新的字典的id
	 */
    MOB_UTIL.refreshDic = function getData(appname, dicid) {
        var dfd = $.Deferred();
        mintUI.Indicator.open();
        axios({
            method: 'post',
            params: {},
            url:  WIS_EMAP_SERV.getContextPath() + "/sys/emapcomponent/clearDicCache.do?app=" + appname + "&dic=" + dicid + ""
        }).then(function(res) {
            mintUI.Indicator.close();
            var result = res.data;
            if (result.code === '0') {
                dfd.resolve(result);
            } else {
                result.msg = result.msg || '系统内部错误，请联系管理员';
                mintUI.MessageBox('提示', result.msg);
                dfd.reject(result);
            }
        }).catch(function(err) {
            //打印堆栈
            console.error(err);
            mintUI.Indicator.close();
            if (err.response) {
                mintUI.MessageBox('网络错误(' + err.response.status + ')', err.message);
            } else {
                err.message = err.message == 'Network Error' ? '网络连接不可用' : err.message;
                mintUI.MessageBox('错误', err.message);
            }
            dfd.reject(err);
        });
        return dfd.promise();
    };
})(window.MOB_UTIL = MOB_UTIL);