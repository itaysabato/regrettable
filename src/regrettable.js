var WeakMap = require('es6-weak-map');

var registerHooks;
var controllersToState = new WeakMap();
var promisesToControllers = new WeakMap();

module.exports.register = function (_registerHooks) {
  if (!registerHooks) {
    registerHooks = _registerHooks || require('./async-function-hooks-patch').registerHooks;

    registerHooks({
      onReturn: onReturnHook,
      onAwait: onAwaitHook,
    });
  }
};

module.exports.cancelable = function (asyncFuncOrValue) {
  if (typeof asyncFuncOrValue === 'function') {
    // todo: Naively assumes it's an async function:
    return wrapAsyncFunction(asyncFuncOrValue);
  }
  else {
    return wrapValue(asyncFuncOrValue);
  }
};

module.exports.cancel = function (promise) {
  propagateAndCancel(promise);
};

function onReturnHook(controller, retPromise) {
  promisesToControllers.set(retPromise, controller);
}

function onAwaitHook(controller, awaitedValue) {
  var state = controllersToState.get(controller);
  if (!state) {
    controllersToState.set(controller, state = {});
  }

  state.following = awaitedValue;

  return new Promise(function (resolve, reject) {
    Promise.resolve(awaitedValue)
    .then(function (value) {
      if (!state.canceled) {
        resolve(value);
      }
    })
    .catch(function (err) {
      if (!state.canceled) {
        reject(err);
      }
    })
  });
}

function wrapAsyncFunction(asyncFunc) {
  return function () {
    var promise = asyncFunc.apply(this, arguments);

    var controller = promise && promisesToControllers.get(promise);
    var state = controller && controllersToState.get(controller);

    if (state) {
      state.cancelable = true;
    }

    return promise;
  }
}

function wrapValue(asyncFuncOrValue) {
  var controller = {
    return: function () {
      return {done: true};
    }
  };

  var retPromise = onAwaitHook(controller, asyncFuncOrValue);
  onReturnHook(controller, retPromise);

  controllersToState.get(controller).cancelable = true;

  return retPromise;
}

function propagateAndCancel(candidate) {
  var controller = candidate && promisesToControllers.get(candidate);
  var state = controller && controllersToState.get(controller);

  if (state && state.cancelable) {
    state.canceled = true;
    propagateAndCancel(state.following);
    end(controller);
  }
}

function end(controller) {
  var result;

  try {
    do {
      result = controller.return();
    } while (!result.done);
  }
  catch (e) {
    console.err("Suppressed error during cancellation:", e);
  }
}
