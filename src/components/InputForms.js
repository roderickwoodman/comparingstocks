import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { TickerAdd } from './TickerAdd'
import { TagAdd } from './TagAdd'
import { TransactionAdd } from './TransactionAdd'
import { TransactionsList } from './TransactionsList'
import { TagDelete } from './TagDelete'
import { MyPerformance } from './MyPerformance'
import { Console } from './Console'
import { WhatIf } from './WhatIf'


export const InputForms = (props) => {

    // tickers | tags | transactions | my-performance | what-ifs | console
    const [whichInputs, setWhichInputs] = useState('tickers') 

    useEffect ( () => {
        const stored_which_inputs = JSON.parse(localStorage.getItem("which_inputs"))
        if (stored_which_inputs !== null) {
            setWhichInputs(stored_which_inputs)
        }
    }, [])

    const onWhichInputs = (new_which_inputs) => {
        localStorage.setItem('which_inputs', JSON.stringify(new_which_inputs))
        if (whichInputs !== new_which_inputs) {
            props.clear_last_console_message()
        }
        setWhichInputs(new_which_inputs)
    }

    return (
        <div id="input-forms">
            <section id="input-form-selectors">
                <span className={"input-form-selector" + (whichInputs==="tickers" ? " selected" : "") } onClick={ (e)=>onWhichInputs('tickers')}>Tickers</span>
                <span className={"input-form-selector" + (whichInputs==="tags" ? " selected" : "") } onClick={ (e)=>onWhichInputs('tags')}>Tags</span>
                <span className={"input-form-selector" + (whichInputs==="transactions" ? " selected" : "") } onClick={ (e)=>onWhichInputs('transactions')}>Transactions</span>
                <span className={"input-form-selector" + (whichInputs==="my-performance" ? " selected" : "") } onClick={ (e)=>onWhichInputs('my-performance')}>Performance</span>
                <span className={"input-form-selector" + (whichInputs==="what-ifs" ? " selected" : "") } onClick={ (e)=>onWhichInputs('what-ifs')}>What If?</span>
                <span className={"input-form-selector" + (whichInputs==="console" ? " selected" : "") } onClick={ (e)=>onWhichInputs('console')}>Messages</span>
            </section>
            <section id="input-form-forms">
                {whichInputs === 'tickers' && (
                    <React.Fragment>
                    <TickerAdd
                        all_stocks={props.all_stocks}
                        all_tags={props.all_tags}
                        on_new_tickers={props.on_new_tickers}
                        create_console_message_set={props.create_console_message_set}
                        on_new_console_messages={props.on_new_console_messages}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'tags' && (
                    <React.Fragment>
                    <TagAdd
                        all_tags={props.all_tags}
                        on_new_tags={props.on_new_tags}
                        create_console_message_set={props.create_console_message_set}
                        on_new_console_messages={props.on_new_console_messages}
                    />
                    <TagDelete
                        all_tags={props.all_tags}
                        on_delete_tags={props.on_delete_tags}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'transactions' && (
                <React.Fragment>
                    <div className="content-wrapper">
                        <div className="content-half">
                            <TransactionAdd
                                all_stocks={props.all_stocks}
                                all_tags={props.all_tags}
                                on_new_transaction={props.on_new_transaction}
                                on_new_cash={props.on_new_cash}
                                create_console_message_set={props.create_console_message_set}
                                on_new_console_messages={props.on_new_console_messages}
                            />
                        </div>
                        <div className="content-half">
                            <TransactionsList
                                all_transactions={props.all_transactions}
                                all_risk={props.all_risk}
                                on_delete_transaction={props.on_delete_transaction}
                                on_import_transactions={props.on_import_transactions}
                            />
                        </div>
                    </div>
                </React.Fragment>
                )}
                {whichInputs === 'what-ifs' && (
                    <React.Fragment>
                    <WhatIf
                        all_current_quotes={props.all_current_quotes}
                        all_positions={props.all_positions}
                        all_tags={props.all_tags}
                        get_balanceable_value={props.get_balanceable_value}
                        show_current_holdings={props.show_current_holdings}
                        show_previous_holdings={props.show_previous_holdings}
                        show_tagged={props.show_tagged}
                        show_untagged={props.show_untagged}
                        show_cash={props.show_cash}
                        on_whatif_submit={props.on_whatif_submit}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'my-performance' && (
                    <React.Fragment>
                    <MyPerformance
                        all_transactions={props.all_transactions}
                        all_positions={props.all_positions}
                        all_monthly_quotes={props.all_monthly_quotes}
                        all_month_end_dates={props.all_month_end_dates}
                        baseline_name={props.baseline_name}
                        create_console_message_set={props.create_console_message_set}
                        on_new_console_messages={props.on_new_console_messages}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'console' && (
                    <React.Fragment>
                    <Console
                        allConsoleMessages={props.allConsoleMessages}
                    />
                    </React.Fragment>
                )}
            </section>
        </div>
    )
}

InputForms.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    all_current_quotes: PropTypes.object.isRequired,
    all_monthly_quotes: PropTypes.object.isRequired,
    all_month_end_dates: PropTypes.array.isRequired,
    all_positions: PropTypes.object,
    all_transactions: PropTypes.array,
    all_risk: PropTypes.object,
    show_tagged: PropTypes.bool,
    show_untagged: PropTypes.bool,
    show_cash: PropTypes.bool,
    baseline_name: PropTypes.string,
    get_balanceable_value: PropTypes.func,
    on_new_tickers: PropTypes.func.isRequired,
    on_new_cash: PropTypes.func.isRequired,
    on_new_tags: PropTypes.func.isRequired,
    on_delete_tags: PropTypes.func.isRequired,
    on_new_transaction: PropTypes.func.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
    on_import_transactions: PropTypes.func.isRequired,
    create_console_message_set: PropTypes.func.isRequired,
    allConsoleMessages: PropTypes.array.isRequired,
    on_new_console_messages: PropTypes.func.isRequired,
    on_whatif_submit: PropTypes.func,
    clear_last_console_message: PropTypes.func
}