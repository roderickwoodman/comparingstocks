import React from 'react'
import PropTypes from 'prop-types'


export class AddTag extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_tags_string: '',
            status_messages: []
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
        let tags_to_add = []
        let new_status_messages = []
        let self = this
        tags.forEach(function(tag) {
            if (self.props.all_tags.hasOwnProperty(tag)) {
                new_status_messages.push('ERROR: Tag "' + tag + '" has already been created.')
            } else {
                new_status_messages.push('Tag "' + tag + '" has now been created.')
                tags_to_add.push(tag)
            }
        })
        this.props.on_new_tags(tags_to_add)
        this.setState({ status_messages: new_status_messages })
        this.handleReset()
    }

    render() {
        return (
            <section id="add-tag">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Tag Name(s):</label>
                    <input value={this.state.user_tags_string} onChange={this.handleChange} required />
                    <section className="buttonrow">
                        <input type="reset" value="Clear" disabled={this.state.user_tags_string===''} />
                        <input type="submit" value="Create Tag(s)" disabled={this.state.user_tags_string===''} />
                    </section>
                </form>
                <div className="status-messages">
                    { this.state.status_messages
                        .map(
                            (message, i) => {
                                return (message.toLowerCase().startsWith("error"))
                                ? <p key={i} className="message error">{message}</p>
                                : <p key={i} className="message">{message}</p>
                            }
                        )
                    }
                </div>
            </section>
        )
    }
}

AddTag.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_new_tags: PropTypes.func.isRequired
}