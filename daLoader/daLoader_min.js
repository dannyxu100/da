/**daLoader
*前端资源颗粒化管理
* @author danny.xu
* @version daLoader1.0 2012-4-26
*/
(function(h,j){var k=h.document,head=k.head||k.getElementsByTagName('head')[0];var l=(function(){var g=function(a){if(a instanceof String||a instanceof Function){g.ready.apply(this,arguments);return}return new g.fnStruct.init(a)};g.fnStruct=g.prototype={version:"daLoader v1.0 \n author: danny.xu \n date: 2012-4-26",setting:{},init:function(a){a=this.setting=da.extend({},this.setting,a)}};g.fnStruct.init.prototype=g.prototype;g.mapfile={};g.queue=[];g.waiting={};g.finished={};g.loadfile=function(a,b,c,d){if(g.waiting[a]){if(d){setTimeout(function(){g.loadfile(a,b,c,d)},1);return}return}if(g.finished[a]){d&&d();return}g.waiting[a]=true;var e=a.split('?')[0];b=b||e.toLowerCase().substring(e.lastIndexOf('.')+1);c=c||"utf-8";var f;if('css'===b){f=k.createElement('link');f.type='text/css';f.rel='stylesheet';f.href=a;g.waiting[a]=false;g.finished[a]=true;head.insertBefore(f,null);d&&d();return}else if('js'===b){f=k.createElement('script');f.type='text/javascript';f.src=a;f.async='true';if(c)f.charset=c}f.onload=f.onreadystatechange=function(){if(!this.readyState||this.readyState==='loaded'||this.readyState==='complete'){g.waiting[a]=false;g.finished[a]=true;d&&d();f.onload=f.onreadystatechange=null}};f.onerror=function(){g.waiting[a]=false;throw new Error(a+"加载失败");d&&d();f.onerror=null};head.insertBefore(f,null)};g.handle=function(b,c){var d=b.length;var e=function(){if(0==--d)c&&c()};var f,arrNeed;for(var i=0,len=b.length;i<len;i++){f=g.mapfile[b[i]];if(!f)throw new Error("错误: 无法引用"+b[i]+" 模块，"+b[i]+"未定义。");if(f.need){arrNeed=f.need.split(",");g.handle(arrNeed,(function(a){return function(){g.loadfile(a.path,a.type,a.charset,e)}})(f))}else{g.loadfile(f.path,f.type,f.charset,e)}}};g.class=function(a,b){if(!a||!b||!b.path)return;g.mapfile[a]=b};g.in=function(a){if(!a)return;g.queue=g.queue.concat(a.split(","))};g.ready=function(a,b){if("string"===typeof a){g.in(a)}else{b=a}g.handle(g.queue,function(){g.queue=[];b&&b()})};return g})();h.daLoader=l})(window);



//模块定义
(function(){
var _p = "package";

//-------------------------------------
daLoader.class('da_CSS', {path: _p+'/da.css' });
daLoader.class('da', {path: _p+'/da_min_1.3.2.js', type:'js', charset:'utf-8', need:"da_CSS" });			//核心库
//-------------------------------------
daLoader.class('daTreeCore', {path: _p+'/daTreeCore/daTreeCore.js', need:"da" });							//内存树类
daLoader.class('daDrag', {path: _p+'/daDrag/daDrag_source.js', need:"da" });									//拖拽操作类
daLoader.class('daWheel', {path: _p+'/daWheel/daWheel_source.js', need:"da" });								//滚轮操作类
daLoader.class('daKey', {path: _p+'/daKey/daKey.js', need:"da" });											//键盘操作类
//-------------------------------------
daLoader.class('daFx', {path: _p+'/daFx/daFx.js', need:"da" });												//动画操作类
daLoader.class('daGif', {path: _p+'/daFx/daGif.js', need:"da,daFx" });										//逐帧动画类
//-------------------------------------
daLoader.class('daSVG', {path: _p+'/daCanvas/daSVG.js', need:"da" });
daLoader.class('daVML', {path: _p+'/daCanvas/daVML_1.1.2.js', need:"da" });
daLoader.class('daCanvas', {path: _p+'/daCanvas/daCanvas.js', need:"da,daVML,daSVG" });						//绘图类
daLoader.class('daGuide', {path: _p+'/daGuide/daGuide.js', need:"da,daCanvas" });							//向导类
//-------------------------------------
daLoader.class('daLoading_CSS', {path: _p+'/daLoading/daLoading.css'});
daLoader.class('daLoading', {path: _p+'/daLoading/daLoading_source.js', need:"da,daLoading_CSS" });				//Loading类
//-------------------------------------
daLoader.class('daMsg_CSS', {path: _p+'/daMsg/daMsg.css'});
daLoader.class('daMsg', {path: _p+'/daMsg/daMsg.js', need:"da,daFx,daMsg_CSS" });								//消息类
//-------------------------------------
daLoader.class('daIframe', {path: _p+'/daIframe/daIframe.js', need:"da,daFx,daLoading" });						//缓存框架类
//-------------------------------------
daLoader.class('daFrame_CSS', {path: _p+'/daFrame/daFrame.css'});
daLoader.class('daFrame', {path: _p+'/daFrame/daFrame_source.js', need:"da,daDrag,daWheel,daFrame_CSS" });		//容器框架类
//-------------------------------------
daLoader.class('daWin_CSS', {path: _p+'/daWin/daWin.css' });
daLoader.class('daWin', {path: _p+'/daWin/daWin_source_1.2.js', need:"da,daFrame,daWin_CSS" });					//窗口 控件类
//-------------------------------------
daLoader.class('daButton_CSS', {path: _p+'/daButton/daButton.css' });
daLoader.class('daButton', {path: _p+'/daButton/daButton_source.js', need:"da,daButton_CSS" });					//按钮 控件类
//-------------------------------------
daLoader.class('daOption_CSS', {path: _p+'/daOption/daOption.css' });
daLoader.class('daOption', {path: _p+'/daOption/daOption.js', need:"da,daGif,daOption_CSS" });					//可选项 控件类
//-------------------------------------
daLoader.class('daList_CSS', {path: _p+'/daList/daList.css' });
daLoader.class('daList', {path: _p+'/daList/daList.js', need:"da,daFx,daKey,daList_CSS" });						//列表 控件类
//-------------------------------------
daLoader.class('daSelect_CSS', {path: _p+'/daSelect/daSelect.css' });
daLoader.class('daSelect', {path: _p+'/daSelect/daSelect2.0.js', need:"da,daGif,daList,daSelect_CSS" });			//下拉框 控件类
//-------------------------------------
daLoader.class('daInput_CSS', {path: _p+'/daInput/daInput.css' });
daLoader.class('daInput', {path: _p+'/daInput/daInput.js', need:"da,daGif,daKey,daList,daInput_CSS" });			//智能输入框 控件类
//-------------------------------------
daLoader.class('daTab_CSS', {path: _p+'/daTab/daTab.css' });
daLoader.class('daTab', {path: _p+'/daTab/daTab_source.js', need:"da,daTab_CSS" });								//Tab按钮 控件类
//-------------------------------------
daLoader.class('daTip_CSS', {path: _p+'/daTip/daTip.css' });
daLoader.class('daTip', {path: _p+'/daTip/daTip.js', need:"da,daTip_CSS" });										//ToolTip类
daLoader.class('daMenu', {path: _p+'/daTip/daMenu.js', need:"da,daTip" });										//右键菜单类
//-------------------------------------
daLoader.class('daCalendar_CSS', {path: _p+'/daCalendar/daCalendar.css' });
daLoader.class('daCalendar', {path: _p+'/daCalendar/daCalendar.js', need:"da,daTip,daCalendar_CSS" });			//日期控件类

//-------------------------------------
daLoader.class('daQuery', {path: _p+'/daQuery/daQuery.js', need:"da" });											//组合查询 控件类
daLoader.class('daValid', {path: _p+'/daValid/daValid_source.js', need:"da,daTip" });							//数据验证类
//-------------------------------------
daLoader.class('daMap_CSS', {path: _p+'/daMap/daMap.css' });
daLoader.class('daMap', {path: _p+'/daMap/daMap.js', need:"da,daFx,daDrag,daWheel,daKey,daLoading,daMap_CSS" });			//GIS地图 控件类


})();







