/**daDateSelect
* 下拉框式日期选择器
* @author danny.xu
* @version daDateSelect 1.0 2012-5-6
*/

(function( win, undefined ){
var doc = win.document;

var daDateSelect = (function(){
	
	/**daDateSelect类构造函数
	*/
	var daDateSelect = function( setting ){
		return new daDateSelect.fnStruct.init( setting );
	};

	daDateSelect.fnStruct = daDateSelect.prototype = {
		version: "daDateSelect 1.0 \n author: danny.xu \n date: 2012-5-6",
		
		parentObj: null,
		obj: null,
		yearObj: null,
		monthObj: null,
		dateObj: null,
		houerObj: null,
		minuteObj: null,
		secondObj: null,
		
		setting: {
			parent: null,
			year: "",
			month: "",
			date: "",
			hour: "",
			minute: "",
			second: "",
			
			change: null
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			var tmp = da( setting.parent );							//缓存父节点DOM对象
			if( 0>=tmp.dom.length ){
				alert("daDateSelect没有找着父节点");
				return;
			}
			this.parentObj = tmp.dom[0];
			
			var today = new Date();
			setting.year = "" !== setting.year ? setting.year : today.getFullYear();
			setting.month = "" !== setting.month ? setting.month : today.getMonth();
			setting.date = "" !== setting.date ? setting.date : today.getDate();
			
			this.create();
			this.bindEvent();
		},
		
		create: function(){
			this.obj = doc.createElement("div");
			this.yearObj = doc.createElement("select");
			this.monthObj = doc.createElement("select");
			this.dateObj = doc.createElement("select");
			
			this.obj.cssText = "display:inline-block; padding:2px; border:1px solid #f0f0f0;";
			
			var today = new Date(),
				tYear = today.getFullYear(),
				tMonth = today.getMonth(),
				tDate = today.getDate();
			
			var tmpObj;
			for( var i=tYear-10; i<tYear+10; i++ ){												//年份
				tmpObj = doc.createElement("option");
				tmpObj.setAttribute("value",i);
				tmpObj.innerHTML = i +"年";;
				
				if( this.setting.year === i ){
					tmpObj.setAttribute( "selected", true );
				}
				this.yearObj.insertBefore( tmpObj, null );
			}
			// yearObj.setAttribute("size",10);
			this.obj.insertBefore( this.yearObj, null );
			
			
			var mapCN = ["一","二","三","四","五","六","七","八","九","十","十一","十二"];		//月份
			for( var i=0; i<12; i++ ){					
				tmpObj = doc.createElement("option");
				tmpObj.setAttribute("value",i);
				tmpObj.innerHTML = mapCN[i] +"月";;
				
				if( this.setting.month === i ){
					tmpObj.setAttribute( "selected", true );
				}
				this.monthObj.insertBefore( tmpObj, null );
			}
			// monthObj.setAttribute("size",10);
			this.obj.insertBefore( this.monthObj, null );
			
			this.createDate();
			this.obj.insertBefore( this.dateObj, null );
			
			this.parentObj.insertBefore( this.obj, null );
		},
		
		createDate: function(){
			if( !this.dateObj ) return;
			this.dateObj.innerHTML = "";
			
			var tmpObj,
				nDate = (new Date(this.getYear(), this.getMonth(), 0)).getDate();			//日期, 获得当前月份天数

			for( var i=1; i<=nDate; i++ ){
				tmpObj = doc.createElement("option");
				tmpObj.setAttribute("value",i);
				tmpObj.innerHTML = i +"号";
				
				if( this.setting.date === i ){
					tmpObj.setAttribute( "selected", true );
				}
				this.dateObj.insertBefore( tmpObj, null );
			}
			// dateObj.setAttribute("size",10);
		},
		
		bindEvent: function(){
			var context = this,
				setting = this.setting;
			
			da( [this.yearObj, this.monthObj] ).bind("change.daDateSelect",function(){
				context.createDate();
			});
			
			da( this.dateObj ).bind("change.daDateSelect",function(){
				setting.change && setting.change( context.get() );
			});
			
		},
		
		get: function(){
			return new Date( this.getYear(), this.getMonth()-1, this.getDate() );
		},
		
		getYear: function(){
			return parseInt(this.yearObj.value);
		},
		
		getMonth: function(){
			return parseInt(this.monthObj.value)+1;
		},
		
		getDate: function(){
			return parseInt(this.dateObj.value);
		}
	};

	daDateSelect.fnStruct.init.prototype = daDateSelect.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daDateSelect;
})();




win.daDateSelect = daDateSelect;

})(window);