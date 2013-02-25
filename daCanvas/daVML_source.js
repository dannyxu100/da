/**daVML
*矢量图形绘制支持类forIE
* @author danny.xu
* @version daVML_1.0 2011-10-31 17:31:23
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
	* @param {PlainObj} vmlSetting 
	*/
	var daVML = function( vmlSetting ){
		return new daVML.fnStruct.init( vmlSetting );
		
	};

	daVML.fnStruct = daVML.prototype = {
		
		daParentObj: null,
		daBoxObj: null,
		
		vmlSetting: {
			parent: null,
			width: 0,
			height: 0
		},
		
		
		/**daVML矢量图形操作类初始化函数
		 * @param {PlainObj} vmlSetting 
		 */
		init: function ( vmlSetting ) {
			vmlSetting = this.vmlSetting = da.extend( {}, this.vmlSetting, vmlSetting );
			
			this.daParentObj = da( vmlSetting.parent );
			if( 0 >= this.daParentObj.length ) { alert("daVML温馨提示：没有找到daVML画布的父节点对象。"); return false; }
			
			vmlSetting.width = vmlSetting.width || this.daParentObj.width();
			vmlSetting.height = vmlSetting.height || this.daParentObj.height();
			
			doc.createStyleSheet().addRule(".daVML", "behavior:url(#default#VML); display: inline-block;");
      
			try{
				if ( !doc.namespaces.daVML )																						//对IE6、IE7需要添加一个全局命名空间和默认样式
					doc.namespaces.add( 'daVML', 'urn:schemas-microsoft-com:vml' );
				
			}catch(e){};
				
			this.create();
			this.reSize();
	
		},
		
		/**创建画布对象
		*/
		create: function(){
			var obj = doc.createElement( "div" );
//			obj.innerHTML = 'daCanvas';
			obj.style.cssText = "position:absolute; left:0px; top:0px; width:10px; height:10px; border:0px solid #f00";
			this.daParentObj.dom[0].insertBefore( obj, null );
			
			this.daBoxObj = da( obj );
			
		},
		
		
		/**创建一个vml元素对象
		* @param {String} nodeName 元素类型名称
		* @param {boolean} is2Level 是否为2级标记
		*/
		createElem: function( nodeName, is2Level  ){
			return daVMLElement({
				daVML: this,
				nodeName: nodeName,
				is2Level: is2Level
			});
			
		},
		
		/**重置画布宽高
		* @param {Object} w 宽度
		* @param {Object} h 高度
		*/
		reSize: function( w, h ){
			var vmlSetting = this.vmlSetting;
			
			w = w || vmlSetting.width;
			h = h || vmlSetting.height;
		
			vmlSetting.width = w;
			vmlSetting.height = h;
		
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
			return this.createElem( nodeName, true ).attr( params );
		
		},

		/**创建一个文本对象
		 * @param {PlainObj} params
		 */
		text: function ( params ) {
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
			
		}
		
	};

	//扩展daVML对象成员函数
	da.each([ "shape","line","polyLine","rect","roundRect","oval", "curve", "arc" ],function( idx, name ){
		var tag = name.toLowerCase();
		
		daVML.fnStruct[ name ] = function( params ){
				var elem = this.createElem( tag );
				
				da( elem.vmlElem ).css({
					top: params.top || 0,
					left: params.left || 0,
					width: params.width || _PixelScale,
					height: params.height || _PixelScale
				});
				
				elem.attr( params );
				
				return elem;
		
		}
		
	
	});


	daVML.fnStruct.init.prototype = daVML.prototype;			//模块通过原型实现继承属性


	
	return daVML;
})();

		
var daVMLElement = (function(){
	
	/**daVMLElement类构造函数
	*/
	var daVMLElement = function( elemSetting ){
		return new daVMLElement.fnStruct.init( elemSetting );
	};

	daVMLElement.fnStruct = daVMLElement.prototype = {
		
		daVML: null,
		vmlElem: null,
		
		elemSetting: {
			daVML: undefined,
			nodeName: "",
			width: _PixelScale,
			height: _PixelScale,
			
			is2Level: false,
			
			attrSpecial: undefined
			
		},
		
		
		/**
		 * daVMLElement封装类初始化函数
		 */
		init: function ( elemSetting ) {
			elemSetting = this.elemSetting = da.extend( {}, this.elemSetting, elemSetting );
			
			this.create();
				
		},
		
		create: function(){
			var elemSetting = this.elemSetting,
					vmlElem = [ elemSetting.nodeName, ' class="daVML" ' ],
					style = "position:absolute; left:0px; top:0px; width:"+ elemSetting.width +"px; height:"+ elemSetting.height +"px;";
			
			this.daVML = elemSetting.daVML;
			
			if( !elemSetting.is2Level ){
				vmlElem.push( ' filled="true" stroked="true" ' );
				vmlElem.push( ' style="' );
				vmlElem.push( style );
//				if ( _DocMode8 ) 
//					vmlElem.push( " visibility: visible; " );
				vmlElem.push( '" ' );
				
			}

			if ( _IsIE8 ) { 																																//针对IE8添加xmlns属性
				vmlElem.unshift( '<' );
				vmlElem.push( ' xmlns="urn:schemas-microsoft-com:vml" />' );
	
			}
			else { 																																					//针对IE6/IE7添加命名空间
				vmlElem.unshift( '<daVML:' );
				vmlElem.push( '/>' );
				
			}
			this.vmlElem = doc.createElement( vmlElem.join("") );
			
		},

		/**
		 * Get or set attributes
		 */
		attr: function ( params, val ) {
			var elemSetting = this.elemSetting,
					level2 = ( elemSetting.is2Level ? elemSetting.nodeName : false ),
					vmlElem = this.vmlElem || {},
					key, value;
			
			if ( "string" === typeof params ) {															//单属性操作
				if( undefined === val ){																			//get模式
					params = daVMLElement.reviseAttr( params, level2 );					//参数名转换

					if ( _DocMode8 ) { 																					// IE8 setAttribute bug
						return vmlElem[ params[0] ];
					} 
					else {
						return da.attr( vmlElem, params[0] );
					}
					
				}
				
				key = params;
				params = {};
				params[key] = val;
			}
			
			params = daVMLElement.reviseAttr( params, level2 );							//参数名转换和设置默认值
			
			for ( key in params ) {																					//set模式
				value = params[key];
				
				result = elemSetting.attrSpecial && elemSetting.attrSpecial[ key ] && elemSetting.attrSpecial[ key ]( key, value );

				if ( false !== result ) {																																			//特殊属性处理函数返回值恒为false，就不再执行默认操作了
					if ( undefined !== result ) 
						value = result; 																																					//特殊属性处理函数只是返回了一个全新的属性值
					
					if ( _DocMode8 ) { 																					// IE8 setAttribute bug
						vmlElem[key] = value;
					} 
					else {
						da.attr( vmlElem, key, value );
					}
					
				}
				
			}

			return this;
			
		},

		insert: function( parent ){
			var daVML = this.daVML,
					vmlElem = this.vmlElem,
					daBoxObj = daVML.daBoxObj,
//					inverted = parent && parent.inverted,
					parentNode = parent ? parent.vmlElem || parent : daBoxObj.dom[0];
	
	
//			// if the parent group is inverted, apply inversion on all children
//			if (inverted) { 																								// only on groups
//				daVML.invertChild(element, parentNode);
//			}
//	
//			// issue #140 workaround - related to #61 and #74
//			if (docMode8 && parentNode.gVis === HIDDEN) {
//				css(element, { visibility: HIDDEN });
//			}
			
			try{
				parentNode.insertBefore( vmlElem );
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

	
	/**vml属性映射表
	*/
	daVMLElement.attrHash = {};
	
	/**vml一级标记属性映射表
	*/
	daVMLElement.attrHash["shape"] = {
		//通用
		size: [ "coordsize", (_PixelScale+","+_PixelScale) ],
		origin: [ "coordorigin", "0,0"],
		wrap: [ "wrapcoords", null ],
		border: [ "stroked", "true" ],
		borderColor: [ "strokecolor", "#333" ],
		borderWidth: [ "strokeweight", "1px" ],
		fill: [ "filled", "true" ],
		fillColor: [ "fillcolor", "none" ],
		
		//专属
		path: [ "path", "m0,0 l e" ],								//shape专属
		type: [ "type", null ],
		from: [ "from", "0,0" ],										//line专属
		to: [ "to", "0,0" ],
		points: [ "points", "0,0" ],								//polyline专属
		arc: [ "arcsize", 0.05 ],										//roundrect专属
		startAngle: [ "startangle", -180 ],  				//arc专属 Vector2D [-360-360]，默认值-180
		endAngle: [ "endangle", null ],
		curve1: [ "control1", null ], 							//curve专属
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
