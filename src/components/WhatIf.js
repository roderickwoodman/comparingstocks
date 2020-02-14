import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            total_value: 0,
            cash_treatment: 'ignore',
            cash_remaining: 0,
            cash_valid: true
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        let total_value = 0
        Object.keys(this.props.all_positions).forEach( ticker => total_value += this.props.all_positions[ticker].current_shares * this.props.all_current_quotes[ticker].current_price)
        this.setState({ total_value: total_value })
    }

    handleChange(event) {
        let {name, value } = event.target
        if (name === 'cash_remaining' && value.length) {
            let user_whole_dollars_string = value.replace('$','').split('.')[0]
            let user_whole_dollars = parseInt(user_whole_dollars_string)
            let valid_whole_dollars_string = value.replace(/[^0-9.]/g,'').split('.')[0]
            if (valid_whole_dollars_string.length 
                && user_whole_dollars_string === valid_whole_dollars_string 
                && user_whole_dollars >= 0
                && user_whole_dollars <= this.state.total_value) { 
                this.setState({ cash_valid: true })
            } else {
                this.setState({ cash_valid: false })
            }
        }
        this.setState({ [name]: value })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_remaining_cash = this.state.cash_remaining.split('.')[0].replace(/[^0-9]/g, "")
        let remaining_cash = (this.state.cash_treatment === 'ignore') ? null : parseInt(user_remaining_cash)
        this.props.on_whatif_submit(this.props.show_cash, remaining_cash)
    }

    render() {
        return (
            <section id="what-if">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <div>Balance my holdings by value...</div>
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cash_treatment" value="ignore" selected onChange={this.handleChange} defaultChecked />ignoring my cash balance</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cash_treatment" value="include" onChange={this.handleChange} disabled={!this.props.show_cash} />using my cash balance, and leaving at least
                    <input type="text" id="cash_remaining" name="cash_remaining" size="12" onChange={this.handleChange} value={this.state.cash_remaining}></input> cash remaining (max: ${this.state.total_value})</label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-secondary" type="submit" value="What If?" disabled={!this.props.show_cash || !this.state.cash_valid}/>
                    </section>
                </form>
            </section>
        )
    }
}

WhatIf.propTypes = {
    all_current_quotes: PropTypes.object,
    all_positions: PropTypes.object,
    show_cash: PropTypes.bool,
    on_whatif_submit: PropTypes.func
}