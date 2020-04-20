import React from 'react'
import PropTypes from 'prop-types'


export class TransactionsList extends React.Component {

    constructor(props) {
        super(props)
        this.exportRef = React.createRef()
        this.importRef = React.createRef()
        this.state = {
            data_sort_dir: 'desc',
            filter_str: '',
            file: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.onToggleSortOrder = this.onToggleSortOrder.bind(this)
        this.onExportButton = this.onExportButton.bind(this)
        this.onHiddenImportChange = this.onHiddenImportChange.bind(this)
    }

    handleChange(event) {
        const target = event.target
        const new_value = target.value
        const name = target.name
        this.setState({ [name]: new_value })
    }

    onToggleSortOrder() {
        this.setState(prevState => {
            let new_sort_dir = (prevState.data_sort_dir === 'asc') ? 'desc' : 'asc'
            return { 
                data_sort_dir: new_sort_dir 
            }
        })
    }
        
    onExportButton() {

        // prepare the data
        let exported_json = {
            transactions: JSON.parse(JSON.stringify(this.props.all_transactions)),
            risk: JSON.parse(JSON.stringify(this.props.all_risk))
        }
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exported_json));

        // create the download link
        var a = document.createElement('a')
        a.href = 'data:' + data
        a.download = 'transactions.json'
        a.innerHTML = 'download'

        // attach the download link, trigger it, and then remove it from the DOM
        var container = this.exportRef.current
        container.appendChild(a)
        a.click()
        a.remove()
    }

    onHiddenImportChange(files) {
        if (files[0]) {
            let self = this
            let reader = new FileReader();
            reader.readAsText(files[0], "UTF-8");
            reader.onload = function (evt) {
                let file_contents = JSON.parse(evt.target.result)
                self.props.on_import_transactions(file_contents)
            }
        }
    }

    render() {
        let self = this
        let sorted_filtered_transactions = this.props.all_transactions
            .filter( transaction => transaction.summary.toLowerCase().includes(this.state.filter_str.toLowerCase()) )
            .sort( function(a,b) {
                if (a.summary < b.summary) {
                    return (self.state.data_sort_dir === 'asc') ? -1 : 1
                } else if (a.summary > b.summary) {
                    return (self.state.data_sort_dir === 'asc') ? 1 : -1
                } else {
                    return 0
                }
            })
        return (
            <section id="transaction-list">
                <section id="transaction-list-controls">
                    <button onClick={ (e)=>this.onToggleSortOrder() } className="strong">&#x21c5;</button>
                    <form>
                        <label>Filter:</label>
                        <input name="filter_str" value={this.state.filter_str} onChange={this.handleChange} size="15" />

                        <button className="btn btn-sm btn-primary" onClick={this.onExportButton} disabled={!this.props.all_transactions.length}>export</button>
                        <div ref={this.exportRef}></div>

                        <label className="btn btn-sm btn-primary">
                        <input type="file" ref={this.importRef} onChange={ (e) => this.onHiddenImportChange(e.target.files) } accept="application/json" style={{width: 0, visibility: "hidden"}} />
                        import
                        </label>
                    </form>
                </section>
                <section id="transactions">
                    {sorted_filtered_transactions.map( transaction => (
                        <p key={transaction.modified_at} className="transaction" onClick={ (e)=>this.props.on_delete_transaction(transaction.modified_at)}>{transaction.summary}</p>
                    ))}
                </section>
            </section>
        )
    }
}

TransactionsList.propTypes = {
    all_transactions: PropTypes.array.isRequired,
    all_risk: PropTypes.object.isRequired,
    on_delete_transaction: PropTypes.func.isRequired,
    on_import_transactions: PropTypes.func.isRequired,
}