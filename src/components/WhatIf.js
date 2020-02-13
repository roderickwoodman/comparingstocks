import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(event) {
        event.preventDefault()
        let self = this

        // determine the target value for each row
        let total_values = {}
        let total_value = 0
        Object.keys(this.props.all_positions).forEach(function(ticker) {
            total_values[ticker] = self.props.all_positions[ticker].current_shares * self.props.all_current_quotes[ticker].current_price
            total_value += total_values[ticker]
        })
        let target_balanced_value = total_value / Object.keys(this.props.all_positions).length

        // determine the what-if values for each relevant column
        let new_whatif = {
            column_balanced: 'current_value',
            values: {}
        }
        Object.keys(this.props.all_positions).forEach(function(ticker) {
            let whatif_shares = Math.floor(target_balanced_value / self.props.all_current_quotes[ticker].current_price)
            new_whatif.values[ticker] = {}
            new_whatif.values[ticker]['current_shares'] = whatif_shares
            new_whatif.values[ticker]['current_value'] = whatif_shares * self.props.all_current_quotes[ticker].current_price
        })

        this.props.on_whatif(new_whatif)
    }

    render() {
        return (
            <section id="what-if">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>What if holdings were balanced by value?</label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-secondary" type="submit" value="Generate What-If Deltas" />
                    </section>
                </form>
            </section>
        )
    }
}

WhatIf.propTypes = {
    all_current_quotes: PropTypes.object,
    all_positions: PropTypes.object,
    on_whatif: PropTypes.func
}