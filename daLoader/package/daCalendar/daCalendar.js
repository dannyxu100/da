/*
	author:	danny.xu
	date:	2011-2-12
	description:	工作计划日历插件
*/

//补零
function fillZero( str, len, isRight ){
	if( "number" === typeof str ) str = str.toString();
	var nZero = len - str.length,
		sZero = [];
	
	if( 0 >= nZero ) return str;
	else{
	for( ; 0<nZero; nZero-- ) sZero.push("0");

	if( isRight ) return str = str + sZero.join("");  
	else return str = sZero.join("") + str;
   	
  }
} 



( function( win ){
	var doc = win.document;


	//日历属性结
	function dayElement( sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay ){
		this.isToday = false;			//是否是当日
		this.color = '';					//日历背景色
		
		this.sYear = sYear;				//国历年
		this.sMonth = sMonth;			//国历月
		this.sDay = sDay;					//国历日
		this.week = week;					//国历星期

		this.date = new Date( sYear, sMonth, sDay );
		
		this.lYear = lYear;				//农历年
		this.lMonth = lMonth;			//农历月
		this.lDay = lDay;					//农历日
		this.isLeap = isLeap;			//是否闰月

		this.cYear = cYear;				//干支年
		this.cMonth = cMonth;			//干支月
		this.cDay = cDay;					//干支日
		
		this.lunarFestival = ''; 	//农历节日
		this.solarFestival = ''; 	//国历节日
		this.solarTerms = ''; 		//节气
		
	};

	/**构造函数
	*/
	var daCalendar = function( setting ){
			return new daCalendar.fnStruct.init( setting );
	};
	
	daCalendar.fnStruct = daCalendar.prototype = {
			cdrId: 0,									//唯一序列号
			cdrObj: null,							//日历table对象
			cdrParentObj: null,				//日历容器DOM对象
			cdrCntObj: null,					//时间选择器容器对象
			cdrTargetObj: null,				//时间选择器目标对象
			
			cdrBar: null,							//日历顶端的工具条
			
			setting: {
				id: "",
				target: "",
				parent: null,
				
				year: "",
				month: "",
				firstDay: 1,										//起始日默认为周一（0~6为周日~周六）
				
				changeYear: true,
				changeMonth: true,
				isSelector: false, 							//是否以日期选择器的形态
				top: 0,
				left: 0,
				width: 210,
				height: 190,
				
				tools: "",											//日历单元格顶端的自定义工具按钮集合 源码
				
				css: {													//风格样式
					daCalendar: " daCalendar",
					cnt: "daCalendarCnt",
					shadow: "daShadow",
					head: "trHead",
					date: "trDate",
					datetitle: " title",
					focus: " focus",
					datelist: " list",
					
					bar: " daCalendarBar",
					barLeft: "barLeft",
					barRight: "barRight",
					barBt: " bt",
					barBt_slt: " bt_slt",
					barToday: " today",
					barToday_slt: " today_slt",
					barPrevious: " previous",
					barPrevious_slt: " previous_slt",
					barNext: " next",
					barNext_slt: " next_slt",
					barTitle: " barTitle"
				},
				
				headEvent: null,								//日历头事件集合
				cellEvent: null,								//日历单元格事件集合
				itemEvent: null,								//日历单元格子项事件集合
				clickToday: null,
				clickPrev: null,
				clickNext: null,
				clickYear: null,
				clickMonth: null,
				clickRefresh: null
				
			},
			
			cdrFirstDay: 1,										//起始日默认为周一（0~6为周日~周六）
			cdrColor: {											//daCalendar日历风格颜色
				red: "#f00",
				green: "#0f0",
				black: "#000"
			},
			cdrToday: null,										//当前客户端国历日期{year,month,date}
			cdrYear: 0,											//当前日历对应的年份
			cdrMonth: 0,										//当前日历对应的月份
			
			monthFirstDay: null,								//日历当前月 第一天是星期几
			
			arrElement: null,									//日历单元格农历数据结构体缓存
			arrTdHead: null,									//日历星期头
			
			arrTd: null,										//日历单元格
			arrDivTitle: null,									//日历单元格标题栏
			arrSpanTool: null,									//日历单元格顶端的自定义工具按钮集合
			arrDivList: null,									//日历单元格中的子项列表容器
			arrUlItem: null,									//所有当前日历中日程的子项，按调用addItem时传入的group参数分类为二级
			
			
			/**初始化函数
			*/
			init: function( setting ){
				setting = this.setting = da.extend( {}, this.setting, setting );
				
				setting.isSelector = !!setting.isSelector;
				
				var tmp = da( setting.parent );																																//保存daCalendar父节点DOM对象
				this.cdrParentObj = 0<tmp.dom.length ? tmp.dom[0] : doc.body;
				
				tmp = da( setting.target );																																		//矫正target参数
				this.cdrTargetObj = 0 < tmp.dom.length ? tmp.dom[0] : null;
				
				if( setting.id )
					this.cdrId = setting.id;
				else 
					//this.iId = da.nowId();					//在ie里面好像不怎么行啊~
					while( null !== doc.getElementById( "daCalendar_" + this.cdrId ) ) this.cdrId++;						//保证id 唯一性
					
				
				setting.firstDay = ( setting.firstDay 
					&& 1 <= parseInt(setting.firstDay) 
					&& 7 >= parseInt(setting.firstDay) ) ? setting.firstDay : 1;														//矫正firstDay参数

				var dateTody = new Date();
				this.cdrToday = {
						year: dateTody.getFullYear(),
						month: dateTody.getMonth(),
						date: dateTody.getDate()
				};
												
				this.arrElement = [];
				this.arrTdHead = [];
				
				this.arrTd = [];
				this.arrDivTitle = [];
				this.arrSpanTool = [];
				this.arrDivList = [];
				this.arrUlItem = {};
												
				this.cdrBar = {
				    barObj: null,
				    barLeft: null,
				    barRight: null,
				    btToday: null,
				    btPrevious: null,
				    btNext: null,
				    spanTitle: null,
				    btFresh: null
				};
				
				this.headFnEvents = setting.headEvent;
				this.cellFnEvents = setting.cellEvent;
				
				this.cdrYear = setting.year ? setting.year : this.cdrToday.year;					//默认加载当前年月的日历
				this.cdrMonth = setting.month ? setting.month-1 : this.cdrToday.month;

				this.initElement( this.cdrYear, this.cdrMonth );
				this.create(); 
			},
			
			
			/**初始化元素数据
			*/
			initElement: function( year, month ){
				 var cdrToday = this.cdrToday,
						arrElement = this.arrElement,
						
    				dateTody = new Date( year, month ), 
						daysCount = daLunar.solarDays( dateTody ),
						firstDay = daLunar.firstDayForMonth( dateTody ),
						
						daLunarObj = null,
   					n = 0,										//
   					firstLM = 0,							//第一个农历月( 因为一个国历月可能跨 两个农历月 )
   					lDay = 1,
   					lmonthLastDay = 0,
   					lDPOS = new Array(3);			//
						
				 this.monthFirstDay = firstDay;			//缓存该月第一天的星期值
				
			   for( var i=0; i<daysCount; i++ ) {
		      	if( lDay > lmonthLastDay) {
								daLunarObj = daLunar( new Date( year, month, i+1 ) );     //农历对象
								lDay = daLunarObj.day;
        				lmonthLastDay = daLunarObj.isLeap ? daLunarObj.leapDaysCount() : daLunarObj.monthDays();			//农历当月最後一天
        				
		         		if( n == 0 ) firstLM = daLunarObj.month;
		        		lDPOS[ n++ ] = i - lDay + 1;										 //国历日 - 农历日 +1
		      	}

						//日历属性 结构体缓存
			      arrElement[i] = new dayElement(
								year,																					//国历日期
								month,
								i+1, 																	
								daLunar.nStr1[ ( i + firstDay ) % 7 ],				//星期
								
								daLunarObj.year,															//农历日期
								daLunarObj.month, 
								daLunarObj.lunarDay( lDay++ ),
								daLunarObj.isLeap,														//农历是否是闰月
								
								daLunarObj.cyclical( daLunarObj.yearCyl ),		//农历干支日期
								daLunarObj.cyclical( daLunarObj.monCyl ),
								daLunarObj.cyclical( daLunarObj.dayCyl++ )
						);
						
			      if( 0 == (i + firstDay)%7 ) arrElement[i].color = this.cdrColor.red;  					//周日颜色
			      if( 13 == (i + firstDay)%14 ) arrElement[i].color = this.cdrColor.green;  			//周休二日颜色
			      
				 };
			   
			   //今日
			   if( year == cdrToday.year && month == cdrToday.month ){
			   		arrElement[ cdrToday.date - 1 ].isToday = true;
			   		
			   }
			   
			   
			   /** 节日和农历节气的计算 **/
			   //节气
			   tmp1 = daLunar.sTerm( year, month * 2  ) - 1;
			   tmp2 = daLunar.sTerm( year, month * 2 + 1 ) - 1;
			   arrElement[ tmp1 ].solarTerms = daLunar.solarTerm[ month*2 ];
			   arrElement[ tmp2 ].solarTerms = daLunar.solarTerm[ month*2+1 ];
			   if( 3 == month ) arrElement[ tmp1 ].color = this.cdrColor.black; 						//清明节颜色
			
			   //国历节日
			   for( var i=0,len=daLunar.sFtv.length; i<len; i++ ){
			      if( daLunar.sFtv[ i ].match( /^(\d{2})(\d{2})([\s\*])(.+)$/ ) ){					//格式  0101*元旦节
			         if( Number( RegExp.$1 ) == ( month + 1 )) {																			//判断是否是当前月( 01 == RegExp.$1 )
			            arrElement[ Number( RegExp.$2 ) - 1 ].solarFestival += RegExp.$4 + ' ';				//如果
			            if( RegExp.$3 == '*' )
			            		arrElement[ Number( RegExp.$2 ) - 1 ].color = this.cdrColor.red;					//如果有*表示放假日
			         }
			       }
				 }
				
				//农历节日
				for( var i=0,len=daLunar.lFtv.length; i<len; i++ ){
				  if( daLunar.lFtv[ i ].match( /^(\d{2})(.{2})([\s\*])(.+)$/ ) ) {						//格式 0626*火把节
				     tmp1 = Number( RegExp.$1 ) - firstLM;
				     
				     if( -11 == tmp1 ) tmp1 = 1;
				     
				     if( tmp1 >= 0 && tmp1 < n ) {
				        tmp2 = lDPOS[ tmp1 ] + Number( RegExp.$2 ) -1;
				        
				        if( tmp2 >= 0 && tmp2 < arrElement.length ) {
				           arrElement[ tmp2 ].lunarFestival += RegExp.$4 + ' ';
				           if( RegExp.$3 == '*' )
				           		arrElement[ tmp2 ].color = this.cdrColor.red;
				        }
				        
				     }
				  }
				}
			   
				//当月 周节日
				for( var i=0,len=daLunar.wFtv.length; i<len; i++ ){
				  if( daLunar.wFtv[ i ].match( /^(\d{2})(\d)(\d)([\s\*])(.+)$/)  ){						//格式 0520 母亲节
				     if( Number( RegExp.$1 ) == ( month + 1 ) ) {						//判断是否是当前月( 05 == RegExp.$1 )
				        tmp1 = Number( RegExp.$2 );													//第几个星期( 2 == RegExp.$2 )
				        tmp2 = Number( RegExp.$3 );													//星期几( 星期日 == 0 == RegExp.$3 )												
				        arrElement[( ( firstDay > tmp2 ) ? 7 : 0 ) + 7 * ( tmp1 - 1) + tmp2 - firstDay ].solarFestival += RegExp.$5 + ' ';
				        
				     }
				   }
				}
			
			   //黑色星期五
			   if( ( firstDay + 12 ) % 7 == 5 )												//十三日又恰逢星期五
			      arrElement[ 12 ].solarFestival += '黑色星期五 ';
			
				 /** 节日和农历节气的计算 **/
   			
			},
			
			/**创建dom对象
			*/
			create: function(){
				if( this.setting.isSelector )
					this.createCnt();
					
				this.createToolBar();						//先绘制工具条
				this.createElements( );					//绘制日历
				this.resize();									//调整尺寸
				this.bindEvent( );							//绑定事件
			},
			
			/**创建容器面板（时间选择器）
			*/
			createCnt: function(){
				var cnt = doc.createElement("div");
				cnt.className = [ this.setting.css.cnt, this.setting.css.shadow ].join(" ");
				cnt.style.cssText = "position:absolute;left:0px;top:0px";
				this.cdrCntObj = cnt;
				this.cdrParentObj.insertBefore( cnt );
				da( cnt ).width( this.setting.width );
				da( cnt ).height( this.setting.height );

				if( this.cdrTargetObj )
					this.setPos( this.cdrTargetObj );
				else
					this.setPos( this.setting.top, this.setting.left );
			},
			
			//绘制日历顶端工具条
			/*
			*/
			createToolBar: function( ){
				var cdrBar = this.cdrBar,
					cdrToday = this.cdrToday,
					arrElement = this.arrElement;
				  		
			    cdrBar.barObj = doc.createElement( "div" );
			    cdrBar.barLeft = doc.createElement( "div" );
			    cdrBar.barRight = doc.createElement( "div" );
			    cdrBar.btToday = doc.createElement( "a" );
			    cdrBar.btPrevious = doc.createElement( "a" );
			    cdrBar.btNext = doc.createElement( "a" );
			    cdrBar.btFresh = doc.createElement( "a" );
				
				cdrBar.barObj.className = this.setting.css.bar;
				cdrBar.barLeft.className = this.setting.css.barLeft;
				cdrBar.barRight.className = this.setting.css.barRight;
				if( this.setting.isSelector ){
					cdrBar.btMonth = doc.createElement( "select" );
					cdrBar.btYear = doc.createElement( "select" );
					
					cdrBar.btToday.className = this.setting.css.barToday_slt;
					cdrBar.btPrevious.className = this.setting.css.barPrevious_slt;
					cdrBar.btNext.className = this.setting.css.barNext_slt;
				}
				else{
					cdrBar.spanTitle = doc.createElement( "span" );
					cdrBar.spanTitle.className = this.setting.css.barTitle;
					
					cdrBar.btToday.className = this.setting.css.barToday;
					cdrBar.btPrevious.className = this.setting.css.barPrevious;
					cdrBar.btNext.className = this.setting.css.barNext;
					cdrBar.btFresh.className = this.setting.css.barBt;
				}
				
				cdrBar.btToday.href = "javascript:void(0);";
				cdrBar.barLeft.insertBefore( cdrBar.btToday );
				
				cdrBar.btPrevious.href = "javascript:void(0);";
				cdrBar.barLeft.insertBefore( cdrBar.btPrevious );
				
				if( this.setting.isSelector ){
						var option;
						for(var i=-10; i<=10; i++){
							option = doc.createElement("option");
							option.innerHTML = option.value = parseInt(this.cdrYear)+i;
							cdrBar.btYear.insertBefore( option );
						}
						cdrBar.barLeft.insertBefore( cdrBar.btYear );
						cdrBar.btYear.value = this.cdrYear;
						
						for(var i=1; i<=12; i++){
							option = doc.createElement("option");
							option.innerHTML = option.value = i;
							cdrBar.btMonth.insertBefore( option );
						}
						cdrBar.barLeft.insertBefore( cdrBar.btMonth );
						cdrBar.btMonth.value = this.cdrMonth+1;
						
						// cdrBar.spanTitle.innerHTML = [
								// this.cdrYear, "-",
								// fillZero( this.cdrMonth+1, 2 )
						// ].join("");
						// cdrBar.barLeft.insertBefore( cdrBar.spanTitle );
				
						cdrBar.btNext.href = "javascript:void(0);";
						cdrBar.barLeft.insertBefore( cdrBar.btNext );
				}
				else{
						cdrBar.btNext.href = "javascript:void(0);";
						cdrBar.barLeft.insertBefore( cdrBar.btNext );
						
						cdrBar.spanTitle.innerHTML = [
								"当前日历：",
								this.cdrYear, "年",
								this.cdrMonth+1,"月"
								//cdrToday.date,
								//"&nbsp;&nbsp;农历",
								//daLunar.nStr1[ arrElement[ cdrToday.date - 1 ].lMonth ],"月&nbsp;",
						].join("");
						cdrBar.barLeft.insertBefore( cdrBar.spanTitle );
				
						cdrBar.btFresh.innerHTML = "刷新";
				}

				cdrBar.btFresh.href = "javascript:void(0);";
				cdrBar.barRight.insertBefore( cdrBar.btFresh );
				
				
				cdrBar.barObj.insertBefore( cdrBar.barLeft );
				cdrBar.barObj.insertBefore( cdrBar.barRight );
				
				
				this.setting.isSelector 
				? this.cdrCntObj.insertBefore( cdrBar.barObj ) 
				: this.cdrParentObj.insertBefore( cdrBar.barObj );
			},
			
			//绘制日历单元格
			/*
			*/
			createElements: function( ){
				var arrTdHead = this.arrTdHead,
					arrTd = this.arrTd,
					arrDivTitle = this.arrDivTitle,
					arrSpanTool = this.arrSpanTool,
					arrDivList = this.arrDivList,
					arrElement = this.arrElement,
					tools = this.setting.tools,
					tbObj = doc.createElement( "table" ),
					tbodyObj = doc.createElement( "tbody" ),
					maxElements = 42,			//(29 < arrElement.length) ? 42 : 35,				//当前月所需最大日历单元格个数
					trTmp, tdTmp, titleTmp, toolTmp, listTmp;

				tbObj.cellSpacing = 0;
				tbObj.cellPadding = 0;
				tbObj.insertBefore( tbodyObj );
				tbObj.className = this.setting.css.daCalendar;
				
				this.cdrObj = tbObj;
				this.setting.isSelector 
				? this.cdrCntObj.insertBefore( tbObj ) 
				: this.cdrParentObj.insertBefore( tbObj );
				
				var  monthFirstDay = this.monthFirstDay,					//当月第一天的星期值
						 cdrFirstDay = this.cdrFirstDay,							//日历的起始星期值
						 daysCount = arrElement.length,								//这个月的总天数
						 idx = 0;
						 cnDay = "";																	//星期中文值

				var  startEmptyDay = monthFirstDay - cdrFirstDay;									//日历开头空白的几天
				startEmptyDay = startEmptyDay >= 0 ? startEmptyDay : startEmptyDay+7;
				
				trTmp = doc.createElement( "tr" );
				trTmp.className = this.setting.css.head;							//日历表头
				tbodyObj.insertBefore( trTmp );
				
				for( var i=0; i<7; i++ ){
					tdTmp = doc.createElement( "td" );						//创建日历属性单元格
					
					cnDay = daLunar.nStr1[ ( i + cdrFirstDay ) % 7 ];
					tdTmp.innerHTML = this.setting.isSelector ? cnDay : "周" + cnDay;		//如果
					if( "日" === cnDay || "六" === cnDay )
						tdTmp.className = "tdr tdb weekend";
					else
						tdTmp.className = "tdr tdb";
					
					arrTdHead.push( tdTmp );
					trTmp.insertBefore( tdTmp );
				}
				
				for( var i=0,w=0; i<maxElements; i++,w++ ){			//循环日历所有元素框格
					w = w>6 ? 0 : w;															//一周逐日递加,大于6归零
					
					if( 0 == w ){																	//一周一行
						trTmp = doc.createElement( "tr" );
						trTmp.className = this.setting.css.date;
						tbodyObj.insertBefore( trTmp );
						
					}

					tdTmp = doc.createElement( "td" );						//创建日历属性单元格
					tdTmp.className = "tdr tdb";
					
					cnDay = daLunar.nStr1[ ( i + cdrFirstDay ) % 7 ];
					if( "日" === cnDay || "六" === cnDay ) 
						tdTmp.className = "tdr tdb weekend";
					
					titleTmp = doc.createElement( "div" );
					listTmp = doc.createElement( "div" );
					titleTmp.className = this.setting.css.datetitle;
					listTmp.className = this.setting.css.datelist;

					if( ( 0 >= startEmptyDay ) && (idx < daysCount) ){						//有效日历单元格的处理
							tdTmp.id = this.getTdId( arrElement[ idx ].sDay );
							tdTmp.setAttribute( "elementIndex", idx );
							if( arrElement[ idx ].isToday )
								tdTmp.className = tdTmp.className + " today";
							
							if( this.setting.isSelector ){																		//日期选择器
								tdTmp.innerHTML = arrElement[ idx ].sDay;
								tdTmp.style.cssText = "line-height:22px; text-align:center; font-weight:bold; ";
								
							}
							else{																															//日历控件
								titleTmp.innerHTML = [ 
										'<div class="tool" ></div>',
										'<span>', arrElement[ idx ].sDay, '</span>', 
										'<span style="color:#ff9933;">', arrElement[ idx ].lunarFestival, '</span>', 
										'<span style="color:#ff9933;">', arrElement[ idx ].solarFestival, '</span>', 
										'<span style="color:#909090;">', arrElement[ idx ].solarTerms, '</span>',
										'<span>', arrElement[ idx ].lDay, '</span>', 
								].join(" ");
										
								//最加自定义工具条代码
								if( titleTmp.children[0] && ("tool" == titleTmp.children[0].className) && tools)
									titleTmp.children[0].innerHTML = tools;
								
								arrDivTitle.push( titleTmp );						//DOM对象缓存
								arrDivList.push( listTmp );
							
							}
							
							arrTd.push( tdTmp );
							
							idx++;	//arrElement日历属性列表索引号++
					}
					else{
						if( 0 < startEmptyDay ) 
							startEmptyDay--;
						tdTmp.className = "tdr tdb no";
					}
					
					if( !this.setting.isSelector ){																		//非日期选择器
						tdTmp.insertBefore( titleTmp );
						tdTmp.insertBefore( listTmp );
					}
					trTmp.insertBefore( tdTmp );
					
				}
			},

			/**事件绑定函数
			*/
			bindEvent: function( ){
					var context = this,
						headFnEvents = this.headFnEvents,
						cellFnEvents = this.cellFnEvents,
						dateTmp = null,
						cdrObjTmp = null;
					
					da( this.arrTdHead ).bind( headFnEvents );		//日历头 绑定自定义事件函数
					da( this.arrTd ).bind( cellFnEvents );				//日历单元格 绑定自定义事件函数
					
					da( this.cdrBar.btToday ).bind( "click", function( evt ){													//“今天”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickToday )
							res = context.setting.clickToday.call( context );
						
						if( false !== res ){
							context.setting.year = null;
							context.setting.month = null;
							context.refresh();
						}
						
					});
					
					da( this.cdrBar.btYear ).bind( "change", function( evt ){												//“年份”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickYear ) 
							res = context.setting.clickYear.call( context );
							
						if( false !== res ){
							context.setting.year = context.cdrBar.btYear.value;
							context.setting.month = context.cdrBar.btMonth.value;
							context.refresh();
						}
					});
					
					da( this.cdrBar.btMonth ).bind( "change", function( evt ){												//“月份”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickMonth ) 
							res = context.setting.clickMonth.call( context );
							
						if( false !== res ){
							context.setting.year = context.cdrBar.btYear.value;
							context.setting.month = context.cdrBar.btMonth.value;
							context.refresh();
						}
					});
					
					da( this.cdrBar.btPrevious ).bind( "click", function( evt ){											//“上一月”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickPrev ) 
							res = context.setting.clickPrev.call( context );
							
						if( false !== res ){
							dateTmp = new Date( context.cdrYear, context.cdrMonth );
							dateTmp = da.dateAdd( dateTmp, -1, "M" );
							
							context.setting.year = dateTmp.getFullYear();
							context.setting.month = dateTmp.getMonth()+1;
							context.refresh();
						}
					});
					
					da( this.cdrBar.btNext ).bind( "click", function( evt ){													//“下一月”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickNext ) 
							res = context.setting.clickNext.call( context );
							
						if( false !== res ){
							dateTmp = new Date( context.cdrYear, context.cdrMonth );
							dateTmp = da.dateAdd( dateTmp, 1, "M" );
							
							context.setting.year = dateTmp.getFullYear();
							context.setting.month = dateTmp.getMonth()+1;
							context.refresh();
						}
					
					});
					
					da( this.cdrBar.btFresh ).bind( "click", function( evt ){													//“刷新”按钮自定义事件函数
						var res = true;
						if( null != context.setting.clickRefresh )
							res = context.setting.clickRefresh.call( context );
							
						if( false !== res ){
							context.refresh();
						}
						
					});
					
//					da.eventBind( this.arrDivTitle, {"mouseover":function( evt ){											//鼠标移上，查看详细日期信息
//						//
//					}}, false );
					
//					//窗口变化事件
//					da.eventBind( win, { "resize": function(){
//						setTimeout( function(){ daCalendar.resize( context )},13);
//						
//					}}, false );
					
					//鼠标焦点事件
					da( this.arrTd ).bind( "mouseover", function( evt ){															//鼠标移上高亮
						this.className = ( -1 < this.className.indexOf( context.setting.css.focus ) ) 
						? this.className 
						: this.className + context.setting.css.focus;
					}).bind( "mouseout", function( evt ){																							//鼠标移出解除高亮
						this.className = ( -1 < this.className.indexOf( context.setting.css.focus ) ) 
						? this.className.replace( context.setting.css.focus, "" ) 
						: this.className;
					});
			},
			
			/**获取日历单元格id
			*	nDate: 日期号数
			*/
			getTdId: function( nDate ){
				return [ "daCalendar_", this.cdrId, "#", this.cdrYear, "-", fillZero( (this.cdrMonth + 1).toString(), 2 ), "-", fillZero( nDate.toString(), 2 ) ].join("");
						
			},
			
			
			//获取日历单元格TD对象
			/*
				nDate: 日期号数
			*/
			getTd: function( nDate ){
				var objTd = da( "#"+ this.getTdId( nDate ) );
				if( 0 < objTd.length ) objTd = objTd.dom[0];
				if( !objTd || ("date" != objTd.className && "TD" != objTd.nodeName ) ) return null;
				
				return objTd;
				
			},
			
			//获取指定天数内得TD对象
			/*
				nDate:日期号数,dateLength:天数
			*/
			getTdDate: function( nDate,dateLength ){
				var objTds=[];
				for( var i=0; i<dateLength; i++ ) {
					var objTd = this.getTd( nDate );
					if( !objTd ) continue;
					
					objTds.push(objTd);
					++nDate;
				}
				return objTds;
			},
			
			
			/**获取TD对象的日期信息
			* params {DOM} tdObj 日历单元格TD对象
			*/
			getDate: function( tdObj ){
				var idx = tdObj.getAttribute( "elementIndex" );
				return this.arrElement[ idx ] || null;
			},
			
			//通过日期 或日历单元格TD对象找到对应的控件集合
			/*
				obj: 日期 或日历单元格TD对象
			*/
			getControls: function( obj ){
				var arrControls = {};
				
				if( "string" === typeof obj ){
					obj = getTd( obj );
				}
				
				if( obj.nodeName && "TD" == obj.nodeName ){									//用da.isNodeName( obj, "td" )更合理
					arrControls.tools = obj.children[0].children[0].children;
					arrControls.date = obj.children[0].children[1];
					arrControls.lunarFestival = obj.children[0].children[2];
					arrControls.solarFestival = obj.children[0].children[3];
					arrControls.solarTerms = obj.children[0].children[4];
				}

				return arrControls;
			},
			
			//添加子项
			/*
				nId: 日程子项id值
				nDate: 日期号数
				sGroup: 分组名
				sTitle: 标题内容
				bColor: 子项风格颜色
				itemFnEvents: 日程子项事件集合
			*/
			addItem: function(nId, nDate, sGroup, sTitle, bColor, itemFnEvents, remain){
				if( undefined == nDate || undefined == nId) return;
				remain = remain || "";

				var objTd = this.getTd( nDate );
				if( null == objTd ) return;

				var objList = objTd.children[1],
				    arrUlItem = this.arrUlItem;
				    sGroup = sGroup || "daCanlendarItems";
				
				var ulTmp = doc.createElement("ul");
				ulTmp.id = nId;
				ulTmp.style.position="relative";
				ulTmp.className = "item";
				ulTmp.title = remain;
				
				if( bColor ) ulTmp.style.backgroundColor = bColor;
				ulTmp.innerHTML = sTitle;
				objList.insertBefore( ulTmp );
				
				if( !arrUlItem[ sGroup ] ) arrUlItem[ sGroup ] = [];        //将ul子项对象缓存，方便显示管理
				arrUlItem[ sGroup ].push( ulTmp );
				
				da(ulTmp).bind( itemFnEvents );															//日历单元格日程子项 绑定自定义事件函数
			},
			
			
			/**清除单元格子项
			* nDate: 日期号数
			*/
			clearItems: function( nDate ){
				if( undefined == nDate ) return;
				
				var objTd = this.getTd( nDate );
				if( null == objTd ) return;
				
				var objList = objTd.children[1];
				objList.innerHTML = "";
				
			},
			
			/**移除
			*/
			remove: function(){
				if( this.setting.isSelector )
					da( this.cdrCntObj ).remove();
				else{
					da( this.cdrBar.barObj ).remove();
					da( this.cdrObj ).remove();
				}
			},
			
			/**刷新
			*/
			refresh:function(){
				this.remove();
				this.init( this.setting );
			},
			
			/**重置daCalendar尺寸
			*/
			resize: function(){
				var da_parent = da( this.setting.isSelector ? this.cdrCntObj : this.cdrParentObj ),
						pWidth = da_parent.width(),
						pHeight = da_parent.height(),
						w, h;
				
				w = da.browser.ie ? pWidth - 14 : pWidth - 4;				//还要减去border和padding, 注：IE在<!DOCTYPE>标准下的filter阴影特效也算在宽度内
				h = da.browser.ie ? pHeight - 35 : pHeight - 18;
				
				da( this.cdrObj ).width( w );
				da( this.cdrObj ).height( h );
				
			},
			
			/**设置daCalendar对象的位置（日期选择器）
			* params {DOM|Int|String} nTop 列表对象的top值；也可以是某一个DOM对象
			* params {Int|String} nLeft 列表对象的left值
			*/
			setPos: function( nTop, nLeft ){
				if( nTop && nTop.nodeType ){
					var daTarget = da( nTop ),
							pos = daTarget.offset(),
							oldDisplay = da( this.cdrCntObj ).css( "display" );
					
					if( "none" === oldDisplay ) this.cdrCntObj.style.display = "block";
					
					if( da.browser.ie ){																					//校正list面板的位置
						if( da(win).height()/2 < pos.top )
							pos.top = pos.top - da( this.cdrCntObj ).height() + 2;
						else
							pos.top = pos.top+ daTarget.height() -2;
							
						if( da(win).width()/2 < pos.left )
							pos.left = pos.left - ( da( this.cdrCntObj ).width() - daTarget.width())+4;
						else
							pos.left -= 5;
							
					}
					else{
						if( da(win).height()/2 < pos.top )
							pos.top = pos.top - da( this.cdrCntObj ).height() -2;
						else
							pos.top = pos.top+ daTarget.height()+1;
						
						if( da(win).width()/2 < pos.left )
							pos.left = pos.left - ( da( this.cdrCntObj ).width() - daTarget.width());
							
					}
					
					this.setting.top = pos.top;
					this.setting.left = pos.left;
				}
				else{
					this.setting.top = nTop || this.setting.top;
					this.setting.left = nLeft || this.setting.left;
					
				}
				
				da( this.cdrCntObj ).css({
					top: this.setting.top,
					left: this.setting.left
				});
				
				da( this.cdrCntObj ).css( "display", oldDisplay );
				
			},
				
			//显示列表
			/*
			*/
			show: function(){
				if( "block" === this.cdrCntObj.style.display ) return;
				
				if( "undefined" === typeof daFx ){
					this.cdrCntObj.style.display = "block";
				}
				else{
					da( this.cdrCntObj ).slideDown(300);
					
				}
				
			},
			
			/**隐藏列表
			* params {boolean} isForce 是否不需要验证daList当前值，直接关闭
			*/
			hide: function( isForce ){
				if( "none" === this.cdrCntObj.style.display ) return;
				
				if( "undefined" === typeof daFx || isForce ){
					this.cdrCntObj.style.display = "none";
				}
				else{
					da( this.cdrCntObj ).slideUp(150);
				}
			}
			
	};
	
	
	//对象继承da类属性
	daCalendar.fnStruct.init.prototype = daCalendar.prototype;
	
	
	//全局变量
	win.daCalendar = daCalendar;
	

} )( window );



/*
	author:	danny.xu
	date:	2011-2-12
	description:	阴历计算操作类
*/
( function( win ){
	
	var daLunar = function( dateObj ){
		return new daLunar.fnStruct.init( dateObj );
	};
	
	daLunar.fnStruct = daLunar.prototype = {
		nowYear: 0,				//当前国历年
		nowMonth: 0,			//当前国历月
		nowDate: 0,				//当前国历日
		
		year: -1,						//农历年
		month: -1,					//农历月
		day: -1,						//农历日
		
		isLeap: false,		//是否有闰月
		
		yearCyl: -1,				//干支年
		monCyl: -1,					//干支月
		dayCyl: -1,					//干支日
		
		init: function( dateObj ){
				var nowObj = new Date();
				this.nowYear = nowObj.getFullYear(); 
				this.nowMonth = nowObj.getMonth(); 
				this.nowDate = nowObj.getDate(); 
			
        var i, leap = 0, temp = 0,
            baseDate = new Date(1900, 0, 31),														//公历农历对照表 第一项0x04bd8是1900年的对照数据
            offsetDay = parseInt( (dateObj - baseDate) / 86400000 );		//计算出两个日期的天数差 86400000 = 1000*60*60*24 (一天的时差),取整排除时分秒对数灸影响
				
        this.dayCyl = offsetDay + 40;
        this.monCyl = 14;

        for (i = 1900; i < 2050 && offsetDay > 0; i++) {
            temp = this.lunarYearDaysCount( i );						//计算出当年农历年总天数
            offsetDay -= temp;
            this.monCyl += 12;
        }
        if (offsetDay < 0) {
            offsetDay += temp;
            i--;
            this.monCyl -= 12;
        }

        this.year = i;
        this.yearCyl = i - 1864;

        leap = this.leapMonth(i);				//闰哪个月
        this.isLeap = false;
				
        for (i = 1; i < 13 && offsetDay > 0; i++) {
            //闰月
            if (leap > 0 && i == (leap + 1) && this.isLeap == false) {--i;
                this.isLeap = true;
                temp = this.leapDaysCount(this.year);
            } else {
                temp = this.monthDays(this.year, i);
            }

            //解除闰月
            if (this.isLeap == true && i == (leap + 1)) this.isLeap = false;

            offsetDay -= temp;
            if (this.isLeap == false) this.monCyl++;
        }

        if (offsetDay == 0 && leap > 0 && i == leap + 1) if (this.isLeap) {
            this.isLeap = false;
        } else {
            this.isLeap = true; --i; --this.monCyl;
        }

        if (offsetDay < 0) {
            offsetDay += temp; --i; --this.monCyl;
        }

        this.month = i;
        this.day = offsetDay + 1;
		},
		//获得农历 y年m月的总天数
    monthDays: function(year, month) {
    		year = year || this.year;
    		month = month || this.month;
        return ((daLunar.arrLunar[year - 1900] & (0x10000 >> month)) ? 30 : 29);
    },
    
    //获得农历 year年闰哪个月(1-12), 没闰传回 0
    leapMonth: function( year ) {
    		year = year || this.year;
        return ( daLunar.arrLunar[ year - 1900 ] & 0xf );						//通过和1111&计算(高位没有自然为0),获得闰月月份值
    },
		
    //获得农历year年闰月的天数
    leapDaysCount: function( year ) {
    		year = year || this.year;
        if ( this.leapMonth( year ) )
        	return ( ( daLunar.arrLunar[ year - 1900 ] & 0x10000 ) ? 30 : 29 );			//判断闰月是大月还是小月
        else
        	return (0);
    },
		
		//获得农历 year年的总天数
    lunarYearDaysCount: function( year ) {
        var i, sum = 348;												//在无大月的情况下一年只有348天,348 = 29 * 12
    		year = year || this.year;
    		
        for ( i = 0x8000; i > 0x8; i >>= 1 )   											//二进制 1000 0000 0000 0000向右逐位移动,高位自动补0,直到最后4位 1000( 最后四位是闰月数据 )
        	sum += ( daLunar.arrLunar[ year - 1900 ] & i ) ? 1 : 0;		//从农历年对照表通过&计算农历年大月位,更新农历年全年天数
        
        return (sum + this.leapDaysCount( year ));									//如果有闰月，还要加上闰月的天数
    },
    
		//获得干支, 0=甲子
		cyclical: function( num ) {
		   return ( daLunar.arrTiangan[ num % 10 ] + daLunar.arrDizhi[ num % 12 ] );
		},
    
		//农历月
    lunarMonth: function() {
    		var m = this.month,
            s;
            
        if (m > 10) {
            s = '十' + daLunar.nStr1[m - 10]
        } else {
            s = daLunar.nStr1[m]
        }
        s += '月';
        return (s);
    		
    },
    
		//农历日
    lunarDay: function( d ) {
		   var d = d || this.day,
		   		 s;
    			 
		   switch (d) {
		      case 10:
		         s = '初十'; break;
		      case 20:
		         s = '二十'; break;
		         break;
		      case 30:
		         s = '叁十'; break;
		         break;
		      default :
		         s = daLunar.nStr2[ Math.floor( d / 10 ) ];
		         s += daLunar.nStr1[ d % 10 ];
		   }
		   return(s);
		}
    
	};

	//对象继承da类属性
	daLunar.fnStruct.init.prototype = daLunar.prototype;
	
	
	//全局变量
	win.daLunar = daLunar;
	
	//某年的第n个节气为几日(从0小寒起算)
	daLunar.sTerm = function(y,n) {
	   var offDate = new Date( ( 31556925974.7 * ( y-1900 ) + daLunar.sTermInfo[ n ] * 60000  ) + Date.UTC( 1900 , 0 , 6 , 2, 5 ) );
	   return offDate.getUTCDate();
	};
	
	//获得国历date月第一天的周值(0~6 周日到周六)
	daLunar.firstDayForMonth = function( date ){
		return ( new Date(date.getFullYear(), date.getMonth(), 1) ).getDay();
	};
	
	//获得国历date月的天数
	daLunar.solarDays = function( date ) {
		 var year = date.getFullYear(),
		 		 month = date.getMonth();
		 
	   if( 1 == month )						//月的索引号1代表二月
	      return( (( year%4 == 0 ) && ( year%100 != 0 ) || ( year%400 == 0 ))? 29: 28 );
	   else
	      return( daLunar.solarMonth[ month ] );
	};
	
	daLunar.arrLunar = new Array(
		0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
		0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
		0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
		0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
		0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
		0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
		0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
		0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
		0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
		0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
		0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
		0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
		0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
		0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
		0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0),		//农历年对照表( 每个数字20bit，前5~16bit表示农历每月是否大月，1表示大月，30天，0表示小月，29天。前4bit表示是否有闰月和闰哪个月,最后4bit表示闰月是否是大月,1表示大月; 如：0x04bd8 = 0000 10010111101 1000；前4位"1000"代表润8月，最高4位"0000"表示润8月为小月29天)
	
	daLunar.sTermInfo = new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,
		195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,
		462224,483532,504758);																															//节气对照表

	daLunar.arrAnimals = new Array("鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪");				//12生肖
	daLunar.arrTiangan = new Array("甲","乙","丙","丁","戊","己","庚","辛","壬","癸");									//10天干
	daLunar.arrDizhi = new Array("子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥");					//12地支
	
	daLunar.solarMonth = new Array( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );										//国历大小月对照表
	daLunar.solarTerm = new Array("小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨",
		"立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降",
		"立冬","小雪","大雪","冬至");																																			//节气
	daLunar.nStr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');				//农历中文日个位
	daLunar.nStr2 = new Array('初', '十', '廿', '卅', '　');																						//农历中文日十位
  
	daLunar.sFtv = new Array(
	"0101*元旦节","0214 情人节","0305 学雷锋纪念日","0308 妇女节","0312 植树节","0314 白色情人节","0315 消费者权益日",
	"0401 愚人节","0407 世界卫生日","0422 世界地球日","0501*劳动节","0502*劳动节","0503*劳动节",
	"0504 青年节","0508 世界红十字日","0512 国际护士节","0515 国际家庭日","0517 国际电信日","0601 国际儿童节",
	"0605 世界环境保护日","0606 全国爱眼日","0625 全国土地日","0626 国际禁毒日","0701 香港回归纪念日 建党节",
	"0707 抗日战争纪念日","0801 建军节","0815 抗日战争胜利纪念","0909 毛泽东逝世纪念","0908 国际扫盲日",
	"0910 中国教师节", "0927 世界旅游日","0928 孔子诞辰","1001*国庆节","1002*国庆节","1003*国庆节",
	"1006 老人节","1009 世界邮政日","1014 世界标准日","1016 世界粮食日","1024 联合国日","1120*彝族年",
	"1121*彝族年","1122*彝族年","1112 孙中山诞辰纪念","1205 国际志愿人员日","1220 澳门回归纪念","1225 圣诞节",
	"1226 毛泽东诞辰纪念");																																							//国历节日 *表示放假日

	daLunar.lFtv = new Array( "0101*春节", "0102*春节", "0103*春节", "0115 元宵节", "0505 端午节",
		"0624*火把节", "0625*火把节", "0626*火把节", "0707 七夕情人节", "0715 中元节", "0815 中秋节",
		"0909 重阳节", "1208 腊八节", "1224 小年", "0100 除夕");																					//农历节日 *表示放假日
	
	daLunar.wFtv = new Array( "0520 母亲节", "0630 父亲节", "0730 被奴役国家周", "1144 Thanksgiving感恩节" );		//某月的第几个星期几

} )( window );








//var dateTmp = new Date(),strTmp = [];
//for(var i=1;i<32;i++){
//	dateTmp = new Date(dateTmp.getFullYear(), dateTmp.getMonth(), i, dateTmp.getHours());
//	strTmp.push( dateTmp.format("yyyy-MM-dd")+": "+daLunar( dateTmp ).lunarDay() );
//}
//alert( strTmp.join("\n") );