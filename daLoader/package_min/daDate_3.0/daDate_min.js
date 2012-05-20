﻿/*
	author:	danny.xu
	date:	2011-2-12
	description:	工作计划日历插件
*/
function fillZero(a,b,c){if("number"===typeof a)a=a.toString();var d=b-a.length,sZero=[];if(0>=d)return a;else{for(;0<d;d--)sZero.push("0");if(c)return a=a+sZero.join("");else return a=sZero.join("")+a}}(function(l){var m=l.document;function dayElement(a,b,c,d,e,f,g,h,i,j,k){this.isToday=false;this.color='';this.sYear=a;this.sMonth=b;this.sDay=c;this.week=d;this.date=new Date(a,b,c);this.lYear=e;this.lMonth=f;this.lDay=g;this.isLeap=h;this.cYear=i;this.cMonth=j;this.cDay=k;this.lunarFestival='';this.solarFestival='';this.solarTerms=''};var o=function(a){return new o.fnStruct.init(a)};o.fnStruct=o.prototype={cdrId:0,cdrObj:null,cdrParentObj:null,cdrCntObj:null,cdrTargetObj:null,cdrBar:null,setting:{id:"",target:"",parent:null,year:"",month:"",firstDay:1,isSelector:false,top:0,left:0,width:160,height:190,tools:"",css:{daCalendar:" daCalendar",cnt:"daCalendarCnt",shadow:"daShadow",head:"trHead",date:"trDate",datetitle:" title",focus:" focus",datelist:" list",bar:" daCalendarBar",barLeft:"barLeft",barRight:"barRight",barBt:" bt",barBt_slt:" bt_slt",barToday:" today",barToday_slt:" today_slt",barPrevious:" previous",barPrevious_slt:" previous_slt",barNext:" next",barNext_slt:" next_slt",barTitle:" barTitle"},headEvent:null,cellEvent:null,itemEvent:null,clickToday:null,clickPrev:null,clickNext:null,clickRefresh:null},cdrFirstDay:1,cdrColor:{red:"#f00",green:"#0f0",black:"#000"},cdrToday:null,cdrYear:0,cdrMonth:0,monthFirstDay:null,arrElement:null,arrTdHead:null,arrTd:null,arrDivTitle:null,arrSpanTool:null,arrDivList:null,arrUlItem:null,init:function(a){a=this.setting=da.extend({},this.setting,a);a.isSelector=!!a.isSelector;var b=da(a.parent);this.cdrParentObj=0<b.dom.length?b.dom[0]:m.body;b=da(a.target);this.cdrTargetObj=0<b.dom.length?b.dom[0]:null;if(a.id)this.cdrId=a.id;else while(null!==m.getElementById("daCalendar_"+this.cdrId))this.cdrId++;a.firstDay=(a.firstDay&&1<=parseInt(a.firstDay)&&7>=parseInt(a.firstDay))?a.firstDay:1;var c=new Date();this.cdrToday={year:c.getFullYear(),month:c.getMonth(),date:c.getDate()};this.arrElement=[];this.arrTdHead=[];this.arrTd=[];this.arrDivTitle=[];this.arrSpanTool=[];this.arrDivList=[];this.arrUlItem={};this.cdrBar={barObj:null,barLeft:null,barRight:null,btToday:null,btPrevious:null,btNext:null,spanTitle:null,btFresh:null};this.headFnEvents=a.headEvent;this.cellFnEvents=a.cellEvent;this.cdrYear=da.firstValue(a.year,this.cdrToday.year);this.cdrMonth=da.firstValue(a.month,this.cdrToday.month);this.initElement(this.cdrYear,this.cdrMonth);this.create()},initElement:function(a,b){var c=this.cdrToday,arrElement=this.arrElement,dateTody=new Date(a,b),daysCount=daLunar.solarDays(dateTody),firstDay=daLunar.firstDayForMonth(dateTody),daLunarObj=null,n=0,firstLM=0,lDay=1,lmonthLastDay=0,lDPOS=new Array(3);this.monthFirstDay=firstDay;for(var i=0;i<daysCount;i++){if(lDay>lmonthLastDay){daLunarObj=daLunar(new Date(a,b,i+1));lDay=daLunarObj.day;lmonthLastDay=daLunarObj.isLeap?daLunarObj.leapDaysCount():daLunarObj.monthDays();if(n==0)firstLM=daLunarObj.month;lDPOS[n++]=i-lDay+1}arrElement[i]=new dayElement(a,b,i+1,daLunar.nStr1[(i+firstDay)%7],daLunarObj.year,daLunarObj.month,daLunarObj.lunarDay(lDay++),daLunarObj.isLeap,daLunarObj.cyclical(daLunarObj.yearCyl),daLunarObj.cyclical(daLunarObj.monCyl),daLunarObj.cyclical(daLunarObj.dayCyl++));if(0==(i+firstDay)%7)arrElement[i].color=this.cdrColor.red;if(13==(i+firstDay)%14)arrElement[i].color=this.cdrColor.green};if(a==c.year&&b==c.month){arrElement[c.date-1].isToday=true}tmp1=daLunar.sTerm(a,b*2)-1;tmp2=daLunar.sTerm(a,b*2+1)-1;arrElement[tmp1].solarTerms=daLunar.solarTerm[b*2];arrElement[tmp2].solarTerms=daLunar.solarTerm[b*2+1];if(3==b)arrElement[tmp1].color=this.cdrColor.black;for(var i=0,len=daLunar.sFtv.length;i<len;i++){if(daLunar.sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/)){if(Number(RegExp.$1)==(b+1)){arrElement[Number(RegExp.$2)-1].solarFestival+=RegExp.$4+' ';if(RegExp.$3=='*')arrElement[Number(RegExp.$2)-1].color=this.cdrColor.red}}}for(var i=0,len=daLunar.lFtv.length;i<len;i++){if(daLunar.lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)){tmp1=Number(RegExp.$1)-firstLM;if(-11==tmp1)tmp1=1;if(tmp1>=0&&tmp1<n){tmp2=lDPOS[tmp1]+Number(RegExp.$2)-1;if(tmp2>=0&&tmp2<arrElement.length){arrElement[tmp2].lunarFestival+=RegExp.$4+' ';if(RegExp.$3=='*')arrElement[tmp2].color=this.cdrColor.red}}}}for(var i=0,len=daLunar.wFtv.length;i<len;i++){if(daLunar.wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/)){if(Number(RegExp.$1)==(b+1)){tmp1=Number(RegExp.$2);tmp2=Number(RegExp.$3);arrElement[((firstDay>tmp2)?7:0)+7*(tmp1-1)+tmp2-firstDay].solarFestival+=RegExp.$5+' '}}}if((firstDay+12)%7==5)arrElement[12].solarFestival+='黑色星期五 '},create:function(){if(this.setting.isSelector)this.createCnt();this.createToolBar();this.createElements();this.resize();this.bindEvent()},createCnt:function(){var a=m.createElement("div");a.className=[this.setting.css.cnt,this.setting.css.shadow].join(" ");a.style.cssText="position:absolute;left:0px;top:0px";this.cdrCntObj=a;this.cdrParentObj.insertBefore(a);da(a).width(this.setting.width);da(a).height(this.setting.height);if(this.cdrTargetObj)this.setPos(this.cdrTargetObj);else this.setPos(this.setting.top,this.setting.left)},createToolBar:function(){var a=this.cdrBar,cdrToday=this.cdrToday,arrElement=this.arrElement;a.barObj=m.createElement("div");a.barLeft=m.createElement("div");a.barRight=m.createElement("div");a.btToday=m.createElement("a");a.btPrevious=m.createElement("a");a.btNext=m.createElement("a");a.spanTitle=m.createElement("span");a.btFresh=m.createElement("a");a.barObj.className=this.setting.css.bar;a.barLeft.className=this.setting.css.barLeft;a.barRight.className=this.setting.css.barRight;a.btToday.className=this.setting.isSelector?this.setting.css.barToday_slt:this.setting.css.barToday;a.btPrevious.className=this.setting.isSelector?this.setting.css.barPrevious_slt:this.setting.css.barPrevious;a.btNext.className=this.setting.isSelector?this.setting.css.barNext_slt:this.setting.css.barNext;a.spanTitle.className=this.setting.css.barTitle;a.btFresh.className=this.setting.isSelector?"":this.setting.css.barBt;a.btToday.href="javascript:void(0);";a.barLeft.insertBefore(a.btToday);a.btPrevious.href="javascript:void(0);";a.barLeft.insertBefore(a.btPrevious);if(this.setting.isSelector){a.spanTitle.innerHTML=[this.cdrYear,"-",fillZero(this.cdrMonth+1,2)].join("");a.barLeft.insertBefore(a.spanTitle);a.btNext.href="javascript:void(0);";a.barLeft.insertBefore(a.btNext);if(this.setting.isSelector){a.btFresh.style.cssText='display:inline-block;width:18px;height:18px;line-height:24px;text-align:center;color:#333;text-decoration:none; font:14px/1.5 arial, sans-serif; font-weight:bold;';a.btFresh.innerHTML="X"}else a.btFresh.innerHTML="刷"}else{a.btNext.href="javascript:void(0);";a.barLeft.insertBefore(a.btNext);a.spanTitle.innerHTML=["当前日历：",this.cdrYear,"年",this.cdrMonth+1,"月"].join("");a.barLeft.insertBefore(a.spanTitle);a.btFresh.innerHTML="刷新"}a.btFresh.href="javascript:void(0);";a.barRight.insertBefore(a.btFresh);a.barObj.insertBefore(a.barLeft);a.barObj.insertBefore(a.barRight);this.setting.isSelector?this.cdrCntObj.insertBefore(a.barObj):this.cdrParentObj.insertBefore(a.barObj)},createElements:function(){var a=this.arrTdHead,arrTd=this.arrTd,arrDivTitle=this.arrDivTitle,arrSpanTool=this.arrSpanTool,arrDivList=this.arrDivList,arrElement=this.arrElement,tools=this.setting.tools,tbObj=m.createElement("table"),tbodyObj=m.createElement("tbody"),maxElements=42,trTmp,tdTmp,titleTmp,toolTmp,listTmp;tbObj.cellSpacing=0;tbObj.cellPadding=0;tbObj.insertBefore(tbodyObj);tbObj.className=this.setting.css.daCalendar;this.cdrObj=tbObj;this.setting.isSelector?this.cdrCntObj.insertBefore(tbObj):this.cdrParentObj.insertBefore(tbObj);var b=this.monthFirstDay,cdrFirstDay=this.cdrFirstDay,daysCount=arrElement.length,idx=0;cnDay="";var c=b-cdrFirstDay;c=c>=0?c:c+7;trTmp=m.createElement("tr");trTmp.className=this.setting.css.head;tbodyObj.insertBefore(trTmp);for(var i=0;i<7;i++){tdTmp=m.createElement("td");cnDay=daLunar.nStr1[(i+cdrFirstDay)%7];tdTmp.innerHTML=this.setting.isSelector?cnDay:"周"+cnDay;if("日"===cnDay||"六"===cnDay)tdTmp.className="tdr tdb weekend";else tdTmp.className="tdr tdb";a.push(tdTmp);trTmp.insertBefore(tdTmp)}for(var i=0,w=0;i<maxElements;i++,w++){w=w>6?0:w;if(0==w){trTmp=m.createElement("tr");trTmp.className=this.setting.css.date;tbodyObj.insertBefore(trTmp)}tdTmp=m.createElement("td");tdTmp.className="tdr tdb";cnDay=daLunar.nStr1[(i+cdrFirstDay)%7];if("日"===cnDay||"六"===cnDay)tdTmp.className="tdr tdb weekend";titleTmp=m.createElement("div");listTmp=m.createElement("div");titleTmp.className=this.setting.css.datetitle;listTmp.className=this.setting.css.datelist;if((0>=c)&&(idx<daysCount)){tdTmp.id=this.getTdId(arrElement[idx].sDay);tdTmp.setAttribute("elementIndex",idx);if(arrElement[idx].isToday)tdTmp.className=tdTmp.className+" today";if(this.setting.isSelector){tdTmp.innerHTML=arrElement[idx].sDay;tdTmp.style.cssText="line-height:22px; text-align:center; font-weight:bold;"}else{titleTmp.innerHTML=['<div class="tool" ></div>','<span>',arrElement[idx].sDay,'</span>','<span style="color:#ff9933;">',arrElement[idx].lunarFestival,'</span>','<span style="color:#ff9933;">',arrElement[idx].solarFestival,'</span>','<span style="color:#909090;">',arrElement[idx].solarTerms,'</span>','<span>',arrElement[idx].lDay,'</span>',].join(" ");if(titleTmp.children[0]&&("tool"==titleTmp.children[0].className)&&tools)titleTmp.children[0].innerHTML=tools;arrDivTitle.push(titleTmp);arrDivList.push(listTmp)}arrTd.push(tdTmp);idx++}else{if(0<c)c--;tdTmp.className="tdr tdb no"}if(!this.setting.isSelector){tdTmp.insertBefore(titleTmp);tdTmp.insertBefore(listTmp)}trTmp.insertBefore(tdTmp)}},bindEvent:function(){var c=this,headFnEvents=this.headFnEvents,cellFnEvents=this.cellFnEvents,nYear=parseInt(this.cdrYear),nPreMonth=parseInt(this.cdrMonth)-1,nNextMonth=parseInt(this.cdrMonth)+1,dateTmp=null,cdrObjTmp=null;da(this.arrTdHead).bind(headFnEvents);da(this.arrTd).bind(cellFnEvents);da(this.cdrBar.btToday).bind("click",function(a){var b=true;if(null!=c.setting.clickToday)b=c.setting.clickToday.call(c);if(false!==b){c.setting.year=null;c.setting.month=null;c.refresh()}});da(this.cdrBar.btPrevious).bind("click",function(a){var b=true;if(null!=c.setting.clickPrev)b=c.setting.clickPrev.call(c);if(false!==b){dateTmp=new Date(nYear,nPreMonth);dateTmp=da.dateAdd(dateTmp,-1,"M");c.setting.year=dateTmp.getFullYear();c.setting.month=dateTmp.getMonth();c.refresh()}});da(this.cdrBar.btNext).bind("click",function(a){var b=true;if(null!=c.setting.clickNext)b=c.setting.clickNext.call(c);if(false!==b){dateTmp=new Date(c.cdrYear,c.cdrMonth);dateTmp=da.dateAdd(dateTmp,1,"M");c.setting.year=dateTmp.getFullYear();c.setting.month=dateTmp.getMonth();c.refresh()}});da(this.cdrBar.btFresh).bind("click",function(a){var b=true;if(null!=c.setting.clickRefresh)b=c.setting.clickRefresh.call(c);if(false!==b){c.refresh()}});da(this.arrTd).bind("mouseover",function(a){this.className=(-1<this.className.indexOf(c.setting.css.focus))?this.className:this.className+c.setting.css.focus}).bind("mouseout",function(a){this.className=(-1<this.className.indexOf(c.setting.css.focus))?this.className.replace(c.setting.css.focus,""):this.className})},getTdId:function(a){return["daCalendar_",this.cdrId,"#",this.cdrYear,"-",fillZero((this.cdrMonth+1).toString(),2),"-",fillZero(a.toString(),2)].join("")},getTd:function(a){var b=da("#"+this.getTdId(a));if(0<b.length)b=b.dom[0];if(!b||("date"!=b.className&&"TD"!=b.nodeName))return null;return b},getTdDate:function(a,b){var c=[];for(var i=0;i<b;i++){var d=this.getTd(a);if(!d)continue;c.push(d);++a}return c},getDate:function(a){var b=a.getAttribute("elementIndex");return this.arrElement[b]||null},getControls:function(a){var b={};if("string"===typeof a){a=getTd(a)}if(a.nodeName&&"TD"==a.nodeName){b.tools=a.children[0].children[0].children;b.date=a.children[0].children[1];b.lunarFestival=a.children[0].children[2];b.solarFestival=a.children[0].children[3];b.solarTerms=a.children[0].children[4]}return b},addItem:function(a,b,c,d,e,f,g){if(undefined==b||undefined==a)return;g=g||"";var h=this.getTd(b);if(null==h)return;var i=h.children[1],arrUlItem=this.arrUlItem;c=c||"daCanlendarItems";var j=m.createElement("ul");j.id=a;j.style.position="relative";j.className="item";j.title=g;if(e)j.style.backgroundColor=e;j.innerHTML=d;i.insertBefore(j);if(!arrUlItem[c])arrUlItem[c]=[];arrUlItem[c].push(j);da(j).bind(f)},clearItems:function(a){if(undefined==a)return;var b=this.getTd(a);if(null==b)return;var c=b.children[1];c.innerHTML=""},remove:function(){if(this.setting.isSelector)da(this.cdrCntObj).remove();else{da(this.cdrBar.barObj).remove();da(this.cdrObj).remove()}},refresh:function(){this.remove();this.init(this.setting)},resize:function(){var a=da(this.setting.isSelector?this.cdrCntObj:this.cdrParentObj),pWidth=a.width(),pHeight=a.height(),w,h;w=da.browser.ie?pWidth-14:pWidth-4;h=da.browser.ie?pHeight-35:pHeight-18;da(this.cdrObj).width(w);da(this.cdrObj).height(h)},setPos:function(a,b){if(a&&a.nodeType){var c=da(a),pos=c.offset(),oldDisplay=da(this.cdrCntObj).css("display");if("none"===oldDisplay)this.cdrCntObj.style.display="block";if(da.browser.ie){if(da(l).height()/2<pos.top)pos.top=pos.top-da(this.cdrCntObj).height()+2;else pos.top=pos.top+c.height()-2;if(da(l).width()/2<pos.left)pos.left=pos.left-(da(this.cdrCntObj).width()-c.width())+4;else pos.left-=5}else{if(da(l).height()/2<pos.top)pos.top=pos.top-da(this.cdrCntObj).height()-2;else pos.top=pos.top+c.height()+1;if(da(l).width()/2<pos.left)pos.left=pos.left-(da(this.cdrCntObj).width()-c.width())}this.setting.top=pos.top;this.setting.left=pos.left}else{this.setting.top=a||this.setting.top;this.setting.left=b||this.setting.left}da(this.cdrCntObj).css({top:this.setting.top,left:this.setting.left});da(this.cdrCntObj).css("display",oldDisplay)},show:function(){if("block"===this.cdrCntObj.style.display)return;if("undefined"===typeof daFx){this.cdrCntObj.style.display="block"}else{da(this.cdrCntObj).slideDown(300)}},hide:function(a){if("none"===this.cdrCntObj.style.display)return;if("undefined"===typeof daFx||a){this.cdrCntObj.style.display="none"}else{da(this.cdrCntObj).slideUp(150)}}};o.fnStruct.init.prototype=o.prototype;l.daCalendar=o})(window);(function(c){var e=function(a){return new e.fnStruct.init(a)};e.fnStruct=e.prototype={nowYear:0,nowMonth:0,nowDate:0,year:-1,month:-1,day:-1,isLeap:false,yearCyl:-1,monCyl:-1,dayCyl:-1,init:function(a){var b=new Date();this.nowYear=b.getFullYear();this.nowMonth=b.getMonth();this.nowDate=b.getDate();var i,leap=0,temp=0,baseDate=new Date(1900,0,31),offsetDay=parseInt((a-baseDate)/86400000);this.dayCyl=offsetDay+40;this.monCyl=14;for(i=1900;i<2050&&offsetDay>0;i++){temp=this.lunarYearDaysCount(i);offsetDay-=temp;this.monCyl+=12}if(offsetDay<0){offsetDay+=temp;i--;this.monCyl-=12}this.year=i;this.yearCyl=i-1864;leap=this.leapMonth(i);this.isLeap=false;for(i=1;i<13&&offsetDay>0;i++){if(leap>0&&i==(leap+1)&&this.isLeap==false){--i;this.isLeap=true;temp=this.leapDaysCount(this.year)}else{temp=this.monthDays(this.year,i)}if(this.isLeap==true&&i==(leap+1))this.isLeap=false;offsetDay-=temp;if(this.isLeap==false)this.monCyl++}if(offsetDay==0&&leap>0&&i==leap+1)if(this.isLeap){this.isLeap=false}else{this.isLeap=true;--i;--this.monCyl}if(offsetDay<0){offsetDay+=temp;--i;--this.monCyl}this.month=i;this.day=offsetDay+1},monthDays:function(a,b){a=a||this.year;b=b||this.month;return((e.arrLunar[a-1900]&(0x10000>>b))?30:29)},leapMonth:function(a){a=a||this.year;return(e.arrLunar[a-1900]&0xf)},leapDaysCount:function(a){a=a||this.year;if(this.leapMonth(a))return((e.arrLunar[a-1900]&0x10000)?30:29);else return(0)},lunarYearDaysCount:function(a){var i,sum=348;a=a||this.year;for(i=0x8000;i>0x8;i>>=1)sum+=(e.arrLunar[a-1900]&i)?1:0;return(sum+this.leapDaysCount(a))},cyclical:function(a){return(e.arrTiangan[a%10]+e.arrDizhi[a%12])},lunarMonth:function(){var m=this.month,s;if(m>10){s='十'+e.nStr1[m-10]}else{s=e.nStr1[m]}s+='月';return(s)},lunarDay:function(d){var d=d||this.day,s;switch(d){case 10:s='初十';break;case 20:s='二十';break;break;case 30:s='叁十';break;break;default:s=e.nStr2[Math.floor(d/10)];s+=e.nStr1[d%10]}return(s)}};e.fnStruct.init.prototype=e.prototype;c.daLunar=e;e.sTerm=function(y,n){var a=new Date((31556925974.7*(y-1900)+e.sTermInfo[n]*60000)+Date.UTC(1900,0,6,2,5));return a.getUTCDate()};e.firstDayForMonth=function(a){return(new Date(a.getFullYear(),a.getMonth(),1)).getDay()};e.solarDays=function(a){var b=a.getFullYear(),month=a.getMonth();if(1==month)return(((b%4==0)&&(b%100!=0)||(b%400==0))?29:28);else return(e.solarMonth[month])};e.arrLunar=new Array(0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0),e.sTermInfo=new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758);e.arrAnimals=new Array("鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪");e.arrTiangan=new Array("甲","乙","丙","丁","戊","己","庚","辛","壬","癸");e.arrDizhi=new Array("子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥");e.solarMonth=new Array(31,28,31,30,31,30,31,31,30,31,30,31);e.solarTerm=new Array("小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至");e.nStr1=new Array('日','一','二','三','四','五','六','七','八','九','十');e.nStr2=new Array('初','十','廿','卅','　');e.sFtv=new Array("0101*元旦节","0214 情人节","0305 学雷锋纪念日","0308 妇女节","0312 植树节","0314 白色情人节","0315 消费者权益日","0401 愚人节","0407 世界卫生日","0422 世界地球日","0501*劳动节","0502*劳动节","0503*劳动节","0504 青年节","0508 世界红十字日","0512 国际护士节","0515 国际家庭日","0517 国际电信日","0601 国际儿童节","0605 世界环境保护日","0606 全国爱眼日","0625 全国土地日","0626 国际禁毒日","0701 香港回归纪念日 建党节","0707 抗日战争纪念日","0801 建军节","0815 抗日战争胜利纪念","0909 毛泽东逝世纪念","0908 国际扫盲日","0910 中国教师节","0927 世界旅游日","0928 孔子诞辰","1001*国庆节","1002*国庆节","1003*国庆节","1006 老人节","1009 世界邮政日","1014 世界标准日","1016 世界粮食日","1024 联合国日","1120*彝族年","1121*彝族年","1122*彝族年","1112 孙中山诞辰纪念","1205 国际志愿人员日","1220 澳门回归纪念","1225 圣诞节","1226 毛泽东诞辰纪念");e.lFtv=new Array("0101*春节","0102*春节","0103*春节","0115 元宵节","0505 端午节","0624*火把节","0625*火把节","0626*火把节","0707 七夕情人节","0715 中元节","0815 中秋节","0909 重阳节","1208 腊八节","1224 小年","0100 除夕");e.wFtv=new Array("0520 母亲节","0630 父亲节","0730 被奴役国家周","1144 Thanksgiving感恩节")})(window);