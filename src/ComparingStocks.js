import React from 'react'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allStocks: [ // FIXME: placeholder data for now
                {'ticker': 'V', 'name': 'Visa Inc'},
                {'ticker': 'MSFT', 'name': 'Microsoft Corporation'},
                {'ticker': 'SBUX', 'name': 'Starbucks Corporation'},
            ]
        }
    }

    render() {
        const stocks = this.state.allStocks.map( stock => 
            <tr key={ stock.ticker }>
                <td>{ stock.ticker }</td>
                <td>{ stock.name }</td>
            </tr>
        )
        return (
            <div id="page-wrapper">
                <div id="stocks-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Company Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            { stocks }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

}