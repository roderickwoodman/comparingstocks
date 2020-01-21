import React from 'react'
import PropTypes from 'prop-types'


export class PositionRow extends React.Component {

    render() {
        const on_remove_from_group = this.props.on_remove_from_group
        const current_quote = this.props.current_quote
        const performance = this.props.performance_numbers
        const performance_baseline = this.props.performance_baseline
        const performance_baseline_numbers = this.props.performance_baseline_numbers
        let current_position = this.props.current_position
        if (current_position == null) {
            current_position = {
                current_shares: 0,
                basis: 'n/a',
                realized_gains: 'n/a'
            }
        }

        function populateCellValue(column) {
            let prefix = ''
            let suffix = ''
            let adjust_decimal = false
            let num_decimals
            let value, baseline_value
            let performance_value = false
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
            switch (column.variable_name) {
                case 'symbol':
                    value = current_quote.symbol
                    break
                case 'current_shares':
                    value = current_position.current_shares
                    break
                case 'current_price':
                    value = current_quote.current_price
                    break
                case 'current_value':
                    value = current_value
                    break
                case 'percent_value':
                    value = percent_value
                    break
                case 'basis':
                    value = basis
                    break
                case 'percent_gains':
                    value = percent_gains
                    break
                case 'realized_gains':
                    value = current_position.realized_gains
                    break
                case 'change_pct':
                    value = current_quote.change_pct
                    break
                case 'volume':
                    value = current_quote.volume
                    break
                case 'dollar_volume':
                    value = current_quote.current_price * current_quote.volume
                    break
                case 'short_change_pct':
                    value = performance.short_change_pct
                    performance_value = true
                    baseline_value = performance_baseline_numbers.short
                    break
                case 'medium_change_pct':
                    value = performance.medium_change_pct
                    performance_value = true
                    baseline_value = performance_baseline_numbers.medium
                    break
                case 'long_change_pct':
                    value = performance.long_change_pct
                    performance_value = true
                    baseline_value = performance_baseline_numbers.long
                    break
                default:
                    break
            }

            if (value === null || value === 'n/a') {
                return '-'
            } else if (column.variable_type === 'string') {
                return value
            } else if (!isNaN(value)) {
                if (adjust_decimal) {
                    if (column.hasOwnProperty('scaling_power')) {
                        value *= Math.pow(10, column.scaling_power)
                    }
                    if (performance_value && performance_baseline !== 'zero_pct_gain') {
                        value = value - baseline_value
                    }
                    value = (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals)
                }
                return value = prefix + value + suffix

            } else {
                return '??'
            }
        }

        function styleCell(column) {
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
                    if (performance.short_change_pct > 0 && performance.short_change_pct > performance_baseline_numbers.short) {
                        classes += ' text-green'
                    } else if (performance.short_change_pct < 0 && performance.short_change_pct < performance_baseline_numbers.short) {
                        classes += ' text-red'
                    }
                    break
                case 'medium_change_pct':
                    if (performance.medium_change_pct > 0 && performance.medium_change_pct > performance_baseline_numbers.medium) {
                        classes += ' text-green'
                    } else if (performance.medium_change_pct < 0 && performance.medium_change_pct < performance_baseline_numbers.medium) {
                        classes += ' text-red'
                    }
                    break
                case 'long_change_pct':
                    if (performance.long_change_pct > 0 && performance.long_change_pct > performance_baseline_numbers.long) {
                        classes += ' text-green'
                    } else if (performance.long_change_pct < 0 && performance.long_change_pct < performance_baseline_numbers.long) {
                        classes += ' text-red'
                    }
                    break
                default:
                    break
            }
            return classes
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

        let all_groups = this.props.all_groups
        let group_membership = []
        Object.keys(all_groups).forEach(function(group_name) {
            if (group_name !== 'ungrouped' && all_groups[group_name].includes(current_quote.symbol)) {
                group_membership.push(group_name)
            }
        })

        return (
            <tr className={ row_classes }>
                <td>
                    { group_membership.map( group_name => (
                        <button key={group_name} onClick={ (e) => {on_remove_from_group(e, group_name, current_quote.symbol)}}>
                            {group_name}
                        </button>
                    ))}
                    { (!group_membership.length) ? '-' : '' }
                </td>
                { this.props.columns.map(column => (
                <td key={column.variable_name} className={ styleCell(column.variable_name) }>{ populateCellValue(column) }</td>
                ))}
            </tr>
        )
    }

}

PositionRow.propTypes = {
    columns: PropTypes.array,
    all_groups: PropTypes.object,
    current_quote: PropTypes.object,
    current_position: PropTypes.object,
    performance_numbers: PropTypes.object,
    performance_baseline: PropTypes.string,
    performance_baseline_numbers: PropTypes.object,
    total_value: PropTypes.number,
    ticker_is_index: PropTypes.func,
    on_remove_from_group: PropTypes.func,
}