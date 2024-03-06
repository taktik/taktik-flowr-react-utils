/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
	useState,
	ReactNode,
	createContext,
	useEffect,
	useContext,
	Dispatch,
	SetStateAction,
} from 'react'
import { FlowrEventName, IFlowrEventManager } from 'taktik_flowr_interface'

declare global {
	interface Window {
		eventManager?: IFlowrEventManager
	}
}

interface IContext {
	focusedComponent: string
	setFocusedComponent: Dispatch<SetStateAction<string>>
	previouslyFocusedComponent: string | null
	setPreviouslyFocusedComponent: Dispatch<SetStateAction<string | null>>
	resetPreviouslySelectedComponent: () => void
}

const NevigationContext = createContext<IContext>({
	focusedComponent: '',
	setFocusedComponent: () => {},
	previouslyFocusedComponent: null,
	setPreviouslyFocusedComponent: () => {},
	resetPreviouslySelectedComponent: () => {},
})

interface IProps {
	children: ReactNode
	eventManager?: IFlowrEventManager
	defaultFocusedComponentName: string
	defaultPreviouslyFocusedComponentName?: string
}

/**
 * The provider component is used to be able to use the navigation hook. It should wrap your application at the
 * highest level possible in the hierarchy ideally around the first component like <App />. You should place at the same location
 * you place every other Provider like the one for Redux.
 * It provides the context used to store the focused component state to all children components.
 * @param {Object} props
 * @param {Object} props.eventManager - The Flowr event manager provided by FlowR. If undefined, the hook will listen to
 * the keyboard events (this mode is used in standalone, outside of FlowR).
 * @param {string} props.defaultFocusedComponentName - The component that should be focused on the first ever render of the app.
 */
export const UseNavigationProvider = ({
	children,
	eventManager,
	defaultFocusedComponentName,
	defaultPreviouslyFocusedComponentName,
}: IProps) => {
	if (eventManager) {
		window.eventManager = eventManager
	}

	const [focusedComponent, setFocusedComponent] = useState(defaultFocusedComponentName)
	const [previouslyFocusedComponent, setPreviouslyFocusedComponent] = useState(
		defaultPreviouslyFocusedComponentName ?? null
	)
	const resetPreviouslySelectedComponent = () => setPreviouslyFocusedComponent(null)

	return (
		<NevigationContext.Provider
			value={{
				focusedComponent,
				setFocusedComponent,
				previouslyFocusedComponent,
				setPreviouslyFocusedComponent,
				resetPreviouslySelectedComponent,
			}}
		>
			{children}
		</NevigationContext.Provider>
	)
}

interface IParams {
	upAction?: () => void
	rightAction?: () => void
	downAction?: () => void
	leftAction?: () => void
	enterAction?: () => void
	returnAction?: () => void
	componentName: string
	dependencies?: unknown[]
	shouldReturnToFlowr?: boolean
	setFocusToThisComponentWhenMounted?: boolean
	shouldBlockActions?: boolean
	context?: object
}

/**
 * This hook will handle subscribing to the arrow key events (arrows key on a remote, or arrow key on the keyboard if
 * no flowr eventManager is passed. It will listens to those events only when a component is focused, and call the
 * callbacks direction action callback when a key is pressed.
 * @param options
 * @param options.componentName - The current component UNIQUE identifier (use an enum if possible)
 * @param options.shouldReturnToFlowr - Should the return button press return to FlowR instead of being handled by the navigation hook.
 * @param options.setFocusToThisComponentWhenMounted - Should the component be force focused when the component is mounted by React.
 * There should never be 2 components with this flag true displayed at the same time. This is used when you can't set
 * the focus via the directions actions (when navigation to a new page for example).
 * @param options.shouldBlockActions - A flag telling if the hook should stop listening to the key - usefull when you want to
 * temporarily disable the listener while waiting for something to happen for example (loading, fetching, ...)
 * @param options.upAction - The callback function to execute when the up arrow is pressed
 * @param options.downAction - The callback function to execute when the down arrow is pressed
 * @param options.leftAction - The callback function to execute when the left arrow is pressed
 * @param options.rightAction - The callback function to execute when the right arrow is pressed
 * @param options.enterAction - The callback function to execute when the "OK" (or enter on keyboard) button is pressed
 * @param options.returnAction - The callback function to execute when the "Return" (or backspace on keyboard) button is pressed
 * @param options.dependencies - The dependencies array, it should include any value used in any of the callback functions. It works
 * exactly like a useEffect hook dependency array.
 * @Return a boolean telling if the current component (defined by componentName) is currently focused.
 */
export const useNavigation = ({
	componentName,
	shouldReturnToFlowr = false,
	setFocusToThisComponentWhenMounted = false,
	shouldBlockActions = false,
	upAction,
	rightAction,
	downAction,
	leftAction,
	enterAction,
	returnAction,
	dependencies,
	context
}: IParams) => {
	const actionsHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault()
				upAction?.()
				break
			case 'ArrowRight':
				event.preventDefault()
				rightAction?.()
				break
			case 'ArrowDown':
				event.preventDefault()
				downAction?.()
				break
			case 'ArrowLeft':
				event.preventDefault()
				leftAction?.()
				break
			case 'Enter':
				enterAction?.()
				break
			case 'Backspace':
				!shouldReturnToFlowr && returnAction?.()
				break
		}
	}

	const { eventManager } = window
	const subscribe = () => {
		unsubscribe()
		if (eventManager) {
			upAction && eventManager.on(FlowrEventName.ARROW_UP_PRESS, upAction, context ?? this)
			rightAction && eventManager.on(FlowrEventName.ARROW_RIGHT_PRESS, rightAction, context ?? this)
			downAction && eventManager.on(FlowrEventName.ARROW_DOWN_PRESS, downAction, context ?? this)
			leftAction && eventManager.on(FlowrEventName.ARROW_LEFT_PRESS, leftAction, context ?? this)
			enterAction && eventManager.on(FlowrEventName.ENTER_PRESS, enterAction, context ?? this)
			returnAction &&
				!shouldReturnToFlowr &&
				eventManager.forceOn(FlowrEventName.RETURN_PRESS, returnAction, context ?? this)
		} else {
			window.addEventListener('keydown', actionsHandler)
		}
	}

	const unsubscribe = () => {
		if (eventManager) {
			upAction && eventManager.off(FlowrEventName.ARROW_UP_PRESS, upAction, context ?? this)
			rightAction && eventManager.off(FlowrEventName.ARROW_RIGHT_PRESS, rightAction, context ?? this)
			downAction && eventManager.off(FlowrEventName.ARROW_DOWN_PRESS, downAction, context ?? this)
			leftAction && eventManager.off(FlowrEventName.ARROW_LEFT_PRESS, leftAction, context ?? this)
			enterAction && eventManager.off(FlowrEventName.ENTER_PRESS, enterAction, context ?? this)
			returnAction &&
				!shouldReturnToFlowr &&
				eventManager.forceOff(FlowrEventName.RETURN_PRESS, returnAction, context ?? this)
		} else {
			window.removeEventListener('keydown', actionsHandler)
		}
	}

	const { focusedComponent } = useContext(NevigationContext)
	const isFocused = componentName === focusedComponent
	const setFocusToThisComponent = useNavigateToComponent(componentName)

	useEffect(() => {
		if (setFocusToThisComponentWhenMounted) {
			setFocusToThisComponent()
		}
	}, [])

	useEffect(() => {
		if (isFocused && !shouldBlockActions) {
			subscribe()
		} else {
			unsubscribe()
		}

		return () => {
			unsubscribe()
		}
	}, [isFocused, shouldBlockActions, ...(dependencies ?? [])])

	return isFocused
}

/**
 * This hook will return a function that sets the focus to the component passed as a parameter. It's mainly used
 * in the useNavigation's actions callbacks (up, down, right, etc) to change the focus to a new component.
 * @param componentName - The component name to set focus to
 * @param shouldSavePreviouslyFocused - To save the previouslyFocusedComponent in order to get back to it via the
 * hook useNavigateToPreviouslySelectedComponentOrDefault
 * @return function to call to set the focus to a component
 */
export const useNavigateToComponent = (
	componentName: string,
	shouldSavePreviouslyFocused = false
) => {
	const { setFocusedComponent, setPreviouslyFocusedComponent, focusedComponent } =
		useContext(NevigationContext)
	return () => {
		if (shouldSavePreviouslyFocused) {
			setPreviouslyFocusedComponent(focusedComponent)
		}
		setFocusedComponent(componentName)
	}
}

/**
 * This hook will focus the previouslyFocusedComponent or a given default if no component was previously focused.
 * @return navigateToPreviouslySelectedComponentOrDefault a function to call to set the focus to the previously selected, it must be provided by
 * a default fallback component in case none has been focused before
 * @return dependency - a value that should be included in the useNavigation hook depencies array
 */
export const useNavigateToPreviouslySelectedComponentOrDefault = () => {
	const { previouslyFocusedComponent, setFocusedComponent } = useContext(NevigationContext)
	return {
		navigateToPreviouslySelectedComponentOrDefault: (defaultComponentToFocus: string) => {
			setFocusedComponent(previouslyFocusedComponent ?? defaultComponentToFocus)
		},
		dependency: previouslyFocusedComponent,
	}
}

export const useResetPreviouslySelectedComponent = () => {
	const { resetPreviouslySelectedComponent } = useContext(NevigationContext)
	return resetPreviouslySelectedComponent
}
