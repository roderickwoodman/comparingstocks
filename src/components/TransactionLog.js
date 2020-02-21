import React from 'react'
import PropTypes from 'prop-types'


export class TransactionLog extends React.Component {

    render() {

        let flattened_transactions = []
        this.props.all_transactions.forEach(transaction_list => transaction_list.forEach(transaction => flattened_transactions.push(transaction)))

        return (
            <section id="transaction-log">
                {flattened_transactions.map( (transaction, idx) => (
                    <p key={idx}>{transaction}</p>
                ))}
            </section>
        )
    }
}

TransactionLog.propTypes = {
    all_transactions: PropTypes.array.isRequired,
}