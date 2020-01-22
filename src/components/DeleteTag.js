import React from 'react'
import PropTypes from 'prop-types'


export class DeleteTag extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            delete_tag: 'untagged',
        }
        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleTagChange(event) {
        this.setState({ delete_tag: event.target.value })
    }

    handleSubmit(event) {
        event.preventDefault()
        let user_tag = this.state.delete_tag
        let new_status_messages = []

        if (user_tag !== 'untagged') {
            new_status_messages.push('Tag "' + user_tag + '" has now been deleted.')
            this.props.on_new_messages(new_status_messages)
            this.props.on_delete_tag(user_tag)
            this.setState({ delete_tag: 'untagged' })
        }
    }

    render() {
        return (
            <section id="delete-tag">
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Delete Tag:
                        <select value={this.state.delete_tag} onChange={this.handleTagChange}>
                            <option key="untagged" value="untagged">(none)</option>
                            {Object.keys(this.props.all_tags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                            <option key={tag_name} value={tag_name}>{tag_name}</option>
                            ))}
                        </select>
                    </label>
                    <section className="buttonrow">
                        <input type="submit" value="Delete Tag" disabled={this.state.delete_tag==='untagged'} />
                    </section>
                </form>
            </section>
        )
    }
}

DeleteTag.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_delete_tag: PropTypes.func.isRequired,
    on_new_messages: PropTypes.func.isRequired
}