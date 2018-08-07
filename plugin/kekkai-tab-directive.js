'use strict';

define(['app'], function(app) {
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-tab.css" />');

	app.directive('kekkaiTab', function() {
		return {
			restrict : 'A',
			link     : function(scope, el, attr) {
				$(el).attr({
					'data-target': attr.kekkaiTab,
					'data-toggle': 'tab'
				}).on('shown.bs.tab', function() {
					scope.$apply();
				});
			}
		};
	});
});