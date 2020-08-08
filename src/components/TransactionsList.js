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
        let new_sort_dir = (dataSortDir === 'asc') ? 'desc' : 'asc'
        setDataSortDir(new_sort_dir)
    }
        
    const onExportButton = () => {

        // prepare the data
        let exported_json = {
            transactions: JSON.parse(JSON.stringify(props.all_transactions)),
            risk: JSON.parse(JSON.stringify(props.all_risk))
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
                props.on_import_transactions(file_contents)
            }
        }
    }

    let all_transactions = props.all_transactions
    let ordered_filtered_transactions = all_transactions
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

                    <button className="btn btn-sm btn-primary" onClick={onExportButton} disabled={!props.all_transactions.length}>export</button>
                    <div ref={exportEl}></div>

                    <label className="btn btn-sm btn-primary">
                    <input type="file" ref={importEl} onChange={ (e) => onHiddenImportChange(e.target.files) } accept="application/json" style={{width: 0, visibility: "hidden"}} />
                    import
                    </label>
                </form>
            </section>
            <section id="transactions">
                {ordered_filtered_transactions.map( transaction => (
                    <p key={transaction.modified_at} className="transaction" onClick={ (e)=>props.on_delete_transaction(transaction.modified_at)}>{transaction.summary}</p>
                ))}
            </section>
        </section>
    )
}

TransactionsList.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    all_risk: PropTypes.object.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
    on_import_transactions: PropTypes.func.isRequired,
}