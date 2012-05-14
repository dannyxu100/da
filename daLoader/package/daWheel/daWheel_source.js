/**daWheel
*鼠标滚轮事件处理类
* @author danny.xu
* @version daWheel_1.0 2011-8-14 9:10:25
*/

(function( win, undefined ){
var doc = win.document;

var daWheel = (function(){
	
	/**daPopMenu类构造函数
	*@param {PlainObject} setting 参数列表
	
	*@retrun daWheel对象
	*/
	var daWheel = function( setting ){
		return new daWheel.fnStruct.init( setting );
	};

	daWheel.fnStruct = daWheel.prototype = {
		version: "daWheel v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",
		
		daWheelSrc: null,
		
		
		/**
		*@param {DOM|String} obj 滚轮事件对象 或对象id
		*@param {Function} before 滚轮滚动前回调函数
		*@param {Function} up 滚轮向上回调函数
		*@param {Function} down 滚轮向下回调函数
		*@param {Function} after 滚轮滚动后回调函数
		*/
		setting: {
			target: null, 
			before: null, 
			up: null, 
			down: null, 
			after: null
		},
		
		/**初始化函数
		*/
		init: function( setting ){
			this.setting = setting = da.extend( true, {}, this.setting, setting );
			
			this.daWheelSrc = da( setting.target );
			if( 0 >= this.daWheelSrc.dom[0].length) { alert("daWheel提示:找不到滚动事件对象。"); return; }
			
			this.bind();
		},
		
		/**绑定事件函数
		*/
		bind: function(){
			var context = this,
					fnBefore = this.setting.before,
					fnUp = this.setting.up,
					fnDown = this.setting.down,
					fnAfter = this.setting.after,
					mousewheel = da.browser.firefox ? "DOMMouseScroll" : "mousewheel";

			this.daWheelSrc.bind( mousewheel, this.eventWheel = function(evt){			//滚轮事件
				//执行滚动前回调事件
				if( fnBefore ) fnBefore.call( this, evt, context );
				
        if (evt.wheelDelta) { //IE
        	if(evt.wheelDelta > 0 && fnUp )									//↑滚轮向上滚
        		fnUp.call( this, evt, evt.wheelDelta/120, context );
        	else if( fnDown )																//↓滚轮向下滚
        		fnDown.call( this, evt, -evt.wheelDelta/120, context );
     
        }
        else if (evt.detail) { //firefox
        	if(evt.detail < 0 && fnUp)
        		fnUp.call( this, evt, -evt.detail/3, context );
        	else if( fnDown )
        		fnDown.call( this, evt, evt.detail/3, context );
        }
        
				//执行滚动后回调事件
				if( fnAfter ) fnAfter.call( this, evt, context );
			
				evt.stopPropagation();
				evt.preventDefault();
			});
			
			this.daWheelSrc.daWheelObj = this;									//在DOM对象的属性中缓存daWheel地址，方便之后调用daWheel.unbind()函数，事件的释放，避免内存泄露
		}
	};

	daWheel.fnStruct.init.prototype = daWheel.prototype;			//模块通过原型实现继承属性
	
	
	/**释放事件绑定（ 避免内存泄露 ）
	*/
	daWheel.unbind = function( srcObj ){
		var daWheelSrc = da( srcObj );
		if( 0 < daWheelSrc.dom.length ){
			var mousewheel = da.browser.firefox ? "DOMMouseScroll" : "mousewheel";
			
			daWheelSrc.each(function( i, obj ){
				var daWheelObj = this.daWheelObj;
				
				if( daWheelObj ){
					da( this ).unbind( mousewheel, daWheelObj.eventWheel );
					this.daWheelObj = null;
				}
			});
		}
		
	};
	

	return daWheel;
})();




win.daWheel = daWheel;

})(window);