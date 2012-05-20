/*
	author:	danny.xu
	date:	2010-10-27
	description: daWin,daDialog 1.2 类脚本文件
*/
(function(win){
var doc = win.document;

win.dwArrCache = [];				//daWin多窗口全局缓存  {id: daWin窗口的id; 	daWin: daWin窗口对象}
win.dwDockCache = [];				//daWin多窗口停靠缓存  {id: daWin窗口的id; 	daWin: daWin窗口对象}
self.dwOpenList = [];				//当前窗口打开了的窗体列表（ 用于rootwin类型的跨窗体对象 ）

var daWin = (function(){
	//daWin构造函数
	/*
		setting: 用户参数列表
	*/
	var daWin=function( setting ){
		return new daWin.fnStruct.init( setting );
	};
	
	daWin.fnStruct = daWin.prototype = {
		/********** 静态成员 (可以通过daWin.fnStruct.XXX调用)**************/
		version: "daWin 1.2  \n\nauthor: danny.xu\n\ndate: 2010-10-30\n\nThank you!!!",
		
		dwParent: null,						//daWin容器父对象
		dwId: 0,									//daWin dom对象id序号
		dwPad: null,							//daWin容器dom对象
		dwBody: null,							//daWin主题table dom对象
		dwTHead: null,
		dwTBody: null,
		dwTFoot: null,
		
		dwCaption: null,					//标题显示内容dom对象
		dwCnt: null,							//主内容区dom对象
		dwCntBox: null,						//主内容盒子dom对象
		dwIframe: null,						//内框架dom对象
		dwDialog: null,						//dialog 模式HTML容器dom对象
		dwDlgBts: null,						//dialog 模式操作按钮dom对象集合
		
		daFrameObj: null,					//daFrame类对象
		insideWinObj: null,				//内页window对象
		
		dwStatus: null,						//状态栏dom对象
		dwLoadover: null,					//loading遮罩dom对象
		
		dwBts: null,							//标题栏按钮对象集
		dwStatusBts: null,				//状态蓝按钮对象集
		dwBorder: null,						//daWin边框对象集
		
		dwSize: null,							//窗口当前尺寸 和位置
		
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
			dialog_padding: 20				//dialog容器padding样式左右 各10像素
		},
		
		setting: {
			width: 0,										//窗口宽
			height: 0,										//窗口高
			url: "",										//url地址
			title: "温馨提示",								//caption标题
			html: "",										//如果是对话框模式，要显示的内容
			status: null,									//状态栏信息
			backclose: true,								//当窗体内页操作完毕返回时是否关闭窗体，默认是true
			rootwin: true,									//创建的窗体是否都属于顶级框架页面中
			modal: false,									//是否以模式对话框的方式显示，可选[true|false]
			
			place: null, 									//窗体打开的位置
			act: true,										//是否融入动画特效
			time: 200,										//动画特效默认时长
			easing: "easeOutQuad",							//动画特效类型
			
			css: {
				daDivPad: "daWin"
			},
			type: "info",
			imageSetting: {									//图片展示框功能按钮配置信息，只有当type == "image" 时有效
				play: true,
				prev: true,
				next: true,
				list: false,
				org: false,
				index: 0
			},
			
			before: null,									//窗口内页加载前执行
			load: null,										//窗口内页加载完毕执行
			after: null,									//关闭窗口后执行
			back: null,										//窗体内页操作完毕返回数据执行
			
			yes: null,										//对话框模式时返回"yes"回调处理函数
			no: null,										//对话框模式时返回"no"回调处理函数
			button: null									//对话框模式时,自定义按钮集合，如：{ "全选": function(){...}, "清空": function(){...}}
		},
		
		
		sizeMode: "normal",					//当前窗口尺寸状态  normal:正常窗口，max:最大，min:最小
		isLoading: true,						//数据加载中
		isActiving: true,						//是否为当前活动窗口
		isDialog: true,							//是否是对话框模式
			
		dwDefzIndex:10000,					//窗口显示层级
		dwActzIndex:19999,
		
		
		//初始化函数
		/*
			setting: 用户参数列表
		*/
		init: function( setting ){
			setting = this.setting = da.extend( true, {}, this.setting, setting );
			
			if( !this.activeElem ){
				this.activeElem = document.activeElement;
			}
			
//			var tmpObj = document.getElementsByTagName("input") || document.getElementsByTagName("textarea");				//修正IE的bug，IE中删除了页面上的焦点元素后，在无焦点元素的情况下，无法再对input等编辑控件进行操作。
//			if( tmpObj && 0 < tmpObj.length ) {
//				for( var i=0,len=tmpObj.length; i<len; i++){
//					if( "hidden" !== tmpObj[i].type 
//						&& "checkbox" !== tmpObj[i].type 
//						&& "button" !== tmpObj[i].type 
//						&& "radio" !== tmpObj[i].type 
//						&& !tmpObj[i].disabled 
//						&& "disabled" !== tmpObj[i].disabled
//						) {
//							this.focusElement = tmpObj[i]; break;
//					}
//				}
//			}
//			tmpObj = null;
			
			if( setting.rootwin ){				//修正daWin所属环境
					win = da.getRootWin();
			    doc = win.document;
	
					win.dwArrCache = win.dwArrCache || [];
					win.dwDockCache = win.dwDockCache || [];
			}
			this.dwParent = doc.body;
	    
			this.dwSize = { w:0, h:0, top: null, left: null, right:null, bottom:null };
			this.dwSize.w = this.parseSize( setting.width );
			this.dwSize.h = this.parseSize( setting.height );
	
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
			
			this.isDialog = ( "" === setting.url ) ? true : false;		//如果没有内页url地址，说明就是对话框模式
			if( !setting.modal )	setting.modal = this.isDialog;
			
			setting.act = "undefined" != typeof daFx && setting.act;
//			setting.place = setting.place || { top: window.daMouseY || 0, left: window.daMouseX || 0 };
			setting.place = setting.place || { left: (da(win).width()-this.dwCssSize.win_w)/2, top: (da(win).height()-this.dwCssSize.win_h)/2 };

			this.dwDlgBts = [];											//对话框功能按钮dom对象集合
			
			this.create( setting );								//创建daWin的HTML对象集
			
			return this;
		},
		
		
		//创建HTML对象
		/*
			setting
		*/
		create: function( setting ){
			var dwId = this.dwId,
					objPad = doc.createElement("div");
			objPad.className = setting.css.daDivPad;
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
		        '<td id="dw_cnt_', dwId, '" class="mid" colspan="3">',
		           '<div id="dw_cntbox_', dwId, '" style="position:relative;overflow:hidden;">',
		                '<iframe id="dw_iframe_',  dwId, '" frameborder="0" class="dwIframe"></iframe>',
		                '<div id="dw_dialog_',  dwId, '" class="dwDialog"></div>',
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
//		              '<div class="dwStatuslight"></div>',
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
	
			this.dwParent.insertBefore(objPad);
			this.dwPad = objPad;
			
//			this.dwPad.style.border = "5px solid #050";
			if( da.fnStruct.bgiframe ) 
				da( this.dwPad ).bgiframe();
			
			objPad = null;
			
			//获取对象集
			this.dwBody = doc.getElementById("dw_body_"+ dwId);
			this.dwTHead = doc.getElementById("dw_thead_"+ dwId);
			this.dwTBody = doc.getElementById("dw_tbody_"+ dwId);
			this.dwTFoot = doc.getElementById("dw_tfoot_"+ dwId);
			
			this.dwCaption = doc.getElementById("dw_caption_"+ dwId);
			
			this.dwCnt = doc.getElementById("dw_cnt_"+ dwId);
			this.dwCntBox = doc.getElementById("dw_cntbox_"+ dwId);
			this.dwIframe = doc.getElementById("dw_iframe_"+ dwId);
			this.dwDialog = doc.getElementById("dw_dialog_"+ dwId);
			this.dwLoadover = doc.getElementById("dw_loadover_"+ dwId);
			this.dwStatus = doc.getElementById("dw_status_"+ dwId);
			
			this.dwBts.btmin = doc.getElementById("dw_btmin_"+ dwId);
			this.dwBts.btmax = doc.getElementById("dw_btmax_"+ dwId);
			this.dwBts.btclose = doc.getElementById("dw_btclose_"+ dwId);
			
			this.dwStatusBts.fresh = doc.getElementById("dw_btfresh_"+ dwId);
			

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

			this.bindEvent();
			this.setTitle( setting );											//设置标题栏
	
			//设置初始尺寸和位置
			if(null === this.dwSize.left)										//校正窗体位置
				this.dwSize.left = (da(win).width() - this.dwSize.w)/2;
			if(null === this.dwSize.top)
				this.dwSize.top = (da(win).height() - this.dwSize.h)/2;
			if(null === this.dwSize.right)
				this.dwSize.right = "auto";
			if(null === this.dwSize.bottom)
				this.dwSize.bottom = "auto";

			if( this.isDialog ){														//如果是对话框模式，需要先填充内容，再执行改变窗体尺寸位置的动画
				this.setCnt( setting );
			}
//			else
//				this.hideCnt();
			
			if( !setting.act ){
					this.setSize( this.dwSize.w, this.dwSize.h );
//					this.setPos( this.dwSize.top, this.dwSize.right, this.dwSize.bottom, this.dwSize.left );
					this.setPos( ( da(win).height() - this.dwSize.h )/2, this.dwSize.right, this.dwSize.bottom, ( da(win).width() - this.dwSize.w )/2 );
					if( !this.isDialog ){
						this.setCnt( setting );												//设置iframe
						this.showCnt();
					}
			}
			else if( setting.act && "image" != setting.type ){
					var context = this,
//							nowPos = {l:null,t:null},
							nowSize = {w:null,h:null};
					
          this.setSize( 0, 0 );
					this.setPos( setting.place.top, null, null, setting.place.left );
					
          da(this.dwPad).act({
							top: ( da(win).height() - this.dwSize.h )/2,
							left: ( da(win).width() - this.dwSize.w )/2,
              width: this.dwSize.w,
              height: this.dwSize.h
          },
          {
              duration: setting.time,
              easing: setting.easing,
              step: function(now, obj) {
                  if (null === nowSize.w || null === nowSize.h) {
                      if ("width" === obj.prop) nowSize.w = now;
                      if ("height" === obj.prop) nowSize.h = now;

                  } 
                  else {
                      context.setSize(nowSize.w, nowSize.h);
                      nowSize.w = null;
                      nowSize.h = null;
                  }
                  
//                  if (null === nowPos.l || null === nowPos.t) {
//                      if ("left" === obj.prop) nowPos.l = now;
//                      if ("top" === obj.prop) nowPos.t = now;
//
//                  } 
//                  else {
//                      context.setPos(nowPos.t, null, null, nowPos.l);
//                      nowPos.l = null;
//                      nowPos.t = null;
//                  }
              },
              complete: function(){
									context.setSize( context.dwSize.w, context.dwSize.h );
//									context.setPos( context.dwSize.top, context.dwSize.right, context.dwSize.bottom, context.dwSize.left );

									if( !context.isDialog ){
										context.setCnt( setting );												//设置iframe
             				context.showCnt();
									}
//									
//									nowPos = null;
									nowSize = null;
              }
          });
          
			}
			
			//缓存对象
			daWin.pushCache( this );
			
			//设置为活动状态
			this.setActive();
		},
		
		//绑定事件
		bindEvent: function(){
			var context = this;
			
//			da(win).bind( "unload", this.unload = function(){
//				context.close();
//			});
			
			//关闭按钮
			da( this.dwBts.btclose ).bind("click", function(evt){
				context.close();
				evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
				
			}).bind( "mousedown dblclick", function(evt){
				//TODO:暂时用于阻止事件冒泡避免Mask层造成的闪烁
				evt.stopPropagation();
			});

			//获取焦点设置为活动窗口
			da( this.dwPad ).bind( "click", function(evt){						//注：一定要通过win窗体句柄创建事件，否则如果过daWin后面的页面刷新后，通过window句柄创建的事件会找不到，造成窗体不能操作。
				if( !context.isActiving )
					context.setActive();
			});
			
			//窗口拖拽平移
			daDrag({
				window: win,
				src: this.dwBorder.t,
				target: this.dwPad,
				before: function(){			//拖动前
					da.daMaskShow( win, 1 );																	//显示遮罩
					context.setActive();
					if( !context.isDialog && "none" == context.dwLoadover.style.display)
						context.dwLoadover.style.display = "block";
				}, 
				
				move: function( evt, srcObj, targetObj, oldPos, nowPos, startPos, endPos ){
					if( 0 > nowPos.y ) nowPos.y = 0;
				},
				
				after: function(){			//拖动后
					if( !context.setting.modal ) da.daMaskHide( win );		//隐藏遮罩
					if( !context.isDialog && !context.isLoading)
						context.dwLoadover.style.display = "none";
						
					//重置窗口的记忆位置
					context.dwSize.top = context.dwPad.offsetTop;
					context.dwSize.left = context.dwPad.offsetLeft;
				}
			});
			
			if( this.isDialog ) return;				//以下事件绑定是窗口类型特有的,如果是对话框模式，就不用执行了。Oh,yeah!
			
			//最小化按钮
			da( this.dwBts.btmin ).bind("click", function(evt){
				this.blur();
				context.min();
				
			}).bind( "mousedown dblclick", function(evt){
				//TODO:暂时用于阻止事件冒泡避免Mask层造成的闪烁
				evt.stopPropagation();
			});

			//最大化按钮 //双击标题栏
			var fnWinMode = function( evt ){
				this.blur();
				
				if( "normal" === context.sizeMode )
					context.max();
				else if("min" === context.sizeMode || "max" === context.sizeMode)
					context.normal();
				
			};
			
			da( this.dwBorder.t ).bind( "dblclick", fnWinMode );
			da( this.dwBts.btmax ).bind( "click", fnWinMode ).bind( "mousedown dblclick", function(evt){
				//TODO:暂时用于阻止事件冒泡避免Mask层造成的闪烁
				evt.stopPropagation();
			});
			
			//刷新
			da( this.dwStatusBts.fresh ).bind( "click", function(evt){
				if( context.daFrameObj ) context.daFrameObj.refresh();
				
			}).bind( "mousedown dblclick", function(evt){
				//TODO:暂时用于阻止事件冒泡避免Mask层造成的闪烁
				evt.stopPropagation();
			});
			
			//遮罩层点击隐藏
			da( this.dwLoadover ).bind( "click", function( evt ){
				this.style.display = "none";
			});
			
		
			//拖拽改变尺寸
			this.dragSize(this.dwBorder.br2);
			this.dragSize(this.dwBorder.br);
			this.dragSize(this.dwBorder.l, true);
			this.dragSize(this.dwBorder.r);
			this.dragSize(this.dwBorder.b);
			
		},
	
		
		normal: function(){
			daWin.popDock( this );					//对象弹出相对应停靠状态缓存
			
	//		this.dwSize.left = (da(win).width() - this.dwSize.w)/2;									//通过历史窗口尺寸计算，居中显示
	//		this.dwSize.top = (da(win).height() - this.dwSize.h)/2;
			if(null === this.dwSize.right)
				this.dwSize.right = "auto";
			if(null === this.dwSize.bottom)
				this.dwSize.bottom = "auto";
			
			this.dwBts.btmax.className = "btmax";
			this.sizeMode = "normal";				//当前为正常尺寸
			
			this.showCnt();
			
			if( this.setting.act ){
				var context = this,
						nowPos = {l:null,t:null},
						nowSize = {w:null,h:null};
				
				context.setPos(da(this.dwPad).offset().top, null, null, da(this.dwPad).offset().left);
	      da(this.dwPad).stop().act({
						top: this.dwSize.top,
						left: this.dwSize.left,
	          width: this.dwSize.w,
	          height: this.dwSize.h
	      },
	      {
	          duration: context.setting.time,
	          easing: context.setting.easing,
	          step: function(now, obj) {
	              if (null === nowPos.l || null === nowPos.t) {
	                  if ("left" === obj.prop) nowPos.l = now;
	                  if ("top" === obj.prop) nowPos.t = now;
	
	              } 
	              else {
	                  context.setPos(nowPos.t, null, null, nowPos.l);
	                  nowPos = {
	                      l: null,
	                      t: null
	                  };
	              }
	              
	              
	              if (null === nowSize.w || null === nowSize.h) {
	                  if ("width" === obj.prop) nowSize.w = now;
	                  if ("height" === obj.prop) nowSize.h = now;
	
	              } 
	              else {
	                  context.setSize(nowSize.w, nowSize.h);
	                  nowSize = {
	                      w: null,
	                      h: null
	                  };
	              }
	          }
	      });
			}
			else{
				this.setPos(this.dwSize.top, null, null, this.dwSize.left);							//设置改变位置
				this.setSize(this.dwSize.w, this.dwSize.h);															//设置改变尺寸
			}
			
		},
		
		/**窗体最小化
		*/
		min: function(){
				daWin.pushDock( this );				//对象压入到停靠状态缓存
				
				this.dwBts.btmax.className = "btnormal";
				this.sizeMode = "min";				//当前为最小化
		},
		
		/**窗体最大化
		*/
		max: function(){
			daWin.popDock( this );					//对象弹出相对应停靠状态缓存
			
			var da_Win = da( win ),
					winWidth = parseInt( da_Win.width(), 10 ) || 0,
					winHeight = parseInt( da_Win.height(), 10 ) || 0;
	
			this.dwBts.btmax.className = "btnormal";
			this.sizeMode = "max";					//当前为最大化
			
			if( this.setting.act ){
				var context = this,
						nowPos = {l:null,t:null},
						nowSize = {w:null,h:null};
	
	      da(this.dwPad).act({
						top: 0,
						left: 0,
	          width: winWidth,
	          height: winHeight
	      },
	      {
	          duration: context.setting.time,
	          easing: context.setting.easing,
	          step: function(now, obj) {
	              if (null === nowPos.l || null === nowPos.t) {
	                  if ("left" === obj.prop) nowPos.l = now;
	                  if ("top" === obj.prop) nowPos.t = now;
	
	              } 
	              else {
	                  context.setPos(nowPos.t, null, null, nowPos.l);
	                  nowPos = {
	                      l: null,
	                      t: null
	                  };
	              }
	              
	              if (null === nowSize.w || null === nowSize.h) {
	                  if ("width" === obj.prop) nowSize.w = now;
	                  if ("height" === obj.prop) nowSize.h = now;
	
	              } 
	              else {
	                  context.setSize(nowSize.w, nowSize.h);
	                  nowSize = {
	                      w: null,
	                      h: null
	                  };
	              }
	          },
	          complete: function(){
							context.setPos( 0, null, null, 0 );						//设置改变位置（开一个小缝隙）
							context.setSize( winWidth, winHeight );				//设置改变尺寸
	          }
	      });
			}
			else{
				this.setPos( 0, null, null, 0 );						//设置改变位置（开一个小缝隙）
				this.setSize( winWidth, winHeight );				//设置改变尺寸
			}
			
		},
		
		/**释放内存资源
		*/
		release: function(){
			daDrag.unbind( this.dwBorder.t );
			
			this.unDragSize( this.dwBorder.br2 );
			this.unDragSize( this.dwBorder.br );
			this.unDragSize( this.dwBorder.l );
			this.unDragSize( this.dwBorder.r );
			this.unDragSize( this.dwBorder.b );
			
			
			da( this.dwBts.btmin ).remove();
			da( this.dwBts.btmax ).remove();
			da( this.dwBts.btclose ).remove();
			
			da( this.dwBorder.tl ).remove();
			da( this.dwBorder.tl2 ).remove();
			da( this.dwBorder.t ).remove();
			da( this.dwBorder.tr2 ).remove();
			da( this.dwBorder.tr ).remove();
			da( this.dwBorder.l ).remove();
			da( this.dwBorder.r ).remove();
			da( this.dwBorder.bl ).remove();
			da( this.dwBorder.bl2 ).remove();
			da( this.dwBorder.b ).remove();
			da( this.dwBorder.br2 ).remove();
			da( this.dwBorder.br ).remove();
			
			da( this.dwStatusBts.btfresh ).remove();
			
			da( this.dwStatus ).remove();
			da( this.dwLoadover ).remove();
			
			for( var i=0,len=this.dwDlgBts.length; i<len; i++ ){
				da( this.dwDlgBts[i] ).remove();
			}

			da( this.dwDialog ).remove();
			da( this.dwIframe ).remove();
			da( this.dwCntBox ).remove();
			da( this.dwCnt ).remove();
			da( this.dwCaption ).remove();
			
			da( this.dwTFoot ).remove();
			da( this.dwTBody ).remove();
			da( this.dwTHead ).remove();
			da( this.dwBody ).remove();
			da( this.dwPad ).remove();
			
			
			
			this.dwCssSize = null;
			this.setting.css = null;
			this.setting = null;
			
			this.dwParent = null;
			this.dwPad = null;
			this.dwBody = null;
			this.dwTHead = null;
			this.dwTBody = null;
			this.dwTFoot = null;
			
			this.dwCaption = null;
			this.dwCnt = null;
			this.dwCntBox = null;
			this.dwIframe = null;
			this.dwDialog = null;
			
			for( var i=0,len=this.dwDlgBts.length; i<len; i++ ){
				this.dwDlgBts[i] = null;
			}
			this.dwDlgBts = null;
			
			this.daFrameObj = null;
			this.insideWinObj = null;
			this.dwStatus = null;
			this.dwLoadover = null;

			this.dwBts.btmin = null;
			this.dwBts.btmax = null;
			this.dwBts.btclose = null;
			this.dwBts = null;
			
			this.dwStatusBts.btfresh = null;
			this.dwStatusBts = null;
			
			this.dwBorder.tl = null;
			this.dwBorder.tl2 = null;
			this.dwBorder.t = null;
			this.dwBorder.tr2 = null;
			this.dwBorder.tr = null;
			this.dwBorder.l = null;
			this.dwBorder.r = null;
			this.dwBorder.bl = null;
			this.dwBorder.bl2 = null;
			this.dwBorder.b = null;
			this.dwBorder.br2 = null;
			this.dwBorder.br = null;
			this.dwBorder = null;
			this.dwSize = null;
			
//			da(win).unbind( "unload", this.unload );
//			this.unload = null;

		},
		
		
		/**关闭窗口
		* params {boolean} isForce 不需要执行动画，立即关闭
		*/
		close: function( isForce, fnFinished ){
			if( this.isReleased ) return;														//摧毁进行时
			this.isReleased = true;
			
			this.hideCnt();
			
			var removeWin = function(){
					if( this.setting.modal ) da.daMaskHide( win );

					if( this.setting.after )
						this.setting.after.apply( this.insideWinObj );		//内页关闭完毕 如果需要回调处理，就触发回调
					
					this.dwPad.style.display = "none";

					daWin.popCache( this );																//弹出相应的daWin缓存
					var len = win.dwArrCache.length;
					if( 0 < len ){
						win.dwArrCache[ len-1 ].daWin.setActive();
					}
					
					if( this.daFrameObj ) this.daFrameObj.remove();				//删除daFrame对象
					this.release();
					
					try{
						if( this.activeElem ){
							this.activeElem.focus();
						}
					}
					catch(e){
						document.activeElement.focus();
					}
					
//					if( this.focusElement ) {															//修正IE的bug，IE中删除了页面上的焦点元素后，在无焦点元素的情况下，无法再对input等编辑控件进行操作。
//						try{
//							this.focusElement.focus();
//						}
//						catch(e){
//							document.activeElement.focus();
//						}
//						
//						this.focusElement = null;
//					}
					
					if( fnFinished ) fnFinished();
			};
			
			
			if( !isForce && this.setting.act ){											//关闭动画
							var context = this,
									nowPos = {l:null,t:null},
									nowSize = {w:null,h:null};
									
				      da(this.dwPad).stop().act({
									top: context.setting.place.top,
									left: context.setting.place.left,
				          width: context.dwCssSize.win_w,
				          height: context.dwCssSize.win_h
				      },
				      {
				          duration: context.setting.time,
				          easing: context.setting.easing,
				          step: function(now, obj) {
				              if (null === nowPos.l || null === nowPos.t) {
				                  if ("left" === obj.prop) nowPos.l = now;
				                  if ("top" === obj.prop) nowPos.t = now;
				
				              } 
				              else {
				                  context.setPos(nowPos.t, null, null, nowPos.l);
				                  nowPos = {
				                      l: null,
				                      t: null
				                  };
				              }
				              
				              
				              if (null === nowSize.w || null === nowSize.h) {
				                  if ("width" === obj.prop) nowSize.w = now;
				                  if ("height" === obj.prop) nowSize.h = now;
				
				              } 
				              else {
				                  context.setSize(nowSize.w, nowSize.h);
				                  nowSize = {
				                      w: null,
				                      h: null
				                  };
				              }
				          },
	                complete: function(){
          						removeWin.call(context);											  //移除窗体操作
          						
	                }
				      });
			}
			else{
				removeWin.call(this);
			}
			
	
		},
		
		//绑定拖拽窗口改变尺寸事件
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
			objDragSrc.dsMouseDown=function(evt){
				if(win.captureEvents)				//锁定事件源对象
					win.captureEvents(evt.MOUSEMOVE);
				else if(objDragSrc.setCapture)
					objDragSrc.setCapture();
	
				da.daMaskShow( win, 1 );				//显示遮罩
				context.setActive();
				if( !context.isDialog && "none" == context.dwLoadover.style.display )
					context.dwLoadover.style.display = "block";
	
				oldSize = {
					w: context.dwPad.offsetWidth,
					h: context.dwPad.offsetHeight,
					top: context.dwPad.offsetTop,
					left: context.dwPad.offsetLeft
				};
	
				pStart = {
					x: evt.clientX,
					y: evt.clientY
				};
				
				daDraging = true;								//开始拖动
			};
			
			//鼠标按下拖动
			objDragSrc.dsMouseMove = function(evt){
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
						if(isLeft){
//							win.setTimeout(function(){context.setPos( context.dwSize.top, null, null, pEnd.x ); context.setSize(context.dwSize.w, context.dwSize.h);},13);
							context.setPos( context.dwSize.top, null, null, pEnd.x ); context.setSize(context.dwSize.w, context.dwSize.h);
						}
						else{
//							win.setTimeout(function(){context.setSize(context.dwSize.w, context.dwSize.h);},13);
							context.setSize(context.dwSize.w, context.dwSize.h);
						}
						
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
			objDragSrc.dsMouseUp = function(evt){
				if(daDraging){									//拖动中…	
					if(win.releaseEvents)		//释放 事件源对象锁定状态
						win.releaseEvents(evt.MOUSEMOVE);
					else if(objDragSrc.releaseCapture)
						objDragSrc.releaseCapture();
					
					if( !context.setting.modal )da.daMaskHide( win );				//隐藏遮罩
					if( !context.isDialog && !context.isLoading)
						context.dwLoadover.style.display = "none";
	
					daDraging = false;								//结束拖动
				}
	
			};
			
			//绑定事件
			da(objDragSrc).bind( "mousedown", objDragSrc.dsMouseDown );
			da(doc).bind( "mousemove", objDragSrc.dsMouseMove ).bind( "mouseup", objDragSrc.dsMouseUp );
		},
		
		//移除拖拽窗口改变尺寸事件
		/*
			objDragSrc:	拖拽事件源对象
		*/
		unDragSize: function( objDragSrc ){
			if( objDragSrc.dsMouseDown )
				da(objDragSrc).unbind( "mousedown", objDragSrc.dsMouseDown );
				
			if( objDragSrc.dsMouseDown )
				da(doc).unbind( "mousemove", objDragSrc.dsMouseMove );
				
			if( objDragSrc.dsMouseDown )
				da(doc).unbind( "mouseup", objDragSrc.dsMouseUp );
			
			objDragSrc.dsMouseDown = null;
			objDragSrc.dsMouseMove = null;
			objDragSrc.dsMouseUp = null;
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
			if( this.setting.modal ) da.daMaskShow( win, 70 );			//如果是模式窗口，就给一个遮罩啊~
			if( this.isDialog || !this.isLoading )										//去掉daWin内部遮罩
				this.dwLoadover.style.display = "none";
				
			try{
				if( 0 < this.dwDlgBts.length )
					this.dwDlgBts[ this.dwDlgBts.length-1 ].focus();
			}
			catch(e){}


		},
	
		//带停靠的窗口尺寸位置转换
		parseSize: function(sSize){
			if("number" == typeof sSize){
				return sSize;
			}
			else if("string" == typeof sSize){
				sSize = sSize.replace("px","");
				var cSign = sSize.match(/[\^＾＜<vV>＞=＝]/g);
				if(null == cSign) return da.isNull( parseInt(sSize), 0 );
				
//				for(var i=0,len=cSign.length; i<len; i++){
//					switch(cSign[i]){
//						case "＾":
//						case "^":
//							this.dwSize.top = 0;
//							break;
//						case "V":
//						case "v":
//							this.dwSize.top = "auto";
//							this.dwSize.bottom = 0;
//							break;
//						case "＞":
//						case ">":
//							this.dwSize.left = "auto";
//							this.dwSize.right = 0;
//							break;
//						case "＜":
//						case "<":
//							this.dwSize.left = 0;
//							break;
//					}
//				}
				sSize = sSize.replace(/[\^＾＜<vV>＞=＝]/g,"");
				return da.isNull( parseInt(sSize), 0 );
			}
		},
		
		
		//设置尺寸
		/*
			nWidth: 窗口宽
			nHeight: 窗口高
		*/
		setSize:　function( nWidth, nHeight ){
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
					dialogWidth = iframeWidth - ( "image" != this.setting.type  ? cs.dialog_padding : 0 ),
					dialogHeight = iframeHeight;
			
			nWidth = (minWidth<nWidth) ? nWidth : minWidth;
			nHeight = (TandB_h<nHeight) ? nHeight :TandB_h;
			
			this.dwPad.style.width = nWidth+ "px";
			this.dwPad.style.height = nHeight+ "px";
			this.dwBody.style.width = nWidth+ "px";
			this.dwBody.style.height = nHeight+ "px";
			
			this.dwCaption.style.width = captionWidth + "px";
			this.dwStatus.style.width = captionWidth + "px";
			this.dwBorder.t.style.width = topWidth + "px";			

			this.dwCnt.style.width = iframeWidth+ "px";				//减去窗口的边框宽度
			this.dwCnt.style.height = iframeHeight+ "px";
			this.dwIframe.style.width = iframeWidth+ "px";
			this.dwIframe.style.height = iframeHeight+ "px";
			this.dwLoadover.style.width = ( iframeWidth + 50 )+ "px";
			this.dwLoadover.style.height = ( iframeHeight + 50 )+ "px";
			this.dwDialog.style.width = dialogWidth+ "px";
			this.dwDialog.style.height = dialogHeight+ "px";
			
			if( this.daFrameObj ) this.daFrameObj.setSize( iframeWidth, iframeHeight );
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
			setting: 用户自定义参数
		*/
		setTitle:　function( setting ){
			if( null === this.dwIframe ) return;
	
			var nWidth = this.dwSize.w - ( this.dwCssSize.l_w + this.dwCssSize.r_w + this.dwCssSize.l2_w + this.dwCssSize.r2_w );				//减去标题栏左右样式预留宽度
			nWidth =  0 > nWidth ? 0 : nWidth;																								//纠正数据
			this.dwBorder.t.style.width = nWidth + "px";	
	
			this.dwCaption.innerHTML = ( this.isDialog && "image" != setting.type ? '<div class="'+ this.setting.type +'"></div>' 
						: '' ) 
						+ ( da.isFunction( setting.title ) ? setting.title.call( this, this.dwCaption, this.dwBorder.t ) 
						: setting.title );	//更改标题（注意这里可以是HTML,也可以是Funtion）
						
		},
		
		/**设置窗体内容
		* @param {PlainObject} setting 用户自定义参数
		*/
		setCnt: function( setting ){
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
					
					if( da.isArray( setting.html ) ){
						this.imagesList = setting.html;
						setting.html = "";
					}
					dwDialog.innerHTML = setting.html;
					
//				if( 0 === this.dwSize.w || 0 === this.dwSize.h ){					//在对话框模式，未传入width，height的时候，纠正位置，居中显示
//						this.dwSize.w = da( this.dwPad ).width();
//						this.dwSize.h = da( this.dwPad ).height();
//						
//						this.setPos(( da(win).height() - this.dwSize.h )/2, "auto", "auto", ( da(win).width() - this.dwSize.w )/2)
//				}
					
					var btBar = doc.createElement("div"),
							button = this.setting.button,
							btObj;
							
					btBar.className = "daWinBtBar";
					dwDialog.insertBefore( btBar, null );
					
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
								
								btBar.insertBefore( btObj, null );
								dwDlgBts.push( btObj );
							}
					}
					else{
						this[ this.setting.type ]( btBar );
					}
					
					
					var cs = this.dwCssSize,
							TandB_h = (cs.t_h+ cs.b_h),				//上下边框高度
							LandR_w = (cs.l_w+ cs.r_w);				//左右边框高度

					this.dwSize.w = ( 0 === this.dwSize.w ) ? da( dwDialog ).width() + LandR_w : this.dwSize.w; 
					this.dwSize.h = ( 0 === this.dwSize.h ) ? da( dwDialog ).height() + TandB_h : this.dwSize.h;
					
	
			}
			else{
					dwDialog.style.display = "none";
					dwIframe.style.display = "none";
					
					this.isLoading = true;
					this.setStatus("LOADING..");
					this.daFrameObj = daFrame({
						window: win,
						width: nWidth,
						height: nHeight,
						parent: dwIframe.parentNode,
						border: "0px",
						url: setting.url,
						load: function(){
							context.isLoading = false;
							context.setStatus("");
							
							if(context.isActiving)																									//如果是当前活动窗口并已经加载完毕，就撤销遮罩层
								context.dwLoadover.style.display = "none";
								
							context.insideWinObj = this;																						//获得并缓存内页window对象
							if( context.setting.load )
								context.setting.load.apply( this, arguments );											//内页加载完毕 如果需要回调处理，就触发回调
						},
						back: function(){
							if( context.setting.back )
								context.setting.back.apply( this, arguments );										//内页数据返回 如果需要回调处理，就触发回调
							if( context.setting.backclose ) context.close();
						},
						close: function(){
							context.close();
						},
						
						unload: function(){																												//内页
							//TODO:
						}
					});
					
					
					this.dwLoadover.style.display = "block";
					this.dwLoadover.style.width = nWidth + "px";			//loading遮罩
					this.dwLoadover.style.height = nHeight + "px";
			}
	
		},	


		/**daWin基本提示信息框模式
		*/
		info: function( btBar ){
			var context = this,
					setting = this.setting,
					dwDlgBts = this.dwDlgBts,
					btObj;
			
			btObj = doc.createElement("a");
			btObj.className = "daWinBt";
			btObj.href = "javascript:void(0)";
			btObj.innerHTML = [
				'<div class="l"></div>',
				'<div class="txt">确&nbsp;定 (Y)</div>',
				'<div class="r"></div>'
			].join("");
			
			da( btObj ).bind( "click", function( evt ){
					context.close( false, function(){
						try{
							if( da.isFunction( setting.yes ) )
								setting.yes.call( this, context, evt );
						}catch(e){}
					});
					
					evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
			});
			btBar.insertBefore( btObj, null );
			dwDlgBts.push( btObj );
		},
		
		/**daWin判断信息提示框模式
		*/
		confirm: function( btBar ){
			var context = this,
					setting = this.setting,
					dwDlgBts = this.dwDlgBts,
					btObj;
					
			this.info( btBar );									//追加"确定"按钮
			
			btObj = doc.createElement("a");
			btObj.className = "daWinBt";
			btObj.href = "javascript:void(0)";
			btObj.innerHTML = [
				'<div class="l"></div>',
				'<div class="txt">取&nbsp;消 (N)</div>',
				'<div class="r"></div>'
			].join("");
			
			da( btObj ).bind( "click", function( evt ){
					context.close( false, function(){
						try{
							if( da.isFunction( setting.no ) )
								setting.no.call( this, context, evt );
						}catch(e){}
							
					});
					
					evt.stopPropagation();					//阻止事件冒泡。因为点击按钮时，会触发setActive,如果窗口销毁了，那么这里再触发setActive也没什么意义
			} );
			
			btBar.insertBefore( btObj, null );
			dwDlgBts.push( btObj );
			
		},
		
		/**daWin判断信息提示框模式
		* @param {Element} btBar 功能按钮 容器对象
		*/
		image: function( btBar ){
			var context = this,
				setting = this.setting,
				dwDialog = this.dwDialog,
				dwDlgBts = this.dwDlgBts,
				imgList = this.imagesList,
				dataObj, imgContainer, imgObj, numObj, txtObj, preBtObj, nextBtObj, imgPadObj,
				imgIdx = setting.imageSetting.index,			//起点图片索引
				btObj, playImageTimer = null;

			
			dwDialog.style.textAlign = "center";
			dwDialog.style.padding = "0";
			//dwDialog.style.cssText = "position:relative;";	//样式表加了
			btBar.style.textAlign = "left";

			imgContainer = doc.createElement("div");														//大图展示区 容器对象
			imgContainer.style.cssText = "position:relative;";
			dwDialog.insertBefore( imgContainer, btBar );
			
			imgObj = doc.createElement("img");																	//大图展示img对象
			imgContainer.insertBefore( imgObj, null );
			
			if( 1 < imgList.length ){																						//工具条"自动播放"图片切换按钮
				if( setting.imageSetting.play ){
					btObj = doc.createElement("a");	
					btObj.title = "自动播放",
					btObj.className = "daWinBt";
					btObj.href = "javascript:void(0)";
					btObj.innerHTML = [
						'<div class="l"></div>',
						'<div class="txt" style="font-family:webdings; font-size:18px;">4</div>',
						'<div class="r"></div>'
					].join("");
					
					da( btObj ).bind( "click", function(){
						if( "4" == this.children[1].innerHTML ){
							this.children[1].innerHTML = ";";
							playImage();
						}
						else{
							this.children[1].innerHTML = "4";
							stopImage();
						}
						
					});
					btBar.insertBefore( btObj, null );
					dwDlgBts.push( btObj );
				}
				
				if( setting.imageSetting.prev ){
					btObj = doc.createElement("a");																	//工具条"前一张"图片切换按钮
					btObj.title = "前一张",
					btObj.className = "daWinBt";
					btObj.href = "javascript:void(0)";
					btObj.innerHTML = [
						'<div class="l"></div>',
						'<div class="txt" style="font-family:webdings">7</div>',
						'<div class="r"></div>'
					].join("");
					da( btObj ).bind( "click", function(){
						slideImage( imgIdx-1 );
						
					});
					btBar.insertBefore( btObj, null );
					dwDlgBts.push( btObj );
				}
				
				if( setting.imageSetting.list ){
					btObj = doc.createElement("a");																	//工具条"图片列表" 功能按钮
					btObj.title = "图片列表",
					btObj.className = "daWinBt";
					btObj.href = "javascript:void(0)";
					btObj.innerHTML = [
						'<div class="l"></div>',
						'<div class="txt" style="font-size:18px;">&#9636;</div>',
						'<div class="r"></div>'
					].join("");
					da( btObj ).bind( "click", function(){
						if( "none" == imgPadObj.style.display )
							da(imgPadObj).show(300);//imgPadObj.style.display = "block";
						else
							da(imgPadObj).hide(300);//imgPadObj.style.display = "none";
						
					});
					btBar.insertBefore( btObj, null );
					dwDlgBts.push( btObj );
				}
				
				if( setting.imageSetting.next ){
					btObj = doc.createElement("a");																	//工具条"下一张"图片切换按钮
					btObj.title = "下一张",
					btObj.className = "daWinBt";
					btObj.href = "javascript:void(0)";
					btObj.innerHTML = [
						'<div class="l"></div>',
						'<div class="txt" style="font-family:webdings">8</div>',
						'<div class="r"></div>'
					].join("");
					da( btObj ).bind( "click", function(){
						slideImage( imgIdx+1 );
						
					});
					btBar.insertBefore( btObj, null );
					dwDlgBts.push( btObj );
				}
				
					preBtObj = doc.createElement("div");														//图片热区 按钮样式提示图片
					preBtObj.className = "preBt";
					imgContainer.insertBefore( preBtObj, null );
					nextBtObj = doc.createElement("div");
					nextBtObj.className = "nextBt";
					imgContainer.insertBefore( nextBtObj, null );
					
					btObj = doc.createElement("div");															//大图左边热区，点击切换前一张图片
					btObj.title = "点击看前一张",
					btObj.className = "imgHotZone pre";
					da( btObj ).bind( "click", function(){
						slideImage( imgIdx-1 );
						
					}).bind( "mouseover", function(){
						if( 0 < imgIdx ) preBtObj.style.display = "block";
						
					}).bind( "mouseout", function(){
						preBtObj.style.display = "none";
						
					});
					imgContainer.insertBefore( btObj, null );
		
					btObj = doc.createElement("div");															//大图右边热区，点击切换下一张图片
					btObj.title = "点击看下一张",
					btObj.className = "imgHotZone next";
					da( btObj ).bind( "click", function(){
						slideImage( imgIdx+1 );
						
					}).bind( "mouseover", function(){
						if( imgList.length-1 > imgIdx ) nextBtObj.style.display = "block";
						
					}).bind( "mouseout", function(){
						nextBtObj.style.display = "none";
						
					});
					imgContainer.insertBefore( btObj, null );
					
					
					imgPadObj = doc.createElement("div");													//小图导航
					imgPadObj.style.cssText = "display:none;position:absolute;left:0px;bottom:0px;width:100%;margin:5px 0px;";
					imgContainer.insertBefore( imgPadObj, null );
					
					var tmp = [];
					for( var i=0, len=imgList.length; i<len; i++){
						tmp = imgList[i].split('|');
						
						btObj = doc.createElement("img");
						btObj.id = "daWin_ImgPadList_" + i;
						btObj.src = tmp[0];
						btObj.title = tmp[1] || "";
						btObj.style.cssText = "float:left;width:50px;height:30px;margin:5px 5px;border:2px solid #888;cursor:pointer;";
						
						(function( obj, idx ){
							da( obj ).bind( "click", function(){
								slideImage( idx );
								
							});
						})( btObj, i );
						
						imgPadObj.insertBefore( btObj, null );
						
					}
					
					numObj = doc.createElement("span");
					numObj.style.cssText = "line-height:22px; font-family:Arial; font-size: 12px; font-style:italic; vertical-align:top; margin-left:10px;";
					numObj.innerHTML = (imgIdx + 1);
					btBar.insertBefore( numObj, null );
					
					btObj = doc.createElement("span");
					btObj.style.cssText = "line-height:22px; font-family:Arial; font-size: 12px; font-style:italic; vertical-align:top; margin-right:10px;";
					btObj.innerHTML = "&nbsp;/&nbsp;" + imgList.length;
					btBar.insertBefore( btObj, null );
					
					txtObj = doc.createElement("span");
					txtObj.style.cssText = "line-height:22px; font-size: 14px; color:#222; font-weight:bold; vertical-align:top; margin:0px 10px;";
					btBar.insertBefore( txtObj, null );
					
					
					
					/*
					da(doc).bind("keydown", function( evt ){
						switch( evt.keyCode ){
							case 37: slideImage( imgIdx - 1 ); break;				//方向键左
							case 38: imgPadObj.style.display = "block"; break;		//方向键上
							case 39: slideImage( imgIdx + 1 ); break;				//方向键右
							case 40: imgPadObj.style.display = "none"; break;		//方向键下
						}
					});
					*/
					
			}


			if( setting.imageSetting.org ){
				btObj = doc.createElement("div");																	//工具条"下一张"图片切换按钮
				btObj.style.cssText = "position:absolute;right:0px;bottom:0px; border-left:1px solid #ddd;border-top:1px solid #ddd; background:#f5f5f5;padding:5px;font-size:12px;cursor:pointer;";
				btObj.innerHTML = "原图";
				da( btObj ).bind( "click", function(){
					var winSize = {w: da(win).width(), h: da(win).height() };
					
					imgObj.style.width = da.data( imgObj, "srcWidth")+"px";
					imgObj.style.height = da.data( imgObj, "srcHeight")+"px";
					imgContainer.style.width = (winSize.w - 20)+"px";
					imgContainer.style.height = (winSize.h - ( 1 == imgList.length ? 66 : 100))+"px";
					
					imgContainer.style.overflow = "auto";
					
					context.setSize(winSize.w, winSize.h);
					context.dwSize.w = winSize.w;
					context.dwSize.h = winSize.h;
					context.max();
					
				});
				imgContainer.insertBefore( btObj, null );
			}


			var slideImage = function( idx ){												//图片切换处理函数
				imgContainer.style.overflow = "";						//还原为自适应尺寸图片，不需要滚动条
			
				if( 0 > idx || imgList.length <= idx ) return;
				
				dataObj = imgList[ idx ].split("|");
				
				context.setStatus("图片加载中...");
				da.loadImage( dataObj[0], function(){					//图片预加载，完毕回调函数
					var imgBuffer = this;
					context.setStatus("");
					
					var winSize = {w: da(win).width(), h: da(win).height() },					//图片展示窗体 自适应图片大小
						borderHeight = ( 1 == imgList.length ) ? 66 : 100, 
						boxSize = {																//窗体大小 = 图片大小 + 表框大小 + 工具条大小
							w: imgBuffer.width + 20, 
							h: (imgBuffer.height + borderHeight)
						}, 			
						boxPos = {l:null,t:null},
						nowPos = {l:null,t:null},
						nowSize = {w:null,h:null};

					if( winSize.w < boxSize.w || winSize.h < boxSize.h ){						//校正图片展示窗体尺寸
						var nScale = boxSize.w/boxSize.h;										//图片宽高比例尺
							// nWidth = boxSize.w - winSize.w,
							// nHeight = boxSize.h - winSize.h;

						if( boxSize.w/winSize.w > boxSize.h/winSize.h ){
							boxSize.w = winSize.w - 10;											//图片展示窗体留一点外边距，好看些
							boxSize.h = parseInt(boxSize.w/nScale);
							
						}
						else{
							boxSize.h = winSize.h - 10;
							boxSize.w = parseInt(nScale * boxSize.h);
						}
					}
					
					boxPos = {																											//校正图片展示窗体位置
						l: ( winSize.w - boxSize.w )/2, 
						t: ( winSize.h - boxSize.h)/2
					};
					
					
					if( context.setting.act ){									//窗体尺寸变化动画特效
						imgObj.style.display = "none";
						btBar.style.display = "none";
								
						da(context.dwPad).stop().act({									//窗体改变尺寸动画
							top: boxPos.t,
							left: boxPos.l,
							width: boxSize.w,
							height: boxSize.h
						},
						{
							duration: setting.time,
							easing: setting.easing,
							step: function(now, obj) {
								if (null === nowPos.l || null === nowPos.t) {
								  if ("left" === obj.prop) nowPos.l = now;
								  if ("top" === obj.prop) nowPos.t = now;

								} 
								else {
								  context.setPos(nowPos.t, null, null, nowPos.l);
								  nowPos = {
									  l: null,
									  t: null
								  };
								}

								if (null === nowSize.w || null === nowSize.h) {
								  if ("width" === obj.prop) nowSize.w = now;
								  if ("height" === obj.prop) nowSize.h = now;

								}
								else {
								  context.setSize(nowSize.w, nowSize.h);
								  context.dwSize.w = nowSize.w;
								  context.dwSize.h = nowSize.h;
								  
								  nowSize = {
									  w: null,
									  h: null
								  };
								}
							},
							complete: function(){
								context.setSize(boxSize.w, boxSize.h);
								context.dwSize.w = boxSize.w;
								context.dwSize.h = boxSize.h;
								  
								imgObj.style.display = "block";
								btBar.style.display = "block";
								imgContainer.style.width = imgObj.style.width = (boxSize.w - 20) + "px";
								imgContainer.style.height = imgObj.style.height = (boxSize.h- borderHeight) + "px";
								imgObj.src = imgBuffer.src;											//设置img对象图片src地址
							}
						});
				  
						// da(imgContainer).act({													//图片改变尺寸动画
						  // width: boxSize.w - 20,
						  // height: boxSize.h - borderHeight
						// },
						// {
						  // duration: setting.time,
						  // easing: setting.easing,
						  // step: function(now, obj) {
						  // if ("width" === obj.prop) imgContainer.style.width = imgObj.style.width = now + "px";
						  // if ("height" === obj.prop) imgContainer.style.height = imgObj.style.height = now + "px";
						  
						  // },
						  // complete: function(){
								// imgObj.src = imgBuffer.src;								//设置img对象图片src地址
						  // }
						// });
								
					}
					else{																						  //窗体尺寸变化无动画特效
						context.setSize( boxSize.w, boxSize.h );
						context.setPos( boxPos.t, null, null, boxPos.l );
						
						imgContainer.style.width = imgObj.style.width = (boxSize.w - 20) + "px";
						imgContainer.style.height = imgObj.style.height = (boxSize.h- borderHeight) + "px";
						imgObj.src = imgBuffer.src;											//设置img对象图片src地址
					}
					
					da.data( imgObj, "srcWidth", imgBuffer.width );
					da.data( imgObj, "srcHeight", imgBuffer.height );
					
				});
				
				if( 1 < imgList.length ){
					doc.getElementById( "daWin_ImgPadList_" + imgIdx ).style.border = "2px solid #333";
					doc.getElementById( "daWin_ImgPadList_" + idx ).style.border = "2px solid #fff";
					
					numObj.innerHTML = (idx + 1);												//更新图片展示信息当前值
					txtObj.innerHTML = dataObj[1] || "";
					imgIdx = idx;
				}
				
				
			};
			
			var playImage = function(){														//图片自动播放函数
					stopImage();																			
					playImageTimer = da.keep( 3800, function(){
						if( imgList.length-1 <= imgIdx ) {
							slideImage( imgIdx );
						}
						else
							slideImage( imgIdx+1 );
						
					});
			};
		
			var stopImage = function(){														//停止图片自动播放函数
					clearInterval( playImageTimer );
					playImageTimer = null;
			};

			context.setSize( 0, 0 );
			context.setPos( setting.place.top, null, null,  setting.place.left );
			slideImage(imgIdx);
		},


		/** 隐藏窗体 内容区
		*/
		hideCnt: function(){
//			if( this.setting.act )
//				da( this.dwCntBox ).fadeOut(10);  
//			else
				this.dwCntBox.style.display = "none";
				
		},
		
		/** 显示窗体 内容区
		*/
		showCnt: function(){
			if( this.setting.act )
				da( this.dwCntBox ).fadeIn( 300 );  			//内存泄露严重
			else
				this.dwCntBox.style.display = "block";
		},
		
		//设置状态栏信息
		setStatus: function( sHTML ){
			this.dwStatus.innerHTML = ( this.setting.status || sHTML );
		}
		
		
	};
	
	daWin.fnStruct.init.prototype = daWin.fnStruct;				//继承成员属性、函数
	
	
	/*********daWin静态函数***********/
	//把当前daWin窗口对象压入缓存
	/*
		dwObj: daWin窗口对象
	*/
	daWin.pushCache = function( dwObj ){
		var newCache = {
					id: dwObj.dwId,
					daWin: dwObj
				};
		win.dwArrCache.push( newCache );									//把相应的对象信息，压入缓存
		self.dwOpenList.push( newCache );									//把属于当前页面打开的daWin对象缓存起来，当页面刷新或关闭的时候，通过该列表对应的daWin对象，进行关闭
	
		return newCache;																	//返回最新的缓存信息
	};
	
	//把当前daWin窗口对象弹出缓存
	/*
		dwObj: daWin窗口对象
	*/
	daWin.popCache = function( dwObj, isGet ) {
		var arrCache = win.dwArrCache,
				openList = self.dwOpenList,
				id = dwObj.dwId,
				res = null,
				i, n;
		
		for( i=0,len=arrCache.length; i<len; i++ ) {
			if(id === arrCache[i].id){
				res = arrCache[i];
				if(isGet) return res;																	//如果是get模式
				
				arrCache.splice(i,1);																	//删除相应索引的缓存
				break;
			}
			
		}
		
		for( n=0,len2=openList.length; n<len2; n++ ) {
			if(id === openList[n].id){
				openList.splice( n,1 );														//删除相应索引的缓存
				break;
			}
			
		}
		
		return res;

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
		dwObj.hideCnt();
		
		if( dwObj.setting.act ){
				var context = dwObj,
						nowPos = {l:null,t:null},
						nowSize = {w:null,h:null};

	      da(context.dwPad).stop().act({
            top: da(win).height() - context.dwCssSize.win_h,
            left: (nPos* dwObj.dwCssSize.win_w),
	          width: context.dwCssSize.win_w,
	          height: context.dwCssSize.win_h
	      },
	      {
	          duration: context.setting.time,
	          easing: context.setting.easing,
	          step: function(now, obj) {
	              if (null === nowPos.l || null === nowPos.b) {
	                  if ("left" === obj.prop) nowPos.l = now;
	                  if ("top" === obj.prop) nowPos.t = now;
	
	              } 
	              else {
	                  context.setPos(nowPos.t, null, null, nowPos.l);
	                  nowPos = {
	                      l: null,
	                      t: null
	                  };

	              }
	              
	              if (null === nowSize.w || null === nowSize.h) {
	                  if ("width" === obj.prop) nowSize.w = now;
	                  if ("height" === obj.prop) nowSize.h = now;
	
	              } 
	              else {
	                  context.setSize(nowSize.w, nowSize.h);
	                  nowSize = {
	                      w: null,
	                      h: null
	                  };
	                  
	              }
	          },
            complete: function(){
            	//TODO:
            }
	      });
	      
		}
		else{
			dwObj.setSize(0, dwObj.dwCssSize.win_h );											//设置改变尺寸
			dwObj.setPos("", "", 0, (nPos* dwObj.dwCssSize.win_w) );			//设置改变位置
		}
	
	};
	

	/**关闭所有子窗口
	*/
	daWin.closeChild = function(){
		//debugger; win.location.href
		var arrCache = win.dwArrCache,
				openList = self.dwOpenList;
		

		for(var i=openList.length-1; 0<=i; i--){									//窗体对象关闭，清除相应缓存，导致缓存索引会发生变化，所以这里必须倒着循环
			 openList[i].daWin.close( true );
		}
		
	};
	
	
	return daWin;
})();


da( self ).bind( "unload", function(){												//监听窗体刷新事件
	daWin.closeChild();
	
});


//全局属性
win.daWin = daWin;

})(window);


//********** 部分功能函数封装 *************/
function info( html, fnOK ){
	daWin({
		html: html,
		yes: fnOK
	});
}

function warn( html, fnOK ){
	daWin({
		type: "warn",
		html: html,
		yes: fnOK
	});
}

function error( html, fnOK ){
	daWin({
		type: "error",
		html: html,
		yes: fnOK
	});
}

function confirm( html, fnOK, fnCancel ){
	daWin({
		type: "confirm",
		html: html,
		yes: fnOK,
		no: fnCancel
	});
}


function input( html, fnOK, fnCancel ){
	daWin({
		type: "confirm",
		html: html,
		yes: fnOK,
		no: fnCancel
	});
}


function dialog( winWidth, winHeight, winURL, winTitle, fnLoaded, fnBack, fnClose, _fun1, _fun2)
{
		daWin({
			width: winWidth,
			height: winHeight,
			title: winTitle,
			url: winURL,
			load: fnLoaded,
			after: fnClose,
			back: fnBack
		});
};

function dialog2( winWidth, winHeight, winURL, winTitle, fnLoaded, fnBack, fnClose, _fun1, _fun2)
{
		daWin({
			width: winWidth,
			height: winHeight,
			title: winTitle,
			url: winURL,
			
			modal: true,
			
			load: fnLoaded,
			after: fnClose,
			back: fnBack
		});
};


//da(document).bind("mousemove",function( evt ){
//	window.daMouseX = evt.clientX;
//	window.daMouseY = evt.clientY;
//});

//daWin.fnStruct.setting.act = false;