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
        let user_tags = String(userTagsString)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toLowerCase())
            .map(str => str.replace(/[^a-z0-9:()-_!?]/g, ""))
        validateTags(Array.from(new Set(user_tags)))
    }

    const validateTags = (tags) => {
        let tags_to_add = [], new_messages = []
        tags.forEach(function(tag) {
            if (props.all_tags.hasOwnProperty(tag)) {
                new_messages.push('ERROR: Tag "' + tag + '" has already been created.')
            } else {
                new_messages.push('Tag "' + tag + '" has now been created.')
                tags_to_add.push(tag)
            }
        })
        let num_errors = new_messages.filter(message => message.includes('ERROR')).length
        let summary
        if (new_messages.length === 1) {
            summary = new_messages[0]
        } else if (num_errors === 0) {
            summary = 'Created ' + tags.length + ' tags.'
        } else {
            summary = 'ERROR: ' + num_errors + ' of ' + tags.length + ' tags could not be created.'
        }
        let new_console_message_set = props.create_console_message_set(summary)
        if (new_messages.length > 1) {
            new_console_message_set.messages = [...new_messages]
        }
        if (num_errors > 0) {
            new_console_message_set.has_errors = true
        }
        props.on_new_tags(tags_to_add)
        props.on_new_console_messages(new_console_message_set)
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
    all_tags: PropTypes.object.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    create_console_message_set: PropTypes.func.isRequired,
    on_new_console_messages: PropTypes.func.isRequired
}