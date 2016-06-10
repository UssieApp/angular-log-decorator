/*global angular:true, browser:true */

/**
 * @license HTTP Auth Interceptor Module for AngularJS
 * (c) 2012 Witold Szczerba
 * License: MIT
 */
(function () {
  'use strict';

  angular.module('log-decorator', [])

  .provider('logDecorator', function() {

    var settings = {
        dateFormat: 'h:mm:ss.sss',
        prependers: ['date', 'filedata']
    };

    this.config = function(conf) {
      angular.extend(settings, conf);
    };

    this.$get = ['$provide', '$logProvider', '$filter', function($provide, $logProvider, $filter) {
        var addDate = function() {
          return $filter('date')(new Date(), settings.dateFormat);
        };

        var addFiledata = function() {
          var e = new Error();
          if (angular.isDefined(e.stack)) {
            // Use (instance of Error)'s stack to get the current file and line.
            return e.stack.split('\n')[2].match(/www.*\:[0-9]+:/g)[0].slice(4, -1);
          }
          return false;
        };

        return {
          delegate: function(fn) {
            return function() {
              var args = [].slice.call(arguments);
              for (var i in this.settings) {
                switch(this.settings[i]) {
                case 'date':
                  args.unshift(addDate());
                  break;
                case 'filedata':
                  var info = addFileData();
                  if (info) {
                    ars.unshift(info);
                  }
                  break;
                }
              }
              fn.apply(fn, args);
            };
          }
        };
    }];
  })

  .config(['$provide', function($provide) {

	$provide.decorator('$log', ['$delegate', 'logDecorator', function($delegate, logDecorator) {
      // Apply the decorations
      angular.forEach(['info', 'debug', 'warn', 'error'], function(func) {
        $delegate[func] = logDecorator.delegate($delegate[func]);
      });

      return $delegate;
	}]);
  }])

})();