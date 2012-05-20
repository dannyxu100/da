/**daGif
*逐帧动画类
* @author danny.xu
* @version daGif_1.0 2011-10-28 22:32:25
*/
(function( win, undefined ){
var doc = win.document;

/********* 为了让da.fnStruct.act()支持backgroundPosition属性需要修补一些东东 ************/
if(!document.defaultView || !document.defaultView.getComputedStyle){ 												//兼容backgroundPositionX
	var oldCurCSS = da.curCSS;
	da.curCSS = function(elem, name, force){
		if(name === 'background-position'){
			name = 'backgroundPosition';
		}
		if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
			return oldCurCSS.apply(this, arguments);
		}
		var style = elem.style;
		if ( !force && style && style[ name ] ){
			return style[ name ];
		}
		return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
	};
}
/***  修补da.fnStruct.act()  ***/
var oldAct = da.fnStruct.act;
da.fnStruct.act = function(prop){
	if('background-position' in prop){
		prop.backgroundPosition = prop['background-position'];
		delete prop['background-position'];
	}
	if('backgroundPosition' in prop){
		prop.backgroundPosition = '('+ prop.backgroundPosition;
	}
	return oldAct.apply(this, arguments);
};

/**将backgroundPosition字符串值转为数组格式
*/
function _BgPositionToArray( strg ){
	strg = strg.replace(/left|top/g,'0px');
	strg = strg.replace(/right|bottom/g,'100%');
	strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
	var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
	return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
}

/**给daFx类静态成员step()函数添加backgroundPosition特殊属性处理函数
*/
daFx.step.backgroundPosition = function( daFxObj ) {
	if (!daFxObj.bgPosReady) {
		var start = da.curCSS(daFxObj.elem,'backgroundPosition');
		if(!start){//FF2 no inline-style fallback
			start = '0px 0px';
		}
		
		start = _BgPositionToArray(start);
		daFxObj.start = [start[0],start[2]];
		
		var end = _BgPositionToArray(daFxObj.end);
		daFxObj.end = [end[0],end[2]];
		
		daFxObj.unit = [end[1],end[3]];
		daFxObj.bgPosReady = true;
	}
	//return;
	var nowPosX = [];
	nowPosX[0] = ((daFxObj.end[0] - daFxObj.start[0]) * daFxObj.pos) + daFxObj.start[0];
	nowPosX[1] = ((daFxObj.end[1] - daFxObj.start[1]) * daFxObj.pos) + daFxObj.start[1];
	
	daFxObj.elem.style.backgroundPosition = nowPosX[0] + daFxObj.unit[0] + ' ' + nowPosX[1] + daFxObj.unit[1];

};

/**
* params {float} x 已执行时长占总时长比例
* params {int} t 已执行时长 current time
* params {int} b 初始值0 begInnIng value
* params {int} c 目标值1 change In value
* params {int} d 总时长 duration
*/
daFx.easing['daGif'] = function (x, t, b, c, d) {
//	if(  ){
//		
//	}
//	else return 
};

var daGif = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daGif = function( gifSetting ){
		return new daGif.fnStruct.init( gifSetting );
	};

	daGif.fnStruct = daGif.prototype = {
		version: "daGif v1.0 \nauthor: danny.xu \ndate: 2011-10-28 22:32:28",
		
		daObj: null,

		gifTime: 0,															//一次完整播放总时间
		gifNowStep: 0,													//当前播放到第几帧
		gifNowTime: 0,													//当前播放时间
		
		isStop: true,														//是否处于暂停状态
		
		gifSetting: {
			target: null,													//动画对象
			src: "", 															//被播放图片的路径
			width: 0, 														//每一帧的宽度
			height: 0, 													//每一帧的高度
			top: "0px", 													//竖直方向的背景图位置
			all: 0,										 						//总共有多少帧
			first: 1,													 		//起始帧数
			speed: 25,											 			//每秒播放的帧速fps
			isAuto: true, 												//是否立即播放
			isBack: false, 												//是否按倒序播放
			isLoop: false													//是否循环播放
		},
		
		/**初始化函数
		*/
		init: function( gifSetting ){
			gifSetting = this.gifSetting = da.extend( {}, this.gifSetting, gifSetting );
			
			if( !gifSetting.all ){ alert("daGif温馨提示：您未传入动画总帧数。"); return false; }
			
			this.daObj = da( gifSetting.target );
			if( 0 >= this.daObj.dom.length ){ alert("daGif温馨提示：没有找到您需要播放逐帧动画的对象。"); return false; }
			
			if( gifSetting.src ){
				this.daObj.dom[0].style.backgroundImage = "url("+ gifSetting.src +")";
				this.daObj.dom[0].style.backgroundRepeat = "no-repeat";
			}
			else if( "" === this.daObj.css( "backgroundImage" ) ){
				alert("daGif温馨提示：您传入的动画图片地址有误。"); return false;
			}
			
			this.daObj.dom[0].style.width = gifSetting.width +"px";
			this.daObj.dom[0].style.height = gifSetting.height +"px";
			
			
			this.setSpeed();
			
			if( gifSetting.isAuto )
				this.replay();
			else
				this.isStop = true;
				
		},
		

		/**daGif对象播放
		* @param {Boolean} isAfresh 是否重头播放，默认为继续上一次播放
		*/
		play: function( isAfresh ){
			if( !this.isStop ) return;
			
			this.isStop = false;
			
			var gifSetting = this.gifSetting,
					fromLeft = 0,
					toLeft = -( gifSetting.all - 1 )*gifSetting.width,
					nTime;
			
			
			if( isAfresh || 0 === this.gifTime ){											 //重头播放/第一次播放
				this.daObj.stop();
				nTime = this.gifTime;
				
				if( gifSetting.isBack ){																 //倒播起止交换
					var tmp = fromLeft;
					fromLeft = toLeft;
					toLeft = tmp;
				}
			}
			else{
				fromLeft = this.gifNowStep * gifSetting.width;						//当前帧位置
				nTime = this.gifTime - this.gifNowTime;										//剩余时间
				
				if( gifSetting.isBack ){																 //倒播起止交换
					toLeft = 0;
				}
			}
			
			this.daObj.dom[0].style.backgroundPosition = fromLeft +"px "+ gifSetting.top;
			
			var context = this;
			this.daObj.act({
				backgroundPosition: ( toLeft + "px " + gifSetting.top )
			},{
				duration: nTime,
				step: function( nowVal, daFxObj ){
					//TODO:预留
				},
				update: function( daFxObj ){
					if (!daFxObj.bgPosReady) {
						var start = da.curCSS(daFxObj.elem,'backgroundPosition');
						if(!start){																									//FF2 no inline-style fallback
							start = '0px 0px';
						}
						
						start = _BgPositionToArray(start);
						daFxObj.start = [start[0],start[2]];
						
						var end = _BgPositionToArray(daFxObj.end);
						daFxObj.end = [end[0],end[2]];
						
						daFxObj.unit = [end[1],end[3]];
						daFxObj.bgPosReady = true;
					}
					//return;
					var nowPosX = [];
					nowPosX[0] = ((daFxObj.end[0] - daFxObj.start[0]) * daFxObj.pos) + daFxObj.start[0];
					nowPosX[1] = ((daFxObj.end[1] - daFxObj.start[1]) * daFxObj.pos) + daFxObj.start[1];
					
					context.gifNowTime = context.gifTime * daFxObj.pos;
					context.gifNowStep = parseInt( nowPosX[0]/gifSetting.width );
					
					nowPosX[0] = context.gifNowStep * gifSetting.width;
					
					daFxObj.elem.style.backgroundPosition = nowPosX[0] + daFxObj.unit[0] + ' ' + nowPosX[1] + daFxObj.unit[1];
					
				},
				complete: function(){
					context.isStop = true;
					
					context.gifNowTime = 0;										//一次播放完毕，重置当前帧/当前播放时间
					if( gifSetting.isBack )
						context.gifNowStep = -gifSetting.all;	
					else
						context.gifNowStep = 0;	
					
					
					if( gifSetting.isLoop )
						context.play();
						
				}
				
			});
		
		},
		
		/**重播
		*/
		replay: function(){
			this.isStop = true;
			this.play( true );
		},
		
		/**终止目标元素的播放动画
		* @param {Boolean} clearQueue 是否清空元素对应的队列缓存
		* @param {Boolean} gotoEnd 是否直接设置为动画完成状态
		*/
		stop: function( clearQueue, gotoEnd ){
			this.daObj.stop( clearQueue, gotoEnd );
			this.isStop = true;
		},
		
		/**倒带播放
		*/
		backplay: function( isBack ){
			this.gifSetting.isBack = isBack || !this.gifSetting.isBack;
			this.play(true);
			
		},
		
		/**帧跳转
		*/
		go: function( nStep ){
			var gifSetting = this.gifSetting;
			
			this.stop();
			this.gifNowStep = -nStep || 0;
			
			this.daObj.dom[0].style.backgroundPosition = ( this.gifNowStep * gifSetting.width ) +"px "+ gifSetting.top;
			
		},
	
		/**设置速度
		*/
		setSpeed: function( newSpeed ){
			newSpeed = newSpeed || this.gifSetting.speed;
			
			this.tOneStep = 1000/newSpeed;																	//一帧时间
			this.gifTime = this.gifSetting.all * this.tOneStep;	 						//一次播放总时间
			
			if( !this.isStop )																							//设置完速度后，如果动画正在播，就重播。
				this.replay();
			
		}
		
	};

	daGif.fnStruct.init.prototype = daGif.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daGif;
})();


win.daGif = daGif;

})(window);