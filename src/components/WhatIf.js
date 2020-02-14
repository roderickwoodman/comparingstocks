import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            cash_treatment: 'ignore',
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const {name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        event.preventDefault()
        let remaining_cash = (this.state.cash_treatment === 'ignore') ? null : 0
        this.props.on_whatif_submit(this.props.show_cash, remaining_cash)
    }

    render() {
        return (
            <section id="what-if">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>What if holdings were balanced by value?</label>
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cash_treatment" value="ignore" onChange={this.handleChange} />ignore cash</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cash_treatment" value="include" onChange={this.handleChange} disabled={!this.props.show_cash} />use cash, leaving $0 remaining</label>
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
    show_cash: PropTypes.bool,
    on_whatif_submit: PropTypes.func
}