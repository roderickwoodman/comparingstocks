import React from 'react'


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
            newQuote['price'] = quoteResult['05. price']
            newQuotes[ticker] = newQuote
        })
        this.setState({ allQuotes: newQuotes })
    }

    render() {
        const tickers_with_quotes = Object.keys(this.state.allQuotes)
        const ticker_row = tickers_with_quotes.map( (ticker, index) => 
            <tr key={ index }>
                <td>{ ticker }</td>
                <td>{ this.state.allQuotes[ticker].price }</td>
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
                            { ticker_row }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

}