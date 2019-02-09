import _fs from 'fs'
import promisify from 'pify'
import isNative from 'is-native-module'

const fs = promisify(_fs)

export const listNativeModules = async (dir = 'node_modules', modules = {}) => {
  const lstat = await fs.lstat(dir)
  if (!lstat.isDirectory()) return

  const name = dir.split('node_modules').pop()
  if (name in modules) return

  const files = await fs.readdir(dir)
  const promiseOne = fs.readFile(`${dir}/package.json`).then(
    json => {
      const pkg = JSON.parse(json.toString('utf8'))
      if (isNative(pkg)) modules[pkg.name] = true
    },
    err => {
      if (err.code !== 'ENOENT') throw err
    }
  )

  const nested = files.filter(f => !/^\./.test(f)).map(f => listNativeModules(`${dir}/${f}`, modules))

  await Promise.all(nested.concat(promiseOne))
  return Object.keys(modules)
}
