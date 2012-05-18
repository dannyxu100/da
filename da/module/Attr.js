/***************** Attr *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Element���Թ����� ���Ĵ���
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
			return da.access( this, da.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each(function() {
				da.removeAttr( this.dom, name );
			});
		},
		
		/**�ж�Ԫ���Ƿ����class��ʽ
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
		
		/**���class��ʽ
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
						if ( !item.className ) {									//classNameΪ��,ֱ�����
							item.className = param;

						}
						else {														//׷��
							var curClass = " " + item.className + " ",				//��ǰclassName,ǰ���" "���ڲ���
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
		
		/**�Ƴ�class��ʽ
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
							var curClass = (" " + item.className + " ").replace(daRe_class, " ");		//ȥ�ո񡢻��С��Ʊ��
							
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
		
		/**class��ʽ����ɾ����
		*/
		switchClass: function( param, isAdd ) {
			var type = typeof param,
				isForce = !!isAdd;						//���ڶ�����Ϊtrueʱ��ǿ�����class��ʽ
	
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
						state = isForce ? state : !item.hasClass( className );		//���ǿ�����ã��͸��ݵ�ǰ״̬����ɾ
						item[ state ? "addClass" : "removeClass" ]( className );
					}
				}
				else if ( type === "undefined" || type === "boolean" ) {			//����Ԫ��class��ʽ������ɾ�л�
					if ( this.className ) {
						da.data( this, "_da_switchClass", this.className );			//����ɵ�class��ʽ
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
		
	});


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
		
		//��������Hook����
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( daRe_type.test( elem.nodeName ) && elem.parentNode ) {		//����IE,ĳЩԪ�ز�����ı�Ԫ�ص�type����
						da.error( "��ܰ��ʾ:button��inputԪ�أ�������ı�type����" );
					} 
					else if ( !da.support.radioValue 
					&& "radio" === value 
					&& da.isNodeName(elem, "input") ) {								//����IE,���ĳԪ������typeΪradio���ͣ���Ҫ��������Ĭ��valueֵ
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
		
		//����Ԫ�صĸ�ֵHook����
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

		//����Ԫ�����Բ�������
		/*
			elem: Ԫ�ض���
			name: ��������
			value:  ����ֵ
			pass: �Ƿ�ͨ��da�����Ӧ ��Ա��������������ֵ
		*/
		attr: function( elem, name, value, pass ) {
			var nType = elem.nodeType;																			//���Ԫ�ض���ڵ�����
			
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {			//���ܶ��ı���ע�͡�XML���Խڵ�������Բ�����ֱ�ӷ���undefined
				return undefined;
			}
	
			if ( pass && name in da.attrFn ) {															//����ͨ�������Ա������������ԵĴ������Ҹ�����������������֮��Ӧ�Ĵ���������ֱ�ӵ��ó�Ա�������д���
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
	
			if ( value !== undefined ) {									//set����
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
			else {															//get����
				if ( hooks && "get" in hooks && notxml ) {
					return hooks.get( elem, name );
	
				} 
				else {
					ret = elem.getAttribute( name );
					
					return null === ret ? undefined : ret;					// Non-existent attributes return null, we normalize to undefined
				}
			}
		},
		
		//�Ƴ�Ԫ������
		/*
			elem: Ԫ�ض���
			name: ������
		*/
		removeAttr: function( elem, name ) {
				if ( 1 === elem.nodeType ) {
						name = da.attrFix[ name ] || name;
					
						if ( da.support.getSetAttribute ) {							//�ж�������Ƿ�֧��removeAttribute����
							elem.removeAttribute( name );
						}
						else {														//�����֧�֣�����ͨ��XML�ڵ��Ƴ��������
							da.attr( elem, name, "" );
							elem.removeAttributeNode( elem.getAttributeNode( name ) );
						}
				}
		}
		
	});


	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !da.support.getSetAttribute ) {											//����IE�շ��ʽ
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
	
})(da);
		