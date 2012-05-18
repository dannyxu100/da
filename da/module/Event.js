/***************** Event *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: �¼�������� ���Ĵ���
	version: 1.0.0
*/
(function(da){
	var daRe_typenamespace = /^([^\.]*)?(?:\.(.+))?$/,
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
	
	//֧�ְ�hover�¼�(תΪmouseenter$1��mouseleave$1)
	function hoverHack( events ) {
		return da.event.special.hover ? events : events.replace( daRe_hoverHack, "mouseenter$1 mouseleave$1" );
	}
	
	//������
	function fnCleanup( nm ) {
		return nm.replace( daRe_escape, "\\$&" );
	}
	
	//�㷵��False�ĺ���
	function fnReturnFalse() {
		return false;
	}
	
	//�㷵��True�ĺ���
	function fnReturnTrue() {
		return true;
	}
	
	//�¼��Ƴ���������
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

	//da.Event�๹�캯��
	/*
		src: ԭʼ��event����Ҳ�������¼������ַ����磺"click","mouseover"��( thisΪ��װ���event���� )
	*/
	da.Event = function( src ) {
		if ( !this.preventDefault ) {				//ȡ��Ĭ�ϵ��¼�����
			return new da.Event( src );
		}
	
		if ( src && src.type ) {
			this.originalEvent = src;					//��ԭʼevent���󻺴��룬��event��������Ա����У�������ԭ�͸���ʱ����
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false || src.getPreventDefault && src.getPreventDefault()) ? 
					fnReturnTrue : fnReturnFalse;
		}
		else {
			this.type = src;									//���src����Ĳ������ַ������ͣ�da.Event("click");
		}
	
		this.timeStamp = da.nowId();				//����timeStamp,��Ϊfirefox��һЩevent��ʱ�����׼ȷ�����Ի����Լ���������ñ���
		this[ da.expando ] = true;				//�Ե�ǰevent�������������װ����ı�־
		
	};
	
	//��da.Event����ԭ�ͽ��и���
	da.Event.prototype = {
		isDefaultPrevented: fnReturnFalse,
		isPropagationStopped: fnReturnFalse,
		isImmediatePropagationStopped: fnReturnFalse,
		
		//ȡ���¼�Ĭ�϶���
		preventDefault: function() {
			this.isDefaultPrevented = fnReturnTrue;					//��ֹ�¼�Ĭ�϶��� �ж�����( Ĭ�Ϸ���Ϊfalse�������� )
			
			var e = this.originalEvent;											//����ԭʼ�¼�����
			if ( !e ) return;
			
			if ( e.preventDefault )	e.preventDefault();			//����¼���������preventDefault()�������͵���
			else e.returnValue = false;											//���û��preventDefault()����,�ͽ�returnValue����ֵ����Ϊfalse����Ҳ�����IE�������
		},
		
		//��ֹ�����¼�ð��
		stopPropagation: function() {
			this.isPropagationStopped = fnReturnTrue;				//��ֹ�����¼�ð�� �ж�����( Ĭ�Ϸ���Ϊfalse�������� )
	
			var e = this.originalEvent;											//����ԭʼ�¼�����
			if ( !e ) return;
			
			if ( e.stopPropagation ) e.stopPropagation();		//����¼���������stopPropagation()�������͵���
			else e.cancelBubble = true;											//���û��stopPropagation()����,�ͽ�cancelBubble����ֵ����Ϊtrue����Ҳ�����IE�������
				
		},
		
		//��ֹ���ش����ȼ����¼���Ӧ �͸����¼�����( �¼�ð�� )
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = fnReturnTrue;			//��ֹ���غ͸���ð�� �ж�����( Ĭ�Ϸ���Ϊfalse�������� )
			
			this.stopPropagation();													//����¼���������stopPropagation()�������͵���
			
		}
	};
	
	//1.3.5�汾׷�ӣ��������ʹ��
	da.Event.prototype.noDefault = da.Event.prototype.preventDefault;
	da.Event.prototype.noParent = da.Event.prototype.stopPropagation;

	da.event = {
		props: ["altKey","attrChange","attrName","bubbles","button","cancelable","charCode",
				"clientX","clientY","ctrlKey","currentTarget","data","detail","eventPhase",
				"fromElement","handler","keyCode","layerX","layerY","metaKey","newValue",
				"offsetX","offsetY","pageX","pageY","prevValue","relatedNode","relatedTarget",
				"screenX","screenY","shiftKey","srcElement","target","toElement","view",
				"wheelDelta","which"],										//event��������� ��Ա�б�
		guid: 1,
		// proxy: da.proxy,
		
		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function( event, original ) {
				if ( event.which == null ) {					//����which����԰����¼� charCode�����̣�keyCode����꣩
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

				if ( event.pageX == null && original.clientX != null ) {	//����pageX/Y��clientX/Y����,event�¼���λ�������page�����ҳ����Թ�����
																			//clientλ�û�Ҫ����scroll�������IE���������Ҫ��ȥbody�ı߿��
					eventDoc = event.target.ownerDocument || document;		
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				if ( !event.relatedTarget && fromElement ) {				//����relatedTarget���ԣ����mouseover��mouserout�¼���
																			//IE�ֳ���to��from�������Դ�ţ�FFû�з�
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				//�� IE ���� û�а���������ʱ�� event.button = 0; �����1; �м���4; �Ҽ���2
				//�� Firefox ���� û�а���������ʱ�� event.button = 0; �����0 ;�м���1 ;�Ҽ���2
				//TODO: ���ǲ���׼�ģ���ò�Ҫ�����
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},
		
		//�¼���װ����
		/*
			event: �¼�����
		*/
		fix: function( event ) {
			if ( event[ da.expando ] ) {							//event�����Ѿ���װ��, ֱ���˳�
				return event;
			}
	
			var originalEvent = event,								//����һ��ԭʼevent����
				fixHook = da.event.fixHooks[ event.type ] || {};
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
				
			event = da.Event( originalEvent );						//event���󲢶������ԭ�͸���
	
			for ( var i = copy.length; i; ) {						//�̳������ԭevent���������
				prop = copy[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
		
			if ( !event.target ) {									//����target���Ե���Ҫ�ԣ�����Ҫ�ٴ�ȷ���Ƿ񱻼̳й���(����IE 6/7/8��Safari2)
				event.target = originalEvent.srcElement || document;
			}

			if ( event.target.nodeType === 3 ) {					//����target����ָ�����һ���ı�����(����Safari)
				event.target = event.target.parentNode;
			}

			if ( event.metaKey === undefined ) {					//����metaKey��ƻ������û��Ctrl����ֻ��meta��
				event.metaKey = event.ctrlKey;
			}

			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;			//�����¼�����Ҫ����ɸѡ����
		},
		
		global: {},						//�¼�����ע��ʹ���������־��

		//�����Զ����¼�������ͨ�������ռ����������ִ��( this�Ǵ���event�¼���ԴԪ�ض��� )
		/*
			event: �Ѿ���װ����da.Event�¼�����
		*/
		dispatch: function( event ) {
			event = da.event.fix( event || window.event );				//���������event���󣬱�֤���Ƿ�װ����
			
			var handlers = ( (da._data( this, "events" ) || {} )[ event.type ] || []),
				delegateCount = handlers.delegateCount,
				args = [].slice.call( arguments, 0 ),					//���黯�����б�
				run_all = !event.exclusive && !event.namespace,
				special = da.event.special[ event.type ] || {},
				handlerQueue = [],
				daObj, cur, selMatch, matches, handleObj, sel;
			
			args[0] = event;											//�÷�װ�õ�Event�������ԭ�������event����ʹ��
			event.delegateTarget = this;								//�¼��й�Ŀ��ָ���Լ�
			
			/*TODO:	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			} */

			// Determine handlers that should run if there are delegated events
			if ( delegateCount && !(event.button && event.type === "click") ) {			//���������󵥻����¼�ð��
				// Pregenerate a single jQuery object for reuse with .is()
				daObj = da(this);
				daObj.context = this.ownerDocument || this;

				for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {	//�¼�ð�ݴ���
					if ( cur.disabled !== true ) {										//���������õ�Ԫ��
						selMatch = {};
						matches = [];
						daObj.dom[0] = cur;
						
						for ( var i = 0; i < delegateCount; i++ ) {						
							handleObj = handlers[ i ];									//�¼�����ṹ��
							sel = handleObj.selector;									//ί�ж���ѡ����

							if ( selMatch[ sel ] === undefined ) {
								selMatch[ sel ] = (										//����ƥ���¼�ί�ж���
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
	
		//��Ԫ�ذ��¼�
		/*
			elem: Ŀ��Ԫ�ض���
			types: �¼�����
			handler: �Զ����¼��ص�����,ֵΪfalse���������¼���Ӧ
			data: �����Զ��崫�����ݶ���
		*/
		add: function( elem, types, handler, data, selector ) {
			var tns, type, namespaces, 
				elemData,				//Ԫ��data�������
				events, eventHandle,
				handleObjIn,			//handleObjIn���ڻ����Զ��庯����������
				handleObj,				//handleObj�¼��������ö��������¼�������ע���źͺ����Ƴ�������
				handlers;
			
			if ( elem.nodeType === 3 || elem.nodeType === 8 			//�����ı��ͱ�ע�ڵ���¼���û����
			|| !types || !handler 										//ȱ�ٱ�Ҫ����
			|| !(elemData = da._data( elem ))  ) {						//ȷ��Ԫ��data����ṹ����
				return;
			}
			
			/*
			if ( da.isWin( elem ) && ( elem !== window && !elem.frameElement ) ) {		//IE���������ֱ�Ӷ�window��������������ȸ���һ��
				elem = window;
			}
			
			if ( handler === false ) handler = fnReturnFalse;							//���handler��ֵΪfalse���������¼���Ӧ
			else if ( !handler ) return;
			*/
			
			if ( handler.handler ) {							//�����3�����������Լ�ֵ�Եķ�ʽ �磺{ handler: function(){����}, guid: 520 }
				handleObjIn = handler;							//�����û�ԭ��������(�����Ǽ�ֵ�Կ�)
				handler = handleObjIn.handler;					//����handler����������Ϊ�����ֵ�Ե�handler��������(�ڶ���,������Ĵ�����Կ���)
				selector = handleObjIn.selector;
			}
	
			if ( !handler.guid ){								//�ص�������ֵΨһ��ʶ������֮��Ĳ��һ��Ƴ�
				handler.guid = da.guid++;
			}
			
			events = elemData.events;							//����Ѿ��а󶨵��¼������ˣ����¼��������������������׷���¼���ʹ��
			eventHandle = elemData.handle;
			
			if ( !events ) {									//�״�add���¼�
				elemData.events = events = {};					//��ʼ���¼�����ṹ��
			}
			if ( !eventHandle ) {								//��ʼ�������¼�������
																//����eventHandle��������Ԫ�ص�data����ṹ elemData === { events: {}, handle: function(){����} }
				elemData.handle = eventHandle = function( e ) {	//����һ���Ѿ����ٵ�ҳ���¼������� �� ��ʱ����da.event.trigger()�������ͬһ�¼�
					return "undefined" !== typeof da && (!e || e.type !== da.event.triggered ) ?
						da.event.dispatch.apply( eventHandle.elem, arguments ) :
						undefined;
				};
				eventHandle.elem = elem;						//���¼��ص������������elem���ԣ�����¼���Ŀ��Ԫ�ذ��������IEû�б����¼�����(IE���¼������Ƿ���window������ͳһ�����),�ɷ�ֹ�ڴ�й¶�Ĵ���
			}
			
			types = da.trim( hoverHack(types) ).split( " " );	//֧�ֿո�ָ����������¼� �磺da.event.add(obj, "mouseover mouseout", fn);
			
			for (var t = 0; t < types.length; t++ ) {							//����������һ����¼�����
				tns = daRe_typenamespace.exec( types[t] ) || [];				//��ȡ�¼��������ռ�
				type = tns[1];
				namespaces = ( tns[2] || "" ).split( "." ).sort();

				// If event changes its type, use the special event handlers for the changed type
				special = da.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = da.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = da.extend({						//�¼���������Ҫ�����ݽṹ��
					type: type,
					origType: tns[1],
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					quick: selector && quickParse( selector ),
					namespace: namespaces.join(".")
					
				}, handleObjIn );

				handlers = events[ type ];					//��ȡ��Ӧ�¼����¼���������
				
				if ( !handlers ) {							//�״���ӣ���ʼ���¼���������
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;				//���¼��йܴ��������� ��ʼ��Ϊ0

					//����������¼����� ��da.event.special()�ж���������ֵΪfalse���Ϳ���ֱ����addEventListener()�� attachEvent()���¼�������
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle, false );

						} else if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}

				if ( special.add ) {									//�����¼����ͽṹ�壬�ڲ�������add��������ִ��
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {					//����guid
						handleObj.handler.guid = handler.guid;
					}
				}

				if ( selector ) {										//���¼�����ṹ�壬�������
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				}
				else {
					handlers.push( handleObj );
				}

				da.event.global[ type ] = true;					//��da.eventȫ�ֱ�����Ӧ���¼����ʹ��ϱ�ǣ�˵�������¼��������б�ע�ᣬ��ȫ���¼�����ʱ�鿴
			}

			elem = null;										//������Դ�������ڴ�й¶(����IE)
			
		},
	
		//���Ԫ���Ƴ�������һ���¼�
		/*
			elem: Ŀ��Ԫ�ض���
			types: �¼�����
			handler: �Զ����¼��ص�����,ֵΪfalse���������¼���Ӧ
		*/
		remove: function( elem, types, handler, selector, mappedTypes ) {
			var elemData = da.hasData( elem ) && da._data( elem ),	//Ԫ�ػ������ݽṹ��
				tns, namespaces, origType, origCount, type, 
				events,	eventType,									//Ԫ���¼���������
				special, handleObj, handle;

			if ( !elemData || !(events = elemData.events) )	return;	//���¼����棬ֱ�ӷ���
			
			// Once for each type.namespace in types; type may be omitted
			types = da.trim( hoverHack( types || "" ) ).split(" ");		//ͬʱ�Ƴ�����¼����ÿո�" "���ָ����磺da("...").unbind("mouseover mouseout", fn);
			
			for ( var t = 0; t < types.length; t++ ) {
				tns = daRe_typenamespace.exec( types[t] ) || [];		//�����ռ�������¼�����
				type = origType = tns[1];
				namespaces = tns[2];

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {							//�ݹ�
						da.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = da.event.special[ type ] || {};				//�����¼����ʹ���
				type = ( selector? special.delegateType : special.bindType ) || type;
				eventType = events[ type ] || [];
				origCount = eventType.length;
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

				// Remove matching events
				for ( var j = 0; j < eventType.length; j++ ) {			//ѭ��Ԫ�������Ѱ󶨵��¼�����
					handleObj = eventType[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						 ( !handler || handler.guid === handleObj.guid ) &&
						 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
						 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						eventType.splice( j--, 1 );						//�ҵ�ƥ����¼�������������Ԫ���¼������б����Ƴ�

						if ( handleObj.selector ) {						//ί�η�ʽ delegateCount��Ҫ-1
							eventType.delegateCount--;
						}
						if ( special.remove ) {							//�����¼����ͣ��ṹ���ڶ�����remove����ִ��һ����
							special.remove.call( elem, handleObj );
						}
					}
				}

				if ( eventType.length === 0 && origCount !== eventType.length ) {			//����Ѿ��Ƴ��˸����¼��������д��������ͰѼ����¼�Ҳ�Ƴ�
					if ( !special.teardown || false === special.teardown.call( elem, namespaces ) ) {
						da.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];								//�ͷŻ�����
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

		//�¼�������( ֧��ͬ�¼�ð�� )
		/*
			event: da.Event���� �򴥷����¼�����event type
			data: �û��Զ������ݴ��룬�����ʽ
			elem: �¼�����Ŀ��Ԫ�ض���
			onlyHandlers: ��ֹ�¼�ð�ݣ����Ҳ�ִ��Ԫ��Ĭ���¼�
		*/
		trigger: function( event, data, elem, onlyHandlers ) {
			if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {		//�ı���ע��Ԫ�����Ǿ�������㻹��ʲô�¼���
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

			if ( type.indexOf( "!" ) >= 0 ) {					//֧��"click!","evtFn!"����̾��"!"��β��exclusive��ʽ
				// Exclusive events trigger only for the exact event (no namespaces)
				type = type.slice(0, -1);						//ȥ��"!"����
				exclusive = true;								//exclusive��ʽ�򿪣��⽫���addע��������¼��������������ռ�ķ�����ִ��
			}

			if ( type.indexOf( "." ) >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}

			if ( (!elem || da.event.customEvent[ type ]) 						//û��ƥ���da�ڲ��Զ����¼�����
			&& !da.event.global[ type ] ) {										//Ҳû��ƥ���ȫ���¼�����
				return;															//ֱ���˳�
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
			if ( !elem ) {														//���û��ָ���¼�������Ŀ��Ԫ�ض��󣬾���ȫ���¼��Ĵ���
				// TODO: Stop taunting the data cache; remove global events and always attach to document
				cache = da.cache;												//ֻ��Ҫ����ע������¼����;Ϳ�������
				for ( var i in cache ) {										//������ȫ�ֻ���������ע����¼�������Ԫ�ض��󣬲�����ִ����Ӧ���¼�����
					if ( cache[ i ].events && cache[ i ].events[ type ] ) {
						da.event.trigger( event, data, cache[ i ].handle.elem, true );			//�ݹ��������ִ��
					}
				}
				return;
			}

			// Clean up the event in case it is being reused
			event.result = undefined;											//������ٴδ��������Ȱ�֮ǰ����ִ�еĽ�������
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data != null ? da.pushArray( data ) : [];					//����д������ݵĻ���ͨ��pushArray����һ������
			data.unshift( event );												//�ڻ��������ײ���ѹ���¼�����

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
			for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {	//ð�ݴ������׵��¼�����( Ĭ������ һֱ�� Document )
				cur = eventPath[i][0];
				event.type = eventPath[i][1];

				handle = ( da._data( cur, "events" ) || {} )[ event.type ] && da._data( cur, "handle" );	//�ȼٶ�"handle"������һ������,��������¼�����
				if ( handle ) {
					handle.apply( cur, data );						//1. ����ͨ��da.event.add()��ӵ��û��Զ����¼�����,
																	//�����data��������ķ�ʽ�����ֱ���apply()�Ķ������
				}
				// Note that this is a bare JS function and not a jQuery handler
				handle = ontype && cur[ ontype ];					//2. �������ؽű���Ԫ�����ڽű��¼�����, 
																	//�磺obj.onclick=function(){����}; �� <input onclick="fn();" ���� />
				if ( handle && da.acceptData( cur ) && handle.apply( cur, data ) === false ) {		//ִ���¼��������������Ϊfalse������ֹԪ�ص�Ĭ���¼�����
					event.preventDefault();
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {	//3. ����Ԫ���¼�Ĭ�϶���( Ĭ������ )����:form.submit()

				if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&	//�������¼� �������¼��жϷ���false 
					!(type === "click" && da.isNodeName( elem, "a" )) && da.acceptData( elem ) ) {			//���ҷǳ�����click�¼� 
																											//���ҷ�����Ԫ�����ͣ����ж������ˣ�����~�Ϳ���ִ����ȥ��
					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					// IE<9 dies on focus/blur to hidden element (#1486)
					if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !da.isWin( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];					//ȡ���¼�����
						
						if ( old ) {							//������ж� �ͽ����ŵ��ÿգ����Ա���ĳЩ�¼�,
							elem[ ontype ] = null;				//���¼�����ִ����Ϸ���֮ǰ�����ٴ��ظ�����( �磺 )
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						da.event.triggered = type;				//�����Ѵ���ִ���б��
						elem[ type ]();
						da.event.triggered = undefined;			//��������ִ���б��

						if ( old ) {							//��ԭ�¼�����
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
	
		//�����¼��������͹��˺ʹ���
		special: {
			ready: {
				setup: da.bindReady							//�ڰ��¼�ǰ��ȷ��ready�¼��Ѿ�����ʼ��
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
				if ( rformElems.test( this.nodeName ) ) {
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

					if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
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

				return rformElems.test( this.nodeName );
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

	
	//da������չ�¼���������
	da.fnStruct.extend({
		/**�����¼�
		*/
		on: function( types, objs, data, fn, one/*�ڲ�ʹ��*/ ) {
			var fnUser, type;
			
			//������������
			if ( typeof types === "object" ) {				//( types-Object, selector, data ) �Լ�ֵ�Եķ�ʽ���¼��������磺{"click":funcion(){},"dbclick":funcion(){}}
				if ( typeof objs !== "string" ) { 			//( types-Object, data ) objs��Ϊnull, Ҳ����ѡ�����ַ���
					data = data || objs;					//ǰ��data������λ��
					objs = undefined;
				}
				for ( type in types ) {
					this.on( type, objs, data, types[ type ], one );
				}
				return this;
			}

			if ( data == null && fn == null ) {				//( types, fn )δ����2��3������
				fn = objs;									
				data = objs = undefined;
			} 
			else if ( fn == null ) {
				if ( typeof objs === "string" ) {			//( types, objs, fn )δ����3������
					fn = data;
					data = undefined;
				} 
				else {										//( types, data, fn )δ����2������
					fn = data;
					data = objs;
					objs = undefined;
				}
			}
			
			if ( fn === false ) {							//�¼����δ���
				fn = fnReturnFalse;
			}
			else if ( !fn ) {								//���������������Զ��崦��������������
				return this;
			}

			if ( one === 1 ) {										//һ�����¼�����
				fnUser = fn;
				fn = function( event ) {
					da().off( event );								//��Ϊ��һ�����¼����������Ƴ�Ԫ���ϵ��¼���
					return fnUser.apply( this, arguments );			//��ͨ�����÷�ʽ����ԭ�¼��ص�����
				};
				// Use same guid so caller can remove using fnUser
				//fn.guid = fnUser.guid || ( fnUser.guid = jQuery.guid++ );
			}
			
			return this.each( function() {							//�¼����
				da.event.add( this, types, fn, data, objs );
			});
		},
		
		/**�ر��¼�����
		*/
		off: function( types, objs, fn ) {
			/* TODO:
			if ( types && types.preventDefault && types.handleObj ) {	//( event )����Event����ʽ���Ƴ��¼�
				var handleObj = types.handleObj;
				
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.objs,
					handleObj.handler
				);
				return this;
			}
			 */
			if ( typeof types === "object" ) {						//( types-object [, objs] )�Լ�ֵ�Եķ�ʽ�رռ�������
				for ( var type in types ) {
					this.off( type, objs, types[ type ] );
				}
				return this;
			}
			if ( objs === false || typeof objs === "function" ) {	//( types [, fn] )δ����2������
				fn = objs;
				objs = undefined;
			}
			if ( fn === false ) {									//�¼����δ���
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