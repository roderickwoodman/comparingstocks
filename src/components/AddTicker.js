import React from 'react'
import PropTypes from 'prop-types'


export class AddTicker extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_tickers_string: '',
            add_to_tag: 'untagged',
        }
        this.handleTickersChange = this.handleTickersChange.bind(this)
        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleReset = this.handleReset.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.validateTickers = this.validateTickers.bind(this)
    }

    handleTickersChange(event) {
        this.setState({ user_tickers_string: event.target.value })
    }

    handleTagChange(event) {
        this.setState({ add_to_tag: event.target.value })
    }

    handleReset(event) {
        this.setState({ user_tickers_string: "" })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_tag = this.state.add_to_tag
        let user_tickers = String(this.state.user_tickers_string)
            .split(" ")
            .map(str => str.trim())
            .map(str => str.toUpperCase())
            .map(str => str.replace(/[^A-Z]/g, ""))
        this.validateTickers(user_tag, Array.from(new Set(user_tickers)))
    }

    validateTickers(tag, tickers) {
        let tickers_to_add = []
        let new_status_messages = []
        let self = this
        const create_message = this.props.create_message
        tickers.forEach(function(ticker) {
            // ticker does not exist
            if (!self.props.all_stocks.includes(ticker)) {
                new_status_messages.push(create_message('ERROR: Ticker ' + ticker + ' does not exist.'))

            // ticker is already in the target tag
            } else if (self.props.all_tags[tag].includes(ticker)) {
                if (tag === 'untagged') {
                    new_status_messages.push(create_message('ERROR: Ticker ' + ticker + ' has already been added.'))
                } else {
                    new_status_messages.push(create_message('ERROR: Ticker ' + ticker + ' has already been added to tag "'+ tag +'".'))
                }

            // ticker is being added to a tag that it is not already in
            } else {
                let tagged_tickers = []
                Object.keys(self.props.all_tags).forEach(function(tag) {
                    if (tag !== 'untagged') {
                        tagged_tickers = tagged_tickers.concat(self.props.all_tags[tag])
                    }
                })
                if (tag === 'untagged' && tagged_tickers.includes(ticker)) {
                    new_status_messages.push(create_message('ERROR: Ticker ' + ticker + ' has already been added to another named tag.'))
                } else {
                    if (tag === 'untagged') {
                        new_status_messages.push(create_message('Ticker ' + ticker + ' has now been added.'))
                    } else {
                        new_status_messages.push(create_message('Ticker ' + ticker + ' has now been added to tag "' + tag + '".'))
                    }
                    tickers_to_add.push(ticker)
                }
            }
        })
        this.props.on_new_tickers(tag, tickers_to_add)
        this.props.on_new_messages(new_status_messages)
        this.handleReset()
    }

    render() {
        return (
            <section id="add-ticker">
                <form onSubmit={this.handleSubmit} onReset={this.handleReset}>
                    <label>New Ticker(s):</label>
                    <input value={this.state.user_tickers_string} onChange={this.handleTickersChange} placeholder="Dow30 tickers only" required />
                    <label>
                        Add to Tag:
                        <select value={this.state.add_to_tag} onChange={this.handleTagChange}>
                            <option key="untagged" value="untagged">(no tag)</option>
                            {Object.keys(this.props.all_tags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                            <option key={tag_name} value={tag_name}>{tag_name}</option>
                            ))}
                        </select>
                    </label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Add Ticker(s)" disabled={this.state.user_tickers_string===''}/>
                    </section>
                </form>
            </section>
        )
    }
}

AddTicker.propTypes = {
    all_stocks: PropTypes.array.isRequired,
    all_tags: PropTypes.object.isRequired,
    on_new_tickers: PropTypes.func.isRequired,
    create_message: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired
}