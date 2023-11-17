define(function(require, exports, module) {
	var tpl = require('text!publicVueComponent/floaticon/floaticon.html');

	return function() {
		var page = {
			template: tpl,
			data: function() {
				return {
			        /*mouseDown : false,  //判断是否执行移动函数
			        hasMove : false  //判断dom有没有移动
*/				};
			},
			updated: function() {
				var self = this;
				self.hideInnerIcon();
				$(document).bind("click", function(e) {
				    var target = $(e.target);
				    //点击id为xsfw_floatDiv之外的地方触发
				    if (target.closest("#xsfw_floatDiv").length == 0) { 
				    	self.hideInnerIcon();
				    }
				});
			},
			mounted:function () {
				var div = document.getElementById("xsfw_floatDiv");
			    this.touchInit(div);
			},
			methods: {
				showInnerIcon : function(){//显示具体图标
					$('#float_img').hide();
					if($('#inner_icon').length > 0){
		        		$('#inner_icon').show();
		        	}
				},
				hideInnerIcon : function(){//显示总入口图标
					if($('#inner_icon').length > 0){
		        		$('#inner_icon').hide();
		        	}
					$('#float_img').show();
				},
				touchInit : function (div) {
			    	var maxW = window.innerWidth - div.offsetWidth;
			    	  var maxH = window.innerHeight - div.offsetHeight;
			    	  var startX = 0; // 初始坐标
			    	  var startY = 0;
			    	  var x = 0; // 原来的位置
			    	  var y = 0;
			    	  // 手指触摸
			    	  div.addEventListener('touchstart', function (e) {
			    	    // 获取手指初始坐标
			    	    startX = e.targetTouches[0].pageX;
			    	    startY = e.targetTouches[0].pageY;
			    	    x = this.offsetLeft;
			    	    y = this.offsetTop;
			    	  });
			    	  div.addEventListener('touchend', function (e) {});

			    	  // 手指按住移动
			    	  div.addEventListener('touchmove', function (e) {
			    	    // 计算手指的移动距离：手指移动之后的坐标减去手指初始的坐标
			    	    var moveX = e.targetTouches[0].pageX - startX;
			    	    var moveY = e.targetTouches[0].pageY - startY;
			    	    // 元素原来的位置 + 手指移动的距离
			    	    var oLeft = x + moveX;
			    	    var oTop = y + moveY;

			    	    if (oLeft < 0) {
			    	      oLeft = 0;
			    	    } else if (oLeft >= maxW) {
			    	      oLeft = maxW;
			    	    }
			    	    if (oTop < 0) {
			    	      oTop = 0;
			    	    } else if (oTop >= maxH) {
			    	      oTop = maxH;
			    	    }

			    	    this.style.left = oLeft + 'px';
			    	    this.style.top = oTop + 'px';
			    	    e.preventDefault(); // 阻止屏幕滚动的默认行为
			    	  });
			    }
		       /* //鼠标按下函数
		        downDiv : function() {
		        	var self = this;
		            //鼠标
		            var e = event || window.event;
		            //e.clientX/Y 是获取鼠标相对浏览器的位置；将div中心自动居中到鼠标
		            var left = (e.clientX - 30 / 2) + "px";
		            var top = (e.clientY - 30 / 2) + "px";
		            $('#xsfw_floatDiv').css({"left":left,"top":top})
		            //按下时为ture,松开时为false，以判断是否执行执行mouveDiv
		            self.mouseDown = true;
		            self.hasMove = false;
		        },

		        //鼠标移动函数
		        moveDiv : function(obj) {
		        	var self = this;
		        	self.hasMove = true;
		            var e = event || window.event;
		            console.log(e.clientX, e.clientY);
		            if (self.mouseDown) {
		            	var left = (e.clientX - 30 / 2) + "px";
			            var top = (e.clientY - 30 / 2) + "px";
			            $('#xsfw_floatDiv').css({"left":left,"top":top})
		            }
		        },
		        //鼠标松开函数
		        upDiv : function(obj) {
		        	var self = this;
		        	 if(!self.hasMove){
		                 //点击事件触发
		        		 self.showInnerIcon();
		             }
		        	 self.mouseDown = false;
		        	 self.hasMove = false;
		        }*/
			}
		};
		return page;
	};
});