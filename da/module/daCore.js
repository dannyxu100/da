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
							fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
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
						length ? fn( elems[0], key ) : emptyGet;
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

	
	//全局变量
	win.da = da;
	
})(window);
