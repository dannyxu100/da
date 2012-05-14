function fnProp(n) {
  return n && n.constructor === Number ? n + 'px' : n;
}

da.fnStruct.extend({
		bgiframe: function( params ){
			var def = {
				top: "auto",
				left: "auto",
				width: "auto",
				height: "auto",
				opacity: true,
				src: "javascript:false;"
	    };
	    
	    params = da.extend( {}, def, params );
	    
			var iframeObj;
	    this.each( function(){
			    iframeObj = document.createElement("iframe");
			    iframeObj.src = params.src;
			    iframeObj.className = "daBgIframe";
			    iframeObj.setAttribute( "frameborder", 0 );
			    iframeObj.setAttribute( "tabindex", -1 );
			    iframeObj.style.cssText = [
			    	"display:block;position:absolute;z-index:-1;",
			    	'top:', ( 'auto' == params.top ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : fnProp(params.top) ),
				    ';left:', ( 'auto' == params.left ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : fnProp(params.left)),
						';width:', ( 'auto' == params.width ? 'expression(this.parentNode.offsetWidth+\'px\')' : fnProp(params.width)),
						';height:', ( 'auto' == params.height ? 'expression(this.parentNode.offsetHeight+\'px\')' : fnProp(params.height)), 
						";"
					].join("");
					
	        if( 0 === da(this).children('iframe.bgiframe').dom.length ) 
	        	this.insertBefore( iframeObj, this.firstChild );
	    });
	    
	    defParams = null;
	    iframeObj = null;

	    return this;
		}
});