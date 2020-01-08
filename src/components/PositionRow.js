import React from 'react'


export class PositionRow extends React.Component {

    render() {
        const quote = this.props.position
        return (
            <tr class="position-row">
                <td class="position-cell">{ quote.symbol }</td>
                <td class="position-cell">{ quote.price }</td>
                <td class="position-cell">{ quote.change }</td>
                <td class="position-cell">{ quote.change_pct }</td>
                <td class="position-cell">{ quote.volume }</td>
            </tr>
        )
    }

}