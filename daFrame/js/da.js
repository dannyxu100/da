/*
	author:	danny.xu
	date:	2010.11.8
	description:	javascript对象扩展
*/

(function( win, undefined ){
		//对象类型转字符串
		_daToString = Object.prototype.toString;								//通过这种方式判断： "[object Array]" == _daToString.call(objDOM)
		//判断对象是否拥有XX属性       
		_daHasOwnProperty = Object.prototype.hasOwnProperty; 		//通过这种方式判断： _daHasOwnProperty.call(obj, "constructor")
		//去字符串前后空格
		_daTrim = String.prototype.trim;
		//数组项匹配索引查询函数
		_daIndexOf = Array.prototype.indexOf,
		//数组压入新的子项函数
		_daPush = Array.prototype.push,
		
		//日期格式化
		//alert(new Date().format("yyyy-MM-dd")); 
		//alert(new Date("january 12 2008 11:12:30").format("yyyy-MM-dd hh:mm:ss")); 
		Date.prototype.format = function(format){
		  var o = { 
		    "M+" : this.getMonth()+1, 									//month 
		    "d+" : this.getDate(),    									//day
		    "h+" : this.getHours(),   									//hour 
		    "m+" : this.getMinutes(), 									//minute 
		    "s+" : this.getSeconds(), 									//second 
		    "q+" : Math.floor((this.getMonth()+3)/3),  	//quarter 
		    "S" : this.getMilliseconds() 								//millisecond 
		  };
		  
		  if(/(y+)/.test(format))
		  	format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		  
		  for(var k in o){
		  	if(new RegExp("("+ k +")").test(format)) 
		    	format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		  }
		  return format; 
		};
		
		
		if (!Array.prototype.daReIndexOf) 										//正则表达式的索引查询
		Array.prototype.daReIndexOf = function(item, i ){ 		//判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 																			//初始化起步查询的下标
		  var length = this.length;
		  if (i < 0) i = length + i; 													// 如i为负数，则从数组倒数i开始。
		  
		  var patt1 = new RegExp(item, "g");
		  var idx = 0;
			patt1.test(this);
			idx = patt1.lastIndex;
			patt1.lastIndex = 0;
			
			return idx;
		};
		
		if (!Array.prototype.indexOf) 
		Array.prototype.indexOf = function(item, i ){ 				//判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 																			//初始化起步查询的下标
		  var length = this.length;
		  if (i < 0) i = length + i; 													// 如i为负数，则从数组末端开始。
		  for (; i < length; i++)
		    if (this[i] === item) return i; 									// 使用全等于(===)判断符
		  return -1;
		};
		
		if (!Array.prototype.indexOf2) 
		Array.prototype.indexOf2 = function(item, i ,j){ 			//判断Array的原型是否已作indexOf方法的扩展
		  i || (i = 0); 																			//初始化起步查询的下标
		  j || (j = 1); 																			//每次查询的步长
		  var length = this.length;
		  if (i < 0) i = length + i; 													// 如i为负数，则从数组末端开始。
		  for (; i < length; i+=j)
		    if (this[i] === item) return i;  									// 使用全等于(===)判断符
		  return -1;
		};
		
		document.getElementsByName2 = function(tag, name){		//getElementsByName()函数浏览器兼容扩展
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

(function( win ){
	var doc = win.document;

	var da = (function() {
		/**da类构造函数
		*/
		var da = function( obj, context ){				//通过局部变量，实现构造函数名和类名相同
			return new da.fnStruct.init( obj, context, daDoc );
		},
		
		daDoc;												//目标窗体Document对象所对应的da对象
		
		//da类属性集
		da.fnStruct = da.prototype = {
			version: "DA Library1.3  \n\nauthor: danny.xu\n\ndate: 2011-5-13 \n\nThank you!!!",
			
			dom: [],						//操作对象数组
			length:	0,					//操作对象个数
			selecter: "",				//为Sizzle.js保留的选择器字符串
			
			constructor: da,

			//初始化函数
			init: function( obj, context, daDoc ) {
				var match, elem, ret, docTmp;
				this.dom = [];																			//注：danny.xu 必须要先初始化一次
				
				if ( !obj ) return this;														//判空处理，直接返回当前da空对象
				
				if ( obj.nodeType ) {																//如果直接传入DOM元素对象
					this.context = this.dom[0] = obj;									//将da处理元素对象和上下文设置为DOM元素对象
					this.length = 1;
					return this;
				}
		
				if ( obj === "body" && !context && doc.body ) {			//如果直接传入的是“body”字符串
					this.context = doc;
					this.dom[0] = doc.body;
					this.selector = obj;
					this.length = 1;
					return this;
				}

				if ( typeof obj === "string" ) {										//如果传入的obj是字符串，可能会用到Sizzle选择器
					// Are we dealing with HTML string or an ID?
					if ( obj.charAt(0) === "<" 
					&& obj.charAt( obj.length - 1 ) === ">" 
					&& obj.length >= 3 ) {
						match = [ null, obj, null ];										//如果obj是"<>"开头结尾，说明是HTML代码，可以直接跳过元素选择器的验证
					}
					else {
						match = daRe_quickExpr.exec( obj );
					}
		
					// Verify a match, and that no context was specified for #id
					if ( match && (match[1] || !context) ) {
		
						// HANDLE: $(html) -> $(array)
						if ( match[1] ) {
							context = context instanceof da ? context.dom[0] : context;
							docTmp = (context ? context.ownerDocument || context : doc);
		

							ret = daRe_singleTag.exec( obj );									//如果传入的是一个元素的HTML,说明只是单纯的创建一个元素
		
							if ( ret ) {																			//创建单个元素
								if ( da.isPlainObj( context ) ) {								//如果有属性值，就通过attr设置属性
									obj = [ doc.createElement( ret[1] ) ];
									da.fn.attr.call( obj, context, true );
		
								}
								else {																								
									obj = [ docTmp.createElement( ret[1] ) ];
									
								}
		
							}
							else {																						//需要生产的不止一个元素，需要生产文档片段
								ret = da.buildFragment( [ match[1] ], [ docTmp ] );
								obj = (ret.cacheAble ? da.clone(ret.fragment) : ret.fragment).childNodes;						//如果可以缓存生产的文档片段，就克隆一下返回，避免印象缓存的文档片段
								
							}
		
							return da( da.merge( this.dom, obj ));						//合并元素集合数组
		
						} 
						else {																							//如果传入的obj是元素id选择器，如："#myid"
							elem = doc.getElementById( match[2] );
		
							if ( elem && elem.parentNode ) {									// Check parentNode to catch when Blackberry 4.6 returns nodes that are no longer in the document #6963
								if ( elem.id !== match[2] ) {										// Handle the case where IE and Opera return items by name instead of ID
									return daDoc.find( obj );
								}
		
								// Otherwise, we inject the element directly into the jQuery object
								this.length = 1;
								this.dom[0] = elem;
							}
		
							this.context = doc;
							this.selector = obj;
							return this;
						}
		
					// HANDLE: $(expr, $(...))
					}
					else if ( !context || context.da ) {
						return (context || daDoc).find( obj );
		
					// HANDLE: $(expr, context)
					// (which is just equivalent to: $(context).find(expr)
					}
					else {
						return this.constructor( context ).find( obj );
					}
		
				}
				else if ( da.isFunction( obj ) ) {												//如果传入的是function，说明是要做Document加载完毕回调处理
					return daDoc.ready( obj );
				}
		
				if (obj.selector !== undefined) {
					this.selector = obj.selector;
					this.context = obj.context;
				}
				da.pushArray( obj, this.dom );
				
				return this;
			},
			
			//DOM对象选择器
			find: function( obj ){
				var arrDOM = da.find( obj );
				
				if( undefined !== arrDOM.length ){				//如果是数组
					this.dom = arrDOM;
				}
				else{																			//如果是单一对象
					if( arrDOM ) this.dom.push( arrDOM );
				}
	
				this.length = this.dom.length;						//重置一下操作对象个数值
			},

			/**通过slice函数将da对象转为DOM对象数组
			*/
			toArray: function() {
				return slice.call( this.dom, 0 );
			},
			
			/**根据索引值获得da对象中的DOM
			* @param {Int} num 目标dom处于数组中的索引值，为空返回整个DOM数组
			*/
			get: function( num ) {
				return num == null ?
		
					// Return a 'clean' array
					this.toArray() :
		
					// Return just the object
					( num < 0 ? this.dom[ this.dom.length + num ] : this.dom[ num ] );
			},

			//将元素集合压为一个全新的da对象。
			/*
				elems: 元素集合
				name: 分类名
				selector: 全新的选择器字符串
			*/
			pushStack: function( elems, name, selector ) {
				var ret = this.constructor();														//首先new一个全新的空da对象
		
				if ( da.isArray( elems ) ) {
					_daPush.apply( ret.dom, elems );
		
				} 
				else {
					da.merge( ret.dom, elems );
				}
		
				ret.prevObject = this;																	//设置前一个da对象的地址，实现堆栈/链表的功能
		
				ret.context = this.context;
		
				if ( name === "find" ) {																//选择器字符串更新
					ret.selector = [ 
							this.selector, 
							(this.selector ? " " : ""), 
							selector 
					].join("");
				} 
				else if ( name ) {
					ret.selector = [ 
							this.selector, 
							".", name, 
							"(", selector, ")" 
					].join("");
				}
		
				return ret;																							//返回全新的da对象
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
		da.fnStruct.init.prototype = da.fnStruct;


		daDoc = da( doc );
		
		return da;
	})();


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
		return retArray.concat.apply( [], retArray );
//		return retArray.concat( retArray );
		
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

	
	/************************* 部分功能性函数集合 ************************/
	da.extend({
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
		isArray: function( obj ) {
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
		
		
		//判断元素在数组内的位置
		/*
			elem: 元素对象
			array: 数组对象
		*/
		isInArray: function( elem, array ) {
			if ( _daIndexOf ) return _daIndexOf.call( array, elem );
	
			return array.indexOf( elem );
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

		//错误抛出异常
		error: function( msg ) {
			throw msg;
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
		
		/**将xml数据转为json数据格式
		*/
		xml2json: function( xml ){
			var newSet, row, col, json, jsonRow;
			if( !xml.childNodes || 0 >= xml.childNodes.length ) return null;
			
			json = {};
			
			for( var i=0,lenDS=xml.childNodes.length; i<lenDS; i++ ){
				newSet = xml.childNodes[i];
				
				for( var n=0,lenROW=newSet.childNodes.length; n<lenROW; n++ ){					//遍历所有数据集的记录，通过nodeName进行数据集划分
					row = newSet.childNodes[n];
					if( 3 === row.nodeType ) continue;																		//排除text类型无效元素
					
					if( !json[ row.nodeName ] ){
						json[ row.nodeName ] = [];
					}
					
					jsonRow = {};
					for( var m=0,lenCOL=row.childNodes.length; m<lenCOL; m++ ){						//遍历每行记录，通过nodeName进行字段划分
						col = row.childNodes[m];
						if( 3 === col.nodeType ) continue;																	//排除text类型无效元素
					
						jsonRow[ col.nodeName ] = ( undefined === col.text ) ? col.textContent : col.text;
					}
					
					json[ row.nodeName ].push( jsonRow );																	//将划分好的字段数据，压入对应的数据集对象内
					
				}
			}
			
			return json;
			
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
		}
		
	});	
	

	//****************** 集成Sizzle选择器 ***********************/
	/*!
	 * Sizzle CSS Selector Engine
	 *  Copyright 2011, The Dojo Foundation
	 *  Released under the MIT, BSD, and GPL Licenses.
	 *  More information: http://sizzlejs.com/
	 */
	(function(){
		
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
		
		// EXPOSE
		//window.Sizzle = Sizzle;
		da.find = Sizzle;
		da.expr = Sizzle.selectors;
		da.expr[":"] = da.expr.filters;
		da.unique = Sizzle.uniqueSort;
		da.text = Sizzle.getText;
		da.isXMLDoc = Sizzle.isXML;
		da.contains = Sizzle.contains;
	
	})();
	
	
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


//****************** 集成Sizzle选择器 ***********************/
	
	
var daRe_until = /Until$/,
		daRe_parentsprev = /^(?:parents|prevUntil|prevAll)/,
		// Note: This RegExp should be improved, or likely pulled from Sizzle
		daRe_multiselector = /,/,
		daRe_isSimple = /^.[^:#\[\.,]*$/,
		slice = Array.prototype.slice,
		POS = da.expr.match.POS,
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
			if ( not ) {																				//如果需要取反，表达式包裹取反前缀
				expr = ":not(" + expr + ")";
			}
	
			return elems.length === 1 ?
				( da.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] ) :
				da.find.matches(expr, elems);
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
			return da.nodeName( elem, "iframe" ) ?
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
				args = slice.call(arguments);
	
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


	/*********************** 浏览器兼容性验证 *****************************/
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
				leadingWhitespace: ( div.firstChild.nodeType === 3 ),													// IE strips leading whitespace when .innerHTML is used
			
				tbody: !!div.getElementsByTagName( "tbody" ).length,													//判断是否自动插入了tbody标签元素，IE会对空的table标签自动插入tbody标签元素
	
				htmlSerialize: !!div.getElementsByTagName( "link" ).length,										//判读link元素能否通过innerHTML正确的被串行化，IE中不能通过innerHTML正常的串行化link和script标签元素
				
				opacity: /^0.55$/.test( a.style.opacity ),																		//opacity 不透明度属性兼容性判断
				cssFloat: !!a.style.cssFloat,																									//float 浮动位置属性兼容性判断
	
				// Make sure that if no value is specified for a checkbox
				// that it defaults to "on".
				// (WebKit defaults to "" instead)
				checkOn: ( input.value === "on" ),

				// Make sure that a selected-by-default option has a working selected property.
				// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
				optSelected: opt.selected,																										//验证option默认选中项，有selected属性
		
				getComputedStyle: doc.defaultView && doc.defaultView.getComputedStyle,				//defaultView.getComputedStyle 函数支持判断
				
				getSetAttribute: div.className !== "t",			//如果是IE，可以通过驼峰格式值设置属性,这时候在今后的属性操作时就要进行兼容处理了。
				
				boxModel: null,															//盒子模型支持
				inlineBlockNeedsLayout: false,							//inline-block支持
				shrinkWrapBlocks: false,										//拆封块支持
				reliableHiddenOffsets: true,								//隐藏元素可靠性支持
				
				scriptEval: false,													//判断是否支持script元素引入并执行自定义代码
				deleteExpando: true,												
				ajax:	false																	//是否支持XHR requests
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
	

	//***************** 内部使用 全局变量 *****************/
	var daRe_inlineDA = / da\d+="(?:\d+|null)"/g,
			daRe_leadingWhitespace = /^\s+/,																											//匹配有前段空格的字符串
			daRe_html = /<|&#?\w+;/,
			daRe_xhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
			daRe_tagName = /<([\w:]+)/,
			daRe_tbody = /<tbody/i,																																//判断是否有tbody标签
			daRe_scriptType = /\/(java|ecma)script/i,																									//判断是否有脚步标签
			
			daRe_nocache = /<(?:script|object|embed|option|style)/i,															//?????????
			daRe_checked = /checked\s*(?:[^=]|=\s*.checked.)/i,																		//匹配元素选中状态属性checked="checked" or checked
	
			daRe_quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,														//验证是否是单纯的HTML字符串,还是元素id选择器，如："#myid"
			daRe_singleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,																				//匹配验证一个元素节点
	
			daRe_validchars = /^[\],:{}\s]*$/,																										// JSON 对象处理
			daRe_validescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
			daRe_validtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
			daRe_validbraces = /(?:^|:|,)(?:\s*\[)+/g,
	
			daRe_notwhite = /\S/,																																	//验证字符串是否有空格
			daRe_white = /\s/,
			
		 	daRe_trimLeft = /^\s+/,																																//验证字符串左右是否有空格
			daRe_trimRight = /\s+$/;
			
	if ( !daRe_white.test( "\xA0" ) ) {									//用正则表达式的\s匹配空格符号，IE中可能会失败。
		daRe_trimLeft = /^[\s\xA0]+/;
		daRe_trimRight = /[\s\xA0]+$/;
	}
	
	//元素包裹映射表
	daWrapMap = {
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

	var class2type = {};																		//[[Class]] -> type pairs
	da.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});

	
	//***************** 扩展部分 document对象ready回调函数 *****************/
	
	var readyBound = false,		//判断是否已经绑定ready事件函数
			readyList = [];				//回调函数列表(支持多个ready函数的调用)

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
										//da( doc ).trigger( "ready" ).unbind( "ready" );
										da( doc ).trigger( "ready" );
										da( doc ).unbind( "ready" );
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
					fn.call( doc, da );								//立即回调函数
		
				}
				else if ( readyList ) {							//如果没有加载完毕，将对调函数压入全局列表
					readyList.push( fn );
					
				}
		
				return doc;
			}
	
	});
	
	//***************** 扩展部分 DOM对象操作功能 函数 *****************/

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
			var data, id, cache = da.daData,
					internalKey = da.identifier, 
					special = da.event.special,
					deleteExpando = da.support.deleteExpando;
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( elem.nodeName && da.noData[elem.nodeName.toLowerCase()] ) continue;
	
				id = elem[ da.identifier ];
	
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
						delete elem[ da.identifier ];
	
					} else if ( elem.removeAttribute ) {
						elem.removeAttribute( da.identifier );
					}
	
					delete cache[ id ];
				}
			}
			
		}
		
		
	});
	
	//CSS公用源码正则表达式
	var	daRe_exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
			daRe_alpha = /alpha\([^)]*\)/,
			daRe_opacity = /opacity=([^)]*)/,
			daRe_float = /float/i,
			daRe_dashAlpha = /-([a-z])/ig,
			daRe_upper = /([A-Z])/g,
			daRe_numpx = /^-?\d+(?:px)?$/i,
			daRe_num = /^-?\d/,

			fcamelCase = function( all, letter ) {
				return letter.toUpperCase();
			};

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

			/**属性名驼峰格式化函数
			*/
			camelCase: function( string ) {
				return string.replace( daRe_dashAlpha, fcamelCase );
			},
			
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
						exec = !pass && exec && da.isFunction(value);					//判断属性值是否是以函数的形式的计算结果
						
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

	var daRe_return = /\r/g,
			daRe_type = /^(?:button|input)$/i,
			daRe_focusable = /^(?:button|input|object|select|textarea)$/i,
			daRe_clickable = /^a(?:rea)?$/i,
			daRe_special = /^(?:data-|aria-)/,
			daRe_invalidChar = /\:/,
			formHook;
			
	da.fnStruct.extend({
		attr: function( name, value ) {
			return da.access( this.dom, name, value, true, da.attr );
		},
	
		removeAttr: function( name ) {
			return this.each(function() {
				da.removeAttr( this.dom, name );
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
			} else if ( typeof value === "string" && !rnocache.test( value ) &&
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
              if( !da.dustbin ){
              	var d = document.createElement('div');
              	d.id = "da_Dustbin";
//              	document.body.insertBefore( d );
								da.dustbin = d;
              }

              da.dustbin.insertBefore( elem );
              da.dustbin.innerHTML = '';
              
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
	
					for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
						callback.call(
							table ?
								root(this[i], first) :
								this[i],
							// Make sure that we do not leak memory by inadvertently discarding
							// the original fragment (which might have attached data) instead of
							// using it; in addition, use the original fragment object for the last
							// item instead of first because it can end up being emptied incorrectly
							// in certain situations (Bug #8070).
							// Fragments from the fragment cache must always be cloned and never used
							// in place.
							results.cacheable || (l > 1 && i < lastIndex) ?
								da.clone( fragment, true, true ) : fragment
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

	//DOM对象 属性操作函数扩展
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
					if ( daRe_type.test( elem.nodeName ) && elem.parentNode ) {								//兼容IE,某些元素不允许改变元素的type属性
						da.error( "温馨提示:button和input元素，不允许改变type属性" );
					} 
					else if ( !da.support.radioValue 
					&& "radio" === value 
					&& da.isNodeName(elem, "input") ) {																			//兼容IE,如果某元素设置type为radio类型，需要重新设置默认value值
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
	
			if ( value !== undefined ) {																			//set操作
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
			else {																														//get操作
				if ( hooks && "get" in hooks && notxml ) {
					return hooks.get( elem, name );
	
				} 
				else {
					ret = elem.getAttribute( name );
					
					return null === ret ? undefined : ret;												// Non-existent attributes return null, we normalize to undefined
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
						else {																					//如果不支持，可以通过XML节点移除函数完成
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
	
	
//	// Some attributes require a special call on IE
//	if ( !jQuery.support.hrefNormalized ) {
//		jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
//			jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
//				get: function( elem ) {
//					var ret = elem.getAttribute( name, 2 );
//					return ret === null ? undefined : ret;
//				}
//			});
//		});
//	}
//	
//	if ( !jQuery.support.style ) {
//		jQuery.attrHooks.style = {
//			get: function( elem ) {
//				// Return undefined in the case of empty string
//				// Normalize to lowercase since IE uppercases css property names
//				return elem.style.cssText.toLowerCase() || undefined;
//			},
//			set: function( elem, value ) {
//				return (elem.style.cssText = "" + value);
//			}
//		};
//	}
//	
//	// Safari mis-reports the default selected property of an option
//	// Accessing the parent's selectedIndex property fixes it
//	if ( !jQuery.support.optSelected ) {
//		jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
//			get: function( elem ) {
//				var parent = elem.parentNode;
//	
//				if ( parent ) {
//					parent.selectedIndex;
//	
//					// Make sure that it also works with optgroups, see #5701
//					if ( parent.parentNode ) {
//						parent.parentNode.selectedIndex;
//					}
//				}
//			}
//		});
//	}
//	
//	// Radios and checkboxes getter/setter
//	if ( !jQuery.support.checkOn ) {
//		jQuery.each([ "radio", "checkbox" ], function() {
//			jQuery.valHooks[ this ] = {
//				get: function( elem ) {
//					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
//					return elem.getAttribute("value") === null ? "on" : elem.value;
//				}
//			};
//		});
//	}
//	
//	jQuery.each([ "radio", "checkbox" ], function() {
//		jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
//			set: function( elem, value ) {
//				if ( jQuery.isArray( value ) ) {
//					return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
//				}
//			}
//		});
//	});
	

	//***************** da库事件管理机制 核心函数集 *****************/
	var daRe_namespaces = /\.(.*)$/,
			daRe_escape = /[^\w\s.|`]/g;
	
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
		this[ da.identifier ] = true;				//对当前event对象打上已做封装处理的标志
		
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

	da.event = {
		props: ["altKey","attrChange","attrName","bubbles","button","cancelable","charCode",
						"clientX","clientY","ctrlKey","currentTarget","data","detail","eventPhase",
						"fromElement","handler","keyCode","layerX","layerY","metaKey","newValue",
						"offsetX","offsetY","pageX","pageY","prevValue","relatedNode","relatedTarget",
						"screenX","screenY","shiftKey","srcElement","target","toElement","view",
						"wheelDelta","which"],										//event对象的所有 成员列表
		guid: 1E8,						//??????
		proxy: da.proxy,			//??????
		
		//事件封装函数
		/*
			event: 事件对象
		*/
		fix: function( event ) {
			if ( event[ da.identifier ] ) {						//判断event对象是否已经封装过
				return event;
			}
	
			var originalEvent = event;								//缓存一个原始event对象
			event = da.Event( originalEvent );				//event对象并对其进行原型改造
	
			for ( var i = this.props.length, prop; i; ) {			//复制原始event对象属性值
				prop = this.props[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			if ( !event.target ) {															//修正target属性的存在
				event.target = event.srcElement || document;			//没有target属性，就是IE浏览器，那就把srcElement赋值给target
			}
	
			if ( event.target.nodeType === 3 ) {								//如果是文本节点，就将父节点对象赋给target，针对safari浏览器
				event.target = event.target.parentNode;
			}
	
			if ( !event.relatedTarget && event.fromElement ) {		//修正relatedTarget属性，针对mouseover和mouserout事件；IE分成了to和from两个属性存放；FF没有分
				event.relatedTarget = event.fromElement === event.target ? 
																event.toElement : event.fromElement;
			}
	
			if ( event.pageX == null && event.clientX != null ) {  //修正pageX/Y属性,event事件的位置是相对page，如果页面可以滚动，client位置还要加上scroll，如果是IE浏览器，还要减去body的边框宽
				var doc = document.documentElement,
						body = document.body;
	
				event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
			}
	
			if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {		//修正which，针对按键事件 charCode（键盘）keyCode（鼠标）
				event.which = event.charCode != null ? event.charCode : event.keyCode;
			}


//在 IE 里面 
//没有按键动作的时候 event.button = 0; 左键是1; 中键是4; 右键是2
//在 Firefox 里面 
//没有按键动作的时候 event.button = 0; 左键是0 ;中键是1 ;右键是2
			if ( !event.which && event.button !== undefined ) {		//button属性是非标准的东东，所以咱们不用它，还是统一成which吧
				event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));		//1 === 鼠标左键; 2 === 鼠标中键; 3 === 鼠标右键  ?????
			}

			if ( !event.metaKey && event.ctrlKey ) {							//修正metaKey，苹果电脑没有Ctrl键，只有meta键
				event.metaKey = event.ctrlKey;
			}
	
			return event;
		},
		
		global: {},						//事件类型注册使用情况，标志集
		
		//给元素绑定事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
			data: 额外自定义传入数据对象
		*/
		add: function( elem, types, handler, data ) {
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {    //我不给文本和备注节点绑事件，没意义
				return;
			}
	
			if ( da.isWin( elem ) && ( elem !== window && !elem.frameElement ) ) {		//IE浏览器不能直接对window对象操作，所以先复制一下
				elem = window;
			}
	
			if ( handler === false ) handler = fnReturnFalse;	//如果handler的值为false可以屏蔽事件响应
			else if ( !handler ) return;
	
			var handleObjIn, handleObj;												//handleObjIn用于缓存自定义函数参数对象；handleObj事件属性配置对象，用于事件函数的注册存放和后期移除、触发
	
			if ( handler.handler ) {													//如果自定义回调函数参数，是以键值对的方式 如：{handler: function(){……}, guid: handleObj.handler.guid}
				handleObjIn = handler;													//缓存自定义函数参数对象(这里是键值对咯)
				handler = handleObjIn.handler;									//修正handler操作函数，为传入键值对的handler属性引用(内定的,在下面的代码可以看到)
			}
	
			if ( !handler.guid ) handler.guid = da.guid++;		//确保时间回调函数有一个唯一标识
				
			var elemData = da.data( elem );										//初始化元素data缓存结构 elemData === {}
			if ( !elemData ) return;													//保证元素data缓存结构已定义

			var eventKey = elem.nodeType ? "events" : "__events__",
					events = elemData[ eventKey ],								//eventKey通过键值获得尽量避免对于JS引用对象的冲突
					eventHandle = elemData.handle;
			
			if ( "function" === typeof events ) {							//如果已经有绑定的事件函数了，将事件函数都缓存出来，供下面追加事件绑定使用
				// On plain objects events is a fn that holds the the data
				// which prevents this data from being JSON serialized
				// the function does not need to be called, it just contains the data
				eventHandle = events.handle;
				events = events.events;
	
			}
			else if ( !events ) {															//定义events，事件函数缓存			
				if ( !elem.nodeType ) {													//检查如果不是节点元素，就赋值函数类型
					// On plain objects, create a fn that acts as the holder
					// of the values to avoid JSON serialization of event data
					elemData[ eventKey ] = elemData = function(){};	
					
				}
				elemData.events = events = {};									//如果是节点元素，就赋值引用类型,因为这样才能指向多个自定义事件函数
				
			}
	
			if ( !eventHandle ) {															//定义eventHandle，到这里元素的data缓存结构 elemData === { events: {}, handle: function(){……} }
				elemData.handle = eventHandle = function() {
					// Handle the second event of a trigger and when
					// an event is called after a page has unloaded
					return ( "undefined" !== typeof da && !da.event.triggered ) ?						//???????
						da.event.handle.apply( eventHandle.elem, arguments ) : undefined;
						
				};
			}
			
			eventHandle.elem = elem;									//给事件回调函数对象添加elem属性，存放事件绑定目标元素按对象，针对IE没有本地事件对象(IE的事件对象是放在window对象下统一管理的),防止内存泄露的处理
	
			types = types.split(" ");									//多个事件批量定义，可以用空格" "分隔哦，如：da.event.add(obj, "mouseover mouseout", fn);
	
			var type,
					i = 0, 
					namespaces;
					
			while ( (type = types[ i++ ]) ) {					//多个事件逐个绑定
				handleObj = handleObjIn ?								//事件属性配置对象handleObj默认成员属性{ handler: handler, data: data }
					da.extend( {}, handleObjIn ) : { handler: handler, data: data };
	
				if ( -1 < type.indexOf(".") ) {					//满足以命名空间的方式，自定义事件函数
					namespaces = type.split(".");
					type = namespaces.shift();
					handleObj.namespace = namespaces.slice(0).sort().join(".");
	
				}
				else {																	//没有用命名空间的方式
					namespaces = [];
					handleObj.namespace = "";
					
				}
	
				handleObj.type = type;									//事件属性配置扩张type属性
				if ( !handleObj.guid ) handleObj.guid = handler.guid;		//保证唯一标识属性
	
				var handlers = events[ type ],													//获取当前已经绑定的事件函数列表
						special = da.event.special[ type ] || {};						//对于特殊的事件类型 如:ready、live、beforeunload, 需要特殊处理一下下
	
				if ( !handlers ) { 																			//如果当前没有绑定任何事件函数
					handlers = events[ type ] = [];												//初始化事件函数队列
					
					//如果非特殊事件类型 或da.event.special()判定函数返回值为false，就可以直接用addEventListener()或 attachEvent()绑定事件函数了
					if ( !special.setup || ( false === special.setup.call( elem, data, namespaces, eventHandle ) ) ) {
						if ( elem.addEventListener ) {											//针对firefox
							elem.addEventListener( type, eventHandle, false );
	
						} else if ( elem.attachEvent ) {										//针对IE
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}
				
				if ( special.add ) { 											//??????
					special.add.call( elem, handleObj ); 
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				handlers.push( handleObj );								//将事件属性配置对象，压入到目标元素对象的data缓存events:{}事件列表中，因为handlers指向的就是events[ type ], 供后期移除、触发;
	
				da.event.global[ type ] = true;						//给da.event全局变量相应的事件类型打上标记，说明这种事件类型已有被注册，待全局事件触发时查看
			}
	
			elem = null;								//回收资源，避免内存泄露
		},
	
		//针对元素移除或重置一个事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
			pos: 同时移除多个事件操作，递归调用时传入，避免重复匹配元素的eventType列表
		*/
		remove: function( elem, types, handler, pos ) {
			if ( elem.nodeType === 3 || elem.nodeType === 8 )	return;						//文本、注释元素不绑定事件
				
			if ( handler === false )	handler = fnReturnFalse;
	
			var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
					eventKey = elem.nodeType ? "events" : "__events__",
					elemData = da.data( elem ),
					events = elemData && elemData[ eventKey ];
	
			if ( !elemData || !events ) return;																	//无事件缓存，直接返回
			
			if ( "function" === typeof events ) {																//如果events为函数类型（即elem非元素类型）
				elemData = events;
				events = events.events;
			}
	
			if ( types && types.type ) {																				//如果参数传入的types是一个事件对象 或{}对象
				handler = types.handler;
				types = types.type;
			}
	
			if ( !types || typeof types === "string" && types.charAt(0) === "." ) {							//移除元素所有事件，或某命名空间的所有事件
				types = types || "";
	
				for ( type in events ) {
					da.event.remove( elem, type + types );
				}
	
				return;
			}
	
			types = types.split(" ");																						//同时移除多个事件，用空格（" "）分隔，如：da("...").unbind("mouseover mouseout", fn);
			while ( (type = types[ i++ ]) ) {
					origType = type;
					handleObj = null;
					all = type.indexOf(".") < 0;																		//全清操作
					namespaces = [];
		
					if ( !all ) {
						namespaces = type.split(".");																	//命名空间的所有事件处理
						type = namespaces.shift();
		
						namespace = new RegExp("(^|\\.)" + da.map( namespaces.slice(0).sort(), fnCleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
						
					}
		
					eventType = events[ type ];
		
					if ( !eventType )	continue;																			//没有对应的事件类型，直接处理下一个
		
					if ( !handler ) {																								
						for ( j = 0; j < eventType.length; j++ ) {										//循环元素所有已绑定的事件类型
							handleObj = eventType[ j ];
		
							if ( all || namespace.test( handleObj.namespace ) ) {				//匹配到需要移除的事件
								da.event.remove( elem, origType, handleObj.handler, j );	//递归移除事件（这里传入了pos参数值，避免重复匹配元素的eventType列表）
								eventType.splice( j--, 1 );																//从元素已绑定事件类型列表移除
							}
						}
		
						continue;
					}
		
					special = da.event.special[ type ] || {};
		
					for ( j = pos || 0; j < eventType.length; j++ ) {								//pos递归调用时传入，避免重复匹配元素的eventType列表
						handleObj = eventType[ j ];
		
						if ( handler.guid === handleObj.guid ) {											//TODO:注释未完待续
							//remove the given handler for the given type
							if ( all || namespace.test( handleObj.namespace ) ) {				
								if ( pos == null ) {
									eventType.splice( j--, 1 );
								}
		
								if ( special.remove ) {
									special.remove.call( elem, handleObj );
								}
							}
		
							if ( pos != null ) {
								break;
							}
						}
					}
		
					// remove generic event handler if no more handlers exist
					if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
						if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
							da.removeEvent( elem, type, elemData.handle );
						}
		
						ret = null;
						delete events[ type ];
					}
			}
	
			// Remove the expando if it's no longer used
			if ( da.isEmptyObj( events ) ) {
					var handle = elemData.handle;
					if ( handle ) {
						handle.elem = null;
					}
		
					delete elemData.events;
					delete elemData.handle;
		
					if ( typeof elemData === "function" ) {
						da.undata( elem, eventKey );
		
					} else if ( da.isEmptyObj( elemData ) ) {
						da.undata( elem );
					}
			}
			
		},
	
		//事件触发器( 支持同事件冒泡 )
		/*
			event:	da.Event对象 或触发的事件类型event type
			data: 用户自定义数据传入，数组格式
			elem:	事件触发目标元素对象
			bubbling: 是否允许事件冒泡
		*/
		trigger: function( event, data, elem /*, bubbling */ ) {
			var type = event.type || event,										//da.Event事件类型对象 或event type字符串
					bubbling = arguments[3];
	
			if ( !bubbling ) {																//非冒泡触发
				event = ( typeof event === "object" ) ? 										//判断event是否已经封装过的da.Event对象
									event[ da.identifier ] ? 													//再通过唯一标识符确认是否封装过
									event : da.extend( da.Event( type ), event ) : da.Event( type );				//只有当type为字符串时 如:"click","mouseout"
	
				if ( type.indexOf("!") >= 0 ) {									//支持"click!","evtFn!"这种叹号"!"结尾的exclusive方式
					event.type = type = type.slice(0, -1);				//去掉"!"符号
					event.exclusive = true;												//exclusive方式打开，这将会对add注册的所有事件函数根据命名空间的分类来执行
				}
	
				if ( !elem ) {																	//如果没有指定事件触发的目标元素对象，就是全局事件的触发
					event.stopPropagation();											//在执行全局事件函数的时候，那就不要冒泡泡用户自定义事件函数啦，浪费资源
	
					if ( da.event.global[ type ] ) {									//只需要触发注册过的事件类型就可以了嘛
						da.each(da.daData, function() {									//批处理全局缓存中所有注册过事件函数的元素对象，并触发执行相应的事件函数
								if ( this.events && this.events[type] ) {
									da.event.trigger( event, data, this.handle.elem );			//递归逐个触发执行
								}
						});
					}
					
				}
	
				//*****注意了哦，以下的代码是对单一元素对象的事件函数的触发执行操作
	
				if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {			//文本和注释元素你们就算了嘛，你还搞什么事件啊
					return undefined;
				}
	
				event.result = undefined;													//如果是再次触发，就先把之前触发执行的结果清楚掉
				event.target = elem;
	
				// Clone the incoming data, if any
				data = da.pushArray( data );											//如果有传入数据的话，通过pushArray缓存一下下嘛
				data.unshift( event );														//在缓存数组开头，压入事件对象
			}
			
			//*****注意了哦，以下的代码有可能是普通事件的触发操作，也有可能是冒泡事件的触发操作
			
			event.currentTarget = elem;													//事件触发的当前目标元素
	
			var handle = elem.nodeType ?												//先假定"handle"属性是一个函数,触发这个事件函数
											da.data( elem, "handle" ) : (da.data( elem, "__events__" ) || {}).handle;
	
			if ( handle ) {
				handle.apply( elem, data );												//1. 触发通过da.event.add()添加的用户自定义事件函数,这里的data会以数组的方式，被分别传入apply()的多个参数
			}
	
			var parent = elem.parentNode || elem.ownerDocument;
	
			try {																								//2. 触发本地脚本或元素行内脚本事件函数, 如：obj.onclick=function(){……}; 或 <input onclick="fn();" …… />
				if ( !(elem && elem.nodeName && da.noData[elem.nodeName.toLowerCase()]) ) {							//排除特殊元素类型 如：embed、applet等
					if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {			//执行事件函数，如果返回为false，就中止元素的默认事件触发
						event.result = false;
						event.preventDefault();
					}
				}
	
			} 
			catch (inlineError) {}															//IE的某些元素( 如一些隐藏的元素 )的某些事件会抛出异常，在此捕获吧，哇哈哈~抓起来 抓起来
	
			if ( !event.isPropagationStopped() && parent ) {		//3. 冒泡触发父亲的事件函数( 默认允许， 一直到 Document )
				da.event.trigger( event, data, parent, true );
	
			}
			else if ( !event.isDefaultPrevented() ) {						//4. 触发元素事件默认动作( 默认允许 )，如:form.submit()
				var old,	
						target = event.target,																									//事件触发源元素对象
						targetType = type.replace( daRe_namespaces, "" ),												//如果事件定义有命名空间，就提取命名空间名
						isLinkClick = da.isNodeName( target, "a" ) && targetType === "click",		//对于超链接的click事件就不用触发了，因为它连addEvent事件注册都通过不了
						special = da.event.special[ targetType ] || {};													//特殊事件类型，如 ready
	
				if ( (!special._default || special._default.call( elem, event ) === false) && 
					!isLinkClick && !(target && target.nodeName && da.noData[target.nodeName.toLowerCase()]) ) {			//非特殊事件 或特殊事件判断返回false 并且非超链接click事件 并且非特殊元素类型，所有都满足了，呼呼~就可以执行下去了
	
					try {
						if ( target[ targetType ] ) {									//这里的判断 和紧接着的置空，可以避免某些事件，在事件函数执行完毕返回之前，被再次重复触发( 如： )
							old = target[ "on" + targetType ];					//先把元素上对应的事件函数缓存起来
	
							if ( old ) {
								target[ "on" + targetType ] = null;				//置空事件函数，保证不被重复触发
							}
	 
							da.event.triggered = true;									//打上触发中标记
							target[ targetType ]();											//对于一些隐藏的元素，IE会抛出异常
						}
	
					}
					catch (triggerError) {}
	
					if ( old ) {																		//如果缓存着事件函数，就赋回去还原它
						target[ "on" + targetType ] = old;
					}
	
					da.event.triggered = false;											//撤销触发中标记
					
				}
			}
			
			
		},
	
		//对自定义事件函数，通过命名空间分类和有序的执行( this是触发event事件的源元素对象 )
		/*
			event: 已经封装过的da.Event事件对象
		*/
		handle: function( event ) {
			var all, handlers, namespaces, namespace_re, events,
					namespace_sort = [],
					args = da.pushArray( arguments );											//先缓存一下参数列表，便于后面使用
			
			event = args[0] = da.event.fix( event || win.event );			//修正传入的event对象，保证其是封装过的
			event.currentTarget = this;
	
			all = event.type.indexOf(".") < 0 && !event.exclusive;		//判断是否用命名空间分类执行
	
			if ( !all ) {
				namespaces = event.type.split(".");
				event.type = namespaces.shift();												//获得命名空间名
				namespace_sort = namespaces.slice(0).sort();
				namespace_re = new RegExp("(^|\\.)" + namespace_sort.join("\\.(?:.*\\.)?") + "(\\.|$)");
			}
	
			event.namespace = event.namespace || namespace_sort.join(".");
	
			events = da.data( this, this.nodeType ? "events" : "__events__" );			//获得this源元素的事件配置数据
	
			if ( "function" === typeof events ) {
				events = events.events;
				
			}
			handlers = ( events || {} )[ event.type ];
			
			if ( events && handlers ) {
				// Clone the handlers to prevent manipulation
				handlers = handlers.slice(0);
	
				for ( var i = 0, len = handlers.length; i < len; i++ ) {
					var handleObj = handlers[ i ];
	
					// Filter the functions by class
					if ( all || namespace_re.test( handleObj.namespace ) ) {
						event.handler = handleObj.handler;															//将事件函数的引用传入，便于之后我们删除
						event.data = handleObj.data;
						event.handleObj = handleObj;
		
						var ret = handleObj.handler.apply( this, args );								//执行
	
						if ( ret !== undefined ) {
							event.result = ret;
							if ( ret === false ) {																				
								event.preventDefault();																			//终止默认事件
								event.stopPropagation();																		//中止父级事件冒泡
							}
						}
	
						if ( event.isImmediatePropagationStopped() ) {									//立即中止事件冒泡，默认false
							break;
						}
					}
				}
			}
	
			return event.result;
		},
	
		//特殊事件函数类型过滤和处理
		special: {
			ready: {
				setup: da.bindReady,										//在绑定事件前，确定ready事件已经被初始化
				teardown: da.noop
			},
	
			live: {
				add: function( handleObj ) {
					da.event.add( this, 
						liveConvert( handleObj.origType, handleObj.selector ),
						da.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) ); 
				},
	
				remove: function( handleObj ) {
					da.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
				}
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
	
	//da对象批量扩展bind、one事件绑定函数
	da.each(["bind", "one"], function( i, name ) {
		da.fnStruct[ name ] = function( type, data, fn ) {
			if ( typeof type === "object" ) {										//以键值对的方式绑定事件函数，如：{"click":funcion(){},"dbclick":funcion(){}}
				for ( var key in type ) {
					this[ name ](key, data, type[key], fn);					//递归
				}
				return this;
			}
	
			if ( da.isFunction( data ) || data === false ) {		//有传入的自定义事件函数 或要屏蔽事件
				fn = data;
				data = undefined;
			}
			
			var handler = ( name === "one" ) ? da.proxy( fn, function( event ) {
				da( this ).unbind( event, handler );							//this是事件绑定目标元素对象,因为是一次性事件，所以先移除元素上的事件绑定
				return fn.apply( this, arguments );								//再通过引用方式调用原事件回调函数

			}) : fn;
				
			if ( type === "unload" && name !== "one" ) {				//如果通过bind方式绑定unload, 转成one模式
				this.one( type, data, fn );
	
			}
			else {
				for ( var i = 0, count = this.dom.length; i < count; i++ ) {
					da.event.add( this.dom[i], type, handler, data );					//通过event模块的add函数绑定事件函数
				}
			}
	
			return this;							//返回da对象，便于连续操作
		};
	});
	
	//da对象扩展事件操作函数
	da.fnStruct.extend({
		unbind: function( type, fn ) {
			// Handle object literals
			if ( typeof type === "object" && !type.preventDefault ) {
				for ( var key in type ) {
					this.unbind(key, type[key]);
				}
	
			} 
			else {
				for ( var i = 0, l = this.dom.length; i < l; i++ ) {
					da.event.remove( this.dom[i], type, fn );
				}
			}
	
			return this;
		},
	
		delegate: function( selector, types, data, fn ) {									//通过事件委托的方式，实现动态添加元素拥有相应的绑定事件
			return this.live( types, data, fn, selector );
		},
	
		undelegate: function( selector, types, fn ) {
			if ( arguments.length === 0 ) {
					return this.unbind( "live" );
	
			} else {
				return this.die( types, null, fn, selector );
			}
		},
	
		trigger: function( type, data ) {
			return this.each(function() {
				da.event.trigger( type, data, this );
			});
		},
	
		triggerHandler: function( type, data ) {
			if ( this[0] ) {
				var event = da.Event( type );
				event.preventDefault();
				event.stopPropagation();
				da.event.trigger( event, data, this[0] );
				return event.result;
			}
		},
	
		toggle: function( fn ) {
			// Save reference to arguments for access in closure
			var args = arguments,
				i = 1;
	
			// link all the functions, so any of them can unbind this click handler
			while ( i < args.length ) {
				da.proxy( fn, args[ i++ ] );
			}
	
			return this.click( da.proxy( fn, function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );
	
				// Make sure that clicks stop
				event.preventDefault();
	
				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			}));
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
	});
	
	
	//***************** 扩展部分 Ajax 函数 ***********************/
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


	//***************** 扩展部分 数据操作有关的 函数 *****************/
	//da缓存机制全局变量
	var da_sequence = 0, 
			da_winData = {};
	
	da.extend({
		daData: {},
		
		identifier: "da"+ da.nowId(),	//等同于jQuery expando
		
		noData: {											//可怕的家伙们，这些元素如果想给他们添加唯一标识符da.identifier属性，会抛出无法捕获的异常，真恶心 ??????
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},

		hasData: function( elem ) {
			elem = elem.nodeType ? da.daData[ elem[da.identifier] ] : elem[ da.identifier ];
	
			return !!elem && !isEmptyDataObject( elem );
		},
	
		//da缓存函数
		/*
			obj:	缓存目标对象
			key:	缓存数据索引值
			val:	缓存数据内容
		*/
		data: function(obj, key, val){
				obj = (obj == win) ? da_winData : obj; //如果是窗口全局缓存, da_winData也是一个{}

				var idx = obj[da.identifier];
				var daData = da.daData;
				
				if(!idx) idx = ++da_sequence;					//第一次缓存数据,分配一个唯一识别序号
				
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
			obj = (obj == win) ? da_winData : obj;
	
			var idx = obj[da.identifier],
					daData = da.daData;

			if(key){	//删除缓存数据
				if (daData[idx]){
					delete daData[idx][key];
					
					//如果缓存目标对象,完全没有缓存数据,就删除缓存容器
					if (da.isEmptyObj(daData[idx])){
						da.undata(obj);
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
	
	// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
	// property to be considered empty objects; this property always exists in
	// order to make sure JSON.stringify does not expose internal metadata
	function isEmptyDataObject( obj ) {
		for ( var name in obj ) {
			if ( name !== "toJSON" ) {
				return false;
			}
			
		}
	
		return true;
	};
	

	//全局变量
	win.da = da;
	
})(window);


/***************** 遮罩层 **************************/
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
		    
				var iframeObj, overObj,
						css = "display:block;position:absolute;z-index:-1;background:transparent;top:0px;left:0px;width:100%;height:100%;" ;
		    this.each( function(){
				    iframeObj = document.createElement("iframe");
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
						
				    overObj = document.createElement("div");
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
		        	this.insertBefore( iframeObj );
		        	this.insertBefore( overObj );
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
				
				if( undefined !== daFx )
					da( objMask ).fadeIn(300);
				else
					objMask.style.display = "block";
				
			},
			
			//隐藏遮罩层
			daMaskHide: function( maskWin ){
				maskWin = maskWin || window;
				var objMask = da.daGetMask( maskWin );
				if( !objMask ) return;
				
	//				if( undefined !== daFx )															//异步动作容易出错啊。
	//					da( objMask ).fadeOut(300);
	//				else
					objMask.style.display = "none";
					
			}
		
	});
})(da);

/***************** 加密解密 *************************************/
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
		}
	});
})(da);

/***************** 正则表达式 *****************/
da.extend({
	//通用正则表达式判定函数
	/*
		val: 判定值
		allowEmpty: 是否允许为空
		regexp: 正则表达式字符串
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
		return da.isMatch(val, /^[a-zA-z]+:(\/|\\){2}[^\s]*$/, allowEmpty); 
	},
	
	//判断是否是HTML代码
	isHTML: function(val,allowEmpty){
		return da.isMatch(val, /<(S*?)[^>]*>.*?|< .*? \/>/, allowEmpty);
	}          
	
});

/***************** 功能函数 *****************/
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
	
	//错误图片显示默认路径
	/*
		img:	图片对象
		url:	错误图片地址
	*/
	errorImage: function( img, url ){
		url = url || "/logo.gif";
		
	  da( img ).bind( "error", function(){ 	//图片下载完毕时异步调用callback函数。
			this.src = url;
			da( this ).unbind( "error" );					//防止默认图片也加载失败，陷入嵌套死循环
	  });
		
	},
	
	//预加载图片
	/*
		url:	图片地址
		callback:	加载完毕回调函数
	*/
	loadImage: function( url, fn ) {
	  var img = new Image(); 			//创建一个Image对象，实现图片的预下载
	  img.src = url;
	  if (img.complete) { 				// 如果图片已经存在于浏览器缓存，直接调用回调函数
	      fn.call(img);
	      return; 								// 直接返回，不用再处理onload事件
	  }
	
	  da( img ).bind( "load", function () { 	//图片下载完毕时异步调用callback函数。
	      fn.call(img);												//将回调函数的this替换为Image对象
	  });
	},
	
	/**随机数
	* Min: 范围最小值
	* Max: 范围最大值
	*/
	random: function(Min,Max){
		Min = Min || 0;			//默认范围
		Max = Max || 100;
		var Range = Max - Min;					//范围
		var Rand = Math.random();				//0~1随机值
		var addNum = Rand * Range;			//增量
		return(Min + Math.round(Rand * Range));
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
	    if (da.cookie(name))
	    	document.cookie = name + '=' + ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
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
	
	/**启动闭包封装的setInterval 或 setTimeout（可以通过call的嵌入this上下文，this默认为da类 ）
	* delay 执行延时( 默认启动setTimeout，添加“_loop”后缀启动setInterval )
	* fn	自定义回调函数
	* params 回调传入参数
	*/
	timer: function ( /*delay, fn, params*/ ){
		if( 2 > arguments.length ) return;

		var context = this,
				arrTmp = arguments[0].toString().split("_"),
				delay = parseInt(arrTmp[0]) || 13,
				fn = arguments[1],
				params = [];
		
		if( !da.isFunction( fn ) ) return;
		
		for(var i=2,len=arguments.length; i< len; i++ ){
			params[i-2] = arguments[i];
		}
		
		if( 2 > arrTmp.length ){
			return setTimeout(function(){
				fn.apply( context, params );
			}, delay);
		}
		else{
			return setInterval(function(){
				fn.apply( context, params );
			}, delay);
		}
		
	},
	
	/**
	*/
	clearTimer: function( obj ){
		if( obj ) clearTimeout( obj );
	},
	
	/**启动闭包封装的setInterval（可以通过call的嵌入this上下文，this默认为da类 ）
	* delay 执行延时
	* fn	自定义回调函数s
	* params 回调传入参数
	*/
	keep: function( /*delay, fn, params*/ ){
		if( 2 > arguments.length ) return;
		
		arguments[0] = arguments[0] + "_loop";
		return da.timer.apply( this, arguments );
		
	},
	
	/**
	*/
	clearKeep: function( obj ){
		if( obj ) clearInterval( obj );
	},
	
	/**将sqlserver数据库日期格式转为Date格式
	* params {String} sqlDate 后台直接返回的数据库日期格式字符串
	* params {String} sFormat 日期格式化对照字符串
	*/
	date: function( sqlDate, sFormat ){
		var t = sqlDate.replace("+08:00",""),								//去掉时区后缀
				d = t.split(/[-\.T:]/g);												//通过split()函数 分隔出 [年，月，日，时，分，秒，毫秒] 数组

		d = new Date( d[0],d[1],d[2],d[3],d[4],d[5],d[6]||0 );
		return sFormat ? d.format( sFormat ) : d;
				
	},
	
	/**日期数据加减
	* params {Date|String} dateObj 日期数据
	* params {Int} nValue 间隔差值（相减为负数）
	* params {String} type 计算对象[ "y", "M", "d", "h", "m", "s", "ms" ]，默认为"d"（日）
	*/
	dateAdd: function( dateObj, nValue, type ){
		type = type || "d";
		nValue = parseInt(nValue);
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

/***************** 开发工具 *****************/
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
			containerDiv.style.cssText= "position:fixed; z-Index:99999; width:800px; padding:30px 5px 5px 5px; background:#555;";
			pushDoc.body.insertBefore( containerDiv, pushDoc.body.firstChild );
			
			titleDiv = pushDoc.createElement("div");
			titleDiv.style.cssText= "position:absolute;left:5px;top:0px;height:30px;line-height:30px;width:100%;font-size:12px;color:#f0f0f0;";
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

		}
		
		if( da.isArray( msg ) ){
			for( var i=0,len=msg.length; i<len; i++ ){
				lineObj = pushDoc.createElement("div");
				lineObj.style.backgroundColor = color;
				lineObj.innerHTML = msg[i];
				outDiv.insertBefore( lineObj, outDiv.firstChild );
			}
		}
		else if( da.isHTML( msg ) ){
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
		
	}
});
