/***************** Event *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 事件管理机制 核心代码
	version: 1.0.0
*/
(function(da){
	var daRe_formElems = /^(?:textarea|input|select)$/i,
		daRe_typenamespace = /^([^\.]*)?(?:\.(.+))?$/,
		// daRe_namespaces = /\.(.*)$/,
		daRe_hoverHack = /(?:^|\s)hover(\.\S+)?\b/,
		daRe_keyEvent = /^key/,
		daRe_mouseEvent = /^(?:mouse|contextmenu)|click/,
		daRe_focusMorph = /^(?:focusinfocus|focusoutblur)$/,
		daRe_quickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
		daRe_escape = /[^\w\s.|`]/g;
	
	function quickParse( selector ) {
		var quick = daRe_quickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	}
	
	function quickIs( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	}
	
	//支持绑定hover事件(转为mouseenter$1和mouseleave$1)
	function hoverHack( events ) {
		return da.event.special.hover ? events : events.replace( daRe_hoverHack, "mouseenter$1 mouseleave$1" );
	}
	
	//清理函数
	function fnCleanup( nm ) {
		return nm.replace( daRe_escape, "\\$&" );
	}
	
	//恒返回False的函数
	function fnReturnFalse() {
		return false;
	}
	
	//恒返回True的函数
	function fnReturnTrue() {
		return true;
	}
	
	//事件移除公共函数
	da.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} : 
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

	//da.Event类构造函数
	/*
		src: 原始的event对象，也可以是事件类型字符串如："click","mouseover"等( this为封装后的event对象 )
	*/
	da.Event = function( src ) {
		if ( !this.preventDefault ) {				//取消默认的事件动作
			return new da.Event( src );
		}
	
		if ( src && src.type ) {
			this.originalEvent = src;					//将原始event对象缓存入，新event对象的属性变量中，供后面原型改造时调用
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? 
					fnReturnTrue : fnReturnFalse;
		}
		else {
			this.type = src;									//如果src传入的参数是字符串类型：da.Event("click");
		}
	
		this.timeStamp = da.nowId();				//修正timeStamp,因为firefox中一些event的时间戳不准确，所以还是自己定义个来得保险
		this[ da.expando ] = true;				//对当前event对象打上已做封装处理的标志
		
	};
	
	//对da.Event对象原型进行改造
	da.Event.prototype = {
		isDefaultPrevented: fnReturnFalse,
		isPropagationStopped: fnReturnFalse,
		isImmediatePropagationStopped: fnReturnFalse,
		
		//取消事件默认动作
		preventDefault: function() {
			this.isDefaultPrevented = fnReturnTrue;					//中止事件默认动作 判定函数( 默认返回为false，即允许 )
			
			var e = this.originalEvent;											//弹出原始事件对象
			if ( !e ) return;
			
			if ( e.preventDefault )	e.preventDefault();			//如果事件对象本身有preventDefault()函数，就调用
			else e.returnValue = false;											//如果没有preventDefault()函数,就将returnValue属性值设置为false，这也是针对IE浏览器的
		},
		
		//中止父级事件冒泡
		stopPropagation: function() {
			this.isPropagationStopped = fnReturnTrue;				//中止父级事件冒泡 判定函数( 默认返回为false，即允许 )
	
			var e = this.originalEvent;											//弹出原始事件对象
			if ( !e ) return;
			
			if ( e.stopPropagation ) e.stopPropagation();		//如果事件对象本身有stopPropagation()函数，就调用
			else e.cancelBubble = true;											//如果没有stopPropagation()函数,就将cancelBubble属性值设置为true，这也是针对IE浏览器的
				
		},
		
		//中止本地次优先级的事件响应 和父级事件传递( 事件冒泡 )
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = fnReturnTrue;			//中止本地和父级冒泡 判定函数( 默认返回为false，即允许 )
			
			this.stopPropagation();													//如果事件对象本身有stopPropagation()函数，就调用
			
		}
	};
	
	//1.3.5版本追加，方便记忆使用
	da.Event.prototype.noDefault = da.Event.prototype.preventDefault;
	da.Event.prototype.noParent = da.Event.prototype.stopPropagation;

	da.event = {
		props: ["altKey","attrChange","attrName","bubbles","button","cancelable","charCode",
				"clientX","clientY","ctrlKey","currentTarget","data","detail","eventPhase",
				"fromElement","handler","keyCode","layerX","layerY","metaKey","newValue",
				"offsetX","offsetY","pageX","pageY","prevValue","relatedNode","relatedTarget",
				"screenX","screenY","shiftKey","srcElement","target","toElement","view",
				"wheelDelta","which"],										//event对象的所有 成员列表
		guid: 1,
		// proxy: da.proxy,
		
		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function( event, original ) {
				if ( event.which == null ) {					//修正which，针对按键事件 charCode（键盘）keyCode（鼠标）
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button,
					fromElement = original.fromElement;

				if ( event.pageX == null && original.clientX != null ) {	//修正pageX/Y、clientX/Y属性,event事件的位置是相对page，如果页面可以滚动，
																			//client位置还要加上scroll，如果是IE浏览器，还要减去body的边框宽
					eventDoc = event.target.ownerDocument || document;		
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				if ( !event.relatedTarget && fromElement ) {				//修正relatedTarget属性，针对mouseover和mouserout事件；
																			//IE分成了to和from两个属性存放；FF没有分
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				//在 IE 里面 没有按键动作的时候 event.button = 0; 左键是1; 中键是4; 右键是2
				//在 Firefox 里面 没有按键动作的时候 event.button = 0; 左键是0 ;中键是1 ;右键是2
				//TODO: 这是不标准的，最好不要用这个
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},
		
		//事件封装函数
		/*
			event: 事件对象
		*/
		fix: function( event ) {
			if ( event[ da.expando ] ) {							//event对象已经封装过, 直接退出
				return event;
			}
	
			var originalEvent = event,								//缓存一个原始event对象
				fixHook = da.event.fixHooks[ event.type ] || {};
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
				
			event = da.Event( originalEvent );						//event对象并对其进行原型改造
	
			for ( var i = copy.length; i; ) {						//继承浏览器原event对象的属性
				prop = copy[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
		
			if ( !event.target ) {									//由于target属性的重要性，我们要再次确认是否被继承过来(兼容IE 6/7/8、Safari2)
				event.target = originalEvent.srcElement || document;
			}

			if ( event.target.nodeType === 3 ) {					//避免target属性指向的是一个文本对象(兼容Safari)
				event.target = event.target.parentNode;
			}

			if ( event.metaKey === undefined ) {					//修正metaKey，苹果电脑没有Ctrl键，只有meta键
				event.metaKey = event.ctrlKey;
			}

			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;			//特殊事件，需要特殊筛选处理
		},
		
		global: {},						//事件类型注册使用情况，标志集

		//分派自定义事件函数，通过命名空间分类和有序的执行( this是触发event事件的源元素对象 )
		/*
			event: 已经封装过的da.Event事件对象
		*/
		dispatch: function( event ) {
			event = da.event.fix( event || window.event );				//修正传入的event对象，保证其是封装过的
			
			var handlers = ( (da._data( this, "events" ) || {} )[ event.type ] || []),
				delegateCount = handlers.delegateCount,
				args = [].slice.call( arguments, 0 ),					//数组化参数列表
				run_all = !event.exclusive && !event.namespace,
				special = da.event.special[ event.type ] || {},
				handlerQueue = [],
				daObj, cur, selMatch, matches, handleObj, sel;
			
			args[0] = event;											//用封装好的Event对象代替原生浏览器event对象使用
			event.delegateTarget = this;								//事件托管目标指向自己
			
			/*TODO:	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			} */

			// Determine handlers that should run if there are delegated events
			if ( delegateCount && !(event.button && event.type === "click") ) {			//避免非鼠标左单击的事件冒泡
				// Pregenerate a single jQuery object for reuse with .is()
				daObj = da(this);
				daObj.context = this.ownerDocument || this;

				for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {	//事件冒泡处理
					if ( cur.disabled !== true ) {										//不处理不可用的元素
						selMatch = {};
						matches = [];
						daObj.dom[0] = cur;
						
						for ( var i = 0; i < delegateCount; i++ ) {						
							handleObj = handlers[ i ];									//事件处理结构体
							sel = handleObj.selector;									//委托对象选择器

							if ( selMatch[ sel ] === undefined ) {
								selMatch[ sel ] = (										//快速匹配事件委托对象
									handleObj.quick ? quickIs( cur, handleObj.quick ) : daObj.is( sel )
								);
							}
							if ( selMatch[ sel ] ) {
								matches.push( handleObj );
							}
						}
						
						if ( matches.length ) {
							handlerQueue.push({ elem: cur, matches: matches });
						}
					}
				}
			}
			
			// Add the remaining (directly-bound) handlers
			if ( handlers.length > delegateCount ) {
				handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
			}

			// Run delegates first; they may want to stop propagation beneath us
			for ( var i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
				matched = handlerQueue[ i ];
				event.currentTarget = matched.elem;

				for ( var j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
					handleObj = matched.matches[ j ];

					// Triggered event must either 1) be non-exclusive and have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					if ( run_all 
					|| (!event.namespace && !handleObj.namespace) 
					|| event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

						event.data = handleObj.data;
						event.handleObj = handleObj;

						ret = ( (da.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
									.apply( matched.elem, args );

						if ( ret !== undefined ) {
							event.result = ret;
							if ( ret === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
			
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},
	
		//给元素绑定事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
			data: 额外自定义传入数据对象
		*/
		add: function( elem, types, handler, data, selector ) {
			var tns, type, namespaces, 
				elemData,				//元素data缓存对象
				events, eventHandle,
				handleObjIn,			//handleObjIn用于缓存自定义函数参数对象；
				handleObj,				//handleObj事件属性配置对象，用于事件函数的注册存放和后期移除、触发
				handlers;
			
			if ( elem.nodeType === 3 || elem.nodeType === 8 			//不给文本和备注节点绑事件，没意义
			|| !types || !handler 										//缺少必要参数
			|| !(elemData = da._data( elem ))  ) {						//确保元素data缓存结构存在
				return;
			}
			
			/*
			if ( da.isWin( elem ) && ( elem !== window && !elem.frameElement ) ) {		//IE浏览器不能直接对window对象操作，所以先复制一下
				elem = window;
			}
			
			if ( handler === false ) handler = fnReturnFalse;							//如果handler的值为false可以屏蔽事件响应
			else if ( !handler ) return;
			*/
			
			if ( handler.handler ) {							//如果第3个参数，是以键值对的方式 如：{ handler: function(){……}, guid: 520 }
				handleObjIn = handler;							//缓存用户原参数对象(这里是键值对咯)
				handler = handleObjIn.handler;					//修正handler操作函数，为传入键值对的handler属性引用(内定的,在下面的代码可以看到)
				selector = handleObjIn.selector;
			}
	
			if ( !handler.guid ){								//回调函数赋值唯一标识，用于之后的查找或移除
				handler.guid = da.guid++;
			}
			
			events = elemData.events;							//如果已经有绑定的事件函数了，将事件函数都提出来，供下面追加事件绑定使用
			eventHandle = elemData.handle;
			
			if ( !events ) {									//首次add绑定事件
				elemData.events = events = {};					//初始化事件缓存结构体
			}
			if ( !eventHandle ) {								//初始化核心事件处理函数
																//定义eventHandle，到这里元素的data缓存结构 elemData === { events: {}, handle: function(){……} }
				elemData.handle = eventHandle = function( e ) {	//避免一个已经销毁的页面事件被调用 和 短时间内da.event.trigger()触发多次同一事件
					return "undefined" !== typeof da && (!e || e.type !== da.event.triggered ) ?
						da.event.dispatch.apply( eventHandle.elem, arguments ) :
						undefined;
				};
				eventHandle.elem = elem;						//给事件回调函数对象添加elem属性，存放事件绑定目标元素按对象，针对IE没有本地事件对象(IE的事件对象是放在window对象下统一管理的),可防止内存泄露的处理
			}
			
			types = da.trim( hoverHack(types) ).split( " " );	//支持空格分隔，批量绑定事件 如：da.event.add(obj, "mouseover mouseout", fn);
			
			for (var t = 0; t < types.length; t++ ) {							//批量处理逐一添加事件函数
				tns = daRe_typenamespace.exec( types[t] ) || [];				//提取事件的命名空间
				type = tns[1];
				namespaces = ( tns[2] || "" ).split( "." ).sort();

				// If event changes its type, use the special event handlers for the changed type
				special = da.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = da.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = da.extend({						//事件处理所需要的数据结构体
					type: type,
					origType: tns[1],
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					quick: selector && quickParse( selector ),
					namespace: namespaces.join(".")
					
				}, handleObjIn );

				handlers = events[ type ];					//提取对应事件的事件函数队列
				
				if ( !handlers ) {							//首次添加，初始化事件函数队列
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;				//该事件托管处理函数总数 初始化为0

					//如果非特殊事件类型 或da.event.special()判定函数返回值为false，就可以直接用addEventListener()或 attachEvent()绑定事件函数了
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle, false );

						} else if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}

				if ( special.add ) {									//特殊事件类型结构体，内部定义了add函数，就执行
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {					//修正guid
						handleObj.handler.guid = handler.guid;
					}
				}

				if ( selector ) {										//新事件处理结构体，加入队列
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				}
				else {
					handlers.push( handleObj );
				}

				da.event.global[ type ] = true;					//给da.event全局变量相应的事件类型打上标记，说明这种事件类型已有被注册，待全局事件触发时查看
			}

			elem = null;										//回收资源，避免内存泄露(兼容IE)
			
		},
	
		//针对元素移除或重置一个事件
		/*
			elem: 目标元素对象
			types: 事件类型
			handler: 自定义事件回调函数,值为false可以屏蔽事件响应
		*/
		remove: function( elem, types, handler, selector, mappedTypes ) {
			var elemData = da.hasData( elem ) && da._data( elem ),	//元素缓存数据结构体
				tns, namespaces, origType, origCount, type, 
				events,	eventType,									//元素事件缓存数据
				special, handleObj, handle;

			if ( !elemData || !(events = elemData.events) )	return;	//无事件缓存，直接返回
			
			// Once for each type.namespace in types; type may be omitted
			types = da.trim( hoverHack( types || "" ) ).split(" ");		//同时移除多个事件，用空格（" "）分隔，如：da("...").unbind("mouseover mouseout", fn);
			
			for ( var t = 0; t < types.length; t++ ) {
				tns = daRe_typenamespace.exec( types[t] ) || [];		//命名空间的所有事件处理
				type = origType = tns[1];
				namespaces = tns[2];

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {							//递归
						da.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = da.event.special[ type ] || {};				//特殊事件类型处理
				type = ( selector? special.delegateType : special.bindType ) || type;
				eventType = events[ type ] || [];
				origCount = eventType.length;
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

				// Remove matching events
				for ( var j = 0; j < eventType.length; j++ ) {			//循环元素所有已绑定的事件类型
					handleObj = eventType[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						 ( !handler || handler.guid === handleObj.guid ) &&
						 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
						 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						eventType.splice( j--, 1 );						//找到匹配的事件处理函数，并从元素事件类型列表中移除

						if ( handleObj.selector ) {						//委任方式 delegateCount需要-1
							eventType.delegateCount--;
						}
						if ( special.remove ) {							//特殊事件类型，结构体内定义有remove，就执行一下下
							special.remove.call( elem, handleObj );
						}
					}
				}

				if ( eventType.length === 0 && origCount !== eventType.length ) {			//如果已经移除了该种事件类型所有处理函数，就把监听事件也移除
					if ( !special.teardown || false === special.teardown.call( elem, namespaces ) ) {
						da.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];								//释放缓存区
				}
			}

			// Remove the expando if it's no longer used
			if ( da.isEmptyObj( events ) ) {
				handle = elemData.handle;
				if ( handle ) {
					handle.elem = null;
				}

				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				da.removeData( elem, [ "events", "handle" ], true );
			}
			
		},

		// Events that are safe to short-circuit if no handlers are attached.
		// Native DOM events should not be added, they may have inline handlers.
		customEvent: {
			"getData": true,
			"setData": true,
			"changeData": true
		},

		//事件触发器( 支持同事件冒泡 )
		/*
			event: da.Event对象 或触发的事件类型event type
			data: 用户自定义数据传入，数组格式
			elem: 事件触发目标元素对象
			onlyHandlers: 阻止事件冒泡，并且不执行元素默认事件
		*/
		trigger: function( event, data, elem, onlyHandlers ) {
			if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {		//文本和注释元素你们就算了嘛，你还搞什么事件啊
				return;
			}
			
			var type = event.type || event,
				namespaces = [],
				exclusive, ontype, special, eventPath, old, cur, handle,
				cache;
			
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( daRe_focusMorph.test( type + da.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "!" ) >= 0 ) {					//支持"click!","evtFn!"这种叹号"!"结尾的exclusive方式
				// Exclusive events trigger only for the exact event (no namespaces)
				type = type.slice(0, -1);						//去掉"!"符号
				exclusive = true;								//exclusive方式打开，这将会对add注册的所有事件函数根据命名空间的分类来执行
			}

			if ( type.indexOf( "." ) >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}

			if ( (!elem || da.event.customEvent[ type ]) 						//没有匹配的da内部自定义事件类型
			&& !da.event.global[ type ] ) {										//也没有匹配的全局事件类型
				return;															//直接退出
			}

			// Caller can pass in an Event, Object, or just an event type string
			event = typeof event === "object" ?
				// jQuery.Event object
				event[ da.expando ] ? event :
				// Object literal
				new da.Event( type, event ) :
				// Just the event type (string)
				new da.Event( type );

			event.type = type;
			event.isTrigger = true;
			event.exclusive = exclusive;
			event.namespace = namespaces.join( "." );
			event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

			// Handle a global trigger
			if ( !elem ) {														//如果没有指定事件触发的目标元素对象，就是全局事件的触发
				// TODO: Stop taunting the data cache; remove global events and always attach to document
				cache = da.cache;												//只需要触发注册过的事件类型就可以了嘛
				for ( var i in cache ) {										//批处理全局缓存中所有注册过事件函数的元素对象，并触发执行相应的事件函数
					if ( cache[ i ].events && cache[ i ].events[ type ] ) {
						da.event.trigger( event, data, cache[ i ].handle.elem, true );			//递归逐个触发执行
					}
				}
				return;
			}

			// Clean up the event in case it is being reused
			event.result = undefined;											//如果是再次触发，就先把之前触发执行的结果清楚掉
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data != null ? da.pushArray( data ) : [];					//如果有传入数据的话，通过pushArray缓存一下下嘛
			data.unshift( event );												//在缓存数组首部，压入事件对象

			// Allow special events to draw outside the lines
			special = da.event.special[ type ] || {};
			if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			eventPath = [[ elem, special.bindType || type ]];
			if ( !onlyHandlers && !special.noBubble && !da.isWin( elem ) ) {

				bubbleType = special.delegateType || type;
				cur = daRe_focusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
				old = null;
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push([ cur, bubbleType ]);
					old = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( old && old === elem.ownerDocument ) {
					eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
				}
			}
			
			// Fire handlers on the event path
			for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {	//冒泡触发父亲的事件函数( 默认允许， 一直到 Document )
				cur = eventPath[i][0];
				event.type = eventPath[i][1];

				handle = ( da._data( cur, "events" ) || {} )[ event.type ] && da._data( cur, "handle" );	//先假定"handle"属性是一个函数,触发这个事件函数
				if ( handle ) {
					handle.apply( cur, data );						//1. 触发通过da.event.add()添加的用户自定义事件函数,
																	//这里的data会以数组的方式，被分别传入apply()的多个参数
				}
				// Note that this is a bare JS function and not a jQuery handler
				handle = ontype && cur[ ontype ];					//2. 触发本地脚本或元素行内脚本事件函数, 
																	//如：obj.onclick=function(){……}; 或 <input onclick="fn();" …… />
				if ( handle && da.acceptData( cur ) && handle.apply( cur, data ) === false ) {		//执行事件函数，如果返回为false，就中止元素的默认事件触发
					event.preventDefault();
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {	//3. 触发元素事件默认动作( 默认允许 )，如:form.submit()

				if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&	//非特殊事件 或特殊事件判断返回false 
					!(type === "click" && da.isNodeName( elem, "a" )) && da.acceptData( elem ) ) {			//并且非超链接click事件 
																											//并且非特殊元素类型，所有都满足了，呼呼~就可以执行下去了
					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					// IE<9 dies on focus/blur to hidden element (#1486)
					if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !da.isWin( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];					//取出事件函数
						
						if ( old ) {							//这里的判断 和紧接着的置空，可以避免某些事件,
							elem[ ontype ] = null;				//在事件函数执行完毕返回之前，被再次重复触发( 如： )
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						da.event.triggered = type;				//打上已触发执行中标记
						elem[ type ]();
						da.event.triggered = undefined;			//撤销触发执行中标记

						if ( old ) {							//还原事件函数
							elem[ ontype ] = old;					
						}
					}
				}
			}

			return event.result;
			
		},

		simulate: function( type, elem, event, bubble ) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = da.extend( new da.Event(), event, {
					type: type,
					isSimulated: true,
					originalEvent: {}
				});
			
			if ( bubble ) {
				da.event.trigger( e, null, elem );
			} 
			else {
				da.event.dispatch.call( elem, e );
			}
			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		},
	
		//特殊事件函数类型过滤和处理
		special: {
			ready: {
				setup: da.bindReady							//在绑定事件前，确定ready事件已经被初始化
			},

			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},

			focus: {
				delegateType: "focusin"
			},
			blur: {
				delegateType: "focusout"
			},

			beforeunload: {
				setup: function( data, namespaces, eventHandle ) {
					// We only want to do this special case on windows
					if ( da.isWin( this ) ) {
						this.onbeforeunload = eventHandle;
					}
				},

				teardown: function( namespaces, eventHandle ) {
					if ( this.onbeforeunload === eventHandle ) {
						this.onbeforeunload = null;
					}
				}
			}
		}
	
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	da.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function( orig, fix ) {
		da.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
			
			handle: function( event ) {
				var target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj,
					selector = handleObj.selector,
					ret;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || (related !== target && !da.contains( target, related )) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	});

	// IE submit delegation
	if ( !da.support.submitBubbles ) {
		da.event.special.submit = {
			setup: function() {
				// Only need this for delegated form submit events
				if ( da.isNodeName( this, "form" ) ) {
					return false;
				}

				// Lazy-add a submit handler when a descendant form may potentially be submitted
				da.event.add( this, "click._submit keypress._submit", function( e ) {
					// Node name check avoids a VML-related crash in IE (#9807)
					var elem = e.target,
						form = da.isNodeName( elem, "input" ) || da.isNodeName( elem, "button" ) ? elem.form : undefined;
					if ( form && !form._submit_attached ) {
						jQuery.event.add( form, "submit._submit", function( event ) {
							event._submit_bubble = true;
						});
						form._submit_attached = true;
					}
				});
				// return undefined since we don't need an event listener
			},
			
			postDispatch: function( event ) {
				// If form was submitted by the user, bubble the event up the tree
				if ( event._submit_bubble ) {
					delete event._submit_bubble;
					if ( this.parentNode && !event.isTrigger ) {
						da.event.simulate( "submit", this.parentNode, event, true );
					}
				}
			},

			teardown: function() {
				// Only need this for delegated form submit events
				if ( da.isNodeName( this, "form" ) ) {
					return false;
				}

				// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
				da.event.remove( this, "._submit" );
			}
		};
	}

	// IE change delegation and checkbox/radio fix
	if ( !da.support.changeBubbles ) {
		da.event.special.change = {
			setup: function() {
				if ( daRe_formElems.test( this.nodeName ) ) {
					// IE doesn't fire change on a check/radio until blur; trigger it on click
					// after a propertychange. Eat the blur-change in special.change.handle.
					// This still fires onchange a second time for check/radio after blur.
					if ( this.type === "checkbox" || this.type === "radio" ) {
						da.event.add( this, "propertychange._change", function( event ) {
							if ( event.originalEvent.propertyName === "checked" ) {
								this._just_changed = true;
							}
						});
						da.event.add( this, "click._change", function( event ) {
							if ( this._just_changed && !event.isTrigger ) {
								this._just_changed = false;
								da.event.simulate( "change", this, event, true );
							}
						});
					}
					return false;
				}
				// Delegated event; lazy-add a change handler on descendant inputs
				da.event.add( this, "beforeactivate._change", function( e ) {
					var elem = e.target;

					if ( daRe_formElems.test( elem.nodeName ) && !elem._change_attached ) {
						da.event.add( elem, "change._change", function( event ) {
							if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
								da.event.simulate( "change", this.parentNode, event, true );
							}
						});
						elem._change_attached = true;
					}
				});
			},

			handle: function( event ) {
				var elem = event.target;

				// Swallow native change events from checkbox/radio, we already triggered them above
				if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
					return event.handleObj.handler.apply( this, arguments );
				}
			},

			teardown: function() {
				da.event.remove( this, "._change" );

				return daRe_formElems.test( this.nodeName );
			}
		};
	}

	// Create "bubbling" focus and blur events
	if ( !da.support.focusinBubbles ) {
		da.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler while someone wants focusin/focusout
			var attaches = 0,
				handler = function( event ) {
					da.event.simulate( fix, event.target, da.event.fix( event ), true );
				};

			da.event.special[ fix ] = {
				setup: function() {
					if ( attaches++ === 0 ) {
						document.addEventListener( orig, handler, true );
					}
				},
				teardown: function() {
					if ( --attaches === 0 ) {
						document.removeEventListener( orig, handler, true );
					}
				}
			};
		});
	}

	
	//da对象扩展事件操作函数
	da.fnStruct.extend({
		/**监听事件
		*/
		on: function( types, objs, data, fn, one/*内部使用*/ ) {
			var fnUser, type;
			
			//参数矫正处理
			if ( typeof types === "object" ) {				//( types-Object, selector, data ) 以键值对的方式绑定事件函数，如：{"click":funcion(){},"dbclick":funcion(){}}
				if ( typeof objs !== "string" ) { 			//( types-Object, data ) objs不为null, 也不是选择器字符串
					data = data || objs;					//前移data参数的位置
					objs = undefined;
				}
				for ( type in types ) {
					this.on( type, objs, data, types[ type ], one );
				}
				return this;
			}

			if ( data == null && fn == null ) {				//( types, fn )未传第2、3个参数
				fn = objs;									
				data = objs = undefined;
			} 
			else if ( fn == null ) {
				if ( typeof objs === "string" ) {			//( types, objs, fn )未传第3个参数
					fn = data;
					data = undefined;
				} 
				else {										//( types, data, fn )未传第2个参数
					fn = data;
					data = objs;
					objs = undefined;
				}
			}
			
			if ( fn === false ) {							//事件屏蔽处理
				fn = fnReturnFalse;
			}
			else if ( !fn ) {								//参数矫正后仍无自定义处理函数，参数有误
				return this;
			}

			if ( one === 1 ) {										//一次性事件处理
				fnUser = fn;
				fn = function( event ) {
					da().off( event );								//因为是一次性事件，所以先移除元素上的事件绑定
					return fnUser.apply( this, arguments );			//再通过引用方式调用原事件回调函数
				};
				// Use same guid so caller can remove using fnUser
				//fn.guid = fnUser.guid || ( fnUser.guid = jQuery.guid++ );
			}
			
			return this.each( function() {							//事件添加
				da.event.add( this, types, fn, data, objs );
			});
		},
		
		/**关闭事件监听
		*/
		off: function( types, objs, fn ) {
			/* TODO:
			if ( types && types.preventDefault && types.handleObj ) {	//( event )传入Event对象方式，移除事件
				var handleObj = types.handleObj;
				
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.objs,
					handleObj.handler
				);
				return this;
			}
			 */
			if ( typeof types === "object" ) {						//( types-object [, objs] )以键值对的方式关闭监听函数
				for ( var type in types ) {
					this.off( type, objs, types[ type ] );
				}
				return this;
			}
			if ( objs === false || typeof objs === "function" ) {	//( types [, fn] )未传第2个参数
				fn = objs;
				objs = undefined;
			}
			if ( fn === false ) {									//事件屏蔽处理
				fn = fnReturnFalse;
			}
			return this.each(function() {
				da.event.remove( this, types, fn, objs );
			});
		},

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		live: function( types, data, fn ) {
			da( this.context ).on( types, this.selector, data, fn );
			return this;
		},
		die: function( types, fn ) {
			da( this.context ).off( types, this.selector || "**", fn );
			return this;
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
		},

		trigger: function( type, data ) {
			return this.each(function() {
				da.event.trigger( type, data, this );
			});
		},
		triggerHandler: function( type, data ) {
			if ( this.dom[0] ) {
				return da.event.trigger( type, data, this.dom[0], true );
			}
		},
	
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	});
	
	da.each([
		"blur","focus","focusin","focusout","load","resize","scroll","unload","click","dblclick",
		"mousedown","mouseup","mousemove","mouseover","mouseout","mouseenter","mouseleave",
		"change","select","submit","keydown","keypress","keyup","error"],
		function( i, name ) {
			// Handle event binding
			da.fnStruct[ name ] = function( data, fn ) {
				if ( fn == null ) {
					fn = data;
					data = null;
				}
		
				return arguments.length > 0 ?
					this.bind( name, data, fn ) :
					this.trigger( name );
			};
		
			if ( da.attrFn ) {
				da.attrFn[ name ] = true;
			}
			
			if ( daRe_keyEvent.test( name ) ) {
				da.event.fixHooks[ name ] = da.event.keyHooks;
			}

			if ( daRe_mouseEvent.test( name ) ) {
				da.event.fixHooks[ name ] = da.event.mouseHooks;
			}
	});

})( da );