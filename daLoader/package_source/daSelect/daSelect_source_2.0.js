/*
	author: danny.xu
	date:	2011-2-19
	discription: daSelect自定义下拉框
*/
( function( win, undefined ){
var doc = win.document;

var daSelect = (function(){

	var daSelect = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//遍历和查找daSelect控件的高级快捷用法
			return daSelect.getSelect( setting );
			
		return new daSelect.fnStruct.init( setting );
	};
	
	daSelect.fnStruct = daSelect.prototype = {
		sId: 0,										//唯一序号
		sObj: null,
		sParentObj: null,
		
		sBody: null,
		sContainerObj: null,
		sClientObj: null,
		
		sInput: null,
		sButtonObj: null,
		
		daListObj: null,
		
		setting: {
			parent: "",												//daSelect 父元素id
			id: "",
			
			width: 80,
			height: 22,
			
			color: "#999,#666",								//用户自定义风格颜色[ 正常，高亮 ]RGB用逗号分隔
			listWidth: 0,
			listHeight: 220,									//下拉面板的高度
			tip: "请选择",										//默认提示项
			icon: "",													//用户自定义按钮图标HTML,默认为向下箭头特殊符号
			list: null,												//下拉框可选项，格式如：{北京:01,上海:02}
			onlyOne: true,										//单选
			edit: false,											//是否可编辑，默认为false
			off: false,												//是否可用，默认为false
			
			zIndex: 9999,											//下拉列表浮动的层级
			
			css: {
				daSelect: "daButton",
				normal: "tb_daButton",
				focus: "tb_daButton2",
				
				input: "daSelectInput",
				button: "daSelectBt"
			},
			
			change: null
			
		},
		
		sArrColor: null,										//当前颜色风格
		maxheight: 100,
		
		version: "daSelect v1.0 danny.xu 2011-2-19",
		
		//初始化函数
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );

			this.sParentObj = da( setting.parent );
			this.sParentObj = 0 < this.sParentObj.dom.length ? this.sParentObj.dom[0] : doc.body;
			
			this.sArrColor = setting.color.split(",");
			
			if( setting.id )
				this.sId = setting.id;
			else 
				//this.daBtId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daSelect_" + this.sId ) ) this.sId++;						//保证id 唯一性
			
			this.create();
			this.reSize();
			this.createList();
			this.bindEvent();

			daSelect.pushCache( this );
		},
		
		
		create: function(){
			var setting = this.setting,
					sId = this.sId,
					sObj, objInput, objButton;
			
			sObj = doc.createElement("span");
			sObj.id = setting.id ? sId : "daSelect_" + sId;
			sObj.className = setting.css.daSelect;
			sObj.style.display = "inline-block";
//			sObj.style.position = "relative";
//			sObj.style.border = "1px solid #f00";
			
			sObj.innerHTML = [
					'<table id="daSelectTable_', sId,'" class="tb_daButton" border="0" cellspacing="0" cellpadding="0">',
						'<tr>',
							'<td class="tl"></td>',
							'<td class="top"></td>',
							'<td class="tr"></td>',
						'</tr>',
						'<tr>',
							'<td class="left"></td>',
							'<td class="mid">',
								'<div id="daSelectContainer_', sId,'" class="container" >',
										'<div id="daSelectClient_', sId,'" class="client" >',
										'</div>',
								'</div>',
							'</td>',
							'<td class="right"></td>',
						'</tr>',
						'<tr>',
							'<td class="bl"></td>',
							'<td class="bottom"></td>',
							'<td class="br"></td>',
						'</tr>',
					'</table>',
			].join("");
			
			this.sObj = sObj;
			this.sParentObj.insertBefore( sObj );

			this.sBody = doc.getElementById( "daSelectTable_"+ sId );
			this.sContainerObj = doc.getElementById( "daSelectContainer_"+ sId );
			this.sClientObj = doc.getElementById( "daSelectClient_"+ sId );
			
			this.sClientObj.style.textAlign = "left";													//因为是借用的daButton的样式表，所以需要纠正一些样式
			this.sClientObj.style.padding = 0;
			
			
			objInput = doc.createElement("INPUT");
			objInput.type = "text";
			objInput.value = setting.tip;
			objInput.id = "daSelectInput_" + sId;
			objInput.className = setting.css.input;
			this.sInput = objInput;
			this.sClientObj.insertBefore( objInput );
			if( !setting.edit ){
				objInput.setAttribute( "readOnly", !setting.edit );
				objInput.style.cursor = "pointer";
			}
			else{
				objInput.style.borderWidth = "1px";
				objInput.style.background = "#f7f7f7";
			}
			
			if( setting.off )
				objInput.disabled = "disabled";
			
			objInput.setAttribute( "code", "");
			
			
			objButton = doc.createElement("A");
			objButton.className = setting.css.button;
			//objButton.href = "javascript:void(0)";
			objButton.innerHTML = setting.icon;														  //向下箭头
			this.sButtonObj = objButton;
			this.sClientObj.insertBefore( objButton );
			
		},
		
		
		/**加载列表
		*/
		createList: function(){
			var context = this,
					setting = this.setting;
			
			if( this.daListObj ) this.daListObj.remove();
			
		 	this.daListObj = daList({
				target: this.sBody,
				list: setting.list,
				width: setting.listWidth || setting.width,
				height: setting.listHeight,
				click: function( res ){
					context.value( res.value );
					context.hideList();
				}
		 	});
			
			this.reSize();
			this.hideList( true );
			
		},
		

		
		//设置下拉按钮尺寸
		/*
			w: 宽度
			h: 高度
		*/
		reSize: function( w, h ){
			var setting = this.setting;
			
			w = ( w || setting.width ).toString();
			h = ( h || setting.height ).toString();

			w = w.replace("px","");
			h = h.replace("px","");
			
			w = parseInt( w, 10 );
			h = parseInt( this.maxheight < setting.height ? this.maxheight : setting.height, 10 );							//纠正高度，不能高于样式最大支持高度
			
			this.sObj.style.width = (w+4) + "px";
			this.sContainerObj.style.width = w + "px";
			this.sClientObj.style.width = w + "px";
			if( setting.edit )
				this.sInput.style.width = (w-29) + "px";											//容器宽度 减去按钮宽度,可编辑还要再多减input控件2px的边框
			else
				this.sInput.style.width = (w-27) + "px";
			
			this.sObj.style.height = (h+4) + "px";
			this.sContainerObj.style.height = h + "px";
			this.sClientObj.style.height = h + "px";
			this.sInput.style.height = (h-2) + "px";
			if( setting.onlyOne )
				this.sInput.style.lineHeight = h + "px";
			
			this.sButtonObj.style.height = h + "px";

			if( !this.daListObj ) return;
			this.daListObj.setPos( this.sBody );
			
		},
		
		
		//绑定事件
		bindEvent: function(){
			var context = this;
			
			da( this.sObj ).bind( "mousedown", function( evt ){
				evt.stopPropagation(); 						//阻止事件冒泡
			});
			
			da( this.sButtonObj ).bind( "click", function(){
				context.showList();
				
			});
			
			da( this.sInput ).bind( "click", function(){
				context.showList();
				
			}).bind( "change", function(){
//				alert( "change:"+this.value )
				context.text( this.value );
			
			});

			if( "undefined" === typeof daKey ) return;													//按键事件
			daKey({
				target: this.sInput,
				keydown: function( key, isCtrl, isAlt, isShift ){
					if( !context.daListObj ) return;

					if( "Down Arrow" === key ){
						context.showList( true );
						context.daListObj.next();
					}
					else if( "Up Arrow" === key ){
						context.showList( true );
						context.daListObj.prev();
					}
					else if( "Enter" === key ){
//						var res = context.daListObj.get();
//						if( res ){
//							context.sInput.value = res.text;
//							context.sInput.setAttribute( "code", res.value );
//						}
						context.value( context.daListObj.value() );
						context.hideList();
						
					}
				}
			});
		},
		
		/**更新数据源
		*/
		setList: function( list ){
			if( !list || !da.isPlainObj( list ) ) return;
			
			this.setting.list = list;
			this.createList();
			
			var code = this.sInput.getAttribute("code");
			
			if( code )
				this.value( code );
			else
				this.text( this.sInput.value );
			
			return this;
		},
		
//		/**追加可选项
//		*/
//		appendItem: function( text, value ){
//			var list = this.setting.list;
//			
//			list[ text ] = value;
//			
//		},

		//获取值
		/*
		*/
		get: function(){
			var val = this.sInput.value,
					txt = this.sInput.getAttribute( "code" );
					
			return {
				value: val,
				text: txt
			};
		},

		//设置按钮颜色风格
		/*
			sColor: 用户自定义风格颜色[ 正常，鼠标移上，按下 ]RGB用逗号分隔
		*/
		color: function( sColor ){
			this.setting.color = sColor;
			this.sArrColor = sColor.split(",");
			
		},
		
		//启动、关闭daSelect控件
		/*
			on: 是否禁用daSelect控件
		*/
		off: function( on ){
			on = da.firstValue( on, false );
			this.setting.off = !!on;
			
			if( this.setting.off )
				this.sInput.disabled = "disabled";
			else
				this.sInput.removeAttribute( "disabled" );
			
		},
		
		/**隐藏按钮
		*/
		hide: function(){
			if( "undefined" !== daFx )
				da(this.sObj).fadeOut( 300 );
			else
				this.sObj.style.display = "none";
		},
		
		
		/**显示按钮
		*/
		show: function(){
			if( "undefined" !== daFx )
				da(this.sObj).fadeIn( 300 );
			else
				this.sObj.style.display = "block";
		},
		
		/**选项改变事件
		*/
		change: function( value, text ){
			try{
				if( this.setting.change )
					this.setting.change.call( this.sInput, value, text, this);
			}catch(e){};
			
		},
		

		/**显示列表
		* params {boolean} isForce 是否不需要验证daSelect当前值，直接关闭
		*/
		showList: function( isForce ){
			if( this.setting.off ) return;
			
			if( !this.daListObj ) this.createList();
			this.daListObj.show();
			
			this.reSize();
			this.sBody.className = this.setting.css.focus;
			
			if( "undefined" === typeof daGif || isForce ){
				this.sButtonObj.style.backgroundPositionX = "-88px";
			}
			else{
				daGif({
	 				target: this.sButtonObj,
//	 				src: "images/daSelectIcon.png",
	 				all: 5,
	 				speed: 25,
	 				top: "50%",
	 				width: 22,
	 				height: da( this.sButtonObj ).height()
	 				
	 			});
			}
			
			daSelect.openList[ this.setting.id ? this.sId : "daSelect_" + this.sId ] = this;
		},
		
		/**隐藏列表
		* params {boolean} isForce 是否不需要验证daSelect当前值，直接关闭
		*/
		hideList: function( isForce ){
			if( this.daListObj ){
				this.daListObj.text( this.sInput.value );								//验证值
				this.daListObj.hide( isForce );
			}		
			
			if( this.setting.css.focus === this.sBody.className ){
				this.sBody.className = this.setting.css.normal;
				
				if( "undefined" === typeof daGif || isForce ){
					this.sButtonObj.style.backgroundPositionX = "0px";
					
				}
				else{
					daGif({
		 				target: this.sButtonObj,
	//	 				src: "images/daSelectIcon.png",
		 				all: 5,
		 				speed: 10,
		 				top: "50%",
		 				width: 22,
		 				height: da( this.sButtonObj ).height(),
		 				isBack: true
		 				
		 			});
				}
			}
			
			delete daSelect.openList[ this.setting.id ? this.sId : "daSelect_" + this.sId ];
		},

		/**释放内存资源
		*/
		release: function(){
			this.sArrColor = null;
			this.sObj = null;
			this.sParentObj = null;
			
			this.sBody = null;
			this.sContainerObj = null;
			this.sClientObj = null;
			
			this.sInput = null;
			this.sButtonObj = null;
			
			this.setting.list = null;
			this.setting.css = null;
			this.setting.change = null;
			this.setting = null;
			
		},
		
		
		/**移除下拉对象( 防止内存泄露一定要用这个API哟！ )
		*/
		remove: function(){
			delete daSelect.openList[ this.setting.id ? this.sId : "daSelect_" + this.sId ];
			
			if( this.daListObj ){
				this.daListObj.remove();
				this.daListObj = null;
			}
			
			da( this.sObj ).remove();
			
			this.release();
		}
		
	};


	//扩展daSelect控件的value和text设置函数
	da.each([ "value", "text" ],function( idx, name ){
		daSelect.fnStruct[ name ] = function( val ){
			if( "text" === name && undefined === val ) return this.sInput.value;
			if( "value" === name && undefined === val ) return this.sInput.getAttribute( "code" );
			
			var context = this,
					sInput = this.sInput,
					setting = this.setting,
					oldText = sInput.value,
					oldValue = sInput.getAttribute( "code" );
			
			if( "text" === name ) {																		//不允许编辑，重置为默认提示信息
//				if( !setting.edit ) 
//					sInput.value = setting.tip;
//				else
//					sInput.value = val;
				
				sInput.value = val;
				sInput.setAttribute( "code", "" );
			}
			
			if( "value" === name ) {
//				if( !setting.edit ) 
//					sInput.setAttribute( "code", "" );
//				else
//					sInput.setAttribute( "code", val );
				
				sInput.setAttribute( "code", val );
				sInput.value = "";
				
			}
			
			var res = this.daListObj[ name ]( val );
			if( !res ) {																										//没有匹配到，就设置为第一个
				res = this.daListObj.index(0);
			};
			
			if( res ){
				sInput.value = res.text;
				sInput.setAttribute( "code", res.value );
				
				if( oldText !== res.text || oldValue !== res.value ){						//值发生变化，触发change回调
					this.change( res.value, res.text );
				}
			}
			
			return res;
		}
	});

	
	daSelect.fnStruct.init.prototype = daSelect.prototype;

	daSelect.openList = {};

	/**收起下拉面板
	* params {daSelect|String} obj 下拉控件对象id或对象，无参默认为收起页面所有下拉面板
	* params {boolean} isForce 是否不需要验证daSelect当前值，直接关闭
	*/
	daSelect.hideList = function( isForce, obj ){
		if( "string" === typeof obj ){										//obj为string类型的daSelect对象id
			obj = daSelect.getSelect( obj );
			if( !obj ) return false;
			
		}

		if( obj && obj.hideList ){												//obj为daSelect对象
			obj.hideList( isForce );
			return true;
		}

		var openList = daSelect.openList;									//无参数传入，收起页面所有下拉面板
		for( var id in openList ){
			openList[id].hideList( isForce );
		}
		return true;

	};
	
	//将普通input select类型的按钮 转换为daSelect类型
	/*
		selectObj: 用户传入的按钮对象
	*/
	daSelect.toSelect = function( selectObj ){
		var daObj = da( selectObj ),
				daSelectObj,
				itemList, item, tip="",
				w = parseInt( daObj.css("width"), 10 ),
				h = parseInt( daObj.css("height"), 10 ),
				listWidth =  parseInt( selectObj.getAttribute( "listWidth" ), 10),
				listHeight = parseInt( selectObj.getAttribute( "listHeight" ), 10),
				fnChange = selectObj.getAttribute( "change" ),
				isOff = !!selectObj.getAttribute( "disabled" ),
				isEdit = !!selectObj.getAttribute( "edit" );

		if( "INPUT" === selectObj.tagName ){																				//组织可选项列表
			tip = selectObj.value;
			itemList = {};
			
			var list = selectObj.getAttribute( "list" );
			list = list.replace( /{|}/g, "" );
			list = list.split( "," );
			
			for( var i=0,len=list.length; i<len; i++){
				item = list[i].split( ":" );
				itemList[ item[0] ] = item[1];
			}
			
		}
		else if( "SELECT" === selectObj.tagName ){
			var ops = selectObj.children;
			if( 0 < ops.length ){
					itemList = {};
					
					da( ops ).each(function(){
						itemList[ this.innerHTML ] = this.value;
						
						if( this.selected )
							tip = this.innerHTML;
					});
			}
			
		}
		
		try{																																				//提取行内嵌事件
			fnChange = new Function( fnChange + '.apply( this, arguments);' )
		}
		catch(e){
			fnChange = null;
			alert("daSelect温馨提示: "+ selectObj.id +"控件的change参数指定的回调函数名有误。");
		}
		
		var params = {																															//构建daSelect初始化参数
			id: selectObj.id,
			parent: selectObj.parentNode,
			tip: tip,
			edit: isEdit,
			off: isOff,
			change: fnChange
		};
		
		if( w ) params.width = w;
		if( h ) params.height = h;
		if( itemList ) params.list = itemList;
		if( listWidth ) params.listWidth = listWidth;
		if( listHeight ) params.listHeight = listHeight;
		
		daSelectObj = daSelect( params );																						//生成daSelect对象并替换input控件
		
		selectObj.parentNode.replaceChild( daSelectObj.sObj, selectObj );						//替换被封装的旧的dom对象
		
	};

	/**daSelect全局缓存
	*/
//	daSelect.daSelectCache = [];
	
	/**缓存daSelect控件对象
	* params {daSelect} obj 下拉控件daSelect对象
	*/
	daSelect.pushCache = function( obj ){
		da.data( obj.sObj, "daSelectObj", obj );
	
//		var cache = daSelect.daSelectCache;
//		cache.push({
//			id: obj.sId,
//			obj: obj
//		});
		
	};
	
	/**查找相应id的daSelect控件对象
	* params {string} id 下拉控件对象id
	*/
	daSelect.getSelect = function( id ){
		var selectObj = da(id);
		if( 0 >= selectObj.dom.length ) return null;
		return da.data( selectObj.dom[0], "daSelectObj" );
		
//		var cache = daSelect.daSelectCache;
//		
//		if( "string" === typeof id ){
//			id = id.replace( "#", "" );
//			
//			for( var i=0,len=cache.length; i<len; i++ ){
//				if( id == cache[i].id ) return cache[i].obj;
//			}
//			
//			return null;
//		}
//		else if( da.isFunction( id ) ){
//			da.each( cache, function( idx, obj ){
//				return id.call( this.obj, this.id );
//			});
//			
//			return cache;
//		}
		
	};
	
	
	return daSelect;

})();
	

win.daSelect = daSelect;



////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input,select").each(function( idx, obj ){
//		if( "INPUT" === this.tagName ){
//			if( this.getAttribute( "list" ) )													//过滤出属于button类型的input控件
//				daSelect.toSelect( this );															//转换
//		}
//		else{
//			daSelect.toSelect( this );																//转换
//			
//		}
//	});
//	
//});

da( doc ).bind( "mousedown", function( evt ){
	daSelect.hideList();
});

} )( window );