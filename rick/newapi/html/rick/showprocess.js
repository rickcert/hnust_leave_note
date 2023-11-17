define(function(require, exports, module) {
	var tpl = require('text!publicVueComponent/lcbjggzj/showprocess.html');
	return function() {
		var page = {
			template : tpl,
			props : {
				title : {//标题
					'type' : String,
					'required':false,
					'default':"审核流程"
				},
				lcdm : {//流程代码
					'type' : String,
					'required':true
				},
				sldm : { //实例代码
					'type' : String,
					'required':true
				},
				readonly : {//是否只读
					'type' : Boolean,
					'required':false,
					'default':true
				},
				needCheck : {//是否需要校验
					'type' : Boolean,
					'required':false,
					'default':true
				},
				table : {//校验的业务表名
					'type' : String,
					'required':false,
					'default':""
				},
				subParams:{//校验的业务表查询条件(多实例时使用)，格式 {key:value,key:value}(key表示字段名，value表示字段值)
					'type' : Object,
					'required':false,
					'default':{}
				}	
			},
			 data : function() {
				return {
					//用于控制是否展示页面
					dataReady : false,
					//是否展示流程
					showLc:false,
					//审核流程数据
					lcList : [],
					//是否正在編輯
					editing : false			
				};
			},
			created : function() {
				this.getProcessData();
			},			
			methods : {

				 //审核流程节点信息
				getProcessData : function() {
					var params = {
						url : WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/components/showprocess/getProcessData.do',
						params : {
							LCDM : this.lcdm,
							SLDM : this.sldm
						}
					};
					var self = this;
					MOB_UTIL.doPost(params).then(function(result) {
						self.showLc = result.data.showLc&&result.data.showLc=='1';
						self.lcList = result.data.lcList||[];
						if(self.lcList&&self.lcList.length>0){
							for (var index in self.lcList) {
								if(self.lcList[index].SFSY&&self.lcList[index].SFSY=='1'){
									Vue.set(self.lcList[index],'checked',true);
								}else{
									Vue.set(self.lcList[index],'checked',false);
								}
							}
						}
						self.dataReady = true;
					});
				},
				//开启编辑
				goEdit:function(){
					this.editing = true;
				},
				//启用框改变事件
				changeCheck:function(index){
					Vue.set(this.lcList[index],'checked',!(this.lcList[index].checked));
				},
				//保存事件
				goSave:function(){
					if(!(this.lcList&&this.lcList.length>0)){
						return false;
					}
					var checkedList = [];//选中的数据
					var uncheckedList = [];//未选中的数据
					for (var index in this.lcList) {
						var temp = {
							ZTDM:this.lcList[index].ZTDM,
							ZTMC:this.lcList[index].ZTMC
						};
						if(this.lcList[index].checked){
							checkedList.push(temp);
						}else{
							uncheckedList.push(temp);
						}
					}
					this.checkBeforeSave(checkedList,uncheckedList);
				},
				//保存时校验
				checkBeforeSave:function(checkedList,uncheckedList){
					if(!this.needCheck){
						this.doSave(checkedList);
						return false;
					}
					//如果全部勾选，无需校验
					if(!(uncheckedList&&uncheckedList.length>0)){
						this.doSave(checkedList);
					}else{
						var params = {
								BusinessName : $.base64.encode(encodeURI(encodeURI(this.table).replace(/\+/g, '%2B')), 'utf-8'),
								uncheckedList:JSON.stringify(uncheckedList)	
						};
						if(this.subParams&&JSON.stringify(this.subParams)!="{}"){
							params.subParams =  $.base64.encode(encodeURI(encodeURI(JSON.stringify(this.subParams)).replace(/\+/g, '%2B')), 'utf-8');
						}
						var self = this;
						MOB_UTIL.doPost({
							url : WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/components/showprocess/checkProcessData.do',
							params : params
						}).then(function(result) {
							self.doSave(checkedList);
						});
					}					
				},
				doSave:function(checkedList){
					var params = {
						url : WIS_CONFIG.ROOT_PATH + '/sys/swpubapp/components/showprocess/saveProcessData.do',
						params : {
							LCDM : this.lcdm,
							SLDM : this.sldm,
							checkedList:JSON.stringify(checkedList)
						}
					};
					var self = this;
					MOB_UTIL.doPost(params).then(function(result) {
						mintUI.Toast({
							message: '保存成功！',
							iconClass: 'iconfont mint-icon-i icon-chenggong'
						});
						self.editing = false;
					});
				}
			},
			filters: {
            	//标签背景样式
               setImg: function(index) {
                   var img = '';
                   	if(index % 4 == 1){
						img = "../../swpubapp/public/images/showprocess/process2.png";
					}else if(index % 4 == 2) {
						img = "../../swpubapp/public/images/showprocess/process3.png";
					}else if(index % 4 == 3){
						img = "../../swpubapp/public/images/showprocess/process4.png";
					}else {
						img = "../../swpubapp/public/images/showprocess/process1.png";
					}
                   return img;
			   },
			   //按钮选中状态图片
			   setButton:function(checked){
					var img = "../../swpubapp/public/images/showprocess/unchecked.png";
					if(checked){
						img = "../../swpubapp/public/images/showprocess/checked.png";
					}
					return img;
			   },
			    //按钮选中文字样式
				setButtonClass:function(checked){
					var result = "../../swpubapp/public/images/showprocess/unchecked.png";
					if(checked){
						result = "../../swpubapp/public/images/showprocess/checked.png";
					}
					return result;
			   }
            }

		};
		return page;
	};

});