import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            period_size: 'month',
            period_data: [],
            data_sort_dir: 'asc',
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

        let data_sort_dir = 'asc', period_size ='month'

        const stored_data_sort_dir = JSON.parse(localStorage.getItem("data_sort_dir"))
        if (stored_data_sort_dir !== null) {
            data_sort_dir = stored_data_sort_dir
        }

        const stored_period_size = JSON.parse(localStorage.getItem("period_size"))
        if (stored_period_size !== null) {
            period_size = stored_period_size
        }

        this.generatePeriodData(period_size)

        this.setState({ data_sort_dir: data_sort_dir,
                        period_size: period_size })

    }

    generatePeriodData(period_size) {

        let sorted_transactions = this.props.all_transactions.sort(function(a, b) {
            if (a.date < b.date) {
                return -1
            } else if (a.date > b.date) {
                return 1
            } else {
                return 0
            }
        })
        
        let period_data = [], new_console_messages = [], quote_errors = []

        if (sorted_transactions.length) {

            // the performance start period includes the earliest added transaction
            let first_year = parseInt(sorted_transactions[0].date.split('-')[0])
            let first_month = parseInt(sorted_transactions[0].date.split('-')[1])
            let first_period
            if (period_size === 'month') {
                first_period = first_month
            } else if (period_size === 'quarter') {
                first_period = Math.floor((first_month - 1) / 3 + 1)
            } else if (period_size === 'year') {
                first_period = 1
            }

            // the performance end period includes the current date
            let today = new Date()
            let today_year = today.getFullYear()
            let today_month = today.getMonth() + 1
            let today_period
            if (period_size === 'month') {
                today_period = today_month
            } else if (period_size === 'quarter') {
                today_period = Math.round(today.getMonth() / 3)
            } else if (period_size === 'year') {
                today_period = 1
            }

            // calculate the number of periods to display
            let periods_of_performance
            if (period_size === 'month') {
                periods_of_performance = (today_year - first_year) * 12 + (today_period - first_period) + 1
            } else if (period_size === 'quarter') {
                periods_of_performance = (today_year - first_year) * 4 + (today_period - first_period) + 1
            } else if (period_size === 'year') {
                periods_of_performance = (today_year - first_year) + 1
            }

            // based on MONTHLY quote data, initialize the lookback variables for the previous period
            let start_baselinequote, start_baselineprice
            let prev_quote_month, prev_quote_year
            if (period_size === 'month') {
                prev_quote_year = (first_month !== 1) ? first_year : first_year - 1
                prev_quote_month = (first_month !== 1) ? first_month - 1 : 12
            } else if (period_size === 'quarter') {
                prev_quote_year = (first_period !== 1) ? first_year : first_year - 1 
                prev_quote_month = (first_period !== 1) ? (first_period - 1) * 3 : 9
            } else if (period_size === 'year') {
                prev_quote_year = first_year - 1
                prev_quote_month = 12
            }
            start_baselinequote = this.getMonthEndQuote('S&P500', prev_quote_year, prev_quote_month)
            if (start_baselinequote === undefined || start_baselinequote.price === undefined) {
                new_console_messages.push('ERROR: quote for symbol S&P500 for month '+prev_quote_year+'-'+prev_quote_month+' is unavailable')
                start_baselineprice = 'err.'
                quote_errors.push('S&P500')
            } else {
                start_baselineprice = start_baselinequote.price.adjusted_close
            }

            // calculate all period data
            let year = first_year
            let start_shares = {}, start_cash = 0, start_tickervalue = 0, start_totalvalue = 0
            for (let p = 0; p < periods_of_performance; p++) {
                
                // initialization
                let period, new_period = {}
                if (period_size === 'month') {
                    period = (p + first_period - 1) % 12 + 1
                } else if (period_size === 'quarter') {
                    period = (p + first_period - 1) % 4 + 1
                } else if (period_size === 'year') {
                    period =  1
                }
                new_period['period'] = period
                if (period === 1 && p !== 0) {
                    year += 1
                }
                new_period['year'] = year
                let end_shares = {}, end_cash = 0, end_transfersinvalue = 0
                if (p !== 0) {
                    start_tickervalue = period_data[p-1].end_tickervalue
                    start_totalvalue = period_data[p-1].end_totalvalue
                    end_shares = Object.assign({}, period_data[p-1].end_shares)
                    end_cash = period_data[p-1].end_cash
                } else {
                    end_shares = Object.assign({}, start_shares)
                    end_cash = start_cash
                }
                let period_sort_suffix, period_display_suffix
                if (period_size === 'month') {
                    let d = new Date(1980, period - 1, 1)
                    period_sort_suffix = 'M' + ('0' + period).slice(-2)
                    period_display_suffix = ' ' + d.toLocaleString('default', { month: 'short' })
                } else if (period_size === 'quarter') {
                    period_sort_suffix = 'Q' + ('0' + period).slice(-2)
                    period_display_suffix = 'Q' + period
                } else if (period_size === 'year') {
                    period_sort_suffix = ''
                    period_display_suffix = ''
                }
                new_period['display_name'] = (p !== periods_of_performance - 1) ? year + period_display_suffix : 'current'
                new_period['sort_name'] = year + period_sort_suffix

                // determine period's transactions
                let target_year = year
                let period_transactions = sorted_transactions.filter( t => this.getYear(t.date) === target_year && this.getPeriod(period_size, t.date) === period )
                new_period['transactions_of_stock'] = period_transactions.filter( t => t.ticker !== 'cash' )
                new_period['transactions_of_cash'] = period_transactions.filter( t => t.ticker === 'cash' )

                // determine period-end shares and cash value
                for (let transaction of period_transactions) {
                    let action, ticker, shares, total
                    [action, ticker, shares, total] = [transaction.action, transaction.ticker, transaction.shares, transaction.total]
                    if (ticker === 'cash') {
                        let cash_delta = (action === 'transferIN' || action === 'dividend') ? total : -1 * total
                        if (action === 'transferIN' || action === 'transferOUT') {
                            end_transfersinvalue += cash_delta
                        }
                        end_cash += cash_delta
                    } else {
                        let share_delta = (action === 'buy') ? shares : -1 * shares
                        let cash_delta = (action === 'buy') ? -1 * total : total
                        if (end_shares.hasOwnProperty(ticker)) {
                            end_shares[ticker] += share_delta
                        } else {
                            end_shares[ticker] = share_delta
                        }
                        end_cash += cash_delta
                    }
                }
                new_period['end_shares'] = end_shares
                new_period['end_cash'] = end_cash
                new_period['end_transfersinvalue'] = end_transfersinvalue

                // determine period-end ticker value
                let self = this
                let end_tickervalue = 0, end_tickerdate = null
                let this_quote_month
                if (period_size === 'month') {
                    this_quote_month = period
                } else if (period_size === 'quarter') {
                    this_quote_month = period * 3
                } else if (period_size === 'year') {
                    this_quote_month = 12
                }
                let this_quote_year = target_year
                if (target_year === today_year && period === today_period) { // for a partial last period, use a previous month's quotes
                    let lastavailablequote_month_str, lastavailablequote_year_str
                    [lastavailablequote_year_str, lastavailablequote_month_str] = this.props.all_month_end_dates[0].split('-')
                    let lastavailablequote_month = parseInt(lastavailablequote_month_str)
                    let lastavailablequote_year = parseInt(lastavailablequote_year_str)
                    if (period_size === 'year') {
                        if (lastavailablequote_year === today_year) {
                            this_quote_month = lastavailablequote_month
                            this_quote_year = lastavailablequote_year
                        }
                    } else {
                        if (lastavailablequote_month !== today_month || lastavailablequote_year !== today_year) { // allow the previous month's quotes only
                            if (today_month === 1 && (lastavailablequote_month !== 12 || lastavailablequote_year !== today_year - 1)) {
                                this_quote_month = 12
                                this_quote_year = today_year - 1
                            } else if (today_month !== 1 && (lastavailablequote_month !== today_month - 1 || lastavailablequote_year !== today_year)) {
                                this_quote_month = today_month - 1
                                this_quote_year = today_year
                            }
                        }
                    }
                }
                Object.entries(end_shares).forEach(function(position) {
                    if (position[1] !== 0) {
                        let month_end_quote = self.getMonthEndQuote(position[0], this_quote_year, this_quote_month)
                        if (month_end_quote === undefined || month_end_quote.price === undefined) {
                            new_console_messages.push('ERROR: quote for symbol '+position[0]+' for month '+this_quote_year+'-'+this_quote_month+' is unavailable')
                            end_tickervalue = 'err.'
                            end_tickerdate = null
                            quote_errors.push(position[0])
                        } else if (end_tickervalue !== 'err.') {
                            end_tickervalue += position[1] * month_end_quote.price.adjusted_close
                            if (end_tickerdate === null) {
                                end_tickerdate = month_end_quote.date
                            } else if (end_tickerdate !== month_end_quote.date) {
                                new_console_messages.push('ERROR: quote dates for month '+this_quote_year+'-'+this_quote_month+' do not match for all symbols ('+end_tickerdate+' & '+month_end_quote.date+')')
                            }
                        }
                    }
                })
                new_period['end_tickervalue'] = end_tickervalue
                new_period['end_tickerdate'] = end_tickerdate
                
                // determine period-end total value
                let end_totalvalue
                if (typeof end_tickervalue !== 'number' || typeof end_cash !== 'number') {
                    end_totalvalue = 'err.'
                } else {
                    end_totalvalue = end_tickervalue + end_cash
                }
                new_period['end_totalvalue'] = end_totalvalue
                new_period['end_tickervaluefraction'] = end_tickervalue / end_totalvalue
                new_period['end_cashfraction'] = end_cash / end_totalvalue

                // determine period-end baseline value
                let end_baselineprice, end_baselinedate
                let end_baselinequote = self.getMonthEndQuote('S&P500', this_quote_year, this_quote_month)
                if (end_baselinequote === undefined || end_baselinequote.price === undefined) {
                    new_console_messages.push('ERROR: quote for symbol S&P500 for month '+this_quote_year+'-'+this_quote_month+' is unavailable')
                    end_baselineprice = 'err.'
                    end_baselinedate = null
                    quote_errors.push('S&P500')
                } else {
                    end_baselineprice = end_baselinequote.price.adjusted_close
                    end_baselinedate = end_baselinequote.date
                }
                new_period['end_baselineprice'] = end_baselineprice
                new_period['end_baselinedate'] = end_baselinedate

                // determine period-over-period performance
                // HPR (holding period return) = end / prev_end - 1
                // HPR (HPR, adjusted for transfers) = end / (prev_end + transfersIN) - 1
                // transfersIN, adjusted for middle-of-period transfers... aka Modified Dietz method)
                //   transfersIN = transferINa * fraction of period duration) + (transferINb * fraction of period duration)
                let adjusted_transfer_value = 0
                let zb_start_month, zb_end_month, end_year
                if (period_size === 'month') {
                    zb_start_month = period - 1
                    zb_end_month = (zb_start_month !== 11) ? zb_start_month + 1 : 1
                    end_year = (zb_start_month !== 11) ? target_year : target_year + 1
                } else if (period_size === 'quarter') {
                    zb_start_month = period * 3 - 3
                    zb_end_month = (period !== 4) ? zb_start_month + 3 : 1
                    end_year = (period !== 4) ? target_year : target_year + 1
                } else if (period_size === 'year') {
                    zb_start_month = 0
                    zb_end_month = 0
                    end_year = target_year + 1
                }
                let period_start_date = new Date(target_year, zb_start_month, 1)
                let period_end_date = new Date(end_year, zb_end_month, 1)
                let period_days = Math.round((period_end_date - period_start_date) / (1000 * 60 * 60 * 24))
                new_period.transactions_of_cash.forEach(function(transaction) {
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
                if (typeof start_totalvalue !== 'number' || typeof end_totalvalue !== 'number') {
                    performance = 'err.'
                } else if (start_tickervalue === 0 && end_tickervalue === 0) {
                    performance = 0
                } else {
                    performance = (end_totalvalue / (start_totalvalue + adjusted_transfer_value)) - 1
                }
                new_period['period_change_pct'] = performance

                // determine period-over-period baseline performance
                performance = 'n/a'
                if (typeof start_baselineprice !== 'number' || typeof end_baselineprice !== 'number') {
                    performance = 'err.'
                } else if (p === 0) {
                    performance = (end_baselineprice / start_baselineprice) - 1
                } else {
                    performance = (end_baselineprice / period_data[p-1].end_baselineprice) - 1
                }
                new_period['period_baseline_change_pct'] = performance

                // store the data object
                period_data.push(new_period)
            }
        }

        if (new_console_messages.length) {
            let message_summary
            if (new_console_messages.length === 1) {
                message_summary = new_console_messages[0]
            } else {
                let quote_error_count = quote_errors.length
                let quote_tickers_count = Array.from(new Set(quote_errors)).length
                if (quote_error_count === 1) {
                    message_summary = 'ERROR: 1 quote was unavailable'
                } else if (quote_error_count > 1) {
                    message_summary = 'ERROR: ' + quote_error_count + ' quotes from ' + quote_tickers_count + ' different stocks were unavailable'
                } else {
                    message_summary = 'ERROR: period performance calculations encountered error(s)'
                }
            }
            let new_console_message_set = this.props.create_console_message_set(message_summary)
            new_console_message_set.messages = [...new_console_messages]
            this.props.on_new_console_messages(new_console_message_set)
        }

        this.setState({ period_data: period_data })

    }

    getYear(date) {
        return parseInt(date.split('-')[0])
    }

    getPeriod(period_size, date) {
        let zb_month = parseInt(date.split('-')[1])-1

        if (period_size === 'month') {
            return zb_month + 1
        } else if (period_size === 'quarter') {
            return Math.floor(zb_month / 3) + 1
        } else if (period_size === 'year') {
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

    getDisplayedPerformance(period_data) {
        let retval = {}
        retval['key'] = period_data.sort_name
        retval['display_value'] = 'err.'
        retval['baseline_value'] = 'err.'
        retval['index_value'] = period_data.period_baseline_change_pct
        let my_perf = period_data.period_change_pct
        if (my_perf === 'err.') {
            retval['display_value'] = 'err.'
        } else if (typeof my_perf === 'number') {
            if (this.props.baseline_name === 'sp500_pct_gain') {
                let baseline_perf = period_data.period_baseline_change_pct
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
        let monthly_quotes = this.props.all_monthly_quotes
        let monthly_dates = this.props.all_month_end_dates
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
        if ( this.props.baseline_name === 'sp500_pct_gain') {
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
        if ( this.props.baseline_name === 'sp500_pct_gain') {
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
            let new_sort_dir = (prevState.data_sort_dir === 'asc') ? 'desc' : 'asc'
            localStorage.setItem('data_sort_dir', JSON.stringify(new_sort_dir))
            return { 
                data_sort_dir: new_sort_dir 
            }
        })
    }

    handlePeriodChange(event) {
        let newPeriod = event.target.id.replace(/select-/g, '')
        localStorage.setItem('period_size', JSON.stringify(newPeriod))
        this.setState({ period_size: newPeriod })
        this.generatePeriodData(newPeriod)
    }

    render() {
        let self = this
        let displayed_performance = {}
        this.state.period_data.forEach(function(qdata) {
            displayed_performance[qdata.sort_name] = self.getDisplayedPerformance(qdata)
        })
        let sorted_data = this.state.period_data.sort( function(a,b) {
            if (a.sort_name < b.sort_name) {
                return (self.state.data_sort_dir === 'asc') ? -1 : 1
            } else if (a.sort_name > b.sort_name) {
                return (self.state.data_sort_dir === 'asc') ? 1 : -1
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
                                <li id="select-year" className={"strong selector" + (this.state.period_size === "year" ? " selected" : "")} onClick={this.handlePeriodChange}>Y</li>
                                <li id="select-quarter" className={"strong selector" + (this.state.period_size === "quarter" ? " selected" : "")} onClick={this.handlePeriodChange}>Q</li>
                                <li id="select-month" className={"strong selector" + (this.state.period_size === "month" ? " selected" : "")} onClick={this.handlePeriodChange}>M</li>
                            </ul>
                            <div id="sortorder-button">
                                <button onClick={ (e)=>this.onToggleSortOrder(sorted_data.length) } className="strong">&#x21c6;</button>
                            </div>
                        </div>
                        <p className="strong">stocks:</p>
                        <p className="strong">cash:</p>
                        <p className="strong">transfers in:</p>
                        <p className="strong">total:</p>
                        <p className="strong">my perf{ (this.props.baseline_name === 'sp500_pct_gain') ? ' delta' : '' }:</p>
                        <p className="strong">S&amp;P500:</p>
                    </div>
                    <div id="my-performance-periods">
                        { sorted_data.map( qdata => (
                        <div className="period-data" key={qdata.sort_name}>
                            <p className="strong">{qdata.display_name}</p>
                            <p>{this.formatCurrency(qdata.end_tickervalue)} ({this.formatWholePercentage(qdata.end_tickervaluefraction)})</p>
                            <p>{this.formatCurrency(qdata.end_cash)} ({this.formatWholePercentage(qdata.end_cashfraction)})</p>
                            <p>{this.formatCurrency(qdata.end_transfersinvalue)}</p>
                            <p className="strong">{this.formatCurrency(qdata.end_totalvalue)}</p>
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
    all_transactions: PropTypes.array.isRequired,
    all_positions: PropTypes.object.isRequired,
    all_monthly_quotes: PropTypes.object.isRequired,
    all_month_end_dates: PropTypes.array.isRequired,
    baseline_name: PropTypes.string.isRequired,
    create_console_message_set: PropTypes.func.isRequired,
    on_new_console_messages: PropTypes.func.isRequired
}