

/******************** ������������� *******************/
/*
	author:	danny.xu
	date: 2011-2-12
	description: �������������
*/
( function( win ){
	
	var daLunar = function( dateObj ){
		return new daLunar.fnStruct.init( dateObj );
	};
	
	daLunar.fnStruct = daLunar.prototype = {
		nowYear: 0,				//��ǰ������
		nowMonth: 0,			//��ǰ������
		nowDate: 0,				//��ǰ������
		
		year: -1,						//ũ����
		month: -1,					//ũ����
		day: -1,						//ũ����
		
		isLeap: false,		//�Ƿ�������
		
		yearCyl: -1,				//��֧��
		monCyl: -1,					//��֧��
		dayCyl: -1,					//��֧��
		
		init: function( dateObj ){
				var nowObj = new Date();
				this.nowYear = nowObj.getFullYear(); 
				this.nowMonth = nowObj.getMonth(); 
				this.nowDate = nowObj.getDate(); 
			
        var i, leap = 0, temp = 0,
            baseDate = new Date(1900, 0, 31),														//����ũ�����ձ� ��һ��0x04bd8��1900��Ķ�������
            offsetDay = parseInt( (dateObj - baseDate) / 86400000 );		//������������ڵ������� 86400000 = 1000*60*60*24 (һ���ʱ��),ȡ���ų�ʱ���������Ӱ��
				
        this.dayCyl = offsetDay + 40;
        this.monCyl = 14;

        for (i = 1900; i < 2050 && offsetDay > 0; i++) {
            temp = this.lunarYearDaysCount( i );						//���������ũ����������
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

        leap = this.leapMonth(i);				//���ĸ���
        this.isLeap = false;
				
        for (i = 1; i < 13 && offsetDay > 0; i++) {
            //����
            if (leap > 0 && i == (leap + 1) && this.isLeap == false) {--i;
                this.isLeap = true;
                temp = this.leapDaysCount(this.year);
            } else {
                temp = this.monthDays(this.year, i);
            }

            //�������
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
		//���ũ�� y��m�µ�������
    monthDays: function(year, month) {
    		year = year || this.year;
    		month = month || this.month;
        return ((daLunar.arrLunar[year - 1900] & (0x10000 >> month)) ? 30 : 29);
    },
    
    //���ũ�� year�����ĸ���(1-12), û�򴫻� 0
    leapMonth: function( year ) {
    		year = year || this.year;
        return ( daLunar.arrLunar[ year - 1900 ] & 0xf );						//ͨ����1111&����(��λû����ȻΪ0),��������·�ֵ
    },
		
    //���ũ��year�����µ�����
    leapDaysCount: function( year ) {
    		year = year || this.year;
        if ( this.leapMonth( year ) )
        	return ( ( daLunar.arrLunar[ year - 1900 ] & 0x10000 ) ? 30 : 29 );			//�ж������Ǵ��»���С��
        else
        	return (0);
    },
		
		//���ũ�� year���������
    lunarYearDaysCount: function( year ) {
        var i, sum = 348;												//���޴��µ������һ��ֻ��348��,348 = 29 * 12
    		year = year || this.year;
    		
        for ( i = 0x8000; i > 0x8; i >>= 1 )   											//������ 1000 0000 0000 0000������λ�ƶ�,��λ�Զ���0,ֱ�����4λ 1000( �����λ���������� )
        	sum += ( daLunar.arrLunar[ year - 1900 ] & i ) ? 1 : 0;		//��ũ������ձ�ͨ��&����ũ�������λ,����ũ����ȫ������
        
        return (sum + this.leapDaysCount( year ));									//��������£���Ҫ�������µ�����
    },
    
		//��ø�֧, 0=����
		cyclical: function( num ) {
		   return ( daLunar.arrTiangan[ num % 10 ] + daLunar.arrDizhi[ num % 12 ] );
		},
    
		//ũ����
    lunarMonth: function() {
    		var m = this.month,
            s;
            
        if (m > 10) {
            s = 'ʮ' + daLunar.nStr1[m - 10]
        } else {
            s = daLunar.nStr1[m]
        }
        s += '��';
        return (s);
    		
    },
    
		//ũ����
    lunarDay: function( d ) {
		   var d = d || this.day,
		   		 s;
    			 
		   switch (d) {
		      case 10:
		         s = '��ʮ'; break;
		      case 20:
		         s = '��ʮ'; break;
		         break;
		      case 30:
		         s = '��ʮ'; break;
		         break;
		      default :
		         s = daLunar.nStr2[ Math.floor( d / 10 ) ];
		         s += daLunar.nStr1[ d % 10 ];
		   }
		   return(s);
		}
    
	};

	//����̳�da������
	daLunar.fnStruct.init.prototype = daLunar.prototype;
	
	
	//ȫ�ֱ���
	win.daLunar = daLunar;
	
	//ĳ��ĵ�n������Ϊ����(��0С������)
	daLunar.sTerm = function(y,n) {
	   var offDate = new Date( ( 31556925974.7 * ( y-1900 ) + daLunar.sTermInfo[ n ] * 60000  ) + Date.UTC( 1900 , 0 , 6 , 2, 5 ) );
	   return offDate.getUTCDate();
	};
	
	//��ù���date�µ�һ�����ֵ(0~6 ���յ�����)
	daLunar.firstDayForMonth = function( date ){
		return ( new Date(date.getFullYear(), date.getMonth(), 1) ).getDay();
	};
	
	//��ù���date�µ�����
	daLunar.solarDays = function( date ) {
		 var year = date.getFullYear(),
		 		 month = date.getMonth();
		 
	   if( 1 == month )						//�µ�������1�������
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
		0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0),		//ũ������ձ�( ÿ������20bit��ǰ5~16bit��ʾũ��ÿ���Ƿ���£�1��ʾ���£�30�죬0��ʾС�£�29�졣ǰ4bit��ʾ�Ƿ������º����ĸ���,���4bit��ʾ�����Ƿ��Ǵ���,1��ʾ����; �磺0x04bd8 = 0000 10010111101 1000��ǰ4λ"1000"������8�£����4λ"0000"��ʾ��8��ΪС��29��)
	
	daLunar.sTermInfo = new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,
		195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,
		462224,483532,504758);																															//�������ձ�

	daLunar.arrAnimals = new Array("��","ţ","��","��","��","��","��","��","��","��","��","��");				//12��Ф
	daLunar.arrTiangan = new Array("��","��","��","��","��","��","��","��","��","��");									//10���
	daLunar.arrDizhi = new Array("��","��","��","î","��","��","��","δ","��","��","��","��");					//12��֧
	
	daLunar.solarMonth = new Array( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );										//������С�¶��ձ�
	daLunar.solarTerm = new Array("С��","��","����","��ˮ","����","����","����","����",
		"����","С��","â��","����","С��","����","����","����","��¶","���","��¶","˪��",
		"����","Сѩ","��ѩ","����");																																			//����
  daLunar.nStr1 = new Array('��', 'һ', '��', '��', '��', '��', '��', '��', '��', '��', 'ʮ');				//ũ�������ո�λ
  daLunar.nStr2 = new Array('��', 'ʮ', 'إ', 'ئ', '��');																						//ũ��������ʮλ
  
	daLunar.sFtv = new Array(
	"0101*Ԫ����","0214 ���˽�","0305 ѧ�׷������","0308 ��Ů��","0312 ֲ����","0314 ��ɫ���˽�","0315 ������Ȩ����",
	"0401 ���˽�","0407 ����������","0422 ���������","0501*�Ͷ���","0502*�Ͷ���","0503*�Ͷ���",
	"0504 �����","0508 �����ʮ����","0512 ���ʻ�ʿ��","0515 ���ʼ�ͥ��","0517 ���ʵ�����","0601 ���ʶ�ͯ��",
	"0605 ���绷��������","0606 ȫ��������","0625 ȫ��������","0626 ���ʽ�����","0701 ��ۻع������ ������",
	"0707 ����ս��������","0801 ������","0815 ����ս��ʤ������","0909 ë����������","0908 ����ɨä��",
	"0910 �й���ʦ��", "0927 ����������","0928 ���ӵ���","1001*�����","1002*�����","1003*�����",
	"1006 ���˽�","1009 ����������","1014 �����׼��","1016 ������ʳ��","1024 ���Ϲ���","1120*������",
	"1121*������","1122*������","1112 ����ɽ��������","1205 ����־Ը��Ա��","1220 ���Żع����","1225 ʥ����",
	"1226 ë�󶫵�������");																																							//�������� *��ʾ�ż���

	daLunar.lFtv = new Array( "0101*����", "0102*����", "0103*����", "0115 Ԫ����", "0505 �����",
		"0624*��ѽ�", "0625*��ѽ�", "0626*��ѽ�", "0707 ��Ϧ���˽�", "0715 ��Ԫ��", "0815 �����",
		"0909 ������", "1208 ���˽�", "1224 С��", "0100 ��Ϧ");																					//ũ������ *��ʾ�ż���
	
	daLunar.wFtv = new Array( "0520 ĸ�׽�", "0630 ���׽�", "0730 ��ū�۹�����", "1144 Thanksgiving�ж���" );		//ĳ�µĵڼ������ڼ�

} )( window );

