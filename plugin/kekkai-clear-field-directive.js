'use strict';

define(['app'], function(app) {
    $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-clear-field.css" />');

    app.directive('kekkaiClearField', function($compile) {
    	function getCompileBtn(scope) {
    		var $btn = $([
	            '<button type="button" class="close kekkai-clear-btn" ng-click="value = null">',
	                '<span aria-hidden="true">&times;</span>',
	            '</button>'
	        ].join(''));

    		$compile($btn)(scope);
    		return $btn
    	}

        return {
            restrict : 'A',
            scope    : {value: '=ngModel'},
            link     : function(scope, el) {
                var $target = $(el);

                if($target.is('input[type=text]') || $target.is('input[type=number]') || $target.is('textarea')) $target.appendTo($(
                    '<div class="kekkai-clear-field"></div>'
                ).appendTo($target.parent()).append(getCompileBtn(scope)));
            }
        };
    });
});