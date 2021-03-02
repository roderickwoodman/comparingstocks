import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { GridHeaderRow } from './components/GridHeaderRow'
import { GridRow } from './components/GridRow'
import { GridRowTotals } from './components/GridRowTotals'
import { InputForms } from './components/InputForms'
import { Popover } from 'react-bootstrap'
import { OverlayTrigger } from 'react-bootstrap'


const allColumns = [
    {
        name: 'symbol',
        displayName: 'Symbol',
        type: 'string',
        category: 'always'
    },
    {
        name: 'currentShares',
        displayName: 'Shares',
        type: 'number',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'whatif_current_shares',
        displayName: 'What-If Shares',
        type: 'number',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'current_price',
        displayName: 'Price',
        type: 'currency',
        num_decimals: 2,
        category: 'stock-specific'
    },
    // this column is too short-term ;-P
    // {
    //     name: 'change_pct',
    //     displayName: 'Change',
    //     type: 'percentage',
    //     num_decimals: 2,
    //     category: 'performance'
    // },
    {
        name: 'quote_date',
        displayName: 'Price Date',
        type: 'string',
        category: 'stock-specific'
    },
    {
        name: 'currentValue',
        displayName: 'Value',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'percentValue',
        displayName: 'Pct of Total Value',
        type: 'percentage',
        num_decimals: 1,
        category: 'holdings'
    },
    {
        name: 'whatif_current_value',
        displayName: 'What-If Value',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'basis',
        displayName: 'Basis',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'percentBasis',
        displayName: 'Pct of Total Basis',
        type: 'percentage',
        num_decimals: 1,
        category: 'holdings'
    },
    {
        name: 'whatif_basis',
        displayName: 'What-If Basis',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'profit',
        displayName: 'Profit',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'percent_profit',
        displayName: 'Pct Profit',
        type: 'percentage',
        passthrough_strings: true,
        num_decimals: 1,
        category: 'holdings'
    },
    {
        name: 'realized_gains',
        displayName: 'Realized',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'risk_factor_modified',
        displayName: 'Risk Factor Edited Date',
        type: 'string',
        category: 'stock-specific'
    },
    {
        name: 'risk_factor',
        displayName: 'Risk Factor (default=0.20)',
        type: 'number',
        num_decimals: 2,
        category: 'stock-specific'
    },
    {
        name: 'value_at_risk',
        displayName: 'Value At Risk',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'whatif_value_at_risk',
        displayName: 'What-If Value At Risk',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'basis_risked',
        displayName: 'Basis Risked',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'whatif_basis_risked',
        displayName: 'What-If Basis Risked',
        type: 'currency',
        num_decimals: 0,
        category: 'holdings'
    },
    {
        name: 'volume',
        displayName: 'Volume',
        type: 'number',
        num_decimals: 0,
        category: 'stock-specific'
    },
    {
        name: 'dollar_volume',
        displayName: 'Dollar Vol (M)',
        type: 'currency',
        scaling_power: -6,
        num_decimals: 0,
        category: 'stock-specific'
    },
    {
        name: 'start_date',
        displayName: 'Holding Started Date',
        type: 'string',
        category: 'holdings'
    },
    {
        name: 'shortChangePct',
        displayName: '6-month',
        type: 'percentage',
        num_decimals: 1,
        category: 'performance'
    },
    {
        name: 'mediumChangePct',
        displayName: '1-year',
        type: 'percentage',
        num_decimals: 1,
        category: 'performance'
    },
    {
        name: 'longChangePct',
        displayName: '2-year',
        type: 'percentage',
        num_decimals: 1,
        category: 'performance'
    }
]

const default_shown_columns = ['symbol', 'currentShares', 'currentValue', 'percentValue', 'percentBasis', 'percent_profit', 'shortChangePct', 'mediumChangePct', 'longChangePct']

export class ComparingStocks extends React.Component {

    constructor(props) {
        super(props)
        this.state = {

            allIndiciesTickers: [ 'INX' ],
            allIndiciesAliases: [ 'S&P500' ],
            allStocks: [],
            allCurrentQuotes: {},
            allMonthEndDates: [],
            allMonthlyQuotes: {},
            allPositions: {},
            allTransactions: [],
            allTags: {
                'untagged': []
            },
            allPerformanceNumbers: {},
            allRisk: {},
            allWhatifs: {},
            allConsoleMessages: [],
            last_console_message: '',
            whatifFormat: 'deltas', // deltas | new_values
            balance_target_set: 'my_current_holdings',
            balance_target_column: '',
            sell_all_of: [],
            remaining_cash: null,
            baseline: {
                name: 'zero_pct_gain',
                shortChangePct: 0,
                mediumChangePct: 0,
                longChangePct: 0,
            },
            editing_row: null,

            aggrPerformance: {},
            aggrBasis: {},
            aggrRealized: {},
            aggrTotalValue: {},

            showCurrentHoldings: true,
            showPreviousHoldings: false,
            showTagged: true,
            showUntagged: true,
            show_index: false,
            showCash: false,
            show_aggregates: true,
            error_if_not_todays_quote: true,
            show_only_achieved_performance: false,
            sortColumn: 'symbol',
            sort_dir_asc: true,
            shown_columns: [],

            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getTransactionById = this.getTransactionById.bind(this)
        this.getTransactionsByTicker = this.getTransactionsByTicker.bind(this)
        this.getPositionFromSingleTickerTransactions = this.getPositionFromSingleTickerTransactions.bind(this)
        this.getPositionFromCashTransactions = this.getPositionFromCashTransactions.bind(this)
        this.calculateAggrPositionInfo = this.calculateAggrPositionInfo.bind(this)
        this.calculateAggrPerformance = this.calculateAggrPerformance.bind(this)
        this.populateSymbolCount = this.populateSymbolCount.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onShowInputChange = this.onShowInputChange.bind(this)
        this.onChangeWhatifFormat = this.onChangeWhatifFormat.bind(this)
        this.onChangeSort = this.onChangeSort.bind(this)
        this.showColumns = this.showColumns.bind(this)
        this.createConsoleMessageSet = this.createConsoleMessageSet.bind(this)
        this.onToggleShowColumn = this.onToggleShowColumn.bind(this)
        this.onNewTransaction = this.onNewTransaction.bind(this)
        this.onImportTransactions = this.onImportTransactions.bind(this)
        this.onNewCash = this.onNewCash.bind(this)
        this.onNewTags = this.onNewTags.bind(this)
        this.onNewTickers = this.onNewTickers.bind(this)
        this.onRemoveFromTag = this.onRemoveFromTag.bind(this)
        this.onDeleteTicker = this.onDeleteTicker.bind(this)
        this.onDeleteTags = this.onDeleteTags.bind(this)
        this.onDeleteTransaction = this.onDeleteTransaction.bind(this)
        this.onEditCell = this.onEditCell.bind(this)
        this.onModifyRiskFactor = this.onModifyRiskFactor.bind(this)
        this.onEscapeKey = this.onEscapeKey.bind(this)
        this.onNewConsoleMessages = this.onNewConsoleMessages.bind(this)
        this.clearLastConsoleMessage = this.clearLastConsoleMessage.bind(this)
        this.daysAgo = this.daysAgo.bind(this)
        this.currentQuoteExists = this.currentQuoteExists.bind(this)
        this.getClosingPrice = this.getClosingPrice.bind(this)
        this.getMostRecentClosingPrice = this.getMostRecentClosingPrice.bind(this)
        this.getCurrentValue = this.getCurrentValue.bind(this)
        this.getCurrentShares = this.getCurrentShares.bind(this)
        this.getBasis = this.getBasis.bind(this)
        this.getBalanceableValue = this.getBalanceableValue.bind(this)
        this.getMaxBalanceableValue = this.getMaxBalanceableValue.bind(this)
        this.onWhatifSubmit = this.onWhatifSubmit.bind(this)
        this.onWhatifGo = this.onWhatifGo.bind(this)
        this.getIndicies = this.getIndicies.bind(this)
        this.getCurrentHoldings = this.getCurrentHoldings.bind(this)
        this.getPreviousHoldings = this.getPreviousHoldings.bind(this)
        this.getAdded = this.getAdded.bind(this)
        this.getTagged = this.getTagged.bind(this)
        this.getUntagged = this.getUntagged.bind(this)
        this.getTickersFromSet = this.getTickersFromSet.bind(this)
        this.nameIsAnAggregate = this.nameIsAnAggregate.bind(this)
        this.nameIsSpecial = this.nameIsSpecial.bind(this)
        this.sortTickers = this.sortTickers.bind(this)
    }

    componentDidMount() {

        // 1. load all locally-stored data

        const stored_sort_column = JSON.parse(localStorage.getItem("sortColumn"))
        if (stored_sort_column !== null) {
            this.setState({ sortColumn: stored_sort_column })
        }

        const stored_sort_dir_asc = JSON.parse(localStorage.getItem("sort_dir_asc"))
        if (stored_sort_dir_asc !== null) {
            this.setState({ sort_dir_asc: stored_sort_dir_asc })
        }

        const stored_whatif_format = JSON.parse(localStorage.getItem("whatifFormat"))
        if (stored_whatif_format !== null) {
            this.setState({ whatifFormat: stored_whatif_format })
        }

        let allTags = {}
        const stored_allTags = JSON.parse(localStorage.getItem("allTags"))
        if (stored_allTags !== null) {
            this.setState({ allTags: stored_allTags })
            allTags = JSON.parse(JSON.stringify(stored_allTags))
        }

        let allTransactions = []
        const stored_allTransactions = JSON.parse(localStorage.getItem("allTransactions"))
        if (stored_allTransactions !== null) {
            this.setState({ allTransactions: stored_allTransactions })
            allTransactions = JSON.parse(JSON.stringify(stored_allTransactions))
        }

        const stored_allRisk = JSON.parse(localStorage.getItem("allRisk"))
        if (stored_allRisk !== null) {
            this.setState({ allRisk: stored_allRisk })
        }

        let self = this

        const view_controls = ['showCurrentHoldings', 'showPreviousHoldings', 'showTagged', 'showUntagged', 'show_index', 'showCash', 'show_aggregates', 'show_only_achieved_performance', 'error_if_not_todays_quote']
        let stored_controls = {}
        view_controls.forEach(function(control) {
            stored_controls[control] = null
            const stored_control = JSON.parse(localStorage.getItem(control))
            if (stored_control !== null) {
                stored_controls[control] = stored_control
                self.setState({ [control]: stored_control })
            }
        })

        let init_shown_columns = []
        const stored_shown_columns = JSON.parse(localStorage.getItem("shown_columns"))
        if (stored_shown_columns !== null) {
            init_shown_columns = [...stored_shown_columns]
        } else {
            init_shown_columns = allColumns.filter(column => default_shown_columns.includes(column.name))
        }


        // 2. calculate historical performance data for each added ticker

        let baseline = {}
        const stored_baseline = JSON.parse(localStorage.getItem("baseline"))
        if (stored_baseline !== null) {
            baseline = Object.assign({}, stored_baseline)
        } else {
            baseline = {
                name: 'zero_pct_gain',
                shortChangePct: 0,
                mediumChangePct: 0,
                longChangePct: 0,
            }
        }

        let indexed_risk_data = {}
        if (stored_allRisk !== null) {
            indexed_risk_data = JSON.parse(JSON.stringify(stored_allRisk))
        }

        let raw_current_quote_data = require('./api/sample_current_quotes.json').sample_current_quotes
        let indexed_current_quote_data = {}
        raw_current_quote_data.forEach(function(raw_quote) {
            let adjusted_ticker = self.convertNameForIndicies(raw_quote['Global Quote']['01. symbol'].toUpperCase())
            indexed_current_quote_data[adjusted_ticker] = raw_quote
        })

        let raw_monthly_quote_data = require('./api/sample_monthly_quotes.json').sample_monthly_quotes
        let indexed_monthly_quote_data = {}
        let index_performance = {}
        raw_monthly_quote_data.forEach(function(raw_quote) {
            let adjusted_ticker = self.convertNameForIndicies(raw_quote['Meta Data']['2. Symbol'].toUpperCase())
            indexed_monthly_quote_data[adjusted_ticker] = raw_quote
            if (adjusted_ticker === 'S&P500') {
                let quoteTimeSeriesDesc = Object.entries(indexed_monthly_quote_data[adjusted_ticker]['Monthly Adjusted Time Series'])
                .sort(function(a,b) {
                    if(a[0] < b[0]) {
                        return 1
                    } else if (a[0] > b[0]) {
                        return -1
                    } else {
                        return 0
                    }
                })
                let monthly_prices = Object.entries(quoteTimeSeriesDesc).map(price => parseFloat(price[1]['5. adjusted close']))
                let now = monthly_prices[0]
                let prev_short = monthly_prices[5]
                let prev_medium = monthly_prices[11]
                let prev_long = monthly_prices[23]
                index_performance['shortChangePct'] = (now - prev_short) / now * 100
                index_performance['mediumChangePct'] = (now - prev_medium) / now * 100
                index_performance['longChangePct'] = (now - prev_long) / now * 100
                baseline['shortChangePct'] = index_performance['shortChangePct']
                baseline['mediumChangePct'] = index_performance['mediumChangePct']
                baseline['longChangePct'] = index_performance['longChangePct']
                self.setState({ baseline: baseline })
                localStorage.setItem('baseline', JSON.stringify(baseline))
            }
        })

        this.setState({ index_performance: index_performance })


        // 3. calculate position data (from transactions) for all holdings

        let allStocks = []
        allTransactions.forEach(function(transaction) {
            if (!allStocks.includes(transaction.ticker)) {
                allStocks.push(transaction.ticker)
            }
        })
        Object.keys(indexed_current_quote_data).forEach(function(ticker) {
            if (!allStocks.includes(ticker)) {
                allStocks.push(ticker)
            }
        })
        Object.keys(indexed_monthly_quote_data).forEach(function(ticker) {
            if (!allStocks.includes(ticker)) {
                allStocks.push(ticker)
            }
        })
        Object.keys(indexed_risk_data).forEach(function(ticker) {
            if (!allStocks.includes(ticker)) {
                allStocks.push(ticker)
            }
        })
        allStocks = allStocks.filter(ticker => ticker !== 'cash')

        let newPositions = {}
        let newCurrentQuotes = {}
        let newMonthEndDates = []
        let newMonthlyQuotes = {}
        let newPerformanceNumbers = {}
        let newRisk = {}
        let cash_delta_from_stock_transactions = 0

        allStocks.forEach(function(ticker) {

            // create a stock position if any transactions exist
            allTransactions.forEach(function(transaction) {
                if (!newPositions.hasOwnProperty(transaction.ticker) && transaction.ticker !== 'cash') {
                    let newPosition = {}
                    let ticker = transaction.ticker
                    newPosition = self.getPositionFromSingleTickerTransactions(allTransactions.filter(transaction => transaction.ticker === ticker))
                    newPosition['symbol'] = ticker
                    newPositions[ticker] = newPosition
                    if (transaction.action === 'buy') {
                        cash_delta_from_stock_transactions -= transaction.total
                    } else {
                        cash_delta_from_stock_transactions += transaction.total
                    }
                }
            })

            // get current quote
            if (indexed_current_quote_data.hasOwnProperty(ticker)) {
                let newCurrentQuote = {}
                let quoteResult = indexed_current_quote_data[ticker]['Global Quote']
                newCurrentQuote['symbol'] = ticker
                newCurrentQuote['current_price'] = parseFloat((Math.round(100 * parseFloat(quoteResult['05. price'])) / 100).toFixed(2))
                newCurrentQuote['change'] = parseFloat((Math.round(100 * parseFloat(quoteResult['09. change'])) / 100).toFixed(2))
                newCurrentQuote['change_pct'] = parseFloat((Math.round(100 * parseFloat(quoteResult['10. change percent'].slice(0, -1))) / 100).toFixed(2))
                newCurrentQuote['volume'] = parseInt(quoteResult['06. volume'])
                newCurrentQuote['quote_date'] = quoteResult['07. latest trading day']
                newCurrentQuotes[ticker] = newCurrentQuote
            }

            // get monthly quote
            if (indexed_monthly_quote_data.hasOwnProperty(ticker)) {

                let newTickerQuotes = {}
                Object.entries(indexed_monthly_quote_data[ticker]['Monthly Adjusted Time Series']).forEach(function(entry) {

                    let full_date = entry[0]

                    // collect all quotes for this ticker
                    let newQuote = {}
                    newQuote['adjustedClose'] = parseFloat(entry[1]['5. adjusted close'])
                    newTickerQuotes[full_date] = newQuote

                    // build the month-end dates (YYYY-MM-DD)
                    let target_month = full_date.substr(0,7)
                    if (!newMonthEndDates.includes(full_date)) {
                        let found_idx = newMonthEndDates.findIndex(element => element.substr(0,7) === target_month)
                        if (found_idx === -1) {
                            newMonthEndDates.push(full_date)
                        } else if (newMonthEndDates[found_idx] < full_date) {
                            newMonthEndDates[found_idx] = full_date
                        }
                    }
                })
                newMonthlyQuotes[ticker] = newTickerQuotes

                // calculate performance
                let newPerformance = {}

                let ticker_now = self.getClosingPrice(ticker, newMonthEndDates[0], newMonthlyQuotes)
                if (typeof ticker_now !== 'number') {
                    ticker_now = self.getMostRecentClosingPrice(ticker, newCurrentQuotes)
                }
                let ticker_short_ago = self.getClosingPrice(ticker, newMonthEndDates[5], newMonthlyQuotes)
                let ticker_medium_ago = self.getClosingPrice(ticker, newMonthEndDates[11], newMonthlyQuotes)
                let ticker_long_ago = self.getClosingPrice(ticker, newMonthEndDates[23], newMonthlyQuotes)
                let ticker_perf_short, ticker_perf_medium, ticker_perf_long
                if (typeof ticker_now === 'number') {
                    if (typeof ticker_short_ago === 'number') {
                        ticker_perf_short = (ticker_now - ticker_short_ago) / ticker_now * 100
                        newPerformance['shortChangePct'] = (baseline.name === 'sp500_pct_gain') 
                            ? ticker_perf_short - index_performance.shortChangePct 
                            : ticker_perf_short
                    } else {
                        newPerformance['shortChangePct'] = 'err.'
                    }
                    if (typeof ticker_medium_ago === 'number') {
                        ticker_perf_medium = (ticker_now - ticker_medium_ago) / ticker_now * 100
                        newPerformance['mediumChangePct'] = (baseline.name === 'sp500_pct_gain') 
                            ? ticker_perf_medium - index_performance.mediumChangePct 
                            : ticker_perf_medium
                    } else {
                        newPerformance['mediumChangePct'] = 'err.'
                    }
                    if (typeof ticker_long_ago === 'number') {
                        ticker_perf_long = (ticker_now - ticker_long_ago) / ticker_now * 100
                        newPerformance['longChangePct'] = (baseline.name === 'sp500_pct_gain') 
                            ? ticker_perf_long - index_performance.longChangePct 
                            : ticker_perf_long
                    } else {
                        newPerformance['longChangePct'] = 'err.'
                    }
                }
                newPerformanceNumbers[ticker] = newPerformance
            }

            // get risk factor
            if (indexed_risk_data.hasOwnProperty(ticker)) {
                newRisk[ticker] = JSON.parse(JSON.stringify(indexed_risk_data[ticker]))
            }
        })
        newMonthEndDates = newMonthEndDates.sort().reverse()

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
            shortChangePct: 0,
            mediumChangePct: 0,
            longChangePct: 0,
        }
        newPerformanceNumbers['cash'] = cashPerformance

        // position for cash
        let cash_transactions = allTransactions.filter(transaction => transaction.ticker === 'cash')
        if (cash_transactions.length || cash_delta_from_stock_transactions !== 0) {
            let newPosition = {}
            newPosition = this.getPositionFromCashTransactions(cash_transactions)
            newPosition['symbol'] = 'cash'
            if (cash_delta_from_stock_transactions) {
                newPosition['basis'] += cash_delta_from_stock_transactions
                newPosition['currentShares'] += cash_delta_from_stock_transactions
            }
            newPositions['cash'] = newPosition
        }

        // 5. handle aggregates
        let aggr_position_info = JSON.parse(JSON.stringify(this.calculateAggrPositionInfo(allTags, newPositions, newCurrentQuotes, stored_controls['showCurrentHoldings'], stored_controls['showCash'])))
        let aggr_performance = JSON.parse(JSON.stringify(this.calculateAggrPerformance(allTags, newPerformanceNumbers)))


        // 6. update the app's state with all of the above changes

        this.setState({ allStocks: allStocks,
                        allPositions: newPositions,
                        allCurrentQuotes: newCurrentQuotes,
                        allMonthEndDates: newMonthEndDates,
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

    getTransactionById(transaction_id) {
        return this.state.allTransactions.filter(transaction => transaction.modifiedAt === transaction_id)[0]
    }

    getTransactionsByTicker(ticker) {
        return this.state.allTransactions.filter(transaction => transaction.ticker === ticker)
    }

    getPositionFromSingleTickerTransactions(transactions) { // assumes the transactions are all from a single ticker
        let inflows = 0, outflows = 0, currentShares = 0, date, action, num_shares, ticker, value
        let sortedTransactions = transactions.sort(function(a,b) {
            if (a.date > b.date) {
                return -1
            } else if (a.date < b.date) {
                return -1
            } else {
                return 0
            }
        })
        let position_start_date = '1970/01/01'
        sortedTransactions.forEach(function(transaction) {
            [date, action, num_shares, ticker, value] = transaction.summary.split(' ')
            date = date.substr(0, date.length-1)
            num_shares = parseInt(num_shares)
            value = parseFloat(value.substr(1))
            if (currentShares === 0) {
                position_start_date = date
            }
            if (action === 'buy') {
                outflows += value
                currentShares += num_shares
            } else if (action === 'sell') {
                inflows += value
                currentShares -= num_shares
            }
            if (currentShares === 0) {
                position_start_date = 'n/a'
            }
        })
        let newPosition = {
            symbol: ticker,
            currentShares: currentShares,
            start_date: position_start_date,
            basis: Math.round((outflows > inflows) ? outflows - inflows : 0),
            realized_gains: Math.round((inflows > outflows || currentShares === 0) ? inflows - outflows : 0)
        }

        return newPosition
    }

    getPositionFromCashTransactions(cash_transactions) {
        let total = 0, action, value

        cash_transactions.forEach(function(cash_transaction) {
            [, action, value] = cash_transaction.summary.split(' ')
            let cash_amount = parseFloat(value.substr(1))
            if (action === 'transferIN' || action === 'dividend') {
                total += cash_amount
            } else if (action === 'transferOUT' || action === 'fee') {
                total -= cash_amount
            }
        })
        let newPosition = {
            symbol: 'cash',
            currentShares: total,
            basis: total,
            realized_gains: 0
        }

        return newPosition
    }

    calculateAggrPositionInfo(allTags, allPositions, all_quotes, showCurrentHoldings, showCash) {

        let holdings = (showCurrentHoldings === null) ? this.state.showCurrentHoldings : showCurrentHoldings
        let cash = (showCash === null) ? this.state.showCash : showCash

        let aggr_totalbasis_by_tag = {}, aggr_totalrealized_by_tag = {}, aggr_totalvalue_by_tag = {}
        aggr_totalbasis_by_tag['_everything_'] = 0
        aggr_totalrealized_by_tag['_everything_'] = 0
        aggr_totalvalue_by_tag['_everything_'] = 0
        Object.keys(allTags).forEach(function(tag) {
            aggr_totalrealized_by_tag[tag] = 'n/a';
            aggr_totalbasis_by_tag[tag] = 'n/a';
            aggr_totalvalue_by_tag[tag] = 'n/a';
            Object.keys(allPositions).forEach(function(ticker) {
                if (allTags[tag].includes(ticker)) {
                    aggr_totalrealized_by_tag[tag] = 0 
                    aggr_totalbasis_by_tag[tag] = 0 
                    aggr_totalvalue_by_tag[tag] = 0 
                }
            })
        })
        Object.entries(allPositions).forEach(function(position_info) {
            let ticker = position_info[0]
            let ticker_basis = position_info[1]['basis']
            if (ticker_basis < 0) {
                ticker_basis = 0
            }
            let ticker_realized_gains = position_info[1]['realized_gains']
            let ticker_shares = position_info[1]['currentShares']
            let quote_exists = all_quotes.hasOwnProperty(ticker)
            let ticker_price, ticker_total_value
            if (ticker === 'cash') {
                ticker_price = 1
                ticker_total_value = ticker_price * ticker_shares
            } else if (ticker_shares === 0) {
                ticker_total_value = 0
            } else if (quote_exists) {
                ticker_price = all_quotes[ticker]['current_price']
                ticker_total_value = ticker_price * ticker_shares
                if (ticker_total_value < 0) {
                    ticker_total_value = 0
                }
            } else {
                ticker_total_value = 'err.'
            }
            if ((ticker !== 'cash' && holdings) || (ticker === 'cash' && cash)) {
                aggr_totalbasis_by_tag['_everything_'] += ticker_basis
                aggr_totalrealized_by_tag['_everything_'] += ticker_realized_gains
                if (aggr_totalvalue_by_tag['_everything_'] === 'err.') {
                    aggr_totalvalue_by_tag['_everything_'] = 'err.'
                } else if (ticker_total_value === 'err.') {
                    aggr_totalvalue_by_tag['_everything_'] = 'err.'
                } else {
                    aggr_totalvalue_by_tag['_everything_'] += ticker_total_value
                }
                Object.keys(allTags).forEach(function(tag) {
                    if (allTags[tag].includes(ticker)) {
                        aggr_totalbasis_by_tag[tag] += ticker_basis - ticker_realized_gains
                        aggr_totalrealized_by_tag[tag] += parseFloat(ticker_realized_gains)
                        if (aggr_totalbasis_by_tag[tag] < 0) {
                            aggr_totalbasis_by_tag[tag] = 0
                        }
                        if (aggr_totalvalue_by_tag === 'err.') {
                            aggr_totalvalue_by_tag[tag] = 'err.'
                        } else if (ticker_total_value === 'err.') {
                            aggr_totalvalue_by_tag[tag] = 'err.'
                        } else {
                            aggr_totalvalue_by_tag[tag] += ticker_total_value
                        }
                    }
                })
            }
        })
        if (aggr_totalbasis_by_tag['_everything_'] < 0) {
            aggr_totalbasis_by_tag['_everything_'] = 0
        }

        return [aggr_totalbasis_by_tag, aggr_totalrealized_by_tag, aggr_totalvalue_by_tag]
    }

    calculateAggrPerformance(allTags, all_performance_numbers) {

        let aggr_performance_by_tag = {}
        aggr_performance_by_tag['_everything_'] = {
            shortChangePct: 0,
            mediumChangePct: 0,
            longChangePct: 0,
            num_tickers: 0
        }

        let all_stocks_of_interest = []
        Object.values(allTags).forEach(function(array_of_tickers) {
            array_of_tickers.forEach(ticker => all_stocks_of_interest.push(ticker))
        })
        all_stocks_of_interest = Array.from(new Set(all_stocks_of_interest))

        all_stocks_of_interest.forEach(function(ticker) {

            let short, medium, long, prev_short, prev_medium, prev_long
            if (all_performance_numbers.hasOwnProperty(ticker)) {
                short = all_performance_numbers[ticker]['shortChangePct']
                medium = all_performance_numbers[ticker]['mediumChangePct']
                long = all_performance_numbers[ticker]['longChangePct']
                prev_short = aggr_performance_by_tag['_everything_'].shortChangePct
                prev_medium = aggr_performance_by_tag['_everything_'].mediumChangePct
                prev_long = aggr_performance_by_tag['_everything_'].longChangePct
                aggr_performance_by_tag['_everything_'].shortChangePct = (prev_short === 'err.' || short === 'err.') ? 'err.' : prev_short + short
                aggr_performance_by_tag['_everything_'].mediumChangePct = (prev_medium === 'err.' || medium === 'err.') ? 'err.' : prev_medium + medium
                aggr_performance_by_tag['_everything_'].longChangePct = (prev_long === 'err.' || long === 'err.') ? 'err.' : prev_long + long
            } else {
                short = 'err.'
                medium = 'err.'
                long = 'err.'
                aggr_performance_by_tag['_everything_'].shortChangePct = 'err.'
                aggr_performance_by_tag['_everything_'].mediumChangePct = 'err.'
                aggr_performance_by_tag['_everything_'].longChangePct = 'err.'
            }
            aggr_performance_by_tag['_everything_'].num_tickers += 1

            Object.keys(allTags).forEach(function(tag) {
                if (aggr_performance_by_tag.hasOwnProperty(tag) && allTags[tag].includes(ticker)) {
                    prev_short = aggr_performance_by_tag[tag].shortChangePct
                    prev_medium = aggr_performance_by_tag[tag].mediumChangePct
                    prev_long = aggr_performance_by_tag[tag].longChangePct
                    aggr_performance_by_tag[tag].shortChangePct = (prev_short === 'err.') ? 'err.' : short
                    aggr_performance_by_tag[tag].mediumChangePct = (prev_medium === 'err.') ? 'err.' : medium
                    aggr_performance_by_tag[tag].longChangePct = (prev_long === 'err.') ? 'err.' : long
                    aggr_performance_by_tag[tag].num_tickers += 1
                } else if (allTags[tag].includes(ticker)) {
                    let new_aggr_performance = {}
                    new_aggr_performance['shortChangePct'] = short
                    new_aggr_performance['mediumChangePct'] = medium
                    new_aggr_performance['longChangePct'] = long
                    new_aggr_performance['num_tickers'] = 1
                    aggr_performance_by_tag[tag] = new_aggr_performance
                }
            })
        })

        Object.entries(aggr_performance_by_tag).forEach(function(tag_performance) {
            let tag = tag_performance[0]
            let performance = tag_performance[1]
            Object.keys(performance).filter(time_range => time_range !== 'num_tickers').forEach(function(time_range) {
                if (performance[time_range] !== 'err.') {
                    let value = (performance['num_tickers']) ? performance[time_range] / performance.num_tickers : 'n/a'
                    aggr_performance_by_tag[tag][time_range] = value
                }
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
                new_baseline['shortChangePct'] = this.state.allPerformanceNumbers['S&P500']['shortChangePct']
                new_baseline['mediumChangePct'] = this.state.allPerformanceNumbers['S&P500']['mediumChangePct']
                new_baseline['longChangePct'] = this.state.allPerformanceNumbers['S&P500']['longChangePct']
            } else {
                new_baseline['shortChangePct'] = 0
                new_baseline['mediumChangePct'] = 0
                new_baseline['longChangePct'] = 0
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
        let showCash = (name === 'showCash') ? new_value : this.state.showCash
        let showCurrentHoldings = (name === 'showCurrentHoldings') ? new_value : this.state.showCurrentHoldings
        let aggr_position_info = JSON.parse(JSON.stringify(
            this.calculateAggrPositionInfo(
                this.state.allTags, 
                this.state.allPositions, 
                this.state.allCurrentQuotes, 
                showCurrentHoldings,
                showCash)))

        if (name === 'showCash') {
            this.onWhatifGo(this.state.balance_target_set, this.state.sell_all_of, this.state.balance_target_column, new_value, this.state.remaining_cash)
        }

        this.setState({ 
            [name]: new_value,
            aggrBasis: aggr_position_info[0],
            aggrRealized: aggr_position_info[1],
            aggrTotalValue: aggr_position_info[2],
        })
    }

    onChangeWhatifFormat() {
        let new_whatif_format = (this.state.whatifFormat === 'deltas') ? 'new_values' : 'deltas'
        localStorage.setItem('whatifFormat', JSON.stringify(new_whatif_format))
        this.setState({ whatifFormat: new_whatif_format })
    }

    onChangeSort(new_sort_column) {
        if (new_sort_column === this.state.sortColumn) {
            localStorage.setItem('sort_dir_asc', JSON.stringify(!this.state.sort_dir_asc))
            this.setState(prevState => ({
                sort_dir_asc: !prevState.sort_dir_asc
            }))
        }
        localStorage.setItem('sortColumn', JSON.stringify(new_sort_column))
        this.setState({ sortColumn: new_sort_column })
    }

    showColumns(column_names) {
        this.setState(prevState => {
            let new_shown_column_names = JSON.parse(JSON.stringify(prevState.shown_columns)).map(column => column.name)
            column_names.forEach(function(columnName) {
                if (!new_shown_column_names.includes(columnName)) {
                    new_shown_column_names.push(columnName)
                }
            })
            let new_shown_columns = allColumns.filter(column => new_shown_column_names.includes(column.name))
            localStorage.setItem('shown_columns', JSON.stringify(new_shown_columns))
            return { shown_columns: new_shown_columns }
        })
    }

    onToggleShowColumn(columnName) {
        this.setState(prevState => {
            let new_shown_column_names = JSON.parse(JSON.stringify(prevState.shown_columns)).map(column => column.name)
            if (new_shown_column_names.includes(columnName)) {
                new_shown_column_names.splice(new_shown_column_names.findIndex(name => name === columnName), 1)
            } else {
                new_shown_column_names.push(columnName)
            }
            let new_shown_columns = allColumns.filter(column => new_shown_column_names.includes(column.name))
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

    createConsoleMessageSet(new_message) {
        let newConsoleMessageSet = {
            modifiedAt: new Date().getTime(),
            summary: new_message,
            messages: [new_message],
            hasErrors: (new_message.toUpperCase().startsWith('ERROR:')) ? true : false
        }
        return newConsoleMessageSet
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
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
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
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
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
            Object.keys(newAllTags).forEach(function(tagName) {
                all_tags_for_this_ticker.push(tagName)
            })
            all_tags_for_this_ticker.forEach(function(tag) {
                newAllTags[tag] = newAllTags[tag].filter(ticker => ticker !== delete_ticker)
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // update position
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            delete newAllPositions[delete_ticker]

            // update transactions
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions)).filter(transaction => transaction.ticker !== delete_ticker)
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // add console messages
            let newAllConsoleMessages = [...prevState.allConsoleMessages]
            let newConsoleMessageSet = this.createConsoleMessageSet('Ticker "' + delete_ticker + '" has now been deleted.')
            newAllConsoleMessages.push(newConsoleMessageSet)

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    newAllPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags, 
                allPositions: newAllPositions, 
                allTransactions: newAllTransactions, 
                allConsoleMessages: newAllConsoleMessages,
                last_console_message: newConsoleMessageSet.summary + ((newConsoleMessageSet.messages.hasErrors) ? ' See the "Messages" tab.' : ''),
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onNewTransaction(new_transaction_summary) {
        let date, action, num_shares, ticker, total
        [date, action, num_shares, ticker, total]  = new_transaction_summary.split(' ')
        date = date.substr(0, date.length-1)
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
            let new_transaction = { 
                modifiedAt: new Date().getTime(),
                date: date,
                ticker: ticker,
                action: action,
                shares: num_shares,
                total: total,
                summary: new_transaction_summary
            }
            newAllTransactions.push(new_transaction)
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // recalculate the position numbers
            let orig_start_date, orig_basis = 0, orig_current_shares = 0, orig_realized_gains = 0
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            if (newAllPositions.hasOwnProperty(ticker) && newAllPositions[ticker] !== null) {
                orig_start_date = newAllPositions[ticker]['start_date']
                orig_basis = newAllPositions[ticker]['basis']
                orig_current_shares = newAllPositions[ticker]['currentShares']
                orig_realized_gains = newAllPositions[ticker]['realized_gains']
            }
            let new_current_shares = (action === 'buy') ? orig_current_shares + num_shares : orig_current_shares - num_shares
            let new_start_date
            if (orig_start_date === undefined) {
                new_start_date = date
            } else {
                new_start_date = (new Date(date) < new Date(orig_start_date)) ? date : orig_start_date
            }
            let updatedPosition = {
                currentShares: new_current_shares,
                start_date: (new_current_shares) ? new_start_date : 'n/a',
                symbol: ticker,
                basis: (action === 'buy') ? orig_basis + total : orig_basis - total,
                realized_gains: (action === 'sell') ? orig_realized_gains + total : orig_realized_gains
            }
            if (updatedPosition['basis'] < 0) {
                updatedPosition['basis'] = 0
            }
            newAllPositions[ticker] = updatedPosition

            // recalculate the cash position numbers
            orig_current_shares = (newAllPositions.hasOwnProperty('cash')) ? newAllPositions['cash'].currentShares : 0
            new_current_shares = (action === 'buy') ? orig_current_shares - total : orig_current_shares + total
            let updatedCashPosition = {
                currentShares: new_current_shares,
                symbol: 'cash',
                basis: new_current_shares,
                realized_gains: 0
            }
            newAllPositions['cash'] = updatedCashPosition

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags,
                    newAllPositions,
                    this.state.allCurrentQuotes, 
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
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

    onImportTransactions(file_contents) {

        let imported_tickers = []

        let imported_transactions = JSON.parse(JSON.stringify(file_contents.transactions))
        imported_transactions.forEach( transaction => imported_tickers.push(transaction.ticker) )

        let imported_risk = JSON.parse(JSON.stringify(file_contents.risk))
        Object.keys(imported_risk).forEach( ticker => imported_tickers.push(ticker))

        let all_stocks_of_interest = Array.from(new Set(imported_tickers))
        this.setState(prevState => {

            // update the "untagged" tag so that all added tickers belong to a tag
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            let already_added = []
            Object.keys(newAllTags).forEach(function(tag) {
                newAllTags[tag].forEach(function(ticker) {
                    if (!already_added.includes(ticker)) {
                        already_added.push(ticker)
                    }
                })
            })
            all_stocks_of_interest.forEach( function(ticker) {
                if (!already_added.includes(ticker) && ticker !== 'cash') {
                    newAllTags['untagged'].push(ticker)
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // replace the stored transactions
            localStorage.setItem('allTransactions', JSON.stringify(imported_transactions))

            // replace the stored risk
            localStorage.setItem('allRisk', JSON.stringify(imported_risk))

            return
        })

        window.location.reload(false)
    }

    onNewCash(new_cash_transaction_summary) {
        let date, action, total
        [date, action, total]  = new_cash_transaction_summary.split(' ')
        date = date.substr(0, date.length-1)
        total = parseFloat(total.substr(1))
        this.setState(prevState => {

            // update transaction info
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            let new_cash_transaction = { 
                modifiedAt: new Date().getTime(),
                date: date,
                ticker: 'cash',
                action: action,
                shares: total,
                total: total,
                summary: new_cash_transaction_summary
            }
            newAllTransactions.push(new_cash_transaction)
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // recalculate the position numbers
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            let orig_current_shares = 0
            if (newAllPositions.hasOwnProperty('cash')) {
                orig_current_shares = newAllPositions['cash']['currentShares']
            }
            let new_cash = (action === 'dividend' || action === 'transferIN') ? orig_current_shares + total : orig_current_shares - total
            let updatedPosition = {
                symbol: 'cash',
                basis: (new_cash >= 0) ? new_cash : 0,
                currentShares: new_cash,
                realized_gains: 0
            }
            newAllPositions['cash'] = updatedPosition

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    this.state.allTags, 
                    newAllPositions,
                    this.state.allCurrentQuotes, 
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
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

    onDeleteTransaction(delete_transaction_id) {

        let transaction_to_delete = this.getTransactionById(delete_transaction_id)
        let ticker = transaction_to_delete.ticker

        this.setState(prevState => {

            // update transactions
            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions)).filter(transaction => transaction.modifiedAt !== delete_transaction_id)
            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))

            // add console messages
            let newAllConsoleMessages = [...prevState.allConsoleMessages]
            let newConsoleMessageSet = this.createConsoleMessageSet('Transaction "' + transaction_to_delete.summary + '" has now been deleted.')
            newAllConsoleMessages.push(newConsoleMessageSet)

            // recalculate the position numbers
            let remainingTransactionsForTicker = newAllTransactions.filter(transaction => transaction.ticker === ticker)
            let newAllPositions = JSON.parse(JSON.stringify(prevState.allPositions))
            let updatedPosition
            if (!remainingTransactionsForTicker.length) {
                delete newAllPositions[ticker]
            } else {
                if (ticker === 'cash') {
                    updatedPosition = this.getPositionFromCashTransactions(remainingTransactionsForTicker)
                } else {
                    updatedPosition = this.getPositionFromSingleTickerTransactions(remainingTransactionsForTicker)
                }
                newAllPositions[ticker] = updatedPosition
            }

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    this.state.allTags,
                    newAllPositions,
                    this.state.allCurrentQuotes, 
                    this.state.showCurrentHoldings,
                    this.state.showCash)))

            return { 
                allPositions: newAllPositions, 
                allTransactions: newAllTransactions, 
                allConsoleMessages: newAllConsoleMessages,
                last_console_message: newConsoleMessageSet.summary + ((newConsoleMessageSet.messages.hasErrors) ? ' See the "Messages" tab.' : ''),
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
            }
        })
    }

    onRemoveFromTag(remove_from_tag, remove_ticker) {
        this.setState(prevState => {
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            newAllTags[remove_from_tag] = newAllTags[remove_from_tag].filter(ticker => ticker !== remove_ticker)

            // assign ticker to "untagged" if it is losing its last (user) tag
            let all_other_tags_for_this_ticker = []
            Object.keys(newAllTags).forEach(function(tagName) {
                if (tagName !== remove_from_tag && tagName !== 'untagged' && newAllTags[tagName].includes(remove_ticker)) {
                    all_other_tags_for_this_ticker.push(tagName)
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
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
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

    onDeleteTags(delete_tags) {
        this.setState(prevState => {

            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            let tickers_losing_a_tag = []
            delete_tags.forEach(function(tag) {
                tickers_losing_a_tag = tickers_losing_a_tag.concat(newAllTags[tag])
                delete newAllTags[tag]
            })

            // assign tickers to "untagged" if they are losing their last (user) tag
            let all_other_tagged_tickers = []
            Object.keys(newAllTags).forEach(function(tagName) {
                if (tagName !== 'untagged') {
                    all_other_tagged_tickers = all_other_tagged_tickers.concat(newAllTags[tagName])
                }
            })
            tickers_losing_a_tag.forEach(function(ticker) {
                let newUntagged = newAllTags['untagged']
                if (!all_other_tagged_tickers.includes(ticker) && !newUntagged.includes(ticker)) {
                    newUntagged.push(ticker)
                    newAllTags['untagged'] = newUntagged
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))

            // add console messages
            let newAllConsoleMessages = [...prevState.allConsoleMessages]
            let summary, newMessages = []
            delete_tags.forEach(function(tag) {
                newMessages.push('Tag "' + tag + '" has now been deleted.')
            })
            if (newMessages.length === 1) {
                summary = 'Tag "' + delete_tags[0] + '" has now been deleted.'
            } else {
                summary = 'Deleted ' + delete_tags.length + ' tags.'
            }
            let newConsoleMessageSet = this.createConsoleMessageSet(summary)
            if (newMessages.length > 1) {
                newConsoleMessageSet.messages = [...newMessages]
            }
            newAllConsoleMessages.push(newConsoleMessageSet)

            // recalculate the aggregate numbers
            let aggr_position_info = JSON.parse(JSON.stringify(
                this.calculateAggrPositionInfo(
                    newAllTags, 
                    this.state.allPositions, 
                    this.state.allCurrentQuotes, 
                    this.state.showCurrentHoldings,
                    this.state.showCash)))
            let aggr_performance = JSON.parse(JSON.stringify(
                this.calculateAggrPerformance(
                    newAllTags, 
                    this.state.allPerformanceNumbers)))

            return { 
                allTags: newAllTags, 
                allConsoleMessages: newAllConsoleMessages,
                last_console_message: newConsoleMessageSet.summary + ((newConsoleMessageSet.messages.hasErrors) ? ' See the "Messages" tab.' : ''),
                aggrBasis: aggr_position_info[0],
                aggrRealized: aggr_position_info[1],
                aggrTotalValue: aggr_position_info[2],
                aggrPerformance: aggr_performance,
            }
        })
    }

    onEditCell(rowName) {
        this.setState(prevState => {
            if (
                prevState.editing_row !== rowName
                && rowName !== this.props.editing_row
                && !this.nameIsAnAggregate(rowName)
                && !this.nameIsSpecial(rowName)
            ) {
                return { editing_row: rowName }
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
                newAllRisk[ticker]['modifiedAt'] = new Date().getTime()
            } else {
                let newRisk = { 
                    modifiedAt: new Date().getTime(),
                    factor: parseFloat(new_value) 
                }
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

    onNewConsoleMessages(newConsoleMessageSet) {
        this.setState(prevState => {
            let newAllConsoleMessages = JSON.parse(JSON.stringify(prevState.allConsoleMessages))
            newAllConsoleMessages.push(newConsoleMessageSet)
            return { 
                last_console_message: newConsoleMessageSet.summary + ((newConsoleMessageSet.messages.hasErrors) ? ' See the "Messages" tab.' : ''),
                allConsoleMessages: newAllConsoleMessages }
        })
    }

    clearLastConsoleMessage() {
        this.setState({ last_console_message: ' ' })
    }

    daysAgo(date_str) { // yyyy-mm-dd
        let now = new Date()
        let then = new Date(date_str)
        let days_ago = Math.round((now - then) / 1000 / 60 / 60 / 24)
        if (date_str === 'n/a') {
            return -1
        } else {
            return days_ago
        }
    }

    currentQuoteExists(ticker) {
        if (this.state.allCurrentQuotes.hasOwnProperty(ticker)) {
            return true
        } else {
            return false
        }
    }

    getClosingPrice(ticker, date, data) {
        if (data.hasOwnProperty(ticker)) {
            if (data[ticker].hasOwnProperty(date)) {
                return data[ticker][date].adjustedClose
            }
        }
        return undefined
    }

    getMostRecentClosingPrice(ticker, data) {
        if (data.hasOwnProperty(ticker)) {
            return data[ticker].current_price
        }
        return undefined
    }

    getCurrentValue(ticker) {
        if (this.state.allPositions.hasOwnProperty(ticker)) {
            return this.state.allCurrentQuotes[ticker].current_price * this.state.allPositions[ticker].currentShares
        } else {
            return 0
        }
    }

    getCurrentShares(ticker) {
        if (this.state.allPositions.hasOwnProperty(ticker)) {
            return this.state.allPositions[ticker].currentShares
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

    getMaxBalanceableValue(target_set, sell_all_set, target_column) {
        let include_cash = true
        return this.getBalanceableValue(target_set, sell_all_set, target_column, include_cash)
    }

    getBalanceableValue(target_set, sell_all_set, target_column, include_cash) {

        let self = this
        let balanceable_value = 0

        let current_cash_value = 0
        if (include_cash && this.state.showCash && this.state.allPositions.hasOwnProperty('cash')) {
            current_cash_value = self.state.allPositions['cash'].currentShares * self.state.allCurrentQuotes['cash'].current_price
        }
        balanceable_value += current_cash_value

        let target_tickers = this.getTickersFromSet(target_set)
        if ( (target_set === 'my_current_holdings' && this.state.showCurrentHoldings)
            || (target_set === 'untagged' && this.state.showUntagged) 
            || (target_set !== 'my_current_holdings' && target_set !== 'untagged') ) {
            target_tickers.forEach( function(ticker) {
                let currentValue = self.state.allPositions[ticker].currentShares * self.state.allCurrentQuotes[ticker].current_price
                if (target_column === 'currentValue' || target_column === 'value_at_risk' || target_column === 'only_profits') {
                    balanceable_value += currentValue
                } else if (target_column === 'basis' || target_column === 'basis_risked') {
                    if (sell_all_set.includes(ticker)) {
                        balanceable_value += currentValue
                    } else {
                        balanceable_value += self.state.allPositions[ticker].basis
                    }
                }
            })
        }

        return balanceable_value
    }

    onWhatifSubmit(target_set, sell_all_of, target_column, remaining_cash) {
        this.setState({ 
            remaining_cash: remaining_cash, 
            balance_target_set: target_set, 
            sell_all_of: sell_all_of,
            balance_target_column: target_column 
            })
        let column = target_column
        let show_whatif_columns = ['currentShares', 'whatif_current_shares']
        if (target_column === 'only_profits') {
            column = 'basis'
        }
        show_whatif_columns.push(column)
        show_whatif_columns.push('whatif-'+column)
        if (target_column === 'only_profits') {
            show_whatif_columns.push('profit')
        }
        if (target_column.includes('risk')) {
            show_whatif_columns.push('risk_factor')
        }
        this.showColumns(show_whatif_columns)
        this.onWhatifGo(target_set, sell_all_of, target_column, this.state.showCash, remaining_cash)
    }

    onWhatifGo(target_set, sell_all_set, target_column, showCash, remaining_cash) {

        let self = this
        let adjusting_cash = showCash && (remaining_cash !== null || target_column === 'only_profits')
        let original_cash_position = (this.state.allPositions.hasOwnProperty('cash')) ? this.state.allPositions['cash'].currentShares * this.state.allCurrentQuotes['cash'].current_price : 0

        // determine the total value to be balanced
        let total_amount_to_balance = this.getBalanceableValue(target_set, sell_all_set, target_column, adjusting_cash)
        if (adjusting_cash) {
            total_amount_to_balance -= remaining_cash
        }

        // determine the tickers to balance across
        let target_tickers = this.getTickersFromSet(target_set)

        // determine these tickers' what-if values for each relevant column
        let new_whatif = {
            balance_target_column: target_column,
            values: {}
        }

        let actual_remaining_cash = original_cash_position
        let risk_factors = {}
        target_tickers.forEach(function(ticker) {
            if (self.state.allRisk.hasOwnProperty(ticker)){
                risk_factors[ticker] = self.state.allRisk[ticker].factor
            } else {
                risk_factors[ticker] = 0.20
            }
        })
        let target = total_amount_to_balance / target_tickers.filter(ticker => !sell_all_set.includes(ticker)).length
        target_tickers.forEach(function(ticker) {

            let whatif_currentshares, whatif_balancedvalue
            
            new_whatif.values[ticker] = {}

            let value_delta = 0
            let original_currentvalue = self.getCurrentValue(ticker)
            let original_basis = self.getBasis(ticker)

            if (target_column === 'currentValue' || target_column === 'basis' || target_column === 'only_profits') {
                if (sell_all_set.includes(ticker)) {
                    new_whatif.values[ticker]['currentShares'] = 0
                    new_whatif.values[ticker]['basis'] = 0
                    new_whatif.values[ticker]['basis_risked'] = 0
                    new_whatif.values[ticker]['currentValue'] = 0
                    new_whatif.values[ticker]['value_at_risk'] = 0
                    if (adjusting_cash) {
                        actual_remaining_cash += original_currentvalue 
                    }
                    return
                }
            }

            // balancing by value is a simple average of current values
            if (target_column === 'currentValue') {

                whatif_currentshares = Math.floor(target / self.state.allCurrentQuotes[ticker].current_price)
                new_whatif.values[ticker]['currentShares'] = whatif_currentshares

                whatif_balancedvalue = whatif_currentshares * self.state.allCurrentQuotes[ticker].current_price
                new_whatif.values[ticker]['currentValue'] = whatif_balancedvalue

                value_delta = whatif_balancedvalue - original_currentvalue
                let whatif_basis = original_basis + value_delta
                if (whatif_basis < 0) {
                    whatif_basis = 0
                }
                new_whatif.values[ticker]['basis'] = whatif_basis
                new_whatif.values[ticker]['basis_risked'] = whatif_basis * risk_factors[ticker]

                new_whatif.values[ticker]['value_at_risk'] = whatif_balancedvalue * risk_factors[ticker]

            // balancing by basis must account for sunk costs too; current value is not enough
            } else if (target_column === 'basis') {

                let original_currentshares = self.getCurrentShares(ticker)
                let target_delta = target - original_basis
                let target_delta_shares
                if (target_delta >= 0) {
                    target_delta_shares = Math.floor(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                } else {
                    target_delta_shares = Math.ceil(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                }
                whatif_currentshares = original_currentshares + target_delta_shares
                new_whatif.values[ticker]['currentShares'] = whatif_currentshares

                let whatif_balancedbasis = original_basis + target_delta_shares * self.state.allCurrentQuotes[ticker].current_price
                if (whatif_balancedbasis < 0) {
                    whatif_balancedbasis = 0
                }
                new_whatif.values[ticker]['basis'] = whatif_balancedbasis
                new_whatif.values[ticker]['basis_risked'] = whatif_balancedbasis * risk_factors[ticker]

                value_delta = whatif_balancedbasis - original_basis
                new_whatif.values[ticker]['currentValue'] = original_currentvalue + value_delta

                new_whatif.values[ticker]['value_at_risk'] = new_whatif.values[ticker]['currentValue'] * risk_factors[ticker]

            } else if (target_column === 'only_profits') {

                let original_currentshares = self.getCurrentShares(ticker)
                let original_currentvalue = original_currentshares * self.state.allCurrentQuotes[ticker].current_price
                let target_delta_shares
                let losing = (original_basis > original_currentvalue) ? true : false
                if (losing) {
                    whatif_currentshares = 0
                } else {
                    let target_delta = original_basis
                    target_delta_shares = -1 * Math.ceil(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                    whatif_currentshares = original_currentshares + target_delta_shares
                }
                new_whatif.values[ticker]['currentShares'] = whatif_currentshares

                if (losing || sell_all_set.includes(ticker)) {
                    new_whatif.values[ticker]['basis'] = 'n/a'
                    new_whatif.values[ticker]['basis_risked'] = 'n/a'
                    new_whatif.values[ticker]['currentValue'] = 0
                    new_whatif.values[ticker]['value_at_risk'] = 'n/a'
                    value_delta = -1 * original_currentvalue
                } else {
                    let whatif_basis = whatif_currentshares * self.state.allCurrentQuotes[ticker].current_price
                    new_whatif.values[ticker]['basis'] = whatif_basis
                    new_whatif.values[ticker]['basis_risked'] = whatif_basis * risk_factors[ticker]

                    let whatif_currentvalue = whatif_currentshares * self.state.allCurrentQuotes[ticker].current_price
                    value_delta = whatif_currentvalue - original_currentvalue
                    new_whatif.values[ticker]['currentValue'] = whatif_currentvalue
                    new_whatif.values[ticker]['value_at_risk'] = whatif_currentvalue * risk_factors[ticker]
                }
            }

            if (adjusting_cash) {
                actual_remaining_cash -= value_delta 
            }
        })

        // RISK BALANCING ALGORITHM:
        //
        // given:
        //   3 positions (tickers)
        //   ticker risk factors a, b, c 
        //   and total portfolio value Vtot 
        //
        // need to solve for:
        //   ticker position values V1, V2, V3 
        //
        // total portfolio value is the sum of each position:
        //   V1 + V2 + V3 = Vtot
        //
        // for balanced risk, each weighted position must be equal:
        //   aV1 + bV2 + cV3 = TotalRisk, where aV1 = bV2 = cV3
        // 
        // solving the first equation for V1 using substitution:
        //   V1 = (Vtot * bc) / (bc + ac + ab)      <== "numerator" / "denominator"
        //
        // extending this for 4 and 5 positions:
        //   4 positions... V1 = (Vtot * bcd) / (bcd + acd + abd + abc)
        //   5 positions... V1 = (Vtot * bcde) / (bcde + acde + abde + abce + abcd)
        //
        // then solve for the other ticker positions:
        //   V2 = aV1/b, V3 = aV1/c, V4 = aV1/d, V5=aV1/e
        //
        // The above applies to risk-balancing VALUE. This results in each position currently
        // having the same dollar value at risk right now. Similarly, in order to risk-balance 
        // by BASIS, the same formula may be used except with Btot (total basis) in the numerator.
        // This results in each position having the same amount of sunk investment dollars at risk,
        // it is unaffected by each position's current stock price.

        // balancing by risk requires a complicated algorithm (shown above)
        if (target_column === 'value_at_risk' || target_column === 'basis_risked') {

            let target_nonzero_tickers = target_tickers.filter(ticker => !sell_all_set.includes(ticker))
            
            // determine the numerator
            let numerator_product = 1
            target_nonzero_tickers.forEach(function(ticker, idx) {
                if (idx !== 0) {
                    numerator_product *= risk_factors[ticker]
                }
            })
            let numerator = total_amount_to_balance * numerator_product

            // determine the denominator
            let denominator_terms = Array(target_nonzero_tickers.length).fill(1)
            target_nonzero_tickers.forEach(function(ticker, ticker_idx) {
                denominator_terms.forEach(function(term, term_idx) {
                    if (ticker_idx !== term_idx) {
                        denominator_terms[term_idx] = term * risk_factors[ticker]
                    }
                })
            })
            let denominator = denominator_terms.reduce( (accumulator, currentValue) => accumulator + currentValue, 0 )

            // determine the target value for each ticker; each will be different if their risk factors are different
            let nonzero_targets = Array(target_nonzero_tickers.length).fill(0)
            nonzero_targets[0] = numerator / denominator
            target_nonzero_tickers.forEach(function(ticker, idx) {
                if (idx !== 0) {
                    nonzero_targets[idx] = Math.round(nonzero_targets[0] * risk_factors[target_nonzero_tickers[0]] / risk_factors[ticker])
                }
            })
            let targets = Array(target_tickers.length).fill(0)
            target_nonzero_tickers.forEach(function (nonzero_ticker, nonzero_i) {
                let i = target_tickers.indexOf(nonzero_ticker)
                targets[i] = nonzero_targets[nonzero_i]
            })

            // for each ticker, use its target to derive the other metrics
            target_tickers.forEach(function(ticker, idx) {
                if (!new_whatif.values.hasOwnProperty(ticker)) {
                    new_whatif.values[ticker] = {}
                }
                let original_currentvalue = self.getCurrentValue(ticker)
                let original_basis = self.getBasis(ticker)
                let value_delta, target = targets[idx]

                // for values, "target" is the target market value for this position
                if (target_column === 'value_at_risk') {

                    let whatif_currentshares = Math.floor(target / self.state.allCurrentQuotes[ticker].current_price)
                    new_whatif.values[ticker]['currentShares'] = whatif_currentshares

                    let whatif_balancedvalue = whatif_currentshares * self.state.allCurrentQuotes[ticker].current_price
                    new_whatif.values[ticker]['currentValue'] = whatif_balancedvalue

                    value_delta = whatif_balancedvalue - original_currentvalue
                    let whatif_basis = original_basis + value_delta
                    if (whatif_basis < 0) {
                        whatif_basis = 0
                    }
                    new_whatif.values[ticker]['basis'] = whatif_basis
                    new_whatif.values[ticker]['basis_risked'] = whatif_basis * risk_factors[ticker]

                    new_whatif.values[ticker]['value_at_risk'] = whatif_balancedvalue * risk_factors[ticker]

                // for bases, "target" is the target basis for this position
                } else if (target_column === 'basis_risked') {

                    let original_currentshares = self.getCurrentShares(ticker)
                    let target_delta = target - original_basis
                    let target_delta_shares
                    if (target === 0) {
                        new_whatif.values[ticker]['currentShares'] = 0
                        new_whatif.values[ticker]['basis'] = 0
                        new_whatif.values[ticker]['basis_risked'] = 0
                        new_whatif.values[ticker]['currentValue'] = 0
                        new_whatif.values[ticker]['value_at_risk'] = 0
                        value_delta = -1 * original_currentvalue
                    } else {
                        if (target_delta >= 0) {
                            target_delta_shares = Math.floor(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                        } else {
                            target_delta_shares = Math.ceil(target_delta / self.state.allCurrentQuotes[ticker].current_price)
                        }
                        let whatif_currentshares = original_currentshares + target_delta_shares
                        new_whatif.values[ticker]['currentShares'] = whatif_currentshares

                        let whatif_balancedbasis = original_basis + target_delta_shares * self.state.allCurrentQuotes[ticker].current_price
                        if (whatif_balancedbasis < 0) {
                            whatif_balancedbasis = 0
                        }
                        new_whatif.values[ticker]['basis'] = whatif_balancedbasis
                        new_whatif.values[ticker]['basis_risked'] = whatif_balancedbasis * risk_factors[ticker]
        
                        value_delta = whatif_balancedbasis - original_basis
                        new_whatif.values[ticker]['currentValue'] = original_currentvalue + value_delta
        
                        new_whatif.values[ticker]['value_at_risk'] = new_whatif.values[ticker]['currentValue'] * risk_factors[ticker]
                    }
                }

                if (adjusting_cash) {
                    actual_remaining_cash -= value_delta 
                }
            })
        }

        if (adjusting_cash) {
            new_whatif.values['cash'] = {}
            new_whatif.values['cash']['currentShares'] = actual_remaining_cash
            new_whatif.values['cash']['currentValue'] = actual_remaining_cash
            new_whatif.values['cash']['basis'] = actual_remaining_cash
            new_whatif.values['cash']['value_at_risk'] = 0
        }
        this.setState({ allWhatifs: new_whatif.values, balance_target_column: new_whatif.balance_target_column })
    }

    getCurrentHoldings() {
        return Object.entries(this.state.allPositions).filter(holding => holding[1]['currentShares'] !== 0).map(holding => holding[0])
    }

    getPreviousHoldings() {
        return Object.entries(this.state.allPositions).filter(holding => holding[1]['currentShares'] === 0).map(holding => holding[0])
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

    getTickersFromSet(set) {
        let tickers = []
        if (set === 'my_current_holdings') {
            tickers = [...this.getCurrentHoldings().filter( ticker => ticker !== 'cash' )]
        } else if (set === 'untagged') {
            tickers = [...this.getUntagged()]
        } else {
            tickers = this.state.allTags[set]
        }
        return tickers
    }

    populateSymbolCount(grid_rows) {
        if (this.state.show_index) {
            grid_rows -= 1
        }
        if (this.state.showCash) {
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

        let sortColumn = this.state.sortColumn
        let quote_columns = ['current_price', 'change_pct', 'quote_date', 'volume', 'dollar_volume']
        let holdings_columns = ['start_date', 'currentShares', 'currentValue', 'percentValue', 'value_at_risk', 'basis', 'basis_risked', 'realized_gains', 'percentBasis', 'profit', 'percent_profit']
        let performance_columns = ['shortChangePct', 'mediumChangePct', 'longChangePct']

        let sorted_names_list = [...names_list]
        let self = this
        sorted_names_list.sort(function(a,b) {
            let value_a, value_b

            // pin certain names to the top, regardless of the user sort
            if (sortColumn === 'symbol') {
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
            } else if (quote_columns.includes(sortColumn)) {
                if (self.nameIsAnAggregate(a) || !self.state.allCurrentQuotes.hasOwnProperty(a)) {
                    value_a = 'n/a'
                } else {
                    if (sortColumn === 'dollar_volume') {
                        value_a = self.state.allCurrentQuotes[a]['current_price'] * self.state.allCurrentQuotes[a]['volume']
                    } else {
                        value_a = self.state.allCurrentQuotes[a][sortColumn]
                    }
                }
                if (self.nameIsAnAggregate(b) || !self.state.allCurrentQuotes.hasOwnProperty(b)) {
                    value_b = 'n/a'
                } else {
                    if (sortColumn === 'dollar_volume') {
                        value_b = self.state.allCurrentQuotes[b]['current_price'] * self.state.allCurrentQuotes[b]['volume']
                    } else {
                        value_b = self.state.allCurrentQuotes[b][sortColumn]
                    }
                }

            // sort by a performance column
            } else if (performance_columns.includes(sortColumn)) {
                if (self.nameIsAnAggregate(a) && self.state.aggrPerformance.hasOwnProperty(a)) {
                    value_a = self.state.aggrPerformance[a][sortColumn]
                } else if (!self.nameIsAnAggregate(a) && self.state.allPerformanceNumbers.hasOwnProperty(a)) {
                    value_a = self.state.allPerformanceNumbers[a][sortColumn]
                } else {
                    value_a = 'n/a'
                }
                if (self.nameIsAnAggregate(b) && self.state.aggrPerformance.hasOwnProperty(b)) {
                    value_b = self.state.aggrPerformance[b][sortColumn]
                } else if (!self.nameIsAnAggregate(b) && self.state.allPerformanceNumbers.hasOwnProperty(b)) {
                    value_b = self.state.allPerformanceNumbers[b][sortColumn]
                } else {
                    value_b = 'n/a'
                }

            // sort by a holdings column
            } else if (holdings_columns.includes(sortColumn)) {
                let positionvalue_a, positionvalue_b, basis_a, basis_b
                if (self.nameIsAnAggregate(a)) {
                    switch(sortColumn) {
                        case 'currentShares':
                            value_a = 'n/a'
                            break;
                        case 'currentValue':
                        case 'percentValue':
                            value_a = self.state.aggrTotalValue[a]
                            break;
                        case 'basis':
                        case 'percentBasis':
                            value_a = self.state.aggrBasis[a]
                            break;
                        case 'realized_gains':
                            value_a = self.state.aggrRealized[a]
                            break;
                        case 'profit':
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
                    if (sortColumn === 'currentValue' || sortColumn === 'percentValue' || sortColumn === 'profit' || sortColumn === 'percent_profit' || sortColumn === 'value_at_risk') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(a)) {
                            positionvalue_a = self.state.allPositions[a]['currentShares'] * self.state.allCurrentQuotes[a]['current_price']
                            if ( (sortColumn === 'profit' || sortColumn === 'percent_profit') && positionvalue_a !== 0) {
                                basis_a = self.state.allPositions[a]['basis']
                                value_a = (basis_a >= 0) ? 1 - (basis_a / positionvalue_a) : 'losing'
                            } else if (sortColumn === 'value_at_risk' && positionvalue_a !== 0 && self.state.allRisk.hasOwnProperty(a)) {
                                value_a = positionvalue_a * self.state.allRisk[a].factor
                            } else {
                                value_a = positionvalue_a
                            }
                        } else {
                            value_a = 'n/a'
                        }
                    } else if (self.state.allPositions[a]['currentShares']) {
                        if (sortColumn === 'basis_risked' && self.state.allRisk.hasOwnProperty(a)) {
                            value_a = self.state.allPositions[a]['basis'] * self.state.allRisk[a]['factor']
                        } else if (sortColumn === 'percentBasis') {
                            value_a = self.state.allPositions[a]['basis']
                        } else {
                            value_a = self.state.allPositions[a][sortColumn]
                        }
                    } else {
                        value_a = 'n/a'
                    }
                } else {
                    value_a = 'n/a'
                }
                if (self.nameIsAnAggregate(b)) {
                    switch(sortColumn) {
                        case 'currentShares':
                            value_b = 'n/a'
                            break;
                        case 'currentValue':
                        case 'percentValue':
                            value_b = self.state.aggrTotalValue[b]
                            break;
                        case 'basis':
                        case 'percentBasis':
                            value_b = self.state.aggrBasis[b]
                            break;
                        case 'realized_gains':
                            value_b = self.state.aggrRealized[b]
                            break;
                        case 'profit':
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
                    if (sortColumn === 'currentValue' || sortColumn === 'percentValue' || sortColumn === 'profit' || sortColumn === 'percent_profit' || sortColumn === 'value_at_risk') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(b)) {
                            positionvalue_b = self.state.allPositions[b]['currentShares'] * self.state.allCurrentQuotes[b]['current_price']
                            if ( (sortColumn === 'profit' || sortColumn === 'percent_profit') && positionvalue_b !== 0) {
                                basis_b = self.state.allPositions[b]['basis']
                                value_b = (basis_b >= 0) ? 1 - (basis_b / positionvalue_b) : 'losing'
                            } else if (sortColumn === 'value_at_risk' && positionvalue_b !== 0 && self.state.allRisk.hasOwnProperty(b)) {
                                value_b = positionvalue_b * self.state.allRisk[b].factor
                            } else {
                                value_b = positionvalue_b
                            }
                        } else {
                            value_b = 'n/a'
                        }
                    } else if (self.state.allPositions[b]['currentShares']) {
                        if (sortColumn === 'basis_risked' && self.state.allRisk.hasOwnProperty(b)) {
                            value_b = self.state.allPositions[b]['basis'] * self.state.allRisk[b]['factor']
                        } else if (sortColumn === 'percentBasis') {
                            value_b = self.state.allPositions[b]['basis']
                        } else {
                            value_b = self.state.allPositions[b][sortColumn]
                        }
                    } else {
                        value_b = 'n/a'
                    }
                } else {
                    value_b = 'n/a'
                }

            // miscelaneous columns
            } else if (sortColumn === 'risk_factor') {
                value_a = (self.state.allRisk.hasOwnProperty(a)) ? self.state.allRisk[a].factor : (a === 'cash') ? 0 : 0.20
                value_b = (self.state.allRisk.hasOwnProperty(b)) ? self.state.allRisk[b].factor : (b === 'cash') ? 0 : 0.20

            } else if (sortColumn === 'risk_factor_modified') {
                value_a = (self.state.allRisk.hasOwnProperty(a)) ? self.state.allRisk[a].modifiedAt : 'n/a'
                value_b = (self.state.allRisk.hasOwnProperty(b)) ? self.state.allRisk[b].modifiedAt : 'n/a'

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
            if (this.state.showCurrentHoldings) {
                tickers_to_show = [...tickers_to_show, ...this.getCurrentHoldings()].filter(ticker => ticker !== 'cash')
            }
            if (this.state.showPreviousHoldings) {
                tickers_to_show = [...tickers_to_show, ...this.getPreviousHoldings()].filter(ticker => ticker !== 'cash')
            }
            if (this.state.showCash) {
                tickers_to_show.push('cash')
            }
            if (this.state.showTagged) {
                tickers_to_show = [...tickers_to_show, ...this.getTagged()]
            }
            if (this.state.showUntagged) {
                tickers_to_show = [...tickers_to_show, ...this.getUntagged()]
            }
        }
        let unique_tickers_to_show = Array.from(new Set(tickers_to_show))
        let sortTriangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
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

            let specialClasses = []
            if (self.tickerIsIndex(ticker)) {
                specialClasses.push('index')
            }
            if (ticker === 'cash') {
                specialClasses.push('cash')
            }
            row_data[ticker]['specialClasses'] = specialClasses

            if (self.state.allPositions.hasOwnProperty(ticker)) {
                row_data[ticker]['start_date'] = self.state.allPositions[ticker].start_date
                row_data[ticker]['basis'] = self.state.allPositions[ticker].basis
                row_data[ticker]['currentShares'] = self.state.allPositions[ticker].currentShares
                row_data[ticker]['realized_gains'] = self.state.allPositions[ticker].realized_gains
            } else {
                row_data[ticker]['start_date'] = 'n/a'
                row_data[ticker]['basis'] = 'n/a'
                row_data[ticker]['currentShares'] = 'n/a'
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
            new_aggr_data['specialClasses'] = ['aggregate']
            new_aggr_data['basis'] = 'n/a'
            new_aggr_data['start_date'] = 'n/a'
            new_aggr_data['currentShares'] = 'n/a'
            new_aggr_data['current_price'] = 'n/a'
            new_aggr_data['currentValue'] = self.state.aggrTotalValue[aggr_ticker]
            new_aggr_data['change_pct'] = 'n/a'
            new_aggr_data['volume'] = 'n/a'
            new_aggr_data['basis'] = self.state.aggrBasis[aggr_ticker]
            new_aggr_data['realized_gains'] = self.state.aggrRealized[aggr_ticker]
            new_aggr_data['performance'] = self.state.aggrPerformance[aggr_ticker]
            new_aggr_data['whatif'] = null

            aggr_row_data[aggr_ticker] = new_aggr_data
        })

        let shown_column_names = this.state.shown_columns.map(column => column.name)
        let all_columns_namesorted = JSON.parse(JSON.stringify(allColumns)).sort(function (a,b) {
            let value_a = a.displayName
            if (value_a.includes('year')) {
                value_a = '0' + value_a
            } else if (value_a.includes('month')) {
                value_a = '00' + value_a
            }
            let value_b = b.displayName
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
        let all_categories = ['always', 'stock-specific', 'holdings', 'performance']
        let all_columns_by_category = {}
        all_categories.forEach(function(category_name) {
            let this_category_columns = JSON.parse(JSON.stringify(all_columns_namesorted)).filter(column => column.category === category_name)
            all_columns_by_category[category_name] = this_category_columns
        })

        const row_popover = (
            <Popover id="row-popover">
                <Popover.Title as="h3">Included Rows:</Popover.Title>
                <Popover.Content>
                <div id="row-control">
                    <form>
                        <div className="switch_controls">

                            <div className="switch_control">
                                <div className="switch_label">show current holdings:</div>
                                <div className="switch_wrapper">
                                    <input id="showCurrentHoldings" name="showCurrentHoldings" type="checkbox" checked={this.state.showCurrentHoldings} onChange={this.onShowInputChange} />
                                    <label htmlFor="showCurrentHoldings" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show previous holdings:</div>
                                <div className="switch_wrapper">
                                    <input id="showPreviousHoldings" name="showPreviousHoldings" type="checkbox" checked={this.state.showPreviousHoldings} onChange={this.onShowInputChange} />
                                    <label htmlFor="showPreviousHoldings" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show tagged:</div>
                                <div className="switch_wrapper">
                                    <input id="showTagged" name="showTagged" type="checkbox" checked={this.state.showTagged} onChange={this.onShowInputChange} />
                                    <label htmlFor="showTagged" className="switch"></label>
                                </div>
                            </div>

                            <div className="switch_control">
                                <div className="switch_label">show untagged:</div>
                                <div className="switch_wrapper">
                                    <input id="showUntagged" name="showUntagged" type="checkbox" checked={this.state.showUntagged} onChange={this.onShowInputChange} />
                                    <label htmlFor="showUntagged" className="switch"></label>
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
                                    <input id="showCash" name="showCash" type="checkbox" checked={this.state.showCash} onChange={this.onShowInputChange} />
                                    <label htmlFor="showCash" className="switch"></label>
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
            <Popover id="column-popover">
                <Popover.Title as="h3">Included Columns:</Popover.Title>
                <Popover.Content>
                <div id="column-control">
                    {Object.keys(all_columns_by_category).filter(key => key !== 'always').map(key => (
                        <div key={key} id="column-category">
                            <div className="strong">{key}</div>
                            <ul>
                                {all_columns_by_category[key].map(column => (
                                    <li key={ column.name } onClick={ (e)=>this.onToggleShowColumn(column.name)} className={!shown_column_names.includes(column.name) ? 'strikethrough' : ''}>{ column.displayName }</li>
                                ))}
                            </ul>
                        </div>
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

        const general_settings_popover = (
            <Popover id="general-settings-popover">
                <Popover.Title as="h3">General Settings:</Popover.Title>
                <Popover.Content>
                <div id="general-settings-control">
                    <div id="baseline-control">
                        <label htmlFor="baseline">performance baseline:</label>
                        <select id="baseline" name="baseline" value={this.state.baseline.name} onChange={this.onInputChange}>
                            <option value="zero_pct_gain">0% gain</option>
                            <option value="sp500_pct_gain">SP&amp;500 Index</option>
                        </select>
                    </div>
                    <div id="performance-control">
                        <div className="switch_control">
                            <div className="switch_label">show performance only if achieved:</div>
                            <div className="switch_wrapper">
                                <input id="show_only_achieved_performance" name="show_only_achieved_performance" type="checkbox" checked={this.state.show_only_achieved_performance} onChange={this.onShowInputChange} />
                                <label htmlFor="show_only_achieved_performance" className="switch"></label>
                            </div>
                        </div>
                    </div>
                    <div id="recency-control">
                        <div className="switch_control">
                            <div className="switch_label">show error if quote is not from today:</div>
                            <div className="switch_wrapper">
                                <input id="error_if_not_todays_quote" name="error_if_not_todays_quote" type="checkbox" checked={this.state.error_if_not_todays_quote} onChange={this.onShowInputChange} />
                                <label htmlFor="error_if_not_todays_quote" className="switch"></label>
                            </div>
                        </div>
                    </div>
                </div>
                </Popover.Content>
            </Popover>
        )
        const GeneralSettings = () => (
            <OverlayTrigger trigger="click" placement="left" overlay={general_settings_popover}>
                <button className="btn btn-sm btn-secondary" variant="success">&#x2699; General</button>
            </OverlayTrigger>
        )
        
        const PopulateHeaderRow = ({isAggregate, highlightColumn}) => (
            <GridHeaderRow
                highlightColumn={highlightColumn}
                isAggregate={isAggregate}
                columns={this.state.shown_columns}
                symbolCountStr={symbol_count}
                sortColumn={this.state.sortColumn}
                sortTriangle={sortTriangle}
                whatifFormat={this.state.whatifFormat}
                onChangeSort={this.onChangeSort}
                onChangeWhatifFormat={this.onChangeWhatifFormat}
            />
        )

        const PopulateRow = ({row_data}) => (
            <GridRow 
                key={row_data.rowName}
                isAggregate={row_data.isAggregate}
                rowName={row_data.rowName}
                membershipSet={row_data.membershipSet}
                columns={row_data.columns}
                specialClasses={row_data.specialClasses}
                current_price={row_data.current_price}
                change_pct={row_data.change_pct}
                quote_date={row_data.quote_date}
                volume={row_data.volume}
                basis={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                         || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                         ? row_data.basis 
                         : 'n/a'}
                start_date={row_data.start_date}
                currentShares={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                                  || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                                  ? row_data.currentShares 
                                  : 'n/a'}
                currentValue={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                                 || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                                 ? row_data.currentValue 
                                 : 'n/a'}
                realized_gains={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                                  || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                                  ? row_data.realized_gains 
                                  : 'n/a'}
                risk_factor={row_data.risk_factor}
                risk_factor_modified={row_data.risk_factor_modified}
                performance_numbers={row_data.performance_numbers}
                error_if_not_todays_quote={this.state.error_if_not_todays_quote}
                show_only_achieved_performance={this.state.show_only_achieved_performance}
                baseline={row_data.baseline}
                style_realized_performance={row_data.style_realized_performance}
                totalValue={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                               || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                               ? row_data.totalValue 
                               : 'n/a'}
                totalBasis={( (row_data.currentShares !== 0 && this.state.showCurrentHoldings) 
                               || (row_data.currentShares === 0 && this.state.showPreviousHoldings) ) 
                               ? row_data.totalBasis 
                               : 'n/a'}
                whatif={row_data.whatif}
                whatifFormat={this.state.whatifFormat}
                onChangeWhatifFormat={this.onChangeWhatifFormat}
                onRemoveFromTag={row_data.onRemoveFromTag}
                on_delete_ticker={row_data.on_delete_ticker}
                onDeleteTags={row_data.onDeleteTags}
                editing_row={this.state.editing_row}
                current_edit_value={(typeof this.state.editing_row === 'string' && this.state.allRisk.hasOwnProperty(this.state.editing_row)) ? this.state.allRisk[this.state.editing_row].factor : ''}
                on_edit_cell={row_data.on_edit_cell}
                on_modify_risk_factor={row_data.on_modify_risk_factor}
                onEscapeKey={this.onEscapeKey}
            />
        )

        // if an old quote exists and if this is an error, the grand total becomes an error too
        let a_quote_is_old = false, aggr_total_value, aggr_basis 
        sorted_tickers.forEach(function(ticker) {
            if (a_quote_is_old === false 
                && ticker !== 'cash' 
                && !self.getIndicies().includes(ticker) 
                && self.daysAgo(self.state.allCurrentQuotes[ticker].quote_date) >= 1) {
                    a_quote_is_old = true
            }
        })
        if (!a_quote_is_old || !self.state.error_if_not_todays_quote) {
            aggr_total_value = self.state.aggrTotalValue['_everything_']
            aggr_basis = self.state.aggrBasis['_everything_']
        } else {
            aggr_total_value = 'err.'
            aggr_basis = self.state.aggrBasis['_everything_']
        }

        let error_performance_numbers = {
            shortChangePct: 'err.',
            mediumChangePct: 'err.',
            longChangePct: 'err.'
        }
        let all_row_data = []
        sorted_tickers.forEach(function(ticker) {
            let quote_exists = self.currentQuoteExists(ticker)
            let performance_numbers_exist = self.state.allPerformanceNumbers.hasOwnProperty(ticker)
            let new_row = {}
            new_row['isAggregate'] = false
            new_row['rowName'] = ticker
            new_row['membershipSet'] = row_data[ticker]['tags']
            new_row['columns'] = self.state.shown_columns
            new_row['specialClasses'] = row_data[ticker]['specialClasses']
            new_row['current_price'] = (quote_exists) ? self.state.allCurrentQuotes[ticker].current_price : 'err.'
            new_row['change_pct'] = (quote_exists) ? self.state.allCurrentQuotes[ticker].change_pct : 'err.'
            new_row['quote_date'] = (!quote_exists) ? 'err.' : (ticker !== 'cash' && !self.getIndicies().includes(ticker)) ? self.state.allCurrentQuotes[ticker].quote_date : 'n/a'
            new_row['volume'] = (quote_exists) ? self.state.allCurrentQuotes[ticker].volume : 'err.'
            new_row['basis'] = row_data[ticker]['basis']
            new_row['start_date'] = row_data[ticker]['start_date']
            new_row['currentShares'] = row_data[ticker]['currentShares']
            new_row['currentValue'] = (new_row.current_price === 'n/a' || new_row.currentShares === 'n/a') ? 'n/a' : new_row.current_price * new_row.currentShares
            new_row['realized_gains'] = row_data[ticker]['realized_gains']
            new_row['risk_factor'] = (self.state.allRisk.hasOwnProperty(ticker)) ? self.state.allRisk[ticker].factor : null
            new_row['risk_factor_modified'] = (self.state.allRisk.hasOwnProperty(ticker)) ? self.state.allRisk[ticker].modifiedAt : null
            new_row['performance_numbers'] = (performance_numbers_exist) ? self.state.allPerformanceNumbers[ticker] : error_performance_numbers
            new_row['baseline'] = self.state.baseline
            new_row['style_realized_performance'] = (Object.entries(self.state.allPositions).filter(position => position[0] !== 'cash' && position[1].currentShares).length) ? true : false
            new_row['totalValue'] = aggr_total_value
            new_row['totalBasis'] = aggr_basis
            new_row['whatif'] = row_data[ticker]['whatif']
            new_row['onRemoveFromTag'] = self.onRemoveFromTag
            new_row['on_delete_ticker'] = self.onDeleteTicker
            new_row['onDeleteTags'] = self.onDeleteTags
            new_row['on_edit_cell'] = self.onEditCell
            new_row['on_modify_risk_factor'] = self.onModifyRiskFactor
            all_row_data.push(new_row)
        })
        if (this.state.show_aggregates) {

            sorted_aggr_tickers.forEach(function(aggr_ticker) {

                // if an old quote exists within this aggregate and if this is an error, the aggregate total becomes an error too
                let quote_date
                for (let ticker of self.state.allTags[aggr_ticker]) {
                    let quote_exists = (self.currentQuoteExists(ticker)) ? true : false
                    quote_date = (quote_exists) ? self.state.allCurrentQuotes[ticker].quote_date : 'err.'
                    if (self.daysAgo(quote_date) >= 1) {
                        break
                    }
                }

                let new_row = {}
                new_row['isAggregate'] = true
                new_row['rowName'] = aggr_ticker
                new_row['membershipSet'] = self.state.allTags[aggr_ticker]
                new_row['columns'] = self.state.shown_columns
                new_row['specialClasses'] = aggr_row_data[aggr_ticker]['specialClasses']
                new_row['current_price'] = aggr_row_data[aggr_ticker]['current_price']
                new_row['change_pct'] = aggr_row_data[aggr_ticker]['change_pct']
                new_row['quote_date'] = quote_date
                new_row['volume'] = aggr_row_data[aggr_ticker]['volume']
                new_row['basis'] = self.state.aggrBasis[aggr_ticker]
                new_row['start_date'] = aggr_row_data[aggr_ticker]['start_date']
                new_row['currentShares'] = aggr_row_data[aggr_ticker]['currentShares']
                new_row['currentValue'] = aggr_row_data[aggr_ticker]['currentValue']
                new_row['realized_gains'] = aggr_row_data[aggr_ticker]['realized_gains']
                new_row['risk_factor'] = 'n/a'
                new_row['risk_factor_modified'] = 'n/a'
                new_row['performance_numbers'] = aggr_row_data[aggr_ticker]['performance']
                new_row['baseline'] = self.state.baseline
                new_row['style_realized_performance'] = false
                new_row['totalValue'] = self.state.aggrTotalValue[aggr_ticker]
                new_row['totalBasis'] = self.state.aggrBasis[aggr_ticker]
                new_row['whatif'] = aggr_row_data[aggr_ticker]['whatif']
                new_row['onRemoveFromTag'] = self.onRemoveFromTag
                new_row['on_delete_ticker'] = self.onDeleteTicker
                new_row['onDeleteTags'] = self.onDeleteTags
                new_row['on_edit_cell'] = self.onEditCell
                new_row['on_modify_risk_factor'] = self.onModifyRiskFactor
                all_row_data.push(new_row)
            })
        }

        let symbol_count = this.populateSymbolCount(sorted_tickers.length) 
        let all_ticker_rows = all_row_data.filter(row_data => !row_data.isAggregate)
        let all_aggregate_rows = all_row_data.filter(row_data => row_data.isAggregate)

        return (
            <div id="page-wrapper">
                <div id="page-controls">
                    <div id="left-side">
                        <div id="input-controls">
                            <InputForms
                                allStocks={this.state.allStocks}
                                allTags={this.state.allTags}
                                allCurrentQuotes={this.state.allCurrentQuotes}
                                allMonthlyQuotes={this.state.allMonthlyQuotes}
                                allMonthEndDates={this.state.allMonthEndDates}
                                allPositions={this.state.allPositions}
                                allTransactions={this.state.allTransactions}
                                allRisk={this.state.allRisk}
                                showCurrentHoldings={this.state.showCurrentHoldings}
                                showPreviousHoldings={this.state.showPreviousHoldings}
                                showTagged={this.state.showTagged}
                                showUntagged={this.state.showUntagged}
                                showCash={this.state.showCash}
                                baselineName={this.state.baseline.name}
                                getBalanceableValue={this.getMaxBalanceableValue}
                                onNewTickers={this.onNewTickers}
                                onNewTags={this.onNewTags}
                                onDeleteTags={this.onDeleteTags}
                                onDeleteTransaction={this.onDeleteTransaction}
                                onNewTransaction={this.onNewTransaction}
                                onImportTransactions={this.onImportTransactions}
                                onNewCash={this.onNewCash}
                                createConsoleMessageSet={this.createConsoleMessageSet}
                                clearLastConsoleMessage={this.clearLastConsoleMessage}
                                allConsoleMessages={this.state.allConsoleMessages}
                                onNewConsoleMessages={this.onNewConsoleMessages}
                                onWhatifSubmit={this.onWhatifSubmit}
                            />
                        </div>
                        <div id="last-console-message">
                            {this.state.last_console_message && this.state.last_console_message.length ? (
                            <div className={ (this.state.last_console_message.startsWith('ERROR')) ? 'warning' : ''}>{this.state.last_console_message}</div>
                            ) : null }
                        </div>
                    </div>
                    <div id="view-controls">
                        <div id="page-settings">
                            <GeneralSettings />
                            <RowSettings />
                            <ColumnSettings />
                        </div>

                    </div>
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <PopulateHeaderRow isAggregate={false} highlightColumn={this.state.balance_target_column} />
                        <PopulateHeaderRow isAggregate={false} highlightColumn={null} />
                    </thead>
                    <tbody>
                        {this.state.done && all_row_data.filter(row_data => !row_data.isAggregate).map(row_data => (
                            <PopulateRow key={row_data.rowName} row_data={row_data} />
                        ))}
                        {this.state.done && all_ticker_rows.length ? (
                        <GridRowTotals
                            columns={this.state.shown_columns}
                            totalValue={aggr_total_value}
                            totalBasis={aggr_basis}
                            totalPerformance={this.state.aggrPerformance['_everything_']}
                        />
                        ) : (
                            <tr>
                                <td className="no_table_data" colSpan={this.state.shown_columns.length+1}>No stocks have been added yet. Please add them using the form on the "Tickers" tab.</td>
                            </tr>
                        ) }
                    </tbody>
                </table>
                {this.state.done && this.state.show_aggregates && (
                    <table id="aggr-position-listing" cellSpacing="0">
                        <thead>
                            <PopulateHeaderRow isAggregate={true} highlightColumn={null} />
                        </thead>
                        <tbody>
                            {this.state.done && all_aggregate_rows.filter(row => row.name !== 'untagged').length ? all_row_data.filter(row_data => row_data.isAggregate).map(row_data => (
                                <PopulateRow key={row_data.rowName} row_data={row_data} />
                            )) : (
                                <tr>
                                    <td className="no_table_data" colSpan={this.state.shown_columns.length+1}>No tags exist yet. Please create them using the form on the "Tags" tab.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }

}