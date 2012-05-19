/***************** Size *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素尺寸大小管理器
	version: 1.0.0
*/
(function(da){
	//DOM对象 位置尺寸 操作函数扩展
	//因为width、height属性值的获取操作相似，所以通过each函数来批量扩展da库的height() 和 width()函数
	da.each([ "Height", "Width" ], function( i, name ) {
	
		var type = name.toLowerCase();													//"height" 或 "width"
	
		da.fnStruct["inner" + name] = function() {							//给da对象扩展 innerHeight 和 innerWidth属性
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, "padding" ) ) : null;
		};
	
		da.fnStruct["outer" + name] = function( margin ) {			//给da对象扩展 outerHeight and outerWidth属性
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, margin ? "margin" : "border" ) ) : null;
		};
		
		//给da库扩展对应的height() 和 width()函数
		/*
			size:	目标DOM对象 尺寸值容器变量
		*/
		da.fnStruct[ type ] = function( size ) {
			var obj = this.dom[0];
			if ( !obj ) {
				return size == null ? null : this;									//如果没有目标DOM对象，返回this对象
			}
			
			//get模式
			if ( da.isFunction( size ) ) {												//如果size是回调函数的方式批处理获取多个dom的高宽数据，就通过each批处理调用，在回调函数返回处理后再次调用相应height() 和 width()函数
				return this.each(function( i ) {
					var objSelf = da( this );
					objSelf[ type ]( size.call( this, i, objSelf[ type ]() ) );			//回调函数默认回传dom对象、dom数组索引号、当前height或width值三个参数
				});
			}
			
			if ( da.isWin( obj ) ) {										//如果目标对象是窗口
				// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
				return ( obj.document.compatMode === "CSS1Compat" && obj.document.documentElement[ "client" + name ] ) 
				|| obj.document.body[ "client" + name ];
	
			}
			else if ( da.isDoc( obj ) ) {								//如果目标对象是document （nodeType： 1=元素element； 2=属性attr； 3=文本text； 8=注释comments； 9=文档document）
					return Math.max(
						obj.body["scroll" + name],
						obj.body["offset" + name],
						obj.documentElement["client" + name],
						obj.documentElement["scroll" + name],
						obj.documentElement["offset" + name]
					);
	
			}
			
			else if ( size === undefined ) {							//如果没有传入 尺寸值容器变量 就直接返回数据
					var tmpv = da.css( obj, type ), ret = parseFloat( tmpv );
		
					return da.isNaN( ret ) ? tmpv : ret;
	
			}
			
			//set模式
			else{
				return this.css( type, typeof size === "string" ? size : size + "px" );
			}
		};
	
	});
	
})(da);
