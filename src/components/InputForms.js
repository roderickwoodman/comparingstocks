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
        const storedWhichInputs = JSON.parse(localStorage.getItem("whichInputs"))
        if (storedWhichInputs !== null) {
            setWhichInputs(storedWhichInputs)
        }
    }, [])

    const onWhichInputs = (newWhichInputs) => {
        localStorage.setItem('whichInputs', JSON.stringify(newWhichInputs))
        if (whichInputs !== newWhichInputs) {
            props.clearLastConsoleMessage()
        }
        setWhichInputs(newWhichInputs)
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
                        allStocks={props.allStocks}
                        allTags={props.allTags}
                        onNewTickers={props.onNewTickers}
                        createConsoleMessageSet={props.createConsoleMessageSet}
                        onNewConsoleMessages={props.onNewConsoleMessages}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'tags' && (
                    <React.Fragment>
                    <TagAdd
                        allTags={props.allTags}
                        onNewTags={props.onNewTags}
                        createConsoleMessageSet={props.createConsoleMessageSet}
                        onNewConsoleMessages={props.onNewConsoleMessages}
                    />
                    <TagDelete
                        allTags={props.allTags}
                        onDeleteTags={props.onDeleteTags}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'transactions' && (
                <React.Fragment>
                    <div className="content-wrapper">
                        <div className="content-half">
                            <TransactionAdd
                                allStocks={props.allStocks}
                                allTags={props.allTags}
                                onNewTransaction={props.onNewTransaction}
                                onNewCash={props.onNewCash}
                                createConsoleMessageSet={props.createConsoleMessageSet}
                                onNewConsoleMessages={props.onNewConsoleMessages}
                            />
                        </div>
                        <div className="content-half">
                            <TransactionsList
                                allTransactions={props.allTransactions}
                                allRisk={props.allRisk}
                                onDeleteTransaction={props.onDeleteTransaction}
                                onImportTransactions={props.onImportTransactions}
                            />
                        </div>
                    </div>
                </React.Fragment>
                )}
                {whichInputs === 'what-ifs' && (
                    <React.Fragment>
                    <WhatIf
                        allCurrentQuotes={props.allCurrentQuotes}
                        allPositions={props.allPositions}
                        allTags={props.allTags}
                        getBalanceableValue={props.getBalanceableValue}
                        showCurrentHoldings={props.showCurrentHoldings}
                        showPreviousHoldings={props.showPreviousHoldings}
                        showTagged={props.showTagged}
                        showUntagged={props.showUntagged}
                        showCash={props.showCash}
                        onWhatifSubmit={props.onWhatifSubmit}
                    />
                    </React.Fragment>
                )}
                {whichInputs === 'my-performance' && (
                    <React.Fragment>
                    <MyPerformance
                        allTransactions={props.allTransactions}
                        allPositions={props.allPositions}
                        allMonthlyQuotes={props.allMonthlyQuotes}
                        allMonthEndDates={props.allMonthEndDates}
                        baselineName={props.baselineName}
                        createConsoleMessageSet={props.createConsoleMessageSet}
                        onNewConsoleMessages={props.onNewConsoleMessages}
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
    allStocks: PropTypes.array.isRequired,
    allTags: PropTypes.object.isRequired,
    allCurrentQuotes: PropTypes.object.isRequired,
    allMonthlyQuotes: PropTypes.object.isRequired,
    allMonthEndDates: PropTypes.array.isRequired,
    allPositions: PropTypes.object,
    allTransactions: PropTypes.array,
    allRisk: PropTypes.object,
    showTagged: PropTypes.bool,
    showUntagged: PropTypes.bool,
    showCash: PropTypes.bool,
    baselineName: PropTypes.string,
    getBalanceableValue: PropTypes.func,
    onNewTickers: PropTypes.func.isRequired,
    onNewCash: PropTypes.func.isRequired,
    onNewTags: PropTypes.func.isRequired,
    onDeleteTags: PropTypes.func.isRequired,
    onNewTransaction: PropTypes.func.isRequired,
    onDeleteTransaction: PropTypes.func.isRequired,
    onImportTransactions: PropTypes.func.isRequired,
    createConsoleMessageSet: PropTypes.func.isRequired,
    allConsoleMessages: PropTypes.array.isRequired,
    onNewConsoleMessages: PropTypes.func.isRequired,
    onWhatifSubmit: PropTypes.func,
    clearLastConsoleMessage: PropTypes.func
}