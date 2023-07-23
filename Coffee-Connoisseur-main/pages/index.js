import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState, useContext } from 'react';

import Banner from '../components/banner';
import Card from '../components/card';
import useTrackLocation from '../hooks/use-track-location';
import { fetchCoffeeStores } from '../lib/coffee-stores';

import { ACTION_TYPES, StoreContext } from '../store/store-context';

import styles from '../styles/Home.module.css';

export async function getStaticProps(context) {
	
	const coffeeStores = await fetchCoffeeStores();
	console.log(coffeeStores);

	return {
		props: { coffeeStores },
	};
}

export default function Home(props) {
	const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
		useTrackLocation();

	const [coffeeStoresError, setCoffeeStoresError] = useState(null);

	const { dispatch, state } = useContext(StoreContext);
	const { coffeeStores, latLong } = state;

	useEffect(() => {
		async function f() {
			if (latLong) {
				try {
					const fetchedCoffeeStores = await fetch(
						`/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=30`
					);

					const coffeeStores = await fetchedCoffeeStores.json();

					dispatch({
						type: ACTION_TYPES.SET_COFFEE_STORES,
						payload: {
							coffeeStores,
						},
					});

					setCoffeeStoresError('');
				} catch (error) {
					setCoffeeStoresError(error.message);
				}
			}
		}

		f();
	}, [latLong, dispatch]);

	const handleOnBannerBtnCLick = () => {
		handleTrackLocation();
	};

	return (
		<div className={styles.container}>
			<Head>
				<title>Coffee Connoisseur</title>
				<meta name='description' content='Allows you to discover coffee stores' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className={styles.main}>
				<Banner
					buttonText={isFindingLocation ? 'Locating...' : 'View stores nearby'}
					handleOnClick={handleOnBannerBtnCLick}
				/>
				{locationErrorMsg && <p> Something went wrong: {locationErrorMsg}</p>}
				{coffeeStoresError && <p> Something went wrong: {coffeeStoresError}</p>}
				<div className={styles.heroImage}>
					<Image
						src='/static/hero-image.png'
						alt='Hero Image'
						width={800}
						height={343}
					/>
				</div>

				{coffeeStores.length > 0 && (
					<div className={styles.sectionWrapper}>
						<h2 className={styles.heading2}>Stores near me</h2>

						<div className={styles.cardLayout}>
							{coffeeStores.map((coffeeStore) => {
								console.log("lol"+coffeeStore.name);
								return (
									<Card
										name={coffeeStore.name}
										imgUrl={
											coffeeStore.imgUrl ||
											'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
										}
										href={`/coffee-store/${coffeeStore.id}`}
										className={styles.card}
										key={coffeeStore.id}
									/>
								);
							})}
						</div>
					</div>
				)}

				{props.coffeeStores.length > 0 && (
					<div className={styles.sectionWrapper}>
						<h2 className={styles.heading2}>Toronto stores</h2>

						<div className={styles.cardLayout}>
							{props.coffeeStores.map((coffeeStore) => {
								return (
									<Card
										name={coffeeStore.name}
										imgUrl={
											coffeeStore.imgUrl ||
											'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
										}
										href={`/coffee-store/${coffeeStore.id}`}
										className={styles.card}
										key={coffeeStore.id}
									/>
								);
							})}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
