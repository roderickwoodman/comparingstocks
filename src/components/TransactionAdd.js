import React, { useState } from 'react'
import PropTypes from 'prop-types'


export const TransactionAdd = (props) => {

    const [transactionDate, setTransactionDate] = useState('')
    const [transaction, setTransaction] = useState('')
    const [userCashAction, setUserCashAction] = useState('dividend')
    const [userCashAmount, setUserCashAmount] = useState('')

    const handleChange = (event) => {
        if (event.target.name === 'transaction') {
            setTransaction(event.target.value)
        } else if (event.target.name === 'transaction_date') {
            setTransactionDate(event.target.value)
        }
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
                props.onNewCash(valid_transaction_summary)
                handleCashReset()
            }
        }
        let newConsoleMessageSet = props.createConsoleMessageSet(new_message)
        if (new_message.toUpperCase().startsWith('ERROR:')) {
            newConsoleMessageSet.hasErrors = true
        }
        props.onNewConsoleMessages(newConsoleMessageSet)
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
        let newMessages = [], summary_message

        if (transaction.length < 4) {

            summary_message = 'ERROR: Transaction "' + transaction + '" must be 4 terms.'
            newMessages.push(summary_message)

        } else {

            let action = transaction[0].toLowerCase()
            if (action !== 'buy' && action !== 'sell') {
                newMessages.push('ERROR: Action "' + transaction[0] + '" must be either "buy" or "sell".')
            }

            let num_shares = parseInt(transaction[1])
            if (isNaN(num_shares) || num_shares < 1) {
                newMessages.push('ERROR: Share count "' + transaction[1] + '" must be a positive integer.')
            }

            let ticker = transaction[2].toUpperCase().replace(/[^A-Z]/g, "")
            if (ticker !== transaction[2].toUpperCase() || !props.allStocks.includes(ticker.toUpperCase())) {
                newMessages.push('ERROR: Ticker "' + transaction[2] + '" does not exist.')
            }

            let total = parseFloat(transaction[3].replace(/[^0-9.]/g, ""))
            if (isNaN(total) || total < 0) {
                newMessages.push('ERROR: Total amount "' + transaction[3] + '" must be a non-negative number.')
            } else {
                total = parseFloat((Math.round(total * 100) / 100).toFixed(2));
            }

            // this transaction is valid
            if (!newMessages.length) {

                // also print the "ticker has now been added" message, if needed
                let taggedTickers = []
                Object.keys(props.allTags).forEach(function(tag) {
                    props.allTags[tag].forEach(function(ticker) {
                        if (!taggedTickers.includes(ticker)) {
                            taggedTickers.push(ticker)
                        }
                    })
                })
                if (taggedTickers.includes(transaction[2].toUpperCase())) {
                    newMessages.push('Ticker ' + transaction[2].toUpperCase() + ' has now been added.')
                }

                let valid_transaction_summary = transactionDate + ': ' + action + ' ' + num_shares + ' ' + ticker + ' $' + total.toFixed(2)
                summary_message = 'Transaction "' + valid_transaction_summary + '" has now been recorded.'
                newMessages.push(summary_message)
                props.onNewTransaction(valid_transaction_summary)

            } else {
                transaction[2] = transaction[2].toUpperCase()
                transaction[3] = '$' + transaction[3]
                summary_message = 'ERROR: Transaction "' + transaction.join(' ') + '" could not be recorded'
            }
        }

        // send all of the messages to print
        let newConsoleMessageSet = props.createConsoleMessageSet(summary_message)
        if (summary_message.toUpperCase().startsWith('ERRROR:')) {
            newConsoleMessageSet.hasErrors = true
        }
        newConsoleMessageSet.messages = [...newMessages]
        props.onNewConsoleMessages(newConsoleMessageSet)
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
allStocks: PropTypes.array.isRequired,
allTags: PropTypes.object.isRequired,
onNewTransaction: PropTypes.func.isRequired,
onNewCash: PropTypes.func.isRequired,
onNewConsoleMessages: PropTypes.func.isRequired
}