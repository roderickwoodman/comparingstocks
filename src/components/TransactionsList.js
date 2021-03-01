import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'


export const TransactionsList = (props) => {

    const exportEl = useRef(null)
    const importEl = useRef(null)
    const [dataSortDir, setDataSortDir] = useState('desc')
    const [filterStr, setFilterStr] = useState('')

    const handleChange = (event) => {
        setFilterStr(event.target.value)
    }

    const onToggleSortOrder = () => {
        let newSortDir = (dataSortDir === 'asc') ? 'desc' : 'asc'
        setDataSortDir(newSortDir)
    }
        
    const onExportButton = () => {

        // prepare the data
        let exported_json = {
            transactions: JSON.parse(JSON.stringify(props.allTransactions)),
            risk: JSON.parse(JSON.stringify(props.allRisk))
        }
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exported_json));

        // create the download link
        var a = document.createElement('a')
        a.href = 'data:' + data
        a.download = 'transactions.json'
        a.innerHTML = 'download'

        // attach the download link, trigger it, and then remove it from the DOM
        var container = exportEl.current
        container.appendChild(a)
        a.click()
        a.remove()
    }

    const onHiddenImportChange = (files) => {
        if (files[0]) {
            let reader = new FileReader();
            reader.readAsText(files[0], "UTF-8");
            reader.onload = function (evt) {
                let file_contents = JSON.parse(evt.target.result)
                props.onImportTransactions(file_contents)
            }
        }
    }

    let allTransactions = props.allTransactions
    let ordered_filtered_transactions = allTransactions
        .filter( transaction => transaction.summary.toLowerCase().includes(filterStr.toLowerCase()) )
        .sort( function(a,b) {
            if (a.summary < b.summary) {
                return (dataSortDir === 'asc') ? -1 : 1
            } else if (a.summary > b.summary) {
                return (dataSortDir === 'asc') ? 1 : -1
            } else {
                return 0
            }
        })
    return (
        <section id="transaction-list">
            <section id="transaction-list-controls">
                <form>
                    <button onClick={ (e)=>onToggleSortOrder() } className="strong">&#x21c5;</button>

                    <label>Filter:</label>
                    <input name="filter_str" value={filterStr} onChange={handleChange} size="15" />

                    <button className="btn btn-sm btn-primary" onClick={onExportButton} disabled={!props.allTransactions.length}>export</button>
                    <div ref={exportEl}></div>

                    <label className="btn btn-sm btn-primary">
                    <input type="file" ref={importEl} onChange={ (e) => onHiddenImportChange(e.target.files) } accept="application/json" style={{width: 0, visibility: "hidden"}} />
                    import
                    </label>
                </form>
            </section>
            <section id="transactions">
                {ordered_filtered_transactions.map( transaction => (
                    <p key={transaction.modifiedAt} className="transaction" onClick={ (e)=>props.onDeleteTransaction(transaction.modifiedAt)}>{transaction.summary}</p>
                ))}
            </section>
        </section>
    )
}

TransactionsList.propTypes = {
    allTransactions: PropTypes.array.isRequired,
    allRisk: PropTypes.object.isRequired,
    onDeleteTransaction: PropTypes.func.isRequired,
    onImportTransactions: PropTypes.func.isRequired,
}