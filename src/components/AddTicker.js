import React from 'react'
import PropTypes from 'prop-types'


export class AddTicker extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            value: '',
            status_messages: []
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTickers = this.validateTickers.bind(this)
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
            .map(str => str.toUpperCase())
            .map(str => str.replace(/[^A-Z]/g, ""))
        this.validateTickers(Array.from(new Set(user_tickers)))
    }

    validateTickers(tickers) {
        let tickers_to_add = []
        let new_status_messages = []
        let self = this
        tickers.forEach(function(ticker) {
            if (!self.props.all_stocks.includes(ticker)) {
                new_status_messages.push('ERROR: Ticker ' + ticker + ' does not exist.')
            } else if (self.props.user_stocks.includes(ticker)) {
                new_status_messages.push('ERROR: Ticker ' + ticker + ' has already been added.')
            } else {
                new_status_messages.push('Ticker ' + ticker + ' has now been added.')
                tickers_to_add.push(ticker)
            }
        })
        this.props.on_new_tickers(tickers_to_add)
        this.setState({ status_messages: new_status_messages })
        this.handleReset()
    }

    render() {
        return (
            <section id="add-ticker">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Ticker(s):</label>
                    <input value={this.state.value} onChange={this.handleChange} placeholder="Dow30 tickers only" required />
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
    user_stocks: PropTypes.array.isRequired,
    on_new_tickers: PropTypes.func.isRequired
}