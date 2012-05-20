/*
	author:	danny.xu
	date:	2010.12.10
	description:	daTip类(信息提示框)
*/



//
//
////daGisBox信息框的指针的显示隐藏
///*
//	derict:	显示的指针方向t,r,b,l	空为不显示
//*/
//function daBoxPointDisplay(derict){
//	pointsObj.T.style.display = "none";
//	pointsObj.B.style.display = "none";
//	pointsObj.L.style.display = "none";
//	pointsObj.R.style.display = "none";
//
//	if(0 == arguments.length) return;		//无参数为不显示指针
//	
//	switch(derict){
//		case "t":
//			pointsObj.T.style.display = "block"
//			break;
//		case "r":
//			pointsObj.R.style.display = "block"
//			break;
//		case "b":
//			pointsObj.B.style.display = "block"
//			break;
//		case "l":
//			pointsObj.L.style.display = "block"
//			break;
//		default:
//			break;
//	}
//	
//};
//
////鼠标点击所在区域判断
///*
//	offsetObj:	定位相对偏移DOM对象，默认为BODY
//	evtObj:		触发事件对象，默认为window.event
//*/
//function whereMouse(evtObj,offsetObj){
//	offsetObj = offsetObj || document.body;	
//	var obj = {x:0,y:0};									//点击对象
//	if(evtObj){
//		obj.x = evtObj.offsetLeft;
//		obj.y = evtObj.offsetTop;
//	}
//	else{
//		obj.x = window.event.x;
//		obj.y = window.event.y;
//	}						
//	
//	var area = {w:0,h:0};
//	area.w = offsetObj.offsetWidth;
//	area.h = offsetObj.offsetHeight;
//	
//	var distance ={toTop:0,toRight:0,toBottom:0,toLeft:0}
//	distance.toTop = obj.y - basey;				//ebs框架上边框高度
//	distance.toRight = area.w - obj.x;
//	distance.toBottom = area.h - obj.y;
//	distance.toLeft = obj.x - basex;			//ebs左查询栏宽度
//	
//	var temp = [];
//	temp[distance.toTop] = "t";
//	temp[distance.toRight] = "r";
//	temp[distance.toBottom] = "b";
//	temp[distance.toLeft] = "l";
//	
//	//返回与相对目标 边距最小的一边
//	return temp[Math.min(distance.toTop,distance.toRight,distance.toBottom,distance.toLeft)];	
//}

da.extend({
	
		//判断一个点所处呈现页面的某区域判断
		/*
			pos: 需判断点坐标（pos为null直接返回"center"）		{ left:100, top:200 }
			size; 对象尺寸 														{ width:100, height:200 }
		*/
		inPageArea: function(pos,size){
				if( null == da.isNull( pos, null ) ) return "center";
				
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
	var daTipCache = {};
	
	//构造函数
	/*
		sTitle:	daTip标题
		sHtml: daTip内容HTML
		objTarget: 提示目标DOM对象
		nPointer: 用户自定义daTip指针方向
		fnEvents: daTip绑定事件
		objParent: daTip所处DOM对象
	*/
	var daTip = function( sTitle, sHtml, objTarget, nPointer, fnEvents, objParent ){
			var tmpObj1 = da( objTarget ),
					tmpObj2 = undefined;
					
			//获取缓存对象
			if( 0 < tmpObj1.dom.length )
				tmpObj2 = da.data( tmpObj1.dom[0] ,"daTip");				
			
			if( undefined == tmpObj2 ){												//如果没有缓存对象就new一个																						
				tmpObj2 = new daTip.fnStruct.init( sTitle, sHtml, objTarget, nPointer, fnEvents, objParent );
				
				if( undefined !== tmpObj1.dom[0] )
					da.data( tmpObj1.dom[0] ,"daTip", tmpObj2);		//压入缓存
				
			}
			else					
				tmpObj2.show();																//如果已经存在直接显示
			
			return tmpObj2;
	};
	
	daTip.fnStruct = daTip.prototype = {
			tipObj: null,								//提示框容器对象
			tipId: "",									//提示框DOM对象id
			tipCloseBt: null,						//提示框关闭按钮DOM对象
			tipTarget: null,						//提示目标DOM对象
			tipParentObj: null,					//daTip所处DOM对象
			tipTableObj: null,					//daTip样式table结构 DOM对象
			tipPointers: null,					//daTip样式指针DOM对象集
			tipUserPointer: null,				//用户自定义daTip指针方向
			
			isLoaded:	false,						//daTip对象是否已经加载过一次
			tipState: "hide",						//daTip对象的显示状态"hide","show"
			//daTip初始化函数
			/*
				sTitle:	daTip标题
				sHtml: daTip内容HTML
				objTarget: 提示目标DOM对象
				nPointer: 用户自定义daTip指针方向
				fnEvents: daTip绑定事件
				objParent: daTip所处DOM对象
			*/
			init: function( sTitle, sHtml, objTarget, nPointer, fnEvents, objParent ){
				this.tipParentObj = objParent || doc.body;
				this.tipTarget = objTarget || undefined;
				
				do{
					this.tipId = "daTip"+ ( new Date ).getTime();						//避免重复id
				}
				while( null != doc.getElementById( this.tipId ) );
				
				this.tipPointers = {	
					p87: null,
					p89: null,
					p69: null,
					p63: null,
					p23: null,
					p21: null,
					p41: null,
					p47: null
				};
				this.tipUserPointer = da.isNull( nPointer, undefined );
				
				this.create( sTitle, sHtml, objTarget );
				this.show();
				this.bindEvent( fnEvents );
				this.isLoaded = true;
				daTipCache[ this.tipId ] = this;						//放入缓存，便于批量操作
			},
			
			//提示框DOM创建函数
			/*
				sTitle:	daTip标题
				sHtml: daTip内容HTML
				objTarget: 提示目标DOM对象
			*/
			create: function( sTitle, sHtml, objTarget ){
					sTitle = sTitle || "温馨提示：";
					sHtml = sHtml || '<div style="width:200px;height:50px;line-height:22px;">&nbsp;&nbsp;&nbsp;&nbsp;关于温馨提示的内容，请您参详该页面的说明文字，谢谢！</div>';
			
					var tipId = this.tipId,
							tipObj = doc.createElement("DIV");
							tipTableObj = null;
					
					
					this.tipParentObj.appendChild(tipObj);
					this.tipObj = tipObj;
					
					tipObj.id = tipId;
					tipObj.style.left = "0px";
					tipObj.style.top = "0px";
					tipObj.className = "daTip";
					tipObj.innerHTML = ['<table id="', tipId, '_tb" class="daTipTable" cellpadding="0" cellspacing="0">',
																'<tr>',
																	'<td class="daTipTL"></td>',
																	'<td class="daTipT">',
																	'<div class="daTipTitle">', sTitle, '</div>',
																	'</td>',
																	'<td class="daTipTR"></td>',
																'</tr>',
																'<tr>',
																	'<td class="daTipL"></td>',
																	'<td class="daTipMid">',
																		sHtml,
																	'</td>',
																	'<td class="daTipR"></td>',
																'</tr>',
																'<tr>',
																	'<td class="daTipBL"></td><td class="daTipB"></td><td class="daTipBR"></td>',
																'</tr>',
															'</table>',
															'<div id="', tipId, '_p87" class="daTipP87"></div>',
															'<div id="', tipId, '_p89" class="daTipP89"></div>',
															'<div id="', tipId, '_p69" class="daTipP69"></div>',
															'<div id="', tipId, '_p63" class="daTipP63"></div>',
															'<div id="', tipId, '_p23" class="daTipP23"></div>',
															'<div id="', tipId, '_p21" class="daTipP21"></div>',
															'<div id="', tipId, '_p41" class="daTipP41"></div>',
															'<div id="', tipId, '_p47" class="daTipP47"></div>',
															
															'<a id="', tipId, '_CloseBt" class="daTipCloseBt" href="javascript:void(0);" onclick=""></a>',
														].join( "" );
					
					//da.copy(this.tipParentObj.outerHTML);
					
					this.tipPointers.p87 = doc.getElementById( tipId + "_p87" );
					this.tipPointers.p89 = doc.getElementById( tipId + "_p89" );
					this.tipPointers.p69 = doc.getElementById( tipId + "_p69" );
					this.tipPointers.p63 = doc.getElementById( tipId + "_p63" );
					this.tipPointers.p23 = doc.getElementById( tipId + "_p23" );
					this.tipPointers.p21 = doc.getElementById( tipId + "_p21" );
					this.tipPointers.p41 = doc.getElementById( tipId + "_p41" );
					this.tipPointers.p47 = doc.getElementById( tipId + "_p47" );
					
					this.tipTableObj = tipTableObj = doc.getElementById( tipId + "_tb" );
					this.tipCloseBt = doc.getElementById( tipId + "_CloseBt" );
					
					//根据信息框内容，调整信息框容器DIV对象的尺寸
					var da_tipTableObj = da( tipTableObj );
					da( this.tipObj ).css( {width: da_tipTableObj.outerWidth(), height:da_tipTableObj.outerHeight() } ); 
			},
			
			//daTip事件绑定函数
			/*
				fnEvents: daTip绑定事件
			*/
			bindEvent: function( fnEvents ){
				if( fnEvents )
					da.eventBind( this.tipObj, fnEvents);
				
				var context = this;
				da.eventBind( this.tipCloseBt, {click: function(){
					context.hide();
				}} );
				
			},
			
			//显示提示框
			show: function(){
					if( this.isLoaded ) {
							da( this.tipObj ).css("display","block");
					}
					else{
							var da_targetObj = da( this.tipTarget ),
									da_tipObj = da( this.tipObj ),
									objPos = da_targetObj.pos(),
									pNum = this.tipUserPointer = this.tipUserPointer || da.inPageArea( objPos, {width: da_tipObj.width(), height: da_tipObj.height()} );
							
							da( this.tipPointers[ "p" + pNum ] ).css("display","block");
		
							//根据箭头的指向，摆放信息框的位置
					  	switch( pNum ){
					  		case "87":
					  			objPos.top += da_targetObj.outerHeight();
					  			break;
					  		case "89": 
					  			objPos.top += da_targetObj.outerHeight();
									objPos.left -= ( da_tipObj.outerWidth() - 30 );
					  			break;
					  		case "69": 
									objPos.top -= 15;
									objPos.left -= ( da_tipObj.outerWidth() );
									break;
					  		case "63": 
									objPos.top -= ( da_tipObj.outerHeight() - 30 );
									objPos.left -= da_tipObj.outerWidth();
									break;
					  		case "23": 
									objPos.top -= da_tipObj.outerHeight();
									objPos.left -= ( da_tipObj.outerWidth() - 30 );
					  		  break;
					  		case "21": 
									objPos.top -= da_tipObj.outerHeight();
									break;
					  		case "41": 
									objPos.top -= ( da_tipObj.outerHeight() - 30 );
									objPos.left += da_targetObj.outerWidth();
									break;
					  		case "47": 
									objPos.top -= 15;
									objPos.left += da_targetObj.outerWidth();
									break;
								case "center":
									var da_Win = da(window),
											winWidth = parseInt( da_Win.width(), 10 ) || 0,
											winHeight = parseInt( da_Win.height(), 10 ) || 0;
											
									objPos.top = ( winHeight - da_tipObj.height() ) / 2;
									objPos.left = ( winWidth - da_tipObj.width() ) / 2;
									
									break;
									
					  	}
					  	
							da_tipObj.offset( {left:objPos.left, top:objPos.top} );
					}
					
					this.tipState = "show";				//改变daTip的显示状态
			},
			
			//隐藏提示框
			hide: function(){
					da( this.tipObj ).css( "display","none" );
					this.tipState = "hide";				//改变daTip的显示状态
			}
			
	};
	
	//显示所有的daTip信息框
	daTip.show = function(){
		for( var id in daTipCache) if( "hide" == daTipCache[ id ].tipState ) daTipCache[ id ].show();
	};
	
	//隐藏所有的daTip信息框
	daTip.hide = function(){
		for( var id in daTipCache) if( "show" == daTipCache[ id ].tipState ) daTipCache[ id ].hide();
	};
	
	//对象继承da类属性
	daTip.fnStruct.init.prototype = daTip.prototype;
	
	
	//全局变量
	win.daTip = daTip;
	
} )( window );