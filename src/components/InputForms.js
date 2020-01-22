import React from 'react'
import PropTypes from 'prop-types'
import { AddTransaction } from './AddTransaction'
import { AddTicker } from './AddTicker'
import { AddTag } from './AddTag'
import { DeleteTag } from './DeleteTag'


export class InputForms extends React.Component {

    render() {
        return (
            <section>
                <AddTicker
                    all_stocks={this.props.all_stocks}
                    all_tags={this.props.all_tags}
                    on_new_tickers={this.props.on_new_tickers}
                    on_new_messages={this.props.on_new_messages}
                />
                <AddTag
                    all_tags={this.props.all_tags}
                    on_new_tags={this.props.on_new_tags}
                    on_new_messages={this.props.on_new_messages}
                />
                <DeleteTag
                    all_tags={this.props.all_tags}
                    on_delete_tag={this.props.on_delete_tag}
                    on_new_messages={this.props.on_new_messages}
                />
                <AddTransaction
                    all_stocks={this.props.all_stocks}
                    on_new_transaction={this.props.on_new_transaction}
                    on_new_messages={this.props.on_new_messages}
                />
            </section>
        )
    }
}

InputForms.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    on_new_tickers: PropTypes.func.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    on_delete_tag: PropTypes.func.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired,
}