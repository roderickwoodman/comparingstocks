import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'


export const EditNumericCell = (props) => {

    const inputEl = useRef(null)
    const [userValue, setUserValue] = useState('')
    const [userValueIsValid, setUserValueIsValid] = useState(false)

    useEffect( () => {
        const handleEscapeKey = (event) => {
            if (event.keyCode === 27) {
                props.onEscapeKey()
            }
        }
        if (isNaN(props.originalValue)) {
            setUserValue('') 
        } else {
            setUserValue(props.originalValue) 
        }
        inputEl.current.focus()
        document.addEventListener('keydown', handleEscapeKey, false)
        return function cleanup() {
            document.removeEventListener('keydown', handleEscapeKey, false)
        }
    }, [props, inputEl])

    const handleChange = (event) => {

        const {name, value } = event.target

        // when the input changes, validate the user's value
        if (name === 'userValue') {
            if (value.length && !isNaN(value) && value > 0) {
                setUserValue(value)
                setUserValueIsValid(true)
            } else {
                setUserValue(value)
                setUserValueIsValid(false)
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        props.onNewValue(userValue)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input ref={inputEl} type="text" id="edit-cell" name="userValue" value={userValue} onChange={handleChange} size="5" />
            <button type="submit" disabled={!userValueIsValid}>S</button>
        </form>
    )
}

EditNumericCell.propTypes = {
    originalValue: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    onNewValue: PropTypes.func.isRequired,
    onEscapeKey: PropTypes.func.isRequired
}



