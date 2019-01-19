import fs from 'fs'
import path from 'path'

interface Query {
  name: string
  wrap: Function
}

const queries = {}
const validateQueryModule = ({ name, wrap }: Query) => {
  if (typeof name !== 'string') throw new Error('expected string "name"')
  if (typeof wrap !== 'function') throw new Error('expected function "wrap"')
}

fs.readdirSync(__dirname).forEach(file => {
  const { ext, base } = path.parse(file)
  if (ext === '.js' && base !== 'index.js') {
    const query = require(`./${file}`) as Query
    validateQueryModule(query)
    queries[query.name] = query.wrap
  }
})

export { queries }
