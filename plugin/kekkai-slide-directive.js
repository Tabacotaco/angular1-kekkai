'use strict';

define(['app'], function(app) {

    app.directive('kekkaiSlide', function() {
		function getClientPosition(e, isMobile, kind) {
			var field = 'client' + kind;

			return isMobile? e.originalEvent.touches[0][field] : e[field];
		};

		return {
			restrict : 'A',
			link     : function(scope, el, attrs) {
				('X' === attrs.kekkaiSlide? ['X'] : 'Y' === attrs.kekkaiSlide? ['Y'] : ['X', 'Y']).forEach(function(procKind) {
					var slideNm  = null,
						cancelFn = function() { slideNm  = null; },
						sliding  = function(clientNm) {
							var distance = clientNm - slideNm;

							if(!Kekkai.data.isEmptyValue(slideNm) && Math.abs(distance) > 5) {
								el.context['X' === procKind? 'scrollLeft' : 'scrollTop'] -= distance;
								slideNm = clientNm;
							}
						};

					$(el.context)
						.on('mouseup'    , cancelFn).on('touchend'    , cancelFn)
						.on('mouseleave' , cancelFn).on('touchcancel' , cancelFn)
						.on('mousedown'  , function(e) { slideNm = getClientPosition(e, false , procKind); })
						.on('touchstart' , function(e) { slideNm = getClientPosition(e, true  , procKind); })
						.on('mousemove'  , function(e) { sliding(getClientPosition(e, false , procKind)); })
						.on('touchmove'  , function(e) { sliding(getClientPosition(e, true  , procKind)); });
				});
			}
		};
	});
});