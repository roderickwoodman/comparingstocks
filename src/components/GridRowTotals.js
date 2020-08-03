import React from 'react'
import PropTypes from 'prop-types'


export const GridRowTotals = (props) => {

    const total_value = props.total_value
    const total_basis = props.total_basis
    const short_perf = props.total_performance.short_change_pct
    const medium_perf = props.total_performance.medium_change_pct
    const long_perf = props.total_performance.long_change_pct

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const populateTotalsCellValue = (column) => {
        let value
        switch (column.name) {
            case 'current_value':
                value = (total_value !== 'err.') ? '$' + numberWithCommas(Math.round(total_value)) : 'err.'
                break
            case 'percent_value':
                value = (total_value !== 'err.') ? '100%' : 'err.'
                break
            case 'basis':
                value = '$' + numberWithCommas(Math.round(total_basis))
                break
            case 'percent_basis':
                value = (total_basis) ? '100%' : 'err.'
                break
            case 'short_change_pct':
                if (short_perf !== 'err.') {
                    value = (Math.round(10 * short_perf) / 10).toFixed(1) + '%'
                } else {
                    value = 'err.'
                }
                break
            case 'medium_change_pct':
                if (medium_perf !== 'err.') {
                    value = (Math.round(10 * medium_perf) / 10).toFixed(1) + '%'
                } else {
                    value = 'err.'
                }
                break
            case 'long_change_pct':
                if (long_perf !== 'err.') {
                    value = (Math.round(10 * long_perf) / 10).toFixed(1) + '%'
                } else {
                    value = 'err.'
                }
                break
            default:
                break
        }
        if (value === null || value === 'n/a') {
            return '-'
        } else {
            return value
        }
    }

    const styleTotalsCell = (column) => {
        let classes = ''
        switch (column) {
            case 'current_value':
            case 'percent_value':
            case 'basis':
            case 'percent_basis':
            case 'short_change_pct':
            case 'medium_change_pct':
            case 'long_change_pct':
                classes += 'totals'
                break
            default:
                classes = ''
                break
        }
        return classes
    }

    return (
        <tr>
            <td></td>
            { props.columns.map(column => (
            <td key={column.name} className={ styleTotalsCell(column.name) }>{ populateTotalsCellValue(column) }</td>
            ))}
        </tr>
    )

}

GridRowTotals.propTypes = {
    columns: PropTypes.array,
    total_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    total_basis: PropTypes.number,
    total_performance: PropTypes.object,

}