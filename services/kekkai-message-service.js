'use strict';

define(['app'], function(app) {
	$('head').append('<link rel="stylesheet" type="text/css" href="js/kekkai-common/css/kekkai-message.css" />');

	app.factory('KekkaiMessage', function($compile, $translate) {
		var uid    = Kekkai.data.guid(),
			$alert = $('<div id="alert-' + uid + '" class="kekkai-alert"></div>').appendTo('body');

		function showAlert(cls, title, content) {
			var alertID   = cls + '-' + Kekkai.data.guid(),
				removeFn  = function() { $('#' + alertID).remove(); clearTimeout(timeoutID); },
				timeoutID = setTimeout(removeFn, 8000);

			$(['<div class="kekkai-alert-content alert alert-' + cls + '" id="' + alertID + '">',
				'<strong>',
					Kekkai.data.isEmptyValue(title)? '' : $translate.instant(title),
				'</strong> ',
				$translate.instant(content),
			'</div>'].join('')).appendTo($alert).on('click', removeFn);
		};

		function generateInputHTML(inputOpt) {
			var result = [];

			(angular.isArray(inputOpt.input)? inputOpt.input : [inputOpt.input]).forEach(function(opt) {
				switch(opt.type) {
				case 'text':
					result.push([
						'<input type="text" class="form-control" ng-model="values.', opt.name , '" ',
						'placeholder="', $translate.instant(opt.placeholder), '" ',
						'style="width: 100%; border: none !important; box-shadow: none;" />'
					].join(''));

					break;
				case 'checkbox':
					result.push(['<label>',
						'<input type="', opt.type, '" ng-model="values.', opt.name, '" /> ',
						$translate.instant(opt.placeholder),
					'</label>'].join(''));

					break;
				case 'radio':
					result.push(['<label>',
						'<input type="', opt.type, '" ng-model="values.', opt.name, '" value="', Kekkai.data.doNvl(opt.value, opt.name), '" /> ',
						$translate.instant(opt.placeholder),
					'</label>'].join(''));

					break;
				}
			});
			return result.join('');
		};

		function generateContentHTML(inputOpts) {
			var result = [];

			(angular.isArray(inputOpts)? inputOpts : Kekkai.data.isEmptyValue(inputOpts)? [] : [inputOpts]).forEach(function(inputOpt) {
				result.push(['<fieldset class="prompt-input">',
					'<legend>', $translate.instant(inputOpt.label), '</legend>', 
					generateInputHTML(inputOpt),
				'</fieldset>'].join(''));
			});
			return result.join('');
		};

		function showModal(titleIcon, title, content, inputOpts) {
			return $(['<div id="confirm-' + uid + '" class="kekkai-modal modal fade">',
				'<div class="modal-dialog modal-sm">',
					'<div class="modal-content">',
						Kekkai.data.isEmptyValue(title)? '' : ['<div class="modal-header">',
							'<button type="button" class="close" data-dismiss="modal" aria-label="Close">',
								'<span aria-hidden="true">&times;</span>',
							'</button>',

							'<h4 class="modal-title">',
								'<span class="', titleIcon, '"></span> ',
								$translate.instant(title),
							'</h4>',
						'</div>'].join(''),

						'<div class="modal-body">',
							'<p>', $translate.instant(content), '</p>',
							generateContentHTML(inputOpts),
						'</div>',

						'<div class="modal-footer">',
							'<button type="button" class="btn btn-default" data-dismiss="modal">',
								'<span class="glyphicon glyphicon-remove"></span> ',
								$translate.instant('KEKKAI_BTN_CANCEL'),
							'</button>',

							'<button type="button" class="btn btn-primary" data-dismiss="modal" ng-click="isConfirmed = true">',
								'<span class="glyphicon glyphicon-ok"></span> ',
								$translate.instant('KEKKAI_BTN_CONFIRM'),
							'</button>',
						'</div>',
					'</div>',
				'</div>',
			'</div>'].join('')).appendTo('body')
		};

		return {
			info: function(title, content) {
				showAlert('info', title, content);
			},

			success: function(title, content) {
				showAlert('success', title, content);
			},

			warning: function(title, content) {
				showAlert('warning', title, content);
			},

			danger: function(title, content) {
				showAlert('danger', title, content);
			},

			confirm: function(title, content, callbackFn) {
				var $confirmModal = showModal('glyphicon glyphicon-question-sign', title, content),
					scope         = angular.element($confirmModal[0]).scope();

				$compile($confirmModal[0])(scope);

				$confirmModal.modal('show').on('hidden.bs.modal', function() {
					callbackFn(scope.isConfirmed === true);
					$('#confirm-' + uid).remove();
				});
			},

			prompt: function(title, content, inputs, callbackFn) {
				var $confirmModal = showModal('glyphicon glyphicon-edit', title, content, inputs),
					scope         = angular.element($confirmModal[0]).scope(),
					isConfirmed;

				scope.values = {};
				$compile($confirmModal[0])(scope);

				$confirmModal.modal('show')
					.on('hide.bs.modal', function() {
						var emptyCnt = 0;

						isConfirmed = scope.isConfirmed === true;
						delete scope.isConfirmed;

						Object.keys(scope.values).forEach(function(fieldName) {
							emptyCnt += Kekkai.data.isEmptyValue(scope.values[fieldName])? 1 : 0;
						});
						return isConfirmed !== true || (emptyCnt === 0 && Object.keys(scope.values).length > 0);
					})
					.on('hidden.bs.modal', function() {
						callbackFn(isConfirmed === true, scope.values);
						$('#confirm-' + uid).remove();
					});
			}
		};
	});
});