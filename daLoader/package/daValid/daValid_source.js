/**
* @
* 表单数据有效性验证类
* @author danny.xu
* @date 2011/7/3
*/

/***************** 常用正则表达式 *****************/
da.extend({
	//通用正则表达式判定函数
	/*
		val: 判定值
		allowEmpty: 是否允许为空
		regexp: 正则表达式字符串
	*/
	isMatch: function(val,regexp,allowEmpty){
		if(allowEmpty && "" === da.isNull(val,"")) return true;
		else if(!allowEmpty && "" === da.isNull(val,"")) return false;
		else return regexp.test(val);
	},
	
	//只能整数
	isInt: function(val,allowEmpty){
		return da.isMatch(val, /^-?\d+$/, allowEmpty);
	},

	//只能非负整数（正整数 + "0"）  
	isInt0Up: function(val,allowEmpty){
		return da.isMatch(val,/^\d+$/, allowEmpty);
	},
	
	//只能正整数
	isIntUp: function(val,allowEmpty){
		return da.isMatch(val,/^[0-9]*[1-9][0-9]*$/, allowEmpty);
	},
	
	//只能非正整数（负整数 + "0"） 
	isInt0Lower: function(val,allowEmpty){
		return da.isMatch(val, /^((-\d+)|(0+))$/, allowEmpty);
	},

	//只能负整数
	isIntLower: function(val,allowEmpty){
		return da.isMatch(val, /^-[0-9]*[1-9][0-9]*$/, allowEmpty);
	},
	
	//只能浮点数 
	isFloat: function(val,allowEmpty){
		return da.isMatch(val, /^(-?\d+)(\.\d+)?$/, allowEmpty);			
	},

	//只能非负浮点数（正浮点数 + "0"）
	isFloat0Up: function(val,allowEmpty){
		return da.isMatch(val, /^\d+(\.\d+)?$/, allowEmpty); 
	},
	
	//只能正浮点数
	isFloatUp: function(val,allowEmpty){
		return da.isMatch(val, /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/, allowEmpty);
	},
	
	//只能非正浮点数（负浮点数 + 0） 
	isFloat0Lower: function(val,allowEmpty){
		return da.isMatch(val, /^((-\d+(\.\d+)?)|(0+(\.0+)?))$/, allowEmpty);
	},
	
	//只能负浮点数
	isFloatLower: function(val,allowEmpty){
		return da.isMatch(val, /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/, allowEmpty);
	},
	
	//只能26个英文字母 组成
	isLetter: function(val,allowEmpty){
		return da.isMatch(val, /^[A-Za-z]+$/, allowEmpty);
	},
	
	//只能26个英文字母 大写 组成
	isLetterUpper: function(val,allowEmpty){
		return da.isMatch(val, /^[A-Z]+$/, allowEmpty);
	},
	
	//只能26个英文字母 小写 组成
	isLetterLower: function(val,allowEmpty){
		return da.isMatch(val, /^[a-z]+$/, allowEmpty);
	},
	
	//只能数字 和 26个英文字母 组成
	isNumLetter: function(val,allowEmpty){
		return da.isMatch(val, /^[A-Za-z0-9]+$/, allowEmpty);
	},
	
	//只能数字、26个英文字母 或者下划线 组成 
	isCode: function(val,allowEmpty){
		return da.isMatch(val, /^\w+$/, allowEmpty);
	},
	
	//只能中文字符串 组成 
	isCN: function(val,allowEmpty){
		return da.isMatch(val, /^[\u4e00-\u9fa5]*$/, allowEmpty);
	},
	
	//只能中文字符串、26个英文字母 或者下划线（一般的名称验证）
	isName: function(val,allowEmpty){
		return da.isMatch(val, /^[a-zA-Z\u4e00-\u9fa5_]*$/, allowEmpty);
	},
	
	//只能中文字符串、数字、26个英文字母 或者下划线（一般的账号验证）
	isAccount: function(val,allowEmpty){
		return da.isMatch(val, /^[\w\u4e00-\u9fa5]*$/, allowEmpty);
	},
	
	//判断是否电话号码（包括手机）
	isPhone: function(val,allowEmpty){
		return da.isMatch(val, /^(((\+86)|(86))?(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[2|6|7|8|9])\d{8}|(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/, allowEmpty); 
	},
	
	//判断是否手机号码
	isMobile: function(val,allowEmpty){
		//现在的手机号码增加了150,153,156,158,159,157,188,189
		return da.isMatch(val, /^((\+86)|(86))?(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[2|6|7|8|9])\d{8}$/, allowEmpty); 
	},
	
	//判断是否中国身份证号码
	isIDCard: function(val,allowEmpty){
		return da.isMatch(val, /^\d{18}$|^\d{15}$/, allowEmpty);
	},
	
	//判断是否是银行卡号码
	isBankCard: function(val,allowEmpty){
		return da.isMatch(val, /^\d{19}$/, allowEmpty); 
	},
	
	//判断是否电子邮件地址
	isEmail: function(val,allowEmpty){
		return da.isMatch(val, /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, allowEmpty); 
	},
	
	//判断是否是中国邮政编码
	isPostCode: function(val,allowEmpty){
		return da.isMatch(val, /^[1-9]{1}(\d+){5}$/, allowEmpty); 
	},
	
	//判断是否是IP地址
	isIP: function(val,allowEmpty){
		return da.isMatch(val, /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,allowEmpty); 
	},
	
	//判断是否是IP地址
	isHTTP: function(val,allowEmpty){
		return da.isMatch(val, /^[a-zA-z]+:(\/|\\){2}[^\s]*$/, allowEmpty); 
	},
	
	//判断是否是HTML代码
	isHTML: function(val,allowEmpty){
		return da.isMatch(val, /<(S*?)[^>]*>.*?|< .*? \/>/, allowEmpty);
	}          
	
});


(function(win,undefined){
var doc = win.document;
	
var daValid = (function(){
	
	/**daValid构造函数
	* @param {PlainObject} setting 用户参数列表
	*/
	var daValid = function( setting ){
		if( "string" == typeof setting || setting && "undefined" != typeof setting.nodeType )
			return daValid.valid(setting);
		else
			return new daValid.fnStruct.init( setting );
	};
	
	daValid.fnStruct = daValid.prototype = {
		version: "daValid \n author:danny.xu \n date:2011/7/3 10:54:29",
		
		targetObj: null,					//需要验证的dom对象
		infoObj: null,						//提示信息dom对象
		
		setting: {
			target: null,							//需要验证目标
			valid: "",							//有效性验证处理函数名称( 名称[,是否允许为空[,自定义验证正则表达式]],如: "match,false,^[0-9]*[1-9][0-9]*$" )
			validinfo: "",					//有效性验证提示信息
			
			empty: true, 							//允许为空
			regexp: null,							//用户自定义验证正则表达式
			valid: null,							//用户自定义验证处理函数
			simple: false,							//提示样式是否使用简单的span文字风格
			css: 'border:1px solid #f00;height:16px;line-height:16px;font-size:12px;color:#f00;background:#fffcee;padding:3px;margin:3px;'
		},
		
		
		
		/**daValid对象初始化函数
		* @param {PlainObject} setting 用户参数列表
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.targetObj = da( setting.target ).dom[0] || null;
			if( !this.targetObj ) return;																		//如果找不到需要验证的DOM对象，直接跳出处理
			
			var tmpValid = setting.valid || this.targetObj.getAttribute("valid") || "";				//获得验证函数名称，校正是否允许为空设置
			tmpValid = tmpValid.split(",");
			setting.valid = tmpValid[0] || setting.valid;
			setting.empty = tmpValid[1] || setting.empty;
			if( "true" === setting.empty || true === setting.empty )														//修正允许为空参数(字符串2布尔)
				setting.empty = true;
			else
				setting.empty = false;
				
			if( tmpValid[2] )	setting.regexp = new RegExp(tmpValid[2]);															//如果有自定义验证表达式，就new一个对象出来

			setting.valid = da.isFunction(setting.valid) ? setting.valid : daValid.mapFnValid[ setting.valid ];					//获得验证处理函数
			
			setting.validinfo = setting.validinfo || this.targetObj.getAttribute("validinfo") || this.targetObj.getAttribute("daTip");
			
			this.bindEvent();
			
			da.data( setting.target, "daValid", this);												//压入全局缓存
		},
		
		/**事件绑定
		*/
		bindEvent: function(){
			var context = this;
			
			da(this.targetObj).bind("blur",function(){
				context.valid();
				
			});
			
			da(this.targetObj).bind("keyup",function(){
				context.valid();
				
			});
			
//			.bind("focus",function(){
//				context.hide();
//				
//			});
		},
		
		/**daValid验证处理
		*/
		valid: function(){
			var val = this.targetObj.value,
				fnValid = this.setting.valid;
					
			if( !fnValid ){ return;};
			
			var reValid = fnValid.call( this.targetObj, val, this.setting.empty, this.setting.regexp );
			if( !reValid ) this.show();
			else this.hide();

			return reValid;
			
		},
		
		/**显示验证提示信息
		*/
		show: function(){
				if( this.infoObj ){
						if(this.setting.simple)
							this.infoObj.style.display = "inline-block";
						else
							this.infoObj.show();
				}
				else{
						var warnTxt = '<span style="color:#c00;font-family:arial;font-size:14px;font-weight:bold;">(!)</span>&nbsp;&nbsp;' 
						+ ( this.setting.validinfo || "数据格式不正确" );
						
						if( "undefined" != typeof daTip && !this.setting.simple ){
							this.infoObj = daTip({
								target: this.targetObj,
								html: warnTxt,
								close: false,
								bg: "#f7f7f7",
								color: "#444"
							});
							
						}
						else{
							var spanValid = doc.createElement("span");
							spanValid.style.cssText = this.setting.css;
							spanValid.style.display = "inline-block";
							spanValid.innerHTML = warnTxt;
			
							this.targetObj.parentNode.insertBefore( spanValid, this.targetObj.nextSibling );
							
							this.infoObj = spanValid;
							this.setting.simple = true;
						}
				}
					
		},
		
		/**隐藏验证提示信息
		*/
		hide: function(){
			if( this.infoObj ){
				if( this.setting.simple ){
					this.infoObj.style.display = "none";
				}
				else
					this.infoObj.hide();
			}
		}
		
	};
	
	
	daValid.fnStruct.init.prototype = daValid.prototype;						//通过原型实现模块继承
	
	return daValid;
})();	



/**验证控件数据有效性
* @param {String|Element} obj 被验证控件对象
*/
daValid.valid = function( obj ){
	var daObj = da(obj),
		res = null;

	if( 0 < daObj.dom.length ){
		res = true;
	
		daObj.each(function(){
			var validObj = da.data( this, "daValid" );
			
			if( null != validObj ){								//已初始化过
				res = res && validObj.valid();
			}
			else{												//未初始化过
				validObj = daValid({
					target: this
				});
				res = res && validObj.valid();
			}
		});
	}
	
	return res;
};


//验证范围内所有数据的有效性
daValid.form = function( parent ){
	var pObj = da(parent);
	
	if( 0 < pObj.dom.length ){
		da("input[valid],textarea[valid]", pObj).each(function(){
			daValid({
				target: this
			});
		});
	}
};


/**验证所有数据有效性
*/
daValid.all = function(){
	return daValid.valid( "input[valid],textarea[valid]" );
};


//验证函数映射表，可以通过名称获得对应的验证处理函数
daValid.mapFnValid = {
	match: da.isMatch,								//通用正则表达式判定函数
	int: da.isInt,						//只能整数
	plusint: da.isIntUp,							//只能正整数
	plusint0: da.isInt0Up,							//只能非负整数（正整数 + "0"）
	minusint: da.isIntLower,						//只能负整数
	minusint0: da.isInt0Lower,						//只能非正整数（负整数 + "0"） 
	
	float: da.isFloat,					//只能浮点数 
	plusfloat: da.isFloatUp,						//只能正浮点数
	plusfloat0: da.isFloat0Up, 						//只能非负浮点数（正浮点数 + "0"）
	minusfloat: da.isFloatLower,					//只能负浮点数
	minusfloat0: da.isFloat0Lower,					//只能非正浮点数（负浮点数 + 0） 
	
	abc: da.isLetter,          			//只能26个英文字母 组成
	upperabc: da.isLetterUpper,						//只能26个大写英文字母  组成
	lowerabc: da.isLetterLower,						//只能26个小写英文字母  组成
	abcnumber: da.isNumLetter,						//只能数字 和 26个英文字母 组成
	
	code: da.isCode,								//只能数字、26个英文字母 或者下划线 组成 
	cn: da.isCN,									//只能中文字符串 组成
	name: da.isName,								//只能中文字符串、26个英文字母 或者下划线（一般的名称验证）
	account: da.isAccount,							//只能中文字符串、数字、26个英文字母 或者下划线（一般的账号验证）
	phone: da.isPhone,								//判断是否电话号码（包括手机）
	mobile: da.ismobile,							//判断是否手机号码
	email: da.isEmail,								//判断是否电子邮件地址
	http: da.isHTTP,								//判断是否是IP地址
	html: da.isHTML,								//判断是否是HTML代码
	
	postcode: da.isPostCode,					//判断是否是中国邮政编码
	idcard: da.isIDCard,						//判断是否中国身份证号码
	backcard: da.isBankCard,					//判断是否是银行卡号码
	ip:	da.isIP									//判断是否是IP地址
	
};



win.daValid = daValid;

})(window);
