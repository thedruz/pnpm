import { Registries } from '@pnpm/types'
import encodeRegistry = require('encode-registry')
import semver = require('semver')

export function isAbsolute (dependencyPath: string) {
  return dependencyPath[0] !== '/'
}

export function resolve (
  registries: Registries,
  resolutionLocation: string
) {
  if (!isAbsolute(resolutionLocation)) {
    let registryUrl!: string
    if (resolutionLocation[1] === '@') {
      const scope = resolutionLocation.substr(1, resolutionLocation.indexOf('/', 1) - 1)
      registryUrl = registries[scope] || registries.default
    } else {
      registryUrl = registries.default
    }
    const registryDirectory = encodeRegistry(registryUrl)
    return `${registryDirectory}${resolutionLocation}`
  }
  return resolutionLocation
}

export function tryGetPackageId (registries: Registries, relDepPath: string) {
  if (relDepPath[0] !== '/') {
    return null
  }
  const lastUnderscore = relDepPath.lastIndexOf('_')
  if (lastUnderscore > relDepPath.lastIndexOf('/')) {
    return resolve(registries, relDepPath.substr(0, lastUnderscore))
  }
  return resolve(registries, relDepPath)
}

export function refToAbsolute (
  reference: string,
  pkgName: string,
  registries: Registries,
) {
  if (reference.startsWith('link:')) {
    return null
  }
  if (reference.indexOf('/') === -1) {
    const registryName = encodeRegistry(getRegistryByPackageName(registries, pkgName))
    return `${registryName}/${pkgName}/${reference}`
  }
  if (reference[0] !== '/') return reference
  const registryName = encodeRegistry(getRegistryByPackageName(registries, pkgName))
  return `${registryName}${reference}`
}

export function getRegistryByPackageName (registries: Registries, packageName: string) {
  if (packageName[0] !== '@') return registries.default
  const scope = packageName.substr(0, packageName.indexOf('/'))
  return registries[scope] || registries.default
}

export function relative (
  registries: Registries,
  packageName: string,
  absoluteResolutionLoc: string
) {
  const registryName = encodeRegistry(getRegistryByPackageName(registries, packageName))

  if (absoluteResolutionLoc.startsWith(`${registryName}/`) && absoluteResolutionLoc.indexOf('/-/') === -1) {
    return absoluteResolutionLoc.substr(absoluteResolutionLoc.indexOf('/'))
  }
  return absoluteResolutionLoc
}

export function refToRelative (
  reference: string,
  pkgName: string
) {
  if (reference.startsWith('link:')) {
    return null
  }
  if (reference.startsWith('file:')) {
    return reference
  }
  if (reference.indexOf('/') === -1) {
    return `/${pkgName}/${reference}`
  }
  return reference
}

export function parse (dependencyPath: string) {
  if (typeof dependencyPath !== 'string') {
    throw new TypeError(`Expected \`dependencyPath\` to be of type \`string\`, got \`${typeof dependencyPath}\``)
  }
  const _isAbsolute = isAbsolute(dependencyPath)
  const parts = dependencyPath.split('/')
  if (!_isAbsolute) parts.shift()
  const host = _isAbsolute ? parts.shift() : undefined
  const name = parts[0].startsWith('@')
    ? `${parts.shift()}/${parts.shift()}`
    : parts.shift()
  let version = parts.shift()
  if (version) {
    const underscoreIndex = version.indexOf('_')
    if (underscoreIndex !== -1) {
      version = version.substr(0, underscoreIndex)
    }
    if (semver.valid(version)) {
      return {
        host,
        isAbsolute: _isAbsolute,
        name,
        version,
      }
    }
  }
  if (!_isAbsolute) throw new Error(`${dependencyPath} is an invalid relative dependency path`)
  return {
    host,
    isAbsolute: _isAbsolute,
  }
}
