import React from 'react'
import PropTypes from 'prop-types'


export class Console extends React.Component {

    render() {
        return (
            <div id="console-messages-wrapper">
                { this.props.all_console_messages.length ? 'History:' : '' }
                <div id="console-messages">
                { this.props.all_console_messages
                    .map(
                        (message_set, i) => {
                            return (message_set.summary.toLowerCase().startsWith("error"))
                            ? <p key={i + message_set.modified_at} className="message error">{message_set.summary}</p>
                            : <p key={i + message_set.modified_at} className="message">{message_set.summary}</p>
                        }
                    )
                }
                </div>
            </div>
        )
    }
}

Console.propTypes = {
    all_console_messages: PropTypes.array.isRequired,
}