import React from 'react'
import { GridRow } from './components/GridRow'
import { GridRowTotals } from './components/GridRowTotals'
import { InputForms } from './components/InputForms'


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

const default_shown_columns = ['symbol', 'current_value', 'percent_value', 'percent_profit', 'short_change_pct', 'medium_change_pct', 'long_change_pct']

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
            status_messages: [],
            baseline: {
                name: 'zero_pct_gain',
                short_change_pct: 0,
                medium_change_pct: 0,
                long_change_pct: 0,
            },
            allPerformanceNumbers: {},
            show_index: false,
            show_holdings: true,
            show_cash: false,
            show_tagged: true,
            show_untagged: true,
            sort_column: 'symbol',
            sort_dir_asc: true,
            shown_columns: [],
            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getPositionFromTransactions = this.getPositionFromTransactions.bind(this)
        this.getPositionFromCashTransactions = this.getPositionFromCashTransactions.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onShowInputChange = this.onShowInputChange.bind(this)
        this.onChangeSort = this.onChangeSort.bind(this)
        this.onToggleShowColumn = this.onToggleShowColumn.bind(this)
        this.onNewTransaction = this.onNewTransaction.bind(this)
        this.onNewCash = this.onNewCash.bind(this)
        this.onNewMessages = this.onNewMessages.bind(this)
        this.onNewTags = this.onNewTags.bind(this)
        this.onNewTickers = this.onNewTickers.bind(this)
        this.onRemoveFromTag = this.onRemoveFromTag.bind(this)
        this.onDeleteTicker = this.onDeleteTicker.bind(this)
        this.onDeleteTag = this.onDeleteTag.bind(this)
        this.getIndicies = this.getIndicies.bind(this)
        this.getHoldings = this.getHoldings.bind(this)
        this.getTagged = this.getTagged.bind(this)
        this.getUntagged = this.getUntagged.bind(this)
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

        const stored_allTags = JSON.parse(localStorage.getItem("allTags"))
        if (stored_allTags !== null) {
            this.setState({ allTags: stored_allTags })
        }

        const stored_allTransactions = JSON.parse(localStorage.getItem("allTransactions"))
        if (stored_allTransactions !== null) {
            this.setState({ allTransactions: stored_allTransactions })
        }

        let self = this

        const view_controls = ['show_index', 'show_holdings', 'show_cash', 'show_tagged', 'show_untagged']
        view_controls.forEach(function(control) {
            const stored_control = JSON.parse(localStorage.getItem(control))
            if (stored_control !== null) {
                self.setState({ [control]: stored_control })
            }
        })

        let indexed_transaction_data = {}
        if (stored_allTransactions !== null) {
            indexed_transaction_data = JSON.parse(JSON.stringify(stored_allTransactions))
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

        let newPositions = {}
        let newCurrentQuotes = {}
        let newMonthlyQuotes = {}
        let newPerformanceNumbers = {}

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


        let init_shown_columns = []
        const stored_shown_columns = JSON.parse(localStorage.getItem("shown_columns"))
        if (stored_shown_columns !== null) {
            init_shown_columns = [...stored_shown_columns]
        } else {
            init_shown_columns = all_columns.filter(column => default_shown_columns.includes(column.name))
        }

        this.setState({ allStocks: all_stocks,
                        allPositions: newPositions,
                        allCurrentQuotes: newCurrentQuotes,
                        allMonthlyQuotes: newMonthlyQuotes,
                        allPerformanceNumbers: newPerformanceNumbers,
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
        this.setState({ [name]: new_value })
        localStorage.setItem(name, JSON.stringify(new_value))
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
            let newAllTags = JSON.parse(JSON.stringify(prevState.allTags))
            new_tags.forEach(function(tag) {
                let newTag = []
                if (!newAllTags.hasOwnProperty(tag)) {
                    newAllTags[tag] = newTag
                }
            })
            localStorage.setItem('allTags', JSON.stringify(newAllTags))
            return { allTags: newAllTags }
        })
    }

    onNewTickers(tag, new_tickers) {
        this.setState(prevState => {
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
            return { allTags: newAllTags }
        })
    }

    onDeleteTicker(event, delete_ticker) {
        this.setState(prevState => {

            // update tags
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

            return { allTags: newAllTags, allPositions: newAllPositions, allTransactions: newAllTransactions, status_messages: newStatusMessages }
        })
    }

    onNewTransaction(new_transaction) {
        let action, num_shares, ticker, total
        [action, num_shares, ticker, total]  = new_transaction.split(' ')
        num_shares = parseInt(num_shares)
        total = parseFloat(total.substr(1))
        this.setState(prevState => {

            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            if (newAllTransactions.hasOwnProperty(ticker) && newAllTransactions[ticker] !== null) {
                newAllTransactions[ticker] = newAllTransactions[ticker].concat([new_transaction])
            } else {
                newAllTransactions[ticker] = [new_transaction]
            }

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

            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))
            return { allTransactions: newAllTransactions, allPositions: newAllPositions }
        })
        this.onNewTickers('untagged', [ticker])
    }

    onNewCash(new_cash_transaction) {
        let action, total
        [action, total]  = new_cash_transaction.split(' ')
        total = parseFloat(total.substr(1))
        this.setState(prevState => {

            let newAllTransactions = JSON.parse(JSON.stringify(prevState.allTransactions))
            if (newAllTransactions.hasOwnProperty('cash') && newAllTransactions['cash'] !== null) {
                newAllTransactions['cash'] = newAllTransactions['cash'].concat([new_cash_transaction])
            } else {
                newAllTransactions['cash'] = [new_cash_transaction]
            }

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

            localStorage.setItem('allTransactions', JSON.stringify(newAllTransactions))
            return { allTransactions: newAllTransactions, allPositions: newAllPositions }
        })
    }

    onRemoveFromTag(event, remove_from_tag, remove_ticker) {
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
            return { allTags: newAllTags }
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
            return { allTags: newAllTags }
        })
    }

    onNewMessages(new_messages) {
        this.setState(prevState => {
            let newStatusMessages = [...prevState.status_messages]
            newStatusMessages = [...new_messages.reverse(), ...newStatusMessages]
            return { status_messages: newStatusMessages }
        })
    }

    getHoldings() {
        return Object.entries(this.state.allPositions).filter(holding => holding[1]['current_shares'] > 0).map(holding => holding[0])
    }

    getIndicies() {
        return [...this.state.allIndiciesAliases]
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

    render() {

        let self = this

        let aggr_totalbasis_by_tag = {}, aggr_totalrealized_by_tag = {}, aggr_totalvalue_by_tag = {}
        aggr_totalbasis_by_tag['_everything_'] = 0
        aggr_totalrealized_by_tag['_everything_'] = 0
        aggr_totalvalue_by_tag['_everything_'] = 0
        Object.keys(this.state.allTags).forEach(function(tag) {
            aggr_totalrealized_by_tag[tag] = 0 
            aggr_totalbasis_by_tag[tag] = 0 
            aggr_totalvalue_by_tag[tag] = 0 
        })
        Object.entries(this.state.allPositions).forEach(function(position_info) {
            let ticker = position_info[0]
            let ticker_basis = position_info[1]['basis']
            let ticker_realized_gains = position_info[1]['realized_gains']
            let ticker_shares = position_info[1]['current_shares']
            let ticker_price = self.state.allCurrentQuotes[ticker]['current_price'] || 1
            if ((ticker !== 'cash' && self.state.show_holdings) || (ticker === 'cash' && self.state.show_cash)) {
                aggr_totalbasis_by_tag['_everything_'] += ticker_basis - ticker_realized_gains
                aggr_totalrealized_by_tag['_everything_'] += ticker_realized_gains
                aggr_totalvalue_by_tag['_everything_'] += ticker_price * ticker_shares
                Object.keys(self.state.allTags).forEach(function(tag) {
                    if (self.state.allTags[tag].includes(ticker)) {
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

        let all_stocks_of_interest = []
        Object.values(this.state.allTags).forEach(function(array_of_tickers) {
            array_of_tickers.forEach(ticker => all_stocks_of_interest.push(ticker))
        })
        all_stocks_of_interest = Array.from(new Set(all_stocks_of_interest))

        let aggr_performance_by_tag = {}
        aggr_performance_by_tag['_everything_'] = {
            short_change_pct: 0,
            medium_change_pct: 0,
            long_change_pct: 0,
            num_tickers: 0
        }
        if (this.state.done) {
            all_stocks_of_interest.forEach(function(ticker) {

                let short = self.state.allPerformanceNumbers[ticker]['short_change_pct']
                let medium = self.state.allPerformanceNumbers[ticker]['medium_change_pct']
                let long = self.state.allPerformanceNumbers[ticker]['long_change_pct']

                aggr_performance_by_tag['_everything_'].short_change_pct += short
                aggr_performance_by_tag['_everything_'].medium_change_pct += medium
                aggr_performance_by_tag['_everything_'].long_change_pct += long
                aggr_performance_by_tag['_everything_'].num_tickers += 1

                Object.keys(self.state.allTags).forEach(function(tag) {
                    if (aggr_performance_by_tag.hasOwnProperty(tag) && self.state.allTags[tag].includes(ticker)) {
                        aggr_performance_by_tag[tag].short_change_pct += short
                        aggr_performance_by_tag[tag].medium_change_pct += medium
                        aggr_performance_by_tag[tag].long_change_pct += long
                        aggr_performance_by_tag[tag].num_tickers += 1
                    } else if (self.state.allTags[tag].includes(ticker)) {
                        let new_aggr_performance = {}
                        new_aggr_performance['short_change_pct'] = short
                        new_aggr_performance['medium_change_pct'] = medium
                        new_aggr_performance['long_change_pct'] = long
                        new_aggr_performance['num_tickers'] = 1
                        aggr_performance_by_tag[tag] = new_aggr_performance
                    }
                })
            })
        }
        Object.entries(aggr_performance_by_tag).forEach(function(tag_performance) {
            let tag = tag_performance[0]
            let performance = tag_performance[1]
            Object.keys(performance).filter(time_range => time_range !== 'num_tickers').forEach(function(time_range) {
                let value = (performance['num_tickers']) ? performance[time_range] / performance.num_tickers : 'n/a'
                aggr_performance_by_tag[tag][time_range] = value
            })
        })

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
        let sort_column = self.state.sort_column
        let quote_columns = ['symbol', 'current_price', 'change_pct', 'volume', 'dollar_volume']
        let holdings_columns = ['current_shares', 'current_value', 'percent_value', 'basis', 'realized_gains', 'percent_profit']
        let performance_columns = ['short_change_pct', 'medium_change_pct', 'long_change_pct']
        let sort_triangle = (this.state.sort_dir_asc === true) ? String.fromCharCode(9650) : String.fromCharCode(9660)
        let sorted_tickers = unique_tickers_to_show.sort(function(a, b) {
            let value_a, value_b
            if (quote_columns.includes(sort_column)) {
                if (self.state.allCurrentQuotes.hasOwnProperty(a) && self.state.allCurrentQuotes.hasOwnProperty(b)) {
                    if (sort_column === 'dollar_volume') {
                        value_a = self.state.allCurrentQuotes[a]['current_price'] * self.state.allCurrentQuotes[a]['volume']
                        value_b = self.state.allCurrentQuotes[b]['current_price'] * self.state.allCurrentQuotes[b]['volume']
                    } else if (sort_column === 'symbol') {
                        value_a = self.state.allCurrentQuotes[a][sort_column].toUpperCase()
                        value_b = self.state.allCurrentQuotes[b][sort_column].toUpperCase()
                    } else {
                        value_a = self.state.allCurrentQuotes[a][sort_column]
                        value_b = self.state.allCurrentQuotes[b][sort_column]
                    }
                } 
            } else if (performance_columns.includes(sort_column)) {
                if (self.state.allMonthlyQuotes.hasOwnProperty(a) || a === 'cash') {
                    value_a = self.state.allPerformanceNumbers[a][sort_column]
                }
                if (self.state.allMonthlyQuotes.hasOwnProperty(b) || b === 'cash') {
                    value_b = self.state.allPerformanceNumbers[b][sort_column]
                }
            } else if (holdings_columns.includes(sort_column)) {
                let positionvalue_a, positionvalue_b
                if (self.state.allPositions.hasOwnProperty(a)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_profit') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(a)) {
                            positionvalue_a = self.state.allPositions[a]['current_shares'] * self.state.allCurrentQuotes[a]['current_price']
                            if (sort_column === 'percent_profit') {
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
                if (self.state.allPositions.hasOwnProperty(b)) {
                    if (sort_column === 'current_value' || sort_column === 'percent_value' || sort_column === 'percent_profit') {
                        if (self.state.allCurrentQuotes.hasOwnProperty(b)) {
                            positionvalue_b = self.state.allPositions[b]['current_shares'] * self.state.allCurrentQuotes[b]['current_price']
                            if (sort_column === 'percent_profit' && positionvalue_b !== 0) {
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
        })

        let aggr_tickers = Object.keys(this.state.allTags)
        let aggr_row_data = {}
        aggr_tickers.forEach(function(aggr_ticker) {

            let new_aggr_data = {}

            new_aggr_data['symbol'] = aggr_ticker
            new_aggr_data['tags'] = []
            new_aggr_data['special_classes'] = []
            new_aggr_data['basis'] = 'n/a'
            new_aggr_data['current_shares'] = aggr_totalvalue_by_tag[aggr_ticker]
            new_aggr_data['current_price'] = 1
            new_aggr_data['change_pct'] = 'n/a'
            new_aggr_data['volume'] = 'n/a'
            new_aggr_data['basis'] = aggr_totalbasis_by_tag[aggr_ticker]
            new_aggr_data['realized_gains'] = aggr_totalrealized_by_tag[aggr_ticker]
            new_aggr_data['performance'] = aggr_performance_by_tag[aggr_ticker]

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

        return (
            <div id="page-wrapper">
                <div id="page-controls">
                    <div id="input-controls">
                        <div id="input-forms">
                            <InputForms
                                all_stocks={this.state.allStocks}
                                all_tags={this.state.allTags}
                                on_new_tickers={this.onNewTickers}
                                on_new_tags={this.onNewTags}
                                on_delete_tag={this.onDeleteTag}
                                on_new_transaction={this.onNewTransaction}
                                on_new_cash={this.onNewCash}
                                on_new_messages={this.onNewMessages}
                            />
                        </div>
                        <div id="status-messages-wrapper">
                            { this.state.status_messages.length ? 'History:' : '' }
                            <div id="status-messages">
                            { this.state.status_messages
                                .map(
                                    (message, i) => {
                                        return (message.toLowerCase().startsWith("error"))
                                        ? <p key={i} className="message error">{message}</p>
                                        : <p key={i} className="message">{message}</p>
                                    }
                                )
                            }
                            </div>
                        </div>
                    </div>
                    <div id="view-controls">
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

                            </div>
                        </form>
                        <div id="baseline-control">
                            <label htmlFor="baseline">Performance Baseline:</label>
                            <select id="baseline" name="baseline" value={this.state.baseline.name} onChange={this.onInputChange}>
                                <option value="zero_pct_gain">0% gain</option>
                                <option value="sp500_pct_gain">SP&amp;500 Index</option>
                            </select>
                        </div>
                        <div id="column-control">
                            {all_columns_namesorted.map(column => (
                                <span key={ column.name } onClick={ (e)=>this.onToggleShowColumn(column.name) } className={!shown_column_names.includes(column.name) ? 'strikethrough' : ''}>{ column.display_name }</span>
                            ))}
                        </div>
                    </div>
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Tags</th>
                            {this.state.shown_columns.map(column => (
                            <th key={ column.name } onClick={ (e)=>this.onChangeSort(column.name) }>{ column.display_name }{ column.name === 'symbol' ? '('+sorted_tickers.length+')' : ''}{ sort_column === column.name ? sort_triangle : '' }</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.done && sorted_tickers.map(ticker => (
                            <GridRow 
                                key={ticker}
                                is_aggregate={false}
                                symbol={ticker}
                                columns={this.state.shown_columns}
                                tags={row_data[ticker]['tags']}
                                special_classes={row_data[ticker]['special_classes']}
                                current_price={this.state.allCurrentQuotes[ticker].current_price}
                                change_pct={this.state.allCurrentQuotes[ticker].change_pct}
                                volume={this.state.allCurrentQuotes[ticker].volume}
                                basis={row_data[ticker]['basis']}
                                current_shares={row_data[ticker]['current_shares']}
                                realized_gains={row_data[ticker]['realized_gains']}
                                performance_numbers={this.state.allPerformanceNumbers[ticker]}
                                baseline={this.state.baseline}
                                total_value = {aggr_totalvalue_by_tag['_everything_']}
                                on_remove_from_tag={this.onRemoveFromTag}
                                on_delete_ticker={this.onDeleteTicker}
                            />
                        ))}
                        <GridRowTotals
                            columns={this.state.shown_columns}
                            total_value={aggr_totalvalue_by_tag['_everything_']}
                        />
                    </tbody>
                </table>
                <table id="aggr-position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Tags</th>
                            {this.state.shown_columns.map(column => (
                            <th key={ column.name }>{ column.display_name }</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.done && aggr_tickers.map(aggr_ticker => (
                            <GridRow 
                                key={aggr_ticker}
                                is_aggregate={true}
                                symbol={aggr_ticker}
                                columns={this.state.shown_columns}
                                tags={aggr_row_data[aggr_ticker]['tags']}
                                special_classes={aggr_row_data[aggr_ticker]['special_classes']}
                                current_price={aggr_row_data[aggr_ticker]['current_price']}
                                change_pct={aggr_row_data[aggr_ticker]['change_pct']}
                                volume={aggr_row_data[aggr_ticker]['volume']}
                                basis={aggr_totalbasis_by_tag[aggr_ticker]}
                                current_shares={aggr_row_data[aggr_ticker]['current_shares']}
                                realized_gains={aggr_row_data[aggr_ticker]['realized_gains']}
                                performance_numbers={aggr_row_data[aggr_ticker]['performance']}
                                baseline={this.state.baseline}
                                total_value = {aggr_totalvalue_by_tag['_everything_']}
                                on_remove_from_tag={this.onRemoveFromTag}
                                on_delete_tag={this.onDeleteTag}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

}