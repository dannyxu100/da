/**daSVG
*矢量图形绘制支持类for W3C
* @author danny.xu
* @version daSVG_1.0 2011-10-31 17:31:23
*/
(function( win, undefined ){

var doc = win.document,
		_SVG_NS = "http://www.w3.org/2000/svg",
		_HasSVG = !!doc.createElementNS && !!doc.createElementNS(_SVG_NS, 'svg').createSVGRect;

var daSVG = (function(){
	
	/**daSVG类构造函数
	*/
	var daSVG = function( setting ){
		return new daSVG.fnStruct.init( setting );
	};

	daSVG.fnStruct = daSVG.prototype = {
		daParentObj: null,
		daBoxObj: null,
		
		defs: null,
		
		setting: {
			parent: null,
			width: 0,
			height: 0,
			border: ""
		},
		
		/**daSVG矢量图形操作类初始化函数
		 * @param {PlainObj} setting 
		 */
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.daParentObj = da( setting.parent );
			if( 0 >= this.daParentObj.length ) { alert("daSVG温馨提示：没有找到daSVG画布的父节点对象。"); return false; }
			
			this.create();
			this.resize();
			
		},
		
		/**创建画布对象
		*/
		create: function(){
			var setting = this.setting,
				map;
				// loc = location;
	
			map = this.createElement('svg').attr({
							xmlns: _SVG_NS,
							version: '1.1'
						});
			
			map.element.style.cssText = "position:absolute; left:0px; top:0px; width:"+ setting.width +"px; height:"+ setting.height +"px;"
				+ (this.setting.border ? "border:"+this.setting.border : "");

			this.daParentObj.dom[0].insertBefore( map.element, null );
			this.daBoxObj = da( map.element );
			
			this.defs = this.createElement('defs').insert();
//			this.alignedObjects = [];
//			this.url = isIE ? '' : loc.href.replace(/#.*?$/, ''); // page url used for internal references
//			this.defs = this.createElement('defs').add();
//			this.forExport = forExport;

		},
		
		
		/**创建一个svg元素对象
		* @param {String} nodeName 元素类型名称
		*/
		createElement: function( nodeName ){
			return daSVGElement({
				parent: this,
				nodeName: nodeName
			});
			
		},

		/**清除图形
		*/
		clear: function(){
			this.daBoxObj.empty();
			this.defs = this.createElement('defs').insert();
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
		
		/**创建一个文本对象
		 * @param {PlainObj} params
		 */
		text: function ( params ) {
			this.resize();
			var elem;
			return elem;
		},
		
		/**
		 * 路径
		 * @param {Array} 通过点数组，绘制路径
		 * example:
		 * canvasObj.draw.shape("M153 334 C153 334 151 334 151 334 C151 339 153 344 156 344 C211 300 186 274 156 274");
		 */
		shape: function (params) {
			this.resize();
			return this.createElement('path').attr({
				path: params.path, 
				borderColor: "#222",
				borderWidth: 1,
				fillColor: "#f00"
			});
		},
		
		/**
		 * 线段
		 * @param {Array} params 两点坐标值
		 * example:
			canvasObj.draw.line({ from:"0,0", to:"100,100" });
		 */
		line: function (params) {
			this.resize();
			var def = {
				from: "0,0",
				to: "0,0",
				borderColor: "#222",
				borderWidth: 1
			};
			
			params = da.extend( {}, def, params );
			
			return this.createElement('line').attr(params);
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
			var def = {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				rx: 0,
				ry: 0,
				opacity: 1,
				borderColor: "#222",
				borderWidth: 1,
				borderOpacity: 1,
				fillColor: 'none',
				fillOpacity: 1
			};
			params = da.extend( {}, def, params ); 
			
			return this.createElement('rect').attr(params);
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
			var def = {
				points : "",
				opacity: 1,
				borderColor: "#222",
				borderWidth: 1,
				borderOpacity: 1,
				fillColor: 'none'
			};
			params = da.extend( {}, def, params ); 
			
			return this.createElement('polyline').attr(params);
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
			var def = {
				points: "",
				opacity: 1,
				borderColor: "#222",
				borderWidth: 1,
				borderOpacity: 1,
				fillColor: '#f00',
				fillOpacity: 1
			};
			params = da.extend( {}, def, params ); 
			
			return this.createElement('polygon').attr(params);
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
			var def = {
				cx: 0,
				cy: 0,
				r: 0,
				opacity: 1,
				borderColor: "#222",
				borderWidth: 1,
				borderOpacity: 1,
				fillColor: 'none',
				fillOpacity: 1
			};
			params = da.extend( {}, def, params ); 
			
			return this.createElement('circle').attr(params);
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
			var def = {
				cx: 0,
				cy: 0,
				rx: 0,
				ry: 0,
				opacity: 1,
				borderColor: "#222",
				borderWidth: 1,
				borderOpacity: 1,
				fillColor: 'none',
				fillOpacity: 1
			};
			
			params = da.extend( {}, def, params ); 
			
			return this.createElement('ellipse').attr(params);
		}
		
	};

	daSVG.fnStruct.init.prototype = daSVG.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daSVG;
})();



var daSVGElement = (function(){
	
	/**daSVGElement类构造函数
	*/
	var daSVGElement = function( setting ){
		return new daSVGElement.fnStruct.init( setting );
	};

	daSVGElement.fnStruct = daSVGElement.prototype = {
		map: null,
		element: null,
		
		setting: {
			parent: undefined,
			nodeName: "",
			attrSpecial: undefined
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			setting.attrSpecial = setting.attrSpecial || daSVGElement.attrSpecial;
			
			this.create();
		},
		
		create: function(){
			this.element = doc.createElementNS(_SVG_NS, this.setting.nodeName);
			this.map = this.setting.parent;
			
		},

		/**
		 * Get or set attributes
		 */
		attr: function ( params, val ) {
			var setting = this.setting,
					element = this.element,
					key, value;
					
			if ( "string" === typeof params ) {												//单属性操作
				if( undefined === val ){													//get模式
					params = daSVGElement.reviseAttr( params );								//参数名转换
					
					return da.attr( element, params[0] );
				}
				key = params;
				params = {};
				params[key] = val;
			}
			
			params = daSVGElement.reviseAttr( params );										//参数名转换
			
			for ( key in params ) {															//set模式
				value = params[key];
				
				var result = setting.attrSpecial && setting.attrSpecial[ key ] && setting.attrSpecial[ key ].call( this, value );

				if ( false !== result ) {																																			//特殊属性处理函数返回值恒为false，就不再执行默认操作了
					if ( undefined !== result ) 
						value = result; 																																					//特殊属性处理函数只是返回了一个全新的属性值
					
						da.attr( element, key, value );
					
				}
				
			}
			
			return this;
		},

		insert: function( parent ){
			var map = this.map,
					element = this.element,
					daBoxObj = map.daBoxObj,
					parentNode = parent ? parent.element || parent : daBoxObj.dom[0];
	
	
			try{
				parentNode.insertBefore( element );
			}catch(e){}
			
			
			return this;
			
		}
		
	};

	daSVGElement.fnStruct.init.prototype = daSVGElement.prototype;			//模块通过原型实现继承属性

	
	/**特殊属性处理函数
	*/
	daSVGElement.attrSpecial = {};
	
	/**from, to属性处理
	* @param {String|Int} value 属性值
	* @return 是否继续执行，默认属性赋值操作
	*/
	da.each(["from","to"],function( idx, name ){
		daSVGElement.attrSpecial[name] = function( value ){
			var d1 = value.split(",");
			
			if( "from" === name)
				this.attr({
					x1: d1[0],
					y1: d1[1]
				});
			else
				this.attr({
					x2: d1[0],
					y2: d1[1]
				});
			
			return false;
		};
	});
	

	/**vml属性映射表
	*/
	daSVGElement.attrHash = {};
	
	/**vml一级标记属性映射表
	*/
	daSVGElement.attrHash["shape"] = {
		xmlns: [ "xmlns", _SVG_NS ],
		version: [ "version", "1.1" ],
		//通用
		borderColor: [ "stroke", "#222" ],
		borderWidth: [ "stroke-width", "1" ],
		borderOpacity: [ "stroke-opacity", 1 ],
		fillColor: [ "fill", "none" ],
		fillOpacity: [ "fill-opacity", 1 ],
		opacity: [ "opacity", 1 ],
		
		//专属
		path: [ "d", "m0,0 l e" ],								//path专属
		x: [ "x", 0 ],											//rect专属
		y: [ "y", 0 ],
		width: [ "width", 0 ],
		height: [ "height", 0 ],
		from: [ "from", "0,0" ],								//line专属(统一接口)
		to: [ "to", "0,0" ],
		x1: [ "x1", 0 ],										//line专属
		y1: [ "y1", 0 ],
		x2: [ "x2", 0 ],
		y2: [ "y2", 0 ],
		cx: [ "cx", 0 ],										//circle专属
		cy: [ "cy", 0 ],
		r: [ "r", 0 ],
		rx: [ "rx", 0 ],										//rect、 ellipse专属
		ry: [ "ry", 0 ],
		points: [ "points", "0,0" ]							//polyline专属
	};
	
	
	/**映射vml通用属性
	 * @param {Array} userParams 待映射遍历的自定义属性键值对，如果为string，即是查找某一个属性映射
	 */
	daSVGElement.reviseAttr = function ( userParams, level2 ) {
		var hash = daSVGElement.attrHash["shape"],
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
	
	return daSVGElement;
})();



win.daSVGElement = daSVGElement;
win.daSVG = daSVG;
	
})( window );