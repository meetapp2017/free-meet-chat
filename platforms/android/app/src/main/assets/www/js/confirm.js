// constructor
function Confirm() {

}

Confirm.prototype.openConfirm = function(title, descr, cancelButton, otherButton, confirmButton, successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "Confirm", "openConfirm", [title, descr, cancelButton, otherButton, confirmButton]);
}

Confirm.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.Confirm = new Confirm();
  return window.plugins.confirm;
};

cordova.addConstructor(Confirm.install);