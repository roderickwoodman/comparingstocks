import React from 'react'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allStocks: [ // FIXME: placeholder data for now
                {'ticker': 'V', 'name': 'Visa Inc'},
                {'ticker': 'MSFT', 'name': 'Microsoft Corporation'},
                {'ticker': 'SBUX', 'name': 'Starbucks Corporation'},
            ],
            quote_result: null,
            done: false
        }
    }

    componentDidMount() {
        //let alpha_vantage_api_key = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
        let alpha_vantage_api_key = 'demo' // FIXME: default to demo key and MSFT, not rate-limited
        // FIXME: placeholder API call
        fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey='+alpha_vantage_api_key)
        .then(res => res.json())
        .then(result => this.setState({ quote_result: result }))
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