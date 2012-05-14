/**daCanvas
*矢量图形绘制类
* @author danny.xu
* @version daCanvas_1.0 2011-10-31 17:31:23
*/
(function( win, undefined ){
var doc = win.document,
		_SVG_NS = "http://www.w3.org/2000/svg",
		_HasSVG = !!doc.createElementNS && !!doc.createElementNS(_SVG_NS, 'svg').createSVGRect;
		

var daCanvas = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daCanvas = function( setting ){
		return new daCanvas.fnStruct.init( setting );
	};

	daCanvas.fnStruct = daCanvas.prototype = {
		version: "daCanvas v1.0 \n author: danny.xu \n date: 2011-10-31 17:31:26",
		
		draw: null,
		
		setting: {
			parent: null,
			click: null
		},
		
		curDrawing: "",							//当前正在绘制的图形
		curStep: "",							//绘制过程的当前步骤
		curObj: null,							//绘制过程的临时辅助图形对象
		
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );

			if( _HasSVG )
				this.draw = daSVG( setting );
			else
				this.draw = daVML( setting );
			
			this.bindEvent();
		},
		
		/**调整画布尺寸
		*/
		resize: function(){
			this.draw.resize();
		},
		
		/**清空图形
		*/
		clear: function(){
			this.draw.clear();
		},
		
		/**事件绑定
		*/
		bindEvent: function(){
			var context = this,
				mapObj = this.draw.daBoxObj.dom[0];
			
			da(mapObj).bind("click",function( evt ){
				context.click( evt );
			});
			
			da(mapObj).bind("dblclick",function( evt ){
				context.dblclick( evt );
			});
			
			da(mapObj).bind("mousedown",function( evt ){
				context.mousedown( evt );
			});
			
			da(mapObj).bind("mouseup",function( evt ){
				context.mouseup( evt );
			});
			
			da(mapObj).bind("mousemove",function( evt ){
				context.mousemove( evt );
			});
			
			da(mapObj).bind("contextmenu",function( evt ){				//屏蔽右键菜单
				evt.stopPropagation();
				evt.preventDefault();
			});
		},
		
		/**鼠标按下事件
		*/
		mousedown: function( evt ){
			var mapObj = this.draw.daBoxObj.dom[0],
				mX = evt.pageX,
				mY = evt.pageY,
				cvsOffSet = this.draw.daParentObj.offset(),							//画布的浏览器绝对位置
				X = mX - cvsOffSet.left,
				Y = mY - cvsOffSet.top;
			
			// switch( this.curDrawing ){
				// case "POLYLINE":
				// case "POLYGON":
					// break;
			// }
			
			if( this.setting.click ) this.setting.click( mX, mY, mapObj, evt );
					
		},
		
		/**鼠标弹起事件
		*/
		mouseup: function( evt ){
			var mapObj = this.draw.daBoxObj.dom[0],
				mX = evt.pageX,
				mY = evt.pageY,
				cvsOffSet = this.draw.daParentObj.offset(),							//画布的浏览器绝对位置
				X = mX - cvsOffSet.left,
				Y = mY - cvsOffSet.top;
			
			switch( this.curDrawing ){
				case "POLYLINE":
				case "POLYGON":
					if( 2 === evt.button ){
						this.curStep = "BEGIN"; //"OVER";
						if( this.curObj["callback"] ){
							this.curObj["callback"]( false, {left:X, top:Y}, {mouseX: mX, mouseY: mY} );
							this.curObj["callback"]( true, this.curObj );
						}
					}
					break;
			}
			
			if( this.setting.click ) this.setting.click( mX, mY, mapObj, evt );
					
		},
		
		/**鼠标移动事件
		*/
		mousemove: function( evt ){
			var mapObj = this.draw.daBoxObj.dom[0],
				mX = evt.pageX,
				mY = evt.pageY,
				cvsOffSet = this.draw.daParentObj.offset(),							//画布的浏览器绝对位置
				X = mX - cvsOffSet.left,
				Y = mY - cvsOffSet.top;

			switch( this.curDrawing ){
				case "LINE":
					if( "FIRST_DOT" === this.curStep ){
						this.curObj["line"].attr( "to", X + "," + Y );
						
					}
					break;
				case "POLYLINE":
					if( "FIRST_DOT" === this.curStep ){
						var arrPoint = this.curObj["points"];
						arrPoint[ arrPoint.length-1 ] = X + "," + Y;
						
						this.curObj[ "polyline" ].attr( "points", arrPoint.join(" ") );
						
					}
					break;
				case "POLYGON":
					if( "FIRST_DOT" === this.curStep ){
						var arrPoint = this.curObj["points"];
						arrPoint[ arrPoint.length-1 ] = X + "," + Y;
						
						this.curObj[ "polygon" ].attr( "points", arrPoint.join(" ") );
						
					}
					break;
			}
			
			
			if( this.setting.mousemove ) this.setting.mousemove( mX, mY, mapObj, evt );
		},
		
		/**鼠标点击事件
		*/
		click: function( evt ){
			var mapObj = this.draw.daBoxObj.dom[0],
				mX = evt.pageX,
				mY = evt.pageY,
				cvsOffSet = this.draw.daParentObj.offset(),							//画布的浏览器绝对位置
				X = mX - cvsOffSet.left,
				Y = mY - cvsOffSet.top;
			
			switch( this.curDrawing ){
				case "POINT":
					if( "BEGIN" === this.curStep ){
						this.curObj["circle"] = this.draw.circle({
							cx: X, 
							cy: Y,
							r: 3,
							borderWidth: 2,
							fillColor: "#f00",
							opacity: 0.6
						}).insert();
						
						this.curStep = "FIRST_DOT"; //"OVER";
						if( this.curObj["callback"] ){
							this.curObj["callback"]( false, {left:X, top:Y}, {mouseX: mX, mouseY: mY} );
							this.curObj["callback"]( true, this.curObj );
						}
					}
					break;
				case "LINE":
					if( "BEGIN" === this.curStep ){
						this.curObj["circle"] = this.draw.circle({
							cx: X, 
							cy: Y,
							r: 3,
							borderWidth: 2,
							fillColor: "#f00",
							opacity: 0.6
						}).insert();
						
						this.curObj["line"] = this.draw.line({
							from: X + "," + Y,
							to: X + "," + Y,
							borderWidth: 4,
							borderColor: "#f00",
							opacity: 0.6
						}).insert();
						
						this.curStep = "FIRST_DOT";
						if( this.curObj["callback"] ) this.curObj["callback"]( false, {left:X, top:Y}, {mouseX: mX, mouseY: mY} );
					}
					else if( "FIRST_DOT" === this.curStep ){
						this.curObj["circle2"] = this.draw.circle({
							cx: X, 
							cy: Y,
							r: 3,
							borderWidth: 2,
							fillColor: "#f00",
							opacity: 0.6
						}).insert();
						
						this.curStep = "BEGIN"; //"OVER";
						if( this.curObj["callback"] ) this.curObj["callback"]( true, this.curObj );
					}
					
					break;
				case "POLYLINE":
					if( "BEGIN" === this.curStep ){
						var arrPoint = [];
						arrPoint.push(X + "," + Y);
						arrPoint.push(X + "," + Y);
						
						this.curObj["points"] = arrPoint;

						this.curObj["polyline"] = this.draw.polyline({
							points: arrPoint.join(" "),
							borderWidth: 2
						}).insert();
						
						this.curStep = "FIRST_DOT";
					}
					else if( "FIRST_DOT" === this.curStep ){
						var arrPoint = this.curObj["points"];
						arrPoint.push(X + "," + Y);

						this.curObj["polyline"].attr( "points", arrPoint.join(" ") );
					}
					
					if( this.curObj["callback"] ) this.curObj["callback"]( false, {left:X, top:Y}, {mouseX: mX, mouseY: mY} );
					break;
				case "POLYGON":
					if( "BEGIN" === this.curStep ){
						var arrPoint = [];
						arrPoint.push(X + "," + Y);
						arrPoint.push(X + "," + Y);
						
						this.curObj["points"] = arrPoint;

						this.curObj["polygon"] = this.draw.polygon({
							points: arrPoint.join(" "),
							borderWidth: 2,
							fillOpacity: 0.1
						}).insert();
						
						this.curStep = "FIRST_DOT";
					}
					else if( "FIRST_DOT" === this.curStep ){
						var arrPoint = this.curObj["points"];
						arrPoint.push(X + "," + Y);

						this.curObj["polygon"].attr( "points", arrPoint.join(" ") );
						
					}
					
					if( this.curObj["callback"] ) this.curObj["callback"]( false, {left:X, top:Y}, {mouseX: mX, mouseY: mY} );
					break;
			}
			
			
			if( this.setting.click ) this.setting.click( mX, mY, mapObj, evt );
		},
		
		/**鼠标双击事件
		*/
		dblclick: function( evt ){
			var mapObj = this.draw.daBoxObj.dom[0],
				mX = evt.pageX,
				mY = evt.pageY,
				cvsOffSet = this.draw.daParentObj.offset(),							//画布的浏览器绝对位置
				X = mX - cvsOffSet.left,
				Y = mY - cvsOffSet.top;
			
			if( this.setting.dblclick ) this.setting.dblclick( mX, mY, mapObj, evt );
		},
		
		/**停止绘制
		*/
		stop: function(){
			this.curDrawing = "";
			this.curStep = "";
			this.curObj = {};
		},
		
		/**绘制点
		* @param {function} fn 用户回调函数，如fn(isEof, data1, data2, data3...){}
		*/
		point: function( fn ){
			this.curDrawing = "POINT";
			this.curStep = "BEGIN";
			this.curObj = {"callback":fn};
			
		},
		
		/**绘制直线
		* @param {function} fn 用户回调函数，如fn(isEof, data1, data2, data3...){}
		*/
		line: function( fn ){
			this.curDrawing = "LINE";
			this.curStep = "BEGIN";
			this.curObj = {
				"callback": fn,
				"circle": null,
				"line": null,
				"circle2": null
			};
			
		},
		
		/**绘制多边形
		* @param {function} fn 用户回调函数，如fn(isEof, data1, data2, data3...){}
		*/
		polyline: function( fn ){
			this.curDrawing = "POLYLINE";
			this.curStep = "BEGIN";
			this.curObj = {
				"callback": fn,
				"points": [],
				"polygon": null
			};
			
		},
		
		/**绘制多边形
		* @param {function} fn 用户回调函数，如fn(isEof, data1, data2, data3...){}
		*/
		polygon: function( fn ){
			this.curDrawing = "POLYGON";
			this.curStep = "BEGIN";
			this.curObj = {
				"callback": fn,
				"points": [],
				"polygon": null
			};
			
		}
	};

	daCanvas.fnStruct.init.prototype = daCanvas.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daCanvas;
})();




win.daCanvas = daCanvas;

})(window);


