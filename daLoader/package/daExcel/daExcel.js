/**daExcel
*仿excel编辑操作类
* @author danny.xu
* @version daExcel_1.0 2011-8-22 21:10:01
*/

(function( win, undefined ){
var doc = win.document;

var daExcel = (function(){
	
	/**daExcel类构造函数
	*/
	var daExcel = function( setting ){
		return new daExcel.fnStruct.init( setting );
	};

	daExcel.fnStruct = daExcel.prototype = {
		version: "daExcel v1.0 \n author: danny.xu \n date: 2011-8-22 21:10:20",
		
		id: "",
		tableObj: null,
		tdMap: null,
		
		curEditObj: null,
		
		setting: {
			id: "",
			editTag: "edit",
			
			filter: null,
			before: null,
			edit: null,
			after: null
			
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( true, {}, this.setting, setting );
			
			this.id = setting.id;
			if( "string" === typeof setting.id && 0 !== setting.id.indexOf("#") )		//修正id未加"#"
				this.id = "#" + setting.id;

			var tableObj = da( this.id );
			if( 0 >= tableObj.dom.length ) return;
			
			this.tableObj = tableObj.dom[0];
//			this.tableObj.style.tableLayout = "fixed";
//			this.tableObj.cellSpacing = 0;
//			this.tableObj.cellPadding = 0;
			
			this.tdMap = [];

//			this.create();
			this.scanRows();
			
		},
		
		create: function(){
			//
			
		},
		
		scanRows: function(){
			var tableObj = this.tableObj,
				tbodyObj, trObj;
					
			tbodyObj = tableObj.children;
			for( var i=0,lenBody=tbodyObj.length; i<lenBody; i++ ){										//循环tbody, thead, tfoot
				if( da.isFunction( this.setting.filter ) ){												//自定义筛选
					if( false === this.setting.filter.call( tbodyObj[i], tbodyObj[i].tagName ) ){
						da(tbodyObj[i]).addClass( daExcel.css.disable );								//添加不可编辑样式
						continue;
					}
				}
				if( da( tbodyObj[i] ).is(":hidden") ) continue;											//隐藏的tbody不允许编辑	
				trObj = tbodyObj[i].children;
				
				for( var n=0,lenRow=trObj.length; n<lenRow; n++ ){										//循环tr
					if( da.isFunction( this.setting.filter ) ){											//自定义筛选																								//不允许编辑用户筛选
						if( false === this.setting.filter.call( trObj[n], trObj[n].tagName ) ){
							da(trObj[n]).addClass( daExcel.css.disable );								//添加不可编辑样式
							continue;
						}
					}
					
					if( da( trObj[n] ).is(":hidden") ) continue;										//隐藏的行不允许编辑	
					
					this.scanCells( trObj[n] );
					
				}
				
			}
			
		},
		
		scanCells: function( trObj ){
			var context = this,
					tdList = trObj.children,
					td, tds = [];
					
			for( var i=0,len=tdList.length; i<len; i++ ){
				td = tdList[i];

				if( da.isFunction( this.setting.filter ) ){												//不允许编辑用户筛选
					if( false === this.setting.filter.call( td, td.tagName ) ){
						da(td).addClass( daExcel.css.disable );											//添加不可编辑样式
						continue;
					}
					
				}
				
				if( da( td ).is(":hidden") ) continue;													//隐藏的列不允许编辑
				if( null === td.getAttribute( this.setting.editTag ) ){									//拥有setting.editTag指定标识符号的，允许编辑
					da(td).addClass( daExcel.css.disable );												//添加不可编辑样式
					continue;
				}
				
				da( td ).bind( "click.daExel", function( evt ){
					daExcel.focusCell( context, this );
					
				});
				
				da.data( td, "daExcelCellIdx", { row: this.tdMap.length, col: tds.length } );			//缓冲td的行列位置
				
				tds.push( td );
			}
			
			this.tdMap.push( tds );
		},
		
		nextCell: function( keycode, evt ){
			var curEditObj = this.curEditObj,
				maxRowIdx, maxColIdx, 
				rowIdx, colIdx,
				cellIdx;

			cellIdx = da.data( curEditObj, "daExcelCellIdx" );					//获取当前单元格行列索引位置
			rowIdx = cellIdx.row;
			colIdx = cellIdx.col;
			maxRowIdx = this.tdMap.length - 1;									//最大行索引
			maxColIdx = this.tdMap[ cellIdx.row ].length - 1;					//最大列索引( 当前行 )
			
			var nextObj;
			while( !nextObj ){							//行列间跳跃
				switch( keycode ){
					case 37:{ 							//左
						if( 0 >= colIdx ) return curEditObj;
						colIdx--;
						break;
					}	
					case 38:{ 							//上
						if( 0 >= rowIdx ) return curEditObj;
						rowIdx--;
						break;
					}
					case 39:  							//右
					case 9:{  							//TAB
						if( maxColIdx <= colIdx ) return curEditObj;
						colIdx++;
						break;
					}
					case 40: 							//下
					case 13:{ 							//Enter
						if( maxRowIdx <= rowIdx ) return curEditObj;
						rowIdx++;
						break;
					}
				}
				
				nextObj = this.tdMap[ rowIdx ][ colIdx ];
			}
			
			return nextObj;
		}
		
	};

	
	daExcel.css = {							//样式
		focus: "daExcelFocus",				//焦点 样式
		edit: "daExcelEdit",				//焦点编辑中 样式
		input: "daExcelInput",				//编辑输入框 默认样式
		
		disable: "daExcelDisable",			//不允许编辑 样式
		update: "daExcelUpdate"				//数据上传中 样式
	};
	
	daExcel.isFocused = false;
	daExcel.isEditing = false;
	daExcel.isInput = false;
	
	daExcel.curObj = null;
	daExcel.focusObj = null;
	daExcel.inputObj = null;

	//表格格获取编辑焦点
	daExcel.focusTable = function( Obj ){
		if( daExcel.curObj && daExcel.curObj.id === Obj.id )
			return;
		
		daExcel.curObj = Obj;
		
	};
	
	//表格格失去编辑焦点
	daExcel.blurTable = function(){
		if( !daExcel.isFocused ){																	//焦点不在任何单元格上,没有任何表格处于编辑状态
			daExcel.focusObj.dom[0].style.display = "none";
			daExcel.curObj = null;
		}
		
		daExcel.isFocused = false;																	//还原编辑状态标签
		
	};

	//单元格获取编辑焦点
	daExcel.focusCell = function( daExcelObj, tdObj ){
		daExcel.focusTable( daExcelObj );
		daExcelObj.curEditObj = tdObj;
		
		if( da.isFunction( daExcelObj.setting.before ) ){											//进入编辑状态前回调
			daExcelObj.setting.before.call( daExcelObj, tdObj, 
			function(){
				
			});
		}
		
		var da_tdObj = da( tdObj ),
			pos = da_tdObj.offset();
		
		pos.top = pos.top - 1;																		//编辑框 border-width === 2px 所以需要各偏移1px
		pos.left = pos.left - 1;
		
		daExcel.focusObj.dom[0].style.display = "block";

		if( "undefined" !== typeof daFx ){
			// daExcel.focusObj.css( "opacity", 0.5 );
			daExcel.focusObj.stop().act({
				// opacity: 1,
				top: pos.top,
				left: pos.left,
				width: da.browser.ie ? da_tdObj.width() : da_tdObj.width(),
				height: da.browser.ie ? da_tdObj.height() : da_tdObj.height()
			},{
				duration: 100,
				easing: "easeOutQuad"
			});
			
		}
		else{
			daExcel.focusObj.offset( pos );
			daExcel.focusObj.width( da.browser.ie ? da_tdObj.width() +2 : da_tdObj.width() );
			daExcel.focusObj.height( da.browser.ie ? da_tdObj.height()+2 : da_tdObj.height() );
		}
		
		
		daExcel.isFocused = true;																	//焦点在单元格上,进入编辑状态
	};
	
	//单元格进入编辑状态
	daExcel.editCell = function( daExcelObj, tdObj ){
		var editObj = daExcel.inputObj.dom[0];
		
		if( da.isFunction( daExcelObj.setting.edit ) ){												//进入编辑状态回调
			daExcelObj.setting.edit.call( daExcelObj, editObj, tdObj, 
			function(){
				
			});
		}
		
		daExcel.focusObj.addClass(daExcel.css.edit);							//编辑状态样式
		
		daExcel.inputObj.width( da( tdObj ).width() );
		daExcel.inputObj.height( da( tdObj ).height() );

		editObj.value = da.isNull(da.toStr(tdObj.getAttribute("value")), "");
		editObj.style.display = "";
		
		//tdObj.innerHTML = "";
		
		editObj.select();
		
		
		daExcel.isEditing = true;
	};
	
	//单元格进入编辑状态
	daExcel.finishedCell = function( daExcelObj, tdObj ){
		var editObj = daExcel.inputObj.dom[0];
		
		tdObj.innerHTML = da.isNull( da.fmtData( editObj.value.trim(), tdObj.getAttribute("fmt") ), "&nbsp;");
		tdObj.setAttribute( "value", da.toHex(editObj.value) );
		
		if( da.isFunction( daExcelObj.setting.after ) ){										//完成编辑回调
			var oldColor = da( tdObj ).css("color");
			da( tdObj ).addClass(daExcel.css.update);						//数据提交状态样式
			
			daExcelObj.setting.after.call( daExcelObj, editObj, tdObj, tdObj.parentNode );
		}
		
		daExcel.focusObj.removeClass(daExcel.css.edit);							//移除编辑状态样式
		
		editObj.value = "";
		editObj.style.display = "none";

		daExcel.isInput = false;
		daExcel.isEditing = false;
		editObj.blur();
		
		
		daExcel.blurTable();
	};
	
	/**行数据更新托管函数(必须要求相关TD必须有name属性)
	*/
	daExcel.update = function( url, params, parent ){
		var data = {}, 
			tdObj, tdname, tdvalue;
		
		da("td[name]", parent ).each(function (){
			tdObj = da(this);

			if( tdObj.hasClass( daExcel.css.update ) ){						//待提交 标志
				tdname = tdObj.attr("name");
				tdvalue = da.isNull( tdObj.attr("value"), "" );
				
				data[ tdname ] = tdvalue;
			}
		});
		
		params = da.extend( {}, data, params );

		da.getData( url, params, 
		function( data ){
			da("td[name]", parent ).removeClass(daExcel.css.update);		//移除数据提交状态样式
		},
		function( msg, code, content ){
			//TODO:
		});
	};
	
	
	daExcel.fnStruct.init.prototype = daExcel.prototype;					//模块通过原型实现继承属性

	return daExcel;
	
})();

win.daExcel = daExcel;


da( document ).bind( "click.daExel", function( evt ){
		daExcel.blurTable();
	
}).bind( "keydown.daExel", function( evt ){
	if( !daExcel.curObj ) return;
	
	var curObj = daExcel.curObj,
		nextTd = null;
	
	switch( evt.keyCode ){
		case 40: 							//下
		case 37: 							//左
		case 38: 							//上
		case 39:  							//右
		case 13: 							//Enter
		case 9: 							//TAB
			nextTd = curObj.nextCell( evt.keyCode, evt );
			if( !daExcel.isEditing ) evt.noDefault();		//非编辑状态以上操作需要阻止防止滚动条滚动(浏览器默认事件)
			break;
		default:
			//daExcel.curObj.curEditObj.click();
			break;
	}
	
	if( daExcel.isInput ){												//光标处于input内进行输入编辑					
		if( 13 === evt.keyCode || 9 === evt.keyCode ){					//Enter结束编辑
			daExcel.finishedCell( curObj, curObj.curEditObj );
			
			if( nextTd )												//移动焦点位置
				daExcel.focusCell( curObj, nextTd );
		}
		return;
	}
	
	if( null !== nextTd && daExcel.isEditing ){							//从编辑状态 进入焦点状态 并移动焦点位置
		daExcel.finishedCell( curObj, curObj.curEditObj );
	}
	
	if( nextTd ){																												//移动焦点位置
		daExcel.focusCell( curObj, nextTd );
	}
	
	if( null === nextTd && !daExcel.isEditing ){						//从焦点状态进入编辑状态
		daExcel.editCell( curObj, curObj.curEditObj );
	}
	
});

/**公共空间，页面加载完毕后再创建
*/
da(function(){
	var focusObj = doc.createElement( "DIV" ),
		editObj = doc.createElement( "INPUT" );
	
	focusObj.id = "daExcelFocus";
	focusObj.className = daExcel.css.focus;
	focusObj.style.cssText = "display:none; position:absolute; left:0px; top:0px;";
	
	da( focusObj ).bind( "click.daExel", function( evt ){
		daExcel.editCell( daExcel.curObj, daExcel.curObj.curEditObj );
		evt.noParent();
		
	});
	
	doc.body.insertBefore( focusObj );
	daExcel.focusObj = da( focusObj );								//缓存焦点框对象
	
	
	//
	editObj.id = "daExcelInput";
	editObj.className = daExcel.css.input;
	editObj.style.cssText = "display:none;";
	da( editObj ).bind( "click.daExel", function( evt ){
		daExcel.isInput = true;
		evt.noParent();
		
	}).bind( "blur.daExel", function(evt){
		if( daExcel.isEditing )
			daExcel.finishedCell( daExcel.curObj, daExcel.curObj.curEditObj );
		
	}).bind( "keydown.daExel", function(evt){
		daExcel.isEditing = true;
		
	});
	focusObj.insertBefore( editObj );
	daExcel.inputObj = da( editObj );								//缓存编辑框对象
	
});

})(window);