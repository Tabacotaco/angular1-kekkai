'use strict';

define(['app'], function(app) {

    /** Data Content 橫向 Scroll Bar 聯動處理
      * For GRID 使用
      */
     app.directive('kekkaiHorizontalScroll', function() {
        return {
            restrict : 'A',
            link     : function(scope, el) {
                angular.element(el).bind('scroll', function() {
                    scope.$kekkaiContainer.doGridScrollSync();
                });
            }
        };
    });
});