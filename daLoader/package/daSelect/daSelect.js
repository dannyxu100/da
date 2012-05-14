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
		sListObj: null,
		sItemObjs: null,
		sButtonObj: null,
		
		setting: {
			parent: "",												//daSelect 父元素id
			id: "",
			
			width: "80px",
			height: "22px",
			
			color: "#999,#666",								//用户自定义风格颜色[ 正常，高亮 ]RGB用逗号分隔
			listWidth: "",
			listHeight: "220px",							//下拉面板的高度
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
				button: "daSelectBt",
				
				shadow: "daShadow",
				list: "daList",
				item: "item",
				hover: "itemHover",
				selected: "item2"
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
			if( setting.list ) this.createList();
			else this.reSize();
			this.bindEvent();
			
			daSelect.pushCache( this );
		},
		
		
		create: function(){
			var setting = this.setting,
					sId = this.sId,
					sObj, objInput, objButton;
			
			sObj = doc.createElement("span");
			sObj.id = setting.id ? "daSelect_" + setting.id : "daSelect_" + sId;
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
			this.sParentObj.insertBefore( sObj, null );

			this.sBody = doc.getElementById( "daSelectTable_"+ sId );
			this.sContainerObj = doc.getElementById( "daSelectContainer_"+ sId );
			this.sClientObj = doc.getElementById( "daSelectClient_"+ sId );
			
			this.sClientObj.style.textAlign = "left";													//因为是借用的daButton的样式表，所以需要纠正一些样式
			this.sClientObj.style.padding = 0;
			
			
			objInput = doc.createElement("INPUT");
			objInput.type = "text";
			objInput.value = setting.tip;
			objInput.id = setting.id || "daSelectInput_" + this.sId;
			objInput.className = setting.css.input;
			this.sInput = objInput;
			this.sClientObj.insertBefore( objInput, null );
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
			this.sClientObj.insertBefore( objButton, null );
			
		},
		
		
		/**加载列表
		*/
		createList: function(){
			var context = this,
					setting = this.setting,
					list = setting.list,
					sItemObjs, objList, objItem, nItem=0,
					w, h;
			
			objList = doc.createElement("DIV");
			objList.className = [ setting.css.list, setting.css.shadow ].join(" ");
			objList.style.zIndex = setting.zIndex;
			
			objList.innerHTML = '<div style="font-size:12px; font-weight:bold; padding:3px; color:#444">数据加载..</div>';
			if( list )
				objList.innerHTML = "";

				
			if( setting.listWidth )															//列表宽度
				w = setting.listWidth;
			else 
				w = setting.width;
				
			var tmpCnt = doc.createElement("DIV");							//创建可选项列表容器
			tmpCnt.style.cssText = "background:#f00;";
			
			sItemObjs = [];
			for( var name in list ){														//遍历可选项数据缓存，创建可选项dom对象
				objItem = doc.createElement("A");
				objItem.className = setting.css.item;
				objItem.href = "javascript:void(0);";
				objItem.setAttribute( "code", list[name] );
				objItem.innerHTML = name;
				da(objItem).bind( "click", function(evt){					//给可选项绑定事件
					context.click( this );
					
				}).bind( "mouseover", function(evt){
					if( setting.css.item === this.className )
						this.className = setting.css.hover;
					
				}).bind( "mouseout", function(evt){
					if( setting.css.hover === this.className )
						this.className = setting.css.item;
						
				});
				da( objItem ).width( parseInt( w, 10) -14 );			//列表宽度,还要减去item样式的边框值14px
					
				sItemObjs.push( objItem );												//缓存创建出来的可选项dom对象，便于后面使用
				tmpCnt.insertBefore( objItem, null );
				
				nItem++;
			}
			this.sItemObjs = sItemObjs;

			if( 10 < nItem )
				h = setting.listHeight;
			else if( 0 === nItem ){
				w = setting.width;
				h = 26;
			}
			else
				h = nItem*22;
				
			da( objList ).width( w );
			da( objList ).height( h );
			
			this.sListObj = objList;
			doc.body.insertBefore( objList, null );

			daFrame({																						//调用daFrame将tmpCnt作为内容填入daSelect的list对象中
				width: w,
				height: h,
				border: 0,
				parent: objList,
				html: tmpCnt
			});
			
			this.reSize();
			this.hideList( true );
			
			da( this.sListObj ).bind( "mousedown", function( evt ){
				evt.stopPropagation(); 						//阻止事件冒泡
			});
			
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

			if( !this.sListObj ) return;
			
			var display = this.sListObj.style.display;
			if( "none" === display ) this.sListObj.style.display = "block";
			
			var pos = da( this.sBody ).offset();
			if( da.browser.ie ){																					//校正list面板的位置
				if( da(win).height()/2 < pos.top )
					pos.top = pos.top - da( this.sListObj ).height()+2;
				else
					pos.top = pos.top+ da( this.sObj ).height() -2;
					
				if( da(win).width()/2 < pos.left )
					pos.left = pos.left - ( da( this.sListObj ).width() - da( this.sObj ).width())+4;
				else
					pos.left -= 5;
				
				
			}
			else{
				if( da(win).height()/2 < pos.top )
					pos.top = pos.top - da( this.sListObj ).height() -2;
				else
					pos.top = pos.top+ da( this.sObj ).height()+1;
				
				if( da(win).width()/2 < pos.left )
					pos.left = pos.left - ( da( this.sListObj ).width() - da( this.sObj ).width());
					
			}
			
			da( this.sListObj ).offset( pos );
			
			this.sListObj.style.display = display;
			
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
			
		},
		
		/**更新数据源
		*/
		setList: function( list ){
			if( !list || !da.isPlainObj( list ) ) return;
			if( this.sListObj ){
				this.sListObj.parentNode.removeChild( this.sListObj );
				this.sListObj = null;
			}
			
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

		//子项选择事件
		/*
		*/
		click: function( obj ){
			var setting = this.setting;
					code = obj.getAttribute("code"),
					text = obj.innerText || obj.textContent;
			
//			this.value( code );
			this.text( text );
			
//			this.sInput.value = text;
//			this.sInput.setAttribute( "code", value );
			
			this.hideList();
		},
		
		/**选项改变事件
		*/
		change: function( value, text ){
			try{
				if( this.setting.change )
					this.setting.change.call( this.sInput, value, text, this);
			}catch(e){};
			
		},
		
		//显示列表
		/*
		*/
		showList: function(){
			if( this.setting.off ) return;
			if( null === this.sListObj ) this.createList();
			if( "block" === this.sListObj.style.display ) return;
			
			this.reSize();
			
			this.sBody.className = this.setting.css.focus;
			
			if( "undefined" === typeof daFx ){
				this.sListObj.style.display = "block";
			}
			else{
				da( this.sListObj ).slideDown(300);
				
			}
				
			
			if( "undefined" === typeof daGif ){
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
				
			
		},
		
		/**隐藏列表
		* params {boolean} isForce 是否不需要验证daSelect当前值，直接关闭
		*/
		hideList: function( isForce ){
			if( null === this.sListObj ) return;
			if( "none" === this.sListObj.style.display ) return;
			
			this.sBody.className = this.setting.css.normal;
			
			if( "undefined" === typeof daFx || isForce ){
				this.sListObj.style.display = "none";
				return;
			}
			else{
				this.text( this.sInput.value );												//验证值
				da( this.sListObj ).slideUp(300);
				
			}
			
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
		
	
	};


	//扩展daSelect控件的value和text设置函数
	da.each([ "value", "text" ],function( idx, name ){
		daSelect.fnStruct[ name ] = function( val ){
			if( "text" === name && undefined === val ) return this.sInput.value;
			if( "value" === name && undefined === val ) return this.sInput.getAttribute( "code" );
			
			var context = this,
					sInput = this.sInput,
					sListObj = this.sListObj,
					sItemObjs = this.sItemObjs,
					setting = this.setting,
					list = setting.list,
					item, itemCode, itemText,
					oldText = sInput.value,
					oldValue = sInput.getAttribute( "code" ),
					onFind = true;
					
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
			
			if( sItemObjs ){
					if( setting.onlyOne ){
						da( sItemObjs ).each(function(){ 										//取消其他选中项
							this.className = setting.css.item;
						});
					}
					
					for( var i=0,len=sItemObjs.length; i<len; i++ ){
						item = sItemObjs[i];
						itemCode = item.getAttribute( "code" );
						itemText = item.innerHTML;
						
						if( "value" === name && itemCode == val || "text" === name && itemText == val ){				//如果在列表中找到相应的有效项
							onFind = false;
							sInput.value = itemText;
							sInput.setAttribute( "code", itemCode );
		
							if( setting.css.selected !== item.className ){							//更改当前选中项样式
								item.className = setting.css.selected;
							}
							
							break;
						}
					}
					
					if( onFind && 0 < sItemObjs.length ){														//没有匹配到用户传入的选项值
						item = sItemObjs[0];
						itemCode = item.getAttribute( "code" );
						itemText = item.innerHTML;
						
						sInput.value = itemText;
						sInput.setAttribute( "code", itemCode );
		
						if( setting.css.selected !== item.className ){								//更改当前选中项样式
							item.className = setting.css.selected;
						}
						
					}
			}
				
			
			if( oldText !== sInput.value || oldValue !== sInput.getAttribute( "code" ) )						//值发生变化，触发change回调						
				this.change( sInput.getAttribute( "code" ), sInput.value );
				
		}
	});

	
	daSelect.fnStruct.init.prototype = daSelect.prototype;

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
		
		var cache = daSelect.daSelectCache;								//无参数传入，收起页面所有下拉面板
		for( var i=0,len=cache.length; i<len; i++ ){
			cache[i].obj.hideList( isForce );
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
	daSelect.daSelectCache = [];
	
	/**缓存daSelect控件对象
	* params {daSelect} obj 下拉控件daSelect对象
	*/
	daSelect.pushCache = function( obj ){
		var cache = daSelect.daSelectCache;
		cache.push({
			id: obj.sId,
			obj: obj
		});
		
	};
	
	/**查找相应id的daSelect控件对象
	* params {string} id 下拉控件对象id
	*/
	daSelect.getSelect = function( id ){
		var cache = daSelect.daSelectCache;
		
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