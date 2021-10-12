import styled from 'styled-components'
import {
	alignItems,
	AlignItemsValues,
	displayFlex,
	flex,
	flexDirection,
	FlexDirectionValues,
	flexWrap,
	FlexWrapValues,
	justifyContent,
	JustifyContentValues,
	useNavigateToComponent,
	useNavigation,
	useNavigateToPreviouslySelectedComponentOrDefault,
} from 'taktik-flowr-react-utils'
import { FocusableDiv } from '../style/FocusableDiv'
import { ComponentNames } from '../constants/navigationComponentNames'

const FlexContainerWrap = styled.div`
	width: 100%;
	border: 1px solid black;
	padding: 2px;
	${displayFlex}
	${flexWrap(FlexWrapValues.WRAP)}

	div {
		border: 1px dashed tomato;
		text-align: center;
		min-width: 25%;
		width: 25%;
		${flex(1)}
	}
`

const FlexContainerDirection = styled.div`
	border: 1px solid black;
	padding: 2px;
	${displayFlex}
	${flexDirection(FlexDirectionValues.COLUMN)}

	div {
		border: 1px dashed tomato;
		text-align: center;
	}
`

const FlexContainerJustify = styled.div`
	border: 1px solid black;
	padding: 2px;
	height: 100px;
	${displayFlex}
	${justifyContent(JustifyContentValues.CENTER)}
    ${alignItems(AlignItemsValues.CENTER)}

	div {
		border: 1px dashed tomato;
		text-align: center;
	}
`

interface IExampleProps {
	children: JSX.Element
	rules: Array<string>
}
const StyledComponentExample = ({ children, rules }: IExampleProps) => (
	<div>
		<h2>
			<pre>
				{rules.map((rule) => (
					<div key={rule}>{`${rule};`}</div>
				))}
			</pre>
		</h2>
		{children}
	</div>
)

export const StyledComponentMixinsExample = () => {
	const navigateToNavigationExample = useNavigateToComponent(ComponentNames.NAVIGATION_EXAMPLE)
	const { navigateToPreviouslySelectedComponentOrDefault, dependency } =
		useNavigateToPreviouslySelectedComponentOrDefault()
	const isFocused = useNavigation({
		componentName: ComponentNames.MIXINS_EXAMPLE,
		downAction: navigateToNavigationExample,
		rightAction: () => {
			navigateToPreviouslySelectedComponentOrDefault(ComponentNames.NAVIGATION_EXAMPLE)
		},
		dependencies: [dependency],
	})

	return (
		<FocusableDiv isFocused={isFocused}>
			<h1>Styled components mixins examples</h1>
			<StyledComponentExample rules={['display: flex', 'flex: 1', 'flex-wrap: wrap']}>
				<FlexContainerWrap>
					<div>Div 1</div>
					<div>Div 2</div>
					<div>Div 3</div>
					<div>Div 4</div>
					<div>Div 5</div>
				</FlexContainerWrap>
			</StyledComponentExample>

			<StyledComponentExample rules={['display: flex', 'flex-direction: column']}>
				<FlexContainerDirection>
					<div>Div 1</div>
					<div>Div 2</div>
					<div>Div 3</div>
				</FlexContainerDirection>
			</StyledComponentExample>

			<StyledComponentExample
				rules={['display: flex', 'justify-content: center', 'align-items: center']}
			>
				<FlexContainerJustify>
					<div>This is a long div 1</div>
					<div>This is an even longer div 2</div>
					<div>This is Sparta</div>
				</FlexContainerJustify>
			</StyledComponentExample>
		</FocusableDiv>
	)
}
