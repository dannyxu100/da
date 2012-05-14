/**daKey
*键盘按键自定义类
* @author danny.xu
* @version daKey_1.0 2011-9-26 10:30:56
*/

(function( win, undefined ){
var doc = win.document;

var daKey = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daKey = function( kSetting ){
		return new daKey.fnStruct.init( kSetting );
	};

	daKey.fnStruct = daKey.prototype = {
		version: "daKey v1.0 \nauthor: danny.xu \ndate: 2011-9-26 10:31:02",
		
		kSetting: {
			target: document,
			
			noParent: false,
			noDefault: false,
			keydown: function(){},
			keyup: function(){}
		},
		
		/**初始化函数
		*/
		init: function( kSetting ){
			kSetting = this.kSetting = da.extend( true, {}, this.kSetting, kSetting );
			
			this.bindEvent();
		},
		
		/**绑定事件
		*/
		bindEvent:function(){
			var context = this,
				kSetting = this.kSetting;
			
			da.each( ["keydown", "keyup"], function( idx, type ){
					
					da( kSetting.target ).bind( type, function( evt ){					//按键按下
						var keyName = daKey.keyMap[ evt.keyCode ];
						
						if( "string" !== typeof keyName ) return;									//非监控键值域
						
						kSetting[ type ].call( context, keyName, evt.ctrlKey, evt.altKey, evt.shiftKey );
						
						if( kSetting.noDefault ) evt.preventDefault();						//阻止浏览器默认事件
						if( kSetting.noParent ) evt.stopPropagation();						//阻止浏览器默认快捷键
						
					});
			});

			
		}
		
	};

	daKey.fnStruct.init.prototype = daKey.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daKey;
})();



/**键值映射表
*/
daKey.keyMap = [
	0,1,2,3,4,5,6,7,"Back Space","Tab",10,11,"Clear","Enter",14,15,"Shift","Ctrl","Alt",19,"Caps Lock",21,22,23,24,25,26,
	"Esc",28,29,30,31,"Spacebar","Page Up","Page Down","End","Home","Left Arrow","Up Arrow","Right Arrow","Down Arrow",41,42,
	43,44,"Insert","Delete",47,
	
	//字母和数字键的键码值
	"0","1","2","3","4","5","6","7","8","9",58,59,60,61,62,63,64,"A","B","C","D","E","F","G","H",
	"I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",91,92,93,94,95,
	
	//数字键盘
	"r0","r1","r2","r3","r4","r5","r6","r7","r8","r9","r*","r+","rEnter","r-","r.","r/",
	
	//功能键的键码值
	"F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12",124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,
	
	"Num Lock",145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,
	177,178,179,180,181,182,183,184,185,":","+","<","-",">","?","~",193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,
	212,213,214,215,216,217,218,"{","|","}",'"'

];

win.daKey = daKey;

})(window);