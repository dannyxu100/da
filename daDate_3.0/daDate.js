
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


/*
	author:	danny.xu
	date: 2012-5-12
	description: daDate 3.1.1 工作计划日历插件
*/
( function( win ){
	var doc = win.document;

	/********** 日历属性结构体 ***********/
	function dayElement( sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay ){
		this.isToday = false;			//是否是当日
		this.color = '';				//日历背景色
		
		this.sYear = sYear;				//国历年
		this.sMonth = sMonth;			//国历月
		this.sDay = sDay;				//国历日
		this.week = week;				//国历星期

		this.date = new Date( sYear, sMonth, sDay );
		
		this.lYear = lYear;				//农历年
		this.lMonth = lMonth;			//农历月
		this.lDay = lDay;					//农历日
		this.isLeap = isLeap;			//是否闰月

		this.cYear = cYear;				//干支年
		this.cMonth = cMonth;			//干支月
		this.cDay = cDay;				//干支日
		
		this.lunarFestival = ''; 	//农历节日
		this.solarFestival = ''; 	//国历节日
		this.solarTerms = ''; 		//节气
			
	};

	/**构造函数
	*/
	var daDate = function( setting ){
			return new daDate.fnStruct.init( setting );
	};
	
	daDate.fnStruct = daDate.prototype = {
		version: "daDate( 3.1.1 ); author:danny.xu; date:2012-5-12",

		id: 0,						//唯一序列号
		parentObj: null,				//日历容器DOM对象
		targetObj: null,				//时间选择器目标对象
		cntObj: null,				//时间选择器容器对象
		tableObj: null,					//日历table对象
		
		headObj: null,					//日历顶端的工具条
		
		setting: {
			id: "",
			target: "",
			parent: null,
			
			year: "",
			month: "",
			firstDay: 1,						//起始日默认为周一（0~6为周日~周六）
			
			count: 1,							//同时显示选择器个数
			top: 0,
			left: 0,
			width: 220,
			// height: 250,
			
			selectYearMonth: true,					//年份、月份可下拉选择
			
			css: {												//风格样式
				daDate: " daDate",
				box: "box",
				shadow: "daShadow",
				head: "trHead",
				date: "trDate",
				focus: "focus",
				
				headBar: "headBar",
				footBar: "footBar",
				barBt: "bt",
				barToday: "today",
				barPrev: "prev",
				barNext: "next",
				barTitle: "barTitle"
			},
			
			click: null,									//日期选中事件
			clickHead: null,								//日历头事件集合
			
			clickToday: null,
			clickPrev: null,
			clickNext: null,
			
			changeYear: null,
			changeMonth: null
		},
		
		firstDay: 1,										//起始日默认为周一（0~6为周日~周六）
		holidayColor: {										//节假日风格颜色
			red: "#f00",
			green: "#0f0",
			black: "#000"
		},
		today: null,										//当前客户端国历日期{year,month,date}
		year: 0,											//当前日历对应的年份
		month: 0,											//当前日历对应的月份
		
		monthFirstDay: null,								//日历当前月 第一天是星期几
		
		arrDays: null,										//日历单元格 国力农历数据结构体缓存
		arrTdHead: null,									//日历星期头
		arrTd: null,										//日历单元格
		
		
		/**初始化函数
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			var tmp = da( setting.parent );																																//保存daDate父节点DOM对象
			this.parentObj = 0<tmp.dom.length ? tmp.dom[0] : doc.body;
			
			tmp = da( setting.target );																																		//矫正target参数
			this.targetObj = 0 < tmp.dom.length ? tmp.dom[0] : null;
			
			if( setting.id )
				this.id = setting.id;
			else 
				//this.iId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daDate_" + this.id ) ) this.id++;						//保证id 唯一性
				
			
			setting.firstDay = ( setting.firstDay 
				&& 1 <= parseInt(setting.firstDay) 
				&& 7 >= parseInt(setting.firstDay) ) ? setting.firstDay : 1;										//矫正firstDay参数

			var dateTody = new Date();
			this.today = {
				year: dateTody.getFullYear(),
				month: dateTody.getMonth(),
				date: dateTody.getDate()
			};
											
			this.arrDays = [];
			this.arrTdHead = [];
			this.arrTd = [];
					
			this.headObj = {
				barObj: null,
				btToday: null,
				btPrev: null,
				btNext: null,
				spanTitle: null,
				sltYear: null,
				sltMonth: null
			};
			
			this.year = da.firstValue( setting.year, this.today.year );					//默认加载当前年月的日历
			this.month = da.firstValue( setting.month, this.today.month );

			this.create(); 
			
			// this.resize();							//调整尺寸
			this.bindEvent( );							//绑定事件
			
			if( this.targetObj )
				this.setPos( this.targetObj );
			else
				this.setPos( this.setting.top, this.setting.left );
			
			this.hide();
		},
		
		
		/**初始化元素数据
		*/
		getDays: function( year, month ){
			var today = this.today,
				arrDay = [],
				
				dateTody = new Date( year, month ), 
				daysCount = daLunar.solarDays( dateTody ),
				firstDay = daLunar.firstDayForMonth( dateTody ),
				
				daLunarObj = null,
				n = 0,								//
				firstLM = 0,						//第一个农历月( 因为一个国历月可能跨 两个农历月 )
				lDay = 1,
				lmonthLastDay = 0,
				lDPOS = new Array(3);				//
					
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
				arrDay[i] = new dayElement(
					year,											//国历日期
					month,
					i+1, 																	
					daLunar.nStr1[ ( i + firstDay ) % 7 ],			//星期
					
					daLunarObj.year,								//农历日期
					daLunarObj.month, 
					daLunarObj.lunarDay( lDay++ ),
					daLunarObj.isLeap,								//农历是否是闰月
					
					daLunarObj.cyclical( daLunarObj.yearCyl ),		//农历干支日期
					daLunarObj.cyclical( daLunarObj.monCyl ),
					daLunarObj.cyclical( daLunarObj.dayCyl++ )
				);
					
				if( 0 == (i + firstDay)%7 ) arrDay[i].color = this.holidayColor.red;  				//周日颜色
				if( 13 == (i + firstDay)%14 ) arrDay[i].color = this.holidayColor.green;  			//周休二日颜色

			 };
			
			//今日
			if( year == today.year && month == today.month ){
				arrDay[ today.date - 1 ].isToday = true;
				
			}
		   
		   
		   /** 节日和农历节气的计算 **/
		   //节气
		   tmp1 = daLunar.sTerm( year, month * 2  ) - 1;
		   tmp2 = daLunar.sTerm( year, month * 2 + 1 ) - 1;
		   arrDay[ tmp1 ].solarTerms = daLunar.solarTerm[ month*2 ];
		   arrDay[ tmp2 ].solarTerms = daLunar.solarTerm[ month*2+1 ];
		   if( 3 == month ) arrDay[ tmp1 ].color = this.holidayColor.black; 						//清明节颜色
		
		   //国历节日
		   for( var i=0,len=daLunar.sFtv.length; i<len; i++ ){
			  if( daLunar.sFtv[ i ].match( /^(\d{2})(\d{2})([\s\*])(.+)$/ ) ){					//格式  0101*元旦节
				 if( Number( RegExp.$1 ) == ( month + 1 )) {									//判断是否是当前月( 01 == RegExp.$1 )
					arrDay[ Number( RegExp.$2 ) - 1 ].solarFestival += RegExp.$4 + ' ';			//如果
					if( RegExp.$3 == '*' )
							arrDay[ Number( RegExp.$2 ) - 1 ].color = this.holidayColor.red;	//如果有*表示放假日
				 }
			   }
			 }
			
			//农历节日
			for( var i=0,len=daLunar.lFtv.length; i<len; i++ ){
			  if( daLunar.lFtv[ i ].match( /^(\d{2})(.{2})([\s\*])(.+)$/ ) ) {			//格式 0626*火把节
				 tmp1 = Number( RegExp.$1 ) - firstLM;
				 
				 if( -11 == tmp1 ) tmp1 = 1;
				 
				 if( tmp1 >= 0 && tmp1 < n ) {
					tmp2 = lDPOS[ tmp1 ] + Number( RegExp.$2 ) -1;
					
					if( tmp2 >= 0 && tmp2 < arrDay.length ) {
					   arrDay[ tmp2 ].lunarFestival += RegExp.$4 + ' ';
					   if( RegExp.$3 == '*' )
							arrDay[ tmp2 ].color = this.holidayColor.red;
					}
					
				 }
			  }
			}
		   
			//当月 周节日
			for( var i=0,len=daLunar.wFtv.length; i<len; i++ ){
			  if( daLunar.wFtv[ i ].match( /^(\d{2})(\d)(\d)([\s\*])(.+)$/)  ){			//格式 0520 母亲节
				 if( Number( RegExp.$1 ) == ( month + 1 ) ) {							//判断是否是当前月( 05 == RegExp.$1 )
					tmp1 = Number( RegExp.$2 );											//第几个星期( 2 == RegExp.$2 )
					tmp2 = Number( RegExp.$3 );											//星期几( 星期日 == 0 == RegExp.$3 )												
					arrDay[( ( firstDay > tmp2 ) ? 7 : 0 ) + 7 * ( tmp1 - 1) + tmp2 - firstDay ].solarFestival += RegExp.$5 + ' ';
					
				 }
			   }
			}
		
		   //黑色星期五
		   if( ( firstDay + 12 ) % 7 == 5 )												//十三日又恰逢星期五
			  arrDay[ 12 ].solarFestival += '黑色星期五 ';
		
			 /** 节日和农历节气的计算 **/
		
			return arrDay;
		},
		
		/**创建dom对象
		*/
		create: function(){
			this.createCnt();
			this.createBox();
			this.createFootBar();
			
		},
		
		/**创建容器面板（时间选择器）
		*/
		createCnt: function(){
			var container = doc.createElement("div");
			container.className = [ this.setting.css.daDate, this.setting.css.shadow ].join(" ");
			container.style.cssText = "position:absolute;left:0px;top:0px";
			this.cntObj = container;
			this.parentObj.insertBefore( container );
			da( container ).width( this.setting.width * this.setting.count + (da.browser.ie?2:0) );		//兼容IE,宽度边框计算在内(daDate样式设置了边框就要加上边框值,默认为"2")
			// da( container ).height( this.setting.height );
			
		},
		
		/**创建多时间选择器子盒
		*/
		createBox: function(){
			var arrDays = this.arrDays,
				orgSelectYearMonth = this.setting.selectYearMonth,
				boxObj;
			
			for( var idx=0; idx<this.setting.count; idx++ ){
				var date1 = new Date( this.year, this.month ),
					date2 = da.addDate( date1, idx, "M" ),
					year = date2.getFullYear(),
					month = date2.getMonth();
				
				arrDays[idx] = this.getDays( year, month );
			
				boxObj = doc.createElement("div");
				boxObj.className = this.setting.css.box;
				
				this.cntObj.insertBefore( boxObj );
				da( boxObj ).width( this.setting.width );
				// da( boxObj ).height( this.setting.height );
				
				if( 0 == idx ){
					this.setting.selectYearMonth = this.setting.selectYearMonth && true;
				}
				if( 0  < idx ){
					this.setting.selectYearMonth = false;
				}
				
				this.createHeadBar( boxObj, idx );					//先绘制工具条
				this.createElements( boxObj, idx );					//绘制日历
			}
			
			this.setting.selectYearMonth = orgSelectYearMonth;
		},

		//绘制日历顶端工具条
		/*
		*/
		createHeadBar: function( boxObj, idx ){
			var headObj = this.headObj,
				arrDay = this.arrDays[idx],
				year = arrDay[0].sYear,
				month = arrDay[0].sMonth;
					
			headObj.barObj = doc.createElement( "div" );
			headObj.barObj.className = this.setting.css.headBar;
			
			if( 0 == idx ){
				headObj.btPrev = doc.createElement( "a" );
				headObj.btPrev.className = this.setting.css.barBt +" "+this.setting.css.barPrev;
				headObj.btPrev.href = "javascript:void(0);";
				headObj.barObj.insertBefore( headObj.btPrev );
			}
			if( this.setting.count-1 == idx ){
				headObj.btNext = doc.createElement( "a" );
				headObj.btNext.className = this.setting.css.barBt +" "+this.setting.css.barNext;
				headObj.btNext.href = "javascript:void(0);";
				headObj.barObj.insertBefore( headObj.btNext );
			}
			
			if( this.setting.selectYearMonth ){
				var option;

				headObj.sltYear = doc.createElement( "select" );
				headObj.sltYear.style.width = "70px";
				for(var i=-10; i<=10; i++){									//可选当前日期正负10年的范围
					option = doc.createElement("option");
					option.innerHTML = option.value = parseInt(year)+i;
					headObj.sltYear.insertBefore( option );
				}
				headObj.barObj.insertBefore( headObj.sltYear );
				headObj.sltYear.value = year;
				
				headObj.sltMonth = doc.createElement( "select" );
				headObj.sltMonth.style.width = "50px";
				for(var i=1; i<=12; i++){
					option = doc.createElement("option");
					option.innerHTML = i;
					option.value = i-1;
					headObj.sltMonth.insertBefore( option );
				}
				headObj.barObj.insertBefore( headObj.sltMonth );
				headObj.sltMonth.value = month;
				
			}
			else{
				headObj.spanTitle = doc.createElement( "span" );
				headObj.spanTitle.className = this.setting.css.barTitle;
				headObj.spanTitle.innerHTML = [ 
						year, "年 ",
						fillZero( month+1, 2 ), "月",
				].join("");
				
				headObj.barObj.insertBefore( headObj.spanTitle );
				
			}
			
	
			boxObj.insertBefore( headObj.barObj );
		},
		
		//绘制日历单元格
		/*
		*/
		createElements: function( boxObj, idx ){
			var arrTdHead = this.arrTdHead,
				arrTd = this.arrTd,
				arrDay = this.arrDays[idx],
				
				tbObj = doc.createElement( "table" ),
				tbodyObj = doc.createElement( "tbody" ),
				trTmp, tdTmp;
			
			tbObj.cellSpacing = 2;
			tbObj.cellPadding = 0;
			tbObj.insertBefore( tbodyObj );
			tbObj.className = this.setting.css.daDate;
			
			this.tableObj = tbObj;
			boxObj.insertBefore( this.tableObj );
			
			var  monthFirstDay = this.monthFirstDay,				//当月第一天的星期值
				 firstDay = this.firstDay,							//日历的起始星期值
				 daysCount = arrDay.length,							//这个月的总天数
				 n = 0;
				 cnDay = "";										//星期中文值

			trTmp = doc.createElement( "tr" );
			trTmp.className = this.setting.css.head;				//日历表头
			tbodyObj.insertBefore( trTmp, null );
			
			for( var i=0; i<7; i++ ){
				tdTmp = doc.createElement( "td" );					//创建日历属性单元格
				
				cnDay = daLunar.nStr1[ ( i + firstDay ) % 7 ];
				tdTmp.innerHTML = cnDay;							//如果
				if( "日" === cnDay || "六" === cnDay )
					tdTmp.className = "weekend";
				
				arrTdHead.push( tdTmp );
				trTmp.insertBefore( tdTmp, null );
			}
			
			var  startEmptyDay = monthFirstDay - firstDay;									//日历开头空白的几天
			startEmptyDay = startEmptyDay >= 0 ? startEmptyDay : startEmptyDay+7;
			var maxDay = startEmptyDay + arrDay.length;
			maxDay = 28 < maxDay ? 35 < maxDay ? 42 : 35 : 28;								//当前月所需最大日历单元格个数
			
			for( var i=0,w=0; i<maxDay; i++,w++ ){						//循环日历所有元素框格
				w = w>6 ? 0 : w;										//一周逐日递加,大于6归零
				
				if( 0 == w ){											//一周一行
					trTmp = doc.createElement( "tr" );
					trTmp.className = this.setting.css.date;
					tbodyObj.insertBefore( trTmp, null );
				}

				tdTmp = doc.createElement( "td" );						//创建日历属性单元格
				
				cnDay = daLunar.nStr1[ ( i + firstDay ) % 7 ];
				if( "日" === cnDay || "六" === cnDay ) 
					tdTmp.className = "weekend";
				
				if( ( 0 >= startEmptyDay ) && (n < daysCount) ){						//有效日历单元格的处理
						tdTmp.id = this.getTdId( arrDay[ n ].sDay );
						tdTmp.setAttribute( "idxBox", idx );
						tdTmp.setAttribute( "idxDay", n );
						if( arrDay[ n ].isToday )
							tdTmp.className = tdTmp.className + " today";
						
						tdTmp.innerHTML = arrDay[ n ].sDay;
						
						arrTd.push( tdTmp );
						
						n++;	//arrDay日历属性列表索引号++
				}
				else{
					if( 0 < startEmptyDay ) startEmptyDay--;
					tdTmp.className = "no";
				}
				
				trTmp.insertBefore( tdTmp, null );
				
			}
		},
		
		createFootBar: function(){
			var footObj = doc.createElement( "div" );
			footObj.className = this.setting.css.footBar;
			
			var btToday = doc.createElement( "a" );
			btToday.className = this.setting.css.barBt;
			btToday.href = "javascript:void(0);";
			btToday.innerHTML = "今天";
			footObj.insertBefore( btToday );
			
			btToday = doc.createElement( "a" );
			btToday.className = this.setting.css.barBt;
			btToday.href = "javascript:void(0);";
			btToday.innerHTML = "确定";
			footObj.insertBefore( btToday );
			
			this.cntObj.insertBefore( footObj );
		},
		
		/**事件绑定函数
		*/
		bindEvent: function( ){
			var context = this,
				headFnEvents = this.headFnEvents,
				cellFnEvents = this.cellFnEvents,
				dateTmp = null,
				tableObjTmp = null;
			
			da( this.targetObj ).bind( "focus", function(){							//日期选中 绑定自定义事件函数
				context.show();
			});
			
			da( this.arrTdHead ).bind( "click", function(){						//日历头 绑定自定义事件函数
				var res = true;
				if( null != context.setting.clickHead )
					res = context.setting.clickHead.call( context );
				
				if( false !== res ){
					
				}
			});
			
			da( this.arrTd ).bind( "click", function(){							//日期选中 绑定自定义事件函数
				var res = true;
				if( null != context.setting.click )
					res = context.setting.click.call( context, context.getData(this) );
				
				if( false !== res ){
					if( context.targetObj ){
						context.setValue( context.getData(this) );
					}
				}
			});
			
			
			da( this.headObj.btToday ).bind( "click", function( evt ){			//“今天”按钮自定义事件函数
				var res = true;
				if( null != context.setting.clickToday )
					res = context.setting.clickToday.call( context );
				
				if( false !== res ){
					context.setting.year = null;
					context.setting.month = null;
					context.refresh();
				}
				
			});
			
			da( this.headObj.btPrev ).bind( "click", function( evt ){			//“上一月”按钮自定义事件函数
				var res = true;
				if( null != context.setting.clickPrev ) 
					res = context.setting.clickPrev.call( context );
					
				if( false !== res ){
					dateTmp = new Date( context.year, context.month );
					dateTmp = da.addDate( dateTmp, -1, "M" );
					
					context.setting.year = dateTmp.getFullYear();
					context.setting.month = dateTmp.getMonth();
					context.refresh();
				}
			});
			
			da( this.headObj.btNext ).bind( "click", function( evt ){			//“下一月”按钮自定义事件函数
				var res = true;
				if( null != context.setting.clickNext ) 
					res = context.setting.clickNext.call( context );
					
				if( false !== res ){
					dateTmp = new Date( context.year, context.month );
					dateTmp = da.addDate( dateTmp, 1, "M" );
					
					context.setting.year = dateTmp.getFullYear();
					context.setting.month = dateTmp.getMonth();
					context.refresh();
				}
			
			});

			if( this.setting.selectYearMonth ){
				da( this.headObj.sltYear ).bind( "change", function( evt ){			//“年份”按钮自定义事件函数
					var res = true;
					if( null != context.setting.changeYear ) 
						res = context.setting.changeYear.call( context );
						
					if( false !== res ){
						context.setting.year = context.headObj.sltYear.value;
						context.setting.month = context.headObj.sltMonth.value;
						context.refresh();
					}
				});
				
				da( this.headObj.sltMonth ).bind( "change", function( evt ){		//“月份”按钮自定义事件函数
					var res = true;
					if( null != context.setting.changeMonth ) 
						res = context.setting.changeMonth.call( context );
						
					if( false !== res ){
						context.setting.year = context.headObj.sltYear.value;
						context.setting.month = context.headObj.sltMonth.value;
						context.refresh();
					}
				});
			}
				
			//鼠标焦点高亮事件(托管给cntObj对象,不用重复绑定大量事件，提高性能)
			da( this.cntObj ).bind( "mouseover", function( evt ){								//鼠标移上高亮
				if( "TD" == evt.target.tagName && !da( evt.target ).is(".no") ){
					da( evt.target ).addClass( context.setting.css.focus );
				}
			}).bind( "mouseout", function( evt ){												//鼠标移出解除高亮
				if( "TD" == evt.target.tagName && !da( evt.target ).is(".no") ){
					da( evt.target ).removeClass( context.setting.css.focus );
				}
			});
			
			
		},
		
		/**获取日历单元格id
		*	nDate: 日期号数
		*/
		getTdId: function( nDate ){
			return [ "daDate_", this.id, "#", this.year, "-", fillZero( (this.month + 1).toString(), 2 ), "-", fillZero( nDate.toString(), 2 ) ].join("");
					
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
		
		/**获取TD对象的日期信息
		* params {DOM} tdObj 日历单元格TD对象
		*/
		getData: function( tdObj ){
			var idxBox = tdObj.getAttribute( "idxBox" ),
				idxDay = tdObj.getAttribute( "idxDay" );
				
			return this.arrDays[ idxBox ][idxDay] || null;
		},
			
		/**移除
		*/
		remove: function(){
			da( this.cntObj ).remove();
		},
		
		/**刷新
		*/
		refresh:function(){
			var status = this.isShowed;
			
			this.remove();
			this.init( this.setting );
			
			if( status ){
				this.show();
			}
			else{
				this.hide();
			}
		},
		
		/**重置daDate尺寸
		*/
		resize: function(){
			var da_parent = da( this.cntObj ),
					pWidth = da_parent.width(),
					pHeight = da_parent.height(),
					w, h;
			
			// w = da.browser.ie ? pWidth - 34 : pWidth - 24;				//还要减去border和padding, 注：IE在<!DOCTYPE>标准下的filter阴影特效也算在宽度内
			// h = da.browser.ie ? pHeight - 55 : pHeight - 38;
			
			w = pWidth - 10;				//还要减去border和padding, 注：IE在<!DOCTYPE>标准下的filter阴影特效也算在宽度内
			h = pHeight - 10;
			
			da( this.tableObj ).width( w );
			da( this.tableObj ).height( h );
			
		},
		
		/**设置daDate对象的位置（日期选择器）
		* params {DOM|Int|String} nTop 列表对象的top值；也可以是某一个DOM对象
		* params {Int|String} nLeft 列表对象的left值
		*/
		setPos: function( nTop, nLeft ){
			if( nTop && nTop.nodeType ){
				var daTarget = da( nTop ),
						pos = daTarget.offset(),
						oldDisplay = da( this.cntObj ).css( "display" );
				
				if( "none" === oldDisplay ) this.cntObj.style.display = "block";
				
				if( da.browser.ie ){																					//校正list面板的位置
					if( da(win).height()/2 < pos.top )
						pos.top = pos.top - da( this.cntObj ).height() + 2;
					else
						pos.top = pos.top+ daTarget.height() -2;
						
					if( da(win).width()/2 < pos.left )
						pos.left = pos.left - ( da( this.cntObj ).width() - daTarget.width())+4;
					else
						pos.left -= 5;
						
				}
				else{
					if( da(win).height()/2 < pos.top )
						pos.top = pos.top - da( this.cntObj ).height() -2;
					else
						pos.top = pos.top+ daTarget.height()+1;
					
					if( da(win).width()/2 < pos.left )
						pos.left = pos.left - ( da( this.cntObj ).width() - daTarget.width());
						
				}
				
				this.setting.top = pos.top;
				this.setting.left = pos.left;
			}
			else{
				this.setting.top = nTop || this.setting.top;
				this.setting.left = nLeft || this.setting.left;
				
			}
			
			da( this.cntObj ).css({
				top: this.setting.top,
				left: this.setting.left
			});
			
			da( this.cntObj ).css( "display", oldDisplay );
			
		},
		
		/**给目标对象设置选中日期值
		*/
		setValue: function( data ){
			var fmt = this.targetObj.getAttribute("fmt");
			this.targetObj.value = fmt ? da.fmtDate( data.date, fmt ) : data.date;
		},
		
		//显示列表
		/*
		*/
		show: function(){
			if( "block" === this.cntObj.style.display ) return;
			
			if( "undefined" === typeof daFx ){
				this.cntObj.style.display = "block";
			}
			else{
				da( this.cntObj ).slideDown(300);
			}
			
			this.isShowed = true;
		},
		
		/**隐藏列表
		* params {boolean} isForce 是否不需要验证daList当前值，直接关闭
		*/
		hide: function( isForce ){
			if( "none" === this.cntObj.style.display ) return;
			
			if( "undefined" === typeof daFx || isForce ){
				this.cntObj.style.display = "none";
			}
			else{
				da( this.cntObj ).slideUp(150);
			}
			
			this.isShowed = false;
		}
		
	};
	
	
	//对象继承da类属性
	daDate.fnStruct.init.prototype = daDate.prototype;
	
	
	//全局变量
	win.daDate = daDate;
	

} )( window );



//var dateTmp = new Date(),strTmp = [];
//for(var i=1;i<32;i++){
//	dateTmp = new Date(dateTmp.getFullYear(), dateTmp.getMonth(), i, dateTmp.getHours());
//	strTmp.push( dateTmp.format("yyyy-MM-dd")+": "+daLunar( dateTmp ).lunarDay() );
//}
//alert( strTmp.join("\n") );