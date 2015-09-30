(function(angular) { 

  angular.module('analytics', ['ng']).service('analytics', [
    '$rootScope', '$window', '$location', function($rootScope, $window, $location) {
      var track = function() {
        $window.ga('send', 'pageview', { page: $location.url() });
      };
      $rootScope.$on('$viewContentLoaded', track);
    }
  ]);

}(window.angular));