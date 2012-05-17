/***************** ���ܽ��� *************************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: ���ܽ��ܡ��������
	version: 1.0.0
*/
(function(da){
	//��Կ
	var codeKey = "1Q2AqzWaYxZdXswcf3SgvpC45EKbehDVoj6Tn7LBk8OFmRrGlUyNui9IHPtMJ0",
	
	//���� תΪ ����
	toChar = function( arrTmp, idx ){
		arrTmp[ arrTmp.length ] = codeKey.charAt( idx );
	},
	
	//���� תΪ ����
	toIdx = function( code, char ){
		return codeKey.indexOf( char );
	};
	
	da.extend({
		//����
		code: function( str ){
				if( 0 <= str.indexOf( "*da*" ) ) return str;		//���ܹ��Ͳ��ü�����
				
				var len = str.length,										//Դ�ַ�������
						arrTmp=[],res,
					  kLen = codeKey.length,			//��Կ�� ����
					  klen2 = kLen * kLen,								//��Կ�� 2������
					  klen5 = kLen * 5;										//��Կ�� 5������
			  
				for( var i=0,a; i < len; i++ )
				{
					a = str.charCodeAt(i);																	//���ȡ��Դ�ַ����� �ַ�
					
					if( a < klen5 ){
							toChar( arrTmp, Math.floor( a / kLen ));				//С�ڵ�������ֵ�������������( �������� )
							toChar( arrTmp, a % kLen );
					}
					else{
						toChar( arrTmp, Math.floor( a / klen2 ) + 5 );
						toChar( arrTmp, Math.floor( a / kLen ) % kLen );
						toChar( arrTmp, a % kLen );
					}
				}
				res = arrTmp.join("");
				
				return "*da*" + String( res.length ).length + String( res.length ) + res;				//��һλ��������ַ�������ֵ��λ�������9λ����ͨ����һλ��ֵ��ȡ�ñ�����ַ�������ֵ��Ȼ��ʣ�µ��Ǳ������ַ�����ǰ������Զ������ͷ*da*
																																												//�磺31771G1O1s1Z1o1o1o1����y191s1Z����1G1s1Z  �����ͣ�3 - "177"�ĳ��ȡ�  177 - ������ַ����ȣ�
		},
		
		//����
		decode: function( code ){
				if( 0 != code.indexOf( "*da*" ) ) return code;		//����ͷ����,��ȥ������ͷ
				code = code.substr( 4 );
				
				var nlen = code.charAt( 0 ) * 1;			//ȥ��һλ�ַ�����ͨ���������ʽת��Ϊ����
				if( isNaN( nlen ) ) return "";				//ͨ��isNaN()�����ж��Ƿ���� ������Ϣ��ʽ
				
				nlen = code.substr( 1, nlen ) * 1;		//ȡʵ�ʱ����ַ�������ֵ
				if( isNaN( nlen ) ) return code;				
				
				var clen = code.length,								//ȡ�������봮���ȣ������˳�����Ϣλ��
						arrTmp = [],a,f,b,
						i = String( nlen ).length + 1,		//���ϵ�һλ��������Ϣֵ�� λ����Ϣ��
						kLen = codeKey.length;					//��Կ�� ����
						
				if( clen != i + nlen ) return code;		//ƥ��ʵ�ʱ����ַ����� �� ������Ϣ �Ƿ�һ��

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
		
		//����
		toHex: function( str ) {
			str = da.isNull( str.toString(), "" );
			
			if ("" != str) {
				if (0 == str.indexOf('~h`')) return str;
				
				var code, rs = [];
				
				for (var i=0, len=str.length; i<len; i++ ) 
				{
					code = str.charCodeAt(i).toString(16);				//���ַ�תΪ16�����ַ���
					code = da.zeroFill( code, 4 );						//4λ16����,��������
					
					rs.push( code.slice(2, 4) + code.slice(0, 2) );		//�ߵ�λ�ߵ�����
				}
				return ('~h`' + rs.join(""));
			}
			
			return str;
		},
		
		//����
		toStr: function ( hex ){
			hex = da.isNull( hex, "" );
			
			if (0 == hex.indexOf('~h`')) {
				hex = hex.substr(3);									//ȥǰ׺
				
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
