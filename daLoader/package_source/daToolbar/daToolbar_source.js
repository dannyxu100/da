/**daToolbar
*工具条（分组按钮）类
* @author danny.xu
* @version daToolbar v2.0 2012-4-26
*/

(function( win, undefined ){
var doc = win.document;

var daToolbar = (function(){
	
	/**daToolbar类构造函数
	*/
	var daToolbar = function( setting ){
		return new daToolbar.fnStruct.init( setting );
	};

	daToolbar.fnStruct = daToolbar.prototype = {
		version: "daToolbar v2.0 \n author: danny.xu \n date: 2012-4-26",
		
		parentObj: null,
		barObj: null,
		curObj: null,
		
		setting: {
			id: "",
			parent: null,
			css: {
				bar: "daToolbar ",
				item: "item ",
				hover: "hover ",
				cur: "current "
			},
			
			showCurrent: true
		},
		
		/**初始化函数
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
		
			this.parentObj = da( setting.parent );
			if( 0 < this.parentObj.dom.length )
				this.parentObj = this.parentObj.dom[0];
			else
				return null;
			
			this.create();
		},
		
		/**创建容器对象
		*/
		create: function(){
			var setting = this.setting,
				barObj = document.createElement("ul");
			
			if( setting.id )
				barObj.id = setting.id;
			barObj.className = setting.css.bar;
			this.barObj = barObj;
			
			this.parentObj.insertBefore( this.barObj, null);
			
		},
		
		/**追加item
		*/
		appendItem: function(params){
			if( null == this.parentObj ) return;
			
			var def = {
				id: "",
				html: "",
				data: null,
				select: false,
				
				click: null
			};
			
			params = da.extend({}, def, params);
			if( !params.id ) return;
			
			var context = this,
				setting = this.setting,
				itemObj = document.createElement("li");
			
			if( params.id )
				itemObj.id = params.id;
			itemObj.className = setting.css.item + (params.select?setting.css.cur:"");
			itemObj.innerHTML = params.html;
			
			if( params.data )
				da.data( itemObj, "daToolbar_itemData", params.data );
			
			da(itemObj).bind("mousedown", function(){
				if( setting.showCurrent ){
					if( null != context.curObj ){
						context.curObj.className = context.curObj.className.replace(setting.css.cur, "");
					}
					var css = this.className;
					this.className = css + context.setting.css.cur;
					context.curObj = this;
				}
				
				if( params.click && da.isFunction(params.click) ) params.click();
			
			}).bind("mouseover", function(){
				var css = this.className;
				if( 0 > css.indexOf(context.setting.css.hover) )
					this.className = css + context.setting.css.hover;
				
			}).bind("mouseout", function(){
				var css = this.className;
				if( 0 <= css.indexOf(context.setting.css.hover) )
					this.className = css.replace(context.setting.css.hover, "");
				
			});
			
			if( params.select ) this.curObj = itemObj;
			
			this.barObj.insertBefore( itemObj, null);
			
		},
		
		/**选择或设置当前item
		*/
		select: function( id ){
			if( id && "string" == typeof id && 0 > id.indexOf("#") ){
				id = "#" + id;
			}
			
			da(id).mousedown();
			
			return {
				item: this.curObj,
				data: da.data( this.curObj, "daToolbar_itemData" )
			}
		},
		
		/**移除item
		*/
		removeItem: function( id ){
			if( id && "string" == typeof id && 0 > id.indexOf("#") ){
				id = "#" + id;
			}
			
			if( 0 < da(id).dom.length ){
				var isCurrent = false;
				if( this.curObj == da(id).dom[0] )
					isCurrent = true;
				
				da(id).remove();
				
				if( isCurrent ){
					if( this.barObj.firstChild ){
						da(this.barObj.firstChild).mousedown();
					}
				}
			}
			
		}
		
	};

	daToolbar.fnStruct.init.prototype = daToolbar.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daToolbar;
})();




win.daToolbar = daToolbar;

})(window);