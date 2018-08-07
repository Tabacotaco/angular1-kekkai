'use strict';

define([
	'app',
	'js/kekkai-common/services/kekkai-message-service',
	'js/kekkai-common/services/kekkai-http-service',

	'js/kekkai-common/plugin/kekkai-aggregate-collapse-directive',
	'js/kekkai-common/plugin/kekkai-clear-field-directive',
	'js/kekkai-common/plugin/kekkai-editor-modal-directive',
	'js/kekkai-common/plugin/kekkai-fixed-dropdown-directive',
	'js/kekkai-common/plugin/kekkai-horizontal-scroll-directive',
	'js/kekkai-common/plugin/kekkai-infinite-scroll-directive',
	'js/kekkai-common/plugin/kekkai-invalid-tip-directive',
	'js/kekkai-common/plugin/kekkai-slide-directive',
	'js/kekkai-common/plugin/kekkai-tab-directive',

    'js/kekkai-common/components/kekkai-criteria/kekkai-criteria',
    'js/kekkai-common/components/kekkai-container/kekkai-container',
    'js/kekkai-common/components/kekkai-dataview/kekkai-dataview',
    'js/kekkai-common/components/kekkai-field/kekkai-field'
], function(app) {

    // Include CSS
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-navbar.css" />');
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-criteria.css" />');
	// $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-content.css" />');
	// $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-grid.css" />');
	// $('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-column.css" />');

    // Override Array
	if(!Array.prototype.findIndex) Array.prototype.findIndex = function(fn) {
		for(var i = 0; i < this.length; i++) if(fn(this[i], i, this) === true)
			return i;
		
		return -1;
	};

	// Bind Default Event
	$('body').on('click', function(e) {
		if($(e.target).is('body') && $('body').hasClass(Kekkai.config.dropdownOpeningCls)) {
			$('body').removeClass(Kekkai.config.dropdownOpeningCls);
			$('.dropdown').removeClass('open');
		}

		if($(e.target).parents('div.grid-group:not(.kekkai-uneditable), fieldset:not(.kekkai-uneditable)').length === 0
		&& $('body').hasClass(Kekkai.config.onlineEditingCls)) {
			var $editing = $('ng-transclude.kekkai-switch-editor');

			$('body').removeClass(Kekkai.config.onlineEditingCls);

			if($editing.length > 0) {
				var scope = angular.element($editing[0]).scope();

				scope.$kekkaiField.onSwitchEditingMode(false);
				scope.$apply();
			}
		}
	});

	// Package & Type Generator
	var KekkaiCommon = (function() {
		var append = function(result, obj, isOverride) {
			if(angular.isObject(obj)) $.each(obj, function(propertyName, value) {
				if(isOverride === true || !(propertyName in result))
					result[propertyName] = value;
			});
		};

		return {
			create: function(p, content) {
				var packages = p.split('.'),
					cls;
	
				$.each(packages, function(i, name) {
					var temp   = i == 0? window : cls,
						isLast = i == packages.length - 1;
	
					if(isLast) {
						if(!temp[name])
							temp[name] = content;
						else
							append(temp[name], content);
					} else if(!temp[name])
						temp[name] = {};
	
					cls = temp[name];
				});
			}
		};
	})();

	// Kekkai Default Configures
	KekkaiCommon.create('Kekkai.config', (function() {
		var cls = {};

		// Context Path
		Object.defineProperty(cls, 'contextPath', {get: function() {
			return CONTEXT.PATH;
		}});

		// 不分頁之實際筆數
		Object.defineProperty(cls, 'allPageSize', {get: function() {
			return 100;
		}});

		// 下拉選單展開時的 Class
		Object.defineProperty(cls, 'dropdownOpeningCls', {get: function() {
			return 'dropdown-opening';
		}});

		// 在列編輯(Online-Editing)時的 Class
		Object.defineProperty(cls, 'onlineEditingCls', {get: function() {
			return 'online-editing';
		}});

		// 可進行資料編輯的類型
		Object.defineProperty(cls, 'modalEditingMode', {get: function() {
			return ['CreateByEditor', 'UpdateByEditor'];
		}});

		Object.defineProperty(cls, 'onlineEditingMode', {get: function() {
			return ['UpdateByMulti'];
		}});
		return cls;
	})());

	// Kekkai Layout
	KekkaiCommon.create('Kekkai.layout', (function() {
		var SIZE_SEQ = ['def', 'sm', 'md', 'lg'];

		$(window).on('resize', function() {
			var $sortable  = $('kekkai-container div.row.ui-sortable'),
				$resizable = $('kekkai-container div.row > div.ui-resizable'),
				$container = $sortable.sortable('option', 'container');

			switch(Kekkai.layout.getWindowSize()) {
			case 'def':
				$sortable.sortable('disable');
				$resizable.resizable('disable');
				break;
			default:
				$sortable.sortable('enable');
				$resizable.resizable('enable');
			}

			if($container && !Kekkai.data.isEmptyValue($container.dataviewCtrl)) $container.dataviewCtrl.forEach(
				function(ctrl) { ctrl.doReorderFields($container.virtuals); }
			);
		});

		return {
			getAggregateCls: function() { return 'kekkai-aggregate-header'; },

			getCollapsedCls: function() { return 'kekkai-collapsed'; },

			generateColumnCls: function(layoutMode, layoutType, field) {
				return [
					'col-xs-' + field.getColspan(layoutMode, layoutType),
					'row-'    + field.getRowspan(layoutMode, layoutType)
				];
			},

			getAllowedSize: function(maxSize) {
				return SIZE_SEQ.slice(0, SIZE_SEQ.indexOf(maxSize) + 1);
			},

			getWindowSize: function() {
				var width = $(window).width();

				return width < 768 ? 'def' : width < 992 ? 'sm' : width < 1200 ? 'md' : 'lg';
			}
		};
	})());

	// Kekkai Model
	KekkaiCommon.create('Kekkai.data', (function() {
		var ALIGN   = ['left', 'center', 'right'],
			METHOD  = ['get', 'post', 'put', 'delete'],
			EDIT_BY = ['MODAL', 'CONTAINER'];

		function convert2Array(value) {
			var result = Kekkai.data.doNvl(value, []);

			return angular.isArray(result)? result : [result];
		};

		return {

			// 產生 uuid
			guid: function() {
				var d = Date.now();

				if (typeof performance !== 'undefined' && typeof performance.now === 'function')
					d += performance.now(); //use high-precision timer if available

				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = (d + Math.random() * 16) % 16 | 0;

					d = Math.floor(d / 16);

					return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
				});
			},

			// NVL 處理
			doNvl: function(checkValue, replaceValue) {
				return Kekkai.data.isEmptyValue(checkValue)? replaceValue : checkValue;
			},

			doLoading: function($el, isVisible) {
				if(!$el.hasClass('kekkai-loading') && isVisible === true) $el.addClass('kekkai-loading').append(
					'<div class="kekkai-mask"><span class="glyphicon glyphicon-refresh kekkai-loading-icon"></span></div>'
				);
				else if($el.hasClass('kekkai-loading') && isVisible === false) $el.removeClass('kekkai-loading').find(
					' > div.kekkai-mask'
				).remove();
			},

			// 判斷輸入值是否為空值
			isEmptyValue: function(value) {
				if(value !== null) switch(typeof value) {
				case 'boolean'   : return false;
				case 'number'    : return isNaN(value);
				case 'string'    : return value.trim().length === 0;
				case 'undefined' : return true;
				default          :
					if(angular.isDate(value) || (angular.isArray(value) && value.length > 0)
					|| (angular.isObject(value) && Object.keys(value).length > 0))
						return false;
				}
				return true;
			},

			// Kekkai Pager Manager
			Pager: function(pageSize, onChange) {
				var pager    = this,
					total    = 0,
					currPage = 1;

				function doChange($type, oriValue, newValue) {
					if(angular.isFunction(onChange) && oriValue !== newValue)
						onChange($type);
				};

				// Kekkai.data.Pager Propertyies
				Object.defineProperty(this, 'maxPage', {get: function() {
					return Math.max(1, Math.ceil(total / pager.pageSize));
				}});
				
				Object.defineProperty(this, 'take', {get: function() {
					return pageSize;
				}});
				
				Object.defineProperty(this, 'skip', {get: function() {
					return (pager.page - 1) * pager.pageSize;
				}});
				
				Object.defineProperty(this, 'indexFm', {get: function() {
					return pager.skip + 1;
				}});
				
				Object.defineProperty(this, 'indexTo', {get: function() {
					return pager.skip + pager.pageSize;
				}});
				
				Object.defineProperty(this, 'total', {
					get: function() { return total; },

					set: function(value) { total = angular.isNumber(value) && !isNaN(value)? value : currPage; }
				});

				Object.defineProperty(this, 'page', {
					get: function() { return currPage; },

					set: function(value) {
						(function(oriValue, newValue) {
							currPage = Math.min(Math.max(1, angular.isNumber(newValue) && !isNaN(newValue)? newValue : currPage), pager.maxPage);
							doChange('PAGE', oriValue, currPage);
						})(currPage, value);
					}
				});

				Object.defineProperty(this, 'pageSize', {
					get: function() { return pageSize; },

					set: function(value) {
						(function(oriValue, newValue) {
							pageSize = angular.isNumber(newValue) && !isNaN(newValue)? newValue : pageSize;
							doChange('PAGE_SIZE', oriValue, newValue);
						})(pageSize, value);
					}
				});
				
				return $.extend(this, {
					toNext      : function() { pager.page = Math.min(pager.maxPage, pager.page + ((pager.page * pager.pageSize) < total? 1 : 0)); },

					toPrev      : function() { pager.page = Math.max(1, currPage - (pager.page > 1? 1 : 0)); },

					toFirst     : function() { pager.page = 1; },

					toLast      : function() { pager.page = Math.ceil(total / pager.pageSize); },

					setPageSize : function(value) { pageSize = angular.isNumber(value) && !isNaN(value)? value : pageSize; }
				});
			},

			// Kekkai Todo Group Manager
			TodoGroup: function(container, operations) {
				var $group  = this,
					editing = null,
					todos   = {};

				// Execute Todo
				function executeTodo(op, callbackFn) {
					if(!op.isConfirmed)
						callbackFn();
					else container.kekkaiMSG.confirm(op.confirmTitle, op.confirmMessage, function(isConfirmed) {
						if(isConfirmed) callbackFn();
					});
				};

				// Generate Todos
				function generateDoCommit(op, onSuccess) {
					return {
						doCommit: {
							url           : op.url,
							method        : op.method,
							overrideParam : op.overrideParam,
							onSuccess     : function(response) {
								if(angular.isFunction(onSuccess)) // 動作預設的事件優先
									onSuccess(response);

								// 重新查詢資料
								container.doRead(false, true);

								op.onSuccess(response); // 使用者自定義之事件排最後
							}
						}
					};
				};

				function generateTodo(op) {
					var todoUUID = Kekkai.data.guid();

					// 自定義動作
					if(op.isProvidedTodo !== true) {
						op.uuid = todoUUID;

						return new Kekkai.data.Todo(op);

					// Kekkai 預設資料動作 Injection & Override
					} switch(op.mode) {
						// 基本執行
						case 'NormalExecute'      :
						case 'ExecuteBySelection' : return new Kekkai.data.Todo($.extend({
							uuid     : todoUUID
						}, op.options), op.mode);

						// 編輯新增
						case 'CreateByEditor': return new Kekkai.data.Todo($.extend({}, op.options, {
							uuid     : todoUUID,
							execute  : function() {
								var newData = new Kekkai.data.Model(container, container.fields(), {});

								$group.setEditing($group.getTodo(todoUUID), newData);
								container.datalist.splice(0, 0, newData);
								container.onDatabound({datalist: container.datalist});

								op.execute(newData);
							}
						}, generateDoCommit(op, function(response) {
							container.getDataviewCtrl($group.editingData[0]).doShutdownModal();
							$group.clearEditing();

							container.kekkaiMSG.success(
								'KEKKAI_RESPONSE_TITLE',
								container.translate.instant('KEKKAI_RESPONSE_CONTENT', {actionName: container.translate.instant(op.text)})
							);
						})), op.mode);

						// 編輯修改 (For 單筆資料 / 視窗)
						case 'UpdateByEditor': return new Kekkai.data.Todo($.extend({}, op.options, {
							uuid     : todoUUID,
							execute  : function(editData) {
								editData = 'FORM' === container.layoutType? editData[0] : editData;
								$group.setEditing($group.getTodo(todoUUID), editData);

								container.getDataviewCtrl(editData).doOpenEditingModal();
								op.execute(editData);
							}
						}, generateDoCommit(op, function(response) {
							container.getDataviewCtrl($group.editingData[0]).doShutdownModal();
							$group.clearEditing();

							container.kekkaiMSG.success(
								'KEKKAI_RESPONSE_TITLE',
								container.translate.instant('KEKKAI_RESPONSE_CONTENT', {actionName: container.translate.instant(op.text)})
							);
						})), op.mode);

						// 編輯修改 (For 多筆資料 / Container)
						case 'UpdateByMulti': return new Kekkai.data.Todo($.extend({}, op.options, {
							uuid       : todoUUID,
							executable : function() {
								return container.datalist.length > 0 && container.datalist.filter(function(kekkaiData) {
									return op.executable(kekkaiData) === true;
								}).length > 0;
							},
							execute    : function(editData) {
								$group.setEditing($group.getTodo(todoUUID), editData.filter(function(kekkaiData) {
									return op.executable(kekkaiData) === true;
								}));

								op.execute($group.editingData);
							}
						}, generateDoCommit(op, function(response) {
							$group.clearEditing();

							container.kekkaiMSG.success(
								'KEKKAI_RESPONSE_TITLE',
								container.translate.instant('KEKKAI_RESPONSE_CONTENT', {actionName: container.translate.instant(op.text)})
							);
						})), op.mode);

						case 'RowSubmit'      :
						case 'DeleteBySubmit' : return new Kekkai.data.Todo($.extend({}, op.options, {
							uuid     : todoUUID,
							execute  : function() {}
						}, generateDoCommit(op, function(response) {
								
						})), op.mode);

						case 'SubmitBySelection' :
						case 'DeleteBySelection' : return new Kekkai.data.Todo($.extend({}, op.options, {
							uuid     : todoUUID,
							execute  : function(selecteds) {
								var params = [];

								selecteds.forEach(function(kekkaiData) {
									params.push(kekkaiData.parseJSON());
								});

								executeTodo(op, function() {
									if(container.isAllSelected) container.kekkaiHTTP.doAll(container.containerID, $group.getTodo(todoUUID), {
										page     : 1,
										pageSize : container.pager.total,
										skip     : 0,
										take     : container.pager.total,
										sort     : container.kekkaiSort,
										filter   : {logic: 'and', filters: container.kekkaiFilter}
									});
									else container.kekkaiHTTP.do(
										container.containerID,
										$group.getTodo(todoUUID),
										params
									);
								});
							}
						}, generateDoCommit(op, function(response) {
							container.selectedData = [];
						})), op.mode);
					}
				};

				convert2Array(operations).forEach(function(operation) {
					var todo = generateTodo(operation);

					// Do Register
					if(Object.keys(todos).indexOf(todo.trigger) < 0)
						todos[todo.trigger] = [];

					todos[todo.trigger].push(todo);
				});

				// Kekkai.data.TodoGroup Propertyies
				Object.defineProperty(this, 'isEditing', {get: function() {
					return !Kekkai.data.isEmptyValue(editing);
				}});

				Object.defineProperty(this, 'editingTodo', {get: function() {
					return $group.isEditing? editing.todo : null;
				}});

				Object.defineProperty(this, 'editingData', {get: function() {
					return $group.isEditing? editing.kekkaiData : [];
				}});

				return $.extend(this, {
					clearEditing: function(autoRollback) {
						$group.editingData.forEach(function(data) {
							if('CreateByEditor' === $group.editingTodo.mode)
								container.datalist.splice(container.datalist.indexOf(data), 1);
							else
								data.setEditable(false, autoRollback);
						});
						editing = null;
						$('div.kekkai-invalid-popover').remove();
					},

					removeEditingData: function(targetData) {
						var index = $group.editingData.indexOf(targetData);

						if(index >= 0)
							editing.kekkaiData.splice(index, 1);
					},

					isSpecifyModeExists: function(mode) {
						var result = false;

						Object.keys(todos).forEach(function(triggerOn) {
							result = $group.getTodos(triggerOn).filter(function(todo) {
								return todo.mode === mode;
							}).length > 0? true : result;
						});
						return result;
					},

					isTodoExecutable: function(todo, kekkaiData, isStrict) {
						switch(todo.trigger) {
						case 'TOOLBAR'   : return todo.executable() !== false;
						case 'ROW_MENU'  :
						case 'ROW_CLICK' : return todo.executable(kekkaiData) !== false;
						case 'SELECTION' :
							if(!angular.isArray(kekkaiData))
								return todo.executable(kekkaiData) !== false;

							var isExecutable = isStrict === true && kekkaiData.length > 0;

							kekkaiData.forEach(function(data) {
								isExecutable = isStrict === true? (todo.executable(data) === false? false : isExecutable)
									: (todo.executable(data) !== false? true : isExecutable);
							});
							return isExecutable;
						default:
							throw 'Invalid Todo Trigger and Unable Check Executable(Trigger: ' + todo.trigger + ').';
						}
					},

					setEditing: function(todo, kekkaiData) {
						var editingData = convert2Array(kekkaiData).filter(function(data) {
							return data.setEditable(true) === true;
						});

						if(editingData.length > 0) switch(todo === true) {
						case true:
							if(editing !== null) {
								editing.kekkaiData = editing.kekkaiData.concat(editingData);
								break;
							}
						default:
							$group.editingData.filter(function(data) {
								return editingData.indexOf(data) < 0;
							}).forEach(function(data) {
								data.setEditable(false);
							});

							editing = {todo: todo, kekkaiData: editingData};
						}
					},

					getTodo: function(uuid) {
						var result = null;

						Object.keys(todos).forEach(function(triggerOn) {
							var filterTodos = todos[triggerOn].filter(function(todo) {
								return todo.uuid === uuid;
							});
							result = filterTodos.length === 0? result : filterTodos[0];
						});
						return result
					},

					getTodos: function(triggerOn) {
						var result = [];

						switch (container.layoutType) {
						case 'FORM':
							if('TOOLBAR' === triggerOn) Object.keys(todos).forEach(function(trigger) {
								result = result.concat(Array.isArray(todos[trigger])? todos[trigger] : []);
							});
							return result;
						case 'CARD':
							if('ROW_MENU' === triggerOn) ['ROW_MENU', 'ROW_CLICK'].forEach(function(trigger) {
								result = result.concat(Array.isArray(todos[trigger])? todos[trigger] : []);
							});
							else if('ROW_CLICK' !== triggerOn)	
								result = Array.isArray(todos[triggerOn])? todos[triggerOn] : [];

							return result;
						case 'GRID':
							if('ROW_CLICK' === triggerOn) ['ROW_MENU', 'ROW_CLICK'].forEach(function(trigger) {
								result = result.concat(Array.isArray(todos[trigger])? todos[trigger] : []);
							});
							else if('ROW_MENU' !== triggerOn)
								result = Array.isArray(todos[triggerOn])? todos[triggerOn] : [];

							return result;
						}
						return result;
					},

					getAllowedTodos: function(triggerOn, kekkaiData) {
						return $group.getTodos(triggerOn).filter(function(todo) {
							return $group.isTodoExecutable(todo, kekkaiData);
						});
					}
				});
			},

			// Kekkai Data Model
			Model: function(container, fields, _values, isVirtual) {
				var $model    = this,
					uid       = Kekkai.data.guid(),
					_editable = false,
					_json     = JSON.parse(JSON.stringify(_values)),
					_fields   = {};

				// Convert Array to Object
				fields.forEach(function(field) {
					_fields[field.fieldName] = field;
				});

				Object.keys(_fields).forEach(function(fieldName) {
					Object.defineProperty($model, fieldName, {
						get: function() { return _values[fieldName]; },

						set: function(value) {
							if(_values[fieldName] !== value) {
								var dataviewCtrl = container.getDataviewCtrl($model);

								_values[fieldName] = value;

								if(dataviewCtrl && dataviewCtrl.fieldCtrl[fieldName])
									dataviewCtrl.fieldCtrl[fieldName].onNgModelChange();
							}
						}
					});
				});

				// Kekkai.data.Model Propertyies
				Object.defineProperty(this, '$allSchema', {get: function() {
					return fields;
				}});
				
				Object.defineProperty(this, '$allFieldNames', {get: function() {
					return Object.keys(_fields);
				}});
				
				Object.defineProperty(this, '$isVirtual', {get: function() {
					return isVirtual;
				}});
				
				Object.defineProperty(this, '$isEditable', {get: function() {
					return _editable;
				}});

				Object.defineProperty(this, '$uid', {get: function() {
					return uid;
				}});
				
				Object.defineProperty(this, '$isDirty', {get: function() {
					var result = false;

					$model.$allFieldNames.filter(function(fieldName) {
						return $model.getField(fieldName).isEditable($model);
					}).forEach(function(fieldName) {
						var currValue = $model[fieldName],
							oriValue  = _json[fieldName];

						currValue = Kekkai.data.isEmptyValue(currValue) ? null : currValue;
						oriValue  = Kekkai.data.isEmptyValue(oriValue)  ? null : oriValue;

						result = (!currValue && oriValue) || (currValue && !oriValue) || (currValue !== oriValue)? true : result;
					});
					return result;
				}});
				
				Object.defineProperty(this, '$isDataValid', {get: function() {
					var result = true;

					fields.forEach(function(field) {
						var validRes = field.getValid($model[field.fieldName], $model);

						result = validRes === false || angular.isString(validRes) ? false : result;
					});
					return result;
				}});

				return $.extend(this, {
					getField: function(fieldName) {
						return _fields[fieldName];
					},

					parseJSON: function() {
						return JSON.parse(JSON.stringify(_values));
					},

					setEditable: function(turnOn, autoRollback) {
						if(turnOn === false && autoRollback === true)
							$model.doRollback();

						_editable = turnOn !== true? false : $model.$allFieldNames.filter(function(fieldName) {
							return $model.getField(fieldName).isEditable($model);
						}).length > 0;

						return _editable;
					},

					doClearDirty: function() {
						$model.$allFieldNames.filter(function(fieldName) {
							return $model.getField(fieldName).isEditable($model);
						}).forEach(function(fieldName) {
							_json[fieldName] = $model[fieldName];
						});
					},

					doRollback: function() {
						$model.$allFieldNames.filter(function(fieldName) {
							return $model.getField(fieldName).isEditable($model);
						}).forEach(function(fieldNames) {
							$model[fieldNames] = _json[fieldNames];
						});
					}
				});
			},

			/** 資料欄位定義
			  *
			  * Example - new Kekkai.data.Field('id', {
			  *     label       : string,            資料欄位名稱
			  *     required?   : boolean,           是否為必填
			  *     dateFormat? : string,            日期格式, 如有設定即代表資料值為 number 型態
			  *     editable?   : string | Function, 是否可編輯
			  *     validation? : Function,          資料驗證邏輯
			  * 	reduce?     : {                  精簡模式
			  *			align?  : 'center',                      對齊設定 (string 小寫: left/center/right)
			  *			col     : {def: 2, sm: 3, md: 4, lg: 5}, 欄寬設定 (number | boolean)
			  *			row?    : {def: 2, sm: 1, md: 1, lg: 1}  欄高設定 (number)
			  *		},
			  *		complete?   : {                  完整模式
			  *			align?  : 'center',                      對齊設定 (string 小寫: left/center/right)
			  *			col     : {def: 2, sm: 3, md: 4, lg: 5}, 欄寬設定 (number | boolean)
			  *			row?    : {def: 2, sm: 1, md: 1, lg: 1}  欄高設定 (number)
			  *		}
			  *	})
			  */
			Field: function(fieldName, opts) {
				opts = Kekkai.data.isEmptyValue(opts)? {} : opts;

				var $field      = this,
					oriReduce   = JSON.parse(JSON.stringify(angular.isObject(opts.reduce) && angular.isObject(opts.reduce.col)? opts.reduce.col : {})),
					oriComplete = JSON.parse(JSON.stringify(angular.isObject(opts.complete) && angular.isObject(opts.complete.col)? opts.complete.col : {}));

				// Kekkai.data.Field Propertyies
				Object.defineProperty(this, 'fieldName', {get: function() {
					return fieldName;
				}});

				Object.defineProperty(this, 'label', {get: function() {
					return opts.label;
				}});

				Object.defineProperty(this, 'dateFormat', {get: function() {
					return opts.dateFormat;
				}});

				Object.defineProperty(this, 'reduceIndex', {get: function() {
					return angular.isObject(opts.reduce)? opts.reduce.index : -1;
				}});

				Object.defineProperty(this, 'completeIndex', {get: function() {
					return angular.isObject(opts.complete)? opts.complete.index : -1;
				}});

				Object.defineProperty(this, 'reduceColspan', {get: function() {
					return JSON.parse(JSON.stringify(angular.isObject(opts.reduce) && angular.isObject(opts.reduce.col)? opts.reduce.col : {}));
				}});

				Object.defineProperty(this, 'completeColspan', {get: function() {
					return JSON.parse(JSON.stringify(angular.isObject(opts.complete) && angular.isObject(opts.complete.col)? opts.complete.col : {}));
				}});

				Object.defineProperty(this, 'isRequired', {get: function() {
					return opts.required === true;
				}});

				Object.defineProperty(this, 'isDateType', {get: function() {
					return angular.isString(opts.dateFormat) && opts.dateFormat.length > 0;
				}});

				return $.extend(this, {

					isEditable: function(kekkaiData) {
						return (angular.isFunction(opts.editable)? opts.editable(kekkaiData[fieldName], kekkaiData) : opts.editable) === true;
					},

					isTempVisible: function(layoutMode) {
						return $field.getColspan(layoutMode.toLowerCase(), layoutType) > 0;
					},

					getIndex: function(layoutMode) {
						return angular.isObject(opts[layoutMode])? opts[layoutMode].index : -1;
					},

					getTextalign: function(layoutMode) {
						return opts[layoutMode] && ALIGN.indexOf(opts[layoutMode].align) >= 0? opts[layoutMode].align : 'left';
					},

					getValid: function(checkValue, kekkaiData) {
						return ($field.isRequired && Kekkai.data.isEmptyValue(checkValue))? false
							: angular.isFunction(opts.validation)? opts.validation(checkValue, kekkaiData) : true;
					},

					getColspan: function(layoutMode, layoutType, isIgnoreVisible) {
						var kekkaiCol = angular.isObject(opts[layoutMode]) && angular.isObject(opts[layoutMode].col)? opts[layoutMode].col : null,
							result    = 0;

						isIgnoreVisible = isIgnoreVisible === true || ('GRID' === layoutType && 'def' === Kekkai.layout.getWindowSize());

						if(kekkaiCol !== null && (isIgnoreVisible === true || opts[layoutMode].visible !== false))
							Kekkai.layout.getAllowedSize('CARD' === layoutType ? 'def' : Kekkai.layout.getWindowSize()).forEach(function(size) {
								result = kekkaiCol[size] === false? 0
									: (!isNaN(kekkaiCol[size]) && angular.isNumber(kekkaiCol[size]))? kekkaiCol[size] : result;
							});

						return result;
					},

					getRowspan: function(layoutMode, layoutType) {
						var kekkaiRow = angular.isObject(opts[layoutMode]) && angular.isObject(opts[layoutMode].row)? opts[layoutMode].row : null,
							currSize  = Kekkai.layout.getWindowSize(),
							result    = 1;

						if('GRID' === layoutType && 'def' !== currSize)
							return result;
						else if(kekkaiRow !== null && opts[layoutMode].visible !== false) Kekkai.layout.getAllowedSize(
							'CARD' === layoutType ? 'def' : currSize
						).forEach(function(size) {
							result = !isNaN(kekkaiRow[size]) && angular.isNumber(kekkaiRow[size])? kekkaiRow[size] : result;
						});
						return result;
					},

					getTempVisible: function(layoutMode) {
						return angular.isObject(opts[layoutMode])? (opts[layoutMode].visible !== false) : true;
					},

					setIndex: function(layoutMode, i) {
						if(!angular.isObject(opts[layoutMode]))
							opts[layoutMode] = {};

						opts[layoutMode].index = i;
					},

					setTempVisible: function(layoutMode, isVisible) {
						if(!angular.isObject(opts[layoutMode])) opts[layoutMode] = {};

						opts[layoutMode].visible = isVisible;
					},

					setNewspan: function(layoutType, layoutMode, colspan) {
						if(!angular.isObject(opts[layoutMode])) opts[layoutMode] = {};

						if('GRID' === layoutType
						&& 'def' !== layoutMode
						&& angular.isNumber(colspan)
						&& !isNaN(colspan)) {
							var kekkaiCol = angular.isObject(opts[layoutMode]) && angular.isObject(opts[layoutMode].col)? opts[layoutMode].col : null;
	
							if(kekkaiCol === null)
								opts[layoutMode].col = {};

							opts[layoutMode].col[Kekkai.layout.getWindowSize()] = colspan;
						}
					},

					doOverride: function(isFieldType, layoutMode, index, option) {
						opts[layoutMode] = angular.isObject(opts[layoutMode]) ? opts[layoutMode] : {};

						$field.setIndex       (layoutMode, isFieldType? index : option.colIndex);
						$field.setTempVisible (layoutMode, isFieldType? true : option.visible);

						opts[layoutMode].col = isFieldType? ('reduce' === layoutMode? oriReduce : oriComplete) : {
							def : option.spanDef === 0? false : option.spanDef,
							sm  : option.spanSm  === 0? false : option.spanSm,
							md  : option.spanMd  === 0? false : option.spanMd,
							lg  : option.spanLg  === 0? false : option.spanLg
						};
					}
				});
			},

			/** 資料動作定義
			  * 
			  * Example - new Kekkai.data.Todo({
			  *		uuid?       : string,   元件將自動建立
			  *		text        : string,   資料動作名稱
			  *		icon        : string,   圖示 class
			  *		trigger     : string,   觸發方式 (TOOLBAR / ROW_CLICK / ROW_MENU / SELECTION)
			  *		editBy?     : string,   編輯時所採用的模式 (MODAL / CONTAINER)
			  *		executable? : Function, 判斷是否可執行資料動作
			  *		execute?    : Function, 執行內容
			  *		doCommit?   : {
			  *			url            : string | Function, Request URL 設定
			  *			method         : string,            Request Method 設定 (get / post / put / delete)
			  *			overrideParam? : Function,          Request 參數 override
			  *			onSuccess?     : Function,          取得 Response 時觸發之事件
			  *			confirm?       : {
			  *				title?     : string,            執行前確認對話框之 Title
			  *				message    : string             確認對話框訊息內容
			  *			}
			  *		}
			  *	})
			  */
			Todo: function(opts, mode) {
				var $todo = this;

				function convertModel2JSON(kekkaiData) {
					return JSON.parse(JSON.stringify(kekkaiData));
				}

				// Kekkai.data.Model Propertyies
				Object.defineProperty(this, 'isProvidedTodo', {get: function() {
					return angular.isString(mode) && Object.keys(Kekkai.op).indexOf(mode) >= 0;
				}});

				Object.defineProperty(this, 'mode', {get: function() {
					return $todo.isProvidedTodo? mode : null;
				}});

				Object.defineProperty(this, 'options', {get: function() {
					return $todo.isProvidedTodo? opts : null;
				}});

				Object.defineProperty(this, 'isRequestProcess', {get: function() {
					return angular.isObject(opts.doCommit);
				}});

				Object.defineProperty(this, 'isConfirmed', {get: function() {
					return !$todo.isRequestProcess ? false : angular.isObject(opts.doCommit.confirm);
				}});

				Object.defineProperty(this, 'uuid', {get: function() {
					return opts.uuid;
				}});

				Object.defineProperty(this, 'method', {get: function() {
					return $todo.isRequestProcess && METHOD.indexOf(opts.doCommit.method) >= 0? opts.doCommit.method : null;
				}});

				Object.defineProperty(this, 'text', {get: function() {
					return opts.text;
				}});

				Object.defineProperty(this, 'icon', {get: function() {
					return opts.icon;
				}});

				Object.defineProperty(this, 'trigger', {get: function() {
					return opts.trigger;
				}});

				Object.defineProperty(this, 'editBy', {get: function() {
					return Kekkai.data.isEmptyValue(opts.editBy) || EDIT_BY.indexOf(opts.editBy) < 0? false : opts.editBy;
				}});

				Object.defineProperty(this, 'confirmTitle', {get: function() {
					return $todo.isConfirmed? opts.doCommit.confirm.title : '';
				}});

				Object.defineProperty(this, 'confirmMessage', {get: function() {
					return $todo.isConfirmed? opts.doCommit.confirm.message : '';
				}});

				Object.defineProperty(this, 'executable', {get: function() {
					return angular.isFunction(opts.executable)? opts.executable : (function() { return true; });
				}});

				Object.defineProperty(this, 'execute', {get: function() {
					return angular.isFunction(opts.execute)? opts.execute : (function() {});
				}});

				Object.defineProperty(this, 'onSuccess', {get: function() {
					return !$todo.isRequestProcess? (function() {})
						: angular.isFunction(opts.doCommit.onSuccess)? opts.doCommit.onSuccess : (function() {});
				}});

				Object.defineProperty(this, 'url', {get: function() {
					return !$todo.isRequestProcess? (function() { return ''; }) : (function(kekkaiData) {
						return angular.isFunction(opts.doCommit.url)? opts.doCommit.url(kekkaiData) : opts.doCommit.url;
					});
				}});

				Object.defineProperty(this, 'overrideParam', {get: function() {
					return !$todo.isRequestProcess? (function() {}) : angular.isFunction(opts.doCommit.overrideParam)? opts.doCommit.overrideParam
						: (function(kekkaiData) {
							switch($todo.trigger) {
							case 'TOOLBAR':
								return kekkaiData;
							case 'ROW_CLICK': case 'ROW_MENU':
								return convertModel2JSON(kekkaiData);
							case 'SELECTION':
								var listJSON = [];

								if(!angular.isArray(kekkaiData))
									throw 'Override Param Error: KekkaiData(' + kekkaiData + ') is not array.';
								else kekkaiData.forEach(function(data) {
									listJSON.push(convertModel2JSON(data));
								});
								return listJSON;
							default:
								throw 'Unhandle Trigger Type(' + $todo.trigger + '), Please Check.';
							}
						});
				}});
				return this;
			}
		};
	})());

	// Kekkai Operation
	KekkaiCommon.create('Kekkai.op', (function() {
		return {
			/** Kekkai 預設資料動作: 基本執行
			  * 
			  * Example - Kekkai.op.NormalExecute({
			  * 	text           : string,            資料動作名稱
			  *		icon           : string,            圖示 class
			  *		executable?    : Function           判斷是否可執行資料動作
			  *     execute        : Function           執行內容
			  * })
			  */
			NormalExecute: function(opts) {
				return new Kekkai.data.Todo({
					text       : opts.text,
					icon       : opts.icon,
					trigger    : 'TOOLBAR',
					executable : opts.executable,
					execute    : opts.execute
				}, 'NormalExecute');
			},

			/** Kekkai 預設資料動作: 編輯新增
			  *
			  * Example - Kekkai.op.CreateByEditor({
			  *		url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		execute?       : Function,          執行內容
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function           取得 Response 時觸發之事件
			  *	})
			  */
			CreateByEditor: function(opts) {
				return new Kekkai.data.Todo({
					text       : 'KEKKAI_BTN_CREATE',
					icon       : 'glyphicon glyphicon-plus',
					trigger    : 'TOOLBAR',
					editBy     : 'MODAL',
					executable : opts.executable,
					execute    : opts.execute,
					doCommit   : {
						url           : opts.url,
						method        : opts.method,
						overrideParam : opts.overrideParam,
						onSuccess     : opts.onSuccess
					}
				}, 'CreateByEditor');
			},

			/** Kekkai 預設資料動作: 編輯修改 (For 單筆資料 / 視窗)
			  * 
			  * Example - Kekkai.op.UpdateByEditor({
			  *		url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		execute?       : Function,          執行內容
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function           取得 Response 時觸發之事件
			  *	})
			  */
			UpdateByEditor: function(opts) {
				return new Kekkai.data.Todo({
					text       : 'KEKKAI_BTN_EDIT',
					icon       : 'glyphicon glyphicon-edit',
					editBy     : 'MODAL',
					trigger    : 'ROW_CLICK',
					executable : opts.executable,
					execute    : opts.execute,
					doCommit   : {
						url           : opts.url,
						method        : opts.method,
						overrideParam : opts.overrideParam,
						onSuccess     : opts.onSuccess
					}
				}, 'UpdateByEditor');
			},

			/** Kekkai 預設資料動作: 編輯修改 (For 多筆資料 / Container)
			  * 
			  * Example - Kekkai.op.UpdateByMulti({
			  * 	url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		execute?       : Function,          執行內容
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function           取得 Response 時觸發之事件
			  * })    
			  */
			UpdateByMulti: function(opts) {
				return new Kekkai.data.Todo({
					text       : 'KEKKAI_BTN_EDIT',
					icon       : 'glyphicon glyphicon-pencil',
					trigger    : 'TOOLBAR',
					editBy     : 'CONTAINER',
					executable : opts.executable,
					execute    : opts.execute,
					doCommit   : {
						url           : opts.url,
						method        : opts.method,
						overrideParam : opts.overrideParam,
						onSuccess     : opts.onSuccess
					}
				}, 'UpdateByMulti');
			},

			/** Kekkai 預設資料動作: 單筆資料送出
			  * 
			  * Example - Kekkai.op.RowSubmit({
			  * 	url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		text           : string,            資料動作名稱
			  *		icon           : string,            圖示 class
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function,          取得 Response 時觸發之事件
			  *		confirm?       : {
			  *			title?     : string,            執行前確認對話框之 Title
			  *			message    : string             確認對話框訊息內容
			  *		}
			  * })
			  */
			RowSubmit: function(opts, mode) {
				return new Kekkai.data.Todo({
					text       : opts.text,
					icon       : opts.icon,
					trigger    : 'ROW_MENU',
					executable : opts.executable,
					doCommit   : {
						url           : opts.url,
						method        : opts.method,
						overrideParam : opts.overrideParam,
						onSuccess     : opts.onSuccess,
						confirm       : opts.confirm
					}
				}, angular.isString(mode)? mode : 'RowSubmit');
			},

			/** Kekkai 預設資料動作: 單筆資料刪除
			  * 
			  * Example - Kekkai.op.DeleteBySubmit({
			  * 	url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		execute?       : Function,          執行內容
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function           取得 Response 時觸發之事件
			  * })
			  */
			DeleteBySubmit: function(opts) {
				return Kekkai.op.RowSubmit($.extend({
					text : 'KEKKAI_BTN_DELETE',
					icon : 'glyphicon glyphicon-trash',
					confirm : {
						title   : 'KEKKAI_MSG_SUBMIT_CONFIRM',
						message : 'KEKKAI_MSG_SUBMIT_CONTENT_1'
					}
				}, opts), 'DeleteBySubmit');
			},

			/** Kekkai 預設資料動作: 選取執行
			  *
			  * Example - Kekkai.op.ExecuteBySelection({
			  * 	text           : string,            資料動作名稱
			  *		icon           : string,            圖示 class
			  *		executable?    : Function           判斷是否可執行資料動作
			  *     execute        : Function           執行內容
			  * })
			  */
			ExecuteBySelection: function(opts) {
				return new Kekkai.data.Todo({
					text       : opts.text,
					icon       : opts.icon,
					trigger    : 'SELECTION',
					executable : opts.executable,
					execute    : opts.execute
				}, 'ExecuteBySelection');
			},

			/** Kekkai 預設資料動作: 選取送出
			  * 
			  * Example - Kekkai.op.SubmitBySelection({
			  * 	url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		text           : string,            資料動作名稱
			  *		icon           : string,            圖示 class
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function,          取得 Response 時觸發之事件
			  *		confirm?       : {
			  *			title?     : string,            執行前確認對話框之 Title
			  *			message    : string             確認對話框訊息內容
			  *		}
			  * })
			  */
			SubmitBySelection: function(opts, mode) {
				return new Kekkai.data.Todo({
					text       : opts.text,
					icon       : opts.icon,
					trigger    : 'SELECTION',
					executable : opts.executable,
					doCommit   : {
						url           : opts.url,
						method        : opts.method,
						overrideParam : opts.overrideParam,
						onSuccess     : opts.onSuccess,
						confirm       : opts.confirm
					}
				}, angular.isString(mode)? mode : 'SubmitBySelection');
			},

			/** Kekkai 預設資料動作: 選取刪除
			  * 
			  * Example - Kekkai.op.DeleteBySelection({
			  * 	url            : string | Function, Request URL 設定
			  *		method         : string,            Request Method 設定 (get / post / put / delete)
			  *		executable?    : Function,          判斷是否可執行資料動作
			  *		overrideParam? : Function,          Request 參數 override
			  *		onSuccess?     : Function           取得 Response 時觸發之事件
			  * })
			  */
			DeleteBySelection: function(opts) {
				return Kekkai.op.SubmitBySelection($.extend({
					text    : 'KEKKAI_BTN_DELETE',
					icon    : 'glyphicon glyphicon-remove-sign',
					confirm : {
						title   : 'KEKKAI_MSG_SUBMIT_CONFIRM',
						message : 'KEKKAI_MSG_SUBMIT_CONTENT_2'
					}
				}, opts), 'DeleteBySelection');
			}
		};
	})());
});