import React from 'react'
import PropTypes from 'prop-types'


export class WhatIf extends React.Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.on_whatif_submit()
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
    on_whatif_submit: PropTypes.func
}