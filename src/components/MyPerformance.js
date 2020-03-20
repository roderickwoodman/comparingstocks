import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            quarter_data: []
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
            let last_year = today.getFullYear()
            let last_quarter = Math.round(today.getMonth() / 3)

            let quarters_of_performance = (last_year - first_year) * 4 + (last_quarter - first_quarter) + 1
            let start_baselinequote, start_baselineprice
            if (first_quarter !== 1) {
                start_baselinequote = this.getMonthEndQuote('S&P500', first_year, (first_quarter - 1) * 3)
            } else {
                start_baselinequote = this.getMonthEndQuote('S&P500', first_year - 1, 9)
            }
            start_baselineprice = (start_baselinequote !== null) ? start_baselinequote.price : null

            // calculate all quarter data
            let year = first_year
            let start_shares = {}, start_cash = 0, start_totalvalue = 0
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
                Object.entries(end_shares).forEach(function(position) {
                    let month_end_quote = self.getMonthEndQuote(position[0], target_year, quarter * 3)
                    if (month_end_quote === null) {
                        console.log('ERROR: quote for symbol '+position[0]+' for month '+target_year+'-'+(quarter*3)+' is unavailable')
                        end_tickervalue = '?'
                        end_tickerdate = null
                    } else {
                        end_tickervalue += position[1] * month_end_quote.price
                        if (typeof(end_tickerdate) !== 'string') {
                            end_tickerdate = month_end_quote.date
                        } else if (month_end_quote.date !== end_tickerdate) {
                            console.log('ERROR: quote dates for month '+target_year+'-'+(quarter*3)+' do not match for all symbols ('+end_tickerdate+' & '+month_end_quote.date+')')
                        }
                    }
                })
                new_quarter['end_tickervalue'] = end_tickervalue
                new_quarter['end_tickerdate'] = end_tickerdate
                
                // determine quarter-end total value
                let end_totalvalue = end_tickervalue + end_cash
                new_quarter['end_totalvalue'] = end_totalvalue

                // determine quarter-end baseline value
                let end_baselinequote = self.getMonthEndQuote('S&P500', target_year, quarter * 3)
                let end_baselineprice = (end_baselinequote !== null) ? end_baselinequote.price : null
                new_quarter['end_baselineprice'] = end_baselineprice
                new_quarter['end_baselinedate'] = (end_baselinequote !== null) ? end_baselinequote.date : null

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
                    performance = 'n/a'
                } else if (q === 0) {
                    performance = (end_totalvalue / (start_totalvalue + adjusted_transfer_value)) - 1
                } else {
                    performance = (end_totalvalue / (quarter_data[q-1].end_totalvalue + adjusted_transfer_value)) - 1
                }
                new_quarter['qoq_change_pct'] = performance

                // determine quarter-over-quarter baseline performance
                performance = 'n/a'
                if (start_baselineprice === null || end_baselineprice === null) {
                    performance = 'n/a'
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
            retval = '?'
        }
        return retval
    }

    getDisplayedPerformance(quarter_data) {
        let retval = {}
        retval['key'] = quarter_data.year + 'Q' + quarter_data.quarter
        retval['display_value'] = null
        retval['baseline_value'] = null
        retval['index_value'] = quarter_data.qoq_baseline_change_pct
        let my_perf = quarter_data.qoq_change_pct
        if (typeof(my_perf) === 'number') {
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
        if (typeof(performance) !== 'number') {
            return '-'
        } else {
            return (Math.round(performance * 100 * 10) / 10).toFixed(1) + '%'
        }
    }

    render() {
        let displayed_performance = this.state.quarter_data.map( qdata => this.getDisplayedPerformance(qdata) )
        return (
            <div id="my-performance-wrapper">
                <div id="my-performance-rowlabels">
                    <table>
                        <thead></thead>
                        <tbody>
                            <tr><th>&nbsp;</th></tr>
                            <tr><th>stocks:</th></tr>
                            <tr><th>cash:</th></tr>
                            <tr><th>transfers in:</th></tr>
                            <tr><th>total:</th></tr>
                            <tr><th>Q-o-Q perf:</th></tr>
                            <tr><th>S&amp;P500 perf:</th></tr>
                        </tbody>
                    </table>
                </div>
                <div id="my-performance">
                    <table>
                        <thead>
                            <tr>
                            { this.state.quarter_data.map( qdata => ( // name
                                <th key={'name-'+qdata.year+qdata.quarter}>{qdata.name}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            { this.state.quarter_data.map( qdata => ( // ticker value
                                <td key={'tickervalue-'+qdata.year+qdata.quarter}>{this.formatCurrency(qdata.end_tickervalue)}</td>
                            ))}
                            </tr>
                            <tr>
                            { this.state.quarter_data.map( qdata => ( // cash value
                                <td key={'cashvalue-'+qdata.year+qdata.quarter}>{this.formatCurrency(qdata.end_cash)}</td>
                            ))}
                            </tr>
                            <tr>
                            { this.state.quarter_data.map( qdata => ( // transfers in
                                <td key={'transfersin-'+qdata.year+qdata.quarter}>{this.formatCurrency(qdata.end_transfersinvalue)}</td>
                            ))}
                            </tr>
                            <tr>
                            { this.state.quarter_data.map( qdata => ( // total value
                                <th key={'totalvalue-'+qdata.year+qdata.quarter}>{this.formatCurrency(qdata.end_totalvalue)}</th>
                            ))}
                            </tr>
                            <tr>
                            { displayed_performance.map( performance => ( // my performance
                                <td key={performance.key} className={ this.styleCell(performance) }>{ this.formatPerformance(performance.display_value) }</td>
                            ))}
                            </tr>
                            <tr>
                            { displayed_performance.map( performance => ( // index performance
                                <td key={performance.key}>{ this.formatPerformance(performance.index_value) }</td>
                            ))}
                            </tr>
                        </tbody>
                    </table>
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