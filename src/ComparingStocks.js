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
            currentPositions: [],
            performance_baseline: 'sp500_pct_gain',
            show_which_stocks: 'all_stocks',
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getCurrentQuotes = this.getCurrentQuotes.bind(this)
        this.debugGetCurrentQuotes = this.debugGetCurrentQuotes.bind(this)
        this.debugGetMonthlyQuotes = this.debugGetMonthlyQuotes.bind(this)
        this.debugGetAllPositions = this.debugGetAllPositions.bind(this)
        this.onBaselineChange = this.onBaselineChange.bind(this)
        this.onShowStocksChange = this.onShowStocksChange.bind(this)
        this.changeSort = this.changeSort.bind(this)
    }

    async componentDidMount() {
        // this.getCurrentQuotes(this.state.allStocks)
        this.debugGetCurrentQuotes(this.state.allStocks)
        this.debugGetMonthlyQuotes(this.state.allStocks)
        this.debugGetAllPositions(this.state.allStocks)
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
            newQuote['current_price'] = (Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2)
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
            newQuote['current_price'] = parseFloat((Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2))
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

    debugGetAllPositions() {
        let newPositions = {}
        let transactions = require('./api/sample_transactions.json').sample_transactions
        Object.keys(transactions).forEach(function(ticker) {
            let newPosition = {}
            newPosition['symbol'] = ticker
            let current_shares = transactions[ticker].reduce(function (total, current_val) {
               return total + current_val['shares_added']
            }, 0)
            let outflows = transactions[ticker].reduce(function (total, current_val) {
               return (current_val['dollars_spent'] > 0) ? total + current_val['dollars_spent'] : total
            }, 0)
            let inflows = -1 * transactions[ticker].reduce(function (total, current_val) {
               return (current_val['dollars_spent'] < 0) ? total + current_val['dollars_spent'] : total
            }, 0)
            newPosition['current_shares'] = current_shares
            newPosition['basis'] = Math.round((outflows > inflows) ? outflows - inflows : 0)
            newPosition['realized_gains'] = Math.round((inflows > outflows || current_shares === 0) ? inflows - outflows : 0)
            newPositions[ticker] = newPosition
        })
        this.setState({ currentPositions: newPositions })
    }

    onBaselineChange(event) {
        this.setState({ performance_baseline: event.target.value })
    }

    onShowStocksChange(event) {
        this.setState({ show_which_stocks: event.target.value })
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

        let self = this

        let allPerformanceNumbers = {}
        Object.keys(this.state.allCurrentQuotes).forEach(function(ticker) {
            let newPerformanceNumbers = {}

            let ticker_now = self.state.allMonthlyQuotes[ticker]['monthly_prices'][0]
            let ticker_prev_short = self.state.allMonthlyQuotes[ticker]['monthly_prices'][5]
            let ticker_prev_medium = self.state.allMonthlyQuotes[ticker]['monthly_prices'][11]
            let ticker_prev_long = self.state.allMonthlyQuotes[ticker]['monthly_prices'][23]
            let ticker_perf_short = (ticker_now - ticker_prev_short) / ticker_now
            let ticker_perf_medium = (ticker_now - ticker_prev_medium) / ticker_now
            let ticker_perf_long = (ticker_now - ticker_prev_long) / ticker_now

            let baseline_now = self.state.allMonthlyQuotes['S&P500']['monthly_prices'][0]
            let baseline_prev_short = self.state.allMonthlyQuotes['S&P500']['monthly_prices'][5]
            let baseline_prev_medium = self.state.allMonthlyQuotes['S&P500']['monthly_prices'][11]
            let baseline_prev_long = self.state.allMonthlyQuotes['S&P500']['monthly_prices'][23]
            let baseline_perf_short = (baseline_now - baseline_prev_short) / baseline_now
            let baseline_perf_medium = (baseline_now - baseline_prev_medium) / baseline_now
            let baseline_perf_long = (baseline_now - baseline_prev_long) / baseline_now

            if (self.state.performance_baseline === 'sp500_pct_gain') {
                newPerformanceNumbers['short_change_pct'] = ticker_perf_short - baseline_perf_short
                newPerformanceNumbers['medium_change_pct'] = ticker_perf_medium - baseline_perf_medium
                newPerformanceNumbers['long_change_pct'] = ticker_perf_long - baseline_perf_long
            } else {
                newPerformanceNumbers['short_change_pct'] = ticker_perf_short
                newPerformanceNumbers['medium_change_pct'] = ticker_perf_medium
                newPerformanceNumbers['long_change_pct'] = ticker_perf_long
            }

            Object.keys(newPerformanceNumbers).forEach(function(key) {
                newPerformanceNumbers[key] = parseFloat((Math.round(10 * 100 * newPerformanceNumbers[key]) / 10).toFixed(1))
            })
            allPerformanceNumbers[ticker] = newPerformanceNumbers
        })

        let total_value = Object.entries(this.state.currentPositions).reduce(function (total, current_val) {
            if (self.state.allCurrentQuotes.hasOwnProperty(current_val[0])) {
                return total + current_val[1]['current_shares'] * self.state.allCurrentQuotes[current_val[0]]['current_price']
            } else {
                return total
            }
        }, 0)

        let sort_column = self.state.sort_column
        let quote_columns = ['symbol', 'current_price', 'change_pct', 'volume', 'dollar_volume']
        let holdings_columns = ['current_shares', 'current_value', 'percent_value', 'basis', 'realized_gains']
        let performance_columns = ['short_change_pct', 'medium_change_pct', 'long_change_pct']
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_tickers = Object.keys(this.state.allCurrentQuotes).sort(function(a, b) {
            let value_a, value_b
            if (quote_columns.includes(sort_column)) {
                if (self.state.allCurrentQuotes.hasOwnProperty(a) && self.state.allCurrentQuotes.hasOwnProperty(b)) {
                    if (sort_column === 'dollar_volume') {
                        value_a = self.state.allCurrentQuotes[a]['current_price'] * self.state.allCurrentQuotes[a]['volume']
                        value_b = self.state.allCurrentQuotes[b]['current_price'] * self.state.allCurrentQuotes[b]['volume']
                    } else {
                        value_a = self.state.allCurrentQuotes[a][sort_column]
                        value_b = self.state.allCurrentQuotes[b][sort_column]
                    }
                } 
            } else if (performance_columns.includes(sort_column)) {
                if (self.state.allMonthlyQuotes.hasOwnProperty(a) && self.state.allMonthlyQuotes.hasOwnProperty(b)) {
                    value_a = allPerformanceNumbers[a][sort_column]
                    value_b = allPerformanceNumbers[b][sort_column]
                }
            } else if (holdings_columns.includes(sort_column)) {
                if (self.state.currentPositions.hasOwnProperty(a)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(a)) {
                            value_a = self.state.currentPositions[a]['current_shares'] * self.state.allCurrentQuotes[a]['current_price']
                        } else {
                            value_a = 0
                        }
                    } else {
                        value_a = self.state.currentPositions[a][sort_column]
                    }
                } else {
                    value_a = 0
                }
                if (self.state.currentPositions.hasOwnProperty(b)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(b)) {
                            value_b = self.state.currentPositions[b]['current_shares'] * self.state.allCurrentQuotes[b]['current_price']
                        } else {
                            value_b = 0
                        }
                    } else {
                        value_b = self.state.currentPositions[b][sort_column]
                    }
                } else {
                    value_b = 0
                }
            } else {
                return 0
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

            return 0
        })
        let filtered_sorted_tickers = [...sorted_tickers]
        if (this.state.show_which_stocks === 'holdings_only') {
            filtered_sorted_tickers = sorted_tickers.filter(ticker => this.state.currentPositions.hasOwnProperty(ticker) && this.state.currentPositions[ticker]['current_shares'])
        }

        return (
            <div id="page-wrapper">
                <div id="page-controls">
                    <label>
                        Performance Baseline:
                        <select value={this.state.baseline} onChange={this.onBaselineChange}>
                            <option value="zero_pct_gain">0% gain</option>
                            <option value="sp500_pct_gain">SP&amp;500 Index</option>
                        </select>
                    </label>
                    <label>
                        Show Stocks:
                        <select value={this.state.show_which_stocks} onChange={this.onShowStocksChange}>
                            <option value="holdings_only">holdings only</option>
                            <option value="all_stocks">all stocks</option>
                        </select>
                    </label>
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th onClick={ (e) => this.changeSort('symbol') }>Symbol{ sort_column === 'symbol' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('current_shares') }>Shares{ sort_column === 'current_shares' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('current_price') }>Price{ sort_column === 'current_price' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('current_value') }>Value{ sort_column === 'current_value' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('percent_value') }>Pct Value{ sort_column === 'percent_value' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('basis') }>Basis{ sort_column === 'basis' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('realized_gains') }>Realized{ sort_column === 'realized_gains' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('change_pct') }>Change{ sort_column === 'change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('volume') }>Volume{ sort_column === 'volume' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('dollar_volume') }>Dollar Vol (M){ sort_column === 'dollar_volume' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('short_change_pct') }>6-month{ sort_column === 'short_change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('medium_change_pct') }>1-year{ sort_column === 'medium_change_pct' ? sort_triangle : '' }</th>
                            <th onClick={ (e) => this.changeSort('long_change_pct') }>2-year{ sort_column === 'long_change_pct' ? sort_triangle : '' }</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_sorted_tickers.map(ticker => (
                            <PositionRow 
                                key={ticker}
                                current_position={this.state.currentPositions[ticker]}
                                current_quote={this.state.allCurrentQuotes[ticker]}
                                performance_numbers={allPerformanceNumbers[ticker]}
                                total_value = {total_value}
                                ticker_is_index={this.tickerIsIndex}
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}