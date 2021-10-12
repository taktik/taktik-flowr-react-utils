import { useNavigateToComponent, useNavigation } from 'taktik-flowr-react-utils'
import { useState } from 'react'
import { FocusableDiv } from '../style/FocusableDiv'
import styled from 'styled-components'
import { ComponentNames } from '../constants/navigationComponentNames'

const Container = styled.div<{ isFocused: boolean }>`
	${({ isFocused }) => isFocused && 'border: 5px solid #b4d455;'}

	li {
		font-size: 20px;
	}
	span {
		font-weight: 500;
		font-style: italic;
	}
`

const Option = styled(FocusableDiv)`
	font-weight: 800;
`

export const NavigationExample = () => {
	const optionList = ['Option 1', 'Option 2', 'Option 3']
	const [focusedOption, setFocusedOption] = useState(0)

	const navigateToStyleExample = useNavigateToComponent(ComponentNames.MIXINS_EXAMPLE, true)
	const navigateToExample2 = useNavigateToComponent(ComponentNames.NAVIGATION_EXAMPLE_2, true)
	const isFocused = useNavigation({
		componentName: ComponentNames.NAVIGATION_EXAMPLE,
		downAction: () => {
			if (focusedOption < optionList.length - 1) {
				setFocusedOption((currentFocus) => currentFocus + 1)
			} else {
				navigateToExample2()
			}
		},
		upAction: () => {
			if (focusedOption === 0) {
				navigateToStyleExample()
			} else {
				setFocusedOption((currentFocus) => currentFocus - 1)
			}
		},
		dependencies: [focusedOption],
	})
	return (
		<Container isFocused={isFocused}>
			<h1>Navigation example</h1>
			<ol>
				<li>
					You can navigate and change the selected element (the colored one) in the option list
					using the up & down arrow (or the arrows on a remote control for FlowR). It changes the
					selection internally, in this component <span>NavigationExample</span>
				</li>
				<li>
					Once you reach the first or last option of the list, you can still go up or down, and
					select another component. That uses the <span>useNavigateToComponent</span> hook
				</li>
				<li>
					Once you select the top or bottom component, pressing right will return to this component,
					it uses the <span>useNavigateToPreviouslySelectedComponentOrDefault</span> hook
				</li>
			</ol>
			{optionList.map((optionName, index) => (
				<Option isFocused={isFocused && focusedOption === index} key={optionName}>
					{optionName} {isFocused && focusedOption === index && '<== focused'}
				</Option>
			))}
		</Container>
	)
}
