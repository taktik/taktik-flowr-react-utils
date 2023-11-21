import { css } from 'styled-components'

// Sources
// https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Flexible_Box_Layout/Backwards_Compatibility_of_Flexbox
// https://dev.opera.com/articles/advanced-cross-browser-flexbox/

export enum FlexDirectionValues {
	COLUMN = 'column',
	ROW = 'row',
}

export enum FlexWrapValues {
	WRAP = 'wrap',
	NO_WRAP = 'nowrap',
}

export enum JustifyContentValues {
	SPACE_BETWEEN = 'space-between',
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
	display: -webkit-flex;
	display: flex;
`

export const flexDirection = (type: FlexDirectionValues) => css`
	${type === FlexDirectionValues.ROW && '-webkit-box-orient: horizontal'};
	${type === FlexDirectionValues.COLUMN && '-webkit-box-orient: vertical'};
	-webkit-box-direction: normal;
	flex-direction: ${type};
`

export const flex = (value: number) => css`
	-webkit-box: ${value};
	-webkit-flex: ${value};
	flex: ${value};
`

export const gap = (value: string) => css`
	> * {
		margin-right: ${value};
		&:last-child {
			margin-right: 0;
		}
	}
`

export const flexGrow = (value: number) => css`
	-webkit-box-flex: ${value};
	-webkit-flex-grow: ${value};
	flex-grow: ${value};
`

export const flexBasis = (value: string) => css`
	-webkit-flex-basis: ${value};
	flex-basis: ${value};
`

export const flexWrap = (type: FlexWrapValues) => css`
	-webkit-flex-wrap: ${type};
	flex-wrap: ${type};
`

export const justifyContent = (type: JustifyContentValues) => css`
	${type === JustifyContentValues.FLEX_END && '-webkit-box-pack: end'};
	${type === JustifyContentValues.FLEX_START && '-webkit-box-pack: start'};
	${type === JustifyContentValues.SPACE_BETWEEN && '-webkit-box-pack: justify'};
	${type === JustifyContentValues.CENTER && '-webkit-box-pack: center'};
	justify-content: ${type};
`

export const alignItems = (type: AlignItemsValues) => css`
	${type === AlignItemsValues.FLEX_END && '-webkit-box-align: end'};
	${type === AlignItemsValues.FLEX_START && '-webkit-box-align: start'};
	${type === AlignItemsValues.CENTER && '-webkit-box-align: center'};
	${type === AlignItemsValues.STRETCH && '-webkit-box-align: stretch'};
	align-items: ${type};
`
