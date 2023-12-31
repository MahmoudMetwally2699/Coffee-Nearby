import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

import cls from 'classnames';
import useSWR from 'swr';

import { fetchCoffeeStores } from '../../lib/coffee-stores';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../store/store-context';

import { isEmpty } from '../../utils';

import styles from '../../styles/coffee-store.module.css';

export async function getStaticProps ( staticProps )
{
	const params = staticProps.params;
	console.log( params );

	const coffeeStores = await fetchCoffeeStores();
	const findCoffeeStoreById = coffeeStores.find( ( coffeeStore ) =>
	{
		return coffeeStore.id.toString() === params.id; // dynamic id;
	} );

	return {
		props: {
			coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
		},
	};
}


export async function getStaticPaths ()
{
	const coffeeStores = await fetchCoffeeStores();

	const paths = coffeeStores.map( ( coffeeStore ) =>
	{
		return {
			params: {
				id: coffeeStore.id.toString(),
			},
		};
	} );

	return {
		paths,
		fallback: true,
	};
}

const CoffeeStore = ( initialProps ) =>
{
	const [ coffeeStore, setCoffeeStore ] = useState( initialProps.coffeeStore );
	const [ votingCount, setVotingCount ] = useState( 0 );
	const router = useRouter();

	const { id } = router.query;

	const {
		state: { coffeeStores },
	} = useContext( StoreContext );

	const fetcher = ( ...args ) => fetch( ...args ).then( ( res ) => res.json() );

	const { data, error } = useSWR( `/api/getCoffeeStoreById?id=${ id ? id : '' }`, fetcher );

	useEffect( () =>
	{
		if ( data && data.length > 0 )
		{
			setCoffeeStore( data[ 0 ] );

			setVotingCount( data[ 0 ].voting );
		}
	}, [ data ] );

	const handleCreateCoffeeStore = async ( coffeeStore ) =>
	{

		try
		{
			const { id, address, name, voting, imgUrl, neighbourhood } = coffeeStore;


			const response = await fetch( '/api/createCoffeeStore', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					id,
					name,
					voting: 0,
					imgUrl,
					neighbourhood: neighbourhood || '',
					address: address || '',
				} ),
			} );
		} catch ( error )
		{
			console.error( 'Error creating coffee store', error );
		}
	};

	useEffect( () =>
	{
		if ( isEmpty( initialProps.coffeeStore || initialProps ) )
		{
			if ( coffeeStores.length > 0 )
			{
				const coffeeStoreFromContext = coffeeStores.find( ( coffeeStore ) =>
				{
					return coffeeStore.id.toString() === id; // dynamic id;
				} );

				if ( coffeeStoreFromContext )
				{
					setCoffeeStore( coffeeStoreFromContext );

					handleCreateCoffeeStore( coffeeStoreFromContext );
				}
			}
		} else
		{
			handleCreateCoffeeStore( initialProps.coffeeStore );
		}
	}, [ id, initialProps.coffeeStore, coffeeStores, initialProps ] );

	if ( router.isFallback )
	{
		return <div>Loading... </div>;
	}

	if ( !coffeeStore ) return;
	const { name, address, neighbourhood, imgUrl } = coffeeStore;

	const handleUpvoteButton = async () =>
	{
		try
		{
			const response = await fetch( '/api/favouriteCoffeeStoreById', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					id,
				} ),
			} );

			const dbCoffeeStore = await response.json();

			if ( dbCoffeeStore && dbCoffeeStore.length > 0 )
			{
				let count = votingCount + 1;
				setVotingCount( count );
			}
		} catch ( error )
		{
			console.error( 'Error upvoting the coffee store', error );
		}
	};

	if ( error )
	{
		return <div>Something went wrong retrieving coffee store page</div>;
	}

	return (
		<div className={ styles.layout }>
			<Head>
				<title>{ name }</title>
				<meta name='description' content={ `${ name } coffee store` } />
			</Head>
			<div className={ styles.container }>
				<div className={ styles.col1 }>
					<div className={ styles.backToHomeLink }>
						<Link href='/'>
							<a>&#129060; Back to home</a>
						</Link>
					</div>
					<div className={ styles.nameWrapper }>
						<h1 className={ styles.name }>{ name }</h1>
					</div>
					<Image
						src={
							imgUrl ||
							'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
						}
						width={ 588 }
						height={ 330 }
						alt={ name }
						className={ styles.storeImg }
					/>
				</div>

				<div className={ cls( 'glass', styles.col2 ) }>
					<div className={ styles.iconWrapper }>
						<Image
							alt='places icon'
							src='/static/icons/places.svg'
							width='24'
							height='24'
						/>
						<p className={ styles.text }>{ address }</p>
					</div>

					{ neighbourhood && (
						<div className={ styles.iconWrapper }>
							<Image
								alt='near me icon'
								src='/static/icons/nearMe.svg'
								width='24'
								height='24'
							/>
							<p className={ styles.text }>{ neighbourhood }</p>
						</div>
					) }

					<div className={ styles.iconWrapper }>
						<Image
							alt='star icon'
							src='/static/icons/star.svg'
							width='24'
							height='24'
						/>
						<p className={ styles.text }>{ votingCount }</p>
					</div>

					<button className={ styles.upvoteButton } onClick={ handleUpvoteButton }>
						Up vote!
					</button>
				</div>
			</div>
		</div>
	);
};

export default CoffeeStore;
