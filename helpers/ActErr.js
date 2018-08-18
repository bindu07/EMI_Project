'use strict';

global.ActErr = ActErr;
ActErr.InternalServer = 666;

ActErr.DBOperationFailed = 1001;
ActErr.ProviderUnavailable = 1002;
ActErr.BraintreeError = 1003;
ActErr.EnqueueFailed = 1004;
ActErr.Connector500 = 1005;

ActErr.Unauthorized = 2000;
ActErr.CallerAccountNotFound = 2001;
ActErr.NoValidOwner = 2002;
ActErr.InvalidToken = 2003;
ActErr.Connector300 = 2004;
ActErr.Connector400 = 2005;

ActErr.ProviderTokenInvalid = 3001;

ActErr.DBEntityNotFound = 4001;
ActErr.ParamNotFound = 4002;
ActErr.InvalidParam = 4003;
ActErr.DataNotFound = 4004;
ActErr.OperationFailed = 4005;
ActErr.ApiServerError = 4006;
ActErr.PlanLimitation = 4007;
ActErr.DependencyCheckFailed = 4008;
ActErr.WebhookNotSupported = 4009;
ActErr.BodyNotFound = 4010;
ActErr.DBDuplicateKeyError = 4011;
ActErr.ObjectAlreadyExists = 4012;
ActErr.BuildMinutesExceeded = 4015;
ActErr.ProviderRateLimit = 4017;

function ActErr(methodName, id, message, error) {
  //handle logType
  if (id >= 1000 && id < 2000)
    this.logType = 'error';
  else if (id >= 2000 && id < 3000)
    this.logType = 'warn';
  else if (id >= 3000 && id < 4000)
    this.logType = 'info';
  else if (id >= 4000 && id < 5000)
    this.logType = 'verbose';
  else {
    id = 666;
    this.logType = 'error';
  }

  this.methodName = methodName || 'unknown method';
  this.id = id;
  this.message = message || 'unknown error';
  if (error) {
    this.link = error;
  }
}
