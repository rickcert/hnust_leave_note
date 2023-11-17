define(function(require, exports, module) {
    var tpl = require('text!modules/qjsq/detail/xsqjsqxq.html');
    var api = require('api');

    return function() {
        var page = {
            template: tpl,
            data: function() {
                return {
                    //申请详情表单
                    model: WIS_EMAP_SERV.getModel("/modules/qjsq.do", "yddxsqjxqbd", "form"),
                    formValue: {},
                    customVm: {},
                    readonly: true,
                    //申请详情数据当前状态
                    applyDetailShzt: "",
                    //申请详情数据申请时间
                    applyDetailSqsj: "",
                    //申请详情数据退回状态
                    applyDetailThzt: "",
                    //是否可撤回
                    applyDetailSfkch: false,
                    //申请详情流程arr
                    applyProcessDatas: [],
                    //是否是被退回的记录，被退回的记录支持重新提交
                    isBackReord: false,
                    //是否已经销假
                    detailXJZT: false,
                    //是否开启定位销假
                    sfkqdwxj: this.getSfkqdwxj(),
                    //是否开启定位拍照销假
                    sfkqdwpzxj: false,
                    //是否可销假
                    sfkxj: false,
                    //是否无需销假
                    sfwxxj:false,
                    //续假信息
                    continueInfos : [],
                    continueInfo : {},
                    //是否有续假信息
                    hasContinue : false,
                    //续假详情表单
                    cjModel: WIS_EMAP_SERV.getModel("/modules/qjsq.do", "xjxqbd", "cjform"),
                    qjInfo : {},
                    hasThBtj:false
                    
                };
            },
            created: function() {
                SDK.setTitleText("请假");
                //获取请假信息明细
                this.getStudentLeaveRecordDetails(this.$route.query.SQBH);

            },
            actived : function() {
                SDK.setTitleText("请假");
                //获取请假信息明细
                this.getStudentLeaveRecordDetails(this.$route.query.SQBH);
            },
            
            methods: {
                //获取请假详情
                getStudentLeaveRecordDetails: function(sqbh) {
                    var self = this;
                    MOB_UTIL.doPost({ url: api.getStudentLeaveRecordDetails, params: { SQBH: sqbh } }).done(function(result) {
                        self.formValue = result.data.leaveInfo;
                        self.sfwxxj = (self.formValue.XJZT == '2' && self.formValue.SHZT == '99');
                        if(self.formValue.DZ_XXQJ=="1" && (self.formValue.SHZT*1<0 || self.formValue.THZT=="1")){
                        	self.hasThBtj=true;
                        }else{
                        	self.hasThBtj=false;
                        }
                        self.applyDetailShzt = result.data.leaveInfo.SHZT;
                        self.applyProcessDatas = result.data.auditInfo;
                        self.applyProcessDatas.forEach(function(item) {
                        	if(item.DQZTDM == '0'){
                        		item.SHYJ = [];
                        	}
                        });
                        self.applyDetailSqsj = result.data.leaveInfo.SQRQ;
                        self.applyDetailThzt = result.data.leaveInfo.THZT;
                        self.applyDetailSfkch = result.data.SFKCH;
                        self.isBackReord = result.data.leaveInfo.SHZT == '0';
                        self.detailXJZT = result.data.leaveInfo.XJZT == '1';
                        self.sfkxj = (result.data.leaveInfo.XJZT == '0' && result.data.leaveInfo.SHZT == '99');
                        //续假功能
                        self.continueInfos = result.data.continueInfo; //续假信息
                        self.qjInfo = result.data.qjInfo[0];
                        self.isBackReord =  self.applyDetailShzt == '0';
                        //如果有多条续假信息， 默认展示第一条
                        if(self.continueInfos && self.continueInfos.length > 0) {
                        	self.hasContinue = true;
                        	self.continueInfo = self.continueInfos[0];
                        }
                        var qjlx = result.data.leaveInfo.QJLX;
                        self.processField(qjlx);
                        var sflx = result.data.leaveInfo.SFLX;
                        self.processSFLX(sflx);
                        var sflkszd = result.data.leaveInfo.SFLKSZD;
                        self.processSFLKSZD(sflkszd);
                    });
                },
                processField: function(qjlx) {
            		var self = this;
                    MOB_UTIL.doPost({ url: api.getLeaveType, params: { LXDM: qjlx } }).done(function(result) {
                        if(result.data && result.data.WID) {
                        	var sfsccl = result.data.SFSCCL;
                        	if(sfsccl == "1") {
                        		self.$refs.form.showItem(['ZMCL']);
                        	} else {
                        		self.$refs.form.hideItem(['ZMCL']);
                        	}
                        } else {
                        	self.$refs.form.hideItem(['ZMCL']);
                        }
                    });
            	},
            	processSFLX: function(sflx) {
            		var self = this;
            		if(sflx == "1") {
                		self.$refs.form.showItem(['SFLKSZD']);
                		self.$refs.form.hideItem(['DZ_QJLB']);
                	}else if(sflx == "0") {
                		self.$refs.form.showItem(['DZ_QJLB']);
                		self.$refs.form.hideItem(['SFLKSZD','LXQX','XXDZ','JJLXR','LXDH']);
                	} else {
                		self.$refs.form.hideItem(['DZ_QJLB','SFLKSZD','LXQX','XXDZ','JJLXR','LXDH']);
                	}
            	},
            	processSFLKSZD: function(sflkszd) {
            		var self = this;
            		if(sflkszd == "1") {
                		self.$refs.form.showItem(['LXQX','XXDZ','JJLXR','LXDH']);
                	} else {
                		self.$refs.form.hideItem(['LXQX','XXDZ','JJLXR','LXDH']);
                	}
            	},
                //重新提交
                editApply: function() {
                	var self = this;
                	//判断是请假的重新提交还是续假的重新提交
                	if(self.hasContinue == true) {
                		self.editContinueApply();
                		return;
                	}
                	
                    //学生请假校验
                    MOB_UTIL.doPost({ url: api.checkWhetherStudentCanApply, params: {} }).done(function(result) {
                        if (result.data.applicable) {
                            var param = {
                                IS_NEW: false,
                                //表单数据
                                EDIT_DATA: self.formValue
                            };
                            self.$router.push({ name: 'xzqjsq', query: param });
                        } else {
                            mintUI.MessageBox('提示', result.data.reason);
                        }
                    });
                },
              //删除草稿状态的请假
                deleteApply: function() {
                	var self = this;
                	//判断是请假的重新提交还是续假的重新提交
                	/*if(self.hasContinue == true) {
                		self.editContinueApply();
                		return;
                	}
                	*/
                	mintUI.MessageBox.confirm('确定删除请假记录？', '提示').then(function() {
                        MOB_UTIL.doPost({ url: api.delLeaveInfo, params: {SQBH: self.formValue.SQBH, QJXLH: self.formValue.QJXLH}}).done(function(result) {
                            if (result.data.FLAG) {
                            	 mintUI.Toast({
                                     message: '删除成功',
                                     iconClass: 'iconfont mint-icon-i icon-chenggong'
                                 });
                                 self.$router.go(-1);
                            } else {
                                mintUI.MessageBox('提示', result.data.reason);
                            }
                        });
                    }, function() {});
                },
                //撤回申请
                recall: function() {
                    var self = this;
                    mintUI.MessageBox.confirm('确定要撤回申请吗?', '提示').then(function() {
                        MOB_UTIL.doPost({ url: api.recallApplyInfo, params: { SQBH: self.$route.query.SQBH } }).done(function(result) {
                            mintUI.Toast({
                                message: '撤回成功',
                                iconClass: 'iconfont mint-icon-i icon-chenggong'
                            });
                            self.$router.go(-1);
                        });
                    }, function() {});
                },
                //是否开启定位销假
                getSfkqdwxj: function(){
                	var self = this;
                	 MOB_UTIL.doPost({ url: api.checkDWXJSwitch, params: {} }).done(function(result) {
                		 if(result.data.KQDWXJ=='1'){
                			 self.sfkqdwxj = true;
                		 }else{
                			 self.sfkqdwxj = false;
                		 }
                		 if(result.data.KQDWPZXJ=='1'){
                			 self.sfkqdwpzxj = true;
                		 }else{
                			 self.sfkqdwpzxj = false;
                		 }
                	 });
                	 return false;
                },
                //定位销假
                clearApply: function(){
                	var self = this;
                	param = {sqbh: self.$route.query.SQBH, qjksrq: self.formValue.QJKSRQ, sfkqdwpzxj:self.sfkqdwpzxj};
                	self.$router.push({name: 'xsdwxj', query: param});
                },
                //续假申请
                continueApply : function() {
                	var self = this;
                	var tmpValue = self.formValue;
                	self.$router.push({
                		name : 'xjsq',
                		query: {
                			QJXLH : self.formValue.QJXLH,
                			SQBH : self.formValue.SQBH,
                			QJKSRQ : self.formValue.QJKSRQ,
                			QJJSRQ : self.formValue.QJJSRQ,
                			QJTS : self.formValue.QJTS,
                			QJLX : self.formValue.QJLX,
                			QJXZ : self.formValue.QJXZ,
                			formData : tmpValue

                		}
                	});
                },
                
                //全部续假信息
                allContinue : function() {
                	var self = this;
                	self.$router.push({
                		name : 'xjdetail',
                		query : {
                			continueInfos : self.continueInfos
                		}
                	});
                },
                
                //详细流程
                detailProcess : function(sqbh) {
                	var self = this;
                	self.$router.push({
                		name : 'shlcInfo',
                		query : {
                			SQBH : sqbh
                		}
                	});
                },
                
                //续假草稿状态重新提交
                editContinueApply : function() {
                	var self = this;
                	var formData = self.continueInfos[self.continueInfos.length-1];
                	//当前续假记录的父申请编号， 如果只有一条续假信息，就是请假信息的SQBH， 如果有多条就是查看下次预约编号
                	var parentData = self.qjInfo;
                	var PARENT_SQBH = self.qjInfo.SQBH;
                	if(self.continueInfos.length >= 2) {
                		for(var index in self.continueInfos) {
                			if(self.continueInfos[index].XJBH == formData.SQBH) {
                				parentData = self.continueInfos[index];
                				PARENT_SQBH = self.continueInfos[index].SQBH;
                			}
                		}
                	}
                	self.$router.push({
                		name : 'xjsq',
                		query : {
                			PARENT_SQBH : PARENT_SQBH,
                			formData : formData,
                			parentData:parentData,
                			isEdit : true
                		}
                	});
                }
            }
        };
        return page;
    };

});