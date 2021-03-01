import React from 'react'
import PropTypes from 'prop-types'


export const GridRowTotals = (props) => {

    const totalValue = props.totalValue
    const totalBasis = props.totalBasis
    const shortPerf = props.totalPerformance.shortChangePct
    const mediumPerf = props.totalPerformance.mediumChangePct
    const longPerf = props.totalPerformance.longChangePct

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const populateTotalsCellValue = (column) => {
        let value
        switch (column.name) {
            case 'currentValue':
                value = (totalValue !== 'err.') ? '$' + numberWithCommas(Math.round(totalValue)) : 'err.'
                break
            case 'percentValue':
                value = (totalValue !== 'err.') ? '100%' : 'err.'
                break
            case 'basis':
                value = '$' + numberWithCommas(Math.round(totalBasis))
                break
            case 'percentBasis':
                value = (totalBasis) ? '100%' : 'err.'
                break
            case 'shortChangePct':
                if (shortPerf !== 'err.') {
                    value = (Math.round(10 * shortPerf) / 10).toFixed(1) + '%'
                } else {
                    value = 'err.'
                }
                break
            case 'mediumChangePct':
                if (mediumPerf !== 'err.') {
                    value = (Math.round(10 * mediumPerf) / 10).toFixed(1) + '%'
                } else {
                    value = 'err.'
                }
                break
            case 'longChangePct':
                if (longPerf !== 'err.') {
                    value = (Math.round(10 * longPerf) / 10).toFixed(1) + '%'
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
            case 'currentValue':
            case 'percentValue':
            case 'basis':
            case 'percentBasis':
            case 'shortChangePct':
            case 'mediumChangePct':
            case 'longChangePct':
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
    totalValue: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    totalBasis: PropTypes.number,
    totalPerformance: PropTypes.object,

}