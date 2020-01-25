import React from 'react'
import PropTypes from 'prop-types'


export class GridRowTotals extends React.Component {

    render() {

        const total_value = this.props.total_value

        function populateTotalsCellValue(column) {
            switch (column.variable_name) {
                case 'current_value':
                    return '$' + Math.round(total_value)
                case 'percent_value':
                    return '100.0%'
                default:
                    return
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
                <td key={column.variable_name} className={ styleTotalsCell(column.variable_name) }>{ populateTotalsCellValue(column) }</td>
                ))}
            </tr>
        )
    }

}

GridRowTotals.propTypes = {
    columns: PropTypes.array,
    total_value: PropTypes.number,
}