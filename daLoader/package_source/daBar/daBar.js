/*
	author: danny.xu
	date: 	2011-5-9 13:45:03
	discription:	增强版按钮daBar	
*/



(function( win ){

var doc = win.document;

//daBarg构造函数
var daBar = function( barSetting ){
		return new daBar.fnStruct.init( barSetting );
};

//daButon原型
daBar.fnStruct = daBar.prototype = {
		version: "daBar 1.0 \n\nauthor: danny.xu\n\ndate: 2011-5-9 21:18:27\n\n Thanks!",
		
		barId: 0,										//唯一序号
		barObj: null,								//daBar中button 元素
		barParentObj: null,					//daBar 父元素

		barColorObj: null,
		barBgObj: null,
		barTxtObj: null,
		barBtRightObj: null,

		barSetting: {									//用户参数列表
			parent: null,								//daBar 父元素id
			id: null,										//daBar 用户自定义button id
			width: "100px",
			color: "#eee,#666",					//用户自定义风格颜色[ 无效值颜色，有效值颜色 ]RGB用逗号分隔
			style: 1,										//数值显示风格，可选[ 0:默认百分比, 1:数值， 2:带总数的数值]
			value: 0,
			unit: "",
			min: 0,
			max: 100,
			
			css: {											//用户自定义样式
				daBar: "daBar",
				daBarFocus: "daBar2",
				over: "daBarover",
				color: "daBarColor",
				bg: "daBarBg",
				txt: "daBarTxt",
				bt: "daBarBt"
			},
			
			drag: null									//拖动事件
			
		},
		
		barArrColor: null,						//当前风格颜色数组
		barNowValue: 0,								//当前值
		
		//出事化函数
		/*
			barSetting: 用户自定义参数列表
		*/
		init: function( barSetting ){
			this.barSetting = barSetting = da.extend( true, {}, this.barSetting, barSetting);
			
			if( barSetting.id )
				this.barId = barSetting.id;
			else 
				//this.barId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daBar_" + this.barId ) ) this.barId++;						//保证id 唯一性

			this.barParentObj = doc.getElementById( barSetting.parent ) || doc.body;
			
			this.barArrColor = barSetting.color.split(",");

			this.create();
			
			return this;
		},
		
		//创建HTML对象集
		create: function(){
			var barSetting = this.barSetting,
					barObj = doc.createElement("div");
					
			barObj.className = this.barSetting.css.daBar;
			barObj.id = this.barSetting.id || "daBar_" + this.barId;
			barObj.innerHTML = [
					'<div id="daBarOver_', this.barId,'" class="', barSetting.css.over, '"></div>',
					'<div id="daBarColor_', this.barId,'" class="', barSetting.css.color, '"></div>',
					'<div id="daBarBg_', this.barId,'" class="', barSetting.css.bg, '" ></div>',
					'<div id="daBarTxt_', this.barId,'" class="', barSetting.css.txt, '" ></div>',
					
					'<a id="daBarBtRight_', this.barId,'" class="', barSetting.css.bt, '" href="javascript:void(0);"></a>'
			].join("");
			
			this.barObj = barObj;
			this.barParentObj.insertBefore( barObj, null );
			
			this.barColorObj = doc.getElementById( "daBarColor_" + this.barId );								//获得对象集
			this.barBgObj = doc.getElementById( "daBarBg_" + this.barId );
			this.barTxtObj = doc.getElementById( "daBarTxt_" + this.barId );
			this.barBtRightObj = doc.getElementById( "daBarBtRight_" + this.barId );
			
			if( null === this.barSetting.drag ) this.barBtRightObj.style.display = "none";
			
			this.color( this.barSetting.color );
			this.size( this.barSetting.width );																									//设置控件尺寸
			this.value( this.barSetting.value );																								//设置控件值
			this.bindEvent();																																		//绑定控件事件
			
		},
		
		//绑定事件
		bindEvent: function(){
			var dragEvent = this.barSetting.drag,
					context = this;
	
			da( this.barObj ).bind( "mousedown", function(){
				context.focus();
			
			}).bind( "mouseup", function(){
				context.blur();
			
			});
			
			if( null !== dragEvent ){
					daDrag({
						src: this.barBtRightObj,
						target: this.barBtRightObj,
						cursor: "w-resize",
						move:	function( evt, srcObj, targetObj, oldPos, nowPos, prevMousePos, nowMousePos ){
							var minX = 0,
									maxX = da(context.barObj).width() - 6,					//减去body 的间距6像素
									nPercent;						
							
							nowPos.x = ( nowPos.x > maxX ) ? maxX : nowPos.x;
							nowPos.x = ( nowPos.x < minX ) ? minX : nowPos.x;
							nPercent = parseInt( nowPos.x / maxX * 100, 10 );
							
							dragEvent.call( context, evt, nPercent, parseInt( nPercent/100*context.barSetting.max, 10 ) );
							//da.out(maxX);
							context.value( nPercent +"%" );
	
							return { x: nowPos.x, y: -3 }							//y不能变，x不能超出范围
						}
					});
					
					
					
//					da( context.barObj ).bind( "", function( evt ){
//							if( false === events[type].call( this, evt, context  ) || context.isStopDefault ) return;				//如果用户自定义事件函数返回 false 或 daBar对象阻止默认事件冒泡，就不执行下面的默认事件处理了
//							
//					});
			}

		},
		
		//设置是否阻止默认事件
		/*
			isStopDefault: 是否阻止默认事件标志，可选bool
		*/
		setStopDefault: function( isStopDefault ){
			this.isStopDefault = da.isNull( isStopDefault, false );
		},
		
		//设置按钮尺寸
		/*
			width: 宽度
			height: 高度
		*/
		size: function( width ){
			width = ( width || this.barSetting.width ).toString();
			width = width.replace("px","");
			
			this.barObj.style.width = width + "px";
			this.barTxtObj.style.left = (parseInt(width) + 5) + "px";					//文字和进度条之间，多加10的间距
		},
		
		//设置按钮用户自定义内容
		/*
			num: 控件值
		*/
		value: function( num ){
			if( undefined === num ) return this.barNowValue;
			
			var nPercent = "number" === typeof num 
					? parseInt( num/this.barSetting.max*100, 10) 
					: ( ("string" === typeof num) && ( 0 < num.indexOf( "%" ) ) 
									? parseInt( num.replace("%",""), 10) 
									: parseInt( num, 10 ) );
					
			nPercent = ( 0 > nPercent ) ? 0 : ( 100 < nPercent ) ? 100 : nPercent;
			this.barNowValue = parseInt( nPercent/100 * this.barSetting.max, 10 );
			
			switch( this.barSetting.style ){
					case 1:
						this.barTxtObj.innerHTML = [
								'<span style="color:#C13100;font-weight:bold;">', nPercent,
								'</span>%'
						].join("");
						break;
						
					case 2:
						this.barTxtObj.innerHTML = [
								'<span style="color:#C13100;font-weight:bold;">',
								this.barNowValue, 
								'</span>', '&nbsp;',
								this.barSetting.unit,
						].join("");
						break;
						
					case 3:
						this.barTxtObj.innerHTML = [
								'<span style="color:#C13100;font-weight:bold;">',
								this.barNowValue,
								'&nbsp;</span>', 
								this.barSetting.unit, '&nbsp;/&nbsp;',
								this.barSetting.max, '&nbsp;', this.barSetting.unit
						].join("");
						break;
						
					case 4:
						this.barTxtObj.innerHTML = [
								'<span style="color:#C13100;font-weight:bold;">',
								this.barNowValue,
								'&nbsp;</span>', 
								this.barSetting.unit, '&nbsp;/&nbsp;',
								this.barSetting.max, '&nbsp;', this.barSetting.unit,
								'&nbsp;(<span style="color:#2C5700;font-weight:bold;">',
								nPercent,
								'</span>%)&nbsp;'
						].join("");
						break;
						
			}
			
			this.barColorObj.style.width = this.barBtRightObj.style.left = nPercent + "%";
			this.barObj.style.marginRight = ( da( this.barTxtObj ).width() + 20 ) + "px";

//			if( nPercent > 50 ){
//				this.barTxtObj.style.left = "0px";
//				this.barTxtObj.style.right = "auto";
//				this.barTxtObj.style.color = "#fff";
//			}
			
		},
		
		
		
		//设置按钮颜色风格
		/*
			sColor: 用户自定义风格颜色[ 正常，鼠标移上，按下 ]RGB用逗号分隔
		*/
		color: function( sColor ){
			this.barSetting.color = sColor;
			this.barArrColor = sColor.split(",");

			this.barBgObj.style.backgroundColor = this.barArrColor[0] || "";
			this.barColorObj.style.backgroundColor = this.barArrColor[1] || "";
		},
		
		//设置为失去焦点状态
		blur: function(){
			this.barObj.className = this.barSetting.css.daBar;
		},
		
		//设置为获取焦点状态
		focus: function(){
			this.barObj.className = this.barSetting.css.daBarFocus;
		}
		
};

daBar.fnStruct.init.prototype = daBar.prototype;


win.daBar = daBar;



})(window);