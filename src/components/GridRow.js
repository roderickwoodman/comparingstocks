import React from 'react'
import PropTypes from 'prop-types'


// This component displays table data for either tickers (is_aggregate === 0) or tags (is_aggregate === 1).
// For tickers, the membership_set prop is all of the tags that it belongs to.
// For tags, the membership_set prop is all of the tags that belong to it.
export class GridRow extends React.Component {

    constructor(props) {
        super(props)
        this.populateMemberButton = this.populateMemberButton.bind(this)
        this.populateDeleteButton = this.populateDeleteButton.bind(this)
    }

    // this button removes a ticker from a tag
    populateMemberButton(symbol) {
        let is_aggr = this.props.is_aggregate
        let row_name = this.props.row_name
        if (is_aggr) {
            // row_name is a TAG
            // symbol is a TICKER 
            if (row_name !== 'untagged') {
                return (
                    <button onClick={ (e) => { this.props.on_remove_from_tag(row_name, symbol)} }>{ symbol }</button>
                )
            } else {
                return (
                    <button disabled="true">{ symbol }</button>
                )
            }
        } else {
            // row_name is a TICKER
            // symbol is a TAG 
            if (!this.props.special_classes.includes('index') && !this.props.special_classes.includes('cash') && !this.props.membership_set.includes('untagged')) {
                return (
                    <button onClick={ (e) => { this.props.on_remove_from_tag(symbol, row_name)} }>{ symbol }</button>
                )
            } else {
                return (
                    '-'
                )
            }
        }
    }

    // this button deletes the ticker or tag completely
    populateDeleteButton(column_name, is_aggregate) {
        if (is_aggregate) {
            if (column_name === 'symbol' && this.props.symbol !== 'untagged') {
                return (
                    <button onClick={ (e) => {this.props.on_delete_tag(this.props.row_name)}}>x</button>
                )
            } else {
                return
            }
        } else {
            if (column_name === 'symbol' && !this.props.special_classes.includes('index')) {
                return (
                    <button onClick={ (e) => {this.props.on_delete_ticker(this.props.row_name)}}>x</button>
                )
            } else {
                return
            }
        }
    }

    render() {
        const is_aggr = this.props.is_aggregate
        const row_name = this.props.row_name
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
            switch (column.type) {
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
            switch (column.name) {
                case 'symbol':
                    value = row_name
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
            } else if (column.type === 'string') {
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
            } else if (column.type === 'number' || column.type === 'percentage' || column.type === 'currency') {
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
            if (isNaN(this.props.total_value) || this.props.total_value === 0) {
                percent_value = 'n/a'
            } else {
                percent_value = (current_value !== 'n/a') ? current_value / this.props.total_value * 100 : 'n/a'
            }
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

        let member_count = this.props.membership_set.length

        return (
            <tr className={ row_classes }>
                <td>
                    { member_count ? this.props.membership_set.map(symbol => this.populateMemberButton(symbol)) : (this.props.special_classes.length ? '' : '-') }
                </td>
                { this.props.columns.map(column => (
                    <td key={column.name} className={ styleCell(column.name) }>{ populateCellValue(column) }{ is_aggr && column.name === 'symbol' && member_count ? '('+member_count+')' : '' }{ this.populateDeleteButton(column.name, is_aggr) }</td>
                ))}
            </tr>
        )
    }

}

GridRow.defaultProps = {
    performance_numbers: {
        short_change_pct: 0,
        medium_change_pct: 0,
        long_change_pct: 0
    }
}

GridRow.propTypes = {
    is_aggregate: PropTypes.bool,
    columns: PropTypes.array,
    row_name: PropTypes.string,
    membership_set: PropTypes.array,
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
    on_delete_tag: PropTypes.func,
}