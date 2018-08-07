'use strict';

define(['app'], function(app) {

    app.directive('kekkaiFixedDropdown', function() {

        function doResetPosition($toggle, $el) {
            if($toggle.length > 0 && $el.length > 0) $el.css({
                top   : ($toggle.offset().top + $toggle.height()) + 'px',
                right : ($(window).width() - $toggle.offset().left - $toggle.width()) + 'px'
            });
        }

        return {
            restrict : 'A',
            link     : function(scope, el, attrs) {
                $(el).parent().on('show.bs.dropdown', function() {
                    doResetPosition($('#' + attrs.kekkaiFixedDropdown), $(el));

                    $('body').addClass(Kekkai.config.dropdownOpeningCls);
                });
            }
        };
    });
});