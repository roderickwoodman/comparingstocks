import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { EditNumericCell } from './EditNumericCell'


// This component displays table data for either tickers (isAggregate === 0) or tags (isAggregate === 1).
// For tickers, the membershipSet prop is all of the tags that it belongs to.
// For tags, the membershipSet prop is all of the tags that belong to it.
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
        props.onChangeWhatifFormat()
    }

    const toggleHoverSymbol = () => {
        setHoveringSymbol(!hoveringSymbol)
    }

    const toggleHoverRiskFactor = () => {
        setHoveringRiskFactor(!hoveringRiskFactor)
    }

    // this button removes a ticker from a tag
    const populateMemberButton = (symbol) => {
        const isAggr = props.isAggregate
        const rowName = props.rowName
        if (isAggr) {
            // rowName is a TAG
            // symbol is a TICKER 
            if (rowName !== 'untagged') {
                return (
                    <button key={rowName + symbol + isAggr} className="tag-removal" onClick={ (e) => { props.onRemoveFromTag(rowName, symbol)} }>{ symbol }</button>
                )
            } else {
                return (
                    <button key={rowName + symbol + isAggr} className="tag-removal" disabled={true}>{ symbol }</button>
                )
            }
        } else {
            // rowName is a TICKER
            // symbol is a TAG 
            if (!props.specialClasses.includes('index') && !props.specialClasses.includes('cash') && !props.membershipSet.includes('untagged')) {
                return (
                    <button key={rowName + symbol + isAggr} className="tag-removal" onClick={ (e) => { props.onRemoveFromTag(symbol, rowName)} }>{ symbol }</button>
                )
            } else {
                return (
                    '-'
                )
            }
        }
    }

    // this button deletes the ticker or tag completely
    const populateDeleteButton = (columnName, isAggregate) => {
        let classes = 'delete'
        if (hoveringSymbol) {
            classes += ' hovering'
        }
        if (isAggregate) {
            if (columnName === 'symbol' && props.rowName !== 'untagged') {
                return (
                    <button className={classes} onClick={ (e) => {props.onDeleteTags(props.rowName)}}>x</button>
                )
            } else {
                return
            }
        } else {
            if (columnName === 'symbol' 
                && !props.specialClasses.includes('index')
                && !(props.rowName === 'cash' && isNaN(props.currentShares)) ) {
                return (
                    <button className={classes} onClick={ (e) => {props.on_delete_ticker(props.rowName)}}>x</button>
                )
            } else {
                return
            }
        }
    }

    // the edit button is an extra affordance; clicking anywhere in the cell enters edit mode on this cell's value
    const populateEditButton = (columnName, rowName) => {
        let classes = 'edit'
        if (hoveringRiskFactor) {
            classes += ' hovering'
        }
        if ( columnName === 'risk_factor'
            && rowName !== props.editing_row
            && rowName !== 'cash'
            && !props.isAggregate 
            && !props.specialClasses.includes('index') ) {
                return (
                    <button className={classes}>{String.fromCharCode(0x270e)}</button>
                )
        } else {
            return
        }
    }

    const editRiskFactor = (rowName) => {
        props.on_edit_cell(rowName)
    }

    const performanceBeatTheBaseline = (perf, baseline_perf) => {
        if (props.baseline.name === 'zeroPctGain') {
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

    const styleCell = (columnName) => {
        let classes = 'position-cell'
        const rowName = props.rowName
        const change_pct = props.change_pct
        const currentShares = props.currentShares
        const specialClasses = props.specialClasses
        const performance = props.performance_numbers
        const baseline = props.baseline

        // hovering
        if ( hoveringSymbol
            && columnName === 'symbol' 
            && !specialClasses.includes('index') 
            && rowName !== 'untagged'
            && !(rowName === 'cash' && isNaN(currentShares)) ) {
            classes += ' hovering'
        }
        if ( hoveringRiskFactor
            && columnName === 'risk_factor' 
            && !specialClasses.includes('index') 
            && !props.isAggregate
            && rowName !== 'cash' ) {
            classes += ' hovering'
        }

        // whatif
        if ( columnName.startsWith('whatif-') ) {
            classes += ' clickable whatif'
        }

        // italics
        if ( columnName === 'symbol' && rowName === 'untagged') {
            classes += ' italics'
        }

        switch (columnName) {
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
            case 'shortChangePct':
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.shortChangePct, baseline.shortChangePct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && rowName !== 'cash' 
                        && !specialClasses.includes('index')) {
                            if (isNaN(currentShares) 
                                || !currentShares 
                                || daysAgo(props.start_date) < 180
                                ){
                                classes += (props.show_only_achieved_performance) ? ' hide' : ' strikethrough'
                            } else {
                                classes += ' strong'
                            }
                    }
                }
                break
            case 'mediumChangePct':
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.mediumChangePct, baseline.mediumChangePct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && rowName !== 'cash' 
                        && !specialClasses.includes('index')) {
                            if (isNaN(currentShares) 
                                || !currentShares 
                                || daysAgo(props.start_date) < 365
                                ){
                                classes += (props.show_only_achieved_performance) ? ' hide' :  ' strikethrough'
                            } else {
                                classes += ' strong'
                            }
                    }
                }
                break
            case 'longChangePct':
                if (!flagQuoteError()) {
                    if (performanceBeatTheBaseline(performance.longChangePct, baseline.longChangePct)) {
                        classes += ' text-green'
                    } else  {
                        classes += ' text-green'
                    }
                    if (props.style_realized_performance
                        && rowName !== 'cash' 
                        && !specialClasses.includes('index')) {
                            if (isNaN(currentShares) 
                                || !currentShares 
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
        props.on_modify_risk_factor(props.rowName, new_value)
    }

    // prints the value that is (usually) explicitly passed in via props
    // AND is responsible for calculating "percentValue", "percentBasis", and "percent_profit"
    const populateCellValue = (column) => {

        if ( column.name === 'risk_factor'
            && props.rowName === props.editing_row ) {
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
        const totalValue = props.totalValue
        const totalBasis = props.totalBasis
        const current_price = props.current_price
        const currentShares = props.currentShares
        const currentValue = props.currentValue
        let risk_factor = (props.risk_factor !== null) ? props.risk_factor : 0.20
        let visible_risk_factor = (props.risk_factor !== null) ? props.risk_factor : 'n/a'
        if (props.rowName === 'cash') {
            risk_factor = 0
            visible_risk_factor = 0
        }
        const valueAtRisk = currentValue * risk_factor
        const basis = props.basis
        const basisRisked = basis * risk_factor
        const realized_gains = props.realized_gains
        const whatif = props.whatif

        let percentValue, percentBasis, profit, percent_profit

        // calculate percentValue
        if (isNaN(currentValue)) {
            percentValue = 'n/a'
        } else {
            if (isNaN(totalValue) || totalValue === 0) {
                percentValue = 'n/a'
            } else {
                percentValue = (currentValue !== 'n/a') ? currentValue / totalValue * 100 : 'n/a'
            }
        }

        // calculate percentBasis
        if (isNaN(currentValue)) {
            percentBasis = 'n/a'
        } else {
            if (isNaN(totalBasis) || totalBasis === 0) {
                percentBasis = 'n/a'
            } else {
                percentBasis = (currentValue !== 'n/a') ? basis / totalBasis * 100 : 'n/a'
            }
        }

        // calculate profit and percent_profit
        if (isNaN(currentValue) || isNaN(basis)) {
            profit = 'n/a'
            percent_profit = 'n/a'
        } else {
            if (currentShares === 0) {
                profit = 'n/a'
                percent_profit = 'n/a'
            } else if (basis > currentValue) {
                profit = currentValue - basis
                percent_profit = 'losing'
            } else if (basis < currentValue) {
                profit = currentValue - basis
                percent_profit = (1 - basis / currentValue) * 100
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
                value = props.rowName
                break
            case 'start_date':
                value = props.start_date
                break
            case 'currentShares':
                value = currentShares
                break
            case 'whatif_current_shares':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatifFormat === 'deltas') {
                    value = whatif.currentShares - ((currentShares === 'n/a') ? 0 : currentShares)
                } else {
                    value = whatif.currentShares
                }
                break
            case 'current_price':
                value = current_price
                break
            case 'quote_date':
                if (!props.isAggregate) {
                    value = quote_date
                } else {
                    value = 'n/a'
                }
                break
            case 'currentValue':
                if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    if (!flagQuoteErrorOnPositionCell()) {
                        value = currentValue
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
                    } else if (props.whatifFormat === 'deltas') {
                        value = whatif.currentValue - ((currentValue === 'n/a') ? 0 : currentValue)
                    } else {
                        value = whatif.currentValue
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'percentValue':
                if (currentValue === 'err.') {
                    value = 'err.'
                } else if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    if (!flagQuoteErrorOnPositionCell()) {
                        value = percentValue
                    } else {
                        value = 'err.'
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'basis':
                if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    value = basis
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_basis':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatifFormat === 'deltas') {
                    value = whatif.basis - ((basis === 'n/a') ? 0 : basis)
                } else {
                    value = whatif.basis
                }
                break
            case 'basisRisked':
                if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    if (props.currentValue === 0) {
                        value = 'n/a'
                    } else {
                        value = basisRisked
                    }
                } else {
                    value = 'err.'
                }
                break
            case 'whatif_basis_risked':
                if (whatif === null) {
                    value = 'n/a'
                } else if (props.whatifFormat === 'deltas') {
                    value = whatif.basisRisked - ((basisRisked === 'n/a') ? 0 : basisRisked)
                } else {
                    value = whatif.basisRisked
                }
                break
            case 'percentBasis':
                if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    value = percentBasis
                } else {
                    value = 'err.'
                }
                break
            case 'profit':
                if (props.currentValue === 0) {
                    value = 'n/a'
                } else if (!flagQuoteErrorOnPositionCell()) {
                    value = profit
                } else {
                    value = 'err.'
                }
                break
            case 'percent_profit':
                if (props.currentValue === 0) {
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
            case 'valueAtRisk':
                if (typeof currentShares === 'string' || (typeof currentShares === 'number' && currentShares >= 0)) {
                    if (props.currentValue === 0) {
                        value = 'n/a'
                    } else if (!flagQuoteErrorOnPositionCell()) {
                        value = valueAtRisk
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
                    } else if (props.whatifFormat === 'deltas') {
                        value = whatif.valueAtRisk - ((valueAtRisk === 'n/a') ? 0 : valueAtRisk)
                    } else {
                        value = whatif.valueAtRisk
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
            case 'shortChangePct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.shortChangePct
                    performance_value = true
                    baseline_value = props.baseline.shortChangePct
                } else {
                    value = 'err.'
                }
                break
            case 'mediumChangePct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.mediumChangePct
                    performance_value = true
                    baseline_value = props.baseline.mediumChangePct
                } else {
                    value = 'err.'
                }
                break
            case 'longChangePct':
                if (!flagQuoteError()) {
                    value = props.performance_numbers.longChangePct
                    performance_value = true
                    baseline_value = props.baseline.longChangePct
                } else {
                    value = 'err.'
                }
                break
            default:
                break
        }
        if ( props.rowName === 'cash' || (props.isAggregate && !props.membershipSet.length) ) {
            switch (column.name) {
                case 'realized_gains': 
                case 'profit': 
                case 'percent_profit': 
                case 'volume': 
                case 'dollar_volume': 
                case 'shortChangePct': 
                case 'mediumChangePct': 
                case 'longChangePct': 
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
                if (performance_value && props.baseline.name !== 'zeroPctGain') {
                    if (props.rowName === 'S&P500') {
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
                prefix = (column.name.startsWith('whatif-') && props.whatifFormat === 'deltas') ? '+' + prefix : prefix
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
        const now = new Date()
        const then = new Date(date_str)
        const days_ago = Math.round((now - then) / 1000 / 60 / 60 / 24)
        if (date_str === 'n/a') {
            return -1
        } else {
            return days_ago
        }
    }

    const isQuoteFromToday = (quote_date_str) => { // yyyy-mm-dd
        const now = new Date()
        const quote_date = new Date(quote_date_str)
        const days_ago = (now - quote_date) / 1000 / 60 / 60 / 24
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
        if (props.isAggregate) {
            if (props.currentValue !== 0 && props.error_if_not_todays_quote && !isQuoteFromToday(props.quote_date)) {
                return true
            }
        } else {
            if (typeof props.currentShares === 'number' && props.currentShares !== 0 && props.error_if_not_todays_quote && !isQuoteFromToday(props.quote_date)) {
                return true
            }
        }
        return false
    }

    const isAggr = props.isAggregate

    let row_classes = 'position-row' 
    props.specialClasses.forEach(function(special_class) {
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

    const member_count = props.membershipSet.length

    return (
        <tr className={ row_classes }>
            <td>
                { member_count ? props.membershipSet.sort().map(symbol => populateMemberButton(symbol)) : (props.specialClasses.length ? '' : '-') }
            </td>
            { props.columns.map(function(column) {
                if (column.name === 'symbol') {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onMouseEnter={toggleHoverSymbol} onMouseLeave={toggleHoverSymbol}>{ populateCellValue(column) }{ isAggr && member_count ? '('+member_count+')' : '' }{ populateDeleteButton(column.name, isAggr) }</td>
                    )
                } else if (column.name === 'risk_factor') {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onClick={ (e)=>editRiskFactor(props.rowName) } onMouseEnter={toggleHoverRiskFactor} onMouseLeave={toggleHoverRiskFactor}>{ populateCellValue(column) }{ populateEditButton(column.name, props.rowName) }</td>
                    )
                } else if (column.name.startsWith('whatif-')) {
                    return (
                        <td key={column.name} className={ styleCell(column.name) } onClick={ (column.name.startsWith('whatif-')) ? (e)=>onWhatifCellClick() : undefined }>{ populateCellValue(column) }{ populateDeleteButton(column.name, isAggr) }</td>
                    )
                } else {
                    return (
                        <td key={column.name} className={ styleCell(column.name) }>{ populateCellValue(column) }{ populateDeleteButton(column.name, isAggr) }</td>
                    )
                }
            })}
        </tr>
    )
}

GridRow.defaultProps = {
    performance_numbers: {
        shortChangePct: 0,
        mediumChangePct: 0,
        longChangePct: 0
    }
}

GridRow.propTypes = {
    isAggregate: PropTypes.bool,
    columns: PropTypes.array,
    rowName: PropTypes.string,
    membershipSet: PropTypes.array,
    specialClasses: PropTypes.array,
    start_date: PropTypes.string,
    currentShares: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    current_price: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    currentValue: PropTypes.oneOfType([
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
    totalValue: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    totalBasis: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    whatif: PropTypes.object,
    whatifFormat: PropTypes.string,
    onChangeWhatifFormat: PropTypes.func,
    onRemoveFromTag: PropTypes.func,
    on_delete_ticker: PropTypes.func,
    onDeleteTags: PropTypes.func,
    editing_row: PropTypes.string,
    current_edit_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    on_edit_cell: PropTypes.func,
    on_modify_risk_factor: PropTypes.func,
    onEscapeKey: PropTypes.func,
}