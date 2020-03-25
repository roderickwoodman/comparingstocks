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
                        (message, i) => {
                            return (message.content.toLowerCase().startsWith("error"))
                            ? <p key={i + message.modified_at} className="message error">{message.content}</p>
                            : <p key={i + message.modified_at} className="message">{message.content}</p>
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