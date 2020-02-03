import React from 'react'
import PropTypes from 'prop-types'
import { AddTicker } from './AddTicker'
import { AddTag } from './AddTag'
import { AddTransaction } from './AddTransaction'
import { AddCash } from './AddCash'
import { DeleteTag } from './DeleteTag'


export class InputForms extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            which_inputs: "tickers" // tickers | tags | transactions
        }
        this.onWhichInputs = this.onWhichInputs.bind(this)
    }

    onWhichInputs(new_which_inputs) {
        this.setState({ which_inputs: new_which_inputs })
    }

    render() {
        return (
            <div id="input-forms">
                <ul id="which-input-forms">
                    <li onClick={ (e)=>this.onWhichInputs('tickers')}>tickers</li>
                    <li onClick={ (e)=>this.onWhichInputs('tags')}>tags</li>
                    <li onClick={ (e)=>this.onWhichInputs('transactions')}>transactions</li>
                </ul>
                <section>
                    {this.state.which_inputs === 'tickers' && (
                        <React.Fragment>
                        <AddTicker
                            all_stocks={this.props.all_stocks}
                            all_tags={this.props.all_tags}
                            on_new_tickers={this.props.on_new_tickers}
                            on_new_messages={this.props.on_new_messages}
                        />
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'tags' && (
                        <React.Fragment>
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
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'transactions' && (
                    <React.Fragment>
                        <AddTransaction
                            all_stocks={this.props.all_stocks}
                            all_tags={this.props.all_tags}
                            on_new_transaction={this.props.on_new_transaction}
                            on_new_messages={this.props.on_new_messages}
                        />
                        <AddCash
                            on_new_cash={this.props.on_new_cash}
                            on_new_messages={this.props.on_new_messages}
                        />
                    </React.Fragment>
                    )}
                </section>
            </div>
        )
    }
}

InputForms.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    on_new_tickers: PropTypes.func.isRequired,
    on_new_cash: PropTypes.func.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    on_delete_tag: PropTypes.func.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired,
}