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
		return daButton.get( setting );
	
	return new daButton.fnStruct.init( setting );
};


//daButon原型
daButton.fnStruct = daButton.prototype = {
		version: "daButton 1.0 \n\nauthor: danny.xu\n\ndate: 2011-5-9 21:18:27\n\n Thanks!",
		
		id: 0,						//唯一序号
		obj: null,					//daButton中button 元素
		parentObj: null,			//daButton 父元素
		
		tableObj: null,				//daButton中table 元素
		containerObj: null,			//daButton中containerDiv 元素
		clientObj: null,			//daButton中clientDiv 客户自定义区域元素
		
		setting: {					//用户参数列表
			parent: null,			//daButton 父元素id
			id: null,				//daButton 用户自定义button id
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
				this.id = setting.id;
			else 
				//this.id = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daButton_" + this.id ) ) this.id++;						//保证id 唯一性
			
			this.parentObj = da( setting.parent );
			this.parentObj = 0 < this.parentObj.dom.length ? this.parentObj.dom[0] : doc.body;
			
			this.daBtArrColor = setting.color.split(",");

			this.create();
			
			if( !this.setting.width || !this.setting.height ) {
				var tmp = doc.createElement("DIV");
				tmp.style.cssText = "position:absolute;";
				doc.body.insertBefore( tmp );
				
				tmp.innerHTML = this.setting.html;
				this.setting.width = da(tmp).outerWidth();
				this.setting.height = da(tmp).outerHeight();
				
				da( tmp ).remove();
			}
			
			this.reSize();																																				//设置按钮尺寸
			this.html( this.setting.html );																												//设置用户自定内容
			this.bindEvent();																																			//绑定按钮事件
			
			daButton.cache( this );						//压入缓存
				
			return this;
		},
		
		//创建HTML对象集
		create: function(){
			var obj, sType;
			
			try {																																					//for IE
				sType = ( this.setting.name ? (' name="' + this.setting.name+'" '): '' ) + ( this.setting.type ? (' type="' + this.setting.type+'" '): '' );
			    obj = doc.createElement('<button '+ sType +' ></button>');
			} catch(e){}
			 
			if( !obj ) {																																	//for W3C
			    obj = doc.createElement('button');
			 
			    obj.setAttribute( 'type', 'button');
			    if( this.setting.name )
			    	obj.setAttribute( 'name', this.setting.name );
			}
			 
			
//      var obj = doc.createElement('<button type="'+ this.setting.type +'"></button>');							//for IE
//      obj.setAttribute( "type", this.setting.type );																								//for webkit
//					
			obj.className = this.setting.css.button;
			obj.id = this.setting.id || "daButton_" + this.id;
			obj.innerHTML = [
				'<table id="daBtTable_', this.id,'" class="tb_daButton" border="0" cellspacing="0" cellpadding="0">',
					'<tr>',
						'<td class="tl"></td>',
						'<td class="top"></td>',
						'<td class="tr"></td>',
					'</tr>',
					'<tr>',
						'<td class="left"></td>',
						'<td class="mid">',
							'<div id="daBtContainer_', this.id,'" class="container" >',
									'<div id="daBtClient_', this.id,'" class="client" ></div>',
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
			
			this.parentObj.insertBefore( obj );
			this.obj = obj;
			obj = null;
			
			this.tableObj = doc.getElementById( "daBtTable_" + this.id );									//获得对象集
			this.containerObj = doc.getElementById( "daBtContainer_" + this.id );
			this.clientObj = doc.getElementById( "daBtClient_" + this.id );

			if( "7.0" === da.browser.ie )
				this.containerObj.style.top = "2px";
			
		},
		
		//绑定事件
		bindEvent: function(){
			var setting = this.setting,
					context = this;
			
			da.each( ["mouseover","mouseout","mousedown","mouseup","click","dblclick"], function( idx, name ){
				if( !setting[name] || !da.isFunction( setting[name] ) ) return;
				
				da( context.obj ).bind( name, function( evt ){
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
			
			this.containerObj.style.width = width + "px";
			this.clientObj.style.width = width + "px";
			
			this.containerObj.style.height = height + "px";
			this.clientObj.style.height = height + "px";
		},
		
		//设置按钮用户自定义内容
		/*
			sHTML: 用户自定义HTML
		*/
		html: function( sHTML ){
			if( sHTML ){
				this.clientObj.innerHTML = sHTML;
				return this;
			}
			
			return this.clientObj.innerHTML;
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
				da(this.obj).fadeOut( 300 );
			else
				this.obj.style.display = "none";
		},
		
		
		/**显示按钮
		*/
		show: function(){
			if( "undefined" !== daFx )
				da(this.obj).fadeIn( 300 );
			else
				this.obj.style.display = "block";
		},
		
		//设置按钮为按下状态
		down: function(){
			this.tableObj.className = this.setting.css.tb3;
			this.tableObj.style.backgroundColor = this.daBtArrColor[2];
			
		},
		
		//设置按钮为弹起状态
		up: function(){
			this.tableObj.className = this.setting.css.tb;
			this.tableObj.style.backgroundColor = this.daBtArrColor[0];
			
		},
		
		//设置按钮为指向状态
		over: function(){
			this.tableObj.className = this.setting.css.tb2;
			this.tableObj.style.backgroundColor = this.daBtArrColor[1];
			
		},
		
		
		//设置按钮为离开状态
		out: function(){
			this.tableObj.className = this.setting.css.tb;
			this.tableObj.style.backgroundColor = this.daBtArrColor[0];
			
		},
		
		//设置为失去焦点状态
		blur: function(){
			this.obj.blur();
		},
		
		//设置为获取焦点状态
		focus: function(){
			this.obj.focus();
		},
		
		/**删除控件
		*/
		remove: function(){
			da(this.obj).remove();
			this.obj = null;
		}
		
};

daButton.fnStruct.init.prototype = daButton.prototype;


/**压入缓存
*/
daButton.cache = function( obj ){
	da._data( obj.obj, "daButton", obj );

};

/**通过id获取daButton对象
*/
daButton.get = function( id ){
	if( "string" === typeof id && 0 !== id.indexOf("#") ) id = "#" + id;				//修正id未加"#"
	
	var obj = da(id);
	if( 0 >= obj.dom.length ) return null;
	return da._data( obj.dom[0], "daButton" );
	
};

/**更改按钮对象尺寸
* @param {String|DOM} obj 用户传入的按钮对象 或id
* @param {int|String} width 按钮宽度
* @param {int|String} width 按钮高度
*/
daButton.reSize = function( obj, width, height ){
	if( "string" == typeof obj ){
		obj = daButton.get( obj );
	}
	else if( obj.nodeType ){
		obj = daButton.get( obj.id );
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
		obj = daButton.get( obj );
	}
	else if( obj.nodeType ){
		obj = daButton.get( obj.id );
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
daButton.convert = function( btObjs ){
	var da_btObjs = da( btObjs );
	
	da_btObjs.each(function(){
		var eventObjs = {}, eventType = "",
				obj = null;
				
		for( var n=0,len=inlineEvents.length; n<len; n++ ){						//copy写在input HTML代码上的内嵌事件定义
				eventType = "on" + inlineEvents[n];
				
				if( da.isFunction( this[ eventType ] ) )
					eventObjs[ inlineEvents[n] ] = this[ eventType ];
		}
		
		var params = {
			id: this.id,
			parent: this.parentNode.id || null,
			width: da( this ).outerWidth(),
			height: da( this ).outerHeight(),
			name: this.getAttribute("name"),
			html: ( this.value || this.innerHTML )
		};
		
		params = da.extend( {}, params, eventObjs );
		
		obj = daButton( params );																	//生成daButton对象并替换input控件
		
		this.parentNode.replaceChild( obj.obj, this );
	});
	
};


win.daButton = win.dadaBt = daButton;


})(window);


////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input,button").each(function( idx, obj ){
//		if( "INPUT" === this.tagName ){
//			if( "button" === this.type )															//过滤出属于button类型的input控件
//				daButton.convert( this );															//转换
//		}
//		else{
//			daButton.convert( this );																//转换
//			
//		}
//	});
//	
//});


function convertbutton(btObjs){
	daButton.convert( btObjs );									//转换
}
