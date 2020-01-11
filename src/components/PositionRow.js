import React from 'react'


export class PositionRow extends React.Component {

    render() {
        const quote = this.props.current_quote
        const performance = this.props.performance_numbers
        let row_classes = 'position-row' 
        if (this.props.ticker_is_index(quote.symbol)) {
            row_classes += ' position-is-index'
        }
        return (
            <tr className={ row_classes }>
                <td className="position-cell">{ quote.symbol }</td>
                {/* <td className="position-cell">{ this.props.current_shares }</td> */}
                <td className="position-cell">${ quote.current_price }</td>
                <td className="position-cell">{ quote.change_pct }%</td>
                <td className="position-cell">{ quote.volume }</td>
                <td className="position-cell">{ performance.short_change_pct }%</td>
                <td className="position-cell">{ performance.medium_change_pct }%</td>
                <td className="position-cell">{ performance.long_change_pct }%</td>
            </tr>
        )
    }

}