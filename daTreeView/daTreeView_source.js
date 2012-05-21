///**daNodeView
//*树节点视图类
//* @author danny.xu
//* @version daNodeView_1.0 2011/7/16 16:09:57
//*/
//
//(function( win, undefined ){
//var doc = win.document;
//
//var daNodeView = (function(){
//	
//	/**daNodeView类构造函数
//	*/
//	var daNodeView = function(){
//		return new daNodeView.fnStruct.init();
//	};
//
//	daNodeView.fnStruct = daNodeView.prototype = {
//		version: "daNodeView v1.0 \n author: danny.xu \n date: 2011/7/16 16:10:04",
//		
//		nodeSetting: {
//		
//		},
//		
//		init: function(){
//			
//		}
//	};
//
//	
//	daNodeView.fnStruct.init.prototype = daNodeView.prototype;			//模块通过原型实现继承属性
//
//	return daNodeView;
//})();
//
//
//
//win.daNodeView = win.danodeview = win.dnv = daNodeView;
//
//})(window);










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
			
			css: {
				tree: "daTree",
				node: "daNode",
				hover: "daNodeHover",
				select: "daNodeSelect",
				sub: "daSubContainer",
				
				joint: "daJoint",
				noline: "noline",
				line: "line",
				join: "join",
				joinbottom: "joinbottom",
				minus: "minus",
				plus: "plus",
				nolines_minus: "nolines_minus",
				nolines_plus: "nolines_plus",
				plusbottom: "plusbottom",
				minusbottom: "minusbottom",
				
				icon: "daIcon",
				root: "icoRoot",
				newfile: "iconewfile", 
				folder: "icoFolder",
				openfolder: "icoOpenFolder",
				
				text: "daText",
				textedit: "daTextEdit",
				
				tools: "daTools",
				locked: "locked",
				unlocked: "unlocked",
				edit: "edit", 
				add: "add", 
				del: "delete"
			},
			
			event: {
				over: null,
				out: null,
				click: null
				
			}
			
		},
		
		treeLocked: true,
		
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
		createLine: function( iconUlObj, node, nodeObj ){
			var nodeId = node.setting.id,
				len = ( node.pnode && node.pnode.sub && node.pnode.sub.length ) || 0,
				index = node.index,
				pObj = node.pnode,
				jointObj, jointCSS,
				ulObj;
			
			jointObj = doc.createElement( "div" );
			jointObj.id = nodeId + "_joint";
			jointObj.className = this.setting.css.joint;
			
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
				jointObj.insertBefore( ulObj, jointObj.firstChild );
				
				pObj = pObj.pnode;
			}

			if( len-1 ===  index ){					//最后一个子节点
				if( node.sub && 0 < node.sub.length )
					jointCSS = this.setting.css.plusbottom;
				else
					jointCSS = this.setting.css.joinbottom;
					
			}
			else{									//非最后一个子节点
				if( node.sub && 0 < node.sub.length )
					jointCSS = this.setting.css.plus;
				else
					jointCSS = this.setting.css.join;
					
			}
			
			if( 0 < node.level ){					//非根节点
				ulObj = doc.createElement( "ul" );
				ulObj.id = nodeId + "_bend";
				ulObj.className = jointCSS;
				// this.bindLine( ulObj, iconUlObj, node );
				jointObj.insertBefore( ulObj, null );
				
			}
//			else if( 0 === node.level ){
//				ulObj = doc.createElement( "ul" );
//				ulObj.id = nodeId + "_bend";
//				ulObj.className = this.setting.css.nolines_plus;
//				jointObj.insertBefore( ulObj, null );
//				
//			}
			
			return jointObj;
		},
		
		createNode: function( node ){
			var context = this,
				nodeId = node.setting.id,
				nodeObj = doc.createElement( "div" );
			
			nodeObj.id = nodeId + "_node";
			nodeObj.className = this.setting.css.node;
			
			var iconObj = doc.createElement( "div" ),
				textObj = doc.createElement( "div" ),
				toolsObj = doc.createElement( "div" ),
				ulObj, pSubObj;
		
			//图标对象
			iconObj.id = nodeId + "_icon";
			iconObj.className = this.setting.css.icon;
			
			ulObj = doc.createElement( "ul" );
			ulObj.id = nodeId + "_icon_0";
			ulObj.className = ( 0 < node.level ) ? 
				( node.sub && 0 < node.sub.length ? 
					this.setting.css.folder : 
					this.setting.css.newfile ) : 
				this.setting.css.root;
			
			//关节对象
			nodeObj.insertBefore( this.createLine( ulObj, node, nodeObj ), null );
			
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
			
			if ( 0 == node.level ){
				ulObj = doc.createElement( "ul" );				//功能锁
				ulObj.id = nodeId + "_tool_0";
				ulObj.className = this.setting.css.locked;
				da( ulObj ).bind("click", function(){
					if( context.treeLocked ){
						this.className = context.setting.css.unlocked;
						context.treeLocked = false;
					}
					else{
						this.className = context.setting.css.locked;
						context.treeLocked = true;
					}
				});
				toolsObj.insertBefore( ulObj, null );
			}
			else if ( 0 < node.level ){
				
				ulObj = doc.createElement( "ul" );				//编辑
				ulObj.id = nodeId + "_tool_0";
				ulObj.className = this.setting.css.edit;
				(function( node ){
					da( ulObj ).bind("click", function(){
						context.editNode( node, nodeObj, textObj );
						toolsObj.style.display = "none";
					});
				})( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );				//添加
				ulObj.id = nodeId + "_tool_1";
				ulObj.className = this.setting.css.add;
				(function( node ){
					da( ulObj ).bind("click", function(){
						//TODO:
					});
				})( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );				//移除
				ulObj.id = nodeId + "_tool_2";
				ulObj.className = this.setting.css.del;
				(function( node ){
					da( ulObj ).bind("click", function(){
						context.removeNode( node, nodeObj, textObj );
					});
				})( node );
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
						pBendObj.className = this.setting.css.minusbottom;
					else																														//非最后一个子节点
						pBendObj.className = this.setting.css.minus;
					
				}
				
				if( 0 < node.level )
					doc.getElementById( node.setting.id + "_icon_0" ).className = this.setting.css.openfolder;
			}
			

		},
		
		/**绑定事件
		*/
		bind: function(){
			this.bindLine();
			this.bindNode();
		},
		
		/**拐点bend绑定事件
		*/
		bindLine: function(){
			var css = this.setting.css;
				context = this;

			da( this.obj ).delegate( "[id$='_bend']", "click", function(){
				var	nodeId = this.id.replace("_bend",""),
					jointObj = doc.getElementById( 	nodeId + "_joint" ),	//节点连线对象集容器元素。
					iconObj = doc.getElementById( nodeId + "_icon_0" ),		//默认图标元素
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
						
					case css.plusbottom:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = css.minusbottom;
						iconObj.className = css.openfolder;
						break;
						
					case css.minusbottom:
						if( subObj ){
							subObj.style.display = "none";
							this.className = css.plusbottom;
							iconObj.className = css.folder;
						}
						break;
					
				}
				
			});
		},
		
		
		/**拐点bend绑定事件
		*/
		bindLine2: function( bendObj, iconUlObj, node ){
			var css = this.setting.css;
				context = this;
				
			da( bendObj ).bind("click", function(){
				var	nodeId = node.setting.id,
					subObj = doc.getElementById( nodeId + "_sub" );

				switch( this.className ){
					case css.plus:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = css.minus;
						iconUlObj.className = css.openfolder;
						break;
						
					case css.minus:
						if( subObj ){
							subObj.style.display = "none";
							this.className = css.plus;
							iconUlObj.className = css.folder;
						}
						break;
						
					case css.plusbottom:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = css.minusbottom;
						iconUlObj.className = css.openfolder;
						break;
						
					case css.minusbottom:
						if( subObj ){
							subObj.style.display = "none";
							this.className = css.plusbottom;
							iconUlObj.className = css.folder;
						}
						break;
					
				}
				
			});
		},
		
		/**节点Node绑定事件
		*/
		bindNode: function(){
			var context = this,
				fnOver = context.setting.event.over,
				fnOut = context.setting.event.out,
				fnClick = context.setting.event.click;

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
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "block";
				
				if( fnOver ){
					fnOver.call( node, this, textObj );
				}
				
			}).delegate( "[id$='_node']", "mouseout", function(){		//节点鼠标移出取消高亮。
				getObjs( this );			//获取相关元素、对象
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.node;
				}
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "none";
				
				if( fnOut ){
					fnOut.call( node, this, textObj );
				}
				
			}).delegate( "[id$='_node']", "click", function(){			//节点点击事件。
				getObjs( this );			//获取相关元素、对象
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.setting.css.node;
						context.selectObj.removeAttribute( "daNodeSelect" );
					}

					context.selectObj = this;
				}
				
				if( fnClick ){
					fnClick.call( node, this, textObj );
				}
				
			}).delegate( "[id$='_node']", "mouseup", function(evt){
				if ( 2 !== evt.button ) return;
				
				getObjs( this );
				
				daTip.hide( "daNodePopMenu" );
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.setting.css.node;
						context.selectObj.removeAttribute( "daNodeSelect" );
					}

					context.selectObj = this;
				}
				
//				if( fnClick ){
//					fnClick.call( this, node, nodeObj );
//				}
				
			});
			
		},
		
		/**节点Node绑定事件
		*/
		bindNode2: function( node, nodeObj, textObj, toolsObj ){
			var context = this,
				fnOver = context.setting.event.over,
				fnOut = context.setting.event.out,
				fnClick = context.setting.event.click;
			
			da( nodeObj ).bind("mouseover", function(){				//节点鼠标移上高亮。
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.hover;
				}
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "block";
				
				if( fnOver ){
					fnOver.call( node, this, textObj );
				}
				
			}).bind("mouseout", function(){							//节点鼠标移出取消高亮。
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.node;
				}
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "none";
				
				if( fnOut ){
					fnOut.call( node, this, textObj );
				}
				
			}).bind("click", function(){							//节点点击事件。
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.setting.css.node;
						context.selectObj.removeAttribute( "daNodeSelect" );
					}

					context.selectObj = this;
				}
				
				if( fnClick ){
					fnClick.call( node, this, textObj );
				}
				
			}).bind("mouseup", function(evt){
				if ( 2 !== evt.button ) return;
				
				daTip.hide( "daNodePopMenu" );
				
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.setting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.setting.css.node;
						context.selectObj.removeAttribute( "daNodeSelect" );
					}

					context.selectObj = this;
				}
				
//				if( fnClick ){
//					fnClick.call( this, node, nodeObj );
//				}
				
			});
			
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
		
		/**编辑节点
		*/
		editNode: function( node, nodeObj, textObj ){
			var editObj = doc.getElementById( nodeObj.id + "_edit" );
			
			if( !editObj ){
				editObj = doc.createElement("input");
				editObj.id = nodeObj.id + "_edit";
				editObj.className = context.setting.css.textedit;
				editObj.value = textObj.innerHTML;
				
				da( editObj ).bind("blur",function(){
					textObj.innerHTML = this.value;
					
					textObj.style.display = "block";
					this.style.display = "none";
				});
				
				nodeObj.insertBefore( editObj, textObj );
				da( editObj ).width( da( textObj ).width()-4 );
				
			}
			
			textObj.style.display = "none";
			editObj.style.display = "";
			editObj.select();
			editObj.focus();
		},
		
		/**清除节点对象
		*/
		clearNode: function( node ){
			var nodeId = node.id,
				nodeObj = doc.getElementById( nodeId + "_node"),
				subObj = doc.getElementById( nodeId + "_sub" );
			
//			if( nodeObj )
//				nodeObj.parentNode.removeChild( nodeObj );
			
			if( subObj )
				nodeObj.parentNode.removeChild( subObj );
			//alert( nodeObj.id );
		},
		
		/**移除节点
		*/
		removeNode: function( node, nodeObj, textObj ){
			node.remove();
			this.clearNode( node.parent );
			this.expandNode( node.parent );
			
//			var subObj = doc.getElementById( nodeObj.id + "_sub" );
//			if( subObj )
//				nodeObj.parentNode.removeChild( subObj );
//			//alert( nodeObj.id );
//			nodeObj.parentNode.removeChild( nodeObj );
//			
//			da.out( node.parent.sub.length )
//			if( 0 >= node.parent.sub.length )
//				doc.getElementById( node.parent.id + "_icon_0" ).className = this.setting.css.newfile;
			
		}
	};

	
	daTreeView.fnStruct.init.prototype = daTreeView.prototype;			//模块通过原型实现继承属性

	return daTreeView;
})();



win.daTreeView = win.datreeview = win.dtv = daTreeView;

})(window);