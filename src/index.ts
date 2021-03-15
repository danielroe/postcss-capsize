import capsize, { FontMetrics } from 'capsize'
import type { Declaration, Helpers, PluginCreator, Rule } from 'postcss'

export interface PluginOptions {
  metrics: Record<string, FontMetrics>
}

function useDeclare(
  declaration: Declaration,
  Declaration: Helpers['Declaration']
) {
  function declareOne([prop, value]: [prop: string, value: string]) {
    declaration.after(
      new Declaration({
        prop: prop.replace(/[A-Z]/g, r => '-' + r.toLowerCase()),
        value,
      })
    )
  }

  function declare(props: Record<string, string>) {
    Object.entries(props).forEach(declareOne)
  }

  return declare
}

function useParentDeclare(
  parent: Rule,
  Declaration: Helpers['Declaration'],
  Rule: Helpers['Rule']
) {
  function declareOnParent([selector, props]: [
    selector: string,
    props: Record<string, string | number>
  ]) {
    parent.after(
      new Rule({
        selector: parent.selector + selector,
        source: parent.source,
        nodes: Object.entries(props).map(
          ([prop, value]) =>
            new Declaration({
              prop: prop.replace(/[A-Z]/g, r => '-' + r.toLowerCase()),
              value: String(value),
            })
        ),
      })
    )
  }

  function declareAllOnParent(
    props: Record<string, Record<string, string | number>>
  ) {
    Object.entries(props).forEach(declareOnParent)
  }

  return declareAllOnParent
}

const plugin: PluginCreator<PluginOptions> = ctx => {
  /* istanbul ignore next */
  const { metrics = {} } = ctx || {}

  const fontFamilies = Object.keys(metrics)

  const matcher = new RegExp(
    '^(?<size>\\d+)px (?<family>(' +
      fontFamilies.join('|') +
      ')) (?<gap>\\d+)px$'
  )

  return {
    postcssPlugin: 'postcss-capsize',

    Declaration: {
      'font-metrics'(declaration, { Declaration, Rule }) {
        const { size, family: fontFamily, gap } =
          declaration.value.match(matcher)?.groups || {}

        if (!size || !fontFamily || !gap) {
          throw new Error(
            'Correct syntax is `font-metrics: 24px serif 4px;`, or [font-size] [font-family] [line-gap]'
          )
        }

        const declare = useDeclare(declaration, Declaration)
        const declareOnParent = useParentDeclare(
          declaration.parent as Rule,
          Declaration,
          Rule
        )

        const values = capsize({
          fontMetrics: metrics[fontFamily],
          fontSize: Number(size),
          lineGap: Number(gap),
        })

        declare({
          fontFamily,
          fontSize: values.fontSize,
          lineHeight: values.lineHeight,
        })

        declareOnParent({
          '::before': values['::before'],
          '::after': values['::after'],
        })

        declaration.remove()
      },
    },
  }
}

plugin.postcss = true

export default plugin
