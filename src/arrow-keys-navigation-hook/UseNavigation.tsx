/* eslint-disable @typescript-eslint/no-empty-function */
import React, {
	useState,
	ReactNode,
	createContext,
	useEffect,
	useContext,
	useCallback,
	useMemo,
	useRef,
	useLayoutEffect,
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
	const resetPreviouslySelectedComponent = useCallback(
		() => setPreviouslyFocusedComponent(null),
		[]
	)
	const value = useMemo(
		() => ({
			focusedComponent,
			setFocusedComponent,
			previouslyFocusedComponent,
			setPreviouslyFocusedComponent,
			resetPreviouslySelectedComponent,
		}),
		[focusedComponent, previouslyFocusedComponent, resetPreviouslySelectedComponent]
	)

	return <NevigationContext.Provider value={value}>{children}</NevigationContext.Provider>
}

interface IParams {
	upAction?: () => void
	rightAction?: () => void
	downAction?: () => void
	leftAction?: () => void
	enterAction?: () => void
	returnAction?: () => void
	componentName: string
	/** @deprecated Ignored: the hook always calls the callbacks of the latest render. */
	dependencies?: unknown[]
	shouldReturnToFlowr?: boolean
	setFocusToThisComponentWhenMounted?: boolean
	shouldBlockActions?: boolean
	// `this` binding forwarded to eventManager.on(name, cb, context?: any) - a class instance is a
	// valid context, which Record<string, unknown> would reject
	// eslint-disable-next-line @typescript-eslint/ban-types
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
 * @param options.dependencies - Ignored, kept so existing callers compile: a key always runs the callback of the latest render.
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
	context,
}: IParams) => {
	const actions = { upAction, rightAction, downAction, leftAction, enterAction, returnAction }
	const latestActions = useRef(actions)
	useLayoutEffect(() => {
		latestActions.current = actions
	})
	// subscribed once per focus change; each call reaches the callback of the latest render
	const handlers = useMemo(
		() => ({
			up: () => latestActions.current.upAction?.(),
			right: () => latestActions.current.rightAction?.(),
			down: () => latestActions.current.downAction?.(),
			left: () => latestActions.current.leftAction?.(),
			enter: () => latestActions.current.enterAction?.(),
			return: () => latestActions.current.returnAction?.(),
		}),
		[]
	)
	const latestContext = useRef(context)
	useLayoutEffect(() => {
		latestContext.current = context
	})

	const { eventManager } = window
	const hasUp = !!upAction
	const hasRight = !!rightAction
	const hasDown = !!downAction
	const hasLeft = !!leftAction
	const hasEnter = !!enterAction
	const ownsReturn = !!returnAction && !shouldReturnToFlowr

	const { focusedComponent } = useContext(NevigationContext)
	const isFocused = componentName === focusedComponent
	const setFocusToThisComponent = useNavigateToComponent(componentName)

	useEffect(() => {
		if (setFocusToThisComponentWhenMounted) {
			setFocusToThisComponent()
		}
	}, [])

	useEffect(() => {
		if (!isFocused || shouldBlockActions) {
			return
		}
		if (!eventManager) {
			const onKeyDown = (event: KeyboardEvent) => {
				switch (event.key) {
					case 'ArrowUp':
						event.preventDefault()
						handlers.up()
						break
					case 'ArrowRight':
						event.preventDefault()
						handlers.right()
						break
					case 'ArrowDown':
						event.preventDefault()
						handlers.down()
						break
					case 'ArrowLeft':
						event.preventDefault()
						handlers.left()
						break
					case 'Enter':
						handlers.enter()
						break
					case 'Backspace':
						ownsReturn && handlers.return()
						break
				}
			}
			window.addEventListener('keydown', onKeyDown)
			return () => window.removeEventListener('keydown', onKeyDown)
		}

		// on and off must get the same context: the event manager matches listeners by it
		const subscriptionContext = latestContext.current
		const subscriptions: [FlowrEventName, () => void][] = []
		hasUp && subscriptions.push([FlowrEventName.ARROW_UP_PRESS, handlers.up])
		hasRight && subscriptions.push([FlowrEventName.ARROW_RIGHT_PRESS, handlers.right])
		hasDown && subscriptions.push([FlowrEventName.ARROW_DOWN_PRESS, handlers.down])
		hasLeft && subscriptions.push([FlowrEventName.ARROW_LEFT_PRESS, handlers.left])
		hasEnter && subscriptions.push([FlowrEventName.ENTER_PRESS, handlers.enter])
		for (const [name, handler] of subscriptions) {
			eventManager.on(name, handler, subscriptionContext)
		}
		ownsReturn &&
			eventManager.forceOn(FlowrEventName.RETURN_PRESS, handlers.return, subscriptionContext)
		return () => {
			for (const [name, handler] of subscriptions) {
				eventManager.off(name, handler, subscriptionContext)
			}
			ownsReturn &&
				eventManager.forceOff(FlowrEventName.RETURN_PRESS, handlers.return, subscriptionContext)
		}
	}, [
		isFocused,
		shouldBlockActions,
		eventManager,
		handlers,
		hasUp,
		hasRight,
		hasDown,
		hasLeft,
		hasEnter,
		ownsReturn,
	])

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
	return useCallback(() => {
		if (shouldSavePreviouslyFocused) {
			setPreviouslyFocusedComponent(focusedComponent)
		}
		setFocusedComponent(componentName)
	}, [
		componentName,
		shouldSavePreviouslyFocused,
		focusedComponent,
		setFocusedComponent,
		setPreviouslyFocusedComponent,
	])
}

/**
 * This hook will focus the previouslyFocusedComponent or a given default if no component was previously focused.
 * @return navigateToPreviouslySelectedComponentOrDefault a function to call to set the focus to the previously selected, it must be provided by
 * a default fallback component in case none has been focused before
 * @return dependency - a value that should be included in the useNavigation hook depencies array
 */
export const useNavigateToPreviouslySelectedComponentOrDefault = () => {
	const { previouslyFocusedComponent, setFocusedComponent } = useContext(NevigationContext)
	const navigateToPreviouslySelectedComponentOrDefault = useCallback(
		(defaultComponentToFocus: string) => {
			setFocusedComponent(previouslyFocusedComponent ?? defaultComponentToFocus)
		},
		[previouslyFocusedComponent, setFocusedComponent]
	)
	return useMemo(
		() => ({
			navigateToPreviouslySelectedComponentOrDefault,
			dependency: previouslyFocusedComponent,
		}),
		[navigateToPreviouslySelectedComponentOrDefault, previouslyFocusedComponent]
	)
}

export const useResetPreviouslySelectedComponent = () => {
	const { resetPreviouslySelectedComponent } = useContext(NevigationContext)
	return resetPreviouslySelectedComponent
}
