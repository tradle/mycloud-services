
export const pipe = (...fns) => input => fns.reduce((result, fn) => fn(result), input)
