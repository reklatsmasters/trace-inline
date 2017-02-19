#!/usr/bin/env node
'use strict'

const execa = require('execa')
const split2 = require('split2')
const Tape = require('./reporters/tape')
const Tree = require('./reporters/tree')
const bin = require('pkg-bin')
const pkg = require('./package.json')
const yargs = require('yargs')
  .usage(`USAGE: ${bin(pkg)} <script>`)
  .default('reporter', 'tree')
  .alias('r', 'reporter')
  .choices('r', ['tape', 'tree', 'pass'])
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .showHelpOnFail(false, 'Specify --help for available options')

const args = yargs.argv

if (!args._.length) {
  process.stderr.write('Missing argument: <script>\n')
  process.exit()
}

const cp = execa('node', ['--trace-inlining'].concat(args._))

pipe(cp.stdout, args.reporter).pipe(process.stdout)

cp.stderr.pipe(process.stderr)

function pipe(from, reporter_name) {
  switch (reporter_name) {
    case 'tape':
      return from.pipe(split2()).pipe(new Tape())
    case 'tree':
      return from.pipe(split2()).pipe(new Tree())
    case 'pass':
      return from
    default:
      break
  }
}
