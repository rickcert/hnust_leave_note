 define(function() {
   var emap_util = {
     /**
      * @method convertModel
      * @description 转换模型，给模型字段项加上get方法
      * @param {Object} model - 数据模型
      * @param {String} [type] - 类型 可选值  'form' 'grid' 'search'
      * @example 
      * WIS_EMAP_SERV.convertModel(dataModel);
      */
     convertModel: function(model, type) {
       if (model === undefined || model == null) {
         //getData = {code: 0,msg: "没有数据",models:[],datas:{}};
         return undefined;
       } else {
         if (type === undefined)
           return model.controls;
         else {
           if (model instanceof Array) {
             addGetMethod(model);
             return model;
           } else {
             addGetMethod(model.controls);
             if (type == "search")
               return model;
             else
               return model.controls;
           }
         }
       }

       function addGetMethod(model_array) {
         model_array.map(function(item) {
           item.get = function(field) {
             if (this[type + "." + field] !== undefined && this[type + "." + field] !== "")
               return this[type + "." + field];
             else
               return this[field];
           }
         })
       }
     },
     /**
      * @method getAbsPath
      * @description 获取绝对路径
      * @param {String} page_path 传入的相对路径
      * @return {String} - 绝对路径
      * @example 
      * WIS_EMAP_SERV.getAbsPath('modules/xsxxdbwh.do');
      * // 返回 "/emap/sys/student_app/modules/xsxxdbwh.do"
      */
     getAbsPath: function(page_path) {
       if (page_path === undefined) {
         console && console.warn('WIS_EMAP_SERV.getAbsPath 传参为空');
         return;
       }
       if (page_path.substring(0, 7) == "http://" || page_path.substring(0, 8) == "https://") {
         return page_path;
       }
       if (page_path.substring(0, 1) == '/') {
         page_path = page_path.substring(1, page_path.length);
       }

       //访问的是页面.do
       var page_found = page_path.match(/module*(.*?)\//);


       var absPath = emap_util.getAppPath() + "/" + page_path;
       return absPath;
     },

     /** 
      * @method getContextPath
      * @description 获取根路径
      * @return {String} - 应用页面的根路径
      * WIS_EMAP_SERV.getContextPath();
      * // 返回  '/emap'
      */
     getContextPath: function() {
       var contextPath = "";
       var path = window.location.pathname;
       var end = path.indexOf('/sys/');

       return path.substring(0, end) || '/emap';
     },

     /**
      * @method getAppPath
      * @description 获取应用路径
      * @return {String} - 当前应用路径
      * @example 
      * WIS_EMAP_SERV.getAppPath();
      * // 返回  "/emap/sys/student_app"
      */
     getAppPath: function() {
       var path = window.location.pathname;
       var start = path.indexOf('/sys/') + '/sys/'.length;

       var tmpPath = path.substring(start, path.length);
       var app_path = tmpPath.substring(0, tmpPath.indexOf("/"));
       return emap_util.getContextPath() + "/sys/" + app_path;
     },

     /**
      * @method getPageMeta
      * @description 获取emap pageMeta数据
      * @param  {String} pagePath - 页面地址
      * @param  {Object} params - 请求参数
      * @param  {Object} requestOption - 请求配置
      * @return {Object} pageMeta
      */
     getPageMeta: function(pagePath) {
       var params = {
         "*json": "1"
       };
       var pageMeta = emap_util.doSyncAjax(emap_util.getAbsPath(pagePath), params);
       window._EMAP_PageMeta = window._EMAP_PageMeta || {};
       window._EMAP_PageMeta[pagePath] = pageMeta;
       if (typeof pageMeta.loginURL != 'undefined') {
         window._EMAP_PageMeta = {};
       }
       return pageMeta;
     },

     /**
      * @method getModel
      * @description 获取emap模型
      * @param  {String} pagePath -  页面地址
      * @param  {String} actionID - 动作名称
      * @param  {String} type - 请求模型的类型，可选值 form grid search
      * @param  {Object} [params] - 请求参数
      * @param  {String} [requestOption] - 请求配置
      * @example 
      * var formModel = WIS_EMAP_SERV.getModel('modules/editForm.do', 'T_PXXX_XSJBXX_QUERY', 'form');
      */
     getModel: function(pagePath, actionID, type) {

       // add by liujun emapform的meta直接通过对象传入
       if (typeof(pagePath) === 'object') {
         return emap_util.convertModel(pagePath, type);
       }

       var pageMeta = emap_util.getPageMeta(pagePath);
       var model;

       var getData = pageMeta.models.filter(function(val) {
         return val.name == actionID
       });
       model = getData[0];
       emap_util.modelName = model.modelName;
       emap_util.appName = model.appName;
       emap_util.url = model.url;
       emap_util.name = model.name;

       return emap_util.convertModel(model, type);
     },

     /**
      * 同步ajax方法
      * @param  {String} url    请求URL
      * @param  {Object} params 请求参数
      * @param  {String} method 请求方法
      * @param  {Object} requestOption 请求配置
      */
     doSyncAjax: function(url, params, method) {
       var ajaxOptions = $.extend({}, {
         type: 'POST',
         url: url,
         traditional: true,
         data: params || {},
         dataType: 'json',
         cache: false,
         async: false,
         error: function(resp) {
           console.error("请求返回异常，请检查network：" + resp.status);
         }
       });
       var resp = $.ajax(ajaxOptions);
       var result;
       try {
         result = JSON.parse(resp.responseText);
       } catch (e) {
         //qiyu 2016-12-26 转换异常，终止程序
         console && console.error("数据格式有误，后台返回的数据无法转换为JSON格式：“" + resp.responseText + "”");
         throw e;
       }
       return result;
     }
   };

   return emap_util;
 });