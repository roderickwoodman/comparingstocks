import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            quarter_data: []
        }
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
        for (let delta_q = 0; delta_q < quarters_of_performance; delta_q++) {
            let new_quarter = {}
            new_quarter['year'] = first_year + Math.floor((delta_q + 3 - first_quarter) / 4)
            new_quarter['quarter'] = (delta_q + first_quarter - 1) % 4 + 1
            new_quarter['transactions'] = []
            quarter_data.push(new_quarter)
        }

        for (let transaction of sorted_transactions) {
            let this_year = parseInt(transaction.date.split('-')[0])
            let this_quarter = Math.floor((parseInt(transaction.date.split('-')[1])-1) / 3 + 1)
            for (let [idx,d] of quarter_data.entries()) {
                // console.log(idx, d)
                if (d.year === this_year && d.quarter === this_quarter) {
                    quarter_data[idx].transactions.push(transaction)
                }
            }
            // console.log(transaction)
            // console.log(this_year, this_quarter)
        }

        this.setState({ quarter_data: quarter_data })
    }

    render() {
        return (
            <div id="my-performance-wrapper">
                FIXME: 
                { Object.entries(this.props.all_positions).map( position =>
                    <span>{position[1].symbol.toLowerCase()}</span>

                )}
            </div>
        )
    }
}

MyPerformance.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    all_positions: PropTypes.object.isRequired,
    all_monthly_quotes: PropTypes.object.isRequired,
}