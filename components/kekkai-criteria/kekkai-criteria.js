'use strict';

define(['app'], function(app) {

    app.directive('kekkaiFilter', function($rootScope) {

        function getKekkaiCriteria(scope) {
            if(!scope.$kekkaiCriteria) {
                var s = scope.$parent;
    
                while(s != $rootScope && !s.$kekkaiCriteria)
                    s = s.$parent;
    
                scope.$kekkaiCriteria = s.$kekkaiCriteria;
            }
            return scope.$kekkaiCriteria;
        };

        return {
            restrict : 'A',
            link     : function(scope, el, attrs) {
                var $kekkaiCriteria = getKekkaiCriteria(scope);

                if(!Kekkai.data.isEmptyValue(attrs.ngModel) && $kekkaiCriteria) $kekkaiCriteria.doRegisterFilter({
                    operator  : attrs.kekkaiFilter,
                    fieldName : attrs.ngModel.substring(attrs.ngModel.lastIndexOf('.') + 1),
                    passed    : scope.$eval(attrs.filterPassed),
                    renameTo  : attrs.filterRenamed
                });
            }
        };
    });

    app.component('kekkaiCriteria', {
        transclude   : true,
        controllerAs : '$kekkaiCriteria',
        templateUrl  : 'js/kekkai-common/components/kekkai-criteria/kekkai-criteria.html',
        bindings     : {
            defaultParams : '&',
            params        : '=',
            onFilterBound : '&'
        },
		controller   : function(
            $element
        ) {

            // TODO - Properties
            (function($ctrl) {

                // 取得 Window Size
                Object.defineProperty($ctrl, 'windowSize', {get: function() {
                    return Kekkai.layout.getWindowSize();
                }});

                // 取得 kekkaiFilter 總數
                Object.defineProperty($ctrl, 'totalFilterCount', {get: function() {
                    return $($element[0]).find('*[kekkai-filter][ng-model]').length;
                }});

                // 取得已註冊 kekkaiFilter 總數
                Object.defineProperty($ctrl, 'registedFilterCount', {get: function() {
                    var result = 0;

                    Object.keys($ctrl.ngModels).forEach(function(operator) {
                        $ctrl.ngModels[operator].forEach(function() {
                            result++;
                        });
                    });
                    return result;
                }});
            })(this);


            // TODO - Events
            (function($ctrl) {
                $ctrl.onSubmit = function() {
                    var filters = [];

                    Object.keys($ctrl.ngModels).forEach(function(operator) {
                        $ctrl.ngModels[operator].forEach(function(opts) {
                            var value = $ctrl.params[opts.fieldName];

                            if(!Kekkai.data.isEmptyValue(value) && value !== opts.passed) filters.push({
                                field    : Kekkai.data.isEmptyValue(opts.renameTo)? opts.fieldName : opts.renameTo,
                                operator : operator,
                                value    : value
                            });
                        });
                    });
                    $ctrl.onFilterBound({filters: filters});
                };

                $ctrl.doRegisterFilter = function(opts) {
                    if(!angular.isArray($ctrl.ngModels[opts.operator]))
                        $ctrl.ngModels[opts.operator] = [];

                    $ctrl.ngModels[opts.operator].push(opts);

                    if($ctrl.registedFilterCount === $ctrl.totalFilterCount)
                        $ctrl.onSubmit();
                };
            })(this);


            // TODO - Do init
            (function($ctrl, uid) {

                // 建立初始變數
                $.extend($ctrl, {
                    isVisible : true,
                    ngModels  : {},
                    params    : $ctrl.defaultParams()
                });
            })(this, Kekkai.data.guid());
        }
    });
});