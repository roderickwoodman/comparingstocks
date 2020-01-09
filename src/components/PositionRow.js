import React from 'react'


export class PositionRow extends React.Component {

    render() {
        const quote = this.props.current_quote
        const performance = this.props.performance_numbers
        return (
            <tr className="position-row">
                <td className="position-cell">{ quote.symbol }</td>
                <td className="position-cell">${ quote.price }</td>
                <td className="position-cell">{ quote.change_pct }%</td>
                <td className="position-cell">{ quote.volume }</td>
                <td className="position-cell">{ performance.short_change_pct }%</td>
                <td className="position-cell">{ performance.medium_change_pct }%</td>
                <td className="position-cell">{ performance.long_change_pct }%</td>
            </tr>
        )
    }

}