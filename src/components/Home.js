import React from 'react'
import { Link } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const POSTS_PER_PAGE = 4

const Home = ({ data: { loading, error, allPosts, _allPostsMeta }, loadMorePosts }) => {
	if (error) return <h1>Error fetching posts!</h1>
	if (!loading) {
		const areMorePosts = allPosts.length < _allPostsMeta.count
		return (
			<section>
				{allPosts.map(post => (
					<Link to={`/post/${post.slug}`} className='Home-link'>
						<h3>{post.title}</h3>
						<div className='Home-placeholder'>
							<img
								alt={post.title}
								className='Home-img'
								src={`https://media.graphcms.com/resize=w:100,h:100,fit:crop/${post.coverImage.handle}`}
								/>
							</div>
						</Link>
				))}
				<div className='Home-showMoreWrapper'>
					{areMorePosts
						? <button className='Home-button' onClick={() => loadMorePosts()}>
							{loading ? 'Loading...' : 'Show More Posts'}
						</button>
						: ''}
				</div>
			</section>
		)
	}
	return <h2>Loading posts...</h2>
}

/*
This is the query we use to tell Apollo what exact data we'd like it to get for us. 
We also specify that our query allPosts takes in 2 variables first and skip which we will then pass as 
arguments to the query to specify how many posts to fetch (first) and where to start (skip). 
This will be useful for our pagination.
*/
export const allPosts = 
gql`
	query allPosts($first: Int!, $skip: Int!) {
		allPosts(orderBy: dateAndTime_DESC, first: $first, skip: $skip) {
			slug
			title
			coverImage {
				handle
			}
		},
		_allPostsMeta {
			count
		}
	}
`

/*
Here, we use allPostsQueryVars to set the values of the variables we will be passing to the query. 
We skip 0 to start from the 1st article and we fetch the first 4 posts, because that's what our POSTS_PER_AGE equals to.
*/
export const allPostsQueryVars = {
	skip: 0,
	first: POSTS_PER_PAGE
}

/*
graphql function that we call with (query, [config])(component). 
Component is of course our Home component, the query is allPosts but the options is where things get interesting.
*/
export default graphql(allPosts, {
/* 	Since we don't want to display all our posts at once but rather show the first few and 
	load POSTS_PER_PAGE more with each subsequent click of our <button />, we need to tell
	Apollo what we're up to. We start by telling Apollo with options that we want it to use our 
	previously declared allPostsQueryVars as variables in the allPosts query: */
		options: {
			variables: allPostsQueryVars
		},
/*	We follow up with props that allows us to define a map function that takes in the props of our component (including those defined by Apollo). 
	props is most useful when you want to abstract away complex functions calls into a simple prop that you can pass down to your component. */ 
	props: ({ data }) => ({
		data,
		loadMorePosts: () => {
			return data.fetchMore({
				variables: {
					skip: data.allPosts.length
				},
				updateQuery: (previousResult, { fetchMoreResult }) => {
					if (!fetchMoreResult) {
						return previousResult
					}
					return Object.assign({}, previousResult, {
						allPosts: [...previousResult.allPosts, ...fetchMoreResult.allPosts]
					})
				}
			})
		}
		})
})(Home)
