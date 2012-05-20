/**daGuide
*操作向导类
* @author danny.xu
* @version daGuide_1.0 2011-11-8 20:00:18
*/

(function( win, undefined ){
var doc = win.document,
		_GuideCookie = [];

var tmp = da.cookie( "daGuide" );
if( tmp )
	_GuideCookie = tmp.split(";");


var daGuide = (function(){
	
	/**daGuide类构造函数
	*/
	var daGuide = function( gSetting ){
		return new daGuide.fnStruct.init( gSetting );
	};

	daGuide.fnStruct = daGuide.prototype = {
		version: "daGuide v1.0 \n author: danny.xu \n date: 2011-11-8 20:00:23",
		//TODO:成员属性
		
		gPad: null,
		gCurStep: 0,
		gStepObj: null,
		gCanvasObj: null,
		
		gPoint: null, 
		
		textBox: null,
		buttonBox: null,
		gStopBt: null,
		gHideBt: null,
		gPrevBt: null,
		gNextBt: null,
		
		rect: null,
		rectBorder: null,
		
		curve: null,
		curveBorder: null,
		curveShadow: null,
		
		isShowMask: false,
		
		gSetting: {
			step: null,
			
			range: 50,
			width: 7,
			type: "Step",
			zIndex: 19998
		},
		
		init: function( gSetting ){
			this.gSetting = gSetting = da.extend( {}, this.gSetting, gSetting );
			
			this.gPoint = { left:0, top:0 };
			this.gStepObj = this.findPoint();
			if( null === this.gStepObj ) return;
			
			da.daMaskInit( win );
			
			this.create();
			this.bindEvent();
			
			var tmp = this.getCookie();
			if( null !== tmp ){
				tmp = tmp.split("|");
				this.gCurStep = da.firstValue( parseInt( tmp[1] ), 0 );
			}
			
			this.next();
			
		},
		
		create: function(){
				var gSetting = this.gSetting,
						gPad = doc.createElement("div");
						
				gPad.id = 'daGuide';
				gPad.style.cssText = 'position:absolute; display:none; top:0px; left:0px; border:0px solid #0f0; background:transparent;';
				
				gPad.style.zIndex = gSetting.zIndex;
				
				gPad.style.width = Math.max( da( win ).width(), doc.body.scrollWidth, doc.documentElement.scrollWidth )+ "px";
				gPad.style.height = Math.max( da( win ).height(), doc.body.scrollHeight, doc.documentElement.scrollHeight )+ "px";
				
				doc.body.insertBefore( gPad );
				
				this.gPad = gPad;


				this.gCanvasObj = daCanvas({
					parent: this.gPad,
					width: 800,
					height: 600
					
				});
				
//				canvasObj.dc.daBoxObj.dom[0].innerHTML = "";
				
				this.createBox();
				this.createRect();
				this.createCurve();
				
		},
		
		/**创建提示信息框
		*/
		createBox: function(){
			this.textBox = doc.createElement( "div" );
			this.textBox.style.cssText = [
				"position:absolute; display:none;padding: 20px 10px; background:transparent; border:0px solid #666; color:#fff;",
				"font-size:18px; line-height:24px; font-weight:bold; font-family: '\5B8B\4F53', arial, helvetica, verdana, tahoma, sans-serif;",
				"text-shadow:#000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;",
				"filter:",														
				"Dropshadow(offx=1, offy=0, color=#333333)",				//Glow(color=#000000, strength=3)
				"Dropshadow(offx=0, offy=1, color=#333333)",
				"Dropshadow(offx=0, offy=-1, color=#333333)",
				"Dropshadow(offx=-1, offy=0, color=#333333);"
				
//		    "-moz-box-shadow: 3px 3px 4px #000;",
//		    "-webkit-box-shadow: 3px 3px 4px #000;",
//		    "box-shadow: 3px 3px 4px #000;",
//		    "-ms-filter: progid:DXImageTransform.Microsoft.Shadow(Strength=3, Direction=135, Color='#000000');",		/* For IE 8 */
//		    "filter: progid:DXImageTransform.Microsoft.Shadow(Strength=3, Direction=135, Color='#000000');"				/* For IE 5.5 - 7 */
    	].join("");
    	
			this.gPad.insertBefore( this.textBox );
			
			this.buttonBox = doc.createElement( "div" );
			this.buttonBox.style.cssText = "position:absolute; height:18px;line-height:18px;font-size:12px;font-weight:bold;";
			this.gPad.insertBefore( this.buttonBox );
			
			this.gStopBt = doc.createElement( "div" );
			this.gStopBt.style.cssText = "float:left;height:18px;margin:0px 5px;padding:5px 10px;cursor:pointer;color:#eee;";
			this.gStopBt.innerHTML = "终止向导";
			this.buttonBox.insertBefore( this.gStopBt );
			
			this.gPrevBt = doc.createElement( "div" );
			this.gPrevBt.style.cssText = "float:left;height:18px;margin:0px 5px;padding:5px 10px;cursor:pointer;color:#999;background:#333;";
			this.gPrevBt.innerHTML = "上一步";
			this.buttonBox.insertBefore( this.gPrevBt );
			
			this.gNextBt = doc.createElement( "div" );
			this.gNextBt.style.cssText = "float:left;height:18px;margin:0px 5px;padding:5px 10px;cursor:pointer;color:#999;background:#333;";
			this.gNextBt.innerHTML = "下一步";
			this.buttonBox.insertBefore( this.gNextBt );
			
			this.gHideBt = doc.createElement( "div" );
			this.gHideBt.style.cssText = "float:left;height:18px;margin:0px 5px;padding:5px 10px;cursor:pointer;color:#eee;background:#333;";
			this.gHideBt.innerHTML = "关闭";
			this.buttonBox.insertBefore( this.gHideBt );
			
			
		},
		
		/** 创建框住 指向目标的圆角矩形
		*/
		createRect: function(){
			var step = this.gStepObj,
					dc = this.gCanvasObj.dc;
					
//			var tmp = dc.shape({
//				path: [
//					"m",
//					step.target.left - 10, ",", step.target.top - 10, " ", 
//					"c"+ (step.target.left +step.target.width+10) +","+ step.target.top +" ",
//					step.target.left +step.target.width+10, ",", step.target.top - 10, " ",
//					step.target.left +step.target.width+10, ",", step.target.top +step.target.height+ 10, " ", 
//					"e"
//					
//				].join(""),
//				size: "1,1",
//				borderColor: "#f00",
//				borderWidth: 2,
//				fillColor: "#0f0"
//				
//			}).insert();
//			
//			dc.childElem( "stroke", { 
//				width: 5,
//				opacity: 0.8,
//				style: "shortDot",
//				color: "#333"
//				
//			}).insert( tmp );
//
//			alert( [
//					"m",
//					step.target.left - 10, ",", step.target.top - 10, " ", 
//					"l"+ step.target.left +step.target.width+10 +","+ step.target.top - 10 +" ",
//					step.target.left +step.target.width+10, ",", step.target.top - 10, " ",
//					step.target.left +step.target.width+10, ",", step.target.top +step.target.height+ 10, " ", 
//					"e"
//					
//				].join("") )
				
			
			this.rect = dc.roundRect({									//roundrect(圆角矩形)测试
				left: step.target.left - 10,
				top: step.target.top - 10,
				width: step.target.width + 20,
				height: step.target.height + 20,
				arc: 0.22,
				fill: "false"
				
			}).insert();

			this.rectBorder = dc.childElem( "stroke", { 
				width: 5,
				opacity: 0.8,
				style: "shortDot",
				color: "#fff"
				
			}).insert( this.rect );
			
			
			
		},
		
		/** 创建指向曲线
		*/
		createCurve: function(){
			var step = this.gStepObj,
					dc = this.gCanvasObj.dc;

			var x = step.target.left,
					y = step.target.top+step.target.height/2;

			this.curve = dc.curve({
						from: x + "," + y,
						to: x + "," + y,
						fill: "false"
						
					}).insert();
			
			this.curveBorder = dc.childElem( "stroke", { 											//子标记测试
				width: this.gSetting.width,
				opacity: 0.9,
				style: "shortdot",
				color: "#9f3",
				arrow1: "oval",
				arrow2: "block",
				arrow2Length: "long"
				
			}).insert( this.curve );
			

			this.curveShadow = dc.childElem( "shadow", {
				on: true,
				opacity: 0.9,
				offset: "1px,1px",
				color: "#333"
				
			}).insert( this.curve );
			
			
		},
		
		/** 查询某一步骤的配置信息
		* params {Int} order 步骤序号
		*/
		findPoint: function( idx ){
			idx = da.firstValue( idx, this.gCurStep );
			
			var arrStep = this.gSetting.step[ idx ],
					tmp, tmp2;
			
			if( -1 < arrStep[1].indexOf(",") ){
				tmp2 = arrStep[1].split(",");
				
				if( 4 > tmp2.length ) {
					alert("daGuide温馨提示： 找不到第"+ arrStep[0] +"步骤的指向目标。");
					return null;
				}
				
				tmp = {
					left: parseInt( tmp2[0] ),
					top: parseInt( tmp2[1] ),
					width: parseInt( tmp2[2] ),
					height: parseInt( tmp2[3] ) || 22
				}
				
			}
			else {
				tmp = da( arrStep[1] );
				
				if( 0 < tmp.dom.length ){
					tmp2 = tmp.offset();
					
					tmp = {
						left: tmp2.left,
						top: tmp2.top,
						width: tmp.width(),
						height: tmp.height() || 22
					}
					
				}
				else{
					alert("daGuide温馨提示： 找不到第"+ arrStep[0] +"步骤的指向目标。");
					return null;
				}
				
			}
			
			return {
				order: arrStep[0],
				target: tmp,
				text: arrStep[2] || "请您跟随箭头的指示操作，谢谢。",
				color: arrStep[3] || "#9f3"
			};
			
		},
		
		/**事件绑定
		*/
		bindEvent: function(){
			var context = this;
			
			da( this.gPad ).bind("mousemove", function( evt ){
					var step = context.gStepObj,
							dc = context.gCanvasObj.dc;
					
					if( null === step ) {
						da( this ).unbind("mousemove");
						return;
					}
					
					var minX = step.target.left - context.gSetting.range,
							minY = step.target.top - context.gSetting.range,
							maxX = step.target.left + step.target.width + context.gSetting.range,
							maxY = step.target.top + step.target.height + context.gSetting.range,
							x1 = step.target.left+step.target.width/2,
							y1 = step.target.top+step.target.height*.8,
							pt = {
							  x: evt.pageX,
								y: evt.pageY
							};
					if( minX <= pt.x && maxX >= pt.x
						 && minY <= pt.y && maxY >= pt.y ){														//判断是否在矩形区域内
						context.hide();
						
					}
					else{
						context.show();
						
						var daPad = da( context.gPad ),
								d = Math.sqrt( (pt.x-x1)*(pt.x-x1) + (pt.y-y1)*(pt.y-y1) );
						
						context.curve.attr({
							from: pt.x + "," + pt.y,
							curve1: pt.x + "," + pt.y,
							curve2: (pt.x-d*.5)+","+(pt.y-d*.5)
						});
						
						if( 200 > d ){
							context.curveBorder.attr({
								opacity: d/200
							});
							context.curveShadow.attr({
								opacity: d/200
							});
						}
					}
					
			});
			
			da( this.gHideBt ).bind( "click", function(){
				context.hide();
				context.gPad.style.display = "none";
			});
			
			da( this.gStopBt ).bind( "click", function(){
				context.stop();
			});
			
			da( this.gPrevBt ).bind( "click", function(){
				context.next( context.gCurStep );
			});
			
			da( this.gNextBt ).bind( "click", function(){
				context.next( context.gCurStep+2 );
			});
			
			
			
		
		},
		
		/**设置提示文字
		*/
		setText: function( text ){
			var step = this.gStepObj,
					daButtonBox = da( this.buttonBox ),
					daTextBox = da( this.textBox ),
					daPad = da( this.gPad );
			
			daTextBox.dom[0].innerHTML = '<span style="color:'+ step.color +';font-size:28px;">'+ this.gSetting.type +' ' + step.order + '：</span>'+ da.firstValue( text, step.text );
			
			var boxLeft = ( daPad.width() - daTextBox.width() )/2,
					boxTop = ( step.target.top > daPad.height()/2 ? daPad.height()/3 : daPad.height() - daPad.height()/3 );
			
			daTextBox.css({
//				left: ( step.target.left > daPad.width()/2 ? step.target.left - daTextBox.width() : step.target.left ),
//				top: ( step.target.top > daPad.height()/2 ? step.target.top - daTextBox.height() : step.target.top + step.target.height + 100 )
				left: boxLeft,
				top: boxTop
				
			});
			
			daButtonBox.css({
				left: boxLeft + daTextBox.width() - daButtonBox.width(),
				top: boxTop + daTextBox.height()
			});
			
		},
		
		/**跳转到某一个向导步骤
		*/
		next: function( order ){
			var gSetting = this.gSetting,
					step, x, y, idx;
			
			if( 0 >= order || gSetting.step.length <= order ) return;
			if( this.isStopGuide() ){ this.stop(); return; }
			
			idx = this.gCurStep = da.firstValue( order-1, ( gSetting.step.length-1 > this.gCurStep ? this.gCurStep : gSetting.step.length-1 ) );
			step = this.gStepObj = this.findPoint( idx );
			if( null === step ) return;
			
			this.show();
			this.gPad.style.display = "block";
			
			this.setText();
			
			da( this.rect.vmlElem ).css({									//roundrect(圆角矩形)测试
				left: step.target.left - 10,
				top: step.target.top - 10,
				width: step.target.width + 20,
				height: step.target.height + 20
				
			});

			this.rectBorder.attr({ 
				width: 5,
				opacity: 0.8,
				color: "#fff"
				
			});
			
			x = step.target.left;
			y = step.target.top+step.target.height/2;
			
			this.curve.attr({
				to: x + "," + y
				
			});
			this.curveBorder.attr({
				opacity: 1,
				color: step.color
			});
			this.curveShadow.attr({
				opacity: 1
			});
			
 
			this.setCookie( idx );
		},
		
		isStopGuide: function(){
			var code = win.location.href.substring( win.location.href.lastIndexOf("/") );
			
			for( var i=0,len=_GuideCookie.length; i<len; i++ ){
				tmp = _GuideCookie[i].split("|");
				
				if( code === tmp[0] && "No" === tmp[1] )
					return true;
				
			}
			
			return false;
		},
		
		show: function(){
			if( !this.isShowMask ){
				da.daMaskShow( win, 30);
				this.isShowMask = true;
			}
			
			this.rect.vmlElem.style.display = "block";
			this.curve.vmlElem.style.display = "block";
			this.textBox.style.display = "block";
			this.buttonBox.style.display = "block";
			
			if( 0 >= this.gCurStep )
				this.gPrevBt.style.display = "none";
			else
				this.gPrevBt.style.display = "block";
			
			if( this.gSetting.step.length-2 <= this.gCurStep )
			 	this.gNextBt.style.display = "none";
			else
				this.gNextBt.style.display = "block";
			 
		},
		
		hide: function(){
			if( this.isShowMask ){
				da.daMaskHide();
				this.isShowMask = false;
			}
			
			this.rect.vmlElem.style.display = "none";
			this.curve.vmlElem.style.display = "none";
			this.textBox.style.display = "none";
			this.buttonBox.style.display = "none";
		},
		
		getCookie: function(){
			var code = win.location.href.substring( win.location.href.lastIndexOf("/") ),
					tmp = null;
			
			for( var i=0,len=_GuideCookie.length; i<len; i++ ){
				tmp = _GuideCookie[i].split("|");
				if( code === tmp[0] )
					return _GuideCookie[i];
			}
			
			return null;
			
		},
		
		setCookie: function( value ){
			var code = win.location.href.substring( win.location.href.lastIndexOf("/") ),
					tmp = this.getCookie();
			
			if( null === tmp ){
				_GuideCookie.push( code +"|"+ value );
			}
			else{
				for( var i=0,len=_GuideCookie.length; i<len; i++ ){
					tmp = _GuideCookie[i].split("|");
					if( code === tmp[0] )
						_GuideCookie[i] = code +"|"+ value;
				
				}
			}
			
			da.cookie( "daGuide", _GuideCookie.join(";") );
		
		},
		
		/**终止当前页面的向导
		*/
		stop: function(){
			this.hide();
			this.gPad.style.display = "none";
			
			this.setCookie("No");
			
		},
		
		/**启动当前页面的向导
		*/
		start: function(){
			this.gPad.style.display = "block";
			this.show();
			
			this.setCookie( this.gCurStep );
			this.next();
		}
		
	};


	daGuide.fnStruct.init.prototype = daGuide.prototype;			//模块通过原型实现继承属性

	
	return daGuide;
})();




win.daGuide = daGuide;

})(window);