/***************** Ajax ***********************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Ajax�첽���������� ���Ĵ���
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
	//��չ��ajaxȫ�ֺ���
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
		
		//��request����ı�Ԫ��������ֵ�Բ����������л�Ϊһ����ѯ�ַ���
		/*
			a: ��Ԫ��������ֵ�Բ�����
			traditional: �Ƿ��ô�ͳ�ķ�ʽ�����л�����
		*/
		param: function( a, traditional ) {
			var s = [],
					add = function( key, value ) {
						value = da.isFunction(value) ? value() : value;																//�������ֵ�Ǻ������ͣ��͵��ú������ٻ�÷���ֵ
						s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);		//���������Ͳ���ֵ�������ѹ����ʱ����
					};
			
			if ( traditional === undefined ) {						//�ϰ汾traditionalΪtrue
				traditional = da.ajaxSettings.traditional;
			}
			
			//if ( da.isArray(a) || a.jquery ) {
			if ( da.isArray(a) ) {												//��������a���������ͣ����ȼٶ����Ǳ�DOM����Ԫ�ؼ�,��Ԫ�ص�name��value,�ֱ�ӳ�䵽key��value
				da.each( a, function() {										//���л���Ԫ������
					add( this.name, this.value );
				});
				
			} 
			else {																				//��������a�Ǽ�ֵ�Բ�����
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for ( var prefix in a ) {
					buildParams( prefix, a[prefix], traditional, add );				//��Լ�ֵ�ԣ������Ƕ༶��ר��дһ��buildParams()���������л�
				}
			}
			
			return s.join("&").replace(daRe_20, "+");					//��&���ŷָ�,������ʱ���飬���ѿո�(" ")����encodeURIComponent()�����������ַ�"%20"�滻Ϊ"+"��
		},
		
		ajaxSetup: function( settings ) {								//ajaxȫ������
			da.extend( da.ajaxSettings, settings );
		},
	
		ajaxSettings: {	
			url: location.href,																		//�����ַ
			global: true,
			type: "GET",																					//����ģʽ
			contentType: "application/x-www-form-urlencoded",			//������Ϣ��������ʱ���ݱ������͡�Ĭ��ֵ�ʺϴ���������
			processData: true,																		//�Ƿ�����������ֵ
			async: true,																					//�Ƿ��첽
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
	
		//�첽���ݷ���
		/*
			origSettings: ������
			{������: ��ѡֵ = 
				[type: "GET"/"POST"/"PUT"/"DELETE" = "GET"],
				[url: "" = location.href],
			}
		*/
		ajax: function( origSettings ) {
			var s = da.extend( true, {}, da.ajaxSettings, origSettings ),					//��ajaxSettings��origSettings����ϲ������s�ֲ�����
				jsonp, 																							//jsonp��ʱ����
				status, 																						//request�������״̬
				data, 																							//�������ش����ݻ���
				type = s.type.toUpperCase(), 												//����ʽ���� "POST" �� "GET"( Ĭ��Ϊ "GET" )
				noContent = daRe_noContent.test( type );
	
			s.url = s.url.replace( daRe_hash, "" );								//ȥ��urlê�������#������
			s.context = ( origSettings && origSettings.context != null ) ? 
									origSettings.context : s;																	//ajax��ػص�����(success,error,complate)��������,����û��ṩ��������,�����ṩ�ġ�( Ĭ��this��ָ����ñ���ajax����ʱ���ݵ�options���� )
	
			if ( s.data && s.processData && ( "string" !== typeof s.data ) ) {		//����д�������data������ֵ��������Ҫ����������processData( Ĭ��Ϊtrue )������data�������ַ�������ʽ���룬������תΪ��ѯ�ַ���
				s.data = da.param( s.data, s.traditional );
			}
	
			//************ ��jsonp��ʽע��ص��������� begin ******************/
			if ( s.dataType === "jsonp" ) {												//����jsonp������
				if ( type === "GET" ) {															//�����getģʽ
					if ( !daRe_jsre.test( s.url ) ) {									//��֤getģʽ�µ�url��ַ���� callback=? ��֮��Ĵ������ϻص�������
						s.url += (rquery.test( s.url ) ? "&" : "?") 
											+ (s.jsonp || "callback") 
											+ "=?";
					}
				}
				else if ( !s.data || !daRe_jsre.test(s.data) ) {		//�������getģʽ,������data������Ҳû�� callback=? �ͼ���ò���ģ��
					s.data = (s.data ? s.data+"&" : "") 
										+ (s.jsonp || "callback") 
										+ "=?";
				}
				s.dataType = "json";																//��Ϊjsonp��json��ʽ����չ
			}
	
			if ( s.dataType === "json" && (s.data && daRe_jsre.test(s.data) || daRe_jsre.test(s.url)) ) {			//������ݸ�ʽ��json���ҷ���ӵ�� callback=? ����ģ�͵�����,�Ͷ��乹��json��ʱ����
				jsonp = s.jsonpCallback || ("jsonp" + jsc++);				//���û�д������ ����Ĭ��jsonp+ΨһID �ĸ�ʽ
	
				if ( s.data ) {
					s.data = (s.data + "").replace( daRe_jsre, "=" + jsonp + "$1" );	//�滻�������data������ callback=?�Ĳ���ģ��,$1Ϊ����ʶ���׺
				}
		
				s.url = s.url.replace( daRe_jsre, "=" + jsonp + "$1" );							//�滻url������ callback=?�Ĳ���ģ��,$1Ϊ����ʶ���׺
	
				s.dataType = "script";															//��֤���jsonp�ĸ�ʽ��script,�������ܱ�֤���������ش��뱻��ȷִ��
	
				var customJsonp = window[ jsonp ];									//����jsonp��������
				
				window[ jsonp ] = function( tmp ) {									//�ڵ�ǰҳ��ע��һ��jsonp�ص�����,��֮���ajax����������󷵻�ִ����
						if ( da.isFunction( customJsonp ) ) {						//����ͻ���ͬ����Ա Ҳ��һ������������ִ�пͻ���ͬ������
							customJsonp( tmp );
		
						}
						else {																					//��Դ���յ�ǰjsonp�ص�����
							window[ jsonp ] = undefined;
							try {
								delete window[ jsonp ];
							} catch( jsonpError ) {};
							
						}
		
						data = tmp;																			//�������ش��������ݻ���
						da.handleSuccess( s, xhr, status, data );				//����Success�ص�����
						da.handleComplete( s, xhr, status, data );			//����Complete�ص�����
						
						if ( head ) {
							head.removeChild( script );										//ȥ��head�м����scriptԪ��
						}
						
				};
			}
			//************ ��jsonp��ʽע��ص��������� end ******************/
	
	
			//************ ��scriptTag��ʽִ�лص����� begin ******************/
			if ( s.dataType === "script" && s.cache === null ) {
				s.cache = false;
			}
	
			if ( s.cache === false && noContent ) {								//cache: false����ʱ���
				var ts = da.nowId();
	
				var ret = s.url.replace( daRe_ts, "$1_=" + ts );		//����_=���滻��$1_=ʱ�����
				s.url = ret + ((ret === s.url) ? ( (daRe_query.test(s.url) ? "&" : "?") + "_=" + ts ) : "");		//���ûӴ�滻�����������ں���׷��ʱ���
				
			}
	
			if ( s.data && noContent ) {													//����GET|HEAD�������󣬲���data������Ч����data���������ӵ�url�����б���
				s.url += ( daRe_query.test(s.url) ? "&" : "?" ) + s.data;
			}
	
			if ( s.global && da.active++ === 0 ) {								//��Ҫ����ajaxȫ�ֺ���ajaxStart(Ĭ��Ϊtrue)���������da.active Ϊ 0������һ���µ��������
					da.event.trigger( "ajaxStart" );
			}
	
			var parts = daRe_url.exec( s.url ),										//��������url��ַ,���ұ���domain
					remote = parts && (parts[1] && parts[1].toLowerCase() !== location.protocol || parts[2].toLowerCase() !== location.host);		//location�ǵ�ǰwindow�����ԣ���url��ַ�Ƚϣ��ж��Ƿ�Զ�̿���
	
			if ( s.dataType === "script" && type === "GET" && remote ) {						//����������һ����Զ�̿�����ĵ������ҳ��Լ���getģʽ�µ�json��script
				var head = document.getElementsByTagName("head")[0] || document.documentElement;
				var script = document.createElement("script");
				if ( s.scriptCharset ) {														//scriptCharset�ű�����
					script.charset = s.scriptCharset;
				}
				script.src = s.url;																	//js�ļ���ַԴ
	
				if ( !jsonp ) {																			//�������jsonp����script,ͨ��scriptԪ�ص�onload��onreadystatechange�¼��������ص�����
					var done = false;
	
					script.onload = script.onreadystatechange = function() {
							if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
									done = true;
									da.handleSuccess( s, xhr, status, data );							//����Success�ص�����
									da.handleComplete( s, xhr, status, data );						//����Complete�ص�����
			
									script.onload = script.onreadystatechange = null;			//��Դ���յ�ǰjsonp�ص�����
									if ( head && script.parentNode ) {
											head.removeChild( script );
									}
							}
					};
					
				}
	
				head.insertBefore( script, head.firstChild );								//��insertBefore��������appendChild��Ҫ����� IE6��bug.
	
				return undefined;				//�Ѿ�ʹ����scriptԪ��ע��������
			}
			//************ ��scriptTag��ʽִ�лص����� end ******************/
	
			var requestDone = false;	//request����״̬
			var xhr = s.xhr();				//����һ��XMLHttpRequest����
			if ( !xhr ) return;
	
			if ( s.username ) {																						//����һ���������ӣ���Opera�������usernameΪnull���ᵯ����¼���棬����Ҫ����username��password
				xhr.open(type, s.url, s.async, s.username, s.password);
			}
			else {
				xhr.open(type, s.url, s.async);
				
			}
	
			try {											//��ֹfirefox�ڿ��������ʱ�򱨴���������try��catch
				if ( ( s.data != null && !noContent ) 
						|| ( origSettings && origSettings.contentType ) ) {			//���content-type���ض��Ĳ�����������content-type
					xhr.setRequestHeader("Content-Type", s.contentType);			//contentType(Ĭ��: "application/x-www-form-urlencoded") ������Ϣ��������ʱ���ݱ������͡�Ĭ��ֵ�ʺϴ���������
				}
	
				if ( s.ifModified ) {																				//ifModified(Ĭ��: false) ���ڷ��������ݸı�ʱ��ȡ�����ݡ�ʹ�� HTTP �� Last-Modified ͷ��Ϣ�жϡ���Ҳ���������ָ����'etag'��ȷ������û�б��޸Ĺ���
					if ( da.lastModified[s.url] ) {
						xhr.setRequestHeader("If-Modified-Since", da.lastModified[s.url]);
					}
	
					if ( da.etag[s.url] ) {
						xhr.setRequestHeader("If-None-Match", da.etag[s.url]);
					}
				}
	
				if ( !remote ) {																						
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");						//����requestͷ���÷�����֪������һ��XMLHttpRequest���ⲻ��һ��������ʵ�xhr����ô��ֻ�ᷢ�����ͷ��Ϣ
				}
	
				xhr.setRequestHeader("Accept", ( s.dataType && s.accepts[ s.dataType ] ) ? 
																					( s.accepts[ s.dataType ] + ", */*; q=0.01" ) : s.accepts._default );			//����dataType����ֵ������acceptsͷ�����ݸ�����������ܽ��յ�content-type����(Ĭ��Ϊ��������*/*)
				
			} catch( headerError ) {}
	
			if ( s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false ) {		//beforeSend()���غ�����������ڷ���reqest����֮ǰ�����жϣ����beforeSend()��������ֵΪfalse����ô���reqest���󽫱��ж�
				if ( s.global && da.active-- === 1 ) {					//��reqest������ֹ���������� -1
					da.event.trigger( "ajaxStop" );
				}
	
				xhr.abort();																		//��ֹrequest����
				return false;
			}
			
			if ( s.global ) {																	//����ajaxȫ�ֺ���ajaxSend
				da.triggerGlobal( s, "ajaxSend", [xhr, s] );
			}

			//readyState״̬˵��
			//
			//(0)δ��ʼ��
			//			�˽׶�ȷ��XMLHttpRequest�����Ƿ񴴽�����Ϊ����open()��������δ��ʼ������׼����ֵΪ0��ʾ�����Ѿ����ڣ�����������ᱨ�������󲻴��ڡ�
			//(1)����
			//			�˽׶ζ�XMLHttpRequest������г�ʼ����������open()���������ݲ���(method,url,true)��ɶ���״̬�����á�������send()������ʼ�����˷�������ֵΪ1��ʾ���������˷�������
			//(2)�������
			//			�˽׶ν��շ������˵���Ӧ���ݡ�����õĻ�ֻ�Ƿ������Ӧ��ԭʼ���ݣ�������ֱ���ڿͻ���ʹ�á�ֵΪ2��ʾ�Ѿ�������ȫ����Ӧ���ݡ���Ϊ��һ�׶ζ����ݽ�������׼����
			//(3)����
			//			�˽׶ν������յ��ķ���������Ӧ���ݡ������ݷ���������Ӧͷ�����ص�MIME���Ͱ�����ת������ͨ��responseBody��responseText��responseXML���Դ�ȡ�ĸ�ʽ��Ϊ�ڿͻ��˵�������׼����״̬3��ʾ���ڽ������ݡ�
			//(4)���
			//			�˽׶�ȷ��ȫ�����ݶ��Ѿ�����Ϊ�ͻ��˿��õĸ�ʽ�������Ѿ���ɡ�ֵΪ4��ʾ���ݽ�����ϣ�����ͨ��XMLHttpRequest�������Ӧ����ȡ�����ݡ�
			//�Ŷ���֮������XMLHttpRequest�������������Ӧ�ð������½׶Σ�
			//��������ʼ�����󣭷������󣭽������ݣ��������ݣ����
			var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {					//����response���أ�����һ��onreadystatechange����������ҪΪ����ص���
						if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {							//������ֹ
								if ( !requestDone ) {																										//Opera�����xhr��ֹ�˲������onreadystatechange,����ģ�����һ��
									da.handleComplete( s, xhr, status, data );
								}
				
								requestDone = true;
								if ( xhr ) {
									xhr.onreadystatechange = da.noop;			//�ı�״̬, �ÿ���Ϣ����
								}
			
						}
						else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {					//������󴫵���ɲ���������Ч ��������ʱ��
								requestDone = true;
								xhr.onreadystatechange = da.noop;
				
								status = ( isTimeout === "timeout" ) ? "timeout" : 
																					!da.httpSuccess( xhr ) ? "error" : 
																					s.ifModified && da.httpNotModified( xhr, s.url ) ? "notmodified" : "success";
				
								var errMsg;
				
								if ( status === "success" ) {
									try {																					//����XML document�����쳣
										data = da.httpData( xhr, s.dataType, s );		//�����ӷ�������õ����� process the data (runs the xml through httpData regardless of callback)
									} catch( parserError ) {
										status = "parsererror:������HTTP����ʱ�쳣��";
										errMsg = parserError;												//�������exception����ֵ��errMsg����
									}
								}
				
								if ( status === "success" || status === "notmodified" ) {			//���request״̬Ϊ"δ�޸�"��"�ɹ�",����"��ʱ"��"����"
									if ( !jsonp ) {																//��jsonp��ִ��Success�ص���������Ϊjsonp��������ע��Ļص�����
										da.handleSuccess( s, xhr, status, data );
									}
								}
								else {																												//���request״̬Ϊ"��ʱ"��"����"
									da.handleError( s, xhr, status, errMsg );			//ִ��Error�ص�����
								}
				
								if ( !jsonp ) {																	//��jsonpģʽ����󴥷�Complete����
									da.handleComplete( s, xhr, status, data );
								}
				
								if ( isTimeout === "timeout" ) {								//���request����Ϊ��ʱ���ͽ�xhr��ֹ
									xhr.abort();
								}
				
								if ( s.async ) {																//���Ϊ�첽����xhr�ÿ�
									xhr = null;
								}
						}
			};
	
			try {														//������ֹ������Opera�������request��ֹ��ʱ���ᴥ��onreadystatechange����
				var oldAbort = xhr.abort;
				xhr.abort = function() {
					if ( xhr ) {
						Function.prototype.call.call( oldAbort, xhr );		//��Ϊ��IE7��oldAbort����������call���ԣ��޷�ͨ��oldAbort.call()��ʽ���ã�����ֻ�н���Function.prototype.call()ԭ�ͺ���������
					}
					onreadystatechange( "abort" );											//�ص����涨��ļ�������
					
				};
			} catch( abortError ) {}
	
			if ( s.async && s.timeout > 0 ) {				//�첽���󣬲����г�ʱ����ֵ���룬��ͨ��setTimeout()����������һ����ʱ��
				setTimeout(function() {
					if ( xhr && !requestDone ) {				//�˶����request������Ȼδ��ɣ��ͻص�������ʱ�¼�
						onreadystatechange( "timeout" );
					}
				}, s.timeout);
				
			}
	
			try {																		//����request����
				xhr.send( noContent || s.data == null ? null : s.data );
	
			} 
			catch( sendError ) {										//��������ʽ�����쳣���ʹ���Error������Complete����
				da.handleError( s, xhr, null, sendError );
				da.handleComplete( s, xhr, status, data );
			}
	
			if ( !s.async ) {												//����ͬ������ firefox1.5��������ܴ���onreadystatechange��������Ҫ��Ԥ����
				onreadystatechange();
			}
	
			return xhr;								//����xhr�����Ա���������ֹrequest�������������
		}
	
	});

	//���л���ֵ�Զ༶�Ͳ�����
	/*
		prefix:	��ֵ�Եļ�key
		obj:	��ֵ�Ե�ֵvalue(����Ҳ�Ǽ�ֵ�Զ�������飬�༶)
		traditional:	�Ƿ����ϵķ�ʽ���л�
		add: ���л����ַ���������ʱ����ص���������
	*/
	function buildParams( prefix, obj, traditional, add ) {
		if ( da.isArray(obj) && obj.length ) {																	//�������Ϊ��������
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
		else if ( !traditional && obj != null && typeof obj === "object" ) {		//�������Ϊ��ֵ������
			if ( da.isEmptyObj( obj ) ) {
				add( prefix, "" );
			} 
			else {
				da.each( obj, function( k, v ) {
					buildParams( prefix + "[" + k + "]", v, traditional, add );
				});
			}
						
		}
		else {																																	//û��������
			add( prefix, obj );
		}
	}
	
	// This is still on the jQuery object... for now
	// Want to move this to jQuery.ajax some day
	da.extend({
		active: 0,											//�첽���������
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		handleError: function( s, xhr, status, e ) {
			if ( s.error ) {																			//�����error�ص�����,`��Ҫ����error�ص�����
				s.error.call( s.context, xhr, status, e );
			}

			if ( s.global ) {																			//�����ajaxError�ص�����,`��Ҫ����ajaxError�ص�����
				da.triggerGlobal( s, "ajaxError", [xhr, s, e] );
			}
		},
	
		handleSuccess: function( s, xhr, status, data ) {
			if ( s.success ) {																		//�����success�ص�����,`��Ҫ����success�ص�����
				s.success.call( s.context, data, status, xhr );
			}
	
			if ( s.global ) {																			//��Ҫ����ajaxȫ�ֵ�ajaxSuccess�ص�����,Ĭ��Ϊtrue
				da.triggerGlobal( s, "ajaxSuccess", [xhr, s] );
			}
		},
	
		handleComplete: function( s, xhr, status ) {
			if ( s.complete ) {																		//�����complete�ص�����,`��Ҫ����complete�ص�����
				s.complete.call( s.context, xhr, status );
			}
	
			if ( s.global ) {																			//��Ҫ����ajaxȫ�ֵ�ajaxComplete�ص�����,Ĭ��Ϊtrue
				da.triggerGlobal( s, "ajaxComplete", [xhr, s] );
			}
	
			if ( s.global && da.active-- === 1 ) {								//���첽���������Ϊ 1 ʱ����ajaxȫ�ֵ�ajaxStop�ص�����,Ĭ��Ϊtrue
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