import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'


export const WhatIf = (props) => {

    const [balanceableValue, setBalanceableValue] = useState(0)
    const [balanceTargetSet, setBalanceTargetSet] = useState('my_current_holdings')
    const [balanceTargetColumn, setBalanceTargetColumn] = useState('currentValue')
    const [sellAllOf, setSellAllOf] = useState(['sell_none'])
    const [cashTreatment] = useState('ignore')
    const [cashRemaining, setCashRemaining] = useState('$0')
    const [cashValid, setCashValid] = useState(true)

    useEffect( () => {

        let new_balanceableValue = Math.round(props.getBalanceableValue(balanceTargetSet, sellAllOf, balanceTargetColumn))
        setBalanceableValue(new_balanceableValue)

        const stored_balanceTargetSet = JSON.parse(localStorage.getItem("balance_target_set"))
        if (stored_balanceTargetSet !== null) {
            setBalanceTargetSet(stored_balanceTargetSet)
        }

        const stored_balanceTargetColumn = JSON.parse(localStorage.getItem("balance_target_column"))
        if (stored_balanceTargetColumn !== null) {
            setBalanceTargetColumn(stored_balanceTargetColumn)
        }

        const stored_cashRemaining = JSON.parse(localStorage.getItem("cash_remaining"))
        if (stored_cashRemaining !== null) {
            setCashRemaining(stored_cashRemaining)
        }

    }, [props, balanceTargetSet, sellAllOf, balanceTargetColumn])

    const handleChange = (event) => {

        let {name, value, selectedOptions } = event.target

        // when the balance target set input changes, update the maximum value
        if (name === 'balance_target_set') {
            let new_balanceableValue = Math.round(props.getBalanceableValue(value, sellAllOf, balanceTargetColumn))
            setBalanceableValue(new_balanceableValue)
        }

        // when the balance target column input changes, update the maximum value
        if (name === 'balance_target_column') {
            let new_balanceableValue = Math.round(this.props.getBalanceableValue(balanceTargetSet, sellAllOf, value))
            setBalanceableValue(new_balanceableValue)
        }

        // when the cash remaining input changes, validate the user's value
        if (name === 'cash_remaining') {
            let user_whole_dollars_string = value.replace('$','').split('.')[0]
            let user_whole_dollars = parseInt(user_whole_dollars_string)
            let valid_whole_dollars_string = value.replace(/[^0-9.,]/g,'').split('.')[0]
            if (valid_whole_dollars_string.length 
                && user_whole_dollars_string === valid_whole_dollars_string 
                && user_whole_dollars >= 0
                && user_whole_dollars <= this.state.balanceable_value) { 
                setCashValid(true)
            } else {
                setCashValid(false)
            }
        }

        // update local storage
        localStorage.setItem(name, JSON.stringify(value))

        // mirror the input in state, since this is a (React) controlled input
        if (name === 'balance_target_set') {
            setBalanceTargetSet(value)
        } else if (name === 'balance_target_column') {
            setBalanceTargetColumn(value)
        } else if (name === 'sell_all_of') {
            let multiple_tickers = Array.from(selectedOptions, (item) => item.value)
            if (multiple_tickers.includes('sell_none')) {
                multiple_tickers = ['sell_none']
            }
            let new_balanceableValue = Math.round(props.getBalanceableValue(balanceTargetSet, value, balanceTargetColumn))
            setSellAllOf(multiple_tickers)
            setBalanceableValue(new_balanceableValue)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let user_remaining_cash = cashRemaining.split('.')[0].replace(/[^0-9]/g, "")
        let remaining_cash = (cashTreatment === 'include') ? parseInt(user_remaining_cash) : null
        props.onWhatifSubmit(balanceTargetSet, sellAllOf, balanceTargetColumn, remaining_cash)
    }

    const isDisabled = () => {

        if (cashTreatment === 'include' && !cashValid) {
            return true
        } else if (balanceTargetSet === 'my_current_holdings') {
            return (props.showCurrentHoldings) ? false : true
        } else if (balanceTargetSet === 'untagged') {
            return (props.showUntagged) ? false : true
        } else {
            return (props.showTagged) ? false : true
        }
    }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let excludable_tickers = []
    if (balanceTargetSet === "my_current_holdings") {
        excludable_tickers = Object.keys(props.allPositions).filter( ticker => ticker !== 'cash' && props.allPositions[ticker].currentShares)
    } else if (props.allTags.hasOwnProperty(balanceTargetSet)) {
        excludable_tickers = props.allTags[balanceTargetSet].filter( ticker => props.allPositions[ticker] && props.allPositions[ticker].currentShares)
    }
    return (
        <section id="what-if">
            <form onSubmit={handleSubmit}>
                <div id="operation">Balance&nbsp;
                    <select name="balance_target_set" value={balanceTargetSet} onChange={handleChange}>
                        <option value="my_current_holdings">current holdings ({Object.entries(props.allPositions).filter(position => position[0] !== 'cash' && position[1].currentShares !== 0).length})</option>
                        <option value="untagged">untagged tickers ({props.allTags.untagged.length})</option>
                        {Object.entries(props.allTags).filter(entry => entry[1].length).map(entry => entry[0]).sort().filter(tag => tag !== 'untagged').map(tag => 
                            <option key={tag} value={tag}>tag: {tag} ({props.allTags[tag].length})</option>
                        )}
                    </select>
                    &nbsp;into&nbsp; 
                    <select name="balance_target_column" value={balanceTargetColumn} onChange={handleChange}>
                        <option value="currentValue">equal values</option>
                        <option value="value_at_risk">equal values, risk adjusted</option>
                        <option value="basis">equal bases</option>
                        <option value="basis_risked">equal bases, risk adjusted</option>
                        <option value="only_profits">only profits remaining</option>
                    </select>
                    , but sell all of&nbsp;
                    <select name="sell_all_of" value={sellAllOf} multiple={true} onChange={handleChange}>
                        <option value="sell_none">(none. keep all.)</option>
                        {excludable_tickers.sort().map(ticker => 
                            <option key={ticker} value={ticker}> {ticker} </option>
                        )}
                    </select>
                    &nbsp;...
                </div>
                <div id="cash-treatment">
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cash_treatment" value="ignore" selected onChange={handleChange} defaultChecked />ignoring my cash balance</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cash_treatment" value="include" onChange={handleChange} disabled={!props.showCash} />using my cash balance, and leaving at least
                    <input type="text" id="cash_remaining" name="cash_remaining" size="12" onChange={handleChange} value={cashRemaining} placeholder="$0"></input>cash remaining (max: ${numberWithCommas(balanceableValue)})</label>
                </div>
                <section className="buttonrow">
                    <input className="btn btn-sm btn-primary" type="submit" value="What If?" disabled={isDisabled()}/>
                </section>
            </form>
        </section>
    )
}

WhatIf.propTypes = {
    allCurrentQuotes: PropTypes.object,
    allTags: PropTypes.object,
    allPositions: PropTypes.object,
    getBalanceableValue: PropTypes.func,
    showCurrentHoldings: PropTypes.bool,
    showTagged: PropTypes.bool,
    showUntagged: PropTypes.bool,
    showCash: PropTypes.bool,
    onWhatifSubmit: PropTypes.func
}