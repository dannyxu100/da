/**daVML
*矢量图形绘制支持类forIE
* @author danny.xu
* @version daVML_1.1.2 2011-10-31 17:31:23
*/
(function( win, undefined ){

var doc = win.document,
		_IsIE8 = navigator.userAgent.indexOf('MSIE 8.0') > -1,									//浏览器是否为IE8
		_DocMode8 = doc.documentMode === 8,																			//浏览器是否处于兼容模式
		_Math = Math,
		_MathRound = _Math.round,
		_MathFloor = _Math.floor,
		_MathCeil = _Math.ceil,
		_MathMax = _Math.max,
		_MathMin = _Math.min,
		_MathAbs = _Math.abs,
		_MathCos = _Math.cos,
		_MathSin = _Math.sin,
		_MathPI = _Math.PI,
		_Deg2Rad = _MathPI * 2 / 360,
		_PixelScale = 1;																											//10px（显示屏） === 1点（矢量图形）
		
var daVML = (function(){
	
	/**daVML类构造函数
	* @param {PlainObj} setting 
	*/
	var daVML = function( setting ){
		return new daVML.fnStruct.init( setting );
		
	};

	daVML.fnStruct = daVML.prototype = {
		
		daParentObj: null,
		daBoxObj: null,
		
		setting: {
			parent: null,
			width: 0,
			height: 0,
			border: ""
		},
		
		
		/**daVML矢量图形操作类初始化函数
		 * @param {PlainObj} setting 
		 */
		init: function ( setting ) {
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.daParentObj = da( setting.parent );
			if( 0 >= this.daParentObj.length ) { alert("daVML温馨提示：没有找到daVML画布的父节点对象。"); return false; }

			doc.createStyleSheet().addRule(".daVML", "behavior:url(#default#VML); display: inline-block;");
      
			try{
				if ( !doc.namespaces.daVML )																						//对IE6、IE7需要添加一个全局命名空间和默认样式
					doc.namespaces.add( 'daVML', 'urn:schemas-microsoft-com:vml' );
				
			}catch(e){};
				
			this.create();
			this.resize();
	
		},
		
		/**创建画布对象
		*/
		create: function(){
			var obj = doc.createElement( "div" );
//			obj.innerHTML = 'daCanvas';
			obj.style.cssText = "position:absolute; left:0px; top:0px; width:10px; height:10px; overflow:hidden;"
				+ (this.setting.border ? "border:"+this.setting.border : "");
			
			this.daParentObj.dom[0].insertBefore( obj, null );
			
			this.daBoxObj = da( obj );
			
		},
		
		
		/**创建一个vml元素对象
		* @param {String} nodeName 元素类型名称
		* @param {boolean} is2Level 是否为2级标记
		*/
		createElement: function( nodeName, is2Level  ){
			return daVMLElement({
				parent: this,
				nodeName: nodeName,
				is2Level: is2Level
			});
			
		},
		
		/**清除图形
		*/
		clear: function(){
			this.daBoxObj.empty();
		},
		
		/**重置画布宽高
		* @param {Object} w 宽度
		* @param {Object} h 高度
		*/
		resize: function( w, h ){
			var setting = this.setting;
			
			w = w || setting.width || this.daParentObj.width();
			h = h || setting.height || this.daParentObj.height();
		
			this.daBoxObj.css({
				width: w,
				height: h
			});
		
		},

		/**创建一个子标记对象
		 * @param {String} nodeName
		 * @param {PlainObj} params
		 */
		childElem: function( nodeName, params ){
			return this.createElement( nodeName, true ).attr( params );
		
		},

		/**创建一个文本对象
		 * @param {PlainObj} params
		 */
		text: function ( params ) {
			this.resize();
			var elem,
				defaultParams = {
					text: "",
					left: 0,
					top: 0,
					fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
					fontSize: '12px'
				};
			
			params = da.extend( {}, defaultParams, params );
	
			elem = doc.createElement( "span" );
			elem.style.cssText = " position:absolute; left:0px; top:0px;";
			
			da( elem ).css({
					whiteSpace: 'nowrap',
					left: _MathRound( params.top ),
					top: _MathRound( params.top ),
					fontFamily: params.fontFamily,
					fontSize: params.fontSize
					
			});
			
			elem.innerHTML = params.text;
			
			return elem;
			
		},
		
		/**设置比例尺，默认1:1
		*/
		setScale: function( vml, params){
			if( !vml.element ) return;
		
			da( vml.element ).css({
				top: params.y || params.top || 0,
				left: params.x || params.left  || 0,
				width: params.width || _PixelScale,
				height: params.height || _PixelScale
			});
		},
		
		/**
		 * 路径
		 * @param {Array} 通过点数组，绘制路径
		 * example:
		 * canvasObj.draw.shape({path:"M153 334 C153 334 151 334 151 334 C151 339 153 344 156 344 C211 300 186 274 156 274"});
		 */
		shape: function (params) {
			this.resize();
			var vml = this.createElement( 'shape' ),
				def = {
					path: "m0,0 l e", 
					size: "1,1",
					borderColor: "#222",
					borderWidth: 1,
					fill: true,
					fillColor: "#f00"
				};
				
			params = da.extend( {}, def, params );
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		},
		
		/**
		 * 线段
		 * @param {Array} params 两点坐标值
		 * example:
			canvasObj.draw.line({ from:"0,0", to:"100,100" });
		 */
		line: function (params) {
			this.resize();
			var vml = this.createElement( 'line' ),
				def = {
				from: "0,0",
				to: "0,0",
				borderColor: "#222",
				borderWidth: 1
			};
			
			params = da.extend( {}, def, params );
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		},
		
		/**
		 * 矩形
		 * @param {Array} params 矩形属性参数
		 * example:
			canvasObj.draw.rect({
				x: 300,
				y: 200,
				rx: 10,
				borderWidth: "5px",
				width:100,
				height:100
			}).insert();
		 */
		rect: function (params) {
			this.resize();
			var	vml = this.createElement( ( undefined != params.rx || undefined != params.ry) ? "roundRect" : "rect" ),
				def = {
					width: 0,
					height: 0,
					rx: 0,
					ry: 0,
					borderColor: "#222",
					borderWidth: 1,
					fill: params.fillColor ? true : false
				};
				
			params = da.extend( {}, def, params ); 
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		},
		
		/**
		 * 折线
		 * @param {Array} params 折线属性参数
		 * example:
			canvasObj.draw.polyline({
				points: "600,100 650,0 700,100 750,0 800,100"
			}).insert();
		 */
		polyline: function (params) {
			this.resize();
			var	vml = this.createElement( "polyline" ),
				def = {
					points : "0,0",
					borderColor: "#222",
					borderWidth: 1,
					fill: params.fillColor ? true : false
				};
			params = da.extend( {}, def, params ); 
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		},
		
		/**
		 * 多边形
		 * @param {Array} params 多边形属性参数
		 * example:
			canvasObj.draw.polygon({
				points: "43,234 100,100 232,124 324,545",
				fillColor: "#324576"
			}).insert();
		 */
		polygon: function (params) {
			this.resize();
			// var idx = params.points.indexOf(" "),
				// firstDot = params.points.substring(0, idx);
			// params.points += " "+firstDot;
			
			// params = da.extend( {}, {fillColor:"none"}, params ); 
			// return this.polyline(params);
			//以上代码由于无法封口，所以放弃
			
			var def = {
					points : "0,0",
					fillColor: "#f00"
				};
			
			params = da.extend( {}, def, params ); 
			
			return this.shape(params);
		},
		
		
		/**
		 * 圆形
		 * @param {Array} params 圆形属性参数
		 * example:
			canvasObj.draw.circle({
				cx: 600,
				cy: 200,
				r: 140,
				borderWidth: 10,
				fillColor: "#378236"
			}).insert();
		 */
		circle: function (params) {
			this.resize();
			var	vml = this.createElement( "oval" ),
				def = {
					left: parseInt(params.cx)-parseInt(params.r),
					top: parseInt(params.cy)-parseInt(params.r),
					width: parseInt(params.r)*2,
					height: parseInt(params.r)*2,
					borderColor: "#222",
					borderWidth: 1,
					fill: params.fillColor ? true : false
				};
			params = da.extend( {}, def, params ); 
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		},
		
		/**
		 * 椭圆
		 * @param {Array} params 椭圆属性参数
		 * example:
			canvasObj.draw.ellipse({
				cx: 1000,
				cy: 150,
				rx: 300,
				ry: 120,
				borderWidth: 10,
				fillColor: "#f00"
			}).insert();
		 */
		ellipse: function (params) {
			this.resize();
			var	vml = this.createElement( "oval" ),
				def = {
					left: parseInt(params.cx)-parseInt(params.rx),
					top: parseInt(params.cy)-parseInt(params.ry),
					width: parseInt(params.rx)*2,
					height: parseInt(params.ry)*2,
					borderColor: "#222",
					borderWidth: 1,
					fill: params.fillColor ? true : false
				};
			
			params = da.extend( {}, def, params ); 
			this.setScale(vml,params);							//设置比例尺
			
			return vml.attr(params);
		}
		
	};

	daVML.fnStruct.init.prototype = daVML.prototype;			//模块通过原型实现继承属性

	return daVML;
})();

		
var daVMLElement = (function(){
	
	/**daVMLElement类构造函数
	*/
	var daVMLElement = function( setting ){
		return new daVMLElement.fnStruct.init( setting );
	};

	daVMLElement.fnStruct = daVMLElement.prototype = {
		
		map: null,
		element: null,
		
		setting: {
			parent: undefined,
			nodeName: "",
			width: _PixelScale,
			height: _PixelScale,
			
			is2Level: false,
			
			attrSpecial: undefined
		},
		
		
		/**
		 * daVMLElement封装类初始化函数
		 */
		init: function ( setting ) {
			setting = this.setting = da.extend( {}, this.setting, setting );
			setting.attrSpecial = setting.attrSpecial || daVMLElement.attrSpecial;
			
			this.create();
				
		},
		
		create: function(){
			var setting = this.setting,
				element = [ setting.nodeName, ' class="daVML" ' ],
				style = "position:absolute; left:0px; top:0px; width:"+ setting.width +"px; height:"+ setting.height +"px;";
			
			this.map = setting.parent;
			
			if( !setting.is2Level ){
				element.push( ' filled="true" stroked="true" ' );
				element.push( ' style="' );
				element.push( style );
//				if ( _DocMode8 ) 
//					element.push( " visibility: visible; " );
				element.push( '" ' );
				
			}

			if ( _IsIE8 ) { 																																//针对IE8添加xmlns属性
				element.unshift( '<' );
				element.push( ' xmlns="urn:schemas-microsoft-com:vml" />' );
	
			}
			else { 																																					//针对IE6/IE7添加命名空间
				element.unshift( '<daVML:' );
				element.push( '/>' );
				
			}
			this.element = doc.createElement( element.join("") );
			
		},

		/**
		 * Get or set attributes
		 */
		attr: function ( params, val ) {
			var setting = this.setting,
				level2 = ( setting.is2Level ? setting.nodeName : false ),
				element = this.element || {},
				key, value;
			
			if ( "string" === typeof params ) {															//单属性操作
				if( undefined === val ){																			//get模式
					params = daVMLElement.reviseAttr( params, level2 );					//参数名转换

					if ( _DocMode8 ) { 																					// IE8 setAttribute bug
						return element[ params[0] ];
					}
					else {
						return da.attr( element, params[0] );
					}
					
				}
				
				key = params;
				params = {};
				params[key] = val;
			}

			params = daVMLElement.reviseAttr( params, level2 );							//参数名转换和设置默认值
			
			for ( key in params ) {																					//set模式
				value = params[key];
				
				var result = setting.attrSpecial && setting.attrSpecial[ key ] && setting.attrSpecial[ key ].call( this, value );

				if ( false !== result ) {																																			//特殊属性处理函数返回值恒为false，就不再执行默认操作了
					if ( undefined !== result ) 
						value = result; 																																					//特殊属性处理函数只是返回了一个全新的属性值
					
					if ( _DocMode8 ) { 																					// IE8 setAttribute bug
						try{
							if( "undefined" != typeof element[key] && "undefined" != typeof element[key].value )
								element[key].value = value;
							else
								element[key] = value;
						}
						catch(e){
							debugger;
						}
					} 
					else {
						da.attr( element, key, value );
					}
					
				}
				
			}

			return this;
			
		},

		insert: function( parent ){
			var map = this.map,
				element = this.element,
				daBoxObj = map.daBoxObj,
//					inverted = parent && parent.inverted,
				parentNode = parent ? parent.element || parent : daBoxObj.dom[0];
	
	
//			// if the parent group is inverted, apply inversion on all children
//			if (inverted) { 																								// only on groups
//				map.invertChild(element, parentNode);
//			}
//	
//			// issue #140 workaround - related to #61 and #74
//			if (docMode8 && parentNode.gVis === HIDDEN) {
//				css(element, { visibility: HIDDEN });
//			}
			
			try{
				parentNode.insertBefore( element );
			}catch(e){}
			
			// align text after adding to be able to read offset
//			this.added = true;
//			if (this.alignOnAdd && !this.deferUpdateTransform) {
//				this.updateTransform();
//			}
	
			// fire an event for internal hooks
//			fireEvent(wrapper, 'add');
	
			return this;
			
		}

		
	};

	daVMLElement.fnStruct.init.prototype = daVMLElement.prototype;			//模块通过原型实现继承属性

	
	/**特殊属性处理函数
	*/
	daVMLElement.attrSpecial = {};
	
	/**fillOpacity属性处理
	* @param {String|Int} value 属性值
	* @return 是否继续执行，默认属性赋值操作
	*/
	daVMLElement.attrSpecial["fillOpacity"] = function( value ){
		if(this.setting.is2Level) return;
		
		this.map.childElem( "fill", { 								//创建填充子标记
			opacity: value
		}).insert( this.element );
		
		return false;
	};
	
	/**fillOpacity属性处理
	* @param {String|Int} value 属性值
	* @return 是否继续执行，默认属性赋值操作
	*/
	daVMLElement.attrSpecial["borderOpacity"] = function( value ){
		if(this.setting.is2Level) return;
		
		this.map.childElem( "stroke", { 							//创建边框子标记
			opacity: value
		}).insert( this.element );
		
		return false;
	};
	
	/**Opacity属性处理
	* @param {String|Int} value 属性值
	* @return 是否继续执行，默认属性赋值操作
	*/
	daVMLElement.attrSpecial["opacity"] = function( value ){
		if(this.setting.is2Level) return;
		
		this.setting.attrSpecial[ "fillOpacity" ].call( this, value );
		this.setting.attrSpecial[ "borderOpacity" ].call( this, value );
		
		return false;
	};
	
	/**points属性处理
	* @param {String|Int} value 属性值
	* @return 是否继续执行，默认属性赋值操作
	*/
	daVMLElement.attrSpecial["points"] = function( value ){
		if( "shape" === this.setting.nodeName){
			var arr = value.split(" "),
				arrPath = [];
			
			for( var i=0,len=arr.length; i<len; i++ ){
				if(0===i){
					arrPath.push('m'); 
				}
				else if(1===i){
					arrPath.push(' l'); 
				}
				arrPath.push(arr[i]+' '); 
			}
			arrPath.push(arr[0]+' '); 
			arrPath.push(' xe'); 
			
			this.attr( "path", arrPath.join('') );
			
			return false;
		}
		
		return value;
	};
	
	
	/**vml属性映射表
	*/
	daVMLElement.attrHash = {};
	
	/**vml一级标记属性映射表
	*/
	daVMLElement.attrHash["shape"] = {
		size: [ "coordsize", (_PixelScale+","+_PixelScale) ],
		origin: [ "coordorigin", "0,0"],
		wrap: [ "wrapcoords", null ],
		
		//通用
		border: [ "stroked", "true" ],
		opacity: [ "opacity", 1 ],
		borderColor: [ "strokecolor", "#333" ],
		borderWidth: [ "strokeweight", "1px" ],
		fill: [ "filled", "true" ],
		fillColor: [ "fillcolor", "none" ],
		
		//兼容追加
		borderOpacity: [ "borderOpacity", 1 ],
		fillOpacity: [ "fillOpacity", 1 ],
		
		//专属
		path: [ "path", "m0,0 l e" ],								//shape专属
		type: [ "type", null ],
		from: [ "from", "0,0" ],									//line专属
		to: [ "to", "0,0" ],
		x: [ "left", 0 ],											//rect专属
		y: [ "top", 0 ],
		arc: [ "arcsize", 0.05 ],									//roundrect专属
		points: [ "points", "0,0" ],								//polyline专属
		startAngle: [ "startangle", -180 ],  						//arc专属 Vector2D [-360-360]，默认值-180
		endAngle: [ "endangle", null ],
		curve1: [ "control1", null ], 								//curve专属
		curve2: [ "control2", null ]
	};
	
	/**vml二级标记属性映射表
	*/
	daVMLElement.attrHash["stroke"] = {
		on: [ "on", "true" ], 												//设置2级标记是否起效 
		opacity: [ "opacity", 1 ],											//描述边框透明度 0~1
		color: [ "color", "black" ],										//边框颜色
		type: [ "filltype", "solid" ],  									//填充边框模式 [ solid,tile,pattern,frame ]
		width: [ "weight", "1px" ], 										//边框粗度  
		style: [ "dashstyle", "solid" ],									//边框的线条样式[ solid,dot,dash,dashdot,longdash,longdashdot,longdashdotdot,shortdot,shortdash,shortdashdot,shortdashdotdot ] 
		src: [ "src", null ],												//填充边框的图像地址（ 当filltype != solid 时有效 ）
		imageSize: [ "imagesize", "auto" ],									//填充图像放大倍数 （ 当filltype != solid 时有效 ）[ auto Vector2D ]
		imageAlign: [ "imagealignshape", "true" ],    						//填充图像是否居中对齐（ 当filltype != solid 时有效 ）
		imageColor: [ "color2", null ],										//填充图像的融合背景色（ 当filltype != pattern 时有效 ）
		arrow1: [ "startarrow", "none" ],											//线起点的箭头样式 [ none,block,classic,diamond,oval,open,chevron,doublechevron ]
		arrow2: [ "endarrow", "none" ],												//终点的箭头样式
		arrow1Width: [ "startarrowwidth", "medium" ],								//起点箭头的宽度（当startarrow != none 时有效 ）[ narrow,medium,wide ]
		arrow1Length: [ "startarrowlength", "medium" ],								//起点箭头的长度 [ short,medium,long ]
		arrow2Width: [ "endarrowwidth", "medium" ],									//终点箭头的宽度（当startarrow != none 时有效 ）[ narrow,medium,wide ]
		arrow2Length: [ "endarrowlength", "medium" ],								//终点箭头的长度 [ short,medium,long ]
		joint: [ "miterlimit", 8 ],															//边框关节位置的厚度
		joinstyle: [ "joinstyle", "round" ],												//边框参加的样式 [ round(rounded join),bevel(beveled join),miter(miter join) ]
		endcap: [ "joinstyle", "round" ]   													//边框结束部分 [ flat,square,round ]
	
	};
	
	daVMLElement.attrHash["fill"] = {
		on: [ "on", "true" ], 										//设置2级标记是否起效 
		opacity: [ "opacity", 1 ],									//透明度 0~1
		type: [ "type", "solid" ],  								//描述填充模式 [ solid,gradient,gradientradial,tile,pattern,frame ]
		color: [ "color", "black" ],								//填充颜色
		
		//只有当type=gradient,gradientradial渐变填充时有效
		color2: [ "color2", "white" ],							//二级过度颜色
		colors: [ "colors", null ],									//沿着一个渐行度填充颜色，并以百分比分配空间 [ number% color* ] 如1:colors="30% red,50% blue"。例如2:colors="30% red,50% blue,90% purple" 
		angle: [ "angle", 0 ],											//渐层效果以圆周顺时旋转、倾斜 [ -360~360 ]
		offset: [ "focus", "0%" ],									//渐层的位置 [ -100%~100% ]
		focussize: [ "focussize", "0,0" ],          //渐层在所有者的位置分布 [ Vector2D ]
		focusposition: [ "focusposition", "0,0" ],	//渐层在所有者的倾斜度分布 [ Vector2D ]
		method: [ "method", "sigma" ],							//均匀分布的对比 [ none,linear,sigma,any ]
		
		//以下属性只有当type=tile,pattern,frame背景图像填充时有效
		src: [ "src", null ],												//填充使用的图像地址
		imageSize: [ "size", "auto" ],							//图像放大倍数 [ Vector2D ]
		imageOffset: [ "position", "auto" ],				//图像放置的起源位置 [ Vector2D ]
		origin: [ "origin", "auto" ],								//图像的分布位置 [ Vector2D ]
		aspect: [ "aspect", "ignore" ],							//图像居中还是充满整个图型  [ ignore,atleast,atmost ]
		alignshape: [ "alignshape", "true" ]					//是否对比容器对齐图片
		
	};
	
	daVMLElement.attrHash["shadow"] = {
		on: [ "on", "true" ], 												//设置2级标记是否起效 
		opacity: [ "opacity", 1 ],									//透明度 0~1
		type: [ "type", "single" ], 								//使用哪种阴影效果 [ single,double,emboss,perspective ]
		color: [ "color", "black" ],								//边框颜色
		color2: [ "color2", "gray" ],								//二次投影颜色（ 当 type!=single 时有效 ）
		offset: [ "offset", "2px,2px" ],						//阴影的XY偏移度 [ Vector2D ]
		offset2: [ "offset2", "2px,2px" ],					//二次投影XY偏移度 [ Vector2D ]
		
		obscured: [ "obscured", "false" ],						//暗示看穿图像如果没有在形状上填充 
		origin: [ "origin", "0,0" ],								//阴影与投影的交接度 （ 当filltype!=solid  时有效 ）[ Vector2D ]
		matrix: [ "matrix", null ]									//变换点阵的强度 （ 当filltype!=solid  时有效 ）
		
	};
	
	/**映射vml通用属性
	 * @param {Array} userParams 待映射遍历的自定义属性键值对，如果为string，即是查找某一个属性映射
	 */
	daVMLElement.reviseAttr = function ( userParams, level2 ) {
		var hash = ( level2 ? daVMLElement.attrHash[level2] : daVMLElement.attrHash["shape"] ),
				p = userParams,
				res = {},
				key, obj;
				
		if( "string" === typeof p ){
			return hash [ p ];
		}
		else{
			for( key in p ){
				obj =  hash [ key ];
				
				if( obj )
					res[ obj[0] ] = da.firstValue( p[key], obj[1] );
				
			}
		}
		
		return res;
		
	};
	
	return daVMLElement;
})();


win.daVMLElement = daVMLElement;
win.daVML = daVML;

})( window );
