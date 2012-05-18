/***************** 数据交互 *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 数据交互部分功能代码，与业务功能开发关系密切
	version: 1.0.0
*/

var $flds = [];			//为兼容过去的 ebs函数库用法定义的一些全局变量。
    $f = [],
	$v = [];

da.extend({
	/**格式化数据
	*/
	fmtData: function( val, fmt ){
		if( !fmt ) return val;
		
		var val_format = val;
		
		if( "money" == fmt ){																//货币型
			val_format = "<span style='color:#900'>￥</span>" + da.fmtFloat(val_format, "#,##");
		}
		else if( /[#\.\,]/.test(fmt) ){														//数值型
			val_format = da.fmtFloat( val_format, fmt );
		}
		else{																				//日期型
			val_format = da.fmtDate( val_format, fmt );
		}

		return val_format;
	},
	
	/**给控件赋值
	* 如: da.setValue( "#p_name", "AH100" );
	*/
	setValue: function( obj, val ){
		var daObj = da(obj);
		
		if ( "string" === typeof obj && 0 >= daObj.dom.length ){			//需要通过name来定位，如:checkbox、radio
			var arr = obj.split(",");
			for( var i=0,len=arr.length; i<len; i++ ){
				arr[i] = "input[name="+ arr[i].trim() +"]";
			}
			daObj = da( arr.join(",") );
		};
		
		var tag, fmt, val2;
		
		daObj.each(function(i){
			tag = this.tagName.toLowerCase();			//元素类型
			
			switch( tag ){
				case "input":{
					var type = this.type.toLowerCase();				//input中的控件类型
					switch(type){
						case "checkbox":							//复选控件
						case "radio":{								//单选控件
							val2 = da.isNull(this.value, "");
							
							if ( val2 == "" || val2 == "on" ) {				//特殊值互等 "" == "on" == 0
								this.setAttribute( "checked", val == "0" );
							}
							else {
								this.setAttribute( "checked", val == da.isNull(this.value, "") );
							};
							break;
						}
						case "text":								//单行输入框
						default:{
							fmt = da.isNull( this.getAttribute("fmt"), "" );
							
							if( "" !== fmt ){
								val2 = da.fmtData( val, fmt );
							}
							
							val2 = da.isNull( val2, this.value );
							this.value = val2;
							break;
						}
					}
					break;
				}
				case "textarea":{									//文本域
					fmt = da.isNull( this.getAttribute("fmt"), "" );
					
					if( "" !== fmt ){
						val2 = da.fmtData( val, fmt );
					}
					
					val2 = da.isNull( val2, this.value );
					this.value = val2;
					break;
				}
				case "select":{
					if( da.isNull(val) ) return;
				
					var isFinded = false;
					for ( var i=0,len=this.options.length; i < len; i++ ) {
						if (this.options[i].value == val1) {
							this.options[i].selected = true ;
							isFinded = true;
						}
						else if( this.options[i].selected ) {
							this.options[i].selected = false ;
						}
					}
					
					if ( !isFinded ){
						if ( val != "" ){
							var obj = pobj001.document.createElement("OPTION");
							this.options.add(obj);
							obj.innerText = val;
							obj.value = val;
							obj.selected = true;
						}
					}
					break;
				}
				case "img":
					this.src = val;
					break;
			}
		});
	},
	
	/**数据交互
	*/
	getData: function( url, data, fnLoaded, fnError ) {
		if( !url ) return;
		
		if (url.toLowerCase().indexOf(".asp") < 0) {					//修正url参数
			url = "/sys/aspx/execsqllist.aspx?sqlname=" + url;
		}
		if (url.indexOf("?") < 0) {
			url += "?";
		}
		
		var isPost = da.isPlainObj(data),
			isScript = /\.js/.test(url.toLowerCase());

		da.ajax({
			url: url,
			type: (isPost && !isScript) ? "POST" : "GET",
			data: (isPost && !isScript) ? data : null,
			
			error: function( xhr, status, exception ) {
				var msg = xhr.statusText,
					code = xhr.status,
					content = xhr.responseText;
				
				fnError && fnError( msg, code, content );
			},
			success: function( data, status, xhr ) {
				var dataType = xhr.getResponseHeader("content-type").match(/html|xml|json|script/).toString(),
					xml2json;
				
				switch( dataType ){
					case "html":
					case "json":
					case "script": {
						fnLoaded && fnLoaded( data, dataType, xhr.getResponseHeader("content-type"), xml2json );
						break;
					}
					case "xml": {
						$flds = [];													//为兼容过去的 ebs函数库用法定义的一些全局变量。
						$f = [],
						$v = [];
						
						var firstTime = true;
						xml2json = da.xml2json( data, function( type, dsname, data, idx ){
							if( "field" == type ){									//逐字段
								if( firstTime ){
									window["_"+ data.name] = idx;					//为兼容过去的 ebs函数库用法定义的一些全局变量。
									$flds.push( data.name );
								}
								$f.push( data.value );
							}
							if( "record" == type && data ){							//逐行
								if( firstTime ){
									firstTime = false;
								}
								
								$v = $f;
								fnLoaded && fnLoaded( false, data, dsname, idx);
								
								$f = [];											//清除行数据
								$v = [];
							}
							if( "dataset" == type && da.isArray(data) ){			//逐数据集
								fnLoaded && fnLoaded( true, data, dsname, idx);
							}
						});
						fnLoaded && fnLoaded( true, xml2json, undefined, undefined );		//结束回调
						
						break;
					}
					defaul:
						break;
				}
			}
		});
	},

	dataList: function( pid, url, data, fnField, fnLoaded, fnError ){
		if( "string" === typeof pid && 0 !== pid.indexOf("#") )		//修正id未加"#"
			pid = "#" + pid;
		
		var parent = da( pid );
		if( 0 >= parent.dom.length ) return;
		parent = parent.dom[0];
		
		var tmpHTML = parent.innerHTML.replace(/[\r\t\n]/g, ""),
			fmtMap = {};
			
		var name="", fmt="", txt="", key, obj;
		da("td[fmt]", pid).each(function( idx ){
			obj = da( this );
			name = obj.attr("name");
			txt = obj.text();
			fmt = obj.attr("fmt");
			
			key = name || txt.replace(/\{|\}/g, "");
			if( key ){
				context.fmtMap[key] = fmt;
			}
			// if ((s1 == "sum") || (s1 == "avg") || (s1 == "min") || (s1 == "max") || (s1 == "count")) {
				// s1 = obj1.html().replace("{", "").replace("}", "") ;
			// }
			
			// if ((_isnull(s1, "") != "") && (_isnull(s2, "") != "")) {
				// _tb_fmt_flds.push(s1);
				// _tb_fmt_fmts.push(s2);
			// }
		});
	
		da.getData( url, data, 
		function( iseof, data, dsname, idx){
			if( !dsname ){
				tmpHTML = tmpHTML.replace(/\{[^\}]+\}/g, function( res, i, target ){
					fldname = res.replace( /\{|_org|_raw|\}/g, "" );
					fldvalue =  (data[fldname] || "");
					
					var fmt = fmtMap[fldname],
						val_format = fldvalue,
						val_tohex = da.toHex(fldvalue);
					
					if( fnField ) {
						val_format = fnField( fldname, fldvalue, data );				//字段值，用户格式化处理
					}
					
					val_format = da.fmtData( val_format, fmt );
					
					if( 0 <= res.indexOf("_org") ){									//返回原数据
						return fldvalue;
					}
					else if( 0 <= res.indexOf("_raw") ){							//返回编码数据
						return val_tohex;
					}
					else{															//返回格式化数据
						return val_format;
					}
				});
				
				fnLoaded && fnLoaded( data );
			}
		},
		function( msg, code, content ){
			fnError && fnError( msg, code, content );
		});
	}
	
});

/*********为兼容过去的 ebs函数库用法定义的一些全局函数。*********/
var $value = da.setValue,
	$value2 = da.setValue,
	runsql = da.getData,
	runsql4text = da.getData,
	runsql4xml = da.getData;
