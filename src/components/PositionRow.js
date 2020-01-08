import React from 'react'


export class PositionRow extends React.Component {

    render() {
        const quote = this.props.position
        return (
            <div class="tablerow">
                <div>{ quote.symbol }</div>
                <div>{ quote.price }</div>
                <div>{ quote.change }</div>
                <div>{ quote.change_pct }</div>
                <div>{ quote.volume }</div>
            </div>
        )
    }

}