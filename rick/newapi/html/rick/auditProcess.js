define(function(require, exports, module) {
	var tpl = require('text!publicVueComponent/auditprocess/auditProcess.html');
	return function() {
		var page = {
			template: tpl,
			props: ['processDatas', 'currentState', 'sqsj', 'thzt', 'sfkch'],
            computed:{
            	currentPxcom:function(){
            		for(var index in this.processDatas){
            			if(this.processDatas[index].DQZTDM == Math.abs(this.currentState)){
            				this.currentPx = this.processDatas[index].PX;
            			}
            		}
            		if(this.currentState == '99'){
        				this.currentPx = '99';
        			}
            		return this.currentPx;
            	}
            },
			methods: {
				recall: function() {
					this.$emit('recall');
				}
			}
		};
		return page;
	};

});