/*
	author: danny.xu
	date:	2011/11/19
	discription: daOption自定义选项控件
*/
( function( win, undefined ){
var doc = win.document;

var daOption = (function(){

	var daOption = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//遍历和查找daOption控件的高级快捷用法
			return daOption.getOption( setting );
		
		return new daOption.fnStruct.init( setting );
	};
	
	daOption.fnStruct = daOption.prototype = {
		
		oId: 0,										//唯一序号
		oObj: null,
		oParentObj: null,
		
		oInput: null,
		oIcon: null,
		oText: null,
		
		setting: {
			parent: "",												//daOption 父元素id
			id: "",
			
			type: "radio",
			name: "",
			checked: false,										//是否为选中状态
			value: "",												//可选项对应的值
			text: "",													//默认提示项
			
			color: "#fff",										//用户自定义风格颜色RGB
			bg: "#09c",
			unRadio: false,										//是否允许取消选中单选按钮
			
			css: {
				daOption: "daOption",
				daOptionHover: "daOption2",
				daOptionChecked: "daOption3",
				checkbox: "checkbox",
				radio: "radio",
				text: "text"
			}
			
		},
		
		value: "",
		text: "",
		
		version: "daOption v1.0 danny.xu 2011/11/19",
		
		/**初始化函数
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );

			this.oParentObj = da( setting.parent );
			this.oParentObj = 0 < this.oParentObj.dom.length ? this.oParentObj.dom[0] : doc.body;
			
			if( setting.id )
				this.oId = setting.id;
			else 
				//this.daBtId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daOption_" + this.oId ) ) this.oId++;						//保证id 唯一性
			
			setting.type = "radio" === setting.type ? "radio" : "checkbox";													//校正type,checked值
			setting.checked = !!setting.checked;
			
			this.value = this.setting.value;
			this.text = this.setting.text;
			
			this.create();
			this.bindEvent();
			this.check( setting.checked );												//设置原始控件选中状态
			
			daOption.pushCache( this );
		},
		
		
		/**创建UI元素
		*/
		create: function(){
			var setting = this.setting,
					oId = this.oId,
					oObj, oInput, oIcon, oText;
			
			oObj = doc.createElement("span");											//daOption控件容器
			oObj.id = "daOption_" + oId;
			oObj.className = setting.css.daOption;
//			oObj.style.backgroundColor = setting.color;
			oObj.style.display = "inline-block";
			this.oObj = oObj;
			this.oParentObj.insertBefore( oObj );
			
			oText = doc.createElement("span");										//可选项提示信息标签
			oText.className = setting.css.text;
			oText.innerHTML = setting.text;
			this.oText = oText;
			this.oObj.insertBefore( oText );
			
			if( da.browser.ie )																		//创建浏览器原始控件
				oInput = doc.createElement('<input type="'+ setting.type +'" name="'+ (setting.name||oId) +'" />');
			else{
				oInput = doc.createElement('input');
				oInput.type = setting.type;
				oInput.name = setting.name||oId;
			}
			oInput.id = oId;
			oInput.value = setting.value;
			this.oInput = oInput;
			this.oObj.insertBefore( oInput );
			oInput.style.display = "none";												//隐藏原始控件
//			oInput.checked = setting.checked;											//设置原始控件选中状态
			
			oIcon = doc.createElement("span");										//创建daOption控件UI小图标
			oIcon.className = setting.css[setting.type];
			oIcon.style.display = "inline-block";
			this.oIcon = oIcon;
			this.oObj.insertBefore( oIcon );
			
			this.reSize();
		},
		
		/**重置daOption控件尺寸
		*/
		reSize: function(){
			da( this.oObj ).width( da( this.oText ).width() + da( this.oIcon ).width()+3 );						//padding-left +3
		},
		
		/**绑定事件
		*/
		bindEvent: function(){
			var setting = this.setting,
					context = this;
			
			da( this.oObj ).bind("mouseover",function(){
				if( setting.css.daOption === this.className ){
					this.className = setting.css.daOptionHover;
					this.style.backgroundColor = setting.bg;
					context.oText.style.color = setting.color;
				}
				
			}).bind("mouseout",function(){
				if( setting.css.daOptionHover === this.className ){
					this.className = setting.css.daOption;
					this.style.backgroundColor = "";
					context.oText.style.color = "";
				}
			}).bind("click",function(){
				if( !context.oInput.checked ){
					context.check( true );
				}
				else{
					context.check( false );
				}
				
			});
		},
		
		/**显示daOption控件
		* params {Function} fn 淡入显示动画执行完毕后，回调函数
		*/
		show: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.oObj ).fadeIn( 300 ,fn );
			else
				this.oObj.style.display = "block";
		},
		
		/**隐藏daOption控件
		* params {Function} fn 淡出隐藏动画执行完毕后，回调函数
		*/
		hide: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.oObj ).fadeOut( 300 ,fn );
			else
				this.oObj.style.display = "none";
		},
		
		/**移除daOption控件
		*/
		remove: function(){
			daOption.popCache( this );
			
			if( this.oObj ){
				var context = this;
				this.hide(function(){
					context.oParentObj.removeChild( context.oObj );
					context.oObj = null;
				});
			}
		},
		
		/**重置daOption控件的提示信息
		*/
		text: function(){
		
		},
		
		/**重置daOption控件的风格颜色
		*/
		color: function( bg, sColor ){
			if( undefined !== bg )	this.setting.bg = bg;
			if( undefined !== sColor )	this.setting.color = sColor;
			
			if( obj.oInput.checked ){
				this.oObj.style.backgroundColor = bg;
				this.oText.style.color = sColor;
			}
		},
		
		
		/**选择状态控制
		* params {boolean} toChecked 是否为选中
		*/
		check: function( toChecked ){
			toChecked = !!toChecked;								//校正toChecked值
			var setting = this.setting,
					context = this;
			
			var checkAct = function( obj, type, status ){
				if( "undefined" === typeof daGif ) return;
				
				obj.oInput.checked = status;
				if( status ){
					obj.oObj.className = setting.css.daOptionChecked;
					obj.oObj.style.backgroundColor = setting.bg;
					obj.oText.style.color = setting.color;
				}
				else{
					obj.oObj.className = setting.css.daOption;
					obj.oObj.style.backgroundColor = "";
					obj.oText.style.color = "";
				}
				
	 			daGif({
	 				target: obj.oIcon,
//	 				src: "images/daOption.png",
	 				all: 6,
	 				speed: 25,
	 				top: "radio" === type ? "-16px" : "0px",
	 				width:16,
	 				height:16,
					isBack: !status
					
	 			});
			};
			
			if( "radio" === setting.type ){															//radio单选控件处理
				var theName = setting.name;
				
				if( toChecked && !context.oInput.checked ){								//单选控件，所以如果已经是选中状态，就不必管他了
					daOption.getOption(function( id ){											//找到所有同组的单选控件，并取消选中状态
						if( "radio" === this.setting.type 										//是单选控件
						&& theName === this.setting.name 											//是同组
						&& this.oInput.checked 																//是选中状态
						&& id !== context.oId ){															//并且不是当前控件
							checkAct( this, "radio", false );
						}
					});
					
					checkAct( context, "radio", true );											//设置当前控件
				}
				else if( setting.unRadio && !toChecked && context.oInput.checked )					//允许取消单选的情况下
					checkAct( context, "radio", false );
					
			}
			else{																												//checkbox复选控件处理
				if( toChecked && !context.oInput.checked )
					checkAct( context, "checkbox", true);
				else if( !toChecked && context.oInput.checked )
					checkAct( context, "checkbox", false);
			}
		}
		
	};
	
	daOption.fnStruct.init.prototype = daOption.prototype;
	
	//将普通checkbox radio类型的按钮 转换为daOption类型
	/*
		inputObj: 用户传入的按钮对象
	*/
	daOption.toOption = function( inputObj ){
		var params = {
			parent: inputObj.parentNode,
			id: inputObj.id,
			value: inputObj.value,
			text: inputObj.getAttribute("text") || "",
			type: inputObj.type,
			checked: inputObj.checked,
			name: inputObj.name
			
		};
		daOptionObj = daOption( params );																						//生成daOption对象并替换input控件
		
		inputObj.parentNode.replaceChild( daOptionObj.oObj, inputObj );							//替换被封装的旧的dom对象
		
	};

	/**daOption全局缓存
	*/
	daOption.daOptionCache = [];
	
	/**缓存daOption控件对象
	* params {daOption} obj 下拉控件daOption对象
	*/
	daOption.pushCache = function( obj ){
		var cache = daOption.daOptionCache;
		cache.push({
			id: obj.oId,
			obj: obj
		});
		
	};
	
	/**弹出daOption控件对象
	* params {daOption} obj 下拉控件daOption对象
	*/
	daOption.popCache = function( obj ){
		var cache = daOption.daOptionCache;
		for( var i=0,len=cache.length; i<len; i++ ){
			if( obj.oId == cache[i].id ){ 
				cache.splice( i, 1 );
				return cache[i];
			}
		}
		
	};
	
	/**查找相应id的daOption控件对象
	* params {string} id 下拉控件对象id
	*/
	daOption.getOption = function( id ){
		var cache = daOption.daOptionCache;
		
		if( "string" === typeof id ){
			id = id.replace( "#", "" );
			
			for( var i=0,len=cache.length; i<len; i++ ){
				if( id == cache[i].id ) return cache[i].obj;
			}
			
		}
		else if ( da.isFunction( id ) ){
			da.each(cache, function( idx, obj ){
				return id.call( this.obj, this.id );
			});
			return cache;
		}
		
		return null;
		
	};
	
	/**通过name值查找同组的daOption控件，并实现set和get操作
	* params {String} name 同组的daOption控件的name组名
	* params {String|Array} values 设值模式下的匹配值，单选可以为字符串单值，复选可以为数组
	* params {boolean} toChecked 设值模式下，是选中或取消
	*/
	daOption.check = function( name, values, toChecked ){
		if( !name ) return;
		var isFn = da.isFunction( values ),
				isAll = "boolean" === typeof values, 								//全选 或清空[ values === true,values === false ]
				arrObj=[], arrChecked=[], reList;
		
		daOption.getOption(function( id ){											//找到所有同组的目标控件
			if( name === this.setting.name ){
				arrObj.push( this );																//记录所有同组项
				if( this.oInput.checked ) arrChecked.push( this );	//记录选中项
			}
		});
		
		if( "undefined" === typeof values || isFn ){						//get模式 (只需要返回选中项的值即可)
			if( 0 == arrChecked.length )													//初始化状态，未选中任何值
				reList = null;
			else if( 1 == arrChecked.length 
				&& "radio" === arrChecked[0].setting.type ){				//单选
				reList = arrChecked[0];
				if( isFn ) values.call( reList, reList.value, reList.text, 0 );
			}
			else{																									//复选
				reList = [];
				da.each( arrChecked, function( idx, obj ){
					reList.push( this );
					if( isFn ) values.call( this, this.value, this.text, idx );
				});
				
			}
			return reList;
		}
		else{																													//set模式
			if( 0 >= arrObj.length ) return null;
			
			if( "undefined" === typeof toChecked ) 												//矫正toChecked参数，不传入默认为true;
				toChecked = true;
			toChecked = !!toChecked;
			if( isAll ) toChecked = values; 															//全选 或清空
			if( "string" === typeof values ) values = [ values ];					//矫正values匹配值格式
			if( da.isArray( values ) || isAll ){
				var obj, v1, v2, type;
				
				type = arrObj[0].setting.type;															//获取该组控件的类型
				reList= isAll ? arrObj : [];
				
				if( "redio" === type && isAll ) return reList;							//单选不支持 全选 或清空
				
				for( var i=0,len=arrObj.length; i<len; i++ ){
					obj = arrObj[i];
					
					if( "checkbox" === type ){																//复选类型有更复杂的组合情况，需要矫正处理
						if( isAll ){																						//全选 或清空操作
							if( toChecked && obj.oInput.checked 
							|| !toChecked && !obj.oInput.checked ) continue;
							else 
								toChecked ? obj.check( true ) : obj.check( false );	//若是取消操作,就取消选中状态;相反就设置为选中
						}
						else{																										
							if( !toChecked && !obj.oInput.checked ) continue;			//若是取消操作,且该控件并非选中状态。就不需要任何操作了,继续下一个
							if( toChecked && obj.oInput.checked  )								//若是选中操作，且控件已经为选中状态; 先取消选中，为下面匹配做准备；只有匹配成功了，才能再次设置为选中状态
								obj.check( false );																	
						}
					}
					
					v1 = obj.oInput.value;
					for( var n=0,len2=values.length; n<len2; n++ ){					//循环匹配value列表
						v2 = values[n];
						if( v1 == v2 ){																				//找到了匹配值
							toChecked ? obj.check( true ) : obj.check( false );	//若是取消操作,就取消选中状态;相反就设置为选中
							reList.push( obj );
						}
					}
					
				}
				
				return reList;
			}
			
			return;
		}
		
	};
	
	/**反选
	* params {String} name 同组的daOption控件的name组名
	*/
	daOption.inverse = function( name ){
		var vList = [];
		daOption.check( name, function( value, text ){								//获取当前选中的
			vList.push( value );
		});
		
		daOption.check( name, true );												//先全选
		daOption.check( name, vList, false );										//然后取消掉之前被选中的
	};
	
	return daOption;

})();
	

win.daOption = daOption;



////加载JS脚本的时候，替换页面上所有的input button类型的按钮为 daButton类型
//da(function(){
//	da("input").each(function( idx, obj ){
//		if( "checkbox" === this.type || "radio" === this.type ){
//				daOption.toOption( this );
//		}
//	});
//	
//});

} )( window );