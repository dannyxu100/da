/**daFrame
*容器类
* @author danny.xu
* @version daFrame_1.0 2011/7/10 11:55:21
*/
(function( win, undefined ){
var doc = win.document;

var daFrame = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daFrame = function( setting ){
		return new daFrame.fnStruct.init( setting );
	};

	daFrame.fnStruct = daFrame.prototype = {
		version: "daFrame v1.0 \n author: danny.xu \n date: 2011/7/10 11:55:57",
		
		cntId: 0,
		cntObj: null,
		cntParentObj: null,
		
		cntMainObj: null,
		cntBoxObj: null,
		cntOverObj: null,
		
		cntScrollV: null,
		cntScrollH: null,
		
		cntSize: null,
		cntBoxSize: null,
		cntScale: null,
		
		cntIframeObj: null,								//如果是url地址嵌入页面，需要create一个iframe Element
		cntImageObj: null,								//如果是通过src加载图片，需要create一个img Element
		
		cntCorner: 10,										//右下角滚动条不经过处size
		isLocal: true,										//非跨域访问，默认为true
		cntLoadingObj: null,							//daLoading对象
		
		setting: {
			window: win,
			parent: null,
			width: 0,
			height: 0,
			
			loading: false,
			
			css: {
				cnt: "daCnt",
				main: "daCntMain",
				box: "daCntBox",
				over: "daCntOver",
				sclV: "scl_v",
				sclH: "scl_h",
				sclV2: "scl_v2",
				sclH2: "scl_h2"
			},
			border: "1px solid #666",
			
			html: "",
			url: "",
			src: "",
			
			load: null,										//窗口内页加载完毕执行 回调函数
			unload: null,									//窗口内页刷新或关闭执行 回调函数
			back: null,										//内页传出数据 回调函数
			close: null										//关闭内页 回调函数
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( true, {}, this.setting, setting );
			win = setting.window;
			doc = win.document;
			
			this.cntParentObj = da( setting.parent );
			if( 0 >= this.cntParentObj.length ) {alert("daFrame温馨提示: 需要指定父亲DOM对象"); return;}
			this.cntParentObj = this.cntParentObj.dom[0];
			
			while( doc.getElementById( "daCnt" + this.cntId ) ){ this.cntId++ };
			this.cntId = "daCnt" + this.cntId;

			this.cntSize = {w: 0, h: 0};
			this.cntBoxSize = {w: 0, h: 0};
			this.cntScale = {w: 1, h: 1};

			this.create();
			this.setCnt();
			this.setSize();
			this.bindEvent();
			
			if( "" != this.setting.url || "" != this.setting.src )
				this.loading();																								//启动loading动画
			
		},
		
		create: function(){
			var cntObj = doc.createElement("div"),
					mainObj = doc.createElement("div"),
					overObj = doc.createElement("div"),
					boxObj = doc.createElement("div"),
					scrollVObj = doc.createElement("a"),
					scrollHObj = doc.createElement("a");
					
			cntObj.id = this.cntId;
			cntObj.className = this.setting.css.cnt;
			cntObj.style.border = this.setting.border;
			
			boxObj.id = this.cntId + "_box";
			boxObj.className = this.setting.css.box;
			mainObj.insertBefore( boxObj, null );
			
			overObj.id = this.cntId + "_over";
			overObj.className = this.setting.css.over;
			mainObj.insertBefore( overObj, null );

			mainObj.id = this.cntId + "_main";
			mainObj.className = this.setting.css.main;
			cntObj.insertBefore( mainObj, null );
			
			scrollVObj.id = this.cntId + "_scrollV";
			scrollVObj.className = this.setting.css.sclV;
			scrollVObj.href = "javascript:void(0);";
			if( da.browser.ie )
				da( scrollVObj ).css("opacity",1);
			cntObj.insertBefore( scrollVObj, null );
			
			scrollHObj.id = this.cntId + "_scrollH";
			scrollHObj.className = this.setting.css.sclH;
			scrollHObj.href = "javascript:void(0);";
			if( da.browser.ie )
				da( scrollHObj ).css("opacity",1);
			cntObj.insertBefore( scrollHObj, null );
			
			this.cntParentObj.insertBefore( cntObj, null );

			this.cntObj = cntObj; 
			this.cntMainObj = mainObj; 
			this.cntBoxObj = boxObj; 
			this.cntOverObj = overObj;
			this.cntScrollV = scrollVObj; 
			this.cntScrollH = scrollHObj;

		},
		
		bindEvent: function(){
 			var context = this;
 			
//			da(win).bind( "unload", this.unload = function(){
//				context.remove();
//			});
			
			//滚动条拖拽平移
 			daDrag({
				window: win,
 				src: this.cntScrollV,
 				target: this.cntScrollV,
 				cursor: "pointer",	//"n-resize",
 				
 				before: function( evt, srcObj, targetObj ){
					srcObj.className = context.setting.css.sclV2;
					//context.cntOverObj.style.display = "block";
					
				},
				
 				move: function( evt, srcObj, targetObj, oldPos, nowPos, prevMousePos, nowMousePos ){ 
					var minY = 0, 
							maxY = 2 + da(context.cntMainObj).height() - da(context.cntScrollV).height() - context.cntCorner;			//"2"滚动条样式上下边框，减去滚动条不能经过的角落处
	
					nowPos.y = ( nowPos.y > maxY ) ? maxY : nowPos.y; 
					nowPos.y = ( nowPos.y < minY ) ? minY : nowPos.y;
	
					context.cntBoxObj.style.top = -(nowPos.y / context.cntScale.h ) + "px";								//设置内容box位置
					//da( context.cntBoxObj ).offset({left: 0, top: -nowPos.y });
					
					return { x: "auto", y: nowPos.y }												//x不能变，y不能超出范围
				},
				
 				after: function( evt, srcObj, targetObj ){
	 				srcObj.className = context.setting.css.sclV;
					//context.cntOverObj.style.display = "none";
	 				
				}
 			});
			
			
 			daDrag({
				window: win,
 				src: this.cntScrollH,
 				target: this.cntScrollH,
 				cursor: "pointer",	//"w-resize",
 				
 				before: function( evt, srcObj, targetObj ){ 
					srcObj.className = context.setting.css.sclH2;
					//context.cntOverObj.style.display = "block";
				},
				
 				move: function( evt, srcObj, targetObj, oldPos, nowPos, prevMousePos, nowMousePos ){
					var minX = 0,
							maxX = 2 + da(context.cntMainObj).width() - da(context.cntScrollH).width() - context.cntCorner;			//"2"滚动条样式左右边框，减去滚动条不能经过的角落处
	
					nowPos.x = ( nowPos.x > maxX ) ? maxX : nowPos.x;
					nowPos.x = ( nowPos.x < minX ) ? minX : nowPos.x;
					
					context.cntBoxObj.style.left = -(nowPos.x / context.cntScale.w) + "px";
					
					return { x: nowPos.x, y: "auto" }												//y不能变，x不能超出范围
				},
				
 				after: function( evt, srcObj, targetObj ){
	 				srcObj.className = context.setting.css.sclH;
					//context.cntOverObj.style.display = "none";
	
				}
 			});
			
			if( "" != this.setting.html ){
				this.bindWheel( this.cntBoxObj );					//添加滚轮事件处理
				this.cntOverObj.style.display = "none";
			}
			else
				this.bindWheel( this.cntOverObj );				//添加滚轮事件处理
					
		},
		
		/**监听滚轮事件
		*/
		bindWheel:function( objPad ){
			var context = this,
					nWheelDeltaStep = 30,										//滚轮没滚一次，移动像素值
			    maxY, nTop;
			
			objPad.daWheelObj = daWheel({
				target: objPad,
				before: function(){
			    maxY = 2 + da(context.cntBoxObj).height() - da(context.cntMainObj).height()/* - context.cntCorner*/,	//可滚动最大高度
					nTop = context.cntBoxObj.offsetTop;																																		//获取当前位置
					
				},
				up: function(){//alert("up");
					nTop = nTop + nWheelDeltaStep;
				},
				down: function(){//alert("down");
					nTop = nTop - nWheelDeltaStep;
				},
				after: function(){//alert("after");
	        nTop = ( 0 < nTop ) ? 0 : ( -maxY > nTop ) ? -maxY : nTop;

					context.cntBoxObj.style.top = nTop +"px";			//更新位置
	        context.cntScrollV.style.top = -( nTop * context.cntScale.h ) + "px";
				}
	
			});
		},
		
		setCnt: function(){
			if( "" != this.setting.html ){
				if( "string" === typeof this.setting.html )
					this.cntBoxObj.innerHTML = this.setting.html;
				else if( this.setting.html.nodeType )
					this.cntBoxObj.insertBefore( this.setting.html );
			}
			else if( "" != this.setting.url ){
				this.cntIframeObj = this.iframe();
				this.cntBoxObj.insertBefore( this.cntIframeObj, null );
			}
			else if( "" != this.setting.src ){
				this.cntImageObj = this.image();
				this.cntBoxObj.insertBefore( this.cntImageObj, null );
			}
			
		},
		
		image: function(){
			var context = this;
					imageObj = doc.createElement("img");
			
			imageObj.src = this.setting.src;
			da.loadImage( this.setting.src, function(){
				context.setSize();
				context.loading(true);																											//终止loading动画
			});
			
			return imageObj;
		},
		
		iframe: function(){
			var context = this,
					iframeObj = doc.createElement("iframe");
			
			iframeObj.scrolling = "no";
			iframeObj.frameBorder = "0";
			iframeObj.src = this.setting.url;

//			readyState:
//			uninitialized		对象未使用数据初始化
//			loading   			对象正在下载数据
//			loaded   				对象已完成下载它的数据
//			interactive 		即使对象没有完全下载数据，用户也可以与其交互
//			complete    		对象被完全初始化
//			if( "complete" == iframeObj.readyState ) this.loading(true);
			
			da(iframeObj).bind("load",function(){
				if( this.contentWindow && this.contentWindow.document){							//非跨域访问
					var contentWin = iframeObj.contentWindow;
					
					if( context.setting.load )																				//内页加载完毕如果需要，回调用户自定义处理函数
						context.setting.load.call( contentWin, context );
					
					contentWin.daFrameAutoSize = function(){
						fnAutoSize( iframeObj, contentWin );                            //加载完毕，重置iframe大小
					};
						
					if( context.setting.back ){
						contentWin.dialogreturn = contentWin.back = function(){					//给内页嵌入back数据回调函数
								context.setting.back.apply( contentWin, arguments );				//如果需要回调处理，就触发回调
						};
						
						contentWin.myclosewin = contentWin.close = function(){					//给内页嵌入back数据回调函数
								context.setting.close.apply( contentWin, arguments );				//如果需要回调处理，就触发回调
						};
					}
					
					if( context.setting.unload ){																			
						da( contentWin ).bind( "unload", function(){										//监听窗体刷新事件
							if( context.setting.unload )																	//防止daFrame已经被移除并释放内存，再次调用出现异常
								context.setting.unload.apply( this, arguments );						//如果需要回调处理，就触发回调
//				      context.remove();
						});
					}
						

					context.bindWheel( contentWin.document.body );										//监听内页滚轮事件
					fnAutoSize( this, contentWin );                                   //加载完毕，重置iframe大小
					context.loading(true);																						//终止loading动画
				}
				else{																																						//跨域访问
					this.parentNode.replaceChild( fnNoLocal(), this );
				}
			});
			
//			iframeObj.onreadystatechange = function(){
//					if( "complete" !== this.readyState ) return;
////					if( -1 < this.src.indexOf("about:blank") ) return;
//
//					if( "unknown" != typeof this.contentWindow && this.contentWindow.document){		//非跨域访问
//						var contentWin = iframeObj.contentWindow;
//						
//						if( context.setting.load )																									//内页加载完毕如果需要，回调用户自定义处理函数
//							context.setting.load.call( contentWin, context );
//
//						contentWin.daFrameAutoSize = function(){
//							fnAutoSize( iframeObj, contentWin );                                      //加载完毕，重置iframe大小
//						};
//						
//						if( context.setting.back ){
//							contentWin.dialogreturn = contentWin.back = function(){										//给内页嵌入back数据回调函数
//									context.setting.back.apply( contentWin, arguments );									//如果需要回调处理，就触发回调
//							};
//							
//							contentWin.myclosewin = contentWin.close = function(){										//给内页嵌入back数据回调函数
//									context.setting.close.apply( contentWin, arguments );									//如果需要回调处理，就触发回调
//							};	
//						}
//
//						if( context.setting.unload ){																							//内页加载完毕如果需要，回调用户自定义处理函数
//							da( contentWin ).bind( "unload", function(){														//监听窗体刷新事件
//								context.setting.unload.apply( this, arguments );											//如果需要回调处理，就触发回调
////				       	context.remove();
//								
//							});
//						}
//						
//						
//						context.bindWheel( contentWin.document.body );											//监听内页滚轮事件
//						fnAutoSize( this, contentWin );																			//加载完毕，重置iframe大小
//						context.loading(true);																							//终止loading动画
//						
//					}
//					else{																																					//跨域访问
//						this.parentNode.replaceChild( fnNoLocal(), this );
//					}
//				
//			};
//			
//			iframeObj.onload = function(){
////				if( -1 < this.src.indexOf("about:blank") ) return;
//				
//				if( this.contentWindow && this.contentWindow.document){							//非跨域访问
//					var contentWin = iframeObj.contentWindow;
//					
//					if( context.setting.load )																				//内页加载完毕如果需要，回调用户自定义处理函数
//						context.setting.load.call( contentWin, context );
//					
//					contentWin.daFrameAutoSize = function(){
//						fnAutoSize( iframeObj, contentWin );                            //加载完毕，重置iframe大小
//					};
//						
//					if( context.setting.back ){
//						contentWin.dialogreturn = contentWin.back = function(){					//给内页嵌入back数据回调函数
//								context.setting.back.apply( contentWin, arguments );				//如果需要回调处理，就触发回调
//						};
//						
//						contentWin.myclosewin = contentWin.close = function(){					//给内页嵌入back数据回调函数
//								context.setting.close.apply( contentWin, arguments );				//如果需要回调处理，就触发回调
//						};
//					}
//					
//					if( context.setting.unload ){																						//内页加载完毕如果需要，回调用户自定义处理函数
//						da( contentWin ).bind( "unload", function(){											//监听窗体刷新事件
//							context.setting.unload.apply( this, arguments );											//如果需要回调处理，就触发回调
////				      context.remove();
//						});
//					}
//						
//
//					context.bindWheel( contentWin.document.body );										//监听内页滚轮事件
//					fnAutoSize( this, contentWin );                                   //加载完毕，重置iframe大小
//					context.loading(true);																						//终止loading动画
//				}
//				else{																																						//跨域访问
//					this.parentNode.replaceChild( fnNoLocal(), this );
//				}
//				
//			};
			
			//内页加载完毕后，重置iframe大小
			var fnAutoSize = function( iframeObj, contentWin ){
					var contentW = Math.max(																										//不知道为什么contentWindow.document.body.offsetHeight第一次获取的值偏大
						context.setting.width,																										//iframe设置一次大小后，再次获取内页尺寸，相对准确了，所以这里暂时处理两次
						da( contentWin ).width(),
						contentWin.document.body.scrollWidth,
						contentWin.document.documentElement.scrollWidth
					);
					var contentH = Math.max(
						context.setting.height,
						da( contentWin ).height(),
						contentWin.document.body.scrollHeight,
						contentWin.document.documentElement.scrollHeight
					);
					da( iframeObj ).width( contentW );
					da( iframeObj ).height( contentH );
					
//					contentW = Math.max(
//						context.setting.width,
//						contentWin.document.body.offsetWidth
//					);
//					contentH = Math.max(
//						context.setting.height,
//						contentWin.document.body.offsetHeight
//					);
//					da( this ).width( contentW );
//					da( this ).height( contentH );

					context.contentSize = { w: contentW, h: contentH };													//缓存内页的尺寸
					context.setSize();
			};
			
			//跨域访问方式，加载完毕iframe后，无法修改scrolling属性，只有重新new一个全新的iframe
			var fnNoLocal = function(){
					var tmpFrame = doc.createElement("iframe");																		//IE加载完毕iframe后，无法修改scrolling属性，只有重新new一个了
					tmpFrame.scrolling = "auto";
					tmpFrame.frameBorder = "0";
					tmpFrame.src = context.setting.url;
					
					da( tmpFrame ).width( da( context.cntObj ).width() );
					da( tmpFrame ).height( da( context.cntObj ).height() );

					tmpFrame.onreadystatechange = function(){
//						if( -1 < this.src.indexOf("about:blank") ) return;
						
						if("complete" == this.readyState){
							context.loading(true);																								//终止loading动画
							if( context.setting.load )																						//内页加载完毕如果需要，回调用户自定义处理函数
								context.setting.load.call( context );
						}
					};
					
					tmpFrame.onload = function(){
//						if( -1 < this.src.indexOf("about:blank") ) return;
						
						context.loading(true);																									//终止loading动画
						if( context.setting.load )																							//内页加载完毕如果需要，回调用户自定义处理函数
							context.setting.load.call( context );
							
					};

					if( context.setting.unload ){
						da( contentWin ).bind( "unload", function(){														//监听窗体刷新事件
//							if( -1 < this.src.indexOf("about:blank") ) return;
							if( context.setting.unload )																					//防止daFrame已经被移除并释放内存，再次调用出现异常
								context.setting.unload.apply( this, arguments );										//如果需要回调处理，就触发回调

//				      context.remove();
							
						});
					}
					
//					context.cntIframeObj = tmpFrame;
					context.isLocal = false;
					
					return tmpFrame;
			};
			
			return iframeObj;
			
		},
		
		refresh: function(){
			this.loading();
			
			if( "" != this.setting.url )
				this.cntIframeObj.src = this.setting.url;
			else if( "" != this.setting.src )
				this.cntImageObj.src = this.setting.src;
		},
		
		scrollBar: function(){
			if( this.isLocal ){
				
				if( this.cntBoxSize.w > this.cntSize.w + 2 )
					this.cntScrollH.style.display = "block";
				else
					this.cntScrollH.style.display = "none";
				
				if( this.cntBoxSize.h > this.cntSize.h + 2 )
					this.cntScrollV.style.display = "block";
				else
					this.cntScrollV.style.display = "none";
			}
			else
					this.cntScrollV.style.display = this.cntScrollH.style.display = "none";
			
		},
		
		setSize: function( nWidth, nHeight ){
			var da_parentObj = da( this.cntParentObj ),
					da_boxObj = da( this.cntBoxObj ),
					wBox = da_boxObj.width(), 
					hBox = da_boxObj.height(),
					wCnt = ( nWidth && 0 <= nWidth ) ? nWidth : this.setting.width || da_parentObj.width(),
					hCnt = ( nHeight && 0 <= nHeight ) ? nHeight : this.setting.height || da_parentObj.height();

			wCnt = parseInt( wCnt, 10 );
			hCnt = parseInt( hCnt, 10 );
			
			da( this.cntObj ).width( wCnt );
			da( this.cntObj ).height( hCnt );
			da( this.cntMainObj ).width( wCnt );
			da( this.cntMainObj ).height( hCnt );
			da( this.cntOverObj ).width( wCnt );
			da( this.cntOverObj ).height( hCnt );
			
			if( null != this.contentSize ){
				if( this.contentSize.w < wCnt ){
					da( this.cntIframeObj ).width( wCnt );
				}
				if( this.contentSize.h < hCnt ){
					da( this.cntIframeObj ).height( hCnt );
				}
			}
			
			if( !this.isLocal ){
				da( this.cntIframeObj ).width( wCnt );
				da( this.cntIframeObj ).height( hCnt );
			}
			
			var wScale = da.isNull( ( wCnt - this.cntCorner )/wBox, 0 ),
					hScale = da.isNull( ( hCnt - this.cntCorner )/hBox, 0 );

			da( this.cntScrollH ).width( wScale * wCnt ); 
			da( this.cntScrollV ).height( hScale * hCnt ); 
			this.cntScale.w = wScale;
			this.cntScale.h = hScale;
			
			this.cntSize.w = this.setting.width = wCnt;
			this.cntSize.h = this.setting.height = hCnt;
			this.cntBoxSize.w = wBox;
			this.cntBoxSize.h = hBox;
			
			this.scrollBar();
		},
		
		/**设置滚动条（显示）位置
		* params {Int} nTop 滚动条纵向位置
		* params {Int} nLeft 滚动条横向位置
		*/
		scroll: function( nTop, nLeft ){
			if( !this.isLocal ) return;											//若是跨域访问，采用默认iframe滚动条，就不能使用scroll()函数了
			
			var BoxMinX = 0, BoxMinY = 0,
					BoxMaxX = (2 + da( this.cntMainObj ).width() - da( this.cntScrollH ).width() - this.cntCorner)/this.cntScale.w,					//等比例计算Box实际可移动范围
					BoxMaxY = (2 + da( this.cntMainObj ).height() - da( this.cntScrollV ).height() - this.cntCorner)/this.cntScale.h;

			nTop = ( nTop > BoxMaxY ) ? BoxMaxY : ( nTop < BoxMinY ) ? BoxMinY : nTop; 
			nLeft = ( nLeft > BoxMaxX ) ? BoxMaxX : ( nLeft < BoxMinX ) ? BoxMinX : nLeft; 

			var boxTop = da.isNull( nTop ) ? "auto" : nTop,
					boxLeft = da.isNull( nLeft ) ? "auto" : nLeft,
					scrollTop = nTop*this.cntScale.h,
					scrollLeft = nLeft*this.cntScale.w;
			
			if( "undefined" === typeof daFx ){
				da( this.cntBoxObj ).css({ top: -BoxTop, left: -BoxLeft });																								//设置内容box位置
				da( this.cntScrollV ).css( "top", scrollTop );
				da( this.cntScrollH ).css( "left", scrollLeft );
			}
			else{
				da( this.cntBoxObj ).stop().act({
					top: -boxTop,
					left: -boxLeft
				});
				
				da( this.cntScrollV ).stop().act({
					top: scrollTop
				});
				da( this.cntScrollH ).stop().act({
					left: scrollLeft
				});
				
			}

		},
		
		//loading动画状态
		/*
			bHide: 'true'为加载完毕隐藏loading动画
		*/
		loading: function( bHide ){
			if( bHide ) 
				this.cntOverObj.style.display = "none";
			
			if( !this.setting.loading ) return;
			if( bHide ){
				this.cntLoadingObj.finished();						//结束loading动画
			}
			else{
				this.cntLoadingObj = daLoading({					//开始loading动画
					window: win,
					parent: this.cntMainObj,
					click: function(){
						this.finished();											//点击结束loading动画
					}
				});
				
			}
		},
		
		release: function(){
			daWheel.unbind( this.cntBoxObj );
			daWheel.unbind( this.cntOverObj );
			
			daDrag.unbind( this.cntScrollV );
			daDrag.unbind( this.cntScrollH );
			
			da( this.cntScrollV ).remove();
			da( this.cntScrollH ).remove();
			da( this.cntImageObj ).remove();
			da( this.cntIframeObj ).remove();
			da( this.cntOverObj ).remove();
			da( this.cntBoxObj ).remove();
			da( this.cntMainObj ).remove();
			da( this.cntObj ).remove();
		
			
			this.cntObj = null;
			this.cntParentObj = null;

			this.cntMainObj = null;
			this.cntBoxObj = null;
			this.cntOverObj = null;
			
			this.cntScrollV = null;
			this.cntScrollH = null;
			
			this.cntSize = null;
			this.cntBoxSize = null;
			this.cntScale = null;
			
			this.cntIframeObj = null;					//如果是url地址嵌入页面，需要create一个iframe Element
			this.cntImageObj = null;					//如果是通过src加载图片，需要create一个img Element
			
			this.cntLoadingObj = null;				//daLoading对象
			
			this.setting = null;
			
//			da(win).unbind( "unload", this.unload );
//			this.unload = null;
		},
		
		/**移除frame对象
		*/
		remove: function(){
			if( this.isReleased ) return;														//摧毁进行时
			this.isReleased = true;
			
			this.loading(true);					//终止daFrame的loading动画
			
			if( this.cntIframeObj ){
				this.cntIframeObj.onreadystatechange = null;					//消除循环引用
				this.cntIframeObj.onload = null;

				if( "unknown" != typeof this.cntIframeObj.contentWindow ){
					var insideWin = this.cntIframeObj.contentWindow;
				
					this.setting.load = null;
					this.setting.unload = null;
					this.setting.back = null;
					this.setting.close = null;
					
					insideWin.dialogreturn = null;
					insideWin.back = null;
					
					insideWin.myclosewin = null;
					insideWin.close = null;
					
					insideWin.autosize = null;
					
					if( insideWin.document.body )
						daWheel.unbind( insideWin.document.body );
				}
				
      	this.cntIframeObj.src = "javascript:false;";						//防止内存泄露
	      try{
	     		var insideWin = this.cntIframeObj.contentWindow;
	        insideWin.document.write("");
	        insideWin.document.clear();
//					if( "undeinfed" !== typeof CollectGarbage )
//						setTimeout(CollectGarbage, 1);
	      }catch(e){};
      }
			
			this.release();
		}
		
	};

	
	daFrame.fnStruct.init.prototype = daFrame.prototype;			//模块通过原型实现继承属性

	return daFrame;
})();



win.daFrame = win.daFrame = win.daCnt = daFrame;

})(window);