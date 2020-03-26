import React from 'react'
import PropTypes from 'prop-types'


export class TagAdd extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_tags_string: '',
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTags = this.validateTags.bind(this)
    }

    handleChange(event) {
        this.setState({ user_tags_string: event.target.value })
    }

    handleReset(event) {
        this.setState({ user_tags_string: "" })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_tags = String(this.state.user_tags_string)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toLowerCase())
            .map(str => str.replace(/[^a-z0-9:()-_!?]/g, ""))
        this.validateTags(Array.from(new Set(user_tags)))
    }

    validateTags(tags) {
        let tags_to_add = [], new_messages = []
        let self = this
        tags.forEach(function(tag) {
            if (self.props.all_tags.hasOwnProperty(tag)) {
                new_messages.push('ERROR: Tag "' + tag + '" has already been created.')
            } else {
                new_messages.push('Tag "' + tag + '" has now been created.')
                tags_to_add.push(tag)
            }
        })
        let num_errors = new_messages.filter(message => message.includes('ERROR')).length
        if (num_errors === 0) {
            num_errors = 'no'
        }
        let new_console_message_set
        if (new_messages.length > 1) {
            new_console_message_set = this.props.create_console_message_set('Created ' + tags_to_add.length + ' tags with ' + num_errors + ' errors.')
            new_console_message_set.messages = [...new_messages]
        } else {
            new_console_message_set = this.props.create_console_message_set(new_messages[0])
        }
        this.props.on_new_tags(tags_to_add)
        this.props.on_new_console_messages(new_console_message_set)
        this.handleReset()
    }

    render() {
        return (
            <section id="add-tag">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Tag Name(s):</label>
                    <input value={this.state.user_tags_string} onChange={this.handleChange} required />
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Create Tag(s)" disabled={this.state.user_tags_string===''} />
                    </section>
                </form>
            </section>
        )
    }
}

TagAdd.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    create_console_message_set: PropTypes.func.isRequired,
    on_new_console_messages: PropTypes.func.isRequired
}