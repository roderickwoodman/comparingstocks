import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'


export const EditNumericCell = (props) => {

    const inputEl = useRef(null)
    const [userValue, setUserValue] = useState('')
    const [userValueIsValid, setUserValueIsValid] = useState(false)

    useEffect( () => {
        const handleEscapeKey = (event) => {
            if (event.keyCode === 27) {
                props.on_escape_key()
            }
        }
        if (isNaN(props.original_value)) {
            setUserValue('') 
        } else {
            setUserValue(props.original_value) 
        }
        inputEl.current.focus()
        document.addEventListener('keydown', handleEscapeKey, false)
        return function cleanup() {
            document.removeEventListener('keydown', handleEscapeKey, false)
        }
    }, [props, inputEl])

    const handleChange = (event) => {

        let {name, value } = event.target

        // when the input changes, validate the user's value
        if (name === 'user_value') {
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
        props.on_new_value(userValue)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input ref={inputEl} type="text" id="edit-cell" name="user_value" value={userValue} onChange={handleChange} size="5" />
            <button type="submit" disabled={!userValueIsValid}>S</button>
        </form>
    )
}

EditNumericCell.propTypes = {
    original_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    on_new_value: PropTypes.func.isRequired,
    on_escape_key: PropTypes.func.isRequired
}



