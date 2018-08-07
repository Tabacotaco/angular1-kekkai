'use strict';

define(['app'], function(app) {
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-aggregate-collapse.css" />');

    app.directive('kekkaiAggregateCollapse', function($compile) {

        function convert2KeyJSON(aggregates, kekkaiData) {
            var result = {};
    
            aggregates.forEach(function(fieldName) {
                result[fieldName] = kekkaiData[fieldName];
            });
            return JSON.stringify(result);
        };

        function convert2Aggregates(value) {
            if(angular.isString(value))
                return [value];
            else if(angular.isArray(value))
                return value;
    
            throw 'kekkai-aggregate-collapse must be set fieldNames.';
        };

        function getKekkaiContainer(scope) {
            var result;

            for(var $parent = scope.$parent; !result; $parent = $parent.$parent)
                result = $parent.$kekkaiContainer;

            return result;
        }

        return {
            restrict : 'A',
            link     : function(scope, el, attrs) {
                // 1. 判斷是否與 <kekkai-dataview> 綁定在一起使用
                var kekkaiData = scope.$eval(attrs.kekkaiData);

                scope.aggregates = convert2Aggregates(scope.$eval(attrs.kekkaiAggregateCollapse));

                if(Kekkai.data.isEmptyValue(kekkaiData))
                    throw 'kekkai-aggregate-collapse can\'t find the attribute(kekkai-data).';

                // 2. 根據 aggregates 設定, 決定是否產生 Collapse / Expend Button
                var container = getKekkaiContainer(scope),
                    index     = angular.isNumber(scope.$index)? scope.$index : 0,
                    keyJSON   = convert2KeyJSON(scope.aggregates, kekkaiData);

                if(index === 0 || keyJSON !== convert2KeyJSON(
                    scope.aggregates,
                    container.datalist[Math.max(0, Math.min(container.datalist.length, index - 1))]
                )) {
                    var collapseKey = container.doRegisterKekkaiPlugin('AGGREGATES_COLLAPSE', keyJSON);

                    $(el).before($(['<button type="button" class="btn btn-primary ', Kekkai.layout.getAggregateCls(), '" ',
                        'data-toggle="collapse" ',
                        'data-target=".', collapseKey, '">',
                        '<span>', attrs.kekkaiAggregateContent, '</span>',
                    '</button>'].join('')).on('click', function() {
                        var $collapseBtn = $(this);

                        if(!$collapseBtn.hasClass(Kekkai.layout.getCollapsedCls()))
                            $collapseBtn.addClass(Kekkai.layout.getCollapsedCls());
                        else {
                            $collapseBtn.removeClass(Kekkai.layout.getCollapsedCls());
                            container.doGridScrollSync();
                        }
                    }));
                }

                // 3. 將 <kekkai-dataview> 添加 Bootstrap Collapse Class
                $(el).addClass('collapse').addClass('in').addClass(container.getRegisterPluginOpts(
                    'AGGREGATES_COLLAPSE',
                    keyJSON
                ));
            }
        };
    });
});