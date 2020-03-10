import React from 'react'
import PropTypes from 'prop-types'


export class MyPerformance extends React.Component {

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