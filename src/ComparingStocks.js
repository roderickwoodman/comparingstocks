import React from 'react'
import { GridRow } from './components/GridRow'
import { GridRowTotals } from './components/GridRowTotals'
import { InputForms } from './components/InputForms'


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
            allTransactions: {},
            allTags: {
                'untagged': []
            },
            status_messages: [],
            performance_baseline: 'zero_pct_gain',
            performance_baseline_numbers: {},
            index_performance: {},
            allPerformanceNumbers: {},
            show_index: true,
            show_holdings: true,
            show_cash: true,
            show_tagged: true,
            show_untagged: true,
            sort_column: 'symbol',
            sort_dir_asc: true,
            done: false
        }
        this.tickerIsIndex = this.tickerIsIndex.bind(this)
        this.convertNameForIndicies = this.convertNameForIndicies.bind(this)
        this.getPositionFromTransactions = this.getPositionFromTransactions.bind(this)
        this.getPositionFromCashTransactions = this.getPositionFromCashTransactions.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onShowInputChange = this.onShowInputChange.bind(this)
        this.onChangeSort = this.onChangeSort.bind(this)
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

        const stored_performance_baseline = JSON.parse(localStorage.getItem("performance_baseline"))
        if (stored_performance_baseline !== null) {
            this.setState({ performance_baseline: stored_performance_baseline })
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

        this.setState({ allStocks: all_stocks,
                        allPositions: newPositions,
                        allCurrentQuotes: newCurrentQuotes,
                        allMonthlyQuotes: newMonthlyQuotes,
                        allPerformanceNumbers: newPerformanceNumbers,
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
            let new_baseline = event.target.value
            localStorage.setItem('performance_baseline', JSON.stringify(new_baseline))
            let new_baseline_numbers = (new_baseline === 'sp500_pct_gain') ? this.state.index_performance : zero_performance
            this.setState({ performance_baseline: new_baseline })
            this.setState({ performance_baseline_numbers: new_baseline_numbers })
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

        let total_value = 0
        if (this.state.done) {
            total_value = Object.entries(this.state.allPositions).reduce(function (total, current_val) {
                if (current_val[0] === 'cash' && self.state.show_cash) {
                    return total + current_val[1]['current_shares'] * 1
                } else if (current_val[0] === 'cash' && !self.state.show_cash) {
                    return total
                } else {
                    return total + current_val[1]['current_shares'] * self.state.allCurrentQuotes[current_val[0]]['current_price']
                }
            }, 0)
        }

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
                display_name: 'Pct of Total Value',
                variable_type: 'percentage',
                num_decimals: 1
            },
            'basis': {
                variable_name: 'basis',
                display_name: 'Basis',
                variable_type: 'currency',
                num_decimals: 0
            },
            'percent_profit': {
                variable_name: 'percent_profit',
                display_name: 'Pct Profit',
                variable_type: 'percentage',
                passthrough_strings: true,
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
        let display_column_order = ['symbol', 'current_value', 'percent_value', 'percent_profit', 'short_change_pct', 'medium_change_pct', 'long_change_pct']
        let display_columns = display_column_order.map(column_variable => all_columns[column_variable])

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
                                    <div className="switch_label">show index:</div>
                                    <div className="switch_wrapper">
                                        <input id="show_index" name="show_index" type="checkbox" checked={this.state.show_index} onChange={this.onShowInputChange} />
                                        <label htmlFor="show_index" className="switch"></label>
                                    </div>
                                </div>

                                <div className="switch_control">
                                    <div className="switch_label">show holdings:</div>
                                    <div className="switch_wrapper">
                                        <input id="show_holdings" name="show_holdings" type="checkbox" checked={this.state.show_holdings} onChange={this.onShowInputChange} />
                                        <label htmlFor="show_holdings" className="switch"></label>
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
                            </div>
                        </form>
                        <div id="baseline-control">
                            <label htmlFor="baseline">Performance Baseline:</label>
                            <select id="baseline" name="baseline" value={this.state.performance_baseline} onChange={this.onInputChange}>
                                <option value="zero_pct_gain">0% gain</option>
                                <option value="sp500_pct_gain">SP&amp;500 Index</option>
                            </select>
                        </div>
                    </div>
                </div>
                <table id="position-listing" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Tags</th>
                            {display_columns.map(column => (
                            <th key={ column.variable_name} onClick={ (e) => this.onChangeSort(column.variable_name) }>{ column.display_name }{ sort_column === column.variable_name ? sort_triangle : '' }</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.done && sorted_tickers.map(ticker => (
                            <GridRow 
                                key={ticker}
                                is_footer_row={false}
                                columns={display_columns}
                                all_tags={this.state.allTags}
                                current_position={this.state.allPositions[ticker]}
                                current_quote={this.state.allCurrentQuotes[ticker]}
                                performance_numbers={this.state.allPerformanceNumbers[ticker]}
                                performance_baseline={this.state.performance_baseline}
                                performance_baseline_numbers={this.state.performance_baseline_numbers}
                                total_value = {total_value}
                                ticker_is_index={this.tickerIsIndex}
                                on_remove_from_tag={this.onRemoveFromTag}
                                on_delete_ticker={this.onDeleteTicker}
                            />
                        ))}
                        <GridRowTotals
                            columns={display_columns}
                            total_value={total_value}
                        />
                    </tbody>
                </table>
            </div>
        )
    }

}