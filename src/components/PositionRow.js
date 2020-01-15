import React from 'react'
import PropTypes from 'prop-types'


export class PositionRow extends React.Component {

    render() {

        const current_quote = this.props.current_quote
        const performance = this.props.performance_numbers
        let current_position = this.props.current_position
        if (current_position == null) {
            current_position = {
                current_shares: 0,
                basis: 'n/a',
                realized_gains: 'n/a'
            }
        }

        function formatValue(prefix_for_number, value, suffix_for_number, num_decimals) {
            if (value === null || value === 'n/a') {
                return '-'
            } else if (typeof(value) === 'string') {
                return value
            } else if (!isNaN(value) && num_decimals >= 0) {
                return prefix_for_number + (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals) + suffix_for_number
            } else {
                return '??'
            }
        }

        let row_classes = 'position-row' 
        if (this.props.ticker_is_index(current_quote.symbol)) {
            row_classes += ' position-is-index'
        }

        let current_value = (current_position.current_shares) ? current_quote.current_price * current_position.current_shares : 'n/a'
        let percent_value = (current_value !== 'n/a') ? current_value / this.props.total_value * 100 : 'n/a'
        let basis = (current_position.basis) ? current_position.basis : 'n/a'
        let percent_gains
        if (current_position.current_shares === 0) {
            percent_gains = 'n/a'
        } else if (current_position.basis >= current_value) {
            percent_gains = 'losing'
        } else if (current_value > current_position.basis) {
            percent_gains = (1 - current_position.basis / current_value) * 100
        }

        return (
            <tr className={ row_classes }>
                <td className="position-cell">{ formatValue('', current_quote.symbol, '', null) }</td>
                <td className="position-cell">{ formatValue('', current_position.current_shares, '', 0) }</td>
                <td className="position-cell">{ formatValue('$', current_quote.current_price, '', 2) }</td>
                <td className="position-cell">{ formatValue('$', current_value, '', 0) }</td>
                <td className="position-cell">{ formatValue('', percent_value, '%', 1) }</td>
                <td className="position-cell">{ formatValue('$', basis, '', 0) }</td>
                <td className="position-cell">{ formatValue('', percent_gains, '%', 1) }</td>
                <td className="position-cell">{ formatValue('$', current_position.realized_gains, '', 0) }</td>
                <td className="position-cell">{ formatValue('', current_quote.change_pct, '%', 2) }</td>
                <td className="position-cell">{ formatValue('', current_quote.volume, '', 0) }</td>
                <td className="position-cell">{ formatValue('$', current_quote.current_price * current_quote.volume / 1000000, '', 0) }</td>
                <td className="position-cell">{ formatValue('', performance.short_change_pct, '%', 1) }</td>
                <td className="position-cell">{ formatValue('', performance.medium_change_pct, '%', 1) }</td>
                <td className="position-cell">{ formatValue('', performance.long_change_pct, '%', 1) }</td>
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