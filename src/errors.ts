import * as Errors from '@tradle/errors'

class InvalidSignature extends Errors.UserError {
  public type = 'InvalidSignature'
}

class NotImplemented extends Error {
  public type = 'NotImplemented'
}

class Unsupported extends Error {
  public type = 'Unsupported'
}

export = {
  ...Errors,
  InvalidSignature,
  NotImplemented,
  Unsupported
}
