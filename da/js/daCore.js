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
		
		daDoc;												//目标窗体Document对象所对应的da对象
		
		//da类属性集
		da.fnStruct = da.prototype = {
			version: "da libary 1.3.5; author: danny.xu; ndate: 2012.5.14",
			
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
	
})(window);
