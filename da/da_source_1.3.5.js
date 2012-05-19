/***************** JS基础类扩展 **************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: JavaScript基础类扩展
	version: 1.0.0
*/
(function( win, undefined ){
	/***************** Number类扩展 *************************************/
	/**格式化
	*@param {String} fmt 显示模板
	*@example alert((1234567.12345678).format("#.##")); 
	*		  alert((1234567.12345678).format("#,##")); 
	*/
	Number.prototype.format = function( fmt ){
		fmt = fmt.toLowerCase();
		var res, haszero, hasflag, idx;
			
		if( haszero = 0 <= fmt.indexOf("0") ) fmt = fmt.replace("0", "");
		
		res = parseFloat(this,10);
		if ( 0 == this && haszero ) {
			return "&nbsp;";
		};
		
		idx = fmt.indexOf(".");
		if (idx < 0 ) {
			idx = fmt.indexOf(",");
			if (idx >= 0) {								//不存在"." 符号, 且存在"," 符号
				hasflag = true;							//显示位数分隔符
			}
		}
		
		if (idx >= 0) {									//有"."或","(都可以表示保留小数位数)
			idx = fmt.substr(idx + 1).length;
		}
		else {											//"." 符号和"," 符号都不存在
			idx = 0;
		}
		res = (Number(res)).toFixed(parseInt(idx,10));		//按保留小数位数，四舍五入
		
		if (hasflag) 
		{
			var arrTmp = [];
			idx = res.indexOf(".");
			
			if ((idx > 3) && (idx <= 6)) {
				arrTmp.push( res.substr(0, idx-3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 6) && (idx <= 9)) 
			{
				arrTmp.push( res.substr(0, idx-6) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 9) && (idx <= 12)) 
			{
				arrTmp.push( res.substr(0, idx-9) );
				arrTmp.push( res.substr(idx-9, 3) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 12)) 
			{
				arrTmp.push( res.substr(0, idx - 12) );
				arrTmp.push( res.substr(idx - 12, 3) );
				arrTmp.push( res.substr(idx-9, 3) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			};
			
			res = arrTmp.join("?");
		};
			
		return da.isNull( res, 0.00);
	};

	/***************** String类扩展 *************************************/
	/**去前后空格
	*/
	String.prototype.trim = function(){
		return this.replace(/(^\s+)|(\s+$)/g, "");
	};
	
	/**去开头空格
	*/
	String.prototype.trimLeft = function(){
		return this.replace(/^\s+/g, "");
	};
	
	/**去结尾空格
	*/
	String.prototype.trimRight = function(){
		return this.replace(/\s+$/g, "");
	};
	
	/**去所有空格
	*/
	String.prototype.trimAll = function(){
		return this.replace(/\s/g, "");
	};

	/**编码
	*/
	String.prototype.toHex = function(){
		return da.toHex(this);
	};
	
	/**解码
	*/
	String.prototype.toStr = function(){
		return  da.toStr(this);
	};
	/***************** Date类扩展 *************************************/
	/**格式化
	*@param {String} fmt 显示模板
	*@example alert(new Date().format("yyyy-MM-dd")); 
	*		  alert(new Date("january 12 2008 11:12:30").format("yyyy-MM-dd hh:mm:ss")); 
	*/
	Date.prototype.format= function( fmt ){
		if(/(y+)/.test(fmt))											//年
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 

		var o = { 
			"m+" : this.getMonth()+1, 									//月 
			"d+" : this.getDate(),    									//日
			"h+" : this.getHours(),   									//时 
			"n+" : this.getMinutes(), 									//分 
			"s+" : this.getSeconds(), 									//秒 
			"q+" : Math.floor((this.getMonth()+3)/3),					//季 
			"i" : this.getMilliseconds() 								//毫秒 
		};

		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)) 
				fmt = fmt.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		}
		return fmt; 
	};
	
	/***************** Array类扩展 *************************************/
	/**从前向后 查找首次匹配成员的索引值
	*/
	Array.prototype.indexOf = function( item, i, step ){
		i = i || 0;												//初始化起始下标(需要考虑0) 和步长
		step = step || 1;
		
		for (; i<this.length; i+=step)
			if (this[i] === item) return i; 					//使用"==="(全等于)判断符。Object类型子项无法进行匹配，返回恒为false
			
		return -1;
	};
	
	/**从后向前 查找首次匹配成员的索引值
	*/
	Array.prototype.lastIndexOf = function( item, i, step ){
		i = i || this.length-1; 										//初始化起始下标 和步长
		step = step || 1;
		
		for (; i>0; i-=step)
			if (this[i] === item) return i; 							//使用"==="(全等于)判断符。Object类型子项无法进行匹配，返回恒为false
			
		return -1;
	};

	/**提取指定位置和长度子项
	* 如：arr.get(0,5); 		//从头向后取5个子项
		  arr.get(-1,5); 		//从后向前取5个子项
		  arr.get("item3",3); 	//从值为"item3"的子项,向后取2个子项(包括值为"item3"的子项)
		  arr.get(2)			//取索引2之后的所有子项(包括2)
	*/
	Array.prototype.get = function( i, len ){
		var start, end;
		start = ( undefined === i ? 0 : i );
		
		if( "number" !== typeof start ){		//需要通过子项匹配找到对应索引
			start = this.indexOf( start );
		}
		
		if( undefined !== len ){
			len = Math.abs(len);
			end = ( 0 > start ? start-len : start+len );
		}
		return this.slice( start, end );
	};
	
	/**移除指定位置和长度子项
	* 如：arr.remove(2) == arr.remove(2,1); 
	*/
	Array.prototype.remove = function( i, len ){						
		if( undefined === i ) return this;
		len = len || 1;
		
		if( "number" !== typeof i ){			//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
		}
		
		return this.splice( i, len );			//移除并返回子项
	};
	
	/**插入新项到数组指定位置(前)
	* 如：[1,2,3].insert(2,"1.5","1.6");	["a","b","c"].insert("c",["b1","b2","b3"]);
	*/
	Array.prototype.insert = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		
		arrItem = [ i, 0 ].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**追加新项到数组指定位置(后)
	* 如：[1,2,3].append(1,"1.5","1.6");	["a","b","c"].append("b",["b1","b2","b3"]);
	*/
	Array.prototype.append = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		i++;													//追加索引索引+1
		arrItem = [i,0].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**替换数组指定项
	* 如：[1,2,3].replace(1,"1.5","1.6");	["a","b","c"].replace("b",["b1","b2","b3"]);
	*/
	Array.prototype.replace = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
		}
		if( 0 > i || this.length <= i ){
			return this;
		}
		
		arrItem = [i,1].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**将另一个数组合并到指定位置(前)
	* 如：[1,2,3].marge(1, ["a","b","c"]);	["a","b","c"].marge("a","b");
	*/
	Array.prototype.marge = function( i, arr ){
		if( 2 > arguments.length ) return this;
		
		if( !da.isArray( arr ) ){											//非数组
			return this.append( i, arr );
		}
		i = ( undefined !== i ? 0 > i ? 0 : i : this.length ); 				//矫正索引
		
		return this.slice( 0, i ).concat(arr).concat( this.slice( i ) );	 
	};

})(window);


/***************** da前台javascript辅助脚本库 **************************/
/*
	author:	danny.xu
	date: 2012.5.14
	description: da前台javascript辅助脚本库
	version: 1.3.5
*/
(function( win ){
	var doc = win.document;
	
	var da = (function() {
		/**da类构造函数
		*/
		var da = function( obj, context ){				//通过局部变量，实现构造函数名和类名相同
			return new da.fnStruct.init( obj, context, daDoc );
		},
		
		daDoc,											//目标窗体Document对象所对应的da对象
		
		// The deferred used on DOM ready
		readyList = [],									//回调函数列表(支持多个ready函数的调用)
		readyBound = false,								//判断是否已经绑定ready事件函数
		// The ready event handler
		DOMContentLoaded,
		
		daRe_quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,		//验证是否是单纯的HTML字符串,还是元素id选择器，如："#myid"
		
		daRe_notwhite = /\S/,											//验证字符串是否有空格
		daRe_white = /\s/,
		
		daRe_trimLeft = /^\s+/,											//验证字符串左右是否有空格
		daRe_trimRight = /\s+$/,

		daRe_singleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,					//匹配验证一个元素节点

		daRe_validchars = /^[\],:{}\s]*$/,								// JSON 对象处理
		daRe_validescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
		daRe_validtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
		daRe_validbraces = /(?:^|:|,)(?:\s*\[)+/g,

		daRe_dashAlpha = /-([a-z]|[0-9])/ig,
		daRe_msPrefix = /^-ms-/,

		_daToString = Object.prototype.toString,					//对象类型转字符串	//通过这种方式判断： "[object Array]" == _daToString.call(objDOM)
		_daHasOwnProperty = Object.prototype.hasOwnProperty,		//判断对象是否拥有XX属性 //通过这种方式判断： _daHasOwnProperty.call(obj, "constructor")
		_daTrim = String.prototype.trim,							//去字符串前后空格
		_daIndexOf = Array.prototype.indexOf,						//数组项匹配索引查询函数
		_daSlice = Array.prototype.slice,							//提取数组子项
		_daPush = Array.prototype.push,								//压子项到数组

		fcamelCase = function( all, letter ) {						//属性名驼峰格式化
			return ( letter + "" ).toUpperCase();
		},
		
		class2type = {};											//数据类型映射表
		
		//da类属性集
		da.fnStruct = da.prototype = {
			version: "da libary 1.3.5; author: danny.xu; date: 2012.5.14",
			
			dom: [],					//操作对象数组
			length:	0,					//操作对象个数
			selecter: "",				//为Sizzle.js保留的选择器字符串
			
			constructor: da,

			//初始化函数
			init: function( selector, context, daDoc ) {
				var match, elem, ret, docTmp;
				this.dom = [];							//注：danny.xu 必须要先初始化一次
				
				if ( !selector ) return this;			//判空处理，直接返回当前da空对象, 如 da(""), da(null), or da(undefined)
				
				if ( selector.nodeType ) {						//如果直接传入DOM元素对象，如 da(ElementObject)
					this.context = this.dom[0] = selector;		//将da处理元素对象和上下文设置为DOM元素对象
					this.length = 1;
					return this;
				}
		
				if ( selector === "body" && !context && doc.body ) {	//因为body元素只有一个，所以特殊处理一下，优化性能
					this.context = doc;
					this.dom[0] = doc.body;
					this.selector = selector;
					this.length = 1;
					return this;
				}

				if ( typeof selector === "string" ) {					//如果传入的selector是字符串，就要用到Sizzle选择器
					// Are we dealing with HTML string or an ID?
					if ( selector.charAt(0) === "<" 
					&& selector.charAt( selector.length - 1 ) === ">" 
					&& selector.length >= 3 ) {
						match = [ null, selector, null ];				//如果obj是"<>"开头结尾，说明是HTML代码，可以直接跳过元素选择器的验证
					}
					else {
						match = daRe_quickExpr.exec( selector );		//判断是否是#id选择器
					}
		
					if ( match && (match[1] || !context) ) {			//context参数为空
						if ( match[1] ) {								//传入的selector不是#id选择器，是HTML代码片段，如 da(html)
							context = context instanceof da ? context.dom[0] : context;
							docTmp = (context ? context.ownerDocument || context : doc);
		
							ret = daRe_singleTag.exec( selector );				//如果传入的是一个元素的HTML,说明只是单纯的创建一个元素
		
							if ( ret ) {										//创建单个元素
								if ( da.isPlainObj( context ) ) {				//如果有属性值，就通过attr设置属性
									selector = [ doc.createElement( ret[1] ) ];
									da.fn.attr.call( selector, context, true );
		
								}
								else {																								
									selector = [ docTmp.createElement( ret[1] ) ];
								}
		
							}
							else {												//需要生产的不止一个元素，需要生产文档片段
								ret = da.buildFragment( [ match[1] ], [ docTmp ] );
								selector = (ret.cacheAble ? da.clone(ret.fragment) : ret.fragment).childNodes;	//如果可以缓存生产的文档片段，就克隆一下返回，避免影响缓存的文档片段
							}
		
							return da( da.merge( this.dom, selector ));			//合并元素集合数组
		
						} 
						else {											//传入的selector是元素#id选择器，如："#myid"
							elem = doc.getElementById( match[2] );
		
							if ( elem && elem.parentNode ) {					// Check parentNode to catch when Blackberry 4.6 returns nodes that are no longer in the document #6963
								if ( elem.id !== match[2] ) {					// Handle the case where IE and Opera return items by name instead of ID
									return daDoc.find( selector );
								}
		
								// Otherwise, we inject the element directly into the jQuery object
								this.length = 1;
								this.dom[0] = elem;
							}
		
							this.context = doc;
							this.selector = selector;
							return this;
						}
		
					}
					else if ( !context || context instanceof da ) {		//context参数是da对象，如 da(expr, da(...))
						return (context || daDoc).find( selector );
		
					}
					else {												//context参数是选择器 或DOM对象，如 da(expr, "#m_parent"), da(expr, m_parent)
						return this.constructor( context ).find( selector );
					}
		
				}
				else if ( da.isFunction( selector ) ) {					//如果传入的selector是Function，说明是要做Document加载完毕回调处理
					return daDoc.ready( selector );
				}
		
				if (selector.selector !== undefined) {
					this.selector = selector.selector;
					this.context = selector.context;
				}
				
				da.pushArray( selector, this.dom );
				
				return this;
			},
			
			/**通过slice函数将da对象转为DOM对象数组
			*/
			toArray: function() {
				return _daSlice.call( this.dom, 0 );
			},
			
			/**根据索引值获得da对象中的DOM
			* @param {Int} num 目标dom处于数组中的索引值，为空返回整个DOM数组
			*/
			get: function( num ) {
				return num == null ?
					this.toArray() :				// Return a 'clean' array
					( num < 0 ? this.dom[ this.dom.length + num ] : this.dom[ num ] );	// Return just the object
			},	

			//将元素集合压为一个全新的da对象。
			/*
				elems: 元素集合
				name: 分类名
				selector: 全新的选择器字符串
			*/
			pushStack: function( elems, name, selector ) {
				var ret = this.constructor();				//首先new一个全新的空da对象
		
				if ( da.isArray( elems ) ) {
					_daPush.apply( ret.dom, elems );
				} 
				else {
					da.merge( ret.dom, elems );
				}
		
				ret.prevObject = this;						//设置前一个da对象的地址，实现堆栈/链表的功能
				ret.context = this.context;
		
				if ( name === "find" ) {					//选择器字符串更新
					ret.selector = [ this.selector, (this.selector ? " " : ""), selector ].join("");
				} 
				else if ( name ) {
					ret.selector = [ this.selector, ".", name, "(", selector, ")" ].join("");
				}
		
				return ret;									//返回全新的da对象
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
				return this.pushStack( da.map(this.dom, function( obj, i ) {
					return fn( obj, i );
				}));
			},
			
			ready: function( fn ) {
				da.bindReady();
				if ( da.isReady ) {				//如果document已经加载完毕
					fn.call( doc, da );			//立即回调函数
				}
				else if ( readyList ) {			//如果没有加载完毕，将回调函数压入全局列表
					readyList.push( fn );
				}
				return this;
			}
		};
		//对象继承da类属性
		da.fnStruct.init.prototype = da.fnStruct;
		
		//属性扩展函数（对象重载、合并函数）
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


		//da类静态成员
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
				
				if ( document.addEventListener ) {						//兼容W3C事件绑定
					document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );				//确保在onload事件之前触发
					window.addEventListener( "load", da.ready, false );														//绑定window.onload回调，这个事件总是一直存在的
			
				}
				else if ( document.attachEvent ) {						//兼容IE
					document.attachEvent("onreadystatechange", DOMContentLoaded);
					window.attachEvent( "onload", da.ready );
			
					var toplevel = false;									//如果是IE并且没有框架结构，继续检查document是否已经加载完毕
					try {
						toplevel = ( window.frameElement == null );
					} catch(e) {}
			
					if ( document.documentElement.doScroll && toplevel ) {
						doScrollCheck();
					}
				}
				
			},
			//DOM对象加载完毕处理函数
			ready: function( wait ) {
				// A third-party is pushing the ready event forwards
				if ( wait === true ) {
					da.readyWait--;
				}
			
				//如果DOM对象还没有加载完毕
				if ( !da.readyWait || (wait !== true && !da.isReady) ) {
					if ( !doc.body ) {								//判断body存在
						return setTimeout( da.ready, 1 );			//调用静态ready函数
					}
					
					da.isReady = true;								//设置document状态为可用
					
					if ( wait !== true && ( --da.readyWait > 0 ) ) {		//如果一个document的ready事件被触发，da.readyWait递减，并直接返回
						return;
					}
			
					if ( readyList ) {								//如果有绑定回调函数，就执行回调函数列表
						var fn,
							i = 0,
							ready = readyList;
		
						readyList = null;						//置空回调函数列表
			
						while ( (fn = ready[ i++ ]) ) {
							fn.call( doc, da );
						}
			
						// Trigger any bound ready events
						if ( da.fnStruct.trigger ) {
							da( doc ).trigger( "ready" );
							da( doc ).unbind( "ready" );
						}
					}
				}
			},
			
			//空函数
			noop: function() {},
			//时间戳ID
			nowId: function(){
				return (new Date).getTime();
			},
			
			//获取对象类型(小写)
			/*
				obj: 目标对象
			*/
			type: function( obj ) {
				return obj == null ?
				String( obj ) :
				class2type[ _daToString.call(obj) ] || "object";
			},
			//判断是否是Window对象
			/*
				obj: 判断目标对象
			*/
			// See test/unit/core.js for details concerning isFunction.
			// Since version 1.3, DOM methods and functions like alert
			// aren't supported. They return false on IE (#2968).
			isWin: function( obj ) {
				return obj && typeof obj === "object" && "setInterval" in obj;
			},
			
			//判断是否是Document对象
			/*
				obj: 判断目标对象
			*/
			isDoc: function( obj ) {
				return obj.nodeType === 9;
			},
			
			//判断是否是Function对象
			/*
				obj: 判断目标对象
			*/
			isFunction: function( obj ) {
				return _daToString.call(obj) === "[object Function]";
			},
		
			//判断是否是数组对象
			/*
				obj: 判断目标对象
			*/
			isArray: Array.isArray || function( obj ) {
				return _daToString.call(obj) === "[object Array]";
			},
		
			//判断是否是键值对对象
			/*
				obj: 判断目标对象
			*/
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

			//判断是否是数值对象
			isNumeric: function( obj ) {
				return !isNaN( parseFloat(obj) ) && isFinite( obj );
			},

			//判断是否是空键值对对象
			/*
				obj: 判断目标对象
			*/
			isEmptyObj: function( obj ) {
				for ( var name in obj ) {
					return false;
				}
				return true;
			},
			
			//空值判断
			/*
				obj1: 判空对象对象
				obj2: obj1为空替代对象
			*/
			isNull: function( obj1, obj2 ){
				 var isError = false;
				 
			   if (( undefined === obj1 )
			   || ( null === obj1 ) 
			   || ( "undefined" === obj1 ) 
			   || ( "number" === typeof obj1 && da.isNaN( obj1 ) ) 
			   || ( "Infinity" === obj1 ) 
			   || ( "&nbsp;" === obj1 ) 
			   || ( "&#160;"=== obj1 ) 
			   || ( "" === obj1 )
			   || ( String.fromCharCode( 160 ) === obj1 ) )
						isError = true;
				
				if( 2 > arguments.length ){										//只传入一个参数。只坐是否为空判断
					return isError;
				}
				else{																					//若传入两个参数。
					return isError ? obj2 : obj1;								//判断为空时：返回第二个参数值（obj2），结果为有效值时：返回原值（obj1）
					
				}
			},
			
			//无效数值判断
			/*
				obj: 判断对象
			*/
			isNaN: function( obj ) {
				return obj == null || !/\d/.test( obj ) || isNaN( obj );
			},
				
			//元素类型名判断
			/*
				elem: 元素对象
				name: 要判断的元素类型名
			*/
			isNodeName: function( elem, name ) {
				return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
			},
			
			/**取第一个有效值
			*/
			firstValue: function( /*obj1,obj2,[ obj3,obj4,…,objN ]*/ ){
				var val;
				
				for( var i=0,len=arguments.length; i<len; i++) {
					val = arguments[i];
					
					if( null !== da.isNull( val, null ) )
						return val;
					
				}
				
			},
			
			
			//判断元素在数组内的位置
			/*
				elem: 元素对象
				array: 数组对象
			*/
			isInArray: function( elem, array ) {
				if ( _daIndexOf ) return _daIndexOf.call( array, elem );
		
				return array.indexOf( elem );
			},		
			//压为数组( 追加 )
			/*
				srcObj: 压为数组的目标对象
				retArray:	新建返回或传入的容器数组
			*/
			pushArray: function( srcObj, retArray ){
					retArray = retArray || [];
					if ( srcObj != null ) {
							var typeObj = da.type( srcObj );
							
							// The extra typeof function check is to prevent crashes
							if ( null == srcObj.length 																			//因为window, strings, functions 也有"length"属性
								|| "string" === typeObj 																			//string 对象
								|| "function" === typeObj 																		//function 对象
								|| "regexp" === typeObj 																			//Regexp 对象		// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues
								|| da.isWin( srcObj ) ) {																			//window 对象
								retArray.push( srcObj );																			//直接把对象压入数组
								
							}
							else {
								da.merge( retArray, srcObj );																	//合并两个数组
							
							}
					}
					
					return retArray;
			},
			//合并两个数组
			/*
				first: 第一个数组
				second: 第二个数组
			*/
			merge: function( first, second ) {
				var i = first.length,
						j = 0;
		
				if ( "number" === typeof second.length ) {						//标准的数组类型，拥有length属性
					for ( var l = second.length; j < l; j++ ) {
						first[ i++ ] = second[ j ];
					}
		
				}
				else {																								//引用类型的数组，可能没有length属性
					while ( undefined !== second[j] ) {
						first[ i++ ] = second[ j++ ];
					}
				}
		
				first.length = i;
		
				return first;
			},
		
			/**属性名驼峰格式化函数
			*/
			camelCase: function( string ) {
				return string.replace( daRe_msPrefix, "ms-" ).replace( daRe_dashAlpha, fcamelCase );
			},
			//类数组批处理函数
			/*
				objs: 批处理目标对象
				fn:	逐个回调函数( 如果此函数返回为 false, 可以终止批处理函数的继续执行 )
				arg: 此参数只供脚本库内部使用
			*/
			each: function( objs, fn, args ) {
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
			},

			//批验证处理，并返回不符合条件的元素集合函数
			/*
				elems: 需要批验证处理的元素集合
				callback: 批验证处理回调函数
				inv: 验证结果匹配bool值
			*/
			grep: function( elems, callback, inv ) {
				inv = !!inv;
				
				var ret = [], retVal;
		
				for ( var i=0, len=elems.length; i < len; i++ ) {
					retVal = !!callback( elems[ i ], i );										//循环批处理，通过调用用户自定义验证函数，并得到验证返回值
					
					if ( inv !== retVal ) {																	//如果验证结果不符合，将不符合的元素压入数组，处理完毕返回该数组
						ret.push( elems[ i ] );
					}
				}
		
				return ret;
			},

			//数组对象映射过滤器
			/*
				objs: 目标数组对象
				fn:	回调过滤函数
				arg: 此参数只供脚本库内部使用
			*/
			map: function( objs, fn, arg ) {
				var retArray = [], 
					value = null;

				for ( var i = 0, length = objs.length; i < length; i++ ) {				//循环目标数组对象，通过调用过滤函数，最终得到过滤后的有效数组
					value = fn( objs[ i ], i, arg );

					if ( value != null ) {
							//retArray[ retArray.length ] = value;
							retArray.push( value );
					}
				}
				return retArray.concat.apply( [], retArray );
				
			},
			
			guid: 1,				//全局唯一标识符
			
			//代理函数
			/*
				fn: 源被代理回调函数
				proxy: 代理处理回调函数
				thisObject: 
			*/
			proxy: function( fn, proxy, thisObject ) {
				if ( arguments.length === 2 ) {
					if ( typeof proxy === "string" ) {							//如果传入键值对，proxy( {click:function(){},dbclick:function(){}}, "click" )
						thisObject = fn;
						fn = thisObject[ proxy ];
						proxy = undefined;
		
					}
					else if ( proxy && !da.isFunction( proxy ) ) {	//
						thisObject = proxy;
						proxy = undefined;
					}
				}
		
				if ( !proxy && fn ) {							//
					proxy = function() {								
						return fn.apply( thisObject || this, arguments );
					};
				}
		
				// Set the guid of unique handler to the same of original handler, so it can be removed
				if ( fn ) {
					proxy.guid = fn.guid = fn.guid || proxy.guid || da.guid++;
				}
		
				// So proxy can be declared as an argument
				return proxy;
			},

			//操作类型判断入口 函数
			/*
				elems: DOM节点对象集数组
				key: 属性名( 可以以 键值对的方式set多个属性值)
				value: 属性值( 可以是函数的形式, function(index, value){}, 属性值为函数计算返回值)
				exec:	在属性值的类型为function时,对设置之前的value值执行函数( 默认为true )
				fn:	
				pass: 是否通过da类的相应 成员函数来处理属性值
			*/
			access: function( elems, fn, key, value, chainable, emptyGet, pass  ) {
				var exec,
					bulk = key == null,
					i = 0,
					length = elems.dom.length;

				//set多个属性
				if ( key && typeof key === "object" ) {							//在key值的类型为object时，会拆解value成key,value形式再次递归传入da.access
					for ( i in key ) {
						da.access( elems, fn, i, key[i], 1, emptyGet, value );
					}
					chainable = 1;

				
				} //set单一属性
				else if ( value !== undefined ) {
					// Optionally, function values get executed if exec is true
					exec = pass === undefined && da.isFunction( value );		//判断属性值是否是以函数的形式的计算结果

					if ( bulk ) {
						// Bulk operations only iterate when executing function values
						if ( exec ) {
							exec = fn;
							fn = function( elem, key, value ) {
								return exec.call( da( elem ), value );
							};

						// Otherwise they run against the entire set
						} else {
							fn.call( elems, value );
							fn = null;
						}
					}

					if ( fn ) {
						for (; i < length; i++ ) {
							fn( elems.dom[i], key, exec ? value.call( elems.dom[i], i, fn( elems.dom[i], key ) ) : value, pass );
						}
					}

					chainable = 1;
				}

				//get属性值
				return chainable ?
					elems :
					// Gets
					bulk ?
						fn.call( elems ) :
						length ? fn( elems.dom[0], key ) : emptyGet;
			},
			
			//错误抛出异常
			error: function( msg ) {
				throw new Error( msg );
			},
			
			//去掉字符串前后空格
			trim: ( _daTrim ?
			function( text ) {
				return text == null ? "" : _daTrim.call( text );
			} :
			// Otherwise use our own trimming functionality
			function( text ) {
				return text == null ? "" : text.toString().replace( daRe_trimLeft, "" ).replace( daRe_trimRight, "" );
			}),
			
			//强制转为JSON对象
			/*
				data: 转换目标数据
			*/
			parseJSON: function( data ) {
					if ( typeof data !== "string" || !data ) {
						return null;
					}
			
					// Make sure leading/trailing whitespace is removed (IE can't handle it)
					data = da.trim( data );
					
					// Make sure the incoming data is actual JSON
					// Logic borrowed from http://json.org/json2.js
					if ( daRe_validchars.test( data.replace(daRe_validescape, "@").replace(daRe_validtokens, "]").replace(daRe_validbraces, "") ) ) {
						// Try to use the native JSON parser first

						return ( window.JSON && window.JSON.parse ) ? window.JSON.parse( data ) : ( new Function("return " + data) )();
		
					}
					else {
						da.error( "Invalid JSON: " + data );
					}
				
			},

			//Evalulates a script in a global context
			globalEval: function( data ) {
				if ( data && daRe_notwhite.test(data) ) {
					// Inspired by code by Andrea Giammarchi
					// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
					var head = document.getElementsByTagName("head")[0] || document.documentElement,
							script = document.createElement("script");
		
					script.type = "text/javascript";
		
					if ( da.support.scriptEval ) {																//通过script元素引入并执行自定义代码
						script.appendChild( document.createTextNode( data ) );
					}
					else {
						script.text = data;
					}
		
					head.insertBefore( script, head.firstChild );									//用insertBefore而不用appendChild是，避免IE6的bug
					head.removeChild( script );
				}
			},
			
			/**将xml数据转为json数据格式
			* param {XMLDocument} xml XML原数据
			* param {Function} fn 自定义回调处理/筛选函数
			*/
			xml2json: function( xml, fn ){
				var newSet,
					json, tmp, rowObj, rowNode, colNode, 
					dsname, dsname2, name, value;
				if( !xml.childNodes || 0 >= xml.childNodes.length ) return null;
				
				json = {};
				tmp = {};

				for( var i=0,i2=0,lenDS=xml.childNodes.length; i<lenDS; i++ ){
					newSet = xml.childNodes[i];
					
					for( var n=0,n2=0,lenROW=newSet.childNodes.length; n<lenROW; n++ ){						//循环所有数据集的记录，通过nodeName进行数据集划分
						rowNode = newSet.childNodes[n];
						if( 3 === rowNode.nodeType ) continue;												//text类型无效元素 或已经被剔除
						rowObj = {};
						dsname = rowNode.nodeName;															//数据集名
						
						if( 0 === n2)
							dsname2 = dsname;
						
						if( !tmp[ dsname ] )
							tmp[ dsname ] = [];				//创建下一个数据集容器
							
						
						for( var m=0,m2=0,lenCOL=rowNode.childNodes.length; m<lenCOL; m++ ){				//循环每行记录，通过nodeName进行字段划分
							colNode = rowNode.childNodes[m];
							if( 3 === colNode.nodeType ) continue;											//排除text类型无效元素
							name = colNode.nodeName;														//列名
							value = ( undefined === colNode.text ) ? colNode.textContent : colNode.text;
						
							rowObj[ name ] = value;

							fn && fn( "field", dsname, { name:name, value:value }, m2 );
							m2++;		//有效列数 +1
						}
						
						
						if( fn && (false === fn( "record", dsname, rowObj, n2 )) ){						//将划分好的字段数据，压入对应的数据集对象内
							continue;
						}
						tmp[ dsname ].push( rowObj );
						n2++;			//有效行数 +1
						
						
						if( dsname2 !== dsname ){
							if( fn && (false === fn( "dataset", dsname, tmp[ dsname2 ], i2 )) ){			//缓存数据集
								continue;
							}
							json[ dsname2 ] = tmp[ dsname2 ];
							
							dsname2 = dsname;
							i2++;				//有效数据集数 +1
						}
					}
					
					
					if( fn && (false === fn( "dataset", dsname, tmp[ dsname2 ], i2 )) ){			//缓存数据集
						continue;
					}
					json[ dsname2 ] = tmp[ dsname2 ];
				}

				return json;
				
			}
			
		});	
	
		
		da.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});
	
		if ( !daRe_white.test( "\xA0" ) ) {									//用正则表达式的\s匹配空格符号，IE中可能会失败。
			daRe_trimLeft = /^[\s\xA0]+/;
			daRe_trimRight = /[\s\xA0]+$/;
		}

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

		//兼容IE 检查DOM是否已经加载完毕
		function doScrollCheck() {
			if ( da.isReady ) {
				return;
			}
		
			try {
				doc.documentElement.doScroll("left");	//针对IE 代替DOMContentLoaded方法的一种监听处理（在ondocumentready之前会一直抛异常）
			} catch(e) {
				setTimeout( doScrollCheck, 1 );			//通过反复运行doScrollCheck达到监听documentready的效果
				return;
			}
		
			da.ready();									//documentready就调用da.ready();
		};
		
		daDoc = da( doc );
		
		return da;
	})();

	
/*********************** Support *****************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 兼容浏览器
	version: 1.0.0
*/
(function(da){
	da.support = (function(){
		//浏览器兼容性判断
		var	div = document.createElement("div"),
			id = "script" + da.nowId(),
			select,
			opt,
			input,
			fragment;
				
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		var a = div.getElementsByTagName("a")[0];
		if (!a ) return;
		
		// First batch of supports tests
		select = document.createElement( "select" );
		opt = select.appendChild( document.createElement("option") );
		input = div.getElementsByTagName( "input" )[ 0 ];

		support = {
			leadingWhitespace: ( div.firstChild.nodeType === 3 ),		// IE strips leading whitespace when .innerHTML is used
		
			tbody: !!div.getElementsByTagName( "tbody" ).length,		//判断是否自动插入了tbody标签元素，IE会对空的table标签自动插入tbody标签元素

			htmlSerialize: !!div.getElementsByTagName( "link" ).length,	//判读link元素能否通过innerHTML正确的被串行化，IE中不能通过innerHTML正常的串行化link和script标签元素
			
			opacity: /^0.55$/.test( a.style.opacity ),					//opacity 不透明度属性兼容性判断
			cssFloat: !!a.style.cssFloat,								//float 浮动位置属性兼容性判断

			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			checkOn: ( input.value === "on" ),

			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			optSelected: opt.selected,						//验证option默认选中项，有selected属性
	
			getComputedStyle: doc.defaultView && doc.defaultView.getComputedStyle,		//defaultView.getComputedStyle 函数支持判断
			
			getSetAttribute: div.className !== "t",			//如果是IE，可以通过驼峰格式值设置属性,这时候在今后的属性操作时就要进行兼容处理了。
			
			boxModel: null,									//盒子模型支持
			inlineBlockNeedsLayout: false,					//inline-block支持
			shrinkWrapBlocks: false,						//拆封块支持
			reliableHiddenOffsets: true,					//隐藏元素可靠性支持
			
			scriptEval: false,								//判断是否支持script元素引入并执行自定义代码
			deleteExpando: true,												
			ajax: false										//是否支持XHR requests
		};		
		
		// Make sure checked status is properly cloned
		input.checked = true;
		support.noCloneChecked = input.cloneNode( true ).checked;

		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		try {																						//通过try验证是否能通过delete删除元素，自定义扩展属性（IE会异常）
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
		
		// Check if a radio maintains it's value
		// after being appended to the DOM
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";
	
		input.setAttribute("checked", "checked");
		div.appendChild( input );
		support.appendChecked = input.checked;																												// Check if a disconnected checkbox will retain its checked, value of true after appended to the DOM (IE6/7)
		
		fragment = doc.createDocumentFragment();																											//判断是否支持元素checked状态克隆
		fragment.appendChild( div.firstChild );
		support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;					//WebKit内核浏览器，在文档碎片中不能够正确的克隆checked 状态
		
		
		if ( window[ id ] ) {														//判断是否支持script元素引入并执行自定义代码（IE不支持，只能通过script元素的text属性代替）
			support.scriptEval = true;
			delete window[ id ];
		}
	
		div.innerHTML = "";
	
		// Figure out if the W3C box model works as expected
		div.style.width = div.style.paddingLeft = "1px";
	
		// We use our own, invisible, body
		body = document.createElement( "body" );
		bodyStyle = {
			visibility: "hidden",
			width: 0,
			height: 0,
			border: 0,
			margin: 0,
			// Set background to avoid IE crashes when removing (#9028)
			background: "none"
		};
		for ( i in bodyStyle ) {
			body.style[ i ] = bodyStyle[ i ];
		}
		body.appendChild( div );
		document.documentElement.appendChild( body );
	
		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		support.appendChecked = input.checked;
	
		support.boxModel = div.offsetWidth === 2;
	
		if ( "zoom" in div.style ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );
	
			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}
	
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
	
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		isSupported = ( tds[ 0 ].offsetHeight === 0 );
	
		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";
	
		// Check if empty table cells still have offsetWidth/Height
		// (IE < 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
		div.innerHTML = "";
	
		// Check if div with explicit width and no margin-right incorrectly
		// gets computed margin-right based on width of container. For more
		// info see bug #3333
		// Fails in WebKit before Feb 2011 nightlies
		// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
		if ( document.defaultView && document.defaultView.getComputedStyle ) {
			marginDiv = document.createElement( "div" );
			marginDiv.style.width = "0";
			marginDiv.style.marginRight = "0";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				( parseInt( document.defaultView.getComputedStyle( marginDiv, null ).marginRight, 10 ) || 0 ) === 0;
		}
	
		// Remove the body element we added
		body.innerHTML = "";
		document.documentElement.removeChild( body );

		
		return support;
	})();
	
	
	// Keep track of boxModel
	da.boxModel = da.support.boxModel;
	
})(da);	

/***************** Data  ***************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 缓存机制操作函数
	version: 1.0.0
*/
(function(da){
	var daRe_multiDash = /([A-Z])/g,
		daRe_brace = /^(?:\{.*\}|\[.*\])$/,

		da_sequence = 0, 
		da_winData = {};

	function isEmptyDataObject( obj ) {									//核查一个缓存对象是否为空
		for ( var name in obj ) {
			// if the public data object is empty, the private is still empty
			if ( name === "data" && da.isEmptyObj( obj[name] ) ) {
				continue;
			}
			if ( name !== "toJSON" ) {
				return false;
			}
		}
		return true;
	}

	function dataAttr( elem, key, data ) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {

			var name = "data-" + key.replace( daRe_multiDash, "-$1" ).toLowerCase();

			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					da.isNumeric( data ) ? +data :
						daRe_brace.test( data ) ? da.parseJSON( data ) :
						data;
				} catch( e ) {}

				// Make sure we set the data so it isn't changed later
				da.data( elem, key, data );

			} else {
				data = undefined;
			}
		}

		return data;
	}

	da.extend({
		cache: {},							//da全局缓存区
		uuid: 0,
		
		expando: "da"+ da.nowId(),		//每个页面生成一个缓存区名称，
											//元素通过这个同名属性值，存放着自己的缓存数据所在全局缓存区中的索引号
		
		noData: {							//可怕的家伙们，这些元素如果想给他们添加唯一标识符da.expando属性，会抛出无法捕获的异常，真恶心 ??????
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},

		hasData: function( elem ) {
			elem = elem.nodeType ? da.cache[ elem[da.expando] ] : elem[ da.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},

		acceptData: function( elem ) {						//判断一个元素是否能够进行缓存数据相关操作
			if ( elem.nodeName ) {							//排除特殊元素类型 如：embed、applet等
				var match = da.noData[ elem.nodeName.toLowerCase() ];		

				if ( match ) {
					return !(match === true || elem.getAttribute("classid") !== match);
				}
			}
			return true;
		},
		
		//da缓存函数
		/*
			obj:	缓存目标对象
			key:	缓存数据索引值
			val:	缓存数据内容
		*/
		data: function(obj, key, val, pvt/*内部私用*/ ){
			if ( !da.acceptData( obj ) ) return;
			
			var pvtCache,									//内部私有部分缓存数据
				thisCache,									//用户开放部分缓存数据
				internalKey = da.expando,
				getByName = typeof key === "string",
				isNode = obj.nodeType,						//兼容IE的GC垃圾回收机制不同，所以DOM元素和js对象的处理方式不一样
				cache = isNode ? da.cache : obj,			//只有DOM元素需要全局的cache，普通js对象数据可以直接指向另一个对象
				id = isNode ? obj[ internalKey ] : obj[ internalKey ] && internalKey,
				isEvents = ("events" === key),
				ret;
			
			
			if ( getByName 									//get操作时，当目标对象没有任何缓存数据，直接返回。
			&& undefined === val 
			&& (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data))) {
				return;
			}

			if ( !id ) {
				if ( isNode ) {								//只有DOM元素才需要一个全局缓存区索引号
					obj[ internalKey ] = id = ++da.uuid;
				}
				else {
					id = internalKey;
				}
			}
			
			if ( !cache[ id ] ) {							//确定缓存区是空的,并初始化
				cache[ id ] = {};

				// Avoids exposing jQuery metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					cache[ id ].toJSON = da.noop;
				}
			}
			
			if ( "object" === typeof key || "function" === typeof key ) {		//以键值对的方式进行set操作
				if ( pvt ) {													//私有部分
					cache[ id ] = da.extend( cache[ id ], key );				//set操作,通过da.extend()函数对目标进行缓存数据
				} 
				else {															//开放部分
					cache[ id ].data = da.extend( cache[ id ].data, key );
				}
			}

			pvtCache = thisCache = cache[ id ];

			if ( !pvt ) {									//为了避免da库内部使用缓存数据名，和用户使用缓存名冲突，
				if ( !thisCache.data ) {					//缓存的存储结构是，用户使用缓存对象以名为"data"的对象，嵌入内部使用缓存对象中。
					thisCache.data = {};
				}

				thisCache = thisCache.data;					//提出用户使用缓存对象
			}
	
			if ( undefined !== val ) {						//set操作
				thisCache[ da.camelCase( key ) ] = val;
			}

			if ( isEvents && !thisCache[ key ] ) {			//用户可以利用"events"作为key,提取出DOM元素上的监听事件相关缓存
				return pvtCache.events;						//当然前提是，在用户可使用的开发部分没有定义key的同名缓存
			}

			if ( getByName ) {								//get操作,并且有指定缓存名
				ret = thisCache[ key ];						//原型名提数据，若提不出数据，转换成驼峰格式，再提数据
				
				if ( ret == null ) {
					ret = thisCache[ da.camelCase( key ) ];
				}
			} 
			else {											//get操作，全部
				ret = thisCache;
			}
			
			return ret;
		},

		/**内部私用
		*/
		_data: function( obj, name, data ) {
			return da.data( obj, name, data, true );
		},

		//da删除缓存函数
		/*
			obj: 缓存目标对象
			key: 缓存数据索引值
		*/
		removeData: function(obj, key, pvt/*内部私用*/) {
			if ( !da.acceptData( obj ) ) return;

			var thisCache,
				internalKey = da.expando,
				isNode = obj.nodeType,					//兼容IE的GC垃圾回收机制不同，所以DOM元素和js对象的处理方式不一样
				cache = isNode ? da.cache : obj,		//只有DOM元素需要全局的cache，普通js对象数据可以直接指向另一个对象
				id = isNode ? obj[ internalKey ] : internalKey;

			if ( !cache[ id ] ) return;					//没有目标对象任何缓存，直接返回
			
			if ( key ) {
				thisCache = pvt ? cache[ id ] : cache[ id ].data;	//非内部操作，返回用户缓存数据

				if ( thisCache ) {
					if ( !da.isArray( key ) ) {						//支持数组、空格分隔的方式批量操作
						if ( key in thisCache ){ 					//判断是否单值操作
							key = [ key ];
						}
						else {
							key = da.camelCase( key );
							if ( key in thisCache ) {				//转为驼峰格式后，再判断是否单值操作
								key = [ key ];
							} 
							else {									//确定为空格分隔的方式批量操作
								key = key.split( " " );
							}
						}
					}

					for ( var i = 0, len = key.length; i < len; i++ ) {
						delete thisCache[ key[i] ];
					}

					if ( !( pvt ? isEmptyDataObject : da.isEmptyObj )( thisCache ) ) {		//若对象仍然还有其他缓存数据，这时就可以先退出了。
						return;
					}
				}
			}

			if ( !pvt ) {										//若对象已经没有其他任何缓存数据了，就将缓存区自身也销毁
				delete cache[ id ].data;

				if ( !isEmptyDataObject(cache[ id ]) ) {		//外部用户操作，不能清除内部私用的缓存区
					return;
				}
			}

			// Browsers that fail expando deletion also refuse to delete expandos on
			// the window, but it will allow it on all other JS objects; other browsers
			// don't care
			// Ensure that `cache` is not a window object #10080
			if ( da.support.deleteExpando || !cache.setInterval ) {
				delete cache[ id ];
			}
			else {
				cache[ id ] = null;
			}
			
			// We destroyed the cache and need to eliminate the expando on the node to avoid
			// false lookups in the cache for entries that no longer exist
			if ( isNode ) {
				// IE does not allow us to delete expando properties from nodes,
				// nor does it have a removeAttribute function on Document nodes;
				// we must handle all of these cases
				if ( da.support.deleteExpando ) {
					delete obj[ internalKey ];
				} 
				else if ( obj.removeAttribute ) {
					obj.removeAttribute( internalKey );
				}
				else {
					obj[ internalKey ] = null;
				}
			}
		}
	});

	da.fnStruct.extend({
		data: function( key, value ) {
			var parts, part, attr, name, l,
				elem = this.dom[0],
				i = 0,
				data = null;

			// Gets all values
			if ( key === undefined ) {
				if ( this.dom.length ) {
					data = da.data( elem );

					if ( elem.nodeType === 1 && !da._data( elem, "parsedAttrs" ) ) {
						attr = elem.attributes;
						for ( l = attr.length; i < l; i++ ) {
							name = attr[i].name;

							if ( name.indexOf( "data-" ) === 0 ) {
								name = da.camelCase( name.substring(5) );

								dataAttr( elem, name, data[ name ] );
							}
						}
						da._data( elem, "parsedAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each(function() {
					da.data( this, key );
				});
			}

			parts = key.split( ".", 2 );
			parts[1] = parts[1] ? "." + parts[1] : "";
			part = parts[1] + "!";

			return da.access( this, function( value ) {

				if ( value === undefined ) {
					data = this.triggerHandler( "getData" + part, [ parts[0] ] );

					// Try to fetch any internally stored data first
					if ( data === undefined && elem ) {
						data = da.data( elem, key );
						data = dataAttr( elem, key, data );
					}

					return data === undefined && parts[1] ?
						this.data( parts[0] ) :
						data;
				}

				parts[1] = value;
				this.each(function() {
					var self = da( this );

					self.triggerHandler( "setData" + part, parts );
					da.data( this, key, value );
					self.triggerHandler( "changeData" + part, parts );
				});
			}, null, value, arguments.length > 1, null, false );
		},

		removeData: function( key ) {
			return this.each(function() {
				da.removeData( this, key );
			});
		}
	});

	
})(da);

/***************** Attr *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Element属性管理器 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_class = /[\n\t\r]/g,
		daRe_space = /\s+/,
		daRe_return = /\r/g,
		daRe_type = /^(?:button|input)$/i,
		daRe_focusable = /^(?:button|input|object|select|textarea)$/i,
		daRe_clickable = /^a(?:rea)?$/i,
		daRe_special = /^(?:data-|aria-)/,
		daRe_invalidChar = /\:/,
		formHook;
			
	da.fnStruct.extend({
		attr: function( name, value ) {
			return da.access( this, da.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each(function() {
				da.removeAttr( this.dom, name );
			});
		},
		
		/**判断元素是否存在class样式
		*/
		hasClass: function( str ) {
			var target = " " + str + " ";
			
			for ( var i = 0, len = this.dom.length; i < len; i++ ) {
				if ( 0 <= (" " + this.dom[i].className + " ").replace(daRe_class, " ").indexOf( target ) ) {
					return true;
				}
			}

			return false;
		},
		
		/**添加class样式
		*/
		addClass: function( param ) {
			if ( da.isFunction( param ) ) {
				return this.each(function(i) {
					var item = da(this);
					item.addClass( param.call(this, i, item.attr("class") || "") );
				});
			}

			if ( param && "string" === typeof param ) {
				var arrClass = (param || "").split( daRe_space );

				for ( var i = 0, len = this.dom.length; i < len; i++ ) {
					var item = this.dom[i];

					if ( 1 === item.nodeType ) {
						if ( !item.className ) {									//className为空,直接添加
							item.className = param;

						}
						else {														//追加
							var curClass = " " + item.className + " ",				//当前className,前后加" "用于查找
								newClass = item.className;

							for ( var n = 0, len2 = arrClass.length; n < len2; n++ ) {
								if ( 0 > curClass.indexOf( " " + arrClass[n] + " " ) ) {
									newClass += " " + arrClass[n];
								}
							}
							item.className = da.trim( newClass );
						}
					}
				}
			}

			return this;
		},
		
		/**移除class样式
		*/
		removeClass: function( param ) {
			if ( da.isFunction(param) ) {
				return this.each(function(i) {
					var item = da(this);
					item.removeClass( param.call(this, i, item.attr("class")) );
				});
			}

			if ( (param && typeof param === "string") || param === undefined ) {
				var arrClass = (param || "").split( daRe_space );

				for ( var i = 0, len = this.dom.length; i < len; i++ ) {
					var item = this.dom[i];

					if ( 1 === item.nodeType && item.className ) {
						if ( param ) {
							var curClass = (" " + item.className + " ").replace(daRe_class, " ");		//去空格、换行、制表符
							
							for ( var n = 0, len2 = arrClass.length; n < len2; n++ ) {
								curClass = curClass.replace(" " + arrClass[n] + " ", " ");
							}
							item.className = da.trim( curClass );

						} else {
							item.className = "";
						}
					}
				}
			}

			return this;
		},
		
		/**class样式增、删交替
		*/
		switchClass: function( param, isAdd ) {
			var type = typeof param,
				isForce = !!isAdd;						//当第二参数为true时，强制添加class样式
	
			if ( da.isFunction( param ) ) {
				return this.each(function(i) {
					var item = da(this);
					item.switchClass( param.call(this, i, item.attr("class"), isAdd), isAdd );
				});
			}

			return this.each(function() {
				if ( type === "string" ) {
					var item = da( this ),
						arrClass = param.split( daRe_space ),
						state = isAdd,
						className,
						n = 0;

					while ( (className = arrClass[ n++ ]) ) {
						state = isForce ? state : !item.hasClass( className );		//如非强制设置，就根据当前状态增或删
						item[ state ? "addClass" : "removeClass" ]( className );
					}
				}
				else if ( type === "undefined" || type === "boolean" ) {			//整个元素class样式进行增删切换
					if ( this.className ) {
						da.data( this, "_da_switchClass", this.className );			//缓存旧的class样式
					}

					this.className = (this.className || param === false) ? "" : da.data( this, "_da_switchClass" ) || "";
				}
			});
		},
		
		val: function( value ) {
			var hooks, ret,
					elem = this.dom[0];
			
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = da.valHooks[ elem.nodeName.toLowerCase() ] || da.valHooks[ elem.type ];
	
					if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
						return ret;
					}
	
					return (elem.value || "").replace(daRe_return, "");
				}
	
				return undefined;
			}
	
			var isFunction = da.isFunction( value );
	
			return this.each(function( i ) {
				var self = da(this), val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, self.val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
				} else if ( typeof val === "number" ) {
					val += "";
				} else if ( da.isArray( val ) ) {
					val = da.map(val, function ( value ) {
						return value == null ? "" : value + "";
					});
				}
	
				hooks = da.valHooks[ this.nodeName.toLowerCase() ] || da.valHooks[ this.type ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || ("set" in hooks && hooks.set( this, val, "value" ) === undefined) ) {
					this.value = val;
				}
			});
		},
		
	});


	da.extend({
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
		
		attrFix: {
			// Always normalize to ensure hook usage
			tabindex: "tabIndex",
			readonly: "readOnly"
		},
		
		//特殊属性Hook处理
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( daRe_type.test( elem.nodeName ) && elem.parentNode ) {		//兼容IE,某些元素不允许改变元素的type属性
						da.error( "温馨提示:button和input元素，不允许改变type属性" );
					} 
					else if ( !da.support.radioValue 
					&& "radio" === value 
					&& da.isNodeName(elem, "input") ) {								//兼容IE,如果某元素设置type为radio类型，需要重新设置默认value值
						var val = elem.getAttribute("value");
						elem.setAttribute( "type", value );
						
						if ( val ) elem.value = val;
						
						return value;
					}
					
				}
			},
			tabIndex: {
				get: function( elem ) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabIndex");
	
					return attributeNode && attributeNode.specified ?
						parseInt( attributeNode.value, 10 ) :
						( daRe_focusable.test( elem.nodeName ) || daRe_clickable.test( elem.nodeName ) && elem.href ) ? 
						0 : undefined;
				}
			}
		},
		
		//特殊元素的赋值Hook处理
		valHooks: {
			option: {
				get: function( elem ) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}
			},
			
			select: {
				get: function( elem ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";
	
					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}
	
					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];
	
						// Don't return options that are disabled or in a disabled optgroup
						if ( option.selected && (da.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
								(!option.parentNode.disabled || !da.isNodeName( option.parentNode, "optgroup" )) ) {
	
							// Get the specific value for the option
							value = da( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if ( one && !values.length && options.length ) {
						return da( options[ index ] ).val();
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var values = da.pushArray( value );
	
					da(elem).find("option").each(function() {
						this.selected = da.isInArray( da(thsis).val(), values ) >= 0;
					});
	
					if ( !values.length ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		},

		//核心元素属性操作函数
		/*
			elem: 元素对象
			name: 属性名称
			value:  属性值
			pass: 是否通过da类的相应 成员函数来处理属性值
		*/
		attr: function( elem, name, value, pass ) {
			var nType = elem.nodeType;																			//获得元素对象节点类型
			
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {			//不能对文本、注释、XML属性节点进行属性操作，直接返回undefined
				return undefined;
			}
	
			if ( pass && name in da.attrFn ) {															//允许通过特殊成员函数，有针对性的处理，并且该属性类型正好有与之对应的处理函数，就直接调用成员函数进行处理。
				return da( elem )[ name ]( value );
			}
			
			var ret, hooks,
					notxml = nType !== 1 || !da.isXMLDoc( elem );
			
			// Normalize the name if needed
			name = notxml && da.attrFix[ name ] || name;
	
			// Get the appropriate hook, or the formHook
			// if getSetAttribute is not supported and we have form objects in IE6/7
			hooks = da.attrHooks[ name ] ||
				( formHook && (da.isNodeName( elem, "form" ) || daRe_invalidChar.test( name )) ?
					formHook :
					undefined );
	
			if ( value !== undefined ) {									//set操作
				if ( value === null || (value === false && !daRe_special.test( name )) ) {
					da.removeAttr( elem, name );
					return undefined;
	
				} 
				else if ( hooks 
				&& "set" in hooks 
				&& notxml 
				&& undefined !== (ret = hooks.set( elem, value, name )) ) {
					return ret;
	
				} 
				else {
					// Set boolean attributes to the same name
					if ( value === true 
					&& !daRe_special.test( name ) )
						value = name;
	
					elem.setAttribute( name, "" + value );
					return value;
				}
	
			} 
			else {															//get操作
				if ( hooks && "get" in hooks && notxml ) {
					return hooks.get( elem, name );
	
				} 
				else {
					ret = elem.getAttribute( name );
					
					return null === ret ? undefined : ret;					// Non-existent attributes return null, we normalize to undefined
				}
			}
		},
		
		//移除元素属性
		/*
			elem: 元素对象
			name: 属性名
		*/
		removeAttr: function( elem, name ) {
				if ( 1 === elem.nodeType ) {
						name = da.attrFix[ name ] || name;
					
						if ( da.support.getSetAttribute ) {							//判断浏览器是否支持removeAttribute函数
							elem.removeAttribute( name );
						}
						else {														//如果不支持，可以通过XML节点移除函数完成
							da.attr( elem, name, "" );
							elem.removeAttributeNode( elem.getAttributeNode( name ) );
						}
				}
		}
		
	});


	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !da.support.getSetAttribute ) {											//兼容IE驼峰格式
		da.attrFix = da.extend( da.attrFix, {
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder"
		});
		
		// Use this for any attribute on a form in IE6/7
		formHook = da.attrHooks.name = da.attrHooks.value = da.valHooks.button = {
			get: function( elem, name ) {
				var ret;
				if ( name === "value" && !da.isNodeName( elem, "button" ) ) {
					return elem.getAttribute( name );
				}
				ret = elem.getAttributeNode( name );
				// Return undefined if not specified instead of empty string
				return ret && ret.specified ?
					ret.nodeValue :
					undefined;
			},
			set: function( elem, value, name ) {
				// Check form objects in IE (multiple bugs related)
				// Only use nodeValue if the attribute node exists on the form
				var ret = elem.getAttributeNode( name );
				if ( ret ) {
					ret.nodeValue = value;
					return value;
				}
			}
		};
	
		// Set width and height to auto instead of 0 on empty string( Bug #8150 )
		// This is for removals
		da.each([ "width", "height" ], function( i, name ) {
			da.attrHooks[ name ] = da.extend( da.attrHooks[ name ], {
				set: function( elem, value ) {
					if ( value === "" ) {
						elem.setAttribute( name, "auto" );
						return value;
					}
				}
			});
		});
	}
	
})(da);

/***************** Event *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 事件管理机制 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_typenamespace = /^([^\.]*)?(?:\.(.+))?$/,
		// daRe_namespaces = /\.(.*)$/,
		daRe_hoverHack = /(?:^|\s)hover(\.\S+)?\b/,
		daRe_keyEvent = /^key/,
		daRe_mouseEvent = /^(?:mouse|contextmenu)|click/,
		daRe_focusMorph = /^(?:focusinfocus|focusoutblur)$/,
		daRe_quickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
		daRe_escape = /[^\w\s.|`]/g;
	
	function quickParse( selector ) {
		var quick = daRe_quickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	}
	
	function quickIs( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	}
	
	//支持绑定hover事件(转为mouseenter$1和mouseleave$1)
	function hoverHack( events ) {
		return da.event.special.hover ? events : events.replace( daRe_hoverHack, "mouseenter$1 mouseleave$1" );
	}
	
	//清理函数
	function fnCleanup( nm ) {
		return nm.replace( daRe_escape, "\\$&" );
	}
	
	//恒返回False的函数
	function fnReturnFalse() {
		return false;
	}
	
	//恒返回True的函数
	function fnReturnTrue() {
		return true;
	}
	
	//事件移除公共函数
	da.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} : 
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

	//da.Event类构造函数
	/*
		src: 原始的event对象，也可以是事件类型字符串如："click","mouseover"等( this为封装后的event对象 )
	*/
	da.Event = function( src ) {
		if ( !this.preventDefault ) {				//取消默认的事件动作
			return new da.Event( src );
		}
	
		if ( src && src.type ) {
			this.originalEvent = src;					//将原始event对象缓存入，新event对象的属性变量中，供后面原型改造时调用
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? 
					fnReturnTrue : fnReturnFalse;
		}
		else {
			this.type = src;									//如果src传入的参数是字符串类型：da.Event("click");
		}
	
		this.timeStamp = da.nowId();				//修正timeStamp,因为firefox中一些event的时间戳不准确，所以还是自己定义个来得保险
		this[ da.expando ] = true;				//对当前event对象打上已做封装处理的标志
		
	};
	
	//对da.Event对象原型进行改造
	da.Event.prototype = {
		isDefaultPrevented: fnReturnFalse,
		isPropagationStopped: fnReturnFalse,
		isImmediatePropagationStopped: fnReturnFalse,
		
		//取消事件默认动作
		preventDefault: function() {
			this.isDefaultPrevented = fnReturnTrue;					//中止事件默认动作 判定函数( 默认返回为false，即允许 )
			
			var e = this.originalEvent;											//弹出原始事件对象
			if ( !e ) return;
			
			if ( e.preventDefault )	e.preventDefault();			//如果事件对象本身有preventDefault()函数，就调用
			else e.returnValue = false;											//如果没有preventDefault()函数,就将returnValue属性值设置为false，这也是针对IE浏览器的
		},
		
		//中止父级事件冒泡
		stopPropagation: function() {
			this.isPropagationStopped = fnReturnTrue;				//中止父级事件冒泡 判定函数( 默认返回为false，即允许 )
	
			var e = this.originalEvent;											//弹出原始事件对象
			if ( !e ) return;
			
			if ( e.stopPropagation ) e.stopPropagation();		//如果事件对象本身有stopPropagation()函数，就调用
			else e.cancelBubble = true;											//如果没有stopPropagation()函数,就将cancelBubble属性值设置为true，这也是针对IE浏览器的
				
		},
		
		//中止本地次优先级的事件响应 和父级事件传递( 事件冒泡 )
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = fnReturnTrue;			//中止本地和父级冒泡 判定函数( 默认返回为false，即允许 )
			
			this.stopPropagation();													//如果事件对象本身有stopPropagation()函数，就调用
			
		}
	};
	
	//1.3.5版本追加，方便记忆使用
	da.Event.prototype.noDefault = da.Event.prototype.preventDefault;
	da.Event.prototype.noParent = da.Event.prototype.stopPropagation;

	da.event = {
		props: ["altKey","attrChange","attrName","bubbles","button","cancelable","charCode",
				"clientX","clientY","ctrlKey","currentTarget","data","detail","eventPhase",
				"fromElement","handler","keyCode","layerX","layerY","metaKey","newValue",
				"offsetX","offsetY","pageX","pageY","prevValue","relatedNode","relatedTarget",
				"screenX","screenY","shiftKey","srcElement","target","toElement","view",
				"wheelDelta","which"],										//event对象的所有 成员列表
		guid: 1,
		// proxy: da.proxy,
		
		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function( event, original ) {
				if ( event.which == null ) {					//修正which，针对按键事件 charCode（键盘）keyCode（鼠标）
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button,
					fromElement = original.fromElement;

				if ( event.pageX == null && original.clientX != null ) {	//修正pageX/Y、clientX/Y属性,event事件的位置是相对page，如果页面可以滚动，
																			//client位置还要加上scroll，如果是IE浏览器，还要减去body的边框宽
					eventDoc = event.target.ownerDocument || document;		
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				if ( !event.relatedTarget && fromElement ) {				//修正relatedTarget属性，针对mouseover和mouserout事件；
																			//IE分成了to和from两个属性存放；FF没有分
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				//在 IE 里面 没有按键动作的时候 event.button = 0; 左键是1; 中键是4; 右键是2
				//在 Firefox 里面 没有按键动作的时候 event.button = 0; 左键是0 ;中键是1 ;右键是2
				//TODO: 这是不标准的，最好不要用这个
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},
		
		//事件封装函数
		/*
			event: 事件对象
		*/
		fix: function( event ) {
			if ( event[ da.expando ] ) {							//event对象已经封装过, 直接退出
				return event;
			}
	
			var originalEvent = event,								//缓存一个原始event对象
				fixHook = da.event.fixHooks[ event.type ] || {};
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
				
			event = da.Event( originalEvent );						//event对象并对其进行原型改造
	
			for ( var i = copy.length; i; ) {						//继承浏览器原event对象的属性
				prop = copy[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
		
			if ( !event.target ) {									//由于target属性的重要性，我们要再次确认是否被继承过来(兼容IE 6/7/8、Safari2)
				event.target = originalEvent.srcElement || document;
			}

			if ( event.target.nodeType === 3 ) {					//避免target属性指向的是一个文本对象(兼容Safari)
				event.target = event.target.parentNode;
			}

			if ( event.metaKey === undefined ) {					//修正metaKey，苹果电脑没有Ctrl键，只有meta键
				event.metaKey = event.ctrlKey;
			}

			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;			//特殊事件，需要特殊筛选处理
		},
		
		global: {},						//事件类型注册使用情况，标志集

		//分派自定义事件函数，通过命名空间分类和有序的执行( this是触发event事件的源元素对象 )
		/*
			event: 已经封装过的da.Event事件对象
		*/
		dispatch: function( event ) {
			event = da.event.fix( event || window.event );				//修正传入的event对象，保证其是封装过的
			
			var handlers = ( (da._data( this, "events" ) || {} )[ event.type ] || []),
				delegateCount = handlers.delegateCount,
				args = [].slice.call( arguments, 0 ),					//数组化参数列表
				run_all = !event.exclusive && !event.namespace,
				special = da.event.special[ event.type ] || {},
				handlerQueue = [],
				daObj, cur, selMatch, matches, handleObj, sel;
			
			args[0] = event;											//用封装好的Event对象代替原生浏览器event对象使用
			event.delegateTarget = this;								//事件托管目标指向自己
			
			/*TODO:	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			} */

			// Determine handlers that should run if there are delegated events
			if ( delegateCount && !(event.button && event.type === "click") ) {			//避免非鼠标左单击的事件冒泡
				// Pregenerate a single jQuery object for reuse with .is()
				daObj = da(this);
				daObj.context = this.ownerDocument || this;

				for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {	//事件冒泡处理
					if ( cur.disabled !== true ) {										//不处理不可用的元素
						selMatch = {};
						matches = [];
						daObj.dom[0] = cur;
						
						for ( var i = 0; i < delegateCount; i++ ) {						
							handleObj = handlers[ i ];									//事件处理结构体
							sel = handleObj.selector;									//委托对象选择器

							if ( selMatch[ sel ] === undefined ) {
								selMatch[ sel ] = (										//快速匹配事件委托对象
									handleObj.quick ? quickIs( cur, handleObj.quick ) : daObj.is( sel )
								);
							}
							if ( selMatch[ sel ] ) {
								matches.push( handleObj );
							}
						}
						
						if ( matches.length ) {
							handlerQueue.push({ elem: cur, matches: matches });
						}
					}
				}
			}
			
			// Add the remaining (directly-bound) handlers
			if ( handlers.length > delegateCount ) {
				handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
			}

			// Run delegates first; they may want to stop propagation beneath us
			for ( var i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
				matched = handlerQueue[ i ];
				event.currentTarget = matched.elem;

				for ( var j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
					handleObj = matched.matches[ j ];

					// Triggered event must either 1) be non-exclusive and have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					if ( run_all 
					|| (!event.namespace && !handleObj.namespace) 
					|| event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

						event.data = handleObj.data;
						event.handleObj = handleObj;

						ret = ( (da.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
									.apply( matched.elem, args );

						if ( ret !== undefined ) {
							event.result = ret;
							if ( ret === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
			
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},
	
		//给元素绑定事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
			data: 额外自定义传入数据对象
		*/
		add: function( elem, types, handler, data, selector ) {
			var tns, type, namespaces, 
				elemData,				//元素data缓存对象
				events, eventHandle,
				handleObjIn,			//handleObjIn用于缓存自定义函数参数对象；
				handleObj,				//handleObj事件属性配置对象，用于事件函数的注册存放和后期移除、触发
				handlers;
			
			if ( elem.nodeType === 3 || elem.nodeType === 8 			//不给文本和备注节点绑事件，没意义
			|| !types || !handler 										//缺少必要参数
			|| !(elemData = da._data( elem ))  ) {						//确保元素data缓存结构存在
				return;
			}
			
			/*
			if ( da.isWin( elem ) && ( elem !== window && !elem.frameElement ) ) {		//IE浏览器不能直接对window对象操作，所以先复制一下
				elem = window;
			}
			
			if ( handler === false ) handler = fnReturnFalse;							//如果handler的值为false可以屏蔽事件响应
			else if ( !handler ) return;
			*/
			
			if ( handler.handler ) {							//如果第3个参数，是以键值对的方式 如：{ handler: function(){……}, guid: 520 }
				handleObjIn = handler;							//缓存用户原参数对象(这里是键值对咯)
				handler = handleObjIn.handler;					//修正handler操作函数，为传入键值对的handler属性引用(内定的,在下面的代码可以看到)
				selector = handleObjIn.selector;
			}
	
			if ( !handler.guid ){								//回调函数赋值唯一标识，用于之后的查找或移除
				handler.guid = da.guid++;
			}
			
			events = elemData.events;							//如果已经有绑定的事件函数了，将事件函数都提出来，供下面追加事件绑定使用
			eventHandle = elemData.handle;
			
			if ( !events ) {									//首次add绑定事件
				elemData.events = events = {};					//初始化事件缓存结构体
			}
			if ( !eventHandle ) {								//初始化核心事件处理函数
																//定义eventHandle，到这里元素的data缓存结构 elemData === { events: {}, handle: function(){……} }
				elemData.handle = eventHandle = function( e ) {	//避免一个已经销毁的页面事件被调用 和 短时间内da.event.trigger()触发多次同一事件
					return "undefined" !== typeof da && (!e || e.type !== da.event.triggered ) ?
						da.event.dispatch.apply( eventHandle.elem, arguments ) :
						undefined;
				};
				eventHandle.elem = elem;						//给事件回调函数对象添加elem属性，存放事件绑定目标元素按对象，针对IE没有本地事件对象(IE的事件对象是放在window对象下统一管理的),可防止内存泄露的处理
			}
			
			types = da.trim( hoverHack(types) ).split( " " );	//支持空格分隔，批量绑定事件 如：da.event.add(obj, "mouseover mouseout", fn);
			
			for (var t = 0; t < types.length; t++ ) {							//批量处理逐一添加事件函数
				tns = daRe_typenamespace.exec( types[t] ) || [];				//提取事件的命名空间
				type = tns[1];
				namespaces = ( tns[2] || "" ).split( "." ).sort();

				// If event changes its type, use the special event handlers for the changed type
				special = da.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = da.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = da.extend({						//事件处理所需要的数据结构体
					type: type,
					origType: tns[1],
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					quick: selector && quickParse( selector ),
					namespace: namespaces.join(".")
					
				}, handleObjIn );

				handlers = events[ type ];					//提取对应事件的事件函数队列
				
				if ( !handlers ) {							//首次添加，初始化事件函数队列
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;				//该事件托管处理函数总数 初始化为0

					//如果非特殊事件类型 或da.event.special()判定函数返回值为false，就可以直接用addEventListener()或 attachEvent()绑定事件函数了
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle, false );

						} else if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}

				if ( special.add ) {									//特殊事件类型结构体，内部定义了add函数，就执行
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {					//修正guid
						handleObj.handler.guid = handler.guid;
					}
				}

				if ( selector ) {										//新事件处理结构体，加入队列
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				}
				else {
					handlers.push( handleObj );
				}

				da.event.global[ type ] = true;					//给da.event全局变量相应的事件类型打上标记，说明这种事件类型已有被注册，待全局事件触发时查看
			}

			elem = null;										//回收资源，避免内存泄露(兼容IE)
			
		},
	
		//针对元素移除或重置一个事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
		*/
		remove: function( elem, types, handler, selector, mappedTypes ) {
			var elemData = da.hasData( elem ) && da._data( elem ),	//元素缓存数据结构体
				tns, namespaces, origType, origCount, type, 
				events,	eventType,									//元素事件缓存数据
				special, handleObj, handle;

			if ( !elemData || !(events = elemData.events) )	return;	//无事件缓存，直接返回
			
			// Once for each type.namespace in types; type may be omitted
			types = da.trim( hoverHack( types || "" ) ).split(" ");		//同时移除多个事件，用空格（" "）分隔，如：da("...").unbind("mouseover mouseout", fn);
			
			for ( var t = 0; t < types.length; t++ ) {
				tns = daRe_typenamespace.exec( types[t] ) || [];		//命名空间的所有事件处理
				type = origType = tns[1];
				namespaces = tns[2];

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {							//递归
						da.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = da.event.special[ type ] || {};				//特殊事件类型处理
				type = ( selector? special.delegateType : special.bindType ) || type;
				eventType = events[ type ] || [];
				origCount = eventType.length;
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

				// Remove matching events
				for ( var j = 0; j < eventType.length; j++ ) {			//循环元素所有已绑定的事件类型
					handleObj = eventType[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						 ( !handler || handler.guid === handleObj.guid ) &&
						 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
						 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						eventType.splice( j--, 1 );						//找到匹配的事件处理函数，并从元素事件类型列表中移除

						if ( handleObj.selector ) {						//委任方式 delegateCount需要-1
							eventType.delegateCount--;
						}
						if ( special.remove ) {							//特殊事件类型，结构体内定义有remove，就执行一下下
							special.remove.call( elem, handleObj );
						}
					}
				}

				if ( eventType.length === 0 && origCount !== eventType.length ) {			//如果已经移除了该种事件类型所有处理函数，就把监听事件也移除
					if ( !special.teardown || false === special.teardown.call( elem, namespaces ) ) {
						da.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];								//释放缓存区
				}
			}

			// Remove the expando if it's no longer used
			if ( da.isEmptyObj( events ) ) {
				handle = elemData.handle;
				if ( handle ) {
					handle.elem = null;
				}

				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				da.removeData( elem, [ "events", "handle" ], true );
			}
			
		},

		// Events that are safe to short-circuit if no handlers are attached.
		// Native DOM events should not be added, they may have inline handlers.
		customEvent: {
			"getData": true,
			"setData": true,
			"changeData": true
		},

		//事件触发器( 支持同事件冒泡 )
		/*
			event: da.Event对象 或触发的事件类型event type
			data: 用户自定义数据传入，数组格式
			elem: 事件触发目标元素对象
			onlyHandlers: 阻止事件冒泡，并且不执行元素默认事件
		*/
		trigger: function( event, data, elem, onlyHandlers ) {
			if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {		//文本和注释元素你们就算了嘛，你还搞什么事件啊
				return;
			}
			
			var type = event.type || event,
				namespaces = [],
				exclusive, ontype, special, eventPath, old, cur, handle,
				cache;
			
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( daRe_focusMorph.test( type + da.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "!" ) >= 0 ) {					//支持"click!","evtFn!"这种叹号"!"结尾的exclusive方式
				// Exclusive events trigger only for the exact event (no namespaces)
				type = type.slice(0, -1);						//去掉"!"符号
				exclusive = true;								//exclusive方式打开，这将会对add注册的所有事件函数根据命名空间的分类来执行
			}

			if ( type.indexOf( "." ) >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}

			if ( (!elem || da.event.customEvent[ type ]) 						//没有匹配的da内部自定义事件类型
			&& !da.event.global[ type ] ) {										//也没有匹配的全局事件类型
				return;															//直接退出
			}

			// Caller can pass in an Event, Object, or just an event type string
			event = typeof event === "object" ?
				// jQuery.Event object
				event[ da.expando ] ? event :
				// Object literal
				new da.Event( type, event ) :
				// Just the event type (string)
				new da.Event( type );

			event.type = type;
			event.isTrigger = true;
			event.exclusive = exclusive;
			event.namespace = namespaces.join( "." );
			event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

			// Handle a global trigger
			if ( !elem ) {														//如果没有指定事件触发的目标元素对象，就是全局事件的触发
				// TODO: Stop taunting the data cache; remove global events and always attach to document
				cache = da.cache;												//只需要触发注册过的事件类型就可以了嘛
				for ( var i in cache ) {										//批处理全局缓存中所有注册过事件函数的元素对象，并触发执行相应的事件函数
					if ( cache[ i ].events && cache[ i ].events[ type ] ) {
						da.event.trigger( event, data, cache[ i ].handle.elem, true );			//递归逐个触发执行
					}
				}
				return;
			}

			// Clean up the event in case it is being reused
			event.result = undefined;											//如果是再次触发，就先把之前触发执行的结果清楚掉
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data != null ? da.pushArray( data ) : [];					//如果有传入数据的话，通过pushArray缓存一下下嘛
			data.unshift( event );												//在缓存数组首部，压入事件对象

			// Allow special events to draw outside the lines
			special = da.event.special[ type ] || {};
			if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			eventPath = [[ elem, special.bindType || type ]];
			if ( !onlyHandlers && !special.noBubble && !da.isWin( elem ) ) {

				bubbleType = special.delegateType || type;
				cur = daRe_focusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
				old = null;
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push([ cur, bubbleType ]);
					old = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( old && old === elem.ownerDocument ) {
					eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
				}
			}
			
			// Fire handlers on the event path
			for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {	//冒泡触发父亲的事件函数( 默认允许， 一直到 Document )
				cur = eventPath[i][0];
				event.type = eventPath[i][1];

				handle = ( da._data( cur, "events" ) || {} )[ event.type ] && da._data( cur, "handle" );	//先假定"handle"属性是一个函数,触发这个事件函数
				if ( handle ) {
					handle.apply( cur, data );						//1. 触发通过da.event.add()添加的用户自定义事件函数,
																	//这里的data会以数组的方式，被分别传入apply()的多个参数
				}
				// Note that this is a bare JS function and not a jQuery handler
				handle = ontype && cur[ ontype ];					//2. 触发本地脚本或元素行内脚本事件函数, 
																	//如：obj.onclick=function(){……}; 或 <input onclick="fn();" …… />
				if ( handle && da.acceptData( cur ) && handle.apply( cur, data ) === false ) {		//执行事件函数，如果返回为false，就中止元素的默认事件触发
					event.preventDefault();
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {	//3. 触发元素事件默认动作( 默认允许 )，如:form.submit()

				if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&	//非特殊事件 或特殊事件判断返回false 
					!(type === "click" && da.isNodeName( elem, "a" )) && da.acceptData( elem ) ) {			//并且非超链接click事件 
																											//并且非特殊元素类型，所有都满足了，呼呼~就可以执行下去了
					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					// IE<9 dies on focus/blur to hidden element (#1486)
					if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !da.isWin( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];					//取出事件函数
						
						if ( old ) {							//这里的判断 和紧接着的置空，可以避免某些事件,
							elem[ ontype ] = null;				//在事件函数执行完毕返回之前，被再次重复触发( 如： )
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						da.event.triggered = type;				//打上已触发执行中标记
						elem[ type ]();
						da.event.triggered = undefined;			//撤销触发执行中标记

						if ( old ) {							//还原事件函数
							elem[ ontype ] = old;					
						}
					}
				}
			}

			return event.result;
			
		},

		simulate: function( type, elem, event, bubble ) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = da.extend( new da.Event(), event, {
					type: type,
					isSimulated: true,
					originalEvent: {}
				});
			
			if ( bubble ) {
				da.event.trigger( e, null, elem );
			} 
			else {
				da.event.dispatch.call( elem, e );
			}
			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		},
	
		//特殊事件函数类型过滤和处理
		special: {
			ready: {
				setup: da.bindReady							//在绑定事件前，确定ready事件已经被初始化
			},

			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},

			focus: {
				delegateType: "focusin"
			},
			blur: {
				delegateType: "focusout"
			},

			beforeunload: {
				setup: function( data, namespaces, eventHandle ) {
					// We only want to do this special case on windows
					if ( da.isWin( this ) ) {
						this.onbeforeunload = eventHandle;
					}
				},

				teardown: function( namespaces, eventHandle ) {
					if ( this.onbeforeunload === eventHandle ) {
						this.onbeforeunload = null;
					}
				}
			}
		}
	
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	da.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function( orig, fix ) {
		da.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
			
			handle: function( event ) {
				var target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj,
					selector = handleObj.selector,
					ret;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || (related !== target && !da.contains( target, related )) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	});

	// IE submit delegation
	if ( !da.support.submitBubbles ) {
		da.event.special.submit = {
			setup: function() {
				// Only need this for delegated form submit events
				if ( da.isNodeName( this, "form" ) ) {
					return false;
				}

				// Lazy-add a submit handler when a descendant form may potentially be submitted
				da.event.add( this, "click._submit keypress._submit", function( e ) {
					// Node name check avoids a VML-related crash in IE (#9807)
					var elem = e.target,
						form = da.isNodeName( elem, "input" ) || da.isNodeName( elem, "button" ) ? elem.form : undefined;
					if ( form && !form._submit_attached ) {
						jQuery.event.add( form, "submit._submit", function( event ) {
							event._submit_bubble = true;
						});
						form._submit_attached = true;
					}
				});
				// return undefined since we don't need an event listener
			},
			
			postDispatch: function( event ) {
				// If form was submitted by the user, bubble the event up the tree
				if ( event._submit_bubble ) {
					delete event._submit_bubble;
					if ( this.parentNode && !event.isTrigger ) {
						da.event.simulate( "submit", this.parentNode, event, true );
					}
				}
			},

			teardown: function() {
				// Only need this for delegated form submit events
				if ( da.isNodeName( this, "form" ) ) {
					return false;
				}

				// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
				da.event.remove( this, "._submit" );
			}
		};
	}

	// IE change delegation and checkbox/radio fix
	if ( !da.support.changeBubbles ) {
		da.event.special.change = {
			setup: function() {
				if ( rformElems.test( this.nodeName ) ) {
					// IE doesn't fire change on a check/radio until blur; trigger it on click
					// after a propertychange. Eat the blur-change in special.change.handle.
					// This still fires onchange a second time for check/radio after blur.
					if ( this.type === "checkbox" || this.type === "radio" ) {
						da.event.add( this, "propertychange._change", function( event ) {
							if ( event.originalEvent.propertyName === "checked" ) {
								this._just_changed = true;
							}
						});
						da.event.add( this, "click._change", function( event ) {
							if ( this._just_changed && !event.isTrigger ) {
								this._just_changed = false;
								da.event.simulate( "change", this, event, true );
							}
						});
					}
					return false;
				}
				// Delegated event; lazy-add a change handler on descendant inputs
				da.event.add( this, "beforeactivate._change", function( e ) {
					var elem = e.target;

					if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
						da.event.add( elem, "change._change", function( event ) {
							if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
								da.event.simulate( "change", this.parentNode, event, true );
							}
						});
						elem._change_attached = true;
					}
				});
			},

			handle: function( event ) {
				var elem = event.target;

				// Swallow native change events from checkbox/radio, we already triggered them above
				if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
					return event.handleObj.handler.apply( this, arguments );
				}
			},

			teardown: function() {
				da.event.remove( this, "._change" );

				return rformElems.test( this.nodeName );
			}
		};
	}

	// Create "bubbling" focus and blur events
	if ( !da.support.focusinBubbles ) {
		da.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler while someone wants focusin/focusout
			var attaches = 0,
				handler = function( event ) {
					da.event.simulate( fix, event.target, da.event.fix( event ), true );
				};

			da.event.special[ fix ] = {
				setup: function() {
					if ( attaches++ === 0 ) {
						document.addEventListener( orig, handler, true );
					}
				},
				teardown: function() {
					if ( --attaches === 0 ) {
						document.removeEventListener( orig, handler, true );
					}
				}
			};
		});
	}

	
	//da对象扩展事件操作函数
	da.fnStruct.extend({
		/**监听事件
		*/
		on: function( types, objs, data, fn, one/*内部使用*/ ) {
			var fnUser, type;
			
			//参数矫正处理
			if ( typeof types === "object" ) {				//( types-Object, selector, data ) 以键值对的方式绑定事件函数，如：{"click":funcion(){},"dbclick":funcion(){}}
				if ( typeof objs !== "string" ) { 			//( types-Object, data ) objs不为null, 也不是选择器字符串
					data = data || objs;					//前移data参数的位置
					objs = undefined;
				}
				for ( type in types ) {
					this.on( type, objs, data, types[ type ], one );
				}
				return this;
			}

			if ( data == null && fn == null ) {				//( types, fn )未传第2、3个参数
				fn = objs;									
				data = objs = undefined;
			} 
			else if ( fn == null ) {
				if ( typeof objs === "string" ) {			//( types, objs, fn )未传第3个参数
					fn = data;
					data = undefined;
				} 
				else {										//( types, data, fn )未传第2个参数
					fn = data;
					data = objs;
					objs = undefined;
				}
			}
			
			if ( fn === false ) {							//事件屏蔽处理
				fn = fnReturnFalse;
			}
			else if ( !fn ) {								//参数矫正后仍无自定义处理函数，参数有误
				return this;
			}

			if ( one === 1 ) {										//一次性事件处理
				fnUser = fn;
				fn = function( event ) {
					da().off( event );								//因为是一次性事件，所以先移除元素上的事件绑定
					return fnUser.apply( this, arguments );			//再通过引用方式调用原事件回调函数
				};
				// Use same guid so caller can remove using fnUser
				//fn.guid = fnUser.guid || ( fnUser.guid = jQuery.guid++ );
			}
			
			return this.each( function() {							//事件添加
				da.event.add( this, types, fn, data, objs );
			});
		},
		
		/**关闭事件监听
		*/
		off: function( types, objs, fn ) {
			/* TODO:
			if ( types && types.preventDefault && types.handleObj ) {	//( event )传入Event对象方式，移除事件
				var handleObj = types.handleObj;
				
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.objs,
					handleObj.handler
				);
				return this;
			}
			 */
			if ( typeof types === "object" ) {						//( types-object [, objs] )以键值对的方式关闭监听函数
				for ( var type in types ) {
					this.off( type, objs, types[ type ] );
				}
				return this;
			}
			if ( objs === false || typeof objs === "function" ) {	//( types [, fn] )未传第2个参数
				fn = objs;
				objs = undefined;
			}
			if ( fn === false ) {									//事件屏蔽处理
				fn = fnReturnFalse;
			}
			return this.each(function() {
				da.event.remove( this, types, fn, objs );
			});
		},

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		live: function( types, data, fn ) {
			da( this.context ).on( types, this.selector, data, fn );
			return this;
		},
		die: function( types, fn ) {
			da( this.context ).off( types, this.selector || "**", fn );
			return this;
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
		},

		trigger: function( type, data ) {
			return this.each(function() {
				da.event.trigger( type, data, this );
			});
		},
		triggerHandler: function( type, data ) {
			if ( this.dom[0] ) {
				return da.event.trigger( type, data, this.dom[0], true );
			}
		},
	
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	});
	
	da.each([
		"blur","focus","focusin","focusout","load","resize","scroll","unload","click","dblclick",
		"mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave",
		"change","select","submit","keydown","keypress","keyup","error"],
		function( i, name ) {
			// Handle event binding
			da.fnStruct[ name ] = function( data, fn ) {
				if ( fn == null ) {
					fn = data;
					data = null;
				}
		
				return arguments.length > 0 ?
					this.bind( name, data, fn ) :
					this.trigger( name );
			};
		
			if ( da.attrFn ) {
				da.attrFn[ name ] = true;
			}
			
			if ( daRe_keyEvent.test( name ) ) {
				da.event.fixHooks[ name ] = da.event.keyHooks;
			}

			if ( daRe_mouseEvent.test( name ) ) {
				da.event.fixHooks[ name ] = da.event.mouseHooks;
			}
	});

})( da );

/***************** Sizzle选择器 *****************/
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(da){
	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		done = 0,
		toString = Object.prototype.toString,
		hasDuplicate = false,
		baseHasDuplicate = true,
		rBackslash = /\\/g,
		rNonWord = /\W/;
	
	// Here we check if the JavaScript engine is using some sort of
	// optimization where it does not always call our comparision
	// function. If that is the case, discard the hasDuplicate value.
	//   Thus far that includes Google Chrome.
	[0, 0].sort(function() {
		baseHasDuplicate = false;
		return 0;
	});
	
	var Sizzle = function( selector, context, results, seed ) {
		results = results || [];
		context = context || document;
	
		var origContext = context;
		
		if ( !context || context.nodeType !== 1 && context.nodeType !== 9 ) {									//danny 添加!context条件判断 2011-11-7 10:22:37
			return [];
		}
		
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}
	
		var m, set, checkSet, extra, ret, cur, pop, i,
			prune = true,
			contextXML = Sizzle.isXML( context ),
			parts = [],
			soFar = selector;
		
		// Reset the position of the chunker regexp (start from head)
		do {
			chunker.exec( "" );
			m = chunker.exec( soFar );
	
			if ( m ) {
				soFar = m[3];
			
				parts.push( m[1] );
			
				if ( m[2] ) {
					extra = m[3];
					break;
				}
			}
		} while ( m );
	
		if ( parts.length > 1 && origPOS.exec( selector ) ) {
	
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				set = posProcess( parts[0] + parts[1], context );
	
			} else {
				set = Expr.relative[ parts[0] ] ?
					[ context ] :
					Sizzle( parts.shift(), context );
	
				while ( parts.length ) {
					selector = parts.shift();
	
					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
					
					set = posProcess( selector, set );
				}
			}
	
		} else {
			// Take a shortcut and set the context if the root selector is an ID
			// (but not if it'll be faster if the inner selector is an ID)
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
	
				ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ?
					Sizzle.filter( ret.expr, ret.set )[0] :
					ret.set[0];
			}
	
			if ( context ) {
				ret = seed ?
					{ expr: parts.pop(), set: makeArray(seed) } :
					Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
				
				set = ret.expr ?
					Sizzle.filter( ret.expr, ret.set ) :
					ret.set;
	
				if ( parts.length > 0 ) {
					checkSet = makeArray( set );
	
				} else {
					prune = false;
				}
	
				while ( parts.length ) {
					cur = parts.pop();
					pop = cur;
	
					if ( !Expr.relative[ cur ] ) {
						cur = "";
					} else {
						pop = parts.pop();
					}
	
					if ( pop == null ) {
						pop = context;
					}
	
					Expr.relative[ cur ]( checkSet, pop, contextXML );
				}
	
			} else {
				checkSet = parts = [];
			}
		}
	
		if ( !checkSet ) {
			checkSet = set;
		}
	
		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}
	
		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				results.push.apply( results, checkSet );
	
			} else if ( context && context.nodeType === 1 ) {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
						results.push( set[i] );
					}
				}
	
			} else {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}
	
		} else {
			makeArray( checkSet, results );
		}
	
		if ( extra ) {
			Sizzle( extra, origContext, results, seed );
			Sizzle.uniqueSort( results );
		}
	
		return results;
	};
	
	Sizzle.uniqueSort = function( results ) {
		if ( sortOrder ) {
			hasDuplicate = baseHasDuplicate;
			results.sort( sortOrder );
	
			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[ i - 1 ] ) {
						results.splice( i--, 1 );
					}
				}
			}
		}
	
		return results;
	};
	
	Sizzle.matches = function( expr, set ) {
		return Sizzle( expr, null, null, set );
	};
	
	Sizzle.matchesSelector = function( node, expr ) {
		return Sizzle( expr, null, null, [node] ).length > 0;
	};
	
	Sizzle.find = function( expr, context, isXML ) {
		var set;
	
		if ( !expr ) {
			return [];
		}
	
		for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
			var match,
				type = Expr.order[i];
			
			if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
				var left = match[1];
				match.splice( 1, 1 );
	
				if ( left.substr( left.length - 1 ) !== "\\" ) {
					match[1] = (match[1] || "").replace( rBackslash, "" );
					set = Expr.find[ type ]( match, context, isXML );
	
					if ( set != null ) {
						expr = expr.replace( Expr.match[ type ], "" );
						break;
					}
				}
			}
		}
	
		if ( !set ) {
			set = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( "*" ) :
				[];
		}
	
		return { set: set, expr: expr };
	};
	
	Sizzle.filter = function( expr, set, inplace, not ) {
		var match, anyFound,
			old = expr,
			result = [],
			curLoop = set,
			isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );
	
		while ( expr && set.length ) {
			for ( var type in Expr.filter ) {
				if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
					var found, item,
						filter = Expr.filter[ type ],
						left = match[1];
	
					anyFound = false;
	
					match.splice(1,1);
	
					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}
	
					if ( curLoop === result ) {
						result = [];
					}
	
					if ( Expr.preFilter[ type ] ) {
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
	
						if ( !match ) {
							anyFound = found = true;
	
						} else if ( match === true ) {
							continue;
						}
					}

					if ( match ) {
						for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								found = filter( item, match, i, curLoop );
								var pass = not ^ !!found;
	
								if ( inplace && found != null ) {
									if ( pass ) {
										anyFound = true;
	
									} else {
										curLoop[i] = false;
									}
	
								} else if ( pass ) {
									result.push( item );
									anyFound = true;
								}
							}
						}
					}
	
					if ( found !== undefined ) {
						if ( !inplace ) {
							curLoop = result;
						}
	
						expr = expr.replace( Expr.match[ type ], "" );
	
						if ( !anyFound ) {
							return [];
						}
	
						break;
					}
				}
			}
	
			// Improper expression
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );
	
				} else {
					break;
				}
			}
	
			old = expr;
		}
	
		return curLoop;
	};
	
	Sizzle.error = function( msg ) {
		throw "Syntax error, unrecognized expression: " + msg;
	};
	
	var Expr = Sizzle.selectors = {
		order: [ "ID", "NAME", "TAG" ],
	
		match: {
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
			CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
			PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},
	
		leftMatch: {},
	
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
	
		attrHandle: {
			href: function( elem ) {
				return elem.getAttribute( "href" );
			},
			type: function( elem ) {
				return elem.getAttribute( "type" );
			}
		},
	
		relative: {
			"+": function(checkSet, part){
				var isPartStr = typeof part === "string",
					isTag = isPartStr && !rNonWord.test( part ),
					isPartStrNotTag = isPartStr && !isTag;
	
				if ( isTag ) {
					part = part.toLowerCase();
				}
	
				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
	
						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
							elem || false :
							elem === part;
					}
				}
	
				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},
	
			">": function( checkSet, part ) {
				var elem,
					isPartStr = typeof part === "string",
					i = 0,
					l = checkSet.length;
	
				if ( isPartStr && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
	
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
	
				} else {
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								elem.parentNode === part;
						}
					}
	
					if ( isPartStr ) {
						Sizzle.filter( part, checkSet, true );
					}
				}
			},
	
			"": function(checkSet, part, isXML){
				var nodeCheck,
					doneName = done++,
					checkFn = dirCheck;
	
				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}
	
				checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
			},
	
			"~": function( checkSet, part, isXML ) {
				var nodeCheck,
					doneName = done++,
					checkFn = dirCheck;
	
				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}
	
				checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
			}
		},
	
		find: {
			ID: function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			},
	
			NAME: function( match, context ) {
				if ( typeof context.getElementsByName !== "undefined" ) {
					var ret = [],
						results = context.getElementsByName( match[1] );
	
					for ( var i = 0, l = results.length; i < l; i++ ) {
						if ( results[i].getAttribute("name") === match[1] ) {
							ret.push( results[i] );
						}
					}
	
					return ret.length === 0 ? null : ret;
				}
			},
	
			TAG: function( match, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( match[1] );
				}
			}
		},
		preFilter: {
			CLASS: function( match, curLoop, inplace, result, not, isXML ) {
				match = " " + match[1].replace( rBackslash, "" ) + " ";
	
				if ( isXML ) {
					return match;
				}
	
				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
							if ( !inplace ) {
								result.push( elem );
							}
	
						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}
	
				return false;
			},
	
			ID: function( match ) {
				return match[1].replace( rBackslash, "" );
			},
	
			TAG: function( match, curLoop ) {
				return match[1].replace( rBackslash, "" ).toLowerCase();
			},
	
			CHILD: function( match ) {
				if ( match[1] === "nth" ) {
					if ( !match[2] ) {
						Sizzle.error( match[0] );
					}
	
					match[2] = match[2].replace(/^\+|\s*/g, '');
	
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
	
					// calculate the numbers (first)n+(last) including if they are negative
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
				}
				else if ( match[2] ) {
					Sizzle.error( match[0] );
				}
	
				// TODO: Move to normal caching system
				match[0] = done++;
	
				return match;
			},
	
			ATTR: function( match, curLoop, inplace, result, not, isXML ) {
				var name = match[1] = match[1].replace( rBackslash, "" );
				
				if ( !isXML && Expr.attrMap[name] ) {
					match[1] = Expr.attrMap[name];
				}
	
				// Handle if an un-quoted value was used
				match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );
	
				if ( match[2] === "~=" ) {
					match[4] = " " + match[4] + " ";
				}
	
				return match;
			},
	
			PSEUDO: function( match, curLoop, inplace, result, not ) {
				if ( match[1] === "not" ) {
					// If we're dealing with a complex expression, or a simple one
					if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
						match[3] = Sizzle(match[3], null, null, curLoop);
	
					} else {
						var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
	
						if ( !inplace ) {
							result.push.apply( result, ret );
						}
	
						return false;
					}
	
				} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
					return true;
				}
				
				return match;
			},
	
			POS: function( match ) {
				match.unshift( true );
	
				return match;
			}
		},
		
		filters: {
			enabled: function( elem ) {
				return elem.disabled === false && elem.type !== "hidden";
			},
	
			disabled: function( elem ) {
				return elem.disabled === true;
			},
	
			checked: function( elem ) {
				return elem.checked === true;
			},
			
			selected: function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
				
				return elem.selected === true;
			},
	
			parent: function( elem ) {
				return !!elem.firstChild;
			},
	
			empty: function( elem ) {
				return !elem.firstChild;
			},
	
			has: function( elem, i, match ) {
				return !!Sizzle( match[3], elem ).length;
			},
	
			header: function( elem ) {
				return (/h\d/i).test( elem.nodeName );
			},
	
			text: function( elem ) {
				var attr = elem.getAttribute( "type" ), type = elem.type;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
			},
	
			radio: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
			},
	
			checkbox: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
			},
	
			file: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
			},
	
			password: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
			},
	
			submit: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "submit" === elem.type;
			},
	
			image: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
			},
	
			reset: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "reset" === elem.type;
			},
	
			button: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && "button" === elem.type || name === "button";
			},
	
			input: function( elem ) {
				return (/input|select|textarea|button/i).test( elem.nodeName );
			},
	
			focus: function( elem ) {
				return elem === elem.ownerDocument.activeElement;
			}
		},
		setFilters: {
			first: function( elem, i ) {
				return i === 0;
			},
	
			last: function( elem, i, match, array ) {
				return i === array.length - 1;
			},
	
			even: function( elem, i ) {
				return i % 2 === 0;
			},
	
			odd: function( elem, i ) {
				return i % 2 === 1;
			},
	
			lt: function( elem, i, match ) {
				return i < match[3] - 0;
			},
	
			gt: function( elem, i, match ) {
				return i > match[3] - 0;
			},
	
			nth: function( elem, i, match ) {
				return match[3] - 0 === i;
			},
	
			eq: function( elem, i, match ) {
				return match[3] - 0 === i;
			}
		},
		filter: {
			PSEUDO: function( elem, match, i, array ) {
				var name = match[1],
					filter = Expr.filters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
	
				} else if ( name === "contains" ) {
					return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
	
				} else if ( name === "not" ) {
					var not = match[3];
	
					for ( var j = 0, l = not.length; j < l; j++ ) {
						if ( not[j] === elem ) {
							return false;
						}
					}
	
					return true;
	
				} else {
					Sizzle.error( name );
				}
			},
	
			CHILD: function( elem, match ) {
				var type = match[1],
					node = elem;
	
				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}
	
						if ( type === "first" ) { 
							return true; 
						}
	
						node = elem;
	
					case "last":
						while ( (node = node.nextSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}
	
						return true;
	
					case "nth":
						var first = match[2],
							last = match[3];
	
						if ( first === 1 && last === 0 ) {
							return true;
						}
						
						var doneName = match[0],
							parent = elem.parentNode;
		
						if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
							var count = 0;
							
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									node.nodeIndex = ++count;
								}
							} 
	
							parent.sizcache = doneName;
						}
						
						var diff = elem.nodeIndex - last;
	
						if ( first === 0 ) {
							return diff === 0;
	
						} else {
							return ( diff % first === 0 && diff / first >= 0 );
						}
				}
			},
	
			ID: function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},
	
			TAG: function( elem, match ) {
				return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
			},
			
			CLASS: function( elem, match ) {
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf( match ) > -1;
			},
	
			ATTR: function( elem, match ) {
				var name = match[1],
					result = Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					value = result + "",
					type = match[2],
					check = match[4];
	
				return result == null ?
					type === "!=" :
					type === "=" ?
					value === check :
					type === "*=" ?
					value.indexOf(check) >= 0 :
					type === "~=" ?
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					value && result !== false :
					type === "!=" ?
					value !== check :
					type === "^=" ?
					value.indexOf(check) === 0 :
					type === "$=" ?
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},
	
			POS: function( elem, match, i, array ) {
				var name = match[2],
					filter = Expr.setFilters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
				}
			}
		}
	};
	
	var origPOS = Expr.match.POS,
		fescape = function(all, num){
			return "\\" + (num - 0 + 1);
		};
	
	for ( var type in Expr.match ) {
		Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
		Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
	}
	
	var makeArray = function( array, results ) {
		array = Array.prototype.slice.call( array, 0 );
	
		if ( results ) {
			results.push.apply( results, array );
			return results;
		}
		
		return array;
	};
	
	// Perform a simple check to determine if the browser is capable of
	// converting a NodeList to an array using builtin methods.
	// Also verifies that the returned array holds DOM nodes
	// (which is not the case in the Blackberry browser)
	try {
		Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;
	
	// Provide a fallback method if it does not work
	} catch( e ) {
		makeArray = function( array, results ) {
			var i = 0,
				ret = results || [];
	
			if ( toString.call(array) === "[object Array]" ) {
				Array.prototype.push.apply( ret, array );
	
			} else {
				if ( typeof array.length === "number" ) {
					for ( var l = array.length; i < l; i++ ) {
						ret.push( array[i] );
					}
	
				} else {
					for ( ; array[i]; i++ ) {
						ret.push( array[i] );
					}
				}
			}
	
			return ret;
		};
	}
	
	var sortOrder, siblingCheck;
	
	if ( document.documentElement.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				return a.compareDocumentPosition ? -1 : 1;
			}
	
			return a.compareDocumentPosition(b) & 4 ? -1 : 1;
		};
	
	} else {
		sortOrder = function( a, b ) {
			// The nodes are identical, we can exit early
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
	
			// Fallback to using sourceIndex (in IE) if it's available on both nodes
			} else if ( a.sourceIndex && b.sourceIndex ) {
				return a.sourceIndex - b.sourceIndex;
			}
	
			var al, bl,
				ap = [],
				bp = [],
				aup = a.parentNode,
				bup = b.parentNode,
				cur = aup;
	
			// If the nodes are siblings (or identical) we can do a quick check
			if ( aup === bup ) {
				return siblingCheck( a, b );
	
			// If no parents were found then the nodes are disconnected
			} else if ( !aup ) {
				return -1;
	
			} else if ( !bup ) {
				return 1;
			}
	
			// Otherwise they're somewhere else in the tree so we need
			// to build up a full list of the parentNodes for comparison
			while ( cur ) {
				ap.unshift( cur );
				cur = cur.parentNode;
			}
	
			cur = bup;
	
			while ( cur ) {
				bp.unshift( cur );
				cur = cur.parentNode;
			}
	
			al = ap.length;
			bl = bp.length;
	
			// Start walking down the tree looking for a discrepancy
			for ( var i = 0; i < al && i < bl; i++ ) {
				if ( ap[i] !== bp[i] ) {
					return siblingCheck( ap[i], bp[i] );
				}
			}
	
			// We ended someplace up the tree so do a sibling check
			return i === al ?
				siblingCheck( a, bp[i], -1 ) :
				siblingCheck( ap[i], b, 1 );
		};
	
		siblingCheck = function( a, b, ret ) {
			if ( a === b ) {
				return ret;
			}
	
			var cur = a.nextSibling;
	
			while ( cur ) {
				if ( cur === b ) {
					return -1;
				}
	
				cur = cur.nextSibling;
			}
	
			return 1;
		};
	}
	
	// Utility function for retreiving the text value of an array of DOM nodes
	Sizzle.getText = function( elems ) {
		var ret = "", elem;
	
		for ( var i = 0; elems[i]; i++ ) {
			elem = elems[i];
	
			// Get the text from text nodes and CDATA nodes
			if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
				ret += elem.nodeValue;
	
			// Traverse everything else, except comment nodes
			} else if ( elem.nodeType !== 8 ) {
				ret += Sizzle.getText( elem.childNodes );
			}
		}
	
		return ret;
	};
	
	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	(function(){
		// We're going to inject a fake input element with a specified name
		var form = document.createElement("div"),
			id = "script" + (new Date()).getTime(),
			root = document.documentElement;
	
		form.innerHTML = "<a name='" + id + "'/>";
	
		// Inject it into the root element, check its status, and remove it quickly
		root.insertBefore( form, root.firstChild );
	
		// The workaround has to do additional checks after a getElementById
		// Which slows things down for other browsers (hence the branching)
		if ( document.getElementById( id ) ) {
			Expr.find.ID = function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
	
					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
						[];
				}
			};
	
			Expr.filter.ID = function( elem, match ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
	
				return elem.nodeType === 1 && node && node.nodeValue === match;
			};
		}
	
		root.removeChild( form );
	
		// release memory in IE
		root = form = null;
	})();
	
	(function(){
		// Check to see if the browser returns only elements
		// when doing getElementsByTagName("*")
	
		// Create a fake element
		var div = document.createElement("div");
		div.appendChild( document.createComment("") );
	
		// Make sure no comments are found
		if ( div.getElementsByTagName("*").length > 0 ) {
			Expr.find.TAG = function( match, context ) {
				var results = context.getElementsByTagName( match[1] );
	
				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [];
	
					for ( var i = 0; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}
	
					results = tmp;
				}
	
				return results;
			};
		}
	
		// Check to see if an attribute returns normalized href attributes
		div.innerHTML = "<a href='#'></a>";
	
		if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#" ) {
	
			Expr.attrHandle.href = function( elem ) {
				return elem.getAttribute( "href", 2 );
			};
		}
	
		// release memory in IE
		div = null;
	})();
	
	if ( document.querySelectorAll ) {
		(function(){
			var oldSizzle = Sizzle,
				div = document.createElement("div"),
				id = "__sizzle__";
	
			div.innerHTML = "<p class='TEST'></p>";
	
			// Safari can't handle uppercase or unicode characters when
			// in quirks mode.
			if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
				return;
			}
		
			Sizzle = function( query, context, extra, seed ) {
				context = context || document;
	
				// Only use querySelectorAll on non-XML documents
				// (ID selectors don't work in non-HTML documents)
				if ( !seed && !Sizzle.isXML(context) ) {
					// See if we find a selector to speed up
					var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
					
					if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
						// Speed-up: Sizzle("TAG")
						if ( match[1] ) {
							return makeArray( context.getElementsByTagName( query ), extra );
						
						// Speed-up: Sizzle(".CLASS")
						} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
							return makeArray( context.getElementsByClassName( match[2] ), extra );
						}
					}
					
					if ( context.nodeType === 9 ) {
						// Speed-up: Sizzle("body")
						// The body element only exists once, optimize finding it
						if ( query === "body" && context.body ) {
							return makeArray( [ context.body ], extra );
							
						// Speed-up: Sizzle("#ID")
						} else if ( match && match[3] ) {
							var elem = context.getElementById( match[3] );
	
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							if ( elem && elem.parentNode ) {
								// Handle the case where IE and Opera return items
								// by name instead of ID
								if ( elem.id === match[3] ) {
									return makeArray( [ elem ], extra );
								}
								
							} else {
								return makeArray( [], extra );
							}
						}
						
						try {
							return makeArray( context.querySelectorAll(query), extra );
						} catch(qsaError) {}
	
					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
						var oldContext = context,
							old = context.getAttribute( "id" ),
							nid = old || id,
							hasParent = context.parentNode,
							relativeHierarchySelector = /^\s*[+~]/.test( query );
	
						if ( !old ) {
							context.setAttribute( "id", nid );
						} else {
							nid = nid.replace( /'/g, "\\$&" );
						}
						if ( relativeHierarchySelector && hasParent ) {
							context = context.parentNode;
						}
	
						try {
							if ( !relativeHierarchySelector || hasParent ) {
								return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
							}
	
						} catch(pseudoError) {
						} finally {
							if ( !old ) {
								oldContext.removeAttribute( "id" );
							}
						}
					}
				}
			
				return oldSizzle(query, context, extra, seed);
			};
	
			for ( var prop in oldSizzle ) {
				Sizzle[ prop ] = oldSizzle[ prop ];
			}
	
			// release memory in IE
			div = null;
		})();
	}
	
	(function(){
		var html = document.documentElement,
			matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
	
		if ( matches ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9 fails this)
			var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
				pseudoWorks = false;
	
			try {
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( document.documentElement, "[test!='']:sizzle" );
		
			} catch( pseudoError ) {
				pseudoWorks = true;
			}
	
			Sizzle.matchesSelector = function( node, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
	
				if ( !Sizzle.isXML( node ) ) {
					try { 
						if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
							var ret = matches.call( node, expr );
	
							// IE 9's matchesSelector returns false on disconnected nodes
							if ( ret || !disconnectedMatch ||
									// As well, disconnected nodes are said to be in a document
									// fragment in IE 9, so check for that
									node.document && node.document.nodeType !== 11 ) {
								return ret;
							}
						}
					} catch(e) {}
				}
	
				return Sizzle(expr, null, null, [node]).length > 0;
			};
		}
	})();
	
	(function(){
		var div = document.createElement("div");
	
		div.innerHTML = "<div class='test e'></div><div class='test'></div>";
	
		// Opera can't find a second classname (in 9.6)
		// Also, make sure that getElementsByClassName actually exists
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			return;
		}
	
		// Safari caches class attributes, doesn't catch changes (in 3.2)
		div.lastChild.className = "e";
	
		if ( div.getElementsByClassName("e").length === 1 ) {
			return;
		}
		
		Expr.order.splice(1, 0, "CLASS");
		Expr.find.CLASS = function( match, context, isXML ) {
			if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
				return context.getElementsByClassName(match[1]);
			}
		};
	
		// release memory in IE
		div = null;
	})();
	
	function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
	
			if ( elem ) {
				var match = false;
	
				elem = elem[dir];
	
				while ( elem ) {
					if ( elem.sizcache === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}
	
					if ( elem.nodeType === 1 && !isXML ){
						elem.sizcache = doneName;
						elem.sizset = i;
					}
	
					if ( elem.nodeName.toLowerCase() === cur ) {
						match = elem;
						break;
					}
	
					elem = elem[dir];
				}
	
				checkSet[i] = match;
			}
		}
	}
	
	function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
	
			if ( elem ) {
				var match = false;
				
				elem = elem[dir];
	
				while ( elem ) {
					if ( elem.sizcache === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}
	
					if ( elem.nodeType === 1 ) {
						if ( !isXML ) {
							elem.sizcache = doneName;
							elem.sizset = i;
						}
	
						if ( typeof cur !== "string" ) {
							if ( elem === cur ) {
								match = true;
								break;
							}
	
						} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
							match = elem;
							break;
						}
					}
	
					elem = elem[dir];
				}
	
				checkSet[i] = match;
			}
		}
	}
	
	if ( document.documentElement.contains ) {
		Sizzle.contains = function( a, b ) {
			return a !== b && (a.contains ? a.contains(b) : true);
		};
	
	} else if ( document.documentElement.compareDocumentPosition ) {
		Sizzle.contains = function( a, b ) {
			return !!(a.compareDocumentPosition(b) & 16);
		};
	
	} else {
		Sizzle.contains = function() {
			return false;
		};
	}
	
	Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833) 
		var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	
	var posProcess = function( selector, context ) {
		var match,
			tmpSet = [],
			later = "",
			root = context.nodeType ? [context] : context;
	
		// Position selectors must be done after the filter
		// And so must :not(positional) so we move all PSEUDOs to the end
		while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
			later += match[0];
			selector = selector.replace( Expr.match.PSEUDO, "" );
		}
	
		selector = Expr.relative[selector] ? selector + "*" : selector;
	
		for ( var i = 0, l = root.length; i < l; i++ ) {
			Sizzle( selector, root[i], tmpSet );
		}
	
		return Sizzle.filter( later, tmpSet );
	};
	
	//****************** 集成Sizzle选择器 ***********************/
	// EXPOSE
	//window.Sizzle = Sizzle;
	da.find = Sizzle;
	da.expr = Sizzle.selectors;
	da.expr[":"] = da.expr.filters;
	da.unique = Sizzle.uniqueSort;
	da.text = Sizzle.getText;
	da.isXMLDoc = Sizzle.isXML;
	da.contains = Sizzle.contains;
	//****************** 集成Sizzle选择器 ***********************/
})(da);

/***************** Sizzle选择器 扩展 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Sizzle选择器 扩展接口函数
	version: 1.0.0
*/
(function(da){
	if ( da.expr && da.expr.filters ) {
		/**Sizzle选择器扩展hidden属性值判断
		*/
		da.expr.filters.hidden = function( elem ) {
			var width = elem.offsetWidth,
				height = elem.offsetHeight;

			return (width === 0 && height === 0) || (!da.support.reliableHiddenOffsets && (elem.style.display || da.css( elem, "display" )) === "none");
		};

		/**Sizzle选择器扩展visible属性值判断
		*/
		da.expr.filters.visible = function( elem ) {
			return !da.expr.filters.hidden( elem );
			
		};
	}

	
	
var daRe_until = /Until$/,
	daRe_parentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	daRe_multiselector = /,/,
	daRe_isSimple = /^.[^:#\[\.,]*$/,
	daRe_POS = da.expr.match.POS,
	
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true 
	};
	
	
	//元素挑选函数 //Implement the identical functionality for filter and not
	/*
		elements: 元素集合
		qualifier: 过滤条件
		keep: ????????
	*/
	function winnow( elements, qualifier, keep ) {
	
		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		qualifier = qualifier || 0;
	
		if ( da.isFunction( qualifier ) ) {												//如果过滤条件是function
			return da.grep(elements, function( elem, i ) {					//通过da.grep()函数批处理，得到过滤后的合格元素集合
				var retVal = !!qualifier.call( elem, i, elem );
				return retVal === keep;
			});
	
		}
		else if ( qualifier.nodeType ) {													//如果过滤条件是节点元素对象
			return da.grep(elements, function( elem, i ) {
				return (elem === qualifier) === keep;
			});
	
		} 
		else if ( typeof qualifier === "string" ) {								//如果过滤条件是Sizzle选择器字符串
			var filtered = da.grep(elements, function( elem ) {			//选出Sizzle可操作的元素对象
				return elem.nodeType === 1;
			});
	
			if ( daRe_isSimple.test( qualifier ) ) {								//???????????
				return da.filter(qualifier, filtered, !keep);
			}
			else {
				qualifier = da.filter( qualifier, filtered );
			}
		}
	
		return da.grep(elements, function( elem, i ) {
			return ( 0 <= da.isInArray( elem, qualifier ) ) === keep;
		});
	}
	

	da.extend({
		//过滤函数
		/*
			expr: 选择器表达式
			elems: 元素集合
			not: 是否取反(选择器表达式)
		*/
		filter: function( expr, elems, not ) {
			if ( not ) {							//如果需要取反，表达式包裹取反前缀
				expr = ":not(" + expr + ")";
			}
			
			return elems.length === 1 ?
				da.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
				da.find.matches(expr, elems);
		},

		dir: function( elem, dir, until ) {
			var matched = [],
				cur = elem[ dir ];

			while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !da( cur ).is( until )) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[dir];
			}
			return matched;
		},

		nth: function( cur, result, dir, elem ) {
			result = result || 1;
			var num = 0;

			for ( ; cur; cur = cur[dir] ) {
				if ( cur.nodeType === 1 && ++num === result ) {
					break;
				}
			}

			return cur;
		},

		sibling: function( n, elem ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}

			return r;
		}
	});

	da.fnStruct.extend({
		/**元素选择器过滤函数
		*/
		filter: function( selector ) {
			return this.pushStack( winnow(this.dom, selector, true), "filter", selector );
		},
		
		/**元素选择器判断函数
		*/
		is: function( selector ) {
			return !!selector && ( typeof selector === "string" ?
				daRe_POS.test( selector ) ?
					da( selector, this.context ).index( this.dom[0] ) >= 0 :
					da.filter( selector, this.dom ).length > 0 :
				this.filter( selector ).length > 0 );
		},
		
		//da类对象DOM选择器函数
		/*
			selector: 选择器字符串
		*/
		find: function( selector ) {
			var self = this, i, l;
			
			if ( typeof selector !== "string" ) {													//selector不是字符串
				return da( selector ).filter(function() {
					for ( i=0, l=self.length; i < l; i++ ) {
						if ( da.contains( self.dom[ i ], this ) ) {
							return true;
						}
					}
					
				});
			}
		
			var ret = this.pushStack( "", "find", selector ),							//selector可能是选择器字符串
					len, n, r;
		
			for ( i = 0, l = this.dom.length; i < l; i++ ) {
				len = ret.dom.length;
				da.find( selector, this.dom[i], ret.dom );
	
				if ( i > 0 ) {
					// Make sure that the results are unique
					for ( n = len; n < ret.dom.length; n++ ) {										//保证ret返回的元素集每一个子项是唯一的
						for ( r = 0; r < len; r++ ) {
							if ( ret.dom[r] === ret.dom[n] ) {
								ret.dom.splice(n--, 1);
								break;
							}
						}
					}
				}
			}
	
			return ret;
		},
		
		// Determine the position of an element within
		// the matched set of elements
		index: function( elem ) {
			// No argument, return index in parent
			if ( !elem ) {
				return ( this.dom[0] && this.dom[0].parentNode ) ? this.prevAll().length : -1;
			}

			// index in selector
			if ( typeof elem === "string" ) {
				return da.inArray( this.dom[0], da( elem ).dom );
			}

			// Locate the position of the desired element
			return da.inArray(
				// If it receives a jQuery object, the first element is used
				elem instanceof da ? elem.dom[0] : elem, this );
		}
	});

	da.each({
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return da.dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return da.dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return da.nth( elem, 2, "nextSibling" );
		},
		prev: function( elem ) {
			return da.nth( elem, 2, "previousSibling" );
		},
		nextAll: function( elem ) {
			return da.dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return da.dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return da.dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return da.dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return da.sibling( elem.parentNode.firstChild, elem );
		},
		children: function( elem ) {
			return da.sibling( elem.firstChild );
		},
		contents: function( elem ) {
			return da.isNodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				da.pushArray( elem.childNodes );
		}
	}, 
	function( name, fn ) {
		da.fnStruct[ name ] = function( until, selector ) {
			var ret = da.map( this.dom, fn, until ),
				// The variable 'args' was introduced in
				// https://github.com/jquery/jquery/commit/52a0238
				// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
				// http://code.google.com/p/v8/issues/detail?id=1050
				args = [].slice.call(arguments);
	
			if ( !daRe_until.test( name ) ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				ret = da.filter( selector, ret );
			}
	
			ret = this.length > 1 && !guaranteedUnique[ name ] ? da.unique( ret ) : ret;
	
			if ( (this.length > 1 || daRe_multiselector.test( selector )) && daRe_parentsprev.test( name ) ) {
				ret = ret.reverse();
			}
	
			return this.pushStack( ret, name, args.join(",") );
		};
	});

})(da);

/***************** 元素操作 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Elements 操作管理器 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_inlineDA = / da\d+="(?:\d+|null)"/g,
		daRe_leadingWhitespace = /^\s+/,							//匹配有前段空格的字符串
		daRe_html = /<|&#?\w+;/,
		daRe_xhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		daRe_tagName = /<([\w:]+)/,
		daRe_tbody = /<tbody/i,										//判断是否有tbody标签
		daRe_scriptType = /\/(java|ecma)script/i,					//判断是否有脚步标签
		
		daRe_nocache = /<(?:script|object|embed|option|style)/i,	//?????????
		daRe_checked = /checked\s*(?:[^=]|=\s*.checked.)/i,

		
		daWrapMap = {												//元素包裹映射表
			option: [ 1, "<select multiple='multiple'>", "</select>" ],
			legend: [ 1, "<fieldset>", "</fieldset>" ],
			thead: [ 1, "<table>", "</table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
			col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
			area: [ 1, "<map>", "</map>" ],
			_default: [ 0, "", "" ]
		};
	
	daWrapMap.optgroup = daWrapMap.option;
	daWrapMap.tbody = daWrapMap.tfoot = daWrapMap.colgroup = daWrapMap.caption = daWrapMap.thead;
	daWrapMap.th = daWrapMap.td;

	if ( !da.support.htmlSerialize ) {											//IE不能正常的串行化link和script标签元素
		daWrapMap._default = [ 1, "div<div>", "</div>" ];
	}

	
	da.fnStruct.extend({
		text: function( text ) {
			if ( da.isFunction(text) ) {
				return this.each(function(i) {
					var self = da( this );
					self.text( text.call(this, i, self.text()) );
				});
			}
	
			if ( "object" !== typeof text && undefined !== text ) {
				return this.empty().append( (this.dom[0] && this.dom[0].ownerDocument || document).createTextNode( text ) );
			}
	
			return da.text( this.dom );
		},
	
		empty: function() {
			for ( var i = 0, elem; (elem = this.dom[i]) != null; i++ ) {
				// Remove element nodes and prevent memory leaks
				if ( elem.nodeType === 1 ) {
					da.cleanData( elem.getElementsByTagName("*") );
				}
	
				// Remove any remaining nodes
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
			}
	
			return this;
		},

		append: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.appendChild( elem );
				}
			});
		},

		appendStart: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.insertBefore( elem, this.firstChild );
				}
			});
		},

		before: function() {
			if ( this.dom[0] && this.dom[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this );
				});
			} 
			else if ( arguments.length ) {
				var set = da(arguments[0]);
				set.push.apply( set, this.toArray() );
				return this.pushStack( set, "before", arguments );
			}
		},
	
		after: function() {
			if ( this.dom[0] && this.dom[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				});
			} else if ( arguments.length ) {
				var set = this.pushStack( this.dom, "after", arguments );
				set.push.apply( set, da(arguments[0]).toArray() );
				return set;
			}
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return da.clone( this.dom, dataAndEvents, deepDataAndEvents );
			});
		},
	
		html: function( value ) {
			if ( value === undefined ) {
				return this.dom[0] && this.dom[0].nodeType === 1 ?
					this.dom[0].innerHTML.replace(daRe_inlineDA, "") :
					null;
	
			// See if we can take a shortcut and just use innerHTML
			} else if ( typeof value === "string" && !daRe_nocache.test( value ) &&
				(da.support.leadingWhitespace || !daRe_leadingWhitespace.test( value )) &&
				!daWrapMap[ (daRe_tagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {
	
				value = value.replace(daRe_xhtmlTag, "<$1></$2>");
	
				try {
					for ( var i = 0, l = this.dom.length; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						if ( this.dom[i].nodeType === 1 ) {
							da.cleanData( this[i].getElementsByTagName("*") );
							this.dom[i].innerHTML = value;
						}
					}
	
				// If using innerHTML throws an exception, use the fallback method
				} 
				catch(e) {
					this.empty().append( value );
				}
	
			} else if ( da.isFunction( value ) ) {
				this.each(function(i){
					var self = da( this );
					self.html( value.call(this, i, self.html()) );
				});
	
			} else {
				this.empty().append( value );
			}
	
			return this;
		},
		
		/**移除元素 或移除某元素内部匹配子元素
		* params {String} selector 子元素匹配选择器
		* params {boolean} keepData 是否保留元素的自定义属性数据
		*/
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this.dom[i]) != null; i++ ) {
				if ( !selector || da.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						da.cleanData( elem.getElementsByTagName("*") );
						da.cleanData( [ elem ] );
					}
					
          if( da.browser.ie && elem.parentNode){
              var ownerWin = elem.ownerDocument.parentWindow;           //获取被删除对象所属窗体对象（找到相应的垃圾桶）
          
              if( !ownerWin.da.dustbin ){
              	var obj = ownerWin.document.createElement('div');
              	obj.id = "da_Dustbin";
//              	document.body.insertBefore( d );
								ownerWin.da.dustbin = obj;
              }

              ownerWin.da.dustbin.insertBefore( elem );
              ownerWin.da.dustbin.innerHTML = '';
              
          }
					else if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				}
				
			}
			return this;
		},
		
		domManip: function( args, table, callback ) {
			var results, first, fragment, parent,
				value = args[0],
				scripts = [];
	
			// We can't cloneNode fragments that contain checked, in WebKit
			if ( !da.support.checkClone && 3 === arguments.length && "string" === typeof value && daRe_checked.test( value ) ) {
				return this.each(function() {
					da(this).domManip( args, table, callback, true );
				});
			}
	
			if ( da.isFunction(value) ) {
				return this.each(function(i) {
					var self = da(this);
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip( args, table, callback );
				});
			}
	
			if ( this.dom[0] ) {
				parent = value && value.parentNode;
	
				// If we're in a fragment, just use that instead of building a new one
				if ( da.support.parentNode && parent && 11 === parent.nodeType && parent.childNodes.length === this.length ) {
					results = { fragment: parent };
	
				} else {
					results = da.buildFragment( args, this, scripts );
				}
	
				fragment = results.fragment;
	
				if ( fragment.childNodes.length === 1 ) {
					first = fragment = fragment.firstChild;
				} else {
					first = fragment.firstChild;
				}
	
				if ( first ) {
					table = table && da.isNodeName( first, "tr" );
	
					for ( var i = 0, l = this.dom.length, lastIndex = l - 1; i < l; i++ ) {
						callback.call(
							table ? root(this.dom[i], first) : this.dom[i],
							// Make sure that we do not leak memory by inadvertently discarding
							// the original fragment (which might have attached data) instead of
							// using it; in addition, use the original fragment object for the last
							// item instead of first because it can end up being emptied incorrectly
							// in certain situations (Bug #8070).
							// Fragments from the fragment cache must always be cloned and never used
							// in place.
							results.cacheable || (l > 1 && i < lastIndex) ? da.clone( fragment, true, true ) : fragment
						);
					}
				}
	
				if ( scripts.length ) {
					da.each( scripts, evalScript );
				}
			}
	
			return this;
		}
	});

	/*
	function findOrAppend( elem, tag ) {
		return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
	}

	function cloneCopyEvent( src, dest ) {

		if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
			return;
		}

		var type, i, l,
			oldData = jQuery._data( src ),
			curData = jQuery._data( dest, oldData ),
			events = oldData.events;

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}

		// make the cloned public data object a copy from the original
		if ( curData.data ) {
			curData.data = jQuery.extend( {}, curData.data );
		}
	}

	function cloneFixAttributes( src, dest ) {
		var nodeName;

		// We do not need to do anything for non-Elements
		if ( dest.nodeType !== 1 ) {
			return;
		}

		// clearAttributes removes the attributes, which we don't want,
		// but also removes the attachEvent events, which we *do* want
		if ( dest.clearAttributes ) {
			dest.clearAttributes();
		}

		// mergeAttributes, in contrast, only merges back on the
		// original attributes, not the events
		if ( dest.mergeAttributes ) {
			dest.mergeAttributes( src );
		}

		nodeName = dest.nodeName.toLowerCase();

		// IE6-8 fail to clone children inside object elements that use
		// the proprietary classid attribute value (rather than the type
		// attribute) to identify the type of content to display
		if ( nodeName === "object" ) {
			dest.outerHTML = src.outerHTML;

			// This path appears unavoidable for IE9. When cloning an object
			// element in IE9, the outerHTML strategy above is not sufficient.
			// If the src has innerHTML and the destination does not,
			// copy the src.innerHTML into the dest.innerHTML. #10324
			if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
				dest.innerHTML = src.innerHTML;
			}

		} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set
			if ( src.checked ) {
				dest.defaultChecked = dest.checked = src.checked;
			}

			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if ( dest.value !== src.value ) {
				dest.value = src.value;
			}

		// IE6-8 fails to return the selected option to the default selected
		// state when cloning options
		} else if ( nodeName === "option" ) {
			dest.selected = src.defaultSelected;

		// IE6-8 fails to set the defaultValue to the correct value when
		// cloning other types of input fields
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;

		// IE blanks contents when cloning scripts
		} else if ( nodeName === "script" && dest.text !== src.text ) {
			dest.text = src.text;
		}

		// Event data gets referenced instead of copied if the expando
		// gets copied too
		dest.removeAttribute( jQuery.expando );

		// Clear flags for bubbling special change/submit events, they must
		// be reattached when the newly cloned events are first activated
		dest.removeAttribute( "_submit_attached" );
		dest.removeAttribute( "_change_attached" );
	}
	*/
	
	//文档片段缓存区
	da.fragments = {};
	
	//构建、缓存文档代码片段函数
	/*
		args: 参数列表
		nodes: 元素片段
		scripts: 脚本片段
	*/
	da.buildFragment = function( args, nodes, scripts ) {
		var fragment, cacheAble, cacheResults,
			docTmp = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : doc);
	
		if ( args.length === 1 
		&& typeof args[0] === "string" 
		&& args[0].length < 512 																							//只缓存0.5KB 的HTML代码片段
		&& docTmp === doc 																										//只缓存与当前Document相关的HTML代码片段
		&& args[0].charAt(0) === "<" 
		&& !daRe_nocache.test( args[0] ) 																			//IE6 不能正确的克隆文档片段中option元素的selected选中状态属性，object和embed也会出问题，所以不缓存了。
		&& (da.support.checkClone || !daRe_checked.test( args[0] )) ) {				//WebKit浏览器在文档片段中，克隆元素时，不能正确的复制checked状态属性，所以不缓存了。
			cacheAble = true;
	
			cacheResults = da.fragments[ args[0] ];															//查找文档片段缓存区，返回缓存
			if ( cacheResults && cacheResults !== 1 ) {
				fragment = cacheResults;
			}
		}
	
		if ( !fragment ) {																										//没有缓存过文档片段，就生产文档片段
			fragment = docTmp.createDocumentFragment();
			da.clean( args, docTmp, fragment, scripts );												//生产出来的文档片段需要通过da.clean()函数修正清理一下
		}
	
		if ( cacheAble ) {																									  //对文档片段缓存set操作
			da.fragments[ args[0] ] = cacheResults ? fragment : 1;
		}
	
		return { fragment: fragment, cacheAble: cacheAble };									//返回文档片段
	};

	//扩展部分添加、插入等特殊功能的DOM对象操作函数
	da.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		da.fnStruct[ name ] = function( selector ) {
			var ret = [],
				insert = da( selector ),
				parent = this.dom.length === 1 && this.dom[0].parentNode;
	
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.dom.length === 1 ) {
				insert[ original ]( this.dom[0] );
				return this;
	
			} 
			else {
				for ( var i = 0, l = insert.dom.length; i < l; i++ ) {
					var elems = (i > 0 ? this.clone(true) : this).get();
					da( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
	
				return this.pushStack( ret, name, insert.selector );
			}
		};
	});


	function getAll( elem ) {
		if ( "getElementsByTagName" in elem ) {
			return elem.getElementsByTagName( "*" );
		
		} else if ( "querySelectorAll" in elem ) {
			return elem.querySelectorAll( "*" );
	
		} else {
			return [];
		}
	}
	
	//修正checkbox和redio的defaultChecked属性函数
	/*
		elem: 需要修正的元素对象
	*/
	function fixDefaultChecked( elem ) {
		if ( elem.type === "checkbox" || elem.type === "radio" ) {						//判断是否是checkbox或redio控件
			elem.defaultChecked = elem.checked;
		}
	}
	
	//找到所有input元素然后传给fixDefaultChecked()函数处理
	/*
		elem: 查找范围元素对象
	*/
	function findInputs( elem ) {
		if ( da.isNodeName( elem, "input" ) ) {																//如果查找范围元素本身是input,就直接掉用fixDefaultChecked()函数处理
			fixDefaultChecked( elem );
		} 
		else if ( elem.getElementsByTagName ) {																//如果可能有多个input元素，就将fixDefaultChecked()函数作为验证回调处理函数，通过da.grep()函数来批处理。
			da.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
		}
		
	}
	
	//元素克隆和清理函数集合
	da.extend({
		//克隆元素函数
		/*
			elem: 元素对象
			dataAndEvents: 元素对应数据和事件
			deepDataAndEvents: 深度元素数据和事件
		*/
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var clone = elem.cloneNode(true),
					srcElements,
					destElements,
					i;
	
			if ( (!da.support.noCloneEvent || !da.support.noCloneChecked) &&
					(elem.nodeType === 1 || elem.nodeType === 11) && !da.isXMLDoc(elem) ) {
				// IE copies events bound via attachEvent when using cloneNode.
				// Calling detachEvent on the clone will also remove the events
				// from the original. In order to get around this, we use some
				// proprietary methods to clear the events. Thanks to MooTools
				// guys for this hotness.
	
				cloneFixAttributes( elem, clone );
	
				// Using Sizzle here is crazy slow, so we use getElementsByTagName
				// instead
				srcElements = getAll( elem );
				destElements = getAll( clone );
	
				// Weird iteration because IE will replace the length property
				// with an element if you are cloning the body and one of the
				// elements on the page has a name or id of "length"
				for ( i = 0; srcElements[i]; ++i ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				cloneCopyEvent( elem, clone );
	
				if ( deepDataAndEvents ) {
					srcElements = getAll( elem );
					destElements = getAll( clone );
	
					for ( i = 0; srcElements[i]; ++i ) {
						cloneCopyEvent( srcElements[i], destElements[i] );
					}
				}
			}
	
			// Return the cloned set
			return clone;
		},
		
		//修整清理文档片段函数
		/*
			elems： 元素对象集合
			context: 上下文
			fragment: 文档片段
			scripts: 脚本片段
		*/
		clean: function( elems, context, fragment, scripts ) {
			var checkScriptType;
	
			context = context || doc;
	
			// !context.createElement fails in IE with an error but returns typeof 'object'
			if ( "undefined" === typeof context.createElement ) {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || doc;
			}
	
			var ret = [];
	
			for ( var i = 0, elem; null != (elem = elems[i]); i++ ) {
				if ( typeof elem === "number" ) {
					elem += "";
				}
	
				if ( !elem ) {
					continue;
				}
	
				if ( "string" === typeof elem ) {											//将HTML代码片段写入元素节点对象中，进行转换
					if ( !daRe_html.test( elem ) ) {										//匹配判断是否有元素标签符号，如果没有就创建为文本标签
						elem = context.createTextNode( elem );
					} 
					else {																							//需要创建元素节点
						elem = elem.replace( daRe_xhtmlTag, "<$1></$2>" );											//让所有浏览器兼容"XHTML"的style标签
	
						// Trim whitespace, otherwise indexOf won't work as expected
						var tag = ( daRe_tagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
								wrap = daWrapMap[ tag ] || daWrapMap._default,											//如果文档片段元素对象需要包裹
								depth = wrap[0],
								div = context.createElement("div");
	
						div.innerHTML = wrap[1] + elem + wrap[2];					// Go to html and back, then peel off extra wrappers
	
						while ( depth-- ) {																//通过包裹层数，找到生产的元素对象
							div = div.lastChild;
						}
	
						if ( da.support.tbody ) {													//如果是IE浏览器，还要删除自动插入的tBody标签元素
							var hasBody = daRe_tbody.test(elem),
									tbody = ( "table" === tag && !hasBody ) ? 
									( div.firstChild && div.firstChild.childNodes ) : ( "<table>" === wrap[1] && !hasBody ) ?											// String was a bare <thead> or <tfoot>
									div.childNodes : [];
	
							for ( var j = tbody.length -1; j >= 0; --j ) {
								if ( da.isNodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
									tbody[ j ].parentNode.removeChild( tbody[ j ] );
								}
							}
							
						}
	
						if ( !da.support.leadingWhitespace 								//IE在执行innerHTML时将去除HTML代码前部的所有空格
						&& daRe_leadingWhitespace.test( elem ) ) {													
							div.insertBefore( context.createTextNode( daRe_leadingWhitespace.exec( elem )[0] ), div.firstChild );
						}
	
						elem = div.childNodes;
					}
					
				}
				
				//如果是IE6/7，在生产文档对象片段中redio和checkbox之前，需要修正一下defaultChecked属性
				var len;
				if ( !da.support.appendChecked ) {
					if ( elem[0] && "number" === typeof (len = elem.length) ) {
						for ( i = 0; i < len; i++ ) {
							findInputs( elem[i] );
						}
					}
					else {
						findInputs( elem );
					}
				}
				
				if ( elem.nodeType ) {								//单个元素
					ret.push( elem );
				}
				else {																//多个元素的数组，可以通过da.merge()函数合并到ret数组中
					ret = da.merge( ret, elem );			
				}
				
			}
	
			if ( fragment ) {
				checkScriptType = function( elem ) {														//临时函数，验证元素 是否是脚本元素类型 处理函数
					return !elem.type || daRe_scriptType.test( elem.type );
				};
				
				for ( var i=0; ret[i]; i++ ) {
					if ( scripts 																																							//如果用户有传入脚本缓存区
					&& da.isNodeName( ret[i], "script" ) 																											//并且 文档片段中有脚步元素
					&& (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {									//并且 脚本元素必须为js类型
						scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );		//将脚本片段压入脚本缓存区
	
					}
					else {																																										//如果没有脚本缓存区 就通过打标志的方式区分吧
						if ( ret[i].nodeType === 1 ) {
							var jsTags = da.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );
	
							ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
							
						}
						fragment.appendChild( ret[i] );
					}
					
				}
				
			}
	
			return ret;
		},
	
		//清理元素数据函数
		/*
			elems: 元素对象集合
		*/
		cleanData: function( elems ) {
			var data, id, cache = da.cache,
					internalKey = da.expando, 
					special = da.event.special,
					deleteExpando = da.support.deleteExpando;
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( elem.nodeName && da.noData[elem.nodeName.toLowerCase()] ) continue;
	
				id = elem[ da.expando ];
	
				if ( id ) {
//					data = cache[ id ] && cache[ id ][ internalKey ];					//internalKey 用于内部使用标记，暂时不加入该保障机制吧（涉及相关代码太多）。
					data = cache[ id ];
					
					if ( data && data.events ) {
						for ( var type in data.events ) {
							if ( special[ type ] ) {
								da.event.remove( elem, type );
	
							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								da.removeEvent( elem, type, data.handle );
							}
						}
	
						// Null the DOM reference to avoid IE6/7/8 leak (#7054)
						if ( data.handle ) {
							data.handle.elem = null;
						}
					}
	
					if ( deleteExpando ) {
						delete elem[ da.expando ];
	
					} else if ( elem.removeAttribute ) {
						elem.removeAttribute( da.expando );
					}
	
					delete cache[ id ];
				}
			}
			
		}
		
		
	});
	
	
})(da);
	
/***************** CSS *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素样式管理器
	version: 1.0.0
*/
(function(da){

	//CSS公用源码正则表达式
	var	daRe_exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		daRe_alpha = /alpha\([^)]*\)/,
		daRe_opacity = /opacity=([^)]*)/,
		daRe_float = /float/i,
		daRe_upper = /([A-Z])/g,
		daRe_numpx = /^-?\d+(?:px)?$/i,
		daRe_num = /^-?\d/;
	
	//DOM对象 样式属性 操作函数扩展
	da.fnStruct.extend({
		//节点样式属性 操作函数
		/*
			name: style样式属性名
			value: style样式属性值
		*/
		css: function(name, value ) {
			return da.access( this, function( elem, name, value ) {
				return value !== undefined ?
					da.style( elem, name, value ) :			//set操作
					da.css( elem, name );					//get操作
					
			}, name, value, arguments.length > 1 );
			
		}
	});
	
	da.extend({
		/**非px为单位的属性对照表
		*/
		cssNumber: {
			"zIndex": true,
			"fontWeight": true,
			"opacity": true,
			"zoom": true,
			"lineHeight": true,
			"widows": true,
			"orphans": true
		},
		
		//节点最高优先级样式属性 操作函数
		/*
			obj: DOM节点对象
			name: style样式属性名
		*/
		curCSS: function( obj, name ) {
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
			if ( style && style[ name ] ) {
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
				var camelCase = da.camelCase(name);						//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
	
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
			extra: 包含,如:margin, padding, border
		*/
		css: function( obj, name, extra ) {
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
							val -= parseFloat(da.curCSS( obj, "padding"+ which[s])) || 0;
						}
	
						if ( extra === "margin" ) {
							val += parseFloat(da.curCSS( obj, "margin"+ which[s])) || 0;
						}
						else {
							val -= parseFloat(da.curCSS( obj, "border"+ which[s] + "Width")) || 0;
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
	
			return da.curCSS( obj, name );
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
			name = da.camelCase(name);																		//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
	
			if ( set )	style[ name ] = value;			//如果是赋值操作，就给相应样式属性赋值

			return style[ name ];
		}
			
	});
	
})(da);

/***************** Ajax ***********************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Ajax异步请求管理机制 核心代码
	version: 1.0.0
*/
(function(da){
	var jsc = da.nowId(),
			daRe_noContent = /^(?:GET|HEAD)$/,
			daRe_hash = /#.*$/,
			daRe_jsre = /\=\?(&|$)/,
			daRe_ts = /([?&])_=[^&]*/,
			daRe_query = /\?/,
			daRe_url = /^(\w+:)?\/\/([^\/?#]+)/,
			daRe_20 = /%20/g,
			daRe_bracket = /\[\]$/;

	// Attach a bunch of functions for handling common AJAX events
	//扩展出ajax全局函数
	da.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), 
	function( i, v ) {
		da.fnStruct[v] = function( f ) {
			return this.bind( v, f );
		};
	});
	
	da.extend({
		get: function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( da.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = null;
			}
	
			return da.ajax({
				type: "GET",
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		},
	
		getScript: function( url, callback ) {
			return da.get(url, null, callback, "script");
		},
	
		getJSON: function( url, data, callback ) {
			return da.get(url, data, callback, "json");
		},
	
		post: function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( da.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = {};
			}
	
			return da.ajax({
				type: "POST",
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		},
		
		//将request请求的表单元素数组或键值对参数集，串行化为一个查询字符串
		/*
			a: 表单元素数组或键值对参数集
			traditional: 是否用传统的方式来序列化数据
		*/
		param: function( a, traditional ) {
			var s = [],
					add = function( key, value ) {
						value = da.isFunction(value) ? value() : value;																//如果参数值是函数类型，就调用函数，再获得返回值
						s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);		//将参数名和参数值都编码后压入临时数组
					};
			
			if ( traditional === undefined ) {						//老版本traditional为true
				traditional = da.ajaxSettings.traditional;
			}
			
			//if ( da.isArray(a) || a.jquery ) {
			if ( da.isArray(a) ) {												//如果传入的a是数组类型，就先假定它是表单DOM对象元素集,将元素的name和value,分别映射到key和value
				da.each( a, function() {										//串行化表单元素数组
					add( this.name, this.value );
				});
				
			} 
			else {																				//如果传入的a是键值对参数集
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for ( var prefix in a ) {
					buildParams( prefix, a[prefix], traditional, add );				//针对键值对，可能是多级，专门写一个buildParams()函数来串行化
				}
			}
			
			return s.join("&").replace(daRe_20, "+");					//用&符号分隔,串接临时数组，并把空格(" ")经过encodeURIComponent()函数编码后的字符"%20"替换为"+"号
		},
		
		ajaxSetup: function( settings ) {								//ajax全局配置
			da.extend( da.ajaxSettings, settings );
		},
	
		ajaxSettings: {	
			url: location.href,																		//请求地址
			global: true,
			type: "GET",																					//请求模式
			contentType: "application/x-www-form-urlencoded",			//发送信息至服务器时内容编码类型。默认值适合大多数情况。
			processData: true,																		//是否允许传入数据值
			async: true,																					//是否异步
			/*
			timeout: 0,
			data: null,
			username: null,
			password: null,
			traditional: false,
			*/
			// This function can be overriden by calling jQuery.ajaxSetup
			xhr: function() {
				return new window.XMLHttpRequest();
			},
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				script: "application/javascript, text/javascript",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},
	
		//异步数据访问
		/*
			origSettings: 参数集
			{属性名: 可选值 = 
				[type: "GET"/"POST"/"PUT"/"DELETE" = "GET"],
				[url: "" = location.href],
			}
		*/
		ajax: function( origSettings ) {
			var s = da.extend( true, {}, da.ajaxSettings, origSettings ),					//将ajaxSettings和origSettings对象合并后放入s局部变量
				jsonp, 																							//jsonp临时对象
				status, 																						//request请求对象状态
				data, 																							//服务器回传数据缓存
				type = s.type.toUpperCase(), 												//请求方式属性 "POST" 或 "GET"( 默认为 "GET" )
				noContent = daRe_noContent.test( type );
	
			s.url = s.url.replace( daRe_hash, "" );								//去掉url锚点参数“#……”
			s.context = ( origSettings && origSettings.context != null ) ? 
									origSettings.context : s;																	//ajax相关回调函数(success,error,complate)的上下文,如果用户提供了上下文,就用提供的。( 默认this就指向调用本次ajax请求时传递的options参数 )
	
			if ( s.data && s.processData && ( "string" !== typeof s.data ) ) {		//如果有传入数据data属性有值，而且需要处理传入数据processData( 默认为true )，并且data不是以字符串的形式传入，将对象转为查询字符串
				s.data = da.param( s.data, s.traditional );
			}
	
			//************ 以jsonp方式注册回调函数处理 begin ******************/
			if ( s.dataType === "jsonp" ) {												//构建jsonp参数集
				if ( type === "GET" ) {															//如果是get模式
					if ( !daRe_jsre.test( s.url ) ) {									//保证get模式下的url地址中有 callback=? 在之后的代码会加上回调函数名
						s.url += (rquery.test( s.url ) ? "&" : "?") 
											+ (s.jsonp || "callback") 
											+ "=?";
					}
				}
				else if ( !s.data || !daRe_jsre.test(s.data) ) {		//如果不是get模式,并且连data属性中也没有 callback=? 就加入该参数模型
					s.data = (s.data ? s.data+"&" : "") 
										+ (s.jsonp || "callback") 
										+ "=?";
				}
				s.dataType = "json";																//因为jsonp是json格式的扩展
			}
	
			if ( s.dataType === "json" && (s.data && daRe_jsre.test(s.data) || daRe_jsre.test(s.url)) ) {			//如果数据格式是json并且符合拥有 callback=? 参数模型的条件,就对其构建json临时函数
				jsonp = s.jsonpCallback || ("jsonp" + jsc++);				//如果没有传入参数 就用默认jsonp+唯一ID 的格式
	
				if ( s.data ) {
					s.data = (s.data + "").replace( daRe_jsre, "=" + jsonp + "$1" );	//替换传入参数data属性中 callback=?的参数模型,$1为特殊识别后缀
				}
		
				s.url = s.url.replace( daRe_jsre, "=" + jsonp + "$1" );							//替换url属性中 callback=?的参数模型,$1为特殊识别后缀
	
				s.dataType = "script";															//保证这个jsonp的格式是script,这样才能保证服务器返回代码被正确执行
	
				var customJsonp = window[ jsonp ];									//避免jsonp函数重载
				
				window[ jsonp ] = function( tmp ) {									//在当前页面注册一个jsonp回调函数,在之后的ajax服务器请求后返回执行它
						if ( da.isFunction( customJsonp ) ) {						//如果客户端同名成员 也是一个函数，就先执行客户端同名函数
							customJsonp( tmp );
		
						}
						else {																					//资源回收当前jsonp回调函数
							window[ jsonp ] = undefined;
							try {
								delete window[ jsonp ];
							} catch( jsonpError ) {};
							
						}
		
						data = tmp;																			//服务器回传参数数据缓存
						da.handleSuccess( s, xhr, status, data );				//触发Success回调函数
						da.handleComplete( s, xhr, status, data );			//触发Complete回调函数
						
						if ( head ) {
							head.removeChild( script );										//去除head中加入的script元素
						}
						
				};
			}
			//************ 以jsonp方式注册回调函数处理 end ******************/
	
	
			//************ 以scriptTag方式执行回调函数 begin ******************/
			if ( s.dataType === "script" && s.cache === null ) {
				s.cache = false;
			}
	
			if ( s.cache === false && noContent ) {								//cache: false加上时间戳
				var ts = da.nowId();
	
				var ret = s.url.replace( daRe_ts, "$1_=" + ts );		//将“_=”替换“$1_=时间戳”
				s.url = ret + ((ret === s.url) ? ( (daRe_query.test(s.url) ? "&" : "?") + "_=" + ts ) : "");		//如果没哟替换到东西，就在后面追加时间戳
				
			}
	
			if ( s.data && noContent ) {													//对于GET|HEAD类型请求，并且data属性有效，将data请求参数添加到url参数列表中
				s.url += ( daRe_query.test(s.url) ? "&" : "?" ) + s.data;
			}
	
			if ( s.global && da.active++ === 0 ) {								//需要调用ajax全局函数ajaxStart(默认为true)，并且如果da.active 为 0，开启一个新的请求监听
					da.event.trigger( "ajaxStart" );
			}
	
			var parts = daRe_url.exec( s.url ),										//监听绝对url地址,并且保存domain
					remote = parts && (parts[1] && parts[1].toLowerCase() !== location.protocol || parts[2].toLowerCase() !== location.host);		//location是当前window的属性，与url地址比较，判断是否远程跨域
	
			if ( s.dataType === "script" && type === "GET" && remote ) {						//如果请求的是一个都远程跨域的文档，并且尝试加载get模式下的json或script
				var head = document.getElementsByTagName("head")[0] || document.documentElement;
				var script = document.createElement("script");
				if ( s.scriptCharset ) {														//scriptCharset脚本编码
					script.charset = s.scriptCharset;
				}
				script.src = s.url;																	//js文件地址源
	
				if ( !jsonp ) {																			//如果不是jsonp加载script,通过script元素的onload和onreadystatechange事件来触发回调函数
					var done = false;
	
					script.onload = script.onreadystatechange = function() {
							if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
									done = true;
									da.handleSuccess( s, xhr, status, data );							//触发Success回调函数
									da.handleComplete( s, xhr, status, data );						//触发Complete回调函数
			
									script.onload = script.onreadystatechange = null;			//资源回收当前jsonp回调函数
									if ( head && script.parentNode ) {
											head.removeChild( script );
									}
							}
					};
					
				}
	
				head.insertBefore( script, head.firstChild );								//用insertBefore，而不用appendChild主要是针对 IE6的bug.
	
				return undefined;				//已经使用了script元素注册来处理
			}
			//************ 以scriptTag方式执行回调函数 end ******************/
	
			var requestDone = false;	//request请求状态
			var xhr = s.xhr();				//创建一个XMLHttpRequest对象
			if ( !xhr ) return;
	
			if ( s.username ) {																						//创建一个请求连接，在Opera浏览器中username为null将会弹出登录界面，所以要传入username和password
				xhr.open(type, s.url, s.async, s.username, s.password);
			}
			else {
				xhr.open(type, s.url, s.async);
				
			}
	
			try {											//防止firefox在跨域请求的时候报错所以套上try、catch
				if ( ( s.data != null && !noContent ) 
						|| ( origSettings && origSettings.contentType ) ) {			//如果content-type有特定的参数，就设置content-type
					xhr.setRequestHeader("Content-Type", s.contentType);			//contentType(默认: "application/x-www-form-urlencoded") 发送信息至服务器时内容编码类型。默认值适合大多数情况。
				}
	
				if ( s.ifModified ) {																				//ifModified(默认: false) 仅在服务器数据改变时获取新数据。使用 HTTP 包 Last-Modified 头信息判断。他也会检查服务器指定的'etag'来确定数据没有被修改过。
					if ( da.lastModified[s.url] ) {
						xhr.setRequestHeader("If-Modified-Since", da.lastModified[s.url]);
					}
	
					if ( da.etag[s.url] ) {
						xhr.setRequestHeader("If-None-Match", da.etag[s.url]);
					}
				}
	
				if ( !remote ) {																						
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");						//设置request头，让服务器知道这是一个XMLHttpRequest，这不是一个跨域访问的xhr，那么将只会发送这个头信息
				}
	
				xhr.setRequestHeader("Accept", ( s.dataType && s.accepts[ s.dataType ] ) ? 
																					( s.accepts[ s.dataType ] + ", */*; q=0.01" ) : s.accepts._default );			//根据dataType属性值，设置accepts头，传递给服务器这个能接收的content-type类型(默认为所有类型*/*)
				
			} catch( headerError ) {}
	
			if ( s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false ) {		//beforeSend()拦截函数，这可以在发送reqest请求之前调用判断，如果beforeSend()函数返回值为false，那么这个reqest请求将被中断
				if ( s.global && da.active-- === 1 ) {					//该reqest请求被中止掉，计数器 -1
					da.event.trigger( "ajaxStop" );
				}
	
				xhr.abort();																		//中止request连接
				return false;
			}
			
			if ( s.global ) {																	//触发ajax全局函数ajaxSend
				da.triggerGlobal( s, "ajaxSend", [xhr, s] );
			}

			//readyState状态说明
			//
			//(0)未初始化
			//			此阶段确认XMLHttpRequest对象是否创建，并为调用open()方法进行未初始化作好准备。值为0表示对象已经存在，否则浏览器会报错－－对象不存在。
			//(1)载入
			//			此阶段对XMLHttpRequest对象进行初始化，即调用open()方法，根据参数(method,url,true)完成对象状态的设置。并调用send()方法开始向服务端发送请求。值为1表示正在向服务端发送请求。
			//(2)载入完成
			//			此阶段接收服务器端的响应数据。但获得的还只是服务端响应的原始数据，并不能直接在客户端使用。值为2表示已经接收完全部响应数据。并为下一阶段对数据解析作好准备。
			//(3)交互
			//			此阶段解析接收到的服务器端响应数据。即根据服务器端响应头部返回的MIME类型把数据转换成能通过responseBody、responseText或responseXML属性存取的格式，为在客户端调用作好准备。状态3表示正在解析数据。
			//(4)完成
			//			此阶段确认全部数据都已经解析为客户端可用的格式，解析已经完成。值为4表示数据解析完毕，可以通过XMLHttpRequest对象的相应属性取得数据。
			//概而括之，整个XMLHttpRequest对象的生命周期应该包含如下阶段：
			//创建－初始化请求－发送请求－接收数据－解析数据－完成
			var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {					//监听response返回，定义一个onreadystatechange函数对象，主要为后面回调用
						if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {							//请求被中止
								if ( !requestDone ) {																										//Opera浏览器xhr中止了不会调用onreadystatechange,所以模拟调用一下
									da.handleComplete( s, xhr, status, data );
								}
				
								requestDone = true;
								if ( xhr ) {
									xhr.onreadystatechange = da.noop;			//改变状态, 置空消息函数
								}
			
						}
						else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {					//这个请求传递完成并且数据有效 或者请求超时了
								requestDone = true;
								xhr.onreadystatechange = da.noop;
				
								status = ( isTimeout === "timeout" ) ? "timeout" : 
																					!da.httpSuccess( xhr ) ? "error" : 
																					s.ifModified && da.httpNotModified( xhr, s.url ) ? "notmodified" : "success";
				
								var errMsg;
				
								if ( status === "success" ) {
									try {																					//捕获XML document解析异常
										data = da.httpData( xhr, s.dataType, s );		//解析从服务器获得的数据 process the data (runs the xml through httpData regardless of callback)
									} catch( parserError ) {
										status = "parsererror:处理返回HTTP数据时异常。";
										errMsg = parserError;												//将捕获的exception对象赋值给errMsg缓存
									}
								}
				
								if ( status === "success" || status === "notmodified" ) {			//如果request状态为"未修改"或"成功",即非"超时"和"错误"
									if ( !jsonp ) {																//非jsonp才执行Success回调函数，因为jsonp操作已有注册的回调函数
										da.handleSuccess( s, xhr, status, data );
									}
								}
								else {																												//如果request状态为"超时"和"错误"
									da.handleError( s, xhr, status, errMsg );			//执行Error回调函数
								}
				
								if ( !jsonp ) {																	//非jsonp模式下最后触发Complete函数
									da.handleComplete( s, xhr, status, data );
								}
				
								if ( isTimeout === "timeout" ) {								//如果request请求为超时，就将xhr中止
									xhr.abort();
								}
				
								if ( s.async ) {																//如果为异步，将xhr置空
									xhr = null;
								}
						}
			};
	
			try {														//重载中止函数，Opera浏览器在request中止的时不会触发onreadystatechange函数
				var oldAbort = xhr.abort;
				xhr.abort = function() {
					if ( xhr ) {
						Function.prototype.call.call( oldAbort, xhr );		//因为在IE7中oldAbort函数不存在call属性，无法通过oldAbort.call()方式调用，所以只有借助Function.prototype.call()原型函数来调用
					}
					onreadystatechange( "abort" );											//回调上面定义的监听函数
					
				};
			} catch( abortError ) {}
	
			if ( s.async && s.timeout > 0 ) {				//异步请求，并且有超时属性值传入，就通过setTimeout()函数来启动一个定时器
				setTimeout(function() {
					if ( xhr && !requestDone ) {				//核对如果request请求任然未完成，就回调触发超时事件
						onreadystatechange( "timeout" );
					}
				}, s.timeout);
				
			}
	
			try {																		//发送request数据
				xhr.send( noContent || s.data == null ? null : s.data );
	
			} 
			catch( sendError ) {										//发送数据式发生异常，就触发Error函数和Complete函数
				da.handleError( s, xhr, null, sendError );
				da.handleComplete( s, xhr, status, data );
			}
	
			if ( !s.async ) {												//对于同步请求 firefox1.5浏览器不能触发onreadystatechange函数，需要干预触发
				onreadystatechange();
			}
	
			return xhr;								//返回xhr对象，以便于允许中止request请求或其他操作
		}
	
	});

	//串行化键值对多级型参数集
	/*
		prefix:	键值对的键key
		obj:	键值对的值value(可能也是键值对对象或数组，多级)
		traditional:	是否用老的方式串行化
		add: 串行化后字符串加入临时数组回调操作函数
	*/
	function buildParams( prefix, obj, traditional, add ) {
		if ( da.isArray(obj) && obj.length ) {																	//如果子项为数组类型
			da.each( obj, function( i, v ) {
				if ( traditional || daRe_bracket.test( prefix ) ) {
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} 
				else {
					// If array item is non-scalar (array or object), encode its
					// numeric index to resolve deserialization ambiguity issues.
					// Note that rack (as of 1.0.0) can't currently deserialize
					// nested arrays properly, and attempting to do so may cause
					// a server error. Possible fixes are to modify rack's
					// deserialization algorithm or to provide an option or flag
					// to force array serialization to be shallow.
					buildParams( prefix + "[" + ( typeof v === "object" || da.isArray(v) ? i : "" ) + "]", v, traditional, add );
				}
			});
				
		}
		else if ( !traditional && obj != null && typeof obj === "object" ) {		//如果子项为键值对类型
			if ( da.isEmptyObj( obj ) ) {
				add( prefix, "" );
			} 
			else {
				da.each( obj, function( k, v ) {
					buildParams( prefix + "[" + k + "]", v, traditional, add );
				});
			}
						
		}
		else {																																	//没有子项了
			add( prefix, obj );
		}
	}
	
	// This is still on the jQuery object... for now
	// Want to move this to jQuery.ajax some day
	da.extend({
		active: 0,											//异步请求计数器
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		handleError: function( s, xhr, status, e ) {
			if ( s.error ) {																			//如果有error回调函数,`需要触发error回调函数
				s.error.call( s.context, xhr, status, e );
			}

			if ( s.global ) {																			//如果有ajaxError回调函数,`需要触发ajaxError回调函数
				da.triggerGlobal( s, "ajaxError", [xhr, s, e] );
			}
		},
	
		handleSuccess: function( s, xhr, status, data ) {
			if ( s.success ) {																		//如果有success回调函数,`需要触发success回调函数
				s.success.call( s.context, data, status, xhr );
			}
	
			if ( s.global ) {																			//需要触发ajax全局的ajaxSuccess回调函数,默认为true
				da.triggerGlobal( s, "ajaxSuccess", [xhr, s] );
			}
		},
	
		handleComplete: function( s, xhr, status ) {
			if ( s.complete ) {																		//如果有complete回调函数,`需要触发complete回调函数
				s.complete.call( s.context, xhr, status );
			}
	
			if ( s.global ) {																			//需要触发ajax全局的ajaxComplete回调函数,默认为true
				da.triggerGlobal( s, "ajaxComplete", [xhr, s] );
			}
	
			if ( s.global && da.active-- === 1 ) {								//当异步请求计数器为 1 时触发ajax全局的ajaxStop回调函数,默认为true
				da.event.trigger( "ajaxStop" );
			}
		},
			
		triggerGlobal: function( s, type, args ) {							//?????
			(s.context && s.context.url == null ? da(s.context) : da.event).trigger(type, args);
		},
	
		// Determines if an XMLHttpRequest was successful or not
		httpSuccess: function( xhr ) {
			try {
				// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
				return !xhr.status && location.protocol === "file:" || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 1223;
				
			} catch(e) {}
	
			return false;
		},
	
		// Determines if an XMLHttpRequest returns NotModified
		httpNotModified: function( xhr, url ) {
			var lastModified = xhr.getResponseHeader("Last-Modified"),
					etag = xhr.getResponseHeader("Etag");
	
			if ( lastModified ) {
				da.lastModified[ url ] = lastModified;
			}

			if ( etag ) {
				da.etag[url] = etag;
			}
	
			return xhr.status === 304;
		},
		
		httpData: function( xhr, type, s ) {
			var ct = xhr.getResponseHeader("content-type") || "",
					xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
					data = xml ? xhr.responseXML : xhr.responseText;
	
			if ( xml && data.documentElement.nodeName === "parsererror" ) {
				da.error( "parsererror" );
			}
	
			// Allow a pre-filtering function to sanitize the response
			// s is checked to keep backwards compatibility
			if ( s && s.dataFilter ) {
				data = s.dataFilter( data, type );
			}
	
			// The filter can actually parse the response
			if ( typeof data === "string" ) {
				// Get the JavaScript object, if JSON is used.
				if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
					data = da.parseJSON( data );
	
				// If the type is "script", eval it in global context
				} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
					da.globalEval( data );
				}
			}
	
			return data;
		}
	
	});
	
	/*
	 * Create the request object; Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	if ( window.ActiveXObject ) {
		da.ajaxSettings.xhr = function() {
			if ( window.location.protocol !== "file:" ) {
				try {
					return new window.XMLHttpRequest();
				} catch(xhrError) {}
			}

			try {
				return new window.ActiveXObject("Microsoft.XMLHTTP");
			} catch(activeError) {}
		};
	}

	// Does this browser support XHR requests?
	da.support.ajax = !!da.ajaxSettings.xhr();
	
})(da);
	
/***************** Offset *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素位置管理器
	version: 1.0.0
*/
(function(da){
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
										 "</table>"].join("");
	
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
			
			da.offset.initialize = da.noop;							//回收资源，避免内存泄露，初始化操作只一次
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
					offsetParent = this.posInParent(),
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

})(da);

/***************** Size *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素尺寸大小管理器
	version: 1.0.0
*/
(function(da){
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
	
})(da);

/***************** Timer *******************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 全局计时器
	version: 1.0.0
*/
(function(da){
	da.extend({
		queueHandle: [],
		timer_queueHandle: null,
		
		startHandle: function(){
			var context = this;
			
			da.timer_queueHandle = setInterval(function(){
				if( 0 >= da.queueHandle.length ) da.stopHandle();
				
				var timeNow = new Date().getTime(),
					item;
				
				for(var i=0,len=da.queueHandle.length; i<len; i++){			//循环timer队列
					item = da.queueHandle[i];

					if( item && item.delay <= (timeNow - item.prevTime ) ){
						item.handle.apply( context, item.params );
						
						if( "timer" === item.type ){
							da.queueHandle.splice(i, 1);
						}
						else if( "keep" === item.type ){
							item.prevTime = new Date().getTime();
						}
					}
				}
			});
		},
		
		stopHandle: function(){
			da.queueHandle = [];
			if( da.timer_queueHandle ) clearInterval( da.timer_queueHandle );
		},
		
		/**启动闭包封装的setInterval 或 setTimeout（可以通过call的嵌入this上下文，this默认为da类 ）
		* delay 执行延时( 默认启动setTimeout，添加“_loop”后缀启动setInterval )
		* fn 自定义回调函数
		* params 回调传入参数
		*/
		timer: function( /*delay, fn, params*/ ){
			if( 2 > arguments.length ) return;
			if( !da.isFunction( arguments[1] ) ) return;
			
			var arrTmp = arguments[0].toString().split("_");
			
			var item = {
				type: (arrTmp[1] && "loop" == arrTmp[1]) ? "keep" : "timer",		//类型
				delay: parseInt(arrTmp[0],10) || 13,								//周期
				prevTime: new Date().getTime(),										//上一次执行时间
				handle: arguments[1],												//自定义处理函数
				params: [].slice.call( arguments, 2 )								//剔除前两个个参数
			};

			da.queueHandle.push( item );
			da.startHandle();
			
			return da.queueHandle.length -1;
		},
		
		/**启动闭包封装的setInterval（可以通过call的嵌入this上下文，this默认为da类 ）
		* delay 执行延时
		* fn	自定义回调函数s
		* params 回调传入参数
		*/
		keep: function( /*delay, fn, params*/ ){
			arguments[0] += "_loop";
			return da.timer.apply( this, arguments );
		},
		
		clearTimer: function( idx ){
			da.queueHandle.splice(idx, 1);
		},

		clearKeep: function( idx ){
			da.queueHandle.splice(idx, 1);
		}

	});
	

})(da);

/***************** 加密解密 *************************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 加密解密、编码解码
	version: 1.0.0
*/
(function(da){
	//密钥
	var codeKey = "1Q2AqzWaYxZdXswcf3SgvpC45EKbehDVoj6Tn7LBk8OFmRrGlUyNui9IHPtMJ0",
	
	//索引 转为 编码
	toChar = function( arrTmp, idx ){
		arrTmp[ arrTmp.length ] = codeKey.charAt( idx );
	},
	
	//编码 转为 索引
	toIdx = function( code, char ){
		return codeKey.indexOf( char );
	};
	
	da.extend({
		//加密
		code: function( str ){
				if( 0 <= str.indexOf( "*da*" ) ) return str;		//加密过就不用加密了
				
				var len = str.length,										//源字符串长度
						arrTmp=[],res,
					  kLen = codeKey.length,			//密钥的 长度
					  klen2 = kLen * kLen,								//密钥的 2倍长度
					  klen5 = kLen * 5;										//密钥的 5倍长度
			  
				for( var i=0,a; i < len; i++ )
				{
					a = str.charCodeAt(i);																	//逐个取出源字符串的 字符
					
					if( a < klen5 ){
							toChar( arrTmp, Math.floor( a / kLen ));				//小于等于其数值参数的最大整数( 下限整数 )
							toChar( arrTmp, a % kLen );
					}
					else{
						toChar( arrTmp, Math.floor( a / klen2 ) + 5 );
						toChar( arrTmp, Math.floor( a / kLen ) % kLen );
						toChar( arrTmp, a % kLen );
					}
				}
				res = arrTmp.join("");
				
				return "*da*" + String( res.length ).length + String( res.length ) + res;				//第一位：编码后字符长度数值的位数（最大9位）；通过第一位数值，取得编码后字符长度数值；然后剩下的是编码后的字符；最前面加上自定义编码头*da*
																																												//如：31771G1O1s1Z1o1o1o1……y191s1Z……1G1s1Z  （解释：3 - "177"的长度。  177 - 编码后字符长度）
		},
		
		//解密
		decode: function( code ){
				if( 0 != code.indexOf( "*da*" ) ) return code;		//编码头过滤,并去掉编码头
				code = code.substr( 4 );
				
				var nlen = code.charAt( 0 ) * 1;			//去第一位字符，并通过运算符隐式转换为整型
				if( isNaN( nlen ) ) return "";				//通过isNaN()函数判断是否符合 长度信息格式
				
				nlen = code.substr( 1, nlen ) * 1;		//取实际编码字符长度数值
				if( isNaN( nlen ) ) return code;				
				
				var clen = code.length,								//取整个编码串长度（包含了长度信息位）
						arrTmp = [],a,f,b,
						i = String( nlen ).length + 1,		//加上第一位（长度信息值的 位数信息）
						kLen = codeKey.length;					//密钥的 长度
						
				if( clen != i + nlen ) return code;		//匹配实际编码字符长度 和 长度信息 是否不一致

				while( i < clen )
				{
					a = toIdx( code, code.charAt( i++ ) );
					if( a < 5 ) 
						f = ( a * kLen ) + toIdx( code, code.charAt( i ) );
					else
						f = ( ( a - 5 ) * kLen * kLen ) + ( toIdx( code, code.charAt( i ) ) * kLen ) + toIdx( code, code.charAt( ++i ) );
				 	
				 	arrTmp[ arrTmp.length ] = String.fromCharCode( f );
				 	i++;
				}
				
				return arrTmp.join( "" );
		},
		
		//编码
		toHex: function( str ) {
			str = da.isNull( str.toString(), "" );
			
			if ("" != str) {
				if (0 == str.indexOf('~h`')) return str;
				
				var code, rs = [];
				
				for (var i=0, len=str.length; i<len; i++ ) 
				{
					code = str.charCodeAt(i).toString(16);				//单字符转为16进制字符串
					code = da.zeroFill( code, 4 );						//4位16进制,不够补零
					
					rs.push( code.slice(2, 4) + code.slice(0, 2) );		//高低位颠倒处理
				}
				return ('~h`' + rs.join(""));
			}
			
			return str;
		},
		
		//解码
		toStr: function ( hex ){
			hex = da.isNull( hex, "" );
			
			if (0 == hex.indexOf('~h`')) {
				hex = hex.substr(3);									//去前缀
				
				if ( "" != hex ) {
					var str='', rs = [];
					
					for (var i=1, offset=0; i <=hex.length/4; i++ ){
						offset = 4 * i;
					
						rs[i * 3 - 3] = "%u" ;
						rs[i * 3 - 2] = hex.slice( offset-2, offset );
						rs[i * 3 - 1] = hex.slice( offset-4, offset-2 );
					};
					str = unescape(rs.join(""));
					return str;
				}
				return "";
			}
			return hex;
		}
	});
})(da);

/***************** 遮罩层 **************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 遮罩层
	version: 1.0.0
*/
(function(da){
	function fnProp(n) {
	  return n && n.constructor === Number ? n + 'px' : n;
	}
	
	da.fnStruct.extend({
			bgiframe: function( params ){
				var def = {
					top: "auto",
					left: "auto",
					width: "auto",
					height: "auto",
					opacity: true,
					src: "javascript:false;"
		    };
		    
		    params = da.extend( {}, def, params );
		    
				var iframeObj, overObj, doc,
						css = "display:block;position:absolute;z-index:-1;background:transparent;top:0px;left:0px;width:100%;height:100%;" ;
		    this.each( function(){
                    doc = this.ownerDocument;
                    
				    iframeObj = doc.createElement("iframe");
				    iframeObj.src = params.src;
				    iframeObj.className = "daBgIframe";
				    iframeObj.setAttribute( "frameborder", 0, 0 );
				    iframeObj.setAttribute( "tabindex", -1 );
				    iframeObj.style.cssText = [
				   		css, 
				   		( params.opacity === true ? 'filter:Alpha(Opacity=\'0\');' : '' )
				   	].join("");
				   	
//				    iframeObj.style.cssText = [
//				    	"display:block;position:absolute;z-index:-1;background:transparent;",
//              ( params.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '' ),
//				    	'top:', ( 'auto' == params.top ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : fnProp(params.top) ),
//					    ';left:', ( 'auto' == params.left ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : fnProp(params.left)),
//							';width:', ( 'auto' == params.width ? 'expression(this.parentNode.offsetWidth+\'px\')' : fnProp(params.width)),
//							';height:', ( 'auto' == params.height ? 'expression(this.parentNode.offsetHeight+\'px\')' : fnProp(params.height)), 
//							";"
//						].join("");
						
				    overObj = doc.createElement("div");
				    overObj.style.cssText = [
				   		css, 
				   		( params.opacity === true ? 'filter:Alpha(Opacity=\'0\');' : '' )
				   	].join("");
//				    overObj.style.cssText = [
//				    	"display:block;position:absolute;z-index:-1;border:1px solid #0f0;background:transparent;",
//              ( params.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '' ),
//				    	'top:0', //( 'auto' == params.top ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : fnProp(params.top) ),
//					    ';left:0', //( 'auto' == params.left ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : fnProp(params.left)),
//							';width:', ( 'auto' == params.width ? 'expression(this.parentNode.offsetWidth+\'px\')' : fnProp(params.width)),
//							';height:', ( 'auto' == params.height ? 'expression(this.parentNode.offsetHeight+\'px\')' : fnProp(params.height)), 
//							";"
//						].join("");

       
		        if( 0 === da(this).children('iframe.daBgIframe').dom.length ){
		        	this.insertBefore( overObj, this.firstChild );
		        	this.insertBefore( iframeObj, this.firstChild );
		        }
		    });
		    
		    defParams = null;
		    iframeObj = null;
	
		    return this;
			}
	});
	
	da.extend({
			//初始化遮罩层对象		//body的onLoad事件会重载
			/*
				zIndex: 显示覆盖的z坐标
			*/
			daMaskInit: function( maskWin, zIndex ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = maskDoc.createElement("div");
						
				objMask.id = 'daMask';
				objMask.style.cssText = 'position:absolute; top:0px; left:0px; display:none; background:#000; filter: Alpha(opacity=50);/* IE */ -moz-opacity:0.5;/* FF 主要是为了兼容老版本的FF */ opacity:0.5;/* FF */';
				
				objMask.style.zIndex = zIndex || 19998;								//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
				
				objMask.style.width = Math.max( da( maskWin ).width(), maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth )+ "px";
				objMask.style.height = Math.max( da( maskWin ).height(), maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight )+ "px";
	//				da( objMask ).bind("mousedown",function(){
	//					da.daMaskHide(maskWin);
	//				});
				maskDoc.body.insertBefore(objMask);
				
				da(objMask).bgiframe();
				
				//body大小改变时，调用遮罩层更新尺寸函数
				da( maskWin ).bind( "resize", function(){
					da.daMaskFresh( this );
				});
				
				return objMask;
			},
			
			//是否已经初始化
			daGetMask: function( maskWin ){
				maskWin = maskWin || window;
				var objMask = maskWin.document.getElementById("daMask");
				if(null==objMask) return false;
				else return objMask;
			},
			
			//更新遮罩层对象大小尺寸   //body的onResize事件会重载
			daMaskFresh: function( maskWin ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = da.daGetMask( maskWin );
				if( !objMask ) objMask = da.daMaskInit( maskWin );
				
				objMask.style.width = Math.max( da( maskWin ).width(), maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth ) + "px"; 
				objMask.style.height = Math.max( da( maskWin ).height(), maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight ) + "px"; 
				
				//this.daMaskShow( maskWin );
			},
			
			//显示遮罩层
			/*
				zIndex: 显示覆盖的z坐标
			*/
			daMaskShow: function( maskWin, opacity, color, zIndex ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = da.daGetMask( maskWin );
				if( !objMask ) objMask = da.daMaskInit( maskWin );
				
				da.daMaskFresh( maskWin );
				
				objMask.style.background = color || "#000";
				objMask.style.filter = "Alpha(opacity="+ (opacity || 50) +")";
				objMask.style.opacity = ( opacity || 50 )/100;
				//objMask.style.mozOpacity = opacity || 0.5;
				objMask.style.zIndex = zIndex || 19998;									//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
				
				if( "undefined" !== typeof daFx )
					da( objMask ).fadeIn(300);
				else
					objMask.style.display = "block";
				
			},
			
			//隐藏遮罩层
			daMaskHide: function( maskWin ){
				maskWin = maskWin || window;
				var objMask = da.daGetMask( maskWin );
				if( !objMask ) return;
				
	//				if( "undefined" !== typeof daFx )															//异步动作容易出错啊。
	//					da( objMask ).fadeOut(300);
	//				else
					objMask.style.display = "none";
					
			}
		
	});
})(da);

/***************** Tools 函数 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 库功能函数
	version: 1.0.0
*/
(function(da){
	da.extend({
		//获取浏览器类型和版本
		browser: (function(){
			var Sys = {},
					ua = navigator.userAgent.toLowerCase(),
					s;
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
			(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
			(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
			(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
			
			return Sys;
		})(),
		
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
			
			if (window.clipboardData) {				//IE
				window.clipboardData.clearData();   
			  return ( window.clipboardData.setData( sTitle,sText ) );			//复制到剪贴板
			}
			else if(navigator.userAgent.indexOf("Opera") != -1) {    
				window.location = sText;    
			}
			else if (window.netscape) {
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
		},
		
		
		//输出调试信息
		/*
			msg: 调试信息
			color: 调试信息行颜色
		*/
		out: function( msg, color ){
			color = color || "#ffff99";
			
			var pushWin = da.getRootWin() || window,
				pushDoc = pushWin.document,
				outDiv = pushDoc.getElementById("daDebugOutDiv"),
				lineObj;
			
			if( null === outDiv ){

				var containerDiv, titleDiv, closeDiv;
				
				containerDiv = pushDoc.createElement("div");
				containerDiv.className = "daShadow";
				containerDiv.style.cssText= "position:fixed; z-Index:99999; width:800px; padding:30px 5px 5px 5px; background:#555;";
				containerDiv.style.left = (da(pushWin).width() - 800)/2 +"px";
				containerDiv.style.top = "0px";
				pushDoc.body.insertBefore( containerDiv, pushDoc.body.firstChild );
				
				titleDiv = pushDoc.createElement("div");
				titleDiv.style.cssText= "position:absolute;left:5px;top:0px;height:30px;line-height:30px;width:100%;font-size:12px;text-indent:10px; color:#f0f0f0;";
				titleDiv.innerHTML = "调试信息";
				containerDiv.insertBefore( titleDiv, null );
				
				outDiv = pushDoc.createElement("div");
				outDiv.id = "daDebugOutDiv";
				outDiv.style.cssText= "border-bottom: 1px solid #444; background:#f0f0f0;width:100%; height:200px; overflow:scroll;";
				containerDiv.insertBefore( outDiv, null );
				
				closeDiv = pushDoc.createElement("div");
				closeDiv.style.cssText= "position:absolute;right:5px;top:5px;padding:2px;cursor:pointer;color:#f0f0f0;border:1px solid #666";
				closeDiv.innerHTML = "Close";
				containerDiv.insertBefore( closeDiv, null );
				
				da( closeDiv ).bind( "click",function( evt ){
					if( "Close" === this.innerHTML ){
						outDiv.style.display = "none";
						containerDiv.style.width = "100px";
						this.innerHTML = "Open";
					}
					else{
						outDiv.style.display = "block";
						containerDiv.style.width = "800px";
						this.innerHTML = "Close";
					}
				});
				
				if( "undefined" != typeof daDrag ){
					daDrag({
						src: titleDiv,
						target: containerDiv,
						before: function(){
							da.daMaskShow(pushWin,1);
							containerDiv.className = "";
						},
						move: function( evt, src, target, oldPos, nowPos, dragPStart, dragPEnd ){
							var winHeight = da(pushWin).height();
							
							if( 0 > nowPos.y )
								nowPos.y = 0;
							else if( winHeight - 50 < nowPos.y )
								nowPos.y = winHeight - 50;
						},
						after: function(){
							da.daMaskHide();
							containerDiv.className = "daShadow";
						}
					});
				}

			}
			
			if( da.isArray( msg ) ){							//判断是否为数组
				for( var i=0,len=msg.length; i<len; i++ ){
					lineObj = pushDoc.createElement("div");
					lineObj.style.backgroundColor = color;
					lineObj.innerHTML = msg[i];
					outDiv.insertBefore( lineObj, outDiv.firstChild );
				}
			}
			else if( /<|&#?\w+;/.test( msg ) ){					//判断是否有元素标签
				lineObj = pushDoc.createElement("textarea");
				lineObj.value = "代码：\n" + msg;
				lineObj.style.cssText= "width:80%;height:150px;margin:5px;border:2px solid #663300;background-color:"+color;
				outDiv.insertBefore( lineObj, outDiv.firstChild );
			}
			else{
				lineObj = pushDoc.createElement("div");
				lineObj.style.backgroundColor = color;
				lineObj.innerHTML = msg;
				outDiv.insertBefore( lineObj, outDiv.firstChild );
			}
			
		},
		
		box: function( params ){
			var def = {
					id: "",
					content: null,
					width: 400,
					height: 300,
					title: "",
					color: "#f0f0f0",
					bordercolor: "#999"
				};
			params = da.extend({}, def, params);
			if( "" == params.id ) return;
			
			var boxObj = document.getElementById(params.id);
			
			if( null != boxObj ){
				boxObj.style.display = "";
			}
			else{
				var containerDiv, titleDiv, closeDiv, mainDiv;
				
				containerDiv = document.createElement("div");
				containerDiv.id = params.id;
				containerDiv.className = "daShadow";
				containerDiv.style.cssText = "position:fixed; z-index:999999; border:5px solid; background:#fff;";
				containerDiv.style.width = params.width +"px";
				containerDiv.style.height = params.height +"px";
				containerDiv.style.left = (da(window).width() - params.width)/2 +"px";
				containerDiv.style.top = (da(window).height() - params.height)/2 +"px";
				containerDiv.style.borderColor = params.bordercolor;
				
				titleDiv = document.createElement("div");
				titleDiv.style.cssText = "height:30px; text-indent:10px; font-size:14px; font-weight:bold;";
				titleDiv.style.backgroundColor = params.bordercolor;
				titleDiv.style.color = params.color;
				titleDiv.innerHTML = params.title;
				containerDiv.insertBefore( titleDiv, null );
				
				closeDiv = document.createElement("div");
				closeDiv.style.cssText= "position:absolute; right:5px; top:0px; color:#fff; line-height:25px; font-size:25px; font-family:arial; cursor:pointer;";
				closeDiv.style.color = params.color;
				closeDiv.innerHTML = "X";
				closeDiv.title = "关闭";
				containerDiv.insertBefore( closeDiv, null );
				
				da( closeDiv ).bind( "click",function( evt ){
					containerDiv.style.display = "none";
				});
				
				if( "undefined" != typeof daDrag ){
					daDrag({
						src: titleDiv,
						target: containerDiv,
						before: function(){
							da.daMaskShow(window,1);
							containerDiv.className = "";
						},
						move: function( evt, src, target, oldPos, nowPos, dragPStart, dragPEnd ){
							var winHeight = da(window).height();
							
							if( 0 > nowPos.y )
								nowPos.y = 0;
							else if( winHeight - 50 < nowPos.y )
								nowPos.y = winHeight - 50;
						},
						after: function(){
							da.daMaskHide();
							containerDiv.className = "daShadow";
						}
					});
				}
				
				mainDiv = document.createElement("div");
				mainDiv.style.cssText = "overflow:hidden;";
				mainDiv.style.width = params.width +"px";
				mainDiv.style.height = (params.height-30) +"px";

				if( "string" == typeof params.content ){
					if( 0 == params.content.indexOf("#") )
						mainDiv.insertBefore( da(params.content).dom[0], null );
					else
						mainDiv.innerHTML = params.content;
				}
				else if( "undefined" != typeof params.content.nodeType)
					mainDiv.insertBefore( params.content, null );
					
				containerDiv.insertBefore( mainDiv, null );
				
				document.body.insertBefore( containerDiv, document.body.firstChild );
			}
		},
		
		boxhide: function( id ){
			var boxObj = document.getElementById(id);
			
			if( null != boxObj ){
				if( "undefined" !== typeof daFx )
					da( boxObj ).fadeOut(300);
				else
					boxObj.style.display = "none";
			}
		},
		
		boxshow: function( id ){
			var boxObj = document.getElementById(id);
			
			if( null != boxObj ){
				if( "undefined" !== typeof daFx )
					da( boxObj ).fadeIn(300);
				else
					boxObj.style.display = "";
			}
		},
		
		//设置或获取cookie
		cookie: function( name, value, expires, path, domain, se3cure ) {
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
		removeCookie: function(name, path, domain) {
			if (da.cookie(name))
				document.cookie = name + '=' + ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
		},
		
		//预加载图片
		/*
			url:	图片地址
			callback:	加载完毕回调函数
		*/
		loadImage: function( url, fn ) {
		  var img = new Image(); 			//创建一个Image对象，实现图片的预下载
		  img.src = url;
		  if( !da.isFunction(fn) ) return;
		  
		  if (img.complete) { 				// 如果图片已经存在于浏览器缓存，直接调用回调函数
			fn.call(img);
		  }
			else{
			  da( img ).bind( "load", function () { 	//图片下载完毕时异步调用callback函数。
					fn.call(img);													//将回调函数的this替换为Image对象
			  });
			}
		},
		
		/**随机数
		* Min: 范围最小值
		* Max: 范围最大值
		*/
		random: function (Min,Max){
			Min = Min || 0;			//默认范围
			Max = Max || 100;
			var Range = Max - Min;					//范围
			var Rand = Math.random();				//0~1随机值
			var addNum = Rand * Range;			//增量
			return(Min + Math.round(Rand * Range));
		},
		
		/**补零
		*/
		zeroFill: function ( str, len, isRight ){
			if( "number" === typeof str ) str = str.toString();
			var nZero = len - str.length,
				sZero = [];
			
			if( 0 >= nZero ) return str;
			else{
				for( ; 0<nZero; nZero-- ) sZero.push("0");

				if( isRight ) return str = str + sZero.join("");  
				else return str = sZero.join("") + str;
			}
		},
		
		
		//获取url参数
		/*
			url:	地址串
		*/
		urlParams: function( url ){
			url = url || location.search.substring(1);      		//获取要查询的url地址串
			
			var	arrPair = url.split(/[\&\?]/g),              		//切开参数
				args = {}, idx;
			 
			 for(var i=0; i < arrPair.length; i++) {
				idx = arrPair[i].indexOf('=');         				//通过"="发现参数
				if (idx == -1) continue;                   			//没有找到"="符号,直接跳过
				 
				 var argName = arrPair[i].substring( 0, idx ); 		//获取参数名
				 var argValue = arrPair[i].substring( idx + 1 );	//获取参数值
				 //value = decodeURIComponent(value);        		//如果需要可以编码
				 args[argName] = argValue;                    		//缓存入map对象
			 }
			 return args;                                   		//返回整个参数列表对象
		},
		
		//获取最外层框架页面的窗体对象
		getRootWin: function( sPage ){
			var curWin = window;
			var parentWin = curWin.parent;
			while( curWin != parentWin ){
					if( sPage == curWin.location.href ) break;					
		
				curWin = parentWin;
				parentWin = parentWin.parent;
			}
			
			return curWin;
		},
		
		/**将sqlserver数据库日期格式转为Date格式
		* params {String} sqlDate 后台直接返回的数据库日期格式字符串
		* params {String} sFormat 日期格式化对照字符串
		*/
		db2date: function( sqlDate, sFormat ){
			var t = sqlDate.replace("+08:00",""),								//去掉时区后缀
				d = t.split(/[-\.\/T:]/g);										//通过split()函数 分隔出 [年，月，日，时，分，秒，毫秒] 数组

			d = new Date( d[0],d[1],d[2],d[3],d[4],d[5],d[6]||0 );
			return sFormat ? d.format( sFormat ) : d;
					
		},
		
		/**日期数据加减
		* params {Date|String} dateObj 日期数据
		* params {Int} nValue 间隔差值（相减为负数）
		* params {String} type 计算对象[ "y", "M", "d", "h", "m", "s", "ms" ]，默认为"d"（日）
		*/
		addDate: function( dateObj, nValue, type ){
			type = type || "d";
			nValue = parseInt(nValue,10);
			if( !nValue ) return dateObj;
			
			if( "string" === typeof dateObj ) dateObj = new Date(dateObj);
			
			switch( type ){
				case "d":	dateObj.setDate( dateObj.getDate() + nValue );
					break;
				case "M":	dateObj.setMonth( dateObj.getMonth() + nValue );
					break;
				case "y":	dateObj.setYear( dateObj.getYear() + nValue );
					break;
				case "h":	dateObj.setHours( dateObj.getHours() + nValue );
					break;
				case "m":	dateObj.setMinutes( dateObj.getMinutes() + nValue );
					break;
				case "s":	dateObj.setSeconds( dateObj.getSeconds() + nValue );
					break;
				case "ms": dateObj.setMilliseconds( dateObj.getMilliseconds() + nValue );
					
					break;
			}
		return dateObj;
		},
		
		//限制最大长度字符串
		/*
			str: 目标字符串
			mxlen: 最大长度
		*/
		limitStr: function(str,mxlen){
			return str.length > mxlen ? str.substring(0,mxlen-3)+"…":str;
		},
		
		/**向页面动态嵌入样式in-inline-css
		*/
		addStyle: function( id, cssText ){
			if( 0 <= id.indexOf("#") ){
				id = id.subStr( 1, id.length-1 );
			}
		
			var head = document.head || document.getElementsByTagName('head')[0],
				cssObj = document.getElementById(id);
				
			if( !cssObj ) {
				cssObj = document.createElement('style');
				cssObj.type='text/css';
				cssObj.id = id ;
				head.appendChild( cssObj );
			}
			
			if( cssObj.styleSheet ) {
				cssObj.styleSheet.cssText = cssObj.styleSheet.cssText + cssText;
			} 
			else {
				cssObj.appendChild(document.createTextNode(cssText));
			}
		},
		
		/**去html元素
		*/
		deleteHtml: function( str ){
			return str.replace( /<("[^"]*"|'[^']*'|[^'">])*>/gi, "");
		},
		
		/**浮点型数值格式化
		*/
		fmtFloat: function( val, fmt ){
			return new Number( val ).format( fmt );
		},
		
		/**日期格式化
		*/
		fmtDate: function( sdate, fmt ){
			if( "" === da.isNull(sdate,"")) return sdate;
		
			if( sdate instanceof Date ){
				sdate = sdate.format("yyyy-mm-dd hh:nn:ss i");
			}
		
			var tmp = sdate.replace("+08:00",""),							//去掉时区后缀(数据库存储格式)
				isCN, d;

			if( isCN = (0 <= fmt.indexOf("/p")) )							//判断中文模式
				fmt = fmt.replace(/\/p/g, "");

			d = sdate.split(/[-\.\/T\s:]|\+08:00/g);						//通过split()函数 分隔出 [年，月，日，时，分，秒，毫秒] 数组
																			//可能出现的分隔符有："-", ".", "/", "T", " ", ":", "+08:00"
			for(var i=0,len=d.length; i<len; i++){							//矫正数据格式
				d[i] = parseInt( d[i] || 0,10 );
			}
																			
			var date = new Date( d[0], d[1]-1, d[2], d[3]||0, d[4]||0, d[5]||0, d[6]||0 );
			
			if( !isCN ) return fmt ? date.format( fmt ) : date;				//非中文模式，不再进行下面的处理
			
			
			var now = new Date(),
				ntime = ( date.getTime()-now.getTime() )/1000,
				d2 = [
					now.getFullYear(),
					now.getMonth() + 1,
					now.getDate(),
					now.getHours(),
					now.getMinutes(),
					now.getSeconds(),
					now.getMilliseconds()
				];
				
			if( 0 > ntime ){	//过去时
				// ntime *= -1;						//矫正时间差符号

				if( "undefined" != typeof d[0] && d[0]!=d2[0] ){										//不同年
					switch( d2[0]-d[0] ){
						case 1: return "<span style='color:#900'>去年</span>" + date.format( "m月d号" );
						case 2: return "<span style='color:#900'>前年</span>" + date.format( "m月d号" );
						default: return fmt ? date.format( fmt ) : date;
					}
				}
				else if( "undefined" != typeof d[1] && d[1]!=d2[1] ){									//同年,不同月
					switch( Math.abs(d2[1]-d[1]) ){
						case 1: 
							return "<span style='color:#900'>上个月</span>" + date.format( "d号" );
						case 2: 
							return "<span style='color:#900'>两个月前</span>" + date.format( "d号" );
						case 3: 
							return "<span style='color:#900'>三个月前</span>" + date.format( "d号" );
						default: return date.format( "m月d号" );
					}
				}
				else if( "undefined" != typeof d[2] && d[2]!=d2[2] ){									//同年,同月,不同日
					switch( Math.abs(d2[2]-d[2]) ){
						case 1:
							return "<span style='color:#900'>昨天</span>" + date.format( "h时n分" );
						case 2:
							return "<span style='color:#900'>前天</span>" + date.format( "h时n分" );
						case 3:
							return "<span style='color:#900'>三天前</span>" + date.format( "h时n分" );
						default:
							return "<span style='color:#900'>当月</span>" + date.format( "d号" );
					}
				}
				else if( "undefined" != typeof d[3] && d[3]!=d2[3] ){									//同年,同月,同日,不同小时
					switch( Math.abs(d2[3]-d[3]) ){
						case 1:
							return "<span style='color:#900'>前1小时</span>" + date.format( "n分" );
						case 2:
							return "<span style='color:#900'>前2小时</span>" + date.format( "n分" );
						case 3:
							return "<span style='color:#900'>前3小时</span>" + date.format( "n分" );
						default:
							return "<span style='color:#900'>今天</span>" + date.format( "h时n分" );
					}
				}
				else if( "undefined" != typeof d[4] && d[4]!=d2[4] ){									//同年,同月,同日,同小时,不同分钟
					return "<span style='color:#900'>"+ Math.abs(d2[4]-d[4]) +"分钟前</span>";
				}
				else{
					return fmt ? date.format( fmt ) : date;
				}
			}
			else{				//将来时

				if( "undefined" != typeof d[0] && d[0]!=d2[0] ){										//不同年
					switch( d2[0]-d[0] ){
						case 1: return "<span style='color:#900'>明年</span>" + date.format( "m月d号" );
						case 2: return "<span style='color:#900'>后年</span>" + date.format( "m月d号" );
						default: return fmt ? date.format( fmt ) : date;
					}
				}
				else if( "undefined" != typeof d[1] && d[1]!=d2[1] ){									//同年,不同月
					switch( Math.abs(d2[1]-d[1]) ){
						case 1: 
							return "<span style='color:#900'>下个月</span>" + date.format( "d号" );
						case 2: 
							return "<span style='color:#900'>两个月后</span>" + date.format( "d号" );
						case 3: 
							return "<span style='color:#900'>三个月后</span>" + date.format( "d号" );
						default: return date.format( "m月d号" );
					}
				}
				else if( "undefined" != typeof d[2] && d[2]!=d2[2] ){									//同年,同月,不同日
					switch( Math.abs(d2[2]-d[2]) ){
						case 1:
							return "<span style='color:#900'>明天</span>" + date.format( "h时n分" );
						case 2:
							return "<span style='color:#900'>后天</span>" + date.format( "h时n分" );
						case 3:
							return "<span style='color:#900'>三天后</span>" + date.format( "h时n分" );
						default:
							return "<span style='color:#900'>当月</span>" + date.format( "d号" );
					}
				}
				else if( "undefined" != typeof d[3] && d[3]!=d2[3] ){									//同年,同月,同日,不同小时
					switch( Math.abs(d2[3]-d[3]) ){
						case 1:
							return "<span style='color:#900'>1小时后</span>" + date.format( "n分" );
						case 2:
							return "<span style='color:#900'>2小时后</span>" + date.format( "n分" );
						case 3:
							return "<span style='color:#900'>3小时后</span>" + date.format( "n分" );
						default:
							return "<span style='color:#900'>今天</span>" + date.format( " h时n分" );
					}
				}
				else if( "undefined" != typeof d[4] && d[4]!=d2[4] ){									//同年,同月,同日,同小时,不同分钟
					return "<span style='color:#900'>"+ Math.abs(d2[4]-d[4]) +"分钟后</span>";
				}
				else{
					return fmt ? date.format( fmt ) : date;
				}
			}
					
		}
		
	});

})(da);


	//全局变量
	win.da = da;
	
})(window);


/***************** 数据交互 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 数据交互部分功能代码，与业务功能开发关系密切
	version: 1.0.0
*/

var $flds = [];			//为兼容过去的 ebs函数库用法定义的一些全局变量。
    $f = [],
	$v = [];

da.extend({
	/**格式化数据
	*/
	fmtData: function( val, fmt ){
		if( !fmt ) return val;
		
		var val_format = val;
		
		if( "money" == fmt ){																//货币型
			val_format = "<span style='color:#900'>￥</span>" + da.fmtFloat(val_format, "#,##");
		}
		else if( /[#\.\,]/.test(fmt) ){														//数值型
			val_format = da.fmtFloat( val_format, fmt );
		}
		else{																				//日期型
			val_format = da.fmtDate( val_format, fmt );
		}

		return val_format;
	},
	
	/**给控件赋值
	* 如: da.setValue( "#p_name", "AH100" );
	*/
	setValue: function( obj, val ){
		var daObj = da(obj);
		
		if ( "string" === typeof obj && 0 >= daObj.dom.length ){			//需要通过name来定位，如:checkbox、radio
			var arr = obj.split(",");
			for( var i=0,len=arr.length; i<len; i++ ){
				arr[i] = "input[name="+ arr[i].trim() +"]";
			}
			daObj = da( arr.join(",") );
		};
		
		var tag, fmt, val2;
		
		daObj.each(function(i){
			tag = this.tagName.toLowerCase();			//元素类型
			
			switch( tag ){
				case "input":{
					var type = this.type.toLowerCase();				//input中的控件类型
					switch(type){
						case "checkbox":							//复选控件
						case "radio":{								//单选控件
							val2 = da.isNull(this.value, "");
							
							if ( val2 == "" || val2 == "on" ) {				//特殊值互等 "" == "on" == 0
								this.setAttribute( "checked", val == "0" );
							}
							else {
								this.setAttribute( "checked", val == da.isNull(this.value, "") );
							};
							break;
						}
						case "text":								//单行输入框
						default:{
							fmt = da.isNull( this.getAttribute("fmt"), "" );
							
							if( "" !== fmt ){
								val2 = da.fmtData( val, fmt );
							}
							
							val2 = da.isNull( val2, this.value );
							this.value = val2;
							break;
						}
					}
					break;
				}
				case "textarea":{									//文本域
					fmt = da.isNull( this.getAttribute("fmt"), "" );
					
					if( "" !== fmt ){
						val2 = da.fmtData( val, fmt );
					}
					
					val2 = da.isNull( val2, this.value );
					this.value = val2;
					break;
				}
				case "select":{
					if( da.isNull(val) ) return;
				
					var isFinded = false;
					for ( var i=0,len=this.options.length; i < len; i++ ) {
						if (this.options[i].value == val1) {
							this.options[i].selected = true ;
							isFinded = true;
						}
						else if( this.options[i].selected ) {
							this.options[i].selected = false ;
						}
					}
					
					if ( !isFinded ){
						if ( val != "" ){
							var obj = pobj001.document.createElement("OPTION");
							this.options.add(obj);
							obj.innerText = val;
							obj.value = val;
							obj.selected = true;
						}
					}
					break;
				}
				case "img":
					this.src = val;
					break;
			}
		});
	},
	
	/**数据交互
	*/
	getData: function( url, data, fnLoaded, fnError ) {
		if( !url ) return;
		
		if (url.toLowerCase().indexOf(".asp") < 0) {					//修正url参数
			url = "/sys/aspx/execsqllist.aspx?sqlname=" + url;
		}
		if (url.indexOf("?") < 0) {
			url += "?";
		}
		
		var isPost = da.isPlainObj(data),
			isScript = /\.js/.test(url.toLowerCase());

		da.ajax({
			url: url,
			type: (isPost && !isScript) ? "POST" : "GET",
			data: (isPost && !isScript) ? data : null,
			
			error: function( xhr, status, exception ) {
				var msg = xhr.statusText,
					code = xhr.status,
					content = xhr.responseText;
				
				fnError && fnError( msg, code, content );
			},
			success: function( data, status, xhr ) {
				var dataType = xhr.getResponseHeader("content-type").match(/html|xml|json|script/).toString(),
					xml2json;
				
				switch( dataType ){
					case "html":
					case "json":
					case "script": {
						fnLoaded && fnLoaded( data, dataType, xhr.getResponseHeader("content-type"), xml2json );
						break;
					}
					case "xml": {
						$flds = [];													//为兼容过去的 ebs函数库用法定义的一些全局变量。
						$f = [],
						$v = [];
						
						var firstTime = true;
						xml2json = da.xml2json( data, function( type, dsname, data, idx ){
							if( "field" == type ){									//逐字段
								if( firstTime ){
									window["_"+ data.name] = idx;					//为兼容过去的 ebs函数库用法定义的一些全局变量。
									$flds.push( data.name );
								}
								$f.push( data.value );
							}
							if( "record" == type && data ){							//逐行
								if( firstTime ){
									firstTime = false;
								}
								
								$v = $f;
								fnLoaded && fnLoaded( false, data, dsname, idx);
								
								$f = [];											//清除行数据
								$v = [];
							}
							if( "dataset" == type && da.isArray(data) ){			//逐数据集
								fnLoaded && fnLoaded( true, data, dsname, idx);
							}
						});
						fnLoaded && fnLoaded( true, xml2json, undefined, undefined );		//结束回调
						
						break;
					}
					defaul:
						break;
				}
			}
		});
	},

	dataList: function( pid, url, data, fnField, fnLoaded, fnError ){
		if( "string" === typeof pid && 0 !== pid.indexOf("#") )		//修正id未加"#"
			pid = "#" + pid;
		
		var parent = da( pid );
		if( 0 >= parent.dom.length ) return;
		parent = parent.dom[0];
		
		var tmpHTML = parent.innerHTML.replace(/[\r\t\n]/g, ""),
			fmtMap = {};
			
		var name="", fmt="", txt="", key, obj;
		da("td[fmt]", pid).each(function( idx ){
			obj = da( this );
			name = obj.attr("name");
			txt = obj.text();
			fmt = obj.attr("fmt");
			
			key = name || txt.replace(/\{|\}/g, "");
			if( key ){
				context.fmtMap[key] = fmt;
			}
			// if ((s1 == "sum") || (s1 == "avg") || (s1 == "min") || (s1 == "max") || (s1 == "count")) {
				// s1 = obj1.html().replace("{", "").replace("}", "") ;
			// }
			
			// if ((_isnull(s1, "") != "") && (_isnull(s2, "") != "")) {
				// _tb_fmt_flds.push(s1);
				// _tb_fmt_fmts.push(s2);
			// }
		});
	
		da.getData( url, data, 
		function( iseof, data, dsname, idx){
			if( !dsname ){
				tmpHTML = tmpHTML.replace(/\{[^\}]+\}/g, function( res, i, target ){
					fldname = res.replace( /\{|_org|_raw|\}/g, "" );
					fldvalue =  (data[fldname] || "");
					
					var fmt = fmtMap[fldname],
						val_format = fldvalue,
						val_tohex = da.toHex(fldvalue);
					
					if( fnField ) {
						val_format = fnField( fldname, fldvalue, data );				//字段值，用户格式化处理
					}
					
					val_format = da.fmtData( val_format, fmt );
					
					if( 0 <= res.indexOf("_org") ){									//返回原数据
						return fldvalue;
					}
					else if( 0 <= res.indexOf("_raw") ){							//返回编码数据
						return val_tohex;
					}
					else{															//返回格式化数据
						return val_format;
					}
				});
				
				fnLoaded && fnLoaded( data );
			}
		},
		function( msg, code, content ){
			fnError && fnError( msg, code, content );
		});
	}
	
});

/*********为兼容过去的 ebs函数库用法定义的一些全局函数。*********/
var $value = da.setValue,
	$value2 = da.setValue,
	runsql = da.getData,
	runsql4text = da.getData,
	runsql4xml = da.getData;


