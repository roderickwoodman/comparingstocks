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
            let last_year = parseInt(sorted_transactions[sorted_transactions.length-1].date.split('-')[0])
            let last_quarter = Math.floor((parseInt(sorted_transactions[sorted_transactions.length-1].date.split('-')[1])-1) / 3 + 1)
            let quarters_of_performance = (last_year - first_year) * 4 + (last_quarter - first_quarter) + 1

            // calculate all quarter data
            let year = first_year
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
                }

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
                let end_tickervalue = 0
                Object.entries(end_shares).forEach(function(position) {
                    end_tickervalue += position[1] * self.getMonthEndQuote(position[0], target_year, quarter * 3)
                })
                new_quarter['end_tickervalue'] = end_tickervalue
                
                // determine quarter-end total value
                let end_totalvalue = end_tickervalue + end_cash
                new_quarter['end_totalvalue'] = end_totalvalue

                // determine quarter-end baseline value
                let end_baselinevalue = self.getMonthEndQuote('S&P500', target_year, quarter * 3)
                new_quarter['end_baselinevalue'] = end_baselinevalue

                // determine quarter-over-quarter performance
                // HPR (holding period return) = end / prev_end - 1
                // HPR (HPR, adjusted for transfers) = end / (prev_end + transfersIN) - 1
                // transfersIN, adjusted for middle-of-period transfers... aka Modified Dietz method)
                //   transfersIN = transferINa * fraction of period duration) + (transferINb * fraction of period duration)
                let adjusted_transfer_value = 0
                let zb_start_month = quarter * 3 - 3
                let period_start_date = new Date(target_year, zb_start_month, 1)
                let period_end_date = new Date(target_year, zb_start_month+3, 1)
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
                let performance = 'n/a'
                if (q !== 0 && !isNaN(end_totalvalue)) {
                    performance = (end_totalvalue / (quarter_data[q-1].end_totalvalue + adjusted_transfer_value)) - 1
                }
                new_quarter['qoq_change_pct'] = performance

                // determine quarter-over-quarter baseline performance
                performance = 'n/a'
                if (q !== 0 && !isNaN(end_baselinevalue)) {
                    performance = (end_baselinevalue / quarter_data[q-1].end_baselinevalue) - 1
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
        if (!isNaN(dollars)) {
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
        if (!isNaN(my_perf)) {
            if (this.props.baseline === 'sp500_pct_gain') {
                let baseline_perf = quarter_data.qoq_baseline_change_pct
                if (isNaN(baseline_perf)) {
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
        let monthly_dates = this.props.all_monthly_quotes[ticker].monthly_dates
        let monthly_prices = this.props.all_monthly_quotes[ticker].monthly_prices
        let quarter_idx = monthly_dates.findIndex( date => this.getYear(date) === year && this.getMonth(date) === month )
        return monthly_prices[quarter_idx]
    }

    styleCell(performance_obj) {
        let displayed, baseline, index
        [displayed, baseline, index] = [performance_obj.display_value, performance_obj.baseline_value, performance_obj.index_value]
        let classes = 'performance-cell'
        if ( displayed < baseline || displayed < 0 ) {
            classes += ' text-red'
        } else if (displayed > index) {
            classes += ' text-green'
        }
        return classes
    }

    formatPerformance(performance) {
        if (isNaN(performance)) {
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
                                <th key={'name-'+qdata.year+qdata.quarter}>{qdata.year}Q{qdata.quarter}</th>
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