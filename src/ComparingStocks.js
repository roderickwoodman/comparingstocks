import React from 'react'
import { PositionRow } from './components/PositionRow'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allStocks: [ // FIXME: placeholder data for now
                'MSFT', 'MSFT', 'MSFT' // FIXME: default to demo key and MSFT, not rate-limited
                //'V', 'MSFT', 'SBUX'
            ],
            allQuotes: [],
            done: false
        }
        this.getQuotes = this.getQuotes.bind(this)
    }

    async componentDidMount() {
        this.getQuotes(this.state.allStocks)
    }

    getQuoteUrl(ticker) {
        //let alpha_vantage_api_key = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
        let alpha_vantage_api_key = 'demo' // FIXME: default to demo key and MSFT, not rate-limited 
        let url_prefix = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
        let url_suffix = '&apikey=' + alpha_vantage_api_key
        return url_prefix + ticker + url_suffix
    }

    async getQuotes(tickers) {
        let newQuotes = {}
        const quotesApiResults = await Promise.all(tickers.map(ticker =>
            fetch(this.getQuoteUrl(ticker))
            .then(res => res.json())
        ))
        quotesApiResults.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = quoteResult['01. symbol'] + idx
            newQuote['symbol'] = ticker
            newQuote['price'] = parseFloat(quoteResult['05. price'])
            newQuote['change'] = parseFloat(quoteResult['09. change'])
            newQuote['change_pct'] = parseFloat(quoteResult['10. change percent'].slice(0, -1))
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allQuotes: newQuotes })
    }

    render() {
        return (
            <div id="page-wrapper">
                <table id="position-listing">
                    <thead>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Change</th>
                        <th>Change Pct</th>
                        <th>Volume</th>
                    </thead>
                    <tbody>
                        {Object.keys(this.state.allQuotes).map(ticker => (
                            <PositionRow 
                                position={this.state.allQuotes[ticker]} 
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}