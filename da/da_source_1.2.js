/*
	author:	danny.xu
	date:	2010.11.8
	description:	javascript对象扩展
*/
(function(win){
		//对象类型转字符串
		_daToString = Object.prototype.toString;							//通过这种方式判断： "[object Array]" == _daToString.call(objDOM)
		//判断对象是否拥有XX属性       
		_daHasOwnProperty = Object.prototype.hasOwnProperty; 		//通过这种方式判断： _daHasOwnProperty.call(obj, "constructor")
		
		//日期格式化
		//alert(new Date().format("yyyy-MM-dd")); 
		//alert(new Date("january 12 2008 11:12:30").format("yyyy-MM-dd hh:mm:ss")); 
		Date.prototype.format = function(format)
		{
		  var o = { 
		    "M+" : this.getMonth()+1, //month 
		    "d+" : this.getDate(),    //day 
		    "h+" : this.getHours(),   //hour 
		    "m+" : this.getMinutes(), //minute 
		    "s+" : this.getSeconds(), //second 
		    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter 
		    "S" : this.getMilliseconds() //millisecond 
		  };
		  
		  if(/(y+)/.test(format))
		  	format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		  
		  for(var k in o){
		  	if(new RegExp("("+ k +")").test(format)) 
		    	format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		  }
		  return format; 
		};
		
		
		if (!Array.prototype.daIndexOf) 
		Array.prototype.daIndexOf = function(item, i ){ //判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 							//初始化起步查询的下标
		  var length = this.length;
		  if (i < 0) i = length + i; 	// 如i为负数，则从数组倒数i开始。
		  
		  var patt1 = new RegExp(item, "g");
		  var idx = 0;
			patt1.test(this);
			idx = patt1.lastIndex;
			patt1.lastIndex = 0;
			
			return idx;
		};
		
		if (!Array.prototype.indexOf) 
		Array.prototype.indexOf = function(item, i ){ //判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 							//初始化起步查询的下标
		  var length = this.length;
		  if (i < 0) i = length + i; 	// 如i为负数，则从数组末端开始。
		  for (; i < length; i++)
		    if (this[i] === item) return i;  // 使用全等于(===)判断符
		  return -1;
		};
		
		if (!Array.prototype.indexOf2) 
		Array.prototype.indexOf2 = function(item, i ,j){ //判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 							//初始化起步查询的下标
		  j || (j = 1); 							//每次查询的步长
		  var length = this.length;
		  if (i < 0) i = length + i; // 如i为负数，则从数组末端开始。
		  for (; i < length; i+=j)
		    if (this[i] === item) return i;  // 使用全等于(===)判断符
		  return -1;
		};
		
		document.getElementsByName2 = function(tag, name){
		    var returns = document.getElementsByName(name);   
		    if (returns.length > 0) return returns;
		    
		    returns = new Array();   
		    var e = document.getElementsByTagName(tag);   
		
		    for (var i = 0; i < e.length; i++) {   
		        if (e[i].getAttribute("name") == name) {   
		            returns[returns.length] = e[i];   
		        }   
		    }   
				return returns;   
		};

})(window);



/*
	author:	danny.xu
	date:	2011.2.12
	description:	da前台javascript辅助脚本库
	version: 1.2
*/

(function(win){
	var doc = win.document;
	
	//构造函数
	var da = function(obj){
		return new da.fnStruct.init(obj);
	},
	
	daDoc = null;
	
	//da类属性集
	da.fnStruct = da.prototype = {
		version: "DA Library1.0  \n\nauthor: danny.xu\n\ndate: 2010-11-08\n\nThank you!!!",
		
		dom: null,		//操作对象数组
		length:	0,		//操作对象个数
		
		//初始化函数
		init: function( obj ){
			this.dom = [];
			
			if( undefined !== obj ){
				this.findDOM( obj );
			}
			
		},
		
		
		//DOM对象选择器
		findDOM: function( obj ){
			var arrDOM = da.find( obj );
			
			if( undefined !== arrDOM.length ){				//如果是数组
				this.dom = arrDOM;
			}
			else{																			//如果是单一对象
				if( arrDOM ) this.dom.push( arrDOM );
			}

			this.length = this.dom.length;					//重置一下操作对象个数值
		},
		
		//压入DOM对象
		pushDOM: function( objs ){
				var objRet = da();
				da.pushArray( objs, objRet.dom );
		
				return objRet;
		},
		
		//类数组批处理函数
		/*
			fn:	逐个回调函数( 如果此函数返回为 false, 可以终止批处理函数的继续执行 )
			arg: 此参数只供脚本库内部使用( 可以直接传入调用函数 当前的arguments )
		*/
		each: function( fn, args ) {
			return da.each( this.dom, fn, args );
		},
		
		//数组对象映射过滤器
		/*
			fn:	回调过滤函数
		*/
		map: function( fn ) {
			return this.pushDOM( da.map(this.dom, function( obj, i ) {
				return fn( obj, i );
			}));
		}
	};
	
	//对象继承da类属性
	da.fnStruct.init.prototype = da.prototype;
	
	//全局变量
	win.da = da;

	/*********************** da类核心全局函数 *****************************/
	/*   ###001   */
	//通过id找元素标签 da("id:youDiv_Id") = doc.getElementById("youDiv_Id");
	//通过name找元素标签 da("id:youDiv_Name") = doc.getElementsByName2("youDiv_Id");
	//通过tag找元素标签 da("id:div") = doc.getElementsByTagName("DIV");
	var daRe_id = /^id:.+$/,
	daRe_name = /^name:.+$/,
	daRe_tag = /^tag:.+$/,
	daRe_class = /^class:.+$/;
	
	//DOM对象选择器函数
	/*
		obj: 找DOM的规范字符串,参考: ###001
	*/
	da.find = function( obj ){
			var arrDOMS = [];
			
			if( "string"===typeof obj ){
					var listFind = obj.split(",");
					var strFind = "";
					var tmpDOM = null;
					
					for(var i=0,len=listFind.length; i<len; i++){
								strFind = listFind[i];
								
								//ID
								if( daRe_id.test(strFind) ){
											strFind=strFind.substring( strFind.indexOf( ":" ) + 1 );
											tmpDOM = doc.getElementById( strFind );
											da.pushArray( tmpDOM, arrDOMS );
								}
								
								//NAME
								if( daRe_name.test(strFind) ){
											strFind=strFind.substring( strFind.indexOf( ":" ) + 1 );
											tmpDOM = doc.getElementsByName2( strFind );
											da.pushArray( tmpDOM, arrDOMS );
								}
								
								//TAG
								if( daRe_tag.test(strFind) ){
											strFind=strFind.substring( strFind.indexOf(":") + 1 ).toUpperCase();
											tmpDOM = doc.getElementsByTagName( strFind );
											da.pushArray( tmpDOM, arrDOMS );
								}
								
					}
					
					
			}
			else if( da.isFunction( obj ) ) {							//如果obj是函数，就是给document绑定ready事件函数，如da(function(){alert("documentready!!!");});
				da.pushArray( daDoc.ready( obj ), arrDOMS );
			}
			else{
				da.pushArray( obj, arrDOMS );
			}
			
			return arrDOMS || undefined;
	};


	//类数组批处理函数
	/*
		objs: 批处理目标对象
		fn:	逐个回调函数( 如果此函数返回为 false, 可以终止批处理函数的继续执行 )
		arg: 此参数只供脚本库内部使用
	*/
	da.each = function( objs, fn, args ) {
			var name,
					i = 0,
					length = objs.length,
					isObj = ( length === undefined ) || da.isFunction(objs);
	
			if( args ) {
					if ( isObj ) {						//非类数组
							for ( name in objs ) {
									if ( fn.apply( objs[ name ], args ) === false ) {
										break;
									}
							}
					}
					else {										//类数组
							for ( ; i < length; ) {
									if ( fn.apply( objs[ i++ ], args ) === false ) {
										break;
									}
							}
					}
	
			} else{
					if ( isObj ) {						//非类数组
							for( name in objs ) {
									if ( fn.call( objs[ name ], name, objs[ name ] ) === false ) {
										break;
									}
							}
					}
					else{											//类数组
							for( var value=objs[0]; i<length && ( fn.call( value, i, value ) !== false ); value=objs[++i] ) {}
					}
			}
	
			return objs;
	};

	//数组对象映射过滤器
	/*
		objs: 目标数组对象
		fn:	回调过滤函数
		arg: 此参数只供脚本库内部使用
	*/
	da.map = function( objs, fn, arg ) {
		var retArray = [], 
				value = null;

		for ( var i = 0, length = objs.length; i < length; i++ ) {				//循环目标数组对象，通过调用过滤函数，最终得到过滤后的有效数组
			value = fn( objs[ i ], i, arg );

			if ( value != null ) {
					//retArray[ retArray.length ] = value;
					retArray.push( value );
			}
		}
		//return retArray.concat.apply( [], retArray );
		return retArray.concat( retArray );
		
	};
	
	//扩展函数（对象重载、合并函数）
	/*
		dest : 插件扩展目标
		src1,src2,src3...srcN	:	扩展内容键值对（重载：同键值会覆盖）
	*/
	da.extend = da.fnStruct.extend = function(/* dest,src1,src2,src3...srcN */) {
			var target = arguments[0] || {},
					i = 1,
					length = arguments.length,
					deep = false,
					options = null,
					name = null,
					src = null, 
					copy = null;
			
			if ( typeof target === "boolean" ) {				//判断是否需要深度扩展合并（深度扩展合并只能有一个源）
				deep = target;
				target = arguments[1] || {};
				i = 2;
			}
		
			if ( typeof target !== "object") {					//深度扩展合并需要 符合的数据类型
				target = {};
			}
		
			if ( length === i ) {												//深度扩展（第一个目标参数为boolean） 或 调用对象自身扩展（只有一个参数且为源参数）
				target = this;
				--i;
			}
		
			for ( ; i < length; i++ ) {
				if ( (options = arguments[ i ]) != null ) {			//获取 源对象参数
					for ( name in options ) {											//抽取 源对象中的属性
						src = target[ name ];						//扩展目标对象 已有属性
						copy = options[ name ];					//源对象 重载属性
		
						if ( target === copy ) {				//源对象 === 扩展目标对象（就是一模一样的对象，不存在扩展不扩展），直接跳过
							continue;
						}
						
						//如果有嵌套键值对对象或多维数组，并允许深度扩展
						if ( deep && copy && ( da.isPlainObj(copy) || da.isArray(copy) ) ) {
							var clone = src && ( da.isPlainObj(src) || da.isArray(src) ) ? src : da.isArray(copy) ? [] : {};
		
							//继续扩展
							target[ name ] = da.extend( deep, clone, copy );
		
						//没有有嵌套键值对对象或多维数组，或者不允许深度扩展
						}
						else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
		
			//返回扩展后的对象
			return target;
	};
	
	
	//***************** 扩展部分 通用功能 函数 *****************/
	da.extend({
		// See test/unit/core.js for details concerning isFunction.
		// Since version 1.3, DOM methods and functions like alert
		// aren't supported. They return false on IE (#2968).
		isWin: function( obj ) {
			return obj && typeof obj === "object" && "setInterval" in obj;
		},
		
		isDoc: function( obj ) {
			return obj.nodeType === 9;
		},
		
		isFunction: function( obj ) {
			return _daToString.call(obj) === "[object Function]";
		},
	
		isArray: function( obj ) {
			return _daToString.call(obj) === "[object Array]";
		},
	
		isPlainObj: function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || _daToString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
				return false;
			}
			
			// Not own constructor property must be Object
			if ( obj.constructor
				&& !_daHasOwnProperty.call(obj, "constructor")
				&& !_daHasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
			
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
		
			var key;
			for ( key in obj ) {}
			
			return key === undefined || _daHasOwnProperty.call( obj, key );
		},
	
		isEmptyObj: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
		//判空
		/*
			obj1: 判空对象对象
			obj2: obj1为空替代对象
		*/
		isNull: function( obj1,obj2 ){
			 var reObj = "" ;
		   if (2 == arguments.length ) reObj = obj2 ;
		   
		   if (( undefined==obj1 )
		   || ( null==obj1 ) 
		   || ( "undefined"==obj1 ) 
		   || ( "NaN"==obj1 ) 
		   || ( "Infinity"==obj1 ) 
		   || ( "&nbsp;" == obj1 ) 
		   || ( "&#160;"==obj1 ) 
		   || ( ""===obj1 )
		   || ( String.fromCharCode( 160 )===obj1 ) )
			   return reObj ;
		   else
		   	return obj1;
		},
		
		//无效数值
		/*
			obj: 判断对象
		*/
		isNaN: function( obj ) {
			return obj == null || !/\d/.test( obj ) || isNaN( obj );
		},
		
		//压为数组( 追加 )
		/*
			srcObj: 压为数组的目标对象
			retArray:	新建返回或传入的容器数组
		*/
		pushArray: function( srcObj, retArray ){
				retArray = retArray || [];
				var rIdx = retArray.length, sIdx = 0;
		
				if ( srcObj != null ) {
						// The extra typeof function check is to prevent crashes
						if ( srcObj.length == null 																			//因为window, strings, functions 也有"length"属性
							|| typeof srcObj === "string" 																//string 对象
							|| da.isFunction( srcObj ) 																		//function 对象
							|| da.isWin( srcObj ) ) {																			//window 对象
							
							retArray.push( srcObj );																			//直接把对象压入数组
							
						} 
//						else if ( da.isArray( srcObj ) ) {								//如果是数组直接用push
//							retArray.push(srcObj);
//						
//						}
						else {
								if ( typeof srcObj.length === "number" ) {				//如果是数组
									for ( var len=srcObj.length; sIdx < len; sIdx++ ) {
										retArray[ rIdx++ ] = srcObj[ sIdx ];
									}
								
								}
								else {
									while ( srcObj[sIdx] !== undefined ) {					//如果目标对象是键值对 对象
										retArray[ rIdx++ ] = srcObj[ sIdx++ ];
									}
								}
						
								retArray.length = rIdx;
						
						}
				}
				
				return retArray;
		}
		
	});

	//***************** 扩展部分 正则表达式 函数 *****************/
	da.extend({
		
		//通用正则表达式判定函数
		/*
			val: 判定值
			strRegex: 正则表达式字符串
		*/
		isMatch: function(val,regexp,allowEmpty){
			if(allowEmpty && "" === da.isNull(val,"")) return true;
			else if(!allowEmpty && "" === da.isNull(val,"")) return false;
			else return regexp.test(val);
		},
		
		//只能整数
		isInt: function(val,allowEmpty){
			return da.isMatch(val, /^-?\d+$/, allowEmpty);
		},

		//只能非负整数（正整数 + "0"）  
		isInt0Up: function(val,allowEmpty){
			return da.isMatch(val,/^\d+$/, allowEmpty);
		},
		
		//只能正整数
		isIntUp: function(val,allowEmpty){
			return da.isMatch(val,/^[0-9]*[1-9][0-9]*$/, allowEmpty);
		},
		
		//只能非正整数（负整数 + "0"） 
		isInt0Lower: function(val,allowEmpty){
			return da.isMatch(val, /^((-\d+)|(0+))$/, allowEmpty);
		},
	
		//只能负整数
		isIntLower: function(val,allowEmpty){
			return da.isMatch(val, /^-[0-9]*[1-9][0-9]*$/, allowEmpty);
		},
		
		//只能浮点数 
		isFloat: function(val,allowEmpty){
			return da.isMatch(val, /^(-?\d+)(\.\d+)?$/, allowEmpty);			
		},

		//只能非负浮点数（正浮点数 + "0"）
		isFloat0Up: function(val,allowEmpty){
			return da.isMatch(val, /^\d+(\.\d+)?$/, allowEmpty); 
		},
		
		//只能正浮点数
		isFloatUp: function(val,allowEmpty){
			return da.isMatch(val, /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/, allowEmpty);
		},
		
		//只能非正浮点数（负浮点数 + 0） 
		isFloat0Lower: function(val,allowEmpty){
			return da.isMatch(val, /^((-\d+(\.\d+)?)|(0+(\.0+)?))$/, allowEmpty);
		},
		
		//只能负浮点数
		isFloatLower: function(val,allowEmpty){
			return da.isMatch(val, /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/, allowEmpty);
		},
		
		//只能26个英文字母 组成
		isLetter: function(val,allowEmpty){
			return da.isMatch(val, /^[A-Za-z]+$/, allowEmpty);
		},
		
		//只能26个英文字母 大写 组成
		isLetterUpper: function(val,allowEmpty){
			return da.isMatch(val, /^[A-Z]+$/, allowEmpty);
		},
		
		//只能26个英文字母 小写 组成
		isLetterLower: function(val,allowEmpty){
			return da.isMatch(val, /^[a-z]+$/, allowEmpty);
		},
		
		//只能数字 和 26个英文字母 组成
		isNumLetter: function(val,allowEmpty){
			return da.isMatch(val, /^[A-Za-z0-9]+$/, allowEmpty);
		},
		
		//只能数字、26个英文字母 或者下划线 组成 
		isCode: function(val,allowEmpty){
			return da.isMatch(val, /^\w+$/, allowEmpty);
		},
		
		//只能中文字符串 组成 
		isCN: function(val,allowEmpty){
			return da.isMatch(val, /^[\u4e00-\u9fa5]*$/, allowEmpty);
		},
		
		//只能中文字符串、26个英文字母 或者下划线（一般的名称验证）
		isName: function(val,allowEmpty){
			return da.isMatch(val, /^[a-zA-Z\u4e00-\u9fa5_]*$/, allowEmpty);
		},
		
		//只能中文字符串、数字、26个英文字母 或者下划线（一般的账号验证）
		isAccount: function(val,allowEmpty){
			return da.isMatch(val, /^[\w\u4e00-\u9fa5]*$/, allowEmpty);
		},
		
		//判断是否电话号码（包括手机）
		isPhone: function(val,allowEmpty){
			return da.isMatch(val, /^(((\+86)|(86))?(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[2|6|7|8|9])\d{8}|(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/, allowEmpty); 
		},
		
		//判断是否手机号码
		isMobile: function(val,allowEmpty){
			//现在的手机号码增加了150,153,156,158,159,157,188,189
			return da.isMatch(val, /^((\+86)|(86))?(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[2|6|7|8|9])\d{8}$/, allowEmpty); 
		},
		
		//判断是否中国身份证号码
		isIDCard: function(val,allowEmpty){
			return da.isMatch(val, /^\d{18}|\d{15}$/, allowEmpty); 
		},
		
		//判断是否是银行卡号码
		isBankCard: function(val,allowEmpty){
			return da.isMatch(val, /^\d{19}$/, allowEmpty); 
		},
		
		//判断是否电子邮件地址
		isEmail: function(val,allowEmpty){
			return da.isMatch(val, /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, allowEmpty); 
		},
		
		//判断是否是中国邮政编码
		isPostCode: function(val,allowEmpty){
			return da.isMatch(val, /^[1-9]{1}(\d+){5}$/, allowEmpty); 
		},
		
		//判断是否是IP地址
		isIP: function(val,allowEmpty){
			return da.isMatch(val, /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,allowEmpty); 
		},
		
		//判断是否是IP地址
		isHTTP: function(val,allowEmpty){
			return da.isMatch(val, /^[a-zA-z]+:(\/|\\){2}[^s]*$/, allowEmpty); 
		},
		
		//判断是否是HTML代码
		isHTML: function(val,allowEmpty){
			return da.isMatch(val, /<(S*?)[^>]*>.*?|< .*? \/>/, allowEmpty);
		}          
		
	});
	
	//***************** 扩展部分 浏览器功能 函数 *****************/
	da.extend({
		//获取浏览器类型和版本
		getNavigator: function(){
			var Sys = {},
					ua = navigator.userAgent.toLowerCase(),
					s;
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
			(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
			(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
			(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
			
			//以下进行测试
			var arrMsg = [];
			if (Sys.ie) arrMsg.push("IE: "+ Sys.ie+ "\n");
			if (Sys.firefox) arrMsg.push("Firefox: "+ Sys.firefox+ "\n");
			if (Sys.chrome) arrMsg.push("Chrome: "+ Sys.chrome+ "\n");
			if (Sys.opera) arrMsg.push("Opera: "+ Sys.opera+ "\n");
			if (Sys.safari) arrMsg.push("Safari: "+ Sys.safari+ "\n");
			
			//alert(arrMsg.join(""));
			return arrMsg.join("");
		},
		
		//错误图片显示默认路径
		/*
			url:	图片地址
		*/
		imgErr: function(url){
			url = url || "/logo.gif";
			imgObj.src = url;
		},
		
		//预加载图片
		/*
			url:	图片地址
			callback:	加载完毕回调函数
		*/
		loadImage: function(url, fn) {
		  var img = new Image(); 			//创建一个Image对象，实现图片的预下载
		  img.src = url;
		  if (img.complete) { 				// 如果图片已经存在于浏览器缓存，直接调用回调函数
		      fn.call(img);
		      return; 								// 直接返回，不用再处理onload事件
		  }
		
		  img.onload = function () { 	//图片下载完毕时异步调用callback函数。
		      fn.call(img);						//将回调函数的this替换为Image对象
		  };
		},
		
		//获取url参数
		/*
			url:	地址串
		*/
		urlParams: function( url ){
		     url = url || location.search.substring(1);      	//获取要查询的url地址串
		     var arrayPair = url.split("&");                  //切开参数
		     var args = {};
		     
		     for(var i = 0; i < arrayPair.length; i++) {
		         var pos = arrayPair[i].indexOf('=');         //通过"="发现参数
		         if (pos == -1) continue;                   	//没有找到"="符号,直接跳过
		         
		         var argName = arrayPair[i].substring(0,pos); //获取参数名
		         var argValue = arrayPair[i].substring(pos+1);//获取参数值
		         //value = decodeURIComponent(value);        		 //如果需要可以编码
		         args[argName] = argValue;                    //缓存入map对象
		     }
		     return args;                                   	//返回整个参数列表对象
		},
		
		//设置或获取cookie
		cookie: function( name, value, expires, path, domain, secure ) {
				//get操作
				if( undefined == value ){
				    var start = document.cookie.indexOf( name + "=" ),
				        len = start + name.length + 1;
						
						if ( start == -1 ) return null;													//没有找到对应name的cookie;
				    if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) return null;			//找到正好是第一个,但如果不是对应的name
				    
				    var end = document.cookie.indexOf( ';', len );					//da自定义cookie默认格式,有效期、路径等参数是通过"；"分隔的,取值只需取到第一个分号为止
				    if ( end == -1 ) end = document.cookie.length;					//如果没有按da默认格式"；",就直接取完
				    
				   	return unescape(document.cookie.substring(len, end));
				}
				//set操作
		    var expires_date = null,
		    		today = new Date();																	//获取当前时间
		    
		    today.setTime(today.getTime());
		    if (expires) expires = expires * 1000 * 60 * 60 * 24;		//有效时间 单位天
		    expires_date = new Date( today.getTime() + ( expires ) );
		    
		    document.cookie = [
		    		name, "=", escape(value),
		    		( ( expires ) ? ';expires=' + expires_date.toGMTString() : '' ),
		    		( ( path ) ? ';path=' + path : ''),
		    		( ( domain ) ? ';domain=' + domain : '' ),
		    		( ( secure ) ? ';secure' : '' )
		    ].join("");
		    
		},
		
		//删除cookie
		deleteCookie: function(name, path, domain) {
		    if (getCookie(name))
		    	document.cookie = name + '=' + ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
		},

		//组织事件冒泡函数
		/*
			evt: 事件对象
		*/
		stopDefault: function( evt ) {   
	     //阻止默认浏览器动作(W3C)   
	     if ( evt && evt.preventDefault )   
	         evt.preventDefault();   
	     //IE中阻止函数器默认动作的方式   
	     else  
	         window.event.returnValue = false;   
	     return false;
	 }
		
	});

	//***************** 扩展部分 document对象ready回调函数 *****************/
	
	var readyBound = false,		//判断是否已经绑定ready事件函数
			readyList = [];				//回调函数列表(支持多个ready函数的调用)
			daDoc = da( doc );

	//消除document的ready事件函数
	if ( doc.addEventListener ) {
		DOMContentLoaded = function() {
			doc.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			da.ready();
		};
	
	} else if ( doc.attachEvent ) {
		DOMContentLoaded = function() {
			if ( doc.readyState === "complete" ) {					//针对IE要判断body是否已经加载完毕
				doc.detachEvent( "onreadystatechange", DOMContentLoaded );
				da.ready();
			}
		};
	}
	
	//针对IE 检查DOM是否已经加载完毕
	function doScrollCheck() {
		if ( da.isReady ) {
			return;
		}
	
		try {
			doc.documentElement.doScroll("left");			//针对IE 代替DOMContentLoaded方法的一种监听处理（在ondocumentready之前会一直抛异常）
		} catch(e) {
			setTimeout( doScrollCheck, 1 );						//通过反复运行doScrollCheck达到监听documentready的效果
			return;
		}
	
		da.ready();						//documentready就调用da.ready();
	};
	
	da.extend({
			isReady: false,			//确定document是否可以使用，如果可以设置为true
			readyWait: 1,				//ready回调函数的计数器
			
			//绑定ready函数
			bindReady: function() {
				if ( readyBound ) {
					return;
				}
			
				readyBound = true;		//首次绑定ready事件函数
			
				//浏览器的ready事件触发后被$(document).ready()捕获
				if ( doc.readyState === "complete" ) {
					return setTimeout( da.ready, 1 );			//异步处理
				}
				
				if ( doc.addEventListener ) {						//兼容W3C事件绑定
					doc.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );			//确保在onload事件之前触发
					win.addEventListener( "load", da.ready, false );														//绑定window.onload回调，这个事件总是一直存在的
			
				}
				else if ( doc.attachEvent ) {						//兼容IE
					doc.attachEvent("onreadystatechange", DOMContentLoaded);
					win.attachEvent( "onload", da.ready );
			
					var toplevel = false;									//如果是IE并且没有框架结构，继续检查document是否已经加载完毕
					try {
						toplevel = ( win.frameElement == null );
					} catch(e) {}
			
					if ( doc.documentElement.doScroll && toplevel ) {
						doScrollCheck();
					}
				}
				
			},

			//DOM对象加载完毕处理函数
			/*
				wait: 
			*/
			ready: function( wait ) {
				// A third-party is pushing the ready event forwards
				if ( wait === true ) {
					da.readyWait--;
				}
			
				//如果DOM对象还没有加载完毕
				if ( !da.readyWait || (wait !== true && !da.isReady) ) {
						if ( !doc.body ) {									//判断body存在
							return setTimeout( da.ready, 1 );			//调用静态ready函数
						}
						
						da.isReady = true;											//设置document状态为可用
						
						if ( wait !== true && ( --da.readyWait > 0 ) ) {		//如果一个document的ready事件被触发，da.readyWait递减，并直接返回
							return;
						}
				
						if ( readyList ) {											//如果有绑定回调函数，就执行回调函数列表
								var fn,
										i = 0,
										ready = readyList;
				
								readyList = null;										//置空回调函数列表
					
								while ( (fn = ready[ i++ ]) ) {
									fn.call( doc, da );
								}
					
								// Trigger any bound ready events
								if ( da.fnStruct.trigger ) {
									da( doc ).trigger( "ready" ).unbind( "ready" );
								}
						}
				}
			}

	});

	da.fnStruct.extend({
			//加载完毕处理函数
			/*
				fn: 回调函数
			*/
			ready: function( fn ) {
				da.bindReady();
		
				if ( da.isReady ) {									//如果document已经加载完毕
					fn.call( doc, jQuery );						//立即回调函数
		
				}
				else if ( readyList ) {							//如果没有加载完毕，将对调函数压入全局列表
					readyList.push( fn );
					
				}
		
				return doc;
			}
	
	});
	
	//***************** 扩展部分 DOM对象事件绑定 函数 *****************/
	da.extend({
		//兼容IE和W3C的事件绑定
		/*
			objDOM : 绑定事件的DOM对象
			objEvents : 事件触发函数键值对		如：{"click":fn1(){}, "mouseover":fn2(){}, ... ,"mouseout":fn3(){}}
			useCapture : 是否锁定 当前对象为事件捕获对象 范围
		*/
		eventBind: function(objDOM, objEvents, useCapture) {
			 useCapture = useCapture || false;
			 
			 var idx = 0,
			 		 len = 1,
					 arrDOMs = [];
					 
			 arrDOMs.push(objDOM);
			 
			 if("[object Array]" == _daToString.call(objDOM)) {
			 	arrDOMs = objDOM;
			 	len = objDOM.length
			 };
			 for(; idx< len; idx++){								//循环多DOM对象 数组
					for(var evtName in objEvents){			//循环多事件绑定 键值对
					   if (arrDOMs[idx].addEventListener) {		//W3C DOM        
					     arrDOMs[idx].addEventListener(evtName, objEvents[evtName], useCapture);
					   }
					   else if (arrDOMs[idx].attachEvent) {		//IE DOM   
					     arrDOMs[idx].attachEvent("on" + evtName, objEvents[evtName]);
					   }
					   else{
					   	 arrDOMs[idx]['on'+evtName] = objEvents[evtName];
					   }
						
					}
			 };
		},
		
		//兼容IE和W3C的事件移除
		/*
			objDOM : 绑定事件的DOM对象
			objEvents : 事件触发函数键值对		如：{"click":fn1(){}, "mouseover":fn2(){}, ... ,"mouseout":fn3(){}}
			useCapture : 是否锁定 当前对象为事件捕获对象 范围
		*/
		eventRemove: function(objDOM, name, observer, useCapture) {
			 useCapture = useCapture || false;
			 
			 var idx = 0, 
			 		 len = 1,
					 arrDOMs = [];
					 
			 arrDOMs.push(objDOM);
			 
			 if("[object Array]" == _daToString.call(objDOM)) {
				 	arrDOMs = objDOM;
				 	len = objDOM.length
			 };
			
			 for(; idx< len; idx++){
					for(var evtName in objEvents){			//循环多事件绑定 键值对
					   if (arrDOMs[idx].removeEventListener) {		//W3C DOM        
					     arrDOMs[idx].removeEventListener(evtName, objEvents[evtName], useCapture);
					   }
					   else if (arrDOMs[idx].detachEvent) {				//IE DOM   
					     arrDOMs[idx].detachEvent("on" + evtName, objEvents[evtName]);
					   }
					   else{
					   	 arrDOMs[idx]['on'+evtName] = null;
					   }
					}
			 }
		}
	});
	
	//***************** 扩展部分 DOM对象操作功能 函数 *****************/
	//浏览器兼容性判断
	var div = doc.createElement("div");
	div.innerHTML = "<a style='color:red;float:left;opacity:.55;'>a</a>";
	var a = div.getElementsByTagName("a")[0];
	if (!a ) return;
	
	da.support = {};							//浏览器兼容性判断 缓存集
	da.support = {
			opacity: /^0.55$/.test( a.style.opacity ),	//opacity 不透明度属性兼容性判断
			cssFloat: !!a.style.cssFloat,								//float 浮动位置属性兼容性判断
			getComputedStyle: doc.defaultView && doc.defaultView.getComputedStyle,				//defaultView.getComputedStyle 函数支持判断
			
			boxModel: null,															//盒子模型支持
			inlineBlockNeedsLayout: false,							//inline-block支持
			shrinkWrapBlocks: false,										//拆封块支持
			reliableHiddenOffsets: true									//隐藏元素可靠性支持
	};
	
	// Figure out if the W3C box model works as expected
	//在做下面的兼容性验证之前，document必须先加载完毕
	da(function() {
		var div = doc.createElement("div");
		div.style.width = div.style.paddingLeft = "1px";

		doc.body.appendChild( div );
		da.boxModel = da.support.boxModel = div.offsetWidth === 2;

		if ( "zoom" in div.style ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			da.support.inlineBlockNeedsLayout = div.offsetWidth === 2;

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			da.support.shrinkWrapBlocks = div.offsetWidth !== 2;
		}

		div.innerHTML = "<table><tr><td style='padding:0;display:none'></td><td>t</td></tr></table>";
		var tds = div.getElementsByTagName("td");

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		da.support.reliableHiddenOffsets = tds[0].offsetHeight === 0;

		tds[0].style.display = "";
		tds[1].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE < 8 fail this test)
		da.support.reliableHiddenOffsets = da.support.reliableHiddenOffsets && tds[0].offsetHeight === 0;
		div.innerHTML = "";

		doc.body.removeChild( div ).style.display = "none";
		div = tds = null;

	});
	
	
	//公用源码正则表达式
	var	daRe_exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
			daRe_alpha = /alpha\([^)]*\)/,
			daRe_opacity = /opacity=([^)]*)/,
			daRe_float = /float/i,
			daRe_dashAlpha = /-([a-z])/ig,
			daRe_upper = /([A-Z])/g,
			daRe_numpx = /^-?\d+(?:px)?$/i,
			daRe_num = /^-?\d/;

	//DOM对象 样式属性 操作函数扩展
	da.fnStruct.extend({
			//节点样式属性 操作函数
			/*
				obj: DOM节点对象
				name: style样式属性名
				value: style样式属性值
			*/
			css: function(name, value ) {
					return da.access( this.dom, name, value, true, function( obj, name, value ) {			//danny.xu 2010-12-24 将this替换成this.dom因为da类本身不是数组
							//get操作
							if ( undefined===value ) {
								return da.curCSS( obj, name );
							}
							
							//set操作
							if ( "number"===typeof value && !daRe_exclude.test(name) ) {
								value += "px";
							}
							da.style( obj, name, value );
							
					});
					
			}
	});
	da.extend({
			//节点最高优先级样式属性 操作函数
			/*
				obj: DOM节点对象
				name: style样式属性名
				force: 如果class中使用了!import,  force参数就应该为true;
			*/
			curCSS: function( obj, name, force ) {
					var ret, style = obj.style, filter;
					
					//IE不支持opacity属性，需要用filter滤镜处理
					if ( !da.support.opacity && "opacity"===name && obj.currentStyle ) {									//currentStyle代表了在全局样式表、内嵌样式、HTML标签属性中指定的对象格式或样式(如width、height)。
						ret = daRe_opacity.test(obj.currentStyle.filter || "") ? ((parseFloat(RegExp.$1)/100) +"") : "";		//如果找到opacity属性，返回第一个匹配的属性值
						
						return (""===ret) ? "1" : ret;		//如果没有定义opacity属性默认返回1 (100%显示)
					}
			
					//属性名 格式标准化处理
					if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//因为float是js的关键字,所以js规定方位float要用cssFloat，而为了兼容IE要用styleFloat访问
					
					//如果节点style属性有相应的内嵌值，直接取内嵌值
					//style中的属性优先级高于class,所以可以先从style中找，然后再从已经计算好的css属性中找。
					//如果内嵌style属性使用了!import处理兼容问题，就不能直接取style属性值了
					if ( !force && style && style[ name ] ) {
						ret = style[ name ];
			
					}
					//FireFox 等标准的浏览器通过getComputedStyle获取当前计算好的样式属性值
					else if ( da.support.getComputedStyle ) {
							if ( daRe_float.test( name ) ) {															//在使用getPropertyValue获取float属性值时，需要将前面格式化好的cssFloat或styleFloat属性名，改回为float
								name = "float";
							}
							
							name = name.replace( daRe_upper, "-$1" ).toLowerCase();				//如:font-Weight把中间部分大写的驼峰格式 "-W"替换成 "-w"小写
				
							var defaultView = obj.ownerDocument.defaultView;
				
							if ( !defaultView ) {
								return null;
							}
				
							var computedStyle = defaultView.getComputedStyle( obj, null );
				
							if ( computedStyle ) {
								ret = computedStyle.getPropertyValue( name );
							}
				
							if ( "opacity"===name && ""===ret ) {										//如果没有定义opacity属性默认返回1 (100%显示)
								ret = "1";			
							}
				
					}
					//IE 通过currentStyle获取当前计算好的样式属性值
					else if ( obj.currentStyle ) {
							var camelCase = name.replace(daRe_dashAlpha, function( all, letter ) {		//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
								return letter.toUpperCase();
							});	
				
							ret = obj.currentStyle[ name ] || obj.currentStyle[ camelCase ];
				
							//将非像素单位的属性值 转化为以像素为单位的值
							if ( !(daRe_numpx.test( ret )) && (daRe_num.test( ret )) ) {			//有值并且不是px单位的属性值
									var left = style.left, rsLeft = obj.runtimeStyle.left;				//缓存一下当前的属性值
									
									obj.runtimeStyle.left = obj.currentStyle.left;								//把优先级最高的样式 赋值给runtimeStyle（当前呈现的样式属性）
									style.left = ("fontSize"===camelCase) ? "1em" : (ret || 0);		//在压入新属性值后，获取全新计算出来 以像素为单位的样式值
									ret = style.pixelLeft + "px";
					
									style.left = left;																						//还原被临时改变的属性值
									obj.runtimeStyle.left = rsLeft;
							}
					}
			
					return ret;
			},
			
			//操作类型判断入口 函数
			/*
				arrObj: DOM节点对象集数组
				name: 属性名( 可以以 键值对的方式set多个属性值)
				value: 属性值( 可以是函数的形式, function(index, value){}, 属性值为函数计算返回值)
				exec:	在属性值的类型为function时,对设置之前的value值执行函数( 默认为true )
				fn:	
				pass: 是否通过da类的相应 成员函数来处理属性值
			*/
			access: function( arrObj, name, value, exec, fn, pass ) {
					var len = arrObj.length;
					
					//set多个属性
					if ( "object"===typeof name ) {						//在key值的类型为object时，会拆解value成key,value形式再次递归传入da.access
						for ( var k in name ) {
							da.access( arrObj, k, name[k], exec, fn, value );		//注: 键值对的方式 第三个参数value默认为undefined
						}
						return arrObj;
					}
					
					//set单一属性
					if ( undefined!==value ) {
						exec = !pass && exec && da.isFunction(value);				//判断属性值是否是以函数的形式的计算结果
						
						for ( var i=0; i<len; i++ ) {
							fn( arrObj[i], name, (exec ? value.call( arrObj[i], i, fn( arrObj[i], name ) ) : value), pass );
						}
						
						return arrObj;
					}
					
					//get一个属性值
					return len ? fn( arrObj[0], name ) : undefined;
			},
			
			//通过部分样式值后, 回调callback函数, 然后还原样式
			/*
				obj: DOM节点对象
				options: 样式值键值对对象
				callback:	回调函数
			*/
			swap: function( obj, options, callback ) {
				var old = {};
		
				for ( var name in options ) {						//缓存一下当前的属性值
					old[ name ] = obj.style[ name ];
					obj.style[ name ] = options[ name ];
				}
				
				callback.call( obj );
				
				for ( var name in options ) {						//还原被临时改变的属性值
					obj.style[ name ] = old[ name ];
				}
			},
			
			//节点样式属性 操作函数
			/*
				obj: DOM节点对象
				name: style样式属性名
				force: 如果class中使用了!import,  force参数就应该为true;
				extra: 特殊的属性头说明，如border-left、margin-left等
			*/
			css: function( obj, name, force, extra ) {
					//对节点元素的高宽进行浏览器兼容器算法的统一
					//IE中节点元素的实际高宽是包含content, padding, border的总和,而firefox等只是content的尺寸;
					//这里默认以content的尺寸为节点元素的实际高宽
					if ( name === "width" || name === "height" ) {
							var val,
							props = { position: "absolute", visibility: "hidden", display:"block" }, 
							which = ("width"===name ? [ "Left", "Right" ] : [ "Top", "Bottom" ]);
							
							//求节点元素的实际高度和宽度（除padding和border）
							function getWH() {
									val = name === "width" ? obj.offsetWidth : obj.offsetHeight;
					
									if ( extra === "border" ) {
										return;
									}
									
									for(var s=0,len=which.length; s<len; s++){
											if ( !extra ) {
												val -= parseFloat(da.curCSS( obj, "padding"+ s, true)) || 0;
											}
						
											if ( extra === "margin" ) {
												val += parseFloat(da.curCSS( obj, "margin"+ s, true)) || 0;
											}
											else {
												val -= parseFloat(da.curCSS( obj, "border"+ s + "Width", true)) || 0;
											}
									}
							}
							
							//如果节点元素当前为可见，就直接通过getWH 函数来计算实际高度和宽度
							if ( obj.offsetWidth !== 0 ) {
								getWH();
							}
							//如果节点元素当前 不可见，先让节点元素定义为绝对定位( position: "absolute" )、可见( visibility: "hidden"，display:"block" )然后再取实际高度和宽度( 因为不可见的节点元素浏览器是不计算起高宽的 )
							else {
								da.swap( obj, props, getWH );
							}
				
							return Math.max(0, Math.round(val));
					}
			
					return da.curCSS( obj, name, force );
			},
		
			//节点style样式属性操作函数
			/*
				obj: DOM节点对象
				name: style样式属性名
				value: style样式属性值
			*/
			style: function( obj, name, value ) {
					if ( !obj || !obj.style || obj.nodeType === 3 || obj.nodeType === 8 ) {			//不能设置风格属性的简单文本 或一些特殊类型的节点元素（nodeType： 1=元素element； 2=属性attr； 3=文本text； 8=注释comments； 9=文档document）
						return undefined;
					}
			
					if ( ( "width"===name || "height"===name ) && parseFloat(value) < 0 ) {		//width 和height属性不能为负数
						value = undefined;
					}
			
					var style = obj.style || obj, set = value !== undefined;				//如果是赋值操作，获得数值
			
					//IE不支持opacity属性，需要用filter滤镜处理
					if ( !da.support.opacity && "opacity"===name ) {
						if ( set ) {
							style.zoom = 1;			//IE的bug,给非layout模式的元素使用opacity属性会失效,加上zoom值可以解决
			
							var opacity = "NaN"===(parseInt( value, 10 )+ "") ? "" : ("alpha(opacity="+ value*100+ ")");	//通过alpha函数设置有效的opacity属性
							var filter = style.filter || da.curCSS( obj, "filter" ) || "";																//查找节点的style集合 和样式表中的滤镜属性
							
							style.filter = daRe_alpha.test(filter) ? filter.replace(daRe_alpha, opacity) : opacity;			//校正节点滤镜属性
						}
			
						return (style.filter && 0<=style.filter.indexOf("opacity=")) ? ((parseFloat( daRe_opacity.exec(style.filter)[1] ) / 100) +"") : "";			//返回不透明度属性值
					}
					
					//属性名 格式标准化处理
					if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//因为float是js的关键字,所以js规定方位float要用cssFloat，而为了兼容IE要用styleFloat访问
					name = name.replace(daRe_dashAlpha, function( all, letter ) {														//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
						return letter.toUpperCase();
					});			
			
					if ( set )	style[ name ] = value;			//如果是赋值操作，就给相应样式属性赋值
	
					return style[ name ];
			}
			
			
	});
	
	
	//DOM对象 位置尺寸 操作函数扩展
	//因为width、height属性值的获取操作相似，所以通过each函数来批量扩展da库的height() 和 width()函数
	da.each([ "Height", "Width" ], function( i, name ) {
	
		var type = name.toLowerCase();													//"height" 或 "width"
	
		da.fnStruct["inner" + name] = function() {							//给da对象扩展 innerHeight 和 innerWidth属性
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, "padding" ) ) : null;
		};
	
		da.fnStruct["outer" + name] = function( margin ) {			//给da对象扩展 outerHeight and outerWidth属性
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, margin ? "margin" : "border" ) ) : null;
		};
		
		//给da库扩展对应的height() 和 width()函数
		/*
			size:	目标DOM对象 尺寸值容器变量
		*/
		da.fnStruct[ type ] = function( size ) {
			var obj = this.dom[0];
			if ( !obj ) {
				return size == null ? null : this;									//如果没有目标DOM对象，返回this对象
			}
			
			//get模式
			if ( da.isFunction( size ) ) {												//如果size是回调函数的方式批处理获取多个dom的高宽数据，就通过each批处理调用，在回调函数返回处理后再次调用相应height() 和 width()函数
				return this.each(function( i ) {
					var objSelf = da( this );
					objSelf[ type ]( size.call( this, i, objSelf[ type ]() ) );			//回调函数默认回传dom对象、dom数组索引号、当前height或width值三个参数
				});
			}
			
			if ( da.isWin( obj ) ) {										//如果目标对象是窗口
				// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
				return ( obj.document.compatMode === "CSS1Compat" && obj.document.documentElement[ "client" + name ] ) 
				|| obj.document.body[ "client" + name ];
	
			}
			else if ( da.isDoc( obj ) ) {								//如果目标对象是document （nodeType： 1=元素element； 2=属性attr； 3=文本text； 8=注释comments； 9=文档document）
					return Math.max(
						obj.body["scroll" + name],
						obj.body["offset" + name],
						obj.documentElement["client" + name],
						obj.documentElement["scroll" + name],
						obj.documentElement["offset" + name]
					);
	
			}
			
			else if ( size === undefined ) {							//如果没有传入 尺寸值容器变量 就直接返回数据
					var tmpv = da.css( obj, type ), ret = parseFloat( tmpv );
		
					return da.isNaN( ret ) ? tmpv : ret;
	
			}
			
			//set模式
			else{
				return this.css( type, typeof size === "string" ? size : size + "px" );
			}
		};
	
	});
	
	da.offset = {
		initialize: function() {								//关于位置样式操作的 浏览器兼容性判断 初始化函数
			var body = document.body,
					container = document.createElement( "div" ),
					innerDiv, checkDiv, table, td,
					bodyMarginTop = parseFloat( da.curCSS( body, "marginTop", true ) ) || 0,
					strHTML = ["<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'>",
												    "<div></div>",
												 "</div>",
												 "<table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'>",
												    "<tr><td></td></tr>",
												 "</table>"];
	
			da.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );
			container.innerHTML = strHTML;
			body.insertBefore( container, body.firstChild );
			innerDiv = container.firstChild;
			checkDiv = innerDiv.firstChild;
			td = innerDiv.nextSibling.firstChild.firstChild;
	
			this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
			this.doesAddBorderForTableAndCells = (td.offsetTop === 5);	
	
			checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
			// safari subtracts parent border width here which is 5px
			this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
			checkDiv.style.position = checkDiv.style.top = "";
	
			innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
			this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
	
			this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);							//针对body的位置偏移量 是否包含marginTop 的判断
	
			body.removeChild( container );
			body = container = innerDiv = checkDiv = table = td = null;
			
			da.offset.initialize = function(){};							//初始化操作只一次
		},
	
		getBodyOffset: function( body ) {
			var top = body.offsetTop, left = body.offsetLeft;										//初始值至少应该包含body的偏移值
	
			da.offset.initialize();				//先初始化 关于位置样式的兼容性判断
	
			if ( da.offset.doesNotIncludeMarginInBodyOffset ) {									//如果当前浏览器偏移值不包含marginTop, 全部统一为包含body的marginTop值
				top  += parseFloat( da.curCSS(body, "marginTop", true) ) || 0;
				left += parseFloat( da.curCSS(body, "marginLeft", true) ) || 0;
			}
	
			return { top: top, left: left };
		},
		
		//设置DOM对象的偏移坐标
		/*
			obj: 目标对象
			options: 
			i: 
		*/
		setOffset: function( obj, options, i ) {
			if ( /static/.test( da.curCSS( obj, "position" ) ) ) {							//在设置偏移位置时要保证position属性为非static, 默认设置为relative
				obj.style.position = "relative";
			}
			var curElem	= da( obj ),
					curOffset = curElem.offset(),
					curTop = parseInt( da.curCSS( obj, "top",  true ), 10 ) || 0,
					curLeft = parseInt( da.curCSS( obj, "left", true ), 10 ) || 0;
	
			if ( da.isFunction( options ) ) {
				options = options.call( obj, i, curOffset );
			}
	
			var pos = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
	
			if ( "using" in options ) {															//不知道有什么特殊的作用????????????
				options.using.call( obj, pos );
			}
			else {
				curElem.css( pos );
			}
		}
	};
	
	da.fnStruct.extend({
			pos: function(){
					if ( !this.dom[0] ) {
						return null;
					}
			
					var elem = this.dom[0],
			
					// Get *real* offsetParent
					offsetParent = this.posInParent();
	
					// Get correct offsets
					offset = this.offset(),
					parentOffset = /^body|html$/i.test(offsetParent.dom[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();
			
					// Subtract element margins
					// note: when an element has margin: auto the offsetLeft and marginLeft
					// are the same in Safari causing offset.left to incorrectly be 0
					offset.top  -= parseFloat( da.curCSS(elem, "marginTop",  true) ) || 0;
					offset.left -= parseFloat( da.curCSS(elem, "marginLeft", true) ) || 0;
			
					// Add offsetParent borders
					parentOffset.top  += parseFloat( da.curCSS(offsetParent.dom[0], "borderTopWidth",  true) ) || 0;
					parentOffset.left += parseFloat( da.curCSS(offsetParent.dom[0], "borderLeftWidth", true) ) || 0;
			
					// Subtract the two offsets
					return {
						top:  offset.top  - parentOffset.top,
						left: offset.left - parentOffset.left
					};
			},
			
			posInParent: function(){
					return this.map(function() {
							var offsetParent = this.offsetParent || document.body;
							while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && da.css(offsetParent, "position") === "static") ) {
								offsetParent = offsetParent.offsetParent;
							}
							return offsetParent;
							
					});
			},
			
			//设置DOM元素的偏移位置（目标对象必须 要有left、top样式属性）
			/*
				options: left、top键值对
			*/
			offset: function( options ){
				var obj = this.dom[0];
			
				if ( options ) {																	//批量全处理
					return this.each(function( i ) {
						da.offset.setOffset( this, options, i );
					});
				}
			
				if ( !obj || !obj.ownerDocument ) {								//如果DOM对象还没有写入任何一个document直接返回空
					return null;
				}
			
				if ( obj === obj.ownerDocument.body ) {						//如果是计算body的偏移值, 直接调用da.offset.getBodyOffset() 函数
					return da.offset.getBodyOffset( obj );
				}
			
				var box = obj.getBoundingClientRect(),
						doc = obj.ownerDocument,
						body = doc.body,
						docElem = doc.documentElement,
					
						clientTop = docElem.clientTop || body.clientTop || 0,
						clientLeft = docElem.clientLeft || body.clientLeft || 0,
						top  = box.top  + (self.pageYOffset || da.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
						left = box.left + (self.pageXOffset || da.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
			
				return { top: top, left: left };
			}
	
	});
	/*
	if ( "getBoundingClientRect" in document.documentElement ) {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];
	
			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}
	
			if ( !elem || !elem.ownerDocument ) {
				return null;
			}
	
			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}
	
			var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
				left = box.left + (self.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
	
			return { top: top, left: left };
		};
	
	} 
	else {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];
	
			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}
	
			if ( !elem || !elem.ownerDocument ) {
				return null;
			}
	
			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}
	
			jQuery.offset.initialize();
	
			var offsetParent = elem.offsetParent, prevOffsetParent = elem,
				doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
				body = doc.body, defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
				top = elem.offsetTop, left = elem.offsetLeft;
	
			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
					break;
				}
	
				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;
	
				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;
	
					if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}
	
					prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
				}
	
				if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}
	
				prevComputedStyle = computedStyle;
			}
	
			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}
	
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}
	
			return { top: top, left: left };
		};
	}
	*/
	

	//***************** 扩展部分 数据操作有关的 函数 *****************/
	//da缓存机制全局变量
	var _identifier = "da"+ (new Date).getTime(), _sequence = 0, _winData = {};
	
	da.extend({
		nowId: function(){
			return (new Date).getTime();
		},
		daData: {},
		identifier: _identifier,
		
		//da缓存函数
		/*
			obj:	缓存目标对象
			key:	缓存数据索引值
			val:	缓存数据内容
		*/
		data: function(obj, key, val){
				obj = (obj == win) ? _winData : obj; //如果是窗口全局缓存, _winData也是一个{}

				var idx = obj[da.identifier];
				var daData = da.daData;
				
				if(!idx) idx = ++_sequence;						//第一次缓存数据,分配一个唯一识别序号
				
				if(da.isPlainObj(key)){								//set 如果是键值对对象,就通过da.extend()函数对目标进行缓存数据
					obj[da.identifier] = idx;
					daData[idx] = daData[idx] || {};
					da.extend(true,daData[idx],key);
				}
				else if(!daData[idx]){								//set 第一次进行缓存数据处理
					obj[da.identifier] = idx;
					daData[idx] = {};
				}
				
				if(val !== undefined) daData[idx][key] = val;					//set
				
				//单值操作,返回key对应的数据,否则返回目标对象上的所有缓存数据。
				return "string" === typeof key ? daData[idx][key] : daData[idx];
		},
		
		//da删除缓存函数
		/*
			obj:	缓存目标对象
			key:	缓存数据索引值
		*/
		undata: function(obj, key) {
			obj = (obj == win) ? _winCache : obj;
	
			var idx = obj[da.identifier],
					daData = da.daData;

			if(key){	//删除缓存数据
				if (daData[idx]){
					delete daData[idx][key];
					
					//如果缓存目标对象,完全没有缓存数据,就删除缓存容器
					if (da.isEmptyObj(daData[idx])){
						da.unData(obj);
					}
				}
				
			}
			else {		//删除缓存目标所有缓存数据 或空缓存容器对象
				try {
					delete obj[da.identifier];		//删除缓存目标对象唯一识别序号
				}
				catch(e) {
					if (obj.removeAttribute) {		//如果是DOM对象要通过removeAttribute()函数删除唯一识别序号属性
						obj.removeAttribute(da.identifier);
					}
				}
				
				//删除缓存目标对象 缓存容器
				delete daData[idx];
			}
		}
	});
	//***************** 扩展部分 UI表现 **************************/
	da.extend({
			//去HTML标签
			/*
				str: 带标签的字符串
			*/
			delHtmlTag: function(str) {
				return str.replace(/<\/?.+?>/g,"");//去掉所有的html标记 
			},
			
			//截取最大长度字符串
			/*
				str: 目标字符串
				mxlen: 最大长度
			*/
			subString: function(str,mxlen){
				return str.length > mxlen ? str.substring(0,mxlen-3)+"…":str;
			}

	});
	
	//***************** 扩展部分 web开发工具 函数 *****************/
	da.extend({
		//做代码性能测试时使用在testA()和testB()调用之间，就是要测试的代码运行时间(异步代码无效)
		testTime: null,
		
		//开始
		testA: function(){
			da.testTime = new Date();
		},
		
		//终止并返回时间差信息
		testB: function(){
			var now = new Date();
			return ["耗时：",(now - da.testTime),"ms"].join("");
		},
		
		//将输出内容放入剪贴板
		copy: function(sText,sTitle){
			sTitle = sTitle || "Text";
			
			if (win.clipboardData) {				//IE
				win.clipboardData.clearData();   
			  return ( win.clipboardData.setData( sTitle,sText ) );			//复制到剪贴板
			}
			else if(navigator.userAgent.indexOf("Opera") != -1) {    
          window.location = sText;    
     	}
			else if (win.netscape) {
          try{
          	netscape.security.PrivilegeManager.enablePrivilege( "UniversalXPConnect" );    
          }
          catch(e){
          	alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将[ signed.applets.codebase_principal_support ]设置为'true'");
          	return false;
          }    
          var clip = Components.classes[ '@mozilla.org/widget/clipboard;1' ].createInstance( Components.interfaces.nsIClipboard );    
          if ( !clip ) return;    
          var trans = Components.classes[ '@mozilla.org/widget/transferable;1' ].createInstance( Components.interfaces.nsITransferable );    
          if ( !trans ) return;    
          trans.addDataFlavor( 'text/unicode' );    
          var str = new Object(),
          		len = new Object(),
          		copytext = sText;
          
          str = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance( Components.interfaces.nsISupportsString );
          str.data = copytext;    
          trans.setTransferData( "text/unicode", str, copytext.length*2 );    
          var clipid = Components.interfaces.nsIClipboard;
          
          if ( !clip ) return false;
          clip.setData( trans, null, clipid.kGlobalClipboard );    
          alert( "复制成功！" )    
			}

			return false;
		}
		
	});

})(window);
