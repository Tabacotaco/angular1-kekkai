'use strict';

define(['app'], function(app) {

    /** Data Content Scroll Bar 置底事件
      * For CARD / GRID 使用
      */
    app.directive('kekkaiInfiniteScroll', function() {
        var triggerDelay = 500;

        return {
            restrict : 'A',
            link     : function(scope, el, attrs) {
                var timeoutID;

                angular.element(el).bind('scroll', function() {
                    var $content = $(el);

                    if (Math.ceil($content.height() + $content[0].scrollTop) >= $content[0].scrollHeight) {
                        clearTimeout(timeoutID);

                        timeoutID = setTimeout(function() {
                            scope.$eval(attrs.onScrollBottom);
                            clearTimeout(timeoutID);
                        }, triggerDelay);
                    }
                });
            }
        };
    });
});