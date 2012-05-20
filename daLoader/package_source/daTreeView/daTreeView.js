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
	var daTreeView = function( treeSetting ){
		return new daTreeView.fnStruct.init( treeSetting );
	};

	daTreeView.fnStruct = daTreeView.prototype = {
		version: "daTreeView v1.0 \n author: danny.xu \n date: 2011/7/16 16:10:04",
		
		treeId: 0,
		treeObj: null,
		treeParentObj: null,
		treeCore: null,
		
		treeSetting: {
			id: "",
			parent: "",
			name: "",
			cache: null,
			data: null,
			
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
				delete: "delete"
			},
			
			event: {
				over: null,
				out: null,
				click: null
				
			}
			
		},
		
		treeLocked: true,
		
		init: function( treeSetting ){
			treeSetting = this.treeSetting = da.extend(true, {}, this.treeSetting, treeSetting );
			
			this.treeParentObj = da( treeSetting.parent );
			if( 0 >= this.treeParentObj.length ) {alert("daTreeView温馨提示: 需要指定父亲DOM对象"); return;}
			this.treeParentObj = this.treeParentObj.dom[0];

			while( doc.getElementById( "daTreeView" + this.treeId ) ){ this.treeId++ };
			this.treeId = "daTreeView" + this.treeId;

			this.treeCoreObj = daTreeCore( treeSetting );								//生成一颗内存树
			
			this.treeObj = doc.createElement( "div" );
			this.treeObj.id = this.treeId;
			this.treeObj.className = this.treeSetting.css.tree;
			
			this.treeParentObj.insertBefore( this.treeObj, null );
			
		},
		
		
		/**创建连接 对象集
		*/
		createJoint: function( iconUlObj, node, nodeObj ){
			var nodeId = "daNode_" + node.id,
					len = ( node.parent && node.parent.subNode.length ) || 0,
					idx = node.idx,
					pObj = node.parent,
					jointObj, jointCSS,
					ulObj;
					
			jointObj = doc.createElement( "div" );
			jointObj.id = nodeId + "_joint";
			jointObj.className = this.treeSetting.css.joint;
			
			while( pObj ){																				//祖父节点连接线对象集
				if( !pObj.parent ) break;
				
				var lenParent = ( pObj.parent && pObj.parent.subNode.length ) || 0,
						idxParent = pObj.idx;
				
				ulObj = doc.createElement( "ul" );
				ulObj.id = nodeId + "_line" + pObj.level;
				if( lenParent-1 ===  idxParent )										//某级祖父节点是同级最后一个节点
					ulObj.className = this.treeSetting.css.noline;
				else
					ulObj.className = this.treeSetting.css.line
				jointObj.insertBefore( ulObj, jointObj.firstChild );
				
				pObj = pObj.parent;
			}
			
			if( len-1 ===  idx ){																	//最后一个子节点
				if( 0 < node.subNode.length )
					jointCSS = this.treeSetting.css.plusbottom;
				else
					jointCSS = this.treeSetting.css.joinbottom;
					
			}
			else{																									//非最后一个子节点
				if( 0 < node.subNode.length )
					jointCSS = this.treeSetting.css.plus;
				else
					jointCSS = this.treeSetting.css.join;
					
			}
			
			if( 0 < node.level ){															//非根节点
				ulObj = doc.createElement( "ul" );
				ulObj.id = nodeId + "_bend";
				ulObj.className = jointCSS;
				this.eventBend( ulObj, iconUlObj, node );
				jointObj.insertBefore( ulObj, null );
				
			}
//			else if( 0 === node.level ){
//				ulObj = doc.createElement( "ul" );
//				ulObj.id = nodeId + "_bend";
//				ulObj.className = this.treeSetting.css.nolines_plus;
//				jointObj.insertBefore( ulObj, null );
//				
//			}
			
			return jointObj;
		},
		
		createNode: function( node ){
			var context = this,
					nodeId = "daNode_" + node.id,
					nodeObj = doc.createElement( "div" );
			
			nodeObj.id = nodeId;
			nodeObj.className = this.treeSetting.css.node;
			
			var iconObj = doc.createElement( "div" ),
					textObj = doc.createElement( "div" ),
					toolsObj = doc.createElement( "div" ),
					ulObj, pSubObj;
			
			//图标对象
			iconObj.id = nodeId + "_icon";
			iconObj.className = this.treeSetting.css.icon;
			
			ulObj = doc.createElement( "ul" );
			ulObj.id = nodeId + "_icon_0";
			ulObj.className = ( 0 < node.level ) ? ( 0 < node.subNode.length ? this.treeSetting.css.folder : this.treeSetting.css.newfile ) : this.treeSetting.css.root;
			
			//关节对象
			nodeObj.insertBefore( this.createJoint( ulObj, node, nodeObj ), null );
			
			iconObj.insertBefore( ulObj, null );
			nodeObj.insertBefore( iconObj, null );
			
			//名称对象
			textObj.id = nodeId + "_text";
			textObj.className = this.treeSetting.css.text;
			textObj.innerHTML = node.name;
			nodeObj.insertBefore( textObj, null );
			
			//功能按钮对象
			toolsObj.id = nodeId + "_tools";
			toolsObj.className = this.treeSetting.css.tools;
			
			if ( 0 == node.level ){
				ulObj = doc.createElement( "ul" );												//设置
				ulObj.id = nodeId + "_tool_0";
				ulObj.className = this.treeSetting.css.locked;
				da( ulObj ).bind("click", function(){
					if( context.treeLocked ){
						this.className = context.treeSetting.css.unlocked;
						context.treeLocked = false;
					}
					else{
						this.className = context.treeSetting.css.locked;
						context.treeLocked = true;
					}
				});
				toolsObj.insertBefore( ulObj, null );
			}
			else if ( 0 < node.level ){
				
				ulObj = doc.createElement( "ul" );												//编辑
				ulObj.id = nodeId + "_tool_0";
				ulObj.className = this.treeSetting.css.edit;
				(function( node ){
						da( ulObj ).bind("click", function(){
							context.editNode( node, nodeObj, textObj );
							toolsObj.style.display = "none";
						});
				})( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );												//添加
				ulObj.id = nodeId + "_tool_1";
				ulObj.className = this.treeSetting.css.add;
				(function( node ){
						da( ulObj ).bind("click", function(){
							//TODO:
						});
				})( node );
				toolsObj.insertBefore( ulObj, null );
				
				ulObj = doc.createElement( "ul" );												//移除
				ulObj.id = nodeId + "_tool_2";
				ulObj.className = this.treeSetting.css.delete;
				(function( node ){
						da( ulObj ).bind("click", function(){
							context.removeNode( node, nodeObj, textObj );
						});
				})( node );
				toolsObj.insertBefore( ulObj, null );
			}
				
			nodeObj.insertBefore( toolsObj, null );
			this.eventNode( node, nodeObj, textObj, toolsObj );
			
			//放入父亲的子节点容器
			if( 0 == node.level ){																							//根节点
				pSubObj = this.treeObj;
			}
			else{																																//非根节点
				var pNode = node.parent, 
						pNodeId = "daNode_" + pNode.id;

				pSubObj = doc.getElementById( pNodeId + "_sub" );
						
				if( !pSubObj ){
					pSubObj = doc.createElement( "div" );
					pSubObj.id = pNodeId + "_sub";
					pSubObj.className = this.treeSetting.css.sub;
					
					var pObj = doc.getElementById( pNodeId ),
							ppObj = pObj.parentNode;
					
					ppObj.insertBefore( pSubObj, pObj.nextSibling );
					
				}
				
			}
			
			pSubObj.insertBefore( nodeObj, null );
			
			if( 0 < node.level && 0 == node.idx ){															//非根节点，并且是父亲的第一个子节点
				node = node.parent;
				
				var pBendObj = doc.getElementById( "daNode_" + node.id + "_bend" );
				
				if( pBendObj ){																										//改变拐点样式
					var len = ( node.parent && node.parent.subNode.length ) || 0,
							idx = node.idx;
							
					if( len-1 ===  idx )																						//最后一个子节点
						pBendObj.className = this.treeSetting.css.minusbottom;
					else																														//非最后一个子节点
						pBendObj.className = this.treeSetting.css.minus;
					
				}
				
				if( 0 < node.level )
					doc.getElementById( "daNode_" + node.id + "_icon_0" ).className = this.treeSetting.css.openfolder;
			}
			

		},
		
		/**拐点bend绑定事件
		*/
		eventBend: function( bendObj, iconUlObj, node ){
			var cssSetting = this.treeSetting.css;
					context = this;
			
			da( bendObj ).bind("click", function(){
				var	nodeId = "daNode_" + node.id,
						subObj = doc.getElementById( nodeId + "_sub" );
				
				switch( this.className ){
					case cssSetting.plus:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = cssSetting.minus;
						iconUlObj.className = cssSetting.openfolder;
						break;
						
					case cssSetting.minus:
						if( subObj ){
							subObj.style.display = "none";
							this.className = cssSetting.plus;
							iconUlObj.className = cssSetting.folder;
						}
						break;
						
					case cssSetting.plusbottom:
						if( subObj )
							subObj.style.display = "block";
						else
							context.expandNode( node, function(){
								//alert("展开子节点完毕");
							});
						this.className = cssSetting.minusbottom;
						iconUlObj.className = cssSetting.openfolder;
						break;
						
					case cssSetting.minusbottom:
						if( subObj ){
							subObj.style.display = "none";
							this.className = cssSetting.plusbottom;
							iconUlObj.className = cssSetting.folder;
						}
						break;
					
				}
				
			});
		},
		
		/**节点Node绑定事件
		*/
		eventNode: function( node, nodeObj, textObj, toolsObj ){
			var context = this,
					fnOver = context.treeSetting.event.over,
					fnOut = context.treeSetting.event.out,
					fnClick = context.treeSetting.event.click;
			
			da( nodeObj ).bind("mouseover", function(){
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.treeSetting.css.hover;
				}
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "block";
				
				if( fnOver ){
					fnOver.call( node, this, textObj );
				}
				
			}).bind("mouseout", function(){
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.treeSetting.css.node;
				}
				
				if( 0 === node.level || !context.treeLocked )
					toolsObj.style.display = "none";
				
				if( fnOut ){
					fnOut.call( node, this, textObj );
				}
				
			}).bind("click", function(){
				if( !this.getAttribute( "daNodeSelect" ) ){
					this.className = context.treeSetting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.treeSetting.css.node;
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
					this.className = context.treeSetting.css.select;
					this.setAttribute( "daNodeSelect", "true" );
					
					if( context.selectObj && this.id !== context.selectObj.id ){
						context.selectObj.className = context.treeSetting.css.node;
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
			
			setTimeout(function(){
				context.treeCoreObj.run(function( isEnd, isLevelEnd ){						//遍历树节点
					if( !isEnd ){
						context.createNode( this );
					}
					else if( isEnd && da.isFunction( fn ) ){												//展开操作完毕，回调
						fn.call( context );
					}
				});
			
			},13);
			
		},
		
		/**展开最大级别
		*/
		expandLevel: function( maxLevel, fn ){
			maxLevel = maxLevel || 0;
			
			var context = this;
			
			setTimeout(function(){
				context.treeCoreObj.run(function( isEnd, isLevelEnd ){						//遍历树节点
					if( !isEnd && maxLevel >= this.level ){
						context.createNode( this );																		//绘制节点
						
						if( maxLevel==this.level && isLevelEnd ) return false;				//展开到需要最大级别,并且是最后一个，停止遍历
					}
					else if( isEnd && da.isFunction( fn ) ){												//展开操作完毕，回调
						fn.call( context );
					}
				});
			
			},13);
			
		},
		
		/**展开节点
		*/
		expandNode: function( node, fn ){
			var nodeId = ( "string" === typeof node ) ? node : node.id;
					context = this;

			setTimeout(function(){
				context.treeCoreObj.run( node, function( isEnd, isLevelEnd ){			//遍历树节点
					if( !isEnd && nodeId !== this.id )
						context.createNode( this );																		//绘制节点
					else if( isEnd && da.isFunction( fn ) )													//展开操作完毕，回调
						fn.call( context );

				});
			
			},13);
			
		},
		
		/**编辑节点
		*/
		editNode: function( node, nodeObj, textObj ){
			var editObj = doc.getElementById( nodeObj.id + "_edit" );
			
			if( !editObj ){
				editObj = doc.createElement("input");
				editObj.id = nodeObj.id + "_edit";
				editObj.className = context.treeSetting.css.textedit;
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
			var nodeId = "daNode_" + node.id,
					nodeObj = doc.getElementById( nodeId),
					subObj = doc.getElementById( nodeId + "_sub" );
			
//			if( nodeObj )
//				nodeObj.parentNode.removeChild( nodeObj );
			
			if( subObj )
				nodeObj.parentNode.removeChild( subObj );
			//alert( nodeObj.id );
		},
		
		/**移除节点
		*/
		removeNode: function( node, nodeObj, textObj ){debugger;
			node.remove();
			this.clearNode( node.parent );
			this.expandNode( node.parent );
			
//			var subObj = doc.getElementById( nodeObj.id + "_sub" );
//			if( subObj )
//				nodeObj.parentNode.removeChild( subObj );
//			//alert( nodeObj.id );
//			nodeObj.parentNode.removeChild( nodeObj );
//			
//			da.out( node.parent.subNode.length )
//			if( 0 >= node.parent.subNode.length )
//				doc.getElementById( "daNode_" + node.parent.id + "_icon_0" ).className = this.treeSetting.css.newfile;
			
		}
	};

	
	daTreeView.fnStruct.init.prototype = daTreeView.prototype;			//模块通过原型实现继承属性

	return daTreeView;
})();



win.daTreeView = win.datreeview = win.dtv = daTreeView;

})(window);