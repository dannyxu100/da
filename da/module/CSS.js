/***************** CSS *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Ԫ����ʽ������
	version: 1.0.0
*/
(function(da){

	//CSS����Դ��������ʽ
	var	daRe_exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		daRe_alpha = /alpha\([^)]*\)/,
		daRe_opacity = /opacity=([^)]*)/,
		daRe_float = /float/i,
		daRe_upper = /([A-Z])/g,
		daRe_numpx = /^-?\d+(?:px)?$/i,
		daRe_num = /^-?\d/;
	
	//DOM���� ��ʽ���� ����������չ
	da.fnStruct.extend({
		//�ڵ���ʽ���� ��������
		/*
			name: style��ʽ������
			value: style��ʽ����ֵ
		*/
		css: function(name, value ) {
			return da.access( this, function( elem, name, value ) {
				return value !== undefined ?
					da.style( elem, name, value ) :			//set����
					da.css( elem, name );					//get����
					
			}, name, value, arguments.length > 1 );
			
		}
	});
	
	da.extend({
		/**��pxΪ��λ�����Զ��ձ�
		*/
		cssNumber: {
			"zIndex": true,
			"fontWeight": true,
			"opacity": true,
			"zoom": true,
			"lineHeight": true,
			"widows": true,
			"orphans": true
		},
		
		//�ڵ�������ȼ���ʽ���� ��������
		/*
			obj: DOM�ڵ����
			name: style��ʽ������
			force: ���class��ʹ����!import,  force������Ӧ��Ϊtrue;
		*/
		curCSS: function( obj, name, force ) {
			var ret, style = obj.style, filter;
			
			//IE��֧��opacity���ԣ���Ҫ��filter�˾�����
			if ( !da.support.opacity && "opacity"===name && obj.currentStyle ) {									//currentStyle��������ȫ����ʽ����Ƕ��ʽ��HTML��ǩ������ָ���Ķ����ʽ����ʽ(��width��height)��
				ret = daRe_opacity.test(obj.currentStyle.filter || "") ? ((parseFloat(RegExp.$1)/100) +"") : "";		//����ҵ�opacity���ԣ����ص�һ��ƥ�������ֵ
				
				return (""===ret) ? "1" : ret;		//���û�ж���opacity����Ĭ�Ϸ���1 (100%��ʾ)
			}
	
			//������ ��ʽ��׼������
			if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//��Ϊfloat��js�Ĺؼ���,����js�涨��λfloatҪ��cssFloat����Ϊ�˼���IEҪ��styleFloat����
			
			//����ڵ�style��������Ӧ����Ƕֵ��ֱ��ȡ��Ƕֵ
			//style�е��������ȼ�����class,���Կ����ȴ�style���ң�Ȼ���ٴ��Ѿ�����õ�css�������ҡ�
			//�����Ƕstyle����ʹ����!import����������⣬�Ͳ���ֱ��ȡstyle����ֵ��
			if ( !force && style && style[ name ] ) {
				ret = style[ name ];
	
			}
			//FireFox �ȱ�׼�������ͨ��getComputedStyle��ȡ��ǰ����õ���ʽ����ֵ
			else if ( da.support.getComputedStyle ) {
				if ( daRe_float.test( name ) ) {															//��ʹ��getPropertyValue��ȡfloat����ֵʱ����Ҫ��ǰ���ʽ���õ�cssFloat��styleFloat���������Ļ�Ϊfloat
					name = "float";
				}
				
				name = name.replace( daRe_upper, "-$1" ).toLowerCase();				//��:font-Weight���м䲿�ִ�д���շ��ʽ "-W"�滻�� "-w"Сд
	
				var defaultView = obj.ownerDocument.defaultView;
	
				if ( !defaultView ) {
					return null;
				}
	
				var computedStyle = defaultView.getComputedStyle( obj, null );
	
				if ( computedStyle ) {
					ret = computedStyle.getPropertyValue( name );
				}
	
				if ( "opacity"===name && ""===ret ) {										//���û�ж���opacity����Ĭ�Ϸ���1 (100%��ʾ)
					ret = "1";			
				}
		
			}
			//IE ͨ��currentStyle��ȡ��ǰ����õ���ʽ����ֵ
			else if ( obj.currentStyle ) {
				var camelCase = da.camelCase(name);						//��:font-weight���м䲿�� "-w"�滻�� "-W"��д���շ��ʽ
	
				ret = obj.currentStyle[ name ] || obj.currentStyle[ camelCase ];
	
				//�������ص�λ������ֵ ת��Ϊ������Ϊ��λ��ֵ
				if ( !(daRe_numpx.test( ret )) && (daRe_num.test( ret )) ) {			//��ֵ���Ҳ���px��λ������ֵ
						var left = style.left, rsLeft = obj.runtimeStyle.left;				//����һ�µ�ǰ������ֵ
						
						obj.runtimeStyle.left = obj.currentStyle.left;								//�����ȼ���ߵ���ʽ ��ֵ��runtimeStyle����ǰ���ֵ���ʽ���ԣ�
						style.left = ("fontSize"===camelCase) ? "1em" : (ret || 0);		//��ѹ��������ֵ�󣬻�ȡȫ�¼������ ������Ϊ��λ����ʽֵ
						ret = style.pixelLeft + "px";
		
						style.left = left;																						//��ԭ����ʱ�ı������ֵ
						obj.runtimeStyle.left = rsLeft;
				}
			}
	
			return ret;
		},
		
		//ͨ��������ʽֵ��, �ص�callback����, Ȼ��ԭ��ʽ
		/*
			obj: DOM�ڵ����
			options: ��ʽֵ��ֵ�Զ���
			callback:	�ص�����
		*/
		swap: function( obj, options, callback ) {
			var old = {};
	
			for ( var name in options ) {						//����һ�µ�ǰ������ֵ
				old[ name ] = obj.style[ name ];
				obj.style[ name ] = options[ name ];
			}
			
			callback.call( obj );
			
			for ( var name in options ) {						//��ԭ����ʱ�ı������ֵ
				obj.style[ name ] = old[ name ];
			}
		},
		
		//�ڵ���ʽ���� ��������
		/*
			obj: DOM�ڵ����
			name: style��ʽ������
			force: ���class��ʹ����!import,  force������Ӧ��Ϊtrue;
			extra: ���������ͷ˵������border-left��margin-left��
		*/
		css: function( obj, name, force, extra ) {
			//�Խڵ�Ԫ�صĸ߿����������������㷨��ͳһ
			//IE�нڵ�Ԫ�ص�ʵ�ʸ߿��ǰ���content, padding, border���ܺ�,��firefox��ֻ��content�ĳߴ�;
			//����Ĭ����content�ĳߴ�Ϊ�ڵ�Ԫ�ص�ʵ�ʸ߿�
			if ( name === "width" || name === "height" ) {
				var val,
				props = { position: "absolute", visibility: "hidden", display:"block" }, 
				which = ("width"===name ? [ "Left", "Right" ] : [ "Top", "Bottom" ]);
				
				//��ڵ�Ԫ�ص�ʵ�ʸ߶ȺͿ�ȣ���padding��border��
				function getWH() {
					val = name === "width" ? obj.offsetWidth : obj.offsetHeight;
	
					if ( extra === "border" ) {
						return;
					}
					
					for(var s=0,len=which.length; s<len; s++){
						if ( !extra ) {
							val -= parseFloat(da.curCSS( obj, "padding"+ s, true)) || 0;
						}
	
						if ( extra === "margin" ) {
							val += parseFloat(da.curCSS( obj, "margin"+ s, true)) || 0;
						}
						else {
							val -= parseFloat(da.curCSS( obj, "border"+ s + "Width", true)) || 0;
						}
					}
				}
				
				//����ڵ�Ԫ�ص�ǰΪ�ɼ�����ֱ��ͨ��getWH ����������ʵ�ʸ߶ȺͿ��
				if ( obj.offsetWidth !== 0 ) {
					getWH();
				}
				//����ڵ�Ԫ�ص�ǰ ���ɼ������ýڵ�Ԫ�ض���Ϊ���Զ�λ( position: "absolute" )���ɼ�( visibility: "hidden"��display:"block" )Ȼ����ȡʵ�ʸ߶ȺͿ��( ��Ϊ���ɼ��Ľڵ�Ԫ��������ǲ�������߿�� )
				else {
					da.swap( obj, props, getWH );
				}
	
				return Math.max(0, Math.round(val));
			}
	
			return da.curCSS( obj, name, force );
		},
	
		//�ڵ�style��ʽ���Բ�������
		/*
			obj: DOM�ڵ����
			name: style��ʽ������
			value: style��ʽ����ֵ
		*/
		style: function( obj, name, value ) {
			if ( !obj || !obj.style || obj.nodeType === 3 || obj.nodeType === 8 ) {			//�������÷�����Եļ��ı� ��һЩ�������͵Ľڵ�Ԫ�أ�nodeType�� 1=Ԫ��element�� 2=����attr�� 3=�ı�text�� 8=ע��comments�� 9=�ĵ�document��
				return undefined;
			}
	
			if ( ( "width"===name || "height"===name ) && parseFloat(value) < 0 ) {		//width ��height���Բ���Ϊ����
				value = undefined;
			}
	
			var style = obj.style || obj, set = value !== undefined;				//����Ǹ�ֵ�����������ֵ
	
			//IE��֧��opacity���ԣ���Ҫ��filter�˾�����
			if ( !da.support.opacity && "opacity"===name ) {
				if ( set ) {
					style.zoom = 1;			//IE��bug,����layoutģʽ��Ԫ��ʹ��opacity���Ի�ʧЧ,����zoomֵ���Խ��
	
					var opacity = "NaN"===(parseInt( value, 10 )+ "") ? "" : ("alpha(opacity="+ value*100+ ")");	//ͨ��alpha����������Ч��opacity����
					var filter = style.filter || da.curCSS( obj, "filter" ) || "";																//���ҽڵ��style���� ����ʽ���е��˾�����
					
					style.filter = daRe_alpha.test(filter) ? filter.replace(daRe_alpha, opacity) : opacity;			//У���ڵ��˾�����
				}
	
				return (style.filter && 0<=style.filter.indexOf("opacity=")) ? ((parseFloat( daRe_opacity.exec(style.filter)[1] ) / 100) +"") : "";			//���ز�͸��������ֵ
			}
			
			//������ ��ʽ��׼������
			if ( daRe_float.test( name ) ) name=da.support.cssFloat ? "cssFloat" : "styleFloat";			//��Ϊfloat��js�Ĺؼ���,����js�涨��λfloatҪ��cssFloat����Ϊ�˼���IEҪ��styleFloat����
			name = da.camelCase(name);																		//��:font-weight���м䲿�� "-w"�滻�� "-W"��д���շ��ʽ
	
			if ( set )	style[ name ] = value;			//����Ǹ�ֵ�������͸���Ӧ��ʽ���Ը�ֵ

			return style[ name ];
		}
			
	});
	
})(da);