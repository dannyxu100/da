/***************** 库功能函数 *****************/
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
		}
		
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
