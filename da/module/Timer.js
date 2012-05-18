/***************** Timer *******************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: ȫ�ּ�ʱ��
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
				
				for(var i=0,len=da.queueHandle.length; i<len; i++){			//ѭ��timer����
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
		
		/**�����հ���װ��setInterval �� setTimeout������ͨ��call��Ƕ��this�����ģ�thisĬ��Ϊda�� ��
		* delay ִ����ʱ( Ĭ������setTimeout����ӡ�_loop����׺����setInterval )
		* fn �Զ���ص�����
		* params �ص��������
		*/
		timer: function( /*delay, fn, params*/ ){
			if( 2 > arguments.length ) return;
			if( !da.isFunction( arguments[1] ) ) return;
			
			var arrTmp = arguments[0].toString().split("_");
			
			var item = {
				type: (arrTmp[1] && "loop" == arrTmp[1]) ? "keep" : "timer",		//����
				delay: parseInt(arrTmp[0],10) || 13,								//����
				prevTime: new Date().getTime(),										//��һ��ִ��ʱ��
				handle: arguments[1],												//�Զ��崦����
				params: [].slice.call( arguments, 2 )								//�޳�ǰ����������
			};

			da.queueHandle.push( item );
			da.startHandle();
			
			return da.queueHandle.length -1;
		},
		
		/**�����հ���װ��setInterval������ͨ��call��Ƕ��this�����ģ�thisĬ��Ϊda�� ��
		* delay ִ����ʱ
		* fn	�Զ���ص�����s
		* params �ص��������
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

