import React from 'react'


export class PositionRow extends React.Component {

    render() {
        const quote = this.props.position
        return (
            <tr className="position-row">
                <td className="position-cell">{ quote.symbol }</td>
                <td className="position-cell">{ quote.price }</td>
                <td className="position-cell">{ quote.change }</td>
                <td className="position-cell">{ quote.change_pct }</td>
                <td className="position-cell">{ quote.volume }</td>
            </tr>
        )
    }

}