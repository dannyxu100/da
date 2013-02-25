/*
	author: danny.xu
	date:	2013-2-22 21:42:00
	description: 	daIframe 1.2现场保留
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
		version: "daIframe1.2 | author: danny.xu | date: 2013-2-22 21:42:00",
		
		/**判断找到的iframe对象 是否是self页面所属缓存对象，支持页面回退、前进
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
			
			if( 0 < cache.length ){				//remove造成没有可用的iframe，但是缓存长度不为0，所以设置最后一个缓存为可用状态，并返回
				cache[cache.length-1].status = type; return cache[cache.length-1]; 
			};
		
			var templetIframe = winObj.document.getElementById( "mainframe" ) 
			|| winObj.document.getElementById( "templetIframe" );			//第一次使用缓存
			
			if( templetIframe && "IFRAME" == templetIframe.tagName ) {
				var cacheContainer = document.createElement("div"),			//创建缓存容器
					cacheList = document.createElement("div");				//创建缓存list
				
				cacheContainer.id = "daIframeContainer";
				cacheContainer.style.cssText = "position:relative;overflow:hidden;border:0px solid #00f;";
				templetIframe.parentNode.insertBefore( cacheContainer, templetIframe );
				
				cacheList.id = "daIframeList";
				cacheList.style.cssText = "position:relative;top:0px;left:0px;border:0px solid #0f0";
				cacheList.insertBefore( templetIframe, null );
				cacheContainer.insertBefore( cacheList, null );
				
				// templetIframe.style.width = document.body.offsetWidth + "px";
				// templetIframe.style.cssFloat = templetIframe.style.styleFloat = "left";

				cache =  this.pushCache( "templetIframe", templetIframe, type );		//将页面模板iframe压入缓存
				cache.loaded = true;
				
				daIframe.cacheCntObj = cacheContainer;				//缓存Cnt对象，方便之后使用
				daIframe.cacheListObj = cacheList;					//缓存list对象，方便之后使用
				
				return cache;
				
			}
			else if( winObj.parent && null != winObj.frameElement && winObj != winObj.parent ) {		//是否有父窗体存在，且父窗体拥有内框架页面，且父窗体指针 并不是该窗体本身
				this.isSelfWinCache = false;															//一旦上找到parent,即非指定页面的所属缓存对象,非页面回退、前进操作
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
			
			var currentObj = this.find( type ),					//找到匹配的现场保留缓存 对象
				cacheObj, newObj, newIframe, pageName, idx;
			
			pageName = da.isNull( daIframe.urlToCode( url ), null );
			
			if( !currentObj ) { location.href = url; this.autoSize( type ); }	//系统没有现场保留需要，直接跳转当前页面
			if( !url || !da.urlCheck(url) || !pageName ) { goto("/error.htm"); return false; }		//默认404错误页面
			
			var cacheCntObj = daIframe.cacheCntObj || document.getElementById( "daIframeContainer" ),
				cacheListObj = daIframe.cacheListObj || document.getElementById( "daIframeList" );
 			
 			if( "undefined" !== typeof daLoading ){								//loading动画
				if( daIframe.daLoadingObj ){									//清空上一次loading对象
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
				newIframe.style.cssText = "display:none;position:relative;border:0px solid #f00;";
				newIframe.onreadystatechange = null;
				newIframe.onload = null;
				cacheListObj.insertBefore( newIframe, null );
				newIframe.src = url;											//注：IE的iframe必须添加入页面后，再赋值src，否则出现浏览器缓存扰乱
				
				newObj = this.pushCache( code, newIframe, type );				//压入缓存
				// this.autoSize();
			}
			else if( true === isNew ){
				newIframe = currentObj.iframe.cloneNode(true);
				newIframe.id = newid;											//重置id
				newIframe.style.cssText = "display:none;position:relative;border:0px solid #f00;";
				newIframe.onreadystatechange = null;
				newIframe.onload = null;
				cacheListObj.insertBefore( newIframe, null );
				newIframe.src = url;
				
				this.removeCache( code );										//移除旧的缓存
				newObj = this.pushCache( code, newIframe, type );				//压入缓存

			}
			else{																//访问过，还留有缓存
				cacheObj.status = type;
				newObj = cacheObj;
				newIframe = cacheObj.iframe;
				
			}
			
			daIframe.pageIn( newObj, cacheListObj, cacheCntObj );			//页面离开切换动画
			
			this.autoSize( type );
		
			return true;
			
		},
		
		/**iframe尺寸调整
		*/
		autoSize: function ( type, winObj ){
			type = type || "show";
			winObj = winObj || win;
		
			var curObj = this.find( type, winObj );
				
			if( !curObj ) return;
					
			var context = this,
				curIframe = curObj.iframe,
				defaultSize = {}, 
				inWinSize = { width: 0, height: 0 }; 
			
			if( !curIframe ) return;
				
			defaultSize.width = curIframe.getAttribute( "defaultwidth" ) || "0";
			defaultSize.width = parseInt( defaultSize.width.toLowerCase().replace("px", "") );
			defaultSize.height = curIframe.getAttribute( "defaultheight" ) || "0";
			defaultSize.height = parseInt( defaultSize.height.toLowerCase().replace("px", "") );

			// da.out("parentWith:"+curIframe.parentNode.offsetWidth);
			// da.out("parentHeight:"+curIframe.parentNode.offsetHeight);
			
			curIframe.style.width = (curIframe.parentNode.offsetWidth+ + this.extendWidth) + "px";	//预置当前显示iframe宽度。同时可以防止可能窗体尺寸发生变化，这里通过重置一遍iframe的尺寸
			// context.reSize( winObj, curIframe );									s//预先刷新一下cacheList对象的尺寸
			
			if( "complete" === curIframe.readyState || curObj.loaded ){				//访问过并已加载完毕
				//da.out(" complete ");
				setIframeSize(); 
				return; 
			}
			
			// da.out( "complete: "+ curIframe.readyState )
			curIframe.onreadystatechange = function(){
			// da.out(" change ")
				if("complete" == this.readyState ){
					// if( this.contentWindow && "unknown" != typeof this.contentWindow.document)		//判断是否跨域访问
					setIframeSize();
				}
			};
			
			curIframe.onload = function(){
				// if( this.contentWindow && "unknown" != typeof this.contentWindow.document)		//判断是否跨域访问并且需要回调处理
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
					if (curIframe.contentDocument 
					&& "undefined" != typeof curIframe.contentDocument.body 
					&& curIframe.contentDocument.body.offsetHeight) {
						inWinSize.width = curIframe.contentDocument.body.offsetWidth;
						inWinSize.height = curIframe.contentDocument.body.offsetHeight;
					  
					}
					else if ( "undefined" != typeof curIframe.contentWindow.document 
					&& curIframe.contentWindow.document 
					&& curIframe.contentWindow.document.body.scrollHeight ) {
						inWinSize.width = curIframe.contentWindow.document.body.scrollWidth;
						inWinSize.height = curIframe.contentWindow.document.body.scrollHeight;
					  
					}

				}catch(e){}

				if ( defaultSize.width && inWinSize.width < defaultSize.width ){
					inWinSize.width = defaultSize.width;
				}
				if ( defaultSize.height && inWinSize.height < defaultSize.height ){
					inWinSize.height = defaultSize.height;
				}

				// if( inWinSize.width ){			//宽度暂时使用计算值了
					// curIframe.style.width = inWinSize.width + "px";
				// }							 
				if( inWinSize.height ){
					curIframe.style.height = ( inWinSize.height + context.extendHeight ) + "px";	//danny.xu 2012-2-10 15:44:15 多+30为了迎合豪庭系系统的漂浮菜单；
				}
				
				// da.out("IframeWith:"+curIframe.offsetWidth);
				// da.out("IframeHeight:"+curIframe.offsetHeight);
				
				curObj.loaded = true;						//现场缓存对象 首次加载操作完成
				context.reSize( winObj, curIframe );		//重算所有缓存iframe的总宽度

				if( winObj.parent && null != winObj.frameElement ){		//内页尺寸发生变化，同时父页面的iframe页需要调整
					winObj.parent.autoSize( type, winObj.parent );
				}
			}
		},

		/**重算所有缓存iframe的总宽度
		*/
		reSize: function( winObj, curIframe ){
//			da.out("reSize");
			winObj = winObj || win;
			var cacheCntObj = winObj.daIframe.cacheCntObj || winObj.document.getElementById( "daIframeContainer" );
				// cacheListObj = winObj.daIframe.cacheListObj || winObj.document.getElementById( "daIframeList" );
					
					
			if( !cacheCntObj  ) return;

			cacheCntObj.style.width = curIframe.offsetWidth + "px";
			cacheCntObj.style.height = curIframe.offsetHeight + "px";
			
		}

	};

	daIframe.fnStruct.init.prototype = daIframe.prototype;
	
	/**将URL转为code编码
	*/
	daIframe.urlToCode =  function( url ){
		var pageName = url;
		
		idx = pageName.indexOf("?") ;
		if (idx >= 0) pageName = pageName.substr(0, idx);
	  
		return pageName;
	};

	/**页面离开切换动画
	*/
	daIframe.pageOut = function( currentObj, cacheListObj, cacheCntObj ){
		// currentObj.iframe.style.visibility = "hidden";
		currentObj.iframe.style.display = "none";			//隐藏当前显示的iframe
	};
	
	/**页面进入切换动画
	*/
	daIframe.pageIn = function( newObj, cacheListObj, cacheCntObj ){
		// newObj.iframe.style.visibility = "visible";
		newObj.iframe.style.display = "block";
		// da(newObj.iframe).fadeIn();						//显示新加的iframe
		
		newObj.iframe.style.left = -newObj.iframe.offsetWidth + "px";
		
		da( newObj.iframe ).stop().act({
			left: 0
		},{
			duration: 200,
			easing: "easeInQuad",
			complete: function(){
				if( daIframe.pagePointer ){
					daIframe.pagePointer.right.style.display = "none";
					daIframe.pagePointer.left.style.display = "none";
				}
			}
		});
	};
	
	/**移除缓存
	*/
	daIframe.remove = function( code, type, winObj ){
		var daIframeObj = daIframe(),
			cacheObj = daIframeObj.getCache( code );

		daIframeObj.removeCache( code );
		daIframeObj.autoSize( type, winObj );
		
	};
	
	/**刷新当前页面显示daIframe
	*/
	daIframe.refresh = function( type, winObj ){
		type = type || "show";
		winObj = winObj || win;
		
		var daIframeObj = daIframe(),
			currentObj = daIframeObj.find( type );
			
		if( "unknown" != typeof currentObj.iframe.contentWindow.document 
		&& currentObj.iframe.contentWindow.document ){
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
	
	
	return daIframe;
})();

win.daIframe = daIframe;

})(window);



/********************** 扩展全局功能函数 **********************/
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


