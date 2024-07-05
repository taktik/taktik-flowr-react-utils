import { css } from 'styled-components'

// Sources
// https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Flexible_Box_Layout/Backwards_Compatibility_of_Flexbox
// https://dev.opera.com/articles/advanced-cross-browser-flexbox/

export enum FlexDirectionValues {
	COLUMN = 'column',
	ROW = 'row',
	ROW_REVERSE = 'row-reverse',
	COLUMN_REVERSE = 'column-reverse'
}

export enum FlexWrapValues {
	WRAP = 'wrap',
	NO_WRAP = 'nowrap',
}

export enum JustifyContentValues {
	SPACE_BETWEEN = 'space-between',
	SPACE_AROUND = 'space-around',
	CENTER = 'center',
	FLEX_START = 'flex-start',
	FLEX_END = 'flex-end',
}

export enum AlignItemsValues {
	STRETCH = 'stretch',
	CENTER = 'center',
	FLEX_START = 'flex-start',
	FLEX_END = 'flex-end',
}

export const displayFlex = css`
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
`

export const displayInlineFlex = css`
    display: -webkit-inline-box;
    display: -moz-inline-box;
    display: -webkit-inline-flex;
    display: -ms-inline-flexbox;
    display: inline-flex;
`

// Flex Direction and Wrap
// - applies to: flex containers
// <flex-direction> || <flex-wrap>
export const flexDirection = (type: FlexDirectionValues) => css`
	${type === FlexDirectionValues.ROW_REVERSE && 
	`-webkit-box-direction: reverse;
   -webkit-box-orient: horizontal;
   -moz-box-direction: reverse;
   -moz-box-orient: horizontal;`};
	${type === FlexDirectionValues.COLUMN && 
	`-webkit-box-direction: normal;
   -webkit-box-orient: vertical;
   -moz-box-direction: normal;
   -moz-box-orient: vertical;`};
	${type === FlexDirectionValues.COLUMN_REVERSE && 
	`-webkit-box-direction: reverse;
   -webkit-box-orient: vertical;
   -moz-box-direction: reverse;
   -moz-box-orient: vertical;`};
	${type === FlexDirectionValues.ROW && 
	`-webkit-box-direction: normal;
   -webkit-box-orient: horizontal;
   -moz-box-direction: normal;
   -moz-box-orient: horizontal;`};
	-webkit-flex-direction: ${type};
	-ms-flex-direction: ${type};
	flex-direction: ${type};
`

// The 'flex' shorthand
// - applies to: flex items
// <positive-number>, initial, auto, or none
export const flex = (value: number) => css`
	-webkit-box: ${value};
	-webkit-flex: ${value};
	-moz-box: ${value};
  -ms-flex: ${value};
	flex: ${value};
`

// Flex grow factor
// - applies to: flex items
// <number>
export const flexGrow = (value: number) => css`
	-webkit-box-flex: ${value};
	-moz-box-flex: ${value};
	-webkit-flex-grow: ${value};
	-ms-flex: ${value};
	flex-grow: ${value};
`

// Flex shrink
// - applies to: flex item shrink factor
// <number>
export const flexShrink = (value: number) => css`
	-webkit-flex-shrink: ${value};
	-moz-flex-shrink: ${value};
	-ms-flex: ${value};
	flex-shrink: ${value};
`

// Flex basis
// - the initial main size of the flex item
// - applies to: flex items initial main size of the flex item
// <width>
export const flexBasis = (value: string) => css`
	-webkit-flex-basis: ${value};
	flex-basis: ${value};
`
// Flex Line Wrapping
// - applies to: flex containers
// nowrap | wrap | wrap-reverse
export const flexWrap = (type: FlexWrapValues) => css`
	-ms-flex-wrap: ${({ type: FlexWrapValues }) => type === FlexWrapValues.NO_WRAP ? 'none' : type};
	-webkit-flex-wrap: ${type};
	flex-wrap: ${type};
`

// Axis Alignment
// - applies to: flex containers
// flex-start | flex-end | center | space-between | space-around
export const justifyContent = (type: JustifyContentValues) => css`
	-webkit-box-pack: ${type};
	-moz-box-pack: ${type};
	-ms-flex-pack: ${type};
	${type === JustifyContentValues.FLEX_START && 
		`-webkit-box-pack: start;
		-moz-box-pack: start;
		-ms-flex-pack: start;`
	};
	${type === JustifyContentValues.FLEX_END && 
		`-webkit-box-pack: end;
    -moz-box-pack: end;
    -ms-flex-pack: end;`
	};
	${type === JustifyContentValues.SPACE_BETWEEN && 
		`-webkit-box-pack: justify;
    -moz-box-pack: justify;
    -ms-flex-pack: justify;`
	};
	${type === JustifyContentValues.SPACE_AROUND && '-ms-flex-pack: distribute;'};
	-webkit-justify-content: ${type};
	justify-content: ${type};
`

// Packing Flex Lines
// - applies to: multi-line flex containers
// flex-start | flex-end | center | space-between | space-around | stretch
export const alignContent = (type: JustifyContentValues) => css`
  -ms-flex-line-pack: ${type};
	${type === JustifyContentValues.FLEX_START && '-ms-flex-line-pack: start;'};
	${type === JustifyContentValues.FLEX_END && '-ms-flex-line-pack: end;'};
	-webkit-align-content: ${type};
	align-content: ${type};
`

// Cross-axis Alignment
// - applies to: flex containers
// flex-start | flex-end | center | baseline | stretch
export const alignItems = (type: AlignItemsValues) => css`
	-webkit-box-align: ${type};
	-moz-box-align: ${type};
	-ms-flex-align: ${type};
	${type === AlignItemsValues.FLEX_START && 
		`-webkit-box-align: start;
    -moz-box-align: start;
    -ms-flex-align: start;`
	};
	${type === AlignItemsValues.FLEX_END && 
		`-webkit-box-align: end;
    -moz-box-align: end;
    -ms-flex-align: end;`
	};
	-webkit-align-items: ${type};
	align-items: ${type};
`

// Flex Direction and Wrap
// - applies to: flex containers
// <flex-direction> || <flex-wrap>
export const flexFlow = (direction: FlexDirectionValues, wrap: FlexWrapValues) => css`
	-webkit-flex-flow: ${direction} ${wrap};
	-ms-flex-flow: ${direction} ${wrap};
	flex-flow: ${direction} ${wrap};
`

// Display Order
// - applies to: flex items
// <integer>
export const order = (value: number) => css`
	-webkit-box-ordinal-group: ${value} + 1;
	-moz-box-ordinal-group: ${value} + 1;
	-webkit-order: ${value};
	-ms-flex-order: ${value};
	order: ${value};
`

// Cross-axis Alignment
// - applies to: flex items
// auto | flex-start | flex-end | center | baseline | stretch
export const alignSelf = (type: AlignItemsValues) => css`
	-webkit-align-self: ${type};
	-ms-flex-item-align: ${type};
	${type === AlignItemsValues.FLEX_START && '-ms-flex-item-align: start'};
	${type === AlignItemsValues.FLEX_END && '-ms-flex-item-align: end'};
	align-self: ${type};
`