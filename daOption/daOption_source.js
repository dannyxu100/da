/*
	author: danny.xu
	date:	2011/11/19
	discription: daOption�Զ���ѡ��ؼ�
*/
( function( win, undefined ){
var doc = win.document;

var daOption = (function(){

	var daOption = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )		//�����Ͳ���daOption�ؼ��ĸ߼�����÷�
			return daOption.get( setting );
		
		return new daOption.fnStruct.init( setting );
	};
	
	daOption.fnStruct = daOption.prototype = {
		
		id: 0,			//Ψһ���
		obj: null,
		parentObj: null,
		
		inputObj: null,
		iconObj: null,
		textObj: null,
		
		setting: {
			parent: "",			//daOption ��Ԫ��id
			id: "",
			
			type: "radio",
			name: "",
			checked: false,		//�Ƿ�Ϊѡ��״̬
			value: "",			//��ѡ���Ӧ��ֵ
			text: "",			//Ĭ����ʾ��
			
			color: "#fff",		//�û��Զ�������ɫRGB
			bg: "#09c",
			unRadio: false,		//�Ƿ�����ȡ��ѡ�е�ѡ��ť
			
			css: {
				daOption: "daOption",
				hover: "daOption2",
				checked: "daOption3",
				
				checkbox: "checkbox",
				radio: "radio",
				text: "text"
			}
			
		},
		
		value: "",
		text: "",
		
		version: "daOption v1.0 danny.xu 2011/11/19",
		
		/**��ʼ������
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );

			this.parentObj = da( setting.parent );
			this.parentObj = 0 < this.parentObj.dom.length ? this.parentObj.dom[0] : doc.body;
			
			if( setting.id )
				this.id = setting.id;
			else 
				//this.daBtId = da.nowId();			//��ie���������ô�а�~
				while( null !== doc.getElementById( "daOption_" + this.id ) ) this.id++;	//��֤id Ψһ��
			
			setting.type = "radio" === setting.type ? "radio" : "checkbox";													//У��type,checkedֵ
			setting.checked = !!setting.checked;
			
			this.value = this.setting.value;
			this.text = this.setting.text;
			
			this.create();
			this.bindEvent();
			this.check( setting.checked );			//����ԭʼ�ؼ�ѡ��״̬
			
			daOption.cache( this );
		},
		
		
		/**����UIԪ��
		*/
		create: function(){
			var setting = this.setting,
					id = this.id,
					obj, inputObj, iconObj, textObj;
			
			obj = doc.createElement("span");			//daOption�ؼ�����
			obj.id = "daOption_" + id;
			obj.className = setting.css.daOption;
//			obj.style.backgroundColor = setting.color;
			obj.style.display = "inline-block";
			this.obj = obj;
			this.parentObj.insertBefore( obj );
			
			textObj = doc.createElement("span");		//��ѡ����ʾ��Ϣ��ǩ
			textObj.className = setting.css.text;
			textObj.innerHTML = setting.text;
			this.textObj = textObj;
			this.obj.insertBefore( textObj );
			
			if( da.browser.ie )							//���������ԭʼ�ؼ�
				inputObj = doc.createElement('<input type="'+ setting.type +'" name="'+ setting.name +'" />');
			else{
				inputObj = doc.createElement('input');
				inputObj.type = setting.type;
				inputObj.name = setting.name;
			}
			
			if( setting.id ){
				inputObj.id = id;
			}
			inputObj.value = setting.value;
			this.inputObj = inputObj;
			this.obj.insertBefore( inputObj );
			inputObj.style.display = "none";			//����ԭʼ�ؼ�
//			inputObj.checked = setting.checked;			//����ԭʼ�ؼ�ѡ��״̬
			
			iconObj = doc.createElement("span");		//����daOption�ؼ�UIСͼ��
			iconObj.className = setting.css[setting.type];
			iconObj.style.display = "inline-block";
			this.iconObj = iconObj;
			this.obj.insertBefore( iconObj );
			
			this.reSize();
		},
		
		/**����daOption�ؼ��ߴ�
		*/
		reSize: function(){
			da( this.obj ).width( da( this.textObj ).width() + da( this.iconObj ).width()+3 );	//padding-left +3
		},
		
		/**���¼�
		*/
		bindEvent: function(){
			var setting = this.setting,
					context = this;
			
			da( this.obj ).bind("mouseover",function(){
				if( setting.css.daOption === this.className ){
					this.className = setting.css.hover;
					this.style.backgroundColor = setting.bg;
					context.textObj.style.color = setting.color;
				}
				
			}).bind("mouseout",function(){
				if( setting.css.hover === this.className ){
					this.className = setting.css.daOption;
					this.style.backgroundColor = "";
					context.textObj.style.color = "";
				}
			}).bind("click",function(){
				if( !context.inputObj.checked ){
					context.check( true );
				}
				else{
					context.check( false );
				}
				
			});
		},
		
		/**��ʾdaOption�ؼ�
		* params {Function} fn ������ʾ����ִ����Ϻ󣬻ص�����
		*/
		show: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.obj ).fadeIn( 300 ,fn );
			else
				this.obj.style.display = "block";
		},
		
		/**����daOption�ؼ�
		* params {Function} fn �������ض���ִ����Ϻ󣬻ص�����
		*/
		hide: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.obj ).fadeOut( 300 ,fn );
			else
				this.obj.style.display = "none";
		},
		
		/**����daOption�ؼ�����ʾ��Ϣ
		*/
		text: function(){
		
		},
		
		/**����daOption�ؼ��ķ����ɫ
		*/
		color: function( bg, sColor ){
			if( undefined !== bg )	this.setting.bg = bg;
			if( undefined !== sColor )	this.setting.color = sColor;
			
			if( obj.inputObj.checked ){
				this.obj.style.backgroundColor = bg;
				this.textObj.style.color = sColor;
			}
		},
		
		
		/**ѡ��״̬����
		* params {boolean} toChecked �Ƿ�Ϊѡ��
		*/
		check: function( toChecked ){
			if( "undefined" === typeof toChecked ){			//getģʽ
				return this.inputObj.checked;
			}
		
			toChecked = !!toChecked;						//setģʽ��У��toCheckedֵ
			var setting = this.setting,
				context = this;
			
			var checkAct = function( obj, type, status ){
				if( "undefined" === typeof daGif ) return;
				
				obj.inputObj.checked = status;
				if( status ){
					obj.obj.className = setting.css.checked;
					obj.obj.style.backgroundColor = setting.bg;
					obj.textObj.style.color = setting.color;
				}
				else{
					obj.obj.className = setting.css.daOption;
					obj.obj.style.backgroundColor = "";
					obj.textObj.style.color = "";
				}
				
	 			daGif({
	 				target: obj.iconObj,
//	 				src: "images/daOption.png",
	 				all: 6,
	 				speed: 25,
	 				top: "radio" === type ? "-16px" : "0px",
	 				width:16,
	 				height:16,
					isBack: !status
					
	 			});
			};
			
			if( "radio" === setting.type ){					//radio��ѡ�ؼ�����
				var theName = setting.name;
				
				if( toChecked && !context.inputObj.checked ){		//��ѡ�ؼ�����������Ѿ���ѡ��״̬���Ͳ��ع�����
					da("input:radio[name="+ theName +"]").each(function(){	//�ҵ�����ͬ��ĵ�ѡ�ؼ�����ȡ��ѡ��״̬
						var obj = daOption.get(this.id);
						
						if( context.id != obj.id && this.checked ){			//�ų���ǰ�ؼ�
							checkAct( obj, "radio", false );
						}
					});
				
					// daOption.get(function( id ){					//�ҵ�����ͬ��ĵ�ѡ�ؼ�����ȡ��ѡ��״̬
						// if( "radio" === this.setting.type			//�ǵ�ѡ�ؼ�
						// && theName === this.setting.name			//��ͬ��
						// && this.inputObj.checked					//��ѡ��״̬
						// && id !== context.id ){						//���Ҳ��ǵ�ǰ�ؼ�
							// checkAct( this, "radio", false );
						// }
					// });
					
					checkAct( context, "radio", true );				//���õ�ǰ�ؼ�
				}
				else if( setting.unRadio && !toChecked && context.inputObj.checked )		//����ȡ����ѡ�������
					checkAct( context, "radio", false );
					
			}
			else{																												//checkbox��ѡ�ؼ�����
				if( toChecked && !context.inputObj.checked )
					checkAct( context, "checkbox", true);
				else if( !toChecked && context.inputObj.checked )
					checkAct( context, "checkbox", false);
			}
			
			return this.inputObj.checked;
		},
		
		/**ɾ���ؼ�
		*/
		remove: function(){
			da(this.obj).remove();
			this.obj = null;
		}
		
	};
	
	daOption.fnStruct.init.prototype = daOption.prototype;
	
	//����ͨcheckbox radio���͵İ�ť ת��ΪdaOption����
	/*
		inputObj: �û�����İ�ť����
	*/
	daOption.convert = function( inputObj ){
		var params = {
			parent: inputObj.parentNode,
			id: inputObj.id,
			value: inputObj.value,
			text: inputObj.getAttribute("text") || "",
			type: inputObj.type,
			checked: inputObj.checked,
			name: inputObj.name
			
		};
		daOptionObj = daOption( params );																						//����daOption�����滻input�ؼ�
		
		inputObj.parentNode.replaceChild( daOptionObj.obj, inputObj );		//�滻����װ�ľɵ�dom����
		
	};

	
	/**����daOption�ؼ�����
	* params {daOption} obj �����ؼ�daOption����
	*/
	daOption.cache = function( obj ){
		da._data( obj.inputObj, "daOption", obj );
		
	};
	
	/**������Ӧid��daOption�ؼ�����
	* params {string} id �����ؼ�����id
	*/
	daOption.get = function( id ){
		if( "string" === typeof id && 0 !== id.indexOf("#") ) id = "#" + id;				//����idδ��"#"
		
		var obj = da(id);
		if( 0 >= obj.dom.length ) return null;
		return da._data( obj.dom[0], "daOption" );
		
	};
	
	/**ͨ��nameֵ����ͬ���daOption�ؼ�����ʵ��set��get����
	* params {String} name ͬ���daOption�ؼ���name����
	* params {String|Array} values ��ֵģʽ�µ�ƥ��ֵ����ѡ����Ϊ�ַ�����ֵ����ѡ����Ϊ����
	* params {boolean} toChecked ��ֵģʽ�£���ѡ�л�ȡ��
	*/
	daOption.check = function( name, values, toChecked ){
		if( !name ) return;
		var isFn = da.isFunction( values ),
				isAll = "boolean" === typeof values,		//ȫѡ �����[ values === true,values === false ]
				arrObj=[], arrChecked=[], reList;
		
		da("input[name="+ name +"]").each(function(){		//�ҵ�����ͬ���Ŀ��ؼ�
			var obj = daOption.get(this.id);
			
			if( obj ){
				arrObj.push( obj );							//��¼����ͬ����
				if( this.checked ){							//��¼ѡ����
					arrChecked.push( obj );
				}
			}
		});
		
		if( "undefined" === typeof values || isFn ){		//getģʽ (ֻ��Ҫ����ѡ�����ֵ����)
			if( 0 == arrChecked.length )					//��ʼ��״̬��δѡ���κ�ֵ
				reList = null;
			else if( 1 == arrChecked.length && 
			"radio" === arrChecked[0].setting.type ){		//��ѡ
				reList = arrChecked[0];
				if( isFn ) values.call( reList, reList.value, reList.text, 0 );
			}
			else{											//��ѡ
				reList = [];
				da.each( arrChecked, function( idx, obj ){
					reList.push( this );
					if( isFn ) values.call( this, this.value, this.text, idx );
				});
				
			}
			return reList;
		}
		else{																													//setģʽ
			if( 0 >= arrObj.length ) return null;
			
			if( "undefined" === typeof toChecked )			//����toChecked������������Ĭ��Ϊtrue;
				toChecked = true;
			toChecked = !!toChecked;
			if( isAll ) toChecked = values;					//ȫѡ �����
			if( "string" === typeof values ) values = [ values ];		//����valuesƥ��ֵ��ʽ
			if( da.isArray( values ) || isAll ){
				var obj, v1, v2, type;
				
				type = arrObj[0].setting.type;				//��ȡ����ؼ�������
				reList= isAll ? arrObj : [];
				
				if( "redio" === type && isAll ) return reList;			//��ѡ��֧�� ȫѡ �����
				
				for( var i=0,len=arrObj.length; i<len; i++ ){
					obj = arrObj[i];
					
					if( "checkbox" === type ){				//��ѡ�����и����ӵ�����������Ҫ��������
						if( isAll ){																						//ȫѡ ����ղ���
							if( toChecked && obj.inputObj.checked 
							|| !toChecked && !obj.inputObj.checked ) continue;
							else 
								toChecked ? obj.check( true ) : obj.check( false );	//����ȡ������,��ȡ��ѡ��״̬;�෴������Ϊѡ��
						}
						else{																										
							if( !toChecked && !obj.inputObj.checked ) continue;		//����ȡ������,�Ҹÿؼ�����ѡ��״̬���Ͳ���Ҫ�κβ�����,������һ��
							if( toChecked && obj.inputObj.checked  )				//����ѡ�в������ҿؼ��Ѿ�Ϊѡ��״̬; ��ȡ��ѡ�У�Ϊ����ƥ����׼����ֻ��ƥ��ɹ��ˣ������ٴ�����Ϊѡ��״̬
								obj.check( false );																	
						}
					}
					
					v1 = obj.inputObj.value;
					for( var n=0,len2=values.length; n<len2; n++ ){					//ѭ��ƥ��value�б�
						v2 = values[n];
						if( v1 == v2 ){						//�ҵ���ƥ��ֵ
							toChecked ? obj.check( true ) : obj.check( false );	//����ȡ������,��ȡ��ѡ��״̬;�෴������Ϊѡ��
							reList.push( obj );
						}
					}
					
				}
				
				return reList;
			}
			
			return;
		}
		
	};
	
	/**��ѡ
	* params {String} name ͬ���daOption�ؼ���name����
	*/
	daOption.reverse = function( name ){
		var vList = [];
		daOption.check( name, function( value, text ){		//��ȡ��ǰѡ�е�
			vList.push( value );
		});
		
		daOption.check( name, true );						//��ȫѡ
		daOption.check( name, vList, false );				//Ȼ��ȡ����֮ǰ��ѡ�е�
	};
	
	return daOption;

})();
	

win.daOption = daOption;



////����JS�ű���ʱ���滻ҳ�������е�input button���͵İ�ťΪ daButton����
//da(function(){
//	da("input").each(function( idx, obj ){
//		if( "checkbox" === this.type || "radio" === this.type ){
//				daOption.convert( this );
//		}
//	});
//	
//});

} )( window );