
/**daTable
*数据集类
* @author danny.xu
* @version daTable2.0 2012-4-27
*/

(function( win, undefined ){
var doc = win.document;

var daTable = (function(){
	
	/**daTable类构造函数
	*/
	var daTable = function( setting ){
		var obj = daTable.getTable( setting.id );
		if( obj ){
			obj.setting = da.extend( {}, obj.setting, setting );
			return obj;
		}
		
		return new daTable.fnStruct.init( setting );
	};

	daTable.fnStruct = daTable.prototype = {
		version: "daTable v2.0 \n author: danny.xu \n date: 2012-4-27",
		
		id: "",
		tbObj: null,
		fmtBody: null,
		dataBody: null,
		footBody: null,
		
		pageparent: null,
		daPageObj: null,
		
		setting: {						//所有【一次性有效】的参数，会在load结束后被置空
			id: "",
			url: "",
			data: null,
			//dataType: "json",			//默认获取的数据集格式为json
			
			loading: true,
			page: true,
			
			count: true,				//需要总记录合计值
			pageSize: 10,
			pageIndex: 1,
			
			opt: null,					//【一次性有效】可以为"insert"(插入模式) 或"append"(追加模式)，可以是回调函数。
			optIndex: null,				//【一次性有效】当opt为"insert"模式 或"append"模式时有效
			
			dataset: null,				//【一次性有效】直接可装载的现成数据集
			
			field: null,				//数据格式回调函数
			loaded: null,				//数据装载完毕回调函数
			itemClick: null,			//行点击事件
			itemDblclick: null			//行双击事件
		},
		
		css: {
			table: "daTable",
			itemHover: "itemHover",
			itemSelect: "itemSelect"
		},
		
		orgData: null,					//最近一次装载的原数据
		jsonData: null,					//最近一次装载的json数据
		jsonDataAll: null,				//当前显示对应json数据,默认情况等于jsonData。 "insert" 或"append"操作后有所不同。
		
		curOrder: 0,					//当前编号
		recordCount: 0,					//总共记录数
		pageCount: 0,					//总共页数
		
		fmtHTML: "",					//模板代码片段
		fmtMap: null,					//fmt处理列表
		
		waiting: false,					//锁状态，避免重复异步发生冲突
		waitQueue: null,				//待解锁后处理回调队列
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.id = setting.id;
			if( "string" === typeof setting.id && 0 !== setting.id.indexOf("#") )		//修正id未加"#"
				this.id = "#" + setting.id;
			
			var obj = da( this.id );
			if( 0 >= obj.dom.length ) return;
			this.tbObj = obj.dom[0];
			
			this.revise();							//修正table元素
			if( !this.getFmt() ) return;			//分析模板
			
			this.waitQueue = [];
			
			daTable.pushCache(this);
			
			//this.load();
		},

		/*loading动画状态
		* @param {Boolean} bshow false为加载完毕隐藏loading动画
		*/
		loading: function( bshow ){
			if( !this.setting.loading ) return;
			
			if( false === bshow ){
				if( this.loadingObj )
					this.loadingObj.finished();						//结束loading动画
			}
			else{
				if( "undefined" != typeof daLoading ){
					this.loadingObj = daLoading({					//开始loading动画
						window: win,
						parent: this.tbObj,
						type: "text",
						click: function(){
							this.loadingObj.finished();						//点击结束loading动画
						}
					});
				}
			}
		},
		
		/**修正table元素
		*/
		revise: function(){
			var tbObj = this.tbObj,
				cellspacing = tbObj.getAttribute("cellspacing"),
				cellpadding = tbObj.getAttribute("cellpadding");

			if( !cellspacing ){
				tbObj.setAttribute("cellspacing", 0);
				tbObj.cellSpacing = 0;
			}
			if( !cellpadding ){
				tbObj.setAttribute("cellpadding", 5);
				tbObj.cellPadding = 5;
			}
			
			if( !tbObj.className ){
				da( tbObj ).addClass( this.css.table );
				
			}
			
		},
		
		/**解析模板
		*/
		getFmt: function(){
			var context = this,
				fmtBody = da("tbody[name=body],tbody[name=details]", this.tbObj),
				fmttds = da("td[fmt]", this.tbObj),
				footBody = da("tbody[name=foot]", this.tbObj);
			
			if( 0 < fmtBody.dom.length ){
				this.fmtBody = fmtBody.dom[0];
				this.fmtHTML = this.fmtBody.innerHTML.replace(/[\r\t\n]/g, "");
				
				if(!da(this.fmtBody).is(":hidden")){
					da(this.fmtBody).hide();
				}
				
				this.fmtMap = {};
				
				if( 0 < footBody.dom.length )
					this.footBody = footBody.dom[0];
				
				var name="", fmt="", txt="", key, obj;
				
				fmttds.each(function( idx, obj ){
					obj = da( this );
					name = obj.attr("name");
					txt = obj.text();
					fmt = obj.attr("fmt");
					
					key = name || txt.replace(/\{|\}/g, "");
					if( key ){
						context.fmtMap[key] = fmt;
					}
					// if ((s1 == "sum") || (s1 == "avg") || (s1 == "min") || (s1 == "max") || (s1 == "count")) {
						// s1 = obj1.html().replace("{", "").replace("}", "") ;
					// }
					
					// if ((_isnull(s1, "") != "") && (_isnull(s2, "") != "")) {
						// _tb_fmt_flds.push(s1);
						// _tb_fmt_fmts.push(s2);
					// }
				});
				
				return true;
			}
			return false;
			
		},
		
		/**获取数据
		*/
		getData: function( fn ){
			var setting = this.setting,
				params;
			
			//可以直接通过setting.data传进来
			//params.dataType = setting.dataType;
			var dataType = setting.data.dataType;
			
			if( setting.page ){
				params = {
					pageindex: setting.pageIndex,
					pagesize: setting.pageSize,
					qry: setting.count ? 1 : 0
				};
				params = da.extend( {}, params, setting.data );				//整合用户参数
			}
			
			if(dataType && "json" == dataType){
				da.runDB( setting.url, params,
				function( data, dataType, contentType, xml2json ) {
					fn( data );
				}, 
				function( msg, code, content ) {
					alert( code+"<br/>"+content );
				});
			}
			else if(dataType && "xml" == dataType){
				da.runDB( setting.url, params,
				function( iseof, data, dsname, idx ) {
					if( !dsname ){
						fn( data );
					}
				}, 
				function( msg, code, content  ) {
					alert( code+"<br/>"+content );
				});
				
			}
			/* da.ajax({
				// type: "GET",
				url: setting.url,
				data: params,
				error: function( data, msg, exception ) {
					alert2( msg );
				},
                success: function( data, msg, exception ) {
					fn( data );
				}
			}); */
		},
		
		/**加载数据集
		*/
		load: function(){
			var context = this,
				setting = this.setting,
				orgData = setting.dataset;
			
			this.loading(true);

			var runload = function(){							//真正执行处理函数
				context.waiting = true;							//上锁
				// da.testA();
				var json = (9 === orgData.nodeType ? da.xml2json(orgData) : orgData),
					ds1 = ( json && "undefined" != json.ds1 && da.isArray(json.ds1) ) ? json.ds1 : null,
					ds11 = ( json && "undefined" != json.ds11 && da.isArray(json.ds11) ) ? json.ds11 : null,
					ds = null;
				
				if( null == ds1 ){
					!context.waiting || (context.waiting = false);		//异常解锁
					return;
				}
				
				context.recordCount = 0;						//清空上一次加载记录数缓存
				
				if( ds11 ){										//ds1为统计总记录数，ds11为当前页数据集
					if("undefined" != ds1[0].Column1){			//缓存记录总数
						context.recordCount = ds1[0].Column1;
					}
					else{
						for( var k in ds1[0] )
							context.recordCount = ds1[0][k];
					}
					ds = ds11;
				}
				else{											//ds1为当前页数据集，无ds11
					ds = ds1;
				}
				
				context.orgData = orgData;										//缓存原数据
				if( "append" !== setting.opt && "insert" !== setting.opt ){		//缓存json数据
					context.jsonData = json;
					context.jsonDataAll = ds;

				}
				else{															//追加json数据
					//TODO:
					if( !context.jsonDataAll ){									//第一次装载数据
						context.jsonDataAll = ds;
					}
					else{
						var idx;								//非第一次装载数据，合并位置
						
						if( "append" === setting.opt ){
							idx = (null != setting.optIndex ? setting.optIndex : context.jsonDataAll.length);
						}
						else if( "insert" === setting.opt ){
							idx = (null != setting.optIndex ? setting.optIndex : 0);
						}
						
						context.jsonDataAll = context.jsonDataAll.marge( idx, ds );
					}
				}
				
				context.addItem( context.jsonDataAll );
				
				if( setting.page )
					context.addPage();

				setting.loaded && setting.loaded( setting.pageIndex, context.orgData, context.jsonData, context.jsonDataAll );
				
				setting.dataset = null;							//置空【一次性有效】参数
				setting.opt = null;
				setting.optindex = null;
				
				!context.waiting || (context.waiting = false);	//解锁
				context.loading(false);
			
				if( 0 < context.waitQueue.length ){
					var fn = context.waitQueue.shift();	//执行等待处理
					fn && fn();
				}
				// da.out(da.testB());
			};

			if( !orgData ){
				this.getData(function( data ){
					orgData = data;
				
					if( !context.waiting ){								//未上锁，直接执行
						runload();
					}
					else{
						this.waitQueue.push( runload );					//等待解锁
					}
					
				});
			}
			else{
				if( !context.waiting ){								//未上锁，直接执行
					runload();
				}
				else{
					this.waitQueue.push( runload );					//等待解锁
				}
				
			}
			
		},
		
		/**加入记录数据
		*/
		addItem: function( ds ){
			var context = this,
				setting = this.setting,
				isAppOrIns = ("append" === setting.opt || "insert" === setting.opt),
				dataBody = this.dataBody;
				
			if( !dataBody ){
				dataBody = doc.createElement("tbody");
				dataBody.id = "_" + this.tbObj.id + "_details_auto_";
				dataBody.setAttribute( "name", "details_auto" );
				
				this.dataBody = dataBody;
				da(this.fmtBody).after( this.dataBody );
			}
			
			if(!isAppOrIns ){			//并非追加和插入操作，清空旧数据区
				da(dataBody).empty();
			}
			
			if(!ds || 0 >= ds.length){	//ds1并非有效数据集
				return;
			}
			
			this.curOrder =  setting.pageSize * (setting.pageIndex - 1);
			// if( "append" !== setting.opt && "insert" !== setting.opt ){
				// this.curOrder =  setting.pageSize * (setting.pageIndex - 1);
			// }
			
			var fmtHTML, fldname, fldvalue, fldidx = 0,
				// arrHTML = [],
				record = null;

			// var tmp1 = da(doc.createElement("tbody")),
				// container = da(doc.createElement("tbody"));			//内存对象，不想频繁操作页面元素

			for (var i=0,len=ds.length; i < len; i++ ){					//行循环
				this.curOrder++;										//记录流水号+1
				record = ds[i];
				fmtHTML = this.fmtHTML;
				
				/**********为兼容过去的 ebs函数库用法定义的一些全局变量。**********/
				if( 0 == i )
					$flds = [];
				
				$f = [];
				$v = [];
				for( var name in record ){
					if( 0 == i ){
						window[ "_"+ name ] = $flds.length;
						$flds.push( name );
					}
					$f.push( record[name] );
					$v.push( record[name] );
				}
				/**********为兼容过去的 ebs函数库用法定义的一些全局变量。**********/
				fmtHTML = fmtHTML.replace(/\{[^\}]+\}/g, function( res, idx, target ){
					fldname = res.replace( /\{|\}/g, "" );
					fldname2 = res.replace( /\{|_org|_raw|\}/g, "" );
					fldvalue = "{order}" == res 
						? context.curOrder : (record[fldname2] || "");					//追加流水号
					
					return context.formatData( fldname, fldvalue, record, ds );
				}); 
				
				da(dataBody).append(fmtHTML);
				
				var name ="";
				da( "td", dataBody.lastChild ).each(function(){
					name = da(this).attr("name");
					this.setAttribute("value", da.toHex(da.isNull(record[name], "")) );		//在属性中缓存原数据，扩展备用
				});

				// container.append( tmp1.dom[0].children );
				// arrHTML.push(tmpHTML);
				
			}
			
			// da(dataBody).empty();
			// da(dataBody).append(container.dom[0].children);
			
			this.hoverClick(dataBody.children);
			
			// if( "insert" === setting.opt ){
				// da(dataBody).appendStart(arrHTML.join(""));
			// }
			// else if( "append" === setting.opt ){
				// da(dataBody).append(arrHTML.join(""));
			// }
			// else{
				// da(dataBody).append(arrHTML.join(""));
			// }
			
			if( !isAppOrIns ){
				this.tbObj.style.display = "none";
				if( "undefined" != typeof daFx )
					da(this.tbObj).fadeIn(500);
				else
					this.tbObj.style.display = "";
			}
		},
		
		/**格式化数据
		*/
		formatData: function( fldname, fldvalue, record, ds ){
			var fmt = this.fmtMap[fldname],
				val_format = fldvalue,
				val_tohex = da.toHex(fldvalue);
			
			if(this.setting.field) {
				val_format = this.setting.field( fldname, fldvalue, record, ds );					//字段值，用户格式化处理
			}
			
			val_format = da.fmtData( val_format, fmt );
			
			if( 0 <= fldname.indexOf("_org") ){									//返回原数据
				return fldvalue;
			}
			else if( 0 <= fldname.indexOf("_raw") ){							//返回编码数据
				return val_tohex;
			}
			else{																//返回格式化数据
				return val_format;
			}
			
		},
		
		/**追加分页操作条
		*/
		addPage: function(){
			var context = this,
				setting = this.setting,
				pageparent = this.pageparent;
				
			this.pageCount = Math.ceil( this.recordCount/setting.pageSize );
			
			da( this.id + "_recordcount," + this.id + "_recordcount2").html( this.recordCount );
			da( this.id + "_pagecount," + this.id + "_pagecount2").html( this.pageCount );
			da( this.id + "_pageindex," + this.id + "_pageindex2").html( setting.pageIndex );
			
			if( null == pageparent ){
				var obj = da( this.id + "_pageinfo")
				if( 0 >= obj.dom.length ) return;
				pageparent = obj.dom[0];
			}
			
			if ( setting.count && 1 < this.pageCount && "undefined" !== typeof daPage) {
				pageparent.innerHTML = "";							//清除
				this.daPageObj = daPage({							//创建分页工具条
					parent: pageparent,
					countPage: this.pageCount,
					countList: setting.pageSize,
					current: setting.pageIndex,
					// countStartAndEnd: 2,
					// showgoto: false,
					click: function( type, num ){
						context.setting.pageIndex = num;
						context.setting.count = false;
						context.load();								//重新加载数据
					},
					load: function(){
						//alert("数据加载完毕");
					}
				});
			}
		},
		
		/**高亮特效
		*/
		hoverClick: function( trObj ){
			var setting = this.setting;
			daTable.itemHover( trObj, "pointer", setting.fnclick, setting.fndblclick );
		}
		
	};

	daTable.fnStruct.init.prototype = daTable.prototype;			//模块通过原型实现继承属性

	/**缓存daTable对象
	* params {daTable} obj 数据集daTable对象
	*/
	daTable.pushCache = function( obj ){
		da.data( obj.tbObj, "_daTableObj", obj );
	
	};
	
	/**查找相应id的daTable对象
	* params {string} id 数据集daTable对象id
	*/
	daTable.getTable = function( id ){
		if( "string" === typeof id && 0 !== id.indexOf("#") ) id = "#" + id;				//修正id未加"#"
	
		var tableObj = da(id);
		if( 0 >= tableObj.dom.length ) return null;
		return da.data( tableObj.dom[0], "_daTableObj" );
		
	};
	
	/**高亮特效
	*/
	daTable.itemHover = function( items, cursor, fnclick, fndblclick ){
		da( items ).each(function(i){
			var tmpObj = da(this);
			tmpObj.unbind( "mouseover.daTable" );					//TODO:暂时解决,总觉得这样性能高，可以考虑事件托管
			tmpObj.unbind( "mouseout.daTable" );
			tmpObj.unbind( "mousedown.daTable" );
		
			tmpObj.bind( "mouseover.daTable", function(){
				da( this ).addClass( daTable.fnStruct.css.itemHover );
				
			}).bind( "mouseout.daTable", function(){
				da( this ).removeClass( daTable.fnStruct.css.itemHover );
				
			}).css( "cursor", cursor || "pointer" );
			
			if( fnclick ){
				tmpObj.bind( "mousedown.daTable", function(){
					da( this ).switchClass( daTable.fnStruct.css.itemSelect );
				
					fnclick && fnclick(this);
				
				})
			}
			
			if( fndblclick ){
				tmpObj.bind( "dblclick.daTable", function(){
					fndblclick && fndblclick(this);
				
				})
			}
		});
	};
	
	
	return daTable;
})();


win.daTable = daTable;

})(window);




/*********为兼容过去的 ebs函数库用法定义的一些全局函数。*********/
function mytablebyds( data1, tbfldfunc, tbname, pagesize, filter1, append2, tbsndkey2 ){
	var obj = daTable.getTable( tbname );

	if( obj ){
		obj.setting.dataset = data1;
		obj.setting.field = tbfldfunc;
		obj.setting.pagesize = pagesize;
		obj.setting.opt = ("0" == append2 ? "insert" : null);
	}
	else{
		obj = daTable({
			id: tbname,
			dataset: data1,
			field: tbfldfunc,
			pagesize: pagesize,
			opt: ("0" == append2 ? "append" : null)
		});
	}
	
	obj.load();
}

var menu_clickgray = daTable.itemHover,
	link_click = daTable.itemHover;




