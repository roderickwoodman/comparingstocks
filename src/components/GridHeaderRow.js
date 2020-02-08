import React from 'react'
import PropTypes from 'prop-types'


// This component displays table headers for either tickers (is_aggregate === 0) or tags (is_aggregate === 1).
export class GridHeaderRow extends React.Component {

    render() {

        let is_aggregate = this.props.is_aggregate
        let sort_column = this.props.sort_column
        let sort_triangle = this.props.sort_triangle
        let symbol_count_str = this.props.symbol_count_str

        let all_columns = []

        let first_column = { // always the tag or ticker membership column
            name: 'first'
        }
        if (this.props.is_aggregate) {
            first_column['display_name'] = 'Tickers'
        } else {
            first_column['display_name'] = 'Tags'
        }
        all_columns.push(first_column)

        this.props.columns.forEach(function(column) {
            let new_column = {}
            new_column['name'] = column.name
            if (column.name === 'symbol') {
                if (is_aggregate) {
                    new_column['display_name'] = 'Tags'
                } else {
                    new_column['display_name'] = 'Tickers'
                }
            } else {
                new_column['display_name'] = column.display_name
            }
            all_columns.push(new_column)
        })

        return (
            all_columns.map( (column,i) => (
                <th key={ column.name } onClick={ (i!==0) ? (e)=>this.props.on_change_sort(column.name) : undefined }>{ (i===1 && !is_aggregate) ? column.display_name + symbol_count_str : column.display_name }{ column.name === sort_column ? sort_triangle : '' }</th>
            ))
        )
    }

}

GridHeaderRow.propTypes = {
    is_aggregate: PropTypes.bool,
    columns: PropTypes.array,
    symbol_count_str: PropTypes.string,
    sort_column: PropTypes.string,
    sort_triangle: PropTypes.string,
    on_change_sort: PropTypes.func
}