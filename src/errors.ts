
export class UserError extends Error {}

export class InvalidParameter extends UserError {
  type = 'InvalidParameter'
}
