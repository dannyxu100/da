/*********************** Support *****************************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: 兼容浏览器
	version: 1.0.0
*/
(function(da){
	da.support = (function(){
		//浏览器兼容性判断
		var	div = document.createElement("div"),
			id = "script" + da.nowId(),
			select,
			opt,
			input,
			fragment;
				
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		var a = div.getElementsByTagName("a")[0];
		if (!a ) return;
		
		// First batch of supports tests
		select = document.createElement( "select" );
		opt = select.appendChild( document.createElement("option") );
		input = div.getElementsByTagName( "input" )[ 0 ];

		support = {
			leadingWhitespace: ( div.firstChild.nodeType === 3 ),		// IE strips leading whitespace when .innerHTML is used
		
			tbody: !!div.getElementsByTagName( "tbody" ).length,		//判断是否自动插入了tbody标签元素，IE会对空的table标签自动插入tbody标签元素

			htmlSerialize: !!div.getElementsByTagName( "link" ).length,	//判读link元素能否通过innerHTML正确的被串行化，IE中不能通过innerHTML正常的串行化link和script标签元素
			
			opacity: /^0.55$/.test( a.style.opacity ),					//opacity 不透明度属性兼容性判断
			cssFloat: !!a.style.cssFloat,								//float 浮动位置属性兼容性判断

			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			checkOn: ( input.value === "on" ),

			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			optSelected: opt.selected,						//验证option默认选中项，有selected属性
	
			getComputedStyle: doc.defaultView && doc.defaultView.getComputedStyle,		//defaultView.getComputedStyle 函数支持判断
			
			getSetAttribute: div.className !== "t",			//如果是IE，可以通过驼峰格式值设置属性,这时候在今后的属性操作时就要进行兼容处理了。
			
			// Makes sure cloning an html5 element does not cause problems
			// Where outerHTML is undefined, this still works
			html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",
			
			boxModel: null,									//盒子模型支持
			inlineBlockNeedsLayout: false,					//inline-block支持
			shrinkWrapBlocks: false,						//拆封块支持
			reliableHiddenOffsets: true,					//隐藏元素可靠性支持
			
			scriptEval: false,								//判断是否支持script元素引入并执行自定义代码
			deleteExpando: true,												
			ajax: false										//是否支持XHR requests
		};		
		
		// Make sure checked status is properly cloned
		input.checked = true;
		support.noCloneChecked = input.cloneNode( true ).checked;

		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		try {																						//通过try验证是否能通过delete删除元素，自定义扩展属性（IE会异常）
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
		
		// Check if a radio maintains it's value
		// after being appended to the DOM
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";
	
		input.setAttribute("checked", "checked");
		div.appendChild( input );
		support.appendChecked = input.checked;																												// Check if a disconnected checkbox will retain its checked, value of true after appended to the DOM (IE6/7)
		
		fragment = doc.createDocumentFragment();																											//判断是否支持元素checked状态克隆
		fragment.appendChild( div.firstChild );
		support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;					//WebKit内核浏览器，在文档碎片中不能够正确的克隆checked 状态
		
		
		if ( window[ id ] ) {														//判断是否支持script元素引入并执行自定义代码（IE不支持，只能通过script元素的text属性代替）
			support.scriptEval = true;
			delete window[ id ];
		}
	
		div.innerHTML = "";
	
		// Figure out if the W3C box model works as expected
		div.style.width = div.style.paddingLeft = "1px";
	
		// We use our own, invisible, body
		body = document.createElement( "body" );
		bodyStyle = {
			visibility: "hidden",
			width: 0,
			height: 0,
			border: 0,
			margin: 0,
			// Set background to avoid IE crashes when removing (#9028)
			background: "none"
		};
		for ( i in bodyStyle ) {
			body.style[ i ] = bodyStyle[ i ];
		}
		body.appendChild( div );
		document.documentElement.appendChild( body );
	
		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		support.appendChecked = input.checked;
	
		support.boxModel = div.offsetWidth === 2;
	
		if ( "zoom" in div.style ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );
	
			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}
	
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
	
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		isSupported = ( tds[ 0 ].offsetHeight === 0 );
	
		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";
	
		// Check if empty table cells still have offsetWidth/Height
		// (IE < 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
		div.innerHTML = "";
	
		// Check if div with explicit width and no margin-right incorrectly
		// gets computed margin-right based on width of container. For more
		// info see bug #3333
		// Fails in WebKit before Feb 2011 nightlies
		// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
		if ( document.defaultView && document.defaultView.getComputedStyle ) {
			marginDiv = document.createElement( "div" );
			marginDiv.style.width = "0";
			marginDiv.style.marginRight = "0";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				( parseInt( document.defaultView.getComputedStyle( marginDiv, null ).marginRight, 10 ) || 0 ) === 0;
		}
	
		// Remove the body element we added
		body.innerHTML = "";
		document.documentElement.removeChild( body );

		
		return support;
	})();
	
	
	// Keep track of boxModel
	da.boxModel = da.support.boxModel;
	
})(da);