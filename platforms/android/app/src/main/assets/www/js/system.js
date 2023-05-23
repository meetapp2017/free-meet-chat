'use strict';

// service chat
freeChat.factory('Chat', function ($rootScope) {

	var baseChat = {

		join : function (user, socket) {
			socket.emit('join', user);
			return socket;
		},

		send_group_message: function (msg, socket) {
			socket.emit('send_group_message', msg);
		},

	};

	return baseChat;
})


freeChat.factory('system', function ($rootScope, $q, $timeout, $window, $ionicModal, $ionicPopup, $ionicScrollDelegate, Chat) {

	$.ajaxSetup({
		async : false
	});

	return {
		profile: null,
		socket: null,
		baseUrl : '',
        mainUrl:  "https://kazanlachani.com",

		freeChat_upload_url: "https://kazanlachani.com/FreeChat/uploads/",
		upload_file_url: "https://kazanlachani.com/FreeChat/services/upload.php",
		freeChat_base_url: "https://kazanlachani.com/FreeChat/services",

		ad_android_key: 'ca-app-pub-2108590561691007/2190161573',
		interstitial: 'ca-app-pub-2108590561691007/3666894772',
		//interstitial: 'ca-app-pub-3940256099942544/1033173712',
		adCount: 0,
		maxAdCount: 6,

		showLoading: function (_title) {

			if (typeof cordova.plugin.pDialog === "undefined") return false;

			cordova.plugin.pDialog.init({
				theme : 'HOLO_DARK',
				progressStyle : 'SPINNER',
				cancelable : false,
				title : 'Please wait...',
				message : _title
			});
		},

		init: function () {

			if (this.profile != null)
			{

				this.showLoading("Loading...");
				var mainObject = this;

				document.addEventListener('onAdLoaded', function (e) {

					var res = mainObject.showInterstitialAd();
					res.then(function (state) {
						AdMob.isInterstitialReady(function () {
							cordova.plugin.pDialog.dismiss();
						});
					});
				});

				$timeout(function () {

					cordova.plugin.pDialog.dismiss();

					if (mainObject.pack_state > 0)
					{
						var c = confirm("New version is available, please download?");
						if (c)
							window.open('market://details?id=' + mainObject.pack_name, '_system');
					}

				}, 3000);

				this.InitAdMob();

			}

		},

		showIcon: function ($scope) {

			var mainObject = this;

			if (mainObject.profile == null){

				mainObject.checkProfile($scope);
				return false;

			}

			$ionicModal.fromTemplateUrl('views/icon.html', function (modal) {
				$scope.icon = modal;
				$scope.icon.show();

			}, {
				scope : $scope,
				animation : 'fade-in'
			});

			$scope.close_icons =  function () {
				$scope.icon.hide();
			}

			$scope.hide_icons =  function (message) {
				$scope.icon.hide();
				mainObject.do_socket_message($scope, message, 1);

			}

		},

		checkProfile: function ($scope) {

			var mainObject = this;

			mainObject.profile = $.parseJSON(localStorage.getItem('profile'));

			//init rootScope profile
			$rootScope.profile = {};

			if (mainObject.profile != null)
				$rootScope.profile = mainObject.profile;

			if (mainObject.profile == null)
			{
				$ionicModal.fromTemplateUrl('views/edit.html', function (modal) {
					$rootScope.edit = modal;
					$rootScope.edit.show();

				}, {
					scope : $rootScope,
					animation : 'fade-in'
				});

				$rootScope.OnUpdateProfile = function () {
					mainObject.setMakeProfile();
				}
			}
			else
				this.registerSocket($scope);

		},

		showToAst : function (str) {
			var toast = new Toast();
			toast.showLongCenter(str, function (a) {}, function (b) {});
		},

		Existing_photo: function () {

			var _mainObject = this;

			var _title = "Upload Photo";
			var _descr = "Warning: Please do not upload adult or offensive content.Any violators will be permanently banned.Thank you for your love!";

			var confirmPopup = $ionicPopup.alert({
				title: _title,
				template: _descr
			});

			confirmPopup.then(function(res) {
				if(res)
					_mainObject.OpenGallery();
			});
		},

		OpenGallery: function () {

			var _mainObject = this;

			// Retrieve image file location from specified source
			navigator.camera.getPicture(uploadPhoto, function (message) {
				//
			}, {
				quality : 50,
				destinationType : navigator.camera.DestinationType.FILE_URI,
				sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY
			});


			function uploadPhoto(imageURI) {

				_mainObject.showLoading("Uploading...");

				var options = new FileUploadOptions();
				options.fileKey = "file";
				options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
				options.mimeType = "image/jpeg";

				var params = new Object();

				params.id = _mainObject.profile.user_id;
				params.username = _mainObject.profile.username;
				options.params = params;

				options.chunkedMode = true;

				var ft = new FileTransfer();
				ft.upload(imageURI, _mainObject.upload_file_url, win, fail, options);

			}

			function win(r) {

				var result = JSON.parse(JSON.stringify(r));
				var checkResult = (result.response.indexOf("imagecreatefromjpeg") !== -1);

				if (!checkResult) {
					var image_url = _mainObject.freeChat_upload_url + result.response.replace(/\"/g, "");

					var res = _mainObject.checkExistPhotoUrl(image_url);

					res.then(function (state) {
						if (state) {

							$rootScope.profile = _mainObject.profile;
							$rootScope.profile.canRemove = true;
							localStorage.setItem('profile', JSON.stringify(_mainObject.profile));

						}
					});

				cordova.plugin.pDialog.dismiss();

				}
				else
				{
					_mainObject.showToAst("Invalid JPEG file, try another!");

					$timeout(function () {
						cordova.plugin.pDialog.dismiss();
					}, 500);
				}

			}

			function fail(error) {
				$timeout(function () {
					cordova.plugin.pDialog.dismiss();
				}, 500);

				_mainObject.showToAst("Uploading your photo was not successful!");
			}

		},

		checkExistPhotoUrl: function (result) {

			var _mainObject = this;
			var d = $q.defer();

			var image_url = result; //_mainObject.freeChat_upload_url + result.response.replace(/\"/g, "");

			 var http = new XMLHttpRequest();

			http.open('HEAD', image_url, false);
			http.send();

			if (http.status != 404)
			{
				_mainObject.profile.ThumbName = image_url;
				d.resolve(true);
			}
			else
				d.resolve(false);

			return d.promise;


		},


		checkAgreements: function(callback){

			$ionicModal.fromTemplateUrl('views/terms.html', function (modal) {

				$rootScope.terms = modal;
				$rootScope.terms.show();

			}, {
				scope : $rootScope,
				animation : 'fade-in'
			});

			$rootScope.open_privacy = function(){
				window.open('https://kazanlachani.com/terms/privacy.html','_system');
			}

			$rootScope.open_terms = function(){
				window.open('https://kazanlachani.com/terms/terms.html', '_system');
			}

			$rootScope.close_terms = function(){
				callback(false);
			}

			$rootScope.done = function(){
				callback(true);
			}

		},

		setMakeProfile: function () {

			var mainObject = this;

			mainObject.checkAgreements(function(state){
				$rootScope.terms.remove();
				if (state)
				{


					if (!$rootScope.profile.username) {
					mainObject.showToAst("Invalid UserName!");
					return false;
				}

				else if ((!$rootScope.profile.gender) || ($rootScope.profile.gender.gender == "")) {
					mainObject.showToAst("Please choose your gander");
					return false;
				}

				else if ((!$rootScope.profile.age) || ($rootScope.profile.age.age == "")) {
					mainObject.showToAst("Please choose your age");
					return false;
				}

				else
				{
					mainObject.showLoading("Loading ...");

					// create new profile
					var _ThumbName = ($rootScope.profile.gender.name == 'Female') ? mainObject.mainUrl +'/ify/images/female_icon.png': mainObject.mainUrl + '/ify/images/man_icon.png';

					mainObject.profile = {
						user_id : '12345' + '_' + $rootScope.profile.username,
						username: $rootScope.profile.username,
						gender: $rootScope.profile.gender.name,
						age: $rootScope.profile.age.age,
						ThumbName: _ThumbName,
						payment: 0
					}

					localStorage.setItem('profile', JSON.stringify(mainObject.profile));
					$rootScope.profile = mainObject.profile;
					mainObject.init();
					$rootScope.edit.remove();
					cordova.plugin.pDialog.dismiss();
					$window.location.reload(true);

				}

				}
			});

		},

		InitAdMob: function () {

			if (AdMob) {

				/*
				AdMob.createBanner(
				{
					adId: this.ad_android_key,
					position:AdMob.AD_POSITION.BOTTOM_CENTER,
					autoShow:true
				});
				*/

				AdMob.prepareInterstitial( {adId:this.interstitial, autoShow:false} );

			}

		},

		showInterstitialAd: function () {

			var d = $q.defer();

			AdMob.showInterstitial();
			d.resolve(true);

			return d.promise;

		},

		initScope : function () {

			$rootScope.genders =
				[{
					name : 'Male'
				}, {
					name : 'Female'
				}
			];

			$rootScope.ages = [{
					age : '18'
				}, {
					age : '19'
				}, {
					age : '20'
				}, {
					age : '21'
				}, {
					age : '22',
				}, {
					age : '23'
				}, {
					age : '24'
				}, {
					age : '25'
				}, {
					age : '26'
				}, {
					age : '27'
				}, {
					age : '28'
				}, {
					age : '29'
				}, {
					age : '30'
				}, {
					age : '31'
				}, {
					age : '32'
				}, {
					age : '33'
				}, {
					age : '34'
				}, {
					age : '35'
				}, {
					age : '36'
				}, {
					age : '37'
				}, {
					age : '38'
				}, {
					age : '39'
				}, {
					age : '40'
				}, {
					age : '41'
				}, {
					age : '42'
				}, {
					age : '43'
				}, {
					age : '44'
				}, {
					age : '45'
				}, {
					age : '46'
				}, {
					age : '47'
				}, {
					age : '48'
				}, {
					age : '49'
				}, {
					age : '50'
				}, {
					age : '51'
				}, {
					age : '52'
				}, {
					age : '53'
				}, {
					age : '54'
				}, {
					age : '55'
				}, {
					age : '56'
				}, {
					age : '57'
				}, {
					age : '58'
				}, {
					age : '59'
				}, {
					age : '60'
				}
			];

		},

		loadSocket: function () {

			var socket = null;
			var mainObject = this;
			$.ajax({
				url : mainObject.mainUrl + '/ify/services/getBaseUrl.php',
				type : 'POST',
				dataType : 'json',
				data : null,
				cache : false,
				success : function (_data) {

					var data = JSON.parse(JSON.stringify(_data[0]));
					var socket_chat_url = JSON.parse(JSON.stringify(data)).socket_chat_url;
					mainObject.baseUrl = JSON.parse(JSON.stringify(data)).baseUrl;

					//version of app
					mainObject.pack_state = JSON.parse(JSON.stringify(data)).pack_state;
					mainObject.pack_name = JSON.parse(JSON.stringify(data)).pack_name;

					if (typeof(socket_chat_url) === 'undefined')
						return false;

					socket = io.connect(socket_chat_url, {
							'forceNew' : true,
							'reconnect' : true,
							'reconnection delay' : 500,
							'max reconnection attempts' : 10
						});

					socket.on('connect', function () {
					    //console.log("connected");
					});

					socket.on('disconnect', function () {
						//
					});

				},

				error : function (err) {
					return "error";
				}

			});

			return socket;

		},

		registerSocket: function ($scope) {

			if (!this.socket) {
				var socket = this.loadSocket();
				this.socket = Chat.join(this.profile, socket);
				this.initSocket($scope); // register for socket call back function
			}
			else
				this.socket = Chat.join(this.profile);

		},

		initSocket: function ($scope) {

			var mainObject = this;
			this.socket.on('send_group_message', function (msg) {

				var data = JSON.parse(JSON.stringify(msg));
				var content = data.content;
				$scope.$apply(function (e) {

					$scope.messages.push({
					  user_id: content.user_id,
					  c_username: content.username,
					  gender: content.gender,
					  age: content.age,
					  message: content.message,
					  date: content.date,
					  ThumbName: content.ThumbName,
					});

					$timeout(function () {
						$ionicScrollDelegate.scrollBottom(true);

						$rootScope.NotificationCount++;
						if ($rootScope.NotificationCount == $rootScope.MaxNotificationCount)
						{
							mainObject.checkForNotification(content);
							$rootScope.NotificationCount = 0;
						}

					}, 500);
				});

			});

		},

		checkForNotification: function (content) {

			//var _username = username + " Upload a new Photo";
			var _username = content.username + ": " + content.message;
			var statusBar = new StatusBar();
			statusBar.goStatusBar(_username, function () {}, function () {});
		},


		do_socket_message: function ($scope, _message, _code) {

			var mainObject = this;

			var message = {
				user_id : '12345' + '_' + mainObject.profile.username,
				username : mainObject.profile.username,
				gender: mainObject.profile.gender,
				age: mainObject.profile.age,
				date : mainObject.timeNow(true),
				message : _message,
				ThumbName : mainObject.profile.ThumbName,
				code : _code
			}

			mainObject.sendChatMessage(message);

		},


		sendChatMessage: function (message) {

			Chat.send_group_message(message, this.socket);
			this.save_group_chat_Message(message);

		},

		save_group_chat_Message: function (message) {

			var data = {
				user_id : message.user_id,
				username : message.username,
				date : this.timeNow(true),
				message : message.message,
				ThumbName : message.ThumbName,
				code : message.code,
				method: 'insert'
			}

			this.request(this.baseUrl, "public_chats.php", data, this, function (_data, mainObject) {
				//
			})
		},


		load_group_chat_Message: function () {

			var d = $q.defer();

			var data = {
				method: 'load'
			}

			this.request(this.baseUrl, "public_chats.php", data, this, function (_data, mainObject) {

				var messages = JSON.parse(JSON.stringify(_data));
				d.resolve(messages);

			})


			return d.promise;
		},

		request : function (_url, _file, _data, mainObject, results) {

			$.ajax({
				url : _url + '/' + _file,
				type : 'POST',
				dataType : 'json',
				data : _data,
				cashe : false,
				success : function (data) {

					results(data, mainObject);
				},

				error : function (err) {
					return "error";
				}

			});

		},

		timeNow : function (hasYear) {

			var d = new Date();

			if (hasYear) {
				var year = d.getFullYear();
				var month = d.getMonth() + 1;

				if (month < 10)
					month = '0' + month;

				var day = d.getDate();
				if (day < 10)
					month = '0' + day;
			}

			var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
			var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
			var s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

			if (hasYear)
				return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
			else
				return h + ':' + m + ':' + s;
		},


		block_user: function(user) {

			var d = $q.defer();
			var data = {
				username : user.userInfo,
				method: 'block_user'
			}

			this.request(this.baseUrl, "public_chats.php", data, this, function (_data, mainObject) {
				d.resolve(true);
			})

			return d.promise;

		},

		send_report_email: function(user) {

			var d = $q.defer();
			var data = {
				user_id : user.user_id,
				username : user.userInfo,
				message : "Inappropriate profiles, contains nudity or pornographic photos",
				ThumbName : user.ThumbName,
				method: 'send_report_email'
			}

			this.request(this.baseUrl, "public_chats.php", data, this, function (_data, mainObject) {
				d.resolve(true);
			})

			return d.promise;

		},

		nativeConfirm : function (title, descr, result) {

            var confirm = new Confirm();

            confirm.openConfirm(title, descr, "Cancel", "", "OK", function (data) {

                if (typeof data === "undefined") {
                    alert("Error data is undefined report as a bug");
                    result(false);
                }

                var res = JSON.parse(data);

                if (res.body == "") {
                    alert("Error response body is empty report as a bug");
                    result(false);
                }

                if (res.body == "cancel") {
                    result(false);
                }

                if (res.body == "confirm") {
                    result(true);
                }

            }, function () {
                alert("Error while show confirm button.See xml file or report as a bug!");
            });

        }

	}
})
