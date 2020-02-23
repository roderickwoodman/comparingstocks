import React from 'react'
import PropTypes from 'prop-types'


export class TransactionLog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            filter_str: '',
        }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const new_value = target.value
        const name = target.name
        this.setState({ [name]: new_value })
    }
        
    render() {
        return (
            <section id="transaction-log">
                <section id="transaction-log-controls">
                    <form>
                        <label>Filter:</label>
                        <input name="filter_str" value={this.state.filter_str} onChange={this.handleChange} size="15" />
                    </form>
                </section>
                <section id="transactions">
                    {this.props.all_transactions.filter( transaction => transaction.summary.includes(this.state.filter_str) ).map( transaction => (
                        <p key={transaction.modified} className="transaction" onClick={ (e)=>this.props.on_delete_transaction(transaction.modified)}>{transaction.summary}</p>
                    ))}
                </section>
            </section>
        )
    }
}

TransactionLog.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
}