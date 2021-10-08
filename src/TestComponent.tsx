import React from 'react'

interface IProps {
	value: string
}

export const TestComponent = ({ value }: IProps) => {
	const lol = 'This is the package !'
	return <div style={{ color: 'red', backgroundColor: 'cyan' }}>{value ?? lol}</div>
}
