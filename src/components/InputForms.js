import React from 'react'
import PropTypes from 'prop-types'
import { AddTicker } from './AddTicker'
import { AddTag } from './AddTag'
import { AddTransaction } from './AddTransaction'
import { AddCash } from './AddCash'
import { DeleteTag } from './DeleteTag'
import { StatusMessages } from './StatusMessages'
import { WhatIf } from './WhatIf'


export class InputForms extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            which_inputs: "tickers" // tickers | tags | transactions | logs | what-ifs
        }
        this.onWhichInputs = this.onWhichInputs.bind(this)
    }

    componentDidMount() {
        const stored_which_inputs = JSON.parse(localStorage.getItem("which_inputs"))
        if (stored_which_inputs !== null) {
            this.setState({ which_inputs: stored_which_inputs })
        }
    }

    onWhichInputs(new_which_inputs) {
        localStorage.setItem('which_inputs', JSON.stringify(new_which_inputs))
        this.setState({ which_inputs: new_which_inputs })
    }

    render() {
        return (
            <div id="input-forms">
                <section id="input-form-selectors">
                    <span className={"input-form-selector" + (this.state.which_inputs==="tickers" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('tickers')}>Tickers</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="tags" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('tags')}>Tags</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="transactions" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('transactions')}>Transactions</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="what-ifs" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('what-ifs')}>What If?</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="logs" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('logs')}>Logs</span>
                </section>
                <section id="input-form-forms">
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
                    {this.state.which_inputs === 'what-ifs' && (
                        <React.Fragment>
                        <WhatIf
                            all_current_quotes={this.props.all_current_quotes}
                            all_positions={this.props.all_positions}
                            all_tags={this.props.all_tags}
                            get_balanceable_value={this.props.get_balanceable_value}
                            show_holdings={this.props.show_holdings}
                            show_tagged={this.props.show_tagged}
                            show_untagged={this.props.show_untagged}
                            show_cash={this.props.show_cash}
                            on_whatif_submit={this.props.on_whatif_submit}
                        />
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'logs' && (
                        <React.Fragment>
                        <StatusMessages
                            all_status_messages={this.props.all_status_messages}
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
    all_current_quotes: PropTypes.object,
    all_positions: PropTypes.object,
    show_tagged: PropTypes.bool,
    show_untagged: PropTypes.bool,
    show_cash: PropTypes.bool,
    get_balanceable_value: PropTypes.func,
    on_new_tickers: PropTypes.func.isRequired,
    on_new_cash: PropTypes.func.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    on_delete_tag: PropTypes.func.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    all_status_messages: PropTypes.array.isRequired,
    on_new_messages: PropTypes.func.isRequired,
    on_whatif_submit: PropTypes.func
}