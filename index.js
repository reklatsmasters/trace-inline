#!/usr/bin/env node
'use strict'

const execa = require('execa')
const split2 = require('split2')
const Tape = require('./reporters/tape')
const bin = require('pkg-bin')
const pkg = require('./package.json')
const yargs = require('yargs')
  .usage(`USAGE: ${bin(pkg)} <script>`)
  .default('reporter', 'tape')
  .alias('r', 'reporter')
  .choices('r', ['tape'])
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

const reporter = choose_reporter(args.reporter)
const cp = execa('node', ['--trace-inlining', args._[0]])

cp.stdout
  .pipe(split2())
  .pipe(new reporter())
  .pipe(process.stdout)

cp.stderr.pipe(process.stderr)

/**
 * return reporter class by reporter name
 */
function choose_reporter(reporter_name) {
  switch (reporter_name) {
    case 'tape':
      return Tape
    default:
      break
  }
}