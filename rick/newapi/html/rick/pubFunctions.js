/**
 * 封装了常用的前端组件的使用方法
 * 使用本文件中的方法，需先引用***文件
 * 其他说明...
 * 创建时间：
 * 创建人：
 * 最后修改时间：
 * 最后修改人：
 */

;
var PUB_FUNC = {};

var default_db_error = {
	"resultCode": "19999",
	"msg": "unkown error"
};

/*
 *高级搜索中的文本字段集合，用于在高级搜索时将这些字段的条件构造器改为include，实现模糊搜索
 */
var ADVANCE_SERACHER_TEXT_FIELDS = {
	XH: true, //学号
	XM: true, //姓名
	XZ: true, //学制
	XZNJ: true, //现在年级
	KSH: true, //考生号
	TZSH: true, //通知书号
	YKTKH: true, //一卡通卡号
	SFZJH: true, //身份证件号
	HKSZD: true, //户口所在地
	SJH: true, //手机号
	DZXX: true, //电子信箱
	LXDH: true, //联系电话
	QQH: true, //QQ号
	WXH: true, //微信号
	JTDZ: true, //家庭地址
	JTDH: true, //家庭电话
	XMPY: true, //姓名拼音
	CYM: true, //曾用名
	ZNBMMC:true //奖学金职能部门名称
};

(function(PUB_FUNC) {

	PUB_FUNC.ADVANCE_SERACHER_TEXT_FIELDS = ADVANCE_SERACHER_TEXT_FIELDS;

	PUB_FUNC.REQUEST_PARAM_NAME = "requestParamStr=";

	/**
	 * 封装生成常规form表单的方法
	 * 说明：必传的参数有containerName,pageUrl,actionName
	 * @param containerName html/jsp文件中用于存放form的DOM元素的id属性值 e.g.  <div id="formCon"></div> 参数值为"formCon"
	 * @param pageUrl 页面路径（不含".do"） e.g. "/modules*teacher/violate_query"
	 * @param actionName 动作名称 e.g. "cxxscfjlxq"
	 * @param params 动作参数 e.g. {XSBH:'123',WID:'abc'}
	 * @param columns 列数 正整数
	 * @param readonly 是否只读 true/false
	 * @param isEmpty 是否创建一个空表单 为true表示生成的是一个新增表单 默认为false
	 * @param model 表单类型 分为水平和垂直两种，支持参数"h"（水平）/"v"（垂直），默认"h"
	 * @param inputWidth 水平表单 表单控件所占列数  默认6  最高12
	 */
	PUB_FUNC.buildFormByList = function(containerName, pageUrl, actionName, params, columns, readonly, isEmpty, model, fileOptions, rootpath, dataModel, inputWidth, defaultOptions) {
		var ROOT_PATH = rootpath ? rootpath : WIS_CONFIG.ROOT_PATH;
		// 解决底座不同，传递的参数pageUrl含.do的问题
		var modePageUrl = pageUrl;
		var urls = pageUrl.split("?");
		if(urls.length>1){
			if(urls[0].substr(urls[0].length-3).toLowerCase()!=".do"){
				modePageUrl = urls[0] + ".do?"+urls[1];
			}
		}else{
			if(pageUrl.substr(pageUrl.length-3).toLowerCase()!=".do"){
				modePageUrl = pageUrl + ".do";
			}
		}
		//var datamodel = WIS_EMAP_SERV.getModel(ROOT_PATH + modePageUrl, actionName, "form");
		var datamodel = dataModel ? dataModel : WIS_EMAP_SERV.getModel(ROOT_PATH + modePageUrl, actionName, "form");
		datamodel = PUB_FUNC.needHiddenSyzd(datamodel);
		
		var defaultOption = defaultOptions ? defaultOptions : {};
		defaultOption["tree"] = {
			unblind: '/'
		};
		//增加新版上传组件option限制信息
		if (fileOptions && fileOptions['cache-upload']) {
			defaultOption['cache-upload'] = fileOptions['cache-upload'];
		}else{
			defaultOption['cache-upload'] = {
					limit: 3,
					size: 5120,
					type: ['doc', 'jpg', 'png', 'jpeg', 'bmp', 'docx', 'zip', 'rar', 'pdf', 'xls', 'xlsx', 'txt']
			};
		}
		if (fileOptions && fileOptions.uploadfile) {
			defaultOption['uploadfile'] = fileOptions.uploadfile;
		} else {
			defaultOption['uploadfile'] = {
				limit: 3,
				size: 5120,
				type: ['doc', 'jpg', 'png', 'jpeg', 'bmp', 'docx', 'zip', 'rar', 'pdf', 'xls', 'xlsx', 'txt']
			};
		}
		if (fileOptions && fileOptions['uploadmuiltimage']) {
			defaultOption['uploadmuiltimage'] = fileOptions['uploadmuiltimage'];
		}else{
			defaultOption['uploadmuiltimage'] = {
					limit: 10,
					size: 5120,
					type: ['jpg', 'png', 'jpeg']
			};
		}
		var formObj = $("#" + containerName).emapForm({
			root: WIS_EMAP_SERV.getContextPath(),
			data: datamodel,
			textareaEasyCheck: true,
			autoCheck: true, //王敏提供RES新增的参数，配置后文本框输入中文字符算3个长度，textarea除外
			lengthCheck: true,
			readonly: (readonly == true) ? true : false,
			cols: (columns && !(isNaN(columns))) ? parseInt(columns) : 3,
			model: model ? model : "h",
			inputWidth: inputWidth ? inputWidth : '6',
			defaultOptions: defaultOption
		});
		isEmpty = (isEmpty == true) ? true : false;
		
		if (!isEmpty) {
			params = (params == undefined) ? null : params;
			// 解决底座不同，传递的参数pageUrl含.do的问题
			var newPageUrl = pageUrl;
			if(pageUrl.substr(pageUrl.length-3).toLowerCase()==".do"){
				newPageUrl = newPageUrl.substr(0,pageUrl.length-3);
			}
			var data = BH_UTILS.doSyncAjax(ROOT_PATH + newPageUrl + "/" + actionName + ".do", params, "POST");
			var value = data.datas[actionName].rows;
			if (value && value.length > 0) {
				$("#" + containerName).emapForm('setValue', value[0]);
			}
		}
		return formObj;
	};

	/**
	 * 封装生成常规form表单的方法，与buildFormByList的区别在于传的参数不同，该方法接受的参数为拼装好相应属性的对象
	 * 拼装成对象的好处是，不用在意参数的顺序，可以更好的使用默认值
	 * 说明：对象中必需的参数有containerName,pageUrl,actionName
	 * @param paramObj 参数对象
	 */
	PUB_FUNC.buildFormByObj = function(paramObj) {
		var containerName = paramObj.containerName;
		var pageUrl = paramObj.pageUrl;
		var actionName = paramObj.actionName;
		//判断是否PostgreSQL数据库
		if(paramObj.validateDB && WIS_CONFIG.ISPOSTGRES == "true"){
			actionName += "_pg";
		}
		var params = paramObj.params;
		var columns = paramObj.columns;
		var readonly = paramObj.readonly;
		var model = paramObj.model;
		var isEmpty = paramObj.isEmpty;
		isEmpty = (isEmpty == true) ? true : false;
		if (isEmpty) {
			readonly = false;
		}
		var fileOptions = paramObj.fileOptions;
		var rootath = paramObj.rootpath;
		var dataModel = paramObj.dataModel;
		var inputWidth = paramObj.inputWidth;
		var defaultOptions = paramObj.defaultOptions;
		
		return PUB_FUNC.buildFormByList(containerName, pageUrl, actionName, params, columns, readonly, isEmpty, model, fileOptions, rootath, dataModel, inputWidth, defaultOptions);
	};

	/**
	 * 否隐藏书院相关字段
	 * type: search|guid|form,由于guid与form返回值一样，所以设为默认
	 * @param zdArr 模型字段数组
	 */
	PUB_FUNC.needHiddenSyzd = function(dataModel,type){
		if("undefined" == typeof SFKQSYZ) {
			return dataModel;
		}
		if(!SFKQSYZ) {
			if(type == "search") {
				var zdArr = dataModel.controls;
				for (var i = 0; i < zdArr.length; i++) {
					if(zdArr[i].name == 'SYDM' || zdArr[i].name == 'SYBJDM' || zdArr[i].name == 'XSXYSYLX'){
						zdArr[i]['hidden'] = true;
						zdArr[i]['grid.fixed'] = true;
					}
				}
				dataModel.controls = zdArr;
			} else {
				for (var i = 0; i < dataModel.length; i++) {
					if(dataModel[i].name == 'SYDM' || dataModel[i].name == 'SYBJDM'){
						dataModel[i]['hidden'] = true;
						dataModel[i]['grid.fixed'] = true;
					}
				}
			}
		}
		if(SFKQSYZ) {
			if(type == "search") {
				var zdArr = dataModel.controls;
				for (var i = 0; i < zdArr.length; i++) {
					/*if(zdArr[i].name == 'SHJZSJ'){
						zdArr[i]['caption'] = "学院/书院审核截止日期";
					}*/
					if(zdArr[i].name == 'MC' && zdArr[i].caption == '院系'){
						zdArr[i]['caption'] = "学院/书院";
					}
					if(zdArr[i].name == 'XYSYDM' && zdArr[i].caption == '学院'){
						zdArr[i]['caption'] = "学院/书院";
					}
				}
				dataModel.controls = zdArr;
			} else {
				for (var i = 0; i < dataModel.length; i++) {
					/*if(dataModel[i].name == 'SHJZSJ'){
						dataModel[i]['caption'] = "学院/书院审核截止日期";
					}*/
					if(dataModel[i].name == 'MC' && dataModel[i].caption == '院系'){
						dataModel[i]['caption'] = "学院/书院";
					}
					if(dataModel[i].name == 'XYSYDM' && dataModel[i].caption == '学院'){
						dataModel[i]['caption'] = "学院/书院";
					}
					if(dataModel[i].name == 'YXJZSJ'){
						dataModel[i]['caption'] = "学院/书院截止日期";
					}
				}
			}
		}
	
		return dataModel;
	};


	/**
	 * 封装生成常规table的方法
	 * 说明：必传的参数有containerName,pageUrl,actionName
	 * @param containerName html/jsp文件中用于存放生成table的DOM元素的id属性值 e.g. <div id="tableCon"></div> 参数为"tableCon"
	 * @param pageUrl 页面路径（不含.do） e.g. "modules*teacher/violate_query"
	 * @param actionName 动作名 e.g. "wjcfcx"
	 * @param params 动作的参数
	 * @param customColumns 操作列 ,自己拼装的操作列对象数组
	 * @param pageable 是否有分页
	 * @param searchContainerName 高级查询的DOM容器节点的id属性值，如果不传的话，表示没有
	 * @param sfkqsyz 是否开启书院制
	 */
	PUB_FUNC.createTableByList = function(containerName, pageUrl, actionName, params, customColumns, sortable, pageable, searchContainerName, selectionMode, renderedFunction, onceParams, pagerMode, rootPath, lineNum, pageSizeOptions, pageSize,searcherInitComplete, replaceColumns,columnsResize) {
		var ROOT_PATH = rootPath ? rootPath : "";
		var urls = pageUrl.split("?");
		if(urls.length>1){
			pageUrl = urls[0]+".do?"+urls[1];
		}else{
			pageUrl = pageUrl +  ".do";
		}
		
		//表格模型
		var tableDatamodel = WIS_EMAP_SERV.getModel(ROOT_PATH + pageUrl, actionName, "grid", (params == undefined) ? {} : params);
		tableDatamodel = PUB_FUNC.needHiddenSyzd(tableDatamodel);
		
		var options = {
			pagePath: ROOT_PATH + pageUrl,
			height: null,
			minLineNum: (lineNum == undefined) ? 10 : lineNum,
			params: (params == undefined) ? {} : params,
			action: actionName,
			datamodel: tableDatamodel,
			pageable: (pageable == false) ? false : true,
			sortable: (sortable == true) ? true : false,
			customColumns: (customColumns == undefined) ? [] : customColumns,
			selectionMode: selectionMode ? selectionMode : 'custom',
			onceParams: (onceParams == undefined) ? {} : onceParams,
			enableBrowserSelection: true,
			fastRender: true,
			rendered: renderedFunction,
			pageSizeOptions: (pageSizeOptions == undefined) ? [10, 20, 50, 100] : pageSizeOptions,
			pageSize: (pageSize == undefined) ? 10 : pageSize,
			fxss:true,
			columnsResize:(columnsResize == undefined) ? true : columnsResize,
			replaceColumns: replaceColumns ? replaceColumns : []
		};
		if (pagerMode) {
			options.pagerMode = pagerMode;
		}
		var tableObj = $("#" + containerName).emapdatatable(options);
		//如果参数传了高级查询的DOM元素id,则为table创建一个相关的高级查询组件
		if (searchContainerName) {
			PUB_FUNC.createSearcher(searchContainerName, ROOT_PATH + pageUrl, actionName, function(condition) {
				//生源地单独处理，解决生源地查询时，需要能查询到子节点的相关数据 问题 ----eidt by shifeng  2017-8-9 13:54:27
				if ($('#' + searchContainerName).emapAdvancedQuery(true).options.searchModel == 'advanced') {
					//解析json
					condition = JSON.parse(condition);
					//遍历结果集合，如果是SYDDM, 则判断是否有具体值
					for (var i = 0; i < condition.length; i++) {
						//基本信息 SYDDM CSDDM
						if ((condition[i].name == 'SYDDM' || condition[i].name == 'CSDDM' ||
								condition[i].name == 'JTDZQH' || condition[i].name == 'JG') && condition[i].value.length == 6) {
							var ssyValue = condition[i].value;
							var secondValue = ssyValue.substr(2, 2); //第二级，市
							var thirdValue = ssyValue.substr(4, 2); //第三级 县镇
							condition[i].builder = 'beginWith';
							//市不存在，只留省份
							if (secondValue == '00') {
								condition[i].value = condition[i].value.substr(0, 2);
								continue;
							}
							//县镇不存在，只留省份市 00 表示没有
							if (thirdValue == '00') {
								condition[i].value = condition[i].value.substr(0, 4);
								continue;
							}
						}

						// 政工队伍 ，ZYJSZWDM
						if (condition[i].name == 'ZYJSZWDM' && condition[i].value.length == 3) {
							//参数值
							var ssyValue = condition[i].value;
							var secondValue = ssyValue.substr(2, 1); //第二级
							//市不存在，只留省份
							if (secondValue == '0') {
								condition[i].value = condition[i].value.substr(0, 2);
								continue;
							}
						}
					}
					//格式转换
					condition = JSON.stringify(condition);
				}
				$("#" + containerName).emapdatatable('reloadFirstPage', {
					"querySetting": condition
				});
			},searcherInitComplete);
			//如果是新生管理的  1  否则为 0
			if (actionName == "xsxxbgdz") {
				PUB_FUNC.searchContainerAutoCombo(searchContainerName, "1");
			} else if (searchContainerName.indexOf("jxjSearch")!=-1 || searchContainerName.indexOf("rychSearch")!=-1) { //奖学金审核 荣誉称号BJDM为评奖单位
				PUB_FUNC.searchContainerAutoCombo(searchContainerName, "2");
			} else {
				PUB_FUNC.searchContainerAutoCombo(searchContainerName, "0");
			}
		}
		return tableObj;
	};

	/**
	 * 封装生成常规table的方法，与createTableByList的区别在于传的参数不同，该方法接受的参数为拼装好相应属性的对象
	 * 拼装对象的好处是，不用在意参数的顺序，可以更好的利用默认值
	 * 说明：对象中必需的参数有containerName,pageUrl,actionName
	 * @param paramObj
	 */
	PUB_FUNC.createTableByObj = function(paramObj) {
		var containerName = paramObj.containerName;
		var pageUrl = paramObj.pageUrl;
		var actionName = paramObj.actionName;
		//判断是否PostgreSQL数据库
		if(paramObj.validateDB && WIS_CONFIG.ISPOSTGRES == "true"){
			actionName += "_pg";
		}
		var params = paramObj.params;
		var customColumns = paramObj.customColumns;
		var sortable = paramObj.sortable;
		var pageable = paramObj.pageable;
		var searchContainerName = paramObj.searchContainerName;
		var selectionMode = paramObj.selectionMode;
		var onceParams = paramObj.onceParams;
		var renderedFunction = paramObj.rendered;
		var pagerMode = paramObj.pagerMode;
		var rootpath = paramObj.rootpath;
		var lineNum = paramObj.lineNum;
		var pageSizeOptions = paramObj.pageSizeOptions;
		var pageSize = paramObj.pageSize;
		var searcherInitComplete = paramObj.searcherInitComplete;
		var replaceColumns = paramObj.replaceColumns;
		var columnsResize = paramObj.columnsResize;
		
		return PUB_FUNC.createTableByList(containerName, pageUrl, actionName, params, customColumns, sortable, pageable, searchContainerName, selectionMode, renderedFunction, onceParams, pagerMode, rootpath, lineNum, pageSizeOptions, pageSize,searcherInitComplete, replaceColumns,columnsResize);
	};



	/**
	 * 封装生成高级查询组件的方法
	 * @param containerName html/jsp文件中用于存放高级搜索的DOM元素的id属性值 e.g. <div id="searchCon"></div> 参数为"searchCon"
	 * @param pageUrl 页面路径（不含.do） e.g. "modules*teacher/violate_query"
	 * @param actionName 动作名
	 * @param callback 高级搜索组件查询时的回调函数，该函数可以获得查询条件参数
	 */
	PUB_FUNC.createSearcher = function(containerName, pageUrl, actionName, callback,searcherInitComplete) {
		var urlAndParam = pageUrl.split("?");
		if(urlAndParam.length>1){
			if(urlAndParam[0].substr(urlAndParam[0].length-3).toLowerCase()!=".do"){
				pageUrl = urlAndParam[0] + ".do?"+urlAndParam[1];
			}
		}else{
			if(pageUrl.substr(pageUrl.length-3).toLowerCase()!=".do"){
				pageUrl = pageUrl + ".do";
			}
		}
		//搜索模型
		var dataModel = WIS_EMAP_SERV.getModel(pageUrl, actionName, "search");
		dataModel = PUB_FUNC.needHiddenSyzd(dataModel, "search");
		
		$("#" + containerName).emapAdvancedQuery({
			data: dataModel,
            initComplete: function() {
                if (searcherInitComplete && (typeof searcherInitComplete) === "function") {
                    searcherInitComplete();
                }
            }
		});
		$("#" + containerName).on('search', function(e, condition) {
			var queryOptions = JSON.parse(condition);
			//将所有注册为文本字段的条件构造器修改为include,用以实现模糊搜索
			$(queryOptions).each(function(index) {
				var queryOption = this;
				//如果为组合条件,则继续遍历
				if (queryOption instanceof Array) {
					$(queryOption).each(function() {
						//如果该字段注册为文本字段，则修改条件构造器
						if (ADVANCE_SERACHER_TEXT_FIELDS[this.name] && this.builder == 'equal') {
							this.builder = 'include';
						}
					});
				} else {
					//如果该字段注册为文本字段，则修改条件构造器
					if (ADVANCE_SERACHER_TEXT_FIELDS[this.name] && this.builder == 'equal') {
						this.builder = 'include';
					}
				}
			});
			condition = JSON.stringify(queryOptions);
			if (typeof(callback) == "function") {
				callback(condition);
			}
		});
	};


	/**
	 * 封装导出功能
	 * @param el 封装好的参数对象，其中需拼装的属性有 "app","contextPath","module","page","action","querySetting","*order","containerId"
	 */
	PUB_FUNC.exportfn = function(el) {

		var $table = $("#" + el.containerId);
		if (el.isGrid) {
			$table = $("#" + el.containerId).emapGrid('getTable');
		}
		var url = el.contextPath + "/sys/emapcomponent/imexport/export.do";
		var params = el;
		//判断是否PostgreSQL数据库
		if(params.validateDB && WIS_CONFIG.ISPOSTGRES == "true"){
			params.action += "_pg";
		}
		params["module"] = el.module ? el.module : "*default";
		if (!el.colnames) {
			var visibleColumns = $table.emapdatatable("getVisibleColumns");
			var colnames = "";
			for (var i = 0; i < visibleColumns.length; i++) {
				if (visibleColumns[i].datafield && visibleColumns[i].datafield != "field_checkbox") {
					colnames += visibleColumns[i].datafield.replace("_DISPLAY", "") + ",";
				}
			}
			params["colnames"] = colnames.substr(0, colnames.length - 1);
		}
		if (!el.order) {
			var pxzd = $table.emapdatatable("getSort");
			if (pxzd && pxzd.length > 0) {
				params["*order"] = pxzd.exp.replace("_DISPLAY", "");
			}
		} else {
			params["*order"] = el.order;
		}

		jQuery.ajax({
			url: url,
			data: params,
			type: 'post',
			dataType: 'json',
			cache: false,
			success: function(ret) {
				var attachment = ret.attachment;
				var url = el.contextPath + "/sys/emapcomponent/file/getAttachmentFile/" + attachment + ".do";
				window.location.href = url;
				return false;
			},
			error: function(resp) {
				if (resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
			}
		});
	};


	/**
	 * 导出功能方法，支持
	 * @author 01116077
	 * @param 	el  参数对象
	 * 		   	app 应用名
	 * 		   	contextPath 上下文路径
	 * 		   	module      模块名称
	 * 			page        页面
	 * 			action      动作
	 * 			querySetting 查询参数！
	 * 			*order       排序
	 * 			containerId  表格ID
	 * 时间：2017-8-9 18:58:03
	 */
	PUB_FUNC.exportExtraFieldfn = function(el) {

		var $table = $("#" + el.containerId);
		if (el.isGrid) {
			$table = $("#" + el.containerId).emapGrid('getTable');
		}
		//参数处理
		if (el.querySetting) {
			var querySetting = JSON.parse(el.querySetting);
			PUB_FUNC.calculateExportSearch(querySetting);
			el.querySetting = JSON.stringify(querySetting);
		}
		var url = el.contextPath + "/sys/emapcomponent/imexport/export.do";
		var params = el;
		params["module"] = el.module ? el.module : "*default";
		if (!el.colnames) {
			var visibleColumns = $table.emapdatatable("getVisibleColumns");
			var colnames = "";
			for (var i = 0; i < visibleColumns.length; i++) {
				if (visibleColumns[i].datafield && visibleColumns[i].datafield != "field_checkbox") {
					colnames += visibleColumns[i].datafield.replace("_DISPLAY", "") + ",";
				}
			}
			params["colnames"] = colnames.substr(0, colnames.length - 1);
		}
		if (!el.order) {
			var pxzd = $table.emapdatatable("getSort");
			if (pxzd && pxzd.length > 0) {
				params["*order"] = pxzd.exp.replace("_DISPLAY", "");
			}
		} else {
			params["*order"] = el.order;
		}
		jQuery.ajax({
			url: url,
			data: params,
			type: 'post',
			dataType: 'json',
			cache: false,
			success: function(ret) {
				var attachment = ret.attachment;
				var url = el.contextPath + "/sys/emapcomponent/file/getAttachmentFile/" + attachment + ".do";
				window.location.href = url;
				return false;
			},
			error: function(resp) {
				if (resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
			}
		});
	};


	/**
	 * 支持生源地，出生地等树形高级检索字段数据处理
	 * 生源地 ，出生地等字段，为三级联动，选择上一级，则把下面的所有数据全部查出来
	 * @author 01116077
	 * @param querySetting  对象
	 * 时间：2017-8-9 18:52:06
	 */
	PUB_FUNC.calculateExportSearch = function(querySetting) {
		//遍历数组
		for (var i = 0; i < querySetting.length; i++) {
			//对象，为高级检索模式
			if (querySetting[i] instanceof Object) {
				//匹配字段， SYDDM ， CSDDM 等字段，且存在查询值
				if ((querySetting[i].name == 'SYDDM' || querySetting[i].name == 'CSDDM' ||
						querySetting[i].name == 'JTDZQH' || querySetting[i].name == 'JG') &&
					querySetting[i].value.length == 6) {
					//参数值
					var ssyValue = querySetting[i].value;
					var secondValue = ssyValue.substr(2, 2); //第二级，市
					var thirdValue = ssyValue.substr(4, 2); //第三级 县镇
					//市不存在，只留省份
					if (secondValue == '00') {
						querySetting[i].value = querySetting[i].value.substr(0, 2);
						continue;
					}
					//县镇不存在，只留省份市 00 表示没有
					if (thirdValue == '00') {
						querySetting[i].value = querySetting[i].value.substr(0, 4);
						continue;
					}
				}

				// 政工队伍 ，ZYJSZWDM
				if (querySetting[i].name == 'ZYJSZWDM' && querySetting[i].value.length == 3) {
					//参数值
					var ssyValue = querySetting[i].value;
					var secondValue = ssyValue.substr(2, 1); //第二级，市
					//市不存在，只留省份
					if (secondValue == '0') {
						querySetting[i].value = querySetting[i].value.substr(0, 2);
						continue;
					}
				}
			}

			//数组复合结构 [ [{},{}] , []]
			if (querySetting[i] instanceof Array) {
				for (var j = 0; j < querySetting[i].length; j++) {
					if (querySetting[i][j] instanceof Object) {
						//匹配字段， SYDDM ， CSDDM 等字段，且存在查询值
						if ((querySetting[i][j].name == 'SYDDM' || querySetting[i][j].name == 'CSDDM' ||
								querySetting[i][j].name == 'JTDZQH' || querySetting[i][j].name == 'JG') && querySetting[i][j].value.length == 6) {
							var ssyValue = querySetting[i][j].value;
							var secondValue = ssyValue.substr(2, 2); //第二级，市
							var thirdValue = ssyValue.substr(4, 2); //第三级 县镇
							//市不存在，只留省份
							if (secondValue == '00') {
								querySetting[i][j].value = querySetting[i][j].value.substr(0, 2);
								continue;
							}
							//县镇不存在，只留省份市 00 表示没有
							if (thirdValue == '00') {
								querySetting[i][j].value = querySetting[i][j].value.substr(0, 4);
								continue;
							}
						}
					}

					// 政工队伍 ，ZYJSZWDM
					if (querySetting[i].name == 'ZYJSZWDM' && querySetting[i].value.length == 3) {
						//参数值
						var ssyValue = querySetting[i].value;
						var secondValue = ssyValue.substr(2, 1); //第二级，市
						//市不存在，只留省份
						if (secondValue == '0') {
							querySetting[i].value = querySetting[i].value.substr(0, 2);
							continue;
						}
					}
				}
			}
		}
	};

	/**
	 * 封装报表上传导出功能
	 * @param data
	 * 			var data = new FormData();
	 * 			data.append("inputfile", $('#inputfile').prop('files')[0]); //报表文件
				data.append("id",$('#schemeNameID').val());   				//id 为空新增，不为空更新
				data.append("schemeName",lbmc+"离校单");						//方案名称
				data.append("tag",lbdm);									//报表标识
				data.append("appname",WIS_CONFIG.APPNAME);					//报表所在应用名
	 */
	PUB_FUNC.saveReport = function(data, callback) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		/*$.ajax({
		    type: 'POST',
		    processData: false,
		    contentType: false,
		    data: data,
		    url: (window.location.origin + WIS_CONFIG.PATH+"/sys/frReport/webapi/schemes/custom.do"),
		    dataType : 'json',
		    success: function(returnData){
		    	if (returnData != "true") {

				}else{
					callback();
				}
		    }
		});*/

		//modify by 01314118 2016-08-08
		//data 为FormData类型 IE9 不兼容，修改为版本上传组件方式
		//fileupload 使用 send 提交时 files 不能为空，创建默认空值,具体内容在 formData中 提交
		var files = [];
		files.push({
			'lastModified': '',
			'lastModifiedDate': '',
			'name': "",
			'size': 1,
			'type': "",
			'webkitRelativePath': ""
		});
		var $dom = $('<input type="file" id = "reportdomid">');
		$dom.fileupload({
			autoUpload: false,
			dataType: 'json',
			done: function(e, data) {
				if (data.result != "true") {

				} else {
					callback();
				}
			}
		});
		$dom.fileupload('send', {
			url: (window.location.origin + WIS_CONFIG.PATH + "/sys/frReport/webapi/schemes/custom.do"),
			files: files,
			formData: data
		});
	};

	/**
	 * 封装报表删除功能
	 * @param id        保存报表的 id（必填）
	 * 		  callback  回调成功回调
	 */
	PUB_FUNC.deleteReport = function(id, callback) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		$.ajax({
			type: "DELETE",
			url: (window.location.origin + WIS_CONFIG.PATH + '/sys/frReport/webapi/schemes/' + id + '.do'),
			data: "",
			datatype: "json",
			async: false,
			success: function(data) {
				callback();
			},
			error: function(data) {
				$.bhDialog({
					title: '后台数据异常，请联系管理员',
					iconType: 'warning'
				});
				return false;
			}
		});
	};

	/**
	 * 封装报表发布功能
	 * @param id 保存报表的 id（必填）
	 * 		  started  （true发布：false 取消发布）
	 * 		  callback  回调
	 */
	PUB_FUNC.switchSchemeStatus = function(id, started, callback) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		$.ajax({
			url: (window.location.origin + WIS_CONFIG.PATH + "/sys/frReport/webapi/schemes/switchSchemeStatus.do"),
			data: {
				"started": started,
				"id": id
			},
			type: "POST",
			async: false,
			success: function(data) {
				if (!data) {
					//swal("", data, "error");
				} else {
					callback();
				}
			}
		});
	};
	/**
	 * 封装获取报表信息功能
	 * @param id 保存报表的 id（必填）
	 */
	PUB_FUNC.getReportById = function(id) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		var temp = "";
		$.ajax({
			url: (window.location.origin + WIS_CONFIG.PATH + '/sys/frReport/webapi/schemes/' + id + '.do'),
			data: "",
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			async: false,
			success: function(data) {
				temp = data;
			}
		});
		return JSON.parse(temp);
	};


	/**
	 * 刷新字典
	 * 用于实时刷新字典内容
	 * @param appname 调用动作的app名称
	 * @param dicid	刷新的字典的id
	 */
	PUB_FUNC.refreshDic = function(appname, dicid) {
		$.ajax({
			url: WIS_EMAP_SERV.getContextPath() + "/sys/emapcomponent/clearDicCache.do?app=" + appname + "&dic=" + dicid + "",
			type: 'post',
			dataType: 'json',
			async: false,
			error: function(resp) {
				if (resp.status == 0 || resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}


				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
				$.bhDialog({
					title: '刷新异常，请联系管理员',
					iconType: 'warning'
				});
				//swal('刷新异常，请联系管理员！');
				return;
			},
			success: function(data) {
				if (data.code == 0) {} else {
					$.bhDialog({
						title: '刷新异常，请联系管理员',
						iconType: 'warning'
					});
					//swal('刷新异常，请联系管理员');
					return;
				}
			}
		});
	};



	/**
	 * 封装弹出框功能
	 * @param paramObj 拼装号的参数对象,其中可配的属性如下
	 ** iconType 图标类型 暂时只支持success/warning/danger
	 ** title 标题 对话框显示的标题
	 ** content 正文 对话框显示的正文
	 ** className 样式名 可以给对话框加上自定义的类
	 ** width 宽度 对话框默认的宽度 默认值464
	 ** height 高度 对话框默认的高度 默认值330
	 ** buttons 按钮集 对话框中展示的按钮集 默认值 [{text:'确定',className:'bh-btn-primary',callback:null}]
	 */
	PUB_FUNC.cPopup = function(paramObj) {
		var classJudge = false;
		var utils = require('utils');
		var bhVersion = utils.getConfig('BH_VERSION');
		if (bhVersion == '' || bhVersion == null || bhVersion == undefined || bhVersion == '1.1') {
			//need className
			classJudge = true;
		}

		console.log(utils);
		if (paramObj && paramObj.iconType && paramObj.iconType == "warning") {
			paramObj.buttons = [{
				text: '确定',
				className: (classJudge ? 'bh-btn-warning' : ''),
				callback: null
			}];
		}
		$.bhDialog(paramObj);
	};

	/**
	 * 封装的成功弹出框，可以定时消失
	 * @param title 标题
	 * @param content 内容
	 * @param time 消失的时间 毫秒为单位
	 */
	PUB_FUNC.tPopup = function(title, content, time, callback) {
		var classJudge = false;
		var utils = require('utils');
		var bhVersion = utils.getConfig('BH_VERSION');
		if (bhVersion == '' || bhVersion == null || bhVersion == undefined || bhVersion == '1.1') {
			//need className
			classJudge = true;
		}
		var paramObj = {};
		var uniqueClassMark = PUB_FUNC.randomString();
		paramObj["title"] = title;
		paramObj["content"] = content;
		paramObj["iconType"] = "success";
		if (!paramObj["content"] || paramObj["content"] === '') {
			paramObj["content"] = paramObj["title"];
			paramObj["title"] = "提示";
		}
		var buttons = [{
			text: '确定',
			className: (classJudge ? 'bh-btn-primary ' : '') + uniqueClassMark,
			callback: (callback ? callback : null)
		}];
		paramObj["buttons"] = buttons;
		time = (time && !isNaN(time)) ? parseInt(time) : 3000;
		$.bhDialog(paramObj);
		setTimeout(function() {
			var $dom = $('.bh-dialog-btnContainerBox a');
			if($dom.length==1){
				$dom.trigger("click");
			}
		}, time);
	};


	/**
	 * 封装的警告弹出框，弹出框必须点击确定后消失
	 * @param title 标题
	 * @param content 内容
	 */
	PUB_FUNC.tPopup_Warning = function(title, content, param, callback) {
		var classJudge = false;
		var utils = require('utils');
		var bhVersion = utils.getConfig('BH_VERSION');
		if (bhVersion == '' || bhVersion == null || bhVersion == undefined || bhVersion == '1.1') {
			//need className
			classJudge = true;
		}
		var paramObj = {};
		var uniqueClassMark = PUB_FUNC.randomString();
		paramObj = param;
		paramObj["title"] = title;
		paramObj["content"] = content;
		paramObj["iconType"] = "";
		var buttons = [{
			text: '确定',
			className: (classJudge ? 'bh-btn-warning' : '') + uniqueClassMark,
			callback: (callback ? callback : null)
		}];
		paramObj["buttons"] = buttons;
		if (!paramObj["content"] || paramObj["content"] === '') {
			paramObj["content"] = paramObj["title"];
			paramObj["title"] = "提示";
		}
		BH_UTILS.bhDialogWarning(paramObj);
	};


	/**
	 * 封装的危险弹出框，弹出框必须点击确定后消失
	 * @param title 标题
	 * @param content 内容
	 */
	PUB_FUNC.tPopup_Danger = function(title, content, param, callback) {
		var classJudge = false;
		var utils = require('utils');
		var bhVersion = utils.getConfig('BH_VERSION');
		if (bhVersion == '' || bhVersion == null || bhVersion == undefined || bhVersion == '1.1') {
			//need className
			classJudge = true;
		}
		var paramObj = {};
		var uniqueClassMark = PUB_FUNC.randomString();
		paramObj = param;
		paramObj["title"] = title;
		paramObj["content"] = content;
		paramObj["iconType"] = "";
		var buttons = [{
			text: '确定',
			className: (classJudge ? 'bh-btn-primary' : '') + uniqueClassMark,
			callback: (callback ? callback : null)
		}];
		paramObj["buttons"] = buttons;
		if (!paramObj["content"] || paramObj["content"] === '') {
			paramObj["content"] = paramObj["title"];
			paramObj["title"] = "提示";
		}
		BH_UTILS.bhDialogDanger(paramObj);
	};


	/**
	 * 获取一个指定长度的随机字符串
	 * @param len 生成的字符串的长度 默认32位
	 */
	PUB_FUNC.randomString = function(len) {
		len = len || 32;
		var usingChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var maxPos = usingChars.length;
		var resultStr = "";
		for (var i = 0; i < len; i++) {
			resultStr += usingChars.charAt(Math.floor(Math.random() * maxPos));
		}
		return resultStr;
	};



	/**
	 * 获取请求URL后请求参数
	 * @param name 参数名
	 */
	PUB_FUNC.GetQueryString = function(name) {
		var reg = new RegExp('.*[?&]' + name + '\=([^\&]*)\&?.*');
		var value = window.location.hash.replace(reg, "$1");
		if (window.location.hash == value) {
			return '';
		}
		return value;
	};

	/**
	 * ajax请求
	 *
	 * @param url
	 * @param params
	 * @returns {}
	 */
	PUB_FUNC.ajaxQuery = function(url, params, name) {
		var rData = "";
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			data: params,
			async: false, // 默认为true 异步
			error: function(resp) {
				if (resp.status == 0 || resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
				$.bhDialog({
					title: '后台数据异常，请联系管理员',
					iconType: 'warning'
				});
				return;
			},
			success: function(data) {
				if (data.code == 0) {
					rData = data.datas[name].rows;
				} else {
					$.bhDialog({
						title: '数据获取异常，请联系管理员',
						iconType: 'warning'
					});
					return;
				}
			}
		});
		return rData;
	};
	/**
	 * ajax请求
	 *
	 * @param url
	 * @param params
	 * @returns callback
	 */
	PUB_FUNC.ajaxaction = function(url, params, callback, async) {
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			data: params,
			async: async ? true : false,
			error: function(resp) {
				if (resp.status == 0 || resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
				$.bhDialog({
					title: '后台数据异常，请联系管理员',
					iconType: 'warning'
				});
				return;
			},
			success: function(data) {
				if (data.code == 0) {
					callback(data);
				} else {
					//参数是否正常，有误提示！！！！
					if (data.code == AJAX_PARAM_ERROR) {
						BH_UTILS.bhDialogWarning({
							title: '警告',
							content: '请求参数错误 请重试',
							buttons: [{
								text: '确认',
								className: 'bh-btn-warning',
								callback: function() {}
							}]
						});
					} else {
						$.bhDialog({
							title: '数据获取异常，请联系管理员',
							iconType: 'warning'
						});
						return;
					}
				}
			}
		});
	};

	/**
	 * 新版ajax请求，支持动作和自定义(同步)
	 *
	 * @param url
	 * @param params
	 * @returns callback
	 */
	PUB_FUNC.ajaxPost = function(url, params, successCallback, errorCallback) {
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			data: params,
			async: false,
			error: function(resp) {
				if (resp.status == 0 || resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
				$.bhDialog({
					title: '后台数据异常，请联系管理员',
					iconType: 'warning'
				});
				errorCallback(default_db_error);
			},
			success: function(data) {
				if (null == data.code || undefined == data.code || data.code == 0) {
					successCallback(data);
				} else {
					$.bhDialog({
						title: '后台数据异常，请联系管理员',
						iconType: 'warning'
					});
					successCallback(default_db_error);
				}
			}
		});
	};

	/**
	 * 新版ajax请求，支持动作和自定义(异步)
	 *
	 * @param url
	 * @param params
	 * @returns callback
	 */
	PUB_FUNC.ajaxPostAsync = function(url, params, successCallback, errorCallback) {
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			data: params,
			error: function(resp) {
				if (resp.status == 0 || resp.status == 401) {
					window.location.reload();
				} else if (resp.status == 403) {
					BH_UTILS.bhDialogWarning({
						title: '提示',
						content: '当前角色权限不足，请切换角色后重新操作',
						buttons: [{
							text: '确认',
							className: 'bh-btn-warning',
							callback: function() {}
						}]
					});
					return false;
				}
				// 长时间未操作提示错误
				if (resp.statusText.indexOf("NetworkError") > -1) {
					BH_UTILS.bhDialogDanger({
						title: '网络错误',
						content: '您可以尝试刷新页面解决该问题',
						buttons: [{
							text: '关闭',
							className: 'bh-btn-default'
						}]
					});
					return false;
				}
				$.bhDialog({
					title: '后台数据异常，请联系管理员',
					iconType: 'warning'
				});
				errorCallback(default_db_error);
			},
			success: function(data) {
				if (null == data.code || undefined == data.code || data.code == 0) {
					successCallback(data);
				} else {
					$.bhDialog({
						title: '后台数据异常，请联系管理员',
						iconType: 'warning'
					});
					successCallback(default_db_error);
				}
			}
		});
	};


	/**
	 * 确认弹出框
	 *
	 * @param url
	 * @param params
	 * @returns callback
	 */
	PUB_FUNC.confirmDialog = function(title, callback, text) {
		var classJudge = false;
		var utils = require('utils');
		var bhVersion = utils.getConfig('BH_VERSION');
		if (bhVersion == '' || bhVersion == null || bhVersion == undefined || bhVersion == '1.1') {
			//need className
			classJudge = true;
		}
		var buttons = [{
			text: text ? text : "确认",
			className: classJudge ? "bh-btn-warning" : '',
			callback: function() {
				callback();
			}
		}, {
			text: "取消",
			className: classJudge ? "bh-btn-default" : ''
		}];
		$.bhDialog({
			'title': title,
			"iconType": "warning",
			buttons: buttons
		});
	};

	/**
	 * 根据token获取文件路径
	 *
	 * @param token
	 * @returns fileurl
	 */
	PUB_FUNC.getImageSrc = function(token) {
		var fileUrl = '';
		$.ajax({
			type: "post",
			url: contextPath + "/sys/emapcomponent/file/getUploadedAttachment/" + token + ".do",
			dataType: "json",
			async: false, // 默认为true 异步
			success: function(res) {
				if (res.success) {
					$(res.items).each(function() {
						fileUrl = this.fileUrl;
					});
				}
			}
		});
		return fileUrl;
	};

	/**
	 * 高级查询院系专业班级下拉框联动
	 *
	 * @param 高级搜索框渲染id
	 */
	PUB_FUNC.searchContainerAutoCombo = function(queryFromId, linkType) {
		//学院-专业联动
		var fields = ["DWDM","ZYDM","BJDM","SYDM","SYBJDM","XQDM","SSQDM","SSLDM","SSQ","SSL","JXJDM","ZXJDM","JXJDJDM","SQDJ_JXJ","ZXJDJDM","SQDJ"];
		for(var i=0;i<fields.length;i++){
			$('#' + queryFromId).on('click' , 'div[data-name='+fields[i]+']', function() {
				setQueryAutoCombo(queryFromId, linkType);
			});
		}
	};

	/**
	 * 高级检索下拉框联动自动查询
	 * queryFromId 表单ID
	 * 时间：2016-4-15 10:30:50
	 * @version 2.0
	 * 增加多选可能情况  2016-7-25 19:27:26
	 */
	function setQueryAutoCombo(queryFromId, linkType) {
		//1. 学院联动使用，  获取专业,班级，学院下拉框
		var DWDM = $('#' + queryFromId + ' div[data-name=DWDM]:visible');
		var ZYDM = $('#' + queryFromId + ' div[data-name=ZYDM]:visible');
		var BJDM = $('#' + queryFromId + ' div[data-name=BJDM]:visible');
		
		//2.获取宿舍查询联动
		var XQDM = $('#' + queryFromId + ' div[data-name=XQDM]');
		var SSQ = $('#' + queryFromId + ' div[data-name=SSQ] , ' + '#' + queryFromId + ' div[data-name=SSQDM]');
		var SSL = $('#' + queryFromId + ' div[data-name=SSL] , ' + '#' + queryFromId + ' div[data-name=SSLDM]');

		//3.奖学金联动等级 评定等级
		var JXJ = $('#' + queryFromId + ' div[data-name=JXJDM]');
		var PDDJ_JXJ = $('#' + queryFromId + ' div[data-name=JXJDJDM]');
		var SQDJ_JXJ = $('#' + queryFromId + ' div[data-name=SQDJ_JXJ]');

		//3.助学金联动等级 评定等级
		var ZXJ = $('#' + queryFromId + ' div[data-name=ZXJDM]');
		var PDDJ_ZXJ = $('#' + queryFromId + ' div[data-name=ZXJDJDM]');
		var SQDJ_ZXJ = $('#' + queryFromId + ' div[data-name=SQDJ]');
		//4.书院联动
		var SYDM = $('#' + queryFromId + ' div[data-name=SYDM]:visible');
		var SYBJDM = $('#' + queryFromId + ' div[data-name=SYBJDM]:visible');
		//1.1学院联动代码  存在学院选项，则专业和班级不需要自动加载
		if (DWDM[0]) {
			//禁止自动检索数据
			if (ZYDM[0]) {
				ZYDM.off('open');
			}
			if (BJDM[0]) {
				BJDM.off('open');
			}
		}
		//如果不存在院系，专业默认检索，班级根据专业获取
		else {
			if (ZYDM[0] && ZYDM.val() == "") {
				BJDM.off('open');
			}
		}
		//获取 linkType
		linkType = getLinkType(queryFromId,linkType);
		//2.部门选择时候，（不存在忽略）
		DWDM.off("select").on('select', function() {
			
			//选中项不变，不需要再次加载数据
			if (DWDM.data('DWDM') == DWDM.val()) {
				return;
			}
			//清空专业下拉框选项
			if(ZYDM[0]){
				ZYDM.jqxDropDownList('clear');
			}
			//班级
			if(BJDM[0]){
				BJDM.jqxDropDownList('clear');
			}
			DWDM.data('DWDM', DWDM.val());
			
			//选择空值，则清空下面的选项
			if (DWDM.val() == '') {
				return;
			}
			//存在专业选项
			if (ZYDM[0]) {
				queryAndvanceZy(queryFromId, linkType,ZYDM);
			}
			//正常情况 无论是否有专业，也同样获取班级下拉框
			if (BJDM[0] && linkType != "2") {
				queryAndvanceClass(queryFromId, linkType,BJDM);
			}
			//奖学金 荣誉称号 无论是否有专业，也同样获取评奖单位下拉框
			if (BJDM[0] && linkType == "2") {
				queryAndvancePjdw(queryFromId, linkType,BJDM);
			}
		});
		//专业下拉框选择触发
		ZYDM.off("select").on('select', function() {

			//判断专业下拉框对否已经修改，且选择是可选值
			if (ZYDM.data('ZYDM') == ZYDM.val()) {
				return;
			}
			//专业联动 只在非奖学金和荣誉称号时联动BJDM
			ZYDM.data('ZYDM', ZYDM.val());
			if (BJDM[0] && linkType != "2") {
				queryAndvanceClass(queryFromId, linkType,BJDM);
			}
		});
//		//专业点击时 ,需要触发专业可选项获取
		if( DWDM[0] && ZYDM[0] && DWDM.val() && !ZYDM.val()){
			queryAndvanceZy(queryFromId, linkType,ZYDM);
		}
		//班级点击时 ,需要触发班级可选项获取
		//type1
		if( (DWDM[0] || ZYDM[0]) && (DWDM.val() || ZYDM.val()) && BJDM[0]  && linkType != "2"){
			queryAndvanceClass(queryFromId, linkType,BJDM);
		}
		if( DWDM[0] && DWDM.val() && BJDM[0]  && linkType == "2"){
			queryAndvancePjdw(queryFromId, linkType,BJDM);
		}
		//1.1书院联动代码  存在书院选项，则书院班级不需要自动加载
		if (SYDM[0]) {
			//禁止自动检索数据
			if (SYBJDM[0]) {
				SYBJDM.off('open');
			}
		}
		//2.部门选择时候，（不存在忽略）
		SYDM.off("select").on('select', function() {
			
			//选中项不变，不需要再次加载数据
			if (SYDM.data('SYDM') == SYDM.val()) {
				return;
			}
			//清空书院班级下拉框选项
			if(SYBJDM[0]){
				SYBJDM.jqxDropDownList('clear');
			}
			SYDM.data('SYDM', SYDM.val());
			
			//选择空值，则清空下面的选项
			if (SYDM.val() == '') {
				return;
			}
			//存在书院班级选项
			if (SYBJDM[0]) {
				queryAndvanceSybjdm(queryFromId, linkType,SYBJDM);
			}
		});
		//书院班级点击时 ,需要触发专业可选项获取
		if( SYDM[0] && SYBJDM[0] && SYDM.val() && !SYBJDM.val()){
			queryAndvanceSybjdm(queryFromId, linkType,SYBJDM);
		}
		//2.1 宿舍联动功能，根据控件关闭自动架子数据
		if (XQDM[0]) {
			//禁止自动检索数据
			if (SSQ[0]) {
				SSQ.off('open');
			}
			if (SSL[0]) {
				SSL.off('open');
			}
		}
		//如果校区，宿舍区，宿舍楼根据专业获取
		else {
			if (SSQ[0] && SSQ.val() == "") {
				SSL.off('open');
			}
		}
		//2.校区 选择时候，（不存在忽略）
		XQDM.off("select").on('select', function() {
			//存在宿舍区选项
			if (SSQ[0]) {
				querySsqByXq(XQDM,SSQ,SSL);
				
			} else {
				//不存在宿舍楼，获取宿舍楼下拉框，判断是否存在
				if (SSL[0]) {
					querySslByXq(XQDM,SSQ,SSL);
				}
			}
		});
		//2.2 宿舍楼选择时候，（不存在忽略）
		SSQ.off("select").on('select', function() {
			if (SSL[0]) {
				querySslBySsq(XQDM,SSQ,SSL);
			}
		});
		//XQDM，SSQ，SSL
		//SSQ 点击触发可选项
		if( XQDM[0]  && XQDM.val() ){
			if( SSQ[0]){
				querySsqByXq(XQDM,SSQ,SSL);
			}else {
				if (SSL[0]) {
					querySslByXq(XQDM,SSQ,SSL);
				}
			}	
		}
		//SSL d点击可触发选项
		if(SSQ[0] && SSQ.val() && SSL[0]){
			querySslBySsq(XQDM,SSQ,SSL);
		}
		//班级点击时 ,需要触发班级可选项获取
		//type1
		if( (DWDM[0] || ZYDM[0]) && (DWDM.val() || ZYDM.val()) && BJDM[0]  && linkType != "2"){
			queryAndvanceClass(queryFromId, linkType,BJDM);
		}
		if( DWDM[0] && DWDM.val() && BJDM[0]  && linkType == "2"){
			queryAndvancePjdw(queryFromId, linkType,BJDM);
		}
		//3.1 奖学金联动功能，根据控件关闭自动架子数据
		if (JXJ[0] && linkType == "2") {
			//禁止自动检索数据
			if (PDDJ_JXJ[0]) {
				PDDJ_JXJ.off('open');
			}
			if (SQDJ_JXJ[0]) {
				SQDJ_JXJ.off('open');
			}
		}
		//3.2 奖学金代码选择时候，（不存在忽略）
		JXJ.off("select").on('select', function() {
			if (PDDJ_JXJ[0] && linkType == "2") {
				getPddjByJxj(JXJ,PDDJ_JXJ);				
			}
			if (SQDJ_JXJ[0] && linkType == "2") {
				getSqdjByJxj(JXJ,SQDJ_JXJ);
			}
		});
		if(JXJ[0] && linkType == "2" && JXJ.val() && PDDJ_JXJ[0]){
			getPddjByJxj(JXJ,PDDJ_JXJ);
		}
		if(JXJ[0] && linkType == "2" && JXJ.val() && SQDJ_JXJ[0]){
			getSqdjByJxj(JXJ,SQDJ_JXJ);
		}

		//4.1 助学金联动功能，根据控件关闭自动架子数据
		if (ZXJ[0] && linkType == "2") {
			//禁止自动检索数据
			if (PDDJ_ZXJ[0]) {
				PDDJ_ZXJ.off('open');
			}
			if (SQDJ_ZXJ[0]) {
				SQDJ_ZXJ.off('open');
			}
		}
		//3.2 奖学金代码选择时候，（不存在忽略）
		ZXJ.off("select").on('select', function() {
			if (PDDJ_ZXJ[0] && linkType == "2") {
				getPddjByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ);
			}
			if (SQDJ_ZXJ[0] && linkType == "2") {
				getSqxxByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ);
			}
		});
		if(ZXJ[0] && linkType == "2" && ZXJ.val() && PDDJ_ZXJ[0]){
			getPddjByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ);
		}
		if(ZXJ[0] && linkType == "2" && ZXJ.val() && SQDJ_ZXJ[0]){
			getSqxxByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ);
		}
	}
	//获取linkType 0  默认取班级字典 2取评奖单位数据
	function getLinkType(queryFromId,linkType){
		if(linkType != 2){//类型为非2 原值返回
			return linkType; 
		}
		if(queryFromId.indexOf("jxjSearch")!=-1 || queryFromId.indexOf("rychSearch")!=-1 || queryFromId.indexOf("zxjSearch")!=-1){//奖学金 荣誉称号 返回2,助学金返回2
			return "2";
		}
		
		return "0";//非奖学金和荣誉称号返回，非助学金
	}
	function getSqxxByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ){
		//设置评定等级下拉框
		SQDJ_ZXJ.jqxDropDownList({
			disabled: false
		});
		//判断是否跟新宿舍区值，没有不重新加载
		if (SQDJ_ZXJ.data('ZXJDM') == ZXJ.val()) {
			return;
		}
		//选择空，则直接返回
		if (ZXJ.val() == '') {
			SQDJ_ZXJ.jqxDropDownList('clear');
			SQDJ_ZXJ.val('');
			SQDJ_ZXJ.data('ZXJDM', ZXJ.val());
			return;
		}
		//跟新了删除下拉框，重新加载
		SQDJ_ZXJ.jqxDropDownList('clear');
		//通过助学金查询等级信息  多选情况考虑
		var param = new Object();
		var ZXJArray = ZXJ.val().split(",");
		var queryZXJSetting = [];
		for (var i = 0; i < ZXJArray.length; i++) {
			queryZXJSetting.push({
				"caption": "",
				"name": "ZXJDM",
				"value": ZXJArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryZXJSetting = JSON.stringify(queryZXJSetting);
		param["querySetting"] = queryZXJSetting;
		param.ZXJDM = ZXJ.val();
		var result = mineQuery('gjsszxjdjcx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					SQDJ_ZXJ.jqxDropDownList('addItem', {
						'id': calData[i].ZXJDJDM,
						'name': BH_UTILS.fxss(calData[i].DJMC)
					});
				}
			}
		}
		//保存奖学金值
		ZXJ.data('ZXJDM', ZXJ.val());
	}
	function getPddjByZxj(ZXJ,PDDJ_ZXJ,SQDJ_ZXJ){
		//设置评定等级下拉框
		PDDJ_ZXJ.jqxDropDownList({
			disabled: false
		});
		//判断是否跟新宿舍区值，没有不重新加载
		if (PDDJ_ZXJ.data('ZXJDM') == ZXJ.val()) {
			return;
		}
		//选择空，则直接返回
		if (ZXJ.val() == '') {
			PDDJ_ZXJ.jqxDropDownList('clear');
			PDDJ_ZXJ.val('');
			PDDJ_ZXJ.data('ZXJDM', ZXJ.val());
			return;
		}
		//跟新了删除下拉框，重新加载
		PDDJ_ZXJ.jqxDropDownList('clear');
		//通过助学金查询等级信息  多选情况考虑
		var param = new Object();
		var ZXJArray = ZXJ.val().split(",");
		var queryZXJSetting = [];
		for (var i = 0; i < ZXJArray.length; i++) {
			queryZXJSetting.push({
				"caption": "",
				"name": "ZXJDM",
				"value": ZXJArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryZXJSetting = JSON.stringify(queryZXJSetting);
		param["querySetting"] = queryZXJSetting;
		param.ZXJDM = ZXJ.val();
		var result = mineQuery('gjsszxjdjcx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					PDDJ_ZXJ.jqxDropDownList('addItem', {
						'id': calData[i].ZXJDJDM,
						'name': BH_UTILS.fxss(calData[i].DJMC)
					});
				}
			}
		}
		//保存奖学金值
		ZXJ.data('ZXJDM', ZXJ.val());
	}
	function getSqdjByJxj(JXJ,SQDJ_JXJ){
		//设置评定等级下拉框
		SQDJ_JXJ.jqxDropDownList({
			disabled: false
		});
		//判断是否跟新宿舍区值，没有不重新加载
		if (SQDJ_JXJ.data('JXJDM') == JXJ.val()) {
			return;
		}
		//选择空，则直接返回
		if (JXJ.val() == '') {
			SQDJ_JXJ.jqxDropDownList('clear');
			SQDJ_JXJ.val('');
			SQDJ_JXJ.data('JXJDM', JXJ.val());
			return;
		}
		//跟新了删除下拉框，重新加载
		SQDJ_JXJ.jqxDropDownList('clear');
		//通过奖学金查询等级信息  多选情况考虑
		var param = new Object();
		var JXJArray = JXJ.val().split(",");
		var queryJXJSetting = [];
		for (var i = 0; i < JXJArray.length; i++) {
			queryJXJSetting.push({
				"caption": "",
				"name": "JXJDM",
				"value": JXJArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryJXJSetting = JSON.stringify(queryJXJSetting);
		param["querySetting"] = queryJXJSetting;
		param.JXJDM = JXJ.val();
		var result = mineQuery('gjssjxjdjcx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					SQDJ_JXJ.jqxDropDownList('addItem', {
						'id': calData[i].JXJDJDM,
						'name': BH_UTILS.fxss(calData[i].DJMC)
					});
				}
			}
		}
		//保存奖学金值
		JXJ.data('JXJDM', JXJ.val());
	}
	
	function getPddjByJxj(JXJ,PDDJ_JXJ){
		//设置评定等级下拉框
		PDDJ_JXJ.jqxDropDownList({
			disabled: false
		});
		//判断是否跟新宿舍区值，没有不重新加载
		if (PDDJ_JXJ.data('JXJDM') == JXJ.val()) {
			return;
		}
		//选择空，则直接返回
		if (JXJ.val() == '') {
			PDDJ_JXJ.jqxDropDownList('clear');
			PDDJ_JXJ.val('');
			PDDJ_JXJ.data('JXJDM', JXJ.val());
			return;
		}
		//跟新了删除下拉框，重新加载
		PDDJ_JXJ.jqxDropDownList('clear');
		//通过奖学金查询等级信息  多选情况考虑
		var param = new Object();
		var JXJArray = JXJ.val().split(",");
		var queryJXJSetting = [];
		for (var i = 0; i < JXJArray.length; i++) {
			queryJXJSetting.push({
				"caption": "",
				"name": "JXJDM",
				"value": JXJArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryJXJSetting = JSON.stringify(queryJXJSetting);
		param["querySetting"] = queryJXJSetting;
		param.JXJDM = JXJ.val();
		var result = mineQuery('gjssjxjdjcx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					PDDJ_JXJ.jqxDropDownList('addItem', {
						'id': calData[i].JXJDJDM,
						'name': BH_UTILS.fxss(calData[i].DJMC)
					});
				}
			}
		}
		//保存奖学金值
		JXJ.data('JXJDM', JXJ.val());
	}
	
	function querySslBySsq(XQDM,SSQ,SSL){
		//设置宿舍楼下拉框
		SSL.jqxDropDownList({
			disabled: false
		});
		//判断是否跟新宿舍区值，没有不重新加载
		if (SSL.data('SSQ') == SSQ.val()) {
			return;
		}
		//选择空，则直接返回
		if (SSQ.val() == '') {
			SSL.jqxDropDownList('clear');
			SSL.val('');
			SSL.data('SSQ', SSQ.val());
			return;
		}
		//跟新了删除下拉框，重新加载
		SSL.jqxDropDownList('clear');
		//通过宿舍区代码查询宿舍楼信息  多选情况考虑
		var param = new Object();
		var SSQArray = SSQ.val().split(",");
		var querySSQSetting = [];
		for (var i = 0; i < SSQArray.length; i++) {
			querySSQSetting.push({
				"caption": "",
				"name": "SSQDM",
				"value": SSQArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		querySSQSetting = JSON.stringify(querySSQSetting);
		param["querySetting"] = querySSQSetting;
		param.SSQDM = SSQ.val();
		var result = mineQuery('gjjssscx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					SSL.jqxDropDownList('addItem', {
						'id': calData[i].SSLDM,
						'name': BH_UTILS.fxss(calData[i].SSLMC)
					});
				}
			}
		}
		//保存宿舍楼值
		SSL.data('SSQ', SSQ.val());
	}
	function querySslByXq(XQDM,SSQ,SSL){
		SSL.jqxDropDownList({
			disabled: false
		});
		//判断校区是否改变，不改变不重新加载数据
		if (SSL.data('XQ') == XQDM.val()) {
			return;
		}
		//校区存在并且选择了空值，清空宿舍楼数据。
		if (XQDM.val() == '') {
			SSL.jqxDropDownList('clear');
			SSL.val('');
			SSL.data('XQ', XQDM.val());
			return;
		}
		//清空宿舍楼下面的数据
		SSL.jqxDropDownList('clear');
		//根据校区检索宿舍楼信息，并重新加载下拉框   多选情况考虑
		var param = new Object();
		var XQDMArray = XQDM.val().split(",");
		var queryXQSetting = [];
		for (var i = 0; i < XQDMArray.length; i++) {
			queryXQSetting.push({
				"caption": "",
				"name": "XQDM",
				"value": XQDMArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryXQSetting = JSON.stringify(queryXQSetting);
		param["querySetting"] = queryXQSetting;

		var result = mineQuery('gjjssscx', param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					SSL.jqxDropDownList('addItem', {
						'id': calData[i].SSLDM,
						'name': BH_UTILS.fxss(calData[i].SSLMC)
					});
				}
			}
		}
		SSL.data('XQ', XQDM.val());
	}
	
	function querySsqByXq(XQDM,SSQ,SSL){
		SSQ.jqxDropDownList({
			disabled: false
		});
		//选中项不变，不需要再次加载数据
		if (SSQ.data('XQ') == XQDM.val()) {
			return;
		}
		//选择空值，则清空下面的选项
		if (XQDM.val() == '') {
			SSQ.jqxDropDownList('clear');
			SSQ.val('');
			SSQ.data('XQ', XQDM.val());
			SSL.jqxDropDownList('clear');
			SSL.val('');
			return;
		}
		//清空宿舍区下拉框选项
		SSQ.jqxDropDownList('clear');
		//根据学院，检索对应的学院下面的专业信息,公共ajax请求  多选情况考虑
		var param = new Object();
		var XQDMArray = XQDM.val().split(",");
		var queryXQSetting = [];
		for (var i = 0; i < XQDMArray.length; i++) {
			queryXQSetting.push({
				"caption": "",
				"name": "XQDM",
				"value": XQDMArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryXQSetting = JSON.stringify(queryXQSetting);
		param["querySetting"] = queryXQSetting;
		var result = mineQuery('gjjsssl', param, false);
		if (result.resultCode == '00000') {
			var data = result.data;
			if (data.length != 0) {
				for (var i = 0; i < data.length; i++) {
					SSQ.jqxDropDownList('addItem', {
						'id': data[i].SSQDM,
						'name': BH_UTILS.fxss(data[i].SSQMC)
					});
				}
			}
		}
		SSQ.data('XQ', XQDM.val());
		//宿舍楼存在，清空数据
		if (SSL[0]) {
			//清空宿舍楼下面的数据
			SSL.jqxDropDownList('clear');
			SSL.val('');
		}
	}
	
	
	
	//班级联动
	function queryAndvanceClass(queryFromId,linkType,BJDM){
		var DWDM = $('#' + queryFromId + ' div[data-name=DWDM]:visible');
		var ZYDM = $('#' + queryFromId + ' div[data-name=ZYDM]:visible');
		
		BJDM.jqxDropDownList({
			disabled: false
		});
		BJDM.jqxDropDownList('clear');
		
		if(!ZYDM.val() && !DWDM.val()){
			return ;
		}
		var querySetting = [];
		//根据专业检索班级信息，并重新加载下拉框  多选情况考虑
		var param = new Object();
		if (DWDM[0]){
			var DWDMArray = DWDM.val().split(",");
			var subQuery = [];
			for (var i = 0; i < DWDMArray.length; i++) {
				if(DWDMArray[i]){
					subQuery.push({
						"caption": "",
						"name": "DWDM",
						"value": DWDMArray[i],
						"builder": "equal",
						"linkOpt": "OR"
					});
				}
			}
			querySetting.push(subQuery);
		}
		if(ZYDM[0]){
			//根据专业检索班级信息，并重新加载下拉框 多选情况考虑
			var ZYDMArray = ZYDM.val().split(",");
			var subQuery = [];
			for (var i = 0; i < ZYDMArray.length; i++) {
				if(!ZYDMArray[i]){
					continue;
				}
				if(subQuery.length == 0){
					subQuery.push({
						"caption": "",
						"name": "ZYDM",
						"value": ZYDMArray[i],
						"builder": "equal",
						"linkOpt": "AND"
					});
				}else{
					subQuery.push({
						"caption": "",
						"name": "ZYDM",
						"value": ZYDMArray[i],
						"builder": "equal",
						"linkOpt": "OR"
					});
				}
			}
			querySetting.push(subQuery);
		}
		querySetting = JSON.stringify(querySetting);
		param["querySetting"] = querySetting;
		var actionName = linkType == "1" ? "gjjsxsbjcx" : 'gjjsbjcx';
		var result = mineQuery(actionName, param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if(BJDM.attr("xtype") == "select"){
				BJDM.jqxDropDownList('addItem', {
					'id': "",
					'name': "请选择..."
				});
			}
			if (calData.length != 0) {
				//如果存在单位，循环单位，排除一个专业，多个单位情况
				if (DWDM[0]) {
					var classArray = [];
					var DWDMArray = DWDM.val().split(",");
					for (var i = 0; i < calData.length; i++) {
						for (var j = 0; j < DWDMArray.length; j++) {
							if (calData[i].DWDM === DWDMArray[j]) {
								classArray.push(calData[i]);
							}
						}
					}
					calData = classArray;
				}
				for (var i = 0; i < calData.length; i++) {
					BJDM.jqxDropDownList('addItem', {
						'id': calData[i].BJDM,
						'name': BH_UTILS.fxss(calData[i].BJMC)
					});
				}
			}
		}
	}
	//评奖单位联动
	function queryAndvancePjdw(queryFromId,linkType,BJDM){
		var DWDM = $('#' + queryFromId + ' div[data-name=DWDM]:visible');
		
		BJDM.jqxDropDownList({
			disabled: false
		});
		BJDM.jqxDropDownList('clear');
		//根据专业检索班级信息，并重新加载下拉框  多选情况考虑
		var param = new Object();
		var DWDMArray = DWDM.val().split(",");
		var queryDWSetting = [];
		for (var i = 0; i < DWDMArray.length; i++) {
			if(DWDMArray[i]){
				queryDWSetting.push({
					"caption": "",
					"name": "DWDM",
					"value": DWDMArray[i],
					"builder": "equal",
					"linkOpt": "OR"
				});
			}
		}
		queryDWSetting = JSON.stringify(queryDWSetting);
		param["querySetting"] = queryDWSetting;
		var actionName = "gjsspjdwcx";
		var result = mineQuery(actionName, param, false);
		if (result.resultCode == '00000') {
			var calData = result.data;
			if(BJDM.attr("xtype") == "select"){
				BJDM.jqxDropDownList('addItem', {
					'id': "",
					'name': "请选择..."
				});
			}
			if (calData.length != 0) {
				for (var i = 0; i < calData.length; i++) {
					BJDM.jqxDropDownList('addItem', {
						'id': calData[i].PJDWDM,
						'name': BH_UTILS.fxss(calData[i].PJDWMC)
					});
				}
			}
		}
	}
	function queryAndvanceSybjdm(queryFromId,linkType,SYBJDM) {
		var SYDM = $('#' + queryFromId + ' div[data-name=SYDM]:visible');
		
		SYBJDM.jqxDropDownList({
			disabled: false
		});
		SYBJDM.jqxDropDownList('clear');
	
		//根据学院，检索对应的学院下面的专业信息,公共ajax请求 , 考虑多选情况，使用querySetting
		var param = new Object();
		//如果是多选，分割，获得单位代码，，使用querySetting 传多个DWDM OR关系
		var SYDMArray = SYDM.val().split(",");
		var querySYSetting = [];
		for (var i = 0; i < SYDMArray.length; i++) {
			querySYSetting.push({
				"caption": "",
				"name": "SYDM",
				"value": SYDMArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		querySYSetting = JSON.stringify(querySYSetting);
		param["querySetting"] = querySYSetting;
		// 动作查询
		var result = mineQuery('gjsssybjcx', param, false);
		if (result.resultCode == '00000') {
			var data = result.data;
			if(SYBJDM.attr("xtype") == "select"){
				SYBJDM.jqxDropDownList('addItem', {
					'id': "",
					'name': "请选择..."
				});
			}
			if (data.length != 0) {
				for (var i = 0; i < data.length; i++) {
					SYBJDM.jqxDropDownList('addItem', {
						'id': data[i].SYBJDM,
						'name': BH_UTILS.fxss(data[i].SYBJMC)
					});
				}
			}
		}
	}
	//专业联动
	function queryAndvanceZy(queryFromId,linkType,ZYDM){
		var DWDM = $('#' + queryFromId + ' div[data-name=DWDM]:visible');
		
		ZYDM.jqxDropDownList({
			disabled: false
		});
		ZYDM.jqxDropDownList('clear');
	
		//根据学院，检索对应的学院下面的专业信息,公共ajax请求 , 考虑多选情况，使用querySetting
		var param = new Object();
		//如果是多选，分割，获得单位代码，，使用querySetting 传多个DWDM OR关系
		var DWDMArray = DWDM.val().split(",");
		var queryDWSetting = [];
		for (var i = 0; i < DWDMArray.length; i++) {
			queryDWSetting.push({
				"caption": "",
				"name": "DWDM",
				"value": DWDMArray[i],
				"builder": "equal",
				"linkOpt": "OR"
			});
		}
		queryDWSetting = JSON.stringify(queryDWSetting);
		param["querySetting"] = queryDWSetting;
		// 动作查询
		var result = mineQuery('gjssldcx', param, false);
		if (result.resultCode == '00000') {
			var data = result.data;
			if(ZYDM.attr("xtype") == "select"){
				ZYDM.jqxDropDownList('addItem', {
					'id': "",
					'name': "请选择..."
				});
			}
			if (data.length != 0) {
				for (var i = 0; i < data.length; i++) {
					ZYDM.jqxDropDownList('addItem', {
						'id': data[i].ZYDM,
						'name': BH_UTILS.fxss(data[i].ZYMC)
					});
				}
			}
		}
	}
	/**
	 * 对字符串进行xss过滤处理，参考fe_components/bh_utils.js中的代码,并将原本转义对应字符串的处理修改成了把字符串变成对应的英文全角符号
	 * @author 01122160
	 * 时间：2022-12-16
	 */
	PUB_FUNC.fxss = function(value) {
		var str = "" + value;
		var matchHtmlRegExp = /["'&<>]/;
		var match = matchHtmlRegExp.exec(str);
		if (!match) {
		   return str;
		}

		var escaped;
		var html = "";
		var index = 0;
		var lastIndex = 0;
		for (index = match.index; index < str.length; index++) {
		   switch (str.charCodeAt(index)) {
		   	  case 34: // "
		        escaped = "＂";
		        break;
		      case 38: // &
		        escaped = "＆";
		        break;
		      case 39: // '
		        escaped = "＇";
		        break;
		      case 60: // <
		        escaped = "＜";
		        break;
		      case 62: // >
		        escaped = "＞";
		        break;
		      default:
		        continue;
		   }

		   if (lastIndex !== index) {
		      html += str.substring(lastIndex, index);
		   }

		   lastIndex = index + 1;
		   html += escaped;
		}

		return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
	};
	
	/**
	 * 获取打印报表地址
	 * token: 报表附件token
	 * params: 报表参数，例如：{FZDM:"",...}
	 */
	PUB_FUNC.getPrintReportUrl = function(token, params){
		var result = null;
		XGJSUTIL.querySyncAuto(WIS_CONFIG.PATH + "/sys/swpubapp/jzreport2/getReportUrl.do?token="+token, {}, function(data){
			if(data.code == '0'){
				result = data.data;
			}
		});
		if(!result){
			return null;
		}
		var url = "";
		var param = "";
		$.each(params, function(key, value){
			param += key + "=" + value + "&";
		});
		if(param){
			param = param.substring(0, param.length-1);
		}
		if(result.isCpt){
			url = WIS_CONFIG.PATH + "/sys/frReport2/show.do?reportlet=com.fr.JZ&cpt=" + result.cptPath + "&" + param;
		}else if(result.domain && result.BBID){
			url = WIS_CONFIG.PATH + "/sys/jzreport2_client/client/word/" + result.domain + "/" + result.BBID + ".do";
			url = param?url + "?" + param : url;
		}
		return url;
	};
})(window.PUB_FUNC = PUB_FUNC);