
/*************************************** daWin类（窗口对象） ************************************/
/*
	author:	danny.xu
	date:	2010-10-27
	description:	daWin,daDialog类脚本文件
*/
(function(win){
var doc = win.document;

win.dwArrCache = [];				//daWin多窗口全局缓存  {id: daWin窗口的id; 	daWin: daWin窗口对象}
win.dwDockCache = [];				//daWin多窗口停靠缓存  {id: daWin窗口的id; 	daWin: daWin窗口对象}

//daWin构造函数
/*
	dwSetting: 用户参数列表
*/
var daWin=function( dwSetting ){
	return new daWin.fnStruct.init( dwSetting );
};

daWin.fnStruct = daWin.prototype = {
	/********** 静态成员 (可以通过daWin.fnStruct.XXX调用)**************/
	version: "daWin 1.0  \n\nauthor: danny.xu\n\ndate: 2010-10-30\n\nThank you!!!",
	
	dwCssSize: {						//预留daWin窗口边框样式尺寸（可参照daWin.css样式表）
		t_h: 34,
		cap_w: 80,
		bts_w: 60,
		l_w: 10,
		l2_w: 16,
		r_w: 9,
		r2_w: 16,
		b_h: 32,
		
		win_w: 191,						//(50+60+(10+16+9+16))
		win_h: 66,						//34+32
		dialog_padding: 20
	},
	
	dwSetting: {
		width: 0,											//窗口宽
		height: 0,										//窗口高
		url: "",											//url地址
		title: "温馨提示",						//caption标题
		html: "",											//如果是对话框模式，要显示的内容
		modal: false,									//是否以模式对话框的方式显示，可选[true|false]
		status: null,									//状态栏信息
		backclose: true,							//当窗体内页操作完毕返回时是否关闭窗体，默认是true
		rootwin: true,								//创建的窗体是否都属于顶级框架页面中
		
		css: {
			daDivPad: "daWin"
		},
		type: "info",
		before: null,									//窗口内页加载前执行
		load: null,										//窗口内页加载完毕执行
		after: null,									//关闭窗口后执行
		back: null,										//窗体内页操作完毕返回数据执行
		yes: null,										//对话框模式时返回"yes"回调处理函数
		no: null,											//对话框模式时返回"no"回调处理函数
		button: null									//对话框模式时,自定义按钮集合，如：{ "全选": function(){...}, "清空": function(){...}}
	},
	
	dwParent: null,						//daWin容器父对象
	dwId: 0,									//daWin dom对象id序号
	dwPad: null,							//daWin容器dom对象
	dwBody: null,							//daWin主题table dom对象
	dwTHead: null,
	dwTBody: null,
	dwTFoot: null,
	
	dwBodyTop: null,					//标题栏dom对象
	dwCaption: null,					//标题显示内容dom对象
	dwIframe: null,						//内框架dom对象
	dwDialog: null,						//dialog 模式HTML容器dom对象
	dwDlgBts: null,						//dialog 模式操作按钮dom对象集合
	
	dwStatus: null,						//状态栏dom对象
	dwLoadover: null,					//loading遮罩dom对象
	dwLoading: null,					//loading动画dom对象
	
	dwBts: null,							//标题栏按钮对象集
	dwStatusBts: null,				//状态蓝按钮对象集
	dwBorder: null,						//daWin边框对象集
	
	dwSize: null,							//窗口当前尺寸 和位置
	
	sizeMode: "normal",					//当前窗口尺寸状态  normal:正常窗口，max:最大，min:最小
	isLoading: true,						//数据加载中
	isActiving: true,						//是否为当前活动窗口
	isDialog: true,							//是否是对话框模式
		
	dwDefzIndex:10000,					//窗口显示层级
	dwActzIndex:19999,
	
	
	//初始化函数
	/*
		dwSetting: 用户参数列表
	*/
	init: function( dwSetting ){
		dwSetting = this.dwSetting = da.extend( true, {}, this.dwSetting, dwSetting );
		if( dwSetting.rootwin ){				//修正daWin所属环境
				win = daWin.getRootWin();
		    doc = win.document;

				win.dwArrCache = win.dwArrCache || [];
				win.dwDockCache = win.dwDockCache || [];
		}
		this.dwParent = doc.body;
    
		this.dwSize = { w:0, h:0, top: null, left: null, right:null, bottom:null };
		this.dwSize.w = this.parseSize( dwSetting.width );
		this.dwSize.h = this.parseSize( dwSetting.height );

		while( null !== doc.getElementById( "daWin_" + this.dwId ) ) this.dwId++;
		
		this.dwBts = {					//初始化标题栏按钮对象集
			btmin: null,
			btmax: null,
			btclose: null	
		};
		
		this.dwStatusBts = {		//初始化状态栏按钮对象集
			btfresh: null		
		};
		
		this.dwBorder = {				//初始化daWin边框对象集
			tl:null, tl2:null, t:null, tr2:null, tr:null,
			l:null, r:null,
			bl:null, bl2:null, b:null, br2:null, br:null
		};
		
		this.isDialog = ( "" === dwSetting.url ) ? true : false;		//如果没有内页url地址，说明就是对话框模式
		if( !dwSetting.modal )	dwSetting.modal = this.isDialog;
		else dwSetting.modal = dwSetting.modal;
		
		this.dwDlgBts = [];											//对话框功能按钮dom对象集合
		
		this.create( dwSetting );								//创建daWin的HTML对象集
		
		this.initFnCallBack( dwSetting );				//初始化回调函数
		
		return this;
	},
	
	
	//创建HTML对象
	/*
		dwSetting
	*/
	create: function( dwSetting ){
		var dwId = this.dwId,
				objPad = doc.createElement("div");
		objPad.className = dwSetting.css.daDivPad;
		objPad.id = "daWin_"+ dwId;

		objPad.style.zIndex = this.dwDefzIndex + dwId;		//z 坐标设置为默认高度+dwId(当前daWin窗口索引号)
		
		objPad.innerHTML = [
	     '<table id="dw_body_', dwId, '" class="dwBody" cellpadding="0" cellspacing="0">',
	     '<thead id="dw_thead_', dwId, '">',
	      '<tr>',
	       '<td id="dw_bodytl_', dwId, '" class="tl"></td>',
	       '<td id="dw_bodytl2_',  dwId, '" class="tl2"></td>',
	       '<td id="dw_bodytop_',  dwId, '" class="top">',
	           '<table style="width:100%; height:34px;" cellpadding="0" cellspacing="0">',
	             '<tr>',
	               '<td >',
	                  '<div style="position:relative; height:34px;">',
	                    '<div class="dwCaplight"></div>',
	                    '<div id="dw_caption_',  dwId, '" class="dwCaption"></div>',
	                  '</div>',
	               '</td>',
	               '<td style="width:60px">',
	                 '<a id="dw_btmin_',  dwId, '" href="javascript:void(0)" class="btmin" title="最小化"></a>',
	                 '<a id="dw_btmax_',  dwId, '" href="javascript:void(0)" class="btmax" title="窗口/最大化"></a>',
	                 '<a id="dw_btclose_',  dwId, '" href="javascript:void(0)" class="btclose" title="关闭"></a>',
	               '</td>',
	             '</tr>',
	           '</table>',
	       '</td>',
	       '<td id="dw_bodytr2_',  dwId, '" class="tr2"></td>',
	       '<td id="dw_bodytr_',  dwId, '" class="tr"></td>',
	      '</tr>',
	      '</thead>',
	     	'<tbody id="dw_tbody_', dwId, '">',
	      '<tr>',
	        '<td id="dw_bodyleft_',  dwId, '" class="left"></td>',
	        '<td class="mid" colspan="3">',
	           '<div style="position:relative; overflow:auto;" >',
	                '<iframe id="dw_iframe_',  dwId, '" frameborder="0" style="background:#f7f7f7;"></iframe>',
	                '<div id="dw_dialog_',  dwId, '" class="dwDialog" ></div>',
	                '<div id="dw_loadover_',  dwId, '" class="dwLoadover"></div>',
	           '</div>',
	        '</td>',
	        '<td id="dw_bodyright_',  dwId, '" class="right"></td>',
	      '</tr>',
	      '</tbody>',
	     	'<tfoot id="dw_tfoot_', dwId, '">',
	      '<tr>',
	        '<td id="dw_bodybl_',  dwId, '" class="bl"></td>',
	        '<td id="dw_bodybl2_',  dwId, '" class="bl2"></td>',
	        '<td id="dw_bodybottom_',  dwId, '" class="bottom" style="position:relative;">',
	           '<div style="position:relative; height:32px;">',
	              //'<div class="dwStatuslight"></div>',
	              '<div id="dw_status_',  dwId, '" class="dwStatusInfo"></div>',
	              '<div id="dw_statusbts_',  dwId, '" class="dwStatusBts">',
	              		'<a id="dw_btfresh_',  dwId, '" href="javascript:void(0)" class="btfresh" title="刷新"></a>',
	              '</div>',
	           '</div>',
	        '</td>',
	        '<td id="dw_bodybr2_',  dwId, '" class="br2"></td>',
	        '<td id="dw_bodybr_',  dwId, '" class="br"></td>',
	      '</tr>',
	      '</tfoot>',
	     '</table>'
		].join('');

		this.dwPad = objPad;
		
		this.dwParent.appendChild(this.dwPad);
		
		//获取对象集
		this.dwBody = doc.getElementById("dw_body_"+ dwId);
		this.dwTHead = doc.getElementById("dw_thead_"+ dwId);
		this.dwTBody = doc.getElementById("dw_tbody_"+ dwId);
		this.dwTFoot = doc.getElementById("dw_tfoot_"+ dwId);
		
		this.dwBodyTop = doc.getElementById("dw_bodytop_"+ dwId);
		this.dwCaption = doc.getElementById("dw_caption_"+ dwId);
		
		this.dwIframe = doc.getElementById("dw_iframe_"+ dwId);
		this.dwDialog = doc.getElementById("dw_dialog_"+ dwId);
		this.dwLoadover = doc.getElementById("dw_loadover_"+ dwId);
		this.dwStatus = doc.getElementById("dw_status_"+ dwId);
		
		this.dwBts.btmin = doc.getElementById("dw_btmin_"+ dwId);
		this.dwBts.btmax = doc.getElementById("dw_btmax_"+ dwId);
		this.dwBts.btclose = doc.getElementById("dw_btclose_"+ dwId);
		
		this.dwStatusBts.fresh = doc.getElementById("dw_btfresh_"+ dwId);
		
		//
		this.dwBorder.tl = doc.getElementById("dw_bodytl_"+ dwId);
		this.dwBorder.tl2 = doc.getElementById("dw_bodytl2_"+ dwId);
		this.dwBorder.t = doc.getElementById("dw_bodytop_"+ dwId);
		this.dwBorder.tr2 = doc.getElementById("dw_bodytr2_"+ dwId);
		this.dwBorder.tr = doc.getElementById("dw_bodytr_"+ dwId);
		this.dwBorder.l = doc.getElementById("dw_bodyleft_"+ dwId);
		this.dwBorder.r = doc.getElementById("dw_bodyright_"+ dwId);
		this.dwBorder.bl = doc.getElementById("dw_bodybl_"+ dwId);
		this.dwBorder.bl2 = doc.getElementById("dw_bodybl2_"+ dwId);
		this.dwBorder.b = doc.getElementById("dw_bodybottom_"+ dwId);
		this.dwBorder.br2 = doc.getElementById("dw_bodybr2_"+ dwId);
		this.dwBorder.br = doc.getElementById("dw_bodybr_"+ dwId);
		
		if( this.isDialog )																						//对话框模式，不需要最大、最小按钮、刷新，隐藏掉，但保留位置哦
			this.dwStatusBts.fresh.style.visibility = this.dwBts.btmin.style.visibility = this.dwBts.btmax.style.visibility = "hidden";
		else{																													//窗口模式，可改变窗口大小
			this.dwBorder.tl.style.cursor = "nw-resize";
			this.dwBorder.tl2.style.cursor = "nw-resize";
			this.dwBorder.t.style.cursor = "n-resize";
			this.dwBorder.tr2.style.cursor = "ne-resize";
			this.dwBorder.tr.style.cursor = "ne-resize";
			this.dwBorder.l.style.cursor = "w-resize";
			this.dwBorder.r.style.cursor = "e-resize";
			this.dwBorder.bl.style.cursor = "sw-resize";
			this.dwBorder.bl2.style.cursor = "sw-resize";
			this.dwBorder.b.style.cursor = "s-resize";
			this.dwBorder.br2.style.cursor = "se-resize";
			this.dwBorder.br = doc.getElementById("dw_bodybr_"+ dwId);
		}
		//
		this.bindEvent();
		if( !this.isDialog )	this.loading();						//如果是对话框模式，就不需用loading动画了
		this.setTitle( dwSetting );											//设置标题栏
		this.setCnt( dwSetting );												//设置iframe


		if(null === this.dwSize.left)										//校正窗体位置
			this.dwSize.left = (da(win).width() - da(this.dwBody).width())/2;
		if(null === this.dwSize.top)
			this.dwSize.top = (da(win).height() - da(this.dwBody).height())/2;
		if(null === this.dwSize.right)
			this.dwSize.right = "auto";
		if(null === this.dwSize.bottom)
			this.dwSize.bottom = "auto";

		//设置初始尺寸和位置
		this.setPos( this.dwSize.top, this.dwSize.right, this.dwSize.bottom, this.dwSize.left );
		this.setSize( this.dwSize.w, this.dwSize.h );
		
		//缓存对象
		daWin.pushCache( this );
		
		//设置为活动状态
		this.setActive();
	},
	
	//绑定事件
	bindEvent: function(){
		var context = this;
	 
		//获取焦点设置为活动窗口
		this.dwPad.onclick=function(evt){
			context.setActive();
		};
		
		//窗口拖拽平移
		drag({
			window: win,
			src: this.dwBodyTop,
			target: this.dwPad,
			before: function(){			//拖动前
				da.daMaskShow( win );																	//显示遮罩
				context.setActive();
				if( !context.isDialog && "none" == context.dwLoadover.style.display)
					context.dwLoadover.style.display = "block";
			}, 
			after: function(){			//拖动后
				if( !context.dwSetting.modal )da.daMaskHide( win );		//隐藏遮罩
				if( !context.isDialog && !context.isLoading)
					context.dwLoadover.style.display = "none";
					
				//重置窗口的记忆位置
				context.dwSize.top = context.dwPad.offsetTop;
				context.dwSize.left = context.dwPad.offsetLeft;
			}
		});
		
		//关闭按钮
		da( this.dwBts.btclose ).bind("click", function(evt){
			context.close();
			evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
		});
		
		if( this.isDialog ) return;				//以下事件绑定是窗口类型特有的,如果是对话框模式，就不用执行了。Oh,yeah!
		
		//最小化按钮
		this.dwBts.btmin.onclick = function(evt){
			this.blur();
			
			context.min();
		};

		//最大化按钮 //双击标题栏
		this.dwBodyTop.ondblclick = this.dwBts.btmax.onclick = function(evt){
			this.blur();
			
			if( "normal" === context.sizeMode )
				context.max();
			else if("min" === context.sizeMode || "max" === context.sizeMode)
				context.normal();

		};
		
		//刷新
		this.dwStatusBts.fresh.onclick = function(evt){
				context.dwIframe.src = context.dwSetting.url;
				if( !context.isDialog )	context.loading();				//如果是对话框模式，就不需用loading动画了
		}
		
	
		//拖拽改变尺寸
		this.dragSize(this.dwBorder.br2);
		this.dragSize(this.dwBorder.br);
		this.dragSize(this.dwBorder.l, true);
		this.dragSize(this.dwBorder.r);
		this.dragSize(this.dwBorder.b);
		
	},
	
	//初始化回调函数
	/*
		dwSetting: 用户参数列表
	*/
	initFnCallBack: function( dwSetting ){
		var contents = this.dwIframe.contentWindow || this.dwIframe.contentWindow;
//		
//		if(fnAfter){			//内页加载前执行
//			fnBefore.call(contents);
//		}
//		
//		if(fnLoaded)			//内页加载后执行
//			da.eventBind(this.dwIframe.contentWindow,{"load":fnLoaded});
//		
		if( dwSetting.after )				//窗口关闭后执行
			//contents.winReturn = function(){ alert(); };
			dwSetting.after.call(contents);
		
	},
	
	normal: function(){
		daWin.popDock( this );					//对象弹出相对应停靠状态缓存
		
		this.dwSize.left = (da(win).width() - this.dwSize.w)/2;									//通过历史窗口尺寸计算，居中显示
		this.dwSize.top = (da(win).height() - this.dwSize.h)/2;
		if(null === this.dwSize.right)
			this.dwSize.right = "auto";
		if(null === this.dwSize.bottom)
			this.dwSize.bottom = "auto";
		
		this.setPos(this.dwSize.top, null, null, this.dwSize.left);							//设置改变位置
		this.setSize(this.dwSize.w, this.dwSize.h);															//设置改变尺寸
		
		this.dwBts.btmax.className = "btmax";
		this.sizeMode = "normal";				//当前为正常尺寸
	},
	
	min: function(){
			daWin.pushDock( this );				//对象压入到停靠状态缓存

			this.dwBts.btmax.className = "btnormal";
			this.sizeMode = "min";				//当前为最小化
	},
	
	max: function(){
		daWin.popDock( this );					//对象弹出相对应停靠状态缓存
		
		var da_Win = da( win ),
				winWidth = parseInt( da_Win.width(), 10 ) || 0,
				winHeight = parseInt( da_Win.height(), 10 ) || 0;
		
		this.setPos( 0, null, null, 0 );						//设置改变位置（开一个小缝隙）
		this.setSize( winWidth, winHeight );				//设置改变尺寸
		
		this.dwBts.btmax.className = "btnormal";
		this.sizeMode = "max";					//当前为最大化
	},
	
	//关闭窗口
	close: function(){
		this.dwParent.removeChild(this.dwPad);						//删除daWin对象
		if( this.dwSetting.modal ) da.daMaskHide( win );

		daWin.popCache( this );												//弹出相应的daWin缓存
		
		var len = win.dwArrCache.length;
		if( 0 < len ){
			win.dwArrCache[ len-1 ].daWin.setActive();
		}
	},
	
	//拖拽改变尺寸
	/*
		objDragSrc:	拖拽事件源对象
		isLeft:	是靠窗口左侧的事件源对象
	*/
	dragSize: function(objDragSrc,isLeft){
		var context = this;
		var daDraging = false;
		var pStart = {x:0, y:0};
		var pEnd = {x:0, y:0};
		var oldPos = {x:0, y:0};
		var oldSize = {w:0, h:0};
		
		//鼠标按下
		var dsMouseDown=function(evt){		
			if(win.captureEvents)				//锁定事件源对象
				win.captureEvents(evt.MOUSEMOVE);
			else if(objDragSrc.setCapture)
				objDragSrc.setCapture();

			da.daMaskShow( win );				//显示遮罩
			context.setActive();
			if( !context.isDialog && "none" == context.dwLoadover.style.display)
				context.dwLoadover.style.display = "block";

			oldSize = {
				w: context.dwPad.offsetWidth,
				h: context.dwPad.offsetHeight,
				top: context.dwPad.offsetTop,
				left: context.dwPad.offsetLeft
			}

			pStart = {
				x: evt.clientX,
				y: evt.clientY
			};
			
			daDraging = true;								//开始拖动
		};
		
		//鼠标按下拖动
		var dsMouseMove = function(evt){
			if(daDraging){									//拖动中…
					pEnd = {
						x: evt.clientX,
						y: evt.clientY
					};
					var moveLong = {
						w: (pEnd.x - pStart.x),
						h: (pEnd.y - pStart.y)
					};
					
					context.dwSize.w = (!isLeft)?(oldSize.w + moveLong.w):(oldSize.w - moveLong.w);
					context.dwSize.h = (oldSize.h + moveLong.h);
					
					var nowPos = {
						top: (!isLeft)?(oldSize.top + moveLong.h):(oldSize.top - moveLong.h),
						left: (!isLeft)?(oldSize.left + moveLong.w):(oldSize.left - moveLong.w)
					};
					
					//改变被拖动对象的位置,加点延时过程更直观
					if(isLeft)
						setTimeout(function(){context.setPos( context.dwSize.top, null, null, pEnd.x ); context.setSize(context.dwSize.w, context.dwSize.h);},13);
					else
						setTimeout(function(){context.setSize(context.dwSize.w, context.dwSize.h);},13);
					
					//防止拖动中选中文字，使拖动不畅
					if( win.getSelection)
							win.getSelection().removeAllRanges();
					else if(doc.getSelection)
							doc.getSelection().removeAllRanges();
					else
							doc.selection.empty();
			}
		};
		
		//鼠标弹起
		var dsMouseUp = function(evt){
			if(daDraging){									//拖动中…	
				if(win.releaseEvents)		//释放 事件源对象锁定状态
					win.releaseEvents(evt.MOUSEMOVE);
				else if(objDragSrc.releaseCapture)
					objDragSrc.releaseCapture();
				
				if( !context.dwSetting.modal )da.daMaskHide( win );				//隐藏遮罩
				if( !context.isDialog && !context.isLoading)
					context.dwLoadover.style.display = "none";

				daDraging = false;								//结束拖动
			}

		};
		
		//绑定事件
		da(objDragSrc).bind( "mousedown", dsMouseDown );
		da(doc).bind( "mousemove", dsMouseMove ).bind( "mouseup", dsMouseUp );
		
	},
	
	//设置为活动窗口
	setActive: function(){
		var arrCache = win.dwArrCache;
		//改变当前daWin为最高层	
		daWin.popCache(this);												//非get模式，删除相应的缓存对象
		daWin.pushCache(this);											//重新把当前daWin对象，压入缓存数值最后(对应的id索引号也就是zIndex最大)
		//重置所有daWin高度
		for(var idx=0,len=arrCache.length-1; idx<len; idx++){
				arrCache[idx].daWin.dwPad.style.zIndex = this.dwDefzIndex+ idx;	//z 坐标设置为默认高度+ daWin缓冲索引号idx
				arrCache[idx].daWin.dwBody.className = "dwBody2";								//设置为非活动状态
				arrCache[idx].daWin.isActiving = false;
				if("none" == arrCache[idx].daWin.dwLoadover.style.display)			//显示daWin内部遮罩
					arrCache[idx].daWin.dwLoadover.style.display = "block";
					
		}
		this.dwPad.style.zIndex = this.dwActzIndex;			//z 坐标设置为默认高度
		this.dwBody.className = "dwBody";								//设置为活动状态
		this.isActiving = true;
		if( this.dwSetting.modal ) da.daMaskShow( win );			//如果是模式窗口，就给一个遮罩啊~
		if( this.isDialog || !this.isLoading )								//去掉daWin内部遮罩
			this.dwLoadover.style.display = "none";
		
		if( 0 < this.dwDlgBts.length )
			this.dwDlgBts[0].focus();
	},

	//带停靠的窗口尺寸位置转换
	parseSize: function(sSize){
		if("number" == typeof sSize){
			return sSize;
		}
		else if("string" == typeof sSize){
			sSize = sSize.replace("px","")
			var cSign = sSize.match(/[\^＾＜<vV>＞]/g);
			if(null == cSign) return da.isNull( parseInt(sSize), 0 );
			
			for(var i=0,len=cSign.length; i<len; i++){
				switch(cSign[i]){
					case "＾":
					case "^":
						this.dwSize.top = 0;
						break;
					case "V":
					case "v":
						this.dwSize.top = "auto";
						this.dwSize.bottom = 0;
						break;
					case "＞":
					case ">":
						this.dwSize.left = "auto";
						this.dwSize.right = 0;
						break;
					case "＜":
					case "<":
						this.dwSize.left = 0;
						break;
				}
			}
			sSize = sSize.replace(/[\^＾＜<vV>＞]/g,"");
			return da.isNull( parseInt(sSize), 0 );
		}
	},
	
	
	//设置尺寸
	/*
		nWidth: 窗口宽
		nHeight: 窗口高
	*/
	setSize:　function(nWidth,nHeight){
		var cs = this.dwCssSize;

		//边框尺寸
		var TandB_h = (cs.t_h+ cs.b_h),									//上下边框高度
				LandR_w = (cs.l_w+ cs.r_w),									//左右边框高度
				Tborder2_w = (cs.l2_w+ cs.r2_w),						//标题栏左右样式预留宽度
				Tborder_w = Tborder2_w+ (cs.l_w+ cs.r_w),		//标题栏左右边框宽度
		
		//计算出对象尺寸
				captionWidth = (nWidth - Tborder_w - cs.bts_w),								//标题栏文本宽度
				topWidth = (nWidth - Tborder_w),															//标题栏去左右边框宽度
				iframeWidth = nWidth - LandR_w,																//减去窗口的边框宽度
				iframeHeight = nHeight - TandB_h,
		
		//最小值
				minTop = (cs.cap_w+cs.bts_w);												//cap_w+bts_w (标题栏文本宽度+ 标题栏按钮宽度)
				minFrame = (cs.cap_w+cs.bts_w+cs.l2_w+cs.r2_w);			//minTop+l2_w+r2_w (标题栏宽度+ 标题栏样式预留宽度)
				minWidth = (minFrame + LandR_w);										//内框架宽度+ 窗口的边框宽度
		
		//边界检查
				captionWidth = (cs.cap_w<captionWidth) ? captionWidth : cs.cap_w,								//cap_w (预留标题长度)
				topWidth = (minTop<topWidth) ? topWidth : minTop,
				iframeWidth = (minFrame<iframeWidth) ? iframeWidth : minFrame,
				iframeHeight = 0<iframeHeight?iframeHeight:0,
				dialogWidth = iframeWidth - cs.dialog_padding,
				dialogHeight = iframeHeight - cs.dialog_padding;
		
		nWidth = (minWidth<nWidth) ? nWidth : minWidth;
		nHeight = (TandB_h<nHeight) ? nHeight :TandB_h;
		
		
		this.dwCaption.style.width = captionWidth + "px";
		this.dwStatus.style.width = captionWidth + "px";
		this.dwBodyTop.style.width = topWidth + "px";			
		
		this.dwIframe.style.width = iframeWidth+ "px";				//减去窗口的边框宽度
		this.dwIframe.style.height = iframeHeight+ "px";
		this.dwDialog.style.width = dialogWidth+ "px";
		this.dwDialog.style.height = dialogHeight+ "px";
		this.dwLoadover.style.width = iframeWidth+ "px";
		this.dwLoadover.style.height = iframeHeight+ "px";
		
		this.dwBody.style.width = nWidth+ "px";
		this.dwBody.style.height = nHeight+ "px";
		
		this.dwPad.style.width = nWidth+ "px";
		this.dwPad.style.height = nHeight+ "px";
		
	},
	
	//设置位置
	/*
		nTop: 上
		nLeft: 左
		nRight: 右
		nBottom: 下
	*/
	setPos:　function(nTop, nRight, nBottom, nLeft){
		this.dwPad.style.top = (null == da.isNull(nTop,null)) ? "auto": (("auto"==nTop)?nTop:(nTop+ "px"));
		this.dwPad.style.left = (null == da.isNull(nLeft,null)) ? "auto": (("auto"==nLeft)?nLeft:(nLeft+ "px"));
		this.dwPad.style.right = (null == da.isNull(nRight,null)) ? "auto": (("auto"==nRight)?nRight:(nRight+ "px"));
		this.dwPad.style.bottom = (null == da.isNull(nBottom,null)) ? "auto": (("auto"==nBottom)?nBottom:(nBottom+ "px"));
		//return;
	},

	//设置标题栏
	/*
		dwSetting: 用户自定义参数
	*/
	setTitle:　function( dwSetting ){
		if( null === this.dwIframe ) return;

		var nWidth = this.dwSize.w - ( this.dwCssSize.l_w + this.dwCssSize.r_w + this.dwCssSize.l2_w + this.dwCssSize.r2_w );				//减去标题栏左右样式预留宽度
		nWidth =  0 > nWidth ? 0 : nWidth;																								//纠正数据
		this.dwBodyTop.style.width = nWidth + "px";	

		this.dwCaption.innerHTML = ( this.isDialog ? '<div class="'+ this.dwSetting.type +'"></div>' 
					: '' ) 
					+ ( da.isFunction( dwSetting.title ) ? dwSetting.title.call( this, this.dwCaption, this.dwBodyTop ) 
					: dwSetting.title );	//更改标题（注意这里可以是HTML,也可以是Funtion）
					
	},
	
	//设置内框架及url地址
	/*
		dwSetting: 用户自定义参数
	*/
	setCnt: function( dwSetting ){
		if( null === this.dwDialog || null === this.dwIframe ) return;
		
		var nWidth = this.dwSize.w - ( this.dwCssSize.l_w + this.dwCssSize.r_w ),		//减去窗口的边框宽度
				nHeight = this.dwSize.h - this.dwCssSize.win_h,
				dwIframe = this.dwIframe,
				dwDialog = this.dwDialog,
				dwDlgBts = this.dwDlgBts,
				context = this;

		nWidth =  0 > nWidth ? 0 : nWidth;								//纠正数据
		nHeight =  0 > nHeight ? 0 : nHeight;
		if( this.isDialog ){
				dwIframe.style.display = "none";
//				dwDialog.style.width = nWidth + "px";
//				dwDialog.style.height = nHeight + "px";
				
				dwDialog.innerHTML = dwSetting.html;
//				if( 0 === this.dwSize.w || 0 === this.dwSize.h ){					//在对话框模式，未传入width，height的时候，纠正位置，居中显示
//						this.dwSize.w = da( this.dwPad ).width();
//						this.dwSize.h = da( this.dwPad ).height();
//						
//						this.setPos(( da(win).height() - this.dwSize.h )/2, "auto", "auto", ( da(win).width() - this.dwSize.w )/2)
//				}
				
				var btBar = doc.createElement("div"),
						button = this.dwSetting.button,
						btObj;
						
				btBar.className = "daWinBtBar";
				dwDialog.insertBefore(btBar);
				
				if( null !== button ){
						for( var caption in button ){
							btObj = doc.createElement("a"),
							btObj.className = "daWinBt";
							btObj.href = "javascript:void(0)";
							btObj.innerHTML = [
								'<div class="l"></div>',
								'<div class="txt">', caption, '</div>',
								'<div class="r"></div>'
							].join("");
							
							(function(caption){
									da( btObj ).bind( "click", function( evt ){
										if( da.isFunction( button[caption] ) )
											button[caption].call( this, context, evt );
											
										evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
									});
							})(caption);
							
							btBar.insertBefore( btObj );
							dwDlgBts.push( btObj );
						}
				}
				else{
						btObj = doc.createElement("a");
						btObj.className = "daWinBt";
						btObj.href = "javascript:void(0)";
						btObj.innerHTML = [
							'<div class="l"></div>',
							'<div class="txt">确&nbsp;定 (Y)</div>',
							'<div class="r"></div>'
						].join("");
						
						da( btObj ).bind( "click", function( evt ){
								if( da.isFunction( dwSetting.yes ) )
									dwSetting.yes.call( this, context, evt );
								
								context.close();
								evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
						} );
						btBar.insertBefore(btObj);
						dwDlgBts.push( btObj );
				
						if( "confirm" === this.dwSetting.type ){
								btObj = doc.createElement("a");
								btObj.className = "daWinBt";
								btObj.href = "javascript:void(0)";
								btObj.innerHTML = [
									'<div class="l"></div>',
									'<div class="txt">取&nbsp;消 (N)</div>',
									'<div class="r"></div>'
								].join("")
								
								da( btObj ).bind( "click", function( evt ){
										if( da.isFunction( dwSetting.no ) )
											dwSetting.no.call( this, context, evt );
										
										context.close();
										evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
								} );
								
								btBar.insertBefore(btObj);
								dwDlgBts.push( btObj );
						}
				}
				
				
				
				var cs = this.dwCssSize,
						TandB_h = (cs.t_h+ cs.b_h),				//上下边框高度
						LandR_w = (cs.l_w+ cs.r_w);				//左右边框高度
				
				this.dwSize.w = ( 0 === this.dwSize.w ) ? da( dwDialog ).width() + LandR_w : this.dwSize.w; 
				this.dwSize.h = ( 0 === this.dwSize.h ) ? da( dwDialog ).height() + TandB_h : this.dwSize.h;

		}
		else{
				dwDialog.style.display = "none";

				dwIframe.style.width = nWidth + "px";
				dwIframe.style.height = nHeight + "px";
				
				dwIframe.src = dwSetting.url;
		//		readyState:
		//		uninitialized		对象未使用数据初始化
		//		loading   			对象正在下载数据
		//		loaded   				对象已完成下载它的数据
		//		interactive 		即使对象没有完全下载数据，用户也可以与其交互
		//		complete    		对象被完全初始化
				if( "complete" == dwIframe.readyState ) context.loading(true);
				
				dwIframe.onreadystatechange = function(){
					if("complete" == this.readyState || "interactive" == this.readyState){
						context.loading(true);																											//终止loading动画
						
						if( "unknown" != typeof this.contentWindow.document){												//判断是否跨域访问
								this.contentWindow.back = function(){ 																	//给内页嵌入back数据回调函数
									if( context.dwSetting.backclose ) context.close();
									if( context.dwSetting.back )
										context.dwSetting.back.apply(this.contentWindow, arguments);				//如果需要回调处理，就触发回调

								};
						}
						
						if("complete" == this.readyState && dwSetting.load )												//内页加载完毕如果需要，回调用户自定义处理函数
							dwSetting.load.call(context);
					}
				};
				
				dwIframe.onload = function(){
					context.loading(true);																												//终止loading动画
					
					if( "unknown" != typeof this.contentWindow.document){													//判断是否跨域访问并且需要回调处理
							this.contentWindow.back = function(){																			//给内页嵌入back数据回调函数
								if( context.dwSetting.backclose ) context.close();
								if( context.dwSetting.back )
									context.dwSetting.back.apply(this.contentWindow, arguments);					//如果需要回调处理，就触发回调
							};
					}
					
				};
		
				this.dwLoadover.style.display = "block";
				this.dwLoadover.style.width = nWidth + "px";			//loading遮罩
				this.dwLoadover.style.height = nHeight + "px";
		}
		
		if( dwSetting.modal ) da.daMaskShow( win );						//如果是模式窗口，就给一个遮罩啊~


	},	
	
	//设置状态栏信息
	setStatus: function( sHTML ){
		this.dwStatus.innerHTML = ( this.dwSetting.status || sHTML );
	},
	
	//loading动画状态
	/*
		bHide: 'true'为加载完毕隐藏loading动画
	*/
	loading: function( bHide ){
		if( bHide ){
			this.dwLoading.finished();											//结束loading动画
			this.isLoading = false;
			this.setStatus("加载完毕！");
			
			if(this.isActiving)															//如果是当前活动窗口并已经加载完毕，就撤销遮罩层
				this.dwLoadover.style.display = "none";
			return;
		}
		else{
			var context = this;
			//开始loading动画
			this.dwLoading = daLoading({
				window: win,
				parent: this.dwIframe.parentNode,
				click: function(){		//点击Loading关闭，并隐藏遮罩层
					context.loading(true);
				}
			});
			this.isLoading = true;
			this.setStatus("数据加载中…");
		}
	}
};

daWin.fnStruct.init.prototype = daWin.fnStruct;				//继承成员属性、函数







/*********daWin静态函数***********/
//获取最外层框架页面的窗体对象
daWin.getRootWin = function( sPage ){
	var curWin = win;
	var parentWin = curWin.parent;
	while( curWin != parentWin ){
			if( sPage == curWin.location.href ) break;					

	    curWin = parentWin;
	    parentWin = parentWin.parent;
	}
	
	return curWin;
};
	
//把当前daWin窗口对象压入缓存
/*
	dwObj: daWin窗口对象
*/
daWin.pushCache = function( dwObj ){
	var newCache = {
				id: dwObj.dwId,
				daWin: dwObj
			};
	win.dwArrCache.push( newCache );		//把相应的对象信息，压入缓存

	return newCache;					//返回最新的缓存信息
};

//把当前daWin窗口对象弹出缓存
/*
	dwObj: daWin窗口对象
*/
daWin.popCache = function( dwObj, isGet ){
	var arrCache = win.dwArrCache;
	var id = dwObj.dwId;
	var res = null;
	
	for(var idx in arrCache){
		if(id === arrCache[idx].id){
			res = arrCache[idx];
			if(isGet) return res;									//如果是get
			
			arrCache.splice(idx,1);			//删除相应索引的缓存
			return res;
		}
	}
	return null;
};

//压入相应daWin对象最小化停靠状态缓存
/*
	dwObj: daWin窗口对象
*/
daWin.pushDock = function(dwObj){
	var arrDock = win.dwDockCache;
	for(var idx in arrDock){
		if(dwObj.dwId === arrDock[idx].id) return;
	}
	
	var newCache = {
				id: dwObj.dwId,
				daWin: dwObj
			};
	daWin.setDock(dwObj, arrDock.length);			//设置为停靠状态(第一个索引值为0，如果先压入arrDock.length就成1了)
	arrDock.push(newCache);										//把相应的对象信息，压入缓存
	
	return newCache;					//返回最新的缓存信息
};
			
//弹出相应daWin对象最小化停靠状态缓存
/*
	dwObj: daWin窗口对象
*/
daWin.popDock = function(dwObj){
	var arrDock = win.dwDockCache;
	var id = dwObj.dwId;
	var res = null;
	
	//从缓存中找到相应的daWin对象，弹出对象，并记录索引位置 
	for(var idx in arrDock){
		if(id === arrDock[idx].id){
			res = arrDock[idx];
			id = idx;										//记录弹出对象的索引位置 
			arrDock.splice(idx,1);			//删除相应索引的缓存
			break;
		}
	}
	
	//重置弹出对象位置以后的停靠窗口的位置(前移)
	for(var idx=id,len=arrDock.length; idx<len; idx++)
		daWin.setDock(arrDock[idx].daWin, idx);			//重置停靠位置
	
	return res;
};

//设置daWin对象为最小化停靠状态
/*
	dwObj: daWin窗口对象
	nPos:	宽度位，daWin最下化时宽度的倍数
*/
daWin.setDock = function(dwObj, nPos){
	nPos = nPos || 0;
	dwObj.setPos("", "", 0, (nPos* dwObj.dwCssSize.win_w) );			//设置改变位置
	dwObj.setSize(0, dwObj.dwCssSize.win_h );											//设置改变尺寸

//	dwObj.dwTBody.style.display = "none";
//	dwObj.dwTFoot.style.display = "none";
};





//全局属性
win.daWin = win.dw = daWin;











//********** da库 扩展页面遮罩层功能 *************/
da.extend({
	//初始化遮罩层对象		//body的onLoad事件会重载
	/*
		zIndex: 显示覆盖的z坐标
	*/
	daMaskInit: function( maskWin, zIndex ){
		maskWin = maskWin || win;
		var maskDoc = maskWin.document,
				objMask = maskDoc.createElement("div");
				
		objMask.id = 'daMask';
		objMask.style.cssText = 'position:absolute; top:0px; left:0px; display:none; background:#000; filter: Alpha(opacity=50);/* IE */ -moz-opacity:0.5;/* FF 主要是为了兼容老版本的FF */ opacity:0.5;/* FF */';
		
		objMask.style.zIndex = zIndex || 19998;									//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
		objMask.style.width = Math.max(maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth)+ "px";
		objMask.style.height = Math.max(maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight)+ "px";

		maskDoc.body.appendChild(objMask);
		
		//body大小改变时，调用遮罩层更新尺寸函数
		da( maskWin ).bind( "resize", function(){
			da.daMaskFresh( maskWin );
		});
		
		return objMask;
	},
	
	//是否已经初始化
	daGetMask: function( maskWin ){
		maskWin = maskWin || win;
		var objMask = maskWin.document.getElementById("daMask");
		if(null==objMask) return false;
		else return objMask;
	},
	
	//更新遮罩层对象大小尺寸   //body的onResize事件会重载
	daMaskFresh: function( maskWin ){
		maskWin = maskWin || win;
		var maskDoc = maskWin.document,
				objMask = this.daGetMask( maskWin );
		
		if(null==objMask) objMask = this.daMaskInit( maskWin );
		
		objMask.style.width = Math.max(maskDoc.body.scrollWidth, maskDoc.documentElement.scrollWidth); 
		objMask.style.height = Math.max(maskDoc.body.scrollHeight, maskDoc.documentElement.scrollHeight); 
	},
	
	//显示遮罩层
	/*
		zIndex: 显示覆盖的z坐标
	*/
	daMaskShow: function( maskWin, zIndex ){
		var objMask = this.daGetMask( maskWin );
		if(null==objMask) objMask = this.daMaskInit( maskWin );
		
		objMask.style.zIndex = zIndex || 19998;									//这里的显示层级应该是小于daWin活动窗口，大于daWin非活动窗口
		objMask.style.display = "block";
			
	},
	
	//隐藏遮罩层
	daMaskHide: function( maskWin ){
		var objMask = this.daGetMask( maskWin );
		if(null==objMask) objMask = this.daMaskInit( maskWin );

		objMask.style.display = "none";
	}
});

//页面加载完毕
da(function(){
		da.daMaskInit();
});

//********** da库 扩展页面遮罩层功能 *************/
})(window);




/*************************************** daDrag类（拖动效果） ************************************/
/*
	author:	danny.xu
	date:	2010-11-10
	description:	daLoading类脚本文件
*/
(function(win){
	var doc = win.document;

	//daDrag类构造函数
	/*
		ddSetting: 用户自定义拖动对象初始化参数列表
	*/
	var daDrag = function( ddSetting ){
		return new daDrag.fnStruct.init( ddSetting );
	};

	daDrag.fnStruct = daDrag.prototype = {
		version: "daDrag 1.0  \n\nauthor: danny.xu\n\ndate: 2010-11-10\n\nThank you!!!",
		
		daDragSrc: null,				//拖动事件对象（一般为标题栏）
		daDragTarget: null,			//被拖动对象（一般为整个窗口容器对象）
		cursor: "move",					//拖动时指针样式
		
		ddSetting: {
			window: null,					//所属窗体对象
			src: null,						//可拖动对象 或id
			target: null,					//被拖动对象 或id
			before: null,					//拖动前回调事件
			move: null,						//拖动中回调事件
			after: null						//拖动完成后回调事件
		},
		
		daDraging:	false,			//拖动中…状态
		tagOldPos:	{x:0, y:0},	//被拖动对象 开始拖动时起点
		mouseStart: {x:0, y:0},	//鼠标起点
		mouseEnd: {x:0, y:0},		//鼠标终点
		
		//初始化函数
		/*
			ddSetting: 用户自定义拖动对象初始化参数列表
		*/
		init: function( ddSetting ){
			ddSetting = this.ddSetting = da.extend( true, {}, this.ddSetting, ddSetting );
			win = ddSetting.window;
			doc = win.document;
			
			var objSrc = ddSetting.src,
					objTarget = ddSetting.target;
			
			if("string" == typeof objSrc){
				objSrc = doc.getElementById(objSrc);
				if(null == objSrc){alert("daTab提示:找不到可拖动对象。");return false;}
			}
			this.daDragSrc = objSrc;				//保存可拖动对象
			
			if("string" == typeof objTarget){
				objTarget = doc.getElementById(objTarget);
				if(null == objTarget){/*alert("daTab提示:找不到被拖动对象。");*/return false;}
			}
			this.daDragTarget = objTarget || this.daDragSrc;	//保存被拖动对象，如果没有就拖动自己
			
			this.eventBind();
			
			return this;
		},
		
		//绑定事件函数
		eventBind: function(fnBeforeDrag,fnDraging,fnAfterDrag){
			var fnBeforeDrag = this.ddSetting.before,
					fnDraging = this.ddSetting.move,
					fnAfterDrag = this.ddSetting.after,
					context = this;
			
			//鼠标移上
			var daDragMouseOver=function(evt){context.daDragSrc.style.cursor = context.cursor ;}
			
			//鼠标按下
			var daDragMouseDown=function(evt){		
				if(win.captureEvents)				//锁定事件源对象
					win.captureEvents(evt.MOUSEMOVE);
				else if(context.daDragSrc.setCapture)
					context.daDragSrc.setCapture();
				
				context.tagOldPos = {				//获取被拖动对象 开始拖动时起点
					x: parseInt(context.daDragTarget.offsetLeft),
					y: parseInt(context.daDragTarget.offsetTop)
				};
				context.daDragPStart={			//获取开始拖动 鼠标起点
					x: parseInt(evt.clientX),
					y: parseInt(evt.clientY)
				};
				context.daDraging = true;								//开始拖动
				
				//执行拖动前回调事件
				if(fnBeforeDrag) fnBeforeDrag.call( context, evt, context.daDragSrc, context.daDragTarget);
			};
			
			//鼠标按下拖动
			var daDragMouseMove = function(evt){
				if(context.daDraging){									//拖动中…
						context.daDragPEnd={		//获取开始拖动 鼠标终点
							x: evt.clientX,
							y: evt.clientY
						};
						var xmove = context.daDragPEnd.x - context.daDragPStart.x;		//平移坐标差值
						var ymove = context.daDragPEnd.y - context.daDragPStart.y;
				
						var nowPos={																						//被拖动对象当前位置
							x: context.tagOldPos.x + xmove,
							y: context.tagOldPos.y + ymove
						};
						
						//改变被拖动对象的位置
						context.daDragTarget.style.left = nowPos.x + "px";
						context.daDragTarget.style.top = nowPos.y + "px";

						//防止拖动中选中文字，使拖动不畅
						if( win.getSelection)
								win.getSelection().removeAllRanges();
						else if(doc.getSelection)
								doc.getSelection().removeAllRanges();
						else
								doc.selection.empty();
						
						
						//拖动中回调事件
						if(fnDraging) fnDraging.call( context, evt, context.daDragSrc, context.daDragTarget);
				}
			};
			
			//鼠标弹起
			var daDragMouseUp = function(evt){
				if(context.daDraging){									//拖动中…	
					if(win.releaseEvents)				//释放 事件源对象锁定状态
						win.releaseEvents(evt.MOUSEMOVE);
					else if(context.daDragSrc.releaseCapture)
						context.daDragSrc.releaseCapture();
					
				 	//context.daDragSrc.style.cursor = "default" ;
					context.daDraging = false;								//结束拖动
					
					//拖动完成后回调事件
					if(fnAfterDrag) fnAfterDrag.call( context, evt, context.daDragSrc, context.daDragTarget);
				}

			};
			
			//绑定事件
			da.eventBind(this.daDragSrc, {"mouseover": daDragMouseOver});
			da.eventBind(this.daDragSrc, {"mousedown": daDragMouseDown});
			da.eventBind(doc, {"mousemove": daDragMouseMove});
			da.eventBind(doc, {"mouseup": daDragMouseUp});
			
//			da( this.daDragSrc ).bind( "mouseover", daDragMouseOver ).bind( "mousedown", daDragMouseDown );
//			da( doc ).bind( "mousemove", daDragMouseMove ).bind( "mouseup", daDragMouseUp );
			
		}
		
	};
	
	//继承
	daDrag.fnStruct.init.prototype = daDrag.prototype;
	
	//全局属性
	win.daDrag = win.drag = daDrag;
	
})(window);





/*************************************** daLoading类 ************************************/

/*
	author:	danny.xu
	date:	2010-10-29
	description:	daLoading类脚本文件
*/
(function(win){
var doc=win.document;	

/**daLoading构造函数
* @param {PlainObject} dlSetting 用户参数列表
*/
var daLoading = function( dlSetting ){
	return new daLoading.fnStruct.init( dlSetting );
};

//类属性
daLoading.fnStruct = daLoading.prototype = {
	version: "daLoading 1.0  \n\nauthor: danny.xu\n\ndate: 2010-10-29\n\nThank you!!!",
	dlId: 0,
	dlParent: null,
	dlBody: null,
	dlFlow: null,
	dlPercent: null,
	
	dlSetting: {
		window: win,
		parent: null,
		click: null
	},
	
	/**初始化函数
	* @param {PlainObject} dlSetting 用户参数列表
	*/
	init: function( dlSetting ){
		dlSetting = this.dlSetting = da.extend( true, {}, this.dlSetting, dlSetting );
		win = dlSetting.window;
		doc = win.document;
		
		var objParent = dlSetting.parent;
		if("string" == typeof objParent) objParent = doc.getElementById(objParent);
		this.dlParent = objParent || doc.body;
		
		//生成新id
		//while(null!=doc.getElementById("daLoading_"+this.dlId)) this.dlId++;
		this.dlId = da.nowId();
		this.create();
		this.bindEvent();											//事件绑定
		this.runto99();
		return this;
	},
	
	//创建HTML对象
	create: function(){
		var dlId = this.dlId;
		var dlBody = doc.createElement("div");
		dlBody.id = "daLoading_"+ dlId;
		dlBody.className = "dl_body";
		dlBody.title = "温馨提示：点击隐藏";
		
		dlBody.innerHTML = 
		[
      '<div class="dl_text">已加载&nbsp;<span id="dl_percent_'+dlId+'"></span>%</div>',
      '<div id="dl_barbox_'+dlId+'"  class="dl_barbox">',
         '<div id="dl_barbg_'+dlId+'" class="dl_barbg"></div>',
         '<div id="dl_barflow_'+dlId+'" class="dl_barflow"></div>',
      '</div>'
		].join("");
		
		this.dlBody = dlBody;
		this.dlParent.appendChild(dlBody);
		//this.dlBody.style.left = (this.dlParent.offsetWidth - this.dlBody.offsetWidth)/2 + "px";
		//this.dlBody.style.top = (this.dlParent.offsetHeight - this.dlBody.offsetHeight)/2+ "px";
		
		this.dlFlow = doc.getElementById("dl_barflow_"+dlId);
		this.dlPercent = doc.getElementById("dl_percent_"+dlId);
		
	},
	
	//事件绑定
	/*
		fnClick: 点击后回调事件
	*/
	bindEvent: function(){
		var dlSetting = this.dlSetting,
				context = this;
		
		da.eventBind(this.dlBody, {"click": function(evt){
			context.dlBody.style.display = "none";
			
			//点击后回调自定义事件
			if(dlSetting.click) dlSetting.click();
			
		}});
		
	},
	
	runto99: function(){
		if(null==this.dlBody) return;

		this.dlnum = this.dlFlow.offsetLeft;
		
		if(this.dlnum<99){
			this.dlFlow.style.left = (++this.dlnum) +"px";
			this.dlPercent.innerHTML = this.dlnum;
			var context = this;
			setTimeout(function(){
				context.runto99();
			},13);
		}
	},

	finished: function(){
			var context = this;
			this.dlFlow.style.left = "100px";
			this.dlPercent.innerHTML = 100;
			setTimeout(function(){
				context.dlBody.style.display = "none";
			},13);
	}
};

//对象继承类属性
daLoading.fnStruct.init.prototype = daLoading.prototype;

/********** 功能函数 ***********/



//全局属性
win.daLoading = win.dl = daLoading;

})(window);