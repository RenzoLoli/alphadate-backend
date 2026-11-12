export const logStartLambda = (event: any) => {
	console.log("============ START LAMBDA ============");
	console.log("EVENT: ", event);
};

export const logEndLambda = () => {
	console.log("============ END LAMBDA ============");
};
