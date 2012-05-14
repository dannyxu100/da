/*
	author:	danny.xu
	date:	2010.12.10
	description:	daTip类(信息提示框)
*/
da.extend({
	
		//判断一个点所处呈现页面的某区域判断
		/*
			pos: 需判断点坐标（pos为null直接返回"center"）		{ left:100, top:200 }
			size; 对象尺寸 														{ width:100, height:200 }
		*/
		inPageArea: function(pos,size){
				if( null == da.isNull( pos, null ) ) return "5";
				
				var da_Win = da(window),
						winWidth = parseInt( da_Win.width(), 10 ) || 0,
						winHeight = parseInt( da_Win.height(), 10 ) || 0;
				
				var d_toLeft = pos.left,
						d_toRight = winWidth - pos.left,
						d_toTop = pos.top,
						d_toBottom = winHeight - pos.top;
				
				var sArea = [];
		  	if( d_toTop>=d_toBottom )	sArea.push( "B" );				//偏下
		  	else	sArea.push( "T" );														//偏上
			  if( d_toRight>=d_toLeft )	sArea.push( "L" );				//偏左
			  else	sArea.push( "R" );														//偏右
		  	
		  	if( undefined == size ) return sArea.join("");

		  	if( size.height >= size.width )			//如果信息框为 长条形
		  		sArea.reverse();
		  	
		  	var nArea = 5;				//默认正中
		  	switch( sArea.join("") ){
		  		case "TL": nArea = "87"; break;
		  		case "LT": nArea = "47"; break;
		  		case "TR": nArea = "89"; break;
		  		case "RT": nArea = "69"; break;
		  		case "BL": nArea = "21"; break;
		  		case "LB": nArea = "41"; break;
		  		case "BR": nArea = "23"; break;
		  		case "RB": nArea = "63"; break;
		  	}
		  	
		  	return nArea;
		}
	
});


/**daMenu
*右键菜单类
* @author danny.xu
* @version daMenu_1.0 2012-1-31 16:59:14
*/

(function( win, undefined ){
var doc = win.document;

var daMenu = (function(){
	
	/**daMenu类构造函数
	*/
	var daMenu = function( menuSetting ){
		return new daMenu.fnStruct.init( menuSetting );
	};
	
	daMenu.maxLevel = {},
	
	daMenu.fnStruct = daMenu.prototype = {
		version: "daMenu v1.0 \nauthor: danny.xu \ndate: 2012-1-31 16:59:11",
		
		menuId: "",
		menuTargetObj: null,
		menuObj: null,
		menuItems: null,
		
		menuSetting: {
			target: null,
			group: "popmenu",
			list: [],
			
			bg: "#f5f5f5",
			css: {
				menu: "daMenu daRadius",
				list: "list daRadius",
				item: "daRadius"
			},
			
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
			if( 0 == da_targetObj.dom.length ){ alert("daMenu温馨提示：弹出菜单需要提供一个目标对象"); return; }
			this.menuTargetObj = da_targetObj.dom[0];
			
			menuSetting.list = menuSetting.list.concat( this.defaultMenu );
			
			var popMenuParent = da.data( this.menuTargetObj, "popMenuParent" );							//如若是子级菜单，可以从目标对象的缓冲中获取父级菜单的信息（菜单唯一ID,上级菜单级别）
			
			if( !popMenuParent ){
				this.menuId = "popmenu" + da.nowId();																					//并非子级菜单，需要生产一个弹出菜单的唯一ID;
				//menuSetting.group = this.menuId;																							//若是根级菜单，直接用菜单唯一ID 作为同级分组名
				daMenu.maxLevel[ this.menuId ] =  this.menuLevel;													//更新菜单最大级别值
				
			}
			else{
				this.menuId = popMenuParent.id;
				this.menuLevel = popMenuParent.level + 1;

				menuSetting.group = this.menuId + "_child_" + popMenuParent.level;						//若是子级菜单，通过菜单唯一ID+后缀,设置菜单的同级分组名
				var maxLevel = daMenu.maxLevel[ this.menuId ];
				daMenu.maxLevel[ this.menuId ] = this.menuLevel > maxLevel ? this.menuLevel : maxLevel;		//更新菜单最大级别值
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
					listObj = doc.createElement("div"),
					context = this,
					btObj;
			
			doc.body.insertBefore( menuObj, null );
			this.menuObj = menuObj;
			
			menuObj.className = menuSetting.css.menu;
			listObj.className = menuSetting.css.list;
			
			menuObj.insertBefore( listObj, null );
			
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
					btObj = doc.createElement("div");
					btObj.style.cssText = "overflow:hidden;margin:1px 0px;border-bottom:1px solid #ccc;";
				}
				else{
					btObj = doc.createElement("a");
					btObj.href = "javascript:void(0)";
					btObj.className = menuSetting.css.item;
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
				listObj.insertBefore( btObj, null );
				
			}
			
		},
		
		/**事件绑定
		*/
		bindEvent: function(){
				var context = this;
						
				if( 0 == this.menuLevel ){																			//根级菜单
					da( this.menuTargetObj ).bind( "contextmenu", function(evt){	//绑定右键弹出菜单事件
							context.show( evt.pageX, evt.pageY );
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
			var maxLevel = daMenu.maxLevel[ this.menuId ];								//获取弹出菜单的最大级数
			this.menuObj.style.display = "none";
//			daTip.hide( this.menuSetting.group );														//隐藏当前同级菜单
//			
//			for( var i=this.menuLevel, len=maxLevel; i<len; i++ ){					//隐藏子级菜单
//				daTip.hide( this.menuId + "_child_" + i );
//				
//			}
			
		},
		
		/**显示菜单
		*/
		show: function( nLeft, nTop ){
				this.hide();
				
				var pos = { left:nLeft, top:nTop },
						size = { width: da( this.menuObj ).width(), height: da( this.menuObj ).height() };
				
		  	switch( da.inPageArea( pos, size ) ){												//根据鼠标位置，调整摆放信息框的位置
		  		case "89":
		  		case "69": 
		  			pos.left -= size.width;
		  			break;
		  		case "63": 
		  		case "23":
		  			pos.left -= size.width;
		  			pos.top -= size.height;
		  		  break;
		  		case "21":
		  		case "41":
		  			pos.top -= size.height;
						break;
		  	}
				
				if( "undefined" !== typeof daFx )
					da( this.menuObj ).show();
				else
					this.menuObj.style.display = "block";
					
				da( this.menuObj ).offset( pos );
				
		}
		
		
	};

	
	daMenu.fnStruct.init.prototype = daMenu.prototype;			//模块通过原型实现继承属性

	/**隐藏本级和下级菜单
	*/
	daMenu.hide = function( group ){
//		for( var id in daTip.daTipCache){
//			if( group && group != daTip.daTipCache[ id ].tipSetting.group ) continue;
//			if( "show" == daTip.daTipCache[ id ].tipState ) 
//				daTip.daTipCache[ id ].hide();
//		}
//		
//		var maxLevel = daMenu.maxLevel[ this.menuId ];								//获取弹出菜单的最大级数
//
//		daTip.hide( this.menuSetting.group );														//隐藏当前同级菜单
//		
//		for( var i=this.menuLevel, len=maxLevel; i<len; i++ ){					//隐藏子级菜单
//			daTip.hide( this.menuId + "_child_" + i );
//			
//		}
		
	};

	return daMenu;
})();



win.daMenu = daMenu;

})(window);