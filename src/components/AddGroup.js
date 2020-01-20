import React from 'react'
import PropTypes from 'prop-types'


export class AddGroup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            value: '',
            status_messages: []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateGroups = this.validateGroups.bind(this)
    }

    handleChange(event) {
        this.setState({ value: event.target.value })
    }

    handleReset(event) {
        this.setState({ value: "" })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_tickers = String(this.state.value)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toLowerCase())
            .map(str => str.replace(/[^a-z]/g, ""))
        this.validateGroups(Array.from(new Set(user_tickers)))
    }

    validateGroups(groups) {
        let groups_to_add = []
        let new_status_messages = []
        let self = this
        groups.forEach(function(group) {
            if (self.props.all_groups.hasOwnProperty(group)) {
                new_status_messages.push('ERROR: Group "' + group + '" has already been created.')
            } else {
                new_status_messages.push('Group "' + group + '" has now been created.')
                groups_to_add.push(group)
            }
        })
        this.props.on_new_groups(groups_to_add)
        this.setState({ status_messages: new_status_messages })
        this.handleReset()
    }

    render() {
        return (
            <section id="add-group">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Group Name(s):</label>
                    <input value={this.state.value} onChange={this.handleChange} required />
                    <section className="buttonrow">
                        <input type="reset" value="Clear" />
                        <input type="submit" value="Create Group(s)" />
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

AddGroup.propTypes = {
    all_groups: PropTypes.object.isRequired,
    on_new_groups: PropTypes.func.isRequired
}