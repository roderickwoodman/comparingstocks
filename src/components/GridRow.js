import React from 'react'
import PropTypes from 'prop-types'


// This component displays table data for either tickers (is_aggregate === 0) or tags (is_aggregate === 1).
// For tickers, the membership_set prop is all of the tags that it belongs to.
// For tags, the membership_set prop is all of the tags that belong to it.
export class GridRow extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            hover: false
        }
        this.onWhatifCellClick = this.onWhatifCellClick.bind(this)
        this.toggleHover = this.toggleHover.bind(this)
        this.populateMemberButton = this.populateMemberButton.bind(this)
        this.populateDeleteButton = this.populateDeleteButton.bind(this)
        this.populateCellValue = this.populateCellValue.bind(this)
        this.styleCell = this.styleCell.bind(this)
        this.numberWithCommas = this.numberWithCommas.bind(this)
    }

    onWhatifCellClick() {
        this.props.on_change_whatif_format()
    }

    toggleHover() {
        this.setState({ hover: !this.state.hover })
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
                    <button key={row_name + symbol + is_aggr} className="tag-removal" onClick={ (e) => { this.props.on_remove_from_tag(row_name, symbol)} }>{ symbol }</button>
                )
            } else {
                return (
                    <button key={row_name + symbol + is_aggr} className="tag-removal" disabled={true}>{ symbol }</button>
                )
            }
        } else {
            // row_name is a TICKER
            // symbol is a TAG 
            if (!this.props.special_classes.includes('index') && !this.props.special_classes.includes('cash') && !this.props.membership_set.includes('untagged')) {
                return (
                    <button key={row_name + symbol + is_aggr} className="tag-removal" onClick={ (e) => { this.props.on_remove_from_tag(symbol, row_name)} }>{ symbol }</button>
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
        let classes = 'delete'
        if (this.state.hover) {
            classes += ' hovering'
        }
        if (is_aggregate) {
            if (column_name === 'symbol' && this.props.row_name !== 'untagged') {
                return (
                    <button className={classes} onClick={ (e) => {this.props.on_delete_tag(this.props.row_name)}}>x</button>
                )
            } else {
                return
            }
        } else {
            if (column_name === 'symbol' 
                && !this.props.special_classes.includes('index')
                && !(this.props.row_name === 'cash' && isNaN(this.props.current_shares)) ) {
                return (
                    <button className={classes} onClick={ (e) => {this.props.on_delete_ticker(this.props.row_name)}}>x</button>
                )
            } else {
                return
            }
        }
    }

    styleCell(column_name) {
        let classes = 'position-cell'
        const row_name = this.props.row_name
        const change_pct = this.props.change_pct
        const current_shares = this.props.current_shares
        const special_classes = this.props.special_classes
        const performance = this.props.performance_numbers
        const baseline = this.props.baseline
        if ( this.state.hover 
            && column_name === 'symbol' 
            && !special_classes.includes('index') 
            && row_name !== 'untagged'
            && !(row_name === 'cash' && isNaN(current_shares)) ) {
            classes += ' hovering'
        }
        if ( column_name.startsWith('whatif_') ) {
            classes += ' clickable'
        }
        if ( column_name === 'symbol' && row_name === 'untagged') {
            classes += ' italics'
        }
        switch (column_name) {
            case 'symbol':
                classes += ' col-symbol'
                break
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

    // prints the value that is (usually) explicitly passed in via props
    // AND is responsible for calculating "percent_value", "percent_basis", and "percent_profit"
    populateCellValue(column) {
        let prefix = ''
        let suffix = ''
        let adjust_decimal = false
        let num_decimals
        let value, baseline_value
        let performance_value = false

        const total_value = this.props.total_value
        const total_basis = this.props.total_basis
        const current_price = this.props.current_price
        let current_shares = this.props.current_shares
        const current_value = this.props.current_value
        let basis = this.props.basis
        let realized_gains = this.props.realized_gains
        const whatif = this.props.whatif

        let percent_value, percent_basis, percent_profit

        // calculate percent_value
        if (isNaN(current_value)) {
            percent_value = 'n/a'
        } else {
            if (isNaN(total_value) || total_value === 0) {
                percent_value = 'n/a'
            } else {
                percent_value = (current_value !== 'n/a') ? current_value / total_value * 100 : 'n/a'
            }
        }

        // calculate percent_basis
        if (isNaN(current_value)) {
            percent_basis = 'n/a'
        } else {
            if (isNaN(total_basis) || total_basis === 0) {
                percent_basis = 'n/a'
            } else {
                percent_basis = (current_value !== 'n/a') ? basis / total_basis * 100 : 'n/a'
            }
        }

        // calculate percent_profit
        if (isNaN(current_value) || isNaN(basis)) {
            percent_profit = 'n/a'
        } else {
            if (current_shares === 0) {
                percent_profit = 'n/a'
            } else if (basis > current_value) {
                percent_profit = 'losing'
            } else if (basis < current_value) {
                percent_profit = (1 - basis / current_value) * 100
            } else {
                percent_profit = 0
            }
        }

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
                value = this.props.row_name
                break
            case 'current_shares':
                value = current_shares
                break
            case 'whatif_current_shares':
                if (whatif === null) {
                    value = 'n/a'
                } else if (this.props.whatif_format === 'deltas') {
                    value = whatif.current_shares - ((current_shares === 'n/a') ? 0 : current_shares)
                } else {
                    value = whatif.current_shares
                }
                break
            case 'current_price':
                value = current_price
                break
            case 'current_value':
                value = current_value
                break
            case 'whatif_current_value':
                if (whatif === null) {
                    value = 'n/a'
                } else if (this.props.whatif_format === 'deltas') {
                    value = whatif.current_value - ((current_value === 'n/a') ? 0 : current_value)
                } else {
                    value = whatif.current_value
                }
                break
            case 'percent_value':
                value = percent_value
                break
            case 'basis':
                value = basis
                break
            case 'percent_basis':
                value = percent_basis
                break
            case 'percent_profit':
                value = percent_profit
                break
            case 'realized_gains':
                value = realized_gains
                break
            case 'change_pct':
                value = this.props.change_pct
                break
            case 'volume':
                value = this.props.volume
                break
            case 'dollar_volume':
                value = this.props.current_price * this.props.volume
                break
            case 'short_change_pct':
                value = this.props.performance_numbers.short_change_pct
                performance_value = true
                baseline_value = this.props.baseline.short_change_pct
                break
            case 'medium_change_pct':
                value = this.props.performance_numbers.medium_change_pct
                performance_value = true
                baseline_value = this.props.baseline.medium_change_pct
                break
            case 'long_change_pct':
                value = this.props.performance_numbers.long_change_pct
                performance_value = true
                baseline_value = this.props.baseline.long_change_pct
                break
            default:
                break
        }
        if ( this.props.row_name === 'cash' || (this.props.is_aggregate && !this.props.membership_set.length) ) {
            switch (column.name) {
                case 'realized_gains': 
                case 'percent_profit': 
                case 'volume': 
                case 'dollar_volume': 
                case 'short_change_pct': 
                case 'medium_change_pct': 
                case 'long_change_pct': 
                    value = 'n/a'
                    break
                default:
                    break
            }
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
                if (performance_value && this.props.baseline.name !== 'zero_pct_gain') {
                    value = value - baseline_value
                }
                if (value.toString().indexOf('.')) {
                    value = (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals)
                }
            }
            if (value >= 0) {
                prefix = (column.name.startsWith('whatif_') && this.props.whatif_format === 'deltas') ? '+' + prefix : prefix
                return value = prefix + this.numberWithCommas(value) + suffix
            } else {
                return value = '-' + prefix + this.numberWithCommas(Math.abs(value)) + suffix
            }
        } else if (column.hasOwnProperty('passthrough_strings') && column['passthrough_strings']) {
            return value
        } else if (column.type === 'number' || column.type === 'percentage' || column.type === 'currency') {
            return '-'
        } else {
            return '??'
        }
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    render() {
        const is_aggr = this.props.is_aggregate

        let row_classes = 'position-row' 
        this.props.special_classes.forEach(function(special_class) {
            if (special_class === 'index') {
                row_classes += ' position-is-index'
            }
            if (special_class === 'cash') {
                row_classes += ' position-is-cash'
            }
            if (special_class === 'aggregate') {
                row_classes += ' position-is-aggregate'
            }
        })

        let member_count = this.props.membership_set.length

        let self = this
        return (
            <tr className={ row_classes }>
                <td>
                    { member_count ? this.props.membership_set.map(symbol => this.populateMemberButton(symbol)) : (this.props.special_classes.length ? '' : '-') }
                </td>
                { this.props.columns.map(function(column) {
                    if (column.name === 'symbol') {
                        return (
                            <td key={column.name} className={ self.styleCell(column.name) } onMouseEnter={self.toggleHover} onMouseLeave={self.toggleHover}>{ self.populateCellValue(column) }{ is_aggr && member_count ? '('+member_count+')' : '' }{ self.populateDeleteButton(column.name, is_aggr) }</td>
                        )
                    } else if (column.name.startsWith('whatif_')) {
                        return (
                            <td key={column.name} className={ self.styleCell(column.name) } onClick={ (column.name.startsWith('whatif_')) ? (e)=>self.onWhatifCellClick() : undefined }>{ self.populateCellValue(column) }{ self.populateDeleteButton(column.name, is_aggr) }</td>
                        )
                    } else {
                        return (
                            <td key={column.name} className={ self.styleCell(column.name) }>{ self.populateCellValue(column) }{ self.populateDeleteButton(column.name, is_aggr) }</td>
                        )
                    }
                })}
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
    current_value: PropTypes.oneOfType([
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
    total_basis: PropTypes.number,
    whatif: PropTypes.object,
    whatif_format: PropTypes.string,
    on_change_whatif_format: PropTypes.func,
    on_remove_from_tag: PropTypes.func,
    on_delete_ticker: PropTypes.func,
    on_delete_tag: PropTypes.func,
}