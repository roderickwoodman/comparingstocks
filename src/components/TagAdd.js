import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TagAdd = (props) => {

    const [userTagsString, setUserTagsString] = useState('')

    const handleChange = (event) => {
        setUserTagsString(event.target.value)
    }

    const handleReset = (event) => {
        setUserTagsString('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let userTags = String(userTagsString)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toLowerCase())
            .map(str => str.replace(/[^a-z0-9:()-_!?]/g, ""))
        validateTags(Array.from(new Set(userTags)))
    }

    const validateTags = (tags) => {
        let tagsToAdd = [], newMessages = []
        tags.forEach(function(tag) {
            if (props.allTags.hasOwnProperty(tag)) {
                newMessages.push('ERROR: Tag "' + tag + '" has already been created.')
            } else {
                newMessages.push('Tag "' + tag + '" has now been created.')
                tagsToAdd.push(tag)
            }
        })
        let numErrors = newMessages.filter(message => message.includes('ERROR')).length
        let summary
        if (newMessages.length === 1) {
            summary = newMessages[0]
        } else if (numErrors === 0) {
            summary = 'Created ' + tags.length + ' tags.'
        } else {
            summary = 'ERROR: ' + numErrors + ' of ' + tags.length + ' tags could not be created.'
        }
        let newConsoleMessageSet = props.createConsoleMessageSet(summary)
        if (newMessages.length > 1) {
            newConsoleMessageSet.messages = [...newMessages]
        }
        if (numErrors > 0) {
            newConsoleMessageSet.hasErrors = true
        }
        props.onNewTags(tagsToAdd)
        props.onNewConsoleMessages(newConsoleMessageSet)
        handleReset()
    }

    return (
        <section id="add-tag">
            <form onSubmit={handleSubmit} onReset={handleReset}>
                <label>New Tag Name(s):</label>
                <input value={userTagsString} onChange={handleChange} required />
                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="Create Tag(s)" disabled={userTagsString===''} />
                </section>
            </form>
        </section>
    )
}

TagAdd.propTypes = {
    allTags: PropTypes.object.isRequired,
    onNewTags: PropTypes.func.isRequired,
    createConsoleMessageSet: PropTypes.func.isRequired,
    onNewConsoleMessages: PropTypes.func.isRequired
}