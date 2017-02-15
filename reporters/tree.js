'use strict'

const archy = require('archy')
const chalk = require('chalk')
const parser = require('trace-inline-parse')
const Transform = require('stream').Transform
const eql = require('deep-eql')

class Tree extends Transform {
  constructor(options) {
    super(options)

    this.stack = []
  }

  render() {
    const label = header(node_name(this.stack[0].caller))
    const nodes = this.stack.map(node => node.inlined ? leaf_success(node) : leaf_failed(node))

    this.stack.length = 0 // and reset
    return archy({label, nodes})
  }

  _transform(line, enc, cb) {
    const node = parser(line.toString())

    // skip invalid lines
    if (!node || !node.target) {
      cb()
      return
    }

    if (!node.caller || node.type == 'native') {
      if (this.stack.length) {
        this.push(this.render() + '\n')
      }

      this.stack.push(node)
      this.push(this.render() + '\n')

      cb()
      return
    }

    if (!this.stack.length) {
      this.stack.push(node)
      cb()
      return
    }

    const is_eql = eql(this.stack[0].caller, node.caller)

    if (is_eql) {
      this.stack.push(node)
      cb()
      return
    }

    this.push(this.render() + '\n')
    this.stack.push(node)

    cb()
  }

  _flush(cb) {
    if (this.stack.length) {
      this.push(this.render() + '\n')
    }

    cb()
  }
}

function node_name(func_node) {
  if (!func_node) {
    return '( anonymous )'
  }

  const accessor = func_node.accessor ? func_node.accessor + ' ' : ''
  return accessor + func_node.name + '()'
}

function header(name) {
  return '# ' + chalk.underline.yellow(name)
}

function leaf(name) {
  return chalk.cyan(name)
}

function error(reason) {
  return chalk.red('---------------') +'\n' + chalk.red(reason) + '\n'
}

function leaf_success(node) {
  return chalk.green('√') + ' ' + leaf(node_name(node.target)) + native(node) + tailcall(node)
}

function native(node) {
  return node.type == 'native' ? ' ' + chalk.green('[native]') : ''
}

function tailcall(node) {
  return node.tailcall ? ' ' + chalk.green('[tail call]') : ''
}

function leaf_failed(node) {
  return chalk.red('×') + ' ' + leaf(node_name(node.target)) + '\n' + error(node.reason)
}

module.exports = Tree
