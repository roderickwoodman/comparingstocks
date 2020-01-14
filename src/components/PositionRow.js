import React from 'react'
import PropTypes from 'prop-types'


export class PositionRow extends React.Component {

    render() {
        function formatZeroValue(value) {
            let my_type = typeof(value)
            if (my_type === 'number' && parseFloat(value) === 0) {
                return '-'
            } else if (my_type === 'string' && parseFloat(value.replace('$','').replace('%','')) === 0){
                return '-'
            } else {
                return value
            }
        }
        function addTrailingZeros(value, desired_num_decimals) {
            let current_num_decimals
            if (Number.isInteger(value)) {
                current_num_decimals = 0
            } else {
                current_num_decimals = value.toString().length - value.toString().indexOf('.') - 1
            }
            if (desired_num_decimals <= current_num_decimals) {
                return value
            } 
            let retval = value
            if (current_num_decimals === 0 && desired_num_decimals > 0) {
                retval += '.'
            }
            retval += '0'.repeat(desired_num_decimals - current_num_decimals)
            return retval
        }
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
        let current_value = Math.round(current_quote.current_price * current_position.current_shares).toFixed(0)
        let percent_value = Math.round(10 * current_value / this.props.total_value * 100) / 10

        return (
            <tr className={ row_classes }>
                <td className="position-cell">{ current_quote.symbol }</td>
                <td className="position-cell">{ formatZeroValue(current_position.current_shares) }</td>
                <td className="position-cell">${ current_quote.current_price }</td>
                <td className="position-cell">{ formatZeroValue('$' + current_value) }</td>
                <td className="position-cell">{ formatZeroValue(addTrailingZeros(percent_value, 1) + '%') }</td>
                <td className="position-cell">{ addTrailingZeros(current_quote.change_pct, 2) }%</td>
                <td className="position-cell">{ current_quote.volume }</td>
                <td className="position-cell">${ Math.round(current_quote.current_price * current_quote.volume / 1000000) }</td>
                <td className="position-cell">{ addTrailingZeros(performance.short_change_pct, 1) }%</td>
                <td className="position-cell">{ addTrailingZeros(performance.medium_change_pct, 1) }%</td>
                <td className="position-cell">{ addTrailingZeros(performance.long_change_pct, 1) }%</td>
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