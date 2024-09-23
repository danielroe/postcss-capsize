import type Processor from 'postcss/lib/processor'
import postcss from 'postcss'

import { beforeEach, describe, expect, it } from 'vitest'

import pluginCreator from '../src'

describe(`plugin`, () => {
  let processor: Processor

  beforeEach(() => {
    processor = postcss([
      pluginCreator({
        metrics: {
          'Test Mono': {
            capHeight: 100,
            ascent: 800,
            descent: -200,
            lineGap: 0,
            unitsPerEm: 1000,
          },
        },
      }),
    ])
  })
  it('renders correct CSS', async () => {
    const result = await processor.process(
      `
      .test {
        font-metrics: 24px Test Mono 10px; 
      }`,
      { from: undefined },
    )
    expect(result.css).toMatchSnapshot()
  })
  it('renders correct CSS with line-gap syntax', async () => {
    const result = await processor.process(
      `
      .test {
        font-family: 'Gaudy Mono', 'Test Mono', sans-serif;
        font-size: 24px;
        line-gap: 10px;
      }`,
      { from: undefined },
    )
    expect(result.css).toMatchSnapshot()
  })
  it('throws an error with invalid declaration', async () => {
    const invalidOptions = [
      `.test { font-metrics: Test Mono 10px; }`,
      `.test { line-gap: 10rem; }`,
      `.test { line-gap: 10px; }`,
      `.test { line-gap: 10px; font-size: 10vw; }`,
      `.test { line-gap: 10px; font-size: 10px; }`,
    ]
    await Promise.all(
      invalidOptions.map(async (css) => {
        let errored = false
        try {
          await processor.process(css, { from: undefined })
        }
        catch {
          errored = true
        }
        expect(errored).toBeTruthy()
      }),
    )
  })
})
