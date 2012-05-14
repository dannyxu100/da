﻿/**daWheel
*鼠标滚轮事件处理类
* @author danny.xu
* @version daWheel_1.0 2011-8-14 9:10:25
*/
(function(g,h){var j=g.document;var k=(function(){var f=function(a){return new f.fnStruct.init(a)};f.fnStruct=f.prototype={version:"daWheel v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",daWheelSrc:null,setting:{target:null,before:null,up:null,down:null,after:null},init:function(a){this.setting=a=da.extend(true,{},this.setting,a);this.daWheelSrc=da(a.target);if(0>=this.daWheelSrc.dom[0].length){alert("daWheel提示:找不到滚动事件对象。");return}this.bind()},bind:function(){var b=this,fnBefore=this.setting.before,fnUp=this.setting.up,fnDown=this.setting.down,fnAfter=this.setting.after,mousewheel=da.browser.firefox?"DOMMouseScroll":"mousewheel";this.daWheelSrc.bind(mousewheel,this.eventWheel=function(a){if(fnBefore)fnBefore.call(this,a,b);if(a.wheelDelta){if(a.wheelDelta>0&&fnUp)fnUp.call(this,a,a.wheelDelta/120,b);else if(fnDown)fnDown.call(this,a,-a.wheelDelta/120,b)}else if(a.detail){if(a.detail<0&&fnUp)fnUp.call(this,a,-a.detail/3,b);else if(fnDown)fnDown.call(this,a,a.detail/3,b)}if(fnAfter)fnAfter.call(this,a,b);a.stopPropagation();a.preventDefault()});this.daWheelSrc.daWheelObj=this}};f.fnStruct.init.prototype=f.prototype;f.unbind=function(c){var d=da(c);if(0<d.dom.length){var e=da.browser.firefox?"DOMMouseScroll":"mousewheel";d.each(function(i,a){var b=this.daWheelObj;if(b){da(this).unbind(e,b.eventWheel);this.daWheelObj=null}})}};return f})();g.daWheel=k})(window);