/*
	author: danny.xu
	date: 	2011-5-9 13:45:03
	discription:	增强版按钮daButton	
*/
(function( win ){

var doc = win.document;

//daButtong构造函数
var daButton = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//遍历和查找daOption控件的高级快捷用法
			return daButton.getButton( setting );
		
		return new daButton.fnStruct.init( setting );
};


//daButon原型
daButton.fnStruct = daButton.prototype = {
		version: "daButton 1.0 \n\nauthor: danny.xu\n\ndate: 2011-5-9 21:18:27\n\n Thanks!",
		
		bId: 0,										//唯一序号
		bObj: null,								//daButton中button 元素
		bParentObj: null,					//daButton 父元素
		
		bTableObj: null,					//daButton中table 元素
		bContainerObj: null,			//daButton中containerDiv 元素
//		bOverObj: null,						//daButton中overDiv 模拟高亮元素
		bClientObj: null,					//daButton中clientDiv 客户自定义区域元素
		
		setting: {								//用户参数列表
			parent: null,								//daButton 父元素id
			id: null,										//daButton 用户自定义button id
			width: 0,
			height: 0,
			color: "#c2c2c2,#949494,#999",									//用户自定义风格颜色[ 正常，鼠标移上，按下 ]RGB用逗号分隔
			html: "按&nbsp;&nbsp;钮",												//用户自定义内容
			
			name: "",
			type: "button",																	//按钮类型button|reset|submit
			
			css: {											//用户自定义样式
				button: "daButton",
				tb: "tb_daButton",
				tb2: "tb_daButton2",
				tb3: "tb_daButton3"
			},
			
			click: null,								//用户自定义事件引用
			dblclick: null,
			mouseover: da.noop,
			mouseout: da.noop,
			mousedown: da.noop,
			mouseup: da.noop
			
		},
		
		daBtArrColor: null,						//当前颜色风格
		isStopDefault: false,					//是否阻止按钮默认事件
		maxheight: 100,								//按钮的最大高度
		
		//出事化函数
		/*
			setting: 用户自定义参数列表
		*/
		init: function( setting ){
			this.setting = setting = da.extend( true, {}, this.setting, setting);
			
			if( setting.id )
				this.bId = setting.id;
			else 
				//this.bId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daBtButton_" + this.bId ) ) this.bId++;						//保证id 唯一性
			
			this.bParentObj = da( setting.parent );
			this.bParentObj = 0 < this.bParentObj.dom.length ? this.bParentObj.dom[0] : doc.body;
			
			this.daBtArrColor = setting.color.split(",");

			this.create();
			
			if( !this.setting.width || !this.setting.height ) {
				var tmp = doc.createElement("DIV");
				tmp.style.cssText = "position:absolute;padding:3px;";
				doc.body.insertBefore( tmp );
				
				tmp.innerHTML = this.setting.html;
				this.setting.width = da(tmp).width();
				this.setting.height = da(tmp).height();
				
				da( tmp ).remove();
			}
			
			this.reSize();																																//设置按钮尺寸
			this.html( this.setting.html );																												//设置用户自定内容
			this.bindEvent();																															//绑定按钮事件
			
			daButton.pushCache( this );						//压入缓存
				
			return this;
		},
		
		//创建HTML对象集
		create: function(){
			var bObj, sType;
			
			try {																																					//for IE
					sType = ( this.setting.name ? (' name="' + this.setting.name+'" '): '' ) + ( this.setting.type ? (' type="' + this.setting.type+'" '): '' );
			    bObj = doc.createElement('<button '+ sType +' ></button>');
			} catch(e){}
			 
			if( !bObj ) {																																	//for W3C
			    bObj = doc.createElement('button');
			 
			    bObj.setAttribute( 'type', 'button');
			    if( this.setting.name )
			    	bObj.setAttribute( 'name', this.setting.name );
			}
			 
			
//      var bObj = doc.createElement('<button type="'+ this.setting.type +'"></button>');							//for IE
//      bObj.setAttribute( "type", this.setting.type );																								//for webkit
//					
			bObj.className = this.setting.css.button;
			bObj.id = this.setting.id || "daBtButton_" + this.bId;
			da(bObj).attr( "daButton", 0 );
			bObj.innerHTML = [
					'<table id="daBtTable_', this.bId,'" class="tb_daButton" border="0" cellspacing="0" cellpadding="0">',
						'<tr>',
							'<td class="tl"></td>',
							'<td class="top"></td>',
							'<td class="tr"></td>',
						'</tr>',
						'<tr>',
							'<td class="left"></td>',
							'<td class="mid">',
								'<div id="daBtContainer_', this.bId,'" class="container" >',
										'<div id="daBtClient_', this.bId,'" class="client" ></div>',
								'</div>',
							'</td>',
							'<td class="right"></td>',
						'</tr>',
						'<tr>',
							'<td class="bl"></td>',
							'<td class="bottom"></td>',
							'<td class="br"></td>',
						'</tr>',
					'</table>',
			].join("");
			
			this.bParentObj.insertBefore( bObj );
			this.bObj = bObj;
			bObj = null;
			
			this.bTableObj = doc.getElementById( "daBtTable_" + this.bId );									//获得对象集
			this.bContainerObj = doc.getElementById( "daBtContainer_" + this.bId );
			this.bClientObj = doc.getElementById( "daBtClient_" + this.bId );

			if( "7.0" === da.browser.ie )
				this.bContainerObj.style.top = "2px";
			
		},
		
		//绑定事件
		bindEvent: function(){
			var setting = this.setting,
					context = this;
			
			da.each( ["mouseover","mouseout","mousedown","mouseup","click","dblclick"], function( idx, name ){
				if( !setting[name] || !da.isFunction( setting[name] ) ) return;
				
				da( context.bObj ).bind( name, function( evt ){
					if( false === setting[name].call( this, evt, context  ) || context.isStopDefault ) return;						//如果用户自定义事件函数返回 false 或 daButton对象阻止默认事件冒泡，就不执行下面的默认事件处理了
					
					switch( name ){																							//按钮默认高亮特效事件处理
							case "mouseover":
								context.over();
								break;
							case "mouseout":
								context.out();
								break;
							case "mousedown":
								context.down();
								break;
							case "mouseup":
								context.up();
								context.blur();
								break;
					}
					
				});
			});
			
		},
		
		//设置是否阻止默认事件
		/*
			isStopDefault: 是否阻止默认事件标志，可选bool
		*/
		setStopDefault: function( isStopDefault ){
			this.isStopDefault = da.isNull( isStopDefault, false );
		},
		
		//设置按钮尺寸
		/*
			width: 宽度
			height: 高度
		*/
		reSize: function( width, height ){
			width = ( width || this.setting.width ).toString();
			height = ( height || this.setting.height ).toString();

			width = width.replace("px","");
			height = height.replace("px","");

			height = parseInt( this.maxheight < height ? this.maxheight : height, 10 );							//纠正高度，不能高于样式最大支持高度
			
			this.bContainerObj.style.width = width + "px";
			this.bClientObj.style.width = width + "px";
			
			this.bContainerObj.style.height = height + "px";
			this.bClientObj.style.height = height + "px";
		},
		
		//设置按钮用户自定义内容
		/*
			sHTML: 用户自定义HTML
		*/
		html: function( sHTML ){
			if( sHTML ){
				this.bClientObj.innerHTML = sHTML;
				return this;
			}
			
			return this.bClientObj.innerHTML;
		},
		
		//设置按钮颜色风格
		/*
			sColor: 用户自定义风格颜色[ 正常，鼠标移上，按下 ]RGB用逗号分隔
		*/
		color: function( sColor ){
			this.setting.color = sColor;
			this.daBtArrColor = sColor.split(",");
		},
		
		
		/**隐藏按钮
		*/
		hide: function(){
			if( "undefined" !== daFx )
				da(this.bObj).fadeOut( 300 );
			else
				this.bObj.style.display = "none";
		},
		
		
		/**显示按钮
		*/
		show: function(){
			if( "undefined" !== daFx )
				da(this.bObj).fadeIn( 300 );
			else
				this.bObj.style.display = "block";
		},
		
		//设置按钮为按下状态
		down: function(){
			this.bTableObj.className = this.setting.css.tb3;
			this.bTableObj.style.backgroundColor = this.daBtArrColor[2];
			
		},
		
		//设置按钮为弹起状态
		up: function(){
			this.bTableObj.className = this.setting.css.tb;
			this.bTableObj.style.backgroundColor = this.daBtArrColor[0];
			
		},
		
		//设置按钮为指向状态
		over: function(){
			this.bTableObj.className = this.setting.css.tb2;
			this.bTableObj.style.backgroundColor = this.daBtArrColor[1];
			
		},
		
		
		//设置按钮为离开状态
		out: function(){
			this.bTableObj.className = this.setting.css.tb;
			this.bTableObj.style.backgroundColor = this.daBtArrColor[0];
			
		},
		
		//设置为失去焦点状态
		blur: function(){
			this.bObj.blur();
		},
		
		//设置为获取焦点状态
		focus: function(){
			this.bObj.focus();
		}
		
};

daButton.fnStruct.init.prototype = daButton.prototype;


/**全局缓存
*/
//daButton.daButtonCache = {};

/**压入缓存
*/
daButton.pushCache = function( obj ){
	da.data( obj.bObj, "daButtonObj", obj );

//	var cache = daButton.daButtonCache;
//	cache[ obj.bId ] = obj;
	
};

/**通过id获取daButton对象
*/
daButton.getButton = function( id ){
	if( "string" === typeof id && 0 !== id.indexOf("#") ) id = "#" + id;				//修正id未加"#"
	
	var btObj = da(id);
	if( 0 >= btObj.dom.length ) return null;
	return da.data( btObj.dom[0], "daButtonObj" );
	
//	var cache = daButton.daButtonCache;
//
//	if( "string" === typeof id ){
//		id = id.replace( "#", "" );
//		return cache[id];
//		
//	}
//	else if( da.isFunction( id ) ){
//		da.each( cache, function( id, obj ){
//			return id.call( this, id );
//		});
//		
//		return cache;
//	}
	
};

/**更改按钮对象尺寸
*	@param {String|DOM} obj 用户传入的按钮对象 或id
* @param {int|String} width 按钮宽度
* @param {int|String} width 按钮高度
*/
daButton.reSize = function( obj, width, height ){
	if( "string" == typeof obj ){
		obj = daButton.getButton( obj );
	}
	else if( obj.nodeType ){
		obj = daButton.getButton( obj.id );
	}
	
	if( null === obj )	return null;

	obj.reSize( width, height );
	return obj;
};


/*更改按钮对象的标题内容
*	@param {String|DOM} obj 用户传入的按钮对象 或id
* @param {String} html 标题内容代码
*/
daButton.html = function( obj, html ){
	if( "string" == typeof obj ){
		obj = daButton.getButton( obj );
	}
	else if( obj.nodeType ){
		obj = daButton.getButton( obj.id );
	}

	if( !obj ) return null;

	return obj.html( html );
	
};


/************ daButton 静态成员 *******************/
inlineEvents = ["mouseover","mouseout","mousedown","mouseup","click","dblclick"];

//将普通input button类型的按钮 转换为daButton类型
/*
	btObjs: 用户传入的按钮对象
*/
daButton.toButton = function( btObjs ){
	var da_btObjs = da( btObjs );
	
	da_btObjs.each(function(){
		if( 0 == da(this).attr( "daButton" ) ) return;
	
		var eventObjs = {}, eventType = "",
				bObj = null;
				
		for( var n=0,len=inlineEvents.length; n<len; n++ ){						//copy写在input HTML代码上的内嵌事件定义
				eventType = "on" + inlineEvents[n];
				
				if( da.isFunction( this[ eventType ] ) )
					eventObjs[ inlineEvents[n] ] = this[ eventType ];
		}
		
		var params = {
			id: this.id,
			parent: this.parentNode.id || null,
			width: da( this ).width(),
			height: da( this ).height(),
			html: ( this.value || this.innerHTML )
		};
		
		params = da.extend( {}, params, eventObjs );
		
		bObj = daButton( params );																	//生成daButton对象并替换input控件
		
		this.parentNode.replaceChild( bObj.bObj, this );
	});
	
};


win.daButton = win.dadaBt = daButton;


})(window);


////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input,button").each(function( idx, obj ){
//		if( "INPUT" === this.tagName ){
//			if( "button" === this.type )															//过滤出属于button类型的input控件
//				daButton.toButton( this );															//转换
//		}
//		else{
//			daButton.toButton( this );																//转换
//			
//		}
//	});
//	
//});


function convertbutton(btObjs){
	daButton.toButton( btObjs );									//转换
}