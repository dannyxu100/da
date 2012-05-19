/***************** JS基础类扩展 **************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: JavaScript基础类扩展
	version: 1.0.0
*/
(function( win, undefined ){
	/***************** Number类扩展 *************************************/
	/**格式化
	*@param {String} fmt 显示模板
	*@example alert((1234567.12345678).format("#.##")); 
	*		  alert((1234567.12345678).format("#,##")); 
	*/
	Number.prototype.format = function( fmt ){
		fmt = fmt.toLowerCase();
		var res, haszero, hasflag, idx;
			
		if( haszero = 0 <= fmt.indexOf("0") ) fmt = fmt.replace("0", "");
		
		res = parseFloat(this,10);
		if ( 0 == this && haszero ) {
			return "&nbsp;";
		};
		
		idx = fmt.indexOf(".");
		if (idx < 0 ) {
			idx = fmt.indexOf(",");
			if (idx >= 0) {								//不存在"." 符号, 且存在"," 符号
				hasflag = true;							//显示位数分隔符
			}
		}
		
		if (idx >= 0) {									//有"."或","(都可以表示保留小数位数)
			idx = fmt.substr(idx + 1).length;
		}
		else {											//"." 符号和"," 符号都不存在
			idx = 0;
		}
		res = (Number(res)).toFixed(parseInt(idx,10));		//按保留小数位数，四舍五入
		
		if (hasflag) 
		{
			var arrTmp = [];
			idx = res.indexOf(".");
			
			if ((idx > 3) && (idx <= 6)) {
				arrTmp.push( res.substr(0, idx-3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 6) && (idx <= 9)) 
			{
				arrTmp.push( res.substr(0, idx-6) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 9) && (idx <= 12)) 
			{
				arrTmp.push( res.substr(0, idx-9) );
				arrTmp.push( res.substr(idx-9, 3) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			}
			else if ((idx > 12)) 
			{
				arrTmp.push( res.substr(0, idx - 12) );
				arrTmp.push( res.substr(idx - 12, 3) );
				arrTmp.push( res.substr(idx-9, 3) );
				arrTmp.push( res.substr(idx-6, 3) );
				arrTmp.push( res.substr(idx-3) );
			};
			
			res = arrTmp.join("?");
		};
			
		return da.isNull( res, 0.00);
	};

	/***************** String类扩展 *************************************/
	/**去前后空格
	*/
	String.prototype.trim = function(){
		return this.replace(/(^\s+)|(\s+$)/g, "");
	};
	
	/**去开头空格
	*/
	String.prototype.trimLeft = function(){
		return this.replace(/^\s+/g, "");
	};
	
	/**去结尾空格
	*/
	String.prototype.trimRight = function(){
		return this.replace(/\s+$/g, "");
	};
	
	/**去所有空格
	*/
	String.prototype.trimAll = function(){
		return this.replace(/\s/g, "");
	};

	/**编码
	*/
	String.prototype.toHex = function(){
		return da.toHex(this);
	};
	
	/**解码
	*/
	String.prototype.toStr = function(){
		return  da.toStr(this);
	};
	/***************** Date类扩展 *************************************/
	/**格式化
	*@param {String} fmt 显示模板
	*@example alert(new Date().format("yyyy-MM-dd")); 
	*		  alert(new Date("january 12 2008 11:12:30").format("yyyy-MM-dd hh:mm:ss")); 
	*/
	Date.prototype.format= function( fmt ){
		if(/(y+)/.test(fmt))											//年
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 

		var o = { 
			"m+" : this.getMonth()+1, 									//月 
			"d+" : this.getDate(),    									//日
			"h+" : this.getHours(),   									//时 
			"n+" : this.getMinutes(), 									//分 
			"s+" : this.getSeconds(), 									//秒 
			"q+" : Math.floor((this.getMonth()+3)/3),					//季 
			"i" : this.getMilliseconds() 								//毫秒 
		};

		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)) 
				fmt = fmt.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		}
		return fmt; 
	};
	
	/***************** Array类扩展 *************************************/
	/**从前向后 查找首次匹配成员的索引值
	*/
	Array.prototype.indexOf = function( item, i, step ){
		i = i || 0;												//初始化起始下标(需要考虑0) 和步长
		step = step || 1;
		
		for (; i<this.length; i+=step)
			if (this[i] === item) return i; 					//使用"==="(全等于)判断符。Object类型子项无法进行匹配，返回恒为false
			
		return -1;
	};
	
	/**从后向前 查找首次匹配成员的索引值
	*/
	Array.prototype.lastIndexOf = function( item, i, step ){
		i = i || this.length-1; 										//初始化起始下标 和步长
		step = step || 1;
		
		for (; i>0; i-=step)
			if (this[i] === item) return i; 							//使用"==="(全等于)判断符。Object类型子项无法进行匹配，返回恒为false
			
		return -1;
	};

	/**提取指定位置和长度子项
	* 如：arr.get(0,5); 		//从头向后取5个子项
		  arr.get(-1,5); 		//从后向前取5个子项
		  arr.get("item3",3); 	//从值为"item3"的子项,向后取2个子项(包括值为"item3"的子项)
		  arr.get(2)			//取索引2之后的所有子项(包括2)
	*/
	Array.prototype.get = function( i, len ){
		var start, end;
		start = ( undefined === i ? 0 : i );
		
		if( "number" !== typeof start ){		//需要通过子项匹配找到对应索引
			start = this.indexOf( start );
		}
		
		if( undefined !== len ){
			len = Math.abs(len);
			end = ( 0 > start ? start-len : start+len );
		}
		return this.slice( start, end );
	};
	
	/**移除指定位置和长度子项
	* 如：arr.remove(2) == arr.remove(2,1); 
	*/
	Array.prototype.remove = function( i, len ){						
		if( undefined === i ) return this;
		len = len || 1;
		
		if( "number" !== typeof i ){			//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
		}
		
		return this.splice( i, len );			//移除并返回子项
	};
	
	/**插入新项到数组指定位置(前)
	* 如：[1,2,3].insert(2,"1.5","1.6");	["a","b","c"].insert("c",["b1","b2","b3"]);
	*/
	Array.prototype.insert = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		
		arrItem = [ i, 0 ].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**追加新项到数组指定位置(后)
	* 如：[1,2,3].append(1,"1.5","1.6");	["a","b","c"].append("b",["b1","b2","b3"]);
	*/
	Array.prototype.append = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		i++;													//追加索引索引+1
		arrItem = [i,0].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**替换数组指定项
	* 如：[1,2,3].replace(1,"1.5","1.6");	["a","b","c"].replace("b",["b1","b2","b3"]);
	*/
	Array.prototype.replace = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//剔除第一个参数
		
		if( "number" !== typeof i ){							//需要通过子项匹配找到对应索引
			i = this.indexOf( i );
		}
		if( 0 > i || this.length <= i ){
			return this;
		}
		
		arrItem = [i,1].concat( arrItem );
		this.splice.apply( this, arrItem );						//插入新项
		
		return this;
	};
	
	/**将另一个数组合并到指定位置(前)
	* 如：[1,2,3].marge(1, ["a","b","c"]);	["a","b","c"].marge("a","b");
	*/
	Array.prototype.marge = function( i, arr ){
		if( 2 > arguments.length ) return this;
		
		if( !da.isArray( arr ) ){											//非数组
			return this.append( i, arr );
		}
		i = ( undefined !== i ? 0 > i ? 0 : i : this.length ); 				//矫正索引
		
		return this.slice( 0, i ).concat(arr).concat( this.slice( i ) );	 
	};

})(window);