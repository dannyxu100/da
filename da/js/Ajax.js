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