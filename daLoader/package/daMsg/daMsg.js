/*
	author:	danny.xu
	date:	2011-5-11 14:03:40
	description:	daMsg类( 操作状态提示框 )
*/

(function( win, undefined ){
var doc = win.document;

var daMsg = (function(){

//构造函数
/*
*/
var daMsg = function( setting ){
		return new daMsg.fnStruct.init( setting );
			
};

daMsg.fnStruct = daMsg.prototype = {
		version: "daMsg 1.0 \n\nauthor: danny.xu\n\ndate: 2011-5-11 14:06:15\n\n Thanks!",
		
		daPtId: 0,
		daPtObj: null,
		daPtParentObj: null,
		daPtTbObj: null,
		daPtMidObj: null,
		daPtCloseBtObj: null,
		
		setting: {
			parent: null,
			color: "#343434,#f7f7f7",										//背景颜色 和字体颜色，用“,”逗号分隔
			delay: 2000,
			html: "",
			
			css: {
					daMsg: "daMsg",
					tb: "daMsgTb",
					mid: "daMsgMid",
					closeBt: "closeBt"
			}
		},
		
		timerForDestroy: null,
		
	
		//daMsg初始化函数
		/*
			setting: 用户自定义参数列表
		*/
		init: function( setting ){
			if( !da.isPlainObj( setting ) ) setting = { html: setting };
			
			this.setting = setting = da.extend( true, {}, this.setting, setting );
			this.daPtParentObj = setting.parent || doc.body;
			
			this.isFx = !!da.fnStruct.act;
			
			while( null != doc.getElementById( this.daPtId ) ) this.daPtId++;
			
			this.create();
		
		},
		
		//提示框DOM创建函数
		/*
		*/
		create: function(){
			var setting = this.setting,
					daPtObj = doc.createElement("div");
			
			daPtObj.id = "daMsg_" + this.daPtId;
			daPtObj.className = setting.css.daMsg;
			
			daPtObj.innerHTML = [
					'<table id="daPtTb_', this.daPtId,'" class="daMsgTb" cellpadding="0" cellspacing="0">',
						'<tr>',
							'<td id="daPtMid_', this.daPtId,'" class="daMsgMid" >',
									setting.html,
							'</td>',
							'<td class="daMsgMid_right">',
									'<a id="daPtCloseBt_', this.daPtId,'" class="closeBt" href="javascript:void(0)"></a>',
							'</td>',
						'</tr>',
					'</table>'
			].join("");
			
			this.daPtObj = daPtObj;
			this.daPtParentObj.insertBefore( daPtObj, null );
			this.daPtObj.style.left = (da(win).width() - da( this.daPtObj ).width())/2 + "px";
		
		  this.daPtTbObj = doc.getElementById( "daPtTb_" + this.daPtId );
			this.daPtMidObj = doc.getElementById( "daPtMid_" + this.daPtId );
			this.daPtCloseBtObj = doc.getElementById( "daPtCloseBt_" + this.daPtId );
			
			
			this.bindEvent();
			this.show();
		},
		
		//daMsg事件绑定函数
		/*
		*/
		bindEvent: function(){
			var context = this;
			
			
			da( this.daPtCloseBtObj ).bind( "click", function(){
				if( context.isFx ){
					da( context.daPtObj ).clearQueue();
				}
				context.destroy();
					
			});
			
			da( this.daPtTbObj ).bind( "mouseover", function(){
				if( context.isFx ){
						da( context.daPtObj ).clearQueue();
				}
					
			}).bind( "mouseout", function(){
					context.destroy( context.setting.delay );
					
			});
			
		},
		
		//显示提示框
		show: function(){
			var context = this,
					h = da( this.daPtObj ).height();
			
			this.daPtObj.style.display = "block";
			
			if( this.isFx ){
				da( this.daPtObj ).css({ top: -50, opacity: 0 });
				
				da( this.daPtObj ).act({
					top: 10 + daMsg.height,
					opacity: 1
				},{
	        duration: 300,
	        complete: function(){
	        	context.destroy( context.setting.delay );
	        }
	        
				});
				
				daMsg.height = daMsg.height + h + 5;
				
			}
			else{
				da( this.daPtObj ).css({ top: 0, opacity: 1 });
				context.destroy( context.setting.delay );
			}
			
		},
		
		//隐藏提示框
		destroy: function( tDelay ){
			var context = this,
					h = da( this.daPtObj ).height();
			
			if( this.isFx ){
				if( tDelay ) { 
					da( this.daPtObj ).delay( tDelay );
				}
				
				da( this.daPtObj ).act({
					top: -50,
					opacity: 0
					
				},{ 
	        duration: 500,
	        complete: function(){
	        	if( !context.daPtObj ) return;
	        	
	        	context.daPtParentObj.removeChild( this );
	        	context.daPtObj = null;
	        	
						daMsg.height = daMsg.height - ( h + 5 );
	        }
	        
				});
				
			}
			else{
				if( tDelay ){
					if( this.timerForDestroy ) clearTimeout( this.timerForDestroy );
					
					this.timerForDestroy = setTimeout(function(){
		      	if( !context.daPtObj ) return;
		      	context.daPtParentObj.removeChild( context.daPtObj );
		      	context.daPtObj = null;
		      	
					}, tDelay);
					
				}
				else{
	      	if( !this.daPtObj ) return;
	      	
	      	this.daPtParentObj.removeChild( this.daPtObj );
	      	this.daPtObj = null;
					
				}
			}
			
		}
		
};

daMsg.height = 0;


//对象继承da类属性
daMsg.fnStruct.init.prototype = daMsg.prototype;

return daMsg;
})();



//全局变量
win.daMsg = daMsg;
	
} )( window );

/*** alert原型扩展 ***/
var alert2 = window.alert;

window.alert = function( msg ){
	daMsg( msg );
};