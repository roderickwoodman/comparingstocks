import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            balanceable_value: 0,
            balance_target_set: 'my_holdings',
            balance_target_column: 'current_value',
            sell_all_of: 'sell_none',
            cash_treatment: 'ignore',
            cash_remaining: '$0',
            cash_valid: true
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.isDisabled = this.isDisabled.bind(this)
        this.numberWithCommas = this.numberWithCommas.bind(this)
    }

    componentDidMount() {
        let new_balanceable_value = Math.round(this.props.get_balanceable_value(this.state.balance_target_set, this.state.balance_target_column))
        this.setState({ balanceable_value: new_balanceable_value })

        const stored_balance_target_set = JSON.parse(localStorage.getItem("balance_target_set"))
        if (stored_balance_target_set !== null) {
            this.setState({ balance_target_set: stored_balance_target_set })
        }

        const stored_balance_target_column = JSON.parse(localStorage.getItem("balance_target_column"))
        if (stored_balance_target_column !== null) {
            this.setState({ balance_target_column: stored_balance_target_column })
        }

        const stored_cash_treatment = JSON.parse(localStorage.getItem("cash_treatment"))
        if (stored_cash_treatment !== null) {
            this.setState({ cash_treatment: stored_cash_treatment })
        }

        const stored_cash_remaining = JSON.parse(localStorage.getItem("cash_remaining"))
        if (stored_cash_remaining !== null) {
            this.setState({ cash_remaining: stored_cash_remaining })
        }
    }

    handleChange(event) {

        let {name, value } = event.target

        // when the balance target set input changes, update the maximum value
        if (name === 'balance_target_set') {
            let new_balanceable_value = Math.round(this.props.get_balanceable_value(value, this.state.balance_target_column))
            this.setState({ balanceable_value: new_balanceable_value })
        }

        // when the balance target column input changes, update the maximum value
        if (name === 'balance_target_column') {
            let new_balanceable_value = Math.round(this.props.get_balanceable_value(this.state.balance_target_set, value))
            this.setState({ balanceable_value: new_balanceable_value })
        }

        // when the cash remaining input changes, validate the user's value
        if (name === 'cash_remaining') {
            let user_whole_dollars_string = value.replace('$','').split('.')[0]
            let user_whole_dollars = parseInt(user_whole_dollars_string)
            let valid_whole_dollars_string = value.replace(/[^0-9.,]/g,'').split('.')[0]
            if (valid_whole_dollars_string.length 
                && user_whole_dollars_string === valid_whole_dollars_string 
                && user_whole_dollars >= 0
                && user_whole_dollars <= this.state.balanceable_value) { 
                this.setState({ cash_valid: true })
            } else {
                this.setState({ cash_valid: false })
            }
        }

        // update local storage
        localStorage.setItem(name, JSON.stringify(value))

        // mirror the input in state, since this is a (React) controlled input
        this.setState({ [name]: value })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_remaining_cash = this.state.cash_remaining.split('.')[0].replace(/[^0-9]/g, "")
        let remaining_cash = (this.state.cash_treatment === 'ignore') ? null : parseInt(user_remaining_cash)
        this.props.on_whatif_submit(this.state.balance_target_set, this.state.sell_all_of, this.state.balance_target_column, remaining_cash)
    }

    isDisabled() {

        if (this.state.cash_treatment === 'include' && !this.state.cash_valid) {
            return true
        } else if (this.state.balance_target_set === 'my_holdings') {
            return (this.props.show_holdings) ? false : true
        } else if (this.state.balance_target_set === 'untagged') {
            return (this.props.show_untagged) ? false : true
        } else {
            return (this.props.show_tagged) ? false : true
        }
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    render() {
        let excludable_tickers = []
        if (this.state.balance_target_set === "my_holdings") {
            excludable_tickers = Object.keys(this.props.all_positions).filter( ticker => ticker !== 'cash' && this.props.all_positions[ticker].current_shares)
        } else if (this.props.all_tags.hasOwnProperty(this.state.balance_target_set)) {
            excludable_tickers = this.props.all_tags[this.state.balance_target_set].filter( ticker => this.props.all_positions[ticker] && this.props.all_positions[ticker].current_shares)
        }
        return (
            <section id="what-if">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <div>Balance&nbsp;
                        <select name="balance_target_set" value={this.state.balance_target_set} onChange={this.handleChange}>
                            <option value="my_holdings">my holdings ({Object.keys(this.props.all_positions).filter(position => position !== 'cash').length})</option>
                            <option value="untagged">untagged tickers ({this.props.all_tags.untagged.length})</option>
                            {Object.entries(this.props.all_tags).filter(entry => entry[1].length).map(entry => entry[0]).sort().filter(tag => tag !== 'untagged').map(tag => 
                                <option key={tag} value={tag}>tag: {tag} ({this.props.all_tags[tag].length})</option>
                            )}
                        </select>
                        &nbsp;into&nbsp; 
                        <select name="balance_target_column" value={this.state.balance_target_column} onChange={this.handleChange}>
                            <option value="current_value">equal values</option>
                            <option value="value_at_risk">equal values, risk adjusted</option>
                            <option value="basis">equal bases</option>
                            <option value="basis_risked">equal bases, risk adjusted</option>
                        </select>
                        , but sell all of&nbsp;
                        <select name="sell_all_of" value={this.state.sell_all_of} onChange={this.handleChange}>
                            <option value="sell_none">(none. keep all.)</option>
                            {excludable_tickers.map(ticker => 
                                <option key={ticker} value={ticker}> {ticker} </option>
                            )}
                        </select>
                        &nbsp;...
                    </div>
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cash_treatment" value="ignore" selected onChange={this.handleChange} defaultChecked />ignoring my cash balance</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cash_treatment" value="include" onChange={this.handleChange} disabled={!this.props.show_cash} />using my cash balance, and leaving at least
                    <input type="text" id="cash_remaining" name="cash_remaining" size="12" onChange={this.handleChange} value={this.state.cash_remaining} placeholder="$0"></input> cash remaining (max: ${this.numberWithCommas(this.state.balanceable_value)})</label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="What If?" disabled={this.isDisabled()}/>
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
    show_tagged: PropTypes.bool,
    show_untagged: PropTypes.bool,
    show_cash: PropTypes.bool,
    on_whatif_submit: PropTypes.func
}