import React from 'react'
import PropTypes from 'prop-types'


export class AddTicker extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_tickers_string: '',
            add_to_group: 'ungrouped',
            status_messages: []
        }
        this.handleTickersChange = this.handleTickersChange.bind(this)
        this.handleGroupChange = this.handleGroupChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTickers = this.validateTickers.bind(this)
    }

    handleTickersChange(event) {
        this.setState({ user_tickers_string: event.target.value })
    }

    handleGroupChange(event) {
        this.setState({ add_to_group: event.target.value })
    }

    handleReset(event) {
        this.setState({ user_tickers_string: "" })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_group = this.state.add_to_group
        let user_tickers = String(this.state.user_tickers_string)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toUpperCase())
            .map(str => str.replace(/[^A-Z]/g, ""))
        this.validateTickers(user_group, Array.from(new Set(user_tickers)))
    }

    validateTickers(group, tickers) {
        let tickers_to_add = []
        let new_status_messages = []
        let self = this
        tickers.forEach(function(ticker) {
            // ticker does not exist
            if (!self.props.all_stocks.includes(ticker)) {
                new_status_messages.push('ERROR: Ticker ' + ticker + ' does not exist.')

            // ticker is already in the target group
            } else if (self.props.all_groups[group].includes(ticker)) {
                if (group === 'ungrouped') {
                    new_status_messages.push('ERROR: Ticker ' + ticker + ' has already been added.')
                } else {
                    new_status_messages.push('ERROR: Ticker ' + ticker + ' has already been added to group "'+ group +'".')
                }

            // ticker is being added to a group that it is not already in
            } else {
                let grouped_tickers = []
                Object.keys(self.props.all_groups).forEach(function(group) {
                    if (group !== 'ungrouped') {
                        grouped_tickers = grouped_tickers.concat(self.props.all_groups[group])
                    }
                })
                if (group === 'ungrouped' && grouped_tickers.includes(ticker)) {
                    new_status_messages.push('ERROR: Ticker ' + ticker + ' has already been added to another named group.')
                } else {
                    new_status_messages.push('Ticker ' + ticker + ' has now been added to group "' + group + '".')
                    tickers_to_add.push(ticker)
                }
            }
        })
        this.props.on_new_tickers(group, tickers_to_add)
        this.setState({ status_messages: new_status_messages })
        this.handleReset()
    }

    render() {
        return (
            <section id="add-ticker">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Ticker(s):</label>
                    <input value={this.state.user_tickers_string} onChange={this.handleTickersChange} placeholder="Dow30 tickers only" required />
                    <label>
                        Add to Group:
                        <select value={this.state.add_to_group} onChange={this.handleGroupChange}>
                            <option key="ungrouped" value="ungrouped">(no group)</option>
                            {Object.keys(this.props.all_groups).sort().filter(group_name => group_name !== 'ungrouped').map(group_name => (
                            <option key={group_name} value={group_name}>{group_name}</option>
                            ))}
                        </select>
                    </label>
                    <section className="buttonrow">
                        <input type="reset" value="Clear" />
                        <input type="submit" value="Add Ticker(s)" />
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

AddTicker.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_groups: PropTypes.object.isRequired,
    on_new_tickers: PropTypes.func.isRequired
}