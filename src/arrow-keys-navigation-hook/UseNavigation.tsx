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
import { AppKeyEventName, FlowrEvent, IFlowrEventManager, KeyHandler } from 'taktik_flowr_interface'

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
	eventManager?: IFlowrEventManager
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
	const outerEventManager = useContext(NevigationContext).eventManager
	const providedEventManager = eventManager ?? outerEventManager
	// for code outside React; inside, read it with useNavigationEventManager
	useLayoutEffect(() => {
		if (providedEventManager) {
			window.eventManager = providedEventManager
		}
	}, [providedEventManager])

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
			eventManager: providedEventManager,
		}),
		[
			focusedComponent,
			previouslyFocusedComponent,
			resetPreviouslySelectedComponent,
			providedEventManager,
		]
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
	const props = {
		upAction,
		rightAction,
		downAction,
		leftAction,
		enterAction,
		returnAction,
		context,
	}
	const latest = useRef(props)
	useLayoutEffect(() => {
		latest.current = props
	})
	// subscribed once per focus change; each call reaches the callback of the latest render
	const handlers = useMemo(() => {
		// a handler is subscribed only while its action exists, so it always uses the key
		return {
			up: (): boolean => {
				latest.current.upAction?.()
				return true
			},
			right: (): boolean => {
				latest.current.rightAction?.()
				return true
			},
			down: (): boolean => {
				latest.current.downAction?.()
				return true
			},
			left: (): boolean => {
				latest.current.leftAction?.()
				return true
			},
			enter: (): boolean => {
				latest.current.enterAction?.()
				return true
			},
			return: (): boolean => {
				latest.current.returnAction?.()
				return true
			},
		}
	}, [])

	const hasUp = !!upAction
	const hasRight = !!rightAction
	const hasDown = !!downAction
	const hasLeft = !!leftAction
	const hasEnter = !!enterAction
	const ownsReturn = !!returnAction && !shouldReturnToFlowr

	const {
		focusedComponent,
		setFocusedComponent,
		eventManager: providedEventManager,
	} = useContext(NevigationContext)
	const isFocused = componentName === focusedComponent

	const focusOnMount = useRef(setFocusToThisComponentWhenMounted ? componentName : null)
	useEffect(() => {
		if (focusOnMount.current !== null) {
			setFocusedComponent(focusOnMount.current)
		}
	}, [setFocusedComponent])

	// a layout effect: a key pressed right after a focus change reaches the newly focused component
	useLayoutEffect(() => {
		if (!isFocused || shouldBlockActions) {
			return
		}
		// a page can set window.eventManager before React mounts instead of passing it to the provider
		const eventManager = providedEventManager ?? window.eventManager
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
		const subscriptionContext = latest.current.context
		const subscriptions: [AppKeyEventName, KeyHandler][] = []
		hasUp && subscriptions.push([FlowrEvent.ARROW_UP_PRESS, handlers.up])
		hasRight && subscriptions.push([FlowrEvent.ARROW_RIGHT_PRESS, handlers.right])
		hasDown && subscriptions.push([FlowrEvent.ARROW_DOWN_PRESS, handlers.down])
		hasLeft && subscriptions.push([FlowrEvent.ARROW_LEFT_PRESS, handlers.left])
		hasEnter && subscriptions.push([FlowrEvent.ENTER_PRESS, handlers.enter])
		for (const [name, handler] of subscriptions) {
			eventManager.on(name, handler, subscriptionContext)
		}
		ownsReturn &&
			eventManager.forceOn(FlowrEvent.RETURN_PRESS, handlers.return, subscriptionContext)
		return () => {
			for (const [name, handler] of subscriptions) {
				eventManager.off(name, handler, subscriptionContext)
			}
			ownsReturn &&
				eventManager.forceOff(FlowrEvent.RETURN_PRESS, handlers.return, subscriptionContext)
		}
	}, [
		isFocused,
		shouldBlockActions,
		providedEventManager,
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
	const focusToSave = shouldSavePreviouslyFocused ? focusedComponent : null
	return useCallback(() => {
		if (focusToSave !== null) {
			setPreviouslyFocusedComponent(focusToSave)
		}
		setFocusedComponent(componentName)
	}, [componentName, focusToSave, setFocusedComponent, setPreviouslyFocusedComponent])
}

/**
 * This hook will focus the previouslyFocusedComponent or a given default if no component was previously focused.
 * @return navigateToPreviouslySelectedComponentOrDefault a function to call to set the focus to the previously selected, it must be provided by
 * a default fallback component in case none has been focused before
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
		() => ({ navigateToPreviouslySelectedComponentOrDefault }),
		[navigateToPreviouslySelectedComponentOrDefault]
	)
}

/**
 * The FlowR event manager passed to the closest UseNavigationProvider (or an outer one), undefined outside FlowR.
 */
export const useNavigationEventManager = () => useContext(NevigationContext).eventManager

export const useResetPreviouslySelectedComponent = () => {
	const { resetPreviouslySelectedComponent } = useContext(NevigationContext)
	return resetPreviouslySelectedComponent
}
