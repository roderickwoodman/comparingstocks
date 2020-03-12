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
        
        let first_year = parseInt(sorted_transactions[0].date.split('-')[0])
        let first_quarter = Math.floor((parseInt(sorted_transactions[0].date.split('-')[1])-1) / 3 + 1)
        let last_year = parseInt(sorted_transactions[sorted_transactions.length-1].date.split('-')[0])
        let last_quarter = Math.floor((parseInt(sorted_transactions[sorted_transactions.length-1].date.split('-')[1])-1) / 3 + 1)
        let quarters_of_performance = (last_year - first_year) * 4 + (last_quarter - first_quarter) + 1

        let quarter_data = []
        for (let q = 0; q < quarters_of_performance; q++) {
            let new_quarter = {}
            let year = first_year + Math.floor((q + 3 - first_quarter) / 4)
            new_quarter['year'] = year
            let quarter = (q + first_quarter - 1) % 4 + 1
            new_quarter['quarter'] = quarter

            let end_shares = {}, end_cash = 0
            if (q !== 0) {
                end_shares = Object.assign({}, quarter_data[q-1].quarter_end_shares)
                end_cash = quarter_data[q-1].quarter_end_cash
            }

            let quarter_transactions = sorted_transactions.filter(function(transaction) {
                let transaction_year = parseInt(transaction.date.split('-')[0])
                let transaction_quarter = Math.floor((parseInt(transaction.date.split('-')[1])-1) / 3 + 1)
                if (transaction_year === year && transaction_quarter === quarter) {
                    return 1
                } else {
                    return 0
                }
            })
            new_quarter['transactions'] = quarter_transactions

            for (let transaction of quarter_transactions) {
                let action, ticker, shares, total
                [action, ticker, shares, total] = [transaction.action, transaction.ticker, transaction.shares, transaction.total]

                // cash transactions
                if (ticker === 'cash') {
                    let cash_delta = (action === 'add') ? total : -1 * total
                    end_cash += cash_delta
                // non-cash transactions
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
            new_quarter['quarter_end_shares'] = end_shares
            new_quarter['quarter_end_cash'] = end_cash

            quarter_data.push(new_quarter)
        }

        this.setState({ quarter_data: quarter_data })
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
        }
        return retval
    }

    render() {
        return (
            <div id="my-performance-wrapper">
                <table id="my-performance">
                    <thead>
                        <tr>
                        { this.state.quarter_data.map( quarter => (
                            <th>{quarter.year}Q{quarter.quarter}</th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        { this.state.quarter_data.map( quarter => (
                            <td>{this.formatCurrency(quarter.quarter_end_cash)}</td>
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