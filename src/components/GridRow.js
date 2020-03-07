import React from 'react'
import PropTypes from 'prop-types'
import { EditNumericCell } from './EditNumericCell'


// This component displays table data for either tickers (is_aggregate === 0) or tags (is_aggregate === 1).
// For tickers, the membership_set prop is all of the tags that it belongs to.
// For tags, the membership_set prop is all of the tags that belong to it.
export class GridRow extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            hovering_symbol: false,
            hovering_risk_factor: false,
            user_risk_factor: '',
            user_risk_factor_valid: false
        }
        this.onWhatifCellClick = this.onWhatifCellClick.bind(this)
        this.toggleHoverSymbol = this.toggleHoverSymbol.bind(this)
        this.toggleHoverRiskFactor = this.toggleHoverRiskFactor.bind(this)
        this.populateMemberButton = this.populateMemberButton.bind(this)
        this.populateDeleteButton = this.populateDeleteButton.bind(this)
        this.populateEditButton = this.populateEditButton.bind(this)
        this.editRiskFactor = this.editRiskFactor.bind(this)
        this.onNewValue = this.onNewValue.bind(this)
        this.populateCellValue = this.populateCellValue.bind(this)
        this.styleCell = this.styleCell.bind(this)
        this.numberWithCommas = this.numberWithCommas.bind(this)
        this.daysAgo = this.daysAgo.bind(this)
    }

    onWhatifCellClick() {
        this.props.on_change_whatif_format()
    }

    toggleHoverSymbol() {
        this.setState({ hovering_symbol: !this.state.hovering_symbol })
    }

    toggleHoverRiskFactor() {
        this.setState({ hovering_risk_factor: !this.state.hovering_risk_factor })
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
        if (this.state.hovering_symbol) {
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

    // the edit button is an extra affordance; clicking anywhere in the cell enters edit mode on this cell's value
    populateEditButton(column_name, row_name) {
        let classes = 'edit'
        if (this.state.hovering_risk_factor) {
            classes += ' hovering'
        }
        if ( column_name === 'risk_factor'
            && row_name !== this.props.editing_row
            && row_name !== 'cash'
            && !this.props.is_aggregate 
            && !this.props.special_classes.includes('index') ) {
                return (
                    <button className={classes}>{String.fromCharCode(0x270e)}</button>
                )
        } else {
            return
        }
    }

    editRiskFactor(row_name) {
        this.props.on_edit_cell(row_name)
    }

    styleCell(column_name) {
        let classes = 'position-cell'
        const row_name = this.props.row_name
        const change_pct = this.props.change_pct
        const current_shares = this.props.current_shares
        const special_classes = this.props.special_classes
        const performance = this.props.performance_numbers
        const baseline = this.props.baseline

        // hovering
        if ( this.state.hovering_symbol
            && column_name === 'symbol' 
            && !special_classes.includes('index') 
            && row_name !== 'untagged'
            && !(row_name === 'cash' && isNaN(current_shares)) ) {
            classes += ' hovering'
        }
        if ( this.state.hovering_risk_factor
            && column_name === 'risk_factor' 
            && !special_classes.includes('index') 
            && !this.props.is_aggregate
            && row_name !== 'cash' ) {
            classes += ' hovering'
        }

        // whatif
        if ( column_name.startsWith('whatif_') ) {
            classes += ' clickable whatif'
        }

        // italics
        if ( column_name === 'symbol' && row_name === 'untagged') {
            classes += ' italics'
        }

        switch (column_name) {
            case 'symbol':
                classes += ' col-symbol'
                break
            case 'risk_factor':
                classes += ' col-riskfactor'
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
                if (this.props.style_realized_performance
                    && row_name !== 'cash' 
                    && !special_classes.includes('index')) {
                        if (isNaN(current_shares) 
                            || !current_shares 
                            || this.daysAgo(this.props.start_date) < 180
                            ){
                            classes += (this.props.show_only_achieved_performance) ? ' hide' : ' strikethrough'
                        } else {
                            classes += ' strong'
                        }
                }
                break
            case 'medium_change_pct':
                if (performance.medium_change_pct > 0 && performance.medium_change_pct > baseline.medium_change_pct) {
                    classes += ' text-green'
                } else if (performance.medium_change_pct < 0 && performance.medium_change_pct < baseline.medium_change_pct) {
                    classes += ' text-red'
                }
                if (this.props.style_realized_performance
                    && row_name !== 'cash' 
                    && !special_classes.includes('index')) {
                        if (isNaN(current_shares) 
                            || !current_shares 
                            || this.daysAgo(this.props.start_date) < 365
                            ){
                            classes += (this.props.show_only_achieved_performance) ? ' hide' :  ' strikethrough'
                        } else {
                            classes += ' strong'
                        }
                }
                break
            case 'long_change_pct':
                if (performance.long_change_pct > 0 && performance.long_change_pct > baseline.long_change_pct) {
                    classes += ' text-green'
                } else if (performance.long_change_pct < 0 && performance.long_change_pct < baseline.long_change_pct) {
                    classes += ' text-red'
                }
                if (this.props.style_realized_performance
                    && row_name !== 'cash' 
                    && !special_classes.includes('index')) {
                        if (isNaN(current_shares) 
                            || !current_shares 
                            || this.daysAgo(this.props.start_date) < 730
                            ){
                            classes += (this.props.show_only_achieved_performance) ? ' hide' : ' strikethrough'
                        } else {
                            classes += ' strong'
                        }
                }
                break
            default:
                break
        }
        return classes
    }

    onNewValue(new_value) {
        this.props.on_modify_risk_factor(this.props.row_name, new_value)
    }

    // prints the value that is (usually) explicitly passed in via props
    // AND is responsible for calculating "percent_value", "percent_basis", and "percent_profit"
    populateCellValue(column) {

        if ( column.name === 'risk_factor'
            && this.props.row_name === this.props.editing_row ) {
            return (
                <EditNumericCell 
                    original_value={this.props.current_edit_value} 
                    on_new_value={this.onNewValue} 
                    on_escape_key={this.props.on_escape_key}
                />
            )
        }

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
        let risk_factor = (this.props.risk_factor !== null) ? this.props.risk_factor : 0.20
        let visible_risk_factor = (this.props.risk_factor !== null) ? this.props.risk_factor : 'n/a'
        let value_at_risk = current_value * risk_factor
        let basis = this.props.basis
        let basis_risked = basis * risk_factor
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
            case 'start_date':
                value = this.props.start_date
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
            case 'whatif_basis':
                if (whatif === null) {
                    value = 'n/a'
                } else if (this.props.whatif_format === 'deltas') {
                    value = whatif.basis - ((basis === 'n/a') ? 0 : basis)
                } else {
                    value = whatif.basis
                }
                break
            case 'basis_risked':
                value = basis_risked
                break
            case 'whatif_basis_risked':
                if (whatif === null) {
                    value = 'n/a'
                } else if (this.props.whatif_format === 'deltas') {
                    value = whatif.basis_risked - ((basis_risked === 'n/a') ? 0 : basis_risked)
                } else {
                    value = whatif.basis_risked
                }
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
            case 'risk_factor':
                value = visible_risk_factor
                break
            case 'value_at_risk':
                value = value_at_risk
                break
            case 'whatif_value_at_risk':
                if (whatif === null) {
                    value = 'n/a'
                } else if (this.props.whatif_format === 'deltas') {
                    value = whatif.value_at_risk - ((value_at_risk === 'n/a') ? 0 : value_at_risk)
                } else {
                    value = whatif.value_at_risk
                }
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

    daysAgo(date_str) { // yyyy-mm-dd
        let now = new Date()
        let then = new Date(date_str)
        let diff = Math.round((now - then) / 1000 / 60 / 60 / 24)
        if (date_str === 'n/a') {
            return -1
        } else {
            return diff
        }
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
                    { member_count ? this.props.membership_set.sort().map(symbol => this.populateMemberButton(symbol)) : (this.props.special_classes.length ? '' : '-') }
                </td>
                { this.props.columns.map(function(column) {
                    if (column.name === 'symbol') {
                        return (
                            <td key={column.name} className={ self.styleCell(column.name) } onMouseEnter={self.toggleHoverSymbol} onMouseLeave={self.toggleHoverSymbol}>{ self.populateCellValue(column) }{ is_aggr && member_count ? '('+member_count+')' : '' }{ self.populateDeleteButton(column.name, is_aggr) }</td>
                        )
                    } else if (column.name === 'risk_factor') {
                        return (
                            <td key={column.name} className={ self.styleCell(column.name) } onClick={ (e)=>self.editRiskFactor(self.props.row_name) } onMouseEnter={self.toggleHoverRiskFactor} onMouseLeave={self.toggleHoverRiskFactor}>{ self.populateCellValue(column) }{ self.populateEditButton(column.name, self.props.row_name) }</td>
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
    start_date: PropTypes.string,
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
    risk_factor: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    performance_numbers: PropTypes.object,
    show_only_achieved_performance: PropTypes.bool,
    baseline: PropTypes.object,
    style_realized_performance: PropTypes.bool,
    total_value: PropTypes.number,
    total_basis: PropTypes.number,
    whatif: PropTypes.object,
    whatif_format: PropTypes.string,
    on_change_whatif_format: PropTypes.func,
    on_remove_from_tag: PropTypes.func,
    on_delete_ticker: PropTypes.func,
    on_delete_tag: PropTypes.func,
    editing_row: PropTypes.string,
    current_edit_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    on_edit_cell: PropTypes.func,
    on_modify_risk_factor: PropTypes.func,
    on_escape_key: PropTypes.func,
}