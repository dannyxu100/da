/***************** Tools ���ܺ��� *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: �⹦�ܺ���
	version: 1.0.0
*/
(function(da){
	da.extend({
		//��ȡ��������ͺͰ汾
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
		
		//���������ܲ���ʱʹ����testA()��testB()����֮�䣬����Ҫ���ԵĴ�������ʱ��(�첽������Ч)
		testTime: null,
		
		//��ʼ
		testA: function(){
			da.testTime = new Date();
		},
		
		//��ֹ������ʱ�����Ϣ
		testB: function(){
			var now = new Date();
			return ["��ʱ��",(now - da.testTime),"ms"].join("");
		},
		
		//��������ݷ��������
		copy: function(sText,sTitle){
			sTitle = sTitle || "Text";
			
			if (window.clipboardData) {				//IE
				window.clipboardData.clearData();   
			  return ( window.clipboardData.setData( sTitle,sText ) );			//���Ƶ�������
			}
			else if(navigator.userAgent.indexOf("Opera") != -1) {    
				window.location = sText;    
			}
			else if (window.netscape) {
			try{
				netscape.security.PrivilegeManager.enablePrivilege( "UniversalXPConnect" );    
			}
			catch(e){
				alert("��������ܾ���\n�����������ַ������'about:config'���س�\nȻ��[ signed.applets.codebase_principal_support ]����Ϊ'true'");
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
			alert( "���Ƴɹ���" )    
			}

			return false;
		},
		
		
		//���������Ϣ
		/*
			msg: ������Ϣ
			color: ������Ϣ����ɫ
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
				titleDiv.innerHTML = "������Ϣ";
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
			
			if( da.isArray( msg ) ){							//�ж��Ƿ�Ϊ����
				for( var i=0,len=msg.length; i<len; i++ ){
					lineObj = pushDoc.createElement("div");
					lineObj.style.backgroundColor = color;
					lineObj.innerHTML = msg[i];
					outDiv.insertBefore( lineObj, outDiv.firstChild );
				}
			}
			else if( /<|&#?\w+;/.test( msg ) ){					//�ж��Ƿ���Ԫ�ر�ǩ
				lineObj = pushDoc.createElement("textarea");
				lineObj.value = "���룺\n" + msg;
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
				closeDiv.title = "�ر�";
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
		
		//���û��ȡcookie
		cookie: function( name, value, expires, path, domain, secure ) {
				//get����
				if( undefined == value ){
					var start = document.cookie.indexOf( name + "=" ),
						len = start + name.length + 1;
						
						if ( start == -1 ) return null;													//û���ҵ���Ӧname��cookie;
					if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) return null;			//�ҵ������ǵ�һ��,��������Ƕ�Ӧ��name
					
					var end = document.cookie.indexOf( ';', len );					//da�Զ���cookieĬ�ϸ�ʽ,��Ч�ڡ�·���Ȳ�����ͨ��"��"�ָ���,ȡֵֻ��ȡ����һ���ֺ�Ϊֹ
					if ( end == -1 ) end = document.cookie.length;					//���û�а�daĬ�ϸ�ʽ"��",��ֱ��ȡ��
					
					return unescape(document.cookie.substring(len, end));
				}
				//set����
			var expires_date = null,
					today = new Date();																	//��ȡ��ǰʱ��
			
			today.setTime(today.getTime());
			if (expires) expires = expires * 1000 * 60 * 60 * 24;		//��Чʱ�� ��λ��
			expires_date = new Date( today.getTime() + ( expires ) );
			
			document.cookie = [
					name, "=", escape(value),
					( ( expires ) ? ';expires=' + expires_date.toGMTString() : '' ),
					( ( path ) ? ';path=' + path : ''),
					( ( domain ) ? ';domain=' + domain : '' ),
					( ( secure ) ? ';secure' : '' )
			].join("");
			
		},
		
		//ɾ��cookie
		removeCookie: function(name, path, domain) {
			if (da.cookie(name))
				document.cookie = name + '=' + ((path) ? ';path=' + path: '') + ((domain) ? ';domain=' + domain: '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
		},
		
		//Ԥ����ͼƬ
		/*
			url:	ͼƬ��ַ
			callback:	������ϻص�����
		*/
		loadImage: function( url, fn ) {
		  var img = new Image(); 			//����һ��Image����ʵ��ͼƬ��Ԥ����
		  img.src = url;
		  if( !da.isFunction(fn) ) return;
		  
		  if (img.complete) { 				// ���ͼƬ�Ѿ���������������棬ֱ�ӵ��ûص�����
			fn.call(img);
		  }
			else{
			  da( img ).bind( "load", function () { 	//ͼƬ�������ʱ�첽����callback������
					fn.call(img);													//���ص�������this�滻ΪImage����
			  });
			}
		},
		
		/**�����
		* Min: ��Χ��Сֵ
		* Max: ��Χ���ֵ
		*/
		random: function (Min,Max){
			Min = Min || 0;			//Ĭ�Ϸ�Χ
			Max = Max || 100;
			var Range = Max - Min;					//��Χ
			var Rand = Math.random();				//0~1���ֵ
			var addNum = Rand * Range;			//����
			return(Min + Math.round(Rand * Range));
		},
		
		/**����
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
		
		
		//��ȡurl����
		/*
			url:	��ַ��
		*/
		urlParams: function( url ){
			url = url || location.search.substring(1);      		//��ȡҪ��ѯ��url��ַ��
			
			var	arrPair = url.split(/[\&\?]/g),              		//�п�����
				args = {}, idx;
			 
			 for(var i=0; i < arrPair.length; i++) {
				idx = arrPair[i].indexOf('=');         				//ͨ��"="���ֲ���
				if (idx == -1) continue;                   			//û���ҵ�"="����,ֱ������
				 
				 var argName = arrPair[i].substring( 0, idx ); 		//��ȡ������
				 var argValue = arrPair[i].substring( idx + 1 );	//��ȡ����ֵ
				 //value = decodeURIComponent(value);        		//�����Ҫ���Ա���
				 args[argName] = argValue;                    		//������map����
			 }
			 return args;                                   		//�������������б����
		},
		
		//��ȡ�������ҳ��Ĵ������
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
		
		/**��sqlserver���ݿ����ڸ�ʽתΪDate��ʽ
		* params {String} sqlDate ��ֱ̨�ӷ��ص����ݿ����ڸ�ʽ�ַ���
		* params {String} sFormat ���ڸ�ʽ�������ַ���
		*/
		db2date: function( sqlDate, sFormat ){
			var t = sqlDate.replace("+08:00",""),								//ȥ��ʱ����׺
				d = t.split(/[-\.\/T:]/g);										//ͨ��split()���� �ָ��� [�꣬�£��գ�ʱ���֣��룬����] ����

			d = new Date( d[0],d[1],d[2],d[3],d[4],d[5],d[6]||0 );
			return sFormat ? d.format( sFormat ) : d;
					
		},
		
		/**�������ݼӼ�
		* params {Date|String} dateObj ��������
		* params {Int} nValue �����ֵ�����Ϊ������
		* params {String} type �������[ "y", "M", "d", "h", "m", "s", "ms" ]��Ĭ��Ϊ"d"���գ�
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
		
		//������󳤶��ַ���
		/*
			str: Ŀ���ַ���
			mxlen: ��󳤶�
		*/
		limitStr: function(str,mxlen){
			return str.length > mxlen ? str.substring(0,mxlen-3)+"��":str;
		},
		
		/**��ҳ�涯̬Ƕ����ʽin-inline-css
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
		
		/**ȥhtmlԪ��
		*/
		deleteHtml: function( str ){
			return str.replace( /<("[^"]*"|'[^']*'|[^'">])*>/gi, "");
		},
		
		/**��������ֵ��ʽ��
		*/
		fmtFloat: function( val, fmt ){
			return new Number( val ).format( fmt );
		},
		
		/**���ڸ�ʽ��
		*/
		fmtDate: function( sdate, fmt ){
			if( "" === da.isNull(sdate,"")) return sdate;
		
			if( sdate instanceof Date ){
				sdate = sdate.format("yyyy-mm-dd hh:nn:ss i");
			}
		
			var tmp = sdate.replace("+08:00",""),							//ȥ��ʱ����׺(���ݿ�洢��ʽ)
				isCN, d;

			if( isCN = (0 <= fmt.indexOf("/p")) )							//�ж�����ģʽ
				fmt = fmt.replace(/\/p/g, "");

			d = sdate.split(/[-\.\/T\s:]|\+08:00/g);						//ͨ��split()���� �ָ��� [�꣬�£��գ�ʱ���֣��룬����] ����
																			//���ܳ��ֵķָ����У�"-", ".", "/", "T", " ", ":", "+08:00"
			for(var i=0,len=d.length; i<len; i++){							//�������ݸ�ʽ
				d[i] = parseInt( d[i] || 0,10 );
			}
																			
			var date = new Date( d[0], d[1]-1, d[2], d[3]||0, d[4]||0, d[5]||0, d[6]||0 );
			
			if( !isCN ) return fmt ? date.format( fmt ) : date;				//������ģʽ�����ٽ�������Ĵ���
			
			
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
				
			if( 0 > ntime ){	//��ȥʱ
				// ntime *= -1;						//����ʱ������

				if( "undefined" != typeof d[0] && d[0]!=d2[0] ){										//��ͬ��
					switch( d2[0]-d[0] ){
						case 1: return "<span style='color:#900'>ȥ��</span>" + date.format( "m��d��" );
						case 2: return "<span style='color:#900'>ǰ��</span>" + date.format( "m��d��" );
						default: return fmt ? date.format( fmt ) : date;
					}
				}
				else if( "undefined" != typeof d[1] && d[1]!=d2[1] ){									//ͬ��,��ͬ��
					switch( Math.abs(d2[1]-d[1]) ){
						case 1: 
							return "<span style='color:#900'>�ϸ���</span>" + date.format( "d��" );
						case 2: 
							return "<span style='color:#900'>������ǰ</span>" + date.format( "d��" );
						case 3: 
							return "<span style='color:#900'>������ǰ</span>" + date.format( "d��" );
						default: return date.format( "m��d��" );
					}
				}
				else if( "undefined" != typeof d[2] && d[2]!=d2[2] ){									//ͬ��,ͬ��,��ͬ��
					switch( Math.abs(d2[2]-d[2]) ){
						case 1:
							return "<span style='color:#900'>����</span>" + date.format( "hʱn��" );
						case 2:
							return "<span style='color:#900'>ǰ��</span>" + date.format( "hʱn��" );
						case 3:
							return "<span style='color:#900'>����ǰ</span>" + date.format( "hʱn��" );
						default:
							return "<span style='color:#900'>����</span>" + date.format( "d��" );
					}
				}
				else if( "undefined" != typeof d[3] && d[3]!=d2[3] ){									//ͬ��,ͬ��,ͬ��,��ͬСʱ
					switch( Math.abs(d2[3]-d[3]) ){
						case 1:
							return "<span style='color:#900'>ǰ1Сʱ</span>" + date.format( "n��" );
						case 2:
							return "<span style='color:#900'>ǰ2Сʱ</span>" + date.format( "n��" );
						case 3:
							return "<span style='color:#900'>ǰ3Сʱ</span>" + date.format( "n��" );
						default:
							return "<span style='color:#900'>����</span>" + date.format( "hʱn��" );
					}
				}
				else if( "undefined" != typeof d[4] && d[4]!=d2[4] ){									//ͬ��,ͬ��,ͬ��,ͬСʱ,��ͬ����
					return "<span style='color:#900'>"+ Math.abs(d2[4]-d[4]) +"����ǰ</span>";
				}
				else{
					return fmt ? date.format( fmt ) : date;
				}
			}
			else{				//����ʱ

				if( "undefined" != typeof d[0] && d[0]!=d2[0] ){										//��ͬ��
					switch( d2[0]-d[0] ){
						case 1: return "<span style='color:#900'>����</span>" + date.format( "m��d��" );
						case 2: return "<span style='color:#900'>����</span>" + date.format( "m��d��" );
						default: return fmt ? date.format( fmt ) : date;
					}
				}
				else if( "undefined" != typeof d[1] && d[1]!=d2[1] ){									//ͬ��,��ͬ��
					switch( Math.abs(d2[1]-d[1]) ){
						case 1: 
							return "<span style='color:#900'>�¸���</span>" + date.format( "d��" );
						case 2: 
							return "<span style='color:#900'>�����º�</span>" + date.format( "d��" );
						case 3: 
							return "<span style='color:#900'>�����º�</span>" + date.format( "d��" );
						default: return date.format( "m��d��" );
					}
				}
				else if( "undefined" != typeof d[2] && d[2]!=d2[2] ){									//ͬ��,ͬ��,��ͬ��
					switch( Math.abs(d2[2]-d[2]) ){
						case 1:
							return "<span style='color:#900'>����</span>" + date.format( "hʱn��" );
						case 2:
							return "<span style='color:#900'>����</span>" + date.format( "hʱn��" );
						case 3:
							return "<span style='color:#900'>�����</span>" + date.format( "hʱn��" );
						default:
							return "<span style='color:#900'>����</span>" + date.format( "d��" );
					}
				}
				else if( "undefined" != typeof d[3] && d[3]!=d2[3] ){									//ͬ��,ͬ��,ͬ��,��ͬСʱ
					switch( Math.abs(d2[3]-d[3]) ){
						case 1:
							return "<span style='color:#900'>1Сʱ��</span>" + date.format( "n��" );
						case 2:
							return "<span style='color:#900'>2Сʱ��</span>" + date.format( "n��" );
						case 3:
							return "<span style='color:#900'>3Сʱ��</span>" + date.format( "n��" );
						default:
							return "<span style='color:#900'>����</span>" + date.format( " hʱn��" );
					}
				}
				else if( "undefined" != typeof d[4] && d[4]!=d2[4] ){									//ͬ��,ͬ��,ͬ��,ͬСʱ,��ͬ����
					return "<span style='color:#900'>"+ Math.abs(d2[4]-d[4]) +"���Ӻ�</span>";
				}
				else{
					return fmt ? date.format( fmt ) : date;
				}
			}
					
		}
		
	});

})(da);
