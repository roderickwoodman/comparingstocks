import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            balanceable_value: 0,
            balance_target_set: 'my_holdings',
            cash_treatment: 'ignore',
            cash_remaining: '$0',
            cash_valid: true
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.isDisabled = this.isDisabled.bind(this)
    }

    componentDidMount() {
        let balanceable_value = 0
        Object.keys(this.props.all_positions).forEach( ticker => balanceable_value += this.props.all_positions[ticker].current_shares * this.props.all_current_quotes[ticker].current_price)
        this.setState({ balanceable_value: balanceable_value })
    }

    handleChange(event) {

        let {name, value } = event.target

        // when the balance target input changes, update the maximum value
        if (name === 'balance_target_set') {
            let new_balanceable_value = this.props.get_balanceable_value(value)
            this.setState({ balanceable_value: new_balanceable_value })
        }

        // when the cash remaining input changes, validate the user's value
        if (name === 'cash_remaining') {
            let user_whole_dollars_string = value.replace('$','').split('.')[0]
            let user_whole_dollars = parseInt(user_whole_dollars_string)
            let valid_whole_dollars_string = value.replace(/[^0-9.]/g,'').split('.')[0]
            if (valid_whole_dollars_string.length 
                && user_whole_dollars_string === valid_whole_dollars_string 
                && user_whole_dollars >= 0
                && user_whole_dollars <= this.state.balanceable_value) { 
                this.setState({ cash_valid: true })
            } else {
                this.setState({ cash_valid: false })
            }
        }

        // mirror the input in state, since this is a (React) controlled input
        this.setState({ [name]: value })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_remaining_cash = this.state.cash_remaining.split('.')[0].replace(/[^0-9]/g, "")
        let remaining_cash = (this.state.cash_treatment === 'ignore') ? null : parseInt(user_remaining_cash)
        this.props.on_whatif_submit(this.state.balance_target_set, remaining_cash)
    }

    isDisabled() {
        if (this.state.balance_target_set === 'my_holdings' && !this.props.show_holdings) {
            return true
        } else if (this.state.balance_target_set === 'untagged' && !this.props.show_untagged) {
            return true
        } else {
            return false
        }

    }

    render() {
        return (
            <section id="what-if">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <div>Balance&nbsp;
                        <select name="balance_target_set" value={this.state.balance_target_set} onChange={this.handleChange}>
                            <option value="my_holdings">my holdings</option>
                            <option value="untagged">untagged tickers</option>
                        </select>
                        &nbsp;into equal values...</div>
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cash_treatment" value="ignore" selected onChange={this.handleChange} defaultChecked />ignoring my cash balance</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cash_treatment" value="include" onChange={this.handleChange} disabled={!this.props.show_cash} />using my cash balance, and leaving at least
                    <input type="text" id="cash_remaining" name="cash_remaining" size="12" onChange={this.handleChange} value={this.state.cash_remaining}></input> cash remaining (max: ${this.state.balanceable_value})</label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-secondary" type="submit" value="What If?" disabled={this.isDisabled()}/>
                    </section>
                </form>
            </section>
        )
    }
}

WhatIf.propTypes = {
    all_current_quotes: PropTypes.object,
    all_tags: PropTypes.object,
    all_positions: PropTypes.object,
    get_balanceable_value: PropTypes.func,
    show_holdings: PropTypes.bool,
    show_untagged: PropTypes.bool,
    show_cash: PropTypes.bool,
    on_whatif_submit: PropTypes.func
}