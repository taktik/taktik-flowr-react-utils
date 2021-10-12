# taktik-flowr-react-utils

This package contains multiple React utils used accross several FlowR embedded/external apps

This package uses `yarn`

## Demo

A demo of the utils is available in `/demo` and can be run using `yarn start` from the root or the
demo folder. This is a good source of documentation as code as the features are showcased in the
demo.

## Utils documentation

### Styled component flexbox mixins

For some older browser on some old TVs don't support flexbox yet. But the layout is still achievable
through the use of some old css rules. **Please note that some flexbox disposition are impossible to
match with the old CSS rules so you're stuck with the options provided for `flex-direction`,
`align-items` to only name a few.**

Those rules have been packages inside styled component exportable code as `css`. Using them is as
easy importing the rules you want to use, and call them inside a styled-component's CSS :

```
import { displayFlex, justifyContent, JustifyContentValues, flexDirection, FlexDirectionValues } from 'taktik-flowr-react-utils'

const SomeStyledComponent = styled.div`
    ${displayFlex}
    ${flexDirection(FlexDirectionValues.COLUMN)}
    ${justifyContent(JustifyContentValues.CENTER)}
`
```

You can check the source code inside `src/flexbox-mixins/flexboxMixins.ts` as it is extremmely
self-explanatory

Available mixins Mixin => flexbox equivalent

- `displayFlex` => `display: flex;`
- `flex(number)` => `flex: number;`
- `flexGrow(number)` => `flex-grow: number;`
- `flexBasis(string)` => `flex-basis: value;`
- `flexDirection(column | row)` => `flex-direction; column | row;`
- `flexWrap(rap | nowrap)` => `flex-wrap: wrap | nowrap;`
- `justifyContent(flex-start | flex-end | center | space-between)` =>
  `jsutify-content: flex-start | flex-end | center | space-between;`
- `alignItems(flex-start | flex-end | center | stretch)` =>
  `align-items: flex-start | flex-end | center | stretch;`

### Arrows navigation hook

#### Use case

Every embedded app developped for FlowR needs to be usable on a TV screen, so the interface
navigation is not done with the mouse and regular clicking. It needs to be done with a remote
control, with at least the 6 controls : the 4 directionnal arrows, OK and Return.

So to be TV compatible an app should :

- Visually display on the interface which part of the screen or element is focused through CSS
  emphasis.
- Be able to move through the visual elements with the arrows key, validate actions with `OK` and go
  back with `Return`

To do that, your app just needs to

- Know which element is currently focused
- Be able to set the focus to another component.
- Listen to the key events and respond to them with actio, only for the focused component.
- The hook provides a way to make a component "navigable" => you should be able to move the focus to
  that component and know if the component is currently focused, that component only should be
  listening to the key events. You can then use the focused information to visually display it in
  your interface and make your component do stuff when a key / remote event is triggered.

#### Usage

1. All the components that can be focused will be identified by an unique string, I suggest you
   create an Enum containing all the components identifiers.

```ts
export enum ComponentNames {
	MAIN_SCREEN = 'mainScreen',
	NAV_BAR = 'navBar',
	// ...
}
```

2. First you need to wrap your **whole** application in a`<UseNavigationProvider>`, that will allow
   your app to access the navigation state. It should be wrapped at the highest level possible, in
   the same place as you would insert a Redux <Provider>. You should tell it which component should
   be focused by default, that's the first component you will highligh in the interface when the app
   starts up.

```tsx
import { UseNavigationProvider } from 'taktik-flowr-react-utils`

export const YourHighestComponent = () =>
    (
    <UseNavigationProvider
        defaultFocusedComponentName={ComponentNames.MAIN_SCREEN} // required
    >
        <YouApp />
    </UseNavigationProvider>
    )
```

3. Then, in every component you want to be "focusable" you need to use the hook
   `useNavigation(optionObject)` which returns a boolean telling if the component is currently
   focused or not and will listen to the key events if it is focused, allowing you to do stuff on
   each user action (arrows, ok, return).

```tsx
import { useNavigation } from 'taktik-flowr-react-utils'

export const MainScreen = () => {
    const isFocused = useNavigation({
        componentName: ComponentNames.MAIN_SCREEN // This is the
    })

    return <...>
}
```

This is the bare minimum options, this will make your component "focusable" turning the flag
`isFocused` to true when we decided to navigate to it. There are a lot more options you can pass to
`useNavigation` that are detailled later

4. To "navigate" to a component, that means setting the focuse to a component, you can use the hook
   `useNavigateToComponent(componentName: string)` which will return a function that can change the
   focus to the specified component. Let's take the previous example, and improve it

```tsx
import { useNavigation, useNavigateToComponent } from 'taktik-flowr-react-utils'

export const MainScreen = () => {
	const navigateToNavbar = useNavigateToComponent(ComponentNames.NAV_BAR) // Returns a function to call to change the focused component

	const isFocused = useNavigation({
        componentName: ComponentNames.MAIN_SCREEN
    })

    return <...>
}
```

5. Now that you can make a component focusable and navigate to another component, you will want to
   bind that navigation action to an arrow key, to be able to navigate between components with the
   remote / keyboard. You can bind all 6 actions to the functions you pass to the hook like
   `upAction`, `rightAction`, `returnAction`, ... In point 2, the default focused component is
   `ComponentNames.MAIN_SCREEN`, you might want to switch the focus to the navbar when pressing the
   up arrow.

```tsx
import { useNavigation, useNavigateToComponent } from 'taktik-flowr-react-utils'

export const MainScreen = () => {
	const navigateToNavbar = useNavigateToComponent(ComponentNames.NAV_BAR)

	const isFocused = useNavigation({
        componentName: ComponentNames.MAIN_SCREEN,
        upAction: navigateToNavbar // The function to call when the up arrow is pressed
        // When up is pressed, the focus will be passed to ComponentNames.NAV_BAR and here isFocused will become false
        // this component will stop listening to events, until it gets focused again.
    })

    return <...>
}
```

6. This is the most basic setup, allowing you to switch the focus to another component.
   useNavigation comes with a lot of options which are detailed in the soure code, you can also
   check the demo which contains more advanced uses.

#### API

All the hooks and parameters are documented in detail in the soure code's JSDoc at
`/src/arrow-keys-navigation-hook/UseNavigation.tsx`

- `<UseNavigationProvider />` should wrap you app at the highest level
- `useNavigation({options})` make a component focusable, listens to key event and bind them to
  functions you provide
- `useNavigateToComponent(componentName: string, shouldSavePreviouslyFocused: boolean = false)`
  returns a function to navigate to another component, the boolean can be set to true to save the
  last component that was focused, that info can be used to set back the focus to that component
  later.
- `useNavigateToPreviouslySelectedComponentOrDefault()` returns a function to navigate to the
  previously focused component that has been saved by the call to
  `useNavigateToComponent("name", true)`. You should provide a default component name to navigate to
  in case there has been no previous component saved.
- `useResetPreviouslySelectedComponent()` resets the `previouslyFocusedComponent` to null

## Development

### Build process

The root `/src` files contains the sources of the utils, they are exported in `index.ts` and
transpiled by tsc via `yarn build`. The built sources goes into `/dist` whose `index.js`is set as
main in `package.json`

Right now the files are only transpiled as nothing more is required, if you want to add images, css,
or any file other than javascript you should use and configure Webpack or Rollup.

### Peer dependencies

Don't forget to add the used packages to the peerDependencies if necessary

### React package duplication

If you are developing in this package and you want to test it in another package using `yarn link`
you are going to run into some package duplication issue (translated as a blocking hook error in
React).

On the package you want to include taktik-flowr-react-utils in, you need to symlink the packages
`react` and `react-dom` to make sure both package use the same dependency.

For example, i'm making change in this package, and want to test the package in the Hestia app I
will need to do :

- Inside `./node_modules/react` do `yarn link`
- Inside `./node_modules/react-dom` do `yarn link`
- Then go to the `flowr/external-app/embedded-app/hestia` and do `yarn link react` and
  `yarn link react-dom` This will ensure the Hestia app AND this package are using the same React
  dependency

The same goes for styled-component (will output a warning in the console), or any dependency, but
for those the duplication is not critical

This is why in `/demo/package.json` `react` and `react-dom` and `styled-component` are links to the
main modules
