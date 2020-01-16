import React from 'react'
import PropTypes from 'prop-types'


export class PositionRow extends React.Component {

    render() {

        const current_quote = this.props.current_quote
        const performance = this.props.performance_numbers
        const green_threshold = this.props.performance_green_threshold
        let current_position = this.props.current_position
        if (current_position == null) {
            current_position = {
                current_shares: 0,
                basis: 'n/a',
                realized_gains: 'n/a'
            }
        }

        function formatValue(value, column) {
            let prefix = ''
            let suffix = ''
            let adjust_decimal = false
            let num_decimals
            let final_value = value
            switch (column.variable_type) {
                case 'number':
                    adjust_decimal = true
                    num_decimals = column.num_decimals
                    break
                case 'currency':
                    adjust_decimal = true
                    num_decimals = column.num_decimals
                    prefix = '$'
                    break
                case 'percentage':
                    adjust_decimal = true
                    num_decimals = column.num_decimals
                    suffix = '%'
                    break
                default:
                    break
            }

            if (adjust_decimal) {
                if (column.hasOwnProperty('scaling_power')) {
                    final_value *= Math.pow(10, column.scaling_power)
                }
                final_value = (Math.round(Math.pow(10, num_decimals) * final_value) / Math.pow(10, num_decimals)).toFixed(num_decimals)
            }

            final_value = prefix + final_value + suffix
            
            if (value === null || value === 'n/a') {
                return '-'
            } else if (typeof(value) === 'string') {
                return value
            } else if (!isNaN(value)) {
                return final_value
            } else {
                return '??'
            }
        }

        function formatCell(column) {
            let classes = 'position-cell'
            switch (column) {
                case 'change_pct':
                    if (current_quote.change_pct > 0) {
                        classes += ' text-green'
                    } else if (current_quote.change_pct < 0) {
                        classes += ' text-red'
                    }
                    break
                case 'short_change_pct':
                    if (performance.short_change_pct > 0 && performance.short_change_pct > green_threshold.short_change_pct) {
                        classes += ' text-green'
                    } else if (performance.short_change_pct < 0 && performance.short_change_pct < green_threshold.short_change_pct) {
                        classes += ' text-red'
                    }
                    break
                case 'medium_change_pct':
                    if (performance.medium_change_pct > 0 && performance.medium_change_pct > green_threshold.medium_change_pct) {
                        classes += ' text-green'
                    } else if (performance.medium_change_pct < 0 && performance.medium_change_pct < green_threshold.medium_change_pct) {
                        classes += ' text-red'
                    }
                    break
                case 'long_change_pct':
                    if (performance.long_change_pct > 0 && performance.long_change_pct > green_threshold.long_change_pct) {
                        classes += ' text-green'
                    } else if (performance.long_change_pct < 0 && performance.long_change_pct < green_threshold.long_change_pct) {
                        classes += ' text-red'
                    }
                    break
                default:
                    break
            }
            return classes
        }

        const columns = this.props.columns

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
                <td className={ formatCell(columns[0].variable_name) }>{ formatValue(current_quote.symbol, columns[0]) }</td>
                <td className={ formatCell(columns[1].variable_name) }>{ formatValue(current_position.current_shares, columns[1]) }</td>
                <td className={ formatCell(columns[2].variable_name) }>{ formatValue(current_quote.current_price, columns[2]) }</td>
                <td className={ formatCell(columns[3].variable_name) }>{ formatValue(current_value, columns[3]) }</td>
                <td className={ formatCell(columns[4].variable_name) }>{ formatValue(percent_value, columns[4]) }</td>
                <td className={ formatCell(columns[5].variable_name) }>{ formatValue(basis, columns[5]) }</td>
                <td className={ formatCell(columns[6].variable_name) }>{ formatValue(percent_gains, columns[6]) }</td>
                <td className={ formatCell(columns[7].variable_name) }>{ formatValue(current_position.realized_gains, columns[7]) }</td>
                <td className={ formatCell(columns[8].variable_name) }>{ formatValue(current_quote.change_pct, columns[8]) }</td>
                <td className={ formatCell(columns[9].variable_name) }>{ formatValue(current_quote.volume, columns[9]) }</td>
                <td className={ formatCell(columns[10].variable_name) }>{ formatValue(current_quote.current_price * current_quote.volume, columns[10]) }</td>
                <td className={ formatCell(columns[11].variable_name) }>{ formatValue(performance.short_change_pct, columns[11]) }</td>
                <td className={ formatCell(columns[12].variable_name) }>{ formatValue(performance.medium_change_pct, columns[12]) }</td>
                <td className={ formatCell(columns[13].variable_name) }>{ formatValue(performance.long_change_pct, columns[13]) }</td>
            </tr>
        )
    }

}

PositionRow.propTypes = {
    columns: PropTypes.array,
    current_quote: PropTypes.object,
    current_position: PropTypes.object,
    performance_numbers: PropTypes.object,
    performance_green_threshold: PropTypes.object,
    total_value: PropTypes.number,
    ticker_is_index: PropTypes.func,
}