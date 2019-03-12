import * as Errors from '@tradle/errors'

class InvalidSignature extends Errors.UserError {
  public type = 'InvalidSignature'
}

class Forbidden extends Errors.UserError {
  public type = 'Forbidden'
}

class NotImplemented extends Error {
  public type = 'NotImplemented'
}

class Unsupported extends Error {
  public type = 'Unsupported'
}

class Conflict extends Error {
  public type = 'Conflict'
}

export = {
  ...Errors,
  InvalidSignature,
  NotImplemented,
  Unsupported,
  Forbidden,
  Conflict
}
