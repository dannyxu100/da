/*
	author: danny.xu
	date:		2011-8-9 16:31:00
	description: 	daIframe现场保留
*/
(function( win, undefined ){

var doc = win.document;

/**iframe对象缓存区
*/
win.daIframeCache = [];

var daIframe = (function(){
	var daIframe = function(){
		return new daIframe.fnStruct.init();
	};
	
	daIframe.fnStruct = daIframe.prototype = {
		version: "daIframe1.0  \n\nauthor: danny.xu\n\ndate: 2011-8-9 16:49:21 \n\nThank you!!!",
		
		/**判断找到的iframe对象 是否是self页面所属缓存对象
		*/
		isSelfWinCache: true,
		
		extendWidth: 0,					//可允许人为控制调整的容差值，可为负数
		extendHeight: 0,

		//初始化函数
		init: function(){
			//TODO:
			return this;
		},
		
		/**通过编号获取缓存iframe对象
		*/
		getCache: function( code ){
			var cache = win.daIframeCache;
			for( var i=0,len=cache.length; i<len; i++ ){
				if( code == cache[i].code ) return cache[i];
			}
			
			return null;
		},
		
		/**压入缓存
		*/
		pushCache: function( code, obj, status ){
			var cache = win.daIframeCache,
					cacheObj = {
						code: code,
						iframe: obj,
						loaded: false,
						history: [ obj.src ],
						status: status,
						current: 0
					};
					
			cache.push( cacheObj );
			return cacheObj;
		},
		
		/**移除缓存
		*/
		removeCache: function( code ){
			var cache = win.daIframeCache,
					isClearAll = !code;
			
			if( isClearAll ){ cache = []; return; };

			for( var i=0,len=cache.length; i<len; i++ ){
				if( code == cache[i].code ){
					
	        cache[i].iframe.src = 'javascript:false;';																	//防止内存泄露
	        try{
	       		var insideWin = cache[i].iframe.contentWindow;
	          insideWin.document.write('');
	          insideWin.document.clear();
						if( "undeinfed" !== typeof CollectGarbage )
							setTimeout(CollectGarbage, 1);

	        }catch(e){};

					cache[i].iframe.onreadystatechange = null;
					cache[i].iframe.onload = null;
					da( cache[i].iframe ).remove();

					cache.splice(i,1);
					
					break;
				}
			}
			
		},
		
		
		/**找到可用的iframe对象
		*/
		find: function ( type, winObj ){
			winObj = winObj || win;
			var cache = winObj.daIframeCache;
			
			for( var i=0,len=cache.length; i<len; i++ ){
				if( type === cache[i].status )
					return cache[i];
			}
			
			if( 0 < cache.length ){ cache[cache.length-1].status = type; return cache[cache.length-1]; };				//remove造成没有可用的iframe，但是缓存长度不为0，所以设置最后一个缓存为可用状态，并返回
		
			var objIframe = winObj.document.getElementById( "mainframe" );		//第一次使用缓存
			if( objIframe && "IFRAME" == objIframe.tagName ) {
				var  cacheContainer = document.createElement("div"),					  //创建缓存容器
						 cacheList = document.createElement("div");									//创建缓存list
				
				cacheContainer.id = "daIframeContainer";
				cacheContainer.style.cssText = "position:relative;overflow:hidden;";
				objIframe.parentNode.insertBefore( cacheContainer, objIframe );
				
				cacheList.id = "daIframeList";
				cacheList.style.cssText = "position:relative;top:0px;left:0px;overflow-y:hidden;";
				cacheList.insertBefore( objIframe, null );
				cacheContainer.insertBefore( cacheList, null );
				
				objIframe.style.width = document.body.offsetWidth + "px";				//
				objIframe.style.cssFloat = objIframe.style.styleFloat = "left";

				cache =  this.pushCache( "mainframe", objIframe, type );				//将页面默认iframe压入缓存
				cache.loaded = true;
				
				daIframe.cacheCntObj = cacheContainer;													//缓存Cnt对象，方便之后使用
				daIframe.cacheListObj = cacheList;														//缓存list对象，方便之后使用
				daIframe.listWidth = document.body.offsetWidth;
				
				return cache;
				
			}
			else if( winObj.parent && null != winObj.frameElement && winObj != winObj.parent ) {		//是否有父窗体存在，且父窗体拥有内框架页面，且父窗体指针 并不是该窗体本身
				this.isSelfWinCache = false;															//一旦上找到parent,即非指定页面的所属缓存对象
				// win = winObj;
				return this.find( type, winObj.parent );
			}
			else 
				return null;
		},
		
		
		/**iframe页面跳转操作
		*/
		goto: function ( url, isNew, code, type ){
			type = type || "show";
			isNew = da.firstValue(isNew, false);
			
			var currentObj = this.find( type ), 
				cacheObj, newObj, newIframe, pageName, idx;
			
			pageName = daIframe.urlToCode( url );
			if( "undefined" != typeof da ) pageName = da.isNull( pageName, null );
			
			if( !currentObj ) { location.href = url; this.autoSize( type ); }
			
			if( !url || !pageName ) { goto("/error.htm"); return false; }
			
			
			var cacheCntObj = daIframe.cacheCntObj || document.getElementById( "daIframeContainer" ),
				cacheListObj = daIframe.cacheListObj || document.getElementById( "daIframeList" );
 			
 			if( "undefined" !== typeof daLoading ){
				if( daIframe.daLoadingObj ){									//清空对象
					daIframe.daLoadingObj.finished();
					daIframe.daLoadingObj = null;
				}
				
				daIframe.daLoadingObj = daLoading({								//开始loading动画
					parent: cacheCntObj,
					type: "gif",
					click: function(){
						this.finished();										//点击结束loading动画
					}
				});
			}
			
			if( !this.isSelfWinCache ) {										//本页面跳转
				currentObj.iframe.src = url;
				currentObj.history.unshift( url );								//向历史访问地址缓存中 压入当前url;
				currentObj.loaded = false;
				this.autoSize( type );
				
				return true;
			}
			
			currentObj.status = "cache";										//更改状态
			daIframe.pageOut( currentObj, cacheListObj, cacheCntObj );			//页面离开切换动画
			
			if( !code ){
				code = pageName;
			}

			if( !code ) return false;											//缓存code不能为空
			
			var newid = "cacheIframe_" + (new Date).getTime();
			cacheObj = this.getCache( code );
			
			if( null === cacheObj ){											//没有访问过，没有缓存，需要创建一个新的iframe
				newIframe = currentObj.iframe.cloneNode(true);
				newIframe.id = newid;											//重置id
				newIframe.style.cssText = "float:left;display:none;";
				newIframe.onreadystatechange = null;
				newIframe.onload = null;
				cacheListObj.insertBefore( newIframe, null );
				newIframe.src = url;											//注：IE的iframe必须添加入页面后，再赋值src，否则出现浏览器缓存扰乱
				
				newObj = this.pushCache( code, newIframe, type );				//压入缓存
				this.autoSize();
			}
			else if( true === isNew ){
				newIframe = currentObj.iframe.cloneNode(true);
				newIframe.id = newid;											//重置id
				newIframe.style.cssText = "float:left;display:none;";
				newIframe.onreadystatechange = null;
				newIframe.onload = null;
				cacheListObj.insertBefore( newIframe, null );
				newIframe.src = url;
				
				var tmpObj = this.getCache( code );
				if( daIframe.listWidth && tmpObj ){ daIframe.listWidth -= tmpObj.iframe.offsetWidth;}
				this.removeCache( code );										//移除旧的缓存
				
				newObj = this.pushCache( code, newIframe, type );				//压入缓存
				
			}
			else{																//访问过，还留有缓存
				cacheObj.status = type;
				newObj = cacheObj;
				newIframe = cacheObj.iframe;
				
			}
			
			this.autoSize( type );
		
			daIframe.pageIn( newObj, cacheListObj, cacheCntObj );			//页面离开切换动画
			
			return true;
			
		},

		/**页面尺寸调整
		*/
		autoSize: function ( type, winObj ){
			type = type || "show";
			winObj = winObj || win;
		
			var curObj = this.find( type, winObj );
				
			if( !curObj ) return;
					
			var context = this,
				curIframe = curObj.iframe,
				isIE = da.browser.ie,
				ScrollBarSize = { width: isIE?16:0, height: isIE?16:0 },																								//需要将iframe滚动条的尺寸算进去
				defaultSize = {}, 
				winSize = { width: 0, height: 0 }; 
			
			if( curIframe ){
				defaultSize.width = curIframe.getAttribute( "defaultwidth" ) || "0";
				defaultSize.height = curIframe.getAttribute( "defaultheight" ) || "0";
				
				defaultSize.width = parseInt( defaultSize.width.toLowerCase().replace("px", "") );
				defaultSize.height = parseInt( defaultSize.height.toLowerCase().replace("px", "") );

				curIframe.style.width = (winObj.document.body.offsetWidth + this.extendWidth) + "px";//"100%";										//预置当前显示iframe宽度。同时可以防止可能窗体尺寸发生变化，这里通过重置一遍iframe的尺寸
				
//				context.reSize( winObj, curIframe );																											//预先刷新一下cacheList对象的尺寸
				
				if( "complete" === curIframe.readyState || curObj.loaded ){/*da.out(" complete ");*/ setIframeSize(); return; }		//访问过并加载完毕
//				da.out( "complete: "+ curIframe.readyState )
				curIframe.onreadystatechange = function(){
//					da.out(" change ")
					if("complete" == this.readyState ){
//						if( this.contentWindow && "unknown" != typeof this.contentWindow.document)					//判断是否跨域访问
								setIframeSize();
					}
				};
				
				curIframe.onload = function(){
					ScrollBarSize.width = 0;																																//非IE浏览器iframe宽度不是100%，需要加上滚动条的宽度
//					if( this.contentWindow && "unknown" != typeof this.contentWindow.document)						//判断是否跨域访问并且需要回调处理
						setIframeSize();
				};

				/**获得iframe内部页面尺寸
				*/
				function setIframeSize() {
					if( daIframe.daLoadingObj ){										//结束loading动画
						daIframe.daLoadingObj.finished();
						daIframe.daLoadingObj = null;
					}
					
					try{
						if (curIframe.contentDocument && "undefined" != typeof curIframe.contentDocument.body && curIframe.contentDocument.body.offsetHeight) {
						  winSize.width = curIframe.contentDocument.body.offsetWidth;
						  winSize.height = curIframe.contentDocument.body.offsetHeight;
						  
						}
						else if ( "undefined" != typeof curIframe.contentWindow.document && curIframe.contentWindow.document && curIframe.contentWindow.document.body.scrollHeight ) {
						  winSize.width = curIframe.contentWindow.document.body.scrollWidth;
						  winSize.height = curIframe.contentWindow.document.body.scrollHeight;
						  
						}

					}catch(e){}

				  if ( defaultSize.width && winSize.width < defaultSize.width ) winSize.width = defaultSize.width;
				  if ( defaultSize.height && winSize.height < defaultSize.height ) winSize.height = defaultSize.height;

//				  if( winSize.width ){																													//宽度暂时使用计算值了
//				  	curIframe.style.height = winSize.width + "px";
//					}							 
					if( winSize.height ){
						curIframe.style.height = ( winSize.height + ScrollBarSize.height + context.extendHeight ) + "px";				//danny.xu 2012-2-10 15:44:15 多+30为了迎合豪庭系系统的漂浮菜单；
					}
					
					curObj.loaded = true;
					
					context.reSize( winObj, curIframe );																						//重算所有缓存iframe的总宽度

					if( winObj.parent && null != winObj.frameElement ){
						winObj.parent.autoSize( type, winObj.parent );
					}
					
				}
				
			
			}
			
		
		},
		
		/**重算所有缓存iframe的总宽度
		*/
		reSize: function( winObj, curIframe ){
			winObj = winObj || win;
//			da.out("reSize");
			var cache = winObj.daIframeCache,																										 //重算所有缓存iframe的总宽度
					cacheListObj = winObj.daIframe.cacheListObj || winObj.document.getElementById( "daIframeList" ),
					cacheListWidth = 0,
					cacheListHeight = 0;
					
					
			if( !cacheListObj ){ /*da.out( typeof cacheListObj);*/ return;}
			
			for( var i=0,len=cache.length; i<len; i++ ){
				cacheListWidth = cacheListWidth + ( cache[i].loaded ? cache[i].iframe.offsetWidth : 0 );
//				da.out(i +": " +cache[i].code +" : "+ cache[i].loaded +" : "+ cacheListWidth +" : "+ cache[i].iframe.offsetWidth )
			}
			cacheListHeight = curIframe.offsetHeight;
			
			if( 500 >= cacheListHeight ) cacheListHeight = 500;
			
			cacheListObj.style.width = cacheListWidth + "px";
			cacheListObj.style.height = cacheListHeight + "px";
			
			winObj.daIframe.listWidth = cacheListWidth;
			winObj.daIframe.listHeight = cacheListHeight;
//			da.out("=========autoSize========")
		}

	};
	
	daIframe.fnStruct.init.prototype = daIframe.prototype;
	
	/**将URL转为code编码
	*/
	daIframe.urlToCode =  function( url ){
		var pageName = url;
		
		idx = url.lastIndexOf("/");
		if (idx >= 0) pageName = url.substr(idx + 1);
	  idx = pageName.indexOf("?") ;
	  if (idx >= 0) pageName = pageName.substr(0, idx);
	  
	  return pageName;
	};
	
	/**移除缓存
	*/
	daIframe.remove = function( code, type, winObj ){
		var tmpObj = daIframe(),
			cacheObj = tmpObj.getCache( code );
		if( daIframe.listWidth && cacheObj ){ daIframe.listWidth -= cacheObj.iframe.offsetWidth;}
		
		tmpObj.removeCache( code );
		tmpObj.autoSize( type, winObj );
		
	};
	
	/**刷新当前页面显示daIframe
	*/
	daIframe.refresh = function( type, winObj ){
		type = type || "show";
		winObj = winObj || win;
		
		var daIframeObj = daIframe(),
				currentObj = daIframeObj.find( type );
		if( "unknown" != typeof currentObj.iframe.contentWindow.document && currentObj.iframe.contentWindow.document ){
			currentObj.iframe.contentWindow.location.reload();
		}
		else{
			daIframeObj.goto( currentObj.iframe.src, true, currentObj.code, currentObj.status );

		}
		
	};
	
	/**返回历史访问页面
	*/
	daIframe.back = function( winObj, num, type, isForward ){
		if( "number" === typeof winObj ){
			isForward = type;
			type = num;
			num = winObj;
			winObj = win;
		}
	
		type = type || "show";
		winObj = winObj || win;
		
		var daIframeObj = daIframe(),
			currentObj = daIframeObj.find( type, winObj );
		
		if( !currentObj ) return false;
		
		if( !num && 0 !== num ) num = currentObj.current + ( isForward ? -1 : 1 );
		
		if( 0 > num || (currentObj.history.length -1) < num ) return false;
		
		currentObj.iframe.src = currentObj.history[ num ];
		currentObj.current = num;
		
	};
	
	
	/**页面离开切换动画
	*/
	daIframe.pageOut = function( currentObj, cacheListObj, cacheCntObj ){
		//currentObj.iframe.style.display = "none";												 //隐藏当前显示的iframe
		currentObj.iframe.style.visibility = "hidden";
	};
	
	/**页面进入切换动画
	*/
	daIframe.pageIn = function( newObj, cacheListObj, cacheCntObj ){
		newObj.iframe.style.display = "block";													 //显示新加的iframe
		newObj.iframe.style.visibility = "visible";
		
		var moveLeft = -newObj.iframe.offsetLeft;
		if( !newObj.loaded ) moveLeft = -daIframe.listWidth;
		cacheListObj.style.left = moveLeft + "px";
		
	};
	
	return daIframe;
})();


win.daIframe = daIframe;

})(window);



/*** 扩展功能函数 ***/
goto = function( url, isNew, code, type ){
	daIframe().goto( url, isNew, code, type );
	
};

autoSize = function( type, winObj ){
	daIframe().autoSize( type, winObj );
	
};

autoframeheight = function(){
	if( "undefined" != typeof daFrameAutoSize )						//弹出窗口模式
		daFrameAutoSize();
	else																									//框架窗口模式
		autoSize();
};

iframeRemove = function( url ){
	daIframe.remove( daIframe.urlToCode( url ) );
};

iframeRefresh = function(){
	daIframe.refresh();
	
};

iframeBack = function(winObj, num, type, isForward){
	daIframe.back( winObj, num, type, isForward );
	
};

iframeForward = function(winObj, num, type, isForward){
	daIframe.back( winObj, num, type, true );
	
};

//默认预定义页面切换动画
if( "undefined" !== typeof da && da.fnStruct.act ){
	
	/**页面切换动画开关
	*/
	daIframe.act = true;
	
	/**创建滑动动画指引图片
	*/
	daIframe.createPointer = function(){
		var cacheCntObj = daIframe.cacheCntObj || document.getElementById( "daIframeContainer" );
		if( !cacheCntObj ) return;
		
		if( !cacheCntObj.style.position ) cacheCntObj.style.position = "relative";
		
		/**翻页动画指针
		*/
		daIframe.pagePointer = {
			left: document.createElement("div"), 
			right: document.createElement("div")
		};
		
		daIframe.pagePointer.left.style.cssText = daIframe.pagePointer.right.style.cssText = "position:absolute; top:45%; width:48px;height:48px;background:url(/main/images/daIframe_pagePointer.png);display:none;";
		daIframe.pagePointer.left.style.left = "20px";
		daIframe.pagePointer.right.style.right = "20px";
		daIframe.pagePointer.right.style.backgroundPosition = "-48px 0px";
		
		cacheCntObj.insertBefore( daIframe.pagePointer.left, null );
		cacheCntObj.insertBefore( daIframe.pagePointer.right, null );
		
	};
	
	/**页面离开切换动画
	*/
	daIframe.pageOut = function( currentObj, cacheListObj, cacheCntObj ){
		//currentObj.iframe.style.display = "none";												 //隐藏当前显示的iframe
		currentObj.iframe.style.visibility = "hidden";
	};
	
	/**页面进入切换动画
	*/
	daIframe.pageIn = function( newObj, cacheListObj, cacheCntObj, isFirst ){
		var moveLeft = ( !newObj.loaded ) ? (-daIframe.listWidth) : (-newObj.iframe.offsetLeft);
		
		newObj.iframe.style.visibility = "visible";
		
		if( !daIframe.act || !newObj.loaded ){														 //注意: 未加载完毕，不能执行动画，否则会出现偏差
//		da.out(" --- pageIn ---1 ")
//		da.out(newObj.loaded +" : "+ moveLeft +" listWidth:"+daIframe.listWidth);
		
//			newObj.iframe.style.display = "block";
			da( newObj.iframe ).fadeIn(300);
			cacheListObj.style.left = moveLeft + "px";
			
		}
		else{
//		da.out(" --- pageIn ---2 ")
//		da.out(newObj.loaded +" : "+ moveLeft);
			if( !daIframe.pagePointer ) daIframe.createPointer();							//如果没有指引图片，就创建				
			else{
				if( moveLeft < cacheListObj.offsetLeft )
					daIframe.pagePointer.right.style.display = "block";
				else if( moveLeft > cacheListObj.offsetLeft )
					daIframe.pagePointer.left.style.display = "block";
			}
			
			da( cacheListObj ).stop().act({
				left: moveLeft
				
			},{
				duration: 300,
				easing: "easeInQuad",
				complete: function(){
						if( daIframe.pagePointer ){
							daIframe.pagePointer.right.style.display = "none";
							daIframe.pagePointer.left.style.display = "none";
						}
				}
			});
		}
		
	};
	
	
}