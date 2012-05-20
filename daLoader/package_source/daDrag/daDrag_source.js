/*
	author:	danny.xu
	date:	2010-11-10
	description:	daDrag类脚本文件
*/
(function(win){
var doc = win.document;

var daDrag = (function(){
	/**daDrag类构造函数
	*@param {PlainObject} dragSetting 参数列表
	
	*@return {daDrag} daDrag对象
	*/
	var daDrag = function( dragSetting ){
		return new daDrag.fnStruct.init( dragSetting );
	};

	daDrag.fnStruct = daDrag.prototype = {
		version: "daDrag 1.0  \n\nauthor: danny.xu\n\ndate: 2010-11-10\n\nThank you!!!",
		
		daDragSrc: null,				//拖动事件对象（一般为标题栏）
		daDragTarget: null,			//被拖动对象（一般为整个窗口容器对象）
		
		/**
		*@param {DOM|String} src 可拖动对象 或id
		*@param {DOM|String} target	被拖动对象 或id
		*@param {Function} before	拖动前回调事件
		*@param {Function} move 移动中回调事件
		*@param {Function} after 拖动完成后回调事件
		
		*@param {String} cursor	拖动时指针样式,默认为"move"
		*/
		dragSetting: {
			window: win,
			src: null,
			target: null,
			
			before: null,
			move: null,
			after: null,
			
			cursor: "move"
		},
		
		daDraging:	false,			//拖动中…状态
		tagOldPos:	{x:0, y:0},	//被拖动对象 开始拖动时起点
		mouseStart: {x:0, y:0},	//鼠标起点
		mouseEnd: {x:0, y:0},		//鼠标终点
		
		//初始化函数
		/*
		*@param {PlainObject} dragSetting 参数列表
		*/
		init: function( dragSetting ){
			this.dragSetting = dragSetting = da.extend( true, {}, this.dragSetting, dragSetting );
			win = dragSetting.window;
			doc = win.document;
			
			var objSrc = dragSetting.src,
					objTarget = dragSetting.target;
			if("string" == typeof objSrc){
				objSrc = doc.getElementById(objSrc);
				if(null == objSrc){alert("daTab提示:找不到可拖动对象。");return false;}
			}
			this.daDragSrc = objSrc;				//保存可拖动对象
			
			if("string" == typeof objTarget){
				objTarget = doc.getElementById(objTarget);
				if(null == objTarget){/*alert("daTab提示:找不到被拖动对象。");*/return false;}
			}
			this.daDragTarget = objTarget || this.daDragSrc;	//保存被拖动对象，如果没有就拖动自己
			
			this.bind();
			
			return this;
		},
		
		//绑定事件函数
		bind: function(){
			var context = this,
					fnBeforeDrag = this.dragSetting.before,
					fnMoveing = this.dragSetting.move,
					fnAfterDrag = this.dragSetting.after;
			
			//鼠标指针样式变化(src)
			da( this.daDragSrc ).bind("mouseover", this.eventMouseOver = function(evt){
				this.style.cursor = context.dragSetting.cursor;
				
			}).bind("mouseout", this.eventMouseOut = function(evt){
				this.style.cursor = "default";
				
			});
			
			//鼠标按下(src)
			da( this.daDragSrc ).bind("mousedown", this.eventMouseDown = function(evt){
				if(win.captureEvents){											//锁定事件源对象
					win.captureEvents(evt.MOUSEMOVE);					//标准DOM
					evt.stopPropagation();
					evt.preventDefault();
				}
				else if(context.daDragSrc.setCapture)				//IE
					context.daDragSrc.setCapture();

				
				context.tagOldPos = {				//获取被拖动对象 开始拖动时起点
					x: parseInt(context.daDragTarget.offsetLeft),
					y: parseInt(context.daDragTarget.offsetTop)
				};
				context.daDragPStart={			//获取开始拖动 鼠标起点
					x: parseInt(evt.clientX),
					y: parseInt(evt.clientY)
				};
				context.daDraging = true;								//开始拖动
				
				//执行拖动前回调事件
				if(fnBeforeDrag) fnBeforeDrag.call( context, evt, context.daDragSrc, context.daDragTarget);
			});
			
			//鼠标移动、鼠标弹起(Document)
			da( doc ).bind("mousemove", this.eventMouseMove = function(evt){
				if(context.daDraging){									//拖动中…
						context.daDragPEnd={		//获取开始拖动 鼠标终点
							x: evt.clientX,
							y: evt.clientY
						};
						var xmove = context.daDragPEnd.x - context.daDragPStart.x;		//平移坐标差值
						var ymove = context.daDragPEnd.y - context.daDragPStart.y;
				
						var nowPos={																						//被拖动对象当前位置
							x: context.tagOldPos.x + xmove,
							y: context.tagOldPos.y + ymove
						};
						
						//拖动中回调事件
						if( fnMoveing ) nowPos = fnMoveing.call( context, evt, context.daDragSrc, context.daDragTarget, context.tagOldPos, nowPos, context.daDragPStart, context.daDragPEnd ) || nowPos;
						
						//改变被拖动对象的位置
						context.daDragTarget.style.left = ( "auto" == nowPos.x ? nowPos.x : nowPos.x + "px" );
						context.daDragTarget.style.top = ( "auto" == nowPos.y ? nowPos.y : nowPos.y + "px" );
						
						//防止拖动中选中文字，使拖动不畅
						if( win.getSelection )
							win.getSelection().removeAllRanges();
						else if(doc.getSelection)
							doc.getSelection().removeAllRanges();
						else
							doc.selection.empty();
				
				}
				
			}).bind("mouseup", this.eventMouseUp = function(evt){
				if(context.daDraging){									//拖动中…	
					if(win.releaseEvents)														//释放 事件源对象锁定状态
						win.releaseEvents(evt.MOUSEMOVE);							//标准DOM
					else if(context.daDragSrc.releaseCapture)				//IE
						context.daDragSrc.releaseCapture();
					
				 	//context.daDragSrc.style.cursor = "default" ;
					context.daDraging = false;								//结束拖动
					
					//拖动完成后回调事件
					if(fnAfterDrag) fnAfterDrag.call( context, evt, context.daDragSrc, context.daDragTarget);
				}

			});

			this.daDragSrc.daDragObj = this;									//在DOM对象的属性中缓存daDrag对象地址，方便之后调用daDrag.unbind()函数时，事件的释放，避免内存泄露
		}
		
	};

	//继承
	daDrag.fnStruct.init.prototype = daDrag.prototype;
	
	/**释放事件绑定（ 避免内存泄露 ）
	*/
	daDrag.unbind = function( srcObj ){
		var daDragSrc = da( srcObj );
		if( 0 < daDragSrc.dom.length ){
			var mousewheel = da.browser.firefox ? "DOMMouseScroll" : "mousewheel";

			daDragSrc.each(function( i, obj ){
				var daDragObj = this.daDragObj;
				
				if( daDragObj ){
					da( this ).unbind( "mouseover", daDragObj.eventMouseOver ).unbind( "mouseout", daDragObj.eventMouseOut ).unbind( "mousedown", daDragObj.eventMouseDown );
					da( doc ).unbind( "mousemove", daDragObj.eventMouseMove ).unbind( "mouseup", daDragObj.eventMouseUp );
					
					this.daDragObj = null;
				}
			});
		}
	};
	
	return daDrag;
})();


	//全局属性
	win.daDrag = win.drag = daDrag;
	
})(window);