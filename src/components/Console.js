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

        const PopulateMessage = ({key, message, timestamp}) => {
            return (
                <p key={key} className={this.getClasses(message)}>[{timestamp}] {message}</p>
            )
        }

        let message_sets = this.props.all_console_messages
        return (
            <div id="console-messages-wrapper">
                { message_sets.length ? 'History:' : '' }
                <div id="console-messages">
                { message_sets && message_sets.map( message_set => (
                    message_set.messages.map( (message, j) => (
                        <PopulateMessage key={j} message={message} timestamp={message_set.modified_at} />
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