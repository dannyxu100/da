/**daDate
*鼠标滚轮事件处理类
* @author danny.xu
* @version daDate2.0 2011-11-28 18:18:14
*/

(function( win, undefined ){
var doc = win.document;

var daDate = (function(){
	
	/**daDate类构造函数
	*/
	var daDate = function( setting ){
		return new daDate.fnStruct.init( setting );
	};

	daDate.fnStruct = daDate.prototype = {
		version: "daDate v2.0 \n author: danny.xu \n date: 2011-11-28 18:18:13",
		//TODO:成员属性
		
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
		}
		
		//TODO:成员函数
		
	};

	daDate.fnStruct.init.prototype = daDate.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	return daDate;
})();




win.daDate = daDate;

})(window);