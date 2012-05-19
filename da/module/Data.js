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

