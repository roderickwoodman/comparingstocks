import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            quarter_data: []
        }
        this.numberWithCommas = this.numberWithCommas.bind(this)
        this.formatCurrency = this.formatCurrency.bind(this)
        this.getMonthEndQuote = this.getMonthEndQuote.bind(this)
        this.getYear = this.getYear.bind(this)
        this.getQuarter = this.getQuarter.bind(this)
        this.getMonth = this.getMonth.bind(this)
    }

    componentDidMount() {

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
                let end_shares = {}, end_cash = 0
                if (q !== 0) {
                    end_shares = Object.assign({}, quarter_data[q-1].end_shares)
                    end_cash = quarter_data[q-1].end_cash
                }

                // determine quarter's transactions
                let target_year = year
                let quarter_transactions = sorted_transactions.filter( t => this.getYear(t.date) === target_year && this.getQuarter(t.date) === quarter )
                new_quarter['transactions'] = quarter_transactions

                // determine quarter-end shares and cash value
                for (let transaction of quarter_transactions) {
                    let action, ticker, shares, total
                    [action, ticker, shares, total] = [transaction.action, transaction.ticker, transaction.shares, transaction.total]
                    if (ticker === 'cash') {
                        let cash_delta = (action === 'add') ? total : -1 * total
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

                // determine quarter-end ticker value
                let self = this
                let end_tickervalue = 0
                Object.entries(end_shares).forEach(function(position) {
                    end_tickervalue += position[1] * self.getMonthEndQuote(position[0], target_year, quarter * 3)
                })
                new_quarter['end_tickervalue'] = end_tickervalue

                // determine quarter-end total value
                new_quarter['end_totalvalue'] = end_tickervalue + end_cash

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

    getMonthEndQuote(ticker, year, month) {
        let monthly_dates = this.props.all_monthly_quotes[ticker].monthly_dates
        let monthly_prices = this.props.all_monthly_quotes[ticker].monthly_prices
        let quarter_idx = monthly_dates.findIndex( date => this.getYear(date) === year && this.getMonth(date) === month )
        return monthly_prices[quarter_idx]
    }

    render() {
        return (
            <div id="my-performance-wrapper">
                <table id="my-performance">
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
                        { this.state.quarter_data.map( qdata => ( // total value
                            <th key={'totalvalue-'+qdata.year+qdata.quarter}>{this.formatCurrency(qdata.end_totalvalue)}</th>
                        ))}
                        </tr>
                    </tbody>
                </table>

            </div>
        )
    }
}

MyPerformance.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    all_positions: PropTypes.object.isRequired,
    all_monthly_quotes: PropTypes.object.isRequired,
}