import React from 'react'
import PropTypes from 'prop-types'


export class AddTransaction extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            transaction: '',
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTransaction = this.validateTransaction.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const new_value = target.value
        const name = target.name
        this.setState({ [name]: new_value })
    }

    handleReset(event) {
        this.setState({ 
            transaction: ''
        })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_transaction = String(this.state.transaction)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.replace(/[^A-Za-z0-9$.]/g, ""))
        this.validateTransaction(user_transaction)
    }

    validateTransaction(transaction) {
        let new_status_messages = []

        if (transaction.length < 4) {

            new_status_messages.push('ERROR: Transaction "' + transaction + '" must be 4 terms.')

        } else {

            let action = transaction[0].toLowerCase()
            if (action !== 'buy' && action !== 'sell') {
                new_status_messages.push('ERROR: Action "' + transaction[0] + '" must be either "buy" or "sell".')
            }

            let num_shares = parseInt(transaction[1])
            if (isNaN(num_shares) || num_shares < 1) {
                new_status_messages.push('ERROR: Share count "' + transaction[1] + '" must be a positive integer.')
            }

            let ticker = transaction[2].toUpperCase().replace(/[^A-Z]/g, "")
            if (ticker !== transaction[2].toUpperCase() || !this.props.all_stocks.includes(ticker.toUpperCase())) {
                new_status_messages.push('ERROR: Ticker "' + transaction[2] + '" does not exist.')
            }

            let total = parseFloat(transaction[3].replace(/[^0-9.]/g, ""))
            if (isNaN(total) || total < 0) {
                new_status_messages.push('ERROR: Total amount "' + transaction[3] + '" must be a non-negative number.')
            } else {
                total = parseFloat((Math.round(total * 100) / 100).toFixed(2));
            }

            // this transaction is valid
            if (!new_status_messages.length) {

                // also print the "ticker has now been added" message, if needed
                let tagged_tickers = []
                let self = this
                Object.keys(this.props.all_tags).forEach(function(tag) {
                    self.props.all_tags[tag].forEach(function(ticker) {
                        if (!tagged_tickers.includes(ticker)) {
                            tagged_tickers.push(ticker)
                        }
                    })
                })
                if (tagged_tickers.includes(transaction[2].toUpperCase())) {
                    new_status_messages.push('Ticker ' + transaction[2].toUpperCase() + ' has now been added.')
                }

                let valid_transaction = action + ' ' + num_shares + ' ' + ticker + ' $' + total.toFixed(2)
                new_status_messages.push('Transaction "' + valid_transaction + '" has now been recorded.')
                this.props.on_new_transaction(valid_transaction)
            }

        }

        // send all of the messages to print
        this.props.on_new_messages(new_status_messages)
    }

    render() {
        return (
            <section id="add-transaction">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Transaction:</label>

                    <input name="transaction" value={this.state.transaction} onChange={this.handleChange} size="30" placeholder="buy 100 CSCO $2200.32" required />

                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Add Transaction" disabled={this.state.transaction===''} />
                    </section>
                </form>
            </section>
        )
    }
}

AddTransaction.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired
}