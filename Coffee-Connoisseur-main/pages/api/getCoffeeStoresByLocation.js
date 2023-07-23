import { fetchCoffeeStores } from '../../lib/coffee-stores';

const getCoffeeStoresByLocation = async (req, res) => {
	try {
		const { latLong, limit } = req.query;
		const response = await fetchCoffeeStores(latLong, limit);
		res.status(200);
		res.json(response);
	} catch (error) {
		res.status(500);
		res.json({ message: 'Oh no! Something went wrong', error });
	}
};

export default getCoffeeStoresByLocation;
