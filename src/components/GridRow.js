import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { EditNumericCell } from './EditNumericCell'


// This component displays table data for either tickers (is_aggregate === 0) or tags (is_aggregate === 1).
// For tickers, the membership_set prop is all of the tags that it belongs to.
// For tags, the membership_set prop is all of the tags that belong to it.
export const GridRow = (props) => {

    const [hoveringSymbol, setHoveringSymbol] = useState(false)
    const [hoveringRiskFactor, setHoveringRiskFactor] = useState(false)

    const formatDate = (epoch) => {
        var d = new Date(epoch),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    const onWhatifCellClick = () => {
        props.on_change_whatif_format()
    }

    const toggleHoverSymbol = () => {
        setHoveringSymbol(!hoveringSymbol)
    }

    const toggleHoverRiskFactor = () => {
        setHoveringRiskFactor(!hoveringRiskFactor)
    }

    // this button removes a ticker from a tag
    const populateMemberButton = (symbol) => {
        let is_aggr = props.is_aggregate
        let row_name = props.row_name
        if (is_aggr) {
            // row_name is a TAG
            // symbol is a TICKER 
            if (row_name !== 'untagged') {
                return (
                    <button key={row_name + symbol + is_aggr} className="tag-removal" onClick={ (e) => { props.on_remove_from_tag(row_name, symbol)} }>{ symbol }</button>
                )
            } else {
                return (
                    <button key={row_name + symbol + is_aggr} className="tag-removal" disabled={true}>{ symbol }</button>
                )
            }
        } else {
            // row_name is a TICKER
            // symbol is a TAG 
            if (!props.special_classes.includes('index') && !props.special_classes.includes('cash') && !props.membership_set.includes('untagged')) {
                return (
                    <button key={row_name + symbol + is_aggr} className="tag-removal" onClick={ (e) => { props.on_remove_from_tag(symbol, row_name)} }>{ symbol }</button>
                )
            } else {
                return (
                    '-'
                )
            }
        }
    }

    // this button deletes the ticker or tag completely
    const populateDeleteButton = (column_name, is_aggregate) => {
        let classes = 'delete'
        if (hoveringSymbol) {
            classes += ' hovering'
        }
        if (is_aggregate) {
            if (column_name === 'symbol' && props.row_name !== 'untagged') {
                return (
                    <button className={classes} onClick={ (e) => {props.on_delete_tags(props.row_name)}}>x</button>
                )
            } else {
                return
            }
        } else {
            if (column_name === 'symbol' 
                && !props.special_classes.includes('index')
                && !(props.row_name === 'cash' && isNaN(props.current_shares)) ) {
                return (
                    <button className={classes} onClick={ (e) => {props.on_delete_ticker(props.row_name)}}>x</button>
                )
            } else {
                return
            }
        }
    }

    // the edit button is an extra affordance; clicking anywhere in the cell enters edit mode on this cell's value
    const populateEditButton = (column_name, row_name) => {
        let classes = 'edit'
        if (hoveringRiskFactor) {
            classes += ' hovering'
        }
        if ( column_name === 'risk_factor'
            && row_name !== props.editing_row
            && row_name !== 'cash'
            && !props.is_aggregate 
            && !props.special_classes.includes('index') ) {
                return (
                    <button className={classes}>{String.fromCharCode(0x270e)}</button>
                )
        } else {
            return
        }
    }

    const editRiskFactor = (row_name) => {
        props.on_edit_cell(row_name)
    }

    const performanceBeatTheBaseline = (perf, baseline_perf) => {
        if (props.baseline.name === 'zero_pct_gain') {
            if (perf > 0) {
                return true
            } else if (perf < 0) {
                return false
            }
        } else {
            if (perf > 0 && perf > baseline_perf) {
                return true
            } else if (perf < 0 && perf < baseline_perf) {
                return false
            }
        }
    }

    const styleCell = (column_name) => {
        let classes = 'position-cell'
        const row_name = props.row_name
        const change_pct = props.change_pct
        const current_shares = props.current_shares
        const special_classes = props.special_classes
        const performance = props.performance_numbers
        const baseline = props.baseline

        // hovering
        if ( hoveringSymbol
            && column_name === 'symbol' 
            && !special_classes.includes('index') 
            && row_name !== 'untagged'
            && !(row_name === 'cash' && isNaN(current_shares)) ) {
            classes += ' hovering'
        }
        if ( hoveringRiskFactor
            && column_name === 'risk_factor' 
            && !special_classes.includes('index') 
            && !props.is_aggregate
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
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.short_change_pct, baseline.short_change_pct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && row_name !== 'cash' 
                        && !special_classes.includes('index')) {
                            if (isNaN(current_shares) 
                                || !current_shares 
                                || daysAgo(props.start_date) < 180
                                ){
                                classes += (props.show_only_achieved_performance) ? ' hide' : ' strikethrough'
                            } else {
                                classes += ' strong'
                            }
                    }
                }
                break
            case 'medium_change_pct':
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.medium_change_pct, baseline.medium_change_pct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && row_name !== 'cash' 
                        && !special_classes.includes('index')) {
                            if (isNaN(current_shares) 
                                || !current_shares 
                                || daysAgo(props.start_date) < 365
                                ){
                                classes += (props.show_only_achieved_performance) ? ' hide' :  ' strikethrough'
                            } else {
                                classes += ' strong'
                            }
                    }
                }
                break
            case 'long_change_pct':
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.long_change_pct, baseline.long_change_pct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && row_name !== 'cash' 
                        && !special_classes.includes('index')) {
                            if (isNaN(current_shares) 
                                || !current_shares 
                                || daysAgo(props.start_date) < 730
                                ){
                                classes += (props.show_only_achieved_performance) ? ' hide' : ' strikethrough'
                            } else {
                                classes += ' strong'
                            }
                    }
                }
                break
            default:
                break
        }
        return classes
    }

    const onNewValue = (new_value) => {
        props.on_modify_risk_factor(props.row_name, new_value)
    }

    // prints the value that is (usually) explicitly passed in via props
    // AND is responsible for calculating "percent_value", "percent_basis", and "percent_profit"
    const populateCellValue = (column) => {

        if ( column.name === 'risk_factor'
            && props.row_name === props.editing_row ) {
            return (
                <EditNumericCell 
                    originalValue={props.current_edit_value} 
                    onNewValue={onNewValue} 
                    onEscapeKey={props.onEscapeKey}
                />
            )
        }

        let prefix = ''
        let suffix = ''
        let adjust_decimal = false
        let num_decimals
        let value, baseline_value
        let performance_value = false

        const quote_date = props.quote_date
        const total_value = props.total_value
        const total_basis = props.total_basis
        const current_price = props.current_price
        let current_shares = props.current_shares
        const current_value = props.current_value
        let risk_factor = (props.risk_factor !== null) ? props.risk_factor : 0.20
        let visible_risk_factor = (props.risk_factor !== null) ? props.risk_factor : 'n/a'
        if (props.row_name === 'cash') {
            risk_factor = 0
            visible_risk_factor = 0
        }
        let value_at_risk = current_value * risk_factor
        let basis = props.basis
        let basis_risked = basis * risk_factor
        let realized_gains = props.realized_gains
        const whatif = props.whatif

        let percent_value, percent_basis, profit, percent_profit

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

        // calculate profit and percent_profit
        if (isNaN(current_value) || isNaN(basis)) {
            profit = 'n/a'
            percent_profit = 'n/a'
        } else {
            if (current_shares === 0) {
                profit = 'n/a'
                percent_profit = 'n/a'
            } else if (basis > current_value) {
                profit = current_value - basis
                percent_profit = 'losing'
            } else if (basis < current_value) {
                profit = current_value - basis
                percent_profit = (1 - basis / current_value) * 100
            } else {
                profit = 0
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
                value = props.row_name
                break
            case 'start_date':
                value = props.start_date
                break
            case 'current_shares':
                value = current_shares
                break
            case 'whatif_current_shares':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatif_format === 'deltas') {
                    value = whatif.current_shares - ((current_shares === 'n/a') ? 0 : current_shares)
                } else {
                    value = whatif.current_shares
                }
                break
            case 'current_price':
                value = current_price
                break
            case 'quote_date':
                if (!props.is_aggregate) {
                    value = quote_date
                } else {
                    value = 'n/a'
                }
                break
            case 'current_value':
                if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    if (!flagQuoteErrorOnPositionCell()) {
                        value = current_value
                    } else {
                        value = 'err.'
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_current_value':
                if (!flagQuoteErrorOnPositionCell()) {
                    if (whatif === null) {
                        value = 'n/a'
                    } else if (props.whatif_format === 'deltas') {
                        value = whatif.current_value - ((current_value === 'n/a') ? 0 : current_value)
                    } else {
                        value = whatif.current_value
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'percent_value':
                if (current_value === 'err.') {
                    value = 'err.'
                } else if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    if (!flagQuoteErrorOnPositionCell()) {
                        value = percent_value
                    } else {
                        value = 'err.'
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'basis':
                if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    value = basis
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_basis':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatif_format === 'deltas') {
                    value = whatif.basis - ((basis === 'n/a') ? 0 : basis)
                } else {
                    value = whatif.basis
                }
                break
            case 'basis_risked':
                if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    if (props.current_value === 0) {
                        value = 'n/a'
                    } else {
                        value = basis_risked
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_basis_risked':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatif_format === 'deltas') {
                    value = whatif.basis_risked - ((basis_risked === 'n/a') ? 0 : basis_risked)
                } else {
                    value = whatif.basis_risked
                }
                break
            case 'percent_basis':
                if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    value = percent_basis
                } else {
                    value = 'err.'
                }
                break
            case 'profit':
                if (props.current_value === 0) {
                    value = 'n/a'
                } else if (!flagQuoteErrorOnPositionCell()) {
                    value = profit
                } else {
                    value = 'err.'
                }
                break
            case 'percent_profit':
                if (props.current_value === 0) {
                    value = 'n/a'
                } else if (!flagQuoteErrorOnPositionCell()) {
                    value = percent_profit
                } else {
                    value = 'err.'
                }
                break
            case 'realized_gains':
                value = realized_gains
                break
            case 'change_pct':
                value = props.change_pct
                break
            case 'risk_factor':
                value = visible_risk_factor
                break
            case 'risk_factor_modified':
                if (props.risk_factor_modified !== null) {
                    value = formatDate(parseInt(props.risk_factor_modified))
                } else {
                    value = 'n/a'
                }
                break
            case 'value_at_risk':
                if (typeof current_shares === 'string' || (typeof current_shares === 'number' && current_shares >= 0)) {
                    if (props.current_value === 0) {
                        value = 'n/a'
                    } else if (!flagQuoteErrorOnPositionCell()) {
                        value = value_at_risk
                    } else {
                        value = 'err.'
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_value_at_risk':
                if (!flagQuoteErrorOnPositionCell()) {
                    if (whatif === null) {
                        value = 'n/a'
                    } else if (props.whatif_format === 'deltas') {
                        value = whatif.value_at_risk - ((value_at_risk === 'n/a') ? 0 : value_at_risk)
                    } else {
                        value = whatif.value_at_risk
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'volume':
                if (!flagQuoteError()) {
                    value = props.volume
                } else {
                    value = 'err.'
                }
                break
            case 'dollar_volume':
                if (!flagQuoteError()) {
                    if (props.volume === 'err.') {
                        value = 'err.'
                    } else {
                        value = props.current_price * props.volume
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'short_change_pct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.short_change_pct
                    performance_value = true
                    baseline_value = props.baseline.short_change_pct
                } else {
                    value = 'err.'
                }
                break
            case 'medium_change_pct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.medium_change_pct
                    performance_value = true
                    baseline_value = props.baseline.medium_change_pct
                } else {
                    value = 'err.'
                }
                break
            case 'long_change_pct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.long_change_pct
                    performance_value = true
                    baseline_value = props.baseline.long_change_pct
                } else {
                    value = 'err.'
                }
                break
            default:
                break
        }
        if ( props.row_name === 'cash' || (props.is_aggregate && !props.membership_set.length) ) {
            switch (column.name) {
                case 'realized_gains': 
                case 'profit': 
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

        if (value === 'err.') {
            return 'err.'
        } else if (value === null || value === 'n/a') {
            return '-'
        } else if (column.type === 'string') {
            return value
        } else if (!isNaN(value)) {
            if (adjust_decimal) {
                if (column.hasOwnProperty('scaling_power')) {
                    value *= Math.pow(10, column.scaling_power)
                }
                if (performance_value && props.baseline.name !== 'zero_pct_gain') {
                    if (props.row_name === 'S&P500') {
                        return 'ref.'
                    } else {
                        value = value - baseline_value
                    }
                }
                if (value.toString().indexOf('.')) {
                    value = (Math.round(Math.pow(10, num_decimals) * value) / Math.pow(10, num_decimals)).toFixed(num_decimals)
                }
            }
            if (value >= 0) {
                prefix = (column.name.startsWith('whatif_') && props.whatif_format === 'deltas') ? '+' + prefix : prefix
                return value = prefix + numberWithCommas(value) + suffix
            } else {
                return value = '-' + prefix + numberWithCommas(Math.abs(value)) + suffix
            }
        } else if (column.hasOwnProperty('passthrough_strings') && column['passthrough_strings']) {
            return value
        } else if (column.type === 'number' || column.type === 'percentage' || column.type === 'currency') {
            return '-'
        } else {
            return '??'
        }
    }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const daysAgo = (date_str) => { // yyyy-mm-dd
        let now = new Date()
        let then = new Date(date_str)
        let days_ago = Math.round((now - then) / 1000 / 60 / 60 / 24)
        if (date_str === 'n/a') {
            return -1
        } else {
            return days_ago
        }
    }

    const isQuoteFromToday = (quote_date_str) => { // yyyy-mm-dd
        let now = new Date()
        let quote_date = new Date(quote_date_str)
        let days_ago = (now - quote_date) / 1000 / 60 / 60 / 24
        if (-1 <= days_ago && days_ago <= 0) {
            return true
        } else {
            return false
        }
    }

    // certain columns' cells can print an error if the quote is out of date
    const flagQuoteError = () => {
        if (props.error_if_not_todays_quote && !isQuoteFromToday(props.quote_date)) {
            return true
        } else {
            return false
        }
    }

    // certain POSITION columns' cells may print share-count-based "n/a" values before a quote out-of-date error applies
    const flagQuoteErrorOnPositionCell = () => {
        if (props.is_aggregate) {
            if (props.current_value !== 0 && props.error_if_not_todays_quote && !isQuoteFromToday(props.quote_date)) {
                return true
            }
        } else {
            if (typeof props.current_shares === 'number' && props.current_shares !== 0 && props.error_if_not_todays_quote && !isQuoteFromToday(props.quote_date)) {
                return true
            }
        }
        return false
    }

    const is_aggr = props.is_aggregate

    let row_classes = 'position-row' 
    props.special_classes.forEach(function(special_class) {
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

    let member_count = props.membership_set.length

    return (
        <tr className={ row_classes }>
            <td>
                { member_count ? props.membership_set.sort().map(symbol => populateMemberButton(symbol)) : (props.special_classes.length ? '' : '-') }
            </td>
            { props.columns.map(function(column) {
                if (column.name === 'symbol') {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onMouseEnter={toggleHoverSymbol} onMouseLeave={toggleHoverSymbol}>{ populateCellValue(column) }{ is_aggr && member_count ? '('+member_count+')' : '' }{ populateDeleteButton(column.name, is_aggr) }</td>
                    )
                } else if (column.name === 'risk_factor') {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onClick={ (e)=>editRiskFactor(props.row_name) } onMouseEnter={toggleHoverRiskFactor} onMouseLeave={toggleHoverRiskFactor}>{ populateCellValue(column) }{ populateEditButton(column.name, props.row_name) }</td>
                    )
                } else if (column.name.startsWith('whatif_')) {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onClick={ (column.name.startsWith('whatif_')) ? (e)=>onWhatifCellClick() : undefined }>{ populateCellValue(column) }{ populateDeleteButton(column.name, is_aggr) }</td>
                    )
                } else {
                    return (
                        <td key={column.name} className={ styleCell(column.name) }>{ populateCellValue(column) }{ populateDeleteButton(column.name, is_aggr) }</td>
                    )
                }
            })}
        </tr>
    )
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
    quote_date: PropTypes.string,
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
    risk_factor_modified: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    performance_numbers: PropTypes.object,
    error_if_not_todays_quote: PropTypes.bool,
    show_only_achieved_performance: PropTypes.bool,
    baseline: PropTypes.object,
    style_realized_performance: PropTypes.bool,
    total_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    total_basis: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    whatif: PropTypes.object,
    whatif_format: PropTypes.string,
    on_change_whatif_format: PropTypes.func,
    on_remove_from_tag: PropTypes.func,
    on_delete_ticker: PropTypes.func,
    on_delete_tags: PropTypes.func,
    editing_row: PropTypes.string,
    current_edit_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    on_edit_cell: PropTypes.func,
    on_modify_risk_factor: PropTypes.func,
    onEscapeKey: PropTypes.func,
}