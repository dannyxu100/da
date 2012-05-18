/***************** Ԫ�ز��� *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Elements ���������� ���Ĵ���
	version: 1.0.0
*/
(function(da){
	var daRe_inlineDA = / da\d+="(?:\d+|null)"/g,
		daRe_leadingWhitespace = /^\s+/,							//ƥ����ǰ�οո���ַ���
		daRe_html = /<|&#?\w+;/,
		daRe_xhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		daRe_tagName = /<([\w:]+)/,
		daRe_tbody = /<tbody/i,										//�ж��Ƿ���tbody��ǩ
		daRe_scriptType = /\/(java|ecma)script/i,					//�ж��Ƿ��нŲ���ǩ
		
		daRe_nocache = /<(?:script|object|embed|option|style)/i,	//?????????
		daRe_checked = /checked\s*(?:[^=]|=\s*.checked.)/i,

		
		daWrapMap = {												//Ԫ�ذ���ӳ���
			option: [ 1, "<select multiple='multiple'>", "</select>" ],
			legend: [ 1, "<fieldset>", "</fieldset>" ],
			thead: [ 1, "<table>", "</table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
			col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
			area: [ 1, "<map>", "</map>" ],
			_default: [ 0, "", "" ]
		};
	
	daWrapMap.optgroup = daWrapMap.option;
	daWrapMap.tbody = daWrapMap.tfoot = daWrapMap.colgroup = daWrapMap.caption = daWrapMap.thead;
	daWrapMap.th = daWrapMap.td;

	if ( !da.support.htmlSerialize ) {											//IE���������Ĵ��л�link��script��ǩԪ��
		daWrapMap._default = [ 1, "div<div>", "</div>" ];
	}

	
	da.fnStruct.extend({
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
		
		/**�Ƴ�Ԫ�� ���Ƴ�ĳԪ���ڲ�ƥ����Ԫ��
		* params {String} selector ��Ԫ��ƥ��ѡ����
		* params {boolean} keepData �Ƿ���Ԫ�ص��Զ�����������
		*/
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this.dom[i]) != null; i++ ) {
				if ( !selector || da.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						da.cleanData( elem.getElementsByTagName("*") );
						da.cleanData( [ elem ] );
					}
					
          if( da.browser.ie && elem.parentNode){
              var ownerWin = elem.ownerDocument.parentWindow;           //��ȡ��ɾ������������������ҵ���Ӧ������Ͱ��
          
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

	/*
	function findOrAppend( elem, tag ) {
		return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
	}

	function cloneCopyEvent( src, dest ) {

		if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
			return;
		}

		var type, i, l,
			oldData = jQuery._data( src ),
			curData = jQuery._data( dest, oldData ),
			events = oldData.events;

		if ( events ) {
			delete curData.handle;
			curData.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}

		// make the cloned public data object a copy from the original
		if ( curData.data ) {
			curData.data = jQuery.extend( {}, curData.data );
		}
	}

	function cloneFixAttributes( src, dest ) {
		var nodeName;

		// We do not need to do anything for non-Elements
		if ( dest.nodeType !== 1 ) {
			return;
		}

		// clearAttributes removes the attributes, which we don't want,
		// but also removes the attachEvent events, which we *do* want
		if ( dest.clearAttributes ) {
			dest.clearAttributes();
		}

		// mergeAttributes, in contrast, only merges back on the
		// original attributes, not the events
		if ( dest.mergeAttributes ) {
			dest.mergeAttributes( src );
		}

		nodeName = dest.nodeName.toLowerCase();

		// IE6-8 fail to clone children inside object elements that use
		// the proprietary classid attribute value (rather than the type
		// attribute) to identify the type of content to display
		if ( nodeName === "object" ) {
			dest.outerHTML = src.outerHTML;

			// This path appears unavoidable for IE9. When cloning an object
			// element in IE9, the outerHTML strategy above is not sufficient.
			// If the src has innerHTML and the destination does not,
			// copy the src.innerHTML into the dest.innerHTML. #10324
			if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
				dest.innerHTML = src.innerHTML;
			}

		} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set
			if ( src.checked ) {
				dest.defaultChecked = dest.checked = src.checked;
			}

			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if ( dest.value !== src.value ) {
				dest.value = src.value;
			}

		// IE6-8 fails to return the selected option to the default selected
		// state when cloning options
		} else if ( nodeName === "option" ) {
			dest.selected = src.defaultSelected;

		// IE6-8 fails to set the defaultValue to the correct value when
		// cloning other types of input fields
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;

		// IE blanks contents when cloning scripts
		} else if ( nodeName === "script" && dest.text !== src.text ) {
			dest.text = src.text;
		}

		// Event data gets referenced instead of copied if the expando
		// gets copied too
		dest.removeAttribute( jQuery.expando );

		// Clear flags for bubbling special change/submit events, they must
		// be reattached when the newly cloned events are first activated
		dest.removeAttribute( "_submit_attached" );
		dest.removeAttribute( "_change_attached" );
	}
	*/
	
	//�ĵ�Ƭ�λ�����
	da.fragments = {};
	
	//�����������ĵ�����Ƭ�κ���
	/*
		args: �����б�
		nodes: Ԫ��Ƭ��
		scripts: �ű�Ƭ��
	*/
	da.buildFragment = function( args, nodes, scripts ) {
		var fragment, cacheAble, cacheResults,
			docTmp = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : doc);
	
		if ( args.length === 1 
		&& typeof args[0] === "string" 
		&& args[0].length < 512 																							//ֻ����0.5KB ��HTML����Ƭ��
		&& docTmp === doc 																										//ֻ�����뵱ǰDocument��ص�HTML����Ƭ��
		&& args[0].charAt(0) === "<" 
		&& !daRe_nocache.test( args[0] ) 																			//IE6 ������ȷ�Ŀ�¡�ĵ�Ƭ����optionԪ�ص�selectedѡ��״̬���ԣ�object��embedҲ������⣬���Բ������ˡ�
		&& (da.support.checkClone || !daRe_checked.test( args[0] )) ) {				//WebKit��������ĵ�Ƭ���У���¡Ԫ��ʱ��������ȷ�ĸ���checked״̬���ԣ����Բ������ˡ�
			cacheAble = true;
	
			cacheResults = da.fragments[ args[0] ];															//�����ĵ�Ƭ�λ����������ػ���
			if ( cacheResults && cacheResults !== 1 ) {
				fragment = cacheResults;
			}
		}
	
		if ( !fragment ) {																										//û�л�����ĵ�Ƭ�Σ��������ĵ�Ƭ��
			fragment = docTmp.createDocumentFragment();
			da.clean( args, docTmp, fragment, scripts );												//�����������ĵ�Ƭ����Ҫͨ��da.clean()������������һ��
		}
	
		if ( cacheAble ) {																									  //���ĵ�Ƭ�λ���set����
			da.fragments[ args[0] ] = cacheResults ? fragment : 1;
		}
	
		return { fragment: fragment, cacheAble: cacheAble };									//�����ĵ�Ƭ��
	};

	//��չ������ӡ���������⹦�ܵ�DOM�����������
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


	function getAll( elem ) {
		if ( "getElementsByTagName" in elem ) {
			return elem.getElementsByTagName( "*" );
		
		} else if ( "querySelectorAll" in elem ) {
			return elem.querySelectorAll( "*" );
	
		} else {
			return [];
		}
	}
	
	//����checkbox��redio��defaultChecked���Ժ���
	/*
		elem: ��Ҫ������Ԫ�ض���
	*/
	function fixDefaultChecked( elem ) {
		if ( elem.type === "checkbox" || elem.type === "radio" ) {						//�ж��Ƿ���checkbox��redio�ؼ�
			elem.defaultChecked = elem.checked;
		}
	}
	
	//�ҵ�����inputԪ��Ȼ�󴫸�fixDefaultChecked()��������
	/*
		elem: ���ҷ�ΧԪ�ض���
	*/
	function findInputs( elem ) {
		if ( da.isNodeName( elem, "input" ) ) {																//������ҷ�ΧԪ�ر�����input,��ֱ�ӵ���fixDefaultChecked()��������
			fixDefaultChecked( elem );
		} 
		else if ( elem.getElementsByTagName ) {																//��������ж��inputԪ�أ��ͽ�fixDefaultChecked()������Ϊ��֤�ص���������ͨ��da.grep()������������
			da.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
		}
		
	}
	
	//Ԫ�ؿ�¡������������
	da.extend({
		//��¡Ԫ�غ���
		/*
			elem: Ԫ�ض���
			dataAndEvents: Ԫ�ض�Ӧ���ݺ��¼�
			deepDataAndEvents: ���Ԫ�����ݺ��¼�
		*/
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var clone = elem.cloneNode(true),
					srcElements,
					destElements,
					i;
	
			if ( (!da.support.noCloneEvent || !da.support.noCloneChecked) &&
					(elem.nodeType === 1 || elem.nodeType === 11) && !da.isXMLDoc(elem) ) {
				// IE copies events bound via attachEvent when using cloneNode.
				// Calling detachEvent on the clone will also remove the events
				// from the original. In order to get around this, we use some
				// proprietary methods to clear the events. Thanks to MooTools
				// guys for this hotness.
	
				cloneFixAttributes( elem, clone );
	
				// Using Sizzle here is crazy slow, so we use getElementsByTagName
				// instead
				srcElements = getAll( elem );
				destElements = getAll( clone );
	
				// Weird iteration because IE will replace the length property
				// with an element if you are cloning the body and one of the
				// elements on the page has a name or id of "length"
				for ( i = 0; srcElements[i]; ++i ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				cloneCopyEvent( elem, clone );
	
				if ( deepDataAndEvents ) {
					srcElements = getAll( elem );
					destElements = getAll( clone );
	
					for ( i = 0; srcElements[i]; ++i ) {
						cloneCopyEvent( srcElements[i], destElements[i] );
					}
				}
			}
	
			// Return the cloned set
			return clone;
		},
		
		//���������ĵ�Ƭ�κ���
		/*
			elems�� Ԫ�ض��󼯺�
			context: ������
			fragment: �ĵ�Ƭ��
			scripts: �ű�Ƭ��
		*/
		clean: function( elems, context, fragment, scripts ) {
			var checkScriptType;
	
			context = context || doc;
	
			// !context.createElement fails in IE with an error but returns typeof 'object'
			if ( "undefined" === typeof context.createElement ) {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || doc;
			}
	
			var ret = [];
	
			for ( var i = 0, elem; null != (elem = elems[i]); i++ ) {
				if ( typeof elem === "number" ) {
					elem += "";
				}
	
				if ( !elem ) {
					continue;
				}
	
				if ( "string" === typeof elem ) {											//��HTML����Ƭ��д��Ԫ�ؽڵ�����У�����ת��
					if ( !daRe_html.test( elem ) ) {										//ƥ���ж��Ƿ���Ԫ�ر�ǩ���ţ����û�оʹ���Ϊ�ı���ǩ
						elem = context.createTextNode( elem );
					} 
					else {																							//��Ҫ����Ԫ�ؽڵ�
						elem = elem.replace( daRe_xhtmlTag, "<$1></$2>" );											//���������������"XHTML"��style��ǩ
	
						// Trim whitespace, otherwise indexOf won't work as expected
						var tag = ( daRe_tagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
								wrap = daWrapMap[ tag ] || daWrapMap._default,											//����ĵ�Ƭ��Ԫ�ض�����Ҫ����
								depth = wrap[0],
								div = context.createElement("div");
	
						div.innerHTML = wrap[1] + elem + wrap[2];					// Go to html and back, then peel off extra wrappers
	
						while ( depth-- ) {																//ͨ�������������ҵ�������Ԫ�ض���
							div = div.lastChild;
						}
	
						if ( da.support.tbody ) {													//�����IE���������Ҫɾ���Զ������tBody��ǩԪ��
							var hasBody = daRe_tbody.test(elem),
									tbody = ( "table" === tag && !hasBody ) ? 
									( div.firstChild && div.firstChild.childNodes ) : ( "<table>" === wrap[1] && !hasBody ) ?											// String was a bare <thead> or <tfoot>
									div.childNodes : [];
	
							for ( var j = tbody.length -1; j >= 0; --j ) {
								if ( da.isNodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
									tbody[ j ].parentNode.removeChild( tbody[ j ] );
								}
							}
							
						}
	
						if ( !da.support.leadingWhitespace 								//IE��ִ��innerHTMLʱ��ȥ��HTML����ǰ�������пո�
						&& daRe_leadingWhitespace.test( elem ) ) {													
							div.insertBefore( context.createTextNode( daRe_leadingWhitespace.exec( elem )[0] ), div.firstChild );
						}
	
						elem = div.childNodes;
					}
					
				}
				
				//�����IE6/7���������ĵ�����Ƭ����redio��checkbox֮ǰ����Ҫ����һ��defaultChecked����
				var len;
				if ( !da.support.appendChecked ) {
					if ( elem[0] && "number" === typeof (len = elem.length) ) {
						for ( i = 0; i < len; i++ ) {
							findInputs( elem[i] );
						}
					}
					else {
						findInputs( elem );
					}
				}
				
				if ( elem.nodeType ) {								//����Ԫ��
					ret.push( elem );
				}
				else {																//���Ԫ�ص����飬����ͨ��da.merge()�����ϲ���ret������
					ret = da.merge( ret, elem );			
				}
				
			}
	
			if ( fragment ) {
				checkScriptType = function( elem ) {														//��ʱ��������֤Ԫ�� �Ƿ��ǽű�Ԫ������ ������
					return !elem.type || daRe_scriptType.test( elem.type );
				};
				
				for ( var i=0; ret[i]; i++ ) {
					if ( scripts 																																							//����û��д���ű�������
					&& da.isNodeName( ret[i], "script" ) 																											//���� �ĵ�Ƭ�����нŲ�Ԫ��
					&& (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {									//���� �ű�Ԫ�ر���Ϊjs����
						scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );		//���ű�Ƭ��ѹ��ű�������
	
					}
					else {																																										//���û�нű������� ��ͨ�����־�ķ�ʽ���ְ�
						if ( ret[i].nodeType === 1 ) {
							var jsTags = da.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );
	
							ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
							
						}
						fragment.appendChild( ret[i] );
					}
					
				}
				
			}
	
			return ret;
		},
	
		//����Ԫ�����ݺ���
		/*
			elems: Ԫ�ض��󼯺�
		*/
		cleanData: function( elems ) {
			var data, id, cache = da.cache,
					internalKey = da.expando, 
					special = da.event.special,
					deleteExpando = da.support.deleteExpando;
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( elem.nodeName && da.noData[elem.nodeName.toLowerCase()] ) continue;
	
				id = elem[ da.expando ];
	
				if ( id ) {
//					data = cache[ id ] && cache[ id ][ internalKey ];					//internalKey �����ڲ�ʹ�ñ�ǣ���ʱ������ñ��ϻ��ưɣ��漰��ش���̫�ࣩ��
					data = cache[ id ];
					
					if ( data && data.events ) {
						for ( var type in data.events ) {
							if ( special[ type ] ) {
								da.event.remove( elem, type );
	
							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								da.removeEvent( elem, type, data.handle );
							}
						}
	
						// Null the DOM reference to avoid IE6/7/8 leak (#7054)
						if ( data.handle ) {
							data.handle.elem = null;
						}
					}
	
					if ( deleteExpando ) {
						delete elem[ da.expando ];
	
					} else if ( elem.removeAttribute ) {
						elem.removeAttribute( da.expando );
					}
	
					delete cache[ id ];
				}
			}
			
		}
		
		
	});
	
	
})(da);