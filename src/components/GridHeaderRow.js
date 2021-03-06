import React from 'react'
import PropTypes from 'prop-types'


// This component displays table headers for either tickers (isAggregate === 0) or tags (isAggregate === 1).
export const GridHeaderRow = (props) => {

    const styleCell = (columnIndex, columnName) => {
        let classes = ''
        if (columnIndex !== 0) {
            classes += 'clickable '
        }
        if (columnName.startsWith('whatif-')) {
            classes += 'whatif '
        }
        return classes
    }

    const onHeaderCellClick = (columnName) => {
        if (columnName.startsWith('whatif-')) {
            props.onChangeWhatifFormat()
        } else {
            props.onChangeSort(columnName)
        }
    }

    const isAggregate = props.isAggregate
    const sortColumn = props.sortColumn
    const sortTriangle = props.sortTriangle
    const symbolCountStr = props.symbolCountStr

    let allColumns = []

    let firstColumn = { // always the tag or ticker membership column
        name: 'first'
    }
    if (props.isAggregate) {
        firstColumn['displayName'] = 'Tickers'
    } else {
        firstColumn['displayName'] = 'Tags'
    }
    allColumns.push(firstColumn)

    props.columns.forEach(function(column) {
        let newColumn = {}
        newColumn['name'] = column.name
        if (column.name === 'symbol') {
            if (isAggregate) {
                newColumn['displayName'] = 'Tags'
            } else {
                newColumn['displayName'] = 'Tickers'
            }
        } else if (column.name.startsWith('whatif-')) {
            if (props.whatifFormat === 'deltas') {
                newColumn['displayName'] = column.displayName.replace('What-If', 'What-If DELTA')
            } else {
                newColumn['displayName'] = column.displayName.replace('What-If', 'What-If NEW')
            }
        } else {
            newColumn['displayName'] = column.displayName
        }
        allColumns.push(newColumn)
    })

    return (
        <tr>
        {props.highlightColumn !== null && allColumns.map( (column,i) => (
            <th
            key={ column.name }
            >
                { (column.name === props.highlightColumn) 
                ? 'BEFORE BALANCING' 
                : (column.name === 'whatif-' + props.highlightColumn) 
                    ? 'AFTER BALANCING' 
                    : String.fromCharCode(160) }
            </th>
        ))}
        {props.highlightColumn === null && allColumns.map( (column,i) => (
            <th 
                key={ column.name } 
                className={ styleCell(i, column.name) }
                onClick={ (i!==0) ? (e)=>onHeaderCellClick(column.name) : undefined }
            >   { (i===1 && !isAggregate) ? column.displayName + symbolCountStr : column.displayName }
                { column.name === sortColumn ? sortTriangle : '' }
            </th>
        ))}
        </tr>
    )

}

GridHeaderRow.propTypes = {
    highlightColumn: PropTypes.string,
    isAggregate: PropTypes.bool,
    columns: PropTypes.array,
    symbolCountStr: PropTypes.string,
    sortColumn: PropTypes.string,
    sortTriangle: PropTypes.string,
    whatifFormat: PropTypes.string,
    onChangeSort: PropTypes.func,
    onChangeWhatifFormat: PropTypes.func
}