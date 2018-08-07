'use strict';

define(['app'], function(app) {

    app.directive('kekkaiEditorModal', function() {
        return {
            restrict : 'A',
            link     : function(scope, el) {
                var $ctrl = scope.$kekkaiDataview;

                $(el).on('hidden.bs.modal' , function() {
                    $ctrl.container.todoGroup.clearEditing(true);
                    angular.element(el).scope().$apply();
                });

                if($ctrl.container.todoGroup.isEditing
                && 'CreateByEditor' === $ctrl.container.todoGroup.editingTodo.mode
                && $ctrl.container.todoGroup.editingData.indexOf($ctrl.kekkaiData) >= 0)
                    $(el).modal('show');
            }
        };
    });
});