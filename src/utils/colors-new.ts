import chroma, { type Color } from 'chroma-js'

import { logger } from './debug'
import { CardContainer, PreparedStyles, VerifiedColorsObject } from '../types'

// in use by horizontal timeline
export const handleStyles = ( event: CardContainer ): VerifiedColorsObject => {
  const { styles } = event
  const verifiedColors: VerifiedColorsObject = {}
  Object.keys( styles ).forEach(( key ) => {
    if ( !styles[key] ) return

    if ( key === 'fontColor' ) {
      console.log( 'adding custom class for font' )
      event.className = ( event.className ?? '' ) + ' custom-font-style'
    }

    if ( key === 'backgroundColor' ) {
      verifiedColors[key] = chroma( styles[key] ).alpha( 0.3 )
      return
    }

    verifiedColors[key] = chroma( styles[key] )
  })

  logger( 'verifiedColors', verifiedColors )
  return verifiedColors
}

export const setCustomStyleProperty = ( propertyName: string, primaryColor: string, backupColor: string = 'white' ) => {
  document.documentElement.style.setProperty( propertyName, primaryColor ?? backupColor )
}

// darken the background color to create a good border color
const darkenBorder = ( backgroundColor: Color ): Color => {
  return backgroundColor.darken( 0.25 )
}

// lighten the border color to create a good background color
const lightenBackground = ( borderColor: Color, alpha: number = 0.3 ): Color => {
  return borderColor.brighten( 0.25 ).alpha( alpha )
}

const setDefaultStyles = ( eventType: string ): VerifiedColorsObject => {
  const backgroundColor = chroma( eventType === 'background' ? 'gray' : 'white' ).alpha( 0.3 )
  const borderColor = darkenBorder( backgroundColor )

  return {
    backgroundColor,
    borderColor,
  }
}

export const buildStylesWithDefaults = ( styles: VerifiedColorsObject, eventType: string ): VerifiedColorsObject => {
  const existingKeys = Object.keys( styles )
  // we have no colors provided
  if ( !existingKeys ) {
    console.log( 'setting default styles for colors' )
    return setDefaultStyles( eventType )
  }

  // they provided every color
  if ( existingKeys.length === 3 ) {
    console.log( 'returning because we already have 3 colors' )
    return styles
  }

  const backgroundColor = styles?.backgroundColor ??
    ( styles?.borderColor
      ? lightenBackground( styles.borderColor )
      : chroma( 'gray' ).alpha( 0.3 ))
  const borderColor = styles?.borderColor ?? darkenBorder( styles?.backgroundColor ?? backgroundColor )

  const result: VerifiedColorsObject = {
    backgroundColor,
    borderColor,
  }

  if ( styles?.fontColor ) {
    result.fontColor = styles?.fontColor
  }

  return result
}

const stringify = ( newStyles: VerifiedColorsObject ): string => {
  let styleString: string = ''

  console.log( 'stringify, length of newStyles', Object.keys( newStyles ).length )
  for ( const initialKey of Object.keys( newStyles )) {
    let key = ''
    let modifier = ''
    const color: Color = newStyles[initialKey].hex()

    switch ( initialKey ) {
    case 'backgroundColor':
      key = 'background-color'
      break
    case 'borderColor':
      key = 'border-color'
      break
    case 'fontColor':
      key = 'color'
      modifier = ' !important'
      break
    }

    styleString += newStyles[initialKey] ? `${key}: ${color}${modifier}; ` : ''
  }

  return styleString
}

export const prepareStyles = ( styles: VerifiedColorsObject, eventType: string ): PreparedStyles => {
  const newStyles = buildStylesWithDefaults( styles, eventType )
  const styleString = stringify( newStyles )

  return { styleString, newStyles }
}
