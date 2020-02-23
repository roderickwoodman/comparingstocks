import React from 'react'
import PropTypes from 'prop-types'


export class EditNumericCell extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user_value: '',
            user_value_is_valid: false
        }
        this.handleEscapeKey = this.handleEscapeKey.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        if (isNaN(this.props.original_value)) {
            this.setState({ user_value: '' }) 
        } else {
            this.setState({ user_value: this.props.original_value })
        }
        this.elem.focus()
        document.addEventListener('keydown', this.handleEscapeKey, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleEscapeKey, false)
    }

    handleEscapeKey(event) {
        if (event.keyCode === 27) {
            this.props.on_escape_key()
        }
    }

    handleChange(event) {

        let {name, value } = event.target

        // when the input changes, validate the user's value
        if (name === 'user_value') {
            if (value.length && !isNaN(value) && value > 0) {
                this.setState({ user_value: value, user_value_is_valid: true })
            } else {
                this.setState({ user_value: value, user_value_is_valid: false })
            }
        }
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.on_new_value(this.state.user_value)
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input ref={(elem) => {this.elem = elem}} type="text" id="edit-cell" name="user_value" value={this.state.user_value} onChange={this.handleChange} size="5" />
                <button type="submit" disabled={!this.state.user_value_is_valid}>S</button>
            </form>
        )
    }
}

EditNumericCell.propTypes = {
    original_value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
    on_new_value: PropTypes.func.isRequired,
    on_escape_key: PropTypes.func.isRequired
}


