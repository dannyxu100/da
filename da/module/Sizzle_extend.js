/***************** Sizzleѡ���� ��չ *****************/
/*
	author:	danny.xu
	date: 2012.5.17
	description: Sizzleѡ���� ��չ�ӿں���
	version: 1.0.0
*/
(function(da){
	if ( da.expr && da.expr.filters ) {
		/**Sizzleѡ������չhidden����ֵ�ж�
		*/
		da.expr.filters.hidden = function( elem ) {
			var width = elem.offsetWidth,
				height = elem.offsetHeight;

			return (width === 0 && height === 0) || (!da.support.reliableHiddenOffsets && (elem.style.display || da.css( elem, "display" )) === "none");
		};

		/**Sizzleѡ������չvisible����ֵ�ж�
		*/
		da.expr.filters.visible = function( elem ) {
			return !da.expr.filters.hidden( elem );
			
		};
	}

	
	
var daRe_until = /Until$/,
	daRe_parentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	daRe_multiselector = /,/,
	daRe_isSimple = /^.[^:#\[\.,]*$/,
	daRe_POS = da.expr.match.POS,
	
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true 
	};
	
	
	//Ԫ����ѡ���� //Implement the identical functionality for filter and not
	/*
		elements: Ԫ�ؼ���
		qualifier: ��������
		keep: ????????
	*/
	function winnow( elements, qualifier, keep ) {
	
		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		qualifier = qualifier || 0;
	
		if ( da.isFunction( qualifier ) ) {												//�������������function
			return da.grep(elements, function( elem, i ) {					//ͨ��da.grep()�����������õ����˺�ĺϸ�Ԫ�ؼ���
				var retVal = !!qualifier.call( elem, i, elem );
				return retVal === keep;
			});
	
		}
		else if ( qualifier.nodeType ) {													//������������ǽڵ�Ԫ�ض���
			return da.grep(elements, function( elem, i ) {
				return (elem === qualifier) === keep;
			});
	
		} 
		else if ( typeof qualifier === "string" ) {								//�������������Sizzleѡ�����ַ���
			var filtered = da.grep(elements, function( elem ) {			//ѡ��Sizzle�ɲ�����Ԫ�ض���
				return elem.nodeType === 1;
			});
	
			if ( daRe_isSimple.test( qualifier ) ) {								//???????????
				return da.filter(qualifier, filtered, !keep);
			}
			else {
				qualifier = da.filter( qualifier, filtered );
			}
		}
	
		return da.grep(elements, function( elem, i ) {
			return ( 0 <= da.isInArray( elem, qualifier ) ) === keep;
		});
	}
	

	da.extend({
		//���˺���
		/*
			expr: ѡ�������ʽ
			elems: Ԫ�ؼ���
			not: �Ƿ�ȡ��(ѡ�������ʽ)
		*/
		filter: function( expr, elems, not ) {
			if ( not ) {							//�����Ҫȡ�������ʽ����ȡ��ǰ׺
				expr = ":not(" + expr + ")";
			}
			
			return elems.length === 1 ?
				da.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
				da.find.matches(expr, elems);
		},

		dir: function( elem, dir, until ) {
			var matched = [],
				cur = elem[ dir ];

			while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !da( cur ).is( until )) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[dir];
			}
			return matched;
		},

		nth: function( cur, result, dir, elem ) {
			result = result || 1;
			var num = 0;

			for ( ; cur; cur = cur[dir] ) {
				if ( cur.nodeType === 1 && ++num === result ) {
					break;
				}
			}

			return cur;
		},

		sibling: function( n, elem ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}

			return r;
		}
	});

	da.fnStruct.extend({
		/**Ԫ��ѡ�������˺���
		*/
		filter: function( selector ) {
			return this.pushStack( winnow(this.dom, selector, true), "filter", selector );
		},
		
		/**Ԫ��ѡ�����жϺ���
		*/
		is: function( selector ) {
			return !!selector && ( typeof selector === "string" ?
				daRe_POS.test( selector ) ?
					da( selector, this.context ).index( this.dom[0] ) >= 0 :
					da.filter( selector, this.dom ).length > 0 :
				this.filter( selector ).length > 0 );
		},
		
		//da�����DOMѡ��������
		/*
			selector: ѡ�����ַ���
		*/
		find: function( selector ) {
			var self = this, i, l;
			
			if ( typeof selector !== "string" ) {													//selector�����ַ���
				return da( selector ).filter(function() {
					for ( i=0, l=self.length; i < l; i++ ) {
						if ( da.contains( self.dom[ i ], this ) ) {
							return true;
						}
					}
					
				});
			}
		
			var ret = this.pushStack( "", "find", selector ),							//selector������ѡ�����ַ���
					len, n, r;
		
			for ( i = 0, l = this.dom.length; i < l; i++ ) {
				len = ret.dom.length;
				da.find( selector, this.dom[i], ret.dom );
	
				if ( i > 0 ) {
					// Make sure that the results are unique
					for ( n = len; n < ret.dom.length; n++ ) {										//��֤ret���ص�Ԫ�ؼ�ÿһ��������Ψһ��
						for ( r = 0; r < len; r++ ) {
							if ( ret.dom[r] === ret.dom[n] ) {
								ret.dom.splice(n--, 1);
								break;
							}
						}
					}
				}
			}
	
			return ret;
		},
		
		// Determine the position of an element within
		// the matched set of elements
		index: function( elem ) {
			// No argument, return index in parent
			if ( !elem ) {
				return ( this.dom[0] && this.dom[0].parentNode ) ? this.prevAll().length : -1;
			}

			// index in selector
			if ( typeof elem === "string" ) {
				return da.inArray( this.dom[0], da( elem ).dom );
			}

			// Locate the position of the desired element
			return da.inArray(
				// If it receives a jQuery object, the first element is used
				elem instanceof da ? elem.dom[0] : elem, this );
		}
	});

	da.each({
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return da.dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return da.dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return da.nth( elem, 2, "nextSibling" );
		},
		prev: function( elem ) {
			return da.nth( elem, 2, "previousSibling" );
		},
		nextAll: function( elem ) {
			return da.dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return da.dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return da.dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return da.dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return da.sibling( elem.parentNode.firstChild, elem );
		},
		children: function( elem ) {
			return da.sibling( elem.firstChild );
		},
		contents: function( elem ) {
			return da.isNodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				da.pushArray( elem.childNodes );
		}
	}, 
	function( name, fn ) {
		da.fnStruct[ name ] = function( until, selector ) {
			var ret = da.map( this.dom, fn, until ),
				// The variable 'args' was introduced in
				// https://github.com/jquery/jquery/commit/52a0238
				// to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
				// http://code.google.com/p/v8/issues/detail?id=1050
				args = [].slice.call(arguments);
	
			if ( !daRe_until.test( name ) ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				ret = da.filter( selector, ret );
			}
	
			ret = this.length > 1 && !guaranteedUnique[ name ] ? da.unique( ret ) : ret;
	
			if ( (this.length > 1 || daRe_multiselector.test( selector )) && daRe_parentsprev.test( name ) ) {
				ret = ret.reverse();
			}
	
			return this.pushStack( ret, name, args.join(",") );
		};
	});

})(da);