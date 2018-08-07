'use strict';

define(['app'], function(app) {
    var editingField = null;

    function getKekkaiField($root, scope) {
        if(!scope.$kekkaiField) {
            var s = scope.$parent;

            while(s != $root && !s.$kekkaiField)
                s = s.$parent;

            scope.$kekkaiField = s.$kekkaiField;
        }
        return scope.$kekkaiField;
    };


    // Auto Focus
    app.directive('kekkaiAutoFocus', function($rootScope) {
        var timeoutID;

        return {
            restrict : 'A',
            link     : function(scope, el) {
                timeoutID = setTimeout(function() {
                    var $target = $(el).parents('kekkai-dataview > div.kekkai-list > label.grid-selection + div > div.row');

                    $(el).find('input:visible, select:visible').focus();

                    if($target.length) getKekkaiField($rootScope, scope).container.doGridScrollSync(
                        $target[0].scrollLeft
                    );
                    clearTimeout(timeoutID);
                });
            }
        };
    });


    // Kekkai Field
    app.component('kekkaiField', {
        transclude    : {
            display   : '?kekkaiDisplay',
            editor    : '?kekkaiEditor'
        },
        controllerAs  : '$kekkaiField',
        templateUrl   : 'js/kekkai-common/components/kekkai-field/kekkai-field.html',
        bindings      : {
            fieldName : '@'
        },
		controller    : function(
            $scope,
            $element,
            $transclude
        ) {

            // TODO - Properties
            (function($ctrl) {
                var layoutType = $($element.context).parent().attr('layout-type'),
                    layoutMode = $($element.context).parent().attr('layout-mode');

                // 取得所屬 Kekkai-Dataview Controller
                for(var $parent = $scope.$parent; !$ctrl.dataview; $parent = $parent.$parent)
                    $ctrl.dataview = $parent.$kekkaiDataview;

                // 取得所屬 Kekkai-Container Controller
				Object.defineProperty($ctrl, 'container', {get: function() {
					return $ctrl.dataview.container;
                }});
                
                // 取得 Layout Type 設定
                Object.defineProperty($ctrl, 'layoutType', {get: function() {
                    return Kekkai.data.isEmptyValue(layoutType)? $ctrl.container.layoutType : layoutType;
                }});
                
                // 取得 Layout Mode 設定
                Object.defineProperty($ctrl, 'layoutMode', {get: function() {
                    return Kekkai.data.isEmptyValue(layoutMode)? $ctrl.container.layoutMode : layoutMode;
                }});
                
                // 取得 Field 設定
                Object.defineProperty($ctrl, 'field', {get: function() {
                    return $ctrl.dataview.kekkaiData.getField($ctrl.fieldName);
                }});

                // 取得 Form Label 寬度
                Object.defineProperty($ctrl, 'labelWidth', {get: function() {
                    return Kekkai.data.isEmptyValue($ctrl.dataview.labelWidth)? 120 : $ctrl.dataview.labelWidth;
                }});

                // 取得資料對齊設定 Class
                Object.defineProperty($ctrl, 'textalignCls', {get: function() {
                    return 'kekkai-textalign-' + $ctrl.field.getTextalign($ctrl.layoutMode.toLowerCase());
                }});

                // 取得資料驗證錯誤訊息
                Object.defineProperty($ctrl, 'errorMsg', {get: function() {
                    var validRes = $ctrl.field.getValid($ctrl.dataview.kekkaiData[$ctrl.fieldName], $ctrl.dataview.kekkaiData);

                    return validRes === false? 'KEKKAI_MSG_INVALID_TIP' : angular.isString(validRes)? validRes : null;
                }});

                Object.defineProperty($ctrl, 'contentCase', {get: function() {
                    if($ctrl.isEditable && $ctrl.container.isOnlineEditing === $ctrl.isOnlineEditing && $transclude.isSlotFilled('editor'))
                        return 'EDITOR';
                    if(Kekkai.data.isEmptyValue($ctrl.dataview.kekkaiData) || Kekkai.data.isEmptyValue($ctrl.dataview.kekkaiData[$ctrl.fieldName]))
                        return 'EMPTY';
                    if($transclude.isSlotFilled('display'))
                        return 'DISPLAY';

                    return $ctrl.field.isDateType? 'DEFAULT_FORMAT' : 'DEFAULT';
                }});

                // 判斷輸入資料是否正確
                Object.defineProperty($ctrl, 'isValueValid', {get: function() {
                    return $ctrl.errorMsg === null;
                }});

                // 判斷欄位是否可允許編輯
                Object.defineProperty($ctrl, 'isEditable', {get: function() {
                    return $ctrl.dataview.isEditable && $ctrl.field.isEditable($ctrl.dataview.kekkaiData);
                }});

                // 判斷是否需要顯示 Required Mark
                Object.defineProperty($ctrl, 'isRequiredVisible', {get: function() {
                    return 'EDITOR' === $ctrl.contentCase && $ctrl.field.isRequired;
                }});

                // 判斷資料欄位是否 Text Overflow
                Object.defineProperty($ctrl, 'isValueOverlow', {get: function() {
                    var $cell = $($element.context).find(
                        'GRID' === $ctrl.layoutType? ' > div.kekkai-column > div > ng-container'
                            : ' > div.kekkai-column > fieldset > div > ng-container'
                    );
                    return $cell.length === 0? false : $cell[0].scrollWidth > $cell.innerWidth();
                }});
            })(this);

            // TODO - Events
            (function($ctrl) {

                // 初始化時, 須將 Kekkai.data.Field 回寫至 Kekkai Container 內進行註冊
                $ctrl.onInit = function() {
                    $ctrl.container.setKekkaiField($ctrl.field);
                };

                // 編輯欄位 Focus 事件
                $ctrl.onNgModelChange = function() {
                    
                };

                // 切換欄位編輯 / 顯示模式 (for Grid)
                $ctrl.onSwitchEditingMode = function(turnOn, e) {
                    if($ctrl.container.isOnlineEditing && $ctrl.isEditable) {
                        $ctrl.isOnlineEditing = turnOn;

                        if($ctrl.isOnlineEditing) {
                            if(editingField !== null)
                                editingField.onSwitchEditingMode(false);

                            editingField = $ctrl;
                            $('body').addClass(Kekkai.config.onlineEditingCls);
                        } else if(!$ctrl.isOnlineEditing)
                            editingField = null;

                        if(!Kekkai.data.isEmptyValue(e)) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        $('.kekkai-invalid-popover').remove();
                    }
                };

                // 快捷鍵 TAB 跳至上一個 / 下一個編輯欄位
                $ctrl.onEditOtherField = function(e) {
                    if('Tab' === e.key && ['GRID', 'CARD'].indexOf($ctrl.layoutType) >= 0) {
                        var targetHtml   = 'GRID' === $ctrl.layoutType? 'div.grid-group' : 'fieldset',
                            $editors     = $('#' + $ctrl.container.containerID).find('kekkai-field > div.kekkai-column > ' + targetHtml + ':not(.kekkai-uneditable):visible'),
                            currentIndex = $editors.index($($element[0]).find(' > div.kekkai-column > ' + targetHtml));

                        angular.element($editors
                            .eq((currentIndex + $editors.length + (e.shiftKey? -1 : 1)) % $editors.length)
                            .parents('div.kekkai-column')[0]
                        ).scope().$kekkaiField.onSwitchEditingMode(true);

                        e.preventDefault();
                        e.stopPropagation();

                        if($(e.target).is('[ng-blur]'))
                            angular.element(e.target).scope().$eval($(e.target).attr('ng-blur'));
                    }
                };
            })(this);

            // TODO - Layout Process
            (function($ctrl) {

                // 取得轉換後的 Grid Column Class
                $ctrl.generateColumnCls = function() {
                    return [$ctrl.textalignCls].concat(Kekkai.layout.generateColumnCls(
                        $ctrl.layoutMode.toLowerCase(),
                        $ctrl.layoutType,
                        $ctrl.field
                    ));
                };
            })(this);

            // TODO - Do init
            (function($ctrl, uid) {

                // 建立初始變數
                $.extend($ctrl, {
                    tooltipID        : 'tooltip-' + uid,
                    isOnlineEditing  : false,
                    isDisplayDefined : false,
                    isEditorDefined  : false
                });

                $ctrl.dataview.doRegisterField($ctrl);
            })(this, Kekkai.data.guid());
        }
    });
});