/***************** CSS *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素样式管理器
	version: 1.0.0
*/
(function(da){

	//CSS公用源码正则表达式
	var	daRe_exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		daRe_alpha = /alpha\([^)]*\)/,
		daRe_opacity = /opacity=([^)]*)/,
		daRe_float = /float/i,
		daRe_upper = /([A-Z])/g,
		daRe_numpx = /^-?\d+(?:px)?$/i,
		daRe_num = /^-?\d/;
	
	//DOM对象 样式属性 操作函数扩展
	da.fnStruct.extend({
		//节点样式属性 操作函数
		/*
			name: style样式属性名
			value: style样式属性值
		*/
		css: function(name, value ) {
			return da.access( this, function( elem, name, value ) {
				return value !== undefined ?
					da.style( elem, name, value ) :			//set操作
					da.css( elem, name );					//get操作
					
			}, name, value, arguments.length > 1 );
			
		}
	});
	
	da.extend({
		/**非px为单位的属性对照表
		*/
		cssNumber: {
			"zIndex": true,
			"fontWeight": true,
			"opacity": true,
			"zoom": true,
			"lineHeight": true,
			"widows": true,
			"orphans": true
		},
		
		//节点最高优先级样式属性 操作函数
		/*
			obj: DOM节点对象
			name: style样式属性名
		*/
		curCSS: function( obj, name ) {
			var ret, style = obj.style, filter;
			
			//IE不支持opacity属性，需要用filter滤镜处理
			if ( !da.support.opacity && "opacity"===name && obj.currentStyle ) {									//currentStyle代表了在全局样式表、内嵌样式、HTML标签属性中指定的对象格式或样式(如width、height)。
				ret = daRe_opacity.test(obj.currentStyle.filter || "") ? ((parseFloat(RegExp.$1)/100) +"") : "";		//如果找到opacity属性，返回第一个匹配的属性值
				
				return (""===ret) ? "1" : ret;		//如果没有定义opacity属性默认返回1 (100%显示)
			}
	
			//属性名 格式标准化处理
			if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//因为float是js的关键字,所以js规定方位float要用cssFloat，而为了兼容IE要用styleFloat访问
			
			//如果节点style属性有相应的内嵌值，直接取内嵌值
			//style中的属性优先级高于class,所以可以先从style中找，然后再从已经计算好的css属性中找。
			//如果内嵌style属性使用了!import处理兼容问题，就不能直接取style属性值了
			if ( style && style[ name ] ) {
				ret = style[ name ];
	
			}
			//FireFox 等标准的浏览器通过getComputedStyle获取当前计算好的样式属性值
			else if ( da.support.getComputedStyle ) {
				if ( daRe_float.test( name ) ) {															//在使用getPropertyValue获取float属性值时，需要将前面格式化好的cssFloat或styleFloat属性名，改回为float
					name = "float";
				}
				
				name = name.replace( daRe_upper, "-$1" ).toLowerCase();				//如:font-Weight把中间部分大写的驼峰格式 "-W"替换成 "-w"小写
	
				var defaultView = obj.ownerDocument.defaultView;
	
				if ( !defaultView ) {
					return null;
				}
	
				var computedStyle = defaultView.getComputedStyle( obj, null );
	
				if ( computedStyle ) {
					ret = computedStyle.getPropertyValue( name );
				}
	
				if ( "opacity"===name && ""===ret ) {										//如果没有定义opacity属性默认返回1 (100%显示)
					ret = "1";			
				}
		
			}
			//IE 通过currentStyle获取当前计算好的样式属性值
			else if ( obj.currentStyle ) {
				var camelCase = da.camelCase(name);						//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
	
				ret = obj.currentStyle[ name ] || obj.currentStyle[ camelCase ];
	
				//将非像素单位的属性值 转化为以像素为单位的值
				if ( !(daRe_numpx.test( ret )) && (daRe_num.test( ret )) ) {			//有值并且不是px单位的属性值
						var left = style.left, rsLeft = obj.runtimeStyle.left;				//缓存一下当前的属性值
						
						obj.runtimeStyle.left = obj.currentStyle.left;								//把优先级最高的样式 赋值给runtimeStyle（当前呈现的样式属性）
						style.left = ("fontSize"===camelCase) ? "1em" : (ret || 0);		//在压入新属性值后，获取全新计算出来 以像素为单位的样式值
						ret = style.pixelLeft + "px";
		
						style.left = left;																						//还原被临时改变的属性值
						obj.runtimeStyle.left = rsLeft;
				}
			}
	
			return ret;
		},
		
		//通过部分样式值后, 回调callback函数, 然后还原样式
		/*
			obj: DOM节点对象
			options: 样式值键值对对象
			callback:	回调函数
		*/
		swap: function( obj, options, callback ) {
			var old = {};
	
			for ( var name in options ) {						//缓存一下当前的属性值
				old[ name ] = obj.style[ name ];
				obj.style[ name ] = options[ name ];
			}
			
			callback.call( obj );
			
			for ( var name in options ) {						//还原被临时改变的属性值
				obj.style[ name ] = old[ name ];
			}
		},
		
		//节点样式属性 操作函数
		/*
			obj: DOM节点对象
			name: style样式属性名
			extra: 包含,如:margin, padding, border
		*/
		css: function( obj, name, extra ) {
			//对节点元素的高宽进行浏览器兼容器算法的统一
			//IE中节点元素的实际高宽是包含content, padding, border的总和,而firefox等只是content的尺寸;
			//这里默认以content的尺寸为节点元素的实际高宽
			if ( name === "width" || name === "height" ) {
				var val,
				props = { position: "absolute", visibility: "hidden", display:"block" }, 
				which = ("width"===name ? [ "Left", "Right" ] : [ "Top", "Bottom" ]);
				
				//求节点元素的实际高度和宽度（除padding和border）
				function getWH() {
					val = name === "width" ? obj.offsetWidth : obj.offsetHeight;
	
					if ( extra === "border" ) {
						return;
					}
					
					for(var s=0,len=which.length; s<len; s++){
						if ( !extra ) {
							val -= parseFloat(da.curCSS( obj, "padding"+ s, true)) || 0;
						}
	
						if ( extra === "margin" ) {
							val += parseFloat(da.curCSS( obj, "margin"+ s, true)) || 0;
						}
						else {
							val -= parseFloat(da.curCSS( obj, "border"+ s + "Width", true)) || 0;
						}
					}
				}
				
				//如果节点元素当前为可见，就直接通过getWH 函数来计算实际高度和宽度
				if ( obj.offsetWidth !== 0 ) {
					getWH();
				}
				//如果节点元素当前 不可见，先让节点元素定义为绝对定位( position: "absolute" )、可见( visibility: "hidden"，display:"block" )然后再取实际高度和宽度( 因为不可见的节点元素浏览器是不计算起高宽的 )
				else {
					da.swap( obj, props, getWH );
				}
	
				return Math.max(0, Math.round(val));
			}
	
			return da.curCSS( obj, name );
		},
	
		//节点style样式属性操作函数
		/*
			obj: DOM节点对象
			name: style样式属性名
			value: style样式属性值
		*/
		style: function( obj, name, value ) {
			if ( !obj || !obj.style || obj.nodeType === 3 || obj.nodeType === 8 ) {			//不能设置风格属性的简单文本 或一些特殊类型的节点元素（nodeType： 1=元素element； 2=属性attr； 3=文本text； 8=注释comments； 9=文档document）
				return undefined;
			}
	
			if ( ( "width"===name || "height"===name ) && parseFloat(value) < 0 ) {		//width 和height属性不能为负数
				value = undefined;
			}
	
			var style = obj.style || obj, set = value !== undefined;				//如果是赋值操作，获得数值
	
			//IE不支持opacity属性，需要用filter滤镜处理
			if ( !da.support.opacity && "opacity"===name ) {
				if ( set ) {
					style.zoom = 1;			//IE的bug,给非layout模式的元素使用opacity属性会失效,加上zoom值可以解决
	
					var opacity = "NaN"===(parseInt( value, 10 )+ "") ? "" : ("alpha(opacity="+ value*100+ ")");	//通过alpha函数设置有效的opacity属性
					var filter = style.filter || da.curCSS( obj, "filter" ) || "";																//查找节点的style集合 和样式表中的滤镜属性
					
					style.filter = daRe_alpha.test(filter) ? filter.replace(daRe_alpha, opacity) : opacity;			//校正节点滤镜属性
				}
	
				return (style.filter && 0<=style.filter.indexOf("opacity=")) ? ((parseFloat( daRe_opacity.exec(style.filter)[1] ) / 100) +"") : "";			//返回不透明度属性值
			}
			
			//属性名 格式标准化处理
			if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//因为float是js的关键字,所以js规定方位float要用cssFloat，而为了兼容IE要用styleFloat访问
			name = da.camelCase(name);																		//如:font-weight把中间部分 "-w"替换成 "-W"大写的驼峰格式
	
			if ( set )	style[ name ] = value;			//如果是赋值操作，就给相应样式属性赋值

			return style[ name ];
		}
			
	});
	
})(da);