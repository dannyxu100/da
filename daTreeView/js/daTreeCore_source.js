/**
* daNodeCore 基本树节点类
* @author danny.xu
* @version daNodeCore v1.0 2011/7/9 14:10:20
*/
(function( win, undefined ){
var doc = win.document;

var daNodeCore = (function(){
	/**daNodeCore类构造函数
	*/
	var daNodeCore = function( setting ){
		return new daNodeCore.fnStruct.init( setting );
	};

	daNodeCore.fnStruct = daNodeCore.prototype = {
		tree: null,					//节点所属daTreeCore对象
		pnode: null,				//父亲节点对象
		sub: null,					//子节点对象数组
		
		index: 0,					//相对父亲节点的索引号
		level: 0,					//节点所属层级

		setting: {					//配置信息
			id: "",					//节点id
			pid: "",				
			name: "",				//节点名称
			data: null				//用户数据
		},
		
		/**初始化函数
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
		},
		
		/**添加子节点
		*/
		add: function( node ){
			if( !this.sub ){						//确保子节点缓存区存在
				this.sub = [];
			}
			
			node.pnode = this;						//更新节点属性
			node.level = this.level + 1;
			node.index = this.sub.length;
			node.tree = this.tree
			
			this.sub.push( node );
			
			return node;
		},
		
		/**删除节点
		*/
		remove: function(){
			for( var i=0, len=this.sub.length; i<len; i++ ){
				this.sub[i].remove();
			}
			
			this.sub = null;
			
			if( this.tree )							//删除所属树对象的 节点映射
				delete this.tree.map[ this.setting.id ];
		}
	
		
	};

	daNodeCore.fnStruct.init.prototype = daNodeCore.prototype;		//模块通过原型实现继承属性

	return daNodeCore;
})();


win.daNodeCore = daNodeCore;

})(window);


/**
* daTreeCore 基本树类
* @author danny.xu
* @version daTreeCore v1.0 2011/7/9 14:10:20
*/
(function( win, undefined ){
var doc = win.document;

var daTreeCore = (function(){
	
	/**daTreeCore类构造函数
	*/
	var daTreeCore = function( setting ){
		return new daTreeCore.fnStruct.init( setting );
	};

	daTreeCore.fnStruct = daTreeCore.prototype = {
		version: "daTreeCore v1.0 \n author: danny.xu \n date: 2011/7/9 14:56:38",
		
		root: null,
		map: null,
		
		setting: {
			id: "",							//树id。
			name: "",						//树名称。
			data: null,						//扩展数据。
			list: null						//待处理节点配置数据。
		},
		
		/**初始化函数
		*/
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			this.map = {};
			
			// if( setting.list ){				//批量创建节点，需要先矫正为有效数据格式
				// this.group();
			// }
			
			if( !this.setting.list ) this.setting.list = {};
			
			this.createRoot();
		},
		
		/**对缓存数据分组处理
		*/
		group: function(){
			var list = this.setting.list,
				group = {},
				pid;
			
			for( var i=0, len=list.length; i<len; i++ ){			//逐个节点缓存数据通过pid分组。
				pid = list[i].pid || this.setting.id;
				if( !group[ pid ] ) group[ pid ] = [];
				
				group[ pid ].push( list[i] );
			}
			
			return group;
		},
		
		/**创建根节点
		*/
		createRoot: function(){
			this.root = daNodeCore({
				id: this.setting.id,
				pid: "",
				name: this.setting.name,
				data: this.setting.data
			});
			
			this.root.level = 0;
			this.root.tree = this;
			
			this.map[ this.root.setting.id ] = this.root;
		},

		// /**添加节点
		// */
		// add2: function( setting ){
			// var pnode = this.get( setting.pid );
			// if( !pnode ){
				// throw new Error( "节点"+ setting.id +"没有找到父节点:"+ setting.pid );
			// }
			// else{
				// var node = daNodeCore( setting );		//生成子节点
				// pnode.add( node );
				// this.map[ node.setting.id ] = node;
			// }
			
		// },
		
		// /**创建树(广度)
		// */
		// createNode: function(){
			// var group = this.group(),
				// arrCur = [],
				// arrSubLevel = [],
				// arrSubSetting = [],
				// node;
			
			// arrSubLevel.push( this.root );			//将根节点 压入待处理缓存

			// while( 0 < arrSubLevel.length ){
				// arrCur = arrSubLevel;				//置换子级节点列表 到待处理列表
				// arrSubLevel = [];					//清空子级节点列表
				
				// for( var i=0, len=arrCur.length; i<len; i++ ){					//循环待处理列表
					// if( !(arrSubSetting = group[ arrCur[i].id ]) ) continue;	//判断是否有子级节点
					
					// for( var n=0, lenSub=arrSubSetting.length; n<lenSub; n++  ){
						// arrSubLevel.push( arrCur[i].add( arrSubSetting[n] ) );	//压入子级节点列表
						
					// }
					
				// }
			// }
		// },
		
		add: function( setting ){
			var node;
			if( setting && setting.pnode ){			//add(nodeObj) 参数为daNodeCore对象。
				node = setting;
			}
			else{
				node = daNodeCore( setting );		//生成新节点。
			};
			
			if( !this.setting.list[ node.setting.pid ] ){			//确保新节点 的所属父节点缓存区存在。
				this.setting.list[ node.setting.pid ] = [];
			}
			
			this.setting.list[ node.setting.pid ].push( node );		//将新节点 压入所属父节点缓存区。
		},
		
		load: function( isForce ){
			var tree = this,
				list = this.setting.list,
				arrSub = [];
			
			if( da.isEmptyObj( list ) ) return;
			
			if( isForce ){		//强制方式(建议用于:add单一或少量新节点后立即load,强制要求父节点存在)。
				var pnode;
				
				for( var item in list ){		//循环所有缓存区。
					pnode = this.get( setting.pid );
					if( !pnode ){
						throw new Error( "节点"+ setting.id +"没有找到父节点:"+ setting.pid );
						break;
					}
					
					arrSub = list[ this.setting.id ];				//提取新子节点列表。
					for( var i=0, len=arrSub.length; i<len; i++ ){	//循环待处理新子节点列表。
						pnode.add( arrSub[i] );
						tree.map[ arrSub[i].setting.id ] = arrSub[i];
					}
				}
				tree.setting.list = {};						//清空待处理缓存区
				
			}
			else{				//遍历方式(建议用于: add批量新节点后load处理,)。
				this.run( this.root, function( isEnd, isLevelEnd ){			//遍历树，添加待处理的新节点(this为遍历到当前节点)。
					if( !isEnd && !isLevelEnd ){
						arrSub = list[ this.setting.id ];		//提取当前节点下的新子节点。
						if( !arrSub || 0 >= arrSub.length ){	//没待处理的新子节点。
							return;
						}
						else{
							for( var i=0, len=arrSub.length; i<len; i++ ){		//循环待处理列表。
								this.add( arrSub[i] );							//这里刚加入的新子节点，会在下一级被遍历到。
								tree.map[ arrSub[i].setting.id ] = arrSub[i];
							}
							
							for( var item in list ){		//判断缓存区还有没有待处理新节点。
								if( undefined == item ){	//已经没有待处理的新子节点了，直接终止遍历树操作。
									return false;
								}
								else{
									break;
								}
							}
						}
					}
					
					if( isEnd ){							//遍历完所有节点，即便list内仍然有新节点缓存，也是配置信息不合法的，直接清空。
						tree.setting.list = {};
					}
				});
			}
		},
		
		/**遍历节点(Breadth广度)
		* @param {String|daNodeCore} node 需要遍历的节点id/节点对象，为空就遍历树的根节点
		* @param {function} fn 遍历每一个节点都进行回调处理的函数, 若回调函数返回值为false，即刻中止遍历操作
		* @description 也可以直传一个回调处理函数，默认遍历整棵树。
		*/
		run: function( node, fn ){
			if( "string" == typeof node )
				node = this.get( node );
				
			if( da.isFunction( node ) ){
				fn = node;
				node = this.root;
			}
			
			if( !fn || !da.isFunction( fn ) ) return;
			
			var arrCur = [],
				arrSubLevel = [],
				curNode;
			
			arrSubLevel.push( node );

			while( 0 < arrSubLevel.length ){					//遍历。
				arrCur = arrSubLevel;
				arrSubLevel = [];
				
				for( var i=0, len=arrCur.length; i<len; i++ ){
					curNode = arrCur[i];
				
					if( false === fn.call( curNode, false, false ) ){	//每一个节点都回调一次，如果回调函数返回值恒为false，即刻中止遍历。
						arrSubLevel = arrCur = [];				//要中止遍历，先清空待处理列表
						break;
					}
					
					if( curNode.sub && 0 < curNode.sub.length ){
						// da.out(arrCur[i].setting.id +":"+ arrCur[i].sub.length);
						arrSubLevel = arrSubLevel.concat( curNode.sub );
					}
				}
				fn.call( curNode, false, true );				//遍历到树的每一级别最后一个节点 回调一次。
			}
			
			fn.call( curNode, true, true );						//任何条件造成遍历操作停止后，最终还要回调一次。
			
		},
		
		/**通过节点ID查找节点对象
		*/
		get: function( id ){
			return this.map[ id ];
		},
		
		/**删除节点
		* @param {String|daNodeCore} node 需要删除的节点id/节点对象
		*/
		remove: function( node ){
			if( "undefined" === typeof node ){
				this.root.remove();
				this.map = null;
				return;
			}
			
			if( "string" == typeof node )
				node = this.get( node );
			
			if( node && node.pnode )
				node.remove();
			
		}
		
	};

	
	daTreeCore.fnStruct.init.prototype = daTreeCore.prototype;			//模块通过原型实现继承属性。

	return daTreeCore;
})();



win.daTreeCore = win.datreecore = win.dtc = daTreeCore;

})(window);


