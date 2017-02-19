## trace-inline [![npm](https://img.shields.io/npm/v/trace-inline.svg)](https://npmjs.org/package/trace-inline) [![license](https://img.shields.io/npm/l/trace-inline.svg)](https://npmjs.org/package/trace-inline) [![downloads](https://img.shields.io/npm/dm/trace-inline.svg)](https://npmjs.org/package/trace-inline)

A better --trace-inlining

```sh
>trace-inline -h
USAGE: trace-inline <script>

Options:
  -h, --help      Show help                                            [boolean]
  -v, --version   Show version number                                  [boolean]
  -r, --reporter             [choices: "tape", "tree", "pass"] [default: "tree"]
```
### Reporters

Just pass your script as an argument and `trace-inline` will show you pretty human-readable output.

![tree](fixtures/tree-windows.png)

You can use any formatter you want to process the TAP output (`-r tape`). 

![tape](fixtures/tape-windows.png)

or get raw unparsed data (`-r pass`)

![pass](fixtures/pass-windows.png)

## Related

* [trace-inline-parse](https://github.com/ReklatsMasters/trace-inline-parse) - parser of `--trace-inlining` output from crankshaft

## License
MIT, 2017 (c) Dmitry Tsvettsikh
