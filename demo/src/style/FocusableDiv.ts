import styled from 'styled-components'

export const FocusableDiv = styled.div<{ isFocused: boolean }>`
	background-color: ${({ isFocused }) => (isFocused ? '#b4d455' : 'white')};
`
