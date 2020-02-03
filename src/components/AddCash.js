import React from 'react'
import PropTypes from 'prop-types'


export class AddCash extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_action: 'add',
            user_cash_amount: '',
        }
        this.handleCashChange = this.handleCashChange.bind(this)
        this.handleActionChange = this.handleActionChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleActionChange(event) {
        this.setState({ user_action: event.target.value })
    }

    handleCashChange(event) {
        this.setState({ user_cash_amount: event.target.value })
    }

    handleReset(event) {
        this.setState({ user_cash_amount: "" })
    }

    handleSubmit(event) {
        event.preventDefault()
        let new_status_messages = []
        let user_action = this.state.user_action
        let user_cash_amount = parseFloat(this.state.user_cash_amount.trim().replace(/\$/g, ""))
        if (isNaN(user_cash_amount)) {
            new_status_messages.push('ERROR: Cash amount "' + this.state.user_cash_amount + '" is not in currency format.')
        } else {
            let total = parseFloat((Math.round(user_cash_amount * 100) / 100).toFixed(2));
            let valid_transaction = user_action + ' $' + total.toFixed(2) + ' cash'
            new_status_messages.push('Transaction "' + valid_transaction + '" has now been recorded.')
            this.props.on_new_cash(valid_transaction)
            this.handleReset()
        }
        this.props.on_new_messages(new_status_messages)
    }

    render() {
        return (
            <section id="add-ticker">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>Add/Remove Cash:
                        <select value={this.state.action} onChange={this.handleActionChange}>
                            <option value="add">add</option>
                            <option value="remove">remove</option>
                        </select>
                        <input value={this.state.user_cash_amount} onChange={this.handleCashChange} size="15" placeholder="$1000" required />
                    </label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-secondary" type="reset" value="Clear" placeholder="$500.99" disabled={this.state.user_cash_amount===''} />
                        <input className="btn btn-sm btn-secondary" type="submit" value="Adjust Cash" disabled={this.state.user_cash_amount===''}/>
                    </section>
                </form>
            </section>
        )
    }
}

AddCash.propTypes = {
    on_new_cash: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired
}