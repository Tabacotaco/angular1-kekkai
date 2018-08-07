'use strict';

define(['app'], function(app) {

    app.component('kekkaiDataview', {
        transclude   : {
            field    : 'kekkaiField'
        },
        controllerAs : '$kekkaiDataview',
        templateUrl  : 'js/kekkai-common/components/kekkai-dataview/kekkai-dataview.html',
        bindings     : {
            kekkaiData   : '<',
            size         : '<',
            labelWidth   : '<',
            onSelected   : '&',
            onDeselected : '&'
        },
		controller: function(
            $scope,
            $element,
            KekkaiHttpService
        ) {

            // TODO - Properties
            (function($ctrl) {

                // 取得所屬 kekkai Container Controller
                for(var $parent = $scope.$parent; !$ctrl.container; $parent = $parent.$parent)
                    $ctrl.container = $parent.$kekkaiContainer;

                // 判斷資料是否為可編輯狀態
				Object.defineProperty($ctrl, 'isEditable', {get: function() {
					return $ctrl.kekkaiData.$isEditable;
                }});

                // 判斷編輯過之資料是否為可存取
				Object.defineProperty($ctrl, 'isCommitable', {get: function() {
                    return ['GRID', 'CARD'].indexOf($ctrl.container.layoutType) >= 0? ($ctrl.isAllowedCommit === true) : false;
                }});

                // 選取資料
                Object.defineProperty($ctrl, 'isSelected', {
                    get: function() {
                        return $ctrl.container.isDataSelected($ctrl.kekkaiData);
                    },
                    
                    set: function(value) {
                        $ctrl.container.onSwitchSelectedData($ctrl.kekkaiData);

                        $ctrl[value? 'onSelected' : 'onDeselected']({
                            kekkaiData    : $ctrl.kekkaiData,
                            selectedData  : $ctrl.container.selectedData,
                            selectedCount : $ctrl.container.selectedData.length
                        });
                    }
                });

                // 取得 <kekkai-field>
				Object.defineProperty($ctrl, '$fieldEl', {get: function() {
					return  $($element[0]).find(' > div.kekkai-list.grid-content > label.grid-selection + div > div.row > kekkai-field');
                }});

                // 取得 ROW MENU 數量
                Object.defineProperty($ctrl, 'rowMenuCount', {get: function() {
                    return $ctrl.container.todoGroup.getAllowedTodos(
                        'GRID' === $ctrl.container.layoutType? 'ROW_CLICK' : 'ROW_MENU',
                        $ctrl.kekkaiData
                    ).length;
                }});

                // 取得資料選取 CASE
				Object.defineProperty($ctrl, 'selectionCase', {get: function() {
                    return !$ctrl.container.isOnlineEditing && $ctrl.container.todoGroup.getAllowedTodos('SELECTION', $ctrl.kekkaiData).length > 0? 'SELECTION'
                        : $ctrl.kekkaiData.$isEditable && $ctrl.kekkaiData.$isDirty && $ctrl.kekkaiData.$isDataValid? 'EDITING' : 'NONE';
                }});

                // 取得 CARD class
                Object.defineProperty($ctrl, 'cardCls', {get: function() {
                    var sizeCfg = angular.isObject($ctrl.size)? $ctrl.size : {def: 12, sm: 6, md: 4},
                        result  = [];

                    Kekkai.layout.getAllowedSize(Kekkai.layout.getWindowSize()).forEach(function(size) {
                        if(angular.isNumber(sizeCfg[size]) && !isNaN(sizeCfg[size])) result.push([
                            'col-',
                            'def' === size? 'xs' : size,
                            '-',
                            sizeCfg[size]
                        ].join(''));
                    });
                    return result;
                }});
            })(this);

            // TODO - Events
            (function($ctrl) {

                // 點擊資料列事件
                $ctrl.onRowClick = function() {
                    var rowMenus = $ctrl.container.todoGroup.getAllowedTodos('ROW_CLICK', $ctrl.kekkaiData);

                    $('div.kekkai-list.grid-content.dropdown').removeClass('open');

                    if(!$ctrl.container.isOnlineEditing && !$ctrl.container.isSelectionMode) {
                        if(rowMenus.length === 1)
                            rowMenus[0].execute($ctrl.kekkaiData);
                        else if(rowMenus.length > 1) {
                            $('body').addClass(Kekkai.config.dropdownOpeningCls);
                            $($element[0]).find(' > div.kekkai-list.grid-content.dropdown').addClass('open');
                        }
                    }
                };

                // 開啟編輯視窗
                $ctrl.doOpenEditingModal = function() {
                    $('#' + $ctrl.modalID).modal('show');
                };

                // 強制關閉編輯視窗
                $ctrl.doShutdownModal = function() {
                    $('#' + $ctrl.modalID).modal('hide');
                    $('body > div.modal-backdrop.fade.in').remove();
                };
            })(this);

            // TODO - Layout Process
            (function($ctrl) {
                function getSortIndex(fields, fieldName) {
                    return !angular.isArray(fields) || fields.length === 0? -1
                        : !$ctrl.container.isFavouriteVisible? fields.findIndex(function(f) { return f.fieldName === fieldName; })
                            : fields.filter(function(f) { return f.fieldName === fieldName; })[0].getIndex($ctrl.container.layoutMode.toLowerCase());
                }

                // Get <kekkai-field>
                $ctrl.getFieldCellEl = function(fieldName) {
                    return $($element[0]).find(' > div.kekkai-dataview > div.media-body'
                        + ' > div.row > kekkai-field[field-name="' + fieldName + '"] > div.kekkai-column');
                };

                // Close Row Menu
                $ctrl.doCloseRowMenu = function() {
                    $('body').removeClass(Kekkai.config.dropdownOpeningCls);
                    $($element[0]).find(' > div.kekkai-list.grid-content.dropdown').removeClass('open');
                };

                // Register
                $ctrl.doRegisterField = function(fieldCtrl) {
                    $ctrl.fieldCtrl[fieldCtrl.fieldName] = fieldCtrl;
                };

                // Reorder
                $ctrl.doReorderFields = function(fields) {
                    var $fieldEl = $ctrl.$fieldEl,
                        $parent  = $fieldEl.parent();

                    $fieldEl.sort(function(el1, el2) {
                        return getSortIndex(fields, $(el1).attr('field-name'))
                            - getSortIndex(fields, $(el2).attr('field-name'));
                    }).appendTo($parent);
                };

                // Resize
                $ctrl.doResizeField = function(fieldName, orispan, newspan) {
                    $ctrl.$fieldEl
                        .filter('[field-name=' + fieldName + ']')
                        .find(' > div.kekkai-column')
                        .removeClass('col-xs-' + orispan)
                        .addClass('col-xs-' + newspan)
                };
            })(this);

            // TODO - Data Process
            (function($ctrl) {

                // Do Commit
                $ctrl.doCommit = function(editingTodo) {
                    if($ctrl.kekkaiData.$isDirty && $ctrl.kekkaiData.$isDataValid) KekkaiHttpService.do(
                        $ctrl.modalID,
                        editingTodo,
                        $ctrl.kekkaiData.parseJSON()
                    );
                };
            })(this);

            // TODO - Do init
            (function($ctrl, uid) {

                // 建立初始變數
                $.extend($ctrl, {
                    uid             : uid,
                    modalID         : 'modal-' + uid,
                    fieldCtrl       : {},
                    isAllowedCommit : false
                });
            })(this, Kekkai.data.guid());
        }
    });
});