/**daTreeView
*树视图类
* @author danny.xu
* @version daTreeView_1.0 2011/7/16 16:09:57
*/

(function( win, undefined ){
var doc = win.document;

var daTreeView = (function(){
	
	/**daTreeView类构造函数
	*/
	var daTreeView = function( setting ){
		return new daTreeView.fnStruct.init( setting );
	};

	daTreeView.fnStruct = daTreeView.prototype = {
		version: "daTreeView v1.0 \n author: danny.xu \n date: 2011/7/16 16:10:04",
		
		id: 0,
		obj: null,
		parent: null,
		core: null,
		
		setting: {
			parent: "",
			id: "",
			name: "",
			list: null,
			data: null,
			isForce: false,
			isLocked: true,
			
			css: {
				tree: "daTree",
				node: "daNode",
				hover: "daNodeHover",
				select: "daNodeSelect",
				sub: "daSubContainer",
				
				lines: "daLines",
				noline: "noline",
				line: "line",
				join: "join",
				joinlast: "joinlast",
				minus: "minus",
				plus: "plus",
				nolines_minus: "nolines_minus",
				nolines_plus: "nolines_plus",
				pluslast: "pluslast",
				minuslast: "minuslast",
				
				icon: "daIcon",
				root: "root",
				newfile: "newFile", 
				folder: "folder",
				openfolder: "openFolder",
				
				unchecked: "unChecked",
				haschecked: "hasChecked",
				checked: "checked",
				
				text: "daText",
				textedit: "daTextEdit",
				
				tools: "daTools",
				locked: "locked",
				unlocked: "unlocked",
				edit: "edit", 
				add: "add", 
				del: "delete"
			},
			
			mouseover: null,
			mouseout: null,
			click: null,
			checkbox: null,
			edit: null,
			append: null,
			remove: null
			
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.parent = da( setting.parent );
			if( 0 >= this.parent.length ) {alert("daTreeView温馨提示: 需要指定父亲DOM对象"); return;}
			this.parent = this.parent.dom[0];

			while( doc.getElementById( "daTreeView" + this.id ) ){ this.id++ };
			this.id = "daTreeView" + this.id;
			
			this.core = daTreeCore({		//生成一颗内存树
				id: setting.id,
				name: setting.name,
				list: setting.list,
				data: setting.data
			});

			this.obj = doc.createElement( "div" );
			this.obj.id = this.id;
			this.obj.className = this.setting.css.tree;
			
			this.parent.insertBefore( this.obj, null );
			
			this.bind();
		},
		
		add: function( setting ){
			if( !this.core ) return;
			
			this.core.add( setting );
		},
		
		/**创建连接 对象集
		*/
		createLine: function( node ){
			var nodeId = node.setting.id,
				len = ( node.pnode && node.pnode.sub && node.pnode.sub.length ) || 0,
				index = node.index,
				pObj = node.pnode,
				linesObj, bendCSS,
				ulObj;
			
			linesObj = doc.createElement( "div" );
			linesObj.id = nodeId + "_lines";
			linesObj.className = this.setting.css.lines;
			
			while( pObj ){							//与祖父节点的连接线对象集
				if( !pObj.pnode ) break;
				
				var lenParent = ( pObj.pnode && pObj.pnode.sub && pObj.pnode.sub.length ) || 0,
					idxParent = pObj.index;
				
				ulObj = doc.createElement( "ul" );
				ulObj.id = nodeId + "_line" + pObj.level;
				if( lenParent-1 ===  idxParent )				//某级祖父节点是同级最后一个节点
					ulObj.className = this.setting.css.noline;
				else
					ulObj.className = this.setting.css.line
				linesObj.insertBefore( ulObj, linesObj.firstChild );
				
				pObj = pObj.pnode;
			}

			if( len-1 ===  index ){					//最后一个子节点
				if( node.sub && 0 < node.sub.length )
					bendCSS = this.setting.css.pluslast;
				else
					bendCSS = this.setting.css.joinlast;
					
			}
			else{									//非最后一个子节点
				if( node.sub && 0 < node.sub.length )
					bendCSS = this.setting.css.plus;
				else
					bendCSS = this.setting.css.join;
			}
			
			if( 0 < node.level ){					//非根节点
				ulObj = doc.createElement( "ul" );
				ulObj.id = nodeId + "_bend";
				ulObj.className = bendCSS;
				linesObj.insertBefore( ulObj, null );
				
			}
//			else if( 0 === node.level ){
//				ulObj = doc.createElement( "ul" );
//				ulObj.id = nodeId + "_bend";
//				ulObj.className = this.setting.css.nolines_plus;
//				linesObj.insertBefore( ulObj, null );
//				
//			}
			
			return linesObj;
		},
		
		createNode: function( node ){
			var context = this,
				nodeId = node.setting.id,
				nodeObj = doc.createElement( "div" );
			
			if( document.getElementById( nodeId + "_node" ) ) return; 	//已经创建过，直接退出
			
			nodeObj.id = nodeId + "_node";
			nodeObj.className = this.setting.css.node;
			
			var iconObj = doc.createElement( "div" ),
				textObj = doc.createElement( "div" ),
				toolsObj = doc.createElement( "div" ),
				ulObj, pSubObj;
		
			//关节对象
			nodeObj.insertBefore( this.createLine( node ), null );
			
			//图标对象
			iconObj.id = nodeId + "_icon";
			iconObj.className = this.setting.css.icon;
			
			if( this.setting.checkbox ){
				var isChecked = false;
				if( node.pnode ){
					var pNodeCheckObj = doc.getElementById( node.pnode.setting.id +"_check" );
					isChecked = this.setting.css.checked === pNodeCheckObj.className;
				}
				
				ulObj = doc.createElement( "ul" );			//复选框
				ulObj.id = nodeId + "_check";
				ulObj.className = isChecked ? 
					this.setting.css.checked : 
					this.setting.css.unchecked;
				
				iconObj.insertBefore( ulObj, null );
			}
			
			ulObj = doc.createElement( "ul" );				//文件夹
			ulObj.id = nodeId + "_folder";
			ulObj.className = ( 0 < node.level ) ? 
				( node.sub && 0 < node.sub.length ? 
					this.setting.css.folder : 
					this.setting.css.newfile ) : 
				this.setting.css.root;
			
			iconObj.insertBefore( ulObj, null );
			nodeObj.insertBefore( iconObj, null );
			
			//节点名称对象
			textObj.id = nodeId + "_text";
			textObj.className = this.setting.css.text;
			textObj.innerHTML = node.setting.name;
			nodeObj.insertBefore( textObj, null );
			
			//功能按钮对象
			toolsObj.id = nodeId + "_tools";
			toolsObj.className = this.setting.css.tools;
			
			if ( !this.setting.isLocked ){
				ulObj = doc.createElement( "ul" );				//编辑
				ulObj.id = nodeId + "_t_edit";
				ulObj.title = "编辑";
				ulObj.className = this.setting.css.edit;
				// (function( node ){
					// da( ulObj ).bind("click", function(){
						// context.editNode( node, nodeObj, textObj );
						// toolsObj.style.display = "none";
					// });
				// })( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );				//添加
				ulObj.id = nodeId + "_t_append";
				ulObj.title = "添加";
				ulObj.className = this.setting.css.add;
				// (function( node ){
					// da( ulObj ).bind("click", function(){
						TODO:
					// });
				// })( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );				//移除
				ulObj.id = nodeId + "_t_remove";
				ulObj.title = "删除";
				ulObj.className = this.setting.css.del;
				// (function( node ){
					// da( ulObj ).bind("click", function(){
						// context.removeNode( node, nodeObj, textObj );
					// });
				// })( node );
				toolsObj.insertBefore( ulObj, null );
			}
				
			nodeObj.insertBefore( toolsObj, null );
			//this.bindNode( node, nodeObj, textObj, toolsObj );
			
			//放入父亲的子节点容器
			if( 0 == node.level ){			//根节点
				pSubObj = this.obj;
			}
			else{							//非根节点
				var pNode = node.pnode,
					pNodeId = pNode.setting.id;

				pSubObj = doc.getElementById( pNodeId + "_sub" );
						
				if( !pSubObj ){
					pSubObj = doc.createElement( "div" );
					pSubObj.id = pNodeId + "_sub";
					pSubObj.className = this.setting.css.sub;
					
					var pObj = doc.getElementById( pNodeId + "_node" ),
						ppObj = pObj.parentNode;
					
					ppObj.insertBefore( pSubObj, pObj.nextSibling );
					
				}
				
			}
			
			pSubObj.insertBefore( nodeObj, null );
			
			if( 0 < node.level && 0 == node.index ){				//非根节点，并且是父亲的第一个子节点
				node = node.pnode;
				var pBendObj = doc.getElementById( node.setting.id + "_bend" );

				if( pBendObj ){										//改变拐点样式
					var len = ( node.pnode && node.pnode.sub && node.pnode.sub.length ) || 0,
						index = node.index;
							
					if( len-1 === index )							//最后一个子节点
						pBendObj.className = this.setting.css.minuslast;
					else																														//非最后一个子节点
						pBendObj.className = this.setting.css.minus;
					
				}
				
				if( 0 < node.level )
					doc.getElementById( node.setting.id + "_folder" ).className = this.setting.css.openfolder;
			}
			

		},
		
		/**绑定事件
		*/
		bind: function(){
			this.bindLine();
			this.bindNode();
			
			if( this.setting.checkbox )
				this.bindCheck();
		},
		
		/**拐点bend绑定事件
		*/
		bindLine: function(){
			var css = this.setting.css;
				context = this;

			da( this.obj ).delegate( "[id$='_bend']", "click", function(){
				var	nodeId = this.id.replace("_bend",""),
					//linesObj = doc.getElementById( nodeId + "_lines" ),	//节点连线对象集容器元素。
					iconObj = doc.getElementById( nodeId + "_folder" ),		//默认图标元素
					subObj = doc.getElementById( nodeId + "_sub" ),			//子节点容器元素
					node = context.core.get( nodeId );						//找到daNodeCore节点对象。

				switch( this.className ){
					case css.plus:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = css.minus;
						iconObj.className = css.openfolder;
						break;
						
					case css.minus:
						if( subObj ){
							subObj.style.display = "none";
							this.className = css.plus;
							iconObj.className = css.folder;
						}
						break;
						
					case css.pluslast:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = css.minuslast;
						iconObj.className = css.openfolder;
						break;
						
					case css.minuslast:
						if( subObj ){
							subObj.style.display = "none";
							this.className = css.pluslast;
							iconObj.className = css.folder;
						}
						break;
					
				}
				
			});
		},
		
		/**复选框绑定事件
		*/
		bindCheck:function(){
			var context = this,
				css = context.setting.css,
				fnCheck = context.setting.checkbox;

			da( this.obj ).delegate( "[id$='_check']", "click", function(){			//节点点击事件。
				var nodeId = this.id.replace("_check",""),
					nodeObj = this.parentNode,								//节点元素
					subObj = doc.getElementById( nodeId + "_sub" ),			//子节点容器元素
					node = context.core.get( nodeId );						//找到daNodeCore节点对象。
				
				if( css.unchecked === this.className ){
					this.className = css.checked;
					
					if( subObj ){
						//da.out( da( "ul."+css.unchecked+",ul."+css.haschecked+",ul."+css.checked, subObj ).dom.length );
						da( "ul."+css.unchecked+",ul."+css.haschecked+",ul."+css.checked, subObj ).removeClass().addClass( css.checked );
					}
					
					var pNodeCheck, 
						pNodeObj,
						pNodeSubObj,
						pnode = node.pnode;
					while( pnode ){
						// da.out( pnode.setting.id );
						pNodeSubObj = doc.getElementById( pnode.setting.id + "_sub" );
						pNodeCheck = doc.getElementById( pnode.setting.id + "_check" );
						
						//da.out( da( "ul."+css.unchecked+",ul."+css.haschecked, pNodeSubObj ).dom.length )
						if( 0 < da( "ul."+css.unchecked+",ul."+css.haschecked, pNodeSubObj ).dom.length ){
							pNodeCheck.className = css.haschecked;
						}
						else{
							pNodeCheck.className = css.checked;
						}
						
						pnode = pnode.pnode;
					}
					
				}
				else if( css.checked === this.className || css.haschecked === this.className ){
					this.className = context.setting.css.unchecked;
					
					if( subObj ){
						//da.out( da( "ul."+css.unchecked+",ul."+css.haschecked+",ul."+css.checked, subObj ).dom.length );
						da( "ul."+css.unchecked+",ul."+css.haschecked+",ul."+css.checked, subObj ).removeClass().addClass( css.unchecked );
					}

					var pNodeCheck, 
						pNodeObj,
						pNodeSubObj,
						pnode = node.pnode;
					while( pnode ){
						// da.out( pnode.setting.id );
						pNodeSubObj = doc.getElementById( pnode.setting.id + "_sub" );
						pNodeCheck = doc.getElementById( pnode.setting.id + "_check" );
						
						//da.out( da( "ul."+css.checked+",ul."+css.haschecked, pNodeSubObj ).dom.length )
						if( 0 < da( "ul."+css.checked+",ul."+css.haschecked, pNodeSubObj ).dom.length ){
							pNodeCheck.className = css.haschecked;
						}
						else{
							pNodeCheck.className = css.unchecked;
						}
						
						pnode = pnode.pnode;
					}
					
				}
				
				if( da.isFunction( fnCheck ) )
					fnCheck.call( context, node, nodeObj, this );
				
			})
		},
		
		/**节点Node绑定事件
		*/
		bindNode: function(){
			var context = this,
				fnOver = context.setting.mouseover,
				fnOut = context.setting.mouseout,
				fnClick = context.setting.click,
				fnAppend = context.setting.append,
				fnRemove = context.setting.remove,
				fnEdit = context.setting.edit;

			var	nodeId, toolsObj, textObj, node;
					
			var getObjs = function ( nodeObj ){
					nodeId = nodeObj.id.replace("_node",""),
					toolsObj = doc.getElementById( nodeId + "_tools" ),		//节点编辑工具容器元素
					textObj = doc.getElementById( nodeId + "_text" ),		//节点名称对象元素
					node = context.core.get( nodeId );						//找到daNodeCore节点对象。
				};
			
			da( this.obj ).delegate( "[id$='_node']", "mouseover", function(){	//节点鼠标移上高亮。
				getObjs( this );			//获取相关元素、对象
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.hover;
				}
				
				toolsObj.style.display = "block";
				
				if( fnOver ){
					fnOver.call( context, node, this, textObj );
				}
				
			}).delegate( "[id$='_node']", "mouseout", function(){		//节点鼠标移出取消高亮。
				getObjs( this );				//获取相关元素、对象
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.node;
				}
				
				toolsObj.style.display = "none";
				
				if( fnOut ){
					fnOut.call( context, node, this, textObj );
				}
				
			}).delegate( "[id$='_text']", "click", function(){			//节点点击事件。
				var nodeObj = this.parentNode;
				getObjs( nodeObj );				//获取相关元素、对象

				if( !nodeObj.getAttribute( "daNodeSelect" ) ){
					nodeObj.className = context.setting.css.select;
					nodeObj.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && nodeObj.id !== context.selectObj.id ){
						context.selectObj.className = context.setting.css.node;
						context.selectObj.removeAttribute( "daNodeSelect" );
					}

					context.selectObj = nodeObj;
				}
				
				if( fnClick ){
					fnClick.call( context, node, nodeObj, textObj );
				}
				
			}).delegate( "[id$='_t_append']", "click", function(){			//节点添加事件。
				var nodeObj = this.parentNode.parentNode;
				getObjs( nodeObj );				//获取相关元素、对象

				if( fnAppend ){
					fnAppend.call( context, node, nodeObj, textObj, function(){
						context.appednNode( node, nodeObj );
					});
				}
				
			}).delegate( "[id$='_t_remove']", "click", function(){			//节点删除事件。
				var nodeObj = this.parentNode.parentNode;
				getObjs( nodeObj );				//获取相关元素、对象

				if( node.sub && 0 < node.sub.length ){		//有子节点
					if( "undefined" == typeof daWin ){
						if( !confirm("还有下级，确定要删除("+ node.setting.name +")吗?") ) {
							return;
						}
					}
					else{
						confirm("还有下级，确定要删除("+ node.setting.name +")吗?",
						function(){
							if( fnRemove ){
								fnRemove.call( context, node, nodeObj, textObj, function(){
									context.removeNode( node, nodeObj );
								});
							}
						});
					}
				}
				else{
					if( "undefined" == typeof daWin ){
						if( !confirm("确定要删除 ("+ node.setting.name +") 吗?") ) {
							return;
						}
					}
					else{
						confirm("确定要删除 ("+ node.setting.name +") 吗?",
						function(){
							if( fnRemove ){
								fnRemove.call( context, node, nodeObj, textObj, function(){
									context.removeNode( node, nodeObj );
								});
							}
						});
					}
				}
				
				
			}).delegate( "[id$='_t_edit']", "click", function(){			//节点编辑事件。
				var nodeObj = this.parentNode.parentNode;
				getObjs( nodeObj );				//获取相关元素、对象

				if( fnEdit ){
					context.editNode( node, nodeObj, textObj, 
					function(node, nodeObj, textObj, editObj){
						fnEdit.call( context, node, nodeObj, textObj, editObj, function(){
							textObj.innerHTML = editObj.value;
							node.setting.name = editObj.value;
						});
						//this.parentNode.style.display = "none";
					});
				}
				
			})
			// .delegate( "[id$='_node']", "mouseup", function(evt){
				// if ( 2 !== evt.button ) return;
				
				// getObjs( this );
				
				// daTip.hide( "daNodePopMenu" );
				
				// if( !this.getAttribute( "daNodeSelect" ) ){
					// this.className = context.setting.css.select;
					// this.setAttribute( "daNodeSelect", "true" );
					
					// if( context.selectObj && this.id !== context.selectObj.id ){
						// context.selectObj.className = context.setting.css.node;
						// context.selectObj.removeAttribute( "daNodeSelect" );
					// }

					// context.selectObj = this;
				// }
				
				// if( fnClick ){
					// fnClick.call( this, node, nodeObj );
				// }
				
			// });
			
		},
		
		/**获得复选框选中的节点
		*/
		getChecked: function(){
			var context = this,
				arrNode = [];
				
			da("ul.checked", this.obj).each(function(){
				arrNode.push( context.core.get( this.id.replace("_check","") ) );
			});
			
			return arrNode;
		},
		
		/**获得选中的节点
		*/
		getSelected: function(){
			if( !this.selectObj ) return;
			
			var nodeObj = this.selectObj,
				nodeId = nodeObj.id.replace("_node","");
				
			return {
				node: this.core.get(nodeId),
				nodeObj: nodeObj,
				textObj: document.getElementById( nodeId +"_text" )
			}
		},
		
		/**展开整棵树
		*/
		expandAll: function( fn ){
			var context = this;
			
			this.core.load( this.setting.isForece );
			
			setTimeout(function(){
				context.core.run(function( isEnd, isLevelEnd ){		//遍历树节点。
					if( !isEnd ){
						context.createNode( this );
					}
					else if( isEnd && da.isFunction( fn ) ){		//展开操作完毕，回调。
						fn.call( context );
					}
				});
			
			},1);
			
		},
		
		/**展开最大级别
		*/
		expandLevel: function( maxLevel, fn ){
			maxLevel = maxLevel || 0;
			
			var context = this;
			
			this.core.load( this.setting.isForece );

			setTimeout(function(){
				context.core.run(function( isEnd, isLevelEnd ){			//遍历树节点。
					if( !isEnd && !isLevelEnd && maxLevel >= this.level ){
						//da.out( isEnd +"-"+ isLevelEnd +"-"+ this.level );
						context.createNode( this );						//绘制节点。
					}
					else if( isLevelEnd && maxLevel===this.level){		//展开到需要最大级别,并且是最后一个，停止遍历。
						//da.out("isLevelEnd")
						return false;
					}
					else if( isEnd && da.isFunction( fn ) ){			//展开操作完毕，回调。
						//da.out("isEnd")
						fn.call( context );
					}
				});
			
			},1);
			
		},
		
		/**展开节点
		*/
		expandNode: function( node, fn ){
			var nodeId = ( "string" === typeof node ) ? node : node.setting.id;
				context = this;

			this.core.load( this.setting.isForece );
			
			setTimeout(function(){
				context.core.run( node, function( isEnd, isLevelEnd ){			//遍历树节点。
					if( ( node.level+1 ) === this.level ){		//子节点级别。
						if( !isLevelEnd ){
							context.createNode( this );			//绘制节点。
						}
						else if( isLevelEnd ){					//子节点展开操作完毕，回调，停止遍历。
							if( da.isFunction( fn ) ){
								fn.call( context );
							}
							return false;
						}
					}
				});
			
			},1);
			
		},
		
		/**添加子节点
		*/
		appednNode: function( node, nodeObj, textObj ){
			if( node.sub ){
				var i = 1,
					prevNode = node.sub[node.sub.length-1];		//找到前一个(最后)有效兄弟节点
				
				while( !prevNode ){
					i++;
					prevNode = node.sub[node.sub.length-i];
				}
				
				var prevBendObj = doc.getElementById( prevNode.setting.id + "_bend" );
				switch( prevBendObj.className ){				//改变前一个(最后)有效兄弟节点拐点样式
					case this.setting.css.joinlast:
						bendCSS = this.setting.css.join;
						break;
					case this.setting.css.pluslast:
						bendCSS = this.setting.css.plus;
						break;
					case this.setting.css.minuslast:
						bendCSS = this.setting.css.minus;
						break;
				}
				prevBendObj.className = bendCSS;
			}
			
			context.expandNode(node);
		},
		
		/**编辑节点
		*/
		editNode: function( node, nodeObj, textObj, fn ){
			var btEditObj = doc.getElementById( node.setting.id + "_t_edit" );
				editObj = doc.getElementById( node.setting.id + "_edit" );
			
			if( !editObj ){
				editObj = doc.createElement("input");
				editObj.id = node.setting.id + "_edit";
				editObj.className = context.setting.css.textedit;
				
				da( editObj ).bind("blur",function(){
					fn( node, nodeObj, textObj, this);
					
					btEditObj.style.display = "block";
					textObj.style.display = "block";
					this.style.display = "none";
					
				}).bind("keydown",function(evt){
					if( 13 == evt.keyCode){
						fn( node, nodeObj, textObj, this);
						
						btEditObj.style.display = "block";
						textObj.style.display = "block";
						this.style.display = "none";
					}
				});
				
				nodeObj.insertBefore( editObj, textObj );
				//da( editObj ).width( da( textObj ).width()-4 );
				
			}
			editObj.value = textObj.innerHTML;
			
			btEditObj.style.display = "none";
			textObj.style.display = "none";
			editObj.style.display = "";
			editObj.select();
			editObj.focus();
		},
		
		/**移除节点
		*/
		removeNode: function( node, nodeObj, textObj, fn ){
			if( node.sub && 0 < node.sub.length ){		//清空子节点
				var subObj = doc.getElementById( node.setting.id + "_sub" );
				if( subObj ){
					subObj.parentNode.removeChild( subObj );
				}
			}
			
			var pNode = node.pnode;						//更改父节点样式
			if( pNode ){
				var pNodeId = pNode.setting.id,
					pBendObj = doc.getElementById( pNodeId + "_bend" ),
					pIconObj = doc.getElementById( pNodeId + "_folder" ),
					pSubObj = doc.getElementById( pNodeId + "_sub" ),
					bendCSS;
					
				if( 1 === da( "[id$='_node']", pSubObj ).dom.length ){	//没有兄弟节点
					switch( pBendObj.className ){						//改变父节点拐点样式
						case this.setting.css.minus:
							bendCSS = this.setting.css.join;
							break;
						case this.setting.css.minuslast:
							bendCSS = this.setting.css.joinlast;
							break;
					}
					pBendObj.className = bendCSS;
					pIconObj.className = this.setting.css.newfile;
					
				}
				else{													//还有兄弟节点
					var curBendObj = doc.getElementById( node.setting.id + "_bend" );
				
					if( this.setting.css.joinlast === curBendObj.className ||
						this.setting.css.pluslast === curBendObj.className ||
						this.setting.css.minuslast === curBendObj.className){	//排序最后一个节点
						var i = 1,
							prevNode = pNode.sub[node.index-i];					//找到前一个有效兄弟节点
						
						while( !prevNode ){
							i++;
							prevNode = pNode.sub[node.index-i];
						}
						
						var prevBendObj = doc.getElementById( prevNode.setting.id + "_bend" );
						switch( prevBendObj.className ){						//改变前一个有效兄弟节点拐点样式
							case this.setting.css.join:
								bendCSS = this.setting.css.joinlast;
								break;
							case this.setting.css.minus:
								bendCSS = this.setting.css.minuslast;
								break;
							case this.setting.css.plus:
								bendCSS = this.setting.css.pluslast;
								break;
						}
						prevBendObj.className = bendCSS;
						
					}
				}
			}
			
			
			nodeObj.parentNode.removeChild( nodeObj );			
			node.remove();							//删除当前节点
		}
	};

	
	daTreeView.fnStruct.init.prototype = daTreeView.prototype;			//模块通过原型实现继承属性

	return daTreeView;
})();



win.daTreeView = win.datreeview = win.dtv = daTreeView;

})(window);