var freeChat = angular.module('FreeChat', ['ionic'])


freeChat.directive('input', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element, attr) {
      element.bind('focus', function(e) {
        if (scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });
      element.bind('blur', function(e) {
        if (scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          if (scope.returnClose) element[0].blur();
          if (scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  }
})

// Ionic run function
freeChat.run(function ($rootScope, $ionicPlatform, $ionicHistory, $window, $ionicModal, $timeout, $ionicScrollDelegate, system) {

	$ionicPlatform.ready(function () {
		
		$rootScope.NotificationCount = 0;
		$rootScope.MaxNotificationCount = 20;
		$rootScope.checkCorrectProfilePhoto = false;
		
		ionic.Platform.isFullScreen = false;		
		system.initScope();
		system.init();
		
		
		window.addEventListener('native.keyboardshow', keyboardShowHandler);

		function keyboardShowHandler(e){			
			AdMob.hideBanner();
			$timeout(function() {
				$ionicScrollDelegate.scrollBottom(true);				
			}, 100);	
		}
		
		
		window.addEventListener('native.keyboardhide', keyboardHideHandler);

		function keyboardHideHandler(e){			
			AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);	
			$timeout(function() {
				$ionicScrollDelegate.scrollBottom(true);				
			}, 100);	
		
		}

		
		document.addEventListener('deviceready', function () {
		  document.addEventListener('backbutton', function (event) {
			
			if (!system.profile)
			{
				
				event.preventDefault();
				if(!confirm("Are you sure you want to exit"))
				{
					system.checkProfile($rootScope);
					return false;
				}
				else
					navigator.app.exitApp();
				
			}
			
		  }, false);
		}, false);
		
	});
	
	
	$ionicPlatform.registerBackButtonAction(function (e) {
		
		//check app state
		if ($rootScope.appState) {
			var home = new Home();
			home.goHome(function () {}, function () {});
		} else {
			if ($rootScope.backButtonPressedOnceToExit) {

				var home = new Home();
				home.goHome(function () {}, function () {});
			} else if ($ionicHistory.backView()) { 
				$ionicHistory.goBack(); 
			} else {
				$rootScope.backButtonPressedOnceToExit = true;
				system.showToAst("Press back button again to exit");
				setTimeout(function () {
					$rootScope.backButtonPressedOnceToExit = false;
				}, 2000);
			}
			e.preventDefault();
			return false;
		}

	}, 101);
	
	
});
