import React from 'react'
import PropTypes from 'prop-types'


export class DeleteGroup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            delete_group: 'ungrouped',
            status_messages: []
        }
        this.handleGroupChange = this.handleGroupChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleGroupChange(event) {
        this.setState({ delete_group: event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_group = this.state.delete_group
        let new_status_messages = []

        if (user_group !== 'ungrouped') {
            new_status_messages.push('Group ' + user_group + ' has now been deleted.')
            this.props.on_delete_group(user_group)
            this.setState({ delete_group: 'ungrouped', status_messages: new_status_messages })
        }
    }

    render() {
        return (
            <section id="delete-group">
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Delete Group:
                        <select value={this.state.delete_group} onChange={this.handleGroupChange}>
                            <option key="ungrouped" value="ungrouped">(none)</option>
                            {Object.keys(this.props.all_groups).sort().filter(group_name => group_name !== 'ungrouped').map(group_name => (
                            <option key={group_name} value={group_name}>{group_name}</option>
                            ))}
                        </select>
                    </label>
                    <section className="buttonrow">
                        <input type="submit" value="Delete Group" disabled={this.state.delete_group==='ungrouped'} />
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

DeleteGroup.propTypes = {
    all_groups: PropTypes.object.isRequired,
    on_delete_group: PropTypes.func.isRequired
}