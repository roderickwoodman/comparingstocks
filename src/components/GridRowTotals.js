import React from 'react'
import PropTypes from 'prop-types'


export class GridRowTotals extends React.Component {

    render() {

        const total_value = this.props.total_value
        const total_basis = this.props.total_basis
        const total_performance = this.props.total_performance

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function populateTotalsCellValue(column) {
            let value
            switch (column.name) {
                case 'current_value':
                    value = '$' + numberWithCommas(Math.round(total_value))
                    break
                case 'percent_value':
                    value = (total_value) ? '100%' : 'n/a'
                    break
                case 'basis':
                    value = '$' + numberWithCommas(Math.round(total_basis))
                    break
                case 'percent_basis':
                    value = (total_basis) ? '100%' : 'n/a'
                    break
                case 'short_change_pct':
                    value = (Math.round(10 * total_performance.short_change_pct) / 10).toFixed(1) + '%'
                    break
                case 'medium_change_pct':
                    value = (Math.round(10 * total_performance.medium_change_pct) / 10).toFixed(1) + '%'
                    break
                case 'long_change_pct':
                    value = (Math.round(10 * total_performance.long_change_pct) / 10).toFixed(1) + '%'
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

        function styleTotalsCell(column) {
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
                { this.props.columns.map(column => (
                <td key={column.name} className={ styleTotalsCell(column.name) }>{ populateTotalsCellValue(column) }</td>
                ))}
            </tr>
        )
    }

}

GridRowTotals.propTypes = {
    columns: PropTypes.array,
    total_value: PropTypes.number,
    total_basis: PropTypes.number,
    total_performance: PropTypes.object,
}