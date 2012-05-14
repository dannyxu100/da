/**daInput
*智能输入选择控件类
* @author danny.xu
* @version daInput_1.0 2011-8-14 9:10:25
*/

(function( win, undefined ){
var doc = win.document;

var daInput = (function(){
	
	/**daInput类构造函数
	*/
	var daInput = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//遍历和查找daInput控件的高级快捷用法
			return daInput.getInput( setting );
			
		return new daInput.fnStruct.init( setting );
	};

	daInput.fnStruct = daInput.prototype = {
		version: "daInput v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",
		
		iId: 0,
		iObj: null,
		iParentObj: null,
		
		iTextObj: null,
		iIconObj: null,
		
		daGifObj: null,
		
		setting: {
			target: null,
			parent: null,
			id: "",
			
			width: "160px",
			height: "24px",
			
			style: "",
			className: "editbox",
			icon: "edit",								//[ "dialog", "date", "list" ]
			
			isTextarea: false,
			isDisabled: "",
			isReadonly: "",
			
			source: "",
			onvalid: "",
			invalid: "",
			
			hoverColor: "#fffff0",			//聚焦颜色样式
			
			css: {
				daInput: "daInput"
			},
			
			mousedown: null,
			mouseup: null,
			click: null,
			dblclick: null,
			keyup: null,
			change: null
			
		},
		
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.iParentObj = da( setting.parent );
			this.iParentObj = 0 < this.iParentObj.dom.length ? this.iParentObj.dom[0] : doc.body;
			
			if( setting.id )
				this.iId = setting.id;
			else 
				//this.iId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daInput_" + this.iId ) ) this.iId++;						//保证id 唯一性
			
			
			this.create();
			this.bindEvent();
			this.reSize();
			
			daInput.pushCache( this );
			
		},
		
		create: function(){
			var setting = this.setting,
					id = "daInput_" + this.iId,
					iObj, iTextObj, iIconObj;
					
			iObj = doc.createElement("span");
			iObj.id = id;
			iObj.className = [ setting.css.daInput, setting.className ].join(" ");
			if( setting.style ) iObj.style.cssText = setting.style;
			this.iParentObj.insertBefore( iObj, setting.target );
			this.iObj = iObj;
			
			if( setting.target && setting.target.nodeType ){
				iObj.insertBefore( setting.target );
				this.iTextObj = setting.target;
			}
			else{
				if( setting.isTextarea )
					iTextObj = doc.createElement("textarea");
				else
					iTextObj = doc.createElement("input");
					
				iTextObj.id = setting.id ? setting.id : id + "_text";
				if( setting.isDisabled ) iTextObj.setAttribute( "disabled", "disabled" );
				if( setting.isReadonly ) iTextObj.setAttribute( "readonly", "readyonly" );
				if( setting.source ) iTextObj.setAttribute( "source", setting.source );
				if( setting.invalid ) iTextObj.setAttribute( "invalid", setting.invalid );
				if( setting.onvalid ) iTextObj.setAttribute( "onvalid", setting.onvalid );
				
				iObj.insertBefore( iTextObj );
				this.iTextObj = iTextObj;
			}
			
			if( !setting.isTextarea ){
				iIconObj = doc.createElement("span");
				iIconObj.id = id + "_icon";
				iIconObj.className = setting.icon;
				iIconObj.style.cssText = "display:none";
	
				if( setting.image )
					iIconObj.style.backgroundImage = "url("+ setting.image +")";
				
				iObj.insertBefore( iIconObj );
				this.iIconObj = iIconObj;
			}
			
		},
		
		bindEvent: function(){
			var context = this,
					setting = this.setting;
			
			if( !setting.isTextarea ){
					da( this.iIconObj ).bind( "click", function(){										//小图标对象单击事件
						if( da.isFunction( context.setting.click ) )
							context.setting.click.call( this );
						
						daInput.run[ setting.icon ]( context, true );
					});
			}
			
			da( this.iObj ).bind( "dblclick", function(){
				if( da.isFunction( context.setting.dblclick ) )									//daInput双击事件事件
					context.setting.dblclick.call( this );
				daInput.run[ setting.icon ]( context, true );
				
			}).bind( "click", function(){
				context.reSize();
				if( !context.setting.isDisabled ){
					try{
						context.iTextObj.focus();
					}catch(e){};
				}
			});
			
			
			da( this.iTextObj ).bind( "focus click", function( evt ){					//输入框对象绑定事件
				evt.stopPropagation();
				context.iconShow();
				
				if( "list" === setting.icon || "date" === setting.icon )
					daInput.run[ setting.icon ]( context, true );
				
			}).bind( "blur", function(){
				context.iconHide();
				
				if( "list" === setting.icon || "date" === setting.icon )
					context.TimerPadHide = da.timer( 100, daInput.run[ setting.icon ], context, false );
					
			}).bind( "change", function(){
				if( da.isFunction( context.setting.change ) )
					context.setting.change.call( this );
				
			});
			
			if( "undefined" === typeof daKey ) return;													//输入框按键事件
			daKey({
				target: this.iTextObj,
				keydown: function( key, isCtrl, isAlt, isShift ){
					if( da.isFunction( setting.keyup ) )
						setting.keyup.call( context.iTextObj, key, isCtrl, isAlt, isShift );
					
						switch( setting.icon ){
							case "dialog":
								if( "Enter" === key ) daInput.run.dialog( context, true );
								break;
								
							case "list":
								if( !context.daListObj ) break;

								if( "Down Arrow" === key ){
									context.daListObj.show();
									context.daListObj.next();
								}
								else if( "Up Arrow" === key ){
									context.daListObj.show();
									context.daListObj.prev();
								}
								else if( "Enter" === key ){
									var res = context.daListObj.get();
									if( res ){
										context.iTextObj.value = res.text;
										context.iTextObj.setAttribute( "code", res.value );
									}
									context.daListObj.hide();
								}
								break;
						}
				},
				keyup: function( key, isCtrl, isAlt, isShift ){
					if( "list" === setting.icon ){
						//TODO:拼音开头
					}
				}
			});
		},

		
		/**显示功能小图标
		*/
		iconShow: function(){
			this.iObj.style.backgroundColor = this.setting.hoverColor;
			this.reSize();
			
			if( this.setting.isTextarea ) return;
			
			if( "undefined" !== typeof daFx ){
				da( this.iIconObj ).stop(true,true);
				
				if( "undefined" !== typeof daGif ){
					this.iIconObj.style.display = "inline-block";
					
					if( this.daGifObj ){
						this.daGifObj.play();
					}
					else{
						this.daGifObj = daGif({
							target: this.iIconObj,
							all: 5,
							speed: 15,
							top: daInput.IconTopHash[ this.setting.icon ],
							width: 16,
							height: 16
						});
					}
				}
				else{
					da( this.iIconObj ).fadeIn( 300 );
				}
			}
			else
				this.iIconObj.style.display = "block";
				
		},
		
		/**隐藏功能小图标
		*/
		iconHide: function(){
			this.iObj.style.backgroundColor = "";
				
			if( this.setting.isTextarea ) return;
			
			if( "undefined" !== typeof daFx ){
				da( this.iIconObj ).stop(true,true);
				
				if( "undefined" !== typeof daGif ){
					if( this.daGifObj ) this.daGifObj.stop();
				}
				
				da( this.iIconObj ).fadeOut( 300 );
			}
			else
				this.iIconObj.style.display = "none";
				
		},
		
		reSize: function(){
			var setting = this.setting,
					wText, hText;
					
			da(this.iObj).width( setting.width );
			da(this.iObj).height( setting.height );
			
			wText = da(this.iObj).width();
//			hText = da(this.iTextObj).height();
			
			if( setting.isTextarea ) 
				da(this.iTextObj).width( "100%" );
			else 
				da(this.iTextObj).width( wText - ( setting.isTextarea ? 2 : 22) );
				
			da(this.iTextObj).height( setting.height );
		}
		
	};

	daInput.fnStruct.init.prototype = daInput.prototype;			//模块通过原型实现继承属性

	/**功能小图标样式top值对照表
	*/
	daInput.IconTopHash = {
		edit: "0px",
		dialog: "-16px",
		date: "-32px",
		list: "-48px"
	};

	/**daInput全局缓存
	*/
	daInput.daInputCache = [];
	
	/**缓存daInput控件对象
	* params {daInput} obj 下拉控件daInput对象
	*/
	daInput.pushCache = function( obj ){
		var cache = daInput.daInputCache;
		cache.push({
			id: obj.sId,
			obj: obj
		});
		
	};
	
	/**查找相应id的daInput控件对象
	* params {string} id 下拉控件对象id
	*/
	daInput.getInput = function( id ){
		var cache = daInput.daInputCache;
		
		if( "string" === typeof id ){
			id = id.replace( "#", "" );
			
			for( var i=0,len=cache.length; i<len; i++ ){
				if( id == cache[i].id ) return cache[i].obj;
			}
			
			return null;
		}
		else if( da.isFunction( id ) ){
			da.each( cache, function( idx, obj ){
				return id.call( this.obj, this.id );
			});
			
			return cache;
		}
		
		
	};
	
	inlineEvents = [ "mousedown", "mouseup", "click", "dblclick", "keyup", "change" ];
	
	/**将普通input 转换为daInput控件
	*/
	daInput.toInput = function( objInput ){
		var eventObjs = {}, eventType = "",
				style = objInput.style.cssText,
				w = da( objInput ).css("width"),
				h = da( objInput ).css("height");
				
		for( var n=0,len=inlineEvents.length; n<len; n++ ){						//copy写在input HTML代码上的内嵌事件定义
				eventType = "on" + inlineEvents[n];
				
				if( da.isFunction( objInput[ eventType ] ) )
					eventObjs[ inlineEvents[n] ] = objInput[ eventType ];
		}
		
		var params = {
			id: objInput.id,
			target: objInput,
			parent: objInput.parentNode,
			isTextarea: "TEXTAREA" === objInput.tagName
		};

		params = da.extend( {}, params, eventObjs );
		
		if( w && "auto" !== w ) params.width = w;
		if( h && "auto" !== h ) params.height = h;
		if( objInput.className ) params.className = objInput.className;
		if( style ) params.style = style;

		if( daInput.isSelect(objInput) )																	//判断daInput功能类型
			params.icon = "list";
		else if( daInput.isDate(objInput) )
			params.icon = "date";
		else if( daInput.isDialog(objInput) )
			params.icon = "dialog";
		else
			params.icon = "edit";
		
		
		var daInputObj = daInput( params );																//生成daButton对象并替换input控件
		
//		objInput.parentNode.replaceChild( daInputObj.iObj, objInput );
		
	};
	
	/**判断是否是对话框类型
	*/
	daInput.isDialog = function( objInput ){
		var fn = objInput.getAttribute("source");
		return fn ? true : false;
	};
	
	/**判断是否是日期类型
	*/
	daInput.isDate = function( objInput ){
		var date = objInput.getAttribute("onvalid");
		return date && 0 <= date.indexOf("isdate") ? true : false;
	};
	
	/**判断是否是下拉选择类型
	*/
	daInput.isSelect = function( objInput ){
		var source = objInput.getAttribute("source");				//source="auto_code&ctg=0403"
		return source && 0 <= source.indexOf("auto_code") ? true : false;
		
	};
	
	
	/**不同类型输入框，执行不同功能代码
	*/
	daInput.run = {
		edit: function(){
			//TODO:暂时保留
		},
		
		list: function( obj, isShow ){
			if( obj.daListObj ){
				isShow ? obj.daListObj.show() : obj.daListObj.hide();
			}
			else if( isShow ){
				if( "undefined" === typeof daList ) return;																	//创建daList对象
				obj.daListObj = daList({
					target: obj.iObj,
					width: da( obj.iObj ).width(),
					click: function( res ){
						obj.iTextObj.value = res.text;
						obj.iTextObj.setAttribute( "code", res.value );
						da( obj.iTextObj ).change();
						obj.iTextObj.select();
						this.hide();
					}
				});

				daInput.getListSource( obj.iTextObj.getAttribute( "source" ), function( data1 ){
					obj.daListObj.setList( data1 );
				});
			}
		},
		
		date: function( obj, isShow ){
			var d = obj.iTextObj.getAttribute( "onvalid" ) || obj.iTextObj.getAttribute( "source" );
      if ( 0 > d.indexOf("isdate(") ) return;
      
			if( obj.daCalendarObj ){
				isShow ? obj.daCalendarObj.show() : obj.daCalendarObj.hide();
			}
			else if( isShow ){																												//创建daCalendar对象
				obj.daCalendarObj = daCalendar({
					target: obj.iObj,
					isSelector: true,
					cellEvent: {
						"click": function( evt ){
								obj.iTextObj.value = obj.daCalendarObj.getDate( this ).date.format("yyyy-MM-dd");
								obj.iTextObj.select();
								obj.daCalendarObj.hide();
						}
					},
					clickToday: function(){
						obj.iTextObj.value = (new Date()).format("yyyy-MM-dd");
						obj.iTextObj.select();
						obj.daCalendarObj.hide();
					},
					clickPrev: function(){
						if ( obj.TimerPadHide ) da.clearTimer( obj.TimerPadHide );								//如果有一个隐藏功能面板的timer正在监听，就中止这个timer
						obj.daCalendarObj.show();
					},
					clickNext: function(){
						if ( obj.TimerPadHide ) da.clearTimer( obj.TimerPadHide );								//如果有一个隐藏功能面板的timer正在监听，就中止这个timer
						obj.daCalendarObj.show();
					},
					clickRefresh: function(){
//						if ( obj.TimerPadHide ) da.clearTimer( obj.TimerPadHide );								//如果有一个隐藏功能面板的timer正在监听，就中止这个timer
//						obj.daCalendarObj.hide(true);
					}
				});
				
			}
		},
		
		dialog: function( obj ){
			var fn = obj.iTextObj.getAttribute( "source" ) || obj.iTextObj.getAttribute( "onvalid" );
			if( fn ){
				fn = fn.replace( /\(this/g, "( arguments[0]" );
				fn = new Function( fn );
				fn( obj.iTextObj );
			}
		}
	};
	
	
	return daInput;
})();


win.daInput = daInput;


////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input:text,textarea").each(function( idx, obj ){
//		daInput.toInput( this );																		//转换
//	
//	});
//
//});

})(window);


/**异步获取下拉选项数据源
*/
daInput.getListSource = function( source, fn ){
		if( !source ) return;
		
		if( 0 === source.indexOf("{") ){																					//静态常量
			var itemList = {}, item;
			source = source.replace( /{|}/g, "" );
			source = source.split( "," );
			
			for( var i=0,len=source.length; i<len; i++){
				item = source[i].split( ":" );
				itemList[ item[0] ] = item[1];
			}
			
			fn( itemList );
		}
		else{
			da.ajax({																																//异步访问常量
					url: "/sys/aspx/execsql.aspx?sqlname="+ source +"&xml=1",
					type: 'GET',
					error: function( responseObj, errorMsg, exceptionObj ){
//						alert(errorMsg);
					},
					success: function( data1, state, responseObj ){
						var ds = da.xml2json( data1 ).ds1;
						if( ds ){
							data1 = {};
							for( var i=0,len=ds.length; i<len; i++ ){
								data1[ ds[i].bc_name ] = ds[i].bc_name1;
							}
							fn( data1 );
						}
					}
			});
		}
			
};

//if( "undefined" !== typeof jQuery && jQuery.fn.Autocomplete ){
//	/**重载老版本iAuto函数
//	*/
//	jQuery.fn.Autocomplete = function( setting ){
//		this.each(function( i, obj ){
//			daInput.toInput( this );												//转换为daInput控件
//		});
//	};
//}