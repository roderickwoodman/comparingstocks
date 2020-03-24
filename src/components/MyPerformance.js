import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            period_type: 'year',
            period_data: [],
            data_sort_dir: 'asc',
            error_message: ''
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
    }

    componentDidMount() {
        this.generatePeriodData()
    }

    generatePeriodData() {

        let sorted_transactions = this.props.all_transactions.sort(function(a, b) {
            if (a.date < b.date) {
                return -1
            } else if (a.date > b.date) {
                return 1
            } else {
                return 0
            }
        })
        
        let period_data = []

        if (sorted_transactions.length) {

            // the performance start period includes the earliest added transaction
            let first_year = parseInt(sorted_transactions[0].date.split('-')[0])
            let first_month = parseInt(sorted_transactions[0].date.split('-')[1])
            let first_period
            if (this.state.period_type === 'month') {
                first_period = first_month
            } else if (this.state.period_type === 'quarter') {
                first_period = Math.floor((first_month - 1) / 3 + 1)
            } else if (this.state.period_type === 'year') {
                first_period = 1
            }

            // the performance end period includes the current date
            let today = new Date()
            let today_year = today.getFullYear()
            let today_month = today.getMonth() + 1
            let today_period
            if (this.state.period_type === 'month') {
                today_period = today_month
            } else if (this.state.period_type === 'quarter') {
                today_period = Math.round(today.getMonth() / 3)
            } else if (this.state.period_type === 'year') {
                today_period = 1
            }

            // calculate the number of periods to display
            let periods_of_performance
            if (this.state.period_type === 'month') {
                periods_of_performance = (today_year - first_year) * 12 + (today_period - first_period) + 1
            } else if (this.state.period_type === 'quarter') {
                periods_of_performance = (today_year - first_year) * 4 + (today_period - first_period) + 1
            } else if (this.state.period_type === 'year') {
                periods_of_performance = (today_year - first_year) + 1
            }

            // based on MONTHLY quote data, initialize the lookback variables for the previous period
            let start_baselinequote, start_baselineprice
            let prev_quote_month, prev_quote_year
            if (this.state.period_type === 'month') {
                prev_quote_year = (first_month !== 1) ? first_year : first_year - 1
                prev_quote_month = (first_month !== 1) ? first_month - 1 : 12
            } else if (this.state.period_type === 'quarter') {
                prev_quote_year = (first_period !== 1) ? first_year : first_year - 1 
                prev_quote_month = (first_period !== 1) ? (first_period - 1) * 3 : 9
            } else if (this.state.period_type === 'year') {
                prev_quote_year = first_year - 1
                prev_quote_month = 12
            }
            start_baselinequote = this.getMonthEndQuote('S&P500', prev_quote_year, prev_quote_month)
            if (start_baselinequote === null) {
                let error_message = 'ERROR: quote for symbol S&P500 for month '+prev_quote_year+'-'+prev_quote_month+' is unavailable'
                this.setState({ error_message: error_message })
                console.log(error_message)
                start_baselineprice = 'err.'
            } else {
                start_baselineprice = start_baselinequote.price
            }

            // calculate all period data
            let year = first_year
            let start_shares = {}, start_cash = 0, start_tickervalue = 0, start_totalvalue = 0
            for (let p = 0; p < periods_of_performance; p++) {
                
                // initialization
                let period, new_period = {}
                if (this.state.period_type === 'month') {
                    period = (p + first_period - 1) % 12 + 1
                } else if (this.state.period_type === 'quarter') {
                    period = (p + first_period - 1) % 4 + 1
                } else if (this.state.period_type === 'year') {
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
                if (this.state.period_type === 'month') {
                    let d = new Date(1980, period - 1, 1)
                    period_sort_suffix = 'M' + ('0' + period).slice(-2)
                    period_display_suffix = ' ' + d.toLocaleString('default', { month: 'short' })
                } else if (this.state.period_type === 'quarter') {
                    period_sort_suffix = 'Q' + ('0' + period).slice(-2)
                    period_display_suffix = 'Q' + period
                } else if (this.state.period_type === 'year') {
                    period_sort_suffix = ''
                    period_display_suffix = ''
                }
                new_period['display_name'] = (p !== periods_of_performance - 1) ? year + period_display_suffix : 'current'
                new_period['sort_name'] = year + period_sort_suffix

                // determine period's transactions
                let target_year = year
                let period_transactions = sorted_transactions.filter( t => this.getYear(t.date) === target_year && this.getPeriod(t.date) === period )
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
                let end_tickervalue = 0, end_tickerdate
                let this_quote_month
                if (this.state.period_type === 'month') {
                    this_quote_month = period
                } else if (this.state.period_type === 'quarter') {
                    this_quote_month = period * 3
                } else if (this.state.period_type === 'year') {
                    this_quote_month = 12
                }
                let this_quote_year = target_year
                if (target_year === today_year && period === today_period) { // for a partial last period, use a previous month's quotes
                    let quote_dates = []
                    Object.entries(end_shares).forEach(function(position) {
                        if (position[1] && self.props.all_monthly_quotes.hasOwnProperty(position[0])) {
                            quote_dates.push(self.props.all_monthly_quotes[position[0]].monthly_dates_desc[0])
                        }
                    })
                    let lastavailablequote_month_str, lastavailablequote_year_str
                    [lastavailablequote_year_str, lastavailablequote_month_str] = quote_dates.sort().reverse()[0].split('-')
                    let lastavailablequote_month = parseInt(lastavailablequote_month_str)
                    let lastavailablequote_year = parseInt(lastavailablequote_year_str)
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
                Object.entries(end_shares).forEach(function(position) {
                    let error_message = ''
                    let month_end_quote = self.getMonthEndQuote(position[0], this_quote_year, this_quote_month)
                    if (month_end_quote === null) {
                        error_message = 'ERROR: quote for symbol '+position[0]+' for month '+this_quote_year+'-'+this_quote_month+' is unavailable'
                        end_tickervalue = 'err.'
                        end_tickerdate = null
                    } else {
                        end_tickervalue += position[1] * month_end_quote.price
                        if (typeof(end_tickerdate) !== 'string') {
                            end_tickerdate = month_end_quote.date
                        } else if (month_end_quote.date !== end_tickerdate) {
                            error_message = 'ERROR: quote dates for month '+this_quote_year+'-'+this_quote_month+' do not match for all symbols ('+end_tickerdate+' & '+month_end_quote.date+')'
                        }
                    }
                    self.setState({ error_message: error_message })
                    if (error_message.length) {
                        console.log(error_message)
                    }
                })
                new_period['end_tickervalue'] = end_tickervalue
                new_period['end_tickerdate'] = end_tickerdate
                
                // determine period-end total value
                let end_totalvalue
                if (typeof(end_tickervalue) !== 'number' || typeof(end_cash) !== 'number') {
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
                if (end_baselinequote === null) {
                    let error_message = 'ERROR: quote for symbol S&P500 for month '+this_quote_year+'-'+this_quote_month+' is unavailable'
                    this.setState({ error_message: error_message })
                    console.log(error_message)
                    end_baselineprice = 'err.'
                    end_baselinedate = null
                } else {
                    end_baselineprice = end_baselinequote.price
                    end_baselinedate = end_baselinequote.price
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
                if (this.state.period_type === 'month') {
                    zb_start_month = period - 1
                    zb_end_month = (zb_start_month !== 11) ? zb_start_month + 1 : 1
                    end_year = (zb_start_month !== 11) ? target_year : target_year + 1
                } else if (this.state.period_type === 'quarter') {
                    zb_start_month = period * 3 - 3
                    zb_end_month = (period !== 4) ? zb_start_month + 3 : 1
                    end_year = (period !== 4) ? target_year : target_year + 1
                } else if (this.state.period_type === 'year') {
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
                if (typeof(start_totalvalue) !== 'number' || typeof(end_totalvalue) !== 'number') {
                    performance = 'err.'
                } else if (start_tickervalue === 0 && end_tickervalue === 0) {
                    performance = 0
                } else {
                    performance = (end_totalvalue / (start_totalvalue + adjusted_transfer_value)) - 1
                }
                new_period['period_change_pct'] = performance

                // determine period-over-period baseline performance
                performance = 'n/a'
                if (typeof(start_baselineprice) !== 'number' || typeof(end_baselineprice) !== 'number') {
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

        this.setState({ period_data: period_data })
    }

    getYear(date) {
        return parseInt(date.split('-')[0])
    }

    getPeriod(date) {
        let zb_month = parseInt(date.split('-')[1])-1

        if (this.state.period_type === 'month') {
            return zb_month + 1
        } else if (this.state.period_type === 'quarter') {
            return Math.floor(zb_month / 3) + 1
        } else if (this.state.period_type === 'year') {
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
        if (typeof(dollars) === 'number') {
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
        } else if (typeof(my_perf) === 'number') {
            if (this.props.baseline === 'sp500_pct_gain') {
                let baseline_perf = period_data.period_baseline_change_pct
                if (typeof(baseline_perf) !== 'number') {
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
        let monthly_dates = this.props.all_monthly_quotes[ticker].monthly_dates_desc
        let monthly_prices = this.props.all_monthly_quotes[ticker].monthly_prices
        let period_idx = monthly_dates.findIndex( date => this.getYear(date) === year && this.getMonth(date) === month )
        let retval = {}
        if (period_idx !== -1) {
            retval['date'] = monthly_dates[period_idx]
            retval['price'] = monthly_prices[period_idx]
        } else {
            retval = null
        }
        return retval
    }

    styleCell(performance_obj) {
        let displayed, baseline, index
        [displayed, baseline, index] = [performance_obj.display_value, performance_obj.baseline_value, performance_obj.index_value]
        let classes = 'performance-cell'
        if ( this.props.baseline === 'sp500_pct_gain') {
            if (displayed > 0) {
                classes += ' text-green'
            } else if (displayed < 0) {
                classes += ' text-red'
            }
        } else {
            if ( displayed < baseline || displayed < 0 ) {
                classes += ' text-red'
            } else if (displayed > index) {
                classes += ' text-green'
            }
        }
        return classes
    }

    formatPerformance(performance) {
        if (performance === 'err.' || performance === 'ref.') {
            return performance
        } else if (typeof(performance) !== 'number') {
            return '-'
        } else {
            return (Math.round(performance * 100 * 10) / 10).toFixed(1) + '%'
        }
    }

    formatIndexPerformance(performance) {
        if ( this.props.baseline === 'sp500_pct_gain') {
            return this.formatPerformance('ref.')
        } else {
            return this.formatPerformance(performance)
        }
    }

    formatWholePercentage(percentage) {
        if (percentage === 'err.') {
            return 'err.'
        } else if (typeof(percentage) !== 'number' || isNaN(percentage)) {
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
            return { 
                data_sort_dir: new_sort_dir 
            }
        })
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
                        <p className="strong"><button onClick={ (e)=>this.onToggleSortOrder(sorted_data.length) }>&#x21c6;</button></p>
                        <p className="strong">stocks:</p>
                        <p className="strong">cash:</p>
                        <p className="strong">transfers in:</p>
                        <p className="strong">total:</p>
                        <p className="strong">my perf{ (this.props.baseline === 'sp500_pct_gain') ? ' delta' : '' }:</p>
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
                    <div id="error-message">
                        {this.state.error_message}
                    </div>
                </div>

            </div>
        )
    }
}

MyPerformance.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    all_positions: PropTypes.object.isRequired,
    all_monthly_quotes: PropTypes.object.isRequired,
    baseline: PropTypes.string.isRequired,
}