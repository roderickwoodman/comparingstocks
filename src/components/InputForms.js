import React from 'react'
import PropTypes from 'prop-types'
import { TickerAdd } from './TickerAdd'
import { TagAdd } from './TagAdd'
import { TransactionAdd } from './TransactionAdd'
import { TransactionsList } from './TransactionsList'
import { TagDelete } from './TagDelete'
import { MyPerformance } from './MyPerformance'
import { Console } from './Console'
import { WhatIf } from './WhatIf'


export class InputForms extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            which_inputs: "tickers" // tickers | tags | transactions | my-performance | what-ifs | console
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
        if (this.state.which_inputs !== new_which_inputs) {
            this.props.clear_last_console_message()
        }
        this.setState({ which_inputs: new_which_inputs })
    }

    render() {
        return (
            <div id="input-forms">
                <section id="input-form-selectors">
                    <span className={"input-form-selector" + (this.state.which_inputs==="tickers" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('tickers')}>Tickers</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="tags" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('tags')}>Tags</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="transactions" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('transactions')}>Transactions</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="my-performance" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('my-performance')}>Performance</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="what-ifs" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('what-ifs')}>What If?</span>
                    <span className={"input-form-selector" + (this.state.which_inputs==="console" ? " selected" : "") } onClick={ (e)=>this.onWhichInputs('console')}>Messages</span>
                </section>
                <section id="input-form-forms">
                    {this.state.which_inputs === 'tickers' && (
                        <React.Fragment>
                        <TickerAdd
                            all_stocks={this.props.all_stocks}
                            all_tags={this.props.all_tags}
                            on_new_tickers={this.props.on_new_tickers}
                            create_console_message_set={this.props.create_console_message_set}
                            on_new_console_messages={this.props.on_new_console_messages}
                        />
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'tags' && (
                        <React.Fragment>
                        <TagAdd
                            all_tags={this.props.all_tags}
                            on_new_tags={this.props.on_new_tags}
                            create_console_message_set={this.props.create_console_message_set}
                            on_new_console_messages={this.props.on_new_console_messages}
                        />
                        <TagDelete
                            all_tags={this.props.all_tags}
                            on_delete_tag={this.props.on_delete_tag}
                        />
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'transactions' && (
                    <React.Fragment>
                        <div className="content-wrapper">
                            <div className="content-half">
                                <TransactionAdd
                                    all_stocks={this.props.all_stocks}
                                    all_tags={this.props.all_tags}
                                    on_new_transaction={this.props.on_new_transaction}
                                    on_new_cash={this.props.on_new_cash}
                                    create_console_message_set={this.props.create_console_message_set}
                                    on_new_console_messages={this.props.on_new_console_messages}
                                />
                            </div>
                            <div className="content-half">
                                <TransactionsList
                                    all_transactions={this.props.all_transactions}
                                    all_risk={this.props.all_risk}
                                    on_delete_transaction={this.props.on_delete_transaction}
                                    on_import_transactions={this.props.on_import_transactions}
                                />
                            </div>
                        </div>
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
                    {this.state.which_inputs === 'my-performance' && (
                        <React.Fragment>
                        <MyPerformance
                            all_transactions={this.props.all_transactions}
                            all_positions={this.props.all_positions}
                            all_monthly_quotes={this.props.all_monthly_quotes}
                            baseline={this.props.baseline}
                            create_console_message_set={this.props.create_console_message_set}
                            on_new_console_messages={this.props.on_new_console_messages}
                        />
                        </React.Fragment>
                    )}
                    {this.state.which_inputs === 'console' && (
                        <React.Fragment>
                        <Console
                            all_console_messages={this.props.all_console_messages}
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
    all_monthly_quotes: PropTypes.object,
    all_positions: PropTypes.object,
    all_transactions: PropTypes.array,
    all_risk: PropTypes.object,
    show_tagged: PropTypes.bool,
    show_untagged: PropTypes.bool,
    show_cash: PropTypes.bool,
    baseline: PropTypes.string,
    get_balanceable_value: PropTypes.func,
    on_new_tickers: PropTypes.func.isRequired,
    on_new_cash: PropTypes.func.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    on_delete_tag: PropTypes.func.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
    on_import_transactions: PropTypes.func.isRequired,
    create_console_message_set: PropTypes.func.isRequired,
    all_console_messages: PropTypes.array.isRequired,
    on_new_console_messages: PropTypes.func.isRequired,
    on_whatif_submit: PropTypes.func,
    clear_last_console_message: PropTypes.func
}