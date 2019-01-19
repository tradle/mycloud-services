export class UserError extends Error {
  public type = 'UserError'
}

export class InvalidOption extends UserError {
  public type = 'InvalidOption'
}

export class InvalidSignature extends UserError {
  public type = 'InvalidSignature'
}

export class NotImplemented extends Error {
  public type = 'NotImplemented'
}
