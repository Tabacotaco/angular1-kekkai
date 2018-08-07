'use strict';

define(['app'], function(app) {
    $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-container.css" />');
    $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-card-stack.css" />');
    $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-form-panel.css" />');
    $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-grid-list.css" />');

    var isMobile = (function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    })();

    function getField($ctrl, fieldName) {
        return $ctrl.fields().filter(function(f) {
            return f.fieldName === fieldName;
        })[0];
    };


    app.component('kekkaiContainer', {
        transclude   : {
            dataview : 'kekkaiDataview'
        },
        controllerAs : '$kekkaiContainer',
        templateUrl  : 'js/kekkai-common/components/kekkai-container/kekkai-container.html',
        bindings     : {
            readUrl       : '&', // 查詢 URL
            readData      : '<', // 指定呈現資料, 若需透過指定資料的方式, 則不可設置 readUrl 參數
            exportUrl     : '&', // 匯出 URL
            exportName    : '@', // 匯出檔案名稱
            layoutMode    : '@', // 資料呈現模式, REDUCE(精簡) / COMPLETE(完整)
            layoutType    : '@', // 資料框架樣式, CARD(卡片) / GRID(條列) / FORM(無邊框)
            favouriteCode : '@', // 指定我的最愛欄位樣板代碼
            allcheckable  : '<', // 是否可全選 (Default: true)
            allpagable    : '<', // 支援不分頁呈現 (Default: true)
            autoFocusable : '<', // 查詢後是否自動 Focus
            fields        : '&', // 資料定義 Schema
            operations    : '<', // 資料動作
            filter        : '=', // 查詢條件
            sort          : '=', // 資料排序設定
            onFilter      : '&', // Event - 查詢條件變更時
            onSort        : '&', // Event - 排序設定變更時
            onDatabound   : '&'  // Event - 取得資料時觸發
        },
		controller: function(
            $translate,
            KekkaiHttpService,
            KekkaiMessage
        ) {
            var isFavouriteOverride = false,
                dataJSON            = [];

            // TODO - Properties
            (function($ctrl) {

                // 判斷是否需要全選
				Object.defineProperty($ctrl, 'isAllSelectable', {get: function() {
					return $ctrl.allcheckable !== false && $ctrl.todoGroup.getAllowedTodos('SELECTION', $ctrl.datalist).length > 0;
				}});

                // 判斷是否為選取模式
				Object.defineProperty($ctrl, 'isSelectionMode', {get: function() {
					return $ctrl.selectedData.length > 0;
				}});

                // 判斷是否為透過 Request 取得資料的類型
				Object.defineProperty($ctrl, 'isRequestCase', {get: function() {
					return !Kekkai.data.isEmptyValue($ctrl.readUrl());
                }});

                // 判斷是否需要套用我的最愛樣板
				Object.defineProperty($ctrl, 'isFavourite', {get: function() {
                    return !Kekkai.data.isEmptyValue($ctrl.favouriteCode) && 'GRID' === $ctrl.layoutType;
				}});

                // 判斷是否需要套用我的最愛樣板
				Object.defineProperty($ctrl, 'isFavouriteVisible', {get: function() {
                    return $ctrl.isFavourite && 'def' !== $ctrl.windowSize;
				}});
                
                // 判斷是否需要分頁 Tool
				Object.defineProperty($ctrl, 'isPagable', {get: function() {
                    return 'GRID' === $ctrl.layoutType || ('FORM' === $ctrl.layoutType &&  $ctrl.pager.total > $ctrl.pager.pageSize);
                }});

                // 判斷查詢後是否需要自動 Focus
                Object.defineProperty($ctrl, 'isAutoFocus', {get: function() {
                    return $ctrl.autoFocusable === true;
                }});

                // 判斷是否為 Online Editing 模式
                Object.defineProperty($ctrl, 'isOnlineEditing', {get: function() {
                    return $ctrl.todoGroup.editingTodo !== null
                        && Kekkai.config.onlineEditingMode.indexOf($ctrl.todoGroup.editingTodo.mode) >= 0;
                }});

                // 判斷 Navbar 是否需要顯示
				Object.defineProperty($ctrl, 'isNavbarVisible', {get: function() {
                    return $ctrl.isFavouriteVisible || ($ctrl.todoGroup.getAllowedTodos('TOOLBAR', $ctrl.datalist).length
                        + $ctrl.todoGroup.getAllowedTodos('SELECTION', $ctrl.datalist).length) > 0;
                }});

                // 判斷是否需要建立編輯視窗
                Object.defineProperty($ctrl, 'isEditModalVisible', {get: function() {
                    return Kekkai.config.modalEditingMode.filter(function(mode) {
                        return $ctrl.todoGroup.isSpecifyModeExists(mode);
                    }).length > 0;
                }});

                // 判斷 Online 編輯是否可進行 Commit
                Object.defineProperty($ctrl, 'isOnlineCommitable', {get: function() {
                    return $ctrl.dataviewCtrl.filter(function(dataviewCtrl) { return dataviewCtrl.isCommitable; }).length > 0;
                }});

                // 判斷 Grid 底部 Scroll Bar 是否出現
                Object.defineProperty($ctrl, 'isBottomScrollVisible', {get: function() {
                    var headerEl = $ctrl.$headerRowEl[0];

                    return 'GRID' === $ctrl.layoutType && !$ctrl.isMobile && $ctrl.$headerRowEl.length > 0
                        && $(headerEl).width() < headerEl.scrollWidth;
                }});

                // 判斷是否具有匯出 Excel 之功能
				Object.defineProperty($ctrl, 'isExportable', {get: function() {
                    try {
                        var exportUrl = $ctrl.exportUrl();
    
                        return kendo && 'FORM' !== $ctrl.layoutType && angular.isString(exportUrl)
                            && exportUrl.length > 0 && $ctrl.pager.total > 0;
                    } catch (e) {
                        return false;
                    }
				}});

                // 判斷是否已全選
				Object.defineProperty($ctrl, 'isAllSelected', {
                    get: function() {
                        return $ctrl.datalist.length > 0 && $ctrl.selectedData.length === $ctrl.datalist.filter(function(kekkaiData) {
                            return $ctrl.todoGroup.getAllowedTodos('SELECTION', kekkaiData).length > 0;
                        }).length;
                    },

                    set: function(value) {
                        $ctrl.selectedData = [].concat(value? $ctrl.datalist.filter(function(kekkaiData) {
                            return $ctrl.todoGroup.getAllowedTodos('SELECTION', kekkaiData).length > 0;
                        }) : []);
                    }
                });

                // 取得 Header 內的 Field
				Object.defineProperty($ctrl, '$headerFieldEl', {get: function() {
                    return $('#' + $ctrl.containerID +
                        ' > div.kekkai-grid-header > ng-transclude > kekkai-dataview' +
                        ' > div.kekkai-list > label.grid-selection + div > div.row > kekkai-field'
                    );
                }});

                Object.defineProperty($ctrl, '$headerRowEl', {get: function() {
                    return $('#' + $ctrl.headerID);
                }});

                // 取得 <kekkai-dataview>
				Object.defineProperty($ctrl, 'dataviewCtrl', {get: function() {
                    var result = [];

                    $('#' + $ctrl.containerID + ' > div.kekkai-content > ng-transclude > kekkai-dataview').each(function(i, el) {
                        result.push(angular.element(el).scope().$$childTail.$kekkaiDataview);
                    });
                    return result;
                }});

                // 取得 Window Size
                Object.defineProperty($ctrl, 'windowSize', {get: function() {
                    return Kekkai.layout.getWindowSize();
                }});

                // 轉出 Grid Content Bottom Scroll 的長度
                Object.defineProperty($ctrl, 'bottomScrollWidth', {get: function() {
                    return $ctrl.$headerRowEl[0].scrollWidth + ($ctrl.isFavourite? 0 : 17);
                }});

                // 取得 Header 排序方式
                Object.defineProperty($ctrl, 'headerOrderBy', {get: function() {
                    return 'def' === Kekkai.layout.getWindowSize()? null : [
                        '+',
                        $ctrl.layoutMode.toLowerCase(),
                        'Index'
                    ].join('');
                }});

                // 取得當前使用者所套用的版面設定名稱
                Object.defineProperty($ctrl, 'favouriteLayout', {get: function() {
                    return !Kekkai.data.isEmptyValue($ctrl.favourite)? $ctrl.favourite : {
                        uid  : 'KEKKAI_DEF_FAVOURITE',
                        desc : 'KEKKAI_DEF_FAVOURITE'
                    };
                }});

                // 取得 Alert Provider
                Object.defineProperty($ctrl, 'kekkaiMSG', {get: function() {
                    return KekkaiMessage;
                }});

                // 取得 HTTP Provider
                Object.defineProperty($ctrl, 'kekkaiHTTP', {get: function() {
                    return KekkaiHttpService;
                }});

                // 取得匯出檔名
                Object.defineProperty($ctrl, 'kekkaiExportName', {get: function() {
                    return angular.isString($ctrl.exportName) && $ctrl.exportName.length > 0? $ctrl.exportName : Kekkai.data.guid();
                }});
                
                // 取得資料批次筆數
                Object.defineProperty($ctrl, 'kekkaiPageSize', {get: function() {
                    if(!$ctrl.isRequestCase)
                        return Kekkai.config.allPageSize;
                    else switch($ctrl.layoutType) {
                        case 'FORM' : return 1;
                        case 'CARD' : return Kekkai.config.allPageSize;
                        default     : return 25;
                    }
                }});
            })(this);

            // TODO - Events
            (function($ctrl) {

                // 畫面大小改變時, 需自動重整 Layout
                (function(resizeFn) {
                    $(window).on('resize', resizeFn);

                    $ctrl.$onDestroy = function() {
                        $(window).off('resize', resizeFn)
                    };
                })(function() {
                    var $container = $('#' + $ctrl.containerID);

                    if($container.length > 0)
                        angular.element($container[0]).scope().$apply();
                });

                // Generate KekkaiFilter setter / getter
                (function(filter) {
                    var _filter = Array.isArray(filter)? filter : [];
    
                    Object.defineProperty($ctrl, 'kekkaiFilter', {get: function() {
                        return JSON.parse(JSON.stringify(_filter));
                    }});

                    Object.defineProperty($ctrl, 'filter', {set: function(value) {
                        _filter = Array.isArray(value)? value : [];

                        if('GRID' !== $ctrl.layoutType || isFavouriteOverride === true)
                            $ctrl.doRead(false, $ctrl.isAutoFocus);
                    }});
                })($ctrl.filter);

                // Generate KekkaiSort setter / getter
                (function(sort) {
                    var _sort = Array.isArray(sort)? sort : [];

                    Object.defineProperty($ctrl, 'kekkaiSort', {get: function() {
                        return JSON.parse(JSON.stringify(_sort));
                    }});

                    Object.defineProperty($ctrl, 'sort', {set: function(value) {
                        _sort = Array.isArray(value)? value : [];
    
                        if('GRID' !== $ctrl.layoutType || isFavouriteOverride === true)
                            $ctrl.doRead(false, $ctrl.isAutoFocus);
                    }});

                    // 依欄位名稱取得排序設定
                    $ctrl.getSort = function(fieldName) {
                        var sort = _sort.filter(
                            function(sort) { return sort.field === fieldName; }
                        );
                        return sort.length === 0? null : sort[0];
                    };

                    // 重新排序
                    $ctrl.onSorting = function(field) {
                        if($ctrl.isOnlineEditing) return;
                        var sort =  $ctrl.getSort(field.fieldName);
    
                        if(sort === null)
                            _sort.push({field: field.fieldName, dir: 'asc'});
                        else if('asc' === sort.dir)
                            sort.dir = 'desc';
                        else
                            _sort.splice(_sort.indexOf(sort), 1);
    
                        $ctrl.doRead(false, true);
                    };
                })($ctrl.sort);

                // 選取資料
                $ctrl.onSwitchSelectedData = function(kekkaiData) {
                    if($ctrl.isDataSelected(kekkaiData))
                        $ctrl.selectedData.splice($ctrl.selectedData.indexOf(kekkaiData), 1);
                    else if($ctrl.todoGroup.getAllowedTodos('SELECTION', kekkaiData).length > 0)
                        $ctrl.selectedData.push(kekkaiData);
                };

                // Pager 變更
                $ctrl.onPagerChange = function($type) {
                    var isReadAll = $ctrl.pager.pageSize === Kekkai.config.allPageSize;

                    if('PAGE_SIZE' === $type && isReadAll) {
                        $ctrl.datalist     = [];
                        $ctrl.selectedData = [];
                    }
                    $ctrl.doRead(isReadAll, true);
                };

                // 重新查詢資料
                $ctrl.onRefresh = function(isAllPage) {
                    if(!isAllPage)
                        $ctrl.doRead(false, true);
                    else {
                        $ctrl.datalist     = [];
                        $ctrl.selectedData = [];
                        
                        if($ctrl.pager.page === 1)
                            $ctrl.doRead(false, true);
                        else
                            $ctrl.pager.page = 1;
                    }
                };

                // 匯出 Excel
                $ctrl.onExport = function() {
                    if(kendo) KekkaiHttpService.doRead($ctrl.containerID, $ctrl.readUrl(), {
                        page     : 1,
                        pageSize : $ctrl.pager.total,
                        skip     : 0,
                        take     : $ctrl.pager.total,
                        sort     : $ctrl.kekkaiSort,
                        filter   : {logic: 'and', filters: $ctrl.kekkaiFilter}
                    }, function(responseJSON) {
                        var datalist = responseJSON.data,
                            basicW   = Math.round($('#' + $ctrl.containerID).width() / 12),
                            columns  = [];

                        if(datalist.length > 0) Object.keys(datalist[0]).forEach(function(fieldName) {
                            var field = getField($ctrl, fieldName);

                            if(field && field.getColspan($ctrl.layoutMode.toLowerCase(), $ctrl.layoutType) > 0) columns.push({
                                header : $translate.instant(field.label),
                                field  : field.fieldName,
                                width  : basicW * field.getColspan($ctrl.layoutMode.toLowerCase(), $ctrl.layoutType)
                            });
                        });

                        $('<div></div>').kendoGrid({
                            columns    : columns,
                            dataSource : datalist,
                            excel      : {fileName: $ctrl.kekkaiExportName}
                        }).data('kendoGrid').saveAsExcel();
                    });
                };
            })(this);

            // TODO - Layout Process
            (function($ctrl) {
                var aggregatesReg = {};

                // 以資料取得對應 Kekkai Dataview Controller
                $ctrl.getDataviewCtrl = function(kekkaiData) {
                    return $ctrl.dataviewCtrl.filter(function(dataviewCtrl) {
                        return dataviewCtrl.kekkaiData === kekkaiData;
                    })[0];
                };

                // 取得已註冊 Data Content 外掛資訊
                $ctrl.getRegisterPluginOpts = function(kind, opts) {
                    switch(kind) {
                    case 'AGGREGATES_COLLAPSE':
                        return Kekkai.data.isEmptyValue(aggregatesReg[opts])? null : aggregatesReg[opts];
                    default: throw 'Unsupported Kekkai Plugin: ' + kind;
                    }
                };

                // 取得轉換後的 Grid Header Class
                $ctrl.generateHeaderCls = function(field) {
                    var result = Kekkai.layout.generateColumnCls($ctrl.layoutMode.toLowerCase(), $ctrl.layoutType, field),
                        sort   = $ctrl.getSort(field.fieldName);

                    if(sort !== null)
                        result.push('kekkai-sort-' + sort.dir);

                    return result;
                };

                // 移除 Data Content 內的外掛
                $ctrl.doRemoveKekkaiPlugin = function() {
                    // 1. 移除 kekkai-aggregate-collapse
                    if($ctrl.pager.pageSize !== Kekkai.config.allPageSize)
                        $('#' + $ctrl.containerID + ' > div.kekkai-content > ng-transclude > button.' + Kekkai.layout.getAggregateCls()).remove();

                    // 2. 移除 kekkai-invalid-popover
                    $('div.kekkai-invalid-popover').remove();
                };

                // 讓 Header / Content / Bottom Scroll 同步
                $ctrl.doGridScrollSync = function(scrollLeft) {
                    var $bottomScroll = $('#' + $ctrl.containerID).find(' > div.bottom-scroll[kekkai-horizontal-scroll]');

                    if($bottomScroll.length > 0) {
                        $bottomScroll[0].scrollLeft = Kekkai.data.isEmptyValue(scrollLeft)? $bottomScroll[0].scrollLeft : scrollLeft;
    
                        $('#' + $ctrl.containerID).find(
                            ' > div.kekkai-grid-header,  > div.kekkai-content > ng-transclude > kekkai-dataview > div.kekkai-list'
                        ).each(function(i, contentEl) {
                            $(contentEl).find(' > label.grid-selection + div > div.row')[0].scrollLeft = $bottomScroll[0].scrollLeft;
                        });
                    }
                };

                // 註冊 Data Content 外掛
                $ctrl.doRegisterKekkaiPlugin = function(kind, opts) {
                    switch(kind) {
                    case 'AGGREGATES_COLLAPSE':
                        if(!(opts in aggregatesReg))
                            aggregatesReg[opts] = Kekkai.data.guid();

                        return aggregatesReg[opts];
                    default: throw 'Unsupported Kekkai Plugin: ' + kind;
                    }
                };
            })(this);

            // TODO - Favourite Process
            (function($ctrl) {
                var defaultSort = JSON.parse(JSON.stringify($ctrl.kekkaiSort));

                function getFavouriteField(fieldName) {
                    return Kekkai.data.isEmptyValue($ctrl.favourite)? null
                        : $ctrl.favourite.fields.filter(function(f) { return f.fieldName === fieldName; })[0];
                };

                // Override Favourite Fields
                function doFavouriteOverride() {
                    var defaultFields = $ctrl.fields(),
                        favouriteSort = [],
                        isDefaultCase = Kekkai.data.isEmptyValue($ctrl.favourite);

                    $ctrl.virtuals.forEach(function(field, i) {
                        var favouriteField = isDefaultCase? defaultFields.filter(function(f) { return f.fieldName === field.fieldName; })[0]
                            : getFavouriteField(field.fieldName);

                        field.doOverride(isDefaultCase, $ctrl.layoutMode.toLowerCase(), i, favouriteField);

                        if(!isDefaultCase && favouriteField.sortIndex >= 0) favouriteSort[favouriteField.sortIndex] = {
                            field : field.fieldName,
                            dir   : favouriteField.sortDir
                        };
                    });
                    $ctrl.pager.setPageSize(isDefaultCase? 25 : $ctrl.favourite.pageSize);
                    $ctrl.sort          = JSON.parse(JSON.stringify(isDefaultCase? defaultSort : favouriteSort));
                    isFavouriteOverride = true;

                    $ctrl.doRead($ctrl.pager.pageSize === Kekkai.config.allPageSize, $ctrl.isAutoFocus);
                };

                // 切換欄位顯示 / 隱藏
                $ctrl.doSwitchFieldVisible = function(e, field) {
                    field.setTempVisible($ctrl.layoutMode.toLowerCase(), !field.getTempVisible($ctrl.layoutMode.toLowerCase()));

                    e.stopPropagation();
                };

                // Header 初始化
                $ctrl.doHeaderInit = function() {
                    if(!$ctrl.isFavourite) return;

                    var $content  = $('#' + $ctrl.headerID),
                        $header   = $('#' + $ctrl.headerID + ' > div.kekkai-column'),
                        widthSize = {px: null, scale: null};

                    // 注入 Header Column 拖曳排序之功能
                    $content.sortable({
                        container : $ctrl,
                        disabled  : 'def' === Kekkai.layout.getWindowSize(),
                        stop      : function(e, ui) {
                            $('#' + $ctrl.headerID + ' > div.kekkai-column').each(function(i, headerEl) {
                                getField($ctrl, $(headerEl).attr('data-field-name')).setIndex($ctrl.layoutMode.toLowerCase(), i);
                            });
                            $ctrl.dataviewCtrl.forEach(function(ctrl) { ctrl.doReorderFields($ctrl.virtuals); });
                            $ctrl.doGridScrollSync();
                        }
                    });

                    // 注入 Header Column 調整欄寬之功能
                    $header.resizable({
                        handles  : 'e',
                        minWidth : 60,
                        disabled : 'def' === Kekkai.layout.getWindowSize(),
                        start    : function(e, ui) {
                            widthSize = {px: ui.element.width(), scale: null};
                            $content.sortable('disable');

                            for(var i = 1; i <= 12; i++) if(ui.element.hasClass('col-xs-' + i))
                                widthSize.scale = i;
                        },
                        stop     : function(e, ui) {
                            var field   = getField($ctrl, ui.element.attr('data-field-name')),
                                basic   = widthSize.px / widthSize.scale,
                                span    = Math.min(12, Math.max(1, Math.round(ui.element.width() / basic))),
                                $scroll = $('#' + $ctrl.containerID).find(' > div[kekkai-horizontal-scroll]');

                            ui.element
                                .attr('style', '')
                                .removeClass('col-xs-' + widthSize.scale)
                                .addClass('col-xs-' + span)

                            field.setNewspan($ctrl.layoutType, $ctrl.layoutMode.toLowerCase(), span);
                            $content.sortable('enable');

                            $ctrl.dataviewCtrl.forEach(function(ctrl) {
                                ctrl.doResizeField(field.fieldName, widthSize.scale, span);
                            });

                            if($scroll.length > 0) angular.element($scroll[0]).scope().$apply();
                        }
                    });
                };

                // 讓 KekkaiField Component 用來回寫 Field 設定
                $ctrl.setKekkaiField = function(field) {
                    if('GRID' === $ctrl.layoutType) {
                        if($ctrl.virtuals.findIndex(function(f) { return f.fieldName === field.fieldName; }) < 0) {
                            field.setIndex($ctrl.layoutMode.toLowerCase(), $ctrl.virtuals.length);
                            $ctrl.virtuals.push(field);
                        }

                        if($ctrl.$headerFieldEl.length === $ctrl.virtuals.length)
                            $ctrl.doGetFavourites();
                    }
                };

                // 取得我的最愛設定選項
                $ctrl.doGetFavourites = function() {
                    ('GRID' !== $ctrl.layoutType || Kekkai.data.isEmptyValue($ctrl.favouriteCode))? doFavouriteOverride()
                        : KekkaiHttpService.getFavourites($ctrl.containerID, $ctrl.favouriteCode, function(responseJSON) {
                            $ctrl.favourite  = responseJSON.data.applyOption;
                            $ctrl.favourites = responseJSON.data.descList;

                            doFavouriteOverride();
                        });
                };

                // 儲存當前版面設定
                $ctrl.doSaveFavourite = function() {
                    KekkaiMessage.prompt('KEKKAI_SAVE_FAVOURITE', 'KEKKAI_FAVOURITE_CONTENT', [{
                        label: 'KEKKAI_FAVOURITE_LABEL',
                        input: {type: 'text', name: 'desc', placeholder: 'KEKKAI_TEXT_PLACEHOLDER'}
                    }], function(btn, values) {
                        if(btn !== true) return;
                        var option = {desc: values.desc, pageSize: $ctrl.pager.pageSize, fields: []};

                        $ctrl.virtuals.forEach(function(field) {
                            var colspan   = field[$ctrl.layoutMode.toLowerCase() + 'Colspan'],
                                sortIndex = $ctrl.kekkaiSort.findIndex(function(sort) { return sort.field === field.fieldName; });

                            option.fields.push({
                                fieldName : field.fieldName,
                                visible   : field.getTempVisible($ctrl.layoutMode.toLowerCase()),
                                spanDef   : colspan.def === false? 0 : colspan.def,
                                spanSm    : colspan.sm  === false? 0 : colspan.sm,
                                spanMd    : colspan.md  === false? 0 : colspan.md,
                                spanLg    : colspan.lg  === false? 0 : colspan.lg,
                                colIndex  : field.getIndex($ctrl.layoutMode.toLowerCase()),
                                sortIndex : sortIndex,
                                sortDir   : sortIndex < 0? null : $ctrl.kekkaiSort[sortIndex].dir
                            });
                        });

                        KekkaiHttpService.addFavourite($ctrl.containerID, $ctrl.favouriteCode, option, function(responseJSON) {
                            if(responseJSON.data === true)
                                $ctrl.doGetFavourites();
                        });
                    });
                };

                // 切換版面設定
                $ctrl.doSwitchFavourite = function(favouriteUID) {
                    KekkaiHttpService.switchFavourite($ctrl.containerID, $ctrl.favouriteCode, favouriteUID, function(responseJSON) {
                        $ctrl.favourite = 'KEKKAI_DEF_FAVOURITE' === favouriteUID ? null : responseJSON.data;

                        doFavouriteOverride();
                    });
                };

                // 移除版面設定
                $ctrl.doRemoveFavourite = function(e, favouriteUID) {
                    e.preventDefault();
                    e.stopPropagation();

                    KekkaiMessage.confirm(
                        $translate.instant('KEKKAI_MSG_SUBMIT_CONFIRM', {actionName: $translate.instant('KEKKAI_REMOVE_FAVOURITE')}),
                        $translate.instant('KEKKAI_MSG_SUBMIT_CONTENT_1', {actionName: $translate.instant('KEKKAI_REMOVE_FAVOURITE')}),
                        function(btn) {
                            if(btn !== true) return;

                            KekkaiHttpService.removeFavourite($ctrl.containerID, $ctrl.favouriteCode, favouriteUID, function(responseJSON) {
                                $ctrl.doGetFavourites();
                            });
                        }
                    );
                };
            })(this);

            // TODO - Data Process
            (function($ctrl) {

                // 判斷資料是否被選取
                $ctrl.isDataSelected = function(kekkaiData) {
                    return $ctrl.selectedData.indexOf(kekkaiData) >= 0;
                };

                // 取消 Online Editing Mode
                $ctrl.doCancelOnlineEditing = function() {
                    $ctrl.todoGroup.clearEditing(true);
                };

                // 送交 Online Editing Data
                $ctrl.doCommitOnlineEdited = function() {
                    if(!$ctrl.isOnlineCommitable) return;
                    var requestBody = [];

                    $ctrl.dataviewCtrl.filter(function(dataviewCtrl) { return dataviewCtrl.isCommitable; }).forEach(function(dataviewCtrl) {
                        requestBody.push(dataviewCtrl.kekkaiData.parseJSON());
                    });

                    if(requestBody.length > 0) {
                        if($ctrl.dataviewCtrl.filter(function(dataviewCtrl) {
                            var kekkaiData = dataviewCtrl.kekkaiData;

                            return kekkaiData.$isEditable && kekkaiData.$isDirty && !kekkaiData.$isDataValid;
                        }).length > 0) KekkaiMessage.confirm(
                            $translate.instant('KEKKAI_MSG_SUBMIT_CONFIRM', {actionName: $translate.instant($ctrl.todoGroup.editingTodo.text)}),
                            'KEKKAI_MSG_CONFIRM_COMMIT',
                            function(isConfirmed) {
                                if(isConfirmed) KekkaiHttpService.do(
                                    $ctrl.containerID,
                                    $ctrl.todoGroup.editingTodo,
                                    requestBody
                                );
                            }
                        ); else KekkaiHttpService.do(
                            $ctrl.containerID,
                            $ctrl.todoGroup.editingTodo,
                            requestBody
                        );
                    }
                };

                // 將傳入之 JSON 轉成 KekkaiModel
                $ctrl.doDatabinding = function(datalist, isAppended) {
                    var isAllSelected   = $ctrl.isAllSelected,
                        isOnlineEditing = $ctrl.isOnlineEditing,
                        fieldsConfig    = $ctrl.fields(),
                        $hscrollEl      = $('#' + $ctrl.containerID + ' > div[kekkai-horizontal-scroll]');

                    isAppended = isAppended === true;

                    if(!isAppended) {
                        $ctrl.datalist     = [];
                        $ctrl.selectedData = [];
                    }

                    datalist.forEach(function(data) {
                        var kekkaiData = new Kekkai.data.Model($ctrl, fieldsConfig, data);

                        $ctrl.datalist.push(kekkaiData);

                        if(isAppended && isAllSelected) 
                            $ctrl.selectedData.push(kekkaiData);
                    });

                    if(isAppended && isOnlineEditing) 
                        $ctrl.todoGroup.setEditing(true, $ctrl.datalist);

                    $ctrl.doRemoveKekkaiPlugin();
                    $ctrl.onDatabound({datalist: $ctrl.datalist});

                    if($hscrollEl.length > 0)
                        $hscrollEl[0].scrollLeft = 0;
                };

                // 執行查詢
                $ctrl.doRead = function(isAppended, isAutoFocus) {
                    isAppended = isAppended === true;

                    if(!$ctrl.isRequestCase) {
                        dataJSON = Array.isArray($ctrl.readData)? $ctrl.readData : [$ctrl.readData];

                        $ctrl.pager.total = dataJSON.length;
                        $ctrl.doDatabinding(dataJSON);

                        if(isAutoFocus === true) $('#' + $ctrl.containerID)[0].scrollIntoView();
                    } else KekkaiHttpService.doRead($ctrl.containerID, $ctrl.readUrl(), {
                        page     : $ctrl.pager.page,
                        pageSize : $ctrl.pager.pageSize,
                        skip     : $ctrl.pager.skip,
                        take     : $ctrl.pager.take,
                        sort     : $ctrl.kekkaiSort,
                        filter   : {logic: 'and', filters: $ctrl.kekkaiFilter}
                    }, function(responseJSON) {
                        dataJSON = (isAppended? dataJSON : []).concat(responseJSON.data);

                        $ctrl.pager.total   = responseJSON.total;
                        $ctrl.doDatabinding(responseJSON.data, isAppended);

                        if(isAutoFocus === true) $('#' + $ctrl.containerID)[0].scrollIntoView();
                    });
                };
            })(this);

            // TODO - Do init
            (function($ctrl, uid) {

                // 建立初始變數
                $.extend($ctrl, {
                    containerID  : 'container-' + uid,
                    navID        : 'nav-'       + uid,
                    headerID     : 'header-'    + uid,
                    cdshbID      : 'cdshb-'     + uid,
                    allPageSize  : Kekkai.config.allPageSize,
                    isMobile     : isMobile,
                    translate    : $translate,
                    selectedData : [],
                    virtuals     : [],
                    favourites   : [],
                    favourite    : null,
                    pager        : new Kekkai.data.Pager($ctrl.kekkaiPageSize, $ctrl.onPagerChange),
                    todoGroup    : new Kekkai.data.TodoGroup($ctrl, $ctrl.operations),
                    datalist     : []
                });

                switch($ctrl.layoutType) {
                case 'GRID':
                    $ctrl.onDatabound({datalist: [new Kekkai.data.Model($ctrl, $ctrl.fields(), {}, true)]});
                    break;
                default:
                    $ctrl.doRead(false, $ctrl.isAutoFocus);
                }
            })(this, Kekkai.data.guid());
        }
    });
});