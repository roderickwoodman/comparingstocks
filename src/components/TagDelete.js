import React from 'react'
import PropTypes from 'prop-types'


export class TagDelete extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            delete_tag_list: ['untagged'],
        }
        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleTagChange(event) {
        let {selectedOptions } = event.target

        let multiple_tags = Array.from(selectedOptions, (item) => item.value)

        this.setState({ delete_tag_list: multiple_tags })
    }

    handleSubmit(event) {
        event.preventDefault()

        let user_tag_list = this.state.delete_tag_list
        this.props.on_delete_tags(user_tag_list)

        this.setState({ delete_tag_list: 'untagged' })
    }

    render() {
        return (
            <section id="delete-tag">
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Delete Tag:
                        <select value={this.state.delete_tag_list} multiple={true} onChange={this.handleTagChange}>
                            <option key="untagged" value="untagged">(none)</option>
                            {Object.keys(this.props.all_tags).sort().filter(tag_name => tag_name !== 'untagged').map(tag_name => (
                            <option key={tag_name} value={tag_name}>{tag_name}</option>
                            ))}
                        </select>
                    </label>
                    <section className="buttonrow">
                        <input className="btn btn-sm btn-primary" type="submit" value="Delete Tag(s)" disabled={this.state.delete_tag==='untagged'} />
                    </section>
                </form>
            </section>
        )
    }
}

TagDelete.propTypes = {
    all_tags: PropTypes.object.isRequired,
    on_delete_tags: PropTypes.func.isRequired,
}