import chroma, { type Color, valid } from 'chroma-js'

import { logger } from './debug'
import { AVAILABLE_COLORS, TIMELINE_ELEMENT_TYPES } from '../constants'
import { EventStylesObject, VerifiedColorsObject, AddColorInput } from '../types'

// in use by horizontal timeline
export const handleStyles = ( styles: EventStylesObject ): VerifiedColorsObject => {
  const verifiedColors: VerifiedColorsObject = {}
  Object.keys( styles ).forEach(( key ) => {
    if ( !styles[key] ) return

    if ( key === 'fontColor' ) {
      styles.customClass = 'custom-font-style'
    }

    verifiedColors[key] = chroma( styles[key] )
  })

  logger( 'verifiedColors', verifiedColors )
  return verifiedColors
}

// currently not really used
// need to test if this works on vertical timeline, as it is being used there
export const handleColor = ( color: string, noteCard: HTMLDivElement, id: string ): boolean => {
  if ( !AVAILABLE_COLORS.includes( color )) {
    handleDynamicColor( color, id )
    return false
  }

  noteCard.addClass( color )
  return true
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

export const handleDynamicColor = ( color: string, noteId: string ) => {
  if ( !valid( color )) {
    throw new Error( `Invalid color: ${color}` )
  }
  const colorObject = chroma( color )
  const id = `nid-${noteId}`

  // add all the various parts that need coloring
  const newRules: string[] = []
  for ( const type of TIMELINE_ELEMENT_TYPES ) {
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
