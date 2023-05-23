
//controllers
freeChat.controller('Messages', function($scope, $rootScope, $timeout, $ionicScrollDelegate, $ionicModal, $ionicPopup, system, $window) {
  
	system.checkProfile($scope);
	
	var res = system.load_group_chat_Message();
								
	res.then(function (messages) {					
		$scope.messages = messages;
		$timeout(function() {			
			$ionicScrollDelegate.scrollBottom(true);
		}, 2000);		
		
	});
	
	var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

	
	$("#send_message").click(function (e) {
		e.preventDefault();
		$timeout(function() {			
			$("#send_msg").focus();
		});
		
	});
	
	$scope.sendMessage = function() {
	 
		if (system.profile == null){
			
			system.checkProfile($scope);
			return false;
				
		}
		
		if (!$scope.data.message) {
			alert("Please write something ...");
			return false;
		}
		
		
		system.do_socket_message($scope, $scope.data.message, 0);
		
		delete $scope.data.message;
		
		$timeout(function() {
			$ionicScrollDelegate.scrollBottom(true);				
		}, 500);		
				
		
		/* stop showing ads here 		
		system.adCount++;
		
		if (system.adCount == system.maxAdCount - 1)
			system.init();
		
		if (system.adCount == system.maxAdCount){	  		
		  system.showInterstitialAd();
		  system.adCount = 0;	  
		}
		*/
	
	};


	$scope.inputUp = function() {
		if (isIOS) $scope.data.keyboardHeight = 216;
		$timeout(function() {
			$ionicScrollDelegate.scrollBottom(true);
		}, 500);

	};

	$scope.inputDown = function() {
		if (isIOS) $scope.data.keyboardHeight = 0;
		$ionicScrollDelegate.resize();
	};

	$scope.closeKeyboard = function() {
		// cordova.plugins.Keyboard.close();
	};
	
	$scope.setUserName = function (message) {
		
		$scope.data.message = message.c_username + ' ';
	}

	$scope.showProfile = function (message) {
		
		$scope.hasPhoto = true;
		if ( (message.ThumbName === system.mainUrl + "/ify/images/female_icon.png") || (message.ThumbName === system.mainUrl + "/ify/images/man_icon.png") ) 
		$scope.hasPhoto = false;
		
		$scope.user = {
			userInfo:  message.c_username,
			ImageName: message.ThumbName.replace("thumbs/", ""),
			ThumbName: message.ThumbName
			
		}
				
		if (message.user_id == system.profile.user_id)
			$scope.user.userInfo = system.profile.username + ', ' + system.profile.age + ', ' + system.profile.gender; 
			
		$ionicModal.fromTemplateUrl('views/userView.html', function (modal) {
			$scope.userView = modal;
			$scope.userView.show();
			
		}, {
			scope : $scope,
			animation : 'fade-in'
		});
		

		$scope.OnCloseUserView = function () {
			
			$scope.userView.hide();
		}
		 
		
	}
	
	$scope.show_icons =  function () {
		system.showIcon($scope);
	}  
	
	
	$scope.UploadPhoto = function () {
		
		if (system.profile == null){
			
			system.checkProfile($scope);
			return false;		
		}
		
		system.Existing_photo();		
	}
	
	
	$scope.removePhoto =  function () {
		var c = confirm("Are you sure you want to remove existing photo?");
		if (c)
		{
			var _ThumbName = (system.profile.gender == 'Female') ? system.mainUrl + '/ify/images/female_icon.png': system.mainUrl + '/ify/images/man_icon.png';
			system.profile.ThumbName = _ThumbName;
			system.profile.canRemove = false;
			localStorage.setItem('profile', JSON.stringify(system.profile));	
		}
	}  
	
	
	$scope.block_user = function(user) {
		
		var str = "You can block inappropriate profiles, contains nudity or pornographic photos."
		system.nativeConfirm("Block user", str, function (res) {

			if (res) {
				
				var result = system.block_user(user);
				result.then(function (state) {		
							
					if (state){
						$scope.OnCloseUserView();
						setTimeout(function (){
							alert("User was blocked!");				
							$window.location.reload(true);
						}, 500)
						
					}
				});

			}

		});
			
	}
	
	$scope.report_user = function(user) {
		
		var str = "You can report inappropriate profiles, contains nudity or pornographic photos."
		system.nativeConfirm("Report user", str, function (res) {

			if (res) {
				
				var result = system.send_report_email(user);
				result.then(function (state) {				
					if (state){
						$scope.OnCloseUserView();
						setTimeout(function (){
							alert("Thnaks! User was reported!");	
						}, 500)
						
					}
				});

			}

		});
			
	}
	
	
	$scope.help_me = function () {
		
		var _title = "User guide";
		var _descr = "<p>*** Tap the user message to get username into text field! </p> <p>*** Hold scroll position to read previous messages</p>";

		var confirmPopup = $ionicPopup.alert({
		 title: _title,
		 template: _descr
	   });

		
	}
	
	$scope.RateApp = function () {
		
		var _title = "Rate Meet Chat";
		var _descr = "If you enjoy using Meet Chat, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!";

		var confirmPopup = $ionicPopup.confirm({
		 title: _title,
		 template: _descr
	   });

	   confirmPopup.then(function(res) {
		 if(res) {
		   window.open('market://details?id=com.meet.chat', '_system');
		 } else {
			//
		 }
	   });
				
	}
	
	$scope.share = function () {
		
		var share = new Share();
		
		share.show({
			subject : 'The new way to find someone Meet Chat - Meet New people',
			text : 'https://play.google.com/store/apps/details?id=com.meet.chat'
		},
			function () {
			$scope.popover.hide();
		},
			function () {			
			alert("Share failed");
		} 
		);
		
	}	
	
	$scope.data = {};	
	$scope.messages = [];
  
});

