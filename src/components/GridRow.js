import React from 'react'
import PropTypes from 'prop-types'


export class GridRow extends React.Component {

    constructor(props) {
        super(props)
        this.populateButton = this.populateButton.bind(this)
    }

    populateButton(column) {
        if (column.variable_name === 'symbol' && !this.props.special_classes.includes('index')) {
            return (
                <button onClick={ (e) => {this.props.on_delete_ticker(e, this.props.symbol)}}>x</button>
            )
        } else {
            return
        }
    }

    render() {
        const symbol = this.props.symbol
        const on_remove_from_tag = this.props.on_remove_from_tag
        let current_shares = this.props.current_shares
        const current_price = this.props.current_price
        const change_pct = this.props.change_pct
        let basis = this.props.basis
        let realized_gains = this.props.realized_gains
        const volume = this.props.volume
        const performance = this.props.performance_numbers
        const baseline = this.props.baseline
        if (isNaN(current_shares) || current_shares === 0) {
            current_shares = 'n/a'
            basis = 'n/a'
            realized_gains = 'n/a'
        }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                    value = symbol
                    break
                case 'current_shares':
                    value = current_shares
                    break
                case 'current_price':
                    value = current_price
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
                case 'percent_profit':
                    value = percent_profit
                    break
                case 'realized_gains':
                    value = realized_gains
                    break
                case 'change_pct':
                    value = change_pct
                    break
                case 'volume':
                    value = volume
                    break
                case 'dollar_volume':
                    value = current_price * volume
                    break
                case 'short_change_pct':
                    value = performance.short_change_pct
                    performance_value = true
                    baseline_value = baseline.short_change_pct
                    break
                case 'medium_change_pct':
                    value = performance.medium_change_pct
                    performance_value = true
                    baseline_value = baseline.medium_change_pct
                    break
                case 'long_change_pct':
                    value = performance.long_change_pct
                    performance_value = true
                    baseline_value = baseline.long_change_pct
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
                    if (performance_value && baseline.name !== 'zero_pct_gain') {
                        value = value - baseline_value
                    }
                    if (value.toString().indexOf('.'))
                    value = (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals)
                }
                return value = prefix + numberWithCommas(value) + suffix
            } else if (column.hasOwnProperty('passthrough_strings') && column['passthrough_strings']) {
                return value
            } else if (column.variable_type === 'number' || column.variable_type === 'percentage' || column.variable_type === 'currency') {
                return '-'
            } else {
                return '??'
            }
        }

        function styleCell(column) {
            let classes = 'position-cell'
            switch (column) {
                case 'change_pct':
                    if (change_pct > 0) {
                        classes += ' text-green'
                    } else if (change_pct < 0) {
                        classes += ' text-red'
                    }
                    break
                case 'short_change_pct':
                    if (performance.short_change_pct > 0 && performance.short_change_pct > baseline.short_change_pct) {
                        classes += ' text-green'
                    } else if (performance.short_change_pct < 0 && performance.short_change_pct < baseline.short_change_pct) {
                        classes += ' text-red'
                    }
                    break
                case 'medium_change_pct':
                    if (performance.medium_change_pct > 0 && performance.medium_change_pct > baseline.medium_change_pct) {
                        classes += ' text-green'
                    } else if (performance.medium_change_pct < 0 && performance.medium_change_pct < baseline.medium_change_pct) {
                        classes += ' text-red'
                    }
                    break
                case 'long_change_pct':
                    if (performance.long_change_pct > 0 && performance.long_change_pct > baseline.long_change_pct) {
                        classes += ' text-green'
                    } else if (performance.long_change_pct < 0 && performance.long_change_pct < baseline.long_change_pct) {
                        classes += ' text-red'
                    }
                    break
                default:
                    break
            }
            return classes
        }

        let row_classes = 'position-row' 
        this.props.special_classes.forEach(function(special_class) {
            if (special_class === 'index') {
                row_classes += ' position-is-index'
            }
            if (special_class === 'cash') {
                row_classes += ' position-is-cash'
            }
        })

        let current_value, percent_value, percent_profit
        if (isNaN(current_shares)) {
            current_value = 'n/a'
            percent_value = 'n/a'
            percent_profit = 'n/a'
        } else {
            current_value = (current_shares) ? current_price * current_shares : 'n/a'
            percent_value = (current_value !== 'n/a') ? current_value / this.props.total_value * 100 : 'n/a'
            if (current_shares === 0) {
                percent_profit = 'n/a'
            } else if (basis > current_value) {
                percent_profit = 'losing'
            } else if (basis === current_value) {
                percent_profit = 0
            } else if (current_value > basis) {
                percent_profit = (1 - basis / current_value) * 100
            }
        }

        return (
            <tr className={ row_classes }>
                <td>
                    { this.props.tags.map( tag_name => tag_name !== 'untagged' && (
                        <button key={tag_name} onClick={ (e) => {on_remove_from_tag(e, tag_name, symbol)}}>
                            {tag_name}
                        </button>
                    ))}
                    { (!this.props.tags.length || this.props.tags[0] === 'untagged') ? '-' : '' }
                </td>
                { this.props.columns.map(column => (
                <td key={column.variable_name} className={ styleCell(column.variable_name) }>{ populateCellValue(column) }{ this.populateButton(column) }</td>
                ))}
            </tr>
        )
    }

}

GridRow.propTypes = {
    columns: PropTypes.array,
    symbol: PropTypes.string,
    tags: PropTypes.array,
    special_classes: PropTypes.array,
    current_shares: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    current_price: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    change_pct: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    volume: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    basis: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    realized_gains: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    performance_numbers: PropTypes.object,
    baseline: PropTypes.object,
    total_value: PropTypes.number,
    on_remove_from_tag: PropTypes.func,
    on_delete_ticker: PropTypes.func,
}