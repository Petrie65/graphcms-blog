import React from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import Markdown from 'react-markdown'

const Post = ({ data: { loading, error, Post } }) => {
	if (error) return <h1>Error fetching the Post!</h1>
	if (!loading) {
		if (!Post) return (<h2>no Post data</h2>);
		return (
			<article>
				<h1>{Post.title}</h1>
				<div className='Post-placeholder'>
					<img
						alt={Post.title}
						src={`https://media.graphcms.com/resize=w:650,h:366,fit:crop/${Post.coverImage.handle}`}
					/>
				</div>
				<Markdown
					source={Post.content}
					escapeHtml={false}
				/>
			</article>
		)
	}
	return <h2>Loading Post...</h2>
}

export const singlePost = gql`
	query singlePost($slug: String!) {
		Post(slug: $slug) {
			id
			slug
			title
			coverImage {
				handle
			}
			content
			dateAndTime
		}
	}
`

export default graphql(singlePost, {
	options: ({ match }) => ({
		variables: {
			slug: match.params.slug
		}
	})
})(Post)
