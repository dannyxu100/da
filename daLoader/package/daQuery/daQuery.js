/**
*	动态组合查询插件
* @author: danny.xu
* @version:	daQuery v1.0 date:2011-7-6 9:42:55
*/

(function(win){

var doc = win.document;

var daQuery = (function(){
	
	/**daQuery类构造函数
	*/
	var daQuery = function(querySetting) {
	    return new daQuery.fnStruct.init(querySetting)
	};
	
	daQuery.fnStruct = daQuery.prototype = {
	    version: "daQuery v1.0  \nauthor: danny.xu    \ndate:2011-7-6 9:42:59    \ndescription:	动态组合查询插件",
			
			queryId: 0,
			queryParentObj: null,
			queryObj: null,
			queryFieldObj: null,
			
			querySlideBt: null,									//显示隐藏 过滤条件面板开关DOM对象
			queryFliterPad: null,
			queryFliters: [],
			
			querySlideBt2: null,								//显示隐藏 显示项面板开关DOM对象
			queryItemPad: null,
			queryItems: [],
			queryItemHeads: [],									//显示可选项
			
			queryToolBar: null,
			queryRunBt: null,										//"应用"按钮DOM对象
			querySaveBt: null,									//"保存"按钮DOM对象
			queryClearBt: null,									//"清除"按钮DOM对象
			
			querySetting: {
				parent: null,
				type: "query",										//生成SQL方式 [ "query", "chart" ]，默认"query"
				src: "",
				orderBy: "",
				field: [],
				
				run: null,
				clear: null,
				save: null
			},
			
			/**初始化函数
			*/
	    init: function(querySetting) {
	    	querySetting = this.querySetting = da.extend(true, {}, this.querySetting, querySetting);
	    	
	    	this.queryParentObj = da(querySetting.parent).dom[0] || null;
	    	if( null == this.queryParentObj ) { alert("daQuery温馨提示：需要提供一个有效的父元素，显示组合查询面板"); return; }
	    	if( !querySetting.src ) { alert("daQuery温馨提示：没有提供有效的数据源"); return; }
	    	
	    	while( doc.getElementById( "daQuery" + this.queryId ) ){ this.queryId++; }
	    	this.queryId = "daQuery" + this.queryId;
	    	
	    	this.create();
	    	this.bindEvent();
	    },
	    
			/**构建DOM对象集合
			*/
	    create: function() {
	    	var queryObj = doc.createElement("div");
	    	
	    	queryObj.id = this.queryId;
	    	
	    	queryObj.style.cssText = "border:1px solid #999;padding:10px;font-size:12px;";
	    	queryObj.innerHTML = '查询可选项：';
	    	
	    	this.queryFieldObj = this.createSelect( this.querySetting.field );									//创建字段选项下拉控件
	    	this.queryFieldObj.id = this.queryFieldObj.name = this.queryId + "_field";
	    	queryObj.insertBefore( this.queryFieldObj, null );
	    	
	    	this.querySlideBt = doc.createElement("a");																					//创建过滤条件显示隐藏按钮
	    	this.querySlideBt.style.cssText = "display:block;text-decoration:none;padding:3px;margin-top:10px;color:#999;border-top:1px solid #f5f5f5;";
	    	this.querySlideBt.href = "javascript:void(0)";
	    	this.querySlideBt.innerHTML = '<span style="font-family:webdings">4</span>过滤<span style="color:#dedede">(点击隐藏)</span>';
	    	queryObj.insertBefore( this.querySlideBt, null );
	    	
	    	this.queryFliterPad = doc.createElement("div");																			//创建过滤条件面板
	    	this.queryFliterPad.id = this.queryId + "_fliterPad";
	    	queryObj.insertBefore( this.queryFliterPad, null );
	    	
	    	this.queryItemHeads = [];
	    	for(var i=0,len=this.querySetting.field.length; i<len; i++){
	    		if( this.querySetting.field[i][3] && true === this.querySetting.field[i][3] )
	    			this.queryItemHeads.push( this.querySetting.field[i] );
	    	}
	    	
	    	if( "chart" == this.querySetting.type ){
		    	this.querySlideBt2 = doc.createElement("a");																				//创建显示项显示隐藏按钮
		    	this.querySlideBt2.style.cssText = "display:block;text-decoration:none;padding:3px;margin-top:10px;color:#999;border-top:1px solid #f5f5f5;";
		    	this.querySlideBt2.href = "javascript:void(0)";
		    	this.querySlideBt2.innerHTML = '<span style="font-family:webdings">4</span>显示项<span style="color:#dedede">(点击隐藏)</span>';
		    	queryObj.insertBefore( this.querySlideBt2, null );
		    	
		    	this.queryItemPad = doc.createElement("div");																				//创建过滤条件面板
		    	this.queryItemPad.id = this.queryId + "_fliterPad";
		    	queryObj.insertBefore( this.queryItemPad, null );
		    	
		    	this.createItemBar(["横向： ", "H" ]);
		    	this.createItemBar(["纵向： ", "V" ]);
	    	}
	    	
	    	this.queryToolBar = doc.createElement("div");																				//创建工具按钮条
	    	this.queryToolBar.id = this.queryId + "_ToolBar";
	    	this.queryToolBar.style.cssText = "margin-top:5px;text-align:right;";
	    	queryObj.insertBefore( this.queryToolBar, null );
	    	
	    	if( da.isFunction( this.querySetting.run ) ){								//“应用”按钮
					this.queryRunBt = doc.createElement("a");	
		    	this.queryRunBt.id = this.queryId + "_Run";
		    	this.queryRunBt.href = "javascript:void(0);";
		    	this.queryRunBt.style.cssText = "display:inline-block;padding:3px;margin-right:10px;border:1px solid #cc6600;font-size:12px;color:#cc6600;background:#f7f7f7;text-decoration:none;";
		    	this.queryRunBt.innerHTML = "应用";
		    	this.queryToolBar.insertBefore( this.queryRunBt, null );
	    	}
	    	if( da.isFunction( this.querySetting.save ) ){							//“保存”按钮
					this.querySaveBt = doc.createElement("a");
		    	this.querySaveBt.id = this.queryId + "_Save";
		    	this.querySaveBt.href = "#";//"javascript:void(0);";
		    	this.querySaveBt.style.cssText = "display:inline-block;padding:3px;margin-right:10px;border:1px solid #006633;font-size:12px;color:#006633;background:#f7f7f7;text-decoration:none;";
		    	this.querySaveBt.innerHTML = "保存";
		    	this.queryToolBar.insertBefore( this.querySaveBt, null );
	    	}
				this.queryClearBt = doc.createElement("a");									//“清空”按钮
	    	this.queryClearBt.id = this.queryId + "_Clear";
		    this.queryClearBt.href = "javascript:void(0);";
		    this.queryClearBt.style.cssText = "display:inline-block;padding:3px;margin-right:10px;border:1px solid #666;font-size:12px;color:#666;background:#f7f7f7;text-decoration:none;";
		    this.queryClearBt.innerHTML = "清空";
	    	this.queryToolBar.insertBefore( this.queryClearBt, null );
	    	
	    	this.queryParentObj.insertBefore( queryObj, null );
	    	this.queryObj = queryObj;
	    	
	    },
	    
			/**事件绑定函数
			*/
	    bindEvent: function() {
	    	var context = this;
	    	da( this.queryFieldObj ).change(function(evt){
	    			var selData = getSelected(this),
	    					idxField = selData.obj.getAttribute("idx"),
								field = context.querySetting.field;
   						
						context.addFliter( field[ idxField ] );
	    	
	    	});
	    	
	    	if( this.queryRunBt ){
			    da( this.queryRunBt ).bind( "click", function(){
			    	context.run();
			    	
			    });
			  }
	    	if( this.querySaveBt ){
			    da( this.querySaveBt ).bind( "click", function(){
			    	context.save();
			    		
			    });
			  }
	    	if( this.queryClearBt ){
			    da( this.queryClearBt ).bind( "click", function(){
			    	context.clear();
			    	
			    });
			  }
		    
		    da( this.querySlideBt ).bind( "click", function(){
		    	this.blur();
		    	context.slide( "fliterPad" );
		    });

		    da( this.querySlideBt2 ).bind( "click", function(){
		    	this.blur();
		    	context.slide( "itemPad" );
		    });
	    },
	    
	    /**创建select控件
	    * @param {Array} arrItem 可选项名称和数值
	    * @param {int} idxSelected 默认选中项索引号
	    */
	    createSelect: function( arrItem, idxSelected ){
	    	var arrOption = [],
	    			optionObj,
	    			selectObj = doc.createElement("select");
	    	
	    	for( var i=0, len=arrItem.length; i<len; i++ ){
	    		optionObj = doc.createElement("option");
	    		optionObj.innerHTML = arrItem[i][0];
	    		optionObj.value = arrItem[i][1];
	    		optionObj.setAttribute( "idx", i );
	    		
	    		if( idxSelected == i ) 
	    			optionObj.setAttribute( "selected", "selected" );
	    		
	    		selectObj.insertBefore( optionObj, null );
	    	}
	    	
	    	return selectObj;
	    },
	    
	    /**创建显示项集合工具条
	    */
	 		createItemBar: function( itemSetting ){
	    	var context = this,
	    			items = this.queryItems,
	    			itemId = this.queryId + "_Item" + items.length,
	    			itemName = itemSetting[0],
	    			itemCode = itemSetting[1],
	    			divItem, tmpObj;
	    	
  			divItem = doc.createElement("div");
  			divItem.style.cssText = "margin:5px 10px; float:left;"
  			divItem.id = itemId;
  			divItem.setAttribute( "fldCode", da.code( itemCode ) );
  			
	    	tmpObj = doc.createElement("span");
	    	tmpObj.style.cssText = "width:100px;color:#999;";
	    	tmpObj.innerHTML = itemName;
	    	divItem.insertBefore( tmpObj, null );
	    	
	    	tmpObj = this.createSelect( this.queryItemHeads, items.length );					//创建字段选项下拉控件
	    	tmpObj.id = itemId + "_" + itemCode + "_select";
	    	divItem.insertBefore( tmpObj, null );
				this.queryItemPad.insertBefore( divItem, null );
	    	
				items.push({
	    		id: itemId,
	    		code: itemCode,
	    		obj: tmpObj
	    	});
	    	
	    	return tmpObj;
	 		},
	    
	    /**创建过滤条件集合工具条
	    */
	    createFliterBar: function( fieldSetting ){
	    	var context = this,
	    			fliters = this.queryFliters,
	    			fliterId = this.queryId + "_fliter" + fliters.length,
	    			ulObj, relationObj, nameObj, delObj, isCheck = isFirst = true,
	    			fieldName = fieldSetting[0],
	    			fieldCode = fieldSetting[1],
	    			fieldType = fieldSetting[2];
	    	
	    	for( var i=0, len=fliters.length; i<len; i++ ){										//如果已有相同字段的过滤条件，就不用创建容器DOM对象了
	    		if( fieldCode == fliters[i].field){
	    			ulObj = fliters[i].obj;
	    			isFirst = false;
	    		}
	    	}
	    	
	    	ulObj = doc.createElement("ul");
	    	ulObj.id = fliterId;
	    	ulObj.name = fieldCode;
	    	ulObj.style.cssText = "padding:5px;margin:0px;";
	    	da( ulObj ).bind("click",function(){								//过滤项 点击高亮特效
	    		context.focusFliter( this );
	    	});
	    	
		    
	    	relationObj = doc.createElement("a");
	    	relationObj.id = fliterId + "_" + fieldCode + "_relation";
	    	relationObj.style.cssText = isFirst ? "display:inline-block;text-decoration:none;padding:3px;margin-right:10px;border:1px solid #cc6600;color:#cc6600;" 
	    		: "display:inline-block;text-decoration:none;padding:3px;border:1px solid #006633;color:#006633;margin-left:120px;margin-right:10px;";
	    	relationObj.href = "javascript:void(0);";
	    	relationObj.innerHTML = "并且";
	    	relationObj.setAttribute("sqlkey","and");
		    
	    	da( relationObj ).bind("click",function(){					//过滤条件关系按钮点击事件
	    		if( "or" == this.getAttribute("sqlkey") ){
			    	this.innerHTML = "并且";
			    	this.setAttribute("sqlkey","and");
	    		}
	    		else{
			    	this.innerHTML = "或者";
			    	this.setAttribute("sqlkey","or");
	    		}
	    		
	    	});
	    	if( 0 == fliters.length ){
	    		relationObj.style.visibility = "hidden";
		    }
	    	ulObj.insertBefore( relationObj, null );
	    	
	    	nameObj = doc.createElement("span");
	    	nameObj.id = fliterId + "_" + fieldCode + "_name";
	    	nameObj.style.cssText = "width:120px;color:#999;";
	    	nameObj.style.display = isFirst ? "inline-block" : "none";
	    	nameObj.innerHTML = fieldName + "： ";
	    	ulObj.insertBefore( nameObj, null );
	    	
	    	var tmpObj = null;																	//用于创建DOM的临时对象
	    	if( 0 < fieldType.indexOf("[")){										//判断是否常量选择类型
	    		fieldType = fieldType.split("[");

	    		fieldType[1] = fieldType[1].substring( 0, fieldType[1].length-1 );
	    		var arrItems = fieldType[1].split("|"),
	    				domType = "";
	    		
	    		switch( fieldType[0] ){
	    			case "check":																		//复选
	    			case "2":
		    			fieldType = "check";
		    			domType = "checkbox";
	    				break;
	    			case "radio":																		//单选
	    			case "1":
		    			fieldType = "radio";
		    			domType = "radio";
	    				break;
	    		}
	    		
	    		var checkId, checkName;
	    		for( var i=0,len=arrItems.length; i<len; i++ ) {
	    			arrItems[i] = arrItems[i].split(":");
	    			checkId = fliterId + "_check" + i;
	    			checkName = fliterId + "_" + fieldCode;
	    			
		    		tmpObj = doc.createElement("input");
		    		tmpObj.type = domType;
		    		tmpObj.id = checkId;
		    		tmpObj.name = checkName;
		    		
		    		tmpObj.value = da.code( arrItems[i][1] );				
	    			ulObj.insertBefore( tmpObj, null );
		    		if( 0 == i ) 
		    			tmpObj.checked= true;
	    			
		    		tmpObj = doc.createElement("label");
		    		tmpObj.style.cssText = "margin-right:10px;";
		    		tmpObj.htmlFor = checkId;
		    		tmpObj.innerHTML = arrItems[i][0];
	    			ulObj.insertBefore( tmpObj, null );
	    			
	    		}
	    			
	    		
	    	}
	    	else{																								//数值(包括日期时间)和文本类型
	    		switch( fieldType ){
	    			case "text":
	    				tmpObj = this.createSelect([
	    					["起头",da.code( " like '{?}%'" )],
	    					["结尾", da.code( " like '%{?}'" )],
	    					["包含", da.code( " like '%{?}%'" )]
	    				]);
	    				tmpObj.id = fliterId + "_" + fieldCode + "_select";
	    				tmpObj.style.cssText="margin-right:5px;";
	    				ulObj.insertBefore( tmpObj, null );
	    				
	    				break;
	    			case "date":
	    			case "number":
	    				tmpObj = this.createSelect([
	    					[ "＝", da.code( "='{?}'" ) ],
	    					[ "＞", da.code( ">'{?}'" ) ],
	    					[ "＞＝", da.code( ">='{?}'" ) ],
	    					[ "＜", da.code( "<'{?}'" ) ],
	    					[ "＜＝", da.code( "<='{?}'" ) ]
	    				]);
	    				tmpObj.id = fliterId + "_" + fieldCode + "_select";
	    				tmpObj.style.cssText="margin-right:5px;";
	    				ulObj.insertBefore( tmpObj, null );
	    				break;

	    		}
	    		
		    	tmpObj = doc.createElement("input");
		    	tmpObj.id = fliterId + "_" + fieldCode;	
	    		ulObj.insertBefore( tmpObj, null );
	    		
	    		isCheck = false;
	    	}
	    	
	    	if( isFirst && "check" !== fieldType && "radio" !== fieldType ){
		    	tmpObj = doc.createElement("a");												//添加追加字段内过滤条件按钮
		    	tmpObj.id = fliterId + "_" + fieldCode + "_add";
		    	tmpObj.style.cssText = "text-decoration:none;padding:2px;margin-left:20px;color:#006633;font-family:webdings";
		    	tmpObj.href = "javascript:void(0)";
		    	tmpObj.innerHTML = "6";
		    	da( tmpObj ).bind("click",function(){										//追加字段内过滤条件按钮点击事件
						context.addFliter( fieldSetting );
						
						return false;																				//禁止事件冒泡，避免影响fliter高亮效果
		    	});
		    	ulObj.insertBefore( tmpObj, null );
		    	
		    }
	    	
	    	
	    	tmpObj = doc.createElement("a");												//添加删除按钮
		    tmpObj.id = fliterId + "_" + fieldCode + "_delete";
	    	tmpObj.style.cssText = ( isFirst || isCheck ) ? "text-decoration:none;padding:2px;margin-left:5px;color:#660000;font-family:webdings;"
	    		: "text-decoration:none;padding:2px;margin-left:41px;color:#660000;font-family:webdings";
	    	tmpObj.href = "javascript:void(0)";
	    	tmpObj.innerHTML = "r";
	    	da( tmpObj ).bind("click",function(){										//删除按钮点击事件
					context.deleteFliter( fliterId );
	    	});
	    	ulObj.insertBefore( tmpObj, null );
	    	
	    	fliters.push({
	    		id: fliterId,
	    		field: fieldCode,
	    		type: fieldType,						//[text, number, date, check, radio]
	    		obj: ulObj
	    	});
	    	
	    	return ulObj;
	    },
	    
	    /**通过过滤条件id，获取过滤条件缓存信息
	    */
	    getFliterData: function( id ){
	    	var filters = this.queryFliters;
	    	
    		for( var i=0,len=filters.length; i<len; i++ ){
    			if( id == filters[i].id ){
    				return {
    					idx: i,
    					data: filters[i]
    				};
    			}
    			
    		}
	    	
	    	return null;
	    	
	    },
	    
	    /**删除一条过滤条件
	    */
	    deleteFliter: function( fliterId ){
	    		var fliterData = this.getFliterData( fliterId ),
	    				fliters = this.queryFliters,
	    				ulFliter = doc.getElementById( fliterId ),
	    				divField = ulFliter.parentNode;
					
	    		fliters.splice( fliterData.idx, 1 );
	    	
	    		if( 0 == fliterData.idx ){
//						var nameObj = doc.getElementById( fliters[0].id + "_" + fliters[0].field + "_name" ),
//								relationObj = doc.getElementById( fliters[0].id + "_" + fliters[0].field + "_relation" );
//						
//						nameObj.style.display = "block";
	    		}
	    		
	    		divField.removeChild( ulFliter );
	    		
	    		if( 0 >= divField.children.length ) 
	    			this.queryFliterPad.removeChild( divField );
	    },
	    
	    /**添加一条过滤条件
	    */
	    addFliter: function( fieldSetting ){
   				var ulFliter, divField;
    			
    			ulFliter = this.createFliterBar( fieldSetting );
    			divField = doc.getElementById( this.queryId + "_" + fieldSetting[1] + "_pad" );
    			
    			if( !divField ){
	    			divField = doc.createElement("div");
	    			divField.id = this.queryId + "_" + fieldSetting[1] + "_pad";
	    			divField.setAttribute( "fldCode", da.code( fieldSetting[1] ) );
	    			divField.setAttribute( "fldType", da.code( fieldSetting[2] ) );
	    			divField.style.cssText = "padding:0px;margin:3px 0px;border:1px dashed #dedede;";
	    			
    				this.queryFliterPad.insertBefore( divField, null );
    			}
    			
	    		divField.insertBefore( ulFliter, null );
	    		this.focusFliter( ulFliter );
	    		
					needautoframeheight();
	    },
	    
	    /**使过滤条件工具条高亮显示
	    */
	    focusFliter: function( ulFliter ){
	    	if( this.hoverFliter ){
	    		if( this.hoverFliter.id != ulFliter.id ){
	    			this.hoverFliter.style.background = "#fff";
	    			
	    		}
	    	}
	    	ulFliter.style.background = "#ffffcc";
	    	this.hoverFliter = ulFliter;
	    	
	    },
	    
	    transDOM: function( fliter, isFirstFliter ){
	    	var fliterSQL = "", relation = "",
	    			ulObj = doc.getElementById( fliter.id );
	    	
	    	if( !ulObj ) return;
	    	
	    		switch( fliter.type ){
	    			case "text":
	    				var val = doc.getElementById( fliter.id + "_" + fliter.field ).value,
	    						selData = getSelected( doc.getElementById( fliter.id + "_" + fliter.field + "_select" ) );
	    						
							fliterSQL = fliter.field + da.decode( selData.value ).replace( "{?}", val );
							
	    				break;
	    			case "date":
	    			case "number":
	    				var val = doc.getElementById( fliter.id + "_" + fliter.field ).value,
	    						selData = getSelected( doc.getElementById( fliter.id + "_" + fliter.field + "_select" ) );
	    						
							fliterSQL = fliter.field + da.decode( selData.value ).replace( "{?}", val );
							
	    				break;
	    			case "check":
	    				var arrVal = [];
	    				
							da("input[name="+ ( fliter.id + "_" + fliter.field ) + "]:checked").each(function(){
								arrVal.push( da.decode( this.value ) );
								
							});
							
							if( 0 < arrVal.length )
								fliterSQL = fliter.field + " in (" + arrVal.join(",") + ")";
							
	    				break;
	    			case "radio":
	    				var val = da("input[name="+ ( fliter.id + "_" + fliter.field ) + "]:checked").val();
	    				
							fliterSQL = fliter.field + "=" + da.decode( val );
							
	    				break;

	    		}
	    	
	    	relation = doc.getElementById( fliter.id + "_" + fliter.field + "_relation" ).getAttribute("sqlkey");
	    	
	    	if( "" == fliterSQL ) return null;
	    	
	    	return {
	    		fst: isFirstFliter,								//同字段过滤条件中，是否是第一个
	    		rlt: relation,										//过滤条件，与否关系
	    		sql: fliterSQL										//过滤SQL语句
	    	};
	    	
	    	
	    },
	    
	    /**组织显示项的SQL语句
	    */
	    createSqlItem: function(){
	    	var items = this.queryItems,
	    			selData,
	    			arrItemSQL = [];
				
				if( "chart" == this.querySetting.type ){
		  		for( var i=0,len=items.length; i<len; i++){
		  			selData = getSelected( items[i].obj );
		  			arrItemSQL.push( selData.value );
		  			
		  		}
		  	}
		  	else if( "query" == this.querySetting.type ){
		  		for( var i=0,len=this.queryItemHeads.length; i<len; i++){
		  			arrItemSQL.push( this.queryItemHeads[i][1] );
		  			
		  		}

		  	}
	  		
	  		return arrItemSQL;
	  	},
	    
	    /**组织同字段内的过滤SQL语句
	    */
	    createSqlField: function( field, transData ){
	    	var fieldSQL = "", firstFliter = "",
	    			arrAND = [], arrOR = [];
	    	
	    	for( var i=0,len=transData.length; i<len; i++ ){								//同字段条件，与或关系分类缓存
	    		if( transData[i].fst ){
	    			firstFliter = transData[i].sql;
	    		}
	    		else{
	    			if( "or" == transData[i].rlt )
	    				arrOR.push( transData[i].sql );
	    			else
	    				arrAND.push( transData[i].sql );
	    		}
	    		
	    	}
	    	
    		if( 0 < arrOR.length ){																					//按照SQL与或关系语法，组织 相同字段 过滤条件
    			arrOR.push( firstFliter );																		//有or条件
					
		    	if( 0 < arrAND.length ){																			//有or条件，同时有and条件
						fieldSQL = arrAND.join(" and ");
		    		
			    	for( var i=0,len=arrOR.length; i<len; i++ ){
			    		arrOR[i] = arrOR[i] + " and " + fieldSQL;
			    		arrOR[i] = 1 < len ? "(" + arrOR[i] + ")" : arrOR[i];
			    	}

			    }
    			fieldSQL = arrOR.join(" or ");
	    		fieldSQL = 1 < arrOR.length ? "(" + fieldSQL + ")" : fieldSQL;
    		}
		    else{																														//没有or条件
			  		arrAND.push( firstFliter );
		    		fieldSQL = arrAND.join(" and ");
	    			fieldSQL = 1 < arrAND.length ? "(" + fieldSQL + ")" : fieldSQL;
		    }
	    	
	    	return fieldSQL;
	    	
	    },
	    
	    createSql: function(){
	    	var fliters = this.queryFliters, 
	    			cache = {}, 
	    			arrAND = [], arrOR = [], 
	    			firstField = null,									//第一个过滤条件的字段名
	    			firstFliter,												//第一个过滤条件的字段的 过滤条件SQL
	    			transData,
	    			field, 
	    			reSQL, selectSQL, fromSQL, whereSQL, orderSQL;

    		for( var i=0,len=fliters.length; i<len; i++ ){									//同字段过滤条件归类
    			field = fliters[i].field;
    			
    			if( !firstField ) firstField = field;
    			if( !cache [ field ] ) cache [ field ] = [];
    			
    			transData = this.transDOM( fliters[i], (0 == cache[ field ].length) );				//某字段的第一个过滤条件，需要参考SQL语法特殊处理
    			if( transData ){
    				cache [ field ].push( transData );
    			}
    			else if( 0 == cache[ field ].length ){
    				delete cache[ field ];
    				if( field == firstField ) firstField = null;
    				
    			}
    		}
    		
    		for( var f in cache ){																					//不同字段条件，与或关系分类缓存
	    		if( firstField == f ){
	    			firstFliter = this.createSqlField( f, cache[ f ] );
	    		}
	    		else{
	    			if( "or" == cache[f][0].rlt )
	    				arrOR.push( this.createSqlField( f, cache[ f ] ) );
	    			else
	    				arrAND.push( this.createSqlField( f, cache[ f ] ) );
	    		}
	    		
    		}
    		
	    	if( 0 < arrOR.length ){																					//按照SQL与或关系语法，组织 不同字段 过滤条件
	    		arrOR.push( firstFliter );																		//有or条件
	    		
	    		if( 0 < arrAND.length ){																			//有or条件，同时有and条件
	    			whereSQL = arrAND.join(" and ");
	    		
			    	for( var i=0,len=arrOR.length; i<len; i++ ){
			    		arrOR[i] = arrOR[i] + " and " + whereSQL;
			    		arrOR[i] = 1 < len ? "(" + arrOR[i] + ")" : arrOR[i];
			    	}
			    	
	    		}
    			whereSQL = arrOR.join(" or ");
		    }
		    else{																														//没有or条件
		    	arrAND.push( firstFliter );
		    	whereSQL = arrAND.join(" and ");
		    }
				//alert(whereSQL);
				
				fromSQL = this.querySetting.src.toLowerCase();
				orderSQL = this.querySetting.orderBy.toLowerCase();
				
				var arrItemSQL = this.createSqlItem();
				selectSQL = arrItemSQL.join(",");
				
				if( "" != whereSQL ){
					if( 0 < fromSQL.indexOf( "where" ) )																							//如果src中有where语句，就追加where条件
						fromSQL = fromSQL.replace( "where", ( "where " + whereSQL + " and " ) );
					else																																							//如果src中没有where语句，就直接连接where语句
						fromSQL = fromSQL + " where " + whereSQL;
				}

				if( "chart" == this.querySetting.type ){																						//根据type[ "query", "chart" ]，结合sql语法 组织SQL语句
					reSQL = "select " + selectSQL + ", count(*)";
					reSQL = reSQL + " from " + fromSQL + " group by " + selectSQL + " " + orderSQL;
					
				}
				else{
					reSQL = "select " + selectSQL;
					reSQL = reSQL + " from " + fromSQL + " " + orderSQL;
					
				}
				
		    return {
		    	all: reSQL,
		   		select: arrItemSQL,
		   		where: whereSQL,
		   		from: "from " + fromSQL,
		   		order: orderSQL
		   	};

	    },
	    
	    loadItem: function( itemHTML ){
	    	var itemId, itemCode,
	    			divItems, selectItems, selectObj;
	    	
	    	this.queryItemPad.innerHTML = itemHTML;
	    	divItems = this.queryItemPad.children;
	    	
	    	this.queryItems = [];
	    	for( var i=0, lenItem=divItems.length; i<lenItem; i++ ){
	    		itemId = divItems[i].id;
	    		itemCode = da.decode( divItems[i].getAttribute("fldCode") );
	    		
	    		selectItems = divItems[i].children;
	    		selectObj = selectItems[1];
	    		selectObj.id;
	    		
					this.queryItems.push({
		    		id: itemId,
		    		code: itemCode,
		    		obj: selectObj
		    	});
	    	}
				
	    	
	    },
	    
	    loadFliter: function( fliterHTML ){
	    		var context = this,
	    				field = this.querySetting.field,
	    				fliterId = "",
		    			fieldCode = "",
		    			fieldType = "",
		    			fieldSetting = [],
	    				divFliters, ulItems, ulObj,
	    				tmpObj;
	    		
	    		this.queryFliterPad.innerHTML = fliterHTML;
		    	divFliters = this.queryFliterPad.children;
		    	
		    	this.queryFliters = [];
		    	for( var i=0, lenPad=divFliters.length; i<lenPad; i++ ){
		    		fieldCode = da.decode( divFliters[i].getAttribute("fldCode") );
		    		fieldType = da.decode( divFliters[i].getAttribute("fldType") );
		    		
		    		ulItems = divFliters[i].children;
		    		
		    		for( var n=0, lenItem=ulItems.length; n<lenItem; n++ ){
		    			ulObj = ulItems[n];
		    			fliterId = ulObj.id;
			    		
			    		for( var m=0, lenField=field.length; m<lenField; m++ ){
			    			if( fieldCode == field[m][1] ){
			    				fieldSetting = field[m];
			    				break;
			    			}
			    		}
			    		
				    	if( 0 < fieldType.indexOf("[")){										//判断是否常量选择类型
				    		fieldType = fieldType.split("[");
								
				    		fieldType[1] = fieldType[1].substring( 0, fieldType[1].length-1 );
				    		var arrItems = fieldType[1].split("|"),
				    				domType = "";
				    		
				    		switch( fieldType[0] ){
				    			case "check":																		//复选
				    			case "2":
					    			fieldType = "check";
				    				break;
				    			case "radio":																		//单选
				    			case "1":
					    			fieldType = "radio";
				    				break;
				    		}
				    		
			    			var checkObj = ulObj.children;										//纠正name值
			    			for(var c=0,len=checkObj.length; c<len; c++){
			    				if( "checkbox" == checkObj[c].type || "radio" == checkObj[c].type ){
			    					checkObj[c].name = fliterId + "_" + fieldCode;
			    					
			    				}
			    			}
			    			
			    			
				    	}
				    	else{
				    		tmpObj = document.getElementById( fliterId + "_" + fieldCode + "_add" );
				    		(function(fieldSetting){
							    	da( tmpObj ).bind("click",function(){							//还原 字段内过滤条件按钮点击事件
											context.addFliter( fieldSetting );
											
											return false;																		//禁止事件冒泡，避免影响fliter高亮效果
							    	});
				    		
				    		})(fieldSetting);
				    	}
				    	
							tmpObj = document.getElementById( fliterId + "_" + fieldCode + "_delete" );
				    	(function(fliterId){
									da( tmpObj ).bind("click",function(){								//还原 删除按钮点击事件
										context.deleteFliter( fliterId );

						    	});
				    	})(fliterId);
				    	
				    	
				    	da( ulObj ).bind("click",function(){										//还原 过滤项点击高亮特效
				    		context.focusFliter( this );
				    	});
				    	this.focusFliter( ulObj );
				    	
				    	this.queryFliters.push({
			    			id: ulObj.id,
			    			field: fieldCode,
			    			type: fieldType,																	//[text, number, date, check, radio]
			    			obj: ulObj
				    	});
				    	
				    	
		    		}
		    	}


	    },

	    load: function( html ){
	    	var itemId = "",
	    			divItems, selectItems, selectObj,
	    			arrTmp, fliterHTML, itemHTML;

	    	arrTmp = html.split("|");
	    	this.queryId = da.decode( arrTmp[0] );							//daQuery对象 Id
	    	fliterHTML = da.decode( arrTmp[1] );								//过滤条件项HTML
	    	itemHTML = da.decode( arrTmp[2] );								//显示项HTML
	    	
	    	this.loadFliter( fliterHTML );
	    	
	    	if ( "chart" == this.querySetting.type )
					this.loadItem( itemHTML );
				
				needautoframeheight();
	    },
	    
	    /**生成SQL
	    */
	    run: function(){
	    	var sql = this.createSql();
	    			fnRun = this.querySetting.run;
	    	
	    	if( fnRun ) fnRun.call( this.queryRunBt, sql, this );
	    	
	    },
	    
	    /**清除所有操作信息
	    */
	    clear: function(){
	    	var sql = this.createSql();
	    			fnClear = this.querySetting.clear;
	    	
	    	if( fnClear ) fnClear.call( this.queryClearBt, sql, this );
	    	
		    this.hide( "fliterPad" );
	    	this.queryFliters = [];
	    	this.queryFliterPad.innerHTML = "";
	    	
//		    this.hide( "itemPad" );
//	    	this.queryItems = [];
//	    	this.queryItemPad.innerHTML = "";
	    	
		    this.show( "fliterPad" );
	    },
	    
	    save: function(){
	    	var sql = this.createSql(),
	    			filterHTML = this.queryFliterPad.innerHTML,
	    			itemHTML = ( "chart" == this.querySetting.type ) ? this.queryItemPad.innerHTML : "",
	    			html,
	    			fnSave = this.querySetting.save;

				html = [ 
					da.code( this.queryId ), 
					da.code( filterHTML ), 
					da.code( itemHTML )
				].join("|");
				
	    	if( fnSave ) fnSave.call( this.querySaveBt, sql, html, this );
				

	  	},
	  	
	  	show: function( pad ){
	  		switch( pad ){
	  			case "fliterPad":
		  			da( this.queryFliterPad ).slideDown(350,function(){ needautoframeheight(); });
		  			this.querySlideBt.children[0].innerHTML = "4";								//箭头向右
		  			this.querySlideBt.children[1].innerHTML = "(点击隐藏)";
	  				break;
	  			case "itemPad":
		  			da( this.queryItemPad ).slideDown(350,function(){ needautoframeheight(); });
		  			this.querySlideBt2.children[0].innerHTML = "4";
		  			this.querySlideBt2.children[1].innerHTML = "(点击隐藏)";
	  				break;
	  		}
	  	},
	  	
	  	hide: function( pad ){
	  		switch( pad ){
	  			case "fliterPad":
		  			da( this.queryFliterPad ).slideUp(350,function(){ needautoframeheight(); });
		  			this.querySlideBt.children[0].innerHTML = "5";								//箭头向上
		  			this.querySlideBt.children[1].innerHTML = "(点击显示)";
	  				break;
	  			case "itemPad":
		  			da( this.queryItemPad ).slideUp(350,function(){ needautoframeheight(); });
		  			this.querySlideBt2.children[0].innerHTML = "5";
		  			this.querySlideBt2.children[1].innerHTML = "(点击显示)";
	  				break;
	  		}
	  	},
	  	
	  	/**显示隐藏过滤条件面板
	  	* @param {boolean} hide 强制隐藏操作
	  	*/
	  	slide: function( pad ){
	  		var padObj = null;
	  		switch( pad ){
	  			case "fliterPad":
	  				padObj = this.queryFliterPad;
	  				break;
	  			case "itemPad":
	  				padObj = this.queryItemPad;
	  				break;
	  		}
	  		
	  		if( "none" == padObj.style.display ){
	  			this.show( pad );
	  		}
	  		else{
	  			this.hide( pad );
	  		}
	  			
	  	}
	};
	
	daQuery.fnStruct.init.prototype = daQuery.fnStruct;						//通过原型实现模块属性的继承
	
	return daQuery;
})();


function getSelected( selectObj ){
	var selectedObj = da(selectObj).children('option:selected');
	return {
		obj: selectedObj.dom[0],
		value: selectedObj.val(),
		text: selectedObj.text()
	};
}

win.daQuery = win.daquery = daQuery;

})(window)