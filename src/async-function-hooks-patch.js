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
      var awaitedValue = invokeOnAwaits(controller, result.value);
      result.done ? resolve(awaitedValue) : new P(function (resolve) { resolve(awaitedValue); }).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });

  return invokeOnReturns(retPromise, controller);
}

function invokeOnReturns(retPromise, controller) {
  for (var i = 0; i < onReturnHooks.length; ++i) {
    retPromise = onReturnHooks[i](retPromise, controller) || retPromise;
  }

  return retPromise;
}

function invokeOnAwaits(controller, awaitedValue) {
  for (var i = 0; i < onAwaitHooks.length; ++i) {
    var retValue = onAwaitHooks[i](controller, awaitedValue);
    awaitedValue = typeof retValue === 'undefined' ? awaitedValue : retValue;
  }

  return awaitedValue;
}
