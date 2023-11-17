/**

 * 地图工具类，
 * 优先百度地图定位，如果百度地图在目标距离范围内，则结束，否则使用高德定位，如果高德定位也不在目标范围内，定位取离目标最近的坐标地址
 * 定位坐标统一转换成百度地图坐标
 */
;
var MAPUTIL = {};
(function(MAPUTIL) {	
	
	MAPUTIL.createMap = function createMap(){
		if(window.baidumap==undefined){
			window.baidumap =new BMap.Map("baidumapdiv");
			var cen_point = new BMap.Point(116.378688937,39.9076296510);
			window.baidumap.centerAndZoom(cen_point,16);
		}
	};
	/**
	 * 1、使用js api进行的地图定位
	 * 2、获得的定位坐标挂在window变量中， 可全局使用
	 */
	MAPUTIL.getBaiduLocation = function getBaiduLocation(){
		var dfd = $.Deferred();
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				window.curlng=r.point.lng;
				window.curlat=r.point.lat;
				dfd.resolve();
			} else{
            	var msg = '百度地图定位错误';
                mintUI.MessageBox('提示', msg);
                dfd.resolve();
            }     
		});
		return dfd.promise();
	};
	/**
	 * 1、获取当前位置
	 * 2、根据浏览器类型调用不同的api
	 * 3、默认取百度jsapi进行位置获取（此方法获取的地理位置不准确）
	 */
	MAPUTIL.getCurrentPosition = function getCurrentPosition(callback){
		var u = navigator.userAgent;
		//如果是今日校园，使用今日校园定位
		if(u.toLowerCase().indexOf("wisedu")!=-1){
			MAPUTIL.getJrxyPosition().then(callback);
		}else if(u.toLowerCase().indexOf("micromessenger")!=-1){//微信
			MAPUTIL.getWxPosition().then(callback);
		}else if(u.toLowerCase().indexOf("yiban")!=-1){//易班
			MAPUTIL.getYibanPosition().then(callback);
		}else if(u.toLowerCase().indexOf("dingtalk")!=-1){
			MAPUTIL.getDingtalkLocation().then(callback);
		}else{
			//如果配置了有定开实现的现场sdk，则调用定开接口获取
			if(window.hasEkLocation){
				MAPEXTEND.getExtendLocation().then(callback);
			}else{
				MAPUTIL.getBaiduLocation().then(callback);
			}
		}
	}
	
	/**
	 * 钉钉获取定位
	 */
	MAPUTIL.getDingtalkLocation = function getDingtalkLocation(){
		var dfd = $.Deferred();
		SDK.dd.device.geolocation.get({
		    targetAccuracy : 200,
		    coordinate : 1,
		    withReGeocode : false,
		    useCache:true, //默认是true，如果需要频繁获取地理位置，请设置false
		    onSuccess : function(result) {
		    	var latitude = result.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = result.longitude; // 经度，浮点数，范围为180 ~ -180。
                var position = MAPUTIL.gaode2baiduLocation(longitude,latitude);
                window.curlng = position.bd_lng;
        		window.curlat = position.bd_lat;
                dfd.resolve();		        
		    },
		    onFail : function(err) {
		    	mintUI.Toast('请打开您的GPS定位信息！'+err);
            	dfd.reject(err);
		    }
		});
		return dfd.promise();
	}
	/**
	 * 1、今日校园获取位置坐标
	 * 2、获取的位置坐标为百度坐标
	 */
	MAPUTIL.getJrxyPosition = function getJrxyPosition(){
		var dfd = $.Deferred();
		SDK.bh.geolocation.checkLocationPermissions(function(result){
            if(!result){
          	  mintUI.Toast('请打开您的GPS定位信息！');
          	  dfd.reject(result);
              return; 
            }else{
          	  SDK.getCurrentPosition(function(result){
            		window.curlng = result.coords.longitude;
            		window.curlat = result.coords.latitude;
            		dfd.resolve();
                });
            }
       });
	   return dfd.promise();
	}
	/**
	 * 1、获取微信的定位
	 * 2、获取到的坐标转成百度坐标
	 */
	MAPUTIL.getWxPosition = function getWxPostion(){
		var dfd = $.Deferred();
		SDK.wx.getLocation({
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function(res) {
            	var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var position = MAPUTIL.gaode2baiduLocation(longitude,latitude);
                window.curlng = position.bd_lng;
        		window.curlat = position.bd_lat;
                dfd.resolve();
            },
            fail: function(res) {
            	mintUI.Toast('请打开您的GPS定位信息！'+res);
            	dfd.reject(res);
            }
        });
		return dfd.promise();
	}
	/**
	 * 获取易班的定位接口
	 */
	MAPUTIL.getYibanPosition = function getYibanPosition(){
		var dfd = $.Deferred();
		SDK.getCurrentPosition(function(scu){
			if(scu&&scu.coords){
				window.curlng = scu.coords.longitude;
        		window.curlat = scu.coords.latitude;
        		dfd.resolve();
			}
		},function(err){
			mintUI.Toast('请打开您的GPS定位信息！'+err);
		});
		return dfd.promise();
//		if(typeof window.yibanhtml5location == "undefined"){
//			window.yibanhtml5location = function yibanhtml5location(position){
//				mintUI.Toast(position);
//				window.curlng = position.lng;
//        		window.curlat = position.lat;
//				callback();
//			}
//		}		
//		if(browser.versions.android) {
//            window.local_obj.yibanhtml5location();
//        }else if(browser.versions.ios) {
//            ios_yibanhtml5location();
//        }else {
//            onerror('该终端类型暂不支持使用');
//        }
	}
	/**
	 * 1、首先获得高德地图的经度和纬度坐标
	 * 2、其次把高德地图坐标转换成百度地图坐标
	 * 3、统一调用百度地图api，计算距离，如果距离在规定范围内，则坐标取百度坐标，重新初始化地图的坐标点
	 *//*
	MAPUTIL.getGaodeLocation = function getGaodeLocation() {		
		var dfd = $.Deferred();
		AMap.plugin('AMap.Geolocation', function() {
	        var geolocation = new AMap.Geolocation({
	            enableHighAccuracy: true,//是否使用高精度定位，默认:true
	            timeout: 10000          //超过10秒后停止定位，默认：5s
	        });
	        window.gaodemap.addControl(geolocation);
	        geolocation.getCurrentPosition(function(status,result){
	            if(status=='complete'){	 
	            	MAPUTIL.gaode2baiduLocation(result.position.lng,result.position.lat);
	            	dfd.resolve();
	            }else{
	            	var msg =  '高德地图定位错误'||result.message;
//	                mintUI.MessageBox('提示', msg);
	                dfd.resolve();
	            }
	        });
	    });
		return dfd;
	};*/
	/**
	 * 高德坐标转换成百度坐标 GCJ-02——〉BD-09
	 */
	MAPUTIL.gaode2baiduLocation = function gaode2baiduLocation(gg_lng, gg_lat) {
		    var X_PI = Math.PI * 3000.0 / 180.0;
		    var x = gg_lng, y = gg_lat;
		    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
		    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
		    var bd_lng = z * Math.cos(theta) + 0.0065;
		    var bd_lat = z * Math.sin(theta) + 0.006;
		    return {bd_lat:bd_lat,bd_lng:bd_lng};
//			window.gaodepositionlng=bd_lng;
//			window.gaodepositionlat=bd_lat;
		};
		/**
		 * 百度地图坐标转换成高德 地图坐标 
		 */
	MAPUTIL.baidu2gaodeLocation = function baidu2gaodeLocation(bd_lng, bd_lat) {
		    var X_PI = Math.PI * 3000.0 / 180.0;
		    var x = bd_lng - 0.0065;
		    var y = bd_lat - 0.006;
		    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
		    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
		    var gg_lng = z * Math.cos(theta);
		    var gg_lat = z * Math.sin(theta);
		    return {lng: gg_lng, lat: gg_lat}
		};
		/**
		 * 距离当前位置距离
		 */
	MAPUTIL.curDistance = function curDistance(lng,lat){
		var curpoint = new BMap.Point(window.curlng*1,window.curlat*1);
		var destinpoint = new BMap.Point(lng*1,lat*1);
		return MAPUTIL.getBaiduDistance(curpoint,destinpoint);
	}
		/**
		 * 获取距离
		 */
	MAPUTIL.getBaiduDistance = function getBaiduDistance(pointA,pointB){
		MAPUTIL.createMap();
		return window.baidumap.getDistance(pointA,pointB).toFixed(2);
	}
		
})(window.MAPUTIL = MAPUTIL);