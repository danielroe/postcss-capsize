<h1 align="center">postcss-capsize</h1>
<p align="center">PostCSS plugin to inject Capsize font metrics</p>

<p align="center">
<a href="https://npmjs.com/package/postcss-capsize">
    <img alt="" src="https://img.shields.io/npm/v/postcss-capsize/latest.svg?style=flat-square">
</a>
<a href="https://bundlephobia.com/result?p=postcss-capsize">
    <img alt="" src="https://img.shields.io/bundlephobia/minzip/postcss-capsize?style=flat-square">
</a>
<a href="https://npmjs.com/package/postcss-capsize">
    <img alt="" src="https://img.shields.io/npm/dt/postcss-capsize.svg?style=flat-square">
</a>
<a href="https://lgtm.com/projects/g/danielroe/postcss-capsize">
    <img alt="" src="https://img.shields.io/lgtm/alerts/github/danielroe/postcss-capsize?style=flat-square">
</a>
<a href="https://lgtm.com/projects/g/danielroe/postcss-capsize">
    <img alt="" src="https://img.shields.io/lgtm/grade/javascript/github/danielroe/postcss-capsize?style=flat-square">
</a>
<a href="https://david-dm.org/danielroe/postcss-capsize">
    <img alt="" src="https://img.shields.io/david/danielroe/postcss-capsize.svg?style=flat-square">
</a>
<a href="https://codecov.io/gh/danielroe/postcss-capsize">
    <img alt="" src="https://img.shields.io/codecov/c/github/danielroe/postcss-capsize.svg?style=flat-square">
</a>
</p>

> PostCSS plugin to inject Capsize font metrics

[**Read more about Capsize**](https://seek-oss.github.io/capsize/)

## Quick Start

First install `postcss-capsize`:

```bash
yarn add postcss-capsize --dev
# or npm
npm install postcss-capsize --save-dev
```

Second, add `postcss-capsize` as a PostCSS plugin to your `postcss.config.js`,
or in your project configuration.

```diff
module.exports = {
  plugins: [
+   ['postcss-capsize', {
+     metrics: {
+       'Test Mono': {
+         capHeight: 100,
+         ascent: 800,
+         descent: -200,
+         lineGap: 0,
+         unitsPerEm: 1000,
+       }
+       // You can declare as many fonts as needed
+     }
+   }],
    require('autoprefixer')
  ]
}
```

**Note**: there are many font metrics you can install from `@capsizecss/metrics` - or generate from a font file via `@capsizecss/unpack`.

## Example

### Split syntax
```css
.test {
  line-gap: 10px;
  /* both properties below must be declared alongside `line-gap` */
  /* The first matching font-family from your plugin config will be used */
  font-family: 'Gaudy Mono', 'Test Mono', sans-serif;
  font-size: 24px;
}
```

### Combined syntax (deprecated)
```css
.test {
  /* font-metrics: [font-size] [font-family] [line-gap] */
  /* [font-family] must match the entry in your plugin config */
  font-metrics: 24px Test Mono 10px;
}
```

### Result

```css
.test {
  line-height: 12.4px;
  font-size: 24px;
  font-family: 'Gaudy Mono', 'Test Mono', sans-serif;
  /* Or, with combined syntax */
  font-family: Test Mono;
}
.test::before {
  content: '';
  margin-bottom: -0.4583em;
  display: table;
}
.test::after {
  content: '';
  margin-top: 0.0417em;
  display: table;
}
```

## Contributors

This has been developed to suit my needs but additional use cases and contributions are very welcome.

## License

[MIT License](./LICENSE) - Copyright &copy; Daniel Roe
