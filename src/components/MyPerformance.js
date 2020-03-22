import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            quarter_data: [],
            data_sort_dir: 'asc',
            error_message: ''
        }
        this.generateQuarterData = this.generateQuarterData.bind(this)
        this.numberWithCommas = this.numberWithCommas.bind(this)
        this.formatCurrency = this.formatCurrency.bind(this)
        this.getDisplayedPerformance = this.getDisplayedPerformance.bind(this)
        this.getMonthEndQuote = this.getMonthEndQuote.bind(this)
        this.getYear = this.getYear.bind(this)
        this.getQuarter = this.getQuarter.bind(this)
        this.getMonth = this.getMonth.bind(this)
        this.styleCell = this.styleCell.bind(this)
        this.formatPerformance = this.formatPerformance.bind(this)
        this.formatWholePercentage = this.formatWholePercentage.bind(this)
        this.onToggleSortOrder = this.onToggleSortOrder.bind(this)
    }

    componentDidMount() {
        this.generateQuarterData()
    }

    generateQuarterData() {

        let sorted_transactions = this.props.all_transactions.sort(function(a, b) {
            if (a.date < b.date) {
                return -1
            } else if (a.date > b.date) {
                return 1
            } else {
                return 0
            }
        })
        
        let quarter_data = []

        if (sorted_transactions.length) {

            let first_year = parseInt(sorted_transactions[0].date.split('-')[0])
            let first_quarter = Math.floor((parseInt(sorted_transactions[0].date.split('-')[1])-1) / 3 + 1)

            let today = new Date()
            let today_year = today.getFullYear()
            let today_month = today.getMonth() + 1
            let today_quarter = Math.round(today.getMonth() / 3)

            let quarters_of_performance = (today_year - first_year) * 4 + (today_quarter - first_quarter) + 1
            let start_baselinequote, start_baselineprice
            let prev_quote_month, prev_quote_year
            if (first_quarter !== 1) {
                prev_quote_year = first_year
                prev_quote_month = (first_quarter - 1) * 3
            } else {
                prev_quote_year = first_year - 1
                prev_quote_month = 9
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

            // calculate all quarter data
            let year = first_year
            let start_shares = {}, start_cash = 0, start_tickervalue = 0, start_totalvalue = 0
            for (let q = 0; q < quarters_of_performance; q++) {
                
                // initialization
                let new_quarter = {}
                let quarter = (q + first_quarter - 1) % 4 + 1
                new_quarter['quarter'] = quarter
                if (quarter === 1 && q !== 0) {
                    year += 1
                }
                new_quarter['year'] = year
                let end_shares = {}, end_cash = 0, end_transfersinvalue = 0
                if (q !== 0) {
                    start_tickervalue = quarter_data[q-1].end_tickervalue
                    start_totalvalue = quarter_data[q-1].end_totalvalue
                    end_shares = Object.assign({}, quarter_data[q-1].end_shares)
                    end_cash = quarter_data[q-1].end_cash
                } else {
                    end_shares = Object.assign({}, start_shares)
                    end_cash = start_cash
                }
                new_quarter['name'] = (q !== quarters_of_performance - 1) ? year + 'Q' + quarter : 'current'

                // determine quarter's transactions
                let target_year = year
                let quarter_transactions = sorted_transactions.filter( t => this.getYear(t.date) === target_year && this.getQuarter(t.date) === quarter )
                new_quarter['transactions_of_stock'] = quarter_transactions.filter( t => t.ticker !== 'cash' )
                new_quarter['transactions_of_cash'] = quarter_transactions.filter( t => t.ticker === 'cash' )

                // determine quarter-end shares and cash value
                for (let transaction of quarter_transactions) {
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
                new_quarter['end_shares'] = end_shares
                new_quarter['end_cash'] = end_cash
                new_quarter['end_transfersinvalue'] = end_transfersinvalue

                // determine quarter-end ticker value
                let self = this
                let end_tickervalue = 0, end_tickerdate
                let this_quote_month = quarter * 3
                let this_quote_year = target_year
                if (target_year === today_year && quarter === today_quarter) { // for a partial last period, use a previous month's quotes
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
                new_quarter['end_tickervalue'] = end_tickervalue
                new_quarter['end_tickerdate'] = end_tickerdate
                
                // determine quarter-end total value
                let end_totalvalue
                if (typeof(end_tickervalue) !== 'number' || typeof(end_cash) !== 'number') {
                    end_totalvalue = 'err.'
                } else {
                    end_totalvalue = end_tickervalue + end_cash
                }
                new_quarter['end_totalvalue'] = end_totalvalue
                new_quarter['end_tickervaluefraction'] = end_tickervalue / end_totalvalue
                new_quarter['end_cashfraction'] = end_cash / end_totalvalue

                // determine quarter-end baseline value
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
                new_quarter['end_baselineprice'] = end_baselineprice
                new_quarter['end_baselinedate'] = end_baselinedate

                // determine quarter-over-quarter performance
                // HPR (holding period return) = end / prev_end - 1
                // HPR (HPR, adjusted for transfers) = end / (prev_end + transfersIN) - 1
                // transfersIN, adjusted for middle-of-period transfers... aka Modified Dietz method)
                //   transfersIN = transferINa * fraction of period duration) + (transferINb * fraction of period duration)
                let adjusted_transfer_value = 0
                let zb_start_month = quarter * 3 - 3
                let period_start_date = new Date(target_year, zb_start_month, 1)
                let period_end_date
                if (zb_start_month !== 3) {
                    period_end_date = new Date(target_year, zb_start_month+3, 1)
                } else {
                    period_end_date = new Date(target_year+1, 1, 1)
                }
                let period_days = Math.round((period_end_date - period_start_date) / (1000 * 60 * 60 * 24))
                new_quarter.transactions_of_cash.forEach(function(transaction) {
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
                new_quarter['qoq_change_pct'] = performance

                // determine quarter-over-quarter baseline performance
                performance = 'n/a'
                if (typeof(start_baselineprice) !== 'number' || typeof(end_baselineprice) !== 'number') {
                    performance = 'err.'
                } else if (q === 0) {
                    performance = (end_baselineprice / start_baselineprice) - 1
                } else {
                    performance = (end_baselineprice / quarter_data[q-1].end_baselineprice) - 1
                }
                new_quarter['qoq_baseline_change_pct'] = performance

                // store the data object
                quarter_data.push(new_quarter)
            }
        }

        this.setState({ quarter_data: quarter_data })
    }

    getYear(date) {
        return parseInt(date.split('-')[0])
    }

    getQuarter(date) {
        return Math.floor((parseInt(date.split('-')[1])-1) / 3 + 1)
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

    getDisplayedPerformance(quarter_data) {
        let retval = {}
        retval['key'] = quarter_data.year + 'Q' + quarter_data.quarter
        retval['display_value'] = 'err.'
        retval['baseline_value'] = 'err.'
        retval['index_value'] = quarter_data.qoq_baseline_change_pct
        let my_perf = quarter_data.qoq_change_pct
        if (my_perf === 'err.') {
            retval['display_value'] = 'err.'
        } else if (typeof(my_perf) === 'number') {
            if (this.props.baseline === 'sp500_pct_gain') {
                let baseline_perf = quarter_data.qoq_baseline_change_pct
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
        let quarter_idx = monthly_dates.findIndex( date => this.getYear(date) === year && this.getMonth(date) === month )
        let retval = {}
        if (quarter_idx !== -1) {
            retval['date'] = monthly_dates[quarter_idx]
            retval['price'] = monthly_prices[quarter_idx]
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
        if (performance === 'err.') {
            return 'err.'
        } else if (typeof(performance) !== 'number') {
            return '-'
        } else {
            return (Math.round(performance * 100 * 10) / 10).toFixed(1) + '%'
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

    onToggleSortOrder() {
        document.getElementById('my-performance-periods').scrollLeft = 0
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
        this.state.quarter_data.forEach(function(qdata) {
            displayed_performance[qdata.name] = self.getDisplayedPerformance(qdata)
        })
        let sorted_data = this.state.quarter_data.sort( function(a,b) {
            if (a.name < b.name) {
                return (self.state.data_sort_dir === 'asc') ? -1 : 1
            } else if (a.name > b.name) {
                return (self.state.data_sort_dir === 'asc') ? 1 : -1
            } else {
                return 0
            }
        })
        return (
            <div id="my-performance-wrapper">
                <div id="my-performance-body">
                    <div id="my-performance-rowlabels">
                        <p className="strong"><button onClick={ (e)=>this.onToggleSortOrder() }>&#x21c6;</button></p>
                        <p className="strong">stocks:</p>
                        <p className="strong">cash:</p>
                        <p className="strong">transfers in:</p>
                        <p className="strong">total:</p>
                        <p className="strong">Q-o-Q perf:</p>
                        <p className="strong">S&amp;P500 perf:</p>
                    </div>
                    <div id="my-performance-periods">
                        { sorted_data.map( qdata => (
                        <div className="period-data" key={qdata.name}>
                            <p className="strong">{qdata.name}</p>
                            <p>{this.formatCurrency(qdata.end_tickervalue)} ({this.formatWholePercentage(qdata.end_tickervaluefraction)})</p>
                            <p>{this.formatCurrency(qdata.end_cash)} ({this.formatWholePercentage(qdata.end_cashfraction)})</p>
                            <p>{this.formatCurrency(qdata.end_transfersinvalue)}</p>
                            <p className="strong">{this.formatCurrency(qdata.end_totalvalue)}</p>
                            <p className={ this.styleCell(displayed_performance[qdata.name]) }>{ this.formatPerformance(displayed_performance[qdata.name].display_value) }</p>
                            <p>{ this.formatPerformance(displayed_performance[qdata.name].index_value) }</p>
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