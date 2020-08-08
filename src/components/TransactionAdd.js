import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TransactionAdd = (props) => {

    const [transactionDate] = useState('')
    const [transaction, setTransaction] = useState('')
    const [userCashAction, setUserCashAction] = useState('dividend')
    const [userCashAmount, setUserCashAmount] = useState('')

    const handleChange = (event) => {
        setTransaction(event.target.value)
    }

    const handleActionChange = (event) => {
        setUserCashAction(event.target.value)
    }

    const handleCashChange = (event) => {
        setUserCashAmount(event.target.value)
    }

    const handleCashReset = (event) => {
        setUserCashAmount("")
    }

    const handleCashSubmit = (event) => {
        event.preventDefault()
        let new_message = null
        let user_cash_action = userCashAction
        let user_date = transactionDate

        let user_cash_operation = userCashAmount
        let terms = user_cash_operation.split(' ')
        let user_cash_amount

        if (userCashAction === 'dividend') {
            if (terms.length === 3 && terms[1].toLowerCase() === 'on' && terms[2].replace(/\W/g,'').length) {
                user_cash_amount = terms[0]
            } else {
                new_message = 'ERROR: Dividend syntax must be in the form: "$200 on MSFT"'
            }
        } else {
            user_cash_amount = user_cash_operation
        }

        if (new_message === null) {
            let cash_amount = parseFloat(user_cash_amount.trim().replace(/\$/g, ""))
            if (isNaN(cash_amount)) {
                new_message = 'ERROR: Cash amount "' + cash_amount + '" is not in currency format.'
            } else {
                let total = parseFloat((Math.round(cash_amount * 100) / 100).toFixed(2));
                let valid_transaction_summary = user_date + ': ' + user_cash_action + ' $' + total.toFixed(2) + ' cash'
                if (userCashAction === 'dividend') {
                    valid_transaction_summary += ' on ' + terms[2].toUpperCase()
                }
                new_message = 'Transaction "' + valid_transaction_summary + '" has now been recorded.'
                props.on_new_cash(valid_transaction_summary)
                handleCashReset()
            }
        }
        let new_console_message_set = props.create_console_message_set(new_message)
        if (new_message.toUpperCase().startsWith('ERROR:')) {
            new_console_message_set.has_errors = true
        }
        props.on_new_console_messages(new_console_message_set)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let user_transaction = String(transaction)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.replace(/[^A-Za-z0-9$.]/g, ""))
        validateTransaction(user_transaction)
    }

    const validateTransaction = (transaction) => {
        let new_messages = [], summary_message

        if (transaction.length < 4) {

            summary_message = 'ERROR: Transaction "' + transaction + '" must be 4 terms.'
            new_messages.push(summary_message)

        } else {

            let action = transaction[0].toLowerCase()
            if (action !== 'buy' && action !== 'sell') {
                new_messages.push('ERROR: Action "' + transaction[0] + '" must be either "buy" or "sell".')
            }

            let num_shares = parseInt(transaction[1])
            if (isNaN(num_shares) || num_shares < 1) {
                new_messages.push('ERROR: Share count "' + transaction[1] + '" must be a positive integer.')
            }

            let ticker = transaction[2].toUpperCase().replace(/[^A-Z]/g, "")
            if (ticker !== transaction[2].toUpperCase() || !props.all_stocks.includes(ticker.toUpperCase())) {
                new_messages.push('ERROR: Ticker "' + transaction[2] + '" does not exist.')
            }

            let total = parseFloat(transaction[3].replace(/[^0-9.]/g, ""))
            if (isNaN(total) || total < 0) {
                new_messages.push('ERROR: Total amount "' + transaction[3] + '" must be a non-negative number.')
            } else {
                total = parseFloat((Math.round(total * 100) / 100).toFixed(2));
            }

            // this transaction is valid
            if (!new_messages.length) {

                // also print the "ticker has now been added" message, if needed
                let tagged_tickers = []
                Object.keys(props.all_tags).forEach(function(tag) {
                    props.all_tags[tag].forEach(function(ticker) {
                        if (!tagged_tickers.includes(ticker)) {
                            tagged_tickers.push(ticker)
                        }
                    })
                })
                if (tagged_tickers.includes(transaction[2].toUpperCase())) {
                    new_messages.push('Ticker ' + transaction[2].toUpperCase() + ' has now been added.')
                }

                let valid_transaction_summary = transactionDate + ': ' + action + ' ' + num_shares + ' ' + ticker + ' $' + total.toFixed(2)
                summary_message = 'Transaction "' + valid_transaction_summary + '" has now been recorded.'
                new_messages.push(summary_message)
                props.on_new_transaction(valid_transaction_summary)

            } else {
                transaction[2] = transaction[2].toUpperCase()
                transaction[3] = '$' + transaction[3]
                summary_message = 'ERROR: Transaction "' + transaction.join(' ') + '" could not be recorded'
            }
        }

        // send all of the messages to print
        let new_console_message_set = props.create_console_message_set(summary_message)
        if (summary_message.toUpperCase().startsWith('ERRROR:')) {
            new_console_message_set.has_errors = true
        }
        new_console_message_set.messages = [...new_messages]
        props.on_new_console_messages(new_console_message_set)
    }

    const getCashOperationPlaceholder = () => {
        if (userCashAction === 'dividend') {
            return "$85.00 on MSFT"
        } else if (userCashAction === 'fee') {
            return "$15"
        } else {
            return "$1000"
        }
    }

    return (
        <section id="add-transaction">
            <form>
                <label>Transaction Date:</label>
                <input name="transaction_date" value={transactionDate} onChange={handleChange} type="date" size="10" />
            </form>
            <form onSubmit={handleSubmit}>
                <label>New Transaction:</label>

                <input name="transaction" value={transaction} onChange={handleChange} size="25" placeholder="buy 100 CSCO $2200.32" required />

                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="Add Transaction" disabled={transaction==='' || transactionDate===''} />
                </section>
            </form>
            <form onSubmit={handleCashSubmit}>
                <label>Cash&nbsp;
                    <select onChange={handleActionChange}>
                        <option value="dividend">dividend</option>
                        <option value="fee">fee</option>
                        <option value="transferIN">transfer IN</option>
                        <option value="transferOUT">transfer OUT</option>
                    </select>:
                    <input value={userCashAmount} onChange={handleCashChange} size="20" placeholder={getCashOperationPlaceholder()} required />
                </label>
                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="Adjust Cash" disabled={userCashAmount==='' || transactionDate===''}/>
                </section>
            </form>
        </section>
    )
}

TransactionAdd.propTypes = {
all_stocks: PropTypes.array.isRequired,
all_tags: PropTypes.object.isRequired,
on_new_transaction: PropTypes.func.isRequired,
on_new_cash: PropTypes.func.isRequired,
on_new_console_messages: PropTypes.func.isRequired
}