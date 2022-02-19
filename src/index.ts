import { createStyleObject, FontMetrics } from '@capsizecss/core'
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

type FontConfig = {
  size: string
  fontFamily: string
  gap: string
}

const plugin: PluginCreator<PluginOptions> = ctx => {
  /* c8 ignore next */
  const { metrics = {} } = ctx || {}

  const fontFamilies = Object.keys(metrics)

  const matcher = new RegExp(
    '^(?<size>\\d+)px (?<family>(' +
      fontFamilies.join('|') +
      ')) (?<gap>\\d+)px$'
  )

  function addCapsizedRules(
    fontConfig: FontConfig,
    source: Declaration,
    helpers: Helpers
  ) {
    const { size, fontFamily, gap } = fontConfig
    const { Declaration, Rule } = helpers

    const declare = useDeclare(source, Declaration)
    const declareOnParent = useParentDeclare(
      source.parent as Rule,
      Declaration,
      Rule
    )

    const values = createStyleObject({
      fontMetrics: metrics[fontFamily],
      fontSize: Number(size),
      lineGap: Number(gap),
    })

    declare({
      lineHeight: values.lineHeight,
    })

    declareOnParent({
      '::before': values['::before'],
      '::after': values['::after'],
    })

    source.remove()
  }

  return {
    postcssPlugin: 'postcss-capsize',

    Declaration: {
      'font-metrics': (declaration, helpers) => {
        const {
          size,
          family: fontFamily,
          gap,
        } = declaration.value.match(matcher)?.groups || {}

        if (!size || !fontFamily || !gap) {
          throw new Error(
            'Correct syntax is `font-metrics: [font-size]px [font-family] [line-gap]px;'
          )
        }

        const declare = useDeclare(declaration, helpers.Declaration)

        declare({
          fontFamily,
          fontSize: `${size}px`,
        })

        addCapsizedRules({ size, fontFamily, gap }, declaration, helpers)
      },
      'line-gap': (declaration, helpers) => {
        let fontFamily!: string
        let size!: string
        const gap = (declaration.value.match(/^(\d+)px$/) || [])[1]

        declaration.parent?.walkDecls('font-family', d => {
          fontFamily = d.value
            .split(',')
            .map(val => val.trim().replace(/['"]/g, ''))
            .find(val => fontFamilies.includes(val))!
        })

        declaration.parent?.walkDecls('font-size', d => {
          size = (d.value.match(/^(\d+)px$/) || [])[1]
        })

        addCapsizedRules({ size, fontFamily, gap }, declaration, helpers)
      },
    },
  }
}

plugin.postcss = true

export default plugin
