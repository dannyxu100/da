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



/*
	author:	danny.xu
	date:	2011-1-13
	description:	daTip类(信息提示框)
*/
( function( win ){
	var doc = win.document;
	
	/**构造函数
	* @param {PlainObject} tipSetting 用户配置参数
	*/
	var daTip = function( tipSetting ){
			return new daTip.fnStruct.init( tipSetting );
	};
	
	daTip.fnStruct = daTip.prototype = {
			tipObj: null,								//提示框容器对象
			tipId: "",									//提示框DOM对象id
			tipCloseBt: null,						//提示框关闭按钮DOM对象
			tipTarget: null,						//提示目标DOM对象
			tipParentObj: null,					//daTip所处DOM对象
			tipTableObj: null,					//daTip样式table结构 DOM对象
			tipMidObj: null,						//提示框中心容器DOM对象
			tipPointers: null,					//daTip样式指针DOM对象集
			
			tipSetting: {
				title: "",								//daTip标题
				html: "",									//daTip内容HTML，也可以是DOM对象
				target: null,							//提示目标DOM对象
				color: "#f0f0f0",					//提示信息文字颜色
				bg: "#d66500",						//提示框中心背景色
				
				group: "daTip",						//缓存分组名称
				pointer: "",							//用户自定义daTip指针方向, 默认"87"(上左)
				events: null,							//daTip绑定事件
				parent: null,							//daTip容器DOM对象
				
				close: true,							//是否显示关闭按钮
				warn: {							
					open: false,
					length: 10,
					delay: 350,
					show: null
				}
			},
			
			tipState: "hide",						//daTip对象的显示状态"hide","show"
			
			warnTimer: null,						//警告动画timer
			
			/**daTip初始化函数
			* @param {PlainObject} tipSetting 用户配置参数
			*/
			init: function( tipSetting ){
				tipSetting = this.tipSetting = da.extend(true, {}, this.tipSetting, tipSetting );
				
				var da_objTarget = da( tipSetting.target ),
						daTipObj = null;
				
				if( 0 < da_objTarget.dom.length )
					daTipObj = da.data( da_objTarget.dom[0] , this.tipSetting.group );				//获取缓存对象
				
				if( null != daTipObj ){																				//如果已经存在直接显示
						daTipObj.show();
						return daTipObj;
				}
				else{																													//如果没有缓存对象就new一个	
						this.tipParentObj = da( tipSetting.parent ).dom[0] || doc.body;
						this.tipTarget = da( tipSetting.target ).dom[0] || null;
						this.tipSetting.html = this.tipSetting.html || this.tipTarget.getAttribute("daTip") || "未定义提示内容。";
						
						do{
							this.tipId = "daTip"+ ( new Date ).getTime();						//避免重复id
						}
						while( null != doc.getElementById( this.tipId ) );
						
						this.tipPointers = {	
							p8: null,
							p6: null,
							p2: null,
							p4: null
						};
						
						this.create();
						this.show();
						this.bindEvent();
						
						daTip.daTipCache[ this.tipId ] = this;										//放入队列，便于批量操作
					
						da.data( this.tipTarget, this.tipSetting.group, this);									//压入缓存
					
					return this;
				}
				
				
			},
			
			//提示框DOM创建函数
			create: function(){
					var tipId = this.tipId,
							tipObj = doc.createElement("DIV");
							tipTableObj = null,
							isDOM = ( 1 === this.tipSetting.html.nodeType );				//判断传入的HTML参数是否是DOM对象
					
					
					this.tipParentObj.insertBefore( tipObj, null );
					this.tipObj = tipObj;
					
					tipObj.id = tipId;
					tipObj.style.left = "0px";
					tipObj.style.top = "0px";
					tipObj.className = "daTip";
					tipObj.innerHTML = ['<table id="', tipId, '_tb" class="daTipTable" cellpadding="0" cellspacing="0">',
																'<tr>',
																	'<td class="daTipTL"></td>',
																	'<td class="daTipT">',
																	'<div class="daTipTitle">', this.tipSetting.title, '</div>',
																	'</td>',
																	'<td class="daTipTR"></td>',
																'</tr>',
																'<tr>',
																	'<td class="daTipL"></td>',
																	'<td id="', tipId, '_mid" class="daTipMid">',
																		( isDOM ? "" : this.tipSetting.html ),
																	'</td>',
																	'<td class="daTipR"></td>',
																'</tr>',
																'<tr>',
																	'<td class="daTipBL"></td><td class="daTipB"></td><td class="daTipBR"></td>',
																'</tr>',
															'</table>',
															'<div id="', tipId, '_p8" class="daTipP8"></div>',
															'<div id="', tipId, '_p6" class="daTipP6"></div>',
															'<div id="', tipId, '_p2" class="daTipP2"></div>',
															'<div id="', tipId, '_p4" class="daTipP4"></div>',
															
															'<a id="', tipId, '_CloseBt" class="daTipCloseBt" href="javascript:void(0);" onclick=""></a>',
														].join( "" );
					
					//da.copy(this.tipParentObj.outerHTML);
					
					this.tipPointers.p8 = doc.getElementById( tipId + "_p8" );
					this.tipPointers.p6 = doc.getElementById( tipId + "_p6" );
					this.tipPointers.p2 = doc.getElementById( tipId + "_p2" );
					this.tipPointers.p4 = doc.getElementById( tipId + "_p4" );
					
					this.tipTableObj = tipTableObj = doc.getElementById( tipId + "_tb" );
					this.tipCloseBt = doc.getElementById( tipId + "_CloseBt" );
					this.tipMidObj = doc.getElementById( tipId + "_mid");
					
					if( isDOM )
						this.tipMidObj.insertBefore( this.tipSetting.html, null );
					
					this.color();
			
					//根据信息框内容，调整信息框容器DIV对象的尺寸
					var da_tipTableObj = da( tipTableObj );
					da( this.tipObj ).css( {width: da_tipTableObj.width(), height:da_tipTableObj.height() } ); 
					
					if( da.fnStruct.bgiframe )																 //防止flash遮盖
						da( this.tipObj ).bgiframe();
			},
			
			//daTip事件绑定函数
			bindEvent: function(){
				for( var type in this.tipSetting.events ){
					da( this.tipObj ).bind( type, this.tipSetting.events[type] );
				}
				
				var context = this;
				da( this.tipCloseBt ).bind( "click", function(){
					context.hide();
				});
				
			},
			
			/**获得daTip对象的显示位置
			* @param {PlainObject} posTarget 提示目标对象位置点，如：{left: 10, top: 20}
			* @param {PlainObject} sizeTarget 提示目标对象的尺寸，如：{width: 10, height: 20}
			*/
			getPos: function( posTarget, sizeTarget ){
					if( !posTarget ) {alert("daTip温馨提示: 需要提供提示目标对象，或提示目标的位置。"); return;}; 
					sizeTarget = sizeTarget || {width:0, height:0};
					
					var da_tipObj = da( this.tipObj ),
							sizeTip = { width: da_tipObj.width(), height: da_tipObj.height() },
							pNum = da.inPageArea( posTarget, sizeTip ),
							isNoPointer = false,
							pointerObj = null;
					
					if( this.tipSetting.pointer ){
						if( null === this.tipSetting.pointer.match(/no|5/g) ){
							pNum = this.tipSetting.pointer || pNum;

						}
						else{
							isNoPointer = true;
							pNum = this.tipSetting.pointer.replace( "no", "" ) || pNum;
						}
					}
					pointerObj = this.tipPointers[ "p" + pNum.match(/8|6|2|4/g) ];
					if( !isNoPointer ) da( pointerObj ).css("display","block");

			  	switch( pNum ){												//根据箭头的指向，调整摆放信息框的位置
			  		case "8":
			  			pointerObj.style.left = ( sizeTip.width/2 - 13 ) + "px";
			  			posTarget.top += ( sizeTarget.height + (!isNoPointer && 12 ) );
							posTarget.left += ( sizeTarget.width/2 - sizeTip.width/2 );
			  			break;
			  		case "6":
			  			pointerObj.style.top = ( sizeTip.height/2 - 15 ) + "px";
			  			posTarget.top += ( sizeTarget.height/2 - sizeTip.height/2 );
							posTarget.left -= ( sizeTip.width + (!isNoPointer && 12 ) );
			  			break;
			  		case "2": 
			  			pointerObj.style.left = ( sizeTip.width/2 - 13 ) + "px";
							posTarget.top -= ( sizeTip.height + (!isNoPointer && 12 ) );
							posTarget.left += ( sizeTarget.width/2 - sizeTip.width/2 );
			  		  break;
			  		case "4": 
			  			pointerObj.style.top = ( sizeTip.height/2 - 15 ) + "px";
			  			posTarget.top += ( sizeTarget.height/2 - sizeTip.height/2 );
							posTarget.left += ( sizeTarget.width + (!isNoPointer && 12 ) );
							break;
			  		case "87":
			  			pointerObj.style.left = "13px";
			  			posTarget.top += ( sizeTarget.height + 12 );
							posTarget.left -= 26;
			  			break;
			  		case "89": 
			  			pointerObj.style.right = "13px";
				  		posTarget.top += ( sizeTarget.height + 12 );
							posTarget.left -= ( sizeTip.width - 30 );
			  			break;
			  		case "69": 
			  			pointerObj.style.top = "15px";
							posTarget.top -= 30;
							posTarget.left -= ( sizeTip.width + 12 );
							break;
			  		case "63": 
			  			pointerObj.style.bottom = "15px";
							posTarget.top -= ( sizeTip.height - 30 );
							posTarget.left -= ( sizeTip.width + 12 );
							break;
			  		case "23": 
			  			pointerObj.style.right = "14px";
							posTarget.top -= ( sizeTip.height + 12 );
							posTarget.left -= ( sizeTip.width - 30 );
			  		  break;
			  		case "21": 
			  			pointerObj.style.left = "15px";
							posTarget.top -= ( sizeTip.height + 12 );
							posTarget.left -= 26;
							break;
			  		case "41": 
			  			pointerObj.style.bottom = "15px";
							posTarget.top -= ( sizeTip.height - 30 );
							posTarget.left += ( sizeTarget.width + 12 );
							break;
			  		case "47": 
			  			pointerObj.style.top = "15px";
							posTarget.top -= 30;
							posTarget.left += ( sizeTarget.width + 12 );
							break;
						case "5":
							var da_Win = da(window),
									winWidth = parseInt( da_Win.width(), 10 ) || 0,
									winHeight = parseInt( da_Win.height(), 10 ) || 0;
								
							posTarget = {};
							posTarget.top = ( winHeight - sizeTip.height ) / 2;
							posTarget.left = ( winWidth - sizeTip.width ) / 2;
							
							break;
							
			  	}
			  	return posTarget;
			  	
			},
			
			//显示提示框
			show: function(){
					this.tipObj.style.display = "block";
					this.tipState = "show";												//改变daTip的显示状态
					
					var da_targetObj = da(this.tipTarget),
							posTarget = da_targetObj.pos(),
							sizeTarget = {width: da_targetObj.width(), height: da_targetObj.height()},
							posTip = this.getPos( posTarget, sizeTarget );
					
			  	this.pos( posTip );
					
					if( !this.tipSetting.close )
						this.tipCloseBt.style.display = "none";
					
					if( this.tipSetting.warn.open )								//如果需要播放警告动画
						this.warn();
					
			},
			
			//隐藏提示框
			hide: function(){
					da( this.tipObj ).css( "display","none" );
					this.tipState = "hide";																//改变daTip的显示状态
					
					if( this.tipSetting.warn.open )												//如果正在播放警告动画，就停止
						this.warn(false);
			},
			
			//设置tip的位置
			pos: function( pos ){
					var da_tipObj = da( this.tipObj );
					da_tipObj.offset( {left:pos.left, top:pos.top} );
			},
			
			/**daTip跟随鼠标，设置显示位置
			*/
			followMouse: function( evt ){
					var posMouse = {left: evt.pageX, top: evt.pageY};
					
					switch(this.tipSetting.pointer){
						case "87":
						case "89":
							posMouse.top += 13;
							break;
						case "47":
						case "41":
							posMouse.left += 13;
							break;
						case "69":
						case "63":
							posMouse.left -= 13;
							break;
						case "21":
						case "23":
							posMouse.top -= 13;
							break;
						case "5":
							posMouse.top += 13;
							posMouse.left += 13;
							break;
					}
					
					this.pos( this.getPos( posMouse ) );
			},
			
			//设置tip背景颜色
			color: function( bg, sColor ){
				if( undefined !== bg )	this.tipSetting.bg = bg;
				if( undefined !== sColor )	this.tipSetting.color = sColor;
				
				this.tipMidObj.style.background = this.tipSetting.bg;
				this.tipMidObj.style.color = this.tipSetting.color;
			},
			
			/**警示动画
			* @param {boolean} param 是否停止动画播放
			*/
			warn: function( param ){
				if( false === param && this.warnTimer ) {
					clearTimeout( this.warnTimer );											 //停止播放警告动画
					return;
				}
				
				var context = this,
						fnShow = null,
						step = 1;
				
				if( da.isFunction( param ) )
					this.tipSetting.warn.show = param;
				fnShow = this.tipSetting.warn.show;
				
				if( this.warnTimer ) clearTimeout( this.warnTimer );	//清除前一次调用动画的timer
				
				this.warnTimer = setInterval(function(){
						if( fnShow ) 
							fnShow.call( context, step, context.tipMidObj );
						else{
							switch(step){
								case 1:
								case 3:
									var posTip = da( context.tipObj ).pos();
									context.pos({left: posTip.left, top: posTip.top-5 });
									context.color( "#f17303" );
									break;
								case 2: 
								case 4: 
									var posTip = da( context.tipObj ).pos();
									context.pos({left: posTip.left, top: posTip.top+5 });
									context.color( "#d66500" );
									break;
							}
						}
						
						if( context.tipSetting.warn.length < ++step ) step = 1;
						
				}, this.tipSetting.warn.delay);
			}
			
	};
	
	daTip.daTipCache = {};
	
	/**跟随光标的tip
	* @param {PlainObject} tipSetting 用户配置参数
	*/
	daTip.cursor = function( tipSetting ){
			var da_targetObj = da( tipSetting.target ),
					daTipObj = null;
					
			if( 0 == da_targetObj.dom.length ){ alert("daTip温馨提示：跟随光标的tip,需要设置被提示DOM对象。"); return; }
			
			tipSetting.close = false;												//不需要显示关闭按钮
						
			da_targetObj.bind("mouseover", function(evt){
					daTipObj = daTip( tipSetting );
				
			}).bind("mousemove",function(evt){
					if(daTipObj){
						daTipObj.followMouse( evt );
					}
					
			}).bind("mouseout",function(evt){
					if(daTipObj) daTipObj.hide();
					
			});
			
	};
	
	/**显示所有的/分组的daTip信息框
	* @param {String} group 分组名称
	*/
	daTip.show = function( group ){
		for( var id in daTip.daTipCache){
			if( group && group != daTip.daTipCache[ id ].tipSetting.group ) continue;
			if( "hide" == daTip.daTipCache[ id ].tipState ) 
				daTip.daTipCache[ id ].show();
		}
	};
	
	/**隐藏所有的/分组的daTip信息框
	* @param {String} group 分组名称
	*/
	daTip.hide = function( group ){
		for( var id in daTip.daTipCache){
			if( group && group != daTip.daTipCache[ id ].tipSetting.group ) continue;
			if( "show" == daTip.daTipCache[ id ].tipState ) 
				daTip.daTipCache[ id ].hide();
		}
	};
	
	
	
	//对象继承da类属性
	daTip.fnStruct.init.prototype = daTip.prototype;
	
	
	
	//全局变量
	win.daTip = win.datip = daTip;
	
} )( window );





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
	var daMenu = function( setting ){
		return new daMenu.fnStruct.init( setting );
	};
	
	daMenu.maxLevel = {},
	
	daMenu.fnStruct = daMenu.prototype = {
		version: "daMenu v1.0 \nauthor: danny.xu \ndate: 2012-1-31 16:59:11",
		
		menuId: "",
		menuTargetObj: null,
		menuObj: null,
		menuItems: null,
		
		setting: {
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
		
		init: function( setting ){
			setting = this.setting = da.extend( true, {}, this.setting, setting );
			
			var da_targetObj = da( setting.target );
			if( 0 == da_targetObj.dom.length ){ alert("daMenu温馨提示：弹出菜单需要提供一个目标对象"); return; }
			this.menuTargetObj = da_targetObj.dom[0];

			setting.list = setting.list.concat( this.defaultMenu );
			
			var popMenuParent = da.data( this.menuTargetObj, "popMenuParent" );							//如若是子级菜单，可以从目标对象的缓冲中获取父级菜单的信息（菜单唯一ID,上级菜单级别）
			
			if( !popMenuParent ){
				this.menuId = "popmenu" + da.nowId();																					//并非子级菜单，需要生产一个弹出菜单的唯一ID;
				//setting.group = this.menuId;																							//若是根级菜单，直接用菜单唯一ID 作为同级分组名
				daMenu.maxLevel[ this.menuId ] =  this.menuLevel;													//更新菜单最大级别值
				
			}
			else{
				this.menuId = popMenuParent.id;
				this.menuLevel = popMenuParent.level + 1;

				setting.group = this.menuId + "_child_" + popMenuParent.level;						//若是子级菜单，通过菜单唯一ID+后缀,设置菜单的同级分组名
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
			var setting = this.setting,
					menuList = setting.list,
					itemHTML, fnClick, fnMouseOver, fnMouseOut,
					menuItems = this.menuItems,
					menuObj = doc.createElement("div"),
					listObj = doc.createElement("div"),
					context = this,
					btObj;
			
			doc.body.insertBefore( menuObj, null );
			this.menuObj = menuObj;
			
			menuObj.className = setting.css.menu;
			listObj.className = setting.css.list;
			
			menuObj.insertBefore( listObj, null );
			
			for( var i=0,len=menuList.length; i<len; i++){
				if( da.isArray( menuList[i] ) ){
					itemHTML = menuList[i][0];
					fnClick = menuList[i][1] ? menuList[i][1] : setting.click;
					fnMouseOver = menuList[i][2] ? menuList[i][2] : setting.hover;
					fnMouseOut = menuList[i][3] ? menuList[i][3] : setting.out;
				
				}
				else{
					itemHTML = menuList[i];
					fnClick = setting.click;
					fnMouseOver = setting.hover;
					fnMouseOut = setting.out;
				}
				
				if( "-" === itemHTML ){																//子项分隔条
					btObj = doc.createElement("div");
					btObj.style.cssText = "overflow:hidden;margin:1px 0px;border-bottom:1px solid #ccc;";
				}
				else{
					btObj = doc.createElement("a");
					btObj.href = "javascript:void(0)";
					btObj.className = setting.css.item;
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
							context.show( evt.pageX, evt.pageY );
							
					});
					
				}
		},
		
		/**隐藏本级和下级菜单
		*/
		hide: function(){
			var maxLevel = daMenu.maxLevel[ this.menuId ];								//获取弹出菜单的最大级数
			this.menuObj.style.display = "none";
//			daTip.hide( this.setting.group );														//隐藏当前同级菜单
//			
//			for( var i=this.menuLevel, len=maxLevel; i<len; i++ ){					//隐藏子级菜单
//				daTip.hide( this.menuId + "_child_" + i );
//				
//			}
			
		},
		
		/**显示菜单
		*/
		show: function( nLeft, nTop ){
				if( 0 !== this.menuLevel ){
					var parentPos = da( this.menuTargetObj ).offset();
					nLeft = da.firstValue( nLeft, parentPos.left + da( this.menuObj ).width() );
					nTop = da.firstValue( nTop, parentPos.top );
				}
			
				this.menuObj.style.display = "block";
				
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
//		daTip.hide( this.setting.group );														//隐藏当前同级菜单
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