/***************** Offset *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 元素位置管理器
	version: 1.0.0
*/
(function(da){
	da.offset = {
		initialize: function() {								//关于位置样式操作的 浏览器兼容性判断 初始化函数
			var body = document.body,
					container = document.createElement( "div" ),
					innerDiv, checkDiv, table, td,
					bodyMarginTop = parseFloat( da.curCSS( body, "marginTop", true ) ) || 0,
					strHTML = ["<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'>",
										    "<div></div>",
										 "</div>",
										 "<table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'>",
										    "<tr><td></td></tr>",
										 "</table>"].join("");
	
			da.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );
			container.innerHTML = strHTML;
			body.insertBefore( container, body.firstChild );
			innerDiv = container.firstChild;
			checkDiv = innerDiv.firstChild;
			td = innerDiv.nextSibling.firstChild.firstChild;
	
			this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
			this.doesAddBorderForTableAndCells = (td.offsetTop === 5);	
	
			checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
			// safari subtracts parent border width here which is 5px
			this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
			checkDiv.style.position = checkDiv.style.top = "";
	
			innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
			this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
	
			this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);							//针对body的位置偏移量 是否包含marginTop 的判断
	
			body.removeChild( container );
			body = container = innerDiv = checkDiv = table = td = null;
			
			da.offset.initialize = da.noop;							//回收资源，避免内存泄露，初始化操作只一次
		},
	
		getBodyOffset: function( body ) {
			var top = body.offsetTop, left = body.offsetLeft;										//初始值至少应该包含body的偏移值
	
			da.offset.initialize();				//先初始化 关于位置样式的兼容性判断
	
			if ( da.offset.doesNotIncludeMarginInBodyOffset ) {									//如果当前浏览器偏移值不包含marginTop, 全部统一为包含body的marginTop值
				top  += parseFloat( da.curCSS(body, "marginTop", true) ) || 0;
				left += parseFloat( da.curCSS(body, "marginLeft", true) ) || 0;
			}
	
			return { top: top, left: left };
		},
		
		//设置DOM对象的偏移坐标
		/*
			obj: 目标对象
			options: 
			i: 
		*/
		setOffset: function( obj, options, i ) {
			if ( /static/.test( da.curCSS( obj, "position" ) ) ) {							//在设置偏移位置时要保证position属性为非static, 默认设置为relative
				obj.style.position = "relative";
			}
			var curElem	= da( obj ),
					curOffset = curElem.offset(),
					curTop = parseInt( da.curCSS( obj, "top",  true ), 10 ) || 0,
					curLeft = parseInt( da.curCSS( obj, "left", true ), 10 ) || 0;
	
			if ( da.isFunction( options ) ) {
				options = options.call( obj, i, curOffset );
			}
	
			var pos = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
	
			if ( "using" in options ) {															//不知道有什么特殊的作用????????????
				options.using.call( obj, pos );
			}
			else {
				curElem.css( pos );
			}
		}
	};
	
	da.fnStruct.extend({
			pos: function(){
					if ( !this.dom[0] ) {
						return null;
					}
			
					var elem = this.dom[0],
			
					// Get *real* offsetParent
					offsetParent = this.posInParent(),
					// Get correct offsets
					offset = this.offset(),
					parentOffset = /^body|html$/i.test(offsetParent.dom[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();
					
					// Subtract element margins
					// note: when an element has margin: auto the offsetLeft and marginLeft
					// are the same in Safari causing offset.left to incorrectly be 0
					offset.top  -= parseFloat( da.curCSS(elem, "marginTop",  true) ) || 0;
					offset.left -= parseFloat( da.curCSS(elem, "marginLeft", true) ) || 0;
					
					// Add offsetParent borders
					parentOffset.top  += parseFloat( da.curCSS(offsetParent.dom[0], "borderTopWidth",  true) ) || 0;
					parentOffset.left += parseFloat( da.curCSS(offsetParent.dom[0], "borderLeftWidth", true) ) || 0;
					
					// Subtract the two offsets
					return {
						top:  offset.top  - parentOffset.top,
						left: offset.left - parentOffset.left
					};
			},
			
			posInParent: function(){
					return this.map(function() {
							var offsetParent = this.offsetParent || document.body;
							while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && da.css(offsetParent, "position") === "static") ) {
								offsetParent = offsetParent.offsetParent;
							}
							return offsetParent;
							
					});
			},
			
			//设置DOM元素的偏移位置（目标对象必须 要有left、top样式属性）
			/*
				options: left、top键值对
			*/
			offset: function( options ){
				var obj = this.dom[0];
			
				if ( options ) {																	//批量全处理
					return this.each(function( i ) {
						da.offset.setOffset( this, options, i );
					});
				}
			
				if ( !obj || !obj.ownerDocument ) {								//如果DOM对象还没有写入任何一个document直接返回空
					return null;
				}
			
				if ( obj === obj.ownerDocument.body ) {						//如果是计算body的偏移值, 直接调用da.offset.getBodyOffset() 函数
					return da.offset.getBodyOffset( obj );
				}
			
				var box = obj.getBoundingClientRect(),
						doc = obj.ownerDocument,
						body = doc.body,
						docElem = doc.documentElement,
					
						clientTop = docElem.clientTop || body.clientTop || 0,
						clientLeft = docElem.clientLeft || body.clientLeft || 0,
						top  = box.top  + (self.pageYOffset || da.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
						left = box.left + (self.pageXOffset || da.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
			
				return { top: top, left: left };
			}
	
	});
	/*
	if ( "getBoundingClientRect" in document.documentElement ) {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];
	
			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}
	
			if ( !elem || !elem.ownerDocument ) {
				return null;
			}
	
			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}
	
			var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
				left = box.left + (self.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
	
			return { top: top, left: left };
		};
	
	} 
	else {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];
	
			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}
	
			if ( !elem || !elem.ownerDocument ) {
				return null;
			}
	
			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}
	
			jQuery.offset.initialize();
	
			var offsetParent = elem.offsetParent, prevOffsetParent = elem,
				doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
				body = doc.body, defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
				top = elem.offsetTop, left = elem.offsetLeft;
	
			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
					break;
				}
	
				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;
	
				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;
	
					if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}
	
					prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
				}
	
				if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}
	
				prevComputedStyle = computedStyle;
			}
	
			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}
	
			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}
	
			return { top: top, left: left };
		};
	}
	*/

})(da);