import { FocusableDiv } from '../style/FocusableDiv'
import {
	useNavigateToComponent,
	useNavigateToPreviouslySelectedComponentOrDefault,
	useNavigation,
} from 'taktik-flowr-react-utils'
import { ComponentNames } from '../constants/navigationComponentNames'

export const NavigationExample2 = () => {
	const NavigateToExample = useNavigateToComponent(ComponentNames.NAVIGATION_EXAMPLE)
	const { navigateToPreviouslySelectedComponentOrDefault, dependency } =
		useNavigateToPreviouslySelectedComponentOrDefault()
	const isFocused = useNavigation({
		componentName: ComponentNames.NAVIGATION_EXAMPLE_2,
		upAction: NavigateToExample,
		rightAction: () => {
			navigateToPreviouslySelectedComponentOrDefault(ComponentNames.NAVIGATION_EXAMPLE)
		},
		dependencies: [dependency],
	})

	return (
		<FocusableDiv isFocused={isFocused}>
			<h1>This is a second example for navigation</h1>
			<p>Press right to go to the last selected component</p>
		</FocusableDiv>
	)
}
