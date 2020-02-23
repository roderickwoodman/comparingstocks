import React from 'react'
import PropTypes from 'prop-types'


export class TransactionLog extends React.Component {

    render() {
        return (
            <section id="transaction-log">
                {this.props.all_transactions.map( transaction => (
                    <p key={transaction.modified} className="transaction" onClick={ (e)=>this.props.on_delete_transaction(transaction.modified)}>{transaction.summary}</p>
                ))}
            </section>
        )
    }
}

TransactionLog.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
}