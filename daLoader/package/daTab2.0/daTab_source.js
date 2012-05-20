// JavaScript Document
/*
	author: danny.xu
	date:	2010-9-25
	description:	动态自定义tab页

*/

(function(win){
	//获取全局变量
	var doc = win.document;
	var body = doc.body;
	
	//daTab类构造函数
	/*
		objParent:	分页对象父节点（如果想改变显示排列方式,objParent参数需要加"[top:, right:, bottom:, left: ]"前缀 默认top）
		sId:	分页对象id
		tabName:	多分页条同时存在时，用于分组name值
		css: 样式类型,默认为bg,还有bg_blue, bg_yellow
		noClose: 是否取消关闭按钮
	*/
	var daTab = function( objParent, sId, tabName, css, noClose ){
			return new daTab.fnStruct.init( objParent, sId, tabName, css, noClose );
	};
	//daTab.cssPath = "/daTab/daTab.css";			//样式文件相对 插件调用页面的地址
	daTab.cssPath = "daTab.css";							//样式文件相对 插件调用页面的地址(example)
	
	daTab.fnStruct = daTab.prototype = {
		version: "插件名称:daTab  \nauthor: danny.xu    \ndate:2010-9-25    \ndescription:	动态自定义tab页1.0版本",
		
		css:{
			tab:"daTab",									//tab对象样式
			bg:	"tabs",											//tab背景（容器）样式
			bg_infobar: "bg_info_bar",		//信息条背景（容器）样式
			bg_btMini:	"bg_mini_button",	//迷你功能按钮背景（容器）样式
			noselect:"item",							//默认分页选项样式
			select:"current",							//选中分页选项样式
			minibt:"bt"										//迷你功能按钮样式
		},
		
		objTab : null,
		tabName	:	null,
		objParent : null,
		objTabBg: null,
		objInfoBarBg: null,
		objMiniButtonBg: null,
		objItemSelect: null,
		noClose: false,
		itemCount: 0,
		
		//出示化函数
		/*
			objParent:	分页对象父节点（如果想改变显示排列方式,objParent参数需要加"[top:, right:, bottom:, left: ]"前缀 默认top）
			sId:	分页对象id
			tabName:	多分页条同时存在时，用于分组name值
			css: 样式类型,默认为bg,还有bg_blue, bg_yellow
			noClose: 是否取消关闭按钮
		*/
		init : function( objParent, sId, tabName, css, noClose ){
			var arrTmp = sId.split(":");
			if( 1 < arrTmp.length ){									//如果改变显示排列方式,前缀分析，修正sId
				sId = arrTmp[1];
				this.css.tab = "tabnav_" + ( arrTmp[0] || "top" );
			}
			
			if(null != doc.getElementById(sId)){ //alert("daTab提示：daTab选项页对象id重复，请更换。"); 
				return null;}
				
			if("string" == typeof objParent){
				objParent = doc.getElementById(objParent);
				if(null == objParent){ alert("daTab提示:找不到父对象。"); return false; }
			}
			this.objParent = objParent || body;				//保存tab父节点对象
			
			this.tabName = tabName || null;
			this.noClose = noClose || false;
			
			this.css.bg = css || this.css.bg;
//			this.loadcss();														//加载样式文件
			this.create(sId);													//创建tabHTML
		},
		
		//加载样式文件
		loadcss : function(){
			if(null != document.getElementById("daTabCss")) return;
//			if(doc.createStyleSheet) {
//				var daTabStyle = doc.createStyleSheet(daTab.cssPath,10);
//			}
//			else {
				var daTabStyle = doc.createElement('link');
				daTabStyle.id = "daTabCss";
				daTabStyle.rel = 'stylesheet';
				daTabStyle.type = 'text/css';
				daTabStyle.href = escape(daTab.cssPath);
				doc.getElementsByTagName("head")[0].appendChild(daTabStyle);
//			}
		},
		
		//创建基本tab对象HTML
		create : function(sId){
			if(null != this.objTab) return null;				
			
			this.objTab = doc.createElement("div");								//tab对象不存在，创建tab对象
			this.objTab.id = sId;
			this.objTab.className = this.css.tab;
			if(null!=this.tabName) this.objTab.name = this.tabName;
			
			this.objParent.appendChild(this.objTab);							//追加tab对象
			
			this.objTabBg = doc.createElement("div");							//tab页按钮 容器对象不存在，创建容器对象
			this.objTabBg.className = this.css.bg;
			if(null!=this.tabName) this.objTabBg.name = this.tabName;
			this.objTab.appendChild(this.objTabBg);								//追加容器对象
			
			this.objInfoBarBg = doc.createElement("div");					//tab页按钮条中间信息内容条
			this.objInfoBarBg.className = this.css.bg_infobar;
			if( null!=this.tabName ) this.objInfoBarBg.name = this.tabName;
			this.objTab.appendChild( this.objInfoBarBg );					//追加信息内容条对象
			
			this.objMiniButtonBg = doc.createElement("div");			//迷你功能按钮 容器对象不存在，创建容器对象
			this.objMiniButtonBg.className = this.css.bg_btMini;
			if(null!=this.tabName) this.objMiniButtonBg.name = this.tabName;
			this.objTab.appendChild(this.objMiniButtonBg);				//追加迷你功能按钮 容器对象
			
		},
		
		//清空tab对象
		/*
			obj: 要移除的tab按钮DOM对象（也可以传入id）
		*/
		clearItems : function( obj ){
			if("string" == typeof obj){
					obj = doc.getElementById(obj);
					if(null == obj){alert("daTab提示:找不到要移除的对象。");return false;}
			}
			
			if( obj ){
					this.objTabBg.removeChild( obj );
					this.itemCount--;
			}
			else{
			    while (this.objTabBg.firstChild) {
			      var item = this.objTabBg.removeChild(this.objTabBg.firstChild);
						item = null;
					}
					this.itemCount = 0;
			}
			
		},
		
		//追加tab选项
		/*
			sId:	tab按钮DOM对象id（如果想添加右边mini功能按钮,sid参数需要加"right:"前缀 但是注意：设置为right小按钮的样式时，就不能用selectItem高亮咯~！）
			title:	tab按钮标题
			icoName:	tab按钮小图标css类名
			fnEvents:	tab按钮自定义事件可以以键值对的方式绑定多个{ click:function(){}, mouseover:function(){} }
		*/
		appendItem: function( sId, title, icoName, fnEvents, noClose ){
			var objItem = doc.getElementById( sId ),
					noClose = ( "undefined" === typeof noClose ) ? this.noClose : noClose;
			
			if( null != objItem ) return null; 					//alert("daTab提示：daTab可选项对象id重复，请更换。");

			var isMiniBt = /^right:.+$/.test(sId);
			if( isMiniBt ){
				sId = sId.substring( sId.indexOf( ":" ) + 1 );
			}
			
			var item = doc.createElement( "li" );
			item.id = sId;
			item.className = isMiniBt ? this.css.minibt : this.css.noselect;		//默认为未选中状态
			if(null!=this.tabName) item.name = this.tabName;
			
			if( isMiniBt )
				this.objMiniButtonBg.insertBefore( item, null );				//追加迷你功能按钮 dom对象
			else
				this.objTabBg.insertBefore( item, null );							//追加tab选择项 dom对象
			
			var arrHTML = [];
			arrHTML.push('<div class="cnt" >');
			
			if( icoName ){																//小图标
				arrHTML.push('<div id="'+ sId +'_ico" class="ico ');
				arrHTML.push(icoName);
				arrHTML.push(' "></div>');
			}
			arrHTML.push('<div id="'+ sId +'_txt" class="txt">');
			arrHTML.push(title);													//选项名
			arrHTML.push('</div>');
			
			if( !noClose && !isMiniBt ){									//关闭按钮
				arrHTML.push('<div id="' + sId + '_close" class="close" ></div>');
				
			}
			arrHTML.push('</div>');
			
			item.innerHTML = arrHTML.join('');
				
			objItem = doc.getElementById( sId );																//重新获取一下对象，确定DOM对象存在再绑定事件
			this.bindEvent( objItem, fnEvents, isMiniBt );
			
			if( !noClose && !isMiniBt ){																				//绑定关闭按钮事件
					var context = this;
					this.bindEvent( doc.getElementById( sId + "_close" ),
					{
						click: function(){
							 context.clearItems( objItem );
							 context.closeItem( objItem, context.itemCount );
						}
					},true );
			}
			
			this.itemCount++;
			
			return this;
			
		},
		
		
		//item绑定事件
		bindEvent: function(obj,fnEvents,isMiniBt){
			for(var evtName in fnEvents){								//绑定自定义事件函数
				//da( obj ).bind( evtName, fnEvents[evtName] );
				daEventBind(obj,evtName,fnEvents[evtName],false);
			}
			
			if(!isMiniBt){
					var context = this;						//获取上下文对象
					daEventBind(obj,"click",function(){
						context.selectItem(obj);		//给选项卡对象绑定动态样式点击事件
						
					},false);
			}
		},
		
		//触发item点击事件
		click: function( obj ){
			if( "string" == typeof obj ){
				obj = doc.getElementById(obj);
				if(null == obj){alert("daTab提示:找不到点击对象。");return false;}
			}
			
			this.selectItem( obj );
			
			if( obj.click ){
				obj.click();
			}
			else if( "undefined" !== typeof da ){
				da( obj ).click();
			}
		},
		
		//选中高亮item
		selectItem: function( obj ){
			if( "string" == typeof obj ){
				obj = doc.getElementById(obj);
				if(null == obj){alert("daTab提示:找不到可选对象。");return false;}
			}
			
			if(this.objItemSelect) this.objItemSelect.className = this.css.noselect;			//更改之前选中的分页选项状态
			obj.className = this.css.select;				//更改当前选中状态
			this.objItemSelect = obj;
			obj.blur();
		},
		
		//关闭item
		closeItem: function( objItem, itemCount ){
			if( 1 >= itemCount ) objItem.style.display = "none";
			var lastItem = this.objTabBg.children[ this.objTabBg.children.length - 1 ];
			this.selectItem( lastItem );

			this.click( lastItem );
				
		},

		//设置tab按钮条中间信息内容
		setInfoBar: function( obj ){
			if("string" == typeof obj){
				this.objInfoBarBg.innerHTML = obj;
			}
			else if( obj ){
				this.objInfoBarBg.innerHTML = "";
				this.objInfoBarBg.appendChild( obj );
				
			}
			
		}
		
	};

	daTab.fnStruct.init.prototype = daTab.fnStruct;
	win.daTab = daTab;
	
	
//兼容IE和W3C的事件绑定
/*
	objDOM : 绑定事件的DOM对象
	name : 事件名称
	observer : 事件触发函数
	useCapture : 是否锁定 当前对象为事件捕获对象 范围
*/
daEventBind = function(objDOM, name, observer, useCapture) {     
   //if (!this.observers) this.observers = [];
   
   if (objDOM.addEventListener) {						//W3C DOM        
     objDOM.addEventListener(name, observer, useCapture);     
     //this.observers.push([objDOM, name, observer, useCapture]);  
     
   } else if (objDOM.attachEvent) {					//IE DOM   
     objDOM.attachEvent("on" + name, observer);     
     //this.observers.push([objDOM, name, observer, useCapture]);  
     
   }     
}
	
})(window)