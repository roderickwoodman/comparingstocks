import React from 'react'
import PropTypes from 'prop-types'


export class PositionRow extends React.Component {

    render() {
        const current_quote = this.props.current_quote
        let current_position = this.props.current_position
        if (current_position == null) {
            current_position = {
                current_shares: 0
            }
        }
        const performance = this.props.performance_numbers
        let row_classes = 'position-row' 
        if (this.props.ticker_is_index(current_quote.symbol)) {
            row_classes += ' position-is-index'
        }
        return (
            <tr className={ row_classes }>
                <td className="position-cell">{ current_quote.symbol }</td>
                <td className="position-cell">{ current_position.current_shares }</td>
                <td className="position-cell">${ current_quote.current_price }</td>
                <td className="position-cell">{ current_quote.change_pct }%</td>
                <td className="position-cell">{ current_quote.volume }</td>
                <td className="position-cell">{ performance.short_change_pct }%</td>
                <td className="position-cell">{ performance.medium_change_pct }%</td>
                <td className="position-cell">{ performance.long_change_pct }%</td>
            </tr>
        )
    }

}

PositionRow.propTypes = {
    current_quote: PropTypes.object.isRequired,
    current_position: PropTypes.object,
    performance_numbers: PropTypes.object.isRequired,
    ticker_is_index: PropTypes.func.isRequired,
}