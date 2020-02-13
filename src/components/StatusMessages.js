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
                            return (message.toLowerCase().startsWith("error"))
                            ? <p key={i} className="message error">{message}</p>
                            : <p key={i} className="message">{message}</p>
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