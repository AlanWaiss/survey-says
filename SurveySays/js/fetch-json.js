function fetchJson(url, options) {
	return fetch(url, options)
		.then(response => {
			if(!response.ok) {
				console.error("Invalid response", response);
				throw new Error(404 == response.status ? "Not found" : "Invalid response");
			}
			return response.json();
		});
}