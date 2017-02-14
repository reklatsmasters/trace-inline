'use strict'

const parser = require('trace-inline-parse')
const Transform = require('stream').Transform
const eql = require('deep-eql')

function accessor(func_node) {
  return func_node.accessor ? `[${func_node.accessor}] ` : ''
}

class Tape extends Transform {
  constructor(options) {
    super(options)

    this.i = 0
    this.passed = 0
    this.failed = 0

    this.stack = []

    this.push(this.header())
  }

  header() {
    return 'TAP version 13\n'
  }

  ln() {
    this.push('\n')
  }

  draw_node(node) {
    const base = `ok ${++this.i} ${accessor(node.target)}${node.target.name}`

    if (node.inlined) {
      ++this.passed
      return base
    }

    ++this.failed
    return [
      `not ${base}`,
      '  ---',
      '    reason: ' + node.reason,
      '  ...'
    ].join('\n')
  }

  report(node) {
    const header = node.caller ? `# ${accessor(node.caller)}${node.caller.name}` : '# ( anonymous )'

    return [header, this.draw_node(node)].join('\n')
  }

  report_tree() {
    const caller = this.stack[0].caller

    const header = `# ${accessor(caller)}${caller.name}`
    const tree = this.stack.map(this.draw_node, this).join('\n')

    return header + '\n' + tree
  }

  _transform(line, enc, cb) {
    const node = parser(line.toString())

    if (!node || !node.target) {
      cb()
      return
    }

    if (!this.stack.length) {
      this.stack.push(node)
      cb()
      return
    }

    if (!node.caller || node.type == 'native') {
      cb(null, this.report(node) + '\n')
      return
    }

    const is_eql = eql(this.stack[0].caller, node.caller)

    if (is_eql) {
      this.stack.push(node)
      cb()
      return
    }

    this.push(this.report_tree() + '\n')

    this.stack.length = 0
    this.stack.push(node)

    cb()
  }

  _flush(cb) {
    if (this.stack.length) {
      this.push(this.report_tree() + '\n')
    }

    const output = [
      '',
      `1..${this.passed + this.failed}`,
      `# tests ${this.passed + this.failed}`,
      `# pass ${this.passed}`,
      `# fail ${this.failed}`
    ]

    this.push(output.join('\n'))
    this.stack.length = 0

    cb()
  }
}

module.exports = Tape
