
/**
* daNodeCore 基本树节点类
* @author danny.xu
* @version daNodeCore v1.0 2011/7/9 14:10:20
*/
(function( win, undefined ){
var doc = win.document;

var daNodeCore = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daNodeCore = function( nodeSetting ){
		return new daNodeCore.fnStruct.init( nodeSetting );
	};

	daNodeCore.fnStruct = daNodeCore.prototype = {
		version: "daNodeCore v1.0 \n author: danny.xu \n date: 2011/7/9 14:56:46",
		id: "",											//节点id
		name: "",										//节点名称
		tree: null,									//节点所属daTreeCore对象
		parent: null,								//父亲节点
		idx: 0,											//相对父亲节点的索引号
		
		level: 0,										//节点所属层级
		subNode: null,							//子节点对象数组
		
		data: null,

		nodeSetting: {							//配置信息
			id: "",
			pid: "",
			name: "",
			data: null								//用户数据
		},
		
		/**初始化函数
		*/
		init: function( nodeSetting ){
			nodeSetting = this.nodeSetting = da.extend(true, {}, this.nodeSetting, nodeSetting );
			this.subNode = [];
			
			this.id = nodeSetting.id;
			this.name = nodeSetting.name;
			this.data = nodeSetting.data;
		},
		
		/**添加子节点
		*/
		add: function( nodeSetting ){
			var sub = daNodeCore( nodeSetting );												//生成子节点
			sub.parent = this;
			sub.level = this.level + 1;
			sub.idx = this.subNode.length;
			sub.tree = this.tree;
			this.subNode.push( sub );
			
			this.tree.treeNodeMap[ this.id ] = this;
			
			return sub;
		},
		
		/**删除节点
		*/
		remove: function(){
			for( var i=0, len=this.subNode.length; i<len; i++ ){
				this.subNode[i].remove();
				
			}
			
			this.subNode = [];
			this.parent.subNode.splice( this.idx, 1 );									//删除节点  TODO:还要维护idx属性值
			delete this.tree.treeNodeMap[ this.id ];										//删除所属树对象的 节点映射
			
		}
	
		
	};

	
	daNodeCore.fnStruct.init.prototype = daNodeCore.prototype;			//模块通过原型实现继承属性

	return daNodeCore;
})();



win.daNodeCore = win.danodecore = win.dnc = daNodeCore;

})(window);


/**
* daTreeCore 基本树类
* @author danny.xu
* @version daTreeCore v1.0 2011/7/9 14:10:20
*/
(function( win, undefined ){
var doc = win.document;

var daTreeCore = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daTreeCore = function( treeSetting ){
		return new daTreeCore.fnStruct.init( treeSetting );
	};

	daTreeCore.fnStruct = daTreeCore.prototype = {
		version: "daTreeCore v1.0 \n author: danny.xu \n date: 2011/7/9 14:56:38",
		
		treeRoot: null,
		treeNodeMap: null,
		
		treeSetting: {
			id: "",
			name: "",
			cache: null,
			data: null
		},
		
		/**初始化函数
		*/
		init: function( treeSetting ){
			treeSetting = this.treeSetting = da.extend(true, {}, this.treeSetting, treeSetting );
			
			this.treeNodeMap = {};
			
			this.toGroup();
			this.createRoot();
			this.createByBreadth();
		},
		
		/**对缓存数据分组处理
		*/
		toGroup: function(){
			var cache = this.treeSetting.cache,
					group = {},
					pid;
			
			for( var i=0, len=cache.length; i<len; i++ ){								//逐个节点缓存数据通过pid分组
				pid = cache[i].pid || this.treeSetting.id;
				if( !group[ pid ] ) group[ pid ] = [];
				
				group[ pid ].push( cache[i] );
			}
			
			return group;
		},
		
		/**创建根节点
		*/
		createRoot: function(){
			this.treeRoot = daNodeCore({
				id: this.treeSetting.id,
				pid: "",
				name: this.treeSetting.name,
				data: this.treeSetting.data
			});
			
			this.treeRoot.level = 0;
			this.treeRoot.tree = this;
			
			this.treeNodeMap[ this.treeRoot.id ] = this.treeRoot;
		},
		
		/**创建树(广度)
		*/
		createByBreadth: function(){
			var group = this.toGroup(),
					arrNode = [],
					arrNextLevel = [],
					arrSubSetting = [],
					node;
			
			arrNextLevel.push( this.treeRoot );																			//将根节点 压入待处理缓存

			while( 0 < arrNextLevel.length ){
				arrNode = arrNextLevel;
				arrNextLevel = [];
				
				for( var i=0, len=arrNode.length; i<len; i++ ){
					if( !(arrSubSetting = group[ arrNode[i].id ]) ) continue;
					
					for( var n=0, lenSub=arrSubSetting.length; n<lenSub; n++  ){
						arrNextLevel.push( arrNode[i].add( arrSubSetting[n] ) );					//将刚刚新建一级的节点 压入待处理缓存
						
					}
					
				}
			}
			
			
		},
		
		/**创建树(深度)
		*/
		createByDepth: function(){
			//TODO:
		},
		
		/**遍历节点(Breadth广度)
		* @param {String|daNodeCore} node 需要遍历的节点id/节点对象，为空就遍历树的根节点
		* @param {function} fn 遍历每一个节点都进行回调处理的函数, 若回调函数返回值为false，即刻中止遍历操作
		* @description 也可以直传一个回调处理函数，默认遍历整棵树。
		*/
		run: function( node, fn ){
			if( "string" == typeof node )
				node = this.getNode( node );
				
			if( da.isFunction( node ) ){
				fn = node;
				node = this.treeRoot;
			}
			
			if( !fn || !da.isFunction( fn ) ) return;
			
			var arrNode = [],
					arrNextLevel = [];
			
			arrNextLevel.push( node );
			
			while( 0 < arrNextLevel.length ){													//遍历
				arrNode = arrNextLevel;
				arrNextLevel = [];
				
				for( var i=0, len=arrNode.length; i<len; i++ ){
					if( false === fn.call( arrNode[i], false, ( i == arrNode.length-1 ) ) ){				//每一个节点都回调一次，如果回调函数返回值恒为false，即刻中止遍历
						arrNextLevel = arrNode = [];
						break;
					}
					
					if( 0 < arrNode[i].subNode.length )
						arrNextLevel = arrNextLevel.concat( arrNode[i].subNode );
				}
			}
			
			fn.call( node, true );																		//最后再通过起始节点 回调一次
			
		},
		
		/**遍历节点(深度)
		*/
		runDepth: function(){
			//TODO:
		},
		
		/**通过节点ID查找节点对象
		*/
		getNode: function( id ){
			return this.treeNodeMap[ id ];
		},
		
		/**添加节点
		*/
		addNode: function( nodeSetting ){
			var pNode = this.getNode( nodeSetting.pid );
			if( !pNode ) return;
			
			pNode.add( nodeSetting );
		},
		
		/**删除节点
		* @param {String|daNodeCore} node 需要删除的节点id/节点对象
		*/
		removeNode: function( node ){
			if( !node ) return;
			
			if( "string" == typeof node )
				node = this.getNode( node );
			
			if( node )
				node.remove();
			
		},
		
		/**清除树所有子孙节点
		*/
		clear: function(){
			this.treeRoot.remove();
			
			this.treeNodeMap[ this.treeRoot.id ] = this.treeRoot;
		}
		
	};

	
	daTreeCore.fnStruct.init.prototype = daTreeCore.prototype;			//模块通过原型实现继承属性

	return daTreeCore;
})();



win.daTreeCore = win.datreecore = win.dtc = daTreeCore;

})(window);


