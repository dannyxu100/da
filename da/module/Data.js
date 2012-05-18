/***************** Data  ***************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: ������Ʋ�������
	version: 1.0.0
*/
(function(da){
	var daRe_multiDash = /([A-Z])/g,
		daRe_brace = /^(?:\{.*\}|\[.*\])$/,

		da_sequence = 0, 
		da_winData = {};

	function isEmptyDataObject( obj ) {									//�˲�һ����������Ƿ�Ϊ��
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
		cache: {},							//daȫ�ֻ�����
		uuid: 0,
		
		expando: "da"+ da.nowId(),		//ÿ��ҳ������һ�����������ƣ�
											//Ԫ��ͨ�����ͬ������ֵ��������Լ��Ļ�����������ȫ�ֻ������е�������
		
		noData: {							//���µļһ��ǣ���ЩԪ���������������Ψһ��ʶ��da.expando���ԣ����׳��޷�������쳣������� ??????
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},

		hasData: function( elem ) {
			elem = elem.nodeType ? da.cache[ elem[da.expando] ] : elem[ da.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},

		acceptData: function( elem ) {						//�ж�һ��Ԫ���Ƿ��ܹ����л���������ز���
			if ( elem.nodeName ) {							//�ų�����Ԫ������ �磺embed��applet��
				var match = da.noData[ elem.nodeName.toLowerCase() ];		

				if ( match ) {
					return !(match === true || elem.getAttribute("classid") !== match);
				}
			}
			return true;
		},
		
		//da���溯��
		/*
			obj:	����Ŀ�����
			key:	������������ֵ
			val:	������������
		*/
		data: function(obj, key, val, pvt/*�ڲ�˽��*/ ){
			if ( !da.acceptData( obj ) ) return;
			
			var pvtCache,									//�ڲ�˽�в��ֻ�������
				thisCache,									//�û����Ų��ֻ�������
				internalKey = da.expando,
				getByName = typeof key === "string",
				isNode = obj.nodeType,						//����IE��GC�������ջ��Ʋ�ͬ������DOMԪ�غ�js����Ĵ���ʽ��һ��
				cache = isNode ? da.cache : obj,			//ֻ��DOMԪ����Ҫȫ�ֵ�cache����ͨjs�������ݿ���ֱ��ָ����һ������
				id = isNode ? obj[ internalKey ] : obj[ internalKey ] && internalKey,
				isEvents = ("events" === key),
				ret;
			
			
			if ( getByName 									//get����ʱ����Ŀ�����û���κλ������ݣ�ֱ�ӷ��ء�
			&& undefined === val 
			&& (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data))) {
				return;
			}

			if ( !id ) {
				if ( isNode ) {								//ֻ��DOMԪ�ز���Ҫһ��ȫ�ֻ�����������
					obj[ internalKey ] = id = ++da.uuid;
				}
				else {
					id = internalKey;
				}
			}
			
			if ( !cache[ id ] ) {							//ȷ���������ǿյ�,����ʼ��
				cache[ id ] = {};

				// Avoids exposing jQuery metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					cache[ id ].toJSON = da.noop;
				}
			}
			
			if ( "object" === typeof key || "function" === typeof key ) {		//�Լ�ֵ�Եķ�ʽ����set����
				if ( pvt ) {													//˽�в���
					cache[ id ] = da.extend( cache[ id ], key );				//set����,ͨ��da.extend()������Ŀ����л�������
				} 
				else {															//���Ų���
					cache[ id ].data = da.extend( cache[ id ].data, key );
				}
			}

			pvtCache = thisCache = cache[ id ];

			if ( !pvt ) {									//Ϊ�˱���da���ڲ�ʹ�û��������������û�ʹ�û�������ͻ��
				if ( !thisCache.data ) {					//����Ĵ洢�ṹ�ǣ��û�ʹ�û����������Ϊ"data"�Ķ���Ƕ���ڲ�ʹ�û�������С�
					thisCache.data = {};
				}

				thisCache = thisCache.data;					//����û�ʹ�û������
			}
	
			if ( undefined !== val ) {						//set����
				thisCache[ da.camelCase( key ) ] = val;
			}

			if ( isEvents && !thisCache[ key ] ) {			//�û���������"events"��Ϊkey,��ȡ��DOMԪ���ϵļ����¼���ػ���
				return pvtCache.events;						//��Ȼǰ���ǣ����û���ʹ�õĿ�������û�ж���key��ͬ������
			}

			if ( getByName ) {								//get����,������ָ��������
				ret = thisCache[ key ];						//ԭ���������ݣ����᲻�����ݣ�ת�����շ��ʽ����������
				
				if ( ret == null ) {
					ret = thisCache[ da.camelCase( key ) ];
				}
			} 
			else {											//get������ȫ��
				ret = thisCache;
			}
			
			return ret;
		},

		/**�ڲ�˽��
		*/
		_data: function( obj, name, data ) {
			return da.data( obj, name, data, true );
		},

		//daɾ�����溯��
		/*
			obj: ����Ŀ�����
			key: ������������ֵ
		*/
		removeData: function(obj, key, pvt/*�ڲ�˽��*/) {
			if ( !da.acceptData( obj ) ) return;

			var thisCache,
				internalKey = da.expando,
				isNode = obj.nodeType,					//����IE��GC�������ջ��Ʋ�ͬ������DOMԪ�غ�js����Ĵ���ʽ��һ��
				cache = isNode ? da.cache : obj,		//ֻ��DOMԪ����Ҫȫ�ֵ�cache����ͨjs�������ݿ���ֱ��ָ����һ������
				id = isNode ? obj[ internalKey ] : internalKey;

			if ( !cache[ id ] ) return;					//û��Ŀ������κλ��棬ֱ�ӷ���
			
			if ( key ) {
				thisCache = pvt ? cache[ id ] : cache[ id ].data;	//���ڲ������������û���������

				if ( thisCache ) {
					if ( !da.isArray( key ) ) {						//֧�����顢�ո�ָ��ķ�ʽ��������
						if ( key in thisCache ){ 					//�ж��Ƿ�ֵ����
							key = [ key ];
						}
						else {
							key = da.camelCase( key );
							if ( key in thisCache ) {				//תΪ�շ��ʽ�����ж��Ƿ�ֵ����
								key = [ key ];
							} 
							else {									//ȷ��Ϊ�ո�ָ��ķ�ʽ��������
								key = key.split( " " );
							}
						}
					}

					for ( var i = 0, len = key.length; i < len; i++ ) {
						delete thisCache[ key[i] ];
					}

					if ( !( pvt ? isEmptyDataObject : da.isEmptyObj )( thisCache ) ) {		//��������Ȼ���������������ݣ���ʱ�Ϳ������˳��ˡ�
						return;
					}
				}
			}

			if ( !pvt ) {										//�������Ѿ�û�������κλ��������ˣ��ͽ�����������Ҳ����
				delete cache[ id ].data;

				if ( !isEmptyDataObject(cache[ id ]) ) {		//�ⲿ�û���������������ڲ�˽�õĻ�����
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

	da.fn.extend({
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

