import React from 'react'
import PropTypes from 'prop-types'


export class Console extends React.Component {

    constructor(props) {
        super(props)
        this.getClasses = this.getClasses.bind(this)
    }

    getClasses(message) {
        let classes = 'message'
        if (message.toLowerCase().includes('error')) {
            classes += ' warning'
        }
        return classes
    }

    render() {
        let message_sets = this.props.all_console_messages
        return (
            <div id="console-messages-wrapper">
                { message_sets.length ? 'History:' : '' }
                <div id="console-messages">
                { message_sets && message_sets.map( message_set => (
                    message_set.messages.map( (message, j) => (
                            <p key={j} className={this.getClasses(message)}>{message}</p>
                    ))
                ))}
                </div>
            </div>
        )
    }
}

Console.propTypes = {
    all_console_messages: PropTypes.array.isRequired,
}