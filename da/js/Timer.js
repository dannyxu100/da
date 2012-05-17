/***************** Timer *******************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 全局计时器
	version: 1.0.0
*/
(function(da){
	da.extend({
		queueHandle: [],
		timer_queueHandle: null,
		
		startHandle: function(){
			var context = this;
			
			da.timer_queueHandle = setInterval(function(){
				if( 0 >= da.queueHandle.length ) da.stopHandle();
				
				var timeNow = new Date().getTime(),
					item;
				
				for(var i=0,len=da.queueHandle.length; i<len; i++){			//循环timer队列
					item = da.queueHandle[i];

					if( item && item.delay <= (timeNow - item.prevTime ) ){
						item.handle.apply( context, item.params );
						
						if( "timer" === item.type ){
							da.queueHandle.splice(i, 1);
						}
						else if( "keep" === item.type ){
							item.prevTime = new Date().getTime();
						}
					}
				}
			});
		},
		
		stopHandle: function(){
			da.queueHandle = [];
			if( da.timer_queueHandle ) clearInterval( da.timer_queueHandle );
		},
		
		/**启动闭包封装的setInterval 或 setTimeout（可以通过call的嵌入this上下文，this默认为da类 ）
		* delay 执行延时( 默认启动setTimeout，添加“_loop”后缀启动setInterval )
		* fn 自定义回调函数
		* params 回调传入参数
		*/
		timer: function( /*delay, fn, params*/ ){
			if( 2 > arguments.length ) return;
			if( !da.isFunction( arguments[1] ) ) return;
			
			var arrTmp = arguments[0].toString().split("_");
			
			var item = {
				type: (arrTmp[1] && "loop" == arrTmp[1]) ? "keep" : "timer",		//类型
				delay: parseInt(arrTmp[0],10) || 13,								//周期
				prevTime: new Date().getTime(),										//上一次执行时间
				handle: arguments[1],												//自定义处理函数
				params: [].slice.call( arguments, 2 )								//剔除前两个个参数
			};

			da.queueHandle.push( item );
			da.startHandle();
			
			return da.queueHandle.length -1;
		},
		
		/**启动闭包封装的setInterval（可以通过call的嵌入this上下文，this默认为da类 ）
		* delay 执行延时
		* fn	自定义回调函数s
		* params 回调传入参数
		*/
		keep: function( /*delay, fn, params*/ ){
			arguments[0] += "_loop";
			return da.timer.apply( this, arguments );
		},
		
		clearTimer: function( idx ){
			da.queueHandle.splice(idx, 1);
		},

		clearKeep: function( idx ){
			da.queueHandle.splice(idx, 1);
		}

	});
	

})(da);

