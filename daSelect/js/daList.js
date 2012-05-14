/**daList
*基本信息列表类
* @author danny.xu
* @version daList_1.0 2011-11-25 16:16:29
*/

(function( win, undefined ){
var doc = win.document;

var daList = (function(){
	
	/**daList类构造函数
	*/
	var daList = function( setting ){
		if( da.isFunction( setting ) || "string" === typeof setting )						//遍历和查找daInput控件的高级快捷用法
			return daList.getList( setting );
			
		return new daList.fnStruct.init( setting );
	};

	daList.fnStruct = daList.prototype = {
		version: "daList v1.0 \n author: danny.xu \n date: 2011-11-25 16:16:32",
		
		lId: 0,
		lObj: null,
		lTargetObj: null,
		lParentObj: null,
		
		daFrameObj: null,
		
		lItemObjs: null,
		lCurItem: null,
		
		width: 0,
		height: 0,
		
		setting: {
			parent: null,
			target: null,
			id: "",
			
			top: 0,
			left: 0,
			width: 150,
			height: 220,
			
			list: null,												//{"小王2":"001", "小裂痕1": "002", "小裂痕2":"003", "小裂痕3":"004", "小小":"011" }
			
			zIndex: 1,
			
			css: {
				daList: "daList",
				shadow: "daShadow",
				item: "item",
				hover: "itemHover",
				selected: "item2"
				
			},
			
			click: null
		},
		
		init: function( setting ){
			setting = this.setting = da.extend( {}, this.setting, setting );
			
			var tmp = da( setting.parent );
			this.lParentObj = 0 < tmp.dom.length ? tmp.dom[0] : doc.body;
			
			tmp = da( setting.target );																												//矫正target参数
			this.lTargetObj = 0 < tmp.dom.length ? tmp.dom[0] : null;
			
			if( setting.id )
				this.lId = setting.id;
			else 
				//this.iId = da.nowId();					//在ie里面好像不怎么行啊~
				while( null !== doc.getElementById( "daList_" + this.lId ) ) this.lId++;						//保证id 唯一性
			
			this.lItemObjs = [];
			
			this.create();

			if( this.lTargetObj )
				this.setPos( this.lTargetObj );
			else
				this.setPos( setting.top, setting.left );
		},
		
		/**创建dom对象
		*/
		create: function(){
			var context = this,
					setting = this.setting,
					lObj;
			
			lObj = doc.createElement("DIV");
			lObj.className = [ setting.css.daList, setting.css.shadow ].join(" ");
			lObj.style.zIndex = setting.zIndex;
			lObj.innerHTML = '<div style="font-size:12px; font-weight:bold; padding:3px; color:#444">正在加载..</div>';
			da( lObj ).width( 80 );
			this.width = 80;
			this.height = 22;
			
			da( lObj ).bind( "mousedown", function( evt ){
				evt.stopPropagation(); 														//阻止事件冒泡
			
			});
			
			this.lObj = lObj;
			this.lParentObj.insertBefore( lObj );
			
			if( this.setting.list ) this.createList();
			
		},
		
		/**创建列表DOM
		*/
		createList: function(){
			var setting = this.setting,
					list = setting.list,
					tmpCnt = doc.createElement("div"),									//创建可选项列表容器
					lItemObjs = [], objItem,
					itemWidth, itemHeight,
					w, h;
			
			this.lObj.innerHTML = "";
			da( this.lObj ).width( setting.width );
			da( this.lObj ).height( setting.height );
			
			w = da( this.lObj ).width();
			itemWidth = da.browser.ie ? w - 25 : w - 15;				//列表宽度,还要减去item样式的border和padding, 注：IE在<!DOCTYPE>标准下的filter阴影特效也算在宽度内
			
			for( var k in list ){
				objItem = doc.createElement("a");
				objItem.className = setting.css.item;
				objItem.href = "javascript:void(0);";
				objItem.setAttribute( "code", list[ k ] );
				da( objItem ).width( itemWidth );
				
				objItem.innerHTML = k;
				
				this.itemBindEvent( objItem );										//事件绑定
				tmpCnt.insertBefore( objItem );
				
				lItemObjs.push( objItem );												//缓存创建出来的可选项dom对象，便于后面使用
			}
			
			this.lItemObjs = lItemObjs;
			
			itemHeight = lItemObjs.length*26;										//矫正列表高度
			h = parseInt(setting.height);
			h = h < itemHeight ? h : itemHeight;
			da( this.lObj ).height( h );

			this.width = w;
			this.height = h;
			
			this.daFrameObj = daFrame({													//调用daFrame将tmpCnt作为内容填入daSelect的list对象中
				parent: this.lObj,
				html: tmpCnt,
				width: da.browser.ie ? w-12 : w-2,								//减去边框值
				height: h,
				border: 0
			});

			if( this.lTargetObj )
				this.setPos( this.lTargetObj );
			else
				this.setPos( setting.top, setting.left );
		},

		
		/**更新数据源
		* params {PlainObj} list 键值对数据源
		*/
		setList: function( list ){
			if( !list || !da.isPlainObj( list ) ) return;
			
			this.setting.list = list;
			this.createList();
			
			return this;
		},
		
		/**设置daList对象的位置
		* params {DOM|Int|String} nTop 列表对象的top值；也可以是某一个DOM对象
		* params {Int|String} nLeft 列表对象的left值
		*/
		setPos: function( nTop, nLeft ){
			if( nTop && nTop.nodeType ){
				var daTarget = da( nTop ),
						pos = daTarget.offset(),
						oldDisplay = da( this.lObj ).css( "display" );
				
				if( "none" === oldDisplay ) this.lObj.style.display = "block";
				
				if( da.browser.ie ){																					//校正list面板的位置
					if( da(win).height()/2 < pos.top )
						pos.top = pos.top - this.height + 2;
					else
						pos.top = pos.top+ daTarget.height() -2;
						
					if( da(win).width()/2 < pos.left )
						pos.left = pos.left - ( this.width - daTarget.width())+4;
					else
						pos.left -= 5;
						
				}
				else{
					if( da(win).height()/2 < pos.top )
						pos.top = pos.top - this.height -2;
					else
						pos.top = pos.top+ daTarget.height()+1;
					
					if( da(win).width()/2 < pos.left )
						pos.left = pos.left - ( this.width - daTarget.width());
						
				}
				
				this.setting.top = pos.top;
				this.setting.left = pos.left;
			}
			else{
				this.setting.top = nTop || this.setting.top;
				this.setting.left = nLeft || this.setting.left;
				
			}
			
			da( this.lObj ).css({
				top: this.setting.top,
				left: this.setting.left
			});
			
			da( this.lObj ).css( "display", oldDisplay );
			
		},
		
		/**可选项是将绑定
		*/
		itemBindEvent: function( objItem ){
			var context = this;
			
			da(objItem).bind( "click", function(evt){					//给可选项绑定事件
				context.select( this );
				
			}).bind( "mouseover", function(evt){
				if( context.setting.css.item === this.className )
					this.className = context.setting.css.hover;
				
			}).bind( "mouseout", function(evt){
				if( context.setting.css.hover === this.className )
					this.className = context.setting.css.item;
					
			});
		},
		
		/**子项选择事件
		* params {DOM} obj 可选项dom对象
		*/
		select: function( obj ){
			var setting = this.setting;
					code = obj.getAttribute("code"),
					text = obj.innerText || obj.textContent;
			
			var res = this.text( text );
			
			if( da.isFunction( setting.click ) && res )
				setting.click.call( this, res );
		
		},
		
		/**选中下一个选项
		*/
		next: function(){
			var lItemObjs = this.lItemObjs,
					lCurItem = this.lCurItem;
			
			if( !lItemObjs ) return null;
			
			if( !lCurItem ) return this.index( 0 );
			
			var newIdx = lCurItem.index + 1;
			if( lItemObjs.length <= newIdx ){
				return this.index( 0 );
			}
			else{
				return this.index( newIdx );
			}
		},
		
		/**选中上一个选项
		*/
		prev: function(){
			var lItemObjs = this.lItemObjs,
					lCurItem = this.lCurItem;
			
			if( !lItemObjs ) return null;
			
			if( !lCurItem ) return this.index( lItemObjs.length-1 );
			
			var newIdx = lCurItem.index - 1;
			if( 0 > newIdx ){
				return this.index( lItemObjs.length-1 );
			}
			else{
				return this.index( newIdx );
			}
		},
		
		//显示列表
		/*
		*/
		show: function(){
			if( "block" === this.lObj.style.display ) return;
			
			if( "undefined" === typeof daFx ){
				this.lObj.style.display = "block";
			}
			else{
				da( this.lObj ).slideDown(300);
				
			}
			
		},
		
		/**隐藏列表
		* params {boolean} isForce 是否不需要验证daList当前值，直接关闭
		*/
		hide: function( isForce ){
			if( "none" === this.lObj.style.display ) return;
			
			if( "undefined" === typeof daFx || isForce ){
				this.lObj.style.display = "none";
			}
			else{
				da( this.lObj ).slideUp(150);
			}
		},
		
		/**释放内存资源
		*/
		release: function(){
			this.lObj = null;
			this.lTargetObj = null;
			this.lParentObj = null;
			
			for( var i=0,len=this.lItemObjs.length; i<len; i++ ){
				this.lItemObjs[i] = null;
			}
			this.lItemObjs = null;
			
			this.lCurItem = null;
			
			this.setting.parent = null;
			this.setting.target = null;
			this.setting.list = null;
			this.setting.css = null;
			this.setting.click = null;
			
		},
		
		/**移除列表对象( 防止内存泄露一定要用这个API哟！ )
		*/
		remove: function(){
			if( this.daFrameObj ){
				this.daFrameObj.remove();
				this.daFrameObj = null;
			}
			
			da( this.lObj ).remove();
			
			this.release();
		}
		
	};

	daList.fnStruct.init.prototype = daList.prototype;			//模块通过原型实现继承属性

	//扩展daSelect控件的value和text设置函数
	da.each([ "value", "text", "index", "get" ],function( idx, name ){
		daList.fnStruct[ name ] = function( val ){
			var context = this,
					setting = this.setting,
					lItemObjs = this.lItemObjs;

			if( !lItemObjs ) return null;
			
			if( undefined === val && this.lCurItem ){												//get 模式
					if( "get" === name )
						return this.lCurItem;
					else
						return this.lCurItem[name];
			}
			
			var list = setting.list,
					lObj = this.lObj,
					lCurItem, item, itemCode, itemText;
//					onFind = true;
			
			for( var i=0,len=lItemObjs.length; i<len; i++ ){								//set 模式
				item = lItemObjs[i];
				itemCode = item.getAttribute( "code" );
				itemText = item.innerHTML;
				
				if( "index" === name && i == val || "value" === name && itemCode == val || "text" === name && itemText == val ){				//如果在列表中找到相应的有效项
//					onFind = false;
					
					if( this.lCurItem )
						this.lCurItem.obj.className = setting.css.item;						//取消当前选中项
					
					if( setting.css.selected !== item.className ){							//更改当前选中项样式
						item.className = setting.css.selected;
					}
					
					lCurItem = {
						index: i,
						value: itemCode,
						text: itemText,
						obj: item
					};

					this.daFrameObj.scroll( (i-1)*26, 0 );						//设置list滚动条显示位置，保证当前选中项处于可见区域
					
					break;
				}
			}
			
			if( lCurItem ){
				this.lCurItem = lCurItem;
				
//				if( da.isFunction( setting.change ) )
//					setting.change.call( this, setting.onlyOne ? lCurItem[0] : lCurItem );
				
				return  lCurItem;
			}
			else
				return null;
				
		}
	});
	
	return daList;
})();




win.daList = daList;

})(window);