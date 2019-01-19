export class UserError extends Error {
  type = 'UserError'
}

export class InvalidParameter extends UserError {
  type = 'InvalidParameter'
}

export class NotImplemented extends Error {
  type = 'NotImplemented'
}
