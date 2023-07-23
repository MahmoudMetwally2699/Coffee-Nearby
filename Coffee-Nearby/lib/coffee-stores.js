import { createApi } from 'unsplash-js';

const unsplashApi = createApi({
	accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

const getUrlForCoffeeStores = (latLong, query, limit) => {
	return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latLong}&${limit}`
	;
};

const getListOfCoffeeStorePhotos = async () => {
	const photos = await unsplashApi.search.getPhotos({
		query: 'coffee shop',
		perPage: 40,
	});

	//const unsplashResults = photos.response.results;
//	return unsplashResults.map((result) => result.urls['small']);
};

export const fetchCoffeeStores = async (
	latLong = '43.65267326999575,-79.39545615725015',
	limit = 6
) => {
	const options = {
		method: 'GET',
		headers: {
		  accept: 'application/json',
		  Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
		}
	  };
	  
	  const response= await fetch(
		getUrlForCoffeeStores(latLong, 'coffee stores', limit), 
		options)
		const data= await response.json();
		console.log("results"+data.results);
	
	return data.results.map((results, idx) => {
			// <------
			const neighbourhood = results.location.neighborhood;
			return {
				 id: results.fsq_id, // <------
				 address: results.location.address || '',
				name: results.name,
				 neighbourhood:
					(neighbourhood && neighbourhood.length > 0 && neighbourhood[0]) ||
				 	results.location.cross_street ||
				 	'',
				//imgUrl: photos[idx],
			};
		}) || []


};
