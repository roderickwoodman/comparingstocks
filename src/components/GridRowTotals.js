import React from 'react'
import PropTypes from 'prop-types'


export class GridRowTotals extends React.Component {

    render() {

        const total_value = this.props.total_value

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
                    value = (total_value) ? '100.0%' : 'n/a'
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
}