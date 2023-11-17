define(function(require, exports, module) {
	var tpl = require('text!publicVueComponent/czzn/czzntb.html');

	return function() {
		var page = {
			template: tpl,
			data: function() {
				return {
					
				};
			},
			created: function() {
				
			},
			methods: {
				gotoCzzn: function() {
					var appid = WIS_CONFIG.APPID;
					if(appid != null && appid != "" && appid != undefined){
						var href;
						if(appid == "6038520295961904"){
							//首页
							href = WIS_CONFIG.HOST_PATH + "/sys/" + "swmczznapp/*default/index.do#/";
						} else {
							href = WIS_CONFIG.HOST_PATH + "/sys/" + "swmczznapp/*default/index.do?GSYY=" + appid + "#/czzn?GSYY=" + appid;
						}
						window.location.href = href;
					}
                }
			}
		};
		return page;
	};
});