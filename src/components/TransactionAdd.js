import React from 'react'
import PropTypes from 'prop-types'


export class TransactionAdd extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            transaction_date: '',
            transaction: '',
            user_cash_action: 'add',
            user_cash_amount: '',
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTransaction = this.validateTransaction.bind(this)
        this.handleCashChange = this.handleCashChange.bind(this)
        this.handleCashReset = this.handleCashReset.bind(this)
        this.handleActionChange = this.handleActionChange.bind(this)
        this.handleCashSubmit = this.handleCashSubmit.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const new_value = target.value
        const name = target.name
        this.setState({ [name]: new_value })
    }

    handleActionChange(event) {
        this.setState({ user_cash_action: event.target.value })
    }

    handleCashChange(event) {
        this.setState({ user_cash_amount: event.target.value })
    }

    handleCashReset(event) {
        this.setState({ user_cash_amount: "" })
    }

    handleCashSubmit(event) {
        event.preventDefault()
        let new_console_messages = []
        let user_cash_action = this.state.user_cash_action
        let user_date = this.state.transaction_date
        let user_cash_amount = parseFloat(this.state.user_cash_amount.trim().replace(/\$/g, ""))
        if (isNaN(user_cash_amount)) {
            new_console_messages.push(this.props.create_message('ERROR: Cash amount "' + this.state.user_cash_amount + '" is not in currency format.'))
        } else {
            let total = parseFloat((Math.round(user_cash_amount * 100) / 100).toFixed(2));
            let valid_transaction_summary = user_date + ': ' + user_cash_action + ' $' + total.toFixed(2) + ' cash'
            new_console_messages.push(this.props.create_message('Transaction "' + valid_transaction_summary + '" has now been recorded.'))
            this.props.on_new_cash(valid_transaction_summary)
            this.handleCashReset()
        }
        this.props.on_new_messages(new_console_messages)
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
        let new_console_messages = []
        const create_message = this.props.create_message

        if (transaction.length < 4) {

            new_console_messages.push(create_message('ERROR: Transaction "' + transaction + '" must be 4 terms.'))

        } else {

            let action = transaction[0].toLowerCase()
            if (action !== 'buy' && action !== 'sell') {
                new_console_messages.push(create_message('ERROR: Action "' + transaction[0] + '" must be either "buy" or "sell".'))
            }

            let num_shares = parseInt(transaction[1])
            if (isNaN(num_shares) || num_shares < 1) {
                new_console_messages.push(create_message('ERROR: Share count "' + transaction[1] + '" must be a positive integer.'))
            }

            let ticker = transaction[2].toUpperCase().replace(/[^A-Z]/g, "")
            if (ticker !== transaction[2].toUpperCase() || !this.props.all_stocks.includes(ticker.toUpperCase())) {
                new_console_messages.push(create_message('ERROR: Ticker "' + transaction[2] + '" does not exist.'))
            }

            let total = parseFloat(transaction[3].replace(/[^0-9.]/g, ""))
            if (isNaN(total) || total < 0) {
                new_console_messages.push(create_message('ERROR: Total amount "' + transaction[3] + '" must be a non-negative number.'))
            } else {
                total = parseFloat((Math.round(total * 100) / 100).toFixed(2));
            }

            // this transaction is valid
            if (!new_console_messages.length) {

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
                    new_console_messages.push(create_message('Ticker ' + transaction[2].toUpperCase() + ' has now been added.'))
                }

                let valid_transaction_summary = this.state.transaction_date + ': ' + action + ' ' + num_shares + ' ' + ticker + ' $' + total.toFixed(2)
                new_console_messages.push(create_message('Transaction "' + valid_transaction_summary + '" has now been recorded.'))
                this.props.on_new_transaction(valid_transaction_summary)
            }

        }

        // send all of the messages to print
        this.props.on_new_messages(new_console_messages)
    }

    render() {
        return (
            <section id="add-transaction">
                <form>
                    <label>Transaction Date:</label>
                    <input name="transaction_date" value={this.state.transaction_date} onChange={this.handleChange} type="date" size="10" />
                </form>
                <form onSubmit={this.handleSubmit}>
                    <label>New Transaction:</label>

                    <input name="transaction" value={this.state.transaction} onChange={this.handleChange} size="25" placeholder="buy 100 CSCO $2200.32" required />

                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Add Transaction" disabled={this.state.transaction==='' || this.state.transaction_date===''} />
                    </section>
                </form>
                <form onSubmit={this.handleCashSubmit}>
                    <label>Add/Remove Cash:
                        <select value={this.state.action} onChange={this.handleActionChange}>
                            <option value="dividend">dividend</option>
                            <option value="fee">fee</option>
                            <option value="transferIN">transfer IN</option>
                            <option value="transferOUT">transfer OUT</option>
                        </select>
                        <input value={this.state.user_cash_amount} onChange={this.handleCashChange} size="12" placeholder="$1000" required />
                    </label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Adjust Cash" disabled={this.state.user_cash_amount==='' || this.state.transaction_date===''}/>
                    </section>
                </form>
            </section>
        )
    }
}

TransactionAdd.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_new_cash: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired
}