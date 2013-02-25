

/******************** 阴历计算操作类 *******************/
/*
	author:	danny.xu
	date: 2011-2-12
	description: 阴历计算操作类
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

