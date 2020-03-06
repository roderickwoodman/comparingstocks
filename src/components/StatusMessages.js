import React from 'react'
import PropTypes from 'prop-types'


export class StatusMessages extends React.Component {

    render() {
        return (
            <div id="status-messages-wrapper">
                { this.props.all_status_messages.length ? 'History:' : '' }
                <div id="status-messages">
                { this.props.all_status_messages
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

StatusMessages.propTypes = {
    all_status_messages: PropTypes.array.isRequired,
}