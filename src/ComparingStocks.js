import React from 'react'
import { PositionRow } from './components/PositionRow'


export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allIndiciesTickers: [ 'INX' ],
            allIndiciesAliases: [ 'S&P500' ],
            allStocks: [ // FIXME: placeholder data for now
                // 'MSFT', 'MSFT', 'MSFT' // FIXME: default to demo key and MSFT, not rate-limited
                'V', 'MSFT', 'SBUX', 'BA', 'CVX', 'JNJ', 'CAT', 'DIS', 'HD', 'HSY', 'NFLX', 'TRV', 'PG'
            ],
            allCurrentQuotes: [],
            allMonthlyQuotes: [],
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getCurrentQuotes = this.getCurrentQuotes.bind(this)
        this.debugGetCurrentQuotes = this.debugGetCurrentQuotes.bind(this)
        this.debugGetMonthlyQuotes = this.debugGetMonthlyQuotes.bind(this)
        this.changeSort = this.changeSort.bind(this)
    }

    async componentDidMount() {
        // this.getCurrentQuotes(this.state.allStocks)
        this.debugGetCurrentQuotes(this.state.allStocks)
        this.debugGetMonthlyQuotes(this.state.allStocks)
    }

    getQuoteUrl(ticker) {
        //let alpha_vantage_api_key = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
        let alpha_vantage_api_key = 'demo' // FIXME: default to demo key and MSFT, not rate-limited 
        let url_prefix = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
        let url_suffix = '&apikey=' + alpha_vantage_api_key
        return url_prefix + ticker + url_suffix
    }

    async getCurrentQuotes(tickers) {
        let newQuotes = {}
        const quotesApiResults = await Promise.all(tickers.map(ticker =>
            fetch(this.getQuoteUrl(ticker))
            .then(res => res.json())
        ))
        quotesApiResults.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = quoteResult['01. symbol'] + idx
            newQuote['symbol'] = this.convertNameForIndicies(ticker)
            newQuote['price'] = (Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2)
            newQuote['change'] = (Math.round(100 * parseFloat(quoteResult['09. change'])) / 100).toFixed(2)
            newQuote['change_pct'] = (Math.round(100 * parseFloat(quoteResult['10. change percent'].slice(0, -1))) / 100).toFixed(2)
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allCurrentQuotes: newQuotes })
    }

    // DEBUG: use hardcoded, local responses for development
    debugGetCurrentQuotes(tickers) {
        let newQuotes = {}
        let currentQuotes = require('./api/sample_current_quotes.json').sample_current_quotes
        let self = this
        currentQuotes.forEach(function(item, idx) {
            let quoteResult = item['Global Quote']
            let newQuote = {}
            let ticker = self.convertNameForIndicies(quoteResult['01. symbol'])
            newQuote['symbol'] = ticker
            newQuote['price'] = parseFloat((Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2))
            newQuote['change'] = parseFloat((Math.round(100 * parseFloat(quoteResult['09. change'])) / 100).toFixed(2))
            newQuote['change_pct'] = parseFloat((Math.round(100 * parseFloat(quoteResult['10. change percent'].slice(0, -1))) / 100).toFixed(2))
            newQuote['volume'] = parseInt(quoteResult['06. volume'])
            newQuotes[ticker] = newQuote
        })
        this.setState({ allCurrentQuotes: newQuotes })
    }

    debugGetMonthlyQuotes(tickers) {
        let newQuotes = {}
        let monthlyQuotes = require('./api/sample_monthly_quotes.json').sample_monthly_quotes
        let self = this
        monthlyQuotes.forEach(function(item, idx) {
            let quoteMeta = item['Meta Data']
            let newQuote = {}
            let ticker = self.convertNameForIndicies(quoteMeta['2. Symbol'])
            newQuote['symbol'] = ticker
            newQuote['monthly_prices'] = Object.entries(item['Monthly Adjusted Time Series']).map(price => parseFloat(price[1]['5. adjusted close']))
            newQuotes[ticker] = newQuote
        })
        this.setState({ allMonthlyQuotes: newQuotes })
    }

    changeSort(new_sort_column) {
        if (new_sort_column === this.state.sort_column) {
            this.setState(prevState => ({
                sort_dir_asc: !prevState.sort_dir_asc
            }))
        }
        this.setState({ sort_column: new_sort_column })
    }

    tickerIsIndex(ticker) {
        return (this.state.allIndiciesTickers.includes(ticker) || this.state.allIndiciesAliases.includes(ticker)) ? true : false
    }

    convertNameForIndicies(ticker) {
        let idx = this.state.allIndiciesTickers.indexOf(ticker)
        if (idx !== -1) {
            return this.state.allIndiciesAliases[idx]
        } else {
            return ticker
        }
    }

    render() {
        let current_quote_cols = ['symbol', 'price', 'change', 'change_pct', 'volume']
        let self = this
        let allPerformanceNumbers = {}
        Object.keys(this.state.allCurrentQuotes).forEach(function(ticker) {
            let newPerformanceNumbers = {}
            let start = self.state.allMonthlyQuotes[ticker]['monthly_prices'][0]
            newPerformanceNumbers['short_change_pct'] = parseFloat((Math.round(10 * ((start - self.state.allMonthlyQuotes[ticker]['monthly_prices'][5]) / start * 100) / 10)).toFixed(1));
            newPerformanceNumbers['medium_change_pct'] = parseFloat((Math.round(10 * ((start - self.state.allMonthlyQuotes[ticker]['monthly_prices'][11]) / start * 100) / 10)).toFixed(1));
            newPerformanceNumbers['long_change_pct'] = parseFloat((Math.round(10 * ((start - self.state.allMonthlyQuotes[ticker]['monthly_prices'][23]) / start * 100)  /10)).toFixed(1));
            allPerformanceNumbers[ticker] = newPerformanceNumbers
        })
        let sort_column = this.state.sort_column
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_tickers = Object.keys(this.state.allCurrentQuotes).sort(function(a, b) {
            if (self.state.allCurrentQuotes.hasOwnProperty(a) && self.state.allCurrentQuotes.hasOwnProperty(b)) {
                let value_a, value_b
                if (current_quote_cols.includes(self.state.sort_column)) {
                    value_a = self.state.allCurrentQuotes[a][self.state.sort_column]
                    value_b = self.state.allCurrentQuotes[b][self.state.sort_column]
                } else {
                    value_a = allPerformanceNumbers[a][self.state.sort_column]
                    value_b = allPerformanceNumbers[b][self.state.sort_column]
                }
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
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th onClick={ (e) => this.changeSort('symbol') }>Symbol{ sort_column === 'symbol' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('price') }>Price{ sort_column === 'price' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change_pct') }>Change{ sort_column === 'change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('volume') }>Volume{ sort_column === 'volume' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('short_change_pct') }>6-month{ sort_column === 'short_change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('medium_change_pct') }>1-year{ sort_column === 'medium_change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('long_change_pct') }>2-year{ sort_column === 'long_change_pct' ? sort_triangle : '' }</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted_tickers.map(ticker => (
                            <PositionRow 
                                key={ ticker }
                                current_quote={this.state.allCurrentQuotes[ticker]}
                                performance_numbers={allPerformanceNumbers[ticker]}
                                ticker_is_index={this.tickerIsIndex}
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}