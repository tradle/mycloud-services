export class UserError extends Error {
  type = 'UserError'
}

export class InvalidOption extends UserError {
  type = 'InvalidOption'
}

export class InvalidSignature extends UserError {
  type = 'InvalidSignature'
}

export class NotImplemented extends Error {
  type = 'NotImplemented'
}
