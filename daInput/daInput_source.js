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
			return daInput.get( setting );
			
		return new daInput.fnStruct.init( setting );
	};

	daInput.fnStruct = daInput.prototype = {
		version: "daInput v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",
		
		id: 0,
		obj: null,
		parentObj: null,
		
		inputObj: null,
		iconObj: null,
		
		daGifObj: null,
		
		setting: {
			target: null,
			parent: null,
			id: "",
			
			width: "160px",
			height: "24px",
			
			style: "",
			className: "editBox",
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
			
			this.parentObj = da( setting.parent );
			this.parentObj = 0 < this.parentObj.dom.length ? this.parentObj.dom[0] : doc.body;
			
			if( setting.id )
				this.id = setting.id;
			else 
				//this.id = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daInput_" + this.id ) ) this.id++;						//保证id 唯一性
			
			
			this.create();
			this.bindEvent();
			this.reSize();
			
			daInput.cache( this );
			
		},
		
		create: function(){
			var setting = this.setting,
				id = "daInput_" + this.id,
				obj, inputObj, iconObj;
					
			obj = doc.createElement("span");
			obj.id = id;
			obj.className = [ setting.css.daInput, setting.className ].join(" ");
			if( setting.style ) obj.style.cssText = setting.style;
			this.parentObj.insertBefore( obj, setting.target );
			this.obj = obj;
			
			if( setting.target && setting.target.nodeType ){
				obj.insertBefore( setting.target );
				this.inputObj = setting.target;
			}
			else{
				if( setting.isTextarea )
					inputObj = doc.createElement("textarea");
				else
					inputObj = doc.createElement("input");
					
				inputObj.id = setting.id ? setting.id : id + "_text";
				if( setting.isDisabled ) inputObj.setAttribute( "disabled", "disabled" );
				if( setting.isReadonly ) inputObj.setAttribute( "readonly", "readyonly" );
				if( setting.source ) inputObj.setAttribute( "source", setting.source );
				if( setting.invalid ) inputObj.setAttribute( "invalid", setting.invalid );
				if( setting.onvalid ) inputObj.setAttribute( "onvalid", setting.onvalid );
				
				obj.insertBefore( inputObj );
				this.inputObj = inputObj;
			}
			
			if( !setting.isTextarea ){
				iconObj = doc.createElement("span");
				iconObj.id = id + "_icon";
				iconObj.className = setting.icon;
				iconObj.style.cssText = "display:none";
	
				if( setting.image )
					iconObj.style.backgroundImage = "url("+ setting.image +")";
				
				obj.insertBefore( iconObj );
				this.iconObj = iconObj;
			}
			
		},
		
		bindEvent: function(){
			var context = this,
					setting = this.setting;
			
			if( !setting.isTextarea ){
					da( this.iconObj ).bind( "click", function(){										//小图标对象单击事件
						if( da.isFunction( context.setting.click ) )
							context.setting.click.call( this );
						
						daInput.run[ setting.icon ]( context, true );
					});
			}
			
			da( this.obj ).bind( "dblclick", function(){
				if( da.isFunction( context.setting.dblclick ) )									//daInput双击事件事件
					context.setting.dblclick.call( this );
				daInput.run[ setting.icon ]( context, true );
				
			}).bind( "click", function(){
				context.reSize();
				if( !context.setting.isDisabled ){
					try{
						context.inputObj.focus();
					}catch(e){};
				}
			});
			
			
			da( this.inputObj ).bind( "focus click", function( evt ){					//输入框对象绑定事件
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
				target: this.inputObj,
				keydown: function( key, isCtrl, isAlt, isShift ){
					if( da.isFunction( setting.keyup ) )
						setting.keyup.call( context.inputObj, key, isCtrl, isAlt, isShift );
					
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
										context.inputObj.value = res.text;
										context.inputObj.setAttribute( "code", res.value );
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
			this.obj.style.backgroundColor = this.setting.hoverColor;
			this.reSize();
			
			if( this.setting.isTextarea ) return;
			
			if( "undefined" !== typeof daFx ){
				da( this.iconObj ).stop(true,true);
				
				if( "undefined" !== typeof daGif ){
					this.iconObj.style.display = "inline-block";
					
					if( this.daGifObj ){
						this.daGifObj.play();
					}
					else{
						this.daGifObj = daGif({
							target: this.iconObj,
							all: 5,
							speed: 15,
							top: daInput.IconTopHash[ this.setting.icon ],
							width: 16,
							height: 16
						});
					}
				}
				else{
					da( this.iconObj ).fadeIn( 300 );
				}
			}
			else
				this.iconObj.style.display = "block";
				
		},
		
		/**隐藏功能小图标
		*/
		iconHide: function(){
			this.obj.style.backgroundColor = "";
				
			if( this.setting.isTextarea ) return;
			
			if( "undefined" !== typeof daFx ){
				da( this.iconObj ).stop(true,true);
				
				if( "undefined" !== typeof daGif ){
					if( this.daGifObj ) this.daGifObj.stop();
				}
				
				da( this.iconObj ).fadeOut( 300 );
			}
			else
				this.iconObj.style.display = "none";
				
		},
		
		reSize: function(){
			var setting = this.setting,
					wText, hText;
					
			da(this.obj).width( setting.width );
			da(this.obj).height( setting.height );
			
			wText = da(this.obj).width();
//			hText = da(this.inputObj).height();
			
			if( setting.isTextarea ) 
				da(this.inputObj).width( "100%" );
			else 
				da(this.inputObj).width( wText - ( setting.isTextarea ? 2 : 22) );
				
			da(this.inputObj).height( setting.height );
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

	/**缓存daInput控件对象
	* params {daInput} obj 下拉控件daInput对象
	*/
	daInput.cache = function( obj ){
		da._data( obj.inputObj, "daInput", obj );
		
	};
	
	/**查找相应id的daInput控件对象
	* params {string} id 下拉控件对象id
	*/
	daInput.get = function( id ){
		if( "string" === typeof id && 0 !== id.indexOf("#") ) id = "#" + id;				//修正id未加"#"
		
		var obj = da(id);
		if( 0 >= obj.dom.length ) return null;
		return da._data( obj.dom[0], "daInput" );
		
	};
	
	inlineEvents = [ "mousedown", "mouseup", "click", "dblclick", "keyup", "change" ];
	
	/**将普通input 转换为daInput控件
	*/
	daInput.convert = function( objInput ){
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
		
//		objInput.parentNode.replaceChild( daInputObj.obj, objInput );
		
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
					target: obj.obj,
					width: da( obj.obj ).width(),
					click: function( res ){
						obj.inputObj.value = res.text;
						obj.inputObj.setAttribute( "code", res.value );
						da( obj.inputObj ).change();
						obj.inputObj.select();
						this.hide();
					}
				});

				daInput.getListSource( obj.inputObj.getAttribute( "source" ), function( data1 ){
					obj.daListObj.setList( data1 );
				});
			}
		},
		
		date: function( obj, isShow ){
			var d = obj.inputObj.getAttribute( "onvalid" ) || obj.inputObj.getAttribute( "source" );
      if ( 0 > d.indexOf("isdate(") ) return;
      
			if( obj.daCalendarObj ){
				isShow ? obj.daCalendarObj.show() : obj.daCalendarObj.hide();
			}
			else if( isShow ){																												//创建daCalendar对象
				obj.daCalendarObj = daCalendar({
					target: obj.obj,
					isSelector: true,
					cellEvent: {
						"click": function( evt ){
								obj.inputObj.value = obj.daCalendarObj.getDate( this ).date.format("yyyy-MM-dd");
								obj.inputObj.select();
								obj.daCalendarObj.hide();
						}
					},
					clickToday: function(){
						obj.inputObj.value = (new Date()).format("yyyy-MM-dd");
						obj.inputObj.select();
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
			var fn = obj.inputObj.getAttribute( "source" ) || obj.inputObj.getAttribute( "onvalid" );
			if( fn ){
				fn = fn.replace( /\(this/g, "( arguments[0]" );
				fn = new Function( fn );
				fn( obj.inputObj );
			}
		}
	};
	
	
	return daInput;
})();


win.daInput = daInput;


////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input:text,textarea").each(function( idx, obj ){
//		daInput.convert( this );																		//转换
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
//			daInput.convert( this );												//转换为daInput控件
//		});
//	};
//}