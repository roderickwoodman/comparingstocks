import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            periodSize: 'month',
            periodData: [],
            dataSortDir: 'asc',
        }
        this.generatePeriodData = this.generatePeriodData.bind(this)
        this.numberWithCommas = this.numberWithCommas.bind(this)
        this.formatCurrency = this.formatCurrency.bind(this)
        this.getDisplayedPerformance = this.getDisplayedPerformance.bind(this)
        this.getMonthEndQuote = this.getMonthEndQuote.bind(this)
        this.getYear = this.getYear.bind(this)
        this.getPeriod = this.getPeriod.bind(this)
        this.getMonth = this.getMonth.bind(this)
        this.styleCell = this.styleCell.bind(this)
        this.formatPerformance = this.formatPerformance.bind(this)
        this.formatIndexPerformance = this.formatIndexPerformance.bind(this)
        this.formatWholePercentage = this.formatWholePercentage.bind(this)
        this.onToggleSortOrder = this.onToggleSortOrder.bind(this)
        this.handlePeriodChange = this.handlePeriodChange.bind(this)
    }

    componentDidMount() {

        let dataSortDir = 'asc', periodSize ='month'

        const storedDataSortDir = JSON.parse(localStorage.getItem("dataSortDir"))
        if (storedDataSortDir !== null) {
            dataSortDir = storedDataSortDir
        }

        const storedPeriodSize = JSON.parse(localStorage.getItem("periodSize"))
        if (storedPeriodSize !== null) {
            periodSize = storedPeriodSize
        }

        this.generatePeriodData(periodSize)

        this.setState({ dataSortDir: dataSortDir,
                        periodSize: periodSize })

    }

    generatePeriodData(periodSize) {

        let sortedTransactions = this.props.allTransactions.sort(function(a, b) {
            if (a.date < b.date) {
                return -1
            } else if (a.date > b.date) {
                return 1
            } else {
                return 0
            }
        })
        
        let periodData = [], newConsoleMessages = [], quoteErrors = []

        if (sortedTransactions.length) {

            // the performance start period includes the earliest added transaction
            let firstYear = parseInt(sortedTransactions[0].date.split('-')[0])
            let firstMonth = parseInt(sortedTransactions[0].date.split('-')[1])
            let firstPeriod
            if (periodSize === 'month') {
                firstPeriod = firstMonth
            } else if (periodSize === 'quarter') {
                firstPeriod = Math.floor((firstMonth - 1) / 3 + 1)
            } else if (periodSize === 'year') {
                firstPeriod = 1
            }

            // the performance end period includes the current date
            let today = new Date()
            let todayYear = today.getFullYear()
            let todayMonth = today.getMonth() + 1
            let todayPeriod
            if (periodSize === 'month') {
                todayPeriod = todayMonth
            } else if (periodSize === 'quarter') {
                todayPeriod = Math.round(today.getMonth() / 3)
            } else if (periodSize === 'year') {
                todayPeriod = 1
            }

            // calculate the number of periods to display
            let periodsOfPerformance
            if (periodSize === 'month') {
                periodsOfPerformance = (todayYear - firstYear) * 12 + (todayPeriod - firstPeriod) + 1
            } else if (periodSize === 'quarter') {
                periodsOfPerformance = (todayYear - firstYear) * 4 + (todayPeriod - firstPeriod) + 1
            } else if (periodSize === 'year') {
                periodsOfPerformance = (todayYear - firstYear) + 1
            }

            // based on MONTHLY quote data, initialize the lookback variables for the previous period
            let startBaselinequote, startBaselineprice
            let prevQuoteMonth, prevQuoteYear
            if (periodSize === 'month') {
                prevQuoteYear = (firstMonth !== 1) ? firstYear : firstYear - 1
                prevQuoteMonth = (firstMonth !== 1) ? firstMonth - 1 : 12
            } else if (periodSize === 'quarter') {
                prevQuoteYear = (firstPeriod !== 1) ? firstYear : firstYear - 1 
                prevQuoteMonth = (firstPeriod !== 1) ? (firstPeriod - 1) * 3 : 9
            } else if (periodSize === 'year') {
                prevQuoteYear = firstYear - 1
                prevQuoteMonth = 12
            }
            startBaselinequote = this.getMonthEndQuote('S&P500', prevQuoteYear, prevQuoteMonth)
            if (startBaselinequote === undefined || startBaselinequote.price === undefined) {
                newConsoleMessages.push('ERROR: Quote for symbol S&P500 for month '+prevQuoteYear+'-'+prevQuoteMonth+' is unavailable.')
                startBaselineprice = 'err.'
                quoteErrors.push('S&P500')
            } else {
                startBaselineprice = startBaselinequote.price.adjustedClose
            }

            // calculate all period data
            let year = firstYear
            let startShares = {}, startCash = 0, startTickervalue = 0, startTotalValue = 0
            for (let p = 0; p < periodsOfPerformance; p++) {
                
                // initialization
                let period, newPeriod = {}
                if (periodSize === 'month') {
                    period = (p + firstPeriod - 1) % 12 + 1
                } else if (periodSize === 'quarter') {
                    period = (p + firstPeriod - 1) % 4 + 1
                } else if (periodSize === 'year') {
                    period =  1
                }
                newPeriod['period'] = period
                if (period === 1 && p !== 0) {
                    year += 1
                }
                newPeriod['year'] = year

                // initialize this period's end values with the previous period's end values
                let prevShares = {}, prevCash = 0, endTransfersinvalue = 0
                if (p !== 0) {
                    startTickervalue = periodData[p-1].endTickervalue
                    startTotalValue = periodData[p-1].endTotalvalue
                    prevShares = Object.assign({}, periodData[p-1].endShares)
                    prevCash = periodData[p-1].endCash
                } else {
                    prevShares = Object.assign({}, startShares)
                    prevCash = startCash
                }
                let endShares = Object.assign({}, prevShares)
                let endCash = prevCash

                // generate the title for this period
                let periodSortSuffix, periodDisplaySuffix
                if (periodSize === 'month') {
                    let d = new Date(1980, period - 1, 1)
                    periodSortSuffix = 'M' + ('0' + period).slice(-2)
                    periodDisplaySuffix = ' ' + d.toLocaleString('default', { month: 'short' })
                } else if (periodSize === 'quarter') {
                    periodSortSuffix = 'Q' + ('0' + period).slice(-2)
                    periodDisplaySuffix = 'Q' + period
                } else if (periodSize === 'year') {
                    periodSortSuffix = ''
                    periodDisplaySuffix = ''
                }
                newPeriod['displayName'] = (p !== periodsOfPerformance - 1) ? year + periodDisplaySuffix : 'current'
                newPeriod['sort_name'] = year + periodSortSuffix

                // determine period's transactions
                let target_year = year
                let period_transactions = sortedTransactions.filter( t => this.getYear(t.date) === target_year && this.getPeriod(periodSize, t.date) === period )
                newPeriod['transactions_of_stock'] = period_transactions.filter( t => t.ticker !== 'cash' )
                newPeriod['transactions_of_cash'] = period_transactions.filter( t => t.ticker === 'cash' )

                // determine period-end shares and cash value
                for (let transaction of period_transactions) {
                    let action, ticker, shares, total
                    [action, ticker, shares, total] = [transaction.action, transaction.ticker, transaction.shares, transaction.total]
                    if (ticker === 'cash') {
                        let cash_delta = (action === 'transferIN' || action === 'dividend') ? total : -1 * total
                        if (action === 'transferIN' || action === 'transferOUT') {
                            endTransfersinvalue += cash_delta
                        }
                        endCash += cash_delta
                    } else {
                        let share_delta = (action === 'buy') ? shares : -1 * shares
                        let cash_delta = (action === 'buy') ? -1 * total : total
                        if (endShares.hasOwnProperty(ticker)) {
                            endShares[ticker] += share_delta
                        } else {
                            endShares[ticker] = share_delta
                        }
                        endCash += cash_delta
                    }
                }
                newPeriod['endShares'] = endShares
                newPeriod['endCash'] = endCash
                newPeriod['endTransfersinvalue'] = endTransfersinvalue

                // determine period-end ticker value
                let self = this
                let endTickervalue = 0, end_tickerdate = null
                let this_quote_month
                if (periodSize === 'month') {
                    this_quote_month = period
                } else if (periodSize === 'quarter') {
                    this_quote_month = period * 3
                } else if (periodSize === 'year') {
                    this_quote_month = 12
                }
                let this_quote_year = target_year
                if (target_year === todayYear && period === todayPeriod) { // for a partial last period, use a previous month's quotes
                    let lastavailablequote_month_str, lastavailablequote_year_str
                    [lastavailablequote_year_str, lastavailablequote_month_str] = this.props.allMonthEndDates[0].split('-')
                    let lastavailablequote_month = parseInt(lastavailablequote_month_str)
                    let lastavailablequote_year = parseInt(lastavailablequote_year_str)
                    if (periodSize === 'year') {
                        if (lastavailablequote_year === todayYear) {
                            this_quote_month = lastavailablequote_month
                            this_quote_year = lastavailablequote_year
                        }
                    } else {
                        if (lastavailablequote_month !== todayMonth || lastavailablequote_year !== todayYear) { // allow the previous month's quotes only
                            if (todayMonth === 1 && (lastavailablequote_month !== 12 || lastavailablequote_year !== todayYear - 1)) {
                                this_quote_month = 12
                                this_quote_year = todayYear - 1
                            } else if (todayMonth !== 1 && (lastavailablequote_month !== todayMonth - 1 || lastavailablequote_year !== todayYear)) {
                                this_quote_month = todayMonth - 1
                                this_quote_year = todayYear
                            }
                        }
                    }
                }
                Object.entries(endShares).forEach(function(position) {
                    if (position[1] !== 0) {
                        let month_end_quote = self.getMonthEndQuote(position[0], this_quote_year, this_quote_month)
                        if (month_end_quote === undefined || month_end_quote.price === undefined) {
                            newConsoleMessages.push('ERROR: Quote for symbol '+position[0]+' for month '+this_quote_year+'-'+this_quote_month+' is unavailable.')
                            endTickervalue = 'err.'
                            end_tickerdate = null
                            quoteErrors.push(position[0])
                        } else if (endTickervalue !== 'err.') {
                            endTickervalue += position[1] * month_end_quote.price.adjustedClose
                            if (end_tickerdate === null) {
                                end_tickerdate = month_end_quote.date
                            } else if (end_tickerdate !== month_end_quote.date) {
                                newConsoleMessages.push('ERROR: Quote dates for month '+this_quote_year+'-'+this_quote_month+' do not match for all symbols ('+end_tickerdate+' & '+month_end_quote.date+').')
                            }
                        }
                    }
                })
                newPeriod['endTickervalue'] = endTickervalue
                newPeriod['end_tickerdate'] = end_tickerdate
                
                // determine period-end total value
                let endTotalvalue
                if (typeof endTickervalue !== 'number' || typeof endCash !== 'number') {
                    endTotalvalue = 'err.'
                } else {
                    endTotalvalue = endTickervalue + endCash
                }
                newPeriod['endTotalvalue'] = endTotalvalue
                newPeriod['end_tickervaluefraction'] = endTickervalue / endTotalvalue
                newPeriod['end_cashfraction'] = endCash / endTotalvalue

                // determine period-end baseline value
                let end_baselineprice, end_baselinedate
                let end_baselinequote = self.getMonthEndQuote('S&P500', this_quote_year, this_quote_month)
                if (end_baselinequote === undefined || end_baselinequote.price === undefined) {
                    newConsoleMessages.push('ERROR: Quote for symbol S&P500 for month '+this_quote_year+'-'+this_quote_month+' is unavailable.')
                    end_baselineprice = 'err.'
                    end_baselinedate = null
                    quoteErrors.push('S&P500')
                } else {
                    end_baselineprice = end_baselinequote.price.adjustedClose
                    end_baselinedate = end_baselinequote.date
                }
                newPeriod['end_baselineprice'] = end_baselineprice
                newPeriod['end_baselinedate'] = end_baselinedate

                // determine period-over-period performance
                // HPR (holding period return) = end / prev_end - 1
                // HPR (HPR, adjusted for transfers) = end / (prev_end + transfersIN) - 1
                // transfersIN, adjusted for middle-of-period transfers... aka Modified Dietz method)
                //   transfersIN = transferINa * fraction of period duration) + (transferINb * fraction of period duration)
                let adjusted_transfer_value = 0
                let zb_start_month, zb_end_month, end_year
                if (periodSize === 'month') {
                    zb_start_month = period - 1
                    zb_end_month = (zb_start_month !== 11) ? zb_start_month + 1 : 1
                    end_year = (zb_start_month !== 11) ? target_year : target_year + 1
                } else if (periodSize === 'quarter') {
                    zb_start_month = period * 3 - 3
                    zb_end_month = (period !== 4) ? zb_start_month + 3 : 1
                    end_year = (period !== 4) ? target_year : target_year + 1
                } else if (periodSize === 'year') {
                    zb_start_month = 0
                    zb_end_month = 0
                    end_year = target_year + 1
                }
                let period_start_date = new Date(target_year, zb_start_month, 1)
                let period_end_date = new Date(end_year, zb_end_month, 1)
                let period_days = Math.round((period_end_date - period_start_date) / (1000 * 60 * 60 * 24))
                newPeriod.transactions_of_cash.forEach(function(transaction) {
                    let transfer_month, transfer_day, fraction_of_period
                    [transfer_month, transfer_day] = [parseInt(transaction.date.split('-')[1]), parseInt(transaction.date.split('-')[2])]
                    let transfer_date = new Date(target_year, transfer_month - 1, transfer_day)
                    if (transaction.action === 'transferIN') {
                        fraction_of_period = (period_end_date - transfer_date) / (1000 * 60 * 60 * 24) / period_days
                        adjusted_transfer_value += transaction.total * fraction_of_period
                    } else if (transaction.action === 'transferOUT') {
                        fraction_of_period = (transfer_date - period_start_date) / (1000 * 60 * 60 * 24) / period_days
                        adjusted_transfer_value -= transaction.total * fraction_of_period
                    }
                })
                let performance
                if (typeof startTotalValue !== 'number' || typeof endTotalvalue !== 'number') {
                    performance = 'err.'
                } else if (startTickervalue === 0 && endTickervalue === 0) {
                    performance = 0
                } else {
                    performance = (endTotalvalue / (startTotalValue + adjusted_transfer_value)) - 1
                }
                newPeriod['period_change_pct'] = performance

                // determine period-over-period baseline performance
                performance = 'n/a'
                if (typeof startBaselineprice !== 'number' || typeof end_baselineprice !== 'number') {
                    performance = 'err.'
                } else if (p === 0) {
                    performance = (end_baselineprice / startBaselineprice) - 1
                } else {
                    performance = (end_baselineprice / periodData[p-1].end_baselineprice) - 1
                }
                newPeriod['period_baseline_change_pct'] = performance

                // store the data object
                periodData.push(newPeriod)
            }
        }

        if (newConsoleMessages.length) {
            let message_summary
            let quote_error_count = quoteErrors.length
            if (newConsoleMessages.length === 1) {
                message_summary = newConsoleMessages[0]
            } else {
                let quote_tickers_count = Array.from(new Set(quoteErrors)).length
                let plural_quoteerrors = (quote_error_count === 1) ? '' : 's'
                let plural_verb = (quote_error_count === 1) ? ' was' : ' were'
                let plural_differentstocks = (quote_tickers_count === 1) ? ' stock' : ' different stocks'
                if (quote_error_count === 1) {
                    message_summary = 'ERROR: 1 quote was unavailable.'
                } else if (quote_error_count > 1) {
                    message_summary = 'ERROR: ' + quote_error_count + ' quote' + plural_quoteerrors 
                        + ' from ' + quote_tickers_count + plural_differentstocks + plural_verb + ' unavailable.'
                } else {
                    message_summary = 'ERROR: period performance calculations encountered error(s)'
                }
            }
            let newConsoleMessageSet = this.props.createConsoleMessageSet(message_summary)
            newConsoleMessageSet.messages = [...newConsoleMessages]
            if (quote_error_count > 0) {
                newConsoleMessageSet.hasErrors = true
            }
            this.props.onNewConsoleMessages(newConsoleMessageSet)
        }

        this.setState({ periodData: periodData })

    }

    getYear(date) {
        return parseInt(date.split('-')[0])
    }

    getPeriod(periodSize, date) {
        let zb_month = parseInt(date.split('-')[1])-1

        if (periodSize === 'month') {
            return zb_month + 1
        } else if (periodSize === 'quarter') {
            return Math.floor(zb_month / 3) + 1
        } else if (periodSize === 'year') {
            return 1
        } else {
            return 'n/a'
        }
    }

    getMonth(date) {
        return parseInt(date.split('-')[1])
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    formatCurrency(dollars) {
        let prefix, retval = dollars
        if (typeof dollars === 'number') {
            let value = Math.round(dollars)
            retval = this.numberWithCommas(Math.abs(value))
            prefix = (value < 0 ) ? '-$' : '$'
            retval = prefix + retval
        } else {
            retval = 'err.'
        }
        return retval
    }

    getDisplayedPerformance(periodData) {
        let retval = {}
        retval['key'] = periodData.sort_name
        retval['display_value'] = 'err.'
        retval['baseline_value'] = 'err.'
        retval['index_value'] = periodData.period_baseline_change_pct
        let my_perf = periodData.period_change_pct
        if (my_perf === 'err.') {
            retval['display_value'] = 'err.'
        } else if (typeof my_perf === 'number') {
            if (this.props.baselineName === 'sp500_pct_gain') {
                let baseline_perf = periodData.period_baseline_change_pct
                if (typeof baseline_perf !== 'number') {
                    return retval
                } else {
                    retval['display_value'] = my_perf - baseline_perf
                    retval['baseline_value'] = baseline_perf
                }
            } else {
                retval['display_value'] = my_perf
                retval['baseline_value'] = 0
            }
        }
        return retval
    }

    getMonthEndQuote(ticker, year, month) {
        let monthly_quotes = this.props.allMonthlyQuotes
        let monthly_dates = this.props.allMonthEndDates
        let period_idx = monthly_dates.findIndex( date => this.getYear(date) === year && this.getMonth(date) === month )
        let retval = {}
        if (period_idx !== -1) {
            let quote_date = monthly_dates[period_idx]
            retval['date'] = quote_date
            retval['price'] = (monthly_quotes[ticker].hasOwnProperty(quote_date)) ? monthly_quotes[ticker][quote_date] : undefined
        } else {
            retval = undefined
        }
        return retval
    }

    styleCell(performance_obj) {
        let displayed, baseline, index
        [displayed, baseline, index] = [performance_obj.display_value, performance_obj.baseline_value, performance_obj.index_value]
        let classes = 'performance-cell'
        if ( this.props.baselineName === 'sp500_pct_gain') {
            if (displayed > 0) {
                classes += ' text-green'
            } else if (displayed < 0) {
                classes += ' text-red'
            }
        } else {
            if ( displayed < baseline || displayed < 0 ) {
                classes += ' text-red'
            } else if (displayed > index && displayed > 0) {
                classes += ' text-green'
            }
        }
        return classes
    }

    formatPerformance(performance) {
        if (performance === 'err.' || performance === 'ref.') {
            return performance
        } else if (typeof performance !== 'number') {
            return '-'
        } else {
            return (Math.round(performance * 100 * 10) / 10).toFixed(1) + '%'
        }
    }

    formatIndexPerformance(performance) {
        if ( this.props.baselineName === 'sp500_pct_gain') {
            return this.formatPerformance('ref.')
        } else {
            return this.formatPerformance(performance)
        }
    }

    formatWholePercentage(percentage) {
        if (percentage === 'err.') {
            return 'err.'
        } else if (typeof percentage !== 'number' || isNaN(percentage)) {
            return '?'
        } else {
            return (Math.round(percentage * 100)) + '%'
        }
    }

    onToggleSortOrder(num_periods) {
        let el = document.getElementById('my-performance-periods')
        let period_width = Math.floor(el.scrollWidth / num_periods)
        let leftmost_zbperiod_shown = Math.floor(el.scrollLeft / period_width)
        let new_scroll_left = (num_periods - leftmost_zbperiod_shown - 1) * period_width
        el.scrollLeft = new_scroll_left
        this.setState(prevState => {
            let newSortDir = (prevState.dataSortDir === 'asc') ? 'desc' : 'asc'
            localStorage.setItem('dataSortDir', JSON.stringify(newSortDir))
            return { 
                dataSortDir: newSortDir 
            }
        })
    }

    handlePeriodChange(event) {
        let newPeriod = event.target.id.replace(/select-/g, '')
        localStorage.setItem('periodSize', JSON.stringify(newPeriod))
        this.setState({ periodSize: newPeriod })
        this.generatePeriodData(newPeriod)
    }

    render() {
        let self = this
        let displayed_performance = {}
        this.state.periodData.forEach(function(qdata) {
            displayed_performance[qdata.sort_name] = self.getDisplayedPerformance(qdata)
        })
        let sorted_data = this.state.periodData.sort( function(a,b) {
            if (a.sort_name < b.sort_name) {
                return (self.state.dataSortDir === 'asc') ? -1 : 1
            } else if (a.sort_name > b.sort_name) {
                return (self.state.dataSortDir === 'asc') ? 1 : -1
            } else {
                return 0
            }
        })
        return (
            <div id="my-performance-wrapper">
                <div id="my-performance-body">
                    <div id="my-performance-rowlabels">
                        <div id="my-performance-controls">
                            <ul id="periodsize-selector">
                                <li id="select-year" className={"strong selector" + (this.state.periodSize === "year" ? " selected" : "")} onClick={this.handlePeriodChange}>Y</li>
                                <li id="select-quarter" className={"strong selector" + (this.state.periodSize === "quarter" ? " selected" : "")} onClick={this.handlePeriodChange}>Q</li>
                                <li id="select-month" className={"strong selector" + (this.state.periodSize === "month" ? " selected" : "")} onClick={this.handlePeriodChange}>M</li>
                            </ul>
                            <div id="sortorder-button">
                                <button onClick={ (e)=>this.onToggleSortOrder(sorted_data.length) } className="strong">&#x21c6;</button>
                            </div>
                        </div>
                        <p className="strong">stocks:</p>
                        <p className="strong">cash:</p>
                        <p className="strong">transfers in:</p>
                        <p className="strong">total:</p>
                        <p className="strong">my perf{ (this.props.baselineName === 'sp500_pct_gain') ? ' delta' : '' }:</p>
                        <p className="strong">S&amp;P500:</p>
                    </div>
                    <div id="my-performance-periods">
                        { sorted_data.map( qdata => (
                        <div className="period-data" key={qdata.sort_name}>
                            <p className="strong">{qdata.displayName}</p>
                            <p>{this.formatCurrency(qdata.endTickervalue)} ({this.formatWholePercentage(qdata.end_tickervaluefraction)})</p>
                            <p>{this.formatCurrency(qdata.endCash)} ({this.formatWholePercentage(qdata.end_cashfraction)})</p>
                            <p>{this.formatCurrency(qdata.endTransfersinvalue)}</p>
                            <p className="strong">{this.formatCurrency(qdata.endTotalvalue)}</p>
                            <p className={ this.styleCell(displayed_performance[qdata.sort_name]) }>{ this.formatPerformance(displayed_performance[qdata.sort_name].display_value) }</p>
                            <p>{ this.formatIndexPerformance(displayed_performance[qdata.sort_name].index_value) }</p>
                        </div>
                        ))}
                    </div>
                </div>
                <div id="my-performance-footer">
                </div>

            </div>
        )
    }
}

MyPerformance.propTypes = {
    allTransactions: PropTypes.array.isRequired,
    allPositions: PropTypes.object.isRequired,
    allMonthlyQuotes: PropTypes.object.isRequired,
    allMonthEndDates: PropTypes.array.isRequired,
    baselineName: PropTypes.string.isRequired,
    createConsoleMessageSet: PropTypes.func.isRequired,
    onNewConsoleMessages: PropTypes.func.isRequired
}