/***************** Size *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Ԫ�سߴ��С������
	version: 1.0.0
*/
(function(da){
	//DOM���� λ�óߴ� ����������չ
	//��Ϊwidth��height����ֵ�Ļ�ȡ�������ƣ�����ͨ��each������������չda���height() �� width()����
	da.each([ "Height", "Width" ], function( i, name ) {
	
		var type = name.toLowerCase();													//"height" �� "width"
	
		da.fnStruct["inner" + name] = function() {							//��da������չ innerHeight �� innerWidth����
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, "padding" ) ) : null;
		};
	
		da.fnStruct["outer" + name] = function( margin ) {			//��da������չ outerHeight and outerWidth����
			return this.dom[0] ? parseFloat( da.css( this.dom[0], type, margin ? "margin" : "border" ) ) : null;
		};
		
		//��da����չ��Ӧ��height() �� width()����
		/*
			size:	Ŀ��DOM���� �ߴ�ֵ��������
		*/
		da.fnStruct[ type ] = function( size ) {
			var obj = this.dom[0];
			if ( !obj ) {
				return size == null ? null : this;									//���û��Ŀ��DOM���󣬷���this����
			}
			
			//getģʽ
			if ( da.isFunction( size ) ) {												//���size�ǻص������ķ�ʽ�������ȡ���dom�ĸ߿����ݣ���ͨ��each��������ã��ڻص��������ش�����ٴε�����Ӧheight() �� width()����
				return this.each(function( i ) {
					var objSelf = da( this );
					objSelf[ type ]( size.call( this, i, objSelf[ type ]() ) );			//�ص�����Ĭ�ϻش�dom����dom���������š���ǰheight��widthֵ��������
				});
			}
			
			if ( da.isWin( obj ) ) {										//���Ŀ������Ǵ���
				// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
				return ( obj.document.compatMode === "CSS1Compat" && obj.document.documentElement[ "client" + name ] ) 
				|| obj.document.body[ "client" + name ];
	
			}
			else if ( da.isDoc( obj ) ) {								//���Ŀ�������document ��nodeType�� 1=Ԫ��element�� 2=����attr�� 3=�ı�text�� 8=ע��comments�� 9=�ĵ�document��
					return Math.max(
						obj.body["scroll" + name],
						obj.body["offset" + name],
						obj.documentElement["client" + name],
						obj.documentElement["scroll" + name],
						obj.documentElement["offset" + name]
					);
	
			}
			
			else if ( size === undefined ) {							//���û�д��� �ߴ�ֵ�������� ��ֱ�ӷ�������
					var tmpv = da.css( obj, type ), ret = parseFloat( tmpv );
		
					return da.isNaN( ret ) ? tmpv : ret;
	
			}
			
			//setģʽ
			else{
				return this.css( type, typeof size === "string" ? size : size + "px" );
			}
		};
	
	});
	
})(da);
