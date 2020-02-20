import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { GridHeaderRow } from './components/GridHeaderRow'
import { GridRow } from './components/GridRow'
import { GridRowTotals } from './components/GridRowTotals'
import { InputForms } from './components/InputForms'
import { Popover } from 'react-bootstrap'
import { OverlayTrigger } from 'react-bootstrap'


const all_columns = [
    {
        name: 'symbol',
        display_name: 'Symbol',
        type: 'string'
    },
    {
        name: 'current_shares',
        display_name: 'Shares',
        type: 'number',
        num_decimals: 0
    },
    {
        name: 'whatif_current_shares',
        display_name: 'What-If Shares',
        type: 'number',
        num_decimals: 0
    },
    {
        name: 'current_price',
        display_name: 'Price',
        type: 'currency',
        num_decimals: 2
    },
    {
        name: 'current_value',
        display_name: 'Value',
        type: 'currency',
        num_decimals: 0
    },
    {
        name: 'whatif_current_value',
        display_name: 'What-If Value',
        type: 'currency',
        num_decimals: 0
    },
    {
        name: 'percent_value',
        display_name: 'Pct of Total Value',
        type: 'percentage',
        num_decimals: 1
    },
    {
        name: 'basis',
        display_name: 'Basis',
        type: 'currency',
        num_decimals: 0
    },
    {
        name: 'whatif_basis',
        display_name: 'What-If Basis',
        type: 'currency',
        num_decimals: 0
    },
    {
        name: 'percent_basis',
        display_name: 'Pct of Total Basis',
        type: 'percentage',
        num_decimals: 1
    },
    {
        name: 'percent_profit',
        display_name: 'Pct Profit',
        type: 'percentage',
        passthrough_strings: true,
        num_decimals: 1
    },
    {
        name: 'realized_gains',
        display_name: 'Realized',
        type: 'currency',
        num_decimals: 0
    },
    {
        name: 'risk_factor',
        display_name: 'Risk Factor',
        type: 'number',
        num_decimals: 2
    },
    {
        name: 'at_risk',
        display_name: 'At Risk',
        type: 'currency',
        num_decimals: 0
    },
    // this column is too short-term ;-P
    // {
    //     name: 'change_pct',
    //     display_name: 'Change',
    //     type: 'percentage',
    //     num_decimals: 2
    // },
    {
        name: 'volume',
        display_name: 'Volume',
        type: 'number',
        num_decimals: 0
    },
    {
        name: 'dollar_volume',
        display_name: 'Dollar Vol (M)',
        type: 'currency',
        scaling_power: -6,
        num_decimals: 0
    },
    {
        name: 'short_change_pct',
        display_name: '6-month',
        type: 'percentage',
        num_decimals: 1
    },
    {
        name: 'medium_change_pct',
        display_name: '1-year',
        type: 'percentage',
        num_decimals: 1
    },
    {
        name: 'long_change_pct',
        display_name: '2-year',
        type: 'percentage',
        num_decimals: 1
    }
]

const default_shown_columns = ['symbol', 'current_shares', 'current_value', 'percent_value', 'percent_basis', 'percent_profit', 'short_change_pct', 'medium_change_pct', 'long_change_pct']

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
            allTransactions: {},
            allTags: {
                'untagged': []
            },
            allPerformanceNumbers: {},
            allRisk: {},
            allWhatifs: {},

            whatif_format: 'deltas', // deltas | new_values
            balance_target_set: 'my_holdings',
            balance_target_column: '',
            remaining_cash: null,
            status_messages: [],
            baseline: {
                name: 'zero_pct_gain',
                short_change_pct: 0,
                medium_change_pct: 0,
                long_change_pct: 0,
            },
            editing_row: null,

            aggrPerformance: {},
            aggrBasis: {},
            aggrRealized: {},
            aggrTotalValue: {},

            show_holdings: true,
            show_tagged: true,
            show_untagged: true,
            show_index: false,
            show_cash: false,
            show_aggregates: true,
            sort_column: 'symbol',
            sort_dir_asc: true,
            shown_columns: [],

            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getPositionFromTransactions = this.getPositionFromTransactions.bind(this)
        this.getPositionFromCashTransactions = this.getPositionFromCashTransactions.bind(this)
        this.calculateAggrPositionInfo = this.calculateAggrPositionInfo.bind(this)
        this.calculateAggrPerformance = this.calculateAggrPerformance.bind(this)
        this.populateSymbolCount = this.populateSymbolCount.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onShowInputChange = this.onShowInputChange.bind(this)
        this.onChangeWhatifFormat = this.onChangeWhatifFormat.bind(this)
        this.onChangeSort = this.onChangeSort.bind(this)
        this.showColumns = this.showColumns.bind(this)
        this.onToggleShowColumn = this.onToggleShowColumn.bind(this)
        this.onNewTransaction = this.onNewTransaction.bind(this)
        this.onNewCash = this.onNewCash.bind(this)
        this.onNewTags = this.onNewTags.bind(this)
        this.onNewTickers = this.onNewTickers.bind(this)
        this.onRemoveFromTag = this.onRemoveFromTag.bind(this)
        this.onDeleteTicker = this.onDeleteTicker.bind(this)
        this.onDeleteTag = this.onDeleteTag.bind(this)
        this.onEditCell = this.onEditCell.bind(this)
        this.onModifyRiskFactor = this.onModifyRiskFactor.bind(this)
        this.onEscapeKey = this.onEscapeKey.bind(this)
        this.onNewMessages = this.onNewMessages.bind(this)
        this.getCurrentValue = this.getCurrentValue.bind(this)
        this.getCurrentShares = this.getCurrentShares.bind(this)
        this.getBasis = this.getBasis.bind(this)
        this.getBalanceableValue = this.getBalanceableValue.bind(this)
        this.onWhatifSubmit = this.onWhatifSubmit.bind(this)
        this.onWhatifGo = this.onWhatifGo.bind(this)
        this.getIndicies = this.getIndicies.bind(this)
        this.getHoldings = this.getHoldings.bind(this)
        this.getAdded = this.getAdded.bind(this)
        this.getTagged = this.getTagged.bind(this)
        this.getUntagged = this.getUntagged.bind(this)
        this.nameIsAnAggregate = this.nameIsAnAggregate.bind(this)
        this.nameIsSpecial = this.nameIsSpecial.bind(this)
        this.sortTickers = this.sortTickers.bind(this)
    }

    componentDidMount() {

        let baseline = {}
        const stored_baseline = JSON.parse(localStorage.getItem("baseline"))
        if (stored_baseline !== null) {
            baseline = Object.assign({}, stored_baseline)
        } else {
            baseline = {
                name: 'zero_pct_gain',
                short_pct_gain: 0,
                medium_pct_gain: 0,
                long_pct_gain: 0,
            }
        }

        const stored_sort_column = JSON.parse(localStorage.getItem("sort_column"))
        if (stored_sort_column !== null) {
            this.setState({ sort_column: stored_sort_column })
        }

        const stored_sort_dir_asc = JSON.parse(localStorage.getItem("sort_dir_asc"))
        if (stored_sort_dir_asc !== null) {
            this.setState({ sort_dir_asc: stored_sort_dir_asc })
        }

        const stored_whatif_format = JSON.parse(localStorage.getItem("whatif_format"))
        if (stored_whatif_format !== null) {
            this.setState({ whatif_format: stored_whatif_format })
        }

        const stored_allTags = JSON.parse(localStorage.getItem("allTags"))
        if (stored_allTags !== null) {
            this.setState({ allTags: stored_allTags })
        }

        const stored_allTransactions = JSON.parse(localStorage.getItem("allTransactions"))
        if (stored_allTransactions !== null) {
            this.setState({ allTransactions: stored_allTransactions })
        }

        const stored_allRisk = JSON.parse(localStorage.getItem("allRisk"))
        if (stored_allRisk !== null) {
            this.setState({ allRisk: stored_allRisk })
        }

        let self = this

        const view_controls = ['show_holdings', 'show_tagged', 'show_untagged', 'show_index', 'show_cash', 'show_aggregates']
        let stored_controls = {}
        view_controls.forEach(function(control) {
            stored_controls[control] = null
            const stored_control = JSON.parse(localStorage.getItem(control))
            if (stored_control !== null) {
                stored_controls[control] = stored_control
                self.setState({ [control]: stored_control })
            }
        })

        let indexed_transaction_data = {}
        if (stored_allTransactions !== null) {
            indexed_transaction_data = JSON.parse(JSON.stringify(stored_allTransactions))
        }

        let indexed_risk_data = {}
        if (stored_allRisk !== null) {
            indexed_risk_data = JSON.parse(JSON.stringify(stored_allRisk))
        }

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
                index_performance['short_change_pct'] = (now - prev_short) / now * 100
                index_performance['medium_change_pct'] = (now - prev_medium) / now * 100
                index_performance['long_change_pct'] = (now - prev_long) / now * 100
                baseline['short_change_pct'] = index_performance['short_change_pct']
                baseline['medium_change_pct'] = index_performance['medium_change_pct']
                baseline['long_change_pct'] = index_performance['long_change_pct']
                self.setState({ baseline: baseline })
                localStorage.setItem('baseline', JSON.stringify(baseline))
            }
        })

        this.setState({ index_performance: index_performance })

        let all_stocks = []
        Object.keys(indexed_transaction_data).forEach(function(ticker) {
            if (!all_stocks.includes(ticker) && ticker !== 'cash') {
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
        Object.keys(indexed_risk_data).forEach(function(ticker) {
            if (!all_stocks.includes(ticker) && ticker !== 'cash') {
                all_stocks.push(ticker)
            }
        })

        let newPositions = {}
        let newCurrentQuotes = {}
        let newMonthlyQuotes = {}
        let newPerformanceNumbers = {}
        let newRisk = {}

        all_stocks.forEach(function(ticker) {

            if (indexed_transaction_data.hasOwnProperty(ticker)) {
                let newPosition = {}
                newPosition = self.getPositionFromTransactions(indexed_transaction_data[ticker])
                newPosition['symbol'] = ticker
                newPositions[ticker] = newPosition
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
                if (baseline.name === 'sp500_pct_gain') {
                    newPerformance['short_change_pct'] = ticker_perf_short - index_performance.short_change_pct
                    newPerformance['medium_change_pct'] = ticker_perf_medium - index_performance.medium_change_pct
                    newPerformance['long_change_pct'] = ticker_perf_long - index_performance.long_change_pct
                } else {
                    newPerformance['short_change_pct'] = ticker_perf_short
                    newPerformance['medium_change_pct'] = ticker_perf_medium
                    newPerformance['long_change_pct'] = ticker_perf_long
                }
                newPerformanceNumbers[ticker] = newPerformance
            }

            // get risk factor
            let newRiskEntry = {}
            if (indexed_risk_data.hasOwnProperty(ticker)) {
                newRiskEntry['factor'] = indexed_risk_data[ticker].factor
            } else if (ticker === 'S&P500') {
                newRiskEntry['factor'] = 0.25  // based on TradeStops VQ% (range: 0 to 1), this 25% number represents medium risk
            }
            newRisk[ticker] = newRiskEntry
        })

        // quote for cash
        let cashCurrentQuote = {
            change: 0,
            change_pct: 0,
            current_price: 1,
            symbol: 'cash',
            volume: 0
        }
        newCurrentQuotes['cash'] = cashCurrentQuote

        // performance for cash
        let cashPerformance = {
            short_change_pct: 0,
            medium_change_pct: 0,
            long_change_pct: 0,
        }
        newPerformanceNumbers['cash'] = cashPerformance

        // position for cash
        if (indexed_transaction_data.hasOwnProperty('cash')) {
            let newPosition = {}
            newPosition = self.getPositionFromCashTransactions(indexed_transaction_data['cash'])
            newPosition['symbol'] = 'cash'
            newPositions['cash'] = newPosition
        }

        // risk for cash
        let newRiskEntry = {}
        newRiskEntry['factor'] = 0
        newRisk['cash'] = newRiskEntry

        let init_shown_columns = []
        const stored_shown_columns = JSON.parse(localStorage.getItem("shown_columns"))
        if (stored_shown_columns !== null) {
            init_shown_columns = [...stored_shown_columns]
        } else {
            init_shown_columns = all_columns.filter(column => default_shown_columns.includes(column.name))
        }

        let aggr_position_info = JSON.parse(JSON.stringify(this.calculateAggrPositionInfo(stored_allTags, newPositions, newCurrentQuotes, stored_controls['show_holdings'], stored_controls['show_cash'])))
        let aggr_performance = JSON.parse(JSON.stringify(this.calculateAggrPerformance(stored_allTags, newPerformanceNumbers)))

        this.setState({ allStocks: all_stocks,
                        allPositions: newPositions,
                        allCurrentQuotes: newCurrentQuotes,
                        allMonthlyQuotes: newMonthlyQuotes,
                        allPerformanceNumbers: newPerformanceNumbers,
                        allRisk: newRisk,
                        aggrBasis: aggr_position_info[0],
                        aggrRealized: aggr_position_info[1],
                        aggrTotalValue: aggr_position_info[2],
                        aggrPerformance: aggr_performance,
                        shown_columns: init_shown_columns,
                        done: true })

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

    getPositionFromTransactions(transactions) {
        let inflows = 0, outflows = 0, current_shares = 0, action, num_shares, ticker, value

        transactions.forEach(function(transaction) {
            [action, num_shares, ticker, value] = transaction.split(' ')
            num_shares = parseInt(num_shares)
            value = parseFloat(value.substr(1))
            if (action === 'buy') {
                outflows += value
                current_shares += num_shares
            } else if (action === 'sell') {
                inflows += value
                current_shares -= num_shares
            }
        })
        let newPosition = {
            symbol: ticker,
            current_shares: current_shares,
            basis: Math.round((outflows > inflows) ? outflows - inflows : 0),
            realized_gains: Math.round((inflows > outflows || current_shares === 0) ? inflows - outflows : 0)
        }

        return newPosition
    }

    getPositionFromCashTransactions(cash_transactions) {
        let total = 0, action, value

        cash_transactions.forEach(function(cash_transaction) {
            [action, value] = cash_transaction.split(' ')
            let cash_amount = parseFloat(value.substr(1))
            if (action === 'add') {
                total += cash_amount
            } else if (action === 'remove') {
                total -= cash_amount
            }
        })
        let newPosition = {
            symbol: 'cash',
            current_shares: total,
            basis: total,
            realized_gains: 0
        }

        return newPosition
    }

    calculateAggrPositionInfo(all_tags, all_positions, all_quotes, show_holdings, show_cash) {

        let holdings = (show_holdings === null) ? this.state.show_holdings : show_holdings
        let cash = (show_cash === null) ? this.state.show_cash : show_cash

        let aggr_totalbasis_by_tag = {}, aggr_totalrealized_by_tag = {}, aggr_totalvalue_by_tag = {}
        aggr_totalbasis_by_tag['_everything_'] = 0
        aggr_totalrealized_by_tag['_everything_'] = 0
        aggr_totalvalue_by_tag['_everything_'] = 0
        Object.keys(all_tags).forEach(function(tag) {
            aggr_totalrealized_by_tag[tag] = 'n/a';
            aggr_totalbasis_by_tag[tag] = 'n/a';
            aggr_totalvalue_by_tag[tag] = 'n/a';
            Object.keys(all_positions).forEach(function(ticker) {
                if (all_tags[tag].includes(ticker)) {
                    aggr_totalrealized_by_tag[tag] = 0 
                    aggr_totalbasis_by_tag[tag] = 0 
                    aggr_totalvalue_by_tag[tag] = 0 
                }
            })
        })
        Object.entries(all_positions).forEach(function(position_info) {
            let ticker = position_info[0]
            let ticker_basis = position_info[1]['basis']
            let ticker_realized_gains = position_info[1]['realized_gains']
            let ticker_shares = position_info[1]['current_shares']
            let ticker_price = all_quotes[ticker]['current_price'] || 1
            if ((ticker !== 'cash' && holdings) || (ticker === 'cash' && cash)) {
                aggr_totalbasis_by_tag['_everything_'] += ticker_basis - ticker_realized_gains
                aggr_totalrealized_by_tag['_everything_'] += ticker_realized_gains
                aggr_totalvalue_by_tag['_everything_'] += ticker_price * ticker_shares
                Object.keys(all_tags).forEach(function(tag) {
                    if (all_tags[tag].includes(ticker)) {
                        aggr_totalbasis_by_tag[tag] += ticker_basis - ticker_realized_gains
                        aggr_totalrealized_by_tag[tag] += parseFloat(ticker_realized_gains)
                        if (aggr_totalbasis_by_tag[tag] < 0) {
                            aggr_totalbasis_by_tag[tag] = 0
                        }
                        aggr_totalvalue_by_tag[tag] += ticker_price * ticker_shares
                    }
                })
            }
        })
        if (aggr_totalbasis_by_tag['_everything_'] < 0) {
            aggr_totalbasis_by_tag['_everything_'] = 0
        }

        return [aggr_totalbasis_by_tag, aggr_totalrealized_by_tag, aggr_totalvalue_by_tag]
    }

    calculateAggrPerformance(all_tags, all_performance_numbers) {

        let aggr_performance_by_tag = {}
        aggr_performance_by_tag['_everything_'] = {
            short_change_pct: 0,
            medium_change_pct: 0,
            long_change_pct: 0,
            num_tickers: 0
        }

        let all_stocks_of_interest = []
        Object.values(all_tags).forEach(function(array_of_tickers) {
            array_of_tickers.forEach(ticker => all_stocks_of_interest.push(ticker))
        })
        all_stocks_of_interest = Array.from(new Set(all_stocks_of_interest))

        all_stocks_of_interest.forEach(function(ticker) {

            let short = all_performance_numbers[ticker]['short_change_pct']
            let medium = all_performance_numbers[ticker]['medium_change_pct']
            let long = all_performance_numbers[ticker]['long_change_pct']

            aggr_performance_by_tag['_everything_'].short_change_pct += short
            aggr_performance_by_tag['_everything_'].medium_change_pct += medium
            aggr_performance_by_tag['_everything_'].long_change_pct += long
            aggr_performance_by_tag['_everything_'].num_tickers += 1

            Object.keys(all_tags).forEach(function(tag) {
                if (aggr_performance_by_tag.hasOwnProperty(tag) && all_tags[tag].includes(ticker)) {
                    aggr_performance_by_tag[tag].short_change_pct += short
                    aggr_performance_by_tag[tag].medium_change_pct += medium
                    aggr_performance_by_tag[tag].long_change_pct += long
                    aggr_performance_by_tag[tag].num_tickers += 1
                } else if (all_tags[tag].includes(ticker)) {
                    let new_aggr_performance = {}
                    new_aggr_performance['short_change_pct'] = short
                    new_aggr_performance['medium_change_pct'] = medium
                    new_aggr_performance['long_change_pct'] = long
                    new_aggr_performance['num_tickers'] = 1
                    aggr_performance_by_tag[tag] = new_aggr_performance
                }
            })
        })

        Object.entries(aggr_performance_by_tag).forEach(function(tag_performance) {
            let tag = tag_performance[0]
            let performance = tag_performance[1]
            Object.keys(performance).filter(time_range => time_range !== 'num_tickers').forEach(function(time_range) {
                let value = (performance['num_tickers']) ? performance[time_range] / performance.num_tickers : 'n/a'
                aggr_performance_by_tag[tag][time_range] = value
            })
        })

        return aggr_performance_by_tag
    }

    onInputChange(event) {
        let name = event.target.name

        if (name === 'baseline') {
            let new_baseline_name = event.target.value
            let new_baseline = {}
            new_baseline['name'] = new_baseline_name
            if (new_baseline_name === 'sp500_pct_gain') {
                new_baseline['short_change_pct'] = this.state.allPerformanceNumbers['S&P500']['short_change_pct']
                new_baseline['medium_change_pct'] = this.state.allPerformanceNumbers['S&P500']['medium_change_pct']
                new_baseline['long_change_pct'] = this.state.allPerformanceNumbers['S&P500']['long_change_pct']
            } else {
                new_baseline['short_change_pct'] = 0
                new_baseline['medium_change_pct'] = 0
                new_baseline['long_change_pct'] = 0
            }

            localStorage.setItem('baseline', JSON.stringify(new_baseline))
            this.setState({ baseline: new_baseline })
        }
    }
    
    onShowInputChange(event) {
        const target = event.target
        const new_value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        localStorage.setItem(name, JSON.stringify(new_value))

        // recalculate the aggregate numbers
        let show_cash = (name === 'show_cash') ? new_value : this.state.show_cash
        let show_holdings = (name === 'show_holdings') ? new_value : this.state.show_holdings
        let aggr_position_info = JSON.parse(JSON.stringify(
            this.calculateAggrPositionInfo(
                this.state.allTags, 
                this.state.allPositions, 
                this.state.allCurrentQuotes, 
                show_holdings,
                show_cash)))

        if (name === 'show_cash') {
            this.onWhatifGo(this.state.balance_target_set, this.state.balance_target_column, new_value, this.state.remaining_cash)
        }

        this.setState({ 
            [name]: new_value,
            aggrBasis: aggr_position_info[0],
            aggrRealized: aggr_position_info[1],
            aggrTotalValue: aggr_position_info[2],
        })
    }

    onChangeWhatifFormat() {
        let new_whatif_format = (this.state.whatif_format === 'deltas') ? 'new_values' : 'deltas'
        localStorage.setItem('whatif_format', JSON.stringify(new_whatif_format))
        this.setState({ whatif_format: new_whatif_format })
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

    showColumns(column_names) {
        this.setState(prevState => {
            let new_shown_column_names = JSON.parse(JSON.stringify(prevState.shown_columns)).map(column => column.name)
            column_names.forEach(function(column_name) {
                if (!new_shown_column_names.includes(column_name)) {
                    new_shown_column_names.push(column_name)
                }
            })
            let new_shown_columns = all_columns.filter(column => new_shown_column_names.includes(column.name))
            localStorage.setItem('shown_columns', JSON.stringify(new_shown_columns))
            return { shown_columns: new_shown_columns }
        })
    }

    onToggleShowColumn(column_name) {
        this.setState(prevState => {
            let new_shown_column_names = JSON.parse(JSON.stringify(prevState.shown_columns)).map(column => column.name)
            if (new_shown_column_names.includes(column_name)) {
                new_shown_column_names.splice(new_shown_column_names.findIndex(name => name === column_name), 1)
            } else {
                new_shown_column_names.push(column_name)
            }
            let new_shown_columns = all_columns.filter(column => new_shown_column_names.includes(column.name))
            localStorage.setItem('shown_columns', JSON.stringify(new_shown_columns))
            return { shown_columns: new_shown_columns }
        })
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

    onNewTags(new_tags) {
        this.setState(prevState => {

            // update tag membership info
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            new_tags.forEach(function(tag) {
                let newTag = []
                if (!newAllTags.hasOwnProperty(tag)) {
                    newAllTags[tag] = newTag
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    this.state.allPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags,
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onNewTickers(tag, new_tickers) {
        this.setState(prevState => {

            // update tag membership info
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            new_tickers.forEach(function(ticker) {
                if (!newAllTags[tag].includes(ticker)) {
                    newAllTags[tag].push(ticker)
                    if (tag !== 'untagged') {
                        newAllTags['untagged'] = newAllTags['untagged'].filter(untagged_ticker => untagged_ticker !== ticker)
                    }
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    this.state.allPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags,
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onDeleteTicker(delete_ticker) {
        this.setState(prevState => {

            // update tag membership info
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            let all_tags_for_this_ticker = []
            Object.keys(newAllTags).forEach(function(tag_name) {
                all_tags_for_this_ticker.push(tag_name)
            })
            all_tags_for_this_ticker.forEach(function(tag) {
                newAllTags[tag] = newAllTags[tag].filter(ticker => ticker !== delete_ticker)
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // update position
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            delete newAllPositions[delete_ticker]

            // update transactions
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            delete newAllTransactions[delete_ticker]
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // add status messages
            let newStatusMessages = [...prevState.status_messages]
            let new_message = ['Ticker ' + delete_ticker + ' has now been deleted.']
            newStatusMessages = [...new_message, ...newStatusMessages]

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    newAllPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags, 
                allPositions: newAllPositions, 
                allTransactions: newAllTransactions, 
                status_messages: newStatusMessages,
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onNewTransaction(new_transaction) {
        let action, num_shares, ticker, total
        [action, num_shares, ticker, total]  = new_transaction.split(' ')
        num_shares = parseInt(num_shares)
        total = parseFloat(total.substr(1))
        this.setState(prevState => {

            // update tag membership info only if this is a new ticker
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            if (!(this.getAdded().includes(ticker))){
                newAllTags['untagged'].push(ticker)
            }
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // update transaction info
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            if (newAllTransactions.hasOwnProperty(ticker) && newAllTransactions[ticker] !== null) {
                newAllTransactions[ticker] = newAllTransactions[ticker].concat([new_transaction])
            } else {
                newAllTransactions[ticker] = [new_transaction]
            }
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // recalculate the position numbers
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            let orig_basis = 0, orig_current_shares = 0, orig_realized_gains = 0
            if (newAllPositions.hasOwnProperty(ticker) && newAllPositions[ticker] !== null) {
                orig_basis = newAllPositions[ticker]['basis']
                orig_current_shares = newAllPositions[ticker]['current_shares']
                orig_realized_gains = newAllPositions[ticker]['realized_gains']
            }
            let updatedPosition = {
                symbol: ticker,
                basis: (action === 'buy') ? orig_basis + total : orig_basis - total,
                current_shares: (action === 'buy') ? orig_current_shares + num_shares : orig_current_shares - num_shares,
                realized_gains: (action === 'sell') ? orig_realized_gains + total : orig_realized_gains
            }
            if (updatedPosition['basis'] < 0) {
                updatedPosition['basis'] = 0
            }
            newAllPositions[ticker] = updatedPosition

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags,
                    newAllPositions,
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags,
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags, 
                allTransactions: newAllTransactions, 
                allPositions: newAllPositions, 
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onNewCash(new_cash_transaction) {
        let action, total
        [action, total]  = new_cash_transaction.split(' ')
        total = parseFloat(total.substr(1))
        this.setState(prevState => {

            // update transaction info
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            if (newAllTransactions.hasOwnProperty('cash') && newAllTransactions['cash'] !== null) {
                newAllTransactions['cash'] = newAllTransactions['cash'].concat([new_cash_transaction])
            } else {
                newAllTransactions['cash'] = [new_cash_transaction]
            }
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // recalculate the position numbers
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            let orig_current_shares = 0
            if (newAllPositions.hasOwnProperty('cash')) {
                orig_current_shares = newAllPositions['cash']['current_shares']
            }
            let new_cash = (action === 'add') ? orig_current_shares + total : orig_current_shares - total
            let updatedPosition = {
                symbol: 'cash',
                basis: (new_cash >= 0) ? new_cash : 0,
                current_shares: new_cash,
                realized_gains: 0
            }
            newAllPositions['cash'] = updatedPosition

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    this.state.allTags, 
                    newAllPositions,
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    this.state.allTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTransactions: newAllTransactions, 
                allPositions: newAllPositions, 
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onRemoveFromTag(remove_from_tag, remove_ticker) {
        this.setState(prevState => {
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            newAllTags[remove_from_tag] = newAllTags[remove_from_tag].filter(ticker => ticker !== remove_ticker)

            // assign ticker to "untagged" if it is losing its last (user) tag
            let all_other_tags_for_this_ticker = []
            Object.keys(newAllTags).forEach(function(tag_name) {
                if (tag_name !== remove_from_tag && tag_name !== 'untagged' && newAllTags[tag_name].includes(remove_ticker)) {
                    all_other_tags_for_this_ticker.push(tag_name)
                }
            })
            if (!all_other_tags_for_this_ticker.length) {
                let newUntagged = newAllTags['untagged']
                newUntagged.push(remove_ticker)
                newAllTags['untagged'] = newUntagged
            }
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    this.state.allPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags,
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onDeleteTag(delete_tag) {
        this.setState(prevState => {

            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            let tickers_losing_a_tag = newAllTags[delete_tag]
            delete newAllTags[delete_tag]

            // assign tickers to "untagged" if they are losing their last (user) tag
            let all_other_tagged_tickers = []
            Object.keys(newAllTags).forEach(function(tag_name) {
                if (tag_name !== 'untagged') {
                    all_other_tagged_tickers = all_other_tagged_tickers.concat(newAllTags[tag_name])
                }
            })
            tickers_losing_a_tag.forEach(function(ticker) {
                let newUntagged = newAllTags['untagged']
                if (!all_other_tagged_tickers.includes(ticker)) {
                    newUntagged.push(ticker)
                    newAllTags['untagged'] = newUntagged
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // add status messages
            let newStatusMessages = [...prevState.status_messages]
            let new_message = ['Tag "' + delete_tag + '" has now been deleted.']
            newStatusMessages = [...new_message, ...newStatusMessages]

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    this.state.allPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.show_holdings,
                    this.state.show_cash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags, 
                status_messages: newStatusMessages,
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onEditCell(row_name) {
        this.setState(prevState => {
            if (
                prevState.editing_row !== row_name
                && row_name !== this.props.editing_row
                && !this.nameIsAnAggregate(row_name)
                && !this.nameIsSpecial(row_name)
            ) {
                return { editing_row: row_name }
            } else {
                return
            }
        })
    }

    onModifyRiskFactor(ticker, new_value) {
        this.setState(prevState => {

            let newAllRisk = JSON.parse(JSON.stringify(prevState.allRisk))
            if (newAllRisk.hasOwnProperty(ticker)) {
                newAllRisk[ticker]['factor'] = parseFloat(new_value)
            } else {
                let newRisk = { factor: parseFloat(new_value) }
                newAllRisk[ticker] = newRisk
            }
            localStorage.setItem('allRisk', JSON.stringify(newAllRisk))

            return { 
                allRisk: newAllRisk,
                editing_row: null
            }
        })
    }

    onEscapeKey() {
        this.setState({ editing_row: null })
    }

    onNewMessages(new_messages) {
        this.setState(prevState => {
            let newStatusMessages = [...prevState.status_messages]
            newStatusMessages = [...new_messages.reverse(), ...newStatusMessages]
            return { status_messages: newStatusMessages }
        })
    }

    getCurrentValue(ticker) {
        if (this.state.allPositions.hasOwnProperty(ticker)) {
            return this.state.allCurrentQuotes[ticker].current_price * this.state.allPositions[ticker].current_shares
        } else {
            return 0
        }
    }

    getCurrentShares(ticker) {
        if (this.state.allPositions.hasOwnProperty(ticker)) {
            return this.state.allPositions[ticker].current_shares
        } else {
            return 0
        }
    }

    getBasis(ticker) {
        if (this.state.allPositions.hasOwnProperty(ticker)) {
            return this.state.allPositions[ticker].basis
        } else {
            return 0
        }
    }

    getBalanceableValue(balance_target_set, balance_target_column) {

        let self = this
        let balanceable_value = 0

        let current_cash_position = 0
        if (this.state.show_cash && this.state.allPositions.hasOwnProperty('cash')) {
            current_cash_position = self.state.allPositions['cash'].current_shares * self.state.allCurrentQuotes['cash'].current_price
        }
        balanceable_value += current_cash_position

        if (balance_target_set === 'my_holdings') {
            if (this.state.show_holdings) {
                Object.keys(this.state.allPositions).filter( ticker => ticker !== 'cash' ).forEach( function(ticker) {
                    if (balance_target_column === 'current_value') {
                        balanceable_value += self.state.allPositions[ticker].current_shares * self.state.allCurrentQuotes[ticker].current_price
                    } else if (balance_target_column === 'basis') {
                        balanceable_value += self.state.allPositions[ticker].basis
                    }
                })
            }
        } else if (balance_target_set === 'untagged') {
            if (this.state.show_untagged && this.state.allTags.hasOwnProperty('untagged')) {
                this.state.allTags['untagged'].filter( ticker => self.state.allPositions.hasOwnProperty(ticker) ).forEach( function(ticker) {
                    if (balance_target_column === 'current_value') {
                        balanceable_value += self.state.allPositions[ticker].current_shares * self.state.allCurrentQuotes[ticker].current_price
                    } else if (balance_target_column === 'basis') {
                        balanceable_value += self.state.allPositions[ticker].basis
                    }
                })
            }
        } else { // balance_target_set is a tag name
            if (this.state.show_tagged) {
                this.state.allTags[balance_target_set].filter( ticker => self.state.allPositions.hasOwnProperty(ticker) ).forEach( function(ticker) {
                    if (balance_target_column === 'current_value') {
                        balanceable_value += self.state.allPositions[ticker].current_shares * self.state.allCurrentQuotes[ticker].current_price
                    } else if (balance_target_column === 'basis') {
                        balanceable_value += self.state.allPositions[ticker].basis
                    }
                })
            }
        }

        return balanceable_value
    }

    onWhatifSubmit(balance_target_set, balance_target_column, remaining_cash) {
        this.setState({ remaining_cash: remaining_cash, balance_target_set: balance_target_set, balance_target_column: balance_target_column })
        let whatif_columns = ['whatif_current_shares', 'whatif_current_value', 'whatif_basis']
        this.showColumns(whatif_columns)
        this.onWhatifGo(balance_target_set, balance_target_column, this.state.show_cash, remaining_cash)
    }

    onWhatifGo(balance_target_set, balance_target_column, show_cash, remaining_cash) {

        let self = this
        let adjusting_cash = show_cash && remaining_cash !== null
        let original_cash_position = (this.state.allPositions.hasOwnProperty('cash')) ? this.state.allPositions['cash'].current_shares * this.state.allCurrentQuotes['cash'].current_price : 0

        // determine the total value to be balanced
        let total_balance_value = this.getBalanceableValue(balance_target_set, balance_target_column) // includes cash if show_cash is enabled
        if (remaining_cash === null) {
            total_balance_value -= original_cash_position
        } else {
            total_balance_value -= remaining_cash
        }

        // determine the tickers to balance across
        let tickers_to_balance = []
        if (balance_target_set === 'my_holdings') {
            tickers_to_balance = [...this.getHoldings().filter( ticker => ticker !== 'cash' )]
        } else if (balance_target_set === 'untagged') {
            tickers_to_balance = [...this.getUntagged()]
        } else {
            tickers_to_balance = this.state.allTags[balance_target_set]
        }

        // determine these tickers' what-if values for each relevant column
        let new_whatif = {
            balance_target_column: balance_target_column,
            values: {}
        }
        let actual_remaining_cash = original_cash_position
        tickers_to_balance.forEach(function(ticker) {
            let whatif_currentshares, whatif_balancedvalue
            let target = total_balance_value / tickers_to_balance.length
            new_whatif.values[ticker] = {}
            let value_delta = 0
            let original_currentvalue = self.getCurrentValue(ticker)
            let original_basis = self.getBasis(ticker)
            if (balance_target_column === 'current_value') {

                whatif_currentshares = Math.floor(target / self.state.allCurrentQuotes[ticker].current_price)
                new_whatif.values[ticker]['current_shares'] = whatif_currentshares

                whatif_balancedvalue = whatif_currentshares * self.state.allCurrentQuotes[ticker].current_price
                new_whatif.values[ticker]['current_value'] = whatif_balancedvalue

                value_delta = whatif_balancedvalue - original_currentvalue
                new_whatif.values[ticker]['basis'] = (original_basis + value_delta > 0) ? original_basis + value_delta : 0

            } else if (balance_target_column === 'basis') {

                let original_currentshares = self.getCurrentShares(ticker)
                let target_delta = target - original_basis
                let target_delta_shares
                if (target_delta >= 0) {
                    target_delta_shares = Math.floor(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                } else {
                    target_delta_shares = Math.ceil(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                }
                whatif_currentshares = original_currentshares + target_delta_shares
                new_whatif.values[ticker]['current_shares'] = whatif_currentshares

                whatif_balancedvalue = original_basis + target_delta_shares * self.state.allCurrentQuotes[ticker].current_price
                new_whatif.values[ticker]['basis'] = (whatif_balancedvalue > 0) ? whatif_balancedvalue : 0

                value_delta = whatif_balancedvalue - original_basis
                new_whatif.values[ticker]['current_value'] = original_currentvalue + value_delta

            }
            if (adjusting_cash) {
                actual_remaining_cash -= value_delta 
            }
        })
        if (adjusting_cash) {
            new_whatif.values['cash'] = {}
            new_whatif.values['cash']['current_shares'] = actual_remaining_cash
            new_whatif.values['cash']['current_value'] = actual_remaining_cash
        }
        this.setState({ allWhatifs: new_whatif.values, balance_target_column: new_whatif.balance_target_column })
    }

    getHoldings() {
        return Object.entries(this.state.allPositions).filter(holding => holding[1]['current_shares'] > 0).map(holding => holding[0])
    }

    getIndicies() {
        return [...this.state.allIndiciesAliases]
    }

    getAdded() {
        let added_tickers = []
        let self = this
        Object.keys(this.state.allTags).forEach(function(tag) {
            added_tickers = added_tickers.concat(self.state.allTags[tag])
        })
        return Array.from(new Set(added_tickers))
    }

    getTagged() {
        let tagged_tickers = []
        let self = this
        Object.keys(this.state.allTags).forEach(function(tag) {
            if (tag !== 'untagged') {
                tagged_tickers = tagged_tickers.concat(self.state.allTags[tag])
            }
        })
        return Array.from(new Set(tagged_tickers))
    }

    getUntagged() {
        return Array.from(this.state.allTags['untagged'])
    }

    populateSymbolCount(grid_rows) {
        if (this.state.show_index) {
            grid_rows -= 1
        }
        if (this.state.show_cash) {
            grid_rows -= 1
        }
        if (grid_rows) {
            return '(' + grid_rows + ')'
        } else {
            return ''
        }
    }

    nameIsAnAggregate(name) {
        return Object.keys(this.state.allTags).includes(name)
    }

    nameIsSpecial(name) {
        if (name === 'cash') {
            return true
        } else if (name === 'S&P500') {
            return true
        } else {
            return false
        }
    }

    sortTickers(names_list) {

        let sort_column = this.state.sort_column
        let quote_columns = ['current_price', 'change_pct', 'volume', 'dollar_volume']
        let holdings_columns = ['current_shares', 'current_value', 'percent_value', 'basis', 'realized_gains', 'percent_basis', 'percent_profit', 'at_risk']
        let performance_columns = ['short_change_pct', 'medium_change_pct', 'long_change_pct']

        let sorted_names_list = [...names_list]
        let self = this
        sorted_names_list.sort(function(a,b) {
            let value_a, value_b

            // pin certain names to the top, regardless of the user sort
            if (sort_column === 'symbol') {
                if (a === 'untagged') {
                    return -1
                } else if (b === 'untagged') {
                    return 1
                } else if (a === 'S&P500') {
                    return -1
                } else if (b === 'S&P500') {
                    return 1
                } else if (a === 'cash') {
                    return -1
                } else if (b === 'cash') {
                    return 1
                }
                value_a = a
                value_b = b

            // sort by a quote column
            } else if (quote_columns.includes(sort_column)) {
                if (self.nameIsAnAggregate(a) || !self.state.allCurrentQuotes.hasOwnProperty(a)) {
                    value_a = 'n/a'
                } else {
                    if (sort_column === 'dollar_volume') {
                        value_a = self.state.allCurrentQuotes[a]['current_price'] * self.state.allCurrentQuotes[a]['volume']
                    } else {
                        value_a = self.state.allCurrentQuotes[a][sort_column]
                    }
                }
                if (self.nameIsAnAggregate(b) || !self.state.allCurrentQuotes.hasOwnProperty(b)) {
                    value_b = 'n/a'
                } else {
                    if (sort_column === 'dollar_volume') {
                        value_b = self.state.allCurrentQuotes[b]['current_price'] * self.state.allCurrentQuotes[b]['volume']
                    } else {
                        value_b = self.state.allCurrentQuotes[b][sort_column]
                    }
                }

            // sort by a performance column
            } else if (performance_columns.includes(sort_column)) {
                if (self.nameIsAnAggregate(a) && self.state.aggrPerformance.hasOwnProperty(a)) {
                    value_a = self.state.aggrPerformance[a][sort_column]
                } else if (!self.nameIsAnAggregate(a) && self.state.allPerformanceNumbers.hasOwnProperty(a)) {
                    value_a = self.state.allPerformanceNumbers[a][sort_column]
                } else {
                    value_a = 'n/a'
                }
                if (self.nameIsAnAggregate(b) && self.state.aggrPerformance.hasOwnProperty(b)) {
                    value_b = self.state.aggrPerformance[b][sort_column]
                } else if (!self.nameIsAnAggregate(b) && self.state.allPerformanceNumbers.hasOwnProperty(b)) {
                    value_b = self.state.allPerformanceNumbers[b][sort_column]
                } else {
                    value_b = 'n/a'
                }

            // sort by a holdings column
            } else if (holdings_columns.includes(sort_column)) {
                let positionvalue_a, positionvalue_b, basis_a, basis_b
                if (self.nameIsAnAggregate(a)) {
                    switch(sort_column) {
                        case 'current_shares':
                            value_a = 'n/a'
                            break;
                        case 'current_value':
                        case 'percent_value':
                            value_a = self.state.aggrTotalValue[a]
                            break;
                        case 'basis':
                        case 'percent_basis':
                            value_a = self.state.aggrBasis[a]
                            break;
                        case 'realized_gains':
                            value_a = self.state.aggrRealized[a]
                            break;
                        case 'percent_profit':
                            positionvalue_a = self.state.aggrTotalValue[a]
                            basis_a = self.state.aggrBasis[a]
                            if (isNaN(positionvalue_a) || isNaN(basis_a)) {
                                value_a = 'n/a' 
                            } else if (positionvalue_a !== 0) {
                                value_a = (basis_a >= 0) ? 1 - (basis_a / positionvalue_a) : 'losing'
                            } else {
                                value_a = positionvalue_a
                            }
                            break;
                        default:
                            value_a = 'n/a'
                    }
                } else if (self.state.allPositions.hasOwnProperty(a)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_profit' || sort_column === 'at_risk') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(a)) {
                            positionvalue_a = self.state.allPositions[a]['current_shares'] * self.state.allCurrentQuotes[a]['current_price']
                            if (sort_column === 'percent_profit' && positionvalue_a !== 0) {
                                basis_a = self.state.allPositions[a]['basis']
                                value_a = (basis_a >= 0) ? 1 - (basis_a / positionvalue_a) : 'losing'
                            } else if (sort_column === 'at_risk' && positionvalue_a !== 0 && self.state.allRisk.hasOwnProperty(a)) {
                                value_a = positionvalue_a * self.state.allRisk[a].factor
                            } else {
                                value_a = positionvalue_a
                            }
                        } else {
                            value_a = 'n/a'
                        }
                    } else if (self.state.allPositions[a]['current_shares']) {
                        if (sort_column === 'percent_basis') {
                            value_a = self.state.allPositions[a]['basis']
                        } else {
                            value_a = self.state.allPositions[a][sort_column]
                        }
                    } else {
                        value_a = 'n/a'
                    }
                } else {
                    value_a = 'n/a'
                }
                if (self.nameIsAnAggregate(b)) {
                    switch(sort_column) {
                        case 'current_shares':
                            value_b = 'n/a'
                            break;
                        case 'current_value':
                        case 'percent_value':
                            value_b = self.state.aggrTotalValue[b]
                            break;
                        case 'basis':
                        case 'percent_basis':
                            value_b = self.state.aggrBasis[b]
                            break;
                        case 'realized_gains':
                            value_b = self.state.aggrRealized[b]
                            break;
                        case 'percent_profit':
                            positionvalue_b = self.state.aggrTotalValue[b]
                            basis_b = self.state.aggrBasis[b]
                            if (isNaN(positionvalue_b) || isNaN(basis_b)) {
                                value_b = 'n/a' 
                            } else if (positionvalue_b !== 0) {
                                value_b = (basis_b >= 0) ? 1 - (basis_b / positionvalue_b) : 'losing'
                            } else {
                                value_b = positionvalue_b
                            }
                            break;
                        default:
                            value_b = 'n/a'
                    }
                } else if (self.state.allPositions.hasOwnProperty(b)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_profit' || sort_column === 'at_risk') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(b)) {
                            positionvalue_b = self.state.allPositions[b]['current_shares'] * self.state.allCurrentQuotes[b]['current_price']
                            if (sort_column === 'percent_profit' && positionvalue_b !== 0) {
                                basis_b = self.state.allPositions[b]['basis']
                                value_b = (basis_b >= 0) ? 1 - (basis_b / positionvalue_b) : 'losing'
                            } else if (sort_column === 'at_risk' && positionvalue_b !== 0 && self.state.allRisk.hasOwnProperty(b)) {
                                value_b = positionvalue_b * self.state.allRisk[b].factor
                            } else {
                                value_b = positionvalue_b
                            }
                        } else {
                            value_b = 'n/a'
                        }
                    } else if (self.state.allPositions[b]['current_shares']) {
                        if (sort_column === 'percent_basis') {
                            value_b = self.state.allPositions[b]['basis']
                        } else {
                            value_b = self.state.allPositions[b][sort_column]
                        }
                    } else {
                        value_b = 'n/a'
                    }
                } else {
                    value_b = 'n/a'
                }

            // miscelaneous columns
            } else if (sort_column === 'risk_factor') {
                value_a = (self.state.allRisk.hasOwnProperty(a)) ? self.state.allRisk[a].factor : 'n/a'
                value_b = (self.state.allRisk.hasOwnProperty(b)) ? self.state.allRisk[b].factor : 'n/a'

            // default, do not reorder this pair
            } else {
                return 0
            }
                
            if (value_a === value_b) {
                return 0
            }
            if (self.state.sort_dir_asc === true) {
                if (value_a === 'n/a') {
                    return 1
                } else if (value_b === 'n/a') {
                    return -1
                } else if (value_a < value_b) {
                    return -1
                } else if (value_a > value_b) {
                    return 1
                }
            } else {
                if (value_a === 'n/a') {
                    return 1
                } else if (value_b === 'n/a') {
                    return -1
                } else if (value_a < value_b) {
                    return 1
                } else if (value_a > value_b) {
                    return -1
                }
            }
            return 0
        })

        return sorted_names_list
    }

    render() {

        let self = this

        let tickers_to_show = []
        if (this.state.done) {
            if (this.state.show_index) {
                tickers_to_show = [...tickers_to_show, ...this.getIndicies()]
            }
            if (this.state.show_holdings) {
                tickers_to_show = [...tickers_to_show, ...this.getHoldings()].filter(ticker => ticker !== 'cash')
            }
            if (this.state.show_cash) {
                tickers_to_show.push('cash')
            }
            if (this.state.show_tagged) {
                tickers_to_show = [...tickers_to_show, ...this.getTagged()]
            }
            if (this.state.show_untagged) {
                tickers_to_show = [...tickers_to_show, ...this.getUntagged()]
            }
        }
        let unique_tickers_to_show = Array.from(new Set(tickers_to_show))
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_tickers = this.sortTickers(unique_tickers_to_show)

        let row_data = {}
        sorted_tickers.forEach(function(ticker) {

            row_data[ticker] = {}

            let tag_membership = []
            Object.entries(self.state.allTags).forEach(function(tag_info) {
                if (tag_info[1].includes(ticker)) {
                    tag_membership.push(tag_info[0])
                }
            })
            row_data[ticker]['tags'] = tag_membership

            let special_classes = []
            if (self.tickerIsIndex(ticker)) {
                special_classes.push('index')
            }
            if (ticker === 'cash') {
                special_classes.push('cash')
            }
            row_data[ticker]['special_classes'] = special_classes

            if (self.state.allPositions.hasOwnProperty(ticker)) {
                row_data[ticker]['basis'] = self.state.allPositions[ticker].basis
                row_data[ticker]['current_shares'] = self.state.allPositions[ticker].current_shares
                row_data[ticker]['realized_gains'] = self.state.allPositions[ticker].realized_gains
            } else {
                row_data[ticker]['basis'] = 'n/a'
                row_data[ticker]['current_shares'] = 'n/a'
                row_data[ticker]['realized_gains'] = 'n/a'
            }

            if (self.state.allWhatifs.hasOwnProperty(ticker)) {
                row_data[ticker]['whatif'] = self.state.allWhatifs[ticker]

            } else {
                row_data[ticker]['whatif'] = null
            }
        })

        let sorted_aggr_tickers = this.sortTickers(Object.keys(this.state.allTags).filter(ticker => !(ticker === 'untagged' && !this.state.allTags.untagged.length)))
        let aggr_row_data = {}
        sorted_aggr_tickers.forEach(function(aggr_ticker) {

            let new_aggr_data = {}

            new_aggr_data['symbol'] = aggr_ticker
            new_aggr_data['tags'] = []
            new_aggr_data['special_classes'] = ['aggregate']
            new_aggr_data['basis'] = 'n/a'
            new_aggr_data['current_shares'] = 'n/a'
            new_aggr_data['current_price'] = 'n/a'
            new_aggr_data['current_value'] = self.state.aggrTotalValue[aggr_ticker]
            new_aggr_data['change_pct'] = 'n/a'
            new_aggr_data['volume'] = 'n/a'
            new_aggr_data['basis'] = self.state.aggrBasis[aggr_ticker]
            new_aggr_data['realized_gains'] = self.state.aggrRealized[aggr_ticker]
            new_aggr_data['performance'] = self.state.aggrPerformance[aggr_ticker]
            new_aggr_data['whatif'] = null

            aggr_row_data[aggr_ticker] = new_aggr_data
        })

        let shown_column_names = this.state.shown_columns.map(column => column.name)
        let all_columns_namesorted = JSON.parse(JSON.stringify(all_columns)).sort(function (a,b) {
            let value_a = a.display_name
            if (value_a.includes('year')) {
                value_a = '0' + value_a
            } else if (value_a.includes('month')) {
                value_a = '00' + value_a
            }
            let value_b = b.display_name
            if (value_b.includes('year')) {
                value_b = '0' + value_b
            } else if (value_b.includes('month')) {
                value_b = '00' + value_b
            }
            if (value_a < value_b) {
                return -1
            } else if (value_a < value_b) {
                return 1
            } else {
                return 0
            }
        })

        const row_popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">included rows:</Popover.Title>
                <Popover.Content>
                <div id="row-control">
                    <form>
                        <div className="switch_controls">

                            <div className="switch_control">
                                <div className="switch_label">show holdings:</div>
                                <div className="switch_wrapper">
                                    <input id="show_holdings" name="show_holdings" type="checkbox" checked={this.state.show_holdings} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_holdings" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show tagged:</div>
                                <div className="switch_wrapper">
                                    <input id="show_tagged" name="show_tagged" type="checkbox" checked={this.state.show_tagged} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_tagged" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show untagged:</div>
                                <div className="switch_wrapper">
                                    <input id="show_untagged" name="show_untagged" type="checkbox" checked={this.state.show_untagged} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_untagged" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show index:</div>
                                <div className="switch_wrapper">
                                    <input id="show_index" name="show_index" type="checkbox" checked={this.state.show_index} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_index" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show cash:</div>
                                <div className="switch_wrapper">
                                    <input id="show_cash" name="show_cash" type="checkbox" checked={this.state.show_cash} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_cash" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show aggregates (tags):</div>
                                <div className="switch_wrapper">
                                    <input id="show_aggregates" name="show_aggregates" type="checkbox" checked={this.state.show_aggregates} onChange={this.onShowInputChange} />
                                    <label htmlFor="show_aggregates" className="switch"></label>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
                </Popover.Content>
            </Popover>
        )
        const RowSettings = () => (
            <OverlayTrigger trigger="click" placement="left" overlay={row_popover}>
                <button className="btn btn-sm btn-secondary" variant="success">&#x2699; Rows</button>
            </OverlayTrigger>
        )
        const column_popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">included columns:</Popover.Title>
                <Popover.Content>
                <div id="column-control">
                    {all_columns_namesorted.map(column => (
                        <span key={ column.name } onClick={ (e)=>this.onToggleShowColumn(column.name) } className={!shown_column_names.includes(column.name) ? 'strikethrough' : ''}>{ column.display_name }</span>
                    ))}
                </div>
                </Popover.Content>
            </Popover>
        )
        const ColumnSettings = () => (
            <OverlayTrigger trigger="click" placement="left" overlay={column_popover}>
                <button className="btn btn-sm btn-secondary" variant="success">&#x2699; Columns</button>
            </OverlayTrigger>
        )
        
        const PopulateHeaderRow = ({is_aggregate, highlight_column}) => (
            <GridHeaderRow
                highlight_column={highlight_column}
                is_aggregate={is_aggregate}
                columns={this.state.shown_columns}
                symbol_count_str={symbol_count}
                sort_column={this.state.sort_column}
                sort_triangle={sort_triangle}
                whatif_format={this.state.whatif_format}
                on_change_sort={this.onChangeSort}
                on_change_whatif_format={this.onChangeWhatifFormat}
            />
        )

        const PopulateRow = ({row_data}) => (
            <GridRow 
                key={row_data.row_name}
                is_aggregate={row_data.is_aggregate}
                row_name={row_data.row_name}
                membership_set={row_data.membership_set}
                columns={row_data.columns}
                special_classes={row_data.special_classes}
                current_price={row_data.current_price}
                change_pct={row_data.change_pct}
                volume={row_data.volume}
                basis={row_data.basis}
                current_shares={row_data.current_shares}
                current_value={row_data.current_value}
                realized_gains={row_data.realized_gains}
                risk_factor={row_data.risk_factor}
                performance_numbers={row_data.performance_numbers}
                baseline={row_data.baseline}
                total_value={row_data.total_value}
                total_basis={row_data.total_basis}
                whatif={row_data.whatif}
                whatif_format={this.state.whatif_format}
                on_change_whatif_format={this.onChangeWhatifFormat}
                on_remove_from_tag={row_data.on_remove_from_tag}
                on_delete_ticker={row_data.on_delete_ticker}
                on_delete_tag={row_data.on_delete_tag}
                editing_row={this.state.editing_row}
                current_edit_value={(typeof this.state.editing_row === 'string' && this.state.allRisk.hasOwnProperty(this.state.editing_row)) ? this.state.allRisk[this.state.editing_row].factor : ''}
                on_edit_cell={row_data.on_edit_cell}
                on_modify_risk_factor={row_data.on_modify_risk_factor}
                on_escape_key={this.onEscapeKey}
            />
        )

        let all_row_data = []
        sorted_tickers.forEach(function(ticker) {
            let new_row = {}
            new_row['is_aggregate'] = false
            new_row['row_name'] = ticker
            new_row['membership_set'] = row_data[ticker]['tags']
            new_row['columns'] = self.state.shown_columns
            new_row['special_classes'] = row_data[ticker]['special_classes']
            new_row['current_price'] = self.state.allCurrentQuotes[ticker].current_price
            new_row['change_pct'] = self.state.allCurrentQuotes[ticker].change_pct
            new_row['volume'] = self.state.allCurrentQuotes[ticker].volume
            new_row['basis'] = row_data[ticker]['basis']
            new_row['current_shares'] = row_data[ticker]['current_shares']
            new_row['current_value'] = (new_row.current_price === 'n/a' || new_row.current_shares === 'n/a') ? 'n/a' : new_row.current_price * new_row.current_shares
            new_row['realized_gains'] = row_data[ticker]['realized_gains']
            new_row['risk_factor'] = (self.state.allRisk.hasOwnProperty(ticker) && ticker !== 'S&P500') ? self.state.allRisk[ticker].factor : null
            new_row['performance_numbers'] = self.state.allPerformanceNumbers[ticker]
            new_row['baseline'] = self.state.baseline
            new_row['total_value'] = self.state.aggrTotalValue['_everything_']
            new_row['total_basis'] = self.state.aggrBasis['_everything_']
            new_row['whatif'] = row_data[ticker]['whatif']
            new_row['on_remove_from_tag'] = self.onRemoveFromTag
            new_row['on_delete_ticker'] = self.onDeleteTicker
            new_row['on_delete_tag'] = self.onDeleteTag
            new_row['on_edit_cell'] = self.onEditCell
            new_row['on_modify_risk_factor'] = self.onModifyRiskFactor
            all_row_data.push(new_row)
        })
        if (this.state.show_aggregates) {
            sorted_aggr_tickers.forEach(function(aggr_ticker) {
                let new_row = {}
                new_row['is_aggregate'] = true
                new_row['row_name'] = aggr_ticker
                new_row['membership_set'] = self.state.allTags[aggr_ticker]
                new_row['columns'] = self.state.shown_columns
                new_row['special_classes'] = aggr_row_data[aggr_ticker]['special_classes']
                new_row['current_price'] = aggr_row_data[aggr_ticker]['current_price']
                new_row['change_pct'] = aggr_row_data[aggr_ticker]['change_pct']
                new_row['volume'] = aggr_row_data[aggr_ticker]['volume']
                new_row['basis'] = self.state.aggrBasis[aggr_ticker]
                new_row['current_shares'] = aggr_row_data[aggr_ticker]['current_shares']
                new_row['current_value'] = aggr_row_data[aggr_ticker]['current_value']
                new_row['realized_gains'] = aggr_row_data[aggr_ticker]['realized_gains']
                new_row['risk_factor'] = 'n/a'
                new_row['performance_numbers'] = aggr_row_data[aggr_ticker]['performance']
                new_row['baseline'] = self.state.baseline
                new_row['total_value'] = self.state.aggrTotalValue['_everything_']
                new_row['total_basis'] = self.state.aggrBasis['_everything_']
                new_row['whatif'] = aggr_row_data[aggr_ticker]['whatif']
                new_row['on_remove_from_tag'] = self.onRemoveFromTag
                new_row['on_delete_ticker'] = self.onDeleteTicker
                new_row['on_delete_tag'] = self.onDeleteTag
                new_row['on_edit_cell'] = self.onEditCell
                new_row['on_modify_risk_factor'] = self.onModifyRiskFactor
                all_row_data.push(new_row)
            })
        }

        let symbol_count = this.populateSymbolCount(sorted_tickers.length) 
          
        return (
            <div id="page-wrapper">
                <div id="page-controls">
                    <div id="input-controls">
                        <InputForms
                            all_stocks={this.state.allStocks}
                            all_tags={this.state.allTags}
                            all_current_quotes={this.state.allCurrentQuotes}
                            all_positions={this.state.allPositions}
                            show_holdings={this.state.show_holdings}
                            show_tagged={this.state.show_tagged}
                            show_untagged={this.state.show_untagged}
                            show_cash={this.state.show_cash}
                            get_balanceable_value={this.getBalanceableValue}
                            on_new_tickers={this.onNewTickers}
                            on_new_tags={this.onNewTags}
                            on_delete_tag={this.onDeleteTag}
                            on_new_transaction={this.onNewTransaction}
                            on_new_cash={this.onNewCash}
                            all_status_messages={this.state.status_messages}
                            on_new_messages={this.onNewMessages}
                            on_whatif_submit={this.onWhatifSubmit}
                        />
                    </div>
                    <div id="view-controls">
                        <div id="baseline-control">
                            <label htmlFor="baseline">Performance Baseline:</label>
                            <select id="baseline" name="baseline" value={this.state.baseline.name} onChange={this.onInputChange}>
                                <option value="zero_pct_gain">0% gain</option>
                                <option value="sp500_pct_gain">SP&amp;500 Index</option>
                            </select>
                        </div>

                        <div id="page-settings">
                            <RowSettings />
                            <ColumnSettings />
                        </div>

                    </div>
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <PopulateHeaderRow is_aggregate={false} highlight_column={this.state.balance_target_column} />
                        <PopulateHeaderRow is_aggregate={false} highlight_column={null} />
                    </thead>
                    <tbody>
                        {this.state.done && all_row_data.filter(row_data => !row_data.is_aggregate).map(row_data => (
                            <PopulateRow key={row_data.row_name} row_data={row_data} />
                        ))}
                        <GridRowTotals
                            columns={this.state.shown_columns}
                            total_value={this.state.aggrTotalValue['_everything_']}
                            total_basis={this.state.aggrBasis['_everything_']}
                            total_performance={this.state.aggrPerformance['_everything_']}
                        />
                    </tbody>
                </table>
                {this.state.done && this.state.show_aggregates && (
                    <table id="aggr-position-listing" cellSpacing="0">
                        <thead>
                            <PopulateHeaderRow is_aggregate={true} highlight_column={null} />
                        </thead>
                        <tbody>
                            {this.state.done && all_row_data.filter(row_data => row_data.is_aggregate).map(row_data => (
                                <PopulateRow key={row_data.row_name} row_data={row_data} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }

}