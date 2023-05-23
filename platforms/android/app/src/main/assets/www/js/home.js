var Home = function() {};

Home.prototype.goHome = function(successCallback, errorCallback) {
        return cordova.exec(successCallback, errorCallback, 'Home', 'goHome', []);
 };

 var home = new Home();
 