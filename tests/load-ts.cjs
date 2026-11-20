const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Local test loader: no new dependencies, Vite server, credentials or network.
module.exports = function createLoader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = fs.readFileSync(filename, "utf8").replaceAll("import.meta.env", "({})");
    const code = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (!name.startsWith(".")) return require(name);
      const target = path.resolve(path.dirname(filename), name);
      return load([target, target + ".ts", target + ".tsx"].find(file => fs.existsSync(file)));
    };
    vm.runInNewContext("(function(require,module,exports){" + code + "\n})", {
      console, ...globals,
    }, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
};
