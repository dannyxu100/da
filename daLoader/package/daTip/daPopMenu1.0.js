/**daPopMenu
*右键菜单类
* @author danny.xu
* @version daPopMenu_1.0 2011/7/3 22:23:50
*/

(function( win, undefined ){
var doc = win.document;

var daPopMenu = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daPopMenu = function( menuSetting ){
		return new daPopMenu.fnStruct.init( menuSetting );
	};
	
	daPopMenu.maxLevel = {},
	
	daPopMenu.fnStruct = daPopMenu.prototype = {
		version: "daPopMenu v1.0 \nauthor: danny.xu \ndate: 2011/7/3 22:33:14",
		
		menuId: "",
		menuTargetObj: null,
		menuObj: null,
		menuItems: null,
		
		menuSetting: {
			target: null,
			group: "popmenu",
			list: [],
			
			bg: "#f5f5f5",
			css: "daPopMenu",
			
			click: null,
			hover: null,
			out: null
		},
		
		menuLevel: 0,
		
		defaultMenu: [						//默认菜单选项
			"-",
			["关于菜单..", function( dom, idx, html, menuObj ){alert( menuObj.version );}]
		],
		
		init: function( menuSetting ){
			menuSetting = this.menuSetting = da.extend( true, {}, this.menuSetting, menuSetting );
			
			var da_targetObj = da( menuSetting.target );
			if( 0 == da_targetObj.dom.length ){ alert("daPopMenu温馨提示：弹出菜单需要提供一个目标对象"); return; }
			this.menuTargetObj = da_targetObj.dom[0];
			
			menuSetting.list = menuSetting.list.concat( this.defaultMenu );
			
			var popMenuParent = da.data( this.menuTargetObj, "popMenuParent" );							//如若是子级菜单，可以从目标对象的缓冲中获取父级菜单的信息（菜单唯一ID,上级菜单级别）
			
			if( !popMenuParent ){
				this.menuId = "popmenu" + da.nowId();																					//并非子级菜单，需要生产一个弹出菜单的唯一ID;
				//menuSetting.group = this.menuId;																							//若是根级菜单，直接用菜单唯一ID 作为同级分组名
				daPopMenu.maxLevel[ this.menuId ] =  this.menuLevel;													//更新菜单最大级别值
				
			}
			else{
				this.menuId = popMenuParent.id;
				this.menuLevel = popMenuParent.level + 1;

				menuSetting.group = this.menuId + "_child_" + popMenuParent.level;						//若是子级菜单，通过菜单唯一ID+后缀,设置菜单的同级分组名
				var maxLevel = daPopMenu.maxLevel[ this.menuId ];
				daPopMenu.maxLevel[ this.menuId ] = this.menuLevel > maxLevel ? this.menuLevel : maxLevel;		//更新菜单最大级别值
			}
			
			
			this.menuItems = [];
			
			this.create();
			this.bindEvent();
			
			if( 0 !== this.menuLevel )
				this.show();
		},
		
		create: function(){
			var menuSetting = this.menuSetting,
					menuList = menuSetting.list,
					itemHTML, fnClick, fnMouseOver, fnMouseOut,
					menuItems = this.menuItems,
					menuObj = doc.createElement("div"),
					context = this,
					btObj;
			
			menuObj.className = menuSetting.css;
			
			for( var i=0,len=menuList.length; i<len; i++){
				if( da.isArray( menuList[i] ) ){
					itemHTML = menuList[i][0];
					fnClick = menuList[i][1] ? menuList[i][1] : menuSetting.click;
					fnMouseOver = menuList[i][2] ? menuList[i][2] : menuSetting.hover;
					fnMouseOut = menuList[i][3] ? menuList[i][3] : menuSetting.out;
				
				}
				else{
					itemHTML = menuList[i];
					fnClick = menuSetting.click;
					fnMouseOver = menuSetting.hover;
					fnMouseOut = menuSetting.out;
				}
				
				if( "-" === itemHTML ){																//子项分隔条
					btObj = doc.createElement("hr");
				}
				else{
					btObj = doc.createElement("a");
					btObj.href = "javascript:void(0);";
					btObj.innerHTML = itemHTML;
					
					da.data( btObj, "popMenuParent", 
					{ 
						id: this.menuId,
						level: this.menuLevel
					});
					
					(function( btObj, itemHTML, fnClick, fnMouseOver, fnMouseOut, idx ){
							if( da.isFunction( fnClick ) ){												//菜单子项，点击回调处理函数
									da( btObj ).bind("click",function(evt){
										fnClick.call( btObj, context.menuTargetObj, idx, itemHTML, context );
										
									});
								
							}
							if( da.isFunction( fnMouseOver ) ){										//菜单子项，鼠标移上回调处理函数
									da( btObj ).bind("mouseover",function(evt){
										fnMouseOver.call( btObj, context.menuTargetObj, idx, itemHTML, context );
										
									});
										
								
							}
							
							if( da.isFunction( fnMouseOut ) ){										//菜单子项，鼠标移出回调处理函数
									da( btObj ).bind("mouseout",function(evt){
										fnMouseOut.call( btObj, context.menuTargetObj, idx, itemHTML, context );
										
									});
										
							}
					
					})( btObj, itemHTML, fnClick, fnMouseOver, fnMouseOut, menuItems.length );

					menuItems.push( btObj );
					
				
				}
				menuObj.insertBefore( btObj, null );
				
			}
			
			this.menuObj = menuObj;
			
		},
		
		/**事件绑定
		*/
		bindEvent: function(){
				var context = this;
						
				if( 0 == this.menuLevel ){																			//根级菜单
					da( this.menuTargetObj ).bind( "contextmenu", function(evt){	//绑定右键弹出菜单事件
							context.show().followMouse(evt);
							
							return false;
					});
				
					da(doc).bind("click",function(evt){														//document绑定点击隐藏菜单事件											
						context.hide();
						
					});
				}
				else{																														//子级菜单
					da( this.menuTargetObj ).bind( "mouseover", function(evt){		//鼠标移上弹出菜单事件
							context.show();
							
					});
					
				}
		},
		
		/**隐藏本级和下级菜单
		*/
		hide: function(){
			var maxLevel = daPopMenu.maxLevel[ this.menuId ];								//获取弹出菜单的最大级数

			daTip.hide( this.menuSetting.group );														//隐藏当前同级菜单
			
			for( var i=this.menuLevel, len=maxLevel; i<len; i++ ){					//隐藏子级菜单
				daTip.hide( this.menuId + "_child_" + i );
				
			}
			
		},
		
		/**显示菜单
		*/
		show: function(){
				var tipSetting = {																			//daTip模拟的弹出菜单的基本参数设置
					target: this.menuTargetObj,
					html: this.menuObj,
					group: this.menuSetting.group,
					bg: this.menuSetting.bg,
					close: false
				};
				
				if( 0 == this.menuLevel )																//如果是根级菜单，不需要显示指针样式
					tipSetting.pointer = "no";
				
				this.hide();
				return daTip(tipSetting);
		}
		
		
	};

	
	daPopMenu.fnStruct.init.prototype = daPopMenu.prototype;			//模块通过原型实现继承属性

	/**隐藏本级和下级菜单
	*/
	daPopMenu.hide = function( group ){
//		for( var id in daTip.daTipCache){
//			if( group && group != daTip.daTipCache[ id ].tipSetting.group ) continue;
//			if( "show" == daTip.daTipCache[ id ].tipState ) 
//				daTip.daTipCache[ id ].hide();
//		}
//		
//		var maxLevel = daPopMenu.maxLevel[ this.menuId ];								//获取弹出菜单的最大级数
//
//		daTip.hide( this.menuSetting.group );														//隐藏当前同级菜单
//		
//		for( var i=this.menuLevel, len=maxLevel; i<len; i++ ){					//隐藏子级菜单
//			daTip.hide( this.menuId + "_child_" + i );
//			
//		}
		
	};

	return daPopMenu;
})();



win.daPopMenu = win.popmenu = daPopMenu;

})(window);