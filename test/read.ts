import {read, readPrivate} from '../src'
import test = require('tape')
import path = require('path')

process.chdir(__dirname)

test('read()', async t => {
  {
    const shr = await read(path.join('fixtures', '1'), {
      ignoreIncompatible: false,
    })
    t.equal(shr!.shrinkwrapVersion, 3, 'converted version to shrinkwrapVersion')
  }
  {
    const shr = await read(path.join('fixtures', '2'), {
      ignoreIncompatible: false,
    })
    t.equal(shr!.shrinkwrapVersion, 3)
  }

  try {
    const shr = await read(path.join('fixtures', '3'), {
      ignoreIncompatible: false,
    })
    t.fail()
  } catch (err) {
    t.equal(err.code, 'SHRINKWRAP_BREAKING_CHANGE')
  }
  t.end()
})

test('readPrivate()', async t => {
  {
    const shr = await readPrivate(path.join('fixtures', '1'), {
      ignoreIncompatible: false,
    })
    t.equal(shr!.shrinkwrapVersion, 3, 'converted version to shrinkwrapVersion')
  }
  {
    const shr = await readPrivate(path.join('fixtures', '2'), {
      ignoreIncompatible: false,
    })
    t.equal(shr!.shrinkwrapVersion, 3)
  }
  t.end()
})