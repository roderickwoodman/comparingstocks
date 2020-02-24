import React from 'react'
import PropTypes from 'prop-types'


export class TransactionLog extends React.Component {

    constructor(props) {
        super(props)
        this.exportRef = React.createRef()
        this.state = {
            filter_str: '',
        }
        this.handleChange = this.handleChange.bind(this)
        this.onExportButton = this.onExportButton.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const new_value = target.value
        const name = target.name
        this.setState({ [name]: new_value })
    }
        
    onExportButton() {

        // prepare the data
        let all_transactions = {
            transactions: JSON.parse(JSON.stringify(this.props.all_transactions))
        }
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(all_transactions));

        // create the download link
        var a = document.createElement('a')
        a.href = 'data:' + data
        a.download = 'transactions.json'
        a.innerHTML = 'download'

        // attach the download link, trigger it, and then remove it from the DOM
        var container = this.exportRef.current
        container.appendChild(a)
        a.click()
        a.remove()
    }

    render() {
        return (
            <section id="transaction-log">
                <section id="transaction-log-controls">
                    <form>
                        <label>Filter:</label>
                        <input name="filter_str" value={this.state.filter_str} onChange={this.handleChange} size="15" />
                        <button onClick={this.onExportButton}>export</button>
                        <div ref={this.exportRef}></div>
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