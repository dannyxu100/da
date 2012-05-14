/*
	author: danny.xu
	date:		2011-5-26 13:00:28
	description: 	地图应用 daMap 插件脚本文件
*/

(function( win ){

	var doc = win.document;
	
	var _MapImgSize = 256,																								//地图底图大小 单位px
			_AutoMovePixel = 10,																							//导航条控制，地图自动平移单位步长
			_daMapLoadingImg = " /plugins/daMap/images/daMapLoading.jpg ",		//地图底图预加载加载loading图片路径
			_daMapErrorImg = " /plugins/daMap/images/daMapError.jpg ",				//地图底图图片加载失败后，显示提示图片路径
			_daMapTransparent = " /plugins/daMap/images/transparent.png ",		//地图底图预加载加载透明0px图片路径
			_Friction =0.5;																										//地图平移惯性 摩擦系数
			
	var daMap = (function(){
		//daMap类构造函数
		/*
		*/
		var daMap = function( setting ){
			return new daMap.fnStruct.init( setting );
		};
		
		
		daMap.fnStruct = daMap.prototype = {
			version: "daMap 1.0  \n\nauthor: danny.xu\n\ndate: 2011-5-26 13:08:00\n\nThank you!!!",
			
			mapId: 0,
			mapParentObj: null,
			mapObj: null,
			
			daMapBaseMapObj: null,						//底图画布da对象
			daMapImgObj: null,								//叠图画布da对象
			daMapCanvasObj: null,							//绘图画布da对象
			daMapDataObj: null,								//数据画布da对象
			daMapToolsObj: null,							//地图操作工具集画布da对象
			
			daCoordBarObj: null,							//鼠标经纬度显示条
			
			daToolBarObj: null,								//系统工具按钮层da对象
			daToolBarBtObj: null,							//系统工具按钮层 开关da对象
			
			daNavBarObj: null,								//地图导向操作条da对象
			daNavBarBtObj: null,							//地图导向操作条 开关da对象
			
			daMiniBoxObj: null,								//鹰眼对象
			daMiniBoxBtObj: null,							//鹰眼工具 开关对象
			daMapMiniObj: null,								//鹰眼窗口daMap对象
			
			daSplitterObj: null,							//级数滑块da对象
			daZoomActObj: null,								//滚轮放大缩小动画对象
			daCrossObj: null,									//十字定位动画对象
			
			daLoadingObj: null,								//数据加载daLoading对象
			daMapPop: null,										//气泡信息窗口对象
			
//			navBarObjs: null,									//导航条DOM对象集合
//			toolBarObjs: null,								//工具条DOM对象集合
			
			setting: {
				parent: null,										//父亲节点
				
				width: 0,
				height: 0,
				
				bgOut: "#f0f0f0",
				bgIn: "#f0f0f0",
				
				act: true,
				
				toolBar: true,
				navBar: true,
				coordBar: true,
				mini: true,
				move: true,
				changSize: true,
				zoomAct: true,
				cross: true,
				
				maxLevel: 11,										//最大地图级数
				initLevel: 1,										//初始化显示级数
				titleLevel: 5,									//显示地图标签标题的级数
				
				url: null,											//地图图片服务器URL地址 支持多底图方式 如：[ ["http://127.0.0.1:5053/map/cd/", "png"], ["http://127.0.0.1:5053/map/cd_star/", "jpg"] ]
				urlImg: null,										//叠图图片服务器URL地址
				
				range: null,										//地图全视图经纬度范围 [ minLongitude, minLatitude, maxLongitude, maxLatitude ];
				center: null,										//地图自定义中心
				
				imageType: "jpg",									//单底图和 默认地图格式
				
				change: null,										//地图数据改变 回调用户自定义事件
				clear: null,										//地图清除操作 回调用户自定义事件
				changeURL: null,									//变更地图图片服务器URL
				
				debug: false,										//debug模式
				
				menu:[]
			},
			
			mapCatercorner: 0,								//地图对角线距离
			mapCurrentLevel: 0,								//地图当前显示级数
			
			mapBaseX: 0,											//当前可视区域屏幕左上坐标位置
			mapBaseY: 0,
			mapViewWidth: 0,									//当前可视区域的宽度和高度
			mapViewHeight: 0,
			
			mapLeft: 0,												//当前地图底图的偏移位置
			mapTop: 0,
			mapMapWidth: 0,
	
			mapViewCoord: {										//可视区域的经纬度坐标 范围/中点
				minLongitude: 0,
				minLatitude: 0,
				maxLongitude: 0,
				maxLatitude: 0,
				
				midLongitude: 0,
				midLatitude: 0
			},
			
			mapViewImg: {											//可视区域的底图图片的矩阵编号,步长为1 (该值均从1开始)
				nMinX: 0,
				nMinY: 0,
				nMaxX: 0,
				nMaxY: 0
			},
			
			mapBaseMapLayers: null,						//地图底图图层列表
			mapLoadedBaseMaps: null,					//当前级底图矩阵 已经加载过标志，无需在地图平移时重复创建DOM
			mapImgLayers: null,								//地图叠图图层列表
			mapLoadedImgs: null,							//当前级叠图矩阵 已经加载过标志，无需在地图平移时重复创建DOM
			mapDataLayers: null,							//数据图层列表

			mapMousePos: {										//当前鼠标在地图中的相对位置
				left: 0,
				top: 0
			},
			mapMouseCoord: {									//当前鼠标的经纬度坐标
				latitude: 0,
				longitude: 0
			},
			
			
			/**初始化函数
			*/
			init: function( setting ){
				setting = this.setting = da.extend( {}, this.setting, setting );
				if( null == setting.range || 4 > setting.range.length ) {alert("daMap提示:对不起，您传入的地图范围有误。"); return false;}
				if( !this.initURL() ) { alert("daMap提示:对不起，您给的地图图片服务器地址有误。"); return false; }
				
				this.mapParentObj = doc.getElementById( setting.parent ) || doc.body;
				
				while( null !== doc.getElementById( "daMap_" + this.mapId ) ) this.mapId++;
				
				this.createMap();
			},
			
			/**验证并修正URL地址参数
			*/
			initURL: function(){
				var setting = this.setting,
					arrImgURL = [];
				
				if( null == setting.url ) return false;
				else{
					if( "string" === typeof setting.url ){								//单底图模式
						// if( da.isHTTP( setting.url ) ) setting.url = [ [setting.url, setting.imageType] ];		//修正URL地址
						// else return false;
						
						setting.url = [ [setting.url, setting.imageType] ];
					}
					else if( da.isArray( setting.url ) ){
						var arrURL = setting.url;
						
						for( var i=0,len = arrURL.length; i<len; i++ ){																										//多底图模式 需要验证每一个 底图图片服务器的地址有效性
							if( !arrURL[i] /*|| !da.isHTTP( arrURL[i][0] )*/ ) return false;
						}
						
						if( 1 < setting.url.length ){																																	//多底图模式 从第二个地址开始 算作叠图地址
							arrImgURL = arrURL.slice( 1 );
							arrURL.splice( 1, arrURL.length-1 );
						}
						
					}
					
					if( null == setting.urlImg ) setting.urlImg = arrImgURL;
					else{
						if( "string" === typeof setting.urlImg ){ 																																//单底图模式
							// if( da.isHTTP( setting.url ) ) setting.url = [ [setting.url, setting.imageType] ];		//修正URL地址
							// else return false;
							
							setting.url = [ [setting.url, setting.imageType] ];
							
						}
						if( da.isArray( setting.urlImg ) ){
							var arrImgURL = setting.urlImg;
							
							for( var i=0,len = arrImgURL.length; i<len; i++ ){																							//多底图模式 需要验证每一个 底图图片服务器的地址有效性
								if( !arrImgURL[i] /*|| !da.isHTTP( arrImgURL[i][0] )*/ ) return false;
							}
						}
							
					}
					
					return true;
					
				}
				
			},
			
			/**更改设置地图图片服务器地址
			*/
			setURL: function(){
					var starBt = da( "#daMap_toolStar_" + this.mapId ).dom[0],
							urlOld = this.setting.url, 
							urlImgOld = this.setting.urlImg,
							urlNew;
							
    			urlNew = this.setting.changeURL.call( starBt, this.setting.url, this.setting.urlImg, this.setting, this );
    			this.setting.url = urlNew;
    			this.setting.urlImg = null;
    			
    			if( !this.initURL() ) { 
    				alert("daMap提示:对不起，您给的地图图片服务器地址有误。"); 
      			this.setting.url = urlOld;
      			this.setting.urlImg = urlImgOld;
    				return false; 
    			}
    			
					for( var i=0,len=this.setting.urlImg.length; i<len; i++ ){							//填补一开始未创建的叠图图层
						if( !this.mapImgLayers[i] )
							this.appendLayer({ id: "map_" + this.mapId + "_" +i }, true );
							
					}
					this.refresh();
			},
			
			/**初始化地图
			*/
			createMap: function(){
					var setting = this.setting,
						daParentObj = da( this.mapParentObj ),
						posParent = daParentObj.offset(),
						objMapCanvas, objMapBaseMap, objMapImg, objMapData, objMapTools;
					
					this.mapBaseMapLayers = [];
					this.mapLoadedBaseMaps = [];
					this.mapImgLayers = [];
					this.mapLoadedImgs = [];
					this.mapDataLayers = [];
					
					this.mapCatercorner = daMap.getCatercorner( setting.range );		//计算地图对角线距离
					this.mapCurrentLevel = setting.initLevel;
					
					this.mapBaseX = posParent.left;
					this.mapBaseY = posParent.top;
					
					this.mapViewWidth = setting.width || daParentObj.width() ;
					this.mapViewHeight = setting.height || daParentObj.height() ;

					var maxSize = Math.pow( 2, this.mapCurrentLevel-1 ) * _MapImgSize;		//一张地图底图宽度为256px, 每一级 横向和纵向 显示的张数都是2的（地图级数-1）次方张。
					this.mapLeft = ( this.mapViewWidth - maxSize ) / 2;	// + basex;				//居中显示
					this.mapTop = ( this.mapViewHeight - maxSize ) / 2;	// + basey;
					
					//daParentObj.css("overflow","hidden");																	//设置父亲节点越边界属性为隐藏
					//daParentObj.css("overflow","hidden").attr("popmenu","showpopupmenu()");
					
					this.mapObj = doc.createElement("div");																//地图容器对象
					this.mapObj.id = "daMap_" + this.mapId;
					this.mapObj.style.cssText = "position:relative;overflow:hidden;background:"+ this.setting.bgOut +";border:0px dashed #333";
					da( this.mapObj ).width( this.mapViewWidth );
					da( this.mapObj ).height( this.mapViewHeight );
					this.mapParentObj.insertBefore( this.mapObj, null );
					
					objMapBaseMap = doc.createElement("div");															//底图画布
					objMapBaseMap.id = "daMap_BaseMap_" + this.mapId;
					objMapBaseMap.style.cssText = "position:absolute; z-index:0;background:"+ this.setting.bgIn +";border:0px solid #f00;";	//objMapBaseMap.innerHTML = "BaseMap";
					this.daMapBaseMapObj = da( objMapBaseMap );
					
					objMapImg = doc.createElement("div");																	//叠图画布
					objMapImg.id = "daMap_Img_" + this.mapId;
					objMapImg.style.cssText = "position:absolute; z-index:5;border:0px solid #ff0";	//objMapImg.innerHTML = "Images";
					this.daMapImgObj = da( objMapImg );
					
					objMapCanvas = doc.createElement("div");															//绘图画布
					objMapCanvas.id = "daMap_Canvas_" + this.mapId;
					objMapCanvas.style.cssText = "position:absolute; z-index:10; border:0px solid #00f"; //objMapCanvas.innerHTML = "Canvas";
					this.daMapCanvasObj = da( objMapCanvas );
					
					objMapData = doc.createElement("div");																//数据对象画布
					objMapData.id = "daMap_Data_" + this.mapId;
					objMapData.style.cssText = "position:absolute; z-index:20; border:0px solid #0ff";		//objMapData.innerHTML = "Data";
					this.daMapDataObj = da( objMapData );
					
					objMapTools = doc.createElement("div");																//地图工具条画布
					objMapTools.id = "daMap_Tools_" + this.mapId;
					objMapTools.style.cssText = "position:absolute; z-index:30; border:0px solid #0f0";	//objMapTools.innerHTML = "Tool";
//					da( objMapTools ).width( this.mapViewWidth );
//					da( objMapTools ).height( this.mapViewHeight );
					this.daMapToolsObj = da( objMapTools );
					
					this.mapObj.insertBefore( objMapBaseMap, null );
					this.mapObj.insertBefore( objMapImg, null );
					this.mapObj.insertBefore( objMapCanvas, null );
					this.mapObj.insertBefore( objMapData, null );
					this.mapObj.insertBefore( objMapTools, null );
//					this.daMapCanvasObj.css({ left: this.mapLeft, top: this.mapTop });
//					this.daMapImgObj.css({ left: this.mapLeft, top: this.mapTop });
//					this.daMapDataObj.css({ left: this.mapLeft, top: this.mapTop });
//					this.daMapToolsObj.css({ left: 0, top: 0 });
//					this.daMapToolsObj.offset({ left: this.mapLeft, top: this.mapTop });

					this.appendLayer({ id: "mapPrev_" + this.mapId }, null, true );
					this.appendLayer({ id: "mapBaseMap_" + this.mapId }, null, true );
					
					for( var i=0,len=setting.urlImg.length; i<len; i++ ){
						this.appendLayer({ id: "mapImg_" + this.mapId + "_" +i }, true );
					}
					
					this.appendLayer({ id: "mapPop_" + this.mapId, zIndex: 20000 });
					
					if( this.setting.zoomAct )this.createZoomAct();																//初始化地图操作导航条、工具条、经纬度信息条、鹰眼等等			
					if( this.setting.navBar ) this.createNavBar();
					if( this.setting.toolBar ) this.createToolBar();
					if( this.setting.coordBar ) this.createCoordBar();
					if( this.setting.mini ) this.createMiniBox();
					if( this.setting.cross ) this.createCross();
					
					this.toInit();
					this.change( this.mapCurrentLevel );			//地图信息发生改变，触发change事件
					
					this.bindEvent();													//绑定地图公共事件
			},
			
			/**定位线
			*/
			createCross: function(){
				this.daCrossObj = {};
				
				var obj = doc.createElement("div");
				obj.id = "daMap_crossTop_" + this.mapId;
				obj.style.cssText = "display:none; position:absolute; z-index:0;left:"+( this.mapViewWidth/2 - 1 ) +"px;top:0px;width:2px;height:"+ this.mapViewHeight +"px;background:#f00;border-right:1px solid #999;";
				
				this.daMapToolsObj.dom[0].insertBefore( obj, null );
				this.daCrossObj.top = da( obj );
				
				obj = doc.createElement("div");
				obj.id = "daMap_crossRight_" + this.mapId;
				obj.style.cssText = "display:none; position:absolute; z-index:0;left:0px;top:" + (this.mapViewHeight/2 + 1) +"px;width:"+ this.mapViewWidth +"px;height:2px;background:#f00;border-bottom:1px solid #999;overflow:hidden;font-size:0px;";
				
				this.daMapToolsObj.dom[0].insertBefore( obj, null );
				this.daCrossObj.right = da( obj );
				
				obj = doc.createElement("div");
				obj.id = "daMap_crossBottom_" + this.mapId;
				obj.style.cssText = "display:none; position:absolute; z-index:0;left:"+( this.mapViewWidth/2 - 1 ) +"px;top:0px;width:2px;height:"+ this.mapViewHeight +"px;background:#f00;border-right:1px solid #999";
				
				this.daMapToolsObj.dom[0].insertBefore( obj, null );
				this.daCrossObj.bottom = da( obj );
				
				obj = doc.createElement("div");
				obj.id = "daMap_crossLeft_" + this.mapId;
				obj.style.cssText = "display:none; position:absolute; z-index:0;left:0px;top:" + (this.mapViewHeight/2 + 1) +"px;width:"+ this.mapViewWidth +"px;height:2px;background:#f00;border-bottom:1px solid #999;overflow:hidden;font-size:0px;";
				
				this.daMapToolsObj.dom[0].insertBefore( obj, null );
				this.daCrossObj.left = da( obj );
				
			},
			
			/**初始化经纬度信息条
			*/
			createMiniBox: function(){
				var miniBoxObj = doc.createElement("div"),
						boxWidth = this.mapViewWidth/5,
						boxHeight = this.mapViewHeight/5;
						
				miniBoxObj.id = "daMap_miniBox_" + this.mapId;
				miniBoxObj.style.cssText = "position:absolute; z-index:0;left:"+ ( this.mapViewWidth - boxWidth ) +"px;top:"+ this.mapViewHeight 
				+"px;width:"+ boxWidth +"px;height:"+ boxHeight +"px;background:#f7f7f7;border:solid #666;border-width:1px 0px 0px 1px;padding:2px";
				
				this.daMapToolsObj.dom[0].insertBefore( miniBoxObj, null );
				this.daMiniBoxObj = da( miniBoxObj );
				this.daMapMiniObj = daMap({
					parent: "daMap_miniBox_" + this.mapId,
					initLevel: this.mapCurrentLevel - 1,
					maxLevel: 5,
					url: this.setting.url,
					urlImg: this.setting.urlImg,
					imageType: "png",
					range: this.setting.range,
					center: this.setting.center,
					
					bgOut: "#f7f7f7",
					bgIn: "#f7f7f7",
					mini: false,
					
					toolBar: false,
					navBar: false,
					coordBar: false,
					move: false,
					zoomAct: false
					
				});
				
				miniBoxObj = doc.createElement("div");
				miniBoxObj.style.cssText = "position:absolute; z-index:1;left:"+ ( this.mapViewWidth - 35 ) +"px;top:"+ ( this.mapViewHeight - 22 ) +"px;cursor:pointer;background:#f7f7f7;border:0px solid #333;color:#666;font-family:webdings";
				miniBoxObj.title = "显示鹰眼，快捷键“~”";
				miniBoxObj.innerHTML = "5";
				this.daMapToolsObj.dom[0].insertBefore( miniBoxObj, null );
				this.daMiniBoxBtObj = da( miniBoxObj );
				
				var context = this;
				da( miniBoxObj ).bind( "click", function(evt){
					if( "6" === this.innerHTML )
						daMap.actSlideTools( context, "miniBox", true );						//隐藏鹰眼BOX
					else
						daMap.actSlideTools( context, "miniBox" );									//显示鹰眼BOX
						
				});
				
			},
			
			/**初始化鼠标滚轮放大缩小动画
			*/
			createZoomAct: function(){
				var actObj = doc.createElement("div");
				actObj.id = "daMap_zoomAct_" + this.mapId;
				actObj.className = "daMapZoomAct";
				
				this.daMapToolsObj.dom[0].insertBefore( actObj, null );
				this.daZoomActObj = da( actObj );
				
				this.daZoomActObj.pos( this.mapMousePos );
			},
			
			/**初始化经纬度信息条
			*/
			createCoordBar: function(){
				var coordObj = doc.createElement("div");
				coordObj.id = "daMap_coord_" + this.mapId;
				coordObj.className = "daMapCoordBar";
				coordObj.innerHTML = "经度：0， 纬度：0";
				
				this.daMapToolsObj.dom[0].insertBefore( coordObj, null );
				this.daCoordBarObj = da( coordObj );
				
			},
			
			/**初始化地图操作工具条
			*/
			createToolBar: function(){
					var toolObj = doc.createElement("div");
					toolObj.id = "daMap_toolBar_" + this.mapId;
					toolObj.style.cssText = "Z-INDEX: 0; position:absolute;left:0px; top:0px; WIDTH: 280px; HEIGHT: 38px";
					
					var toolsHTML = [
								'<table cellSpacing=0 cellPadding=0 border=0>',
									'<tr>',
											( this.setting.changeURL ? ['<td id="daMap_toolStar_', this.mapId,'" class="maptool_star" title="模式切换" ></td>'].join("") : "" ),
											'<td id="daMap_toolPlus_', this.mapId,'" class="maptool_plus" title="放大" ></td>',
											'<td id="daMap_toolMinus_', this.mapId,'" class="maptool_minus" title="缩小" ></td>',
											'<td id="daMap_toolMove_', this.mapId,'" class="maptool_move" title="平移" ></td>',
											'<td id="daMap_toolCenter_', this.mapId,'" class="maptool_select" title="居中还原" ></td>',
											'<td id="daMap_toolDist_', this.mapId,'" class="maptool_measure" ></td>',
									'</tr>',
								'</table>'
					].join("");
				
				toolObj.innerHTML = toolsHTML;
				this.daMapToolsObj.dom[0].insertBefore( toolObj, null );
				
				this.daToolBarObj = da( toolObj );
				
				this.daToolBarObj.css({ left:this.mapViewWidth - ( this.setting.changeURL ? 270 : 210 ), top:10 });
	//			this.daToolBarObj.bind("mouseover",function(){hidemapxy();}).bind("mouseout",function(){showmapxy();})			//danny.xu 2010-8-4 取消定位线显示
	//			da( "td[class1]", this.daToolBarObj )
	//			.bind("mouseover",function(){navmouseover(this)}) ssss
	//			.bind("mouseout",function(){navmouseout(this)})
	//			.each(
	//			function()
	//			{
	//				//$(this).addClass($(this).attr("class1")) ;
	//			}) ;
				toolObj = doc.createElement("div");																//工具条显示 隐藏按钮
				toolObj.style.cssText = "position:absolute; z-index:1;left:"+ ( this.mapViewWidth-35 ) +"px;top:18px;cursor:pointer;background:#f7f7f7;border:0px solid #333;color:#666; font-family:webdings";
				toolObj.title = "隐藏工具条，快捷键“~”";
				toolObj.innerHTML = "4";
				this.daMapToolsObj.dom[0].insertBefore( toolObj, null );
				this.daToolBarBtObj = da( toolObj );
				
				var context = this;
				da( toolObj ).bind( "click", function(evt){
					if( "4" === this.innerHTML )
						daMap.actSlideTools( context, "toolBar", true );						//隐藏工具条
					else
						daMap.actSlideTools( context, "toolBar" );									//显示工具条
				});
				
			},
			
			/**初始化地图操作导航条
			*/
			createNavBar: function(){
					var navObj = doc.createElement("div");
					navObj.id = "daMap_navBar_" + this.mapId;
					navObj.style.cssText = "position:absolute; z-index: 0; left:300px;top:20px; width:58px; height:100px;";
					
					var navigatorHTML = [
								'<table cellSpacing=0 cellPadding=0 border=0>',
									'<tr>',
											'<td class="mapnav_topLeft"></td>',
											'<td id="daMap_navTop_', this.mapId,'" class="mapnav_top" title="向上平移" ></td>',
											'<td class="mapnav_topRight"></td>',
									'</tr>',
									'<tr>',
											'<td id="daMap_navLeft_', this.mapId,'" class="mapnav_middleLeft" title="向左平移" ></td>',
											'<td id="daMap_navMiddle_', this.mapId,'" class="mapnav_middle" title="居中还原" ></td>',
											'<td id="daMap_navRight_', this.mapId,'" class="mapnav_middleRight" title="向右平移" ></td>',
									'</tr>',
									'<tr>',
											'<td class="mapnav_bottomLeft"></td>',
											'<td id="daMap_navBottom_', this.mapId,'" class="mapnav_bottom" title="向下平移" ></td>',
											'<td class="mapnav_bottomRight"></td>',
									'</tr>',
								'</table>',
								'<table cellSpacing=0 cellPadding=0 border=0>',
								'<tr height=5><td></td></tr>',
								'</table>',
								'<table cellSpacing=0 cellPadding=0 border=0>',
									'<tr>',
											'<td width=18></td>',
											'<td id="daMap_navPlus_', this.mapId,'" class="mapnav_plus" title="放大" ></td>',
											'<td width=22></td>',
									'</tr>',
									'<tr>',
											'<td width=18></td>',
											'<td class="mapnav_back" style="height:30px;"></td>',
											'<td width=22></td>',
									'</tr>',
									'<tr>',
											'<td width=18></td>',
											'<td id="daMap_navMinus_', this.mapId,'" class="mapnav_minus" title="缩小" ></td>',
											'<td width=22></td>',
									'</tr>',
								'</table>',
								'<span id="daMap_navSplitter_', this.mapId,'" class="mapnav_splitter" style="z-index: 1;position:absolute;top:0px;left:0px;text-align:center;font-size:8px;color:#f7f7f7;"></span>'
					].join("");
				
				navObj.innerHTML = navigatorHTML;
				this.daMapToolsObj.dom[0].insertBefore( navObj, null );
				
				this.daNavBarObj = da( navObj );
				this.daNavBarObj.css({ left:3, top:10, height: 110 + ( this.setting.maxLevel * 18 ) });
				this.daNavBarObj.find(".mapnav_back").css({ height: this.setting.maxLevel * 9 }) ;
	
				this.daSplitterObj = da( "#daMap_navSplitter_" + this.mapId );
				this.daSplitterObj.css({ left:18,top: 80 + ( this.setting.maxLevel - this.mapCurrentLevel)  * 9 });
				this.daSplitterObj.dom[0].innerHTML = this.mapCurrentLevel;
				
	//			this.daSplitterObj.bind("mouseover",function(){splittermover(this)})
	//			.bind("mouseout",function(){splittermout(this)})
	//			.bind("mousedown",function(){splittermdown(this)})
	//			.bind("mouseup",function(){splittermup(this)})
	//			.bind("mousemove",function(){splittermmove(this)}).dom[0].innerHTML = this.mapCurrentLevel;

				navObj = doc.createElement("div");																//工具条显示 隐藏按钮
				navObj.style.cssText = "position:absolute; z-index:1;left:-1px;top:120px;cursor:pointer;background:#f7f7f7;border:0px solid #333;color:#666;font-family:webdings";
				navObj.title = "隐藏导航条，快捷键“~”";
				navObj.innerHTML = "3";
				this.daMapToolsObj.dom[0].insertBefore( navObj, null );
				this.daNavBarBtObj = da( navObj );
				
				var context = this;
				da( navObj ).bind( "click", function(evt){
					if( "3" === this.innerHTML ){
						daMap.actSlideTools( context, "navBar", true );						//隐藏导航条
					}
					else{
						daMap.actSlideTools( context, "navBar" );									//显示导航条
					}
					
				});

			},
			
			/**地图控件公共事件绑定
			*/
			bindEvent: function(){
				var context = this;
				
				var hoverCSS = function( obj, css1, css2 ){
					da( obj ).bind("mouseover",function( evt ){
						this.className = css2;
					
					}).bind("mouseout",function( evt ){
						this.className = css1;
					
					});
				};
				
				if( this.setting.move ){
					if( "undefined" !== typeof daMenu ){																					//右键菜单
						var listParams = [];
						if( this.setting.menu.length>0 )
						{
							for(var i=0,len=this.setting.menu.length;i<len;i++)
							listParams.push( [this.setting.menu[i]["name"], this.setting.menu[i]["click"]] );
						}
						
						listParams.push( ["放大", function(){ context.zoomin(); } ] );
						listParams.push( ["缩小", function(){ context.zoomout(); } ] );
						listParams.push( ["居中", function(){
							context.toCenterByPos(function(){
								context.change( context.setting.initLevel );
							});
							
						}]);
								
						if( this.setting.changeURL ){
							listParams.push( ["地图，卫片", function(){ context.setURL(); } ] );
						}
						
						daMenu({
							target: this.mapObj,
							list: listParams
						});
					}
					
					da( win ).bind("resize",function( evt ){
						da(context.mapObj).width(da(context.mapParentObj).width())
						da(context.mapObj).height(da(context.mapParentObj).height())
						context.resize();
					});
					
					da( this.mapObj ).bind("click",function( evt ){																//地图可视区 事件绑定
						//if (distanceChecked)	dist_click();
					
					}).bind( "dblclick", function( evt ){
						daMap.mapDblclick.call( this, context, evt );
						evt.stopPropagation();evt.preventDefault();
						
					}).bind("mousedown", function( evt ){
						this.focus();
						daMap.mapMouseDown.call( this, context, evt );
						evt.stopPropagation();evt.preventDefault();
						
					}).bind("mousemove", function( evt ){
						daMap.mapMouseMove.call( this, context, evt );
						
						
					}).bind("mouseup", function( evt ){
						daMap.mapMouseUp.call( this, context, evt );
						
						
					}).bind("mousewheel", function( evt, delta ){
						daMap.mapMouseWheel.call( this, context, evt, delta  );
						evt.stopPropagation();evt.preventDefault();
						
					})
//					.bind("keydown",function( evt ){
//						daMap.mapKeyDown.call( this, context, evt );
//						evt.stopPropagation();evt.preventDefault();
//						
//					}).bind("keyup",function( evt ){
//						daMap.mapKeyUp.call( this, context, evt );
//						evt.stopPropagation();evt.preventDefault();
//	
//					}) ;
				}
				
				if( this.setting.navBar ){
					da( "#daMap_navLeft_" + this.mapId ).bind( "mousedown", function( evt ){				 		//导航条 地图自动平移按钮 事件绑定
							context.autoMove( "left", this, evt );
							evt.stopPropagation();//evt.preventDefault();
							
					}).bind("mouseup", function( evt ){
							context.stopAutoMove( this, evt );
							evt.stopPropagation();//evt.preventDefault();
							
					}).hover(function(){
						this.className = "mapnav_middleLeft2";
					},function(){
						this.className = "mapnav_middleLeft";
					});
					
					da( "#daMap_navTop_" + this.mapId ).bind( "mousedown", function( evt ){
							context.autoMove( "up", this, evt );
							evt.stopPropagation();//evt.preventDefault();
							
					}).bind("mouseup", function( evt ){
							context.stopAutoMove( this, evt );
					}).hover(function(){
						this.className = "mapnav_top2";
					},function(){
						this.className = "mapnav_top";
					});
					
					da( "#daMap_navRight_" + this.mapId ).bind( "mousedown", function( evt ){
							context.autoMove( "right", this, evt );
							evt.stopPropagation();//evt.preventDefault();
							
					}).bind("mouseup", function( evt ){
							context.stopAutoMove( this, evt );
							evt.stopPropagation();//evt.preventDefault();
					}).hover(function(){
						this.className = "mapnav_middleRight2";
					},function(){
						this.className = "mapnav_middleRight";
					});
					
					da( "#daMap_navBottom_" + this.mapId ).bind( "mousedown", function( evt ){
							context.autoMove( "down", this, evt );
							evt.stopPropagation();//evt.preventDefault();
							
					}).bind("mouseup", function( evt ){
							context.stopAutoMove( this, evt );
							evt.stopPropagation();//evt.preventDefault();
					}).hover(function(){
						this.className = "mapnav_bottom2";
					},function(){
						this.className = "mapnav_bottom";
					});
					
					daDrag({
						src: this.daSplitterObj.dom[0],
						target: this.daSplitterObj.dom[0],
						cursor: "s-resize",
						before: function(){
							context.MapSplitterDraging = true;
						},
						
						move:	function( evt, srcObj, targetObj, oldPos, nowPos, prevMousePos, nowMousePos ){
							var minY = 80,																											//80 + ( context.setting.maxLevel - context.mapCurrentLevel)  * 9
									maxY = 80 + ( context.setting.maxLevel - 1 )  * 9,
									n, newLevel;
									
							nowPos.y = ( nowPos.y > maxY ) ? maxY : nowPos.y;
							nowPos.y = ( nowPos.y < minY ) ? minY : nowPos.y;
					
							n = context.setting.maxLevel - ( nowPos.y - 80 ) / 9,
							newLevel = parseInt( n );						
//							nowPos.y = 80 + ( context.setting.maxLevel - newLevel )  * 9;
							
							srcObj.innerHTML = newLevel;
//							daMap.actResize( context, n );
							if( context.mapCurrentLevel !== newLevel )
							context.change( newLevel );

							return { x: 18, y: nowPos.y }							//y不能变，x不能超出范围
						}
						
					});
					
				}
				
				if( this.setting.toolBar ){
					this.daToolBarObj.bind( "dblclick mousedown mouseup mousemove mousewheel", function(evt){
							evt.stopPropagation();//evt.preventDefault();
					});
				}
				
				if( this.setting.mini ){
					this.daMiniBoxObj.bind( "dblclick mousedown mouseup mousemove mousewheel", function(evt){
							evt.stopPropagation();//evt.preventDefault();
					});
				}
				
				if( this.setting.changeURL ){
					da( "#daMap_toolStar_" + this.mapId ).bind( "click", function( evt ){							//地图底图地址变更按钮 事件绑定
							context.setURL();
					
					});
				}
				
				da( "#daMap_navPlus_" + this.mapId +", #daMap_toolPlus_" + this.mapId )
				.bind( "click", function(evt){																											//导航条&工具条 放大缩小按钮 事件绑定
						context.zoomin( context.mapViewWidth/2, context.mapViewHeight/2 );
						evt.stopPropagation();//evt.preventDefault();
				}).hover(function(){
						this.className = this.className + "2";
				},function(){
						this.className = this.className.substring( 0, this.className.length-1 );
				});
				da( "#daMap_navMinus_" + this.mapId +", #daMap_toolMinus_" + this.mapId )
				.bind( "click", function(evt){
						context.zoomout( context.mapViewWidth/2, context.mapViewHeight/2 );
						evt.stopPropagation();//evt.preventDefault();
				}).hover(function(){
						this.className = this.className + "2";
				},function(){
						this.className = this.className.substring( 0, this.className.length-1 );
				});
				da( "#daMap_navMiddle_" + this.mapId +", #daMap_toolCenter_" + this.mapId )					//导航条&工具条 全视图按钮 事件绑定
				.bind( "click", function(evt){
						context.toInit();
						//evt.stopPropagation();//evt.preventDefault();
						
				}).hover(function(){
						this.className = this.className + "2";
				},function(){
						this.className = this.className.substring( 0, this.className.length-1 );
				});
				
				
				if( this.setting.zoomAct ){
					this.daZoomActObj.bind( "dblclick mousedown mouseup mousemove", function(evt){
							evt.stopPropagation();evt.preventDefault();
					});
					
					
					daKey({
						target: doc,
						keydown: function( key, ctrl, shift, alt ){
							if( "~" === key ){																						//显示或隐藏所有工具面板
								if( !context.HideAllTools ){
									daMap.actSlideTools( context, "toolBar", true );
									daMap.actSlideTools( context, "navBar", true );
									daMap.actSlideTools( context, "miniBox", true );
									context.HideAllTools = true;
								}
								else{
									daMap.actSlideTools( context, "toolBar" );
									daMap.actSlideTools( context, "navBar" );
									daMap.actSlideTools( context, "miniBox" );
									context.HideAllTools = false;
								}
								
							}
						}
					});
					
					this.daMapBaseMapObj.dom[0].focus();
					
				}
				
			},
			
			/**清除地图
			*/
			clearMap: function(){
				if( this.setting.clear )
					this.setting.clear.call( this );
				
				this.clearLayer();													//清除图层数据
				
				if( 0 < this.mapBaseMapLayers.length ){
					this.mapBaseMapLayers[0].layerObj.style.display = "block";
					this.mapBaseMapLayers[0].layerObj.innerHTML = this.mapBaseMapLayers[1].layerObj.innerHTML; //保存mapBaseMap图层的底图 到mapPrev图层，进行放大缩小过度动画
					this.mapBaseMapLayers[1].layerObj.innerHTML = "";
				}
				
				this.mapLoadedBaseMaps = [];															//比例尺发生改变，清空地图矩阵已加载标志
				this.mapLoadedImgs = [];
				
				//if (distanceChecked) initialdistance();
			},
			
			/**清除图层数据
			*/
			clearLayer: function( type, code ){
				var mapImgLayers = this.mapImgLayers,
						mapDataLayers = this.mapDataLayers;
				
				for( var i=0,len=mapImgLayers.length; i<len; i++){
					if( type || code ){
						if( type === mapImgLayers[i].layerSetting.type || code === mapImgLayers[i].layerSetting.code )
							mapImgLayers[i].clear();
					}
					else{
						mapImgLayers[i].clear();
					}
					
				}
				
				for( var i=0,len=mapDataLayers.length; i<len; i++){
					if( type || code ){
						if( type === mapDataLayers[i].layerSetting.type || code === mapDataLayers[i].layerSetting.code )
							mapDataLayers[i].clear();
					}
					else{
						mapDataLayers[i].clear();
					}
					
					if( mapDataLayers[i].TimerLoadDataLayer )
						da.clearTimer( mapDataLayers[i].TimerLoadDataLayer );					//中止数据图层的timer，这个timer在loadDataLayer()中创建
				}
				
			},	

	
			/**刷新地图
			*/
			refresh: function(){
				this.clearMap();
				this.change( this.mapCurrentLevel );
				
			},
			
			resize: function( level ){
				var x1 = this.mapLeft,							//地图底图的偏移位置
						y1 = this.mapTop;
				
			  if ( x1 > 0 ) x1 = 0;	else x1 = (-1) * x1;									//x1>0说明 客户区视图可以容纳下整个地图（将偏移量置为0）， x1<=0说明客户区刚刚容纳下整个地图 或已经装不下了（将偏移值转为正数）。
			  if ( y1 > 0 ) y1 = 0;	else y1 = (-1) * y1;
				
				this.countImg = Math.pow( 2, level - 1 ),																			//计算出当前地图级数 横/纵需要显示的底图最大张数
				
						//计算地图可视范围，显示底图编号(张数优化)
						nMinX = Math.floor( x1 / _MapImgSize ) + 1,																//1~n，返回小于等于 x1/256 的最大整，数索引值转图片编号+1 
			  		nMinY = Math.floor( y1 / _MapImgSize ) + 1,
						nMaxX = Math.ceil( ( x1 + this.mapViewWidth ) / _MapImgSize ) + 1,				//1~n，返回大于等于 x1/256 的最小整数
						nMaxY = Math.ceil( ( y1 + this.mapViewHeight ) / _MapImgSize ) + 1;
						
				if ( nMaxX > this.countImg ) nMaxX = this.countImg ;
				if ( nMaxY > this.countImg ) nMaxY = this.countImg ;
				
			  this.mapViewImg = {																//更新可视区域对应的底图图片的x、y 编号
			  	nMinX: nMinX,
			  	nMinY: nMinY,
			  	nMaxX: nMaxX,
			  	nMaxY: nMaxY
			  };
				
				this.mapMapWidth = Math.pow( 2, Math.floor(level)-1 ) * _MapImgSize ;

				this.daMapBaseMapObj.css({ width: this.mapMapWidth, height: this.mapMapWidth });
				this.daMapImgObj.css({ width: this.mapMapWidth, height: this.mapMapWidth });
				this.daMapCanvasObj.css({ width: this.mapMapWidth, height: this.mapMapWidth });
				this.daMapDataObj.css({ width: this.mapMapWidth, height: this.mapMapWidth });
				
				
			  var coordTmp1 = this.screenToCoord( 0, this.mapViewHeight ),
			  		coordTmp2 = this.screenToCoord( this.mapViewWidth, 0 );															//计算出上左右下的经纬度坐标值
			  
			  this.mapViewCoord = {																																		//更新可视区域的经纬度 坐标范围
			  	minLongitude: coordTmp1.longitude,
			  	minLatitude: coordTmp1.latitude,
			  	maxLongitude: coordTmp2.longitude,
			  	maxLatitude: coordTmp2.latitude,
			  	
			  	midLongitude: ( coordTmp1.longitude + ( coordTmp2.longitude - coordTmp1.longitude )/2 ),
			  	midLatitude: ( coordTmp1.latitude + ( coordTmp2.latitude - coordTmp1.latitude )/2 )
			  };
				
				
			},
			
			//地图数据发生改变，重新显示数据
			/*
			*	newLevel: 改变后的地图级数
			*	viewLeft: 目标点在daMap控件视图范围内的left值( 不是图层范围内哦 )
			*	viewTop: 目标点在daMap控件视图范围内的top值
			*/
			change: function( newLevel, viewLeft, viewTop ){
				if( this.MapChanging ) return;																			//MapChanging标志防止地图操作错乱
				this.MapChanging = true;
				
				viewLeft = viewLeft || this.mapViewWidth/2;
				viewTop = viewTop || this.mapViewHeight/2;
				
				var fnFinished;
				
				if ( !this.mapReady || newLevel != this.mapCurrentLevel ){					//判断当前地图级别，是否已经为需要显示级别
					this.clearMap();
					
					if( this.setting.navBar ){
						this.daSplitterObj.dom[0].innerHTML = newLevel;
						this.daSplitterObj.css({ top: 80 + ( this.setting.maxLevel - newLevel)  * 9 });
					}
					
					fnFinished = function(){																					//用户自定义回调处理函数
						if( this.setting.change )
							this.setting.change.call( this );
					}
					
					this.mapReady = true;
				};
				
				var nImg = Math.pow( 2, this.mapCurrentLevel-1 ),										//当前地图底图 横/纵显示的张数
						nImg2 = Math.pow( 2, Math.floor(newLevel)-1 ),									//改变后的张数
						mapOffsetX, mapOffsetY,
						mapOffsetX2, mapOffsetY2;
				
				mapOffsetX = viewLeft - this.mapLeft;																//计算目标点相对地图左上角的偏移位置
				mapOffsetY = viewTop - this.mapTop;
				
				mapOffsetX2 = mapOffsetX * nImg2/nImg;															//通过等比运算,计算地图比例尺发生变化后，目标点相对地图左上角的偏移位置
				mapOffsetY2 = mapOffsetY * nImg2/nImg;
				
				this.mapLeft = this.mapLeft -( mapOffsetX2 - mapOffsetX );					//地图位置修正，目标点不同比例尺下的偏移量差值
				this.mapTop = this.mapTop -( mapOffsetY2 - mapOffsetY );
				
				this.resize( newLevel );																						//更新地图可视区域 设置信息
				
				var context = this;
				this.daMapBaseMapObj.stop().act({
					left: this.mapLeft,
					top: this.mapTop
				},{
					duration: 500,
					step: function( nowVal, daFxObj ){
						switch( daFxObj.prop ){
							case "left":
								context.daMapImgObj.css( { left: nowVal } );
								context.daMapCanvasObj.css( { left: nowVal } );
								context.daMapDataObj.css( { left: nowVal } );
								break;
							case "top":
								context.daMapImgObj.css( { top: nowVal } );
								context.daMapCanvasObj.css( { top: nowVal } );
								context.daMapDataObj.css( { top: nowVal } );
								break;
								
						}
						
					},
					
					complete: function(){
						context.MapChanging = false;
					}
				
				});
				
				this.loadBaseMapLayer( Math.floor(newLevel), fnFinished );									//加载底图图层
				

			},
			
			
			/**加载底图图层
			*/
			loadBaseMapLayer: function( newLevel, fnFinished ){
				this.resize( newLevel );																											//更新地图可视区域 设置信息
				
	  		var mapBaseMapLayers = this.mapBaseMapLayers,
						arrImgURL = this.setting.url;
			  
				var prevMap = mapBaseMapLayers[0],
						nowMap = mapBaseMapLayers[1],
			  		imgURL, imgType;
						
				imgURL = arrImgURL[0][0];
			  imgType = arrImgURL[0][1] || this.setting.imageType;												//图片格式没有传入，就取默认值setting.imageType
				
			  if ( newLevel != this.mapCurrentLevel ){
			  	var prevList = prevMap.layerObj.children,
			  			countImg = this.countImg, 
			  			countImgPrev, 
			  			arrIdx, data, actParams;
			  	
			  	if( 0 < prevList.length ){
							var context = this;
				
					  	da.each( prevList, function( idx, imgObj ){
					  		arrIdx = imgObj.id.replace( "daMapBaseMap_", "" ).split("_");
					  		countImgPrev = Math.pow( 2, arrIdx[0] - 1 );
					  		
					  		actParams = {};
					  		actParams[ "duration" ] = 500;
					  		
					  		if( prevList.length-1 === idx ){
							  		actParams[ "complete" ] = function(){
							  				prevMap.layerObj.style.display = "none";
							  			
								  			daMap.loadMapLayer( 
								  				"daMapBaseMap", 
									  			imgURL, 
									  			imgType, 
								  				newLevel,
									  			context.countImg, 
									  			context.mapViewImg, 
									  			nowMap.layerObj, 
									  			context.mapLoadedBaseMaps
									  		);

												context.loadImgLayer( newLevel );
												context.mapCurrentLevel = newLevel;										//更新当前地图显示级数
												
												if( fnFinished )
													fnFinished.call( context );
												
							  		};
					  		}
					  		
					  		da( this ).stop().act({
						  		left: ( arrIdx[1]-1 ) / countImgPrev * countImg *_MapImgSize,
						  		top: ( arrIdx[2]-1 ) / countImgPrev * countImg *_MapImgSize,
						  		width: countImg/countImgPrev * _MapImgSize + 5,							//+5防止图片在动画执行中，出现边框
						  		height: countImg/countImgPrev * _MapImgSize + 5
						  		
						  	}, actParams );
					  		

					  		
					  	});
					  	
				  	
			  	}
			  	else{
			  			daMap.loadMapLayer( 
			  				"daMapBaseMap", 
				  			imgURL, 
				  			imgType, 
			  				newLevel,
				  			this.countImg, 
				  			this.mapViewImg, 
				  			nowMap.layerObj, 
				  			this.mapLoadedBaseMaps, 
				  			_daMapTransparent
				  		);
							
							this.loadImgLayer( newLevel );
							this.mapCurrentLevel = newLevel;										//更新当前地图显示级数
							
							if( fnFinished )
								fnFinished.call( this );
													
			  	}
			  	

				}
				else{
	  			daMap.loadMapLayer( 
	  				"daMapBaseMap", 
		  			imgURL, 
		  			imgType, 
	  				newLevel,
		  			this.countImg, 
		  			this.mapViewImg, 
		  			nowMap.layerObj, 
		  			this.mapLoadedBaseMaps, 
		  			_daMapTransparent
		  		);
					
					this.loadImgLayer( newLevel );
					this.mapCurrentLevel = newLevel;										//更新当前地图显示级数
					
					if( fnFinished )
						fnFinished.call( this );
					
				}
				
				if( "undefined" !== typeof daTip ) daTip.hide("tip");
				
			},
			
			/**加载叠图图层
			*/
			loadImgLayer: function( newLevel ){
				newLevel = newLevel || this.mapCurrentLevel;
				
				var mapImgLayers = this.mapImgLayers,
						arrURL = this.setting.urlImg;
				
				for( var i=0,len=mapImgLayers.length; i<len; i++){
						var imgURL, imgType;
//						var strHTML=[];
					  
					  if( !arrURL[i] ) continue;																										//对应图层的底图图片 服务器地址有误
					  
					  imgURL = arrURL[i][0];
					  imgType = arrURL[i][1] || this.setting.imageType;													//图片格式没有传入，就取默认值setting.imageType

		  			daMap.loadMapLayer( 
		  				"daMapImg_", 
			  			imgURL, 
			  			imgType, 
		  				newLevel,
			  			this.countImg, 
			  			this.mapViewImg, 																														//可视区域对应的底图图片的x、y 编号
			  			mapImgLayers[i].layerObj, 
			  			this.mapLoadedImgs, 
			  			_daMapTransparent
			  		);
						
				}
				
				this.loadDataLayer( this.mapCurrentLevel );

			},
			

			/**加载数据图层
			*/
			loadDataLayer: function( level ){
				level = level || this.mapCurrentLevel;
				
				var mapDataLayers = this.mapDataLayers;
				
				for( var i=0,len=mapDataLayers.length; i<len; i++){
					if( mapDataLayers[i].TimerLoadDataLayer ) da.clearTimer( mapDataLayers[i].TimerLoadDataLayer );
					
					mapDataLayers[i].TimerLoadDataLayer = da.timer( da.random( 30, 30*len ), function( i, mapDataLayers, level ){
						mapDataLayers[i].draw( level );
						
					}, i, this.mapDataLayers, level);
					
				}
				
			},
			
			//屏幕坐标 转为经纬度坐标
			/*
				left: 目标点left值
				top: 目标点top值
			*/
			screenToCoord: function( left, top ){
				var	range = this.setting.range,
						x1 = parseInt( this.mapLeft ),
						y1 = parseInt( this.mapTop ),
						x2 = this.daMapBaseMapObj.width(),
						y2 = this.daMapBaseMapObj.height();
				
				//debug("x1:" + x1+",y1:"+y1+",x2:" + x2+",y2:"+y2+",left:" + top+",top:"+top);
				return {
					longitude: range[0] + (range[2]-range[0]) * ( left - x1 ) / x2,										//通过对用户传入的经纬度范围 等比运算，计算出屏幕坐标对应的经纬度坐标
					latitude: range[1] + (range[3]-range[1]) * ( y2 + y1 - top ) / y2
				};
				
			},
			
			//经纬度坐标 转为屏幕坐标
			/*
				longitude: 经度
				latitude: 纬度
				level: 地图级数
			*/
			coordToScreen: function( longitude, latitude, level ){
				 level = level || this.mapCurrentLevel;
				
			   var	range = this.setting.range,																								//用户传入的地图经纬度范围
			   		 	mapWidth = Math.pow( 2, level - 1 ) * _MapImgSize,														//根据地图级数 和每张底图图片的尺寸，计算出当前地图画布的大小
			   			screenVal = { left:0, top:0 };
			  
			   if ( range[0] < range[2] ) 
						screenVal.left = Math.round( ( longitude - range[0] ) / ( range[2] - range[0] ) * mapWidth );			//通过对用户传入的经纬度范围 等比运算，计算出经纬度坐标对应的屏幕坐标
				 else
				 		screenVal.left = Math.round( ( longitude - range[2] ) / ( range[0] - range[2] ) * mapWidth  );
	
				 if (	range[1] < range[3] ) 
				    screenVal.top = Math.round( ( range[3] - latitude ) / ( range[3] - range[1] ) * mapWidth );
				 else
				 		screenVal.top = Math.round( ( range[1] - latitude ) / ( range[1] - range[3] ) * mapWidth );
				 
				 return screenVal;	
			},
			
			//更新显示当前 鼠标经纬度信息
			showMouseCoord: function(){
				if ( null == this.daCoordBarObj ) return;
				
				var coord = this.mapMouseCoord;
				
		  	var x_1 = parseInt( 60*( coord.longitude - parseInt( coord.longitude ) ) );															//分部分
		  	var x_2 = parseFloat( 60*( 60*( coord.longitude - parseInt( coord.longitude ) ) - x_1 ) ).toFixed(2);		//秒部分
		  	var y_1 = parseInt( 60*( coord.latitude - parseInt( coord.latitude ) ) );
		  	var y_2 = parseFloat( 60*( 60*( coord.latitude - parseInt( coord.latitude ) ) - y_1 ) ).toFixed(2);
		  	
		    this.daCoordBarObj.dom[0].innerHTML = [
		    	( this.setting.debug ? [
		    		"minLon:",this.mapViewCoord.minLongitude, "<br/>minLat: ",this.mapViewCoord.minLatitude, "<br/>maxLon: ",this.mapViewCoord.maxLongitude, "<br/>maxLat: ",this.mapViewCoord.maxLatitude,"<br/>",
		    		"鼠标位置 left:", this.mapMousePos.left, "; top:", this.mapMousePos.top, "<br/>",
					"图层位置 left:", this.daMapCanvasObj.offset().left, "; top:", this.daMapCanvasObj.offset().top, "<br/>"
		    	].join("") : "" ),
					
			    "经度：", parseInt( coord.longitude ), "° ", x_1, "\' ", x_2, "\"，",
			    "纬度：", parseInt( coord.latitude ), "°", y_1, "\' ", y_2, "\""
			    
		    ].join("");
			    
			},
			
			//居中某一个经纬度坐标
			/*sss
				longitude: 经度
				latitude: 纬度
				fnOver: 执行完毕回调函数
			*/
			toCenterByCoord: function( longitude, latitude, fnOver ){
				if  ( 0 === arguments.length || da.isFunction( longitude ) ){									//整图居中
					if( this.setting.center ){
						fnOver = longitude;
						longitude = this.setting.center[0];
						latitude = this.setting.center[1];
					}
					else return;
				};
				
				var posTmp = this.coordToScreen( longitude, latitude ),
						newLeft = ( this.mapViewWidth / 2 ) - posTmp.left, 
						newTop = ( this.mapViewHeight / 2 ) - posTmp.top;

				var context = this;
				this.daMapCanvasObj.stop().act({
						left: newLeft,
						top: newTop
					},
					{
						duration: 500,
						step: function( nowVal, daFxObj ){
							if( "left" === daFxObj.prop ){
								context.daMapBaseMapObj.css({ left : nowVal }) ;
								context.daMapImgObj.css({ left : nowVal }) ;
								context.daMapDataObj.css({ left : nowVal }) ;
							  context.mapLeft = nowVal;
							}
							else{
								context.daMapBaseMapObj.css({ top : nowVal }) ;
								context.daMapImgObj.css({ top : nowVal }) ;
								context.daMapDataObj.css({ top : nowVal }) ;
							  context.mapTop = nowVal;
							
							}
							
						},
						complete: function(){																											//动画结束最终校正
							context.daMapBaseMapObj.css({ left : newLeft, top: newTop }) ;
							context.daMapImgObj.css({ left : newLeft, top: newTop }) ;
							context.daMapCanvasObj.css({ left : newLeft, top: newTop }) ;
							context.daMapDataObj.css({ left : newLeft, top: newTop }) ;

						  context.mapLeft = newLeft;
						  context.mapTop = newTop;
						  
							if( fnOver ) fnOver.call( win, context );
							else context.loadBaseMapLayer( context.mapCurrentLevel );										//加载可视区域图层及数据
	  					
						}
				});
			

			},
			
			//居中某一个屏幕位置
			/*
			*	viewLeft: 目标点在daMap控件视图范围内的left值( 不是图层范围内哦 )
			*	viewTop: 目标点在daMap控件视图范围内的top值
			*	fnOver: 执行完毕回调函数
			*/
			toCenterByPos: function( viewLeft, viewTop, fnOver ){
				if  ( 0 === arguments.length || da.isFunction( viewLeft ) ){							//整图居中
					fnOver = viewLeft;
					var maxSize = Math.pow( 2, this.mapCurrentLevel-1 ) * _MapImgSize;
				  viewLeft = this.mapLeft + maxSize/2;
					viewTop = this.mapTop + maxSize/2;
				};
				
				var newLeft = this.mapLeft + ( this.mapViewWidth / 2 - viewLeft ), 
						newTop = this.mapTop + ( this.mapViewHeight / 2 - viewTop );
						
				var context = this;
				this.daMapCanvasObj.stop().act({
						left: newLeft,
						top: newTop
					},
					{
						duration: 500,
						step: function( nowVal, daFxObj ){
							if( "left" === daFxObj.prop ){
								context.daMapBaseMapObj.css({ left : nowVal }) ;
								context.daMapImgObj.css({ left : nowVal }) ;
								context.daMapDataObj.css({ left : nowVal }) ;
								context.mapLeft = nowVal; 
				
							}
							else{
								context.daMapBaseMapObj.css({ top : nowVal }) ;
								context.daMapImgObj.css({ top : nowVal }) ;
								context.daMapDataObj.css({ top : nowVal }) ;
								context.mapTop = nowVal; 
							
							}
							
						},
						complete: function(){																											//动画结束最终校正
							context.daMapBaseMapObj.css({ left : newLeft, top: newTop }) ;
							context.daMapImgObj.css({ left : newLeft, top: newTop }) ;
							context.daMapCanvasObj.css({ left : newLeft, top: newTop }) ;
							context.daMapDataObj.css({ left : newLeft, top: newTop }) ;
						
							context.mapLeft = newLeft; 
							context.mapTop = newTop; 
							
							if( fnOver ) fnOver.call( win, context );
							else context.loadBaseMapLayer( context.mapCurrentLevel );										//加载可视区域图层及数据
						}
				});


			},
			
			
			/**还原为初始状态
			*/
			toInit: function(){
					if( this.setting.center ){
						this.toCenterByCoord(function( daMapObj ){
							daMapObj.change( daMapObj.setting.initLevel );
						});
					}
					else{ 
						this.toCenterByPos(function( daMapObj ){
							daMapObj.change( daMapObj.setting.initLevel );
						});
					}
				
			},
			
			//daMap地图平移
			/*
				nLeft: 地图left属性偏移值
				nTop: 地图top属性偏移值
			*/
			moveMap: function( nLeft, nTop ){
				var newLeft = this.mapLeft + nLeft,
						newTop = this.mapTop + nTop;
						
				if  ( -(Math.pow( 2, this.mapCurrentLevel-1 )*_MapImgSize) <= newLeft 
				&& this.mapViewWidth >= newLeft ){
					this.mapLeft = newLeft; 
					
					this.daMapBaseMapObj.css({ left : newLeft });
					this.daMapImgObj.css({ left : newLeft });
					this.daMapCanvasObj.css({ left : newLeft });
					this.daMapDataObj.css({ left : newLeft });
				};
				
				if  ( -(Math.pow( 2, this.mapCurrentLevel-1 )*_MapImgSize) <= newTop 
				&& this.mapViewHeight >= newTop ){
					this.mapTop = newTop; 
					
					this.daMapBaseMapObj.css({ top : newTop });
					this.daMapImgObj.css({ top: newTop });
					this.daMapCanvasObj.css({ top: newTop });
					this.daMapDataObj.css({ top: newTop });
				};
			
//			  x1 = x1 + canvasdeltax ;
//				y1 = y1 + canvasdeltay ;
//				
//				map$canvas_border.attr("x",x1).attr("y",y1).css("left",x1-basex).css("top",y1-basey) ;
//				map$canvas_dist.attr("x",x1).attr("y",y1).css("left",x1-basex).css("top",y1-basey) ;
//				map$canvas_dist_temp.attr("x",x1).attr("y",y1).css("left",x1-basex).css("top",y1-basey) ;
//				map$canvas_trace.attr("x",x1).attr("y",y1).css("left",x1-basex).css("top",y1-basey) ;
//				try { window.clearTimeout(timer_move_view);} catch(E) {} finally {} ;
//			  timer_move_view = window.setTimeout("viewareachange("+currentlevel+")",200) ;
			},
			
			/**判断某经纬度是否在可视范围内
			* longitude 经度值
			* latitude 纬度值
			*/
			isInView: function( longitude, latitude ){
				if( this.mapViewCoord.minLongitude <= longitude
				&& this.mapViewCoord.maxLongitude >= longitude
				&& this.mapViewCoord.minLatitude <= latitude
				&& this.mapViewCoord.maxLatitude >= latitude )
					return true;
				else
					return false;
				
			},
			
			/**地图放大
			* left: 放大中心位置 left值
			* top: 放大中心位置 top值
			* n: 放大级数
			*/
			zoomin: function( left, top, n ) {
					left = da.firstValue( left, this.mapViewWidth/2 );
					top = da.firstValue( top, this.mapViewHeight/2 );
				
			    var newLevel = this.mapCurrentLevel + ( n || 1 );
			    if ( this.setting.maxLevel <= newLevel ) newLevel = this.setting.maxLevel;
			    if ( this.mapCurrentLevel != newLevel ){
			    	if( this.setting.zoomAct ) daMap.actZoom( this, left, top, true);
			    	this.change( newLevel, left, top );
			    	
			    }
			    
					if( this.setting.mini )
						this.daMapMiniObj.zoomin( newLevel, left, top );
			},
			
			/**地图缩小
			* left: 缩小中心位置 left值
			* top: 缩小中心位置 top值
			* n: 缩小级数
			*/
			zoomout: function( left, top, n ) {
					left = da.firstValue( left, this.mapViewWidth/2 );
					top = da.firstValue( top, this.mapViewHeight/2 );
					
			    var newLevel = this.mapCurrentLevel - ( n || 1 );
			    if ( 1 >= newLevel ) newLevel = 1;
			    if ( this.mapCurrentLevel != newLevel ){
      			if( this.setting.zoomAct ) daMap.actZoom( this, left, top );
			    	this.change( newLevel, left, top );
			    }
			    
					if( this.setting.mini )
						this.daMapMiniObj.zoomout( newLevel, left, top );
			},
			
			/**地图自动平移timer
			*/
			timerAutoMove: null,
			
			/**终止 地图自动平移
			* objDom 触发地图自动平移的dom对象( 可以无，若有需要释放事件源对象 )
			* evt 事件对象
			*/
			stopAutoMove: function ( objDom, evt ) {
				if(win.releaseEvents)														//释放 事件源对象锁定状态
					win.releaseEvents(evt.MOUSEUP);								//标准DOM
				else if(objDom.releaseCapture)									//IE
					objDom.releaseCapture();
					
				if ( null !== this.timerAutoMove ) clearTimeout( this.timerAutoMove );
				
			},
			
			/**地图自动平移处理函数
			* dir 地图平移方向
			* objDom 触发地图自动平移的dom对象( 可以无，若有需要锁定事件源对象 )
			* evt 事件对象
			*/
			autoMove: function ( dir, objDom, evt ) {
				if(win.captureEvents)												//锁定事件源对象
					win.captureEvents(evt.MOUSEUP);						//标准DOM
				else if(objDom.setCapture)									//IE
					objDom.setCapture();

				if ( null !== this.timerAutoMove ){
					clearTimeout( this.timerAutoMove );
					
				}
				switch( dir ){
					case "up": this.moveMap( 0,-1*_AutoMovePixel ); break;
					case "left": this.moveMap( -1*_AutoMovePixel, 0 ); break;
					case "down": this.moveMap( 0, _AutoMovePixel ); break;
					case "right": this.moveMap( _AutoMovePixel, 0 ); break;
				}
				
				(function( context, dir, objDom, evt ){
					context.timerAutoMove = setTimeout( function(){
						context.autoMove( dir, objDom, evt );
						
					}, 30 );
					
				})( this, dir, objDom, evt )
				
				
			},
			
			/**添加图层
			* layerSetting 图层设置参数
			* isImgLayer 是否是叠图图层，默认为数据图层
			*/
			appendLayer: function( layerSetting, isImgLayer, isBaseMapLayer ){
				if( null === this.daMapDataObj ) return;
				
				var daMapLayerObj,
						defaultParams = {																							//图层默认参数
							parent: ( isBaseMapLayer ? this.daMapBaseMapObj.dom[0] : isImgLayer ? this.daMapImgObj.dom[0] : this.daMapDataObj.dom[0] ),
							daMap: this,
							minLevel: 1,
							maxLevel: this.setting.maxLevel
						};
				
				if( "undefined" === typeof layerSetting.layerId ){								//若传入的参数，是标准的daMapLayer图层设置参数
					if( da.isPlainObj( layerSetting ) ){
						layerSetting = da.extend( {}, defaultParams, layerSetting );																		//补充图层默认参数
						
						daMapLayerObj = daMapLayer( layerSetting );
					}
				}
				else{																															//若传入的参数，是用户new出来的daMapLayer对象
					daMapLayerObj = layerSetting;
					
					daMapLayerObj.layerSetting = da.extend( {}, defaultParams, daMapLayerObj.layerSetting );					//修正图层对象参数

					if( 0 === daMapLayerObj.layerSetting.minLevel ) daMapLayerObj.layerSetting.minLevel = 1;								//由于，extend先后顺序的问题，而起显示级数在prototype中有值，所以显示级数参数必须单独处理
					if( 0 === daMapLayerObj.layerSetting.maxLevel ) daMapLayerObj.layerSetting.maxLevel = this.setting.maxLevel;
					
					daMapLayerObj.daMapObj = this;
					daMapLayerObj.daParentObj = ( isBaseMapLayer ? this.daMapBaseMapObj : isImgLayer ? this.daMapImgObj : this.daMapDataObj );
					
					daMapLayerObj.create();
					
				}
				if( isBaseMapLayer )
					this.mapBaseMapLayers.push( daMapLayerObj );										//压入 底图图层缓存列表
				else if( isImgLayer )
					this.mapImgLayers.push( daMapLayerObj );												//压入 叠图图层缓存列表
				else
					this.mapDataLayers.push( daMapLayerObj );												//压入 数据图层缓存列表
				
				return daMapLayerObj;																							//返回图层对象，便于后续操作
				
			},
			
			
			/**气泡信息窗口
			*/
			pop: function( popSetting ){
				var params = {
							daMap: this
						};
				
				popSetting = da.extend( {}, popSetting, params);						//修补参数
				
				daMapPop( popSetting );
			
			},
			
			/**清空气泡信息窗口图层
			*/
			clearPop: function(){
				daMapLayer.getLayer( "mapPop_"+ this.mapId ).layerObj.innerHTML = "";
			},
			
			/**加载数据loading
			*/
			loading: function( isFinished ){
				if( !isFinished && null === this.daLoadingObj ) {
		 			this.daLoadingObj = daLoading({																				//显示loadings
		 				parent: this.mapParentObj,
		 				top: "0px",
		 				type: "text",
		 				bar: false
		 			});
		 			
				}
				else {
					if( this.daLoadingObj ){
						this.daLoadingObj.finished();
						this.daLoadingObj = null;
					}
					
				}
				
			}
					
		};
		
		daMap.fnStruct.init.prototype = daMap.prototype;

		//计算地图画布的对角线长度
		/*
			range: 地图经纬度范围
		*/
		daMap.getCatercorner = function( range ) {
			var R = 6371; 																			//地球平均半径约6371千米
			var lon1 = range[0] * Math.PI / 180;
			var lat1 = range[1] * Math.PI / 180;
			var lon2 = range[2] * Math.PI / 180;
			var lat2 = range[3] * Math.PI / 180;
			var deltaLat = lat1 - lat2;
			var deltaLon = lon1 - lon2;
			var step1 = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat2) * Math.cos(lat1) * Math.pow(Math.sin(deltaLon/2), 2);
			var step2 = 2 * Math.atan2(Math.sqrt(step1), Math.sqrt(1 - step1));
			return step2 * R ;
		};
			
		//计算??????????????
		daMap.getRadius = function( daMapObj, kmDistance ) {
			return Math.ceil(Math.SQRT2 * ( _MapImgSize * Math.pow( 2, daMapObj.mapCurrentLevel-1 ) ) * kmDistance / daMapObj.mapCatercorner ) ;									//Math.SQRT2 == 2的平方根。它的值近似于1.414
		};
	
		//daMap地图双击事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapDblclick = function( daMapObj, evt ) {
		  if ( daMapObj.setting.maxLevel == daMapObj.mapCurrentLevel ) {												//如果地图已经放大到最大级数，就将事件点居中即可
//		  	daMapObj.toCenterByPos( evt.pageX-daMapObj.mapBaseX, evt.pageY-daMapObj.mapBaseY );
		  	return false;
		  };
		 
		 	daMapObj.zoomin( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top );
		 	
		};
	
		//daMap地图鼠标按下事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapMouseDown = function( daMapObj, evt ){
			if(win.captureEvents)												//锁定事件源对象
				win.captureEvents(evt.MOUSEUP);						//标准DOM
			else if(this.setCapture)										//IE
				this.setCapture();
		  
			if( daMapObj.MapSplitterDraging ) return;				//用户拖动地图导航条，改变地图显示等级中
		  
			daMapObj.MouseDownLeft = evt.pageX-daMapObj.mapBaseX;					//设置鼠标平移起始参考点
			daMapObj.MouseDownTop = evt.pageY-daMapObj.mapBaseY;
			
			if( daMapObj.setting.debug )																//debug 模式下， 显示鼠标点击经纬度
				da.out([ daMapObj.mapMouseCoord.longitude, daMapObj.mapMouseCoord.latitude ]);
			
			if( !daMapObj.MapActing ){
				daMapObj.MouseHold = true;
				daMap.actMove( daMapObj, true );					//地图平移惯性动画 起始记录点
			
				daMapObj.mapObj.style.cursor = "url(/images/daMapHand.cur), pointer";
				//daMapObj.daMapBaseMapObj.dom[0]
			
			}
			
		};
		
		//daMap地图鼠标弹起事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapMouseMove = function( daMapObj, evt ){
			//防止拖动中选中文字，使拖动不畅
			if( win.getSelection )
				win.getSelection().removeAllRanges();
			else if(doc.getSelection)
				doc.getSelection().removeAllRanges();
			else
				doc.selection.empty();
							
			
		  daMapObj.mapMousePos.left = evt.pageX-daMapObj.mapBaseX;																							//更新鼠标当前在地图中的相对位置
		  daMapObj.mapMousePos.top = evt.pageY-daMapObj.mapBaseY;
		  
		  var tmpCoord = daMapObj.screenToCoord( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top ) ;				//屏幕位置转为经纬度坐标
		  daMapObj.mapMouseCoord.latitude = tmpCoord.latitude;
		  daMapObj.mapMouseCoord.longitude = tmpCoord.longitude;
		  
//		  mousemoved = (Math.abs(mousexold-evt.x) + Math.abs(mouseyold-evt.y)) > 5 ;

		  if ( daMapObj.MouseHold ) {
		  	var newLeft = daMapObj.mapLeft + ( daMapObj.mapMousePos.left - daMapObj.MouseDownLeft ),						//根据鼠标起止差值计算，地图位移量
		  			newTop = daMapObj.mapTop + (daMapObj.mapMousePos.top - daMapObj.MouseDownTop ) ;
				
				daMapObj.daMapBaseMapObj.css({ left: newLeft, top: newTop });
				daMapObj.daMapImgObj.css({ left: newLeft, top: newTop });
				daMapObj.daMapCanvasObj.css({ left: newLeft, top: newTop });
				daMapObj.daMapDataObj.css({ left: newLeft, top: newTop });
			  	
				daMapObj.mapLeft = newLeft;																																					//更新地图偏移位置
				daMapObj.mapTop = newTop;
				
			  daMapObj.MouseDownLeft = daMapObj.mapMousePos.left;																									//更新鼠标平移起始参考点
			  daMapObj.MouseDownTop = daMapObj.mapMousePos.top;

	  		daMapObj.loadBaseMapLayer( daMapObj.mapCurrentLevel );


	  	
		  };
		  
			if( !daMapObj.MapActing ){
				daMapObj.showMouseCoord();										//更新显示鼠标所对应的经纬度坐标
			}
			
			
		};
		
		//daMap地图鼠标弹起事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapMouseUp = function( daMapObj, evt ){
			if( "undefined" !== typeof daMapObj.clickMap ) daMapObj.clickMap( daMapObj.mapMouseCoord.longitude, daMapObj.mapMouseCoord.latitude ,evt);
			
			if(win.releaseEvents)														//释放 事件源对象锁定状态
				win.releaseEvents(evt.MOUSEUP);								//标准DOM
			else if(this.releaseCapture)										//IE
				this.releaseCapture();
			
			if( daMapObj.MapSplitterDraging ){							//用户拖动地图导航条，改变地图显示等级中
				daMapObj.change( parseInt( daMapObj.daSplitterObj.dom[0].innerHTML ) );
				
				daMapObj.MapSplitterDraging = false;
				return;
			}
			
			if( !daMapObj.MapActing && daMapObj.MouseHold ){
				
				daMap.actMove( daMapObj );											//地图平移惯性动画 开始执行
				daMapObj.MouseHold = false;
				
			}
			
			if( daMapObj.setting.mini )												//鹰眼联动
				daMapObj.daMapMiniObj.toCenterByCoord( daMapObj.mapViewCoord.midLongitude, daMapObj.mapViewCoord.midLatitude );

//			daMapObj.loadBaseMapLayer( daMapObj.mapCurrentLevel );

				daMapObj.mapObj.style.cursor = "default";
//			daMapObj.daMapBaseMapObj.dom[0].style.cursor = "default";
		};
		
		//daMap地图鼠标弹起事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
			delta: 滚轮方向
		*/
		daMap.mapMouseWheel = function( daMapObj, evt, delta ){
			if (evt.wheelDelta) { 											//IE
      	if(evt.wheelDelta > 0 ){									//↑滚轮向上滚
      		daMapObj.zoomin( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top, evt.wheelDelta/120 );
      	}
      	else{																			//↓滚轮向下滚
   				daMapObj.zoomout( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top, -evt.wheelDelta/120 );
   			}
      }
      else if (evt.detail) { 										//firefox
      	if(evt.detail < 0 ){									//↑滚轮向上滚
      		daMapObj.zoomin( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top, evt.detail/3 );
      	}
      	else{																			//↓滚轮向下滚
   				daMapObj.zoomout( daMapObj.mapMousePos.left, daMapObj.mapMousePos.top, -evt.detail/3 );
   			}
      }
      
		};
		
		//daMap地图尺寸发生改变事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapResize = function( daMapObj, evt ){
			var daParentObj = da( this ),
					posParent = daParentObj.offset();
			
			daMapObj.mapBaseX = posParent.left;
			daMapObj.mapBaseY = posParent.top;
			daMapObj.mapViewWidth = daMapObj.setting.width || daParentObj.width() ;
			daMapObj.mapViewHeight = daMapObj.setting.height || daParentObj.height() ;
			
			var maxSize = Math.pow( 2, daMapObj.mapCurrentLevel-1 ) * _MapImgSize;
			daMapObj.mapLeft = ( daMapObj.mapViewWidth - maxSize ) / 2;
			daMapObj.mapTop = ( daMapObj.mapViewHeight - maxSize ) / 2;

			da( daMapObj.mapObj ).width( daMapObj.mapViewWidth );
			da( daMapObj.mapObj ).height( daMapObj.mapViewHeight );

//			daMapObj.toInit();

  		daMapObj.loadBaseMapLayer( daMapObj.mapCurrentLevel );					//重新显示底图和叠图

			if( daMapObj.setting.mini ){
				//TODO:促发鹰眼地图的resize
			}

		};
		
	
		//daMap地图尺寸发生改变事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapKeyDown = function( daMapObj, evt ){
		  if ( !evt ) return  false;
		  
		  if ( evt.ctrlKey ) ctrlhold = true ;									//是否按下ctrl键
		  else ctrlhold = false;
	
		  switch( evt.keyCode ){
		  	 case 37:
		  	 case 100: movearea(_AutoMovePixel,0); //(←) 平移
		  	    break;
		  	 case 38:
		  	 case 104: movearea(0,_AutoMovePixel); //(↑)
		  	    break;   
		  	 case 39: 
		  	 case 102: movearea(-1* _AutoMovePixel,0); //(→)
		  	    break;   
	  	   case 40: 
	  	   case 98: movearea(0,-1 * _AutoMovePixel); //(↓)
		  	    break;      
		  	    
		  	 case 34:	movearea(0,-1*viewheight*2/3); 	//下翻页 
		  	   break;
		  	 case 33: movearea(0,viewheight*2/3); 		//上翻页  
		  	   break; 
		  	 case 190: movearea(-1*viewwidth*2/3,0); 	//右翻页 
		  	   break;
		  	 case 188: movearea(viewwidth*2/3,0);			//左翻页 
		  	   break;
		  	      
		  	 case 65: 
		  	 case 68: 
		  	 case 187: 
		  	 case 107 : //a,d,+ ; 放大
		  	  zoomin(evt.x,evt.y);
		  	  break;
		  	 case 83: 
		  	 case 88: 
		  	 case 189: 
		  	 case 109 : //s,x,-; 缩小
		  	  zoomout(evt.x,evt.y);
		  	  break;
		  	  
		  	case  81:  // q 一次性放大最大
		  	  levelchange(maxlevel,evt.x,evt.y);
		  	  break;
		    case  79: //o 回到初始图;
		      tocenter(0,0);
		  	  levelchange(orglevel,viewwidth/2+basex,viewheight/2+basey) ;
		  	  break;
		  	case 77: 
		  	case 67: 
		  	case 90 : //居中;
		  	  tocenter(0,0);
		  	  break;
		  }
		  
		  try {win.event.cancelBubble = true ;}  catch (e) {} finally { };			//阻止事件冒泡 forIE ??????? TODO:抽时间改掉
		  try {win.event.returnValue=false;	}  catch (e) {} finally { };
		  return false;
		};
	
		//daMap地图尺寸发生改变事件
		/*
			daMapObj: 标签所属的daMap地图对象
			evt: 事件对象
		*/
		daMap.mapKeyUp = function( daMapObj, evt ){
		  if ( !evt ) return  false;
		  
		  ctrlhold = false ; 
		};

		/**显示/隐藏某工具面板
		*/
		daMap.actSlideTools = function( daMapObj, tool, isHide ){
			switch( tool ){
				case "toolBar": {
					if( isHide ){
						daMapObj.daToolBarObj.act({ left: daMapObj.mapViewWidth });
						daMapObj.daToolBarBtObj.dom[0].innerHTML = "3";
						daMapObj.daToolBarBtObj.dom[0].title = '显示工具条，快捷键[～]';
					}
					else{
						daMapObj.daToolBarObj.act({ left: daMapObj.mapViewWidth - ( daMapObj.setting.changeURL ? 270 : 210 ) });
						daMapObj.daToolBarBtObj.dom[0].innerHTML = "4";
						daMapObj.daToolBarBtObj.dom[0].title = '隐藏工具条，快捷键[～]';
					}
					break;
					
				}
				case "navBar": {
					if( isHide ){
						daMapObj.daNavBarObj.act({ left: -58 });
						daMapObj.daNavBarBtObj.dom[0].innerHTML = "4";
						daMapObj.daNavBarBtObj.dom[0].title = '显示导航条，快捷键[～]';
					}
					else{
						daMapObj.daNavBarObj.act({ left: 3 });
						daMapObj.daNavBarBtObj.dom[0].innerHTML = "3";
						daMapObj.daNavBarBtObj.dom[0].title = '隐藏导航条，快捷键[～]';
					}
					break;
					
				}
				case "miniBox": {
					if( isHide ){
						daMapObj.daMiniBoxObj.act({ top: daMapObj.mapViewHeight });
						daMapObj.daMiniBoxBtObj.dom[0].innerHTML = "5";
						daMapObj.daMiniBoxBtObj.dom[0].title = '显示鹰眼，快捷键[～]';
					}
					else{
						daMapObj.daMiniBoxObj.act({ top: ( daMapObj.mapViewHeight - daMapObj.mapViewHeight/5 ) });
						daMapObj.daMiniBoxBtObj.dom[0].innerHTML = "6";
						daMapObj.daMiniBoxBtObj.dom[0].title = '隐藏鹰眼，快捷键[～]';
					}
					break;
					
				}
				
			}
			
		};
		
		/**加载底图/叠图图层
		* id 图片对象id前缀
		* imgURL 图片服务器地址
		* imgType 图片格式
		* level 地图显示等级
		* countImg 当前地图显示等级 横纵最大显示图片数
		* viewImg 可视区域对应的底图图片的x、y 编号范围
		* layerObj 图层DOM对象
		* arrLoaded 已加载图片标志数组
		* isLoading 图片加载是否需要loading图片
		*/
		daMap.loadMapLayer = function( id, imgURL, imgType, level, countImg, viewImg, layerObj, arrLoaded, srcLoading ){
				var	nMinX = viewImg.nMinX,																										//可视区域对应的底图图片的x、y 编号范围
			  		nMinY = viewImg.nMinY,
			  		nMaxX = viewImg.nMaxX,
			  		nMaxY = viewImg.nMaxY,
						newimg, imgObj;
			
				for( var xIdx = nMinX; xIdx <= nMaxX; xIdx++ ) {															//循环当前 图层底图的 每一行图片列表
					for( var yIdx = nMinY; yIdx <= nMaxY; yIdx++ ) {														//循环当前 图片列表中的 每一张图片
						
						newimg = [ imgURL, level, "/", ( countImg - yIdx + 1 ), "/", level, "_", ( countImg - yIdx + 1 ), "_", xIdx, ".", imgType ].join("");
						
						if( !arrLoaded[1] )
							arrLoaded[1] = [];
							
						if ( !arrLoaded[1][ xIdx + "_" + yIdx ] ) {								//第一次加载
							imgObj = doc.createElement("img");
							imgObj.id = id + "_"+ level + "_" + xIdx + "_" + yIdx;
							imgObj.src = srcLoading || _daMapLoadingImg;
							
							(function( mapImgObj, mapImgPath ){
								da.loadImage( mapImgPath, function(){
									mapImgObj.src = this.src;
								});
								
//								da.errorImage( _daMapErrorImg );
								
							})( imgObj, newimg );
							
							imgObj.style.cssText = [
									"width:", _MapImgSize, "px; height:", _MapImgSize, "px; position:absolute;z-index:0;left:", (xIdx-1)*_MapImgSize, "px; top:", (yIdx-1)* _MapImgSize,
									"px;-moz-user-select:none;-khtml-user-drag:none;border:0px solid #999;"
							].join("");//filter: Alpha(opacity=50);
							
							da( imgObj ).bind("mouseover", function( evt ){
								evt.stopPropagation();evt.preventDefault();
								
							})
							
							layerObj.insertBefore( imgObj, null );
							
							arrLoaded[1][ xIdx + "_" + yIdx ] = true;									//打上已经加载标志
							
						}
						
					}
					
				}		
		};

		/**地图尺寸改变动画
		*/
		daMap.actResize = function( daMapObj, newLevel ){
				var prevList = daMapObj.mapBaseMapLayers[1].layerObj.children,
						countImgPrev,imgObj, arrIdx, nowSize;
				
//			  for( var i=0,len=prevList.length; i<len; i++ ){
//			  	imgObj = prevList[i];
//			  	arrIdx = imgObj.id.replace( "daMapBaseMap_", "" ).split("_");
//			  	countImgPrev = Math.pow( 2, arrIdx[0] - 1 );
//			  	
//			  	nowLeft = (( arrIdx[1]-1 ) / countImgPrev * daMapObj.countImg ) *_MapImgSize;
//			  	nowTop = (( arrIdx[2]-1 ) / countImgPrev * daMapObj.countImg ) *_MapImgSize;
//			  	
//			  	nowSize = daMapObj.countImg/countImgPrev * _MapImgSize + 2;													//+2避免图片在移动中出现白色边框
//	
//			  	da( imgObj ).stop().act({
//			  		left: nowLeft,
//			  		top: nowTop,
//			  		width: nowSize,
//			  		height: nowSize
//			  	});
//			  	
//			  }
			  
			  
		};


		/**地图鼠标滚轮放大缩小动画
		* daMapObj 地图对象
		* left 显示位置left值
		* top	显示位置top值
		* isZoomin 放大/缩小
		*/
		daMap.actZoom = function( daMapObj, left, top, isZoomin ){
			if( daMapObj.ZoomActTimer ){
				da.clearKeep( daMapObj.ZoomActTimer );
				daMapObj.daZoomActObj.dom[0].style.display="none";
			}
			
			daMapObj.daZoomActObj.dom[0].style.display="block";
			daMapObj.daZoomActObj.css({
				left: left - 75,
				top: top - 50,
				backgroundPosition: ("0px "+( isZoomin ? "0px" : "-100px" ))
			});
			
			daMapObj.ZoomActNum = 0;
			daMapObj.ZoomActTimer = da.keep( 60, function( daMapObj ){
				if( 4 < daMapObj.ZoomActNum ) {
					da.clearKeep( daMapObj.ZoomActTimer );
					daMapObj.daZoomActObj.dom[0].style.display="none";
				}
				else{
					daMapObj.ZoomActNum++;
					daMapObj.daZoomActObj.css({ backgroundPositionX: -daMapObj.ZoomActNum*150 });
				}
			}, daMapObj );
			
		};

		/**十字定位动画
		* daMapObj 地图对象
		* left 显示位置left值
		* top	显示位置top值
		*/
		daMap.actCross = function( daMapObj, left, top ){
			left = left || daMapObj.mapViewWidth/2;
			top = top || daMapObj.mapViewHeight/2;
			
			var params = { 
						duration: 1000,
						easing: "easeInOutElastic"
					};
			
			daMapObj.daCrossObj.top.css({ top: -daMapObj.mapViewHeight, display: "block" });
			daMapObj.daCrossObj.right.css({ left: daMapObj.mapViewWidth, display: "block" });
			daMapObj.daCrossObj.bottom.css({ top: daMapObj.mapViewHeight, display: "block" });
			daMapObj.daCrossObj.left.css({ left: -daMapObj.mapViewWidth, display: "block" });
			
			daMapObj.daCrossObj.top.act({ top: -daMapObj.mapViewHeight/2-10 }, params);
			daMapObj.daCrossObj.right.act({ left: daMapObj.mapViewWidth/2+12 }, params);
			daMapObj.daCrossObj.bottom.act({ top: daMapObj.mapViewHeight/2+14 }, params);
			daMapObj.daCrossObj.left.act({ left: -daMapObj.mapViewWidth/2-12 }, params);
			
			daMapObj.daCrossObj.top.act({ top: -daMapObj.mapViewHeight }, params);
			daMapObj.daCrossObj.right.act({ left: daMapObj.mapViewWidth }, params);
			daMapObj.daCrossObj.bottom.act({ top: daMapObj.mapViewHeight }, params);
			daMapObj.daCrossObj.left.act({ left: -daMapObj.mapViewWidth }, params);
			
//			daMapObj.daCrossObj.top.css({ top: -daMapObj.mapViewHeight });
//			daMapObj.daCrossObj.right.css({ left: daMapObj.mapViewWidth });
//			daMapObj.daCrossObj.bottom.css({ top: daMapObj.mapViewHeight });
//			daMapObj.daCrossObj.left.css({ left: -daMapObj.mapViewWidth });
			
//			daMapObj.daCrossObj.top.act({ top: -daMapObj.mapViewHeight/2-10 }, params);
//			daMapObj.daCrossObj.right.act({ left: daMapObj.mapViewWidth/2+12 }, params);
//			daMapObj.daCrossObj.bottom.act({ top: daMapObj.mapViewHeight/2+14 }, params);
//			daMapObj.daCrossObj.left.act({ left: -daMapObj.mapViewWidth/2-12 }, params);
			
		};

		/**地图平移惯性动画
		*/
		daMap.actMove = function( daMapObj, isBegin ){
			if( !daMapObj.setting.act ) return;
			if( isBegin ){																		//记录鼠标按下起点
//				da.out(isBegin)
				daMapObj.moveStartPos = {												//地图平移起始位置， 用于计算地图平移惯性运动
					left: daMapObj.MouseDownLeft,
					top: daMapObj.MouseDownTop
				};
				daMapObj.moveStartTime = new Date();						//地图平移的起始时间
			}
			else{																							//开始执行
//				da.out(2)
				
				var t = ( new Date() - daMapObj.moveStartTime)/1000,
						A = daMapObj.moveStartPos.left - daMapObj.mapMousePos.left,
						B = daMapObj.moveStartPos.top - daMapObj.mapMousePos.top,
						S = Math.sqrt( Math.pow(A,2) + Math.pow(B,2) ),
						a = S/(0.5*Math.pow(t,2));
				
				if( 3000 > a ) return;														//加速度太小就不要执行动画了
		
				
				var nLeft = daMapObj.mapLeft - A/3,								//惯性位移为 1/3
						nTop = daMapObj.mapTop - B/3;
				
				
				daMapObj.MapActing = true;												//执行动画中标志
				
				daMapObj.daMapBaseMapObj.act({
					left: nLeft,
					top: nTop
					
				},{
					duration: 300,
					easing: "easeOutQuad",
					step: function( nowVal, daFxObj ){
						if( "left" == daFxObj.prop ){
							daMapObj.daMapImgObj.css({ left: nowVal });
							daMapObj.daMapCanvasObj.css({ left: nowVal });
							daMapObj.daMapDataObj.css({ left: nowVal });
							daMapObj.mapLeft = nowVal;																		//更新地图偏移位置
						}
						else{
							daMapObj.daMapImgObj.css({ top: nowVal });
							daMapObj.daMapCanvasObj.css({ top: nowVal });
							daMapObj.daMapDataObj.css({ top: nowVal });
							daMapObj.mapTop = nowVal;
						}
						
					},
					complete: function(){																							//动画完成时，再设置一次，保证准确性
//						daMapObj.daMapCanvasObj.css({ left: nLeft, top: nTop });
//						daMapObj.daMapImgObj.css({ left: nLeft, top: nTop });
//						daMapObj.daMapDataObj.css({ left: nLeft, top: nTop });
//						
//						daMapObj.mapLeft = nLeft;																																					//更新地图偏移位置
//						daMapObj.mapTop = nTop;
						
	  					daMapObj.loadBaseMapLayer( daMapObj.mapCurrentLevel );
							daMapObj.MapActing = false;												//取消动画中标志
					}
				});
			  	
				
			}
			
		}

		return daMap;
		
	})();
	


	win.daMap = daMap;

})(window);



/**daMapLayer
*daMap地图辅助 图层类
* @author danny.xu
* @version daMapLayer_1.0 2011-10-17 14:33:51
*/
(function( win, undefined ){
var doc = win.document;

var daMapLayer = (function(){
	
	win.daMapLayerCache = [];								//地图图层全局缓存  { id: 图层对象的id; 	layer: 图层对象 }
	
	/**daMapLayer类构造函数
	*/
	var daMapLayer = function( layerSetting ){
		return new daMapLayer.fnStruct.init( layerSetting );
	};

	daMapLayer.fnStruct = daMapLayer.prototype = {
		version: "daMapLayer v1.0 \nauthor: danny.xu \ndate: 2011-10-17 14:34:30",
		
		layerId: 0,
		layerZ: 10000,												//图层的显示层级
		layerObj: null,
		
		daMapObj: null,												//图层所属地图对象
		daParentObj: null,										//图层的父亲DOM对象
		
		layerMarkers: null,										//图层中的标注缓存
		layerNewMarkers: null,								//当前地图比例尺下，该图层里的标注 未加载过标志，加载后从列表中清除
		layerShowedMarkers: null,							//已经加载过的标注
		layerViewMarkers: null,

		layerSetting: {
			id: "",
			
			parent: null,
			daMap: null,
			layerCode: "",
			
			code: "",
			type: "",
			
			zIndex: 10000,
			
			css: "daMapMarker",
			markWidth: 16,
			markHeight: 16,
			
			cssTitle: "daMapMarkerTitle",
			titleColor: "#333",									//标题颜色
			titleWidth: 200,										//标题尺寸
			titleHeight: 22,
			
			minLevel: 0,
			maxLevel: 0,
			
			draw: null,
			click: null,
			dblclick: null,
			mouseover: null,
			mouseout: null,
			
			isMerge: true
		},
		
		init: function( layerSetting ){
			layerSetting = this.layerSetting = da.extend( {}, this.layerSetting, layerSetting );

			this.layerMarkers = [];
			this.layerNewMarkers = [];
			this.layerShowedMarkers = [];
			this.layerViewMarkers = [];
			
			this.layerId = layerSetting.id || win.daMapLayerCache.length;
			daMapLayer.pushCache( this );
			
			this.layerZ = this.layerSetting.zIndex + win.daMapLayerCache.length;
			this.daMapObj = layerSetting.daMap;
			
			this.daParentObj = da( layerSetting.parent );
			
			this.create();
			
		},
		
		/**创建图层
		*/
		create: function(){
			var layerSetting = this.layerSetting;
			
			if( !this.layerObj && 0 < this.daParentObj.dom.length ){
				this.layerObj = doc.createElement( "div" )
				this.layerObj.id = "daMapLayer_" + this.layerId;
				this.layerObj.style.cssText = "position:absolute;left:0px;top:0px;width:100%;background:transparent;-moz-user-select:none;-khtml-user-drag:none;border:0px solid #0f0";
				this.layerObj.style.zIndex = layerSetting.zIndex + win.daMapLayerCache.length;
				this.daParentObj.dom[0].insertBefore( this.layerObj, null );
			}
//			this.resize();
			
		},
		
		/**绘制图层内容
		* curLevel 地图当前显示图层
		*/
		draw: function( curLevel ){
			curLevel = curLevel || this.daMapObj.mapCurrentLevel;
			
			if( this.layerSetting.minLevel > curLevel || this.layerSetting.maxLevel < curLevel ) return;
			
//			this.resize();
			this.loadMarker();
			
		},
		
		/**加载图层下的标注
		*/
		loadMarker: function(){
			var newMarkers = this.layerNewMarkers,											//未创建的标注
					showedMarkers = this.layerShowedMarkers,								//已经创建的标注
					viewMarkers = this.layerViewMarkers = [];								//可见标注
			
			if( 0 < newMarkers.length )
				this.daMapObj.loading();
			
//			da.timer.call( this, 1000, function( newMarkers, showedMarkers, viewMarkers ){
//			countAll = showedMarkers.length;
			for( var i=0,len=showedMarkers.length; i<len; i++ ){
				if( this.daMapObj.isInView( showedMarkers[i].markerSetting.longitude, showedMarkers[i].markerSetting.latitude ) ){
					viewMarkers.push( showedMarkers[i] );
				}
					
			}
//			da.out("new:"+newMarkers.length);
//			da.out("show:"+showedMarkers.length);
//			da.out("view:"+viewMarkers.length);
//			countAll += newMarkers.length;


//			da.timer.call( this, 13, function( newMarkers, showedMarkers ){
				for( var i=newMarkers.length-1; i>=0; i-- ){									//倒着来，免得splice删除对象后，造成后续对象索引值变化
					switch( newMarkers[i].create() ){
						case 1:																			//不在可视范围内
							break;
						case 2: 																		//被合并
							newMarkers.splice( i, 1 );
							break;
						case 0: 																		//正常创建完成
							showedMarkers.push( newMarkers[i] );
							viewMarkers.push( newMarkers[i] );
							newMarkers.splice( i, 1 );								//splice操作一定要放最后，因为splice操作后当前索引i 指向的对象发生会变化
							break;
					}

					if( 0 === i ){
						da.timer( 300, function( daMapObj ){ daMapObj.loading(true); }, this.daMapObj );					//移除loadings
						
					}
				}
//				da.out("allCount:"+countAll)
				
//			}, newMarkers, showedMarkers);
			
//			}, newMarkers, showedMarkers, viewMarkers );
			


		},
		
		/**重置图层尺寸
		*/
		resize: function(){
			if( 0 >= this.daParentObj.length ) return;
			da( this.layerObj ).width( this.daParentObj.width() );
			da( this.layerObj ).height( this.daParentObj.height() );
		},
		
		/**清理图层数据
		*/
		clear: function(){
			this.layerObj.innerHTML = "";
			this.layerNewMarkers = this.layerMarkers.slice();
			this.layerShowedMarkers = [];
			this.layerViewMarkers = [];
		},
		
		/**移除图层数据
		*/
		remove: function(){
			this.clear();
			daMapLayer.remove(this.layerId);
		},
		
		/**设置图层的显示层级
		* num 级数
		*/
		setZ: function( num ){
			this.layerObj.style.zIndex = 10000 + num;
			
		},
		
		/**显示图层
		*/
		show: function(){
			this.layerObj.style.display = "block";
		},
		
		/**隐藏图层
		*/
		hide: function(){
			this.layerObj.style.display = "none";
		},
		
		/**添加标注
		* markerSetting 标注设置参数
		*/
		appendMarker: function( markerSetting ){
			if( null === this.daMapDataObj ) return;
			
			var daMapMarkerObj,
					defaultParams = {																								//图层默认参数
						parent: this.layerObj,
						daMapLayer: this,
						layerCode: this.layerSetting.code
					};
			
			if( "undefined" === typeof markerSetting.markerId ){								//若传入的参数，是标准的daMapLayer图层设置参数
				if( da.isPlainObj( markerSetting ) ){
					markerSetting = da.extend( {}, markerSetting, defaultParams );																		//补充图层默认参数
					
					daMapMarkerObj = daMapMarker( markerSetting );
				}
				
			}
			else{																															//若传入的参数，是用户new出来的daMapLayer对象
				daMapMarkerObj = markerSetting;
				daMapMarkerObj.markerSetting = da.extend( {}, daMapMarkerObj.markerSetting, defaultParams );				//修正图层对象参数
				
				daMapMarkerObj.daMapLayerObj = this;
				daMapMarkerObj.daParentObj = da( this.layerObj );
			}
			
			this.layerMarkers.push( daMapMarkerObj );													//压入daMap对象缓存列表
			this.layerNewMarkers.push( daMapMarkerObj );

//			this.draw();
			
			return daMapMarkerObj;																						//返回图层对象，便于后续操作
			
		}
		
	};

	daMapLayer.fnStruct.init.prototype = daMapLayer.prototype;			//模块通过原型实现继承属性

	//把当前图层对象压入全局缓存
	/*
		layerObj: 图层对象
	*/
	daMapLayer.pushCache = function( layerObj ){
		var newCache = {
					id: layerObj.layerId,
					layer: layerObj
		};
		win.daMapLayerCache.push( newCache );		//把相应的对象信息，压入缓存
	
		return newCache;													//返回最新的缓存信息
	};
	
	//把当前图层对象弹出缓存
	/*
		layerId: 图层对象的id
		isGet: 是get模式还是pop模式
	*/
	daMapLayer.popCache = function( layerId, isGet ){
		var arrCache = win.daMapLayerCache;
		var res = null;
		
		for(var idx in arrCache){
			if(layerId === arrCache[idx].id){
				res = arrCache[idx];
				if(isGet) return res.layer;									//如果是get
				
				arrCache.splice(idx,1);											//删除相应索引的缓存
				return res.layer;
			}
		}
		return null;
	};

	//通过id获取layer缓存对象
	/*
		layerId: 标注对象的id
	*/
	daMapLayer.getLayer = function( layerId ){
		return daMapLayer.popCache( layerId, true );
	};


	/**清除标注
	*/
	daMapLayer.remove = function( layerId ){
		if( !layerId ) return;
			
		var obj = daMapLayer.popCache( layerId ),
				mapLayers = obj.daMapObj.mapBaseMapLayers,
				imgLayers = obj.daMapObj.mapImgLayers,
				dataLayers = obj.daMapObj.mapDataLayers,
				isFinded = false;
				
		for( var i=0,len=mapLayers.length; i<len; i++ ){
			if( layerId == mapLayers[i].layerId ){
				mapLayers.splice(i,1);												//在父图层对象缓存区中，删除相应索引的标注对象缓存
				isFinded = true;
				break;
			}
		}
		
		for( var i=0,len=imgLayers.length; !isFinded && i<len; i++ ){
			if( layerId == imgLayers[i].layerId ){
				imgLayers.splice(i,1);
				isFinded = true;
				break;
			}
		}
		
		for( var i=0,len=dataLayers.length; !isFinded && i<len; i++ ){
			if( layerId == dataLayers[i].layerId ){
				dataLayers.splice(i,1);
				isFinded = true;
				break;
			}
		}
		
		obj.daParentObj.dom[0].removeChild( obj.layerObj );
		
	};

	/**标注合并处理
	* srcMarker 合并标注对象
	* targetMarker 被合并标注对象
	*/
	daMapLayer.handleMerge = function( srcMarker, targetMarker ){
		var showedObj = srcMarker.markerObj,
				dataMulti = da.data( showedObj, "daMapMarkerMulti" ),
				spanMulti;
		
		if( !dataMulti ){
			dataMulti = [ targetMarker ];
			da("#daMapMarkerTitle_" + srcMarker.markerId).hide();
			
			spanMulti = doc.createElement("ul");
			spanMulti.className = "daMapMultiNum";
			spanMulti.style.cssText = "position:absolute;padding:0px;margin:0px;";
			spanMulti.innerHTML = dataMulti.length + "+";
			da( spanMulti ).bind( "click", function( evt ){
				daMapLayer.showMerge( srcMarker.daMapLayerObj, srcMarker );								//显示合并标注
				
				if( "undefined" !== typeof daTip ) daTip.hide("tip");
				evt.stopPropagation();//evt.preventDefault();															//阻止事件冒泡
				
			}).bind("mouseover",function( evt ){
				evt.stopPropagation();//evt.preventDefault();															//阻止事件冒泡
			});
			
			showedObj.insertBefore( spanMulti, null );
			da.data( showedObj, "daMapMarkerMulti", dataMulti );												//添加合并标注缓存
		}
		else{
			dataMulti.push( targetMarker );
			
			spanMulti = showedObj.children[0];
			spanMulti.innerHTML = dataMulti.length + "+";
			
		}
		
	};
	
	/**加载显示被合并标注
	* layerObj 图层对象
	* srcMarker 合并标注对象
	*/
	daMapLayer.showMerge = function( layerObj, srcMarker ){
		var showedObj, dataMulti, dotMarker, dotMarkerSetting;
		
		if( srcMarker ){
			showedObj = srcMarker.markerObj;
			dataMulti = da.data( showedObj, "daMapMarkerMulti" );
			
			if( dataMulti ){
				for( var i=0,len=dataMulti.length; i<len; i++ ){
					dotMarkerSetting = {
						noCache: true, 
						id: da.nowId(),
						css: "daMapDot",
						zIndex: 0,
						width: 10,
						height: 10,
						hotspot: {
							left: 5,
							top: 10
						},
						titleLevel: layerObj.daMapObj.setting.maxLevel,
						isMerge: false
					};
					
					dotMarkerSetting = da.extend( {}, dataMulti[i].markerSetting, dotMarkerSetting );
					
					daMapMarker( dotMarkerSetting ).create();
//					dataMulti[i].create();
					
				}
				
				showedObj.innerHTML = "";
				da.undata( showedObj, "daMapMarkerMulti" );
			}
			
			
		}
		else{
			
			
		}
		
	};
	
	return daMapLayer;
})();


win.daMapLayer = daMapLayer;

})(window);




/**daMapMarker
*daMap地图辅助 标注类
* @author danny.xu
* @version daMapMarker_1.0 2011-10-17 14:33:51
*/
(function( win, undefined ){
var doc = win.document;

var daMapMarker = (function(){
	
	win.daMapMarkerCache = [];				//地图标注全局缓存  { id: 标注对象的id; 	marker: 标注对象 }
	
	/**daMapMarker类构造函数
	*/
	var daMapMarker = function( markerSetting ){
		return new daMapMarker.fnStruct.init( markerSetting );
	};

	daMapMarker.fnStruct = daMapMarker.prototype = {
		version: "daMapMarker v1.0 \nauthor: danny.xu \ndate: 2011-10-17 14:34:30",
		
		markerId: 0,
		markerObj: null,
		
		daMapLayerObj: null,									//标注所属的图层对象
		daParentObj: null,										//标注的父亲DOM对象
		
		markerSetting: {
			id: "",															//唯一流水号
			
			parent: null, 											//父亲DOM对象
			daMapLayer: null,										//父亲图层对象
			
			noCache: false,											//不需要全局缓存
			
			code: "",														//编码号和分类号
			type: "",
			
			image: "",														//图标图片
			css: "",														//样式
			cssTitle: "",
			
			width: 32,													//标注图标尺寸
			height: 32,
			hotspot: {													//标注图标 有效热点（指针针尖） 位置偏移量
				left: 11,
				top: 32
			},
			left: 0,
			top: 0,
			
			title: "",													//标题内容
			titleLevel: 3,											//标题的可显示地图级别>=5
			titleColor: "",											//标题颜色
			titleWidth: 0,											//标题尺寸
			titleHeight: 0,
			
			longitude: 0,												//标注经纬度
			latitude: 0,
			
			data: null,													//标注 用户自定义附属数据
			
			loaded: null,												//加载完毕回调函数
			click: null,
			dblclick: null,
			mouseover: null,
			mouseout: null,
			
			isMerge: true,
			merge: 0														//合并容差值
		},
		
		/**初始化函数
		*/
		init: function( markerSetting ){
			markerSetting = this.markerSetting = da.extend( {}, this.markerSetting, markerSetting );
			
			this.daMapLayerObj = markerSetting.daMapLayer;
//			markerSetting.merge = Math.max( this.markerSetting.merge, this.markerSetting.width, this.markerSetting.height );				//修正合并容差值
			
			this.markerId = markerSetting.id || win.daMapMarkerCache.length;
			
			if( !markerSetting.noCache )																		//默认需要进行全局缓存，便于今后获取
				daMapMarker.pushCache( this );
			
			this.daParentObj = da( markerSetting.parent );
//			if( 0 < this.daParentObj.length ) this.create();
			
		},
		
		/**创建标注
		*/
		create: function(){
			var markerSetting = this.markerSetting,
				daMapObj = this.getMap(), 
				daLayerObj = this.daMapLayerObj, 
				markerObj, titleObj, pos;
			
			if( !daMapObj || 0 >= this.daParentObj.dom.length ) return;

			pos = daMapObj.coordToScreen( markerSetting.longitude, markerSetting.latitude, daMapObj.mapCurrentLevel );
			markerSetting.left = ( pos.left - markerSetting.hotspot.left );
			markerSetting.top = ( pos.top - markerSetting.hotspot.top );

			if( !daMapObj.isInView( markerSetting.longitude, markerSetting.latitude ) ) return 1;							//在当前级别加载过，或不在可视区域内，暂不创建

			if( (markerSetting.isMerge ? daLayerObj.layerSetting.isMerge : false) ){
				var viewMarkers = daLayerObj.layerViewMarkers;													//查找是否可以合并（不必再创建DOM了）
//				da.out("viewlength:"+viewMarkers.length);
//				countAll += viewMarkers.length;
				
				for( var i=0,len=viewMarkers.length; i<len; i++ ){
					if( daMapMarker.isMerge( viewMarkers[i], this ) 
					&& viewMarkers[i].markerSetting.type == markerSetting.type ) {
						daMapLayer.handleMerge( viewMarkers[i], this );
						return 2;
					}
					
				}
				
			}
			
			markerObj = doc.createElement( "div" );
			
			var css = "display:none;position:absolute;z-index:2;width:"+ markerSetting.width +"px;height:"+ markerSetting.height 
				+"px;left:"+ markerSetting.left +"px;top:"+ markerSetting.top +"px;";
				
			if( markerSetting.image )
				css += "background:url("+ markerSetting.image +") no-repeat; cursor:pointer;";
			else
				markerObj.className = markerSetting.css || daLayerObj.layerSetting.css;
			
			markerObj.style.cssText = css;
			
			this.daParentObj.dom[0].insertBefore( markerObj, null );
//			da( markerObj ).delay( da.random(1,500) );
//			da( markerObj ).slideDown(500);
			
			da.timer( da.random(1,300), function(){ markerObj.style.display = "block"; });
			
			this.markerObj = markerObj;
			if( markerSetting.title && markerSetting.titleLevel <= daMapObj.mapCurrentLevel ){
				titleObj = doc.createElement( "div" )
				titleObj.id = "daMapMarkerTitle_" + this.markerId;
				titleObj.className = markerSetting.cssTitle || daLayerObj.layerSetting.cssTitle ;
				titleObj.style.cssText = "position:absolute;z-index:1;width:"+ (markerSetting.titleWidth || daLayerObj.layerSetting.titleWidth) 
				+ "px;height:" + (markerSetting.titleHeight || daLayerObj.layerSetting.titleHeight) 
				+ "px;left:"+ ( pos.left-(markerSetting.titleWidth || daLayerObj.layerSetting.titleWidth)/2 ) +"px;top:"+ pos.top 
				+ "px;color:"+ ( markerSetting.titleColor || daLayerObj.layerSetting.titleColor )  +";";
				
				titleObj.innerHTML = this.markerSetting.title;
				
				this.daParentObj.dom[0].insertBefore( titleObj, null );
			}
			
			this.bindEvent();
			
			if( this.markerSetting.loaded )
				this.markerSetting.loaded.call( markerObj, this, this.markerSetting );
			
			return 0;
		},
		
		/**绑定事件
		*/
		bindEvent: function(){
			var context = this;
			
			if( this.markerSetting.click ){
				this.markerObj.style.cursor = "pointer";
				
				da( this.markerObj ).bind("click", function( evt ){
					context.markerSetting.click.call( this, evt, context, context.markerSetting );
					
				}).bind("mousedown mouseup", function( evt ){
					evt.stopPropagation();//evt.preventDefault();
				});;
			}
			
			if( this.markerSetting.dblclick ){
				da( this.markerObj ).bind("dblclick", function( evt ){
					context.markerSetting.dblclick.call( this, evt, context, context.markerSetting );
					
					evt.stopPropagation();//evt.preventDefault();
				});
			}
			
			da( this.markerObj ).bind("mouseover", function( evt ){
				if( context.markerSetting.mouseover )
						context.markerSetting.mouseover.call( this, evt, context, context.markerSetting );

				
				if( "undefined" !== typeof daTip ){
					var arrHTML = [],
							dataMulti = da.data( this, "daMapMarkerMulti" );																											//如果是合并标注，提示显示被合并标注中的前10个title
					
					arrHTML.push('<div style="color:#333;height:18px;line-height:18px;font-weight:bold">1. '+context.markerSetting.title+'</div>');

					if( dataMulti ){
						var i, len;
						for( i=0,len=dataMulti.length; i<len && i<5; i++ )
							arrHTML.push( '<div style="color:#333;height:18px;line-height:18px;">'+ (i+2) + ". " + dataMulti[i].markerSetting.title+'</div>' );
						
						if( 5 < len )
							arrHTML.push( '…<div style="color:#333;height:18px;line-height:18px;font-weight:bold">共'+ (len+1) +'&nbsp;项</div>' );									//+1合并标注对象自身
					}
					
					
					daTip({
						target: this,
						parent: context.getMap().daMapDataObj.dom[0],
						onlyOne: true,
						group: "tip",
						html: arrHTML.join(""),
						bg: "#fff",
						color: "#555",
						pointer: "no",
						close: false
					});
				}
				
			});
			
			da( this.markerObj ).bind("mouseout", function( evt ){
				if( context.markerSetting.mouseout )
						context.markerSetting.mouseout.call( this, evt, context, context.markerSetting );
				
				if( "undefined" !== typeof daTip ) daTip.hide("tip");
				
			});
			
			
		},
		
		/**移除标注
		*/
		remove: function(){
			daMapMarker.remove( this.markerId );
		},
		
		/**获得标注所属地图对象
		*/
		getMap: function(){
			if( null !== this.daMapLayerObj &&  null !== this.daMapLayerObj.daMapObj ){
				return this.daMapLayerObj.daMapObj;
			}
			else
				return null;
		}
		
	};

	daMapMarker.fnStruct.init.prototype = daMapMarker.prototype;			//模块通过原型实现继承属性


	//把当前标注对象压入全局缓存
	/*
		markerObj: 标注对象
	*/
	daMapMarker.pushCache = function( markerObj ){
		var newCache = {
					id: markerObj.markerId,
					marker: markerObj
		};
		win.daMapMarkerCache.push( newCache );		//把相应的对象信息，压入缓存
	
		return newCache;													//返回最新的缓存信息
	};
	
	//把当前标注对象弹出缓存
	/*
		markerId: 标注对象的id
		isGet: 是get模式还是pop模式
	*/
	daMapMarker.popCache = function( markerId, isGet ){
		var arrCache = win.daMapMarkerCache;
		var res = null;
		
		for(var idx in arrCache){
			if(markerId === arrCache[idx].id){
				res = arrCache[idx];
				if(isGet) return res.marker;									//如果是get
				
				arrCache.splice(idx,1);												//删除相应索引的缓存
				return res.marker;
			}
		}
		return null;
	};
	
	//通过id获取marker缓存对象
	/*
		markerId: 标注对象的id
	*/
	daMapMarker.getMarker = function( markerId ){
		return daMapMarker.popCache( markerId, true );
	};
	
	/**清除标注
	*/
	daMapMarker.remove = function( markerId ){
		if( !markerId ) return;
			
		var obj = daMapMarker.popCache( markerId ),
				layerMarkers = obj.daMapLayerObj.layerMarkers,
				layerNewMarkers = obj.daMapLayerObj.layerNewMarkers;
//				layerNewMarkers: null,								//当前地图比例尺下，该图层里的标注 未加载过标志，加载后从列表中清除
//				layerShowedMarkers: null,							//已经加载过的标注
//				layerViewMarkers: null,

		for( var i=0,len=layerMarkers.length; i<len; i++ ){
			if( markerId == layerMarkers[i].markerId ){
				layerMarkers.splice(i,1);					//在父图层对象缓存区中，删除相应索引的标注对象缓存
//				layerNewMarkers.splice(i,1);
				break;
			}
			
		}
		
		obj.daParentObj.dom[0].removeChild( obj.markerObj );
		
		var objTitle = document.getElementById( "daMapMarkerTitle_" + markerId );
		if( null !== objTitle )
			obj.daParentObj.dom[0].removeChild( objTitle );
		
		
	};
	
	
	/**判断是否合并
	* srcMarker 合并标注对象
	* targetMarker 被合并标注对象
	*/
	daMapMarker.isMerge = function( srcMarker, targetMarker ){
		var srcRect = {
					x1: srcMarker.markerSetting.left - srcMarker.markerSetting.merge,
					y1: srcMarker.markerSetting.top - srcMarker.markerSetting.merge,
					x2: srcMarker.markerSetting.left + srcMarker.markerSetting.width + srcMarker.markerSetting.merge,
					y2: srcMarker.markerSetting.top + srcMarker.markerSetting.height + srcMarker.markerSetting.merge
				},
				targetRect = {
					x1: targetMarker.markerSetting.left,
					y1: targetMarker.markerSetting.top,
					x2: targetMarker.markerSetting.left + targetMarker.markerSetting.width,
					y2: targetMarker.markerSetting.top + targetMarker.markerSetting.height
				};
				
		if( ( srcRect.x1 > targetRect.x2) | ( srcRect.x2 < targetRect.x1 ) | ( srcRect.y1 > targetRect.y2) | ( srcRect.y2 < targetRect.y1 ) )
			return false;
		else
			return true;

	};

	return daMapMarker;
})();


win.daMapMarker = daMapMarker;

})(window);


/**daMapPop
*地图标注气泡信息窗口
* @author danny.xu
* @version daMapPop_1.0 2011-10-23 15:24:41
*/

(function( win, undefined ){
var doc = win.document;

var daMapPop = (function(){
	
	var _daMapPopShandowImg = "/plugins/daMap/images/daMapPopShandow.png";							//daMapPop信息窗口的阴影特效图片路径
	
	
	/**daPopMenu类构造函数
	*/
	var daMapPop = function( popSetting ){
		return new daMapPop.fnStruct.init( popSetting );
	};

	daMapPop.fnStruct = daMapPop.prototype = {
		version: "daMapPop v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",
		//TODO:成员属性
		
		popId: null,
		popObj: null,
		
		daParentObj: null,										//气泡信息窗口嵌入的父亲对象
		daMapObj: null,											//气泡信息窗口所属地图对象
		daMapMarkerObj: null,									//气泡信息窗口指向的地图标注对象
		
		popSetting: {
			daMap: null,
			daMapMarker: null,
			
			width: 250,
			height: 150,
			
			longitude: 0,
			latitude: 0,
			
			left: 0,
			top: 0,
			
			url: "",
			html: ""
			
		},
		
		/**初始化函数
		*/
		init: function( popSetting ){
			popSetting = this.popSetting = da.extend( {}, this.popSetting, popSetting );
			
			this.popId = da.nowId();
			
			this.daMapObj = popSetting.daMap;
			if( popSetting.daMapMarker ){
				this.daMapMarkerObj = popSetting.daMapMarker;
				popSetting.longitude = popSetting.longitude || this.daMapMarkerObj.markerSetting.longitude; 
				popSetting.latitude = popSetting.latitude || this.daMapMarkerObj.markerSetting.latitude;
				this.daParentObj = this.daMapMarkerObj.daParentObj;
			}
			else{
				this.daParentObj = da( daMapLayer.getLayer( "mapPop_"+ this.daMapObj.mapId ).layerObj );
			}

			this.create();
			
		},
		
		create: function(){
			var context = this,
					popSetting = this.popSetting,
					popObj = doc.createElement("div"),
					tmpObj, pos;
			
			
			pos = this.daMapObj.coordToScreen( popSetting.longitude, popSetting.latitude, this.daMapObj.mapCurrentLevel );
			
			popSetting.left = ( pos.left - popSetting.width/2 );
			popSetting.top = ( pos.top - popSetting.height ) - 80 - ( this.daMapMarkerObj ? this.daMapMarkerObj.markerSetting.height : 0 );
			
			popObj.style.cssText = "position:absolute;z-index:3;left:"+ popSetting.left +"px; top:"+ popSetting.top +"px;height:"+ popSetting.height +"px;width:"+popSetting.width +"px;";
			this.daParentObj.dom[0].insertBefore( popObj, null );
			this.popObj = popObj;
			
			tmpObj = doc.createElement("div");
			tmpObj.style.cssText = "position:absolute;z-index:1;left:"+ popSetting.width*.2 +"px;top:"+ ( popSetting.height + 100 )*.5 +"px;width:"+popSetting.width*1.2+"px;height:"+popSetting.height*.8+"px; background:none; pointer-events:none;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src='/images/transparent.png');";
			tmpObj.innerHTML = '<img src="'+ _daMapPopShandowImg + '" style="-moz-user-select:none;-khtml-user-drag:none; width:'+ popSetting.width*1.2 +'px;height:'+ popSetting.height*.8 +'px;" />';
//			da( tmpObj ).bind( "mousedown", function( evt ){
//				evt.preventDefault();
//				
//			});
			
			popObj.insertBefore( tmpObj, null );
			
			tmpObj = doc.createElement("div");
			tmpObj.style.cssText = "position:absolute;z-index:2;left:0px; top:0px; width:"+popSetting.width+"px; height:"+popSetting.height +"px;border:1px solid #666;background-color:#fff";
			if( popSetting.url )
				tmpObj.innerHTML = '<iframe src="'+ popSetting.url + '" style="width:'+ popSetting.width + 'px;height:'+ popSetting.height +'px;" frameBorder="0" scrolling="no"></iframe>';
			else
				tmpObj.innerHTML = popSetting.html;
			
			popObj.insertBefore( tmpObj, null );
			
			tmpObj = doc.createElement("div");
			tmpObj.className = "daMapPopClose";
			tmpObj.style.cssText = "position:absolute;z-index:3";
			popObj.insertBefore( tmpObj, null );
			da( tmpObj ).bind( "click", function( evt ){
				context.remove();
				evt.stopPropagation();evt.preventDefault();
				
			});
			
			tmpObj = doc.createElement("div");
			tmpObj.className = "daMapPopPointer";
			tmpObj.style.cssText = "position:absolute;z-index:3";
			popObj.insertBefore( tmpObj, null );
			
			
//			mapViewCoord: {										//可视区域的经纬度 坐标范围
//				minLongitude: 0,
//				minLatitude: 0,
//				maxLongitude: 0,
//				maxLatitude: 0
//			},
			
//			if( popSetting.left < this.daMapObj.mapViewCoord.minLongitude ){
//			
//			}
			
		},
		
		remove: function(){
			this.daParentObj.dom[0].removeChild( this.popObj );
		}
		
		//TODO:成员函数
		
	};

	daMapPop.fnStruct.init.prototype = daMapPop.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daMapPop;
})();




win.daMapPop = daMapPop;

})(window);







/**daMapCanvas
*daMap地图辅助 绘图代码
* @author danny.xu
* @version 2012-3-21 
*/

da.extend( daMap.fnStruct,  {
	beginDraw: function(){
		this.daMapCanvasObj.css("z-index", 30);
	},
	
	endDraw: function(){
		this.daMapCanvasObj.css("z-index", 10);
	}
})