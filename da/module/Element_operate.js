/***************** 元素操作 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Elements 操作管理器 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_inlineDA = / da\d+="(?:\d+|null)"/g,
		daRe_leadingWhitespace = /^\s+/,							//匹配有前段空格的字符串
		daRe_html = /<|&#?\w+;/,
		daRe_xhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		daRe_tagName = /<([\w:]+)/,
		daRe_tbody = /<tbody/i,										//判断是否有tbody标签
		daRe_scriptType = /\/(java|ecma)script/i,					//判断是否有脚步标签
		
		daRe_nocache = /<(?:script|object|embed|option|style)/i,	//?????????
		daRe_checked = /checked\s*(?:[^=]|=\s*.checked.)/i,

		
		daWrapMap = {												//元素包裹映射表
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

	if ( !da.support.htmlSerialize ) {											//IE不能正常的串行化link和script标签元素
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
		return da.isNodeName(elem, "table") ?
			(elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
			elem;
	}
	
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
	
	//文档片段缓存区
	da.fragments = {};
	
	//构建、缓存文档代码片段函数
	/*
		args: 参数列表
		nodes: 元素片段
		scripts: 脚本片段
	*/
	da.buildFragment = function( args, nodes, scripts ) {
		var fragment, cacheAble, cacheResults,
			docTmp = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : doc);
	
		if ( args.length === 1 
		&& typeof args[0] === "string" 
		&& args[0].length < 512 																							//只缓存0.5KB 的HTML代码片段
		&& docTmp === doc 																										//只缓存与当前Document相关的HTML代码片段
		&& args[0].charAt(0) === "<" 
		&& !daRe_nocache.test( args[0] ) 																			//IE6 不能正确的克隆文档片段中option元素的selected选中状态属性，object和embed也会出问题，所以不缓存了。
		&& (da.support.checkClone || !daRe_checked.test( args[0] )) ) {				//WebKit浏览器在文档片段中，克隆元素时，不能正确的复制checked状态属性，所以不缓存了。
			cacheAble = true;
	
			cacheResults = da.fragments[ args[0] ];															//查找文档片段缓存区，返回缓存
			if ( cacheResults && cacheResults !== 1 ) {
				fragment = cacheResults;
			}
		}
	
		if ( !fragment ) {																										//没有缓存过文档片段，就生产文档片段
			fragment = docTmp.createDocumentFragment();
			da.clean( args, docTmp, fragment, scripts );												//生产出来的文档片段需要通过da.clean()函数修正清理一下
		}
	
		if ( cacheAble ) {																									  //对文档片段缓存set操作
			da.fragments[ args[0] ] = cacheResults ? fragment : 1;
		}
	
		return { fragment: fragment, cacheAble: cacheAble };									//返回文档片段
	};

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


	function getAll( elem ) {
		if ( "getElementsByTagName" in elem ) {
			return elem.getElementsByTagName( "*" );
		
		} else if ( "querySelectorAll" in elem ) {
			return elem.querySelectorAll( "*" );
	
		} else {
			return [];
		}
	}
	
	//修正checkbox和redio的defaultChecked属性函数
	/*
		elem: 需要修正的元素对象
	*/
	function fixDefaultChecked( elem ) {
		if ( elem.type === "checkbox" || elem.type === "radio" ) {						//判断是否是checkbox或redio控件
			elem.defaultChecked = elem.checked;
		}
	}
	
	//找到所有input元素然后传给fixDefaultChecked()函数处理
	/*
		elem: 查找范围元素对象
	*/
	function findInputs( elem ) {
		if ( da.isNodeName( elem, "input" ) ) {																//如果查找范围元素本身是input,就直接掉用fixDefaultChecked()函数处理
			fixDefaultChecked( elem );
		} 
		else if ( elem.getElementsByTagName ) {																//如果可能有多个input元素，就将fixDefaultChecked()函数作为验证回调处理函数，通过da.grep()函数来批处理。
			da.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
		}
		
	}
	
	//元素克隆和清理函数集合
	da.extend({
		//克隆元素函数
		/*
			elem: 元素对象
			dataAndEvents: 元素对应数据和事件
			deepDataAndEvents: 深度元素数据和事件
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
		
		//修整清理文档片段函数
		/*
			elems： 元素对象集合
			context: 上下文
			fragment: 文档片段
			scripts: 脚本片段
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
	
				if ( "string" === typeof elem ) {											//将HTML代码片段写入元素节点对象中，进行转换
					if ( !daRe_html.test( elem ) ) {										//匹配判断是否有元素标签符号，如果没有就创建为文本标签
						elem = context.createTextNode( elem );
					} 
					else {																							//需要创建元素节点
						elem = elem.replace( daRe_xhtmlTag, "<$1></$2>" );											//让所有浏览器兼容"XHTML"的style标签
	
						// Trim whitespace, otherwise indexOf won't work as expected
						var tag = ( daRe_tagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
								wrap = daWrapMap[ tag ] || daWrapMap._default,											//如果文档片段元素对象需要包裹
								depth = wrap[0],
								div = context.createElement("div");
	
						div.innerHTML = wrap[1] + elem + wrap[2];					// Go to html and back, then peel off extra wrappers
	
						while ( depth-- ) {																//通过包裹层数，找到生产的元素对象
							div = div.lastChild;
						}
	
						if ( da.support.tbody ) {													//如果是IE浏览器，还要删除自动插入的tBody标签元素
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
	
						if ( !da.support.leadingWhitespace 								//IE在执行innerHTML时将去除HTML代码前部的所有空格
						&& daRe_leadingWhitespace.test( elem ) ) {													
							div.insertBefore( context.createTextNode( daRe_leadingWhitespace.exec( elem )[0] ), div.firstChild );
						}
	
						elem = div.childNodes;
					}
					
				}
				
				//如果是IE6/7，在生产文档对象片段中redio和checkbox之前，需要修正一下defaultChecked属性
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
				
				if ( elem.nodeType ) {								//单个元素
					ret.push( elem );
				}
				else {																//多个元素的数组，可以通过da.merge()函数合并到ret数组中
					ret = da.merge( ret, elem );			
				}
				
			}
	
			if ( fragment ) {
				checkScriptType = function( elem ) {														//临时函数，验证元素 是否是脚本元素类型 处理函数
					return !elem.type || daRe_scriptType.test( elem.type );
				};
				
				for ( var i=0; ret[i]; i++ ) {
					if ( scripts 																																							//如果用户有传入脚本缓存区
					&& da.isNodeName( ret[i], "script" ) 																											//并且 文档片段中有脚步元素
					&& (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {									//并且 脚本元素必须为js类型
						scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );		//将脚本片段压入脚本缓存区
	
					}
					else {																																										//如果没有脚本缓存区 就通过打标志的方式区分吧
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
	
		//清理元素数据函数
		/*
			elems: 元素对象集合
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
//					data = cache[ id ] && cache[ id ][ internalKey ];					//internalKey 用于内部使用标记，暂时不加入该保障机制吧（涉及相关代码太多）。
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