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
            } else if (isNaN(parseFloat(value))) {
                return value
            } else if (num_decimals >= 0) {
                return prefix_for_number + (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals) + suffix_for_number
            }
        }

        let row_classes = 'position-row' 
        if (this.props.ticker_is_index(current_quote.symbol)) {
            row_classes += ' position-is-index'
        }

        let current_value = (current_position.current_shares) ? formatValue('', current_quote.current_price * current_position.current_shares, '', 0) : 'n/a'
        let percent_value = (current_value !== 'n/a') ? formatValue('', current_value / this.props.total_value * 100, '', 1) : 'n/a'
        let basis = (current_position.basis) ? current_position.basis : 'n/a'
        let percent_gains
        if (current_position.current_shares === 0) {
            percent_gains = 'n/a'
        } else if (current_position.basis >= current_value) {
            percent_gains = 'losing'
        } else if (current_value > current_position.basis) {
            percent_gains = formatValue('', (1 - current_position.basis / current_value) * 100, '', 1)
        }

        return (
            <tr className={ row_classes }>
                <td className="position-cell">{ formatValue('', current_quote.symbol, '') }</td>
                <td className="position-cell">{ formatValue('', current_position.current_shares, '', null) }</td>
                <td className="position-cell">{ formatValue('$', current_quote.current_price, '', null) }</td>
                <td className="position-cell">{ formatValue('$', current_value, '', null) }</td>
                <td className="position-cell">{ formatValue('', percent_value, '%', 1) }</td>
                <td className="position-cell">{ formatValue('$', basis, '', null) }</td>
                <td className="position-cell">{ formatValue('', percent_gains, '%', 1) }</td>
                <td className="position-cell">{ formatValue('$', current_position.realized_gains, '', null) }</td>
                <td className="position-cell">{ formatValue('', current_quote.change_pct, '%', 2) }</td>
                <td className="position-cell">{ formatValue('', current_quote.volume, '', null) }</td>
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