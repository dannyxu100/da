/***************** 加密解密 *************************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 加密解密、编码解码
	version: 1.0.0
*/
(function(da){
	//密钥
	var codeKey = "1Q2AqzWaYxZdXswcf3SgvpC45EKbehDVoj6Tn7LBk8OFmRrGlUyNui9IHPtMJ0",
	
	//索引 转为 编码
	toChar = function( arrTmp, idx ){
		arrTmp[ arrTmp.length ] = codeKey.charAt( idx );
	},
	
	//编码 转为 索引
	toIdx = function( code, char ){
		return codeKey.indexOf( char );
	};
	
	da.extend({
		//加密
		code: function( str ){
				if( 0 <= str.indexOf( "*da*" ) ) return str;		//加密过就不用加密了
				
				var len = str.length,										//源字符串长度
						arrTmp=[],res,
					  kLen = codeKey.length,			//密钥的 长度
					  klen2 = kLen * kLen,								//密钥的 2倍长度
					  klen5 = kLen * 5;										//密钥的 5倍长度
			  
				for( var i=0,a; i < len; i++ )
				{
					a = str.charCodeAt(i);																	//逐个取出源字符串的 字符
					
					if( a < klen5 ){
							toChar( arrTmp, Math.floor( a / kLen ));				//小于等于其数值参数的最大整数( 下限整数 )
							toChar( arrTmp, a % kLen );
					}
					else{
						toChar( arrTmp, Math.floor( a / klen2 ) + 5 );
						toChar( arrTmp, Math.floor( a / kLen ) % kLen );
						toChar( arrTmp, a % kLen );
					}
				}
				res = arrTmp.join("");
				
				return "*da*" + String( res.length ).length + String( res.length ) + res;				//第一位：编码后字符长度数值的位数（最大9位）；通过第一位数值，取得编码后字符长度数值；然后剩下的是编码后的字符；最前面加上自定义编码头*da*
																																												//如：31771G1O1s1Z1o1o1o1……y191s1Z……1G1s1Z  （解释：3 - "177"的长度。  177 - 编码后字符长度）
		},
		
		//解密
		decode: function( code ){
				if( 0 != code.indexOf( "*da*" ) ) return code;		//编码头过滤,并去掉编码头
				code = code.substr( 4 );
				
				var nlen = code.charAt( 0 ) * 1;			//去第一位字符，并通过运算符隐式转换为整型
				if( isNaN( nlen ) ) return "";				//通过isNaN()函数判断是否符合 长度信息格式
				
				nlen = code.substr( 1, nlen ) * 1;		//取实际编码字符长度数值
				if( isNaN( nlen ) ) return code;				
				
				var clen = code.length,								//取整个编码串长度（包含了长度信息位）
						arrTmp = [],a,f,b,
						i = String( nlen ).length + 1,		//加上第一位（长度信息值的 位数信息）
						kLen = codeKey.length;					//密钥的 长度
						
				if( clen != i + nlen ) return code;		//匹配实际编码字符长度 和 长度信息 是否不一致

				while( i < clen )
				{
					a = toIdx( code, code.charAt( i++ ) );
					if( a < 5 ) 
						f = ( a * kLen ) + toIdx( code, code.charAt( i ) );
					else
						f = ( ( a - 5 ) * kLen * kLen ) + ( toIdx( code, code.charAt( i ) ) * kLen ) + toIdx( code, code.charAt( ++i ) );
				 	
				 	arrTmp[ arrTmp.length ] = String.fromCharCode( f );
				 	i++;
				}
				
				return arrTmp.join( "" );
		},
		
		//编码
		toHex: function( str ) {
			str = da.isNull( str.toString(), "" );
			
			if ("" != str) {
				if (0 == str.indexOf('~h`')) return str;
				
				var code, rs = [];
				
				for (var i=0, len=str.length; i<len; i++ ) 
				{
					code = str.charCodeAt(i).toString(16);				//单字符转为16进制字符串
					code = da.zeroFill( code, 4 );						//4位16进制,不够补零
					
					rs.push( code.slice(2, 4) + code.slice(0, 2) );		//高低位颠倒处理
				}
				return ('~h`' + rs.join(""));
			}
			
			return str;
		},
		
		//解码
		toStr: function ( hex ){
			hex = da.isNull( hex, "" );
			
			if (0 == hex.indexOf('~h`')) {
				hex = hex.substr(3);									//去前缀
				
				if ( "" != hex ) {
					var str='', rs = [];
					
					for (var i=1, offset=0; i <=hex.length/4; i++ ){
						offset = 4 * i;
					
						rs[i * 3 - 3] = "%u" ;
						rs[i * 3 - 2] = hex.slice( offset-2, offset );
						rs[i * 3 - 1] = hex.slice( offset-4, offset-2 );
					};
					str = unescape(rs.join(""));
					return str;
				}
				return "";
			}
			return hex;
		}
	});
})(da);
