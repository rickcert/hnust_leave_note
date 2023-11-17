define(function(require, exports, module) {
	var tpl = require('text!publicVueComponent/yypj/yypjtb.html');

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
				gotoYypj: function() {
                    this.$router.push({ path: '/yypj' });
                }
			}
		};
		return page;
	};
});