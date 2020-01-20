import React from 'react'
import { PositionRow } from './components/PositionRow'
import { AddGroup } from './components/AddGroup'
import { AddTicker } from './components/AddTicker'


const zero_performance = { short: 0, medium: 0, long: 0 }

export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            allIndiciesTickers: [ 'INX' ],
            allIndiciesAliases: [ 'S&P500' ],
            allStocks: [],
            allCurrentQuotes: {},
            allMonthlyQuotes: {},
            allPositions: {},
            allGroups: {
                watch: []
            },
            performance_baseline: 'zero_pct_gain',
            performance_baseline_numbers: {},
            index_performance: {},
            allPerformanceNumbers: {},
            show_which_stocks: 'all_stocks',
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.onBaselineChange = this.onBaselineChange.bind(this)
        this.onShowStocksChange = this.onShowStocksChange.bind(this)
        this.onChangeSort = this.onChangeSort.bind(this)
        this.onNewGroups = this.onNewGroups.bind(this)
        this.onNewTickers = this.onNewTickers.bind(this)
        this.onRemoveFromGroup = this.onRemoveFromGroup.bind(this)
    }

    componentDidMount() {

        const stored_performance_baseline = JSON.parse(localStorage.getItem("performance_baseline"))
        if (stored_performance_baseline !== null) {
            this.setState({ performance_baseline: stored_performance_baseline })
        }

        const stored_show_which_stocks = JSON.parse(localStorage.getItem("show_which_stocks"))
        if (stored_show_which_stocks !== null) {
            this.setState({ show_which_stocks: stored_show_which_stocks })
        }

        const stored_sort_column = JSON.parse(localStorage.getItem("sort_column"))
        if (stored_sort_column !== null) {
            this.setState({ sort_column: stored_sort_column })
        }

        const stored_sort_dir_asc = JSON.parse(localStorage.getItem("sort_dir_asc"))
        if (stored_sort_dir_asc !== null) {
            this.setState({ sort_dir_asc: stored_sort_dir_asc })
        }

        const stored_allGroups = JSON.parse(localStorage.getItem("allGroups"))
        if (stored_allGroups !== null) {
            this.setState({ allGroups: stored_allGroups })
        }

        let self = this

        let indexed_transaction_data = require('./api/sample_transactions.json').sample_transactions

        let raw_current_quote_data = require('./api/sample_current_quotes.json').sample_current_quotes
        let indexed_current_quote_data = {}
        raw_current_quote_data.forEach(function(raw_quote) {
            let adjusted_ticker = self.convertNameForIndicies(raw_quote['Global Quote']['01. symbol'])
            indexed_current_quote_data[adjusted_ticker] = raw_quote
        })

        let raw_monthly_quote_data = require('./api/sample_monthly_quotes.json').sample_monthly_quotes
        let indexed_monthly_quote_data = {}
        let index_performance = {}
        raw_monthly_quote_data.forEach(function(raw_quote) {
            let adjusted_ticker = self.convertNameForIndicies(raw_quote['Meta Data']['2. Symbol'])
            indexed_monthly_quote_data[adjusted_ticker] = raw_quote
            if (adjusted_ticker === 'S&P500') {
                let quoteTimeSeries = indexed_monthly_quote_data[adjusted_ticker]['Monthly Adjusted Time Series']
                let monthly_prices = Object.entries(quoteTimeSeries).map(price => parseFloat(price[1]['5. adjusted close']))
                let now = monthly_prices[0]
                let prev_short = monthly_prices[5]
                let prev_medium = monthly_prices[11]
                let prev_long = monthly_prices[23]
                index_performance['short'] = (now - prev_short) / now * 100
                index_performance['medium'] = (now - prev_medium) / now * 100
                index_performance['long'] = (now - prev_long) / now * 100
            }
        })
        if (stored_performance_baseline !== 'sp500_pct_gain') {
            this.setState({ performance_baseline_numbers: index_performance })
        } else {
            this.setState({ performance_baseline_numbers: zero_performance })
        }
        this.setState({ index_performance: index_performance })

        let all_stocks = []
        Object.keys(indexed_transaction_data).forEach(function(ticker) {
            if (!all_stocks.includes(ticker)) {
                all_stocks.push(ticker)
            }
        })
        Object.keys(indexed_current_quote_data).forEach(function(ticker) {
            if (!all_stocks.includes(ticker)) {
                all_stocks.push(ticker)
            }
        })
        Object.keys(indexed_monthly_quote_data).forEach(function(ticker) {
            if (!all_stocks.includes(ticker)) {
                all_stocks.push(ticker)
            }
        })

        let newPositions = {}
        let newCurrentQuotes = {}
        let newMonthlyQuotes = {}
        let newPerformanceNumbers = {}

        all_stocks.forEach(function(ticker) {

            // get position
            if (indexed_transaction_data.hasOwnProperty(ticker)) {
                let newPosition = {}
                newPosition['symbol'] = ticker
                let current_shares = indexed_transaction_data[ticker].reduce(function (total, current_val) {
                return total + current_val['shares_added']
                }, 0)
                let outflows = indexed_transaction_data[ticker].reduce(function (total, current_val) {
                return (current_val['dollars_spent'] > 0) ? total + current_val['dollars_spent'] : total
                }, 0)
                let inflows = -1 * indexed_transaction_data[ticker].reduce(function (total, current_val) {
                return (current_val['dollars_spent'] < 0) ? total + current_val['dollars_spent'] : total
                }, 0)
                newPosition['current_shares'] = current_shares
                newPosition['basis'] = Math.round((outflows > inflows) ? outflows - inflows : 0)
                newPosition['realized_gains'] = Math.round((inflows > outflows || current_shares === 0) ? inflows - outflows : 0)
                newPositions[ticker] = newPosition
            } else {
                newPositions[ticker] = null
            }

            // get current quote
            if (indexed_current_quote_data.hasOwnProperty(ticker)) {
                let newCurrentQuote = {}
                let quoteResult = indexed_current_quote_data[ticker]['Global Quote']
                newCurrentQuote['symbol'] = ticker
                newCurrentQuote['current_price'] = parseFloat((Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2))
                newCurrentQuote['change'] = parseFloat((Math.round(100 * parseFloat(quoteResult['09. change'])) / 100).toFixed(2))
                newCurrentQuote['change_pct'] = parseFloat((Math.round(100 * parseFloat(quoteResult['10. change percent'].slice(0, -1))) / 100).toFixed(2))
                newCurrentQuote['volume'] = parseInt(quoteResult['06. volume'])
                newCurrentQuotes[ticker] = newCurrentQuote
            } else {
                newCurrentQuotes[ticker] = null
            }

            // get monthly quote
            if (indexed_monthly_quote_data.hasOwnProperty(ticker)) {
                let newMonthlyQuote = {}
                let quoteTimeSeries = indexed_monthly_quote_data[ticker]['Monthly Adjusted Time Series']
                newMonthlyQuote['symbol'] = ticker
                newMonthlyQuote['monthly_prices'] = Object.entries(quoteTimeSeries).map(price => parseFloat(price[1]['5. adjusted close']))
                newMonthlyQuotes[ticker] = newMonthlyQuote

                // calculate performance
                let newPerformance = {}
                let ticker_now = newMonthlyQuote['monthly_prices'][0]
                let ticker_prev_short = newMonthlyQuote['monthly_prices'][5]
                let ticker_prev_medium = newMonthlyQuote['monthly_prices'][11]
                let ticker_prev_long = newMonthlyQuote['monthly_prices'][23]
                let ticker_perf_short = (ticker_now - ticker_prev_short) / ticker_now * 100
                let ticker_perf_medium = (ticker_now - ticker_prev_medium) / ticker_now * 100
                let ticker_perf_long = (ticker_now - ticker_prev_long) / ticker_now * 100
                if (stored_performance_baseline === 'sp500_pct_gain') {
                    newPerformance['short_change_pct'] = ticker_perf_short - index_performance.short
                    newPerformance['medium_change_pct'] = ticker_perf_medium - index_performance.medium
                    newPerformance['long_change_pct'] = ticker_perf_long - index_performance.long
                } else {
                    newPerformance['short_change_pct'] = ticker_perf_short
                    newPerformance['medium_change_pct'] = ticker_perf_medium
                    newPerformance['long_change_pct'] = ticker_perf_long
                }
                newPerformanceNumbers[ticker] = newPerformance
            } else {
                newPerformanceNumbers[ticker] = null
            }
        })

        this.setState({ allStocks: all_stocks,
                        allPositions: newPositions,
                        allCurrentQuotes: newCurrentQuotes,
                        allMonthlyQuotes: newMonthlyQuotes,
                        allPerformanceNumbers: newPerformanceNumbers })

    }

    // FIXME: disable these parallel API calls during development due to the API quota limits
    // getQuoteUrl(ticker) {
    //     //let alpha_vantage_api_key = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY
    //     let alpha_vantage_api_key = 'demo' // FIXME: default to demo key and MSFT, not rate-limited 
    //     let url_prefix = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
    //     let url_suffix = '&apikey=' + alpha_vantage_api_key
    //     return url_prefix + ticker + url_suffix
    // }
    // 
    // async getCurrentQuotes(tickers) {
    //     let newQuotes = {}
    //     const quotesApiResults = await Promise.all(tickers.map(ticker =>
    //         fetch(this.getQuoteUrl(ticker))
    //         .then(res => res.json())
    //     ))
    //     quotesApiResults.forEach(function(item, idx) {
    //         let quoteResult = item['Global Quote']
    //         let newQuote = {}
    //         let ticker = quoteResult['01. symbol'] + idx
    //         newQuote['symbol'] = this.convertNameForIndicies(ticker)
    //         newQuote['current_price'] = (Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2)
    //         newQuote['change'] = (Math.round(100 * parseFloat(quoteResult['09. change'])) / 100).toFixed(2)
    //         newQuote['change_pct'] = (Math.round(100 * parseFloat(quoteResult['10. change percent'].slice(0, -1))) / 100).toFixed(2)
    //         newQuote['volume'] = parseInt(quoteResult['06. volume'])
    //         newQuotes[ticker] = newQuote
    //     })
    //     this.setState({ allCurrentQuotes: newQuotes })
    // }

    onBaselineChange(event) {
        let new_baseline = event.target.value
        localStorage.setItem('performance_baseline', JSON.stringify(new_baseline))

        let new_baseline_numbers = (new_baseline === 'sp500_pct_gain') ? this.state.index_performance : zero_performance
        this.setState({ performance_baseline: new_baseline })
        this.setState({ performance_baseline_numbers: new_baseline_numbers })
    }

    onShowStocksChange(event) {
        let new_show_which_stocks = event.target.value
        this.setState({ show_which_stocks: new_show_which_stocks })
        localStorage.setItem('show_which_stocks', JSON.stringify(new_show_which_stocks))
    }

    onChangeSort(new_sort_column) {
        if (new_sort_column === this.state.sort_column) {
            localStorage.setItem('sort_dir_asc', JSON.stringify(!this.state.sort_dir_asc))
            this.setState(prevState => ({
                sort_dir_asc: !prevState.sort_dir_asc
            }))
        }
        localStorage.setItem('sort_column', JSON.stringify(new_sort_column))
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

    onNewGroups(new_groups) {
        this.setState(prevState => {
            let newAllGroups = Object.assign({}, prevState.allGroups)
            new_groups.forEach(function(group) {
                let newGroup = []
                if (!newAllGroups.hasOwnProperty(group)) {
                    newAllGroups[group] = newGroup
                }
            })
            localStorage.setItem('allGroups', JSON.stringify(newAllGroups))
            return { allGroups: newAllGroups }
        })
    }

    onNewTickers(group, new_tickers) {
        this.setState(prevState => {
            let newAllGroups = Object.assign({}, prevState.allGroups)
            new_tickers.forEach(function(ticker) {
                if (!newAllGroups[group].includes(ticker)) {
                    newAllGroups[group].push(ticker)
                }
            })
            localStorage.setItem('allGroups', JSON.stringify(newAllGroups))
            return { allGroups: newAllGroups }
        })
    }

    onRemoveFromGroup(event, remove_from_group, remove_ticker) {
        this.setState(prevState => {
            let newAllGroups = Object.assign({}, prevState.allGroups)
            newAllGroups[remove_from_group] = newAllGroups[remove_from_group].filter(ticker => ticker !== remove_ticker)

            localStorage.setItem('allGroups', JSON.stringify(newAllGroups))
            return { allGroups: newAllGroups }
        })
    }


    render() {

        let self = this

        let total_value = Object.entries(this.state.allPositions).filter(position => position[1] !== null).reduce(function (total, current_val) {
            if (self.state.allCurrentQuotes[current_val[0]] !== null) {
                return total + current_val[1]['current_shares'] * self.state.allCurrentQuotes[current_val[0]]['current_price']
            } else {
                return total
            }
        }, 0)

        let sort_column = self.state.sort_column
        let quote_columns = ['symbol', 'current_price', 'change_pct', 'volume', 'dollar_volume']
        let holdings_columns = ['current_shares', 'current_value', 'percent_value', 'basis', 'realized_gains', 'percent_gains']
        let performance_columns = ['short_change_pct', 'medium_change_pct', 'long_change_pct']
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_tickers = Object.keys(this.state.allPositions).sort(function(a, b) {
            let value_a, value_b
            if (quote_columns.includes(sort_column)) {
                if (self.state.allCurrentQuotes[a] !== null && self.state.allCurrentQuotes[b] !== null) {
                    if (sort_column === 'dollar_volume') {
                        value_a = self.state.allCurrentQuotes[a]['current_price'] * self.state.allCurrentQuotes[a]['volume']
                        value_b = self.state.allCurrentQuotes[b]['current_price'] * self.state.allCurrentQuotes[b]['volume']
                    } else {
                        value_a = self.state.allCurrentQuotes[a][sort_column]
                        value_b = self.state.allCurrentQuotes[b][sort_column]
                    }
                } 
            } else if (performance_columns.includes(sort_column)) {
                if (self.state.allMonthlyQuotes[a] !== null && self.state.allMonthlyQuotes[b] !== null) {
                    value_a = self.state.allPerformanceNumbers[a][sort_column]
                    value_b = self.state.allPerformanceNumbers[b][sort_column]
                }
            } else if (holdings_columns.includes(sort_column)) {
                let positionvalue_a, positionvalue_b
                if (self.state.allPositions[a] !== null) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_gains') {
                        if (self.state.allCurrentQuotes[a] !== null && self.state.allPositions[a]['current_shares']) {
                            positionvalue_a = self.state.allPositions[a]['current_shares'] * self.state.allCurrentQuotes[a]['current_price']
                            if (sort_column === 'percent_gains') {
                                let basis_a = self.state.allPositions[a]['basis']
                                value_a = (basis_a >= 0) ? 1 - (basis_a / positionvalue_a) : 'losing'
                            } else {
                                value_a = positionvalue_a
                            }
                        } else {
                            value_a = 'n/a'
                        }
                    } else if (self.state.allPositions[a]['current_shares'] || sort_column === 'realized_gains') {
                        value_a = self.state.allPositions[a][sort_column]
                    } else {
                        value_a = 'n/a'
                    }
                } else {
                    value_a = 'n/a'
                }
                if (self.state.allPositions[b] !== null) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_gains') {
                        if (self.state.allCurrentQuotes[b] !== null && self.state.allPositions[b]['current_shares']) {
                            positionvalue_b = self.state.allPositions[b]['current_shares'] * self.state.allCurrentQuotes[b]['current_price']
                            if (sort_column === 'percent_gains' && positionvalue_b !== 0) {
                                let basis_b = self.state.allPositions[b]['basis']
                                value_b = (basis_b >= 0) ? 1 - (basis_b / positionvalue_b) : 'losing'
                            } else {
                                value_b = positionvalue_b
                            }
                        } else {
                            value_b = 'n/a'
                        }
                    } else if (self.state.allPositions[b]['current_shares'] || sort_column === 'realized_gains') {
                        value_b = self.state.allPositions[b][sort_column]
                    } else {
                        value_b = 'n/a'
                    }
                } else {
                    value_b = 'n/a'
                }
            } else {
                return 0
            }
                
            if (value_a === value_b) {
                return 0
            }
            if (self.state.sort_dir_asc === true) {
                if (value_a === 'n/a') {
                    return 1
                }
                if (value_b === 'n/a') {
                    return -1
                }
                if (value_a < value_b) {
                    return -1
                }
                if (value_a > value_b) {
                    return 1
                }
            } else {
                if (value_a === 'n/a') {
                    return 1
                }
                if (value_b === 'n/a') {
                    return -1
                }
                if (value_a < value_b) {
                    return 1
                }
                if (value_a > value_b) {
                    return -1
                }
            }
            return 0
        })

        function getHoldings() {
            return self.state.allStocks.filter(ticker => self.state.allPositions[ticker] !== null && self.state.allPositions[ticker]['current_shares'])
        }
        function getIndicies() {
            return self.state.allIndiciesAliases
        }
        function getWatchList() {
            return self.state.allGroups.watch.filter(ticker => self.state.allPositions[ticker] === null || !self.state.allPositions[ticker]['current_shares'])
        }

        let filtered_sorted_tickers = [...sorted_tickers]
        if (this.state.show_which_stocks === 'holdings_only') {
            filtered_sorted_tickers = sorted_tickers.filter(ticker => [...getHoldings()].includes(ticker))
        } else if (this.state.show_which_stocks === 'holdings_and_index') {
            filtered_sorted_tickers = sorted_tickers.filter(ticker => [...getHoldings(), ...getIndicies()].includes(ticker))
        } else if (this.state.show_which_stocks === 'holdings_and_watchlist_and_index') {
            filtered_sorted_tickers = sorted_tickers.filter(ticker => [...getHoldings(), ...getWatchList(), ...getIndicies()].includes(ticker))
        } else if (this.state.show_which_stocks === 'watchlist_only') {
            filtered_sorted_tickers = sorted_tickers.filter(ticker => [...getWatchList()].includes(ticker))
        }

        let all_columns = {
            'symbol': {
                variable_name: 'symbol',
                display_name: 'Symbol',
                variable_type: 'string'
            },
            'current_shares': {
                variable_name: 'current_shares',
                display_name: 'Shares',
                variable_type: 'number',
                num_decimals: 0
            },
            'current_price': {
                variable_name: 'current_price',
                display_name: 'Price',
                variable_type: 'currency',
                num_decimals: 2
            },
            'current_value': {
                variable_name: 'current_value',
                display_name: 'Value',
                variable_type: 'currency',
                num_decimals: 0
            },
            'percent_value': {
                variable_name: 'percent_value',
                display_name: 'Pct Value',
                variable_type: 'percentage',
                num_decimals: 1
            },
            'basis': {
                variable_name: 'basis',
                display_name: 'Basis',
                variable_type: 'currency',
                num_decimals: 0
            },
            'percent_gains': {
                variable_name: 'percent_gains',
                display_name: 'Pct Gains',
                variable_type: 'percentage',
                num_decimals: 1
            },
            'realized_gains': {
                variable_name: 'realized_gains',
                display_name: 'Realized',
                variable_type: 'currency',
                num_decimals: 0
            },
            'change_pct': {
                variable_name: 'change_pct',
                display_name: 'Change',
                variable_type: 'percentage',
                num_decimals: 2
            },
            'volume': {
                variable_name: 'volume',
                display_name: 'Volume',
                variable_type: 'number',
                num_decimals: 0
            },
            'dollar_volume': {
                variable_name: 'dollar_volume',
                display_name: 'Dollar Vol (M)',
                variable_type: 'currency',
                scaling_power: -6,
                num_decimals: 0
            },
            'short_change_pct': {
                variable_name: 'short_change_pct',
                display_name: '6-month',
                variable_type: 'percentage',
                num_decimals: 1
            },
            'medium_change_pct': {
                variable_name: 'medium_change_pct',
                display_name: '1-year',
                variable_type: 'percentage',
                num_decimals: 1
            },
            'long_change_pct': {
                variable_name: 'long_change_pct',
                display_name: '2-year',
                variable_type: 'percentage',
                num_decimals: 1
            }
        }
        // let display_column_order = Object.keys(all_columns)
        let display_column_order = ['symbol', 'current_value', 'percent_value', 'percent_gains', 'short_change_pct', 'medium_change_pct', 'long_change_pct']
        let display_columns = display_column_order.map(column_variable => all_columns[column_variable])

        return (
            <div id="page-wrapper">
                <div id="page-controls">
                    <label>
                        Performance Baseline:
                        <select value={this.state.performance_baseline} onChange={this.onBaselineChange}>
                            <option value="zero_pct_gain">0% gain</option>
                            <option value="sp500_pct_gain">SP&amp;500 Index</option>
                        </select>
                    </label>
                    <label>
                        Show Stocks:
                        <select value={this.state.show_which_stocks} onChange={this.onShowStocksChange}>
                            <option value="all_stocks">all stocks</option>
                            <option value="watchlist_only">watch list only</option>
                            <option value="holdings_and_index">holdings and index</option>
                            <option value="holdings_and_watchlist_and_index">holdings and watch and index</option>
                            <option value="holdings_only">holdings only</option>
                        </select>
                    </label>
                    <AddGroup
                        all_groups={this.state.allGroups}
                        on_new_groups={this.onNewGroups}
                    />
                    <AddTicker
                        all_stocks={this.state.allStocks}
                        all_groups={this.state.allGroups}
                        on_new_tickers={this.onNewTickers}
                    />
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Groups</th>
                            {display_columns.map(column => (
                            <th key={ column.variable_name} onClick={ (e) => this.onChangeSort(column.variable_name) }>{ column.display_name }{ sort_column === column.variable_name ? sort_triangle : '' }</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_sorted_tickers.map(ticker => (
                            <PositionRow 
                                key={ticker}
                                columns={display_columns}
                                all_groups={this.state.allGroups}
                                current_position={this.state.allPositions[ticker]}
                                current_quote={this.state.allCurrentQuotes[ticker]}
                                performance_numbers={this.state.allPerformanceNumbers[ticker]}
                                performance_baseline={this.state.performance_baseline}
                                performance_baseline_numbers={this.state.performance_baseline_numbers}
                                total_value = {total_value}
                                ticker_is_index={this.tickerIsIndex}
                                on_remove_from_group={this.onRemoveFromGroup}
                        />))}
                    </tbody>
                </table>
            </div>
        )
    }

}