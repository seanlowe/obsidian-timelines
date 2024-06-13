import chroma, { type Color, valid } from 'chroma-js'

export const availableColors = ['orange', 'blue', 'green', 'red', 'purple', 'yellow', 'pink', 'gray']
const types = [ 'vis-background', 'vis-box', 'vis-point', 'vis-range', 'vis-line', 'vis-dot' ]
// STOP - did you remember to change the matching variables in horizontal-timeline.scss?


export const handleColor = ( color: string, noteCard: HTMLDivElement, id: string ): boolean => {
  if ( !availableColors.includes( color )) {
    handleDynamicColor( color, id )
    return false
  }

  noteCard.addClass( color )
  return true
}

type AddColorInput = {
  color: Color,
  selector: string,
  addon?: string,
  alpha?: number
}

const lightenBackground = ( color: Color, alpha: number = .3 ): string => {
  return color.brighten( .2 ).alpha( alpha ).hex()
}

const addColor = (
  {
    color,
    selector: startingElement,
    addon = '',
    alpha = .3
  }: AddColorInput,
  customClassName: string,
): string => {
  const lightenedBackground = lightenBackground( color, alpha )
  const selector = `${startingElement}.${customClassName}${addon}`
  const block = `{ filter: none; background-color: ${lightenedBackground}; border-color: ${color}; }\n`
  return `${selector} ${block}`
}

const handleDynamicColor = ( color: string, noteId: string ) => {
  if ( !valid( color )) {
    throw new Error( `Invalid color: ${color}` )
  }
  const colorObject = chroma( color )
  const id = `nid-${noteId}`

  // add all the various parts that need coloring
  const newRules: string[] = []
  for ( const type of types ) {
    newRules.push( addColor({ color: colorObject, selector: '.vis-item' }, id ))
    newRules.push( addColor({ color: colorObject, selector: `.vis-item.${type}` }, id ))
    newRules.push( addColor({ color: colorObject, selector: `.vis-item.${type}.vis-selected`, alpha: .45 }, id ))
    newRules.push( addColor({ color: colorObject, selector: '.vis-item', addon: ':hover', alpha: .45 }, id ))
  }
  // STOP - did you remember to change the matching rules in horizontal-timeline.scss?

  // grab the stylesheet with all the .vis-X class rules
  // [0] is one with a bunch of .cm rules
  // [1] is obsidian's big ass stylesheet (over 1700 rules)
  // [2] is the one we want
  const stylesheet = document.styleSheets[2]
  for ( const rule of newRules ) {
    stylesheet.insertRule( rule, stylesheet.cssRules.length )
  }
}
