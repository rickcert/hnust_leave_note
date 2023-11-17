define(function(require, exports, module) {
    var tpl = require('text!publicVueComponent/nonedatas/nonedatas.html');
    return function() {
        var page = {
            template: tpl,
            props:{
            	promText: {  // 必须提供字段
            		    required: true
            		  },
            	images: {   // 可选字段，有默认值
            		    default: "../../swpubapp/public/images/icon_kong.png"
            		  }
            		}
        };
        return page;
    };

});