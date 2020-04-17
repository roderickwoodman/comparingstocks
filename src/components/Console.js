import React from 'react'
import PropTypes from 'prop-types'


export class Console extends React.Component {

    constructor(props) {
        super(props)
        this.getClasses = this.getClasses.bind(this)
        this.formatTimestamp = this.formatTimestamp.bind(this)
    }

    getClasses(message) {
        let classes = 'message'
        if (message.toLowerCase().includes('error')) {
            classes += ' warning'
        }
        return classes
    }

    formatTimestamp(epoch) {
        let date = new Date(epoch);
        let iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)
        return iso[1] + ' ' + iso[2]
    }

    render() {

        const PopulateMessage = ({key, message, timestamp}) => {
            return (
                <p key={key} className={this.getClasses(message)}>[{this.formatTimestamp(timestamp)}] {message}</p>
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