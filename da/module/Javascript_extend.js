/***************** JS��������չ **************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: JavaScript��������չ
	version: 1.0.0
*/
(function( win, undefined ){
	/***************** Number����չ *************************************/
	/**��ʽ��
	*@param {String} fmt ��ʾģ��
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
			if (idx >= 0) {								//������"." ����, �Ҵ���"," ����
				hasflag = true;							//��ʾλ���ָ���
			}
		}
		
		if (idx >= 0) {									//��"."��","(�����Ա�ʾ����С��λ��)
			idx = fmt.substr(idx + 1).length;
		}
		else {											//"." ���ź�"," ���Ŷ�������
			idx = 0;
		}
		res = (Number(res)).toFixed(parseInt(idx,10));		//������С��λ������������
		
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
	}

	/***************** String����չ *************************************/
	/**ȥǰ��ո�
	*/
	String.prototype.trim = function(){
		return this.replace(/(^\s+)|(\s+$)/g, "");
	};
	
	/**ȥ��ͷ�ո�
	*/
	String.prototype.trimLeft = function(){
		return this.replace(/^\s+/g, "");
	};
	
	/**ȥ��β�ո�
	*/
	String.prototype.trimRight = function(){
		return this.replace(/\s+$/g, "");
	};
	
	/**ȥ���пո�
	*/
	String.prototype.trimAll = function(){
		return this.replace(/\s/g, "");
	};

	/**����
	*/
	String.prototype.toHex = function(){
		return da.toHex(this);
	};
	
	/**����
	*/
	String.prototype.toStr = function(){
		return  da.toStr(this);
	};
	/***************** Date����չ *************************************/
	/**��ʽ��
	*@param {String} fmt ��ʾģ��
	*@example alert(new Date().format("yyyy-MM-dd")); 
	*		  alert(new Date("january 12 2008 11:12:30").format("yyyy-MM-dd hh:mm:ss")); 
	*/
	Date.prototype.format= function( fmt ){
		if(/(y+)/.test(fmt))											//��
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 

		var o = { 
			"m+" : this.getMonth()+1, 									//�� 
			"d+" : this.getDate(),    									//��
			"h+" : this.getHours(),   									//ʱ 
			"n+" : this.getMinutes(), 									//�� 
			"s+" : this.getSeconds(), 									//�� 
			"q+" : Math.floor((this.getMonth()+3)/3),					//�� 
			"i" : this.getMilliseconds() 								//���� 
		};

		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)) 
				fmt = fmt.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		}
		return fmt; 
	}
	
	/***************** Array����չ *************************************/
	/**��ǰ��� �����״�ƥ���Ա������ֵ
	*/
	Array.prototype.indexOf = function( item, i, step ){
		i = i || 0;												//��ʼ����ʼ�±�(��Ҫ����0) �Ͳ���
		step = step || 1;
		
		for (; i<this.length; i+=step)
			if (this[i] === item) return i; 					//ʹ��"==="(ȫ����)�жϷ���Object���������޷�����ƥ�䣬���غ�Ϊfalse
			
		return -1;
	};
	
	/**�Ӻ���ǰ �����״�ƥ���Ա������ֵ
	*/
	Array.prototype.lastIndexOf = function( item, i, step ){
		i = i || this.length-1; 										//��ʼ����ʼ�±� �Ͳ���
		step = step || 1;
		
		for (; i>0; i-=step)
			if (this[i] === item) return i; 							//ʹ��"==="(ȫ����)�жϷ���Object���������޷�����ƥ�䣬���غ�Ϊfalse
			
		return -1;
	};

	/**��ȡָ��λ�úͳ�������
	* �磺arr.get(0,5); 		//��ͷ���ȡ5������
		  arr.get(-1,5); 		//�Ӻ���ǰȡ5������
		  arr.get("item3",3); 	//��ֵΪ"item3"������,���ȡ2������(����ֵΪ"item3"������)
		  arr.get(2)			//ȡ����2֮�����������(����2)
	*/
	Array.prototype.get = function( i, len ){
		var start, end;
		start = ( undefined === i ? 0 : i );
		
		if( "number" !== typeof start ){		//��Ҫͨ������ƥ���ҵ���Ӧ����
			start = this.indexOf( start );
		}
		
		if( undefined !== len ){
			len = Math.abs(len);
			end = ( 0 > start ? start-len : start+len );
		}
		return this.slice( start, end );
	};
	
	/**�Ƴ�ָ��λ�úͳ�������
	* �磺arr.remove(2) == arr.remove(2,1); 
	*/
	Array.prototype.remove = function( i, len ){						
		if( undefined === i ) return this;
		len = len || 1;
		
		if( "number" !== typeof i ){			//��Ҫͨ������ƥ���ҵ���Ӧ����
			i = this.indexOf( i );
		}
		
		return this.splice( i, len );			//�Ƴ�����������
	};
	
	/**�����������ָ��λ��(ǰ)
	* �磺[1,2,3].insert(2,"1.5","1.6");	["a","b","c"].insert("c",["b1","b2","b3"]);
	*/
	Array.prototype.insert = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//�޳���һ������
		
		if( "number" !== typeof i ){							//��Ҫͨ������ƥ���ҵ���Ӧ����
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		
		arrItem = [ i, 0 ].concat( arrItem );
		this.splice.apply( this, arrItem );						//��������
		
		return this;
	};
	
	/**׷���������ָ��λ��(��)
	* �磺[1,2,3].append(1,"1.5","1.6");	["a","b","c"].append("b",["b1","b2","b3"]);
	*/
	Array.prototype.append = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//�޳���һ������
		
		if( "number" !== typeof i ){							//��Ҫͨ������ƥ���ҵ���Ӧ����
			i = this.indexOf( i );
			if( 0 > i ){
				i = this.length;
			}
		}
		i++;													//׷����������+1
		arrItem = [i,0].concat( arrItem );
		this.splice.apply( this, arrItem );						//��������
		
		return this;
	},
	
	/**�滻����ָ����
	* �磺[1,2,3].replace(1,"1.5","1.6");	["a","b","c"].replace("b",["b1","b2","b3"]);
	*/
	Array.prototype.replace = function( /*i, [item1], [item1], ..., [item1]*/ ){
		if( 2 > arguments.length ) return this;
		var i = arguments[0],
			arrItem = this.slice.call( arguments, 1 );			//�޳���һ������
		
		if( "number" !== typeof i ){							//��Ҫͨ������ƥ���ҵ���Ӧ����
			i = this.indexOf( i );
		}
		if( 0 > i || this.length <= i ){
			return this;
		}
		
		arrItem = [i,1].concat( arrItem );
		this.splice.apply( this, arrItem );						//��������
		
		return this;
	},
	
	/**����һ������ϲ���ָ��λ��(ǰ)
	* �磺[1,2,3].marge(1, ["a","b","c"]);	["a","b","c"].marge("a","b");
	*/
	Array.prototype.marge = function( i, arr ){
		if( 2 > arguments.length ) return this;
		
		if( !da.isArray( arr ) ){											//������
			return this.append( i, arr );
		}
		i = ( undefined !== i ? 0 > i ? 0 : i : this.length ); 				//��������
		
		return this.slice( 0, i ).concat(arr).concat( this.slice( i ) );	 
	}

})(window);
