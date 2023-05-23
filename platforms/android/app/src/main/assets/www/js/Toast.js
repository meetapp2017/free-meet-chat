 var Toast = function() {};


  Toast.prototype.show = function (message, duration, position, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "Toast", "show", [message, duration, position]);
  };

  Toast.prototype.showShortTop = function (message, successCallback, errorCallback) {
    this.show(message, "short", "top", successCallback, errorCallback);
  };

  Toast.prototype.showShortCenter = function (message, successCallback, errorCallback) {
    this.show(message, "short", "center", successCallback, errorCallback);
  };

  Toast.prototype.showShortBottom = function (message, successCallback, errorCallback) {
    this.show(message, "short", "bottom", successCallback, errorCallback);
  };

  Toast.prototype.showLongTop = function (message, successCallback, errorCallback) {
    this.show(message, "long", "top", successCallback, errorCallback);
  };

  Toast.prototype.showLongCenter = function (message, successCallback, errorCallback) {
    this.show(message, "long", "center", successCallback, errorCallback);
  };

  Toast.prototype.showLongBottom = function (message, successCallback, errorCallback) {
    this.show(message, "long", "bottom", successCallback, errorCallback);
  };

var toast = new Toast();
 