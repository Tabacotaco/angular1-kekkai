'use strict';

define(['app'], function(app) {
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-invalid-tip.css" />');

    app.directive('kekkaiInvalidTip', function($translate) {
        return {
            restrict : 'A',
            scope    : {kekkaiField: '=kekkaiInvalidTip'},
			link     : function(scope, el, attrs) {
                $(el).popover({
                    html      : true,
                    placement : 'top',
					container : 'body',
                    trigger   : 'manual',
                    content   : function() { return '<span class="glyphicon glyphicon-exclamation-sign"></span> ' + $translate.instant(scope.kekkaiField.errorMsg); }
                }).on('shown.bs.popover', function() {
                    $('#' + $(el).attr('aria-describedby')).addClass('kekkai-invalid-popover');
                }).on('click', function() {
                    $(el).popover(scope.kekkaiField.isValueValid? 'hide' : 'show');
                }).on('keyup', function() {
                    $(el).popover(scope.kekkaiField.isValueValid? 'hide' : 'show');
                }).on('mouseenter', function() {
                    $(el).popover(scope.kekkaiField.isValueValid? 'hide' : 'show');
                }).on('mouseleave', function() {
                    $(el).popover('hide');
                });
            }
        };
    });
});