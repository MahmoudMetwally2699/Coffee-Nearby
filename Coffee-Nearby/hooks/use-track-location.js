import { useContext, useState } from 'react';

import { ACTION_TYPES, StoreContext } from '../store/store-context';

const useTrackLocation = () => {
	const [locationErrorMsg, setLocationErrorMsg] = useState('');
	const [isFindingLocation, setIsFindingLocation] = useState(false);

	const { dispatch } = useContext(StoreContext);

	const success = (position) => {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		dispatch({
			type: ACTION_TYPES.SET_LAT_LONG,
			payload: { latLong: `${latitude},${longitude}` },
		});
		setLocationErrorMsg('');
		setIsFindingLocation(false);
	};

	const error = () => {
		setLocationErrorMsg('Unable to retrieve your location');
		setIsFindingLocation(false);
	};

	const handleTrackLocation = () => {
		setIsFindingLocation(true);

		if (!navigator.geolocation) {
			setLocationErrorMsg('Geolocation is not supported by your browser');
			setIsFindingLocation(false);
		} else {
			navigator.geolocation.getCurrentPosition(success, error);
		}
	};

	return {
		locationErrorMsg,
		handleTrackLocation,
		isFindingLocation,
	};
};

export default useTrackLocation;
