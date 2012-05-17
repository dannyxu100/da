/***************** 元素属性 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Element属性管理器 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_class = /[\n\t\r]/g,
		daRe_space = /\s+/,
		daRe_return = /\r/g,
		daRe_type = /^(?:button|input)$/i,
		daRe_focusable = /^(?:button|input|object|select|textarea)$/i,
		daRe_clickable = /^a(?:rea)?$/i,
		daRe_special = /^(?:data-|aria-)/,
		daRe_invalidChar = /\:/,
		formHook;
			
	da.fnStruct.extend({
		attr: function( name, value ) {
			return da.access( this.dom, name, value, true, da.attr );
		},
	
		removeAttr: function( name ) {
			return this.each(function() {
				da.removeAttr( this.dom, name );
			});
		},
		
		/**判断元素是否存在class样式
		*/
		hasClass: function( str ) {
			var target = " " + str + " ";
			
			for ( var i = 0, len = this.dom.length; i < len; i++ ) {
				if ( 0 <= (" " + this.dom[i].className + " ").replace(daRe_class, " ").indexOf( target ) ) {
					return true;
				}
			}

			return false;
		},
		
		/**添加class样式
		*/
		addClass: function( param ) {
			if ( da.isFunction( param ) ) {
				return this.each(function(i) {
					var item = da(this);
					item.addClass( param.call(this, i, item.attr("class") || "") );
				});
			}

			if ( param && "string" === typeof param ) {
				var arrClass = (param || "").split( daRe_space );

				for ( var i = 0, len = this.dom.length; i < len; i++ ) {
					var item = this.dom[i];

					if ( 1 === item.nodeType ) {
						if ( !item.className ) {									//className为空,直接添加
							item.className = param;

						}
						else {														//追加
							var curClass = " " + item.className + " ",				//当前className,前后加" "用于查找
								newClass = item.className;

							for ( var n = 0, len2 = arrClass.length; n < len2; n++ ) {
								if ( 0 > curClass.indexOf( " " + arrClass[n] + " " ) ) {
									newClass += " " + arrClass[n];
								}
							}
							item.className = da.trim( newClass );
						}
					}
				}
			}

			return this;
		},
		
		/**移除class样式
		*/
		removeClass: function( param ) {
			if ( da.isFunction(param) ) {
				return this.each(function(i) {
					var item = da(this);
					item.removeClass( param.call(this, i, item.attr("class")) );
				});
			}

			if ( (param && typeof param === "string") || param === undefined ) {
				var arrClass = (param || "").split( daRe_space );

				for ( var i = 0, len = this.dom.length; i < len; i++ ) {
					var item = this.dom[i];

					if ( 1 === item.nodeType && item.className ) {
						if ( param ) {
							var curClass = (" " + item.className + " ").replace(daRe_class, " ");		//去空格、换行、制表符
							
							for ( var n = 0, len2 = arrClass.length; n < len2; n++ ) {
								curClass = curClass.replace(" " + arrClass[n] + " ", " ");
							}
							item.className = da.trim( curClass );

						} else {
							item.className = "";
						}
					}
				}
			}

			return this;
		},
		
		/**class样式增、删交替
		*/
		switchClass: function( param, isAdd ) {
			var type = typeof param,
				isForce = !!isAdd;						//当第二参数为true时，强制添加class样式
	
			if ( da.isFunction( param ) ) {
				return this.each(function(i) {
					var item = da(this);
					item.switchClass( param.call(this, i, item.attr("class"), isAdd), isAdd );
				});
			}

			return this.each(function() {
				if ( type === "string" ) {
					var item = da( this ),
						arrClass = param.split( daRe_space ),
						state = isAdd,
						className,
						n = 0;

					while ( (className = arrClass[ n++ ]) ) {
						state = isForce ? state : !item.hasClass( className );		//如非强制设置，就根据当前状态增或删
						item[ state ? "addClass" : "removeClass" ]( className );
					}
				}
				else if ( type === "undefined" || type === "boolean" ) {			//整个元素class样式进行增删切换
					if ( this.className ) {
						da.data( this, "_da_switchClass", this.className );			//缓存旧的class样式
					}

					this.className = (this.className || param === false) ? "" : da.data( this, "_da_switchClass" ) || "";
				}
			});
		},
		
		val: function( value ) {
			var hooks, ret,
					elem = this.dom[0];
			
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = da.valHooks[ elem.nodeName.toLowerCase() ] || da.valHooks[ elem.type ];
	
					if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
						return ret;
					}
	
					return (elem.value || "").replace(daRe_return, "");
				}
	
				return undefined;
			}
	
			var isFunction = da.isFunction( value );
	
			return this.each(function( i ) {
				var self = da(this), val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, self.val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
				} else if ( typeof val === "number" ) {
					val += "";
				} else if ( da.isArray( val ) ) {
					val = da.map(val, function ( value ) {
						return value == null ? "" : value + "";
					});
				}
	
				hooks = da.valHooks[ this.nodeName.toLowerCase() ] || da.valHooks[ this.type ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || ("set" in hooks && hooks.set( this, val, "value" ) === undefined) ) {
					this.value = val;
				}
			});
		},
		
		text: function( text ) {
			if ( da.isFunction(text) ) {
				return this.each(function(i) {
					var self = da( this );
					self.text( text.call(this, i, self.text()) );
				});
			}
	
			if ( "object" !== typeof text && undefined !== text ) {
				return this.empty().append( (this.dom[0] && this.dom[0].ownerDocument || document).createTextNode( text ) );
			}
	
			return da.text( this.dom );
		},
	
		empty: function() {
			for ( var i = 0, elem; (elem = this.dom[i]) != null; i++ ) {
				// Remove element nodes and prevent memory leaks
				if ( elem.nodeType === 1 ) {
					da.cleanData( elem.getElementsByTagName("*") );
				}
	
				// Remove any remaining nodes
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
			}
	
			return this;
		},

		append: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.appendChild( elem );
				}
			});
		},

		appendStart: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.insertBefore( elem, this.firstChild );
				}
			});
		},

		before: function() {
			if ( this.dom[0] && this.dom[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this );
				});
			} 
			else if ( arguments.length ) {
				var set = da(arguments[0]);
				set.push.apply( set, this.toArray() );
				return this.pushStack( set, "before", arguments );
			}
		},
	
		after: function() {
			if ( this.dom[0] && this.dom[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				});
			} else if ( arguments.length ) {
				var set = this.pushStack( this.dom, "after", arguments );
				set.push.apply( set, da(arguments[0]).toArray() );
				return set;
			}
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return da.clone( this.dom, dataAndEvents, deepDataAndEvents );
			});
		},
	
		html: function( value ) {
			if ( value === undefined ) {
				return this.dom[0] && this.dom[0].nodeType === 1 ?
					this.dom[0].innerHTML.replace(daRe_inlineDA, "") :
					null;
	
			// See if we can take a shortcut and just use innerHTML
			} else if ( typeof value === "string" && !daRe_nocache.test( value ) &&
				(da.support.leadingWhitespace || !daRe_leadingWhitespace.test( value )) &&
				!daWrapMap[ (daRe_tagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {
	
				value = value.replace(daRe_xhtmlTag, "<$1></$2>");
	
				try {
					for ( var i = 0, l = this.dom.length; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						if ( this.dom[i].nodeType === 1 ) {
							da.cleanData( this[i].getElementsByTagName("*") );
							this.dom[i].innerHTML = value;
						}
					}
	
				// If using innerHTML throws an exception, use the fallback method
				} 
				catch(e) {
					this.empty().append( value );
				}
	
			} else if ( da.isFunction( value ) ) {
				this.each(function(i){
					var self = da( this );
					self.html( value.call(this, i, self.html()) );
				});
	
			} else {
				this.empty().append( value );
			}
	
			return this;
		},
		
		/**移除元素 或移除某元素内部匹配子元素
		* params {String} selector 子元素匹配选择器
		* params {boolean} keepData 是否保留元素的自定义属性数据
		*/
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this.dom[i]) != null; i++ ) {
				if ( !selector || da.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						da.cleanData( elem.getElementsByTagName("*") );
						da.cleanData( [ elem ] );
					}
					
          if( da.browser.ie && elem.parentNode){
              var ownerWin = elem.ownerDocument.parentWindow;           //获取被删除对象所属窗体对象（找到相应的垃圾桶）
          
              if( !ownerWin.da.dustbin ){
              	var obj = ownerWin.document.createElement('div');
              	obj.id = "da_Dustbin";
//              	document.body.insertBefore( d );
								ownerWin.da.dustbin = obj;
              }

              ownerWin.da.dustbin.insertBefore( elem );
              ownerWin.da.dustbin.innerHTML = '';
              
          }
					else if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				}
				
			}
			return this;
		},
		
		domManip: function( args, table, callback ) {
			var results, first, fragment, parent,
				value = args[0],
				scripts = [];
	
			// We can't cloneNode fragments that contain checked, in WebKit
			if ( !da.support.checkClone && 3 === arguments.length && "string" === typeof value && daRe_checked.test( value ) ) {
				return this.each(function() {
					da(this).domManip( args, table, callback, true );
				});
			}
	
			if ( da.isFunction(value) ) {
				return this.each(function(i) {
					var self = da(this);
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip( args, table, callback );
				});
			}
	
			if ( this.dom[0] ) {
				parent = value && value.parentNode;
	
				// If we're in a fragment, just use that instead of building a new one
				if ( da.support.parentNode && parent && 11 === parent.nodeType && parent.childNodes.length === this.length ) {
					results = { fragment: parent };
	
				} else {
					results = da.buildFragment( args, this, scripts );
				}
	
				fragment = results.fragment;
	
				if ( fragment.childNodes.length === 1 ) {
					first = fragment = fragment.firstChild;
				} else {
					first = fragment.firstChild;
				}
	
				if ( first ) {
					table = table && da.isNodeName( first, "tr" );
	
					for ( var i = 0, l = this.dom.length, lastIndex = l - 1; i < l; i++ ) {
						callback.call(
							table ? root(this.dom[i], first) : this.dom[i],
							// Make sure that we do not leak memory by inadvertently discarding
							// the original fragment (which might have attached data) instead of
							// using it; in addition, use the original fragment object for the last
							// item instead of first because it can end up being emptied incorrectly
							// in certain situations (Bug #8070).
							// Fragments from the fragment cache must always be cloned and never used
							// in place.
							results.cacheable || (l > 1 && i < lastIndex) ? da.clone( fragment, true, true ) : fragment
						);
					}
				}
	
				if ( scripts.length ) {
					da.each( scripts, evalScript );
				}
			}
	
			return this;
		}
	});

	function root( elem, cur ) {
		return da.isNodeName(elem, "table") ? (elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody"))) : elem;
	}

	//扩展部分添加、插入等特殊功能的DOM对象操作函数
	da.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		da.fnStruct[ name ] = function( selector ) {
			var ret = [],
				insert = da( selector ),
				parent = this.dom.length === 1 && this.dom[0].parentNode;
	
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.dom.length === 1 ) {
				insert[ original ]( this.dom[0] );
				return this;
	
			} 
			else {
				for ( var i = 0, l = insert.dom.length; i < l; i++ ) {
					var elems = (i > 0 ? this.clone(true) : this).get();
					da( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
	
				return this.pushStack( ret, name, insert.selector );
			}
		};
	});

	//DOM对象 属性操作函数扩展
	da.extend({
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
		
		attrFix: {
			// Always normalize to ensure hook usage
			tabindex: "tabIndex",
			readonly: "readOnly"
		},
		
		//特殊属性Hook处理
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( daRe_type.test( elem.nodeName ) && elem.parentNode ) {								//兼容IE,某些元素不允许改变元素的type属性
						da.error( "温馨提示:button和input元素，不允许改变type属性" );
					} 
					else if ( !da.support.radioValue 
					&& "radio" === value 
					&& da.isNodeName(elem, "input") ) {																			//兼容IE,如果某元素设置type为radio类型，需要重新设置默认value值
						var val = elem.getAttribute("value");
						elem.setAttribute( "type", value );
						
						if ( val ) elem.value = val;
						
						return value;
					}
					
				}
			},
			tabIndex: {
				get: function( elem ) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabIndex");
	
					return attributeNode && attributeNode.specified ?
						parseInt( attributeNode.value, 10 ) :
						( daRe_focusable.test( elem.nodeName ) || daRe_clickable.test( elem.nodeName ) && elem.href ) ? 
						0 : undefined;
				}
			}
		},
		
		//特殊元素的赋值Hook处理
		valHooks: {
			option: {
				get: function( elem ) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}
			},
			
			select: {
				get: function( elem ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";
	
					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}
	
					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];
	
						// Don't return options that are disabled or in a disabled optgroup
						if ( option.selected && (da.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
								(!option.parentNode.disabled || !da.isNodeName( option.parentNode, "optgroup" )) ) {
	
							// Get the specific value for the option
							value = da( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if ( one && !values.length && options.length ) {
						return da( options[ index ] ).val();
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var values = da.pushArray( value );
	
					da(elem).find("option").each(function() {
						this.selected = da.isInArray( da(thsis).val(), values ) >= 0;
					});
	
					if ( !values.length ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		},

		//核心元素属性操作函数
		/*
			elem: 元素对象
			name: 属性名称
			value:  属性值
			pass: 是否通过da类的相应 成员函数来处理属性值
		*/
		attr: function( elem, name, value, pass ) {
			var nType = elem.nodeType;																			//获得元素对象节点类型
			
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {			//不能对文本、注释、XML属性节点进行属性操作，直接返回undefined
				return undefined;
			}
	
			if ( pass && name in da.attrFn ) {															//允许通过特殊成员函数，有针对性的处理，并且该属性类型正好有与之对应的处理函数，就直接调用成员函数进行处理。
				return da( elem )[ name ]( value );
			}
			
			var ret, hooks,
					notxml = nType !== 1 || !da.isXMLDoc( elem );
			
			// Normalize the name if needed
			name = notxml && da.attrFix[ name ] || name;
	
			// Get the appropriate hook, or the formHook
			// if getSetAttribute is not supported and we have form objects in IE6/7
			hooks = da.attrHooks[ name ] ||
				( formHook && (da.isNodeName( elem, "form" ) || daRe_invalidChar.test( name )) ?
					formHook :
					undefined );
	
			if ( value !== undefined ) {																			//set操作
				if ( value === null || (value === false && !daRe_special.test( name )) ) {
					da.removeAttr( elem, name );
					return undefined;
	
				} 
				else if ( hooks 
				&& "set" in hooks 
				&& notxml 
				&& undefined !== (ret = hooks.set( elem, value, name )) ) {
					return ret;
	
				} 
				else {
					// Set boolean attributes to the same name
					if ( value === true 
					&& !daRe_special.test( name ) )
						value = name;
	
					elem.setAttribute( name, "" + value );
					return value;
				}
	
			} 
			else {																														//get操作
				if ( hooks && "get" in hooks && notxml ) {
					return hooks.get( elem, name );
	
				} 
				else {
					ret = elem.getAttribute( name );
					
					return null === ret ? undefined : ret;												// Non-existent attributes return null, we normalize to undefined
				}
			}
		},
		
		//移除元素属性
		/*
			elem: 元素对象
			name: 属性名
		*/
		removeAttr: function( elem, name ) {
				if ( 1 === elem.nodeType ) {
						name = da.attrFix[ name ] || name;
					
						if ( da.support.getSetAttribute ) {							//判断浏览器是否支持removeAttribute函数
							elem.removeAttribute( name );
						}
						else {																					//如果不支持，可以通过XML节点移除函数完成
							da.attr( elem, name, "" );
							elem.removeAttributeNode( elem.getAttributeNode( name ) );
						}
				}
		}
		
	});
	
	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !da.support.getSetAttribute ) {											//兼容IE驼峰格式
		da.attrFix = da.extend( da.attrFix, {
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder"
		});
		
		// Use this for any attribute on a form in IE6/7
		formHook = da.attrHooks.name = da.attrHooks.value = da.valHooks.button = {
			get: function( elem, name ) {
				var ret;
				if ( name === "value" && !da.isNodeName( elem, "button" ) ) {
					return elem.getAttribute( name );
				}
				ret = elem.getAttributeNode( name );
				// Return undefined if not specified instead of empty string
				return ret && ret.specified ?
					ret.nodeValue :
					undefined;
			},
			set: function( elem, value, name ) {
				// Check form objects in IE (multiple bugs related)
				// Only use nodeValue if the attribute node exists on the form
				var ret = elem.getAttributeNode( name );
				if ( ret ) {
					ret.nodeValue = value;
					return value;
				}
			}
		};
	
		// Set width and height to auto instead of 0 on empty string( Bug #8150 )
		// This is for removals
		da.each([ "width", "height" ], function( i, name ) {
			da.attrHooks[ name ] = da.extend( da.attrHooks[ name ], {
				set: function( elem, value ) {
					if ( value === "" ) {
						elem.setAttribute( name, "auto" );
						return value;
					}
				}
			});
		});
	}
	
	
/* 	// Some attributes require a special call on IE
	if ( !jQuery.support.hrefNormalized ) {
		jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
			jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
				get: function( elem ) {
					var ret = elem.getAttribute( name, 2 );
					return ret === null ? undefined : ret;
				}
			});
		});
	}
	
	if ( !jQuery.support.style ) {
		jQuery.attrHooks.style = {
			get: function( elem ) {
				// Return undefined in the case of empty string
				// Normalize to lowercase since IE uppercases css property names
				return elem.style.cssText.toLowerCase() || undefined;
			},
			set: function( elem, value ) {
				return (elem.style.cssText = "" + value);
			}
		};
	}
	
	// Safari mis-reports the default selected property of an option
	// Accessing the parent's selectedIndex property fixes it
	if ( !jQuery.support.optSelected ) {
		jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
			get: function( elem ) {
				var parent = elem.parentNode;
	
				if ( parent ) {
					parent.selectedIndex;
	
					// Make sure that it also works with optgroups, see #5701
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		});
	}
	
	// Radios and checkboxes getter/setter
	if ( !jQuery.support.checkOn ) {
		jQuery.each([ "radio", "checkbox" ], function() {
			jQuery.valHooks[ this ] = {
				get: function( elem ) {
					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}
			};
		});
	}
	
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
				}
			}
		});
	}); */
	
})(da);