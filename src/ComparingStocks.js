import React from 'react'
import { PositionRow } from './components/PositionRow'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allStocks: [ // FIXME: placeholder data for now
                // 'MSFT', 'MSFT', 'MSFT' // FIXME: default to demo key and MSFT, not rate-limited
                'V', 'MSFT', 'SBUX'
            ],
            allQuotes: [],
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.getQuotes = this.getQuotes.bind(this)
        this.debugGetQuotes = this.debugGetQuotes.bind(this)
        this.changeSort = this.changeSort.bind(this)
    }

    async componentDidMount() {
        // this.getQuotes(this.state.allStocks)
        this.debugGetQuotes(this.state.allStocks)
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

    // DEBUG: use hardcoded, local responses for development
    debugGetQuotes(tickers) {
        let newQuotes = {}
        let hardcodedQuotes = [
            {
                "Global Quote": {
                    "01. symbol": "V",
                    "02. open": "189.4900",
                    "03. high": "192.1100",
                    "04. low": "188.8000",
                    "05. price": "191.8700",
                    "06. volume": "1752851",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "188.6900",
                    "09. change": "3.1800",
                    "10. change percent": "1.6853%"
                }
            },
            {
                "Global Quote": {
                    "01. symbol": "MSFT",
                    "02. open": "158.9300",
                    "03. high": "160.1800",
                    "04. low": "157.9491",
                    "05. price": "159.9650",
                    "06. volume": "9797793",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "157.5800",
                    "09. change": "2.3850",
                    "10. change percent": "1.5135%"
                }
            },
            {
                "Global Quote": {
                    "01. symbol": "SBUX",
                    "02. open": "87.9400",
                    "03. high": "89.1800",
                    "04. low": "87.7800",
                    "05. price": "89.1350",
                    "06. volume": "2517383",
                    "07. latest trading day": "2020-01-08",
                    "08. previous close": "87.8600",
                    "09. change": "1.2750",
                    "10. change percent": "1.4512%"
                }
            }
        ]
        hardcodedQuotes.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = quoteResult['01. symbol']
            newQuote['symbol'] = ticker
            newQuote['price'] = parseFloat(quoteResult['05. price'])
            newQuote['change'] = parseFloat(quoteResult['09. change'])
            newQuote['change_pct'] = parseFloat(quoteResult['10. change percent'].slice(0, -1))
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allQuotes: newQuotes })
    }

    changeSort(new_sort_column) {
        if (new_sort_column === this.state.sort_column) {
            this.setState(prevState => ({
                sort_dir_asc: !prevState.sort_dir_asc
            }))
        }
        this.setState({ sort_column: new_sort_column })
    }

    render() {
        let self = this
        let sort_column = this.state.sort_column
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_positions = Object.keys(this.state.allQuotes).sort(function(a, b) {
            if (self.state.allQuotes.hasOwnProperty(a) && self.state.allQuotes.hasOwnProperty(b)) {
                let value_a = self.state.allQuotes[a][self.state.sort_column]
                let value_b = self.state.allQuotes[b][self.state.sort_column]
                if (self.state.sort_dir_asc === true) {
                    if (value_a < value_b) {
                        return -1
                    }
                    if (value_a > value_b) {
                        return 1
                    }
                } else {
                    if (value_a < value_b) {
                        return 1
                    }
                    if (value_a > value_b) {
                        return -1
                    }
                }
            }
            return 0
        })
        return (
            <div id="page-wrapper">
                <table id="position-listing">
                    <thead>
                        <tr>
                            <th onClick={ (e) => this.changeSort('symbol') }>Symbol{ sort_column === 'symbol' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('price') }>Price{ sort_column === 'price' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change') }>Change{ sort_column === 'change' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change_pct') }>Change Pct{ sort_column === 'change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('volume') }>Volume{ sort_column === 'volume' ? sort_triangle : '' }</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted_positions.map(ticker => (
                            <PositionRow 
                                key={ticker}
                                position={this.state.allQuotes[ticker]} 
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}