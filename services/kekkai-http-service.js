'use strict';

define(['app'], function(app) {

	app.factory('KekkaiHttpService', function(
        $http,
        $translate,
        KekkaiMessage
    ) {

        // Request Error Handle
        function $RequestErrorHandle($maskEl) {
            return function(resultData, status, headers, config) {
                KekkaiMessage.danger('[ERROR]', $translate.instant('KEKKAI_MSG_REQUEST_ERROR') + ' (' + status + ')');
                Kekkai.data.doLoading($maskEl, false);
            };
        };

        // Request Success Handle
        function $RequestSuccessHandle($maskEl, callbackFn) {
            return function(resultData, status, headers, config) {
                var errors = resultData.errors;

                if(angular.isObject(errors) && angular.isString(errors.message))
                    KekkaiMessage.warning('[WARNING]', errors.message);
                else if(angular.isFunction(callbackFn))
                    callbackFn(resultData);

                Kekkai.data.doLoading($maskEl, false);
            };
        };

        return {
            doRead: function(maskID, readURL, params, callbackFn) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http.post(readURL, params).error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, callbackFn));
            },

            do: function(maskID, todo, processData) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http[todo.method](todo.url(processData), todo.overrideParam(processData)).error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, todo.onSuccess));
            },

            doAll: function(maskID, todo, params) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http[todo.method](todo.url() + '/all', params).error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, todo.onSuccess));
            },

            getFavourites: function(maskID, favouriteCode, callbackFn) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http.get(Kekkai.config.contextPath + '/kekkai/getFavouriteConfig/' + favouriteCode).error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, callbackFn));
            },

            addFavourite: function(maskID, favouriteCode, option, callbackFn) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http.post(Kekkai.config.contextPath + '/kekkai/addFavourite/' + favouriteCode, option)
                    .error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, callbackFn));
            },

            removeFavourite: function(maskID, favouriteCode, favouriteUID, callbackFn) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http.get(Kekkai.config.contextPath + '/kekkai/removeFavourite/' + favouriteCode + '/' + favouriteUID)
                    .error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, callbackFn));
            },

            switchFavourite: function(maskID, favouriteCode, favouriteUID, callbackFn) {
                var $maskEl = $('#' + maskID);

                Kekkai.data.doLoading($maskEl, true);

                $http.get(Kekkai.config.contextPath + '/kekkai/switchFavourite/' + favouriteCode + '/' + favouriteUID)
                    .error($RequestErrorHandle($maskEl))
                    .success($RequestSuccessHandle($maskEl, callbackFn));
            }
        };
    });
});