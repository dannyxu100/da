/***************** 遮罩层 **************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 遮罩层
	version: 1.0.0
*/
(function(da){
	function fnProp(n) {
	  return n && n.constructor === Number ? n + 'px' : n;
	}
	
	da.fnStruct.extend({
			bgiframe: function( params ){
				var def = {
					top: "auto",
					left: "auto",
					width: "auto",
					height: "auto",
					opacity: true,
					src: "javascript:false;"
		    };
		    
		    params = da.extend( {}, def, params );
		    
				var iframeObj, overObj, doc,
						css = "display:block;position:absolute;z-index:-1;background:transparent;top:0px;left:0px;width:100%;height:100%;" ;
		    this.each( function(){
                    doc = this.ownerDocument;
                    
				    iframeObj = doc.createElement("iframe");
				    iframeObj.src = params.src;
				    iframeObj.className = "daBgIframe";
				    iframeObj.setAttribute( "frameborder", 0, 0 );
				    iframeObj.setAttribute( "tabindex", -1 );
				    iframeObj.style.cssText = [
				   		css, 
				   		( params.opacity === true ? 'filter:Alpha(Opacity=\'0\');' : '' )
				   	].join("");
				   	
//				    iframeObj.style.cssText = [
//				    	"display:block;position:absolute;z-index:-1;background:transparent;",
//              ( params.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '' ),
//				    	'top:', ( 'auto' == params.top ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : fnProp(params.top) ),
//					    ';left:', ( 'auto' == params.left ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : fnProp(params.left)),
//							';width:', ( 'auto' == params.width ? 'expression(this.parentNode.offsetWidth+\'px\')' : fnProp(params.width)),
//							';height:', ( 'auto' == params.height ? 'expression(this.parentNode.offsetHeight+\'px\')' : fnProp(params.height)), 
//							";"
//						].join("");
						
				    overObj = doc.createElement("div");
				    overObj.style.cssText = [
				   		css, 
				   		( params.opacity === true ? 'filter:Alpha(Opacity=\'0\');' : '' )
				   	].join("");
//				    overObj.style.cssText = [
//				    	"display:block;position:absolute;z-index:-1;border:1px solid #0f0;background:transparent;",
//              ( params.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '' ),
//				    	'top:0', //( 'auto' == params.top ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : fnProp(params.top) ),
//					    ';left:0', //( 'auto' == params.left ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : fnProp(params.left)),
//							';width:', ( 'auto' == params.width ? 'expression(this.parentNode.offsetWidth+\'px\')' : fnProp(params.width)),
//							';height:', ( 'auto' == params.height ? 'expression(this.parentNode.offsetHeight+\'px\')' : fnProp(params.height)), 
//							";"
//						].join("");

       
		        if( 0 === da(this).children('iframe.daBgIframe').dom.length ){
		        	this.insertBefore( overObj, this.firstChild );
		        	this.insertBefore( iframeObj, this.firstChild );
		        }
		    });
		    
		    defParams = null;
		    iframeObj = null;
	
		    return this;
			}
	});
	
	da.extend({
			//初始化遮罩层对象		//body的onLoad事件会重载
			/*
				zIndex: 显示覆盖的z坐标
			*/
			daMaskInit: function( maskWin, zIndex ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = maskDoc.createElement("div");
						
				objMask.id = 'daMask';
				objMask.style.cssText = 'position:absolute; top:0px; left:0px; display:none; background:#000; filter: Alpha(opacity=50);/* IE */ -moz-opacity:0.5;/* FF 主要是为了兼容老版本的FF */ opacity:0.5;/* FF */';
				
				objMask.style.zIndex = zIndex || 19998;								//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
				
				objMask.style.width = Math.max( da( maskWin ).width(), maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth )+ "px";
				objMask.style.height = Math.max( da( maskWin ).height(), maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight )+ "px";
	//				da( objMask ).bind("mousedown",function(){
	//					da.daMaskHide(maskWin);
	//				});
				maskDoc.body.insertBefore(objMask);
				
				da(objMask).bgiframe();
				
				//body大小改变时，调用遮罩层更新尺寸函数
				da( maskWin ).bind( "resize", function(){
					da.daMaskFresh( this );
				});
				
				return objMask;
			},
			
			//是否已经初始化
			daGetMask: function( maskWin ){
				maskWin = maskWin || window;
				var objMask = maskWin.document.getElementById("daMask");
				if(null==objMask) return false;
				else return objMask;
			},
			
			//更新遮罩层对象大小尺寸   //body的onResize事件会重载
			daMaskFresh: function( maskWin ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = da.daGetMask( maskWin );
				if( !objMask ) objMask = da.daMaskInit( maskWin );
				
				objMask.style.width = Math.max( da( maskWin ).width(), maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth ) + "px"; 
				objMask.style.height = Math.max( da( maskWin ).height(), maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight ) + "px"; 
				
				//this.daMaskShow( maskWin );
			},
			
			//显示遮罩层
			/*
				zIndex: 显示覆盖的z坐标
			*/
			daMaskShow: function( maskWin, opacity, color, zIndex ){
				maskWin = maskWin || window;
				var maskDoc = maskWin.document,
						objMask = da.daGetMask( maskWin );
				if( !objMask ) objMask = da.daMaskInit( maskWin );
				
				da.daMaskFresh( maskWin );
				
				objMask.style.background = color || "#000";
				objMask.style.filter = "Alpha(opacity="+ (opacity || 50) +")";
				objMask.style.opacity = ( opacity || 50 )/100;
				//objMask.style.mozOpacity = opacity || 0.5;
				objMask.style.zIndex = zIndex || 19998;									//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
				
				if( "undefined" !== typeof daFx )
					da( objMask ).fadeIn(300);
				else
					objMask.style.display = "block";
				
			},
			
			//隐藏遮罩层
			daMaskHide: function( maskWin ){
				maskWin = maskWin || window;
				var objMask = da.daGetMask( maskWin );
				if( !objMask ) return;
				
	//				if( "undefined" !== typeof daFx )															//异步动作容易出错啊。
	//					da( objMask ).fadeOut(300);
	//				else
					objMask.style.display = "none";
					
			}
		
	});
})(da);
