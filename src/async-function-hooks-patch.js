require('tslib').__awaiter = hookingAwaiter;

var onReturnHooks = [], onAwaitHooks = [];

module.exports.registerHooks = function (asyncFunctionHooks) {
  if (typeof asyncFunctionHooks.onReturn === 'function') {
    onReturnHooks.push(asyncFunctionHooks.onReturn);
  }

  if (typeof asyncFunctionHooks.onAwait === 'function') {
    onAwaitHooks.push(asyncFunctionHooks.onAwait);
  }
};

function hookingAwaiter(thisArg, _arguments, P, generator) {
  var controller = {
    return: function (value) {
      return generator.return(value);
    }
  };

  var retPromise = new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) {
      var awaitedValue = invokeHooks(onAwaitHooks, controller, result.value);
      result.done ? resolve(awaitedValue) : new P(function (resolve) { resolve(awaitedValue); }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });

  return invokeHooks(onReturnHooks, controller, retPromise);
}

function invokeHooks(hooks, controller, value) {
  for (var i = 0; i < hooks.length; ++i) {
    var retValue = hooks[i](controller, value);
    value = typeof retValue === 'undefined' ? value : retValue;
  }

  return value;
}
