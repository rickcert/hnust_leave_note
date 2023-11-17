 /**
 * @method bhFillStyle
 * @description 这是一个全局方法，用在mobile应用中，弥补某些标签未能占满全屏而导致出现两中不一致背景的场景
 * @param  {Object} childNode - 需要扩充高度的dom元素节点对象(必填)
 * @param  {Object} parentNode - 需要扩充高度的dom元素节点所相对的容器dom元素节点对象。(非必填，默认html高度)
 */
 (function(){
     window.bhFillStyle = function(childNode,parentNode){
         for(var i=0;i<arguments.length;i++){
             if(!isDom(arguments[i])) throw new Error("Invalid arguments");
         }
         var childNodeTop = childNode.offsetTop,
             childNodeHeight = childNode.clientHeight,
             parentNodeHeight = null;
         var htmlHeight = document.getElementsByTagName("html")[0].clientHeight;
         if(childNodeHeight+parentNodeHeight < htmlHeight){
             if(parentNode){
                 if(!isFather(childNode,parentNode)) throw new Error(parentNode+" should be "+childNode+"'s Parent Node. ");
                 parentNodeHeight = parentNode.clientHeight;
             }else{
                 parentNodeHeight = htmlHeight;
             }
             childNode.style.minHeight = parentNodeHeight-childNodeTop+"px";
         }
     };
     function isFather(childNode,parentNode){
         var child = childNode;
         while(child.parentNode){
             child = child.parentNode;
             if(child === parentNode) return true;
         }
         return false;
     }
     function isDom(obj){
         return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
     }
 })();
