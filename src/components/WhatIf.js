import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'


export const WhatIf = (props) => {

    const [balanceableValue, setBalanceableValue] = useState(0)
    const [balanceTargetSet, setBalanceTargetSet] = useState('myCurrentHoldings')
    const [balanceTargetColumn, setBalanceTargetColumn] = useState('currentValue')
    const [sellAllOf, setSellAllOf] = useState(['sellNone'])
    const [cashTreatment] = useState('ignore')
    const [cashRemaining, setCashRemaining] = useState('$0')
    const [cashValid, setCashValid] = useState(true)

    useEffect( () => {

        let newBalanceableValue = Math.round(props.getBalanceableValue(balanceTargetSet, sellAllOf, balanceTargetColumn))
        setBalanceableValue(newBalanceableValue)

        const storedBalanceTargetSet = JSON.parse(localStorage.getItem("balanceTargetSet"))
        if (storedBalanceTargetSet !== null) {
            setBalanceTargetSet(storedBalanceTargetSet)
        }

        const storedBalanceTargetColumn = JSON.parse(localStorage.getItem("balanceTargetColumn"))
        if (storedBalanceTargetColumn !== null) {
            setBalanceTargetColumn(storedBalanceTargetColumn)
        }

        const storedCashRemaining = JSON.parse(localStorage.getItem("cashRemaining"))
        if (storedCashRemaining !== null) {
            setCashRemaining(storedCashRemaining)
        }

    }, [props, balanceTargetSet, sellAllOf, balanceTargetColumn])

    const handleChange = (event) => {

        let {name, value, selectedOptions } = event.target

        // when the balance target set input changes, update the maximum value
        if (name === 'balanceTargetSet') {
            let newBalanceableValue = Math.round(props.getBalanceableValue(value, sellAllOf, balanceTargetColumn))
            setBalanceableValue(newBalanceableValue)
        }

        // when the balance target column input changes, update the maximum value
        if (name === 'balanceTargetColumn') {
            let newBalanceableValue = Math.round(this.props.getBalanceableValue(balanceTargetSet, sellAllOf, value))
            setBalanceableValue(newBalanceableValue)
        }

        // when the cash remaining input changes, validate the user's value
        if (name === 'cashRemaining') {
            let usersWholeDollarsString = value.replace('$','').split('.')[0]
            let usersWholeDollars = parseInt(usersWholeDollarsString)
            let validWholeDollarsString = value.replace(/[^0-9.,]/g,'').split('.')[0]
            if (validWholeDollarsString.length 
                && usersWholeDollarsString === validWholeDollarsString 
                && usersWholeDollars >= 0
                && usersWholeDollars <= this.state.balanceableValue) { 
                setCashValid(true)
            } else {
                setCashValid(false)
            }
        }

        // update local storage
        localStorage.setItem(name, JSON.stringify(value))

        // mirror the input in state, since this is a (React) controlled input
        if (name === 'balanceTargetSet') {
            setBalanceTargetSet(value)
        } else if (name === 'balanceTargetColumn') {
            setBalanceTargetColumn(value)
        } else if (name === 'sellAllOf') {
            let multipleTickers = Array.from(selectedOptions, (item) => item.value)
            if (multipleTickers.includes('sellNone')) {
                multipleTickers = ['sellNone']
            }
            let newBalanceableValue = Math.round(props.getBalanceableValue(balanceTargetSet, value, balanceTargetColumn))
            setSellAllOf(multipleTickers)
            setBalanceableValue(newBalanceableValue)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let userRemainingCash = cashRemaining.split('.')[0].replace(/[^0-9]/g, "")
        let remainingCash = (cashTreatment === 'include') ? parseInt(userRemainingCash) : null
        props.onWhatifSubmit(balanceTargetSet, sellAllOf, balanceTargetColumn, remainingCash)
    }

    const isDisabled = () => {

        if (cashTreatment === 'include' && !cashValid) {
            return true
        } else if (balanceTargetSet === 'myCurrentHoldings') {
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

    let excludableTickers = []
    if (balanceTargetSet === "myCurrentHoldings") {
        excludableTickers = Object.keys(props.allPositions).filter( ticker => ticker !== 'cash' && props.allPositions[ticker].currentShares)
    } else if (props.allTags.hasOwnProperty(balanceTargetSet)) {
        excludableTickers = props.allTags[balanceTargetSet].filter( ticker => props.allPositions[ticker] && props.allPositions[ticker].currentShares)
    }
    return (
        <section id="what-if">
            <form onSubmit={handleSubmit}>
                <div id="operation">Balance&nbsp;
                    <select name="balanceTargetSet" value={balanceTargetSet} onChange={handleChange}>
                        <option value="myCurrentHoldings">current holdings ({Object.entries(props.allPositions).filter(position => position[0] !== 'cash' && position[1].currentShares !== 0).length})</option>
                        <option value="untagged">untagged tickers ({props.allTags.untagged.length})</option>
                        {Object.entries(props.allTags).filter(entry => entry[1].length).map(entry => entry[0]).sort().filter(tag => tag !== 'untagged').map(tag => 
                            <option key={tag} value={tag}>tag: {tag} ({props.allTags[tag].length})</option>
                        )}
                    </select>
                    &nbsp;into&nbsp; 
                    <select name="balanceTargetColumn" value={balanceTargetColumn} onChange={handleChange}>
                        <option value="currentValue">equal values</option>
                        <option value="valueAtRisk">equal values, risk adjusted</option>
                        <option value="basis">equal bases</option>
                        <option value="basisRisked">equal bases, risk adjusted</option>
                        <option value="onlyProfits">only profits remaining</option>
                    </select>
                    , but sell all of&nbsp;
                    <select name="sellAllOf" value={sellAllOf} multiple={true} onChange={handleChange}>
                        <option value="sellNone">(none. keep all.)</option>
                        {excludableTickers.sort().map(ticker => 
                            <option key={ticker} value={ticker}> {ticker} </option>
                        )}
                    </select>
                    &nbsp;...
                </div>
                <div id="cash-treatment">
                    <label htmlFor="ignore"><input type="radio" id="ignore" name="cashTreatment" value="ignore" selected onChange={handleChange} defaultChecked />ignoring my cash balance</label>
                    <label htmlFor="include"><input type="radio" id="include" name="cashTreatment" value="include" onChange={handleChange} disabled={!props.showCash} />using my cash balance, and leaving at least
                    <input type="text" id="cashRemaining" name="cashRemaining" size="12" onChange={handleChange} value={cashRemaining} placeholder="$0"></input>cash remaining (max: ${numberWithCommas(balanceableValue)})</label>
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