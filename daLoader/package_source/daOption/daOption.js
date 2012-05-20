/*
	author: danny.xu
	date:	2011/11/19
	discription: daOption�Զ���ѡ��ؼ�
*/
( function( win, undefined ){
var doc = win.document;

var daOption = (function(){

	var daOption = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//�����Ͳ���daOption�ؼ��ĸ߼�����÷�
			return daOption.getOption( setting );
		
		return new daOption.fnStruct.init( setting );
	};
	
	daOption.fnStruct = daOption.prototype = {
		
		oId: 0,										//Ψһ���
		oObj: null,
		oParentObj: null,
		
		oInput: null,
		oIcon: null,
		oText: null,
		
		setting: {
			parent: "",												//daOption ��Ԫ��id
			id: "",
			
			type: "radio",
			name: "",
			checked: false,										//�Ƿ�Ϊѡ��״̬
			value: "",												//��ѡ���Ӧ��ֵ
			text: "",													//Ĭ����ʾ��
			
			color: "#fff",										//�û��Զ�������ɫRGB
			bg: "#09c",
			unRadio: false,										//�Ƿ�����ȡ��ѡ�е�ѡ��ť
			
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
		
		/**��ʼ������
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );

			this.oParentObj = da( setting.parent );
			this.oParentObj = 0 < this.oParentObj.dom.length ? this.oParentObj.dom[0] : doc.body;
			
			if( setting.id )
				this.oId = setting.id;
			else 
				//this.daBtId = da.nowId();					//��ie���������ô�а�~
				while( null !== doc.getElementById( "daOption_" + this.oId ) ) this.oId++;						//��֤id Ψһ��
			
			setting.type = "radio" === setting.type ? "radio" : "checkbox";													//У��type,checkedֵ
			setting.checked = !!setting.checked;
			
			this.value = this.setting.value;
			this.text = this.setting.text;
			
			this.create();
			this.bindEvent();
			this.check( setting.checked );												//����ԭʼ�ؼ�ѡ��״̬
			
			daOption.pushCache( this );
		},
		
		
		/**����UIԪ��
		*/
		create: function(){
			var setting = this.setting,
					oId = this.oId,
					oObj, oInput, oIcon, oText;
			
			oObj = doc.createElement("span");											//daOption�ؼ�����
			oObj.id = "daOption_" + oId;
			oObj.className = setting.css.daOption;
//			oObj.style.backgroundColor = setting.color;
			oObj.style.display = "inline-block";
			this.oObj = oObj;
			this.oParentObj.insertBefore( oObj );
			
			oText = doc.createElement("span");										//��ѡ����ʾ��Ϣ��ǩ
			oText.className = setting.css.text;
			oText.innerHTML = setting.text;
			this.oText = oText;
			this.oObj.insertBefore( oText );
			
			if( da.browser.ie )																		//���������ԭʼ�ؼ�
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
			oInput.style.display = "none";												//����ԭʼ�ؼ�
//			oInput.checked = setting.checked;											//����ԭʼ�ؼ�ѡ��״̬
			
			oIcon = doc.createElement("span");										//����daOption�ؼ�UIСͼ��
			oIcon.className = setting.css[setting.type];
			oIcon.style.display = "inline-block";
			this.oIcon = oIcon;
			this.oObj.insertBefore( oIcon );
			
			this.reSize();
		},
		
		/**����daOption�ؼ��ߴ�
		*/
		reSize: function(){
			da( this.oObj ).width( da( this.oText ).width() + da( this.oIcon ).width()+3 );						//padding-left +3
		},
		
		/**���¼�
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
		
		/**��ʾdaOption�ؼ�
		* params {Function} fn ������ʾ����ִ����Ϻ󣬻ص�����
		*/
		show: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.oObj ).fadeIn( 300 ,fn );
			else
				this.oObj.style.display = "block";
		},
		
		/**����daOption�ؼ�
		* params {Function} fn �������ض���ִ����Ϻ󣬻ص�����
		*/
		hide: function( fn ){
			if( "undefined" !== typeof daFx )
				da( this.oObj ).fadeOut( 300 ,fn );
			else
				this.oObj.style.display = "none";
		},
		
		/**�Ƴ�daOption�ؼ�
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
		
		/**����daOption�ؼ�����ʾ��Ϣ
		*/
		text: function(){
		
		},
		
		/**����daOption�ؼ��ķ����ɫ
		*/
		color: function( bg, sColor ){
			if( undefined !== bg )	this.setting.bg = bg;
			if( undefined !== sColor )	this.setting.color = sColor;
			
			if( obj.oInput.checked ){
				this.oObj.style.backgroundColor = bg;
				this.oText.style.color = sColor;
			}
		},
		
		
		/**ѡ��״̬����
		* params {boolean} toChecked �Ƿ�Ϊѡ��
		*/
		check: function( toChecked ){
			toChecked = !!toChecked;								//У��toCheckedֵ
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
			
			if( "radio" === setting.type ){															//radio��ѡ�ؼ�����
				var theName = setting.name;
				
				if( toChecked && !context.oInput.checked ){								//��ѡ�ؼ�����������Ѿ���ѡ��״̬���Ͳ��ع�����
					daOption.getOption(function( id ){											//�ҵ�����ͬ��ĵ�ѡ�ؼ�����ȡ��ѡ��״̬
						if( "radio" === this.setting.type 										//�ǵ�ѡ�ؼ�
						&& theName === this.setting.name 											//��ͬ��
						&& this.oInput.checked 																//��ѡ��״̬
						&& id !== context.oId ){															//���Ҳ��ǵ�ǰ�ؼ�
							checkAct( this, "radio", false );
						}
					});
					
					checkAct( context, "radio", true );											//���õ�ǰ�ؼ�
				}
				else if( setting.unRadio && !toChecked && context.oInput.checked )					//����ȡ����ѡ�������
					checkAct( context, "radio", false );
					
			}
			else{																												//checkbox��ѡ�ؼ�����
				if( toChecked && !context.oInput.checked )
					checkAct( context, "checkbox", true);
				else if( !toChecked && context.oInput.checked )
					checkAct( context, "checkbox", false);
			}
		}
		
	};
	
	daOption.fnStruct.init.prototype = daOption.prototype;
	
	//����ͨcheckbox radio���͵İ�ť ת��ΪdaOption����
	/*
		inputObj: �û�����İ�ť����
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
		daOptionObj = daOption( params );																						//����daOption�����滻input�ؼ�
		
		inputObj.parentNode.replaceChild( daOptionObj.oObj, inputObj );							//�滻����װ�ľɵ�dom����
		
	};

	/**daOptionȫ�ֻ���
	*/
	daOption.daOptionCache = [];
	
	/**����daOption�ؼ�����
	* params {daOption} obj �����ؼ�daOption����
	*/
	daOption.pushCache = function( obj ){
		var cache = daOption.daOptionCache;
		cache.push({
			id: obj.oId,
			obj: obj
		});
		
	};
	
	/**����daOption�ؼ�����
	* params {daOption} obj �����ؼ�daOption����
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
	
	/**������Ӧid��daOption�ؼ�����
	* params {string} id �����ؼ�����id
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
	
	/**ͨ��nameֵ����ͬ���daOption�ؼ�����ʵ��set��get����
	* params {String} name ͬ���daOption�ؼ���name����
	* params {String|Array} values ��ֵģʽ�µ�ƥ��ֵ����ѡ����Ϊ�ַ�����ֵ����ѡ����Ϊ����
	* params {boolean} toChecked ��ֵģʽ�£���ѡ�л�ȡ��
	*/
	daOption.check = function( name, values, toChecked ){
		if( !name ) return;
		var isFn = da.isFunction( values ),
				isAll = "boolean" === typeof values, 								//ȫѡ �����[ values === true,values === false ]
				arrObj=[], arrChecked=[], reList;
		
		daOption.getOption(function( id ){											//�ҵ�����ͬ���Ŀ��ؼ�
			if( name === this.setting.name ){
				arrObj.push( this );																//��¼����ͬ����
				if( this.oInput.checked ) arrChecked.push( this );	//��¼ѡ����
			}
		});
		
		if( "undefined" === typeof values || isFn ){						//getģʽ (ֻ��Ҫ����ѡ�����ֵ����)
			if( 0 == arrChecked.length )													//��ʼ��״̬��δѡ���κ�ֵ
				reList = null;
			else if( 1 == arrChecked.length 
				&& "radio" === arrChecked[0].setting.type ){				//��ѡ
				reList = arrChecked[0];
				if( isFn ) values.call( reList, reList.value, reList.text, 0 );
			}
			else{																									//��ѡ
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
			
			if( "undefined" === typeof toChecked ) 												//����toChecked������������Ĭ��Ϊtrue;
				toChecked = true;
			toChecked = !!toChecked;
			if( isAll ) toChecked = values; 															//ȫѡ �����
			if( "string" === typeof values ) values = [ values ];					//����valuesƥ��ֵ��ʽ
			if( da.isArray( values ) || isAll ){
				var obj, v1, v2, type;
				
				type = arrObj[0].setting.type;															//��ȡ����ؼ�������
				reList= isAll ? arrObj : [];
				
				if( "redio" === type && isAll ) return reList;							//��ѡ��֧�� ȫѡ �����
				
				for( var i=0,len=arrObj.length; i<len; i++ ){
					obj = arrObj[i];
					
					if( "checkbox" === type ){																//��ѡ�����и����ӵ�����������Ҫ��������
						if( isAll ){																						//ȫѡ ����ղ���
							if( toChecked && obj.oInput.checked 
							|| !toChecked && !obj.oInput.checked ) continue;
							else 
								toChecked ? obj.check( true ) : obj.check( false );	//����ȡ������,��ȡ��ѡ��״̬;�෴������Ϊѡ��
						}
						else{																										
							if( !toChecked && !obj.oInput.checked ) continue;			//����ȡ������,�Ҹÿؼ�����ѡ��״̬���Ͳ���Ҫ�κβ�����,������һ��
							if( toChecked && obj.oInput.checked  )								//����ѡ�в������ҿؼ��Ѿ�Ϊѡ��״̬; ��ȡ��ѡ�У�Ϊ����ƥ����׼����ֻ��ƥ��ɹ��ˣ������ٴ�����Ϊѡ��״̬
								obj.check( false );																	
						}
					}
					
					v1 = obj.oInput.value;
					for( var n=0,len2=values.length; n<len2; n++ ){					//ѭ��ƥ��value�б�
						v2 = values[n];
						if( v1 == v2 ){																				//�ҵ���ƥ��ֵ
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
	daOption.inverse = function( name ){
		var vList = [];
		daOption.check( name, function( value, text ){								//��ȡ��ǰѡ�е�
			vList.push( value );
		});
		
		daOption.check( name, true );												//��ȫѡ
		daOption.check( name, vList, false );										//Ȼ��ȡ����֮ǰ��ѡ�е�
	};
	
	return daOption;

})();
	

win.daOption = daOption;



////����JS�ű���ʱ���滻ҳ�������е�input button���͵İ�ťΪ daButton����
//da(function(){
//	da("input").each(function( idx, obj ){
//		if( "checkbox" === this.type || "radio" === this.type ){
//				daOption.toOption( this );
//		}
//	});
//	
//});

} )( window );