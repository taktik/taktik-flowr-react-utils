import { StyledComponentMixinsExample } from './example-components/StyledComponentMixinsExample'
import { NavigationExample } from './example-components/NavigationExample'
import { UseNavigationProvider } from 'taktik-flowr-react-utils'
import { ComponentNames } from './constants/navigationComponentNames'
import { NavigationExample2 } from './example-components/NavigationExample2'

export const App = () => {
	return (
		<UseNavigationProvider defaultFocusedComponentName={ComponentNames.NAVIGATION_EXAMPLE}>
			<StyledComponentMixinsExample />
			<NavigationExample />
			<NavigationExample2 />
		</UseNavigationProvider>
	)
}
